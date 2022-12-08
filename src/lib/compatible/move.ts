import type EPGItem from "../epgItem";
import { dataContainer } from "../service";
import Caculate from "./caculate";

const caculate = new Caculate();
export const getItemByDirectionOld = (
  direction: "up" | "down" | "right" | "left"
): EPGItem | null => {
  let pointer = dataContainer.currentItem,
    pinfo = caculate.infos(dataContainer.currentItem?.el!);
  let ninfo,
    pDvalue: number,
    mDvalue: number,
    pref: EPGItem | null = null,
    min: EPGItem | null = null;
  dataContainer.itemArray.forEach((item) => {
    if (item !== pointer) {
      ninfo = caculate.infos(item.el!);
      const rst = item.el!.getBoundingClientRect();
      let offset = { top: rst.y, left: rst.x };
      if (offset.left < -100 || offset.top < -100) {
        return;
      }

      var rule = caculate.rules(pinfo!, ninfo!, pDvalue, mDvalue, direction);
      pDvalue = rule.pDvalue;
      mDvalue = rule.mDvalue;
      rule.pref && (pref = item);
      rule.min && (min = item);
    }
  });
  if (direction === "left" || direction === "right") {
    return pref;
  } else if (direction === "up" || direction === "down") {
    return pref || min;
  }
  return null;
};
