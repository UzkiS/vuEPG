import { selfLog } from "../utils";

type Infos = {
  left: number;
  right: number;
  up: number;
  down: number;
  x: number;
  y: number;
};

export default class Caculate {
  infos(target: HTMLElement): Infos | undefined {
    var info;
    try {
      info = target.getBoundingClientRect();
      selfLog("Caculate", target, "?", target.getBoundingClientRect());
    } catch (e) {
      selfLog("no bounding", target);
      return undefined;
    }
    return {
      left: info.left,
      right: info.left + info.width,
      up: info.top,
      down: info.top + info.height,
      x: info.x,
      y: info.y,
    };
  }

  distance(cx: number, cy: number, nx: number, ny: number) {
    return parseInt(
      Math.sqrt(
        Math.pow(cx - nx, 2) + Math.pow(cy - ny, 2)
      ) as unknown as string
    );
  }

  contains(cmin: number, cmax: number, nmin: number, nmax: number) {
    return (
      cmax - cmin + (nmax - nmin) >=
      Math.max(cmin, cmax, nmin, nmax) - Math.min(cmin, cmax, nmin, nmax)
    );
  }

  rules(
    pinfo: Infos,
    ninfo: Infos,
    pDvalue: number,
    mDvalue: number,
    dir: string
  ) {
    selfLog("res", pinfo.up, ninfo.down);
    var tmp, pref, min;
    if (dir === "up") {
      if (pinfo.up >= ninfo.down) {
        tmp = this.distance(ninfo.left, ninfo.up, pinfo.left, pinfo.up);
        (!mDvalue || tmp < mDvalue) && ((mDvalue = tmp), (min = true));
        (!pDvalue ||
          (this.contains(ninfo.left, ninfo.right, pinfo.left, pinfo.right) &&
            tmp < pDvalue)) &&
          ((pDvalue = tmp), (pref = true));
      }
    } else if (dir === "down") {
      if (pinfo.down <= ninfo.up) {
        tmp = this.distance(ninfo.left, ninfo.up, pinfo.left, pinfo.up);
        (!mDvalue || tmp < mDvalue) && ((mDvalue = tmp), (min = true));
        (!pDvalue ||
          (this.contains(ninfo.left, ninfo.right, pinfo.left, pinfo.right) &&
            tmp < pDvalue)) &&
          ((pDvalue = tmp), (pref = true));
      }
    } else if (dir === "left") {
      if (pinfo.left >= ninfo.right) {
        tmp = this.distance(ninfo.left, ninfo.up, pinfo.left, pinfo.up);
        (!mDvalue || tmp < mDvalue) && ((mDvalue = tmp), (min = true));
        (!pDvalue ||
          (this.contains(ninfo.up, ninfo.down, pinfo.up, pinfo.down) &&
            tmp < pDvalue)) &&
          ((pDvalue = tmp), (pref = true));
      }
    } else if (dir === "right") {
      if (pinfo.right <= ninfo.left) {
        tmp = this.distance(ninfo.left, ninfo.up, pinfo.left, pinfo.up);
        (!mDvalue || tmp < mDvalue) && ((mDvalue = tmp), (min = true));
        (!pDvalue ||
          (this.contains(ninfo.up, ninfo.down, pinfo.up, pinfo.down) &&
            tmp < pDvalue)) &&
          ((pDvalue = tmp), (pref = true));
      }
    }
    return {
      pDvalue: pDvalue,
      mDvalue: mDvalue,
      pref: pref,
      min: min,
    };
  }
}
