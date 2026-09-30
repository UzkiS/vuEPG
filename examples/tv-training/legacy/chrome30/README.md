# Chromium 30 自动回归环境

宿主只需要本项目声明的 Node / pnpm 和 Linux 容器模式的 Docker。

```sh
pnpm install
pnpm legacy:install
pnpm test:chrome30
pnpm legacy:clean
```

浏览器为真实历史 Chromium 30.0.1584.0，驱动是 ChromeDriver 2.8.240825。图形环境使用 Xvfb，自动驱动使用 JSON Wire Protocol。固定来源、版本和 SHA-256 见 manifest.json；Dockerfile 使用固定基础镜像 digest 与直接系统依赖版本。

`legacy:install` 下载并校验存档、构建 `linux/amd64` 镜像、核验浏览器和驱动。`test:chrome30` 使用当前安装的 vuepg 包构建 Vue 2.7 应用，自动回归生产与 webpack 开发入口，并确认 Vite 的原生 ESM 入口不会挂载应用。所有断言、日志、截图和包 hash 写入 legacy-results。正常及失败退出都会释放本次容器与开发进程。

清理仅针对项目标记的容器、vuepg/chrome30 镜像、本地下载缓存与测试结果。Docker 自身共享的基础镜像和构建缓存由 Docker 管理，不在该命令中全局清理。

WSL2 / Ubuntu 24.04 + Docker Desktop amd64 已实际验证。其他宿主使用相同平台镜像，Windows / macOS 及 Apple Silicon 的实际结果另行记录；Apple Silicon 需要 amd64 模拟支持。桌面 Chromium 回归不等同于运营商设备桥协议与性能验证。

安装、输出和故障排查见 [Chromium 30 回归测试](https://uzkis.github.io/vuEPG/guide/chromium30-testing)。
