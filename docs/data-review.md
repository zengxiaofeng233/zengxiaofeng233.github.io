# 数据抓取与人工审核教程

这个项目仍然是 GitHub Pages 静态站。自动化脚本只负责从公开页面生成“候选数据”，不会直接改线上正式数据。

## 数据流

1. `data/sources/bilibili-events.json` 维护公开来源页面。
2. `npm run data:fetch` 抓取公开页面，生成 `data/review/events.pending.json`。
3. 人工检查候选数据，补齐城市、场馆、经纬度、简介、QQ群关联等字段。
4. 把确认过的条目复制到 `data/review/events.approved.json` 或 `data/review/communities.approved.json`。
5. `npm run data:approve` 合并审核结果到 `public/data/events.json` 和 `public/data/communities.json`。
6. `npm run data:validate` 校验正式数据。
7. `npm run build` 确认页面可构建，再提交推送。

## 更自动的会员购流程

优先使用这个流程。你只需要维护 URL 列表：

`data/sources/bilibili-event-urls.json`

```json
[
  "https://show.bilibili.com/platform/detail.html?id=1001421&from=pc_search&msource=pc_web"
]
```

运行：

```bash
npm run data:auto
```

脚本会输出：

`data/review/events.auto.json`

自动处理内容：

- 自动生成 `id`
- 自动保存 `sourceUrl`
- 尝试从公开 HTML/JSON 中提取标题、场馆、日期、封面、想去人数
- 自动识别常见城市
- 如果识别到城市和场馆，调用百度地理编码接口，把点位定位到场馆附近
- 百度地理编码失败时，回退到城市中心坐标
- 生成 `_reviewNotes`，告诉你哪些字段还需要人工确认

注意：百度地理编码使用的是公开 Web API 和已有地图 AK。它不使用登录态、Cookie、验证码、签名绕过或非公开接口。

审核时，把 `data/review/events.auto.json` 里确认无误的条目复制到：

`data/review/events.approved.json`

并把：

```json
"_reviewStatus": "pending"
```

改成：

```json
"_reviewStatus": "approved"
```

然后运行：

```bash
npm run data:approve
npm run data:validate
npm run build
```

## 手动增强抓取会员购公开活动

编辑 `data/sources/bilibili-events.json`：

```json
[
  {
    "url": "https://show.bilibili.com/platform/detail.html?id=1001421&from=pc_search&msource=pc_web",
    "keywords": ["赛马娘", "马娘", "Uma Musume", "umamusume"],
    "overrides": {
      "region": "mainland",
      "province": "上海",
      "city": "上海",
      "venue": "国家会展中心（上海）",
      "lat": 31.1900,
      "lng": 121.3000,
      "edition": 1,
      "relatedCommunityIds": []
    }
  }
]
```

运行：

```bash
npm run data:fetch
```

也可以临时抓一个 URL：

```bash
node scripts/fetch-bilibili-events.mjs --source=https://show.bilibili.com/platform/detail.html?id=1001421
```

注意：脚本不使用登录 Cookie，不处理验证码，不绕过签名或反爬。如果页面返回失败，就人工从公开页面录入。

## 审核活动数据

打开 `data/review/events.pending.json`。每条数据会带有审核辅助字段：

```json
{
  "_action": "upsert",
  "_reviewStatus": "pending",
  "_reviewNotes": ["缺少 city，需要人工补齐"],
  "id": "event-bilibili-1001421",
  "title": "活动标题",
  "region": "mainland",
  "province": "上海",
  "city": "上海",
  "venue": "国家会展中心（上海）",
  "lat": 31.19,
  "lng": 121.3,
  "startDate": "2026-07-12",
  "endDate": "2026-07-13",
  "edition": 1,
  "wantToGoCount": 0,
  "coverUrl": "https://...",
  "description": "公开页面简介",
  "source": "B站会员购",
  "sourceUrl": "https://show.bilibili.com/platform/detail.html?id=1001421",
  "status": "draft",
  "relatedCommunityIds": []
}
```

确认后复制到 `data/review/events.approved.json`，并把 `_reviewStatus` 改为 `approved`：

```json
{
  "events": [
    {
      "_action": "upsert",
      "_reviewStatus": "approved",
      "id": "event-bilibili-1001421",
      "title": "上海赛马娘 Only 第1届",
      "region": "mainland",
      "province": "上海",
      "city": "上海",
      "venue": "国家会展中心（上海）",
      "lat": 31.19,
      "lng": 121.3,
      "startDate": "2026-07-12",
      "endDate": "2026-07-13",
      "edition": 1,
      "wantToGoCount": 1234,
      "coverUrl": "https://example.com/cover.jpg",
      "description": "赛马娘主题同人活动。",
      "source": "B站会员购",
      "sourceUrl": "https://show.bilibili.com/platform/detail.html?id=1001421",
      "status": "upcoming",
      "relatedCommunityIds": ["community-sh-001"]
    }
  ]
}
```

合并：

```bash
npm run data:approve
npm run data:validate
```

## 新增或修改 QQ 群

创建或编辑 `data/review/communities.approved.json`：

```json
{
  "communities": [
    {
      "_action": "upsert",
      "_reviewStatus": "approved",
      "id": "community-sh-001",
      "name": "上海赛马娘同好会",
      "region": "mainland",
      "province": "上海",
      "city": "上海",
      "type": "同好会",
      "contactType": "QQ群",
      "contactValue": "123456789",
      "memberCount": 1200,
      "status": "verified",
      "lastVerifiedAt": "2026-06-05",
      "description": "上海地区赛马娘玩家、同人作者与线下活动交流。"
    }
  ]
}
```

运行：

```bash
npm run data:approve
npm run data:validate
```

## 删除活动或 QQ 群

删除活动：

```json
{
  "events": [
    {
      "_action": "delete",
      "_reviewStatus": "approved",
      "id": "event-bilibili-1001421"
    }
  ]
}
```

删除 QQ 群：

```json
{
  "communities": [
    {
      "_action": "delete",
      "_reviewStatus": "approved",
      "id": "community-sh-001"
    }
  ]
}
```

合并后运行：

```bash
npm run data:approve
npm run data:validate
```

## 审核规则

- 只保存公开信息：标题、时间、地点、封面图 URL、想去人数、来源链接、公开 QQ 群号。
- 不下载并长期搬运会员购封面图，只保存公开封面图 URL 和来源页面。
- 不保存登录态 Cookie、token、签名参数、管理员凭证。
- 不接入下单、实名、票务订单等非公开接口。
- 坐标要人工确认到城市或场馆附近，避免错误点位。
- `status` 可用值：`upcoming`、`ongoing`、`ended`、`draft`。

## GitHub Actions 自动候选

仓库包含 `.github/workflows/data-candidates.yml`，每周一会运行一次，也可以手动触发。

它只上传 `events.pending.json` 作为 artifact，不会自动提交正式数据。下载 artifact 后，按上面的审核流程处理。
