---
title: Chromium 30 回归测试
description: 安装和运行 Docker 中的 Chromium 30 回归测试，检查 Vue 2.7 应用的生产构建、webpack 开发入口、导航、滚动与弹窗，查看日志和截图。
---

# Chromium 30 回归测试

回归测试使用 Docker 内的 Chromium 30、ChromeDriver 和 Xvfb，检查 Vue 2.7 示例的生产构建与 webpack 开发入口。浏览器版本在安装和创建测试会话时校验。

## 环境要求

- Node 与 pnpm：使用工程声明的版本。
- Docker：服务已启动，能够运行 `linux/amd64` 容器。
- 网络：首次安装需下载浏览器、驱动和镜像依赖。
- 端口：开发测试使用 `5174`、`5175`，保持可用。

浏览器、驱动、系统库、字体和 Xvfb 由安装脚本配置。Apple Silicon 使用 amd64 模拟运行。

## 安装与运行

在 vuEPG 仓库根目录执行：

```sh
pnpm install
pnpm legacy:install
pnpm test:chrome30
```

独立使用完整示例时，在示例目录运行同名命令。

`legacy:install` 下载并校验存档，构建固定环境镜像；`test:chrome30` 构建应用后运行测试。成功时返回退出码 `0`，断言失败时返回非零退出码，并保留日志和截图。测试结束后释放所启动的容器和开发服务。

## 测试内容

| 项目          | 检查内容                                         |
| ------------- | ------------------------------------------------ |
| 应用启动      | ES5 应用、polyfill 与默认焦点                    |
| 按键          | 方向移动、确定点击、返回处理                     |
| 导航          | 首尾循环、页面位置恢复                           |
| 弹窗          | 方向边界、返回优先级、关闭复焦、原目标失效时回退 |
| 动态内容      | 隐藏、Vue 卸载、元素离开文档后的焦点恢复         |
| 滚动          | 切换到视口外元素后的滚动位置                     |
| 开发更新      | webpack 页面启动、CSS 热更新及焦点保持           |
| Vite 开发入口 | HTML 加载成功，模块脚本存在，应用未挂载          |

Vite 对照用于检查旧浏览器的开发入口表现；应用正常运行的流程由生产入口和 webpack 开发入口验证。

## 测试结果

仓库结果写入 `examples/tv-training/legacy-results/`；独立工程结果写入自身的 `legacy-results/`。每次测试建立独立子目录。

| 文件                                          | 内容                                          |
| --------------------------------------------- | --------------------------------------------- |
| `report.json`                                 | 测试状态、浏览器与驱动版本、包版本、产物 hash |
| `assertions.json`                             | 各项断言结果                                  |
| `production*.png`、`webpack-development*.png` | 页面、滚动与弹窗截图                          |
| `vite-development.png`                        | Vite 开发入口截图                             |
| `*-browser.json`                              | 浏览器控制台与资源错误                        |
| `chromedriver.log`、`xvfb.log`、`server.log`  | 驱动、图形环境与资源服务日志                  |
| `failure.txt`、`failure.png`                  | 失败原因及页面状态                            |

CI 执行相同命令，结果上传为 `chrome30-results` artifact。

## 固定环境

浏览器、驱动、基础镜像和下载校验值维护在 [manifest.json](https://github.com/UzkiS/vuEPG/blob/main/examples/tv-training/legacy/chrome30/manifest.json)。Dockerfile 固定直接系统依赖版本，并提供 Chromium 所需的兼容库。ChromeDriver 2.8 的官方支持范围为 [Chrome 30–33](https://chromedriver.storage.googleapis.com/2.8/notes.txt)。

下载缓存位于工程的 `.cache/legacy/`，安装时检查 SHA-256。缓存和测试结果已列入忽略文件。

清理工程的浏览器缓存、结果及对应容器和镜像：

```sh
pnpm legacy:clean
```

## 故障排查

| 问题             | 检查项                                                      |
| ---------------- | ----------------------------------------------------------- |
| Docker 连接失败  | Docker 服务与 `docker info` 执行权限                        |
| 下载或校验失败   | 网络、存档地址及 manifest 中的 SHA-256                      |
| 容器无法执行     | Docker 的 amd64 支持；Apple Silicon 的模拟配置              |
| 系统依赖安装失败 | Docker 构建日志与固定依赖版本                               |
| 开发入口无法访问 | 端口、防火墙及 `host.docker.internal`；服务应监听 `0.0.0.0` |
| 浏览器启动失败   | `chromedriver.log`、`xvfb.log` 与依赖库                     |
| 开发更新失败     | WebSocket 连接与 fetch polyfill                             |

生产页面由容器内静态服务提供。开发页面通过 Docker Desktop 的 `host.docker.internal` 访问；Linux Docker Engine 使用 `host-gateway`。

## 平台记录

| 宿主环境                                    | 状态                              |
| ------------------------------------------- | --------------------------------- |
| WSL2 / Ubuntu 24.04 + Docker Desktop，amd64 | 已通过回归                        |
| Linux Docker Engine，amd64                  | CI 已配置                         |
| Windows / macOS + Docker Desktop            | 共用 Linux 镜像，宿主运行尚未验证 |
| Apple Silicon                               | 使用 `linux/amd64` 模拟，尚未验证 |

测试覆盖桌面浏览器行为。机顶盒的宿主按键协议、资源加载与性能检查见 [Android 4.x 接入](./legacy-webview#复现与检查)。
