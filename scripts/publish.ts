/**
 * 发布脚本：由 .github/workflows/release.yml 在没有待处理的 changeset 时调用。
 * 当前版本尚未发布到 npm 时：npm 发布（可信发布 + provenance）→ 创建 GitHub Release（附带 Git 标签）。
 * 已发布时什么也不做，因此可以安全地重复运行。
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import pkg from "../package.json" with { type: "json" };

const { name, version } = pkg;

const run = (command: string, args: readonly string[], input?: string): string =>
  execFileSync(command, args, {
    encoding: "utf8",
    input,
    stdio: [input === undefined ? "ignore" : "pipe", "pipe", "inherit"],
  }).trim();

const isPublished = (): boolean => {
  try {
    return run("npm", ["view", `${name}@${version}`, "version"]) === version;
  } catch {
    return false;
  }
};

/** 从 CHANGELOG.md 中截取当前版本的内容 */
const releaseNotes = (): string => {
  const lines = readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf8").split("\n");
  const start = lines.indexOf(`## ${version}`);
  if (start === -1) {
    throw new Error(`CHANGELOG.md 中没有 ${version} 的记录`);
  }
  const end = lines.findIndex((line, index) => index > start && line.startsWith("## "));
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join("\n")
    .trim();
};

if (isPublished()) {
  console.log(`${name}@${version} 已发布，跳过`);
} else {
  const notes = releaseNotes();
  run("npm", ["publish"]);
  const tag = `v${version}`;
  run(
    "gh",
    [
      "release",
      "create",
      tag,
      "--title",
      tag,
      "--target",
      process.env["GITHUB_SHA"] ?? "HEAD",
      "--notes-file",
      "-",
    ],
    notes,
  );
  console.log(`已发布 ${name}@${version}，并创建 GitHub Release ${tag}`);
}
