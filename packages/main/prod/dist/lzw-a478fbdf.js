import { aV as b } from "./index-9cbc2532.js";
import "react";
import "react-dom";
const m = 9, E = 256, D = 257, k = 12;
function x(c, o, r) {
  const i = o % 8, t = Math.floor(o / 8), h = 8 - i, g = o + r - (t + 1) * 8;
  let l = 8 * (t + 2) - (o + r);
  const w = (t + 2) * 8 - o;
  if (l = Math.max(0, l), t >= c.length)
    return console.warn("ran off the end of the buffer before finding EOI_CODE (end on input code)"), D;
  let u = c[t] & 2 ** (8 - i) - 1;
  u <<= r - h;
  let s = u;
  if (t + 1 < c.length) {
    let f = c[t + 1] >>> l;
    f <<= Math.max(0, r - w), s += f;
  }
  if (g > 8 && t + 2 < c.length) {
    const f = (t + 3) * 8 - (o + r), n = c[t + 2] >>> f;
    s += n;
  }
  return s;
}
function p(c, o) {
  for (let r = o.length - 1; r >= 0; r--)
    c.push(o[r]);
  return c;
}
function A(c) {
  const o = new Uint16Array(4093), r = new Uint8Array(4093);
  for (let e = 0; e <= 257; e++)
    o[e] = 4096, r[e] = e;
  let i = 258, t = m, h = 0;
  function g() {
    i = 258, t = m;
  }
  function l(e) {
    const a = x(e, h, t);
    return h += t, a;
  }
  function w(e, a) {
    return r[i] = a, o[i] = e, i++, i - 1;
  }
  function u(e) {
    const a = [];
    for (let y = e; y !== 4096; y = o[y])
      a.push(r[y]);
    return a;
  }
  const s = [];
  g();
  const f = new Uint8Array(c);
  let n = l(f), d;
  for (; n !== D; ) {
    if (n === E) {
      for (g(), n = l(f); n === E; )
        n = l(f);
      if (n === D)
        break;
      if (n > E)
        throw new Error(`corrupted code at scanline ${n}`);
      {
        const e = u(n);
        p(s, e), d = n;
      }
    } else if (n < i) {
      const e = u(n);
      p(s, e), w(d, e[e.length - 1]), d = n;
    } else {
      const e = u(d);
      if (!e)
        throw new Error(`Bogus entry. Not in dictionary, ${d} / ${i}, position: ${h}`);
      p(s, e), s.push(e[e.length - 1]), w(d, e[e.length - 1]), d = n;
    }
    i + 1 >= 2 ** t && (t === k ? d = void 0 : t++), n = l(f);
  }
  return new Uint8Array(s);
}
class I extends b {
  decodeBlock(o) {
    return A(o).buffer;
  }
}
export {
  I as default
};
