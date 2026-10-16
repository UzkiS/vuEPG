# 遥控学习中心

一个可直接复制为新项目的 Vue 2.7 TV 网页工程，使用 vuEPG 管理遥控器焦点。数据和原生按键都是模拟的，不需要后端服务。

## 独立使用

复制本目录到自己的项目位置，在该目录中执行：

```sh
pnpm install
pnpm dev       # Vite，现代浏览器快速开发
pnpm dev:tv    # webpack + Babel，旧机顶盒开发
pnpm build     # ES5 兼容应用
pnpm preview   # 查看实际生产产物
```

Node 版本见 .node-version，pnpm 版本见 package.json 的 packageManager。独立安装从 npm 获取 vuepg，不需要库源码或父目录。安装生成的锁文件应随自己的项目提交。

## 开发和检查

| 命令                  | 用途                                    |
| --------------------- | --------------------------------------- |
| `pnpm dev`            | Vite，现代浏览器，端口 5175             |
| `pnpm dev:tv`         | webpack + Babel，旧盒子开发，端口 5174  |
| `pnpm build`          | 生产兼容构建，目标见 build-settings.cjs |
| `pnpm preview`        | 静态产物预览，端口 4174                 |
| `pnpm check`          | 类型、两个构建入口与最终产物语法检查    |
| `pnpm test:browser`   | 现代浏览器中的业务与两个开发入口检查    |
| `pnpm legacy:install` | 安装 Docker 内的真实 Chromium 30        |
| `pnpm test:chrome30`  | 真实旧浏览器生产、开发与热更新回归      |
| `pnpm legacy:clean`   | 清理本项目旧浏览器缓存、镜像和结果      |

两个入口共用同一业务代码。Vite 的原生 ESM 开发服务器无法在 Chromium 30 中运行，旧设备开发使用 webpack 入口。首次浏览器场景检查执行 `pnpm exec playwright install chromium`。旧浏览器检查需要可用 Docker，安装与故障排查见 [legacy/chrome30/README.md](./legacy/chrome30/README.md)。

## 业务场景

首页 → 十二站探索地图 → 模拟练习 → 完成弹窗，另有退出弹窗。覆盖循环导航、自动滚动、业务位置记忆、内容筛选、焦点失效恢复和返回处理。

顶部「文档」「GitHub」在新窗口打开项目说明和源码，链接从所安装 vuepg 包的信息读取。自己的项目可以删除这些入口。

卡片轨道的首尾留白计入实际内容宽度，为向外扩出的焦点描边预留空间；修改卡片尺寸或样式时，同时检查首项、末项和缩放后的裁剪边界。

原生 Mock 使用 window 上的 `vuepg-native-key` CustomEvent，detail 为 `{ keyCode: number }`。接入实际宿主时可把按键回调连接到 src/bridge.ts，核对宿主协议与重复输入。

升级 vuepg 或 Vue 时，先阅读对应版本的更新日志和迁移说明，再调整应用与测试。

## 兼容范围

本示例通过 core-js 补齐 JavaScript 内置 API，单独补齐 CustomEvent；`whatwg-fetch` 只供 webpack 热更新使用。webpack 转译业务、依赖和开发客户端。已验证的组合是 Chromium 30、Vue 2.7、ES5 构建和必要 polyfill；Android 4.x 机顶盒的内核与宿主各不相同，请在目标设备上确认。

真实 Chromium 30 自动回归覆盖生产与 webpack 开发入口、页面操作及热更新；运营商设备的原生桥与性能另行验证。文档见 [vuEPG 兼容指南](https://uzkis.github.io/vuEPG/guide/legacy-webview)。
