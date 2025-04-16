/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
function he(e) {
  let i = e.length;
  for (; --i >= 0; )
    e[i] = 0;
}
const Hi = 0, li = 1, Bi = 2, Ki = 3, Pi = 258, ut = 29, ze = 256, xe = ze + 1 + ut, le = 30, wt = 19, oi = 2 * xe + 1, Q = 15, Xe = 16, Xi = 7, bt = 256, fi = 16, _i = 17, hi = 18, rt = (
  /* extra bits for each length code */
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0])
), $e = (
  /* extra bits for each distance code */
  new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13])
), Yi = (
  /* extra bits for each bit length code */
  new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7])
), di = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Gi = 512, P = new Array((xe + 2) * 2);
he(P);
const be = new Array(le * 2);
he(be);
const ke = new Array(Gi);
he(ke);
const ve = new Array(Pi - Ki + 1);
he(ve);
const gt = new Array(ut);
he(gt);
const Fe = new Array(le);
he(Fe);
function Ye(e, i, t, n, r) {
  this.static_tree = e, this.extra_bits = i, this.extra_base = t, this.elems = n, this.max_length = r, this.has_stree = e && e.length;
}
let si, ci, ui;
function Ge(e, i) {
  this.dyn_tree = e, this.max_code = 0, this.stat_desc = i;
}
const wi = (e) => e < 256 ? ke[e] : ke[256 + (e >>> 7)], Ee = (e, i) => {
  e.pending_buf[e.pending++] = i & 255, e.pending_buf[e.pending++] = i >>> 8 & 255;
}, N = (e, i, t) => {
  e.bi_valid > Xe - t ? (e.bi_buf |= i << e.bi_valid & 65535, Ee(e, e.bi_buf), e.bi_buf = i >> Xe - e.bi_valid, e.bi_valid += t - Xe) : (e.bi_buf |= i << e.bi_valid & 65535, e.bi_valid += t);
}, M = (e, i, t) => {
  N(
    e,
    t[i * 2],
    t[i * 2 + 1]
    /*.Len*/
  );
}, bi = (e, i) => {
  let t = 0;
  do
    t |= e & 1, e >>>= 1, t <<= 1;
  while (--i > 0);
  return t >>> 1;
}, ji = (e) => {
  e.bi_valid === 16 ? (Ee(e, e.bi_buf), e.bi_buf = 0, e.bi_valid = 0) : e.bi_valid >= 8 && (e.pending_buf[e.pending++] = e.bi_buf & 255, e.bi_buf >>= 8, e.bi_valid -= 8);
}, Wi = (e, i) => {
  const t = i.dyn_tree, n = i.max_code, r = i.stat_desc.static_tree, a = i.stat_desc.has_stree, f = i.stat_desc.extra_bits, o = i.stat_desc.extra_base, c = i.stat_desc.max_length;
  let l, _, y, s, h, u, R = 0;
  for (s = 0; s <= Q; s++)
    e.bl_count[s] = 0;
  for (t[e.heap[e.heap_max] * 2 + 1] = 0, l = e.heap_max + 1; l < oi; l++)
    _ = e.heap[l], s = t[t[_ * 2 + 1] * 2 + 1] + 1, s > c && (s = c, R++), t[_ * 2 + 1] = s, !(_ > n) && (e.bl_count[s]++, h = 0, _ >= o && (h = f[_ - o]), u = t[_ * 2], e.opt_len += u * (s + h), a && (e.static_len += u * (r[_ * 2 + 1] + h)));
  if (R !== 0) {
    do {
      for (s = c - 1; e.bl_count[s] === 0; )
        s--;
      e.bl_count[s]--, e.bl_count[s + 1] += 2, e.bl_count[c]--, R -= 2;
    } while (R > 0);
    for (s = c; s !== 0; s--)
      for (_ = e.bl_count[s]; _ !== 0; )
        y = e.heap[--l], !(y > n) && (t[y * 2 + 1] !== s && (e.opt_len += (s - t[y * 2 + 1]) * t[y * 2], t[y * 2 + 1] = s), _--);
  }
}, gi = (e, i, t) => {
  const n = new Array(Q + 1);
  let r = 0, a, f;
  for (a = 1; a <= Q; a++)
    r = r + t[a - 1] << 1, n[a] = r;
  for (f = 0; f <= i; f++) {
    let o = e[f * 2 + 1];
    o !== 0 && (e[f * 2] = bi(n[o]++, o));
  }
}, Vi = () => {
  let e, i, t, n, r;
  const a = new Array(Q + 1);
  for (t = 0, n = 0; n < ut - 1; n++)
    for (gt[n] = t, e = 0; e < 1 << rt[n]; e++)
      ve[t++] = n;
  for (ve[t - 1] = n, r = 0, n = 0; n < 16; n++)
    for (Fe[n] = r, e = 0; e < 1 << $e[n]; e++)
      ke[r++] = n;
  for (r >>= 7; n < le; n++)
    for (Fe[n] = r << 7, e = 0; e < 1 << $e[n] - 7; e++)
      ke[256 + r++] = n;
  for (i = 0; i <= Q; i++)
    a[i] = 0;
  for (e = 0; e <= 143; )
    P[e * 2 + 1] = 8, e++, a[8]++;
  for (; e <= 255; )
    P[e * 2 + 1] = 9, e++, a[9]++;
  for (; e <= 279; )
    P[e * 2 + 1] = 7, e++, a[7]++;
  for (; e <= 287; )
    P[e * 2 + 1] = 8, e++, a[8]++;
  for (gi(P, xe + 1, a), e = 0; e < le; e++)
    be[e * 2 + 1] = 5, be[e * 2] = bi(e, 5);
  si = new Ye(P, rt, ze + 1, xe, Q), ci = new Ye(be, $e, 0, le, Q), ui = new Ye(new Array(0), Yi, 0, wt, Xi);
}, pi = (e) => {
  let i;
  for (i = 0; i < xe; i++)
    e.dyn_ltree[i * 2] = 0;
  for (i = 0; i < le; i++)
    e.dyn_dtree[i * 2] = 0;
  for (i = 0; i < wt; i++)
    e.bl_tree[i * 2] = 0;
  e.dyn_ltree[bt * 2] = 1, e.opt_len = e.static_len = 0, e.sym_next = e.matches = 0;
}, xi = (e) => {
  e.bi_valid > 8 ? Ee(e, e.bi_buf) : e.bi_valid > 0 && (e.pending_buf[e.pending++] = e.bi_buf), e.bi_buf = 0, e.bi_valid = 0;
}, Et = (e, i, t, n) => {
  const r = i * 2, a = t * 2;
  return e[r] < e[a] || e[r] === e[a] && n[i] <= n[t];
}, je = (e, i, t) => {
  const n = e.heap[t];
  let r = t << 1;
  for (; r <= e.heap_len && (r < e.heap_len && Et(i, e.heap[r + 1], e.heap[r], e.depth) && r++, !Et(i, n, e.heap[r], e.depth)); )
    e.heap[t] = e.heap[r], t = r, r <<= 1;
  e.heap[t] = n;
}, yt = (e, i, t) => {
  let n, r, a = 0, f, o;
  if (e.sym_next !== 0)
    do
      n = e.pending_buf[e.sym_buf + a++] & 255, n += (e.pending_buf[e.sym_buf + a++] & 255) << 8, r = e.pending_buf[e.sym_buf + a++], n === 0 ? M(e, r, i) : (f = ve[r], M(e, f + ze + 1, i), o = rt[f], o !== 0 && (r -= gt[f], N(e, r, o)), n--, f = wi(n), M(e, f, t), o = $e[f], o !== 0 && (n -= Fe[f], N(e, n, o)));
    while (a < e.sym_next);
  M(e, bt, i);
}, lt = (e, i) => {
  const t = i.dyn_tree, n = i.stat_desc.static_tree, r = i.stat_desc.has_stree, a = i.stat_desc.elems;
  let f, o, c = -1, l;
  for (e.heap_len = 0, e.heap_max = oi, f = 0; f < a; f++)
    t[f * 2] !== 0 ? (e.heap[++e.heap_len] = c = f, e.depth[f] = 0) : t[f * 2 + 1] = 0;
  for (; e.heap_len < 2; )
    l = e.heap[++e.heap_len] = c < 2 ? ++c : 0, t[l * 2] = 1, e.depth[l] = 0, e.opt_len--, r && (e.static_len -= n[l * 2 + 1]);
  for (i.max_code = c, f = e.heap_len >> 1; f >= 1; f--)
    je(e, t, f);
  l = a;
  do
    f = e.heap[
      1
      /*SMALLEST*/
    ], e.heap[
      1
      /*SMALLEST*/
    ] = e.heap[e.heap_len--], je(
      e,
      t,
      1
      /*SMALLEST*/
    ), o = e.heap[
      1
      /*SMALLEST*/
    ], e.heap[--e.heap_max] = f, e.heap[--e.heap_max] = o, t[l * 2] = t[f * 2] + t[o * 2], e.depth[l] = (e.depth[f] >= e.depth[o] ? e.depth[f] : e.depth[o]) + 1, t[f * 2 + 1] = t[o * 2 + 1] = l, e.heap[
      1
      /*SMALLEST*/
    ] = l++, je(
      e,
      t,
      1
      /*SMALLEST*/
    );
  while (e.heap_len >= 2);
  e.heap[--e.heap_max] = e.heap[
    1
    /*SMALLEST*/
  ], Wi(e, i), gi(t, c, e.bl_count);
}, mt = (e, i, t) => {
  let n, r = -1, a, f = i[0 * 2 + 1], o = 0, c = 7, l = 4;
  for (f === 0 && (c = 138, l = 3), i[(t + 1) * 2 + 1] = 65535, n = 0; n <= t; n++)
    a = f, f = i[(n + 1) * 2 + 1], !(++o < c && a === f) && (o < l ? e.bl_tree[a * 2] += o : a !== 0 ? (a !== r && e.bl_tree[a * 2]++, e.bl_tree[fi * 2]++) : o <= 10 ? e.bl_tree[_i * 2]++ : e.bl_tree[hi * 2]++, o = 0, r = a, f === 0 ? (c = 138, l = 3) : a === f ? (c = 6, l = 3) : (c = 7, l = 4));
}, St = (e, i, t) => {
  let n, r = -1, a, f = i[0 * 2 + 1], o = 0, c = 7, l = 4;
  for (f === 0 && (c = 138, l = 3), n = 0; n <= t; n++)
    if (a = f, f = i[(n + 1) * 2 + 1], !(++o < c && a === f)) {
      if (o < l)
        do
          M(e, a, e.bl_tree);
        while (--o !== 0);
      else
        a !== 0 ? (a !== r && (M(e, a, e.bl_tree), o--), M(e, fi, e.bl_tree), N(e, o - 3, 2)) : o <= 10 ? (M(e, _i, e.bl_tree), N(e, o - 3, 3)) : (M(e, hi, e.bl_tree), N(e, o - 11, 7));
      o = 0, r = a, f === 0 ? (c = 138, l = 3) : a === f ? (c = 6, l = 3) : (c = 7, l = 4);
    }
}, Ji = (e) => {
  let i;
  for (mt(e, e.dyn_ltree, e.l_desc.max_code), mt(e, e.dyn_dtree, e.d_desc.max_code), lt(e, e.bl_desc), i = wt - 1; i >= 3 && e.bl_tree[di[i] * 2 + 1] === 0; i--)
    ;
  return e.opt_len += 3 * (i + 1) + 5 + 5 + 4, i;
}, Qi = (e, i, t, n) => {
  let r;
  for (N(e, i - 257, 5), N(e, t - 1, 5), N(e, n - 4, 4), r = 0; r < n; r++)
    N(e, e.bl_tree[di[r] * 2 + 1], 3);
  St(e, e.dyn_ltree, i - 1), St(e, e.dyn_dtree, t - 1);
}, qi = (e) => {
  let i = 4093624447, t;
  for (t = 0; t <= 31; t++, i >>>= 1)
    if (i & 1 && e.dyn_ltree[t * 2] !== 0)
      return 0;
  if (e.dyn_ltree[9 * 2] !== 0 || e.dyn_ltree[10 * 2] !== 0 || e.dyn_ltree[13 * 2] !== 0)
    return 1;
  for (t = 32; t < ze; t++)
    if (e.dyn_ltree[t * 2] !== 0)
      return 1;
  return 0;
};
let At = !1;
const en = (e) => {
  At || (Vi(), At = !0), e.l_desc = new Ge(e.dyn_ltree, si), e.d_desc = new Ge(e.dyn_dtree, ci), e.bl_desc = new Ge(e.bl_tree, ui), e.bi_buf = 0, e.bi_valid = 0, pi(e);
}, ki = (e, i, t, n) => {
  N(e, (Hi << 1) + (n ? 1 : 0), 3), xi(e), Ee(e, t), Ee(e, ~t), t && e.pending_buf.set(e.window.subarray(i, i + t), e.pending), e.pending += t;
}, tn = (e) => {
  N(e, li << 1, 3), M(e, bt, P), ji(e);
}, nn = (e, i, t, n) => {
  let r, a, f = 0;
  e.level > 0 ? (e.strm.data_type === 2 && (e.strm.data_type = qi(e)), lt(e, e.l_desc), lt(e, e.d_desc), f = Ji(e), r = e.opt_len + 3 + 7 >>> 3, a = e.static_len + 3 + 7 >>> 3, a <= r && (r = a)) : r = a = t + 5, t + 4 <= r && i !== -1 ? ki(e, i, t, n) : e.strategy === 4 || a === r ? (N(e, (li << 1) + (n ? 1 : 0), 3), yt(e, P, be)) : (N(e, (Bi << 1) + (n ? 1 : 0), 3), Qi(e, e.l_desc.max_code + 1, e.d_desc.max_code + 1, f + 1), yt(e, e.dyn_ltree, e.dyn_dtree)), pi(e), n && xi(e);
}, an = (e, i, t) => (e.pending_buf[e.sym_buf + e.sym_next++] = i, e.pending_buf[e.sym_buf + e.sym_next++] = i >> 8, e.pending_buf[e.sym_buf + e.sym_next++] = t, i === 0 ? e.dyn_ltree[t * 2]++ : (e.matches++, i--, e.dyn_ltree[(ve[t] + ze + 1) * 2]++, e.dyn_dtree[wi(i) * 2]++), e.sym_next === e.sym_end);
var rn = en, ln = ki, on = nn, fn = an, _n = tn, hn = {
  _tr_init: rn,
  _tr_stored_block: ln,
  _tr_flush_block: on,
  _tr_tally: fn,
  _tr_align: _n
};
const dn = (e, i, t, n) => {
  let r = e & 65535 | 0, a = e >>> 16 & 65535 | 0, f = 0;
  for (; t !== 0; ) {
    f = t > 2e3 ? 2e3 : t, t -= f;
    do
      r = r + i[n++] | 0, a = a + r | 0;
    while (--f);
    r %= 65521, a %= 65521;
  }
  return r | a << 16 | 0;
};
var ye = dn;
const sn = () => {
  let e, i = [];
  for (var t = 0; t < 256; t++) {
    e = t;
    for (var n = 0; n < 8; n++)
      e = e & 1 ? 3988292384 ^ e >>> 1 : e >>> 1;
    i[t] = e;
  }
  return i;
}, cn = new Uint32Array(sn()), un = (e, i, t, n) => {
  const r = cn, a = n + t;
  e ^= -1;
  for (let f = n; f < a; f++)
    e = e >>> 8 ^ r[(e ^ i[f]) & 255];
  return e ^ -1;
};
var Z = un, oe = {
  2: "need dictionary",
  /* Z_NEED_DICT       2  */
  1: "stream end",
  /* Z_STREAM_END      1  */
  0: "",
  /* Z_OK              0  */
  "-1": "file error",
  /* Z_ERRNO         (-1) */
  "-2": "stream error",
  /* Z_STREAM_ERROR  (-2) */
  "-3": "data error",
  /* Z_DATA_ERROR    (-3) */
  "-4": "insufficient memory",
  /* Z_MEM_ERROR     (-4) */
  "-5": "buffer error",
  /* Z_BUF_ERROR     (-5) */
  "-6": "incompatible version"
  /* Z_VERSION_ERROR (-6) */
}, Te = {
  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH: 0,
  Z_PARTIAL_FLUSH: 1,
  Z_SYNC_FLUSH: 2,
  Z_FULL_FLUSH: 3,
  Z_FINISH: 4,
  Z_BLOCK: 5,
  Z_TREES: 6,
  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK: 0,
  Z_STREAM_END: 1,
  Z_NEED_DICT: 2,
  Z_ERRNO: -1,
  Z_STREAM_ERROR: -2,
  Z_DATA_ERROR: -3,
  Z_MEM_ERROR: -4,
  Z_BUF_ERROR: -5,
  //Z_VERSION_ERROR: -6,
  /* compression levels */
  Z_NO_COMPRESSION: 0,
  Z_BEST_SPEED: 1,
  Z_BEST_COMPRESSION: 9,
  Z_DEFAULT_COMPRESSION: -1,
  Z_FILTERED: 1,
  Z_HUFFMAN_ONLY: 2,
  Z_RLE: 3,
  Z_FIXED: 4,
  Z_DEFAULT_STRATEGY: 0,
  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY: 0,
  Z_TEXT: 1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN: 2,
  /* The deflate compression method */
  Z_DEFLATED: 8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};
