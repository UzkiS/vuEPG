# 移动规则

按下方向键时，vuEPG 根据元素在屏幕上的**实际位置**选出下一个焦点。整个过程可以概括为两句话：

1. **先在同一层级里挑**：同一个分组内，按“方向 → 重叠 → 最近”三步挑出目标；
2. **挑不到就往外走一层**：把整个分组当作一个元素，到外层继续挑。

本页的示意图都由 vuEPG 真实的导航算法实时计算，点击图下方的步骤按钮，可以逐步查看每一步保留和排除了哪些元素。

<div class="legend">
  <span><i class="origin"></i>当前焦点 O</span>
  <span><i class="idle"></i>候选</span>
  <span><i class="pool"></i>参与比较</span>
  <span><i class="chosen"></i>目标</span>
  <span><i class="excluded"></i>已排除</span>
</div>

## 同一层级：三步挑选

### ① 只看这个方向上的元素

按 ↓ 时只考虑位于 O 下方的元素，按 → 时只考虑位于 O 右方的元素，其余全部排除。

<NavigationDiagram scenario="basic" />

::: tip 试一试
点击右下角的方向按钮切换方向。注意斜向的 **E**：按 ↓ 或 → 时它虽然在这个方向上，但最终没有被选中，原因见下一步。
:::

### ② 优先同一行 / 同一列

在该方向的元素中，**与 O 有重叠**的优先：上下移动时看左右方向是否重叠，左右移动时看上下方向是否重叠。图中的阴影带就是 O 的覆盖范围。

<NavigationDiagram scenario="overlap" />

**X** 离 O 更近，但它在斜下方，与 O 没有重叠；**Y** 虽然更远，但与 O 在同一列，所以选 Y。这符合遥控器的直觉：按 ↓ 应该落在正下方，而不是斜下方。

### ③ 没有重叠时，只看完全越过的元素

如果该方向上没有任何元素与 O 重叠，就只考虑**完全位于 O 那一侧**的元素（按 ↓ 时，上边缘要低于 O 的下边缘）。

<NavigationDiagram scenario="beyond" />

**U** 与 O 在同一高度，不在下方，第①步就被排除；**S** 与 O 上下交叠，并不“完全在下方”，第②步被排除；只剩 **T**。

### ④ 最后选最近的

在剩下的元素中，选**距离最近**的：按 ↓ 时比较上边缘，按 ↑ 时比较下边缘，按 ← → 时同理比较左右边缘。

距离相同时，选与 O **更对齐**的：上下移动时比较左边缘，左右移动时比较上边缘。仍然相同时，选文档中靠前的。

<NavigationDiagram scenario="tie" />

**L** 和 **R** 的上边缘在同一高度，距离相同；**R** 几乎正对着 O，更对齐，所以选 R。

### 边缘相接不算重叠

判断重叠时，O 两侧各向内收缩 5%，避免只是边缘碰到一点的元素被当作“同一列”。

<NavigationDiagram scenario="tolerance" />

**P** 与 O 只重叠了 3 像素，没有超过收缩范围，不算重叠；**Q** 在阴影带内，所以选 Q。

## 跨层级：逐层向外

在分组内挑不到目标时，vuEPG 会把**整个分组当作一个元素**，在外一层继续按上面的三步挑选。挑中的如果是一个分组，就**进入**这个分组。

<HierarchyDemo />

试试下面几种操作，对照右侧的事件日志：

| 操作            | 过程                                                                      | 结果 |
| --------------- | ------------------------------------------------------------------------- | ---- |
| 焦点在 A1，按 → | 分组 A 内右侧没有元素 → 以整个分组 A 为起点 → 右侧找到分组 B → 进入分组 B | B2   |
| 焦点在 B1，按 ← | 分组 B 内左侧没有元素 → 以整个分组 B 为起点 → 左侧找到分组 A → 进入分组 A | A1   |
| 焦点在 A1，按 ↑ | 分组 A 内上方没有元素 → 外层也没有 → 保持不动                             | A1   |
| 焦点在 B2，按 ↓ | 分组 B 内下方最近的是 B4                                                  | B4   |

注意第一行：从 A1 按 → 落在 **B2** 而不是几何上更近的 B1，因为 B2 是分组 B 的**默认焦点**（★）。

## 进入分组时落在哪里

按以下顺序查找第一个可以获得焦点的元素：

1. 带 `default` 的子节点；
2. 其余子节点，按文档顺序；
3. 子节点是分组时，递归进入该分组，规则相同。

## 哪些元素会被跳过

| 节点     | 可以成为目标的条件                                               |
| -------- | ---------------------------------------------------------------- |
| EPGItem  | 未禁用，且已渲染（自身和祖先都不是 `display: none`，且在文档中） |
| EPGGroup | 未禁用、已渲染，且组内至少有一个可以获得焦点的元素               |

`visibility: hidden` 与 `position: fixed` 的元素视为已渲染。

## 没有焦点或焦点失效时

以下情况按下方向键，焦点会落在**页面入口**，也就是对整个页面套用“进入分组”的规则：

- 页面上还没有任何焦点；
- 当前焦点已被卸载、隐藏或禁用（例如切换了 KeepAlive 页面）。

## 源码

规则与源码逐条对应，并由单元测试覆盖：

- 同一层级的挑选：[`src/core/navigation.ts`](https://github.com/UzkiS/vuEPG/blob/main/src/core/navigation.ts)
- 逐层向外与进入分组：[`src/core/focus.ts`](https://github.com/UzkiS/vuEPG/blob/main/src/core/focus.ts)、[`src/core/tree.ts`](https://github.com/UzkiS/vuEPG/blob/main/src/core/tree.ts)

<style>
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin: 16px 0;
  font-size: 14px;
}
.legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.legend i {
  display: inline-block;
  width: 16px;
  height: 12px;
  border: 2px solid;
  border-radius: 3px;
}
.legend .origin { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }
.legend .idle { background: var(--vp-c-default-soft); border-color: var(--vp-c-default-1); }
.legend .pool { background: rgba(245, 158, 11, 0.16); border-color: #f59e0b; }
.legend .chosen { background: var(--vp-c-success-soft); border-color: var(--vp-c-success-1); }
.legend .excluded { border-style: dashed; border-color: var(--vp-c-text-3); opacity: 0.5; }
</style>
