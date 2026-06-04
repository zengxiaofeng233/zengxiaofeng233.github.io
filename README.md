# 全国赛马娘同好会地图 / Uma Musume Fan Map CN

黑色简洁风的赛马娘同好会与漫展信息地图。项目为 GitHub Pages 静态站，不使用后端、登录系统或数据库，所有信息来自本地 JSON 文件与公开投稿。

## 本地运行

```bash
npm install
npm run dev
```

构建生产版本：

```bash
npm run build
npm run preview
```

## 数据位置

活动数据：`public/data/events.json`

同好会 / QQ 群数据：`public/data/communities.json`

项目不会在前端写入 token、cookie、密钥或管理员凭证。B站会员购等信息只作为公开来源索引，保存标题、时间、地点、封面图 URL、想去人数、来源链接等字段。

## 新增活动

在 `public/data/events.json` 添加对象：

```json
{
  "id": "event-sh-uma-only-003",
  "title": "上海赛马娘 Only 第3届",
  "region": "mainland",
  "province": "上海",
  "city": "上海",
  "venue": "国家会展中心（上海）",
  "lat": 31.19,
  "lng": 121.3,
  "startDate": "2026-07-12",
  "endDate": "2026-07-13",
  "edition": 3,
  "wantToGoCount": 1234,
  "coverUrl": "https://example.com/cover.jpg",
  "description": "赛马娘主题同人展，包含同人摊位、舞台活动、痛车展示与交流内容。",
  "source": "B站会员购",
  "sourceUrl": "https://mall.bilibili.com/",
  "status": "upcoming",
  "relatedCommunityIds": ["community-sh-001"]
}
```

字段说明：

- `region` 可选 `mainland`、`hmt`、`overseas`。
- `lat` / `lng` 用于渲染地图点位。
- `coverUrl` 只保存公开封面图 URL，不将图片长期下载搬运到仓库。
- `relatedCommunityIds` 用于匹配 `communities.json` 中的 QQ 群卡片。

## 新增 QQ 群

在 `public/data/communities.json` 添加对象：

```json
{
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
  "lastVerifiedAt": "2026-06-04",
  "description": "上海地区赛马娘玩家、同人作者与线下活动交流。"
}
```

`type` 可选 `同好会` 或 `临时群`。QQ 群号应确认是公开可展示信息。

## 投稿和纠错

投稿与纠错通过 GitHub Issue 模板完成：

- `.github/ISSUE_TEMPLATE/submit-event.yml`
- `.github/ISSUE_TEMPLATE/submit-community.yml`
- `.github/ISSUE_TEMPLATE/report-error.yml`

上线前请把 `src/App.vue` 中的 `githubUrl` 修改为实际仓库地址。

## 部署到 GitHub Pages

项目包含 GitHub Actions workflow：`.github/workflows/deploy-pages.yml`。

部署步骤：

1. 将代码推送到 GitHub 仓库的 `main` 分支。
2. 在仓库 Settings -> Pages 中选择 GitHub Actions 作为部署来源。
3. Actions 会执行 `npm ci`、`npm run build`，并把 `dist` 部署到 GitHub Pages。

`vite.config.ts` 使用 `base: './'`，适合部署到 GitHub Pages 的仓库子路径。

## 地图底图合规注意事项

本项目没有手绘中国地图，也没有 AI 生成中国地图边界。底图来自用户提供的自然资源部标准地图 EPS，并转换为 `public/map/china-standard-map-gs2023-2767.png` 用于 Web 展示。

当前底图合规信息：

- 地图来源：自然资源部标准地图服务。
- 审图号：GS（2023）2767号。
- EPS 仅做格式转换，不修改地图边界、行政区划界线、海岸线、港澳台、南海诸岛等内容。
- 网页只通过 CSS 对整张底图做透明度、亮度、灰度、对比度和黑色遮罩适配。
- 活动点位、城市标签、tooltip、详情卡片均为独立前端覆盖层，不写入地图底图。

## 安全边界

项目不实现：

- 登录系统或用户权限。
- 数据库或后端接口。
- 登录态抓包、签名绕过、验证码绕过、反爬绕过。
- 前端存储 token、cookie、密钥或管理员凭证。