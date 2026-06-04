import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const eventsPath = path.join(root, 'public/data/events.json')
const communitiesPath = path.join(root, 'public/data/communities.json')
const regions = new Set(['mainland', 'hmt', 'overseas'])
const eventStatuses = new Set(['upcoming', 'ongoing', 'ended', 'draft'])
const communityStatuses = new Set(['verified', 'pending', 'expired'])

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message)
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function validateUniqueIds(items, label, errors) {
  const seen = new Set()
  for (const item of items) {
    assert(item.id, `${label} 缺少 id`, errors)
    assert(!seen.has(item.id), `${label} id 重复：${item.id}`, errors)
    seen.add(item.id)
  }
}

async function main() {
  const events = await readJson(eventsPath)
  const communities = await readJson(communitiesPath)
  const communityIds = new Set(communities.map((item) => item.id))
  const errors = []

  assert(Array.isArray(events), 'events.json 必须是数组', errors)
  assert(Array.isArray(communities), 'communities.json 必须是数组', errors)

  validateUniqueIds(events, '活动', errors)
  validateUniqueIds(communities, '同好会', errors)

  for (const event of events) {
    assert(event.title, `活动 ${event.id} 缺少 title`, errors)
    assert(regions.has(event.region), `活动 ${event.id} region 不合法`, errors)
    assert(event.city, `活动 ${event.id} 缺少 city`, errors)
    assert(event.venue, `活动 ${event.id} 缺少 venue`, errors)
    assert(Number.isFinite(event.lat) && Number.isFinite(event.lng), `活动 ${event.id} 经纬度不合法`, errors)
    assert(isDate(event.startDate) && isDate(event.endDate), `活动 ${event.id} 日期格式必须是 YYYY-MM-DD`, errors)
    assert(eventStatuses.has(event.status), `活动 ${event.id} status 不合法`, errors)
    assert(Array.isArray(event.relatedCommunityIds), `活动 ${event.id} relatedCommunityIds 必须是数组`, errors)

    for (const id of event.relatedCommunityIds ?? []) {
      assert(communityIds.has(id), `活动 ${event.id} 引用了不存在的同好会：${id}`, errors)
    }
  }

  for (const community of communities) {
    assert(community.name, `同好会 ${community.id} 缺少 name`, errors)
    assert(regions.has(community.region), `同好会 ${community.id} region 不合法`, errors)
    assert(community.city, `同好会 ${community.id} 缺少 city`, errors)
    assert(community.contactType === 'QQ群', `同好会 ${community.id} contactType 目前应为 QQ群`, errors)
    assert(/^\d{5,12}$/.test(String(community.contactValue)), `同好会 ${community.id} QQ 群号格式不合法`, errors)
    assert(communityStatuses.has(community.status), `同好会 ${community.id} status 不合法`, errors)
    assert(isDate(community.lastVerifiedAt), `同好会 ${community.id} lastVerifiedAt 必须是 YYYY-MM-DD`, errors)
  }

  if (errors.length) {
    console.error(errors.map((item) => `- ${item}`).join('\n'))
    process.exitCode = 1
    return
  }

  console.log(`Data valid: ${events.length} event(s), ${communities.length} community item(s)`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
