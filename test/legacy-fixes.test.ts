import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { isVue2 } from "vue-demi";

let plugin: typeof import("../src/index").default;
let EPGGroup: typeof import("../src/lib/epgGroup").default;
let EPGItem: typeof import("../src/lib/epgItem").default;
let service: typeof import("../src/lib/service");
let originalKeydown: typeof document.onkeydown;
const existingKeydown = vi.fn();

const vnode = (el: HTMLElement, events: Record<string, () => void> = {}) => {
  if (isVue2) {
    return { elm: el, data: { on: events } };
  }
  return {
    el,
    props: {
      onEnter: events.enter,
      onRight: events.right,
      onClick: events.click,
    },
  };
};

const item = (el: HTMLElement, events: Record<string, () => void> = {}) =>
  new EPGItem(vnode(el, events), { value: { default: false, class: "" } });

const group = (el: HTMLElement, events: Record<string, () => void> = {}) =>
  new EPGGroup(vnode(el, events), { value: null });

beforeAll(async () => {
  originalKeydown = document.onkeydown;
  document.onkeydown = existingKeydown;
  plugin = (await import("../src/index")).default;
  EPGGroup = (await import("../src/lib/epgGroup")).default;
  EPGItem = (await import("../src/lib/epgItem")).default;
  service = await import("../src/lib/service");
});

afterAll(() => {
  document.onkeydown = originalKeydown;
});

beforeEach(() => {
  document.body.innerHTML = "";
  service.dataContainer.itemArray.length = 0;
  service.dataContainer.groupArray.length = 0;
  service.dataContainer.currentItem = null;
  service.dataContainer.currentGroup = null;
  service.currentConfig.defBackHandler = null;
  existingKeydown.mockClear();
});

describe("1.x 补丁", () => {
  it("保留已有的 document.onkeydown，并响应 Escape 返回", () => {
    expect(document.onkeydown).toBe(existingKeydown);
    const back = vi.fn();
    service.setConfig({ defBackHandler: back });
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
    expect(existingKeydown).toHaveBeenCalledOnce();
    expect(back).toHaveBeenCalledOnce();
  });

  it("保留组和条目的 enter 事件，不覆盖其他事件", () => {
    const enter = vi.fn();
    const right = vi.fn();
    const click = vi.fn();
    const groupNode = group(document.createElement("div"), { enter, right });
    const itemNode = item(document.createElement("div"), { enter, click });
    expect(groupNode.events.enter).toBe(enter);
    expect(groupNode.events.right).toBe(right);
    expect(itemNode.events.enter).toBe(enter);
    expect(itemNode.events.click).toBe(click);
  });

  it("卸载未知分组时不会删掉其他分组", () => {
    const directives: Record<string, Record<string, (el: HTMLElement) => void>> = {};
    plugin.install({
      directive(name: string, hooks: Record<string, (el: HTMLElement) => void>) {
        directives[name] = hooks;
      },
      provide() {},
    });
    const known = group(document.createElement("div"));
    service.registerGroup(known);
    const unknown = document.createElement("div");
    unknown.dataset.epgGroupId = "不存在";
    directives["epg-group"][isVue2 ? "unbind" : "unmounted"](unknown);
    expect(service.getGroups()).toEqual([known]);
  });

  it("空分组不抛错，挂载后新增的子项可以进入", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const parent = group(container);
    service.registerGroup(parent);
    expect(() => service.moveToGroup(parent)).not.toThrow();
    expect(service.getCurrentItem()).toBeNull();

    const childEl = document.createElement("div");
    container.appendChild(childEl);
    const child = item(childEl);
    service.registerItem(child);
    service.moveToGroup(parent);
    expect(service.getCurrentItem()).toBe(child);
  });

  it("方向导航读取分组的新子项", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const parent = group(container);
    service.registerGroup(parent);
    const leftEl = document.createElement("div");
    const rightEl = document.createElement("div");
    container.append(leftEl, rightEl);
    leftEl.getBoundingClientRect = () => new DOMRect(0, 0, 10, 10);
    rightEl.getBoundingClientRect = () => new DOMRect(20, 0, 10, 10);
    leftEl.getClientRects = () => [leftEl.getBoundingClientRect()];
    rightEl.getClientRects = () => [rightEl.getBoundingClientRect()];
    const left = item(leftEl);
    const right = item(rightEl);
    service.registerItem(left);
    service.registerItem(right);
    service.moveToItem(left);
    service.move("right");
    expect(service.getCurrentItem()).toBe(right);
  });

  it("固定定位元素仍可导航，隐藏元素会被跳过", async () => {
    const { isHidden } = await import("../src/lib/utils");
    const fixed = document.createElement("div");
    fixed.style.position = "fixed";
    document.body.appendChild(fixed);
    fixed.getClientRects = () => [new DOMRect(0, 0, 10, 10)];
    expect(fixed.offsetParent).toBeNull();
    expect(isHidden(fixed)).toBe(false);
    fixed.getClientRects = () => [];
    expect(isHidden(fixed)).toBe(true);
  });
});
