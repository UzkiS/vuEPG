# 在线演示

下面是一个模拟 TV 首页的演示，运行的就是本仓库的源码。

- **点击**演示区域激活，之后用**方向键**移动、**Enter** 确定、**Esc / Backspace** 退出；
- 手机上可以使用演示下方的虚拟遥控器；
- 下方日志实时显示 `epg-focus`、`epg-enter`、`epg-leave`、`click` 事件。

<EpgPlayground />

## 这个演示是怎么写的

整个页面只用了三个分组：

```vue
<header v-epg-group @epg-enter="onEnter" @epg-leave="onLeave">
  <button v-for="tab in tabs" v-epg-item @epg-focus="onFocus">{{ tab }}</button>
</header>

<aside v-epg-group @epg-enter="onEnter" @epg-leave="onLeave">
  <button v-for="item in menu" v-epg-item @epg-focus="onFocus">{{ item }}</button>
</aside>

<main v-epg-group="{ default: true }" @epg-enter="onEnter" @epg-leave="onLeave">
  <button
    v-for="(card, index) in cards"
    v-epg-item="{ default: index === 0 }"
    @epg-focus="onFocus"
  >
    {{ card.title }}
  </button>
</main>
```

值得留意的几点：

- 从左侧菜单按 **→** 进入内容区时，焦点落在 `default` 卡片上，而不是几何上最近的卡片；
- 从内容区第一行按 **↑** 会离开 `内容` 组、进入 `顶栏` 组，日志中能看到 `epg-leave` 与 `epg-enter`；
- 虚拟遥控器调用 `epg.navigate(direction)`，与实体方向键触发相同的方向事件和边界拦截；
- 文档站平时调用了 `epg.pause()`，只有演示激活时才 `resume()`，所以不会影响你正常浏览文档。完整源码见 [EpgPlayground.vue](https://github.com/UzkiS/vuEPG/blob/main/docs/.vitepress/theme/components/EpgPlayground.vue)。
