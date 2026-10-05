# AGENTS.md

本文件是 vuEPG 的工程规范，供 AI 编码助手与人类贡献者共同遵守。[CONTRIBUTING.md](./CONTRIBUTING.md) 与 [CLAUDE.md](./CLAUDE.md) 均引用本文件，规范只在这里维护。

## 项目概述

vuEPG 是 Vue 2.7 / Vue 3 通用的大屏（TV / IPTV / 机顶盒）焦点管理与空间导航插件，发布为 npm 包 `vuepg`，文档部署在 GitHub Pages：<https://uzkis.github.io/vuEPG/>。

- 运行时：浏览器，**零运行时依赖**，`vue` 为 peer dependency（`^2.7.0 || ^3.0.0`）
- 产物：ES2015，ESM + CJS 双格式，附带类型声明
- 工具链：pnpm、TypeScript、tsdown、Vitest（jsdom）、ESLint、Prettier、VitePress、Changesets

## 常用命令

| 命令             | 作用                                                        |
| ---------------- | ----------------------------------------------------------- |
| `pnpm install`   | 安装依赖（版本由 `packageManager` 与 `.node-version` 决定） |
| `pnpm test`      | 在 Vue 3 与 Vue 2.7 上运行全部测试                          |
| `pnpm coverage`  | 测试 + 覆盖率（阈值见 `vitest.config.ts`）                  |
| `pnpm typecheck` | 类型检查：库（ES2015）、测试、Vue 2 类型、配置、文档组件    |
| `pnpm lint`      | ESLint                                                      |
| `pnpm format`    | Prettier 格式化                                             |
| `pnpm build`     | 构建产物，并用 publint 与 attw 校验包结构                   |
| `pnpm docs:dev`  | 本地文档，<http://localhost:5173/vuEPG/>                    |
| `pnpm check`     | **提交前必跑**：以上全部检查 + 文档构建                     |
| `pnpm changeset` | 为 npm 包的用户可见改动添加 changeset                       |

## 目录结构与分层

```
src/
├── index.ts          公开入口：默认导出插件、useVuEPG、全部公开类型、Vue 类型增强
├── vue/              Vue 适配层
│   ├── plugin.ts     插件安装：注册指令、$epg、开始监听键盘
│   ├── directives.ts v-epg-item / v-epg-group / v-epg-scroll（唯一区分 Vue 2 / 3 的地方）
│   ├── on-back.ts    onBack：把返回处理函数绑定到组件生命周期
│   ├── api.ts        公开方法的唯一清单
│   └── use-vuepg.ts  useVuEPG 与 VuEPG 类型
└── core/             框架无关的核心（禁止依赖 vue）
    ├── index.ts      core 门面：对上层暴露的全部能力
    ├── focus.ts      焦点状态机：当前焦点、焦点 class、移动
    ├── navigate.ts   方向操作：逐层查找、事件、焦点失效恢复
    ├── navigation.ts 纯几何算法：同一层级内按方向挑选目标
    ├── scroll.ts     与导航组独立的滚动容器与文档视口处理
    ├── tree.ts       从 DOM 推导层级：父组、子节点、入口
    ├── registry.ts   注册表：元素 → 节点
    ├── keyboard.ts   按键映射与 keydown 处理
    ├── back.ts       返回处理函数的登记与调用
    ├── events.ts     派发 epg-* CustomEvent
    ├── nodes.ts      EPGItem / EPGGroup
    ├── config.ts     全局配置
    ├── dom.ts        DOM 工具
    └── logger.ts     日志（唯一允许使用 console 的模块）
test/
├── unit/             纯逻辑测试
├── integration/      挂载真实 Vue 应用的测试
├── types/            类型测试（只做类型检查，不运行）
├── helpers/          布局模拟、按键模拟、Vue 2 / 3 挂载工具
└── docs.test.ts      文档与源码一致性校验
docs/                 VitePress 中英文文档站
examples/tv-training/ Vue 2.7 独立业务示例，Vite + webpack 双开发入口
examples/tv-training/legacy/chrome30/  真实 Chromium 30 Docker 环境与固定下载清单
scripts/             发布、兼容检查与浏览器回归脚本（CI 调用）
```

