import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "acorn";

const directory = fileURLToPath(new URL("../dist", import.meta.url));
const scan = (root) =>
  readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const file = resolve(root, entry.name);
    return entry.isDirectory() ? scan(file) : file.endsWith(".js") ? [file] : [];
  });
const files = scan(directory);
if (files.length === 0) {
  throw new Error("[vuEPG] 未找到业务示例 JavaScript 产物");
}
for (const file of files) {
  parse(readFileSync(file, "utf8"), { ecmaVersion: 5, sourceType: "script" });
}
const html = readFileSync(resolve(directory, "index.html"), "utf8");
if (html.indexOf('type="module"') !== -1 || html.indexOf("assets/app.js") === -1) {
  throw new Error("[vuEPG] 兼容构建必须使用普通脚本入口");
}
console.log(`[vuEPG] ${files.length} 个示例脚本通过 ES5 语法检查，HTML 使用普通脚本入口`);
