import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import manifest from "../legacy/chrome30/manifest.json" with { type: "json" };
import packageInfo from "vuepg/package.json" with { type: "json" };
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { runScenarios } from "./legacy-scenarios.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const libraryRoot = dirname(createRequire(import.meta.url).resolve("vuepg/package.json"));
const source = resolve(root, "legacy/chrome30");
const cache = resolve(root, ".cache/legacy/chrome30");
const command = process.argv[2] ?? "test";
const run = (program, args, options = {}) =>
  new Promise((resolveResult, reject) => {
    const child = spawn(program, args, {
      cwd: root,
      stdio: options.inherit ? "inherit" : "pipe",
      shell: process.platform === "win32" && program === "pnpm",
    });
    let output = "";
    child.stdout?.on("data", (data) => {
      output += String(data);
    });
    child.stderr?.on("data", (data) => {
      output += String(data);
    });
    child.on("error", (error) => {
      if (options.allowFailure) {
        resolveResult({ code: null, output: String(error) });
      } else {
        reject(error);
      }
    });
    child.on("close", (code) => {
      if (code !== 0 && !options.allowFailure) {
        reject(new Error(`[vuEPG] ${program} ${args.join(" ")} 执行失败\n${output}`));
      } else {
        resolveResult({ code, output: output.trim() });
      }
    });
  });
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const image = `vuepg/chrome30:${digest(JSON.stringify(manifest) + (await readFile(resolve(source, "Dockerfile"))) + (await readFile(resolve(source, "start.sh")))).slice(0, 12)}`;

const install = async () => {
  await run("docker", ["info", "--format", "{{.OSType}}/{{.Architecture}}"]);
  const existing = await run("docker", ["image", "inspect", image], { allowFailure: true });
  if (existing.code !== 0) {
    await mkdir(cache, { recursive: true });
    for (const artifact of manifest.artifacts) {
      const file = resolve(cache, artifact.filename);
      let bytes;
      try {
        bytes = await readFile(file);
      } catch {
        /* 首次运行没有缓存。 */
      }
      if (!bytes || digest(bytes) !== artifact.sha256) {
        console.log(`[vuEPG] 下载 ${artifact.name}：${artifact.url}`);
        const response = await fetch(artifact.url, { signal: AbortSignal.timeout(180000) });
        if (!response.ok) {
          throw new Error(`[vuEPG] 下载失败：${artifact.url} (${response.status})`);
        }
        bytes = Buffer.from(await response.arrayBuffer());
        if (digest(bytes) !== artifact.sha256) {
          throw new Error(`[vuEPG] 下载校验失败：${artifact.name}`);
        }
        await writeFile(file, bytes);
      }
    }
    await writeFile(
      resolve(cache, "SHA256SUMS"),
      manifest.artifacts.map((artifact) => `${artifact.sha256}  ${artifact.filename}`).join("\n") +
        "\n",
    );
    for (const name of ["Dockerfile", "start.sh"]) {
      await copyFile(resolve(source, name), resolve(cache, name));
    }
    await run(
      "docker",
      [
        "build",
        "--platform",
        manifest.platform,
        "--build-arg",
        `BASE_IMAGE=${manifest.baseImage}`,
        "--tag",
        image,
        cache,
      ],
      {
        inherit: true,
      },
    );
  }
  const version = await run("docker", [
    "run",
    "--rm",
    "--platform",
    manifest.platform,
    image,
    "/opt/chrome-linux/chrome",
    "--version",
  ]);
  if (!version.output.includes(`Chromium ${manifest.browserVersion}`)) {
    throw new Error(`[vuEPG] 浏览器版本不符：${version.output}`);
  }
  const driver = await run(
    "docker",
    [
      "run",
      "--rm",
      "--platform",
      manifest.platform,
      image,
      "timeout",
      "1",
      "chromedriver",
      "--port=9515",
    ],
    { allowFailure: true },
  );
  if (!driver.output.includes(`v${manifest.driverVersion}`)) {
    throw new Error(`[vuEPG] ChromeDriver 版本不符：${driver.output}`);
  }
  console.log(`[vuEPG] 环境就绪：${version.output} / ChromeDriver ${manifest.driverVersion}`);
};

const waitFor = async (url, timeout = 60000, verifyProcess = () => undefined) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    verifyProcess();
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(3000) })).ok) {
        return;
      }
    } catch {
      /* 等待服务启动。 */
    }
    await new Promise((done) => setTimeout(done, 250));
  }
  throw new Error(`[vuEPG] 服务启动超时：${url}`);
};