**依赖方向只能自上而下**：`index.ts` → `vue/` → `core/index.ts` → `core/*`。由 ESLint 强制：

- `src/core/**` 禁止导入 `vue` 与 `src/vue/**`；
- `src/vue/**` 与 `src/index.ts` 只能通过门面 `src/core/index.ts` 使用 core。

## 唯一事实源

同一个事实只存在一处，其余位置引用或由测试校验，禁止复制。

| 事实                         | 唯一来源                           | 引用方式                                              |
| ---------------------------- | ---------------------------------- | ----------------------------------------------------- |
| 版本号、主页、仓库地址       | `package.json`                     | 源码与文档配置直接导入 `package.json`                 |
| 已注册的元素                 | `core/registry.ts`                 | 层级关系不缓存，每次从 DOM 实时推导                   |
| 当前焦点与已应用的焦点 class | `core/focus.ts`                    | 其他模块通过函数读取                                  |
| 按键映射                     | `core/keyboard.ts`                 | 文档通过 `<<< …#default-key-actions` 引用源码         |
| 配置项与默认值               | `core/config.ts`                   | 文档通过 `<<< …#config` 引用源码                      |
| 指令绑定值类型               | `core/nodes.ts`                    | 文档通过 `<<< …#item-options` / `#group-options` 引用 |
| 公开方法清单                 | `vue/api.ts`                       | `docs/api/index.md` 由 `test/docs.test.ts` 双向校验   |
| 导航算法                     | `core/navigation.ts`               | 文档示意图直接调用 `analyzeNearest` 绘制              |
| 工程规范                     | `AGENTS.md`（本文件）              | CONTRIBUTING.md、CLAUDE.md 引用                       |
| Node / pnpm 版本             | `.node-version` / `packageManager` | CI 从这两处读取                                       |

文档中 `// #region` 标记被 `docs/` 引用，重命名或删除前先修改文档；`test/docs.test.ts` 会检查引用是否存在。

## 编码规范

### 通用

- **只用箭头函数**：禁止 `function` 声明与 `function` 表达式（类方法、对象方法简写除外）。
- **类型必须真实**：禁止 `any`；禁止类型断言（`as const` 除外），类型应由校验、类型守卫或类型推导得出；禁止非空断言 `!`。测试代码为构造测试替身可以使用断言。
- 导出的函数必须显式标注返回类型。
- 所有 `if` / 循环必须带花括号；只用 `===`。
- 文件名使用 kebab-case。
- 注释、中文文档、日志与错误信息使用中文；英文文档及其示例文案使用英文，标识符使用英文。错误信息以 `[vuEPG]` 开头。
- 使用者的误用（非法参数、操作不存在的按键事件）直接抛出错误；来自模板、可以降级的问题（非法绑定值）用 `warn()` 警告。

### 库源码（`src/`）的兼容性约束

产物面向老旧机顶盒浏览器与 webpack 4：

- 只使用 ES2015 内置 API（`tsconfig.lib.json` 的 `lib` 为 ES2015，违反会编译失败）。例如用 `indexOf` 代替 `includes`。
- 不使用会引入运行时辅助函数的语法：**对象展开**（改用 `Object.assign`）、**带初始值的类字段**。修改后执行 `pnpm build` 并确认 `dist/index.js` 中没有 `oxc-project` 字样。
- 不直接 `for…of` 遍历 `HTMLCollection` / `NodeList`（老旧浏览器不可迭代），先用 `Array.from()` 转为数组。
- 排序需要确定结果时，显式加入原始顺序作为最后的排序键（老旧浏览器的 `sort` 不稳定）。

### Vue 2 / 3 兼容

