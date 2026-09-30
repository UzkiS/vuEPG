# 文档收录与项目发现

文档由 VitePress 输出静态 HTML。重要页面提供独立标题与摘要，所有页面生成与实际 GitHub Pages 子路径一致的 canonical 与分享 URL；首页提供 SoftwareSourceCode 结构化信息，英文入口与中文入口互相连接。

## 维护入口

- npm 描述、仓库地址和版本来自 `package.json`，文档配置直接引用。
- README 提供中文、英文、业务示例、旧设备和 API 入口。
- sitemap 由文档构建生成，归档的 1.x 页面使用 `noindex, follow` 并从 sitemap 排除，保留可访问的历史资料。
- `pnpm check` 检查构建后各页的摘要、canonical、OG URL 与 sitemap。

## 发布后提交收录

在 GitHub Pages 部署后，sitemap 位于文档站的 `/vuEPG/sitemap.xml`。用 Google Search Console 或 Bing Webmaster 验证站点后提交该地址，并检查首页、业务示例、WebView 30、英文指南的收录状态。

GitHub Pages 的本站路径为 `/vuEPG/`；搜索引擎读取的 robots.txt 属于主机根路径 `/robots.txt`。子路径下的 robots.txt 不能替代主机根文件，因此本站使用页面级 robots 元信息和 sitemap 管理归档。

GitHub 仓库 About 与 README 的支持范围保持一致，说明 Vue 2.7 / Vue 3、现代浏览器、TV / IPTV、Android 4.x / Chromium 30 接入和完整示例。Topics 保留已有的框架与导航标签，按实际兼容和迁移指南维护 `webview`、`legacy-browser`、`android-tv`、`chromium-30` 与 `vue-tv-focusable`。

## 观察效果

以搜索词曝光、页面收录、文档访问和示例访问观察变化，再参考 npm 下载、Issue 与真实接入反馈。站点验证和搜索平台提交需在站点部署且持有相应账户时完成。
