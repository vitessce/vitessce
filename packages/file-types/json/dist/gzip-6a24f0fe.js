var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var _a;
import { g as gzipSync, a as gunzipSync } from "./browser-122c4c35.js";
var GZip = (_a = class {
  constructor(level = 1) {
    __publicField(this, "level");
    if (level < 0 || level > 9) {
      throw new Error("Invalid gzip compression level, it should be between 0 and 9");
    }
    this.level = level;
  }
  static fromConfig({ level }) {
    return new _a(level);
  }
  encode(data) {
    return gzipSync(data, { level: this.level });
  }
  decode(data) {
    return gunzipSync(data);
  }
}, __publicField(_a, "codecId", "gzip"), _a);
var gzip_default = GZip;
export {
  gzip_default as default
};