const test = async () => {
  await install();
  const name = `vuepg-chrome30-${randomUUID().slice(0, 8)}`;
  const results = resolve(root, "legacy-results", name);
  await mkdir(results, { recursive: true });
  const children = [];
  const serverLogs = [];
  let capabilities;
  const cancellation = new AbortController();
  const interrupt = () => {
    cancellation.abort(new Error("[vuEPG] 测试已中断"));
  };
  process.on("SIGINT", interrupt);
  process.on("SIGTERM", interrupt);
  const startServer = async (port, script) => {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`, {
        signal: AbortSignal.timeout(1000),
      });
      if (response.ok) {
        if (response.headers.get("x-vuepg-project") !== digest(resolve(root))) {
          throw new Error(`[vuEPG] 端口 ${port} 被其他工程或旧开发服务占用`);
        }
        return;
      }
    } catch (error) {
      if (String(error).includes("被其他工程或旧开发服务占用")) {
        throw error;
      }
      /* 启动项目自己的开发入口。 */
    }
    const example = root;
    const args =
      script === "dev:tv"
        ? [
            resolve(example, "node_modules/webpack-cli/bin/cli.js"),
            "serve",
            "--config",
            "webpack.config.cjs",
            "--mode",
            "development",
          ]
        : [
            resolve(example, "node_modules/vite/bin/vite.js"),
            "--host",
            "0.0.0.0",
            "--port",
            "5175",
            "--strictPort",
          ];
    const child = spawn(process.execPath, args, {
      cwd: example,
      detached: process.platform !== "win32",
      stdio: "pipe",
    });
    children.push(child);
    let output = "";
    let startupError;
    child.on("error", (error) => {
      startupError = error;
    });
    child.stdout.on("data", (data) => {
      output += String(data);
    });
    child.stderr.on("data", (data) => {
      output += String(data);
    });
    serverLogs.push(async () => {
      await writeFile(resolve(results, `${script.replace(":", "-")}.log`), output);
    });
    await waitFor(`http://127.0.0.1:${port}/`, 120000, () => {
      cancellation.signal.throwIfAborted();
      if (startupError || child.exitCode !== null) {
        throw new Error(`[vuEPG] 开发服务 ${script} 启动失败：${String(startupError ?? output)}`);
      }
    });
  };
  let driverRoot;
  let sessionId;
  const wire = async (method, path, payload) => {
    const response = await fetch(`${driverRoot}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload),
      signal: AbortSignal.any([cancellation.signal, AbortSignal.timeout(30000)]),
    });
    const data = await response.json();
    if (data.status !== 0) {
      throw new Error(`[vuEPG] 旧 WebDriver ${path} 失败：${JSON.stringify(data.value)}`);
    }
    return data;
  };
  try {
    await startServer(5174, "dev:tv");
    await startServer(5175, "dev");
    const operatingSystem = await run("docker", ["info", "--format", "{{.OperatingSystem}}"]);
    const host = operatingSystem.output.includes("Docker Desktop")
      ? []
      : ["--add-host", "host.docker.internal:host-gateway"];
    await run("docker", [
      "run",
      "--detach",
      "--platform",
      manifest.platform,
      "--name",
      name,
      "--label",
      "com.vuepg.legacy=true",
      "--label",
      `com.vuepg.legacy.project=${digest(resolve(root))}`,
      "--publish",
      "127.0.0.1::9515",
      "--shm-size",
      "256m",
      ...host,
      "--volume",
      `${resolve(root, "dist")}:/site:ro`,
      "--volume",
      `${results}:/results`,
      image,
    ]);
    await run("docker", [
      "exec",
      name,
      "python3",
      "-c",
      "import urllib.request; urllib.request.urlopen('http://host.docker.internal:5174/', timeout=30).read(); urllib.request.urlopen('http://host.docker.internal:5175/', timeout=30).read()",
    ]);
    const published = await run("docker", ["port", name, "9515/tcp"]);
    driverRoot = `http://${published.output.split("\n")[0]}`;
    await waitFor(`${driverRoot}/status`, 60000, () => {
      cancellation.signal.throwIfAborted();
    });
    const driverLog = await run("docker", ["logs", name]);
    if (!driverLog.output.includes(`v${manifest.driverVersion}`)) {
      throw new Error(`[vuEPG] ChromeDriver 版本不符：${driverLog.output}`);
    }
    const session = await wire("POST", "/session", {
      desiredCapabilities: {
        browserName: "chrome",
        chromeOptions: {
          binary: "/opt/chrome-linux/chrome",
          args: ["--no-sandbox", "--disable-gpu", "--window-size=1440,1000"],
        },
        loggingPrefs: { browser: "ALL" },
      },
    });
    sessionId = session.sessionId;
    capabilities = session.value;
    if (session.value.version !== manifest.browserVersion) {
      throw new Error(`[vuEPG] 会话浏览器版本异常：${session.value.version}`);
    }
    const execute = async (script, args = []) =>
      (await wire("POST", `/session/${sessionId}/execute`, { script, args })).value;
    const navigate = async (url) => {
      await wire("POST", `/session/${sessionId}/url`, { url });
    };
    const keys = async (value) => {
      await wire("POST", `/session/${sessionId}/keys`, { value });
    };
    const screenshot = async (file) => {
      const data = await wire("GET", `/session/${sessionId}/screenshot`);
      await writeFile(resolve(results, `${file}.png`), Buffer.from(data.value, "base64"));
    };
    const logs = async () =>
      (await wire("POST", `/session/${sessionId}/log`, { type: "browser" })).value;
    const hotUpdate = async (check) => {
      const stylesheet = resolve(root, "src/style.css");
      const original = await readFile(stylesheet, "utf8");
      try {
        await writeFile(stylesheet, original + "\n.hero-start { letter-spacing: 3px; }\n");
        await check();
      } finally {
        await writeFile(stylesheet, original);
      }
    };
    const assertions = await runScenarios({
      execute,
      navigate,
      keys,
      screenshot,
      logs,
      results,
      hotUpdate,
    });
    const packages = await run("docker", ["exec", name, "cat", "/opt/packages.txt"]);
    await writeFile(resolve(results, "packages.txt"), packages.output);
    const revision = await run("git", ["rev-parse", "HEAD"], { allowFailure: true });
    const workingTree = await run("git", ["status", "--porcelain"], { allowFailure: true });
    await writeFile(
      resolve(results, "report.json"),
      JSON.stringify(
        {
          status: "passed",
          nodeVersion: process.version,
          libraryVersion: packageInfo.version,
          libraryHash: digest(await readFile(resolve(libraryRoot, "dist/index.js"))),
          applicationHash: digest(await readFile(resolve(root, "dist/assets/app.js"))),
          sourceRevision: revision.code === 0 ? revision.output : null,
          sourceModified: workingTree.code === 0 ? Boolean(workingTree.output) : null,
          browserVersion: session.value.version,
          driverVersion: manifest.driverVersion,
          platform: manifest.platform,
          image,
          capabilities: session.value,
          manifest,
          assertions,
          date: new Date().toISOString(),
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      `[vuEPG] Chromium ${session.value.version}：${assertions.length} 项断言通过；结果 ${results}`,
    );
  } catch (error) {
    if (sessionId) {
      try {
        const shot = await wire("GET", `/session/${sessionId}/screenshot`);
        await writeFile(resolve(results, "failure.png"), Buffer.from(shot.value, "base64"));
        const entries = await wire("POST", `/session/${sessionId}/log`, { type: "browser" });
        await writeFile(
          resolve(results, "failure-browser.json"),
          JSON.stringify(entries.value, null, 2),
        );
      } catch {
        /* 浏览器崩溃时保留容器日志。 */
      }
    }
    await writeFile(resolve(results, "failure.txt"), String(error.stack ?? error));
    await writeFile(
      resolve(results, "report.json"),
      JSON.stringify(
        { status: "failed", manifest, image, capabilities, error: String(error.stack ?? error) },
        null,
        2,
      ),
    );
    throw error;
  } finally {
    process.removeListener("SIGINT", interrupt);
    process.removeListener("SIGTERM", interrupt);
    if (sessionId && !cancellation.signal.aborted) {
      await wire("DELETE", `/session/${sessionId}`).catch(() => undefined);
    }
    const output = await run("docker", ["logs", name], { allowFailure: true });
    await writeFile(resolve(results, "container.log"), output.output);
    await run("docker", ["rm", "--force", name], { allowFailure: true });
    for (const saveLog of serverLogs) {
      await saveLog();
    }
    for (const child of children) {
      if (!child.pid) {
        continue;
      }
      if (process.platform === "win32") {
        await run("taskkill", ["/pid", String(child.pid), "/T", "/F"], { allowFailure: true });
      } else {
        try {
          process.kill(-child.pid, "SIGTERM");
        } catch {
          /* 进程已结束。 */
        }
      }
    }
  }
};

const clean = async () => {
  const containers = await run("docker", [
    "ps",
    "--all",
    "--quiet",
    "--filter",
    `label=com.vuepg.legacy.project=${digest(resolve(root))}`,
  ]);
  if (containers.output) {
    await run("docker", ["rm", "--force", ...containers.output.split("\n")]);
  }
  await run("docker", ["image", "rm", image], { allowFailure: true });
  await rm(resolve(root, ".cache/legacy"), { recursive: true, force: true });
  await rm(resolve(root, "legacy-results"), { recursive: true, force: true });
  console.log("[vuEPG] 已清理项目旧浏览器缓存、容器、镜像与测试结果");
};

try {
  if (command === "install") {
    await install();
  } else if (command === "test") {
    await test();
  } else if (command === "clean") {
    await clean();
  } else {
    throw new Error(`[vuEPG] 未知旧浏览器命令：${command}`);
  }
} catch (error) {
  console.error(String(error.stack ?? error));
  process.exitCode = 1;
}
