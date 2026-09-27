import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { description, homepage, repository, version } from "../../package.json";

const REPO = repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
const BASE = new URL(homepage).pathname;

export default defineConfig({
  lang: "zh-CN",
  title: "vuEPG",
  titleTemplate: ":title | vuEPG",
  description,
  base: BASE,
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: `${BASE}logo.svg` }],
    ["meta", { name: "theme-color", content: "#d81b60" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "vuEPG" }],
    ["meta", { property: "og:description", content: description }],
    ["meta", { property: "og:url", content: homepage }],
  ],
  vite: {
    resolve: {
      // 文档中的示例与演示直接使用仓库源码，保证与发布内容一致
      alias: { vuepg: fileURLToPath(new URL("../../src/index.ts", import.meta.url)) },
    },
  },
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "指引", link: "/guide/introduction", activeMatch: "/guide/" },
      { text: "API", link: "/api/", activeMatch: "/api/" },
      { text: "在线演示", link: "/guide/playground" },
      {
        text: `v${version}`,
        items: [
          { text: "更新日志", link: "/changelog" },
          { text: "从 1.x 升级", link: "/migration/v1" },
          { text: "从 vue-epg 迁移", link: "/migration/vue-epg" },
        ],
      },
    ],
    sidebar: {
      "/": [
        {
          text: "开始",
          items: [
            { text: "介绍", link: "/guide/introduction" },
            { text: "快速开始", link: "/guide/getting-started" },
            { text: "在线演示", link: "/guide/playground" },
          ],
        },
        {
          text: "核心概念",
          items: [
            { text: "EPGItem", link: "/guide/epg-item" },
            { text: "EPGGroup", link: "/guide/epg-group" },
            { text: "事件", link: "/guide/events" },
            { text: "移动规则", link: "/guide/navigation" },
          ],
        },
        {
          text: "进阶",
          items: [
            { text: "配置", link: "/guide/configuration" },
            { text: "按键映射", link: "/guide/key-actions" },
            { text: "返回处理", link: "/guide/back" },
            { text: "TypeScript", link: "/guide/typescript" },
          ],
        },
        { text: "参考", items: [{ text: "API", link: "/api/" }] },
        {
          text: "迁移",
          items: [
            { text: "从 1.x 升级", link: "/migration/v1" },
            { text: "从 vue-epg 迁移", link: "/migration/vue-epg" },
            { text: "更新日志", link: "/changelog" },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: REPO },
      { icon: "npm", link: "https://www.npmjs.com/package/vuepg" },
    ],
    editLink: { pattern: `${REPO}/edit/main/docs/:path`, text: "在 GitHub 上编辑此页" },
    footer: {
      message: "基于 MIT 许可发布",
      copyright: "Copyright © 2022-Present UzkiS",
    },
    search: {
      provider: "local",
      options: {
        translations: {
          button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
          modal: {
            noResultsText: "没有找到相关结果",
            resetButtonTitle: "清除查询",
            footer: { selectText: "选择", navigateText: "切换", closeText: "关闭" },
          },
        },
      },
    },
    outline: { level: [2, 3], label: "本页目录" },
    docFooter: { prev: "上一页", next: "下一页" },
    lastUpdated: { text: "最后更新" },
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "外观",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
  },
});
