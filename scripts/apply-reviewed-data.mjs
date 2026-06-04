import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const eventsPath = path.join(root, 'public/data/events.json')
const communitiesPath = path.join(root, 'public/data/communities.json')
const reviewedEventsPath = path.join(root, 'data/review/events.approved.json')
const reviewedCommunitiesPath = path.join(root, 'data/review/communities.approved.json')

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}

function normalizeReviewedPayload(payload, key) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.[key])) return payload[key]
  return []
}

function stripReviewFields(item) {
  const clean = {}
  for (const [key, value] of Object.entries(item)) {
    if (!key.startsWith('_')) clean[key] = value
  }
  return clean
}

function mergeItems(currentItems, reviewedItems) {
  const byId = new Map(currentItems.map((item) => [item.id, item]))

  for (const item of reviewedItems) {
    if (!item.id) continue
    if (item._reviewStatus && item._reviewStatus !== 'approved') continue

    if (item._action === 'delete') {
      byId.delete(item.id)
      continue
    }

    byId.set(item.id, stripReviewFields(item))
  }

  return Array.from(byId.values())
}

async function main() {
  const currentEvents = await readJson(eventsPath, [])
  const currentCommunities = await readJson(communitiesPath, [])
  const reviewedEvents = normalizeReviewedPayload(await readJson(reviewedEventsPath, []), 'events')
  const reviewedCommunities = normalizeReviewedPayload(await readJson(reviewedCommunitiesPath, []), 'communities')

  const nextEvents = mergeItems(currentEvents, reviewedEvents).sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id))
  const nextCommunities = mergeItems(currentCommunities, reviewedCommunities).sort((a, b) => a.city.localeCompare(b.city, 'zh-Hans-CN') || a.id.localeCompare(b.id))

  await writeFile(eventsPath, `${JSON.stringify(nextEvents, null, 2)}\n`, 'utf8')
  await writeFile(communitiesPath, `${JSON.stringify(nextCommunities, null, 2)}\n`, 'utf8')

  console.log(`Applied ${reviewedEvents.length} reviewed event item(s)`)
  console.log(`Applied ${reviewedCommunities.length} reviewed community item(s)`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
