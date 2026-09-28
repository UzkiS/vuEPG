# EPGItem

`EPGItem` 是可获得焦点的最小单位，用 `v-epg-item` 注册。

```vue
<div v-epg-item>影片</div>
```

## 绑定值

<<< ../../src/core/nodes.ts#item-options{ts}

```vue
<div v-epg-item="{ default: true }">默认焦点</div>
<div v-epg-item="{ disabled: isLocked }">会员专享</div>
<div v-epg-item="{ focusClass: 'card-focus' }">自定义焦点样式</div>
```

| 字段         | 说明                                                             |
| ------------ | ---------------------------------------------------------------- |
| `default`    | 焦点进入所在层级（组或页面顶层）时，优先落在这个元素上           |
| `disabled`   | 禁用：元素保持注册、保持可见，但不会获得焦点；方向键会跳过它     |
| `focusClass` | 获得焦点时加上的 class，覆盖全局 [`focusClass`](./configuration) |

绑定值是响应式的：修改后立即生效，且**不会**影响当前焦点。

## 生命周期

| 时机             | 行为                                                      |
| ---------------- | --------------------------------------------------------- |
| 元素挂载         | 注册，并在元素上写入 `data-epg-item-id`（仅用于调试）     |
| 绑定值或组件更新 | 更新配置；若元素正是当前焦点，重新补上焦点 class          |
| 元素卸载         | 注销；若元素正是当前焦点，焦点被清除（不派发 `epg-blur`） |

元素**被隐藏**（`v-show`、祖先 `display: none`、被 KeepAlive 缓存）时仍保持注册，但不会获得焦点。若当前焦点元素被卸载或隐藏，下一次方向操作会优先在原分组内恢复焦点；原分组不可进入时才回到页面入口。若当前焦点元素后来被禁用，它仍可作为方向移动的起点，但不会再次成为目标。

## 事件

| 事件                                             | 触发时机                               | 可取消 |
| ------------------------------------------------ | -------------------------------------- | ------ |
| `epg-focus`                                      | 获得焦点                               | 否     |
| `epg-blur`                                       | 失去焦点                               | 否     |
| `epg-up` / `epg-down` / `epg-left` / `epg-right` | 焦点在此元素上时按下方向键             | 是     |
| `click`                                          | 焦点在此元素上时按下确定键（原生事件） | —      |

```vue
<div v-epg-item @epg-focus="preview(movie)" @epg-blur="stopPreview" @click="play(movie)">
  {{ movie.title }}
</div>

<!-- 在第一行按 ↑ 时回到搜索框，而不是按默认规则移动 -->
<div v-epg-item @epg-up="$epg.move(searchRef)">...</div>

<!-- 阻止向左移动 -->
<div v-epg-item @epg-left.prevent>...</div>
```

事件的完整说明见 [事件](./events)。
