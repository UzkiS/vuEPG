---
layout: home

hero:
  name: vuEPG
  text: 大屏焦点管理
  tagline: 为 TV、IPTV、机顶盒网页打造的遥控器焦点管理与空间导航插件，Vue 2.7 / Vue 3 通用
  image:
    src: /logo.svg
    alt: vuEPG
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在线演示
      link: /guide/playground
    - theme: alt
      text: GitHub
      link: https://github.com/UzkiS/vuEPG

features:
  - icon: 🧭
    title: 空间导航
    details: 按元素的真实位置计算方向键的下一个焦点，无需手写上下左右的跳转关系。
  - icon: 🗂️
    title: 分组与层级
    details: 用 v-epg-group 组织菜单、列表、弹窗，组内优先、逐层向外查找，并支持默认焦点。
  - icon: 🔌
    title: Vue 2.7 / Vue 3
    details: 同一套代码、同一套 API，两个版本在 CI 中分别运行完整测试。
  - icon: 🎛️
    title: 按键可定制
    details: 内置方向、确定、返回等映射，兼容常见机顶盒键值，可随时增删改。
  - icon: 🧩
    title: 原生 DOM 事件
    details: epg-focus / epg-blur / epg-enter / epg-leave / 方向事件都是标准 CustomEvent，用 .prevent 即可拦截默认移动。
  - icon: 🪶
    title: 零依赖 · TypeScript
    details: 无运行时依赖，产物兼容 ES2015 与 webpack 4，完整类型与中文注释。
---
