import { i as inflate_1 } from "./pako.esm-f4dee50e.js";
import { B as BaseDecoder } from "./index-b02ab770.js";
import "react";
class DeflateDecoder extends BaseDecoder {
  decodeBlock(buffer) {
    return inflate_1(new Uint8Array(buffer)).buffer;
  }
}
export {
  DeflateDecoder as default
};
