/** 测试用组件定义：Vue 2 与 Vue 3 通用的最小子集 */
export interface TestComponent {
  template: string;
  setup?: () => object;
  components?: Record<string, TestComponent>;
  created?: () => void;
}

/** 已挂载的测试应用 */
export interface Mounted {
  /** 根元素 */
  readonly root: Element;
  unmount: () => void;
}
