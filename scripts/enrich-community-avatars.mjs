import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const communitiesPath = path.join(root, 'public/data/communities.json')

function groupAvatarUrl(groupNumber) {
  return `https://p.qlogo.cn/gh/${groupNumber}/${groupNumber}/100`
}

async function main() {
  const communities = JSON.parse(await readFile(communitiesPath, 'utf8'))
  let changed = 0

  for (const community of communities) {
    const groupNumber = String(community.contactValue || '').trim()
    if (!/^\d{5,12}$/.test(groupNumber)) continue

    const avatarUrl = groupAvatarUrl(groupNumber)
    if (community.avatarUrl !== avatarUrl) {
      community.avatarUrl = avatarUrl
      changed += 1
    }
  }

  await writeFile(communitiesPath, `${JSON.stringify(communities, null, 2)}\n`)
  console.log(`Updated avatarUrl for ${changed} community item(s).`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

