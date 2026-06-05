# QQ Group Data Enrichment

This workflow enriches `public/data/communities.json` locally. It does not put
cookies, tokens, or third-party API calls into the frontend.

## 1. Configure Local Cookie

Create `.env.local` in the project root:

```env
QQ_GROUP_QUERY_API=https://oiapi.net/api/QQGroupInfoV2
QQ_GROUP_QUERY_COOKIE=your_cookie_here
QQ_GROUP_QUERY_DELAY_MS=800
```

`.env.local` is ignored by git. Do not commit it.

## 2. Add QQ Group Avatars

This does not require any cookie:

```bash
npm run communities:avatar
```

It writes deterministic group avatar URLs:

```text
https://p.qlogo.cn/gh/{group}/{group}/100
```

## 3. Query Third-Party API

Run:

```bash
npm run communities:enrich
```

The script reads QQ group numbers from:

```text
public/data/communities.json
```

Then it writes review candidates to:

```text
data/review/community-enrich-candidates.pending.json
```

This file is ignored by git on purpose.

## 4. Manual Review

Open:

```text
data/review/community-enrich-candidates.pending.json
```

Check or edit each `suggested` object. Delete suspicious fields if needed.

Useful fields:

```json
{
  "suggested": {
    "name": "group name",
    "memberCount": 123,
    "description": "group intro",
    "avatarUrl": "https://p.qlogo.cn/gh/123/123/100"
  }
}
```

## 5. Apply Reviewed Data

After review:

```bash
npm run communities:apply
```

Or apply a specific candidate file:

```bash
node scripts/apply-community-candidates.mjs data/review/community-enrich-candidates.pending.json
```

The script updates:

```text
public/data/communities.json
```

It also updates `lastVerifiedAt` to the current date for changed entries.

## Notes

- Third-party APIs may fail or change response formats.
- API failures do not affect the website because the frontend only reads static JSON.
- If the API returns bad data, edit the pending JSON before applying.
- Do not run this in GitHub Actions with a personal cookie.

