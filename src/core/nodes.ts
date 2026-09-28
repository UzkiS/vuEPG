// #region item-options
/** `v-epg-item` 的绑定值 */
export interface EPGItemOptions {
  /** 所在层级被进入时，优先获得焦点 */
  default?: boolean;
  /** 禁用：保持注册与可见，但不会获得焦点（已获得焦点时仍可作为移动的起点） */
  disabled?: boolean;
  /** 获得焦点时使用的 class，覆盖全局 `focusClass` */
  focusClass?: string;
}
// #endregion item-options

// #region group-options
/** 分组内元素获得焦点时的滚动方式 */
export type ScrollMode = "nearest" | "start" | "center";

/** `v-epg-group` 的绑定值 */
export interface EPGGroupOptions {
  /** 所在层级被进入时，优先进入该组 */
  default?: boolean;
  /** 禁用：导航时整组被跳过 */
  disabled?: boolean;
  /**
   * 该分组元素是滚动容器：组内元素获得焦点时，滚动分组让它可见。
   * - `"nearest"`（即 `true`）：只在元素超出可视区域时滚动最小距离
   * - `"start"`：元素对齐到可视区域的起始边
   * - `"center"`：元素居中
   */
  scroll?: boolean | ScrollMode;
}
// #endregion group-options

let seed = 0;

abstract class BaseNode<Options extends EPGItemOptions | EPGGroupOptions> {
  /** 节点唯一 ID，同时写入元素的 `data-epg-*-id` 属性，便于调试 */
  readonly id: string;
  /** 节点对应的 DOM 元素 */
  readonly el: HTMLElement;
  private currentOptions: Readonly<Options>;

  protected constructor(el: HTMLElement, options: Readonly<Options>, prefix: string) {
    seed += 1;
    this.id = `${prefix}-${String(seed)}`;
    this.el = el;
    this.currentOptions = options;
  }

  /** 当前绑定值 */
  get options(): Readonly<Options> {
    return this.currentOptions;
  }

  /** 是否为所在层级的默认焦点 */
  get isDefault(): boolean {
    return this.currentOptions.default === true;
  }

  /** 是否被禁用 */
  get isDisabled(): boolean {
    return this.currentOptions.disabled === true;
  }

  /** 元素的视口坐标 */
  getRect(): DOMRect {
    return this.el.getBoundingClientRect();
  }

  /** @internal 由指令在更新时调用 */
  setOptions(options: Readonly<Options>): void {
    this.currentOptions = options;
  }
}

/** 可获得焦点的最小单位，由 `v-epg-item` 注册 */
export class EPGItem extends BaseNode<EPGItemOptions> {
  /** @internal 由注册表创建 */
  constructor(el: HTMLElement, options: Readonly<EPGItemOptions>) {
    super(el, options, "epg-item");
  }

  /** 该元素自定义的焦点 class */
  get focusClass(): string | undefined {
    return this.options.focusClass;
  }
}

/** 焦点的分组容器，由 `v-epg-group` 注册 */
export class EPGGroup extends BaseNode<EPGGroupOptions> {
  /** @internal 由注册表创建 */
  constructor(el: HTMLElement, options: Readonly<EPGGroupOptions>) {
    super(el, options, "epg-group");
  }

  /** 滚动方式；未开启滚动时为 `null` */
  get scrollMode(): ScrollMode | null {
    const { scroll } = this.options;
    if (scroll === true) {
      return "nearest";
    }
    return scroll === undefined || scroll === false ? null : scroll;
  }
}

/** 已注册的节点 */
export type EPGNode = EPGItem | EPGGroup;
