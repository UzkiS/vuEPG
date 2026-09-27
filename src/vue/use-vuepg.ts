import * as epg from "./api";

/** vuEPG 实例类型 */
export type VuEPG = typeof epg;

/** 获取 vuEPG 实例（全局单例，可在任意位置调用） */
export const useVuEPG = (): VuEPG => epg;
