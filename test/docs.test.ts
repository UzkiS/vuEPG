import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { useVuEPG } from "../src";

/** 以项目根目录为基准读取文件（jsdom 环境中的全局 URL 不被 node:fs 接受） */
const read = (path: string): string => readFileSync(join(process.cwd(), path), "utf8");

/** docs/ 下的全部 Markdown 页面（排除 VitePress 生成目录） */
const pages = readdirSync(join(process.cwd(), "docs"), { recursive: true })
  .map(String)
  .filter((file) => file.endsWith(".md") && !file.startsWith(".vitepress"));

describe("documentation", () => {
  it("documents exactly the public API (docs/api/index.md ⇄ src/vue/api.ts)", () => {
    const documented = Array.from(
      read("docs/api/index.md").matchAll(/^### epg\.(\w+)$/gm),
      (m) => m[1],
    );
    const exposed = Object.keys(useVuEPG());
    expect([...documented].sort()).toEqual([...exposed].sort());
  });

  it("only references source regions that exist", () => {
    const references = pages.flatMap((page) =>
      Array.from(read(`docs/${page}`).matchAll(/^<<< \.\.\/\.\.\/(\S+?)#([\w-]+)/gm), (m) => ({
        page,
        file: String(m[1]),
        region: String(m[2]),
      })),
    );
    expect(references.length).toBeGreaterThan(0);
    for (const { page, file, region } of references) {
      expect(read(file), `${page} → ${file}#${region}`).toContain(`// #region ${region}`);
    }
  });
});
