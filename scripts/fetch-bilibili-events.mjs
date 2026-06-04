import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const sourcePath = path.join(root, 'data/sources/bilibili-events.json')
const outputPath = path.join(root, 'data/review/events.pending.json')

const sourceName = 'B站会员购'

function getArgValue(name) {
  const prefix = `${name}=`
  const arg = process.argv.find((item) => item.startsWith(prefix))
  return arg ? arg.slice(prefix.length) : ''
}

function normalizeWhitespace(value = '') {
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

function readMeta(html, candidates) {
  for (const key of candidates) {
    const pattern = new RegExp(`<meta\\s+[^>]*(?:property|name)=["']${escapeRegExp(key)}["'][^>]*>`, 'i')
    const tag = html.match(pattern)?.[0]
    if (!tag) continue
    const content = tag.match(/\scontent=["']([^"']*)["']/i)?.[1]
    if (content) return normalizeWhitespace(decodeHtml(content))
  }
  return ''
}

function readTitle(html) {
  return normalizeWhitespace(
    readMeta(html, ['og:title', 'twitter:title']) ||
      stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  )
}

function readDescription(html) {
  return normalizeWhitespace(readMeta(html, ['og:description', 'description', 'twitter:description']))
}

function readImage(html) {
  return normalizeWhitespace(readMeta(html, ['og:image', 'twitter:image']))
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function walkJson(value, visitor, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)
  visitor(value)
  if (Array.isArray(value)) {
    for (const item of value) walkJson(item, visitor, seen)
    return
  }
  for (const item of Object.values(value)) walkJson(item, visitor, seen)
}

function findFirstJsonValue(rootValue, keys) {
  let result = ''
  walkJson(rootValue, (node) => {
    if (result || Array.isArray(node)) return
    for (const key of keys) {
      const value = node[key]
      if (typeof value === 'string' || typeof value === 'number') {
        result = String(value)
        return
      }
    }
  })
  return normalizeWhitespace(result)
}

function extractJsonBlocks(html) {
  const blocks = []
  const scriptPattern = /<script[^>]*>([\s\S]*?)<\/script>/gi
  let match

  while ((match = scriptPattern.exec(html))) {
    const body = match[1]?.trim()
    if (!body) continue

    const direct = safeJsonParse(body)
    if (direct) {
      blocks.push(direct)
      continue
    }

    const nextData = body.match(/self\.__next_f\.push\(\s*(\[.*\])\s*\)/s)?.[1]
    if (nextData) {
      const parsed = safeJsonParse(nextData)
      if (parsed) blocks.push(parsed)
    }
  }

  return blocks
}

function parseDate(value) {
  if (!value) return ''

  if (/^\d{10}$/.test(value)) {
    return new Date(Number(value) * 1000).toISOString().slice(0, 10)
  }

  if (/^\d{13}$/.test(value)) {
    return new Date(Number(value)).toISOString().slice(0, 10)
  }

  const normalized = value.replace(/[年月]/g, '-').replace(/[日号]/g, '')
  const match = normalized.match(/(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (!match) return ''
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
}

function makeId(url, title) {
  const sourceId = new URL(url).searchParams.get('id')
  if (sourceId) return `event-bilibili-${sourceId}`

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)

  return `event-${slug || Date.now()}`
}

function parseCandidate(source, html) {
  const jsonBlocks = extractJsonBlocks(html)
  const jsonValues = jsonBlocks.length ? jsonBlocks : [{}]

  const jsonTitle = jsonValues.map((item) => findFirstJsonValue(item, ['name', 'title', 'project_name', 'item_name'])).find(Boolean)
  const jsonVenue = jsonValues.map((item) => findFirstJsonValue(item, ['venue', 'venue_name', 'place', 'place_name', 'addr', 'address'])).find(Boolean)
  const jsonStart = jsonValues.map((item) => findFirstJsonValue(item, ['startDate', 'start_time', 'begin_time', 'startTime'])).find(Boolean)
  const jsonEnd = jsonValues.map((item) => findFirstJsonValue(item, ['endDate', 'end_time', 'finish_time', 'endTime'])).find(Boolean)
  const jsonWant = jsonValues.map((item) => findFirstJsonValue(item, ['wantToGoCount', 'want_count', 'wantCount', 'wish_count'])).find(Boolean)
  const jsonImage = jsonValues.map((item) => findFirstJsonValue(item, ['image', 'cover', 'cover_url', 'banner'])).find(Boolean)

  const title = normalizeWhitespace(jsonTitle || readTitle(html))
  const description = readDescription(html)
  const overrides = source.overrides ?? {}
  const startDate = parseDate(jsonStart) || overrides.startDate || ''
  const endDate = parseDate(jsonEnd) || overrides.endDate || startDate
  const wantToGoCount = Number.parseInt(jsonWant || overrides.wantToGoCount || '0', 10) || 0

  const candidate = {
    _action: 'upsert',
    _reviewStatus: 'pending',
    _reviewNotes: [],
    id: overrides.id || makeId(source.url, title),
    title: overrides.title || title,
    region: overrides.region || 'mainland',
    province: overrides.province || '',
    city: overrides.city || '',
    venue: overrides.venue || jsonVenue || '',
    lat: Number(overrides.lat ?? 0),
    lng: Number(overrides.lng ?? 0),
    startDate,
    endDate,
    edition: Number(overrides.edition ?? 1),
    wantToGoCount,
    coverUrl: overrides.coverUrl || jsonImage || readImage(html),
    description: overrides.description || description || '待人工补充简介。',
    source: sourceName,
    sourceUrl: source.url,
    status: overrides.status || 'draft',
    relatedCommunityIds: overrides.relatedCommunityIds ?? []
  }

  for (const field of ['title', 'city', 'venue', 'startDate', 'endDate', 'coverUrl']) {
    if (!candidate[field]) candidate._reviewNotes.push(`缺少 ${field}，需要人工补齐`)
  }

  if (!candidate.lat || !candidate.lng) candidate._reviewNotes.push('缺少经纬度，需要人工用百度地图或其他合规来源补齐')
  if (!source.keywords?.some((keyword) => candidate.title.includes(keyword) || candidate.description.includes(keyword))) {
    candidate._reviewNotes.push('标题或简介未命中关键词，请确认是否为赛马娘相关活动')
  }

  return candidate
}

async function main() {
  const sourceOverride = getArgValue('--source')
  const sources = sourceOverride
    ? [{ url: sourceOverride, keywords: ['赛马娘', '马娘', 'Uma Musume', 'umamusume'], overrides: {} }]
    : JSON.parse(await readFile(sourcePath, 'utf8'))

  const candidates = []

  for (const source of sources) {
    if (!source.url) continue
    const response = await fetch(source.url)
    if (!response.ok) {
      candidates.push({
        _action: 'upsert',
        _reviewStatus: 'error',
        sourceUrl: source.url,
        _reviewNotes: [`抓取失败：HTTP ${response.status}`]
      })
      continue
    }

    const html = await response.text()
    candidates.push(parseCandidate(source, html))
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), events: candidates }, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${candidates.length} candidate(s) to ${path.relative(root, outputPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
