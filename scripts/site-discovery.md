# 文档收录

文档由 VitePress 输出静态 HTML，收录相关的设置如下：

- 每个页面有独立的标题与摘要；canonical 与分享 URL 按 GitHub Pages 子路径 `/vuEPG/` 生成；首页附带 SoftwareSourceCode 结构化数据；中英文页面互相链接。
- npm 描述、仓库地址和版本来自 `package.json`，文档配置直接引用。
- sitemap 由文档构建生成。1.x 归档页面使用 `noindex, follow` 并从 sitemap 排除。GitHub Pages 子路径下不能放置主机根目录的 `robots.txt`，因此归档页通过页面级 robots 元信息管理。
- `pnpm check` 检查构建后各页的摘要、canonical、OG URL 与 sitemap。

## 提交 sitemap

部署后，sitemap 位于 `https://uzkis.github.io/vuEPG/sitemap.xml`。在 Google Search Console 或 Bing Webmaster 验证站点后提交该地址。

## 仓库信息

GitHub 仓库的 About 与 Topics 和 README 的支持范围保持一致：Vue 2.7 / Vue 3、现代浏览器、TV / IPTV、Android 4.x / Chromium 30 接入和完整示例。
