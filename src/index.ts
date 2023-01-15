/* eslint-disable */
import { dataContainer, epgService } from "./lib/service";
import EPGItem from "./lib/epgItem";
import EPGGroup from "./lib/epgGroup";
import { isVue2, type DirectiveHook, type FunctionDirective } from "vue-demi";
import { PACKAGE_VERSION } from "./config/version";

const _directive = (
  beforeMount: FunctionDirective,
  mounted: FunctionDirective,
  updated: FunctionDirective,
  unmounted: FunctionDirective
) => {
  let obj = {};
  if (isVue2) {
    obj = {
      bind: beforeMount,
      inserted: mounted,
      componentUpdated: updated,
      unbind: unmounted,
    };
  } else {
    obj = {
      beforeMount: beforeMount,
      mounted: mounted,
      updated: updated,
      unmounted: unmounted,
    };
  }
  return obj;
};

export default {
  install(app: any) {
    let compatibleFlag = false;
    const groupBeforeMount: DirectiveHook<HTMLElement> = (
      el,
      binding,
      vnode
    ) => {};
    const groupMounted: DirectiveHook<HTMLElement> = (el, binding, vnode) => {
      let group = new EPGGroup(vnode, binding);
      epgService.registerGroup(group);
    };
    const groupUpdated: DirectiveHook<HTMLElement> = (el, binding, vnode) => {
      let item = new EPGGroup(vnode, binding);
      epgService.updateGroup(item);
    };
    const groupUnmount: DirectiveHook<HTMLElement> = (el, binding, vnode) => {
      const index = dataContainer.groupArray.findIndex(
        (item: EPGGroup) => item.id === el.dataset["groupId"]
      );
      dataContainer.groupArray.splice(index, 1);
    };
    const compatibleGroupBeforeMounted: DirectiveHook<HTMLElement> = (
      el,
      binding,
      vnode,
      prevVNode
    ) => {
      if (!compatibleFlag) {
        console.warn(
          "v-items/v-groups are reserved for vue-epg compatibility only, please use v-epg-item/v-epg-group instead."
        );
        compatibleFlag = true;
      }
      groupBeforeMount(el, binding, vnode, prevVNode);
    };
    /** 对 vue-epg 的兼容，不建议使用 */
    app.directive(
      "groups",
      _directive(
        compatibleGroupBeforeMounted,
        groupMounted,
        groupUpdated,
        groupUnmount
      )
    );
    app.directive(
      "epg-group",
      _directive(groupBeforeMount, groupMounted, groupUpdated, groupUnmount)
    );
    const itemBeforeMount: DirectiveHook<HTMLElement> = (
      el,
      binding,
      vnode
    ) => {};
    const itemMounted: DirectiveHook<HTMLElement> = (el, binding, vnode) => {
      let item = new EPGItem(vnode, binding);
      epgService.registerItem(item);
    };
    const itemsUpdated: DirectiveHook<HTMLElement> = (el, binding, vnode) => {
      let item = new EPGItem(vnode, binding);
      epgService.updateItem(item);
    };
    const itemUnmounted: DirectiveHook<HTMLElement> = (el, binding, vnode) => {
      const index = dataContainer.itemArray.findIndex(
        (item: EPGItem) => item.id === el.dataset.id
      );
      dataContainer.itemArray.splice(index, 1);
    };
    const compatibleItemBeforeMount: DirectiveHook<HTMLElement> = (
      el,
      binding,
      vnode,
      prevVNode
    ) => {
      if (!compatibleFlag) {
        console.warn(
          "v-items/v-groups are reserved for vue-epg compatibility only, please use v-epg-item/v-epg-group instead."
        );
        compatibleFlag = true;
      }
      itemBeforeMount(el, binding, vnode, prevVNode);
    };
    /** 对 vue-epg 的兼容，不建议使用 */
    app.directive(
      "items",
      _directive(
        compatibleItemBeforeMount,
        itemMounted,
        itemsUpdated,
        itemUnmounted
      )
    );
    app.directive(
      "epg-item",
      _directive(itemBeforeMount, itemMounted, itemsUpdated, itemUnmounted)
    );
    if (!isVue2) {
      app.provide("epg", epgService);
    }
    console.log(
      "\n %c vuEPG loaded " +
        PACKAGE_VERSION +
        " %c https://github.com/LemoFire/vuEPG \n",
      "color: white; background: pink; padding:5px 0;",
      "background: skyblue; padding:5px 0;"
    );
  },
};

export const useVuEPG = () => {
  return epgService;
};