- 不使用 vue-demi。只从 `vue` 导入 Vue 2.7 与 Vue 3 共有的 API（生命周期钩子、`version`）。
- 需要区分版本的逻辑只允许出现在 `vue/directives.ts`（指令钩子名）与 `vue/plugin.ts`（`$epg` 的挂载位置）。
- 不读取 vnode 内部结构；组件交互全部通过 DOM 与 `epg-*` CustomEvent 完成。

### 事件

- 所有事件名以 `epg-` 开头，避免与浏览器原生事件冲突；类型集中定义在 `core/events.ts` 的 `EPGEventDetailMap`。
- 事件不冒泡、可取消；方向事件被取消，或处理函数自行移动了焦点时，跳过默认移动。

## 测试规范

- 每个行为改动都要有测试。集成测试写一次，自动在 Vue 3 与 Vue 2.7 上各运行一遍（`vitest.config.ts` 中的两个 project）。
- 覆盖率阈值：行、函数、语句 100%，分支 99%。不要为了覆盖率删除防御性代码，应补充对应场景的测试。
- jsdom 没有布局：用 `test/helpers/layout.ts` 的 `box()` 通过内联样式声明元素坐标；`display: none` 与脱离文档会被视为未渲染。
- 通过 `#mount` 导入挂载工具，不要直接使用 `createApp` / `new Vue`。
- 每个测试结束后会自动卸载应用并调用 `resetCore()`，测试之间不共享状态。
- 公开类型的改动需同步 `test/types/vue3.ts` 与 `test/types/vue2.ts`。

## 文档规范

- 新增、修改、删除公开方法时，同步修改 `docs/api/index.md`（标题格式 `### epg.方法名`），否则 `test/docs.test.ts` 失败。
- 行为变化同步修改对应的指南页面；破坏性变更同步修改 `docs/migration/`。
- 中文与英文文档必须在同一改动中同步：页面、导航、API、示例、兼容步骤和交互组件文案都要覆盖。`docs/en/` 与中文页面使用相同相对路径，README.md 与 README.en.md 同步，两种语言保持完整的页面覆盖与导航入口。
- Agent 负责英文同步、翻译审校以及与代码、链接和导航的一致性检查。新增／删除页面、修改源码引用、调整标题或链接时同步对应语言，并执行页面覆盖与公开 API 校验。
- 接入说明先定义必要术语，再给出可执行的安装命令和配置示例。兼容指南提供依赖转译与运行时 API 补齐的具体步骤，配置与仓库可运行工程一致。
- 迁移入口与跨项目列举统一按 vuEPG 1.x、vue-epg、vue-tv-focusable 排序。
- 导航按阅读任务组织：入门、焦点与导航、输入与集成、开发与调试、参考、迁移。语言和构建工具说明不混入按键或返回操作分组。
- 类型、默认值等可以从源码引用的内容，一律用 `<<< ../../src/…#region` 引用，不要手抄。
- 产品介绍围绕功能、使用条件和接入步骤组织，事实与代码及验证结果一致。Android 4.x 旧设备入口在首页与快速开始中可见。
- API 和接入指南用于应用开发者；测试环境和构建验证放在开发与验证中；SEO、收录与发布操作放在贡献文档，不混入使用导航。
- 示例展示可复用的交互，并说明如何复制与替换页面；不得把示例业务主题写成库的适用业务限制。
- `docs/v1/` 与 `docs/en/v1/` 是 1.x 旧版文档的归档：内容冻结，只做与归档版本实际行为一致的事实修正；它描述的是已不在仓库中的旧代码，因此不引用源码 region，也不参与站内搜索。所有 v1 页面顶部的提示由 `LegacyNotice.vue` 统一渲染，不要在页面内重复添加。
- 文档、交互演示和完整示例以白色／中性色为主体，使用与 Logo 一致的粉色强调主要按钮和焦点；文档演示配色集中维护在 `docs/.vitepress/theme/demo.css`，独立示例使用旧浏览器可执行的 CSS。配色修改同步图例、预览图及两种语言的颜色说明。
- 文档内的交互组件位于 `docs/.vitepress/theme/components/`，直接使用仓库源码（别名 `vuepg`）；文档站平时处于 `pause()` 状态，演示激活时才 `resume()`，见 `composables/use-demo.ts`。

