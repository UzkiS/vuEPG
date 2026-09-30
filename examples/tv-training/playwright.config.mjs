import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/browser",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4874",
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: [
    {
      command: "node scripts/serve.mjs --port=4874",
      wait: { stdout: /业务示例：http/ },
      timeout: 60000,
    },
    {
      command:
        "node node_modules/webpack-cli/bin/cli.js serve --config webpack.config.cjs --mode development",
      wait: { stdout: /webpack compiled successfully/ },
      timeout: 120000,
    },
    {
      command: "node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5175 --strictPort",
      wait: { stdout: /ready in/ },
      timeout: 60000,
    },
  ],
});
