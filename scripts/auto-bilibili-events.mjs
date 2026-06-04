import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const urlsPath = path.join(root, 'data/sources/bilibili-event-urls.json')
const citiesPath = path.join(root, 'data/cities.cn.json')
const outputPath = path.join(root, 'data/review/events.auto.json')
const baiduAk = process.env.BAIDU_MAP_AK || 'AT2zbiPhYUfipYvjYMZH7AOAHFaiNpjc'
const sourceName = 'B站会员购'
const keywords = ['赛马娘', '马娘', '优俊少女', 'Uma Musume', 'umamusume', 'ウマ娘']

function normalize(value = '') {
  return String(value)
    .replace(/\u002F/g, '/')
    .replace(/\u0026/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function withHttps(url = '') {
  const value = normalize(url)
  if (!value) return ''
  if (value.startsWith('//')) return `https:${value}`
  return value
}

function parseDate(value) {
  if (!value) return ''
  const text = String(value)
  if (/^\d{10}$/.test(text)) return new Date(Number(text) * 1000).toISOString().slice(0, 10)
  if (/^\d{13}$/.test(text)) return new Date(Number(text)).toISOString().slice(0, 10)
  const match = text.replace(/[年月]/g, '-').replace(/[日号]/g, '').match(/(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (!match) return ''
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
}

function parseCount(value = '') {
  const text = String(value)
  const match = text.match(/[\d,.]+/)
  if (!match) return 0
  const number = Number(match[0].replace(/,/g, ''))
  if (!Number.isFinite(number)) return 0
  return text.includes('万') ? Math.round(number * 10000) : Math.round(number)
}

function gcj02ToBd09(lng, lat) {
  const xPi = (Math.PI * 3000.0) / 180.0
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * xPi)
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * xPi)
  return {
    lng: z * Math.cos(theta) + 0.0065,
    lat: z * Math.sin(theta) + 0.006
  }
}

function parseVenueCoordinate(venueInfo = {}) {
  const coor = venueInfo.coordinate?.coor
  if (!coor) return null
  const [lng, lat] = String(coor).split(',').map(Number)
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null

  if (venueInfo.coordinate?.type === 'GD') {
    return gcj02ToBd09(lng, lat)
  }

  return { lng, lat }
}

function detectCity(text, cities) {
  return cities.find((item) => text.includes(item.city) || text.includes(item.province)) ?? null
}

function hasKeyword(event) {
  const text = `${event.title} ${event.province} ${event.city} ${event.venue}`.toLowerCase()
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()))
}

function normalizeUrlItem(item) {
  if (typeof item === 'string') return { url: item, overrides: {} }
  return { url: item.url, overrides: item.overrides ?? {} }
}

function getSourceId(url) {
  return new URL(url).searchParams.get('id') || ''
}

async function fetchBilibiliProject(sourceId) {
  if (!sourceId) return null
  const apiUrl = `https://show.bilibili.com/api/ticket/project/getV2?id=${encodeURIComponent(sourceId)}`
  const response = await fetch(apiUrl)
  if (!response.ok) return null
  const json = await response.json()
  if (!json?.success || !json?.data) return null
  return json.data
}

function parseProjectData(data, url, overrides, cities) {
  const venueInfo = data.venue_info ?? {}
  const venueCoordinate = parseVenueCoordinate(venueInfo)
  const title = normalize(overrides.title || data.name || data.project_name || '')
  const province = normalize(overrides.province || venueInfo.province_name || data.province_name || '')
  const city = normalize(overrides.city || venueInfo.city_name || data.city_name || '')
  const detectedCity = detectCity(`${province} ${city} ${title}`, cities)
  const venue = normalize(overrides.venue || venueInfo.name || data.venue_name || '')
  const address = normalize(overrides.address || venueInfo.address_detail || data.address || '')
  const startDate = overrides.startDate || parseDate(data.start_time || data.screen_list?.[0]?.start_time || data.screen_list?.[0]?.start_time_str || data.project_label)
  const endDate = overrides.endDate || parseDate(data.end_time || data.screen_list?.at?.(-1)?.start_time || data.screen_list?.at?.(-1)?.start_time_str || data.project_label) || startDate

  return {
    _action: 'upsert',
    _reviewStatus: 'pending',
    _reviewNotes: [],
    id: overrides.id || `event-bilibili-${data.id || getSourceId(url)}`,
    title,
    region: overrides.region || detectedCity?.region || 'mainland',
    province: province || detectedCity?.province || '',
    city: city || detectedCity?.city || '',
    venue,
    lat: Number(overrides.lat ?? venueCoordinate?.lat ?? 0),
    lng: Number(overrides.lng ?? venueCoordinate?.lng ?? 0),
    startDate,
    endDate,
    edition: Number(overrides.edition ?? 1),
    wantToGoCount: Number(overrides.wantToGoCount ?? 0) || parseCount(data.wish_info?.count ?? data.want_count ?? data.wish_count ?? 0),
    coverUrl: withHttps(overrides.coverUrl || data.cover || data.banner || ''),
    description: '',
    source: sourceName,
    sourceUrl: url,
    status: overrides.status || 'draft',
    relatedCommunityIds: overrides.relatedCommunityIds ?? [],
    _address: address,
    _usedVenueCoordinate: Boolean(venueCoordinate && !overrides.lat && !overrides.lng)
  }
}

