# RED GT / CYAN GT Web GLB 接入测试

日期：2026-09-28。基线：`66e98ff`。仅新增两辆车的临时详情预览。

## 结果与限制

接入、交互与错误回退测试通过。RED GT 已替换为用户修复后的 `_web/car-web.glb` 和 `_web/car-web-mobile.glb`，并按新模型方向将 rotationY 设为 0。Chrome 桌面和手机模拟截图复核：此前车身、轮胎表面破碎与灰色面片问题未再出现，模型完整入镜。GLB 原样复制，未做材质替换或重新导出。

截图：[RED GT 桌面](vehicle-3d/red-desktop.png)、[RED GT 手机模拟](vehicle-3d/red-mobile.png)、[CYAN GT](vehicle-3d/cyan-desktop.png)。

GitHub Pages 线上与实体手机尚未验证。测试分支推送不会触发当前仅监听 main 的 Pages 工作流。

## 本地实测

Windows、本机 Chrome（Playwright headless，channel=chrome），Vite production preview，HTTP localhost；桌面 1440×900，手机模拟 390×844。无网络限速。以下是单次采样，不代表公网或实体手机性能。

每辆车的记录来自该浏览器上下文中首次打开 3D；浏览器进程/驱动缓存可能已热。下载耗时从 fetch 开始到完整字节读完；ready 从点击开始至模型解析、着色器编译及首次 render 提交完成，包含动态模块初始化，不包含 320ms 淡入完成时间。

| 模型 | 字节 | 首次下载 ms | Ready ms | render.triangles | render.calls |
| --- | ---: | ---: | ---: | ---: | ---: |
| RED GT desktop | 16,832,488 | 216 | 2,425 | 160,676 | 9 |
| RED GT mobile | 9,863,008 | 142 | 809 | 98,800 | 9 |
| CYAN GT desktop | 13,299,432 | 168 | 2,381 | 163,776 | 9 |
| CYAN GT mobile | 8,127,492 | 78 | 617 | 96,188 | 9 |

RED GT 替换后体积从约 2.88/2.03 MB 增至 16.83/9.86 MB（桌面/移动），公网首次下载成本相应增加。RED 数据已重新测量；CYAN 保留上一轮采样。

运行时可在 console 的 `[AWTC vehicle]` 记录中查看同口径数据；`.vehicle-canvas` 的 `data-metrics` 也保存最近一次成功结果。

已验证：

- 首页初始没有 GLB、Three、Viewer 或 GLTFLoader 请求。
- RED / CYAN 点击加载对应桌面或移动模型；yellow / pink / blue 点击没有模型请求或详情打开。
- 再次打开 RED，模型请求数量保持 2 → 2；应用缓存原始字节，不重复下载。
- 加载有状态提示；ready 后 PNG / canvas 320ms crossfade。两辆车的整体包围范围均进入视口。
- 鼠标拖动、滚轮、模拟触摸拖动与双指 pinch 均改变实际渲染画面。
- 返回保留索引（CYAN=2、RED=3）、scrollY 和原始 overflow；关闭后页面能继续滚动。
- 模拟 GLB 404、无效 GLB、Three 模块下载失败及 WebGL context loss：显示 `3D PREVIEW UNAVAILABLE`，保留 PNG，可返回。
- 模拟 mobile 文件 404：自动加载 desktop GLB，成功显示。
- 加载途中关闭：无迟到详情重新显示，页面滚动恢复。
- `npm install`、`npm run build`、`git diff --check` 通过。

代码约束核查：enablePan=false；最小距离在模型包围球外；最大距离和 polar angle 有限；无自动旋转；关闭停止动画并释放模型 GPU 资源，详情实例复用 renderer；路由销毁同时释放 controls、renderer、环境贴图和 Draco worker。

构建有 Three 独立 chunk 超过 500kB 的体积提示，非构建错误；该 chunk 未进入首页初始网络加载。

## 文件与边界

- `src/home/vehicle-viewer.js`：动态导入、加载缓存、Draco、包围盒取景、灯光、控制器和资源释放。
- `src/home/vehicle-detail.js`、`.css`：详情布局、2D/3D 过渡、加载/失败状态、焦点与滚动恢复。
- `garage-controller.js`、`garage.js`：仅当前可用车辆的点击/键盘入口及销毁调用，防滑动误触。
- `src/data/cars.js`：两辆车模型路径、RED 朝向参数；其余模型字段 null。
- `package.json`、lockfile：仅增加 three。
- `public/models/`：四份原样 GLB；`public/draco/`：Three 附带的本地 glTF Draco 解码资源。

Hero、Lens、Ambient、Hero→Garage transition、Menu、Header、Router、Loading Screen、赛季及其他页面代码、部署工作流均未修改。

## 原文件一致性

四份目标模型与用户提供的原文件逐一 SHA-256 比较相同：

| 文件 | SHA-256 |
| --- | --- |
| red-gt.glb | 8edd84346f47ca1ad4e389bc137f411dc46c7e6cd3c65ec2381cf1d8dede501a |
| red-gt-mobile.glb | 3f4febe44d129a423f5e3fec02a08ce7c500a75ecaada0bf05af9b418a834467 |
| cyan-gt.glb | b9313a9a370315b8e212c67e1ee82f26c77d3056ba2199f265262e38e604ef2d |
| cyan-gt-mobile.glb | 9f9c0cd0cdcb6134a715d96374bce4f2cba0b3d328dceb13cda69442e0c88176 |
