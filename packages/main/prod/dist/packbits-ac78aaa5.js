import { aV as i } from "./index-9cbc2532.js";
import "react";
import "react-dom";
class p extends i {
  decodeBlock(n) {
    const r = new DataView(n), a = [];
    for (let e = 0; e < n.byteLength; ++e) {
      let t = r.getInt8(e);
      if (t < 0) {
        const o = r.getUint8(e + 1);
        t = -t;
        for (let s = 0; s <= t; ++s)
          a.push(o);
        e += 1;
      } else {
        for (let o = 0; o <= t; ++o)
          a.push(r.getUint8(e + o + 1));
        e += t + 1;
      }
    }
    return new Uint8Array(a).buffer;
  }
}
export {
  p as default
};
