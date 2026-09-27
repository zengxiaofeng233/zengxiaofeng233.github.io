# AWTC 车辆档案模板

编辑入口：`src/data/cars.js` 的 `ARCHIVES`。五辆车共用现有 `createVehicleDetail`，没有新增另一套页面框架或依赖。

- `displayName`、`number`、`className`：正式名称、车号、组别；空字符串显示克制占位。
- `archiveIndex`、`archiveTotal`：页面位置编号；按现有五车顺序，CYAN 为 03 / 05，不复制参考图的 02 / 03。
- `raceHistory`：`[{ year: '', nameZh: '', nameEn: '' }]`，支持多条并限制区域高度。
- `drivers`：`[{ name: '' }]`。当前全部为空；页面保留四行破折号，正式名单超过四人时纵向滚动。空姓名不当成正式成员。
- `has3D`、`has2D`：资源能力；3D 还要求存在 `model3d`。只有 CYAN 和 RED 显示 3D / 2D，另三车只显示 2D。
- `backgroundType`、`backgroundSrc`：仅 CYAN/daytona、RED/nurburgring 组合使用赛道背景。空路径或图片加载失败自动保留浅底。

CYAN 名称、#11、GT3 和 2026 戴通纳记录经用户确认后录入；其余正式档案留空。没有添加车手姓名，没有缩略图占位。初始 3D 为侧面方向，保留拖动、缩放、模型按需加载与关闭资源释放。

## 生成背景

使用内置 image_gen，未使用 CLI。两张图片是生成的赛道氛围图，不是实景摄影或场地测绘。页面以低透明度和横向渐隐融合。

- `public/backgrounds/daytona.png`
- `public/backgrounds/nurburgring.png`

最终提示词：

### Daytona

Use case: ads-marketing. Generate a standalone website background asset, panoramic landscape 2.2:1. Daytona International Speedway atmosphere, trackside grandstands and high catch fencing recede diagonally across the RIGHT half of the frame, recognisable banked oval setting. Empty track, NO cars, NO people, NO UI, NO words, NO logos. Eye-level low automotive side-profile presentation perspective. Left 35 percent completely empty light warm grey-white negative space for archive text; middle and lower foreground empty smooth light grey ground for separately composited racing car. Very soft overcast daylight, pale monochrome warm grey palette, fine realistic architectural outlines dissolving into white haze. Minimal premium motorsport archive aesthetic. Low contrast yet legible stands on right, no heavy shadows, no vignette, no dramatic sky. This is only a supporting background, not a full webpage.

### Nürburgring

Use case: ads-marketing. Standalone panoramic website atmosphere background asset 2.2:1 landscape. Nürburgring Germany GRAND PRIX circuit, recognisable angular pit grandstand architecture and distant Nürburg castle silhouette on wooded Eifel hills, right half of composition. Empty circuit, NO cars, NO people, NO UI, NO words, NO logos. Low trackside viewpoint for separately composited side-profile racing car. Left 35 percent completely empty warm light grey-white negative space for text; middle and foreground empty pale track surface. Minimal premium motorsport archive aesthetic. Very soft overcast daylight, very pale monochrome warm greys, gentle fine realistic architectural outlines and forest contours dissolving into white haze. Low contrast, no dark shadows, no dramatic sky, no vignette. Supporting subdued scene, not a full webpage.

## 验证和边界

本地 Chrome 自动化覆盖五车打开/返回，CYAN/RED 双模式，首次首页与 2D 车无 GLB 请求，返回滚动位置恢复；320、390、1366 宽度下使用浏览器临时注入的 12 个破折号条目验证列表滚动、多条履历滚动、焦点恢复和减少动效模式；3D 404 保留侧视图且可切回 2D。测试占位不写入正式数据。桌面 1846×852 截图用于参考图布局比对。

既有模型材质与二维渲染本身不同，因此 3D 效果不宣称逐像素一致。未修改 GLB、原侧视图、依赖、部署或首页动画；本轮不发布站点。Three 分块仍有原有的大于 500 kB 构建提示。

后续内容：`src/pages/placeholder.js` 与 `src/data/nav.js` 中赛历、车手/车队、合作伙伴、历史及报名入口仍为已有占位页；本轮未扩展这些页面。