## 业务示例与旧浏览器回归

- 示例额外遵守 [examples/tv-training/AGENTS.md](./examples/tv-training/AGENTS.md)。示例使用库的构建产物，文档站的原理演示直接使用源码。
- 示例保留 Vite 现代浏览器入口与 webpack 旧设备开发入口。旧浏览器验证包含开发客户端、资源加载和更新，不能仅检查业务 bundle。
- `pnpm example:test` 运行现代浏览器场景；`pnpm test:chrome30` 运行 Docker 中真实 Chromium 30 的生产／开发回归。旧浏览器安装使用 `pnpm legacy:install`。
- 固定下载地址与校验值维护于 `examples/tv-training/legacy/chrome30/manifest.json`。浏览器实际版本必须核验，不以修改 UA 代替真实旧浏览器。
- 下载缓存、镜像产物、截图及日志结果不提交；公开兼容范围对应实际平台和测试结果，设备宿主桥与性能另行记录。

## 依赖更新

- 自动升级限制统一维护在 [.github/dependabot.yml](./.github/dependabot.yml)，每项限制注明配套依赖或运行环境依据。精确版本与锁文件保证安装可复现，不能代替 Dependabot 的升级限制。
- Dependabot 的 npm 更新覆盖整个 pnpm workspace，可能统一同名依赖的版本，不能假设忽略 major 就能分别维护不同主版本。同名依赖需要不同兼容分支时，停用该依赖的自动更新，由 Agent 按工程分别核验与升级；不要通过统一版本、降级根工程或升级示例来消除差异。
- 调整兼容分支、配套插件或宿主 Node 要求时，同时复核自动升级限制。解除限制前核对上游声明和实际构建结果；影响示例转译、运行时或开发客户端的更新须通过现代浏览器与真实 Chromium 30 回归。
- 常规依赖与 GitHub Actions 更新继续接收并检查 CI；安全告警单独评估修复方案，不直接将不兼容的主版本升级当作修复。

## 提交与发布

- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)：`feat:`、`fix:`、`docs:`、`test:`、`refactor:`、`chore:` 等。
- 影响 npm 包 `vuepg` 的功能、公开 API／类型、运行行为、兼容性、导出或安装要求的改动，必须附带 changeset：`pnpm changeset`。仅修改独立示例、文档、测试或 CI，且没有改变库的行为与产物契约时，不添加库的 changeset；示例和文档随站点部署更新。
- 合并发布 PR 前核对与上一 npm 版本的实际变化，不能仅因为自动生成了发布 PR 就合并。若 changeset 仅对应上述不需要 npm 发版的内容，移除该 changeset 及其英文说明；没有待发布的库变更时关闭发布 PR。版本号自身的变化不算库的有效改动。
- Agent 同时在 `.changeset/translations/` 添加同名英文说明；发布流程通过 `scripts/prepare-release.ts` 调用 Changesets 生成版本和中文记录，并同步英文更新记录。
- 发布全自动，**不要手动修改 `package.json` 的 `version` 或 `CHANGELOG.md`**：
  1. 带 changeset 的改动合并到 `main` 后，Release 工作流创建或更新「chore: release」PR；
  2. 合并该 PR 后，`scripts/publish.ts` 发布到 npm（可信发布 + provenance）并创建 GitHub Release；
  3. 文档由 Docs 工作流自动部署到 GitHub Pages。

## 完成任务前的检查清单

- [ ] `pnpm check` 全部通过
- [ ] 行为改动有对应测试，Vue 2.7 与 Vue 3 均通过
- [ ] 公开 API 改动已同步 `docs/api/index.md` 与类型测试
- [ ] npm 包的用户可见改动已添加 changeset
