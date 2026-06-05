import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const communitiesPath = path.join(root, 'public/data/communities.json')
const reviewDir = path.join(root, 'data/review')
const outputPath = path.join(reviewDir, 'community-enrich-candidates.pending.json')
const defaultApi = 'https://oiapi.net/api/QQGroupInfoV2'

async function loadEnvFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8')
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue
      const index = line.indexOf('=')
      if (index === -1) continue
      const key = line.slice(0, index).trim()
      const value = line.slice(index + 1).trim()
      if (key && process.env[key] === undefined) process.env[key] = value
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ''),
  )
}

function getDeepValue(source, keys) {
  const queue = [source]
  const seen = new Set()

  while (queue.length) {
    const item = queue.shift()
    if (!item || typeof item !== 'object' || seen.has(item)) continue
    seen.add(item)

    for (const key of keys) {
      if (item[key] !== undefined && item[key] !== null && item[key] !== '') return item[key]
    }

    for (const value of Object.values(item)) {
      if (value && typeof value === 'object') queue.push(value)
    }
  }

  return undefined
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') return undefined
  const number = Number(String(value).replace(/[^\d]/g, ''))
  return Number.isFinite(number) ? number : undefined
}

function groupAvatarUrl(groupNumber) {
  return `https://p.qlogo.cn/gh/${groupNumber}/${groupNumber}/100`
}

function normalizeApiPayload(payload, groupNumber) {
  const name = getDeepValue(payload, [
    'group_name',
    'groupName',
    'gName',
    'name',
    'title',
    '群名',
  ])
  const memberCount = toNumber(getDeepValue(payload, [
    'member_count',
    'memberCount',
    'current_member_count',
    'currentMemberCount',
    'members',
    'count',
    '人数',
    '当前人数',
  ]))
  const maxMemberCount = toNumber(getDeepValue(payload, [
    'max_member_count',
    'maxMemberCount',
    'max_members',
    'maxMembers',
    '最大人数',
  ]))
  const description = getDeepValue(payload, [
    'description',
    'group_memo',
    'memo',
    'intro',
    '介绍',
    '简介',
  ])
  const avatarUrl = getDeepValue(payload, [
    'avatar',
    'avatarUrl',
    'group_avatar',
    'groupAvatar',
    'logo',
    'icon',
  ]) || groupAvatarUrl(groupNumber)

  return compactObject({
    name: typeof name === 'string' ? name.trim() : undefined,
    memberCount,
    maxMemberCount,
    description: typeof description === 'string' ? description.trim() : undefined,
    avatarUrl: typeof avatarUrl === 'string' ? avatarUrl.trim() : undefined,
  })
}

async function queryGroupInfo(apiUrl, cookie, groupNumber) {
  const url = new URL(apiUrl)
  url.searchParams.set('group', groupNumber)

  if (cookie) {
    url.searchParams.set('Cookie', cookie)
  }

  const response = await fetch(url, {
    headers: compactObject({
      Cookie: cookie,
      Referer: 'https://clt.qq.com/',
      'User-Agent': 'Mozilla/5.0 community-data-enricher',
    }),
  })

  const text = await response.text()
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 160)}`)
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Invalid JSON: ${text.slice(0, 160)}`)
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  await loadEnvFile(path.join(root, '.env.local'))
  await loadEnvFile(path.join(root, '.env'))

  const apiUrl = process.env.QQ_GROUP_QUERY_API || defaultApi
  const cookie = process.env.QQ_GROUP_QUERY_COOKIE || ''
  const delayMs = Number(process.env.QQ_GROUP_QUERY_DELAY_MS || 800)
  const communities = JSON.parse(await readFile(communitiesPath, 'utf8'))
  const candidates = []

  if (!cookie) {
    console.warn('QQ_GROUP_QUERY_COOKIE is empty. OIAPI may fail or return limited data.')
  }

  for (const community of communities) {
    const groupNumber = String(community.contactValue || '').trim()
    if (!/^\d{5,12}$/.test(groupNumber)) continue

    process.stdout.write(`[${groupNumber}] querying... `)

    try {
      const payload = await queryGroupInfo(apiUrl, cookie, groupNumber)
      const enriched = normalizeApiPayload(payload, groupNumber)
      const candidate = compactObject({
        id: community.id,
        contactValue: groupNumber,
        current: {
          name: community.name,
          memberCount: community.memberCount,
          description: community.description,
          avatarUrl: community.avatarUrl,
        },
        suggested: enriched,
        raw: payload,
      })

      candidates.push(candidate)
      console.log(Object.keys(enriched).length ? 'ok' : 'no usable fields')
    } catch (error) {
      candidates.push({
        id: community.id,
        contactValue: groupNumber,
        error: error.message,
        suggested: {
          avatarUrl: groupAvatarUrl(groupNumber),
        },
      })
      console.log(`failed: ${error.message}`)
    }

    if (delayMs > 0) await sleep(delayMs)
  }

  await mkdir(reviewDir, { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(candidates, null, 2)}\n`)
  console.log(`Wrote ${candidates.length} candidate(s) to ${path.relative(root, outputPath)}.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

