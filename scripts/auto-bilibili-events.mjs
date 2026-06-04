import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const urlsPath = path.join(root, 'data/sources/bilibili-event-urls.json')
const citiesPath = path.join(root, 'data/cities.cn.json')
const outputPath = path.join(root, 'data/review/events.auto.json')
const baiduAk = process.env.BAIDU_MAP_AK || 'AT2zbiPhYUfipYvjYMZH7AOAHFaiNpjc'
const sourceName = 'B站会员购'
const keywords = ['赛马娘', '马娘', 'Uma Musume', 'umamusume', 'ウマ娘']

function normalize(value = '') {
  return String(value).replace(/\s+/g, ' ').trim()
}

function decodeHtml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function stripTags(value = '') {
  return decodeHtml(value.replace(/<[^>]*>/g, ''))
}

function readMeta(html, names) {
  for (const name of names) {
    const tag = html.match(new RegExp(`<meta\\s+[^>]*(?:property|name)=["']${escapeRegExp(name)}["'][^>]*>`, 'i'))?.[0]
    const content = tag?.match(/\scontent=["']([^"']*)["']/i)?.[1]
    if (content) return normalize(decodeHtml(content))
  }
  return ''
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseJsonLoose(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function walk(value, visitor, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)
  visitor(value)
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visitor, seen)
    return
  }
  for (const item of Object.values(value)) walk(item, visitor, seen)
}

function findValue(jsonRoots, keys) {
  let result = ''
  for (const rootValue of jsonRoots) {
    walk(rootValue, (node) => {
      if (result || Array.isArray(node)) return
      for (const key of keys) {
        const value = node[key]
        if (typeof value === 'string' || typeof value === 'number') {
          result = String(value)
          return
        }
      }
    })
    if (result) break
  }
  return normalize(result)
}

function extractJsonRoots(html) {
  const roots = []
  const scripts = html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)

  for (const match of scripts) {
    const body = match[1]?.trim()
    if (!body) continue

    const direct = parseJsonLoose(body)
    if (direct) roots.push(direct)

    for (const assignment of body.matchAll(/(?:window\.)?__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/g)) {
      const parsed = parseJsonLoose(assignment[1])
      if (parsed) roots.push(parsed)
    }

    for (const push of body.matchAll(/self\.__next_f\.push\(\s*(\[.*\])\s*\)/gs)) {
      const parsed = parseJsonLoose(push[1])
      if (parsed) roots.push(parsed)
    }
  }

  return roots
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

function makeId(url) {
  const id = new URL(url).searchParams.get('id')
  return id ? `event-bilibili-${id}` : `event-bilibili-${Date.now()}`
}

function detectCity(text, cities) {
  return cities.find((item) => text.includes(item.city)) ?? null
}

async function geocode(address, city) {
  if (!address || !baiduAk) return null
  const params = new URLSearchParams({
    address,
    output: 'json',
    ak: baiduAk
  })
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

function titleFromHtml(html) {
  return normalize(readMeta(html, ['og:title', 'twitter:title']) || stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''))
}

function descriptionFromHtml(html) {
  return normalize(readMeta(html, ['og:description', 'description', 'twitter:description']))
}

function imageFromHtml(html) {
  return normalize(readMeta(html, ['og:image', 'twitter:image']))
}

async function parseUrl(url, cities) {
  const notes = []
  const response = await fetch(url)
  if (!response.ok) {
    return {
      _action: 'upsert',
      _reviewStatus: 'pending',
      _reviewNotes: [`抓取失败：HTTP ${response.status}`],
      id: makeId(url),
      source: sourceName,
      sourceUrl: url,
      status: 'draft'
    }
  }

  const html = await response.text()
  const roots = extractJsonRoots(html)
  const title = findValue(roots, ['name', 'title', 'project_name', 'item_name']) || titleFromHtml(html)
  const description = descriptionFromHtml(html)
  const fullText = `${title} ${description} ${stripTags(html).slice(0, 4000)}`
  const detectedCity = detectCity(fullText, cities)
  const venue = findValue(roots, ['venue_name', 'venue', 'place_name', 'place', 'addr', 'address'])
  const startDate = parseDate(findValue(roots, ['start_time', 'begin_time', 'startTime', 'startDate']))
  const endDate = parseDate(findValue(roots, ['end_time', 'finish_time', 'endTime', 'endDate'])) || startDate
  const wantToGoCount = Number.parseInt(findValue(roots, ['want_count', 'wish_count', 'wantCount', 'wantToGoCount']) || '0', 10) || 0
  const coverUrl = findValue(roots, ['cover_url', 'cover', 'banner', 'image']) || imageFromHtml(html)

  let lat = detectedCity?.lat ?? 0
  let lng = detectedCity?.lng ?? 0
  let geocodeResult = null

  if (detectedCity && venue) {
    geocodeResult = await geocode(`${detectedCity.city}${venue}`, detectedCity.city)
    if (geocodeResult?.lat && geocodeResult?.lng) {
      lat = geocodeResult.lat
      lng = geocodeResult.lng
      notes.push(`百度地理编码成功：${geocodeResult.level || '未知级别'}，confidence=${geocodeResult.confidence}`)
    }
  }

  if (!detectedCity) notes.push('未自动识别城市，需要人工填写 province/city/region/lat/lng')
  if (detectedCity && !geocodeResult && venue) notes.push('场馆地理编码失败，已回退到城市中心坐标')
  if (!venue) notes.push('未自动识别场馆，需要人工填写 venue；有场馆后可重新运行以获得更精准坐标')
  if (!startDate) notes.push('未自动识别开始日期，需要人工填写 startDate')
  if (!endDate) notes.push('未自动识别结束日期，需要人工填写 endDate')
  if (!coverUrl) notes.push('未自动识别封面图 URL，需要人工填写 coverUrl')
  if (!keywords.some((keyword) => title.includes(keyword) || description.includes(keyword))) notes.push('未命中赛马娘关键词，请人工确认是否保留')

  const enoughForMap = Boolean(title && detectedCity && lat && lng)

  return {
    _action: 'upsert',
    _reviewStatus: 'pending',
    _reviewNotes: notes,
    id: makeId(url),
    title,
    region: detectedCity?.region ?? 'mainland',
    province: detectedCity?.province ?? '',
    city: detectedCity?.city ?? '',
    venue,
    lat,
    lng,
    startDate,
    endDate,
    edition: 1,
    wantToGoCount,
    coverUrl,
    description: description || '待人工补充简介。',
    source: sourceName,
    sourceUrl: url,
    status: enoughForMap && startDate ? 'upcoming' : 'draft',
    relatedCommunityIds: []
  }
}

async function main() {
  const urls = JSON.parse(await readFile(urlsPath, 'utf8'))
  const cities = JSON.parse(await readFile(citiesPath, 'utf8'))
  const events = []

  for (const item of urls) {
    const url = typeof item === 'string' ? item : item.url
    if (!url) continue
    const event = await parseUrl(url, cities)

    if (typeof item === 'object' && item.overrides) {
      Object.assign(event, item.overrides)
      event._reviewNotes.push('已应用 URL 条目的 overrides')
    }

    events.push(event)
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), events }, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${events.length} auto candidate(s) to ${path.relative(root, outputPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
