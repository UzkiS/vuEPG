import { readFileSync, readdirSync } from "node:fs";
import { resolve, relative } from "node:path";
import { JSDOM } from "jsdom";
import packageInfo from "../package.json" with { type: "json" };

const root = resolve("docs/.vitepress/dist");
const expectedUrl = (file) =>
  new URL(
    relative(root, file)
      .replaceAll("\\", "/")
      .replace(/index\.html$/, "")
      .replace(/\.html$/, ""),
    packageInfo.homepage,
  ).href;
const scan = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = resolve(directory, entry.name);
    return entry.isDirectory() ? scan(file) : file.endsWith(".html") ? [file] : [];
  });
const urls = new Set();
const indexed = new Set();
let checked = 0;
for (const file of scan(root)) {
  if (
    file.replaceAll("\\", "/").includes("/example/") ||
    file.replaceAll("\\", "/").endsWith("/404.html")
  ) {
    continue;
  }
  const dom = new JSDOM(readFileSync(file, "utf8"));
  const document = dom.window.document;
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
  const description = document.querySelector('meta[name="description"]')?.getAttribute("content");
  const og = document.querySelector('meta[property="og:url"]')?.getAttribute("content");
  if (
    canonical !== expectedUrl(file) ||
    !description ||
    !document.title ||
    document.querySelectorAll('link[rel="canonical"]').length !== 1 ||
    canonical !== og ||
    urls.has(canonical)
  ) {
    throw new Error(`[vuEPG] 页面元信息或规范地址异常：${file}`);
  }
  urls.add(canonical);
  const english = relative(root, file).replaceAll("\\", "/").startsWith("en/");
  const chineseUrl = english ? canonical.replace("/en/", "/") : canonical;
  const englishUrl = new URL(
    `en/${chineseUrl.slice(packageInfo.homepage.length)}`,
    packageInfo.homepage,
  ).href;
  for (const [language, expected] of [
    ["zh-CN", chineseUrl],
    ["en", englishUrl],
    ["x-default", chineseUrl],
  ]) {
    const actual = document
      .querySelector(`link[rel="alternate"][hreflang="${language}"]`)
      ?.getAttribute("href");
    if (actual !== expected) {
      throw new Error(`[vuEPG] 中英文页面对应地址异常：${file} (${language})`);
    }
  }
  if (!file.replaceAll("\\", "/").includes("/v1/")) {
    indexed.add(canonical);
  } else if (
    !document.querySelector('meta[name="robots"]')?.getAttribute("content")?.includes("noindex")
  ) {
    throw new Error(`[vuEPG] 归档页面缺少 noindex：${file}`);
  }
  checked += 1;
  dom.window.close();
}
const sitemap = readFileSync(resolve(root, "sitemap.xml"), "utf8");
if (!sitemap.includes(packageInfo.homepage) || sitemap.includes("/v1/")) {
  throw new Error("[vuEPG] sitemap 地址或归档过滤异常");
}
const sitemapDocument = new JSDOM(sitemap, { contentType: "application/xml" });
const locations = new Set(
  Array.from(sitemapDocument.window.document.querySelectorAll("loc"), (item) => item.textContent),
);
for (const canonical of indexed) {
  if (!locations.has(canonical)) {
    throw new Error(`[vuEPG] sitemap 未包含当前页面：${canonical}`);
  }
}
sitemapDocument.window.close();
console.log(`[vuEPG] ${checked} 个页面的标题、摘要、规范地址与分享地址检查通过`);

const example = readFileSync(resolve(root, "example/tv-training/index.html"), "utf8");
if (!example.includes("assets/app.js")) {
  throw new Error("[vuEPG] 文档部署缺少独立业务示例");
}
