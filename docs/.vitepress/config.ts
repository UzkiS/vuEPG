import { fileURLToPath } from "node:url";
import { cp } from "node:fs/promises";
import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { pageHead } from "./seo";
import { nav, sidebar } from "./navigation";
import { defineConfig } from "vitepress";
import { description, homepage, repository } from "../../package.json";

const REPO = repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
const BASE = new URL(homepage).pathname;

export default defineConfig({
  lang: "zh-CN",
  title: "vuEPG",
  titleTemplate: ":title | vuEPG",
  description,
  locales: {
    root: { label: "简体中文", lang: "zh-CN" },
    en: {
      label: "English",
      lang: "en",
      description:
        "Vue 2.7 / Vue 3 focus management and spatial navigation for modern browsers, TV, IPTV and set-top boxes, including Android 4.x devices.",
      themeConfig: {
        editLink: { pattern: `${REPO}/edit/main/docs/:path`, text: "Edit this page on GitHub" },
        outline: { level: [2, 3], label: "On this page" },
        docFooter: { prev: "Previous", next: "Next" },
        lastUpdated: { text: "Last updated" },
        returnToTopLabel: "Back to top",
        sidebarMenuLabel: "Menu",
        darkModeSwitchLabel: "Appearance",
        lightModeSwitchTitle: "Switch to light mode",
        darkModeSwitchTitle: "Switch to dark mode",
        langMenuLabel: "Change language",
        search: {
          provider: "local",
          options: {
            _render: (src, env, md) =>
              /(?:^|\/)v1\//.test(env.relativePath) ? "" : md.render(src, env),
            translations: {
              button: { buttonText: "Search", buttonAriaLabel: "Search documentation" },
              modal: {
                noResultsText: "No results found",
                resetButtonTitle: "Clear query",
                footer: { selectText: "Select", navigateText: "Navigate", closeText: "Close" },
              },
            },
          },
        },
        footer: {
          message: `Released under the MIT License · <a href="${BASE}en/#support">Support the project</a>`,
          copyright: "Copyright © 2022 – Present UzkiS",
        },
        nav: nav(true),
        sidebar: sidebar(true),
      },
    },
  },
  base: BASE,
  cleanUrls: true,
  // 业务示例是构建结束后复制的独立 HTML 应用。
  ignoreDeadLinks: [/^\/example\/tv-training(?:\/index)?\/?$/],
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: `${BASE}logo.svg` }],
    ["meta", { name: "theme-color", content: "#d81b60" }],
  ],
  sitemap: {
    hostname: homepage,
    transformItems: (items) => items.filter((item) => !/(?:^|\/)v1\//.test(item.url)),
  },
  transformPageData: (page) => {
    // 未单独提供摘要的页面仍有与标题相关的描述；重要入口使用明确的 frontmatter。
    const summary: unknown = page.frontmatter["description"];
    if (typeof summary !== "string" || summary.length === 0) {
      page.description = page.relativePath.startsWith("en/")
        ? `${page.title}: Vue 2.7 / Vue 3 focus management and spatial navigation.`
        : `${page.title}：${description}`;
    }
  },
  transformHead: ({ pageData, title, description: summary }) =>
    pageHead(pageData.relativePath, title, summary),
  buildEnd: async (site) => {
    await cp(
      fileURLToPath(new URL("../../examples/tv-training/dist", import.meta.url)),
      `${site.outDir}/example/tv-training`,
      { recursive: true },
    );
  },
  vite: {
    plugins: [
      {
        name: "vuepg-business-example",
        configureServer: (server) => {
          const root = fileURLToPath(new URL("../../examples/tv-training/dist", import.meta.url));
          server.middlewares.use(`${BASE}example/tv-training`, (request, response, next) => {
            const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
            const file = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
            if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) {
              next();
              return;
            }
            const types: Readonly<Record<string, string>> = {
              ".js": "application/javascript",
              ".html": "text/html; charset=utf-8",
              ".css": "text/css",
            };
            response.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
            const stream = createReadStream(file);
            stream.on("error", () => {
              if (!response.headersSent) {
                response.writeHead(404);
              }
              response.end();
            });
            stream.pipe(response);
          });
        },
      },
    ],
    resolve: {
      // 文档中的示例与演示直接使用仓库源码，保证与发布内容一致
      alias: { vuepg: fileURLToPath(new URL("../../src/index.ts", import.meta.url)) },
    },
  },
  themeConfig: {
    logo: "/logo.svg",
    nav: nav(false),
    sidebar: sidebar(false),
    socialLinks: [
      { icon: "github", link: REPO },
      { icon: "npm", link: "https://www.npmjs.com/package/vuepg" },
    ],
    editLink: { pattern: `${REPO}/edit/main/docs/:path`, text: "在 GitHub 上编辑此页" },
    footer: {
      message: `基于 MIT 许可发布 · <a href="${BASE}#support">支持项目</a>`,
      copyright: "Copyright © 2022 – Present UzkiS",
    },
    search: {
      provider: "local",
      options: {
        // 站内搜索只收录当前版本，避免搜到 1.x 的旧用法
        _render: (src, env, md) =>
          /(?:^|\/)v1\//.test(env.relativePath) ? "" : md.render(src, env),
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
    langMenuLabel: "切换语言",
  },
});
