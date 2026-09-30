# 参与贡献

感谢你愿意改进 vuEPG！工程规范（分层、编码约束、测试与文档要求）统一维护在 [AGENTS.md](./AGENTS.md)，提交前请先阅读。

## 开发环境

- Node.js：见 [`.node-version`](./.node-version)
- pnpm：见 `package.json` 的 `packageManager`（推荐通过 `corepack enable` 自动使用对应版本）

```sh
git clone https://github.com/UzkiS/vuEPG.git
cd vuEPG
pnpm install
```

安装时会自动配置 Git 钩子：提交前对暂存文件运行 ESLint 与 Prettier。

## 开发流程

1. 从 `main` 创建分支；
2. 修改代码并补充测试：`pnpm test:watch`；
3. 本地预览文档：`pnpm docs:dev`，打开 <http://localhost:5173/vuEPG/>；
4. 面向用户的改动运行 `pnpm changeset` 添加变更说明，并提供同名英文发布说明（规则见 AGENTS.md）；
5. 运行 `pnpm check`，全部通过后提交 Pull Request。

## 发布

发布由 GitHub Actions 自动完成，维护者只需合并 PR：

1. 带 changeset 的 PR 合并到 `main` 后，Release 工作流会创建或更新「chore: release」PR，其中包含新版本号与 CHANGELOG；
2. 合并「chore: release」PR 后，工作流发布到 npm 并创建 GitHub Release；
3. 文档随 `main` 的更新自动部署到 GitHub Pages。

### 首次配置（仓库维护者）

| 配置                 | 位置                                                     | 设置                                                                                        |
| -------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| GitHub Pages         | 仓库 Settings → Pages                                    | Source 选择 **GitHub Actions**                                                              |
| Actions 创建 PR 权限 | 仓库 Settings → Actions → General → Workflow permissions | 勾选 **Allow GitHub Actions to create and approve pull requests**                           |
| npm 可信发布         | npmjs.com → vuepg → Settings → Trusted Publisher         | GitHub Actions，Organization or user：`UzkiS`，Repository：`vuEPG`，Workflow：`release.yml` |

配置可信发布后无需任何 npm token，发布的包会附带 [provenance](https://docs.npmjs.com/generating-provenance-statements) 来源证明。

## 示例与浏览器检查

先执行 `pnpm example:build` 构建独立应用，再运行 `pnpm example:test`。现代浏览器首次使用需要 `pnpm exec playwright install chromium`；CI 安装对应的系统依赖。

旧设备兼容改动执行 `pnpm legacy:install` 与 `pnpm test:chrome30`，宿主需有可用 Docker。配置、结果及跨平台范围见 [legacy/chrome30](./legacy/chrome30/README.md)。示例开发规范见 [examples/tv-training/AGENTS.md](./examples/tv-training/AGENTS.md)。

## 站点维护

页面摘要、分享信息、站点收录与搜索平台维护说明见 [site-discovery.md](./scripts/site-discovery.md)。