async function geocode(address, city) {
  if (!address || !baiduAk) return null
  const params = new URLSearchParams({ address, output: 'json', ak: baiduAk })
  if (city) params.set('city', city)

  const response = await fetch(`https://api.map.baidu.com/geocoding/v3/?${params.toString()}`)
  if (!response.ok) return null
  const data = await response.json()
  if (data.status !== 0 || !data.result?.location) return null

  return {
    lat: Number(data.result.location.lat),
    lng: Number(data.result.location.lng),
    confidence: Number(data.result.confidence ?? 0),
    level: data.result.level ?? ''
  }
}

async function completeLocation(event, cities) {
  const cityMatch = detectCity(`${event.province} ${event.city} ${event.title}`, cities)
  const address = normalize(`${event.province}${event.city}${event._address || event.venue}`)

  if (event._usedVenueCoordinate) {
    event._reviewNotes.push('已使用会员购场馆坐标并转换为百度坐标')
  }

  if (!event.lat || !event.lng) {
    const geocodeResult = await geocode(address, event.city)
    if (geocodeResult?.lat && geocodeResult?.lng) {
      event.lat = geocodeResult.lat
      event.lng = geocodeResult.lng
      event._reviewNotes.push(`百度地理编码成功：${geocodeResult.level || '未知级别'}，confidence=${geocodeResult.confidence}`)
    } else if (cityMatch) {
      event.lat = cityMatch.lat
      event.lng = cityMatch.lng
      event._reviewNotes.push('场馆地理编码失败，已回退到城市中心坐标')
    }
  }

  if (!event.province && cityMatch) event.province = cityMatch.province
  if (!event.city && cityMatch) event.city = cityMatch.city
}

function finalizeEvent(event, { keepWithoutKeyword }) {
  if (!keepWithoutKeyword && !hasKeyword(event)) {
    return { event: null, reason: '未命中赛马娘关键词' }
  }

  if (!hasKeyword(event)) event._reviewNotes.push('未命中赛马娘关键词；因 overrides.keep=true，已保留待审')
  if (!event.title) event._reviewNotes.push('缺少标题，需要人工填写 title')
  if (!event.city) event._reviewNotes.push('缺少城市，需要人工填写 city/province')
  if (!event.venue) event._reviewNotes.push('缺少场馆，需要人工填写 venue')
  if (!event.startDate) event._reviewNotes.push('缺少开始日期，需要人工填写 startDate')
  if (!event.endDate) event._reviewNotes.push('缺少结束日期，需要人工填写 endDate')
  if (!event.coverUrl) event._reviewNotes.push('缺少封面图 URL，需要人工填写 coverUrl')
  if (!event.wantToGoCount) event._reviewNotes.push('未识别想去人数，已置为 0')

  const ready = event.title && event.city && event.venue && event.lat && event.lng && event.startDate
  event.status = event.status !== 'draft' ? event.status : ready ? 'upcoming' : 'draft'
  delete event._address
  delete event._usedVenueCoordinate
  return { event, reason: '' }
}

async function parseEventFromUrl(url, overrides, cities) {
  const sourceId = getSourceId(url)
  const project = await fetchBilibiliProject(sourceId)
  if (!project) return { event: null, reason: '公开详情接口无数据' }

  const event = parseProjectData(project, url, overrides, cities)
  await completeLocation(event, cities)
  return finalizeEvent(event, { keepWithoutKeyword: Boolean(overrides.keep) })
}

async function main() {
  const urlItems = JSON.parse(await readFile(urlsPath, 'utf8')).map(normalizeUrlItem).filter((item) => item.url)
  const cities = JSON.parse(await readFile(citiesPath, 'utf8'))
  const events = []
  const skipped = []

  for (const item of urlItems) {
    const sourceId = getSourceId(item.url) || item.url
    process.stdout.write(`[${sourceId}] parsing... `)
    const result = await parseEventFromUrl(item.url, item.overrides, cities)
    if (result.event) {
      events.push(result.event)
      console.log(`${result.event.title || '(no title)'}`)
    } else {
      skipped.push({ sourceUrl: item.url, reason: result.reason })
      console.log(`skipped: ${result.reason}`)
    }
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), events, skipped }, null, 2)}\n`, 'utf8')
  console.log(`\nWrote ${events.length} candidate(s), skipped ${skipped.length} item(s) to ${path.relative(root, outputPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
