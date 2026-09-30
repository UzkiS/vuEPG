import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const portArgument = process.argv.find((value) => value.startsWith("--port="));
const port = Number(portArgument?.slice(7) ?? process.env.EXAMPLE_PORT ?? 4174);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};
createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end("无效的资源路径");
    return;
  }
  const relative = pathname.replace(/^\/example\/tv-training(?:\/|$)/, "/");
  const file = resolve(root, `.${relative === "/" || relative === "" ? "/index.html" : relative}`);
  if (file !== root && !file.startsWith(root + sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    if (!(await stat(file)).isFile()) {
      response.writeHead(404).end();
      return;
    }
    response.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end("未找到示例产物，请先运行 pnpm build");
  }
}).listen(port, "0.0.0.0", () => console.log(`[vuEPG] 业务示例：http://localhost:${port}/`));