const { _tr_init: wn, _tr_stored_block: ot, _tr_flush_block: bn, _tr_tally: j, _tr_align: gn } = hn, {
  Z_NO_FLUSH: W,
  Z_PARTIAL_FLUSH: pn,
  Z_FULL_FLUSH: xn,
  Z_FINISH: C,
  Z_BLOCK: zt,
  Z_OK: I,
  Z_STREAM_END: Tt,
  Z_STREAM_ERROR: H,
  Z_DATA_ERROR: kn,
  Z_BUF_ERROR: We,
  Z_DEFAULT_COMPRESSION: vn,
  Z_FILTERED: En,
  Z_HUFFMAN_ONLY: Oe,
  Z_RLE: yn,
  Z_FIXED: mn,
  Z_DEFAULT_STRATEGY: Sn,
  Z_UNKNOWN: An,
  Z_DEFLATED: Be
} = Te, zn = 9, Tn = 15, Rn = 8, Dn = 29, Zn = 256, ft = Zn + 1 + Dn, In = 30, On = 19, Nn = 2 * ft + 1, Ln = 15, k = 3, G = 258, B = G + k + 1, Un = 32, fe = 42, pt = 57, _t = 69, ht = 73, dt = 91, st = 103, q = 113, ue = 666, O = 1, de = 2, te = 3, se = 4, Cn = 3, ee = (e, i) => (e.msg = oe[i], i), Rt = (e) => e * 2 - (e > 4 ? 9 : 0), Y = (e) => {
  let i = e.length;
  for (; --i >= 0; )
    e[i] = 0;
}, $n = (e) => {
  let i, t, n, r = e.w_size;
  i = e.hash_size, n = i;
  do
    t = e.head[--n], e.head[n] = t >= r ? t - r : 0;
  while (--i);
  i = r, n = i;
  do
    t = e.prev[--n], e.prev[n] = t >= r ? t - r : 0;
  while (--i);
};
let Fn = (e, i, t) => (i << e.hash_shift ^ t) & e.hash_mask, V = Fn;
const L = (e) => {
  const i = e.state;
  let t = i.pending;
  t > e.avail_out && (t = e.avail_out), t !== 0 && (e.output.set(i.pending_buf.subarray(i.pending_out, i.pending_out + t), e.next_out), e.next_out += t, i.pending_out += t, e.total_out += t, e.avail_out -= t, i.pending -= t, i.pending === 0 && (i.pending_out = 0));
}, U = (e, i) => {
  bn(e, e.block_start >= 0 ? e.block_start : -1, e.strstart - e.block_start, i), e.block_start = e.strstart, L(e.strm);
}, S = (e, i) => {
  e.pending_buf[e.pending++] = i;
}, ce = (e, i) => {
  e.pending_buf[e.pending++] = i >>> 8 & 255, e.pending_buf[e.pending++] = i & 255;
}, ct = (e, i, t, n) => {
  let r = e.avail_in;
  return r > n && (r = n), r === 0 ? 0 : (e.avail_in -= r, i.set(e.input.subarray(e.next_in, e.next_in + r), t), e.state.wrap === 1 ? e.adler = ye(e.adler, i, r, t) : e.state.wrap === 2 && (e.adler = Z(e.adler, i, r, t)), e.next_in += r, e.total_in += r, r);
}, vi = (e, i) => {
  let t = e.max_chain_length, n = e.strstart, r, a, f = e.prev_length, o = e.nice_match;
  const c = e.strstart > e.w_size - B ? e.strstart - (e.w_size - B) : 0, l = e.window, _ = e.w_mask, y = e.prev, s = e.strstart + G;
  let h = l[n + f - 1], u = l[n + f];
  e.prev_length >= e.good_match && (t >>= 2), o > e.lookahead && (o = e.lookahead);
  do
    if (r = i, !(l[r + f] !== u || l[r + f - 1] !== h || l[r] !== l[n] || l[++r] !== l[n + 1])) {
      n += 2, r++;
      do
        ;
      while (l[++n] === l[++r] && l[++n] === l[++r] && l[++n] === l[++r] && l[++n] === l[++r] && l[++n] === l[++r] && l[++n] === l[++r] && l[++n] === l[++r] && l[++n] === l[++r] && n < s);
      if (a = G - (s - n), n = s - G, a > f) {
        if (e.match_start = i, f = a, a >= o)
          break;
        h = l[n + f - 1], u = l[n + f];
      }
    }
  while ((i = y[i & _]) > c && --t !== 0);
  return f <= e.lookahead ? f : e.lookahead;
}, _e = (e) => {
  const i = e.w_size;
  let t, n, r;
  do {
    if (n = e.window_size - e.lookahead - e.strstart, e.strstart >= i + (i - B) && (e.window.set(e.window.subarray(i, i + i - n), 0), e.match_start -= i, e.strstart -= i, e.block_start -= i, e.insert > e.strstart && (e.insert = e.strstart), $n(e), n += i), e.strm.avail_in === 0)
      break;
    if (t = ct(e.strm, e.window, e.strstart + e.lookahead, n), e.lookahead += t, e.lookahead + e.insert >= k)
      for (r = e.strstart - e.insert, e.ins_h = e.window[r], e.ins_h = V(e, e.ins_h, e.window[r + 1]); e.insert && (e.ins_h = V(e, e.ins_h, e.window[r + k - 1]), e.prev[r & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = r, r++, e.insert--, !(e.lookahead + e.insert < k)); )
        ;
  } while (e.lookahead < B && e.strm.avail_in !== 0);
}, Ei = (e, i) => {
  let t = e.pending_buf_size - 5 > e.w_size ? e.w_size : e.pending_buf_size - 5, n, r, a, f = 0, o = e.strm.avail_in;
  do {
    if (n = 65535, a = e.bi_valid + 42 >> 3, e.strm.avail_out < a || (a = e.strm.avail_out - a, r = e.strstart - e.block_start, n > r + e.strm.avail_in && (n = r + e.strm.avail_in), n > a && (n = a), n < t && (n === 0 && i !== C || i === W || n !== r + e.strm.avail_in)))
      break;
    f = i === C && n === r + e.strm.avail_in ? 1 : 0, ot(e, 0, 0, f), e.pending_buf[e.pending - 4] = n, e.pending_buf[e.pending - 3] = n >> 8, e.pending_buf[e.pending - 2] = ~n, e.pending_buf[e.pending - 1] = ~n >> 8, L(e.strm), r && (r > n && (r = n), e.strm.output.set(e.window.subarray(e.block_start, e.block_start + r), e.strm.next_out), e.strm.next_out += r, e.strm.avail_out -= r, e.strm.total_out += r, e.block_start += r, n -= r), n && (ct(e.strm, e.strm.output, e.strm.next_out, n), e.strm.next_out += n, e.strm.avail_out -= n, e.strm.total_out += n);
  } while (f === 0);
  return o -= e.strm.avail_in, o && (o >= e.w_size ? (e.matches = 2, e.window.set(e.strm.input.subarray(e.strm.next_in - e.w_size, e.strm.next_in), 0), e.strstart = e.w_size, e.insert = e.strstart) : (e.window_size - e.strstart <= o && (e.strstart -= e.w_size, e.window.set(e.window.subarray(e.w_size, e.w_size + e.strstart), 0), e.matches < 2 && e.matches++, e.insert > e.strstart && (e.insert = e.strstart)), e.window.set(e.strm.input.subarray(e.strm.next_in - o, e.strm.next_in), e.strstart), e.strstart += o, e.insert += o > e.w_size - e.insert ? e.w_size - e.insert : o), e.block_start = e.strstart), e.high_water < e.strstart && (e.high_water = e.strstart), f ? se : i !== W && i !== C && e.strm.avail_in === 0 && e.strstart === e.block_start ? de : (a = e.window_size - e.strstart, e.strm.avail_in > a && e.block_start >= e.w_size && (e.block_start -= e.w_size, e.strstart -= e.w_size, e.window.set(e.window.subarray(e.w_size, e.w_size + e.strstart), 0), e.matches < 2 && e.matches++, a += e.w_size, e.insert > e.strstart && (e.insert = e.strstart)), a > e.strm.avail_in && (a = e.strm.avail_in), a && (ct(e.strm, e.window, e.strstart, a), e.strstart += a, e.insert += a > e.w_size - e.insert ? e.w_size - e.insert : a), e.high_water < e.strstart && (e.high_water = e.strstart), a = e.bi_valid + 42 >> 3, a = e.pending_buf_size - a > 65535 ? 65535 : e.pending_buf_size - a, t = a > e.w_size ? e.w_size : a, r = e.strstart - e.block_start, (r >= t || (r || i === C) && i !== W && e.strm.avail_in === 0 && r <= a) && (n = r > a ? a : r, f = i === C && e.strm.avail_in === 0 && n === r ? 1 : 0, ot(e, e.block_start, n, f), e.block_start += n, L(e.strm)), f ? te : O);
}, Ve = (e, i) => {
  let t, n;
  for (; ; ) {
    if (e.lookahead < B) {
      if (_e(e), e.lookahead < B && i === W)
        return O;
      if (e.lookahead === 0)
        break;
    }
    if (t = 0, e.lookahead >= k && (e.ins_h = V(e, e.ins_h, e.window[e.strstart + k - 1]), t = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart), t !== 0 && e.strstart - t <= e.w_size - B && (e.match_length = vi(e, t)), e.match_length >= k)
      if (n = j(e, e.strstart - e.match_start, e.match_length - k), e.lookahead -= e.match_length, e.match_length <= e.max_lazy_match && e.lookahead >= k) {
        e.match_length--;
        do
          e.strstart++, e.ins_h = V(e, e.ins_h, e.window[e.strstart + k - 1]), t = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart;
        while (--e.match_length !== 0);
        e.strstart++;
      } else
        e.strstart += e.match_length, e.match_length = 0, e.ins_h = e.window[e.strstart], e.ins_h = V(e, e.ins_h, e.window[e.strstart + 1]);
    else
      n = j(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++;
    if (n && (U(e, !1), e.strm.avail_out === 0))
      return O;
  }
  return e.insert = e.strstart < k - 1 ? e.strstart : k - 1, i === C ? (U(e, !0), e.strm.avail_out === 0 ? te : se) : e.sym_next && (U(e, !1), e.strm.avail_out === 0) ? O : de;
}, ae = (e, i) => {
  let t, n, r;
  for (; ; ) {
    if (e.lookahead < B) {
      if (_e(e), e.lookahead < B && i === W)
        return O;
      if (e.lookahead === 0)
        break;
    }
    if (t = 0, e.lookahead >= k && (e.ins_h = V(e, e.ins_h, e.window[e.strstart + k - 1]), t = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart), e.prev_length = e.match_length, e.prev_match = e.match_start, e.match_length = k - 1, t !== 0 && e.prev_length < e.max_lazy_match && e.strstart - t <= e.w_size - B && (e.match_length = vi(e, t), e.match_length <= 5 && (e.strategy === En || e.match_length === k && e.strstart - e.match_start > 4096) && (e.match_length = k - 1)), e.prev_length >= k && e.match_length <= e.prev_length) {
      r = e.strstart + e.lookahead - k, n = j(e, e.strstart - 1 - e.prev_match, e.prev_length - k), e.lookahead -= e.prev_length - 1, e.prev_length -= 2;
      do
        ++e.strstart <= r && (e.ins_h = V(e, e.ins_h, e.window[e.strstart + k - 1]), t = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart);
      while (--e.prev_length !== 0);
      if (e.match_available = 0, e.match_length = k - 1, e.strstart++, n && (U(e, !1), e.strm.avail_out === 0))
        return O;
    } else if (e.match_available) {
      if (n = j(e, 0, e.window[e.strstart - 1]), n && U(e, !1), e.strstart++, e.lookahead--, e.strm.avail_out === 0)
        return O;
    } else
      e.match_available = 1, e.strstart++, e.lookahead--;
  }
  return e.match_available && (n = j(e, 0, e.window[e.strstart - 1]), e.match_available = 0), e.insert = e.strstart < k - 1 ? e.strstart : k - 1, i === C ? (U(e, !0), e.strm.avail_out === 0 ? te : se) : e.sym_next && (U(e, !1), e.strm.avail_out === 0) ? O : de;
}, Mn = (e, i) => {
  let t, n, r, a;
  const f = e.window;
  for (; ; ) {
    if (e.lookahead <= G) {
      if (_e(e), e.lookahead <= G && i === W)
        return O;
      if (e.lookahead === 0)
        break;
    }
    if (e.match_length = 0, e.lookahead >= k && e.strstart > 0 && (r = e.strstart - 1, n = f[r], n === f[++r] && n === f[++r] && n === f[++r])) {
      a = e.strstart + G;
      do
        ;
      while (n === f[++r] && n === f[++r] && n === f[++r] && n === f[++r] && n === f[++r] && n === f[++r] && n === f[++r] && n === f[++r] && r < a);
      e.match_length = G - (a - r), e.match_length > e.lookahead && (e.match_length = e.lookahead);
    }
    if (e.match_length >= k ? (t = j(e, 1, e.match_length - k), e.lookahead -= e.match_length, e.strstart += e.match_length, e.match_length = 0) : (t = j(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++), t && (U(e, !1), e.strm.avail_out === 0))
      return O;
  }
  return e.insert = 0, i === C ? (U(e, !0), e.strm.avail_out === 0 ? te : se) : e.sym_next && (U(e, !1), e.strm.avail_out === 0) ? O : de;
}, Hn = (e, i) => {
  let t;
  for (; ; ) {
    if (e.lookahead === 0 && (_e(e), e.lookahead === 0)) {
      if (i === W)
        return O;
      break;
    }
    if (e.match_length = 0, t = j(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++, t && (U(e, !1), e.strm.avail_out === 0))
      return O;
  }
  return e.insert = 0, i === C ? (U(e, !0), e.strm.avail_out === 0 ? te : se) : e.sym_next && (U(e, !1), e.strm.avail_out === 0) ? O : de;
};
function F(e, i, t, n, r) {
  this.good_length = e, this.max_lazy = i, this.nice_length = t, this.max_chain = n, this.func = r;
}
const we = [
  /*      good lazy nice chain */
  new F(0, 0, 0, 0, Ei),
  /* 0 store only */
  new F(4, 4, 8, 4, Ve),
  /* 1 max speed, no lazy matches */
  new F(4, 5, 16, 8, Ve),
  /* 2 */
  new F(4, 6, 32, 32, Ve),
  /* 3 */
  new F(4, 4, 16, 16, ae),
  /* 4 lazy matches */
  new F(8, 16, 32, 32, ae),
  /* 5 */
  new F(8, 16, 128, 128, ae),
  /* 6 */
  new F(8, 32, 128, 256, ae),
  /* 7 */
  new F(32, 128, 258, 1024, ae),
  /* 8 */
  new F(32, 258, 258, 4096, ae)
  /* 9 max compression */
], Bn = (e) => {
  e.window_size = 2 * e.w_size, Y(e.head), e.max_lazy_match = we[e.level].max_lazy, e.good_match = we[e.level].good_length, e.nice_match = we[e.level].nice_length, e.max_chain_length = we[e.level].max_chain, e.strstart = 0, e.block_start = 0, e.lookahead = 0, e.insert = 0, e.match_length = e.prev_length = k - 1, e.match_available = 0, e.ins_h = 0;
};
function Kn() {
  this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = Be, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new Uint16Array(Nn * 2), this.dyn_dtree = new Uint16Array((2 * In + 1) * 2), this.bl_tree = new Uint16Array((2 * On + 1) * 2), Y(this.dyn_ltree), Y(this.dyn_dtree), Y(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new Uint16Array(Ln + 1), this.heap = new Uint16Array(2 * ft + 1), Y(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new Uint16Array(2 * ft + 1), Y(this.depth), this.sym_buf = 0, this.lit_bufsize = 0, this.sym_next = 0, this.sym_end = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
}
const Re = (e) => {
  if (!e)
    return 1;
  const i = e.state;
  return !i || i.strm !== e || i.status !== fe && //#ifdef GZIP
  i.status !== pt && //#endif
  i.status !== _t && i.status !== ht && i.status !== dt && i.status !== st && i.status !== q && i.status !== ue ? 1 : 0;
}, yi = (e) => {
  if (Re(e))
    return ee(e, H);
  e.total_in = e.total_out = 0, e.data_type = An;
  const i = e.state;
  return i.pending = 0, i.pending_out = 0, i.wrap < 0 && (i.wrap = -i.wrap), i.status = //#ifdef GZIP
  i.wrap === 2 ? pt : (
    //#endif
    i.wrap ? fe : q
  ), e.adler = i.wrap === 2 ? 0 : 1, i.last_flush = -2, wn(i), I;
}, mi = (e) => {
  const i = yi(e);
  return i === I && Bn(e.state), i;
}, Pn = (e, i) => Re(e) || e.state.wrap !== 2 ? H : (e.state.gzhead = i, I), Si = (e, i, t, n, r, a) => {
  if (!e)
    return H;
  let f = 1;
  if (i === vn && (i = 6), n < 0 ? (f = 0, n = -n) : n > 15 && (f = 2, n -= 16), r < 1 || r > zn || t !== Be || n < 8 || n > 15 || i < 0 || i > 9 || a < 0 || a > mn || n === 8 && f !== 1)
    return ee(e, H);
  n === 8 && (n = 9);
  const o = new Kn();
  return e.state = o, o.strm = e, o.status = fe, o.wrap = f, o.gzhead = null, o.w_bits = n, o.w_size = 1 << o.w_bits, o.w_mask = o.w_size - 1, o.hash_bits = r + 7, o.hash_size = 1 << o.hash_bits, o.hash_mask = o.hash_size - 1, o.hash_shift = ~~((o.hash_bits + k - 1) / k), o.window = new Uint8Array(o.w_size * 2), o.head = new Uint16Array(o.hash_size), o.prev = new Uint16Array(o.w_size), o.lit_bufsize = 1 << r + 6, o.pending_buf_size = o.lit_bufsize * 4, o.pending_buf = new Uint8Array(o.pending_buf_size), o.sym_buf = o.lit_bufsize, o.sym_end = (o.lit_bufsize - 1) * 3, o.level = i, o.strategy = a, o.method = t, mi(e);
}, Xn = (e, i) => Si(e, i, Be, Tn, Rn, Sn), Yn = (e, i) => {
  if (Re(e) || i > zt || i < 0)
    return e ? ee(e, H) : H;
  const t = e.state;
  if (!e.output || e.avail_in !== 0 && !e.input || t.status === ue && i !== C)
    return ee(e, e.avail_out === 0 ? We : H);
  const n = t.last_flush;
  if (t.last_flush = i, t.pending !== 0) {
    if (L(e), e.avail_out === 0)
      return t.last_flush = -1, I;
  } else if (e.avail_in === 0 && Rt(i) <= Rt(n) && i !== C)
    return ee(e, We);
  if (t.status === ue && e.avail_in !== 0)
    return ee(e, We);
  if (t.status === fe && t.wrap === 0 && (t.status = q), t.status === fe) {
    let r = Be + (t.w_bits - 8 << 4) << 8, a = -1;
    if (t.strategy >= Oe || t.level < 2 ? a = 0 : t.level < 6 ? a = 1 : t.level === 6 ? a = 2 : a = 3, r |= a << 6, t.strstart !== 0 && (r |= Un), r += 31 - r % 31, ce(t, r), t.strstart !== 0 && (ce(t, e.adler >>> 16), ce(t, e.adler & 65535)), e.adler = 1, t.status = q, L(e), t.pending !== 0)
      return t.last_flush = -1, I;
  }
  if (t.status === pt) {
    if (e.adler = 0, S(t, 31), S(t, 139), S(t, 8), t.gzhead)
      S(
        t,
        (t.gzhead.text ? 1 : 0) + (t.gzhead.hcrc ? 2 : 0) + (t.gzhead.extra ? 4 : 0) + (t.gzhead.name ? 8 : 0) + (t.gzhead.comment ? 16 : 0)
      ), S(t, t.gzhead.time & 255), S(t, t.gzhead.time >> 8 & 255), S(t, t.gzhead.time >> 16 & 255), S(t, t.gzhead.time >> 24 & 255), S(t, t.level === 9 ? 2 : t.strategy >= Oe || t.level < 2 ? 4 : 0), S(t, t.gzhead.os & 255), t.gzhead.extra && t.gzhead.extra.length && (S(t, t.gzhead.extra.length & 255), S(t, t.gzhead.extra.length >> 8 & 255)), t.gzhead.hcrc && (e.adler = Z(e.adler, t.pending_buf, t.pending, 0)), t.gzindex = 0, t.status = _t;
    else if (S(t, 0), S(t, 0), S(t, 0), S(t, 0), S(t, 0), S(t, t.level === 9 ? 2 : t.strategy >= Oe || t.level < 2 ? 4 : 0), S(t, Cn), t.status = q, L(e), t.pending !== 0)
      return t.last_flush = -1, I;
  }
  if (t.status === _t) {
    if (t.gzhead.extra) {
      let r = t.pending, a = (t.gzhead.extra.length & 65535) - t.gzindex;
      for (; t.pending + a > t.pending_buf_size; ) {
        let o = t.pending_buf_size - t.pending;
        if (t.pending_buf.set(t.gzhead.extra.subarray(t.gzindex, t.gzindex + o), t.pending), t.pending = t.pending_buf_size, t.gzhead.hcrc && t.pending > r && (e.adler = Z(e.adler, t.pending_buf, t.pending - r, r)), t.gzindex += o, L(e), t.pending !== 0)
          return t.last_flush = -1, I;
        r = 0, a -= o;
      }
      let f = new Uint8Array(t.gzhead.extra);
      t.pending_buf.set(f.subarray(t.gzindex, t.gzindex + a), t.pending), t.pending += a, t.gzhead.hcrc && t.pending > r && (e.adler = Z(e.adler, t.pending_buf, t.pending - r, r)), t.gzindex = 0;
    }
    t.status = ht;
  }
  if (t.status === ht) {
    if (t.gzhead.name) {
      let r = t.pending, a;
      do {
        if (t.pending === t.pending_buf_size) {
          if (t.gzhead.hcrc && t.pending > r && (e.adler = Z(e.adler, t.pending_buf, t.pending - r, r)), L(e), t.pending !== 0)
            return t.last_flush = -1, I;
          r = 0;
        }
        t.gzindex < t.gzhead.name.length ? a = t.gzhead.name.charCodeAt(t.gzindex++) & 255 : a = 0, S(t, a);
      } while (a !== 0);
      t.gzhead.hcrc && t.pending > r && (e.adler = Z(e.adler, t.pending_buf, t.pending - r, r)), t.gzindex = 0;
    }
    t.status = dt;
  }
  if (t.status === dt) {
    if (t.gzhead.comment) {
      let r = t.pending, a;
      do {
        if (t.pending === t.pending_buf_size) {
          if (t.gzhead.hcrc && t.pending > r && (e.adler = Z(e.adler, t.pending_buf, t.pending - r, r)), L(e), t.pending !== 0)
            return t.last_flush = -1, I;
          r = 0;
        }
        t.gzindex < t.gzhead.comment.length ? a = t.gzhead.comment.charCodeAt(t.gzindex++) & 255 : a = 0, S(t, a);
      } while (a !== 0);
      t.gzhead.hcrc && t.pending > r && (e.adler = Z(e.adler, t.pending_buf, t.pending - r, r));
    }
    t.status = st;
  }
  if (t.status === st) {
    if (t.gzhead.hcrc) {
      if (t.pending + 2 > t.pending_buf_size && (L(e), t.pending !== 0))
        return t.last_flush = -1, I;
      S(t, e.adler & 255), S(t, e.adler >> 8 & 255), e.adler = 0;
    }
    if (t.status = q, L(e), t.pending !== 0)
      return t.last_flush = -1, I;
  }
  if (e.avail_in !== 0 || t.lookahead !== 0 || i !== W && t.status !== ue) {
    let r = t.level === 0 ? Ei(t, i) : t.strategy === Oe ? Hn(t, i) : t.strategy === yn ? Mn(t, i) : we[t.level].func(t, i);
    if ((r === te || r === se) && (t.status = ue), r === O || r === te)
      return e.avail_out === 0 && (t.last_flush = -1), I;
    if (r === de && (i === pn ? gn(t) : i !== zt && (ot(t, 0, 0, !1), i === xn && (Y(t.head), t.lookahead === 0 && (t.strstart = 0, t.block_start = 0, t.insert = 0))), L(e), e.avail_out === 0))
      return t.last_flush = -1, I;
  }
  return i !== C ? I : t.wrap <= 0 ? Tt : (t.wrap === 2 ? (S(t, e.adler & 255), S(t, e.adler >> 8 & 255), S(t, e.adler >> 16 & 255), S(t, e.adler >> 24 & 255), S(t, e.total_in & 255), S(t, e.total_in >> 8 & 255), S(t, e.total_in >> 16 & 255), S(t, e.total_in >> 24 & 255)) : (ce(t, e.adler >>> 16), ce(t, e.adler & 65535)), L(e), t.wrap > 0 && (t.wrap = -t.wrap), t.pending !== 0 ? I : Tt);
}, Gn = (e) => {
  if (Re(e))
    return H;
  const i = e.state.status;
  return e.state = null, i === q ? ee(e, kn) : I;
}, jn = (e, i) => {
  let t = i.length;
  if (Re(e))
    return H;
  const n = e.state, r = n.wrap;
  if (r === 2 || r === 1 && n.status !== fe || n.lookahead)
    return H;
  if (r === 1 && (e.adler = ye(e.adler, i, t, 0)), n.wrap = 0, t >= n.w_size) {
    r === 0 && (Y(n.head), n.strstart = 0, n.block_start = 0, n.insert = 0);
    let c = new Uint8Array(n.w_size);
    c.set(i.subarray(t - n.w_size, t), 0), i = c, t = n.w_size;
  }
  const a = e.avail_in, f = e.next_in, o = e.input;
  for (e.avail_in = t, e.next_in = 0, e.input = i, _e(n); n.lookahead >= k; ) {
    let c = n.strstart, l = n.lookahead - (k - 1);
    do
      n.ins_h = V(n, n.ins_h, n.window[c + k - 1]), n.prev[c & n.w_mask] = n.head[n.ins_h], n.head[n.ins_h] = c, c++;
    while (--l);
    n.strstart = c, n.lookahead = k - 1, _e(n);
  }
  return n.strstart += n.lookahead, n.block_start = n.strstart, n.insert = n.lookahead, n.lookahead = 0, n.match_length = n.prev_length = k - 1, n.match_available = 0, e.next_in = f, e.input = o, e.avail_in = a, n.wrap = r, I;
};
var Wn = Xn, Vn = Si, Jn = mi, Qn = yi, qn = Pn, ea = Yn, ta = Gn, ia = jn, na = "pako deflate (from Nodeca project)", ge = {
  deflateInit: Wn,
  deflateInit2: Vn,
  deflateReset: Jn,
  deflateResetKeep: Qn,
  deflateSetHeader: qn,
  deflate: ea,
  deflateEnd: ta,
  deflateSetDictionary: ia,
  deflateInfo: na
};
const aa = (e, i) => Object.prototype.hasOwnProperty.call(e, i);
var ra = function(e) {
  const i = Array.prototype.slice.call(arguments, 1);
  for (; i.length; ) {
    const t = i.shift();
    if (t) {
      if (typeof t != "object")
        throw new TypeError(t + "must be non-object");
      for (const n in t)
        aa(t, n) && (e[n] = t[n]);
    }
  }
  return e;
}, la = (e) => {
  let i = 0;
  for (let n = 0, r = e.length; n < r; n++)
    i += e[n].length;
  const t = new Uint8Array(i);
  for (let n = 0, r = 0, a = e.length; n < a; n++) {
    let f = e[n];
    t.set(f, r), r += f.length;
  }
  return t;
}, Ke = {
  assign: ra,
  flattenChunks: la
};
let Ai = !0;
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch {
  Ai = !1;
}
const me = new Uint8Array(256);
for (let e = 0; e < 256; e++)
  me[e] = e >= 252 ? 6 : e >= 248 ? 5 : e >= 240 ? 4 : e >= 224 ? 3 : e >= 192 ? 2 : 1;
me[254] = me[254] = 1;
var oa = (e) => {
  if (typeof TextEncoder == "function" && TextEncoder.prototype.encode)
    return new TextEncoder().encode(e);
  let i, t, n, r, a, f = e.length, o = 0;
  for (r = 0; r < f; r++)
    t = e.charCodeAt(r), (t & 64512) === 55296 && r + 1 < f && (n = e.charCodeAt(r + 1), (n & 64512) === 56320 && (t = 65536 + (t - 55296 << 10) + (n - 56320), r++)), o += t < 128 ? 1 : t < 2048 ? 2 : t < 65536 ? 3 : 4;
  for (i = new Uint8Array(o), a = 0, r = 0; a < o; r++)
    t = e.charCodeAt(r), (t & 64512) === 55296 && r + 1 < f && (n = e.charCodeAt(r + 1), (n & 64512) === 56320 && (t = 65536 + (t - 55296 << 10) + (n - 56320), r++)), t < 128 ? i[a++] = t : t < 2048 ? (i[a++] = 192 | t >>> 6, i[a++] = 128 | t & 63) : t < 65536 ? (i[a++] = 224 | t >>> 12, i[a++] = 128 | t >>> 6 & 63, i[a++] = 128 | t & 63) : (i[a++] = 240 | t >>> 18, i[a++] = 128 | t >>> 12 & 63, i[a++] = 128 | t >>> 6 & 63, i[a++] = 128 | t & 63);
  return i;
};
const fa = (e, i) => {
  if (i < 65534 && e.subarray && Ai)
    return String.fromCharCode.apply(null, e.length === i ? e : e.subarray(0, i));
  let t = "";
  for (let n = 0; n < i; n++)
    t += String.fromCharCode(e[n]);
  return t;
};
var _a = (e, i) => {
  const t = i || e.length;
  if (typeof TextDecoder == "function" && TextDecoder.prototype.decode)
    return new TextDecoder().decode(e.subarray(0, i));
  let n, r;
  const a = new Array(t * 2);
  for (r = 0, n = 0; n < t; ) {
    let f = e[n++];
    if (f < 128) {
      a[r++] = f;
      continue;
    }
    let o = me[f];
    if (o > 4) {
      a[r++] = 65533, n += o - 1;
      continue;
    }
    for (f &= o === 2 ? 31 : o === 3 ? 15 : 7; o > 1 && n < t; )
      f = f << 6 | e[n++] & 63, o--;
    if (o > 1) {
      a[r++] = 65533;
      continue;
    }
    f < 65536 ? a[r++] = f : (f -= 65536, a[r++] = 55296 | f >> 10 & 1023, a[r++] = 56320 | f & 1023);
  }
  return fa(a, r);
}, ha = (e, i) => {
  i = i || e.length, i > e.length && (i = e.length);
  let t = i - 1;
  for (; t >= 0 && (e[t] & 192) === 128; )
    t--;
  return t < 0 || t === 0 ? i : t + me[e[t]] > i ? t : i;
}, Se = {
  string2buf: oa,
  buf2string: _a,
  utf8border: ha
};
function da() {
  this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
}
var zi = da;
const Ti = Object.prototype.toString, {
  Z_NO_FLUSH: sa,
  Z_SYNC_FLUSH: ca,
  Z_FULL_FLUSH: ua,
  Z_FINISH: wa,
  Z_OK: Me,
  Z_STREAM_END: ba,
  Z_DEFAULT_COMPRESSION: ga,
  Z_DEFAULT_STRATEGY: pa,
  Z_DEFLATED: xa
} = Te;
function xt(e) {
  this.options = Ke.assign({
    level: ga,
    method: xa,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: pa
  }, e || {});
  let i = this.options;
  i.raw && i.windowBits > 0 ? i.windowBits = -i.windowBits : i.gzip && i.windowBits > 0 && i.windowBits < 16 && (i.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new zi(), this.strm.avail_out = 0;
  let t = ge.deflateInit2(
    this.strm,
    i.level,
    i.method,
    i.windowBits,
    i.memLevel,
    i.strategy
  );
  if (t !== Me)
    throw new Error(oe[t]);
  if (i.header && ge.deflateSetHeader(this.strm, i.header), i.dictionary) {
    let n;
    if (typeof i.dictionary == "string" ? n = Se.string2buf(i.dictionary) : Ti.call(i.dictionary) === "[object ArrayBuffer]" ? n = new Uint8Array(i.dictionary) : n = i.dictionary, t = ge.deflateSetDictionary(this.strm, n), t !== Me)
      throw new Error(oe[t]);
    this._dict_set = !0;
  }
}
xt.prototype.push = function(e, i) {
  const t = this.strm, n = this.options.chunkSize;
  let r, a;
  if (this.ended)
    return !1;
  for (i === ~~i ? a = i : a = i === !0 ? wa : sa, typeof e == "string" ? t.input = Se.string2buf(e) : Ti.call(e) === "[object ArrayBuffer]" ? t.input = new Uint8Array(e) : t.input = e, t.next_in = 0, t.avail_in = t.input.length; ; ) {
    if (t.avail_out === 0 && (t.output = new Uint8Array(n), t.next_out = 0, t.avail_out = n), (a === ca || a === ua) && t.avail_out <= 6) {
      this.onData(t.output.subarray(0, t.next_out)), t.avail_out = 0;
      continue;
    }
    if (r = ge.deflate(t, a), r === ba)
      return t.next_out > 0 && this.onData(t.output.subarray(0, t.next_out)), r = ge.deflateEnd(this.strm), this.onEnd(r), this.ended = !0, r === Me;
    if (t.avail_out === 0) {
      this.onData(t.output);
      continue;
    }
    if (a > 0 && t.next_out > 0) {
      this.onData(t.output.subarray(0, t.next_out)), t.avail_out = 0;
      continue;
    }
    if (t.avail_in === 0)
      break;
  }
  return !0;
};
xt.prototype.onData = function(e) {
  this.chunks.push(e);
};
xt.prototype.onEnd = function(e) {
  e === Me && (this.result = Ke.flattenChunks(this.chunks)), this.chunks = [], this.err = e, this.msg = this.strm.msg;
};
const Ne = 16209, ka = 16191;
var va = function(i, t) {
  let n, r, a, f, o, c, l, _, y, s, h, u, R, v, g, A, p, d, m, D, w, z, E, b;
  const x = i.state;
  n = i.next_in, E = i.input, r = n + (i.avail_in - 5), a = i.next_out, b = i.output, f = a - (t - i.avail_out), o = a + (i.avail_out - 257), c = x.dmax, l = x.wsize, _ = x.whave, y = x.wnext, s = x.window, h = x.hold, u = x.bits, R = x.lencode, v = x.distcode, g = (1 << x.lenbits) - 1, A = (1 << x.distbits) - 1;
  e:
    do {
      u < 15 && (h += E[n++] << u, u += 8, h += E[n++] << u, u += 8), p = R[h & g];
      t:
        for (; ; ) {
          if (d = p >>> 24, h >>>= d, u -= d, d = p >>> 16 & 255, d === 0)
            b[a++] = p & 65535;
          else if (d & 16) {
            m = p & 65535, d &= 15, d && (u < d && (h += E[n++] << u, u += 8), m += h & (1 << d) - 1, h >>>= d, u -= d), u < 15 && (h += E[n++] << u, u += 8, h += E[n++] << u, u += 8), p = v[h & A];
            i:
              for (; ; ) {
                if (d = p >>> 24, h >>>= d, u -= d, d = p >>> 16 & 255, d & 16) {
                  if (D = p & 65535, d &= 15, u < d && (h += E[n++] << u, u += 8, u < d && (h += E[n++] << u, u += 8)), D += h & (1 << d) - 1, D > c) {
                    i.msg = "invalid distance too far back", x.mode = Ne;
                    break e;
                  }
                  if (h >>>= d, u -= d, d = a - f, D > d) {
                    if (d = D - d, d > _ && x.sane) {
                      i.msg = "invalid distance too far back", x.mode = Ne;
                      break e;
                    }
                    if (w = 0, z = s, y === 0) {
                      if (w += l - d, d < m) {
                        m -= d;
                        do
                          b[a++] = s[w++];
                        while (--d);
                        w = a - D, z = b;
                      }
                    } else if (y < d) {
                      if (w += l + y - d, d -= y, d < m) {
                        m -= d;
                        do
                          b[a++] = s[w++];
                        while (--d);
                        if (w = 0, y < m) {
                          d = y, m -= d;
                          do
                            b[a++] = s[w++];
                          while (--d);
                          w = a - D, z = b;
                        }
                      }
                    } else if (w += y - d, d < m) {
                      m -= d;
                      do
                        b[a++] = s[w++];
                      while (--d);
                      w = a - D, z = b;
                    }
                    for (; m > 2; )
                      b[a++] = z[w++], b[a++] = z[w++], b[a++] = z[w++], m -= 3;
                    m && (b[a++] = z[w++], m > 1 && (b[a++] = z[w++]));
                  } else {
                    w = a - D;
                    do
                      b[a++] = b[w++], b[a++] = b[w++], b[a++] = b[w++], m -= 3;
                    while (m > 2);
                    m && (b[a++] = b[w++], m > 1 && (b[a++] = b[w++]));
                  }
                } else if (d & 64) {
                  i.msg = "invalid distance code", x.mode = Ne;
                  break e;
                } else {
                  p = v[(p & 65535) + (h & (1 << d) - 1)];
                  continue i;
                }
                break;
              }
          } else if (d & 64)
            if (d & 32) {
              x.mode = ka;
              break e;
            } else {
              i.msg = "invalid literal/length code", x.mode = Ne;
              break e;
            }
          else {
            p = R[(p & 65535) + (h & (1 << d) - 1)];
            continue t;
          }
          break;
        }
    } while (n < r && a < o);
  m = u >> 3, n -= m, u -= m << 3, h &= (1 << u) - 1, i.next_in = n, i.next_out = a, i.avail_in = n < r ? 5 + (r - n) : 5 - (n - r), i.avail_out = a < o ? 257 + (o - a) : 257 - (a - o), x.hold = h, x.bits = u;
};
const re = 15, Dt = 852, Zt = 592, It = 0, Je = 1, Ot = 2, Ea = new Uint16Array([
  /* Length codes 257..285 base */
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  13,
  15,
  17,
  19,
  23,
  27,
  31,
  35,
  43,
  51,
  59,
  67,
  83,
  99,
  115,
  131,
  163,
  195,
  227,
  258,
  0,
  0
]), ya = new Uint8Array([
  /* Length codes 257..285 extra */
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  17,
  17,
  17,
  17,
  18,
  18,
  18,
  18,
  19,
  19,
  19,
  19,
  20,
  20,
  20,
  20,
  21,
  21,
  21,
  21,
  16,
  72,
  78
]), ma = new Uint16Array([
  /* Distance codes 0..29 base */
  1,
  2,
  3,
  4,
  5,
  7,
  9,
  13,
  17,
  25,
  33,
  49,
  65,
  97,
  129,
  193,
  257,
  385,
  513,
  769,
  1025,
  1537,
  2049,
  3073,
  4097,
  6145,
  8193,
  12289,
  16385,
  24577,
  0,
  0
]), Sa = new Uint8Array([
  /* Distance codes 0..29 extra */
  16,
  16,
  16,
  16,
  17,
  17,
  18,
  18,
  19,
  19,
  20,
  20,
  21,
  21,
  22,
  22,
  23,
  23,
  24,
  24,
  25,
  25,
  26,
  26,
  27,
  27,
  28,
  28,
  29,
  29,
  64,
  64
]), Aa = (e, i, t, n, r, a, f, o) => {
  const c = o.bits;
  let l = 0, _ = 0, y = 0, s = 0, h = 0, u = 0, R = 0, v = 0, g = 0, A = 0, p, d, m, D, w, z = null, E;
  const b = new Uint16Array(re + 1), x = new Uint16Array(re + 1);
  let J = null, vt, Ze, Ie;
  for (l = 0; l <= re; l++)
    b[l] = 0;
  for (_ = 0; _ < n; _++)
    b[i[t + _]]++;
  for (h = c, s = re; s >= 1 && b[s] === 0; s--)
    ;
  if (h > s && (h = s), s === 0)
    return r[a++] = 1 << 24 | 64 << 16 | 0, r[a++] = 1 << 24 | 64 << 16 | 0, o.bits = 1, 0;
  for (y = 1; y < s && b[y] === 0; y++)
    ;
  for (h < y && (h = y), v = 1, l = 1; l <= re; l++)
    if (v <<= 1, v -= b[l], v < 0)
      return -1;
  if (v > 0 && (e === It || s !== 1))
    return -1;
  for (x[1] = 0, l = 1; l < re; l++)
    x[l + 1] = x[l] + b[l];
  for (_ = 0; _ < n; _++)
    i[t + _] !== 0 && (f[x[i[t + _]]++] = _);
  if (e === It ? (z = J = f, E = 20) : e === Je ? (z = Ea, J = ya, E = 257) : (z = ma, J = Sa, E = 0), A = 0, _ = 0, l = y, w = a, u = h, R = 0, m = -1, g = 1 << h, D = g - 1, e === Je && g > Dt || e === Ot && g > Zt)
    return 1;
  for (; ; ) {
    vt = l - R, f[_] + 1 < E ? (Ze = 0, Ie = f[_]) : f[_] >= E ? (Ze = J[f[_] - E], Ie = z[f[_] - E]) : (Ze = 32 + 64, Ie = 0), p = 1 << l - R, d = 1 << u, y = d;
    do
      d -= p, r[w + (A >> R) + d] = vt << 24 | Ze << 16 | Ie | 0;
    while (d !== 0);
    for (p = 1 << l - 1; A & p; )
      p >>= 1;
    if (p !== 0 ? (A &= p - 1, A += p) : A = 0, _++, --b[l] === 0) {
      if (l === s)
        break;
      l = i[t + f[_]];
    }
    if (l > h && (A & D) !== m) {
      for (R === 0 && (R = h), w += y, u = l - R, v = 1 << u; u + R < s && (v -= b[u + R], !(v <= 0)); )
        u++, v <<= 1;
      if (g += 1 << u, e === Je && g > Dt || e === Ot && g > Zt)
        return 1;
      m = A & D, r[m] = h << 24 | u << 16 | w - a | 0;
    }
  }
  return A !== 0 && (r[w + A] = l - R << 24 | 64 << 16 | 0), o.bits = h, 0;
};
var pe = Aa;
const za = 0, Ri = 1, Di = 2, {
  Z_FINISH: Nt,
  Z_BLOCK: Ta,
  Z_TREES: Le,
  Z_OK: ie,
  Z_STREAM_END: Ra,
  Z_NEED_DICT: Da,
  Z_STREAM_ERROR: $,
  Z_DATA_ERROR: Zi,
  Z_MEM_ERROR: Ii,
  Z_BUF_ERROR: Za,
  Z_DEFLATED: Lt
} = Te, Pe = 16180, Ut = 16181, Ct = 16182, $t = 16183, Ft = 16184, Mt = 16185, Ht = 16186, Bt = 16187, Kt = 16188, Pt = 16189, He = 16190, K = 16191, Qe = 16192, Xt = 16193, qe = 16194, Yt = 16195, Gt = 16196, jt = 16197, Wt = 16198, Ue = 16199, Ce = 16200, Vt = 16201, Jt = 16202, Qt = 16203, qt = 16204, ei = 16205, et = 16206, ti = 16207, ii = 16208, T = 16209, Oi = 16210, Ni = 16211, Ia = 852, Oa = 592, Na = 15, La = Na, ni = (e) => (e >>> 24 & 255) + (e >>> 8 & 65280) + ((e & 65280) << 8) + ((e & 255) << 24);
function Ua() {
  this.strm = null, this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new Uint16Array(320), this.work = new Uint16Array(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
}
const ne = (e) => {
  if (!e)
    return 1;
  const i = e.state;
  return !i || i.strm !== e || i.mode < Pe || i.mode > Ni ? 1 : 0;
}, Li = (e) => {
  if (ne(e))
    return $;
  const i = e.state;
  return e.total_in = e.total_out = i.total = 0, e.msg = "", i.wrap && (e.adler = i.wrap & 1), i.mode = Pe, i.last = 0, i.havedict = 0, i.flags = -1, i.dmax = 32768, i.head = null, i.hold = 0, i.bits = 0, i.lencode = i.lendyn = new Int32Array(Ia), i.distcode = i.distdyn = new Int32Array(Oa), i.sane = 1, i.back = -1, ie;
}, Ui = (e) => {
  if (ne(e))
    return $;
  const i = e.state;
  return i.wsize = 0, i.whave = 0, i.wnext = 0, Li(e);
}, Ci = (e, i) => {
  let t;
  if (ne(e))
    return $;
  const n = e.state;
  return i < 0 ? (t = 0, i = -i) : (t = (i >> 4) + 5, i < 48 && (i &= 15)), i && (i < 8 || i > 15) ? $ : (n.window !== null && n.wbits !== i && (n.window = null), n.wrap = t, n.wbits = i, Ui(e));
}, $i = (e, i) => {
  if (!e)
    return $;
  const t = new Ua();
  e.state = t, t.strm = e, t.window = null, t.mode = Pe;
  const n = Ci(e, i);
  return n !== ie && (e.state = null), n;
}, Ca = (e) => $i(e, La);
let ai = !0, tt, it;
const $a = (e) => {
  if (ai) {
    tt = new Int32Array(512), it = new Int32Array(32);
    let i = 0;
    for (; i < 144; )
      e.lens[i++] = 8;
    for (; i < 256; )
      e.lens[i++] = 9;
    for (; i < 280; )
      e.lens[i++] = 7;
    for (; i < 288; )
      e.lens[i++] = 8;
    for (pe(Ri, e.lens, 0, 288, tt, 0, e.work, { bits: 9 }), i = 0; i < 32; )
      e.lens[i++] = 5;
    pe(Di, e.lens, 0, 32, it, 0, e.work, { bits: 5 }), ai = !1;
  }
  e.lencode = tt, e.lenbits = 9, e.distcode = it, e.distbits = 5;
}, Fi = (e, i, t, n) => {
  let r;
  const a = e.state;
  return a.window === null && (a.wsize = 1 << a.wbits, a.wnext = 0, a.whave = 0, a.window = new Uint8Array(a.wsize)), n >= a.wsize ? (a.window.set(i.subarray(t - a.wsize, t), 0), a.wnext = 0, a.whave = a.wsize) : (r = a.wsize - a.wnext, r > n && (r = n), a.window.set(i.subarray(t - n, t - n + r), a.wnext), n -= r, n ? (a.window.set(i.subarray(t - n, t), 0), a.wnext = n, a.whave = a.wsize) : (a.wnext += r, a.wnext === a.wsize && (a.wnext = 0), a.whave < a.wsize && (a.whave += r))), 0;
}, Fa = (e, i) => {
  let t, n, r, a, f, o, c, l, _, y, s, h, u, R, v = 0, g, A, p, d, m, D, w, z;
  const E = new Uint8Array(4);
  let b, x;
  const J = (
    /* permutation of code lengths */
    new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15])
  );
  if (ne(e) || !e.output || !e.input && e.avail_in !== 0)
    return $;
  t = e.state, t.mode === K && (t.mode = Qe), f = e.next_out, r = e.output, c = e.avail_out, a = e.next_in, n = e.input, o = e.avail_in, l = t.hold, _ = t.bits, y = o, s = c, z = ie;
  e:
    for (; ; )
      switch (t.mode) {
        case Pe:
          if (t.wrap === 0) {
            t.mode = Qe;
            break;
          }
          for (; _ < 16; ) {
            if (o === 0)
              break e;
            o--, l += n[a++] << _, _ += 8;
          }
          if (t.wrap & 2 && l === 35615) {
            t.wbits === 0 && (t.wbits = 15), t.check = 0, E[0] = l & 255, E[1] = l >>> 8 & 255, t.check = Z(t.check, E, 2, 0), l = 0, _ = 0, t.mode = Ut;
            break;
          }
          if (t.head && (t.head.done = !1), !(t.wrap & 1) || /* check if zlib header allowed */
          (((l & 255) << 8) + (l >> 8)) % 31) {
            e.msg = "incorrect header check", t.mode = T;
            break;
          }
          if ((l & 15) !== Lt) {
            e.msg = "unknown compression method", t.mode = T;
            break;
          }
          if (l >>>= 4, _ -= 4, w = (l & 15) + 8, t.wbits === 0 && (t.wbits = w), w > 15 || w > t.wbits) {
            e.msg = "invalid window size", t.mode = T;
            break;
          }
          t.dmax = 1 << t.wbits, t.flags = 0, e.adler = t.check = 1, t.mode = l & 512 ? Pt : K, l = 0, _ = 0;
          break;
        case Ut:
          for (; _ < 16; ) {
            if (o === 0)
              break e;
            o--, l += n[a++] << _, _ += 8;
          }
          if (t.flags = l, (t.flags & 255) !== Lt) {
            e.msg = "unknown compression method", t.mode = T;
            break;
          }
          if (t.flags & 57344) {
            e.msg = "unknown header flags set", t.mode = T;
            break;
          }
          t.head && (t.head.text = l >> 8 & 1), t.flags & 512 && t.wrap & 4 && (E[0] = l & 255, E[1] = l >>> 8 & 255, t.check = Z(t.check, E, 2, 0)), l = 0, _ = 0, t.mode = Ct;
        case Ct:
          for (; _ < 32; ) {
            if (o === 0)
              break e;
            o--, l += n[a++] << _, _ += 8;
          }
          t.head && (t.head.time = l), t.flags & 512 && t.wrap & 4 && (E[0] = l & 255, E[1] = l >>> 8 & 255, E[2] = l >>> 16 & 255, E[3] = l >>> 24 & 255, t.check = Z(t.check, E, 4, 0)), l = 0, _ = 0, t.mode = $t;
        case $t:
          for (; _ < 16; ) {
            if (o === 0)
              break e;
            o--, l += n[a++] << _, _ += 8;
          }
          t.head && (t.head.xflags = l & 255, t.head.os = l >> 8), t.flags & 512 && t.wrap & 4 && (E[0] = l & 255, E[1] = l >>> 8 & 255, t.check = Z(t.check, E, 2, 0)), l = 0, _ = 0, t.mode = Ft;
        case Ft:
          if (t.flags & 1024) {
            for (; _ < 16; ) {
              if (o === 0)
                break e;
              o--, l += n[a++] << _, _ += 8;
            }
            t.length = l, t.head && (t.head.extra_len = l), t.flags & 512 && t.wrap & 4 && (E[0] = l & 255, E[1] = l >>> 8 & 255, t.check = Z(t.check, E, 2, 0)), l = 0, _ = 0;
          } else
            t.head && (t.head.extra = null);
          t.mode = Mt;
        case Mt:
          if (t.flags & 1024 && (h = t.length, h > o && (h = o), h && (t.head && (w = t.head.extra_len - t.length, t.head.extra || (t.head.extra = new Uint8Array(t.head.extra_len)), t.head.extra.set(
            n.subarray(
              a,
              // extra field is limited to 65536 bytes
              // - no need for additional size check
              a + h
            ),
            /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
            w
          )), t.flags & 512 && t.wrap & 4 && (t.check = Z(t.check, n, h, a)), o -= h, a += h, t.length -= h), t.length))
            break e;
          t.length = 0, t.mode = Ht;
        case Ht:
          if (t.flags & 2048) {
            if (o === 0)
              break e;
            h = 0;
            do
              w = n[a + h++], t.head && w && t.length < 65536 && (t.head.name += String.fromCharCode(w));
            while (w && h < o);
            if (t.flags & 512 && t.wrap & 4 && (t.check = Z(t.check, n, h, a)), o -= h, a += h, w)
              break e;
          } else
            t.head && (t.head.name = null);
          t.length = 0, t.mode = Bt;
        case Bt:
          if (t.flags & 4096) {
            if (o === 0)
              break e;
            h = 0;
            do
              w = n[a + h++], t.head && w && t.length < 65536 && (t.head.comment += String.fromCharCode(w));
            while (w && h < o);
            if (t.flags & 512 && t.wrap & 4 && (t.check = Z(t.check, n, h, a)), o -= h, a += h, w)
              break e;
          } else
            t.head && (t.head.comment = null);
          t.mode = Kt;
        case Kt:
          if (t.flags & 512) {
            for (; _ < 16; ) {
              if (o === 0)
                break e;
              o--, l += n[a++] << _, _ += 8;
            }
            if (t.wrap & 4 && l !== (t.check & 65535)) {
              e.msg = "header crc mismatch", t.mode = T;
              break;
            }
            l = 0, _ = 0;
          }
          t.head && (t.head.hcrc = t.flags >> 9 & 1, t.head.done = !0), e.adler = t.check = 0, t.mode = K;
          break;
        case Pt:
          for (; _ < 32; ) {
            if (o === 0)
              break e;
            o--, l += n[a++] << _, _ += 8;
          }
          e.adler = t.check = ni(l), l = 0, _ = 0, t.mode = He;
        case He:
          if (t.havedict === 0)
            return e.next_out = f, e.avail_out = c, e.next_in = a, e.avail_in = o, t.hold = l, t.bits = _, Da;
          e.adler = t.check = 1, t.mode = K;
        case K:
          if (i === Ta || i === Le)
            break e;
        case Qe:
          if (t.last) {
            l >>>= _ & 7, _ -= _ & 7, t.mode = et;
            break;
          }
          for (; _ < 3; ) {
            if (o === 0)
              break e;
            o--, l += n[a++] << _, _ += 8;
          }
          switch (t.last = l & 1, l >>>= 1, _ -= 1, l & 3) {
            case 0:
              t.mode = Xt;
              break;
            case 1:
              if ($a(t), t.mode = Ue, i === Le) {
                l >>>= 2, _ -= 2;
                break e;
              }
              break;
            case 2:
              t.mode = Gt;
              break;
            case 3:
              e.msg = "invalid block type", t.mode = T;
          }
          l >>>= 2, _ -= 2;
          break;
        case Xt:
          for (l >>>= _ & 7, _ -= _ & 7; _ < 32; ) {
            if (o === 0)
              break e;
            o--, l += n[a++] << _, _ += 8;
          }
          if ((l & 65535) !== (l >>> 16 ^ 65535)) {
            e.msg = "invalid stored block lengths", t.mode = T;
            break;
          }
          if (t.length = l & 65535, l = 0, _ = 0, t.mode = qe, i === Le)
            break e;
        case qe:
          t.mode = Yt;
        case Yt:
          if (h = t.length, h) {
            if (h > o && (h = o), h > c && (h = c), h === 0)
              break e;
            r.set(n.subarray(a, a + h), f), o -= h, a += h, c -= h, f += h, t.length -= h;
            break;
          }
          t.mode = K;
          break;
        case Gt:
          for (; _ < 14; ) {
            if (o === 0)
              break e;
            o--, l += n[a++] << _, _ += 8;
          }
          if (t.nlen = (l & 31) + 257, l >>>= 5, _ -= 5, t.ndist = (l & 31) + 1, l >>>= 5, _ -= 5, t.ncode = (l & 15) + 4, l >>>= 4, _ -= 4, t.nlen > 286 || t.ndist > 30) {
            e.msg = "too many length or distance symbols", t.mode = T;
            break;
          }
          t.have = 0, t.mode = jt;
        case jt:
          for (; t.have < t.ncode; ) {
            for (; _ < 3; ) {
              if (o === 0)
                break e;
              o--, l += n[a++] << _, _ += 8;
            }
            t.lens[J[t.have++]] = l & 7, l >>>= 3, _ -= 3;
          }
          for (; t.have < 19; )
            t.lens[J[t.have++]] = 0;
          if (t.lencode = t.lendyn, t.lenbits = 7, b = { bits: t.lenbits }, z = pe(za, t.lens, 0, 19, t.lencode, 0, t.work, b), t.lenbits = b.bits, z) {
            e.msg = "invalid code lengths set", t.mode = T;
            break;
          }
          t.have = 0, t.mode = Wt;
        case Wt:
          for (; t.have < t.nlen + t.ndist; ) {
            for (; v = t.lencode[l & (1 << t.lenbits) - 1], g = v >>> 24, A = v >>> 16 & 255, p = v & 65535, !(g <= _); ) {
              if (o === 0)
                break e;
              o--, l += n[a++] << _, _ += 8;
            }
            if (p < 16)
              l >>>= g, _ -= g, t.lens[t.have++] = p;
            else {
              if (p === 16) {
                for (x = g + 2; _ < x; ) {
                  if (o === 0)
                    break e;
                  o--, l += n[a++] << _, _ += 8;
                }
                if (l >>>= g, _ -= g, t.have === 0) {
                  e.msg = "invalid bit length repeat", t.mode = T;
                  break;
                }
                w = t.lens[t.have - 1], h = 3 + (l & 3), l >>>= 2, _ -= 2;
              } else if (p === 17) {
                for (x = g + 3; _ < x; ) {
                  if (o === 0)
                    break e;
                  o--, l += n[a++] << _, _ += 8;
                }
                l >>>= g, _ -= g, w = 0, h = 3 + (l & 7), l >>>= 3, _ -= 3;
              } else {
                for (x = g + 7; _ < x; ) {
                  if (o === 0)
                    break e;
                  o--, l += n[a++] << _, _ += 8;
                }
                l >>>= g, _ -= g, w = 0, h = 11 + (l & 127), l >>>= 7, _ -= 7;
              }
              if (t.have + h > t.nlen + t.ndist) {
                e.msg = "invalid bit length repeat", t.mode = T;
                break;
              }
              for (; h--; )
                t.lens[t.have++] = w;
            }
          }
          if (t.mode === T)
            break;
          if (t.lens[256] === 0) {
            e.msg = "invalid code -- missing end-of-block", t.mode = T;
            break;
          }
          if (t.lenbits = 9, b = { bits: t.lenbits }, z = pe(Ri, t.lens, 0, t.nlen, t.lencode, 0, t.work, b), t.lenbits = b.bits, z) {
            e.msg = "invalid literal/lengths set", t.mode = T;
            break;
          }
          if (t.distbits = 6, t.distcode = t.distdyn, b = { bits: t.distbits }, z = pe(Di, t.lens, t.nlen, t.ndist, t.distcode, 0, t.work, b), t.distbits = b.bits, z) {
            e.msg = "invalid distances set", t.mode = T;
            break;
          }
          if (t.mode = Ue, i === Le)
            break e;
        case Ue:
          t.mode = Ce;
        case Ce:
          if (o >= 6 && c >= 258) {
            e.next_out = f, e.avail_out = c, e.next_in = a, e.avail_in = o, t.hold = l, t.bits = _, va(e, s), f = e.next_out, r = e.output, c = e.avail_out, a = e.next_in, n = e.input, o = e.avail_in, l = t.hold, _ = t.bits, t.mode === K && (t.back = -1);
            break;
          }
          for (t.back = 0; v = t.lencode[l & (1 << t.lenbits) - 1], g = v >>> 24, A = v >>> 16 & 255, p = v & 65535, !(g <= _); ) {
            if (o === 0)
              break e;
            o--, l += n[a++] << _, _ += 8;
          }
          if (A && !(A & 240)) {
            for (d = g, m = A, D = p; v = t.lencode[D + ((l & (1 << d + m) - 1) >> d)], g = v >>> 24, A = v >>> 16 & 255, p = v & 65535, !(d + g <= _); ) {
              if (o === 0)
                break e;
              o--, l += n[a++] << _, _ += 8;
            }
            l >>>= d, _ -= d, t.back += d;
          }
          if (l >>>= g, _ -= g, t.back += g, t.length = p, A === 0) {
            t.mode = ei;
            break;
          }
          if (A & 32) {
            t.back = -1, t.mode = K;
            break;
          }
          if (A & 64) {
            e.msg = "invalid literal/length code", t.mode = T;
            break;
          }
          t.extra = A & 15, t.mode = Vt;
        case Vt:
          if (t.extra) {
            for (x = t.extra; _ < x; ) {
              if (o === 0)
                break e;
              o--, l += n[a++] << _, _ += 8;
            }
            t.length += l & (1 << t.extra) - 1, l >>>= t.extra, _ -= t.extra, t.back += t.extra;
          }
          t.was = t.length, t.mode = Jt;
        case Jt:
          for (; v = t.distcode[l & (1 << t.distbits) - 1], g = v >>> 24, A = v >>> 16 & 255, p = v & 65535, !(g <= _); ) {
            if (o === 0)
              break e;
            o--, l += n[a++] << _, _ += 8;
          }
          if (!(A & 240)) {
            for (d = g, m = A, D = p; v = t.distcode[D + ((l & (1 << d + m) - 1) >> d)], g = v >>> 24, A = v >>> 16 & 255, p = v & 65535, !(d + g <= _); ) {
              if (o === 0)
                break e;
              o--, l += n[a++] << _, _ += 8;
            }
            l >>>= d, _ -= d, t.back += d;
          }
          if (l >>>= g, _ -= g, t.back += g, A & 64) {
            e.msg = "invalid distance code", t.mode = T;
            break;
          }
          t.offset = p, t.extra = A & 15, t.mode = Qt;
        case Qt:
          if (t.extra) {
            for (x = t.extra; _ < x; ) {
              if (o === 0)
                break e;
              o--, l += n[a++] << _, _ += 8;
            }
            t.offset += l & (1 << t.extra) - 1, l >>>= t.extra, _ -= t.extra, t.back += t.extra;
          }
          if (t.offset > t.dmax) {
            e.msg = "invalid distance too far back", t.mode = T;
            break;
          }
          t.mode = qt;
        case qt:
          if (c === 0)
            break e;
          if (h = s - c, t.offset > h) {
            if (h = t.offset - h, h > t.whave && t.sane) {
              e.msg = "invalid distance too far back", t.mode = T;
              break;
            }
            h > t.wnext ? (h -= t.wnext, u = t.wsize - h) : u = t.wnext - h, h > t.length && (h = t.length), R = t.window;
          } else
            R = r, u = f - t.offset, h = t.length;
          h > c && (h = c), c -= h, t.length -= h;
          do
            r[f++] = R[u++];
          while (--h);
          t.length === 0 && (t.mode = Ce);
          break;
        case ei:
          if (c === 0)
            break e;
          r[f++] = t.length, c--, t.mode = Ce;
          break;
        case et:
          if (t.wrap) {
            for (; _ < 32; ) {
              if (o === 0)
                break e;
              o--, l |= n[a++] << _, _ += 8;
            }
            if (s -= c, e.total_out += s, t.total += s, t.wrap & 4 && s && (e.adler = t.check = /*UPDATE_CHECK(state.check, put - _out, _out);*/
            t.flags ? Z(t.check, r, s, f - s) : ye(t.check, r, s, f - s)), s = c, t.wrap & 4 && (t.flags ? l : ni(l)) !== t.check) {
              e.msg = "incorrect data check", t.mode = T;
              break;
            }
            l = 0, _ = 0;
          }
          t.mode = ti;
        case ti:
          if (t.wrap && t.flags) {
            for (; _ < 32; ) {
              if (o === 0)
                break e;
              o--, l += n[a++] << _, _ += 8;
            }
            if (t.wrap & 4 && l !== (t.total & 4294967295)) {
              e.msg = "incorrect length check", t.mode = T;
              break;
            }
            l = 0, _ = 0;
          }
          t.mode = ii;
        case ii:
          z = Ra;
          break e;
        case T:
          z = Zi;
          break e;
        case Oi:
          return Ii;
        case Ni:
        default:
          return $;
      }
  return e.next_out = f, e.avail_out = c, e.next_in = a, e.avail_in = o, t.hold = l, t.bits = _, (t.wsize || s !== e.avail_out && t.mode < T && (t.mode < et || i !== Nt)) && Fi(e, e.output, e.next_out, s - e.avail_out), y -= e.avail_in, s -= e.avail_out, e.total_in += y, e.total_out += s, t.total += s, t.wrap & 4 && s && (e.adler = t.check = /*UPDATE_CHECK(state.check, strm.next_out - _out, _out);*/
  t.flags ? Z(t.check, r, s, e.next_out - s) : ye(t.check, r, s, e.next_out - s)), e.data_type = t.bits + (t.last ? 64 : 0) + (t.mode === K ? 128 : 0) + (t.mode === Ue || t.mode === qe ? 256 : 0), (y === 0 && s === 0 || i === Nt) && z === ie && (z = Za), z;
}, Ma = (e) => {
  if (ne(e))
    return $;
  let i = e.state;
  return i.window && (i.window = null), e.state = null, ie;
}, Ha = (e, i) => {
  if (ne(e))
    return $;
  const t = e.state;
  return t.wrap & 2 ? (t.head = i, i.done = !1, ie) : $;
}, Ba = (e, i) => {
  const t = i.length;
  let n, r, a;
  return ne(e) || (n = e.state, n.wrap !== 0 && n.mode !== He) ? $ : n.mode === He && (r = 1, r = ye(r, i, t, 0), r !== n.check) ? Zi : (a = Fi(e, i, t, t), a ? (n.mode = Oi, Ii) : (n.havedict = 1, ie));
};
var Ka = Ui, Pa = Ci, Xa = Li, Ya = Ca, Ga = $i, ja = Fa, Wa = Ma, Va = Ha, Ja = Ba, Qa = "pako inflate (from Nodeca project)", X = {
  inflateReset: Ka,
  inflateReset2: Pa,
  inflateResetKeep: Xa,
  inflateInit: Ya,
  inflateInit2: Ga,
  inflate: ja,
  inflateEnd: Wa,
  inflateGetHeader: Va,
  inflateSetDictionary: Ja,
  inflateInfo: Qa
};
function qa() {
  this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
}
var er = qa;
const Mi = Object.prototype.toString, {
  Z_NO_FLUSH: tr,
  Z_FINISH: ir,
  Z_OK: Ae,
  Z_STREAM_END: nt,
  Z_NEED_DICT: at,
  Z_STREAM_ERROR: nr,
  Z_DATA_ERROR: ri,
  Z_MEM_ERROR: ar
} = Te;
function De(e) {
  this.options = Ke.assign({
    chunkSize: 1024 * 64,
    windowBits: 15,
    to: ""
  }, e || {});
  const i = this.options;
  i.raw && i.windowBits >= 0 && i.windowBits < 16 && (i.windowBits = -i.windowBits, i.windowBits === 0 && (i.windowBits = -15)), i.windowBits >= 0 && i.windowBits < 16 && !(e && e.windowBits) && (i.windowBits += 32), i.windowBits > 15 && i.windowBits < 48 && (i.windowBits & 15 || (i.windowBits |= 15)), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new zi(), this.strm.avail_out = 0;
  let t = X.inflateInit2(
    this.strm,
    i.windowBits
  );
  if (t !== Ae)
    throw new Error(oe[t]);
  if (this.header = new er(), X.inflateGetHeader(this.strm, this.header), i.dictionary && (typeof i.dictionary == "string" ? i.dictionary = Se.string2buf(i.dictionary) : Mi.call(i.dictionary) === "[object ArrayBuffer]" && (i.dictionary = new Uint8Array(i.dictionary)), i.raw && (t = X.inflateSetDictionary(this.strm, i.dictionary), t !== Ae)))
    throw new Error(oe[t]);
}
De.prototype.push = function(e, i) {
  const t = this.strm, n = this.options.chunkSize, r = this.options.dictionary;
  let a, f, o;
  if (this.ended)
    return !1;
  for (i === ~~i ? f = i : f = i === !0 ? ir : tr, Mi.call(e) === "[object ArrayBuffer]" ? t.input = new Uint8Array(e) : t.input = e, t.next_in = 0, t.avail_in = t.input.length; ; ) {
    for (t.avail_out === 0 && (t.output = new Uint8Array(n), t.next_out = 0, t.avail_out = n), a = X.inflate(t, f), a === at && r && (a = X.inflateSetDictionary(t, r), a === Ae ? a = X.inflate(t, f) : a === ri && (a = at)); t.avail_in > 0 && a === nt && t.state.wrap > 0 && e[t.next_in] !== 0; )
      X.inflateReset(t), a = X.inflate(t, f);
    switch (a) {
      case nr:
      case ri:
      case at:
      case ar:
        return this.onEnd(a), this.ended = !0, !1;
    }
    if (o = t.avail_out, t.next_out && (t.avail_out === 0 || a === nt))
      if (this.options.to === "string") {
        let c = Se.utf8border(t.output, t.next_out), l = t.next_out - c, _ = Se.buf2string(t.output, c);
        t.next_out = l, t.avail_out = n - l, l && t.output.set(t.output.subarray(c, c + l), 0), this.onData(_);
      } else
        this.onData(t.output.length === t.next_out ? t.output : t.output.subarray(0, t.next_out));
    if (!(a === Ae && o === 0)) {
      if (a === nt)
        return a = X.inflateEnd(this.strm), this.onEnd(a), this.ended = !0, !0;
      if (t.avail_in === 0)
        break;
    }
  }
  return !0;
};
De.prototype.onData = function(e) {
  this.chunks.push(e);
};
De.prototype.onEnd = function(e) {
  e === Ae && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = Ke.flattenChunks(this.chunks)), this.chunks = [], this.err = e, this.msg = this.strm.msg;
};
function kt(e, i) {
  const t = new De(i);
  if (t.push(e), t.err)
    throw t.msg || oe[t.err];
  return t.result;
}
function rr(e, i) {
  return i = i || {}, i.raw = !0, kt(e, i);
}
var lr = De, or = kt, fr = rr, _r = kt, hr = Te, dr = {
  Inflate: lr,
  inflate: or,
  inflateRaw: fr,
  ungzip: _r,
  constants: hr
};
const { Inflate: cr, inflate: sr, inflateRaw: ur, ungzip: wr } = dr;
var br = sr;
export {
  br as i
};
