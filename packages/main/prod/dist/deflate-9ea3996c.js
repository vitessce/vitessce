import { i as r } from "./pako.esm-a24ba4ed.js";
import { aV as o } from "./index-9cbc2532.js";
import "react";
import "react-dom";
class d extends o {
  decodeBlock(e) {
    return r(new Uint8Array(e)).buffer;
  }
}
export {
  d as default
};
