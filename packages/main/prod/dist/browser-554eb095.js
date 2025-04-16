var E = Uint8Array, Q = Uint16Array, xr = Int32Array, ur = new E([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]), tr = new E([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]), zr = new E([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Tr = function(r, a) {
  for (var n = new Q(31), e = 0; e < 31; ++e)
    n[e] = a += 1 << r[e - 1];
  for (var v = new xr(n[30]), e = 1; e < 30; ++e)
    for (var f = n[e]; f < n[e + 1]; ++f)
      v[f] = f - n[e] << 5 | e;
  return { b: n, r: v };
}, Cr = Tr(ur, 2), Er = Cr.b, Mr = Cr.r;
Er[28] = 258, Mr[258] = 28;
var Ur = Tr(tr, 0), Gr = Ur.b, Fr = Ur.r, yr = new Q(32768);
for (var g = 0; g < 32768; ++g) {
  var j = (g & 43690) >> 1 | (g & 21845) << 1;
  j = (j & 52428) >> 2 | (j & 13107) << 2, j = (j & 61680) >> 4 | (j & 3855) << 4, yr[g] = ((j & 65280) >> 8 | (j & 255) << 8) >> 1;
}
var Y = function(r, a, n) {
  for (var e = r.length, v = 0, f = new Q(a); v < e; ++v)
    r[v] && ++f[r[v] - 1];
  var o = new Q(a);
  for (v = 1; v < a; ++v)
    o[v] = o[v - 1] + f[v - 1] << 1;
  var h;
  if (n) {
    h = new Q(1 << a);
    var w = 15 - a;
    for (v = 0; v < e; ++v)
      if (r[v])
        for (var x = v << 4 | r[v], i = a - r[v], l = o[r[v] - 1]++ << i, t = l | (1 << i) - 1; l <= t; ++l)
          h[yr[l] >> w] = x;
  } else
    for (h = new Q(e), v = 0; v < e; ++v)
      r[v] && (h[v] = yr[o[r[v] - 1]++] >> 15 - r[v]);
  return h;
}, L = new E(288);
for (var g = 0; g < 144; ++g)
  L[g] = 8;
for (var g = 144; g < 256; ++g)
  L[g] = 9;
for (var g = 256; g < 280; ++g)
  L[g] = 7;
for (var g = 280; g < 288; ++g)
  L[g] = 8;
var fr = new E(32);
for (var g = 0; g < 32; ++g)
  fr[g] = 5;
var Hr = /* @__PURE__ */ Y(L, 9, 0), Jr = /* @__PURE__ */ Y(L, 9, 1), Kr = /* @__PURE__ */ Y(fr, 5, 0), Nr = /* @__PURE__ */ Y(fr, 5, 1), hr = function(r) {
  for (var a = r[0], n = 1; n < r.length; ++n)
    r[n] > a && (a = r[n]);
  return a;
}, W = function(r, a, n) {
  var e = a / 8 | 0;
  return (r[e] | r[e + 1] << 8) >> (a & 7) & n;
}, wr = function(r, a) {
  var n = a / 8 | 0;
  return (r[n] | r[n + 1] << 8 | r[n + 2] << 16) >> (a & 7);
}, kr = function(r) {
  return (r + 7) / 8 | 0;
}, Dr = function(r, a, n) {
  return (a == null || a < 0) && (a = 0), (n == null || n > r.length) && (n = r.length), new E(r.subarray(a, n));
}, Pr = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
], P = function(r, a, n) {
  var e = new Error(a || Pr[r]);
  if (e.code = r, Error.captureStackTrace && Error.captureStackTrace(e, P), !n)
    throw e;
  return e;
}, Ir = function(r, a, n, e) {
  var v = r.length, f = e ? e.length : 0;
  if (!v || a.f && !a.l)
    return n || new E(0);
  var o = !n, h = o || a.i != 2, w = a.i;
  o && (n = new E(v * 3));
  var x = function(ar) {
    var nr = n.length;
    if (ar > nr) {
      var d = new E(Math.max(nr * 2, ar));
      d.set(n), n = d;
    }
  }, i = a.f || 0, l = a.p || 0, t = a.b || 0, z = a.l, U = a.d, M = a.m, B = a.n, V = v * 8;
  do {
    if (!z) {
      i = W(r, l, 1);
      var H = W(r, l + 1, 3);
      if (l += 3, H)
        if (H == 1)
          z = Jr, U = Nr, M = 9, B = 5;
        else if (H == 2) {
          var q = W(r, l, 31) + 257, A = W(r, l + 10, 15) + 4, c = q + W(r, l + 5, 31) + 1;
          l += 14;
          for (var u = new E(c), S = new E(19), k = 0; k < A; ++k)
            S[zr[k]] = W(r, l + k * 3, 7);
          l += A * 3;
          for (var I = hr(S), _ = (1 << I) - 1, J = Y(S, I, 1), k = 0; k < c; ) {
            var O = J[W(r, l, _)];
            l += O & 15;
            var F = O >> 4;
            if (F < 16)
              u[k++] = F;
            else {
              var T = 0, y = 0;
              for (F == 16 ? (y = 3 + W(r, l, 3), l += 2, T = u[k - 1]) : F == 17 ? (y = 3 + W(r, l, 7), l += 3) : F == 18 && (y = 11 + W(r, l, 127), l += 7); y--; )
                u[k++] = T;
            }
          }
          var G = u.subarray(0, q), C = u.subarray(q);
          M = hr(G), B = hr(C), z = Y(G, M, 1), U = Y(C, B, 1);
        } else
          P(1);
      else {
        var F = kr(l) + 4, m = r[F - 4] | r[F - 3] << 8, D = F + m;
        if (D > v) {
          w && P(0);
          break;
        }
        h && x(t + m), n.set(r.subarray(F, D), t), a.b = t += m, a.p = l = D * 8, a.f = i;
        continue;
      }
      if (l > V) {
        w && P(0);
        break;
      }
    }
    h && x(t + 131072);
    for (var rr = (1 << M) - 1, R = (1 << B) - 1, Z = l; ; Z = l) {
      var T = z[wr(r, l) & rr], K = T >> 4;
      if (l += T & 15, l > V) {
        w && P(0);
        break;
      }
      if (T || P(2), K < 256)
        n[t++] = K;
      else if (K == 256) {
        Z = l, z = null;
        break;
      } else {
        var N = K - 254;
        if (K > 264) {
          var k = K - 257, b = ur[k];
          N = W(r, l, (1 << b) - 1) + Er[k], l += b;
        }
        var X = U[wr(r, l) & R], s = X >> 4;
        X || P(3), l += X & 15;
        var C = Gr[s];
        if (s > 3) {
          var b = tr[s];
          C += wr(r, l) & (1 << b) - 1, l += b;
        }
        if (l > V) {
          w && P(0);
          break;
        }
        h && x(t + 131072);
        var p = t + N;
        if (t < C) {
          var lr = f - C, or = Math.min(C, p);
          for (lr + t < 0 && P(3); t < or; ++t)
            n[t] = e[lr + t];
        }
        for (; t < p; ++t)
          n[t] = n[t - C];
      }
    }
    a.l = z, a.p = Z, a.b = t, a.f = i, z && (i = 1, a.m = M, a.d = U, a.n = B);
  } while (!i);
  return t != n.length && o ? Dr(n, 0, t) : n.subarray(0, t);
}, $ = function(r, a, n) {
  n <<= a & 7;
  var e = a / 8 | 0;
  r[e] |= n, r[e + 1] |= n >> 8;
}, er = function(r, a, n) {
  n <<= a & 7;
  var e = a / 8 | 0;
  r[e] |= n, r[e + 1] |= n >> 8, r[e + 2] |= n >> 16;
}, gr = function(r, a) {
  for (var n = [], e = 0; e < r.length; ++e)
    r[e] && n.push({ s: e, f: r[e] });
  var v = n.length, f = n.slice();
  if (!v)
    return { t: qr, l: 0 };
  if (v == 1) {
    var o = new E(n[0].s + 1);
    return o[n[0].s] = 1, { t: o, l: 1 };
  }
  n.sort(function(D, q) {
    return D.f - q.f;
  }), n.push({ s: -1, f: 25001 });
  var h = n[0], w = n[1], x = 0, i = 1, l = 2;
  for (n[0] = { s: -1, f: h.f + w.f, l: h, r: w }; i != v - 1; )
    h = n[n[x].f < n[l].f ? x++ : l++], w = n[x != i && n[x].f < n[l].f ? x++ : l++], n[i++] = { s: -1, f: h.f + w.f, l: h, r: w };
  for (var t = f[0].s, e = 1; e < v; ++e)
    f[e].s > t && (t = f[e].s);
  var z = new Q(t + 1), U = br(n[i - 1], z, 0);
  if (U > a) {
    var e = 0, M = 0, B = U - a, V = 1 << B;
    for (f.sort(function(q, A) {
      return z[A.s] - z[q.s] || q.f - A.f;
    }); e < v; ++e) {
      var H = f[e].s;
      if (z[H] > a)
        M += V - (1 << U - z[H]), z[H] = a;
      else
        break;
    }
    for (M >>= B; M > 0; ) {
      var F = f[e].s;
      z[F] < a ? M -= 1 << a - z[F]++ - 1 : ++e;
    }
    for (; e >= 0 && M; --e) {
      var m = f[e].s;
      z[m] == a && (--z[m], ++M);
    }
    U = a;
  }
  return { t: new E(z), l: U };
}, br = function(r, a, n) {
  return r.s == -1 ? Math.max(br(r.l, a, n + 1), br(r.r, a, n + 1)) : a[r.s] = n;
}, Ar = function(r) {
  for (var a = r.length; a && !r[--a]; )
    ;
  for (var n = new Q(++a), e = 0, v = r[0], f = 1, o = function(w) {
    n[e++] = w;
  }, h = 1; h <= a; ++h)
    if (r[h] == v && h != a)
      ++f;
    else {
      if (!v && f > 2) {
        for (; f > 138; f -= 138)
          o(32754);
        f > 2 && (o(f > 10 ? f - 11 << 5 | 28690 : f - 3 << 5 | 12305), f = 0);
      } else if (f > 3) {
        for (o(v), --f; f > 6; f -= 6)
          o(8304);
        f > 2 && (o(f - 3 << 5 | 8208), f = 0);
      }
      for (; f--; )
        o(v);
      f = 1, v = r[h];
    }
  return { c: n.subarray(0, e), n: a };
}, vr = function(r, a) {
  for (var n = 0, e = 0; e < a.length; ++e)
    n += r[e] * a[e];
  return n;
}, mr = function(r, a, n) {
  var e = n.length, v = kr(a + 2);
  r[v] = e & 255, r[v + 1] = e >> 8, r[v + 2] = r[v] ^ 255, r[v + 3] = r[v + 1] ^ 255;
  for (var f = 0; f < e; ++f)
    r[v + f + 4] = n[f];
  return (v + 4 + e) * 8;
}, Sr = function(r, a, n, e, v, f, o, h, w, x, i) {
  $(a, i++, n), ++v[256];
  for (var l = gr(v, 15), t = l.t, z = l.l, U = gr(f, 15), M = U.t, B = U.l, V = Ar(t), H = V.c, F = V.n, m = Ar(M), D = m.c, q = m.n, A = new Q(19), c = 0; c < H.length; ++c)
    ++A[H[c] & 31];
  for (var c = 0; c < D.length; ++c)
    ++A[D[c] & 31];
  for (var u = gr(A, 7), S = u.t, k = u.l, I = 19; I > 4 && !S[zr[I - 1]]; --I)
    ;
  var _ = x + 5 << 3, J = vr(v, L) + vr(f, fr) + o, O = vr(v, t) + vr(f, M) + o + 14 + 3 * I + vr(A, S) + 2 * A[16] + 3 * A[17] + 7 * A[18];
  if (w >= 0 && _ <= J && _ <= O)
    return mr(a, i, r.subarray(w, w + x));
  var T, y, G, C;
  if ($(a, i, 1 + (O < J)), i += 2, O < J) {
    T = Y(t, z, 0), y = t, G = Y(M, B, 0), C = M;
    var rr = Y(S, k, 0);
    $(a, i, F - 257), $(a, i + 5, q - 1), $(a, i + 10, I - 4), i += 14;
    for (var c = 0; c < I; ++c)
      $(a, i + 3 * c, S[zr[c]]);
    i += 3 * I;
    for (var R = [H, D], Z = 0; Z < 2; ++Z)
      for (var K = R[Z], c = 0; c < K.length; ++c) {
        var N = K[c] & 31;
        $(a, i, rr[N]), i += S[N], N > 15 && ($(a, i, K[c] >> 5 & 127), i += K[c] >> 12);
      }
  } else
    T = Hr, y = L, G = Kr, C = fr;
  for (var c = 0; c < h; ++c) {
    var b = e[c];
    if (b > 255) {
      var N = b >> 18 & 31;
      er(a, i, T[N + 257]), i += y[N + 257], N > 7 && ($(a, i, b >> 23 & 31), i += ur[N]);
      var X = b & 31;
      er(a, i, G[X]), i += C[X], X > 3 && (er(a, i, b >> 5 & 8191), i += tr[X]);
    } else
      er(a, i, T[b]), i += y[b];
  }
  return er(a, i, T[256]), i + y[256];
}, Qr = /* @__PURE__ */ new xr([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]), qr = /* @__PURE__ */ new E(0), Rr = function(r, a, n, e, v, f) {
  var o = f.z || r.length, h = new E(e + o + 5 * (1 + Math.ceil(o / 7e3)) + v), w = h.subarray(e, h.length - v), x = f.l, i = (f.r || 0) & 7;
  if (a) {
    i && (w[0] = f.r >> 3);
    for (var l = Qr[a - 1], t = l >> 13, z = l & 8191, U = (1 << n) - 1, M = f.p || new Q(32768), B = f.h || new Q(U + 1), V = Math.ceil(n / 3), H = 2 * V, F = function(cr) {
      return (r[cr] ^ r[cr + 1] << V ^ r[cr + 2] << H) & U;
    }, m = new xr(25e3), D = new Q(288), q = new Q(32), A = 0, c = 0, u = f.i || 0, S = 0, k = f.w || 0, I = 0; u + 2 < o; ++u) {
      var _ = F(u), J = u & 32767, O = B[_];
      if (M[J] = O, B[_] = J, k <= u) {
        var T = o - u;
        if ((A > 7e3 || S > 24576) && (T > 423 || !x)) {
          i = Sr(r, w, 0, m, D, q, c, S, I, u - I, i), S = A = c = 0, I = u;
          for (var y = 0; y < 286; ++y)
            D[y] = 0;
          for (var y = 0; y < 30; ++y)
            q[y] = 0;
        }
        var G = 2, C = 0, rr = z, R = J - O & 32767;
        if (T > 2 && _ == F(u - R))
          for (var Z = Math.min(t, T) - 1, K = Math.min(32767, u), N = Math.min(258, T); R <= K && --rr && J != O; ) {
            if (r[u + G] == r[u + G - R]) {
              for (var b = 0; b < N && r[u + b] == r[u + b - R]; ++b)
                ;
              if (b > G) {
                if (G = b, C = R, b > Z)
                  break;
                for (var X = Math.min(R, b - 2), s = 0, y = 0; y < X; ++y) {
                  var p = u - R + y & 32767, lr = M[p], or = p - lr & 32767;
                  or > s && (s = or, O = p);
                }
              }
            }
            J = O, O = M[J], R += J - O & 32767;
          }
        if (C) {
          m[S++] = 268435456 | Mr[G] << 18 | Fr[C];
          var ar = Mr[G] & 31, nr = Fr[C] & 31;
          c += ur[ar] + tr[nr], ++D[257 + ar], ++q[nr], k = u + G, ++A;
        } else
          m[S++] = r[u], ++D[r[u]];
      }
    }
    for (u = Math.max(u, k); u < o; ++u)
      m[S++] = r[u], ++D[r[u]];
    i = Sr(r, w, x, m, D, q, c, S, I, u - I, i), x || (f.r = i & 7 | w[i / 8 | 0] << 3, i -= 7, f.h = B, f.p = M, f.i = u, f.w = k);
  } else {
    for (var u = f.w || 0; u < o + x; u += 65535) {
      var d = u + 65535;
      d >= o && (w[i / 8 | 0] = x, d = o), i = mr(w, i + 1, r.subarray(u, d));
    }
    f.i = o;
  }
  return Dr(h, 0, e + kr(i) + v);
}, Vr = /* @__PURE__ */ function() {
  for (var r = new Int32Array(256), a = 0; a < 256; ++a) {
    for (var n = a, e = 9; --e; )
      n = (n & 1 && -306674912) ^ n >>> 1;
    r[a] = n;
  }
  return r;
}(), Wr = function() {
  var r = -1;
  return {
    p: function(a) {
      for (var n = r, e = 0; e < a.length; ++e)
        n = Vr[n & 255 ^ a[e]] ^ n >>> 8;
      r = n;
    },
    d: function() {
      return ~r;
    }
  };
}, Br = function() {
  var r = 1, a = 0;
  return {
    p: function(n) {
      for (var e = r, v = a, f = n.length | 0, o = 0; o != f; ) {
        for (var h = Math.min(o + 2655, f); o < h; ++o)
          v += e += n[o];
        e = (e & 65535) + 15 * (e >> 16), v = (v & 65535) + 15 * (v >> 16);
      }
      r = e, a = v;
    },
    d: function() {
      return r %= 65521, a %= 65521, (r & 255) << 24 | (r & 65280) << 8 | (a & 255) << 8 | a >> 8;
    }
  };
}, Or = function(r, a, n, e, v) {
  if (!v && (v = { l: 1 }, a.dictionary)) {
    var f = a.dictionary.subarray(-32768), o = new E(f.length + r.length);
    o.set(f), o.set(r, f.length), r = o, v.w = f.length;
  }
  return Rr(r, a.level == null ? 6 : a.level, a.mem == null ? v.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(r.length))) * 1.5) : 20 : 12 + a.mem, n, e, v);
}, ir = function(r, a, n) {
  for (; n; ++a)
    r[a] = n, n >>>= 8;
}, Xr = function(r, a) {
  var n = a.filename;
  if (r[0] = 31, r[1] = 139, r[2] = 8, r[8] = a.level < 2 ? 4 : a.level == 9 ? 2 : 0, r[9] = 3, a.mtime != 0 && ir(r, 4, Math.floor(new Date(a.mtime || Date.now()) / 1e3)), n) {
    r[3] = 8;
    for (var e = 0; e <= n.length; ++e)
      r[e + 10] = n.charCodeAt(e);
  }
}, Yr = function(r) {
  (r[0] != 31 || r[1] != 139 || r[2] != 8) && P(6, "invalid gzip data");
  var a = r[3], n = 10;
  a & 4 && (n += (r[10] | r[11] << 8) + 2);
  for (var e = (a >> 3 & 1) + (a >> 4 & 1); e > 0; e -= !r[n++])
    ;
  return n + (a & 2);
}, Zr = function(r) {
  var a = r.length;
  return (r[a - 4] | r[a - 3] << 8 | r[a - 2] << 16 | r[a - 1] << 24) >>> 0;
}, $r = function(r) {
  return 10 + (r.filename ? r.filename.length + 1 : 0);
}, _r = function(r, a) {
  var n = a.level, e = n == 0 ? 0 : n < 6 ? 1 : n == 9 ? 3 : 2;
  if (r[0] = 120, r[1] = e << 6 | (a.dictionary && 32), r[1] |= 31 - (r[0] << 8 | r[1]) % 31, a.dictionary) {
    var v = Br();
    v.p(a.dictionary), ir(r, 2, v.d());
  }
}, jr = function(r, a) {
  return ((r[0] & 15) != 8 || r[0] >> 4 > 7 || (r[0] << 8 | r[1]) % 31) && P(6, "invalid zlib data"), (r[1] >> 5 & 1) == +!a && P(6, "invalid zlib data: " + (r[1] & 32 ? "need" : "unexpected") + " dictionary"), (r[1] >> 3 & 4) + 2;
};
function pr(r, a) {
  a || (a = {});
  var n = Wr(), e = r.length;
  n.p(r);
  var v = Or(r, a, $r(a), 8), f = v.length;
  return Xr(v, a), ir(v, f - 8, n.d()), ir(v, f - 4, e), v;
}
function dr(r, a) {
  var n = Yr(r);
  return n + 8 > r.length && P(6, "invalid gzip data"), Ir(r.subarray(n, -8), { i: 2 }, a && a.out || new E(Zr(r)), a && a.dictionary);
}
function ra(r, a) {
  a || (a = {});
  var n = Br();
  n.p(r);
  var e = Or(r, a, a.dictionary ? 6 : 2, 4);
  return _r(e, a), ir(e, e.length - 4, n.d()), e;
}
function aa(r, a) {
  return Ir(r.subarray(jr(r, a && a.dictionary), -4), { i: 2 }, a && a.out, a && a.dictionary);
}
var Lr = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), sr = 0;
try {
  Lr.decode(qr, { stream: !0 }), sr = 1;
} catch {
}
export {
  dr as a,
  pr as g,
  aa as u,
  ra as z
};
