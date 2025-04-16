import { aV as re } from "./index-9cbc2532.js";
import "react";
import "react-dom";
const J = new Int32Array([
  0,
  1,
  8,
  16,
  9,
  2,
  3,
  10,
  17,
  24,
  32,
  25,
  18,
  11,
  4,
  5,
  12,
  19,
  26,
  33,
  40,
  48,
  41,
  34,
  27,
  20,
  13,
  6,
  7,
  14,
  21,
  28,
  35,
  42,
  49,
  56,
  57,
  50,
  43,
  36,
  29,
  22,
  15,
  23,
  30,
  37,
  44,
  51,
  58,
  59,
  52,
  45,
  38,
  31,
  39,
  46,
  53,
  60,
  61,
  54,
  47,
  55,
  62,
  63
]), Y = 4017, Z = 799, $ = 3406, N = 2276, Q = 1567, W = 3784, R = 5793, K = 2896;
function ne(q, l) {
  let o = 0;
  const u = [];
  let T = 16;
  for (; T > 0 && !q[T - 1]; )
    --T;
  u.push({ children: [], index: 0 });
  let w = u[0], C;
  for (let t = 0; t < T; t++) {
    for (let h = 0; h < q[t]; h++) {
      for (w = u.pop(), w.children[w.index] = l[o]; w.index > 0; )
        w = u.pop();
      for (w.index++, u.push(w); u.length <= t; )
        u.push(C = { children: [], index: 0 }), w.children[w.index] = C.children, w = C;
      o++;
    }
    t + 1 < T && (u.push(C = { children: [], index: 0 }), w.children[w.index] = C.children, w = C);
  }
  return u[0].children;
}
function ce(q, l, o, u, T, w, C, t, h) {
  const { mcusPerLine: F, progressive: c } = o, r = l;
  let b = l, i = 0, d = 0;
  function m() {
    if (d > 0)
      return d--, i >> d & 1;
    if (i = q[b++], i === 255) {
      const a = q[b++];
      if (a)
        throw new Error(`unexpected marker: ${(i << 8 | a).toString(16)}`);
    }
    return d = 7, i >>> 7;
  }
  function x(a) {
    let f = a, p;
    for (; (p = m()) !== null; ) {
      if (f = f[p], typeof f == "number")
        return f;
      if (typeof f != "object")
        throw new Error("invalid huffman sequence");
    }
    return null;
  }
  function E(a) {
    let f = a, p = 0;
    for (; f > 0; ) {
      const L = m();
      if (L === null)
        return;
      p = p << 1 | L, --f;
    }
    return p;
  }
  function k(a) {
    const f = E(a);
    return f >= 1 << a - 1 ? f : f + (-1 << a) + 1;
  }
  function A(a, f) {
    const p = x(a.huffmanTableDC), L = p === 0 ? 0 : k(p);
    a.pred += L, f[0] = a.pred;
    let D = 1;
    for (; D < 64; ) {
      const P = x(a.huffmanTableAC), y = P & 15, S = P >> 4;
      if (y === 0) {
        if (S < 15)
          break;
        D += 16;
      } else {
        D += S;
        const I = J[D];
        f[I] = k(y), D++;
      }
    }
  }
  function v(a, f) {
    const p = x(a.huffmanTableDC), L = p === 0 ? 0 : k(p) << h;
    a.pred += L, f[0] = a.pred;
  }
  function s(a, f) {
    f[0] |= m() << h;
  }
  let n = 0;
  function g(a, f) {
    if (n > 0) {
      n--;
      return;
    }
    let p = w;
    const L = C;
    for (; p <= L; ) {
      const D = x(a.huffmanTableAC), P = D & 15, y = D >> 4;
      if (P === 0) {
        if (y < 15) {
          n = E(y) + (1 << y) - 1;
          break;
        }
        p += 16;
      } else {
        p += y;
        const S = J[p];
        f[S] = k(P) * (1 << h), p++;
      }
    }
  }
  let e = 0, _;
  function te(a, f) {
    let p = w;
    const L = C;
    let D = 0;
    for (; p <= L; ) {
      const P = J[p], y = f[P] < 0 ? -1 : 1;
      switch (e) {
        case 0: {
          const S = x(a.huffmanTableAC), I = S & 15;
          if (D = S >> 4, I === 0)
            D < 15 ? (n = E(D) + (1 << D), e = 4) : (D = 16, e = 1);
          else {
            if (I !== 1)
              throw new Error("invalid ACn encoding");
            _ = k(I), e = D ? 2 : 3;
          }
          continue;
        }
        case 1:
        case 2:
          f[P] ? f[P] += (m() << h) * y : (D--, D === 0 && (e = e === 2 ? 3 : 0));
          break;
        case 3:
          f[P] ? f[P] += (m() << h) * y : (f[P] = _ << h, e = 0);
          break;
        case 4:
          f[P] && (f[P] += (m() << h) * y);
          break;
      }
      p++;
    }
    e === 4 && (n--, n === 0 && (e = 0));
  }
  function se(a, f, p, L, D) {
    const P = p / F | 0, y = p % F, S = P * a.v + L, I = y * a.h + D;
    f(a, a.blocks[S][I]);
  }
  function oe(a, f, p) {
    const L = p / a.blocksPerLine | 0, D = p % a.blocksPerLine;
    f(a, a.blocks[L][D]);
  }
  const O = u.length;
  let U, j, G, X, M, H;
  c ? w === 0 ? H = t === 0 ? v : s : H = t === 0 ? g : te : H = A;
  let B = 0, z, V;
  O === 1 ? V = u[0].blocksPerLine * u[0].blocksPerColumn : V = F * o.mcusPerColumn;
  const ee = T || V;
  for (; B < V; ) {
    for (j = 0; j < O; j++)
      u[j].pred = 0;
    if (n = 0, O === 1)
      for (U = u[0], M = 0; M < ee; M++)
        oe(U, H, B), B++;
    else
      for (M = 0; M < ee; M++) {
        for (j = 0; j < O; j++) {
          U = u[j];
          const { h: a, v: f } = U;
          for (G = 0; G < f; G++)
            for (X = 0; X < a; X++)
              se(U, H, B, G, X);
        }
        if (B++, B === V)
          break;
      }
    if (d = 0, z = q[b] << 8 | q[b + 1], z < 65280)
      throw new Error("marker was not found");
    if (z >= 65488 && z <= 65495)
      b += 2;
    else
      break;
  }
  return b - r;
}
function ie(q, l) {
  const o = [], { blocksPerLine: u, blocksPerColumn: T } = l, w = u << 3, C = new Int32Array(64), t = new Uint8Array(64);
  function h(F, c, r) {
    const b = l.quantizationTable;
    let i, d, m, x, E, k, A, v, s;
    const n = r;
    let g;
    for (g = 0; g < 64; g++)
      n[g] = F[g] * b[g];
    for (g = 0; g < 8; ++g) {
      const e = 8 * g;
      if (n[1 + e] === 0 && n[2 + e] === 0 && n[3 + e] === 0 && n[4 + e] === 0 && n[5 + e] === 0 && n[6 + e] === 0 && n[7 + e] === 0) {
        s = R * n[0 + e] + 512 >> 10, n[0 + e] = s, n[1 + e] = s, n[2 + e] = s, n[3 + e] = s, n[4 + e] = s, n[5 + e] = s, n[6 + e] = s, n[7 + e] = s;
        continue;
      }
      i = R * n[0 + e] + 128 >> 8, d = R * n[4 + e] + 128 >> 8, m = n[2 + e], x = n[6 + e], E = K * (n[1 + e] - n[7 + e]) + 128 >> 8, v = K * (n[1 + e] + n[7 + e]) + 128 >> 8, k = n[3 + e] << 4, A = n[5 + e] << 4, s = i - d + 1 >> 1, i = i + d + 1 >> 1, d = s, s = m * W + x * Q + 128 >> 8, m = m * Q - x * W + 128 >> 8, x = s, s = E - A + 1 >> 1, E = E + A + 1 >> 1, A = s, s = v + k + 1 >> 1, k = v - k + 1 >> 1, v = s, s = i - x + 1 >> 1, i = i + x + 1 >> 1, x = s, s = d - m + 1 >> 1, d = d + m + 1 >> 1, m = s, s = E * N + v * $ + 2048 >> 12, E = E * $ - v * N + 2048 >> 12, v = s, s = k * Z + A * Y + 2048 >> 12, k = k * Y - A * Z + 2048 >> 12, A = s, n[0 + e] = i + v, n[7 + e] = i - v, n[1 + e] = d + A, n[6 + e] = d - A, n[2 + e] = m + k, n[5 + e] = m - k, n[3 + e] = x + E, n[4 + e] = x - E;
    }
    for (g = 0; g < 8; ++g) {
      const e = g;
      if (n[1 * 8 + e] === 0 && n[2 * 8 + e] === 0 && n[3 * 8 + e] === 0 && n[4 * 8 + e] === 0 && n[5 * 8 + e] === 0 && n[6 * 8 + e] === 0 && n[7 * 8 + e] === 0) {
        s = R * r[g + 0] + 8192 >> 14, n[0 * 8 + e] = s, n[1 * 8 + e] = s, n[2 * 8 + e] = s, n[3 * 8 + e] = s, n[4 * 8 + e] = s, n[5 * 8 + e] = s, n[6 * 8 + e] = s, n[7 * 8 + e] = s;
        continue;
      }
      i = R * n[0 * 8 + e] + 2048 >> 12, d = R * n[4 * 8 + e] + 2048 >> 12, m = n[2 * 8 + e], x = n[6 * 8 + e], E = K * (n[1 * 8 + e] - n[7 * 8 + e]) + 2048 >> 12, v = K * (n[1 * 8 + e] + n[7 * 8 + e]) + 2048 >> 12, k = n[3 * 8 + e], A = n[5 * 8 + e], s = i - d + 1 >> 1, i = i + d + 1 >> 1, d = s, s = m * W + x * Q + 2048 >> 12, m = m * Q - x * W + 2048 >> 12, x = s, s = E - A + 1 >> 1, E = E + A + 1 >> 1, A = s, s = v + k + 1 >> 1, k = v - k + 1 >> 1, v = s, s = i - x + 1 >> 1, i = i + x + 1 >> 1, x = s, s = d - m + 1 >> 1, d = d + m + 1 >> 1, m = s, s = E * N + v * $ + 2048 >> 12, E = E * $ - v * N + 2048 >> 12, v = s, s = k * Z + A * Y + 2048 >> 12, k = k * Y - A * Z + 2048 >> 12, A = s, n[0 * 8 + e] = i + v, n[7 * 8 + e] = i - v, n[1 * 8 + e] = d + A, n[6 * 8 + e] = d - A, n[2 * 8 + e] = m + k, n[5 * 8 + e] = m - k, n[3 * 8 + e] = x + E, n[4 * 8 + e] = x - E;
    }
    for (g = 0; g < 64; ++g) {
      const e = 128 + (n[g] + 8 >> 4);
      e < 0 ? c[g] = 0 : e > 255 ? c[g] = 255 : c[g] = e;
    }
  }
  for (let F = 0; F < T; F++) {
    const c = F << 3;
    for (let r = 0; r < 8; r++)
      o.push(new Uint8Array(w));
    for (let r = 0; r < u; r++) {
      h(l.blocks[F][r], t, C);
      let b = 0;
      const i = r << 3;
      for (let d = 0; d < 8; d++) {
        const m = o[c + d];
        for (let x = 0; x < 8; x++)
          m[i + x] = t[b++];
      }
    }
  }
  return o;
}
class le {
  constructor() {
    this.jfif = null, this.adobe = null, this.quantizationTables = [], this.huffmanTablesAC = [], this.huffmanTablesDC = [], this.resetFrames();
  }
  resetFrames() {
    this.frames = [];
  }
  parse(l) {
    let o = 0;
    function u() {
      const t = l[o] << 8 | l[o + 1];
      return o += 2, t;
    }
    function T() {
      const t = u(), h = l.subarray(o, o + t - 2);
      return o += h.length, h;
    }
    function w(t) {
      let h = 0, F = 0, c, r;
      for (r in t.components)
        t.components.hasOwnProperty(r) && (c = t.components[r], h < c.h && (h = c.h), F < c.v && (F = c.v));
      const b = Math.ceil(t.samplesPerLine / 8 / h), i = Math.ceil(t.scanLines / 8 / F);
      for (r in t.components)
        if (t.components.hasOwnProperty(r)) {
          c = t.components[r];
          const d = Math.ceil(Math.ceil(t.samplesPerLine / 8) * c.h / h), m = Math.ceil(Math.ceil(t.scanLines / 8) * c.v / F), x = b * c.h, E = i * c.v, k = [];
          for (let A = 0; A < E; A++) {
            const v = [];
            for (let s = 0; s < x; s++)
              v.push(new Int32Array(64));
            k.push(v);
          }
          c.blocksPerLine = d, c.blocksPerColumn = m, c.blocks = k;
        }
      t.maxH = h, t.maxV = F, t.mcusPerLine = b, t.mcusPerColumn = i;
    }
    let C = u();
    if (C !== 65496)
      throw new Error("SOI not found");
    for (C = u(); C !== 65497; ) {
      switch (C) {
        case 65280:
          break;
        case 65504:
        case 65505:
        case 65506:
        case 65507:
        case 65508:
        case 65509:
        case 65510:
        case 65511:
        case 65512:
        case 65513:
        case 65514:
        case 65515:
        case 65516:
        case 65517:
        case 65518:
        case 65519:
        case 65534: {
          const t = T();
          C === 65504 && t[0] === 74 && t[1] === 70 && t[2] === 73 && t[3] === 70 && t[4] === 0 && (this.jfif = {
            version: { major: t[5], minor: t[6] },
            densityUnits: t[7],
            xDensity: t[8] << 8 | t[9],
            yDensity: t[10] << 8 | t[11],
            thumbWidth: t[12],
            thumbHeight: t[13],
            thumbData: t.subarray(14, 14 + 3 * t[12] * t[13])
          }), C === 65518 && t[0] === 65 && t[1] === 100 && t[2] === 111 && t[3] === 98 && t[4] === 101 && t[5] === 0 && (this.adobe = {
            version: t[6],
            flags0: t[7] << 8 | t[8],
            flags1: t[9] << 8 | t[10],
            transformCode: t[11]
          });
          break;
        }
        case 65499: {
          const h = u() + o - 2;
          for (; o < h; ) {
            const F = l[o++], c = new Int32Array(64);
            if (F >> 4)
              if (F >> 4 === 1)
                for (let r = 0; r < 64; r++) {
                  const b = J[r];
                  c[b] = u();
                }
              else
                throw new Error("DQT: invalid table spec");
            else
              for (let r = 0; r < 64; r++) {
                const b = J[r];
                c[b] = l[o++];
              }
            this.quantizationTables[F & 15] = c;
          }
          break;
        }
        case 65472:
        case 65473:
        case 65474: {
          u();
          const t = {
            extended: C === 65473,
            progressive: C === 65474,
            precision: l[o++],
            scanLines: u(),
            samplesPerLine: u(),
            components: {},
            componentsOrder: []
          }, h = l[o++];
          let F;
          for (let c = 0; c < h; c++) {
            F = l[o];
            const r = l[o + 1] >> 4, b = l[o + 1] & 15, i = l[o + 2];
            t.componentsOrder.push(F), t.components[F] = {
              h: r,
              v: b,
              quantizationIdx: i
            }, o += 3;
          }
          w(t), this.frames.push(t);
          break;
        }
        case 65476: {
          const t = u();
          for (let h = 2; h < t; ) {
            const F = l[o++], c = new Uint8Array(16);
            let r = 0;
            for (let i = 0; i < 16; i++, o++)
              c[i] = l[o], r += c[i];
            const b = new Uint8Array(r);
            for (let i = 0; i < r; i++, o++)
              b[i] = l[o];
            h += 17 + r, F >> 4 ? this.huffmanTablesAC[F & 15] = ne(
              c,
              b
            ) : this.huffmanTablesDC[F & 15] = ne(
              c,
              b
            );
          }
          break;
        }
        case 65501:
          u(), this.resetInterval = u();
          break;
        case 65498: {
          u();
          const t = l[o++], h = [], F = this.frames[0];
          for (let d = 0; d < t; d++) {
            const m = F.components[l[o++]], x = l[o++];
            m.huffmanTableDC = this.huffmanTablesDC[x >> 4], m.huffmanTableAC = this.huffmanTablesAC[x & 15], h.push(m);
          }
          const c = l[o++], r = l[o++], b = l[o++], i = ce(
            l,
            o,
            F,
            h,
            this.resetInterval,
            c,
            r,
            b >> 4,
            b & 15
          );
          o += i;
          break;
        }
        case 65535:
          l[o] !== 255 && o--;
          break;
        default:
          if (l[o - 3] === 255 && l[o - 2] >= 192 && l[o - 2] <= 254) {
            o -= 3;
            break;
          }
          throw new Error(`unknown JPEG marker ${C.toString(16)}`);
      }
      C = u();
    }
  }
  getResult() {
    const { frames: l } = this;
    if (this.frames.length === 0)
      throw new Error("no frames were decoded");
    this.frames.length > 1 && console.warn("more than one frame is not supported");
    for (let c = 0; c < this.frames.length; c++) {
      const r = this.frames[c].components;
      for (const b of Object.keys(r))
        r[b].quantizationTable = this.quantizationTables[r[b].quantizationIdx], delete r[b].quantizationIdx;
    }
    const o = l[0], { components: u, componentsOrder: T } = o, w = [], C = o.samplesPerLine, t = o.scanLines;
    for (let c = 0; c < T.length; c++) {
      const r = u[T[c]];
      w.push({
        lines: ie(o, r),
        scaleX: r.h / o.maxH,
        scaleY: r.v / o.maxV
      });
    }
    const h = new Uint8Array(C * t * w.length);
    let F = 0;
    for (let c = 0; c < t; ++c)
      for (let r = 0; r < C; ++r)
        for (let b = 0; b < w.length; ++b) {
          const i = w[b];
          h[F] = i.lines[0 | c * i.scaleY][0 | r * i.scaleX], ++F;
        }
    return h;
  }
}
class he extends re {
  constructor(l) {
    super(), this.reader = new le(), l.JPEGTables && this.reader.parse(l.JPEGTables);
  }
  decodeBlock(l) {
    return this.reader.resetFrames(), this.reader.parse(new Uint8Array(l)), this.reader.getResult().buffer;
  }
}
export {
  he as default
};
