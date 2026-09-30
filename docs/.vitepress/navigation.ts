import type { DefaultTheme } from "vitepress";
import { version } from "../../package.json";

// 页面路径在两种语言间共享，避免入口和分组遗漏。
const groups = [
  {
    titles: ["开始", "Getting started"],
    items: [
      ["介绍", "Introduction", "guide/introduction"],
      ["快速开始", "Getting started", "guide/getting-started"],
      ["导航演示", "Navigation demo", "guide/playground"],
      ["完整示例", "Complete example", "guide/business-example"],
      ["常见问题", "FAQ", "guide/faq"],
    ],
  },
  {
    titles: ["焦点与导航", "Focus and navigation"],
    items: [
      ["焦点项", "Focus items", "guide/epg-item"],
      ["分组", "Groups", "guide/epg-group"],
      ["事件", "Events", "guide/events"],
      ["移动规则", "Navigation rules", "guide/navigation"],
      ["自动滚动", "Automatic scrolling", "guide/scrolling"],
    ],
  },
  {
    titles: ["输入与集成", "Input and integration"],
    items: [
      ["配置", "Configuration", "guide/configuration"],
      ["按键映射", "Key mappings", "guide/key-actions"],
      ["返回处理", "Back handling", "guide/back"],
      [
        "旧设备兼容（含 Android 4.x）",
        "Legacy devices, including Android 4.x",
        "guide/legacy-webview",
      ],
      ["原生按键接入", "Native input", "guide/native-bridge"],
    ],
  },
  {
    titles: ["开发与调试", "Development and debugging"],
    items: [
      ["TypeScript 接入", "TypeScript integration", "guide/typescript"],
      ["性能", "Performance", "guide/performance"],
      ["Chromium 30 自动回归", "Chromium 30 regression", "guide/chromium30-testing"],
    ],
  },
  {
    titles: ["参考", "Reference"],
    items: [
      ["API", "API", "api/"],
      ["更新日志", "Changelog", "changelog"],
    ],
  },
  {
    titles: ["迁移", "Migration"],
    items: [
      ["选择迁移指南", "Choose a migration guide", "migration/"],
      ["从 1.x 升级", "Upgrade from 1.x", "migration/v1"],
      ["从 vue-epg 迁移", "Migrate from vue-epg", "migration/vue-epg"],
      ["从 vue-tv-focusable 迁移", "Migrate from vue-tv-focusable", "migration/tv-focusable"],
    ],
  },
] as const;
const archive = [
  ["什么是 vuEPG", "What is vuEPG?", "introduction"],
  ["快速开始", "Getting started", "getting-started"],
  ["vue-epg 差异", "Differences from vue-epg", "difference"],
  ["配置 EPG", "Configuration", "configuration"],
  ["按键事件", "Key actions", "key-action"],
  ["返回回调", "Back callbacks", "back-callback"],
  ["EPGItem", "EPGItem", "epg-item"],
  ["EPGGroup", "EPGGroup", "epg-group"],
  ["移动规则", "Navigation rules", "move-rule"],
  ["API", "API", "api"],
] as const;

export const sidebar = (english: boolean): DefaultTheme.Sidebar => {
  const prefix = english ? "/en/" : "/";
  const index = english ? 1 : 0;
  return {
    [`${prefix}v1/`]: [
      {
        text: english ? "Archived 1.x documentation" : "1.x 归档文档",
        items: archive.map((item) => ({ text: item[index], link: `${prefix}v1/${item[2]}` })),
      },
      {
        text: english ? "Upgrade" : "升级",
        items: [{ text: english ? "Upgrade to 2.x" : "升级到 2.x", link: `${prefix}migration/v1` }],
      },
    ],
    [prefix]: groups.map((group) => ({
      text: group.titles[index],
      items: group.items.map((item) => ({ text: item[index], link: prefix + item[2] })),
    })),
  };
};

export const nav = (english: boolean): DefaultTheme.NavItem[] => {
  const prefix = english ? "/en/" : "/";
  return [
    {
      text: english ? "Guide" : "指南",
      link: `${prefix}guide/introduction`,
      activeMatch: `${prefix}guide/`,
    },
    { text: "API", link: `${prefix}api/`, activeMatch: `${prefix}api/` },
    { text: english ? "Example" : "完整示例", link: `${prefix}guide/business-example` },
    { text: english ? "Legacy devices" : "旧设备兼容", link: `${prefix}guide/legacy-webview` },
    {
      text: `v${version}`,
      items: [
        { text: english ? "Changelog" : "更新日志", link: `${prefix}changelog` },
        { text: english ? "Migration guides" : "迁移指南", link: `${prefix}migration/` },
        { text: english ? "1.x archive" : "1.x 归档文档", link: `${prefix}v1/introduction` },
      ],
    },
  ];
};
