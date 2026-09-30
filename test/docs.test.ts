import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { useVuEPG } from "../src";

/** 以项目根目录为基准读取文件（jsdom 环境中的全局 URL 不被 node:fs 接受） */
const read = (path: string): string => readFileSync(join(process.cwd(), path), "utf8");

/** docs/ 下的全部 Markdown 页面（排除 VitePress 生成目录） */
const pages = readdirSync(join(process.cwd(), "docs"), { recursive: true })
  .map((file) => String(file).replaceAll("\\", "/"))
  .filter((file) => file.endsWith(".md") && !file.startsWith(".vitepress"));

describe("documentation", () => {
  it("documents exactly the public API in both languages", () => {
    const exposed = Object.keys(useVuEPG());
    for (const file of ["docs/api/index.md", "docs/en/api/index.md"]) {
      const documented = Array.from(read(file).matchAll(/^### epg\.(\w+)$/gm), (m) => m[1]);
      expect([...documented].sort(), file).toEqual([...exposed].sort());
    }
  });

  it("provides matching Chinese and English pages, source references and interactive demos", () => {
    const chinese = pages.filter((page) => !page.startsWith("en/")).sort();
    const english = pages
      .filter((page) => page.startsWith("en/"))
      .map((page) => page.slice(3))
      .sort();
    expect(english).toEqual(chinese);
    for (const page of chinese) {
      const source = read(`docs/${page}`);
      const translated = read(`docs/en/${page}`);
      const regions = (content: string): string[] =>
        Array.from(content.matchAll(/^<<< \S+#([\w-]+)/gm), (match) => String(match[1])).sort();
      const demos = (content: string): string[] =>
        Array.from(content.matchAll(/<(\w+(?:Demo|Diagram|Playground|Example))\b/g), (match) =>
          String(match[1]),
        ).sort();
      expect(regions(translated), `${page} 源码引用`).toEqual(regions(source));
      expect(demos(translated), `${page} 交互演示`).toEqual(demos(source));
    }
  });

  it("keeps translated release versions synchronized", () => {
    const versions = (content: string): string[] =>
      Array.from(content.matchAll(/^## (\d+\.\d+\.\d+)$/gm), (match) => String(match[1]));
    expect(versions(read("docs/en/changelog.md"))).toEqual(versions(read("CHANGELOG.md")));
  });

  it("only references source regions that exist", () => {
    const references = pages.flatMap((page) =>
      Array.from(read(`docs/${page}`).matchAll(/^<<< (\S+?)#([\w-]+)/gm), (m) => ({
        page,
        file: resolve(process.cwd(), "docs", dirname(page), String(m[1])),
        region: String(m[2]),
      })),
    );
    expect(references.length).toBeGreaterThan(0);
    for (const { page, file, region } of references) {
      expect(readFileSync(file, "utf8"), `${page} → ${file}#${region}`).toContain(
        `// #region ${region}`,
      );
    }
  });
});
