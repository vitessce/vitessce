import { i as inflate_1 } from "./pako.esm-f4dee50e.js";
import { aV as BaseDecoder } from "./index-dd59f16d.js";
import "react";
import "react-dom";
class DeflateDecoder extends BaseDecoder {
  decodeBlock(buffer) {
    return inflate_1(new Uint8Array(buffer)).buffer;
  }
}
export {
  DeflateDecoder as default
};
