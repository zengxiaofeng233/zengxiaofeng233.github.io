import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const communitiesPath = path.join(root, 'public/data/communities.json')
const defaultCandidatesPath = path.join(root, 'data/review/community-enrich-candidates.pending.json')

function isValidCandidate(candidate) {
  return candidate && candidate.id && candidate.suggested && typeof candidate.suggested === 'object'
}

function normalizeMemberCount(value) {
  if (value === undefined || value === null || value === '') return undefined
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : undefined
}

async function main() {
  const candidatesPath = path.resolve(process.argv[2] || defaultCandidatesPath)
  const communities = JSON.parse(await readFile(communitiesPath, 'utf8'))
  const candidates = JSON.parse(await readFile(candidatesPath, 'utf8'))
  const communitiesById = new Map(communities.map((community) => [community.id, community]))
  const today = new Date().toISOString().slice(0, 10)
  let changed = 0

  for (const candidate of candidates) {
    if (!isValidCandidate(candidate)) continue

    const community = communitiesById.get(candidate.id)
    if (!community) continue

    const suggested = candidate.suggested
    const updates = {}

    if (typeof suggested.name === 'string' && suggested.name.trim()) {
      updates.name = suggested.name.trim()
    }
    if (typeof suggested.description === 'string' && suggested.description.trim()) {
      updates.description = suggested.description.trim()
    }
    if (typeof suggested.avatarUrl === 'string' && suggested.avatarUrl.trim()) {
      updates.avatarUrl = suggested.avatarUrl.trim()
    }

    const memberCount = normalizeMemberCount(suggested.memberCount)
    if (memberCount !== undefined) updates.memberCount = memberCount

    if (Object.keys(updates).length) {
      Object.assign(community, updates, {
        status: 'verified',
        lastVerifiedAt: today,
      })
      changed += 1
    }
  }

  await writeFile(communitiesPath, `${JSON.stringify(communities, null, 2)}\n`)
  console.log(`Applied candidate updates to ${changed} community item(s).`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

