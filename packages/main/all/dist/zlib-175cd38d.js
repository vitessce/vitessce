var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var _a;
import { z as zlibSync, u as unzlibSync } from "./browser-122c4c35.js";
var Zlib = (_a = class {
  constructor(level = 1) {
    __publicField(this, "level");
    if (level < -1 || level > 9) {
      throw new Error("Invalid zlib compression level, it should be between -1 and 9");
    }
    this.level = level;
  }
  static fromConfig({ level }) {
    return new _a(level);
  }
  encode(data) {
    return zlibSync(data, { level: this.level });
  }
  decode(data) {
    return unzlibSync(data);
  }
}, __publicField(_a, "codecId", "zlib"), _a);
var zlib_default = Zlib;
export {
  zlib_default as default
};
