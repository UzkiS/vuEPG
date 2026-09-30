import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// changesets 负责版本号和中文 CHANGELOG，本脚本同步已经审校的英文说明。
const root = resolve(import.meta.dirname, "..");
const changesetDirectory = resolve(root, ".changeset");
const pending = readdirSync(changesetDirectory).filter(
  (file) => file.endsWith(".md") && file !== "README.md",
);

const translations = pending.map((file) => {
  const path = resolve(changesetDirectory, "translations", file);
  const summary = readFileSync(path, "utf8").trim();
  if (summary.length === 0) {
    throw new Error(`[vuEPG] changeset 缺少英文发布说明：${file}`);
  }
  return { path, summary };
});

execFileSync("pnpm", ["changeset", "version"], { cwd: root, stdio: "inherit" });

if (translations.length > 0) {
  const changelog = readFileSync(resolve(root, "CHANGELOG.md"), "utf8");
  const release = /^## (\d+\.\d+\.\d+)\n+### (Major|Minor|Patch) Changes/m.exec(changelog);
  if (release?.[1] === undefined || release[2] === undefined) {
    throw new Error("[vuEPG] 无法读取生成的发布版本与变更类别");
  }
  const version = release[1];
  const englishPath = resolve(root, "docs/en/changelog.md");
  const english = readFileSync(englishPath, "utf8");
  const firstRelease = english.search(/^## \d+\.\d+\.\d+$/m);
  if (firstRelease === -1 || english.includes(`\n## ${version}\n`)) {
    throw new Error(`[vuEPG] 英文更新记录的版本入口异常：${version}`);
  }
  const summaries = translations
    .map(({ summary }) => `- ${summary.replaceAll("\n", "\n  ")}`)
    .join("\n\n");
  const section = `## ${version}\n\n### ${release[2]} Changes\n\n${summaries}\n\n`;
  writeFileSync(
    englishPath,
    english.slice(0, firstRelease) + section + english.slice(firstRelease),
  );
  execFileSync("pnpm", ["exec", "prettier", "--write", "docs/en/changelog.md"], {
    cwd: root,
    stdio: "inherit",
  });
  for (const { path } of translations) {
    unlinkSync(path);
  }
}
