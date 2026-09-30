import { createRequire } from "node:module";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import "../examples/tv-training/scripts/check-build.mjs";

// 库仓库回归必须消费当前构建；独立复制工程则从 npm 安装。
const fromExample = createRequire(new URL("../examples/tv-training/package.json", import.meta.url));
if (
  realpathSync(fromExample.resolve("vuepg/package.json")) !==
  fileURLToPath(new URL("../package.json", import.meta.url))
) {
  throw new Error("[vuEPG] 仓库示例未连接当前库产物，请从仓库根目录运行 pnpm install");
}
