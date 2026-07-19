# Exploration Atlas

面向 iPad 横屏的生日探索 PWA。它用原创羊皮纸地图串联六份礼物，通过浏览器定位、照片复刻和本地识图逐步解锁剧情。

## 在线测试版

- GitHub Pages 镜像：<https://aaron2000dq.github.io/>
- Vercel 备用：<https://exploration-atlas-birthday.vercel.app>

在 iPad Safari 中打开并横屏使用：

1. 首次打开时保持联网，等待首页显示“离线地图已缓存”。
2. 允许定位与相机权限，然后可通过 Safari 分享菜单“添加到主屏幕”。
3. 当前四组坐标都位于余杭富力中心附近，适合在家附近做 MVP 踩点。
4. 如定位尚未命中，长按右下角指南针 5 秒，输入 `1104` 使用制图人兜底。

## 本地运行

```bash
npm install
npm run dev
```

打开终端显示的地址。相机与定位的完整权限流程请使用上面的 HTTPS 测试地址。

## 验收

```bash
npm test
npm run test:e2e
npm run lint
```

- `npm test`：定位算法、生产构建和离线 PWA 完整性。
- `npm run test:e2e`：以 iPad 横屏尺寸在 WebKit 中验证主要流程和隐藏兜底。
- `npm run lint`：TypeScript 类型检查。

## 内容配置

地点、坐标、解锁半径、文案、参考照片和评分阈值集中在 `src/config/story.ts`。当前坐标是余杭富力中心附近的 MVP 测试点，正式使用前请通过制图人控制台的勘测模式替换。

长按右下角指南针 5 秒，输入 `1104`，可进入制图人控制台，进行强制抵达、强制过关、模拟定位与重置彩排。

照片与进度只保存在当前设备的 IndexedDB，不会上传服务器。
