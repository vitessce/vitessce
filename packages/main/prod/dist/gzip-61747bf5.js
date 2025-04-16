var o = Object.defineProperty;
var a = (t, e, i) => e in t ? o(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i;
var n = (t, e, i) => (a(t, typeof e != "symbol" ? e + "" : e, i), i);
import { g as s, a as c } from "./browser-554eb095.js";
var r, l = (r = class {
  constructor(e = 1) {
    n(this, "level");
    if (e < 0 || e > 9)
      throw new Error("Invalid gzip compression level, it should be between 0 and 9");
    this.level = e;
  }
  static fromConfig({ level: e }) {
    return new r(e);
  }
  encode(e) {
    return s(e, { level: this.level });
  }
  decode(e) {
    return c(e);
  }
}, n(r, "codecId", "gzip"), r), u = l;
export {
  u as default
};
