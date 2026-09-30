// 两个工具链使用同一入口；旧设备目标只在这里维护。
const { createHash } = require("node:crypto");

module.exports = {
  projectId: createHash("sha256").update(__dirname).digest("hex"),
  port: 5174,
  legacyTarget: "chrome >= 30",
  entry: "./src/main.ts",
  title: "遥控学习中心 · vuEPG 业务示例",
};
