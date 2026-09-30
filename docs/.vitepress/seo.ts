import type { HeadConfig } from "vitepress";
import { description, homepage, repository, version } from "../../package.json";

/** 页面路径与 GitHub Pages 子路径共同生成规范 URL。 */
export const canonicalUrl = (relativePath: string): string =>
  new URL(relativePath.replace(/index\.md$/, "").replace(/\.md$/, ""), homepage).href;

/** 逐页生成分享信息，避免内页全部指向首页。 */
export const pageHead = (relativePath: string, title: string, summary: string): HeadConfig[] => {
  const url = canonicalUrl(relativePath);
  const english = relativePath.startsWith("en/");
  const image = new URL("share.png", homepage).href;
  const head: HeadConfig[] = [
    ["link", { rel: "canonical", href: url }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "vuEPG" }],
    ["meta", { property: "og:title", content: title }],
    ["meta", { property: "og:description", content: summary || description }],
    ["meta", { property: "og:url", content: url }],
    ["meta", { property: "og:image", content: image }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:locale", content: english ? "en_US" : "zh_CN" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: title }],
    ["meta", { name: "twitter:description", content: summary || description }],
    ["meta", { name: "twitter:image", content: image }],
  ];
  const chinesePath = relativePath.replace(/^en\//, "");
  head.push(["link", { rel: "alternate", hreflang: "zh-CN", href: canonicalUrl(chinesePath) }]);
  head.push([
    "link",
    { rel: "alternate", hreflang: "en", href: canonicalUrl(`en/${chinesePath}`) },
  ]);
  head.push(["link", { rel: "alternate", hreflang: "x-default", href: canonicalUrl(chinesePath) }]);
  if (chinesePath.startsWith("v1/")) {
    head.push(["meta", { name: "robots", content: "noindex, follow" }]);
  }
  if (relativePath === "index.md" || relativePath === "en/index.md") {
    head.push([
      "script",
      { type: "application/ld+json" },
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: "vuEPG",
        alternateName: "vuepg",
        description: summary,
        url: homepage,
        codeRepository: repository.url.replace(/^git\+/, "").replace(/\.git$/, ""),
        programmingLanguage: "TypeScript",
        runtimePlatform: "Vue 2.7 / Vue 3",
        version,
        license: "https://opensource.org/license/mit",
        inLanguage: english ? "en" : "zh-CN",
      }),
    ]);
  }
  return head;
};
