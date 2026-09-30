---
layout: home
title: vuEPG · Vue 焦点管理与空间导航，兼顾 Android 4.x 等运营商存量盒子
description: Vue 2.7 / Vue 3 焦点管理与空间导航插件，支持键盘、遥控器及通过 API 接入的控制方式。适用于 TV、IPTV、机顶盒和现代浏览器，兼顾 Android 4.x 等运营商存量盒子。
titleTemplate: false
hero:
  name: vuEPG
  text: 焦点管理与空间导航
  tagline: Vue 2.7 / Vue 3 通用，适用于现代浏览器与 TV、IPTV、机顶盒网页，兼顾 Android 4.x 等运营商存量盒子。已在各大运营商盒子项目中实际落地。
  image:
    src: /logo.svg
    alt: vuEPG
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 旧设备兼容
      link: /guide/legacy-webview
    - theme: alt
      text: 完整示例
      link: /guide/business-example
features:
  - icon: 📺
    title: 现代与旧设备都能接入
    details: 支持现代浏览器，也提供 Android 4.x、WebView 30 等运营商存量盒子的兼容路径；附带完整工程、ES5 构建与真机开发入口。
  - icon: 🧭
    title: 空间导航
    details: 按元素在屏幕上的真实位置选择下一个焦点，布局变化时无需维护上下左右关系表。
  - icon: 🪶
    title: Vue 2.7 / Vue 3 通用
    details: Vue 2.7 / Vue 3 使用相同 API，在已有元素上添加指令即可；零运行时依赖，附带 TypeScript 类型。
  - icon: 🔌
    title: 键盘、遥控器与其他输入
    details: 内置键盘和遥控器映射，也可通过 API 接入手柄、虚拟遥控器或原生按键回调。
  - icon: 🗂️
    title: 分组与默认焦点
    details: 按菜单、内容区和弹窗组织导航区域，组内优先，支持默认入口与方向边界拦截。
  - icon: 📜
    title: 自动滚动与焦点恢复
    details: 焦点超出滚动容器时保持可见；目标隐藏或卸载后，下一次导航在可用分组恢复。
---

## 附带完整示例工程

仓库附带一个可独立安装、运行和复制的 Vue 2.7 工程，包含 Vite / webpack 双开发入口、ES5 构建、必要 polyfill 和真实 Chromium 30 自动回归。复制后替换页面与数据，即可开始自己的 TV / IPTV 应用开发，省去从零搭建低版本机顶盒工程的配置工作。

<BusinessExample />

完整示例展示循环导航、滚动、页面位置恢复、弹窗和 Android 原生按键接入。可以直接复制示例工程，保留自己的界面和业务；交互规则见[导航演示](./guide/playground)，旧设备配置见 [Android 4.x 接入](./guide/legacy-webview)。

## 支持项目 {#support}

<SupportProject />
