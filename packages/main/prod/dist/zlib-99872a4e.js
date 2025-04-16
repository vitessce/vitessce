var n = Object.defineProperty;
var o = (l, e, t) => e in l ? n(l, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : l[e] = t;
var i = (l, e, t) => (o(l, typeof e != "symbol" ? e + "" : e, t), t);
import { z as s, u as a } from "./browser-554eb095.js";
var r, c = (r = class {
  constructor(e = 1) {
    i(this, "level");
    if (e < -1 || e > 9)
      throw new Error("Invalid zlib compression level, it should be between -1 and 9");
    this.level = e;
  }
  static fromConfig({ level: e }) {
    return new r(e);
  }
  encode(e) {
    return s(e, { level: this.level });
  }
  decode(e) {
    return a(e);
  }
}, i(r, "codecId", "zlib"), r), u = c;
export {
  u as default
};
