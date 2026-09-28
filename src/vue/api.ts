/**
 * vuEPG 公开方法的唯一清单。
 * `useVuEPG()` / `$epg` 返回的就是本模块的命名空间对象；
 * 文档 `docs/api/index.md` 与之逐项对应，并由测试双向校验。
 */
export {
  // 移动
  move,
  navigate,
  up,
  down,
  left,
  right,
  moveToItem,
  moveToGroup,
  findTarget,
  // 返回
  back,
  // 暂停
  pause,
  resume,
  isPaused,
  // 配置
  setConfig,
  getConfig,
  // 查询
  getCurrentItem,
  getCurrentGroup,
  getFocusClass,
  getItems,
  getGroups,
  getNodeByElement,
  getParentGroup,
  getChildren,
  getItemsInGroup,
  isEPGItem,
  isEPGGroup,
  // 按键
  getKeyActions,
  setKeyAction,
  updateKeyAction,
  removeKeyAction,
  addKeyCodes,
  removeKeyCodes,
} from "../core";
export { onBack } from "./on-back";
