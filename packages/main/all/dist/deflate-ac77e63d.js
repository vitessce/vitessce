import { i as inflate_1 } from "./pako.esm-f4dee50e.js";
import { aU as BaseDecoder } from "./index-b4065979.js";
import "react";
import "@vitessce/vit-s";
import "react-dom";
class DeflateDecoder extends BaseDecoder {
  decodeBlock(buffer) {
    return inflate_1(new Uint8Array(buffer)).buffer;
  }
}
export {
  DeflateDecoder as default
};
