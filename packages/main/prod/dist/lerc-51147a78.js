import { i as oA } from "./pako.esm-a24ba4ed.js";
import { g as sA, aV as DA, aW as nA, aX as gA } from "./index-9cbc2532.js";
import "react";
import "react-dom";
var iA = { exports: {} };
(function(j) {
  /* Copyright 2015-2021 Esri. Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 @preserve */
  (function() {
    var J = function() {
      var u = {};
      u.defaultNoDataValue = -34027999387901484e22, u.decode = function(I, a) {
        a = a || {};
        var Q = a.encodedMaskData || a.encodedMaskData === null, g = E(I, a.inputOffset || 0, Q), D = a.noDataValue !== null ? a.noDataValue : u.defaultNoDataValue, B = L(
          g,
          a.pixelType || Float32Array,
          a.encodedMaskData,
          D,
          a.returnMask
        ), C = {
          width: g.width,
          height: g.height,
          pixelData: B.resultPixels,
          minValue: B.minValue,
          maxValue: g.pixels.maxValue,
          noDataValue: D
        };
        return B.resultMask && (C.maskData = B.resultMask), a.returnEncodedMask && g.mask && (C.encodedMaskData = g.mask.bitset ? g.mask.bitset : null), a.returnFileInfo && (C.fileInfo = d(g), a.computeUsedBitDepths && (C.fileInfo.bitDepths = z(g))), C;
      };
      var L = function(I, a, Q, g, D) {
        var B = 0, C = I.pixels.numBlocksX, o = I.pixels.numBlocksY, r = Math.floor(I.width / C), s = Math.floor(I.height / o), f = 2 * I.maxZError, e = Number.MAX_VALUE, i;
        Q = Q || (I.mask ? I.mask.bitset : null);
        var t, F;
        t = new a(I.width * I.height), D && Q && (F = new Uint8Array(I.width * I.height));
        for (var S = new Float32Array(r * s), h, U, G = 0; G <= o; G++) {
          var R = G !== o ? s : I.height % o;
          if (R !== 0)
            for (var w = 0; w <= C; w++) {
              var n = w !== C ? r : I.width % C;
              if (n !== 0) {
                var l = G * I.width * s + w * r, y = I.width - n, k = I.pixels.blocks[B], M, c, N;
                k.encoding < 2 ? (k.encoding === 0 ? M = k.rawData : (A(k.stuffedData, k.bitsPerPixel, k.numValidPixels, k.offset, f, S, I.pixels.maxValue), M = S), c = 0) : k.encoding === 2 ? N = 0 : N = k.offset;
                var q;
                if (Q)
                  for (U = 0; U < R; U++) {
                    for (l & 7 && (q = Q[l >> 3], q <<= l & 7), h = 0; h < n; h++)
                      l & 7 || (q = Q[l >> 3]), q & 128 ? (F && (F[l] = 1), i = k.encoding < 2 ? M[c++] : N, e = e > i ? i : e, t[l++] = i) : (F && (F[l] = 0), t[l++] = g), q <<= 1;
                    l += y;
                  }
                else if (k.encoding < 2)
                  for (U = 0; U < R; U++) {
                    for (h = 0; h < n; h++)
                      i = M[c++], e = e > i ? i : e, t[l++] = i;
                    l += y;
                  }
                else
                  for (e = e > N ? N : e, U = 0; U < R; U++) {
                    for (h = 0; h < n; h++)
                      t[l++] = N;
                    l += y;
                  }
                if (k.encoding === 1 && c !== k.numValidPixels)
                  throw "Block and Mask do not match";
                B++;
              }
            }
        }
        return {
          resultPixels: t,
          resultMask: F,
          minValue: e
        };
      }, d = function(I) {
        return {
          fileIdentifierString: I.fileIdentifierString,
          fileVersion: I.fileVersion,
          imageType: I.imageType,
          height: I.height,
          width: I.width,
          maxZError: I.maxZError,
          eofOffset: I.eofOffset,
          mask: I.mask ? {
            numBlocksX: I.mask.numBlocksX,
            numBlocksY: I.mask.numBlocksY,
            numBytes: I.mask.numBytes,
            maxValue: I.mask.maxValue
          } : null,
          pixels: {
            numBlocksX: I.pixels.numBlocksX,
            numBlocksY: I.pixels.numBlocksY,
            numBytes: I.pixels.numBytes,
            maxValue: I.pixels.maxValue,
            noDataValue: I.noDataValue
          }
        };
      }, z = function(I) {
        for (var a = I.pixels.numBlocksX * I.pixels.numBlocksY, Q = {}, g = 0; g < a; g++) {
          var D = I.pixels.blocks[g];
          D.encoding === 0 ? Q.float32 = !0 : D.encoding === 1 ? Q[D.bitsPerPixel] = !0 : Q[0] = !0;
        }
        return Object.keys(Q);
      }, E = function(I, a, Q) {
        var g = {}, D = new Uint8Array(I, a, 10);
        if (g.fileIdentifierString = String.fromCharCode.apply(null, D), g.fileIdentifierString.trim() !== "CntZImage")
          throw "Unexpected file identifier string: " + g.fileIdentifierString;
        a += 10;
        var B = new DataView(I, a, 24);
        if (g.fileVersion = B.getInt32(0, !0), g.imageType = B.getInt32(4, !0), g.height = B.getUint32(8, !0), g.width = B.getUint32(12, !0), g.maxZError = B.getFloat64(16, !0), a += 24, !Q)
          if (B = new DataView(I, a, 16), g.mask = {}, g.mask.numBlocksY = B.getUint32(0, !0), g.mask.numBlocksX = B.getUint32(4, !0), g.mask.numBytes = B.getUint32(8, !0), g.mask.maxValue = B.getFloat32(12, !0), a += 16, g.mask.numBytes > 0) {
            var C = new Uint8Array(Math.ceil(g.width * g.height / 8));
            B = new DataView(I, a, g.mask.numBytes);
            var o = B.getInt16(0, !0), r = 2, s = 0;
            do {
              if (o > 0)
                for (; o--; )
                  C[s++] = B.getUint8(r++);
              else {
                var f = B.getUint8(r++);
                for (o = -o; o--; )
                  C[s++] = f;
              }
              o = B.getInt16(r, !0), r += 2;
            } while (r < g.mask.numBytes);
            if (o !== -32768 || s < C.length)
              throw "Unexpected end of mask RLE encoding";
            g.mask.bitset = C, a += g.mask.numBytes;
          } else
            g.mask.numBytes | g.mask.numBlocksY | g.mask.maxValue || (g.mask.bitset = new Uint8Array(Math.ceil(g.width * g.height / 8)));
        B = new DataView(I, a, 16), g.pixels = {}, g.pixels.numBlocksY = B.getUint32(0, !0), g.pixels.numBlocksX = B.getUint32(4, !0), g.pixels.numBytes = B.getUint32(8, !0), g.pixels.maxValue = B.getFloat32(12, !0), a += 16;
        var e = g.pixels.numBlocksX, i = g.pixels.numBlocksY, t = e + (g.width % e > 0 ? 1 : 0), F = i + (g.height % i > 0 ? 1 : 0);
        g.pixels.blocks = new Array(t * F);
        for (var S = 0, h = 0; h < F; h++)
          for (var U = 0; U < t; U++) {
            var G = 0, R = I.byteLength - a;
            B = new DataView(I, a, Math.min(10, R));
            var w = {};
            g.pixels.blocks[S++] = w;
            var n = B.getUint8(0);
            if (G++, w.encoding = n & 63, w.encoding > 3)
              throw "Invalid block encoding (" + w.encoding + ")";
            if (w.encoding === 2) {
              a++;
              continue;
            }
            if (n !== 0 && n !== 2) {
              if (n >>= 6, w.offsetType = n, n === 2)
                w.offset = B.getInt8(1), G++;
              else if (n === 1)
                w.offset = B.getInt16(1, !0), G += 2;
              else if (n === 0)
                w.offset = B.getFloat32(1, !0), G += 4;
              else
                throw "Invalid block offset type";
              if (w.encoding === 1)
                if (n = B.getUint8(G), G++, w.bitsPerPixel = n & 63, n >>= 6, w.numValidPixelsType = n, n === 2)
                  w.numValidPixels = B.getUint8(G), G++;
                else if (n === 1)
                  w.numValidPixels = B.getUint16(G, !0), G += 2;
                else if (n === 0)
                  w.numValidPixels = B.getUint32(G, !0), G += 4;
                else
                  throw "Invalid valid pixel count type";
            }
            if (a += G, w.encoding !== 3) {
              var l, y;
              if (w.encoding === 0) {
                var k = (g.pixels.numBytes - 1) / 4;
                if (k !== Math.floor(k))
                  throw "uncompressed block has invalid length";
                l = new ArrayBuffer(k * 4), y = new Uint8Array(l), y.set(new Uint8Array(I, a, k * 4));
                var M = new Float32Array(l);
                w.rawData = M, a += k * 4;
              } else if (w.encoding === 1) {
                var c = Math.ceil(w.numValidPixels * w.bitsPerPixel / 8), N = Math.ceil(c / 4);
                l = new ArrayBuffer(N * 4), y = new Uint8Array(l), y.set(new Uint8Array(I, a, c)), w.stuffedData = new Uint32Array(l), a += c;
              }
            }
          }
        return g.eofOffset = a, g;
      }, A = function(I, a, Q, g, D, B, C) {
        var o = (1 << a) - 1, r = 0, s, f = 0, e, i, t = Math.ceil((C - g) / D), F = I.length * 4 - Math.ceil(a * Q / 8);
        for (I[I.length - 1] <<= 8 * F, s = 0; s < Q; s++) {
          if (f === 0 && (i = I[r++], f = 32), f >= a)
            e = i >>> f - a & o, f -= a;
          else {
            var S = a - f;
            e = (i & o) << S & o, i = I[r++], f = 32 - S, e += i >>> f;
          }
          B[s] = e < t ? g + e * D : C;
        }
        return B;
      };
      return u;
    }(), T = function() {
      var u = {
        //methods ending with 2 are for the new byte order used by Lerc2.3 and above.
        //originalUnstuff is used to unpack Huffman code table. code is duplicated to unstuffx for performance reasons.
        unstuff: function(E, A, I, a, Q, g, D, B) {
          var C = (1 << I) - 1, o = 0, r, s = 0, f, e, i, t, F = E.length * 4 - Math.ceil(I * a / 8);
          if (E[E.length - 1] <<= 8 * F, Q)
            for (r = 0; r < a; r++)
              s === 0 && (e = E[o++], s = 32), s >= I ? (f = e >>> s - I & C, s -= I) : (i = I - s, f = (e & C) << i & C, e = E[o++], s = 32 - i, f += e >>> s), A[r] = Q[f];
          else
            for (t = Math.ceil((B - g) / D), r = 0; r < a; r++)
              s === 0 && (e = E[o++], s = 32), s >= I ? (f = e >>> s - I & C, s -= I) : (i = I - s, f = (e & C) << i & C, e = E[o++], s = 32 - i, f += e >>> s), A[r] = f < t ? g + f * D : B;
        },
        unstuffLUT: function(E, A, I, a, Q, g) {
          var D = (1 << A) - 1, B = 0, C = 0, o = 0, r = 0, s = 0, f, e = [], i = E.length * 4 - Math.ceil(A * I / 8);
          E[E.length - 1] <<= 8 * i;
          var t = Math.ceil((g - a) / Q);
          for (C = 0; C < I; C++)
            r === 0 && (f = E[B++], r = 32), r >= A ? (s = f >>> r - A & D, r -= A) : (o = A - r, s = (f & D) << o & D, f = E[B++], r = 32 - o, s += f >>> r), e[C] = s < t ? a + s * Q : g;
          return e.unshift(a), e;
        },
        unstuff2: function(E, A, I, a, Q, g, D, B) {
          var C = (1 << I) - 1, o = 0, r, s = 0, f = 0, e, i, t;
          if (Q)
            for (r = 0; r < a; r++)
              s === 0 && (i = E[o++], s = 32, f = 0), s >= I ? (e = i >>> f & C, s -= I, f += I) : (t = I - s, e = i >>> f & C, i = E[o++], s = 32 - t, e |= (i & (1 << t) - 1) << I - t, f = t), A[r] = Q[e];
          else {
            var F = Math.ceil((B - g) / D);
            for (r = 0; r < a; r++)
              s === 0 && (i = E[o++], s = 32, f = 0), s >= I ? (e = i >>> f & C, s -= I, f += I) : (t = I - s, e = i >>> f & C, i = E[o++], s = 32 - t, e |= (i & (1 << t) - 1) << I - t, f = t), A[r] = e < F ? g + e * D : B;
          }
          return A;
        },
        unstuffLUT2: function(E, A, I, a, Q, g) {
          var D = (1 << A) - 1, B = 0, C = 0, o = 0, r = 0, s = 0, f = 0, e, i = [], t = Math.ceil((g - a) / Q);
          for (C = 0; C < I; C++)
            r === 0 && (e = E[B++], r = 32, f = 0), r >= A ? (s = e >>> f & D, r -= A, f += A) : (o = A - r, s = e >>> f & D, e = E[B++], r = 32 - o, s |= (e & (1 << o) - 1) << A - o, f = o), i[C] = s < t ? a + s * Q : g;
          return i.unshift(a), i;
        },
        originalUnstuff: function(E, A, I, a) {
          var Q = (1 << I) - 1, g = 0, D, B = 0, C, o, r, s = E.length * 4 - Math.ceil(I * a / 8);
          for (E[E.length - 1] <<= 8 * s, D = 0; D < a; D++)
            B === 0 && (o = E[g++], B = 32), B >= I ? (C = o >>> B - I & Q, B -= I) : (r = I - B, C = (o & Q) << r & Q, o = E[g++], B = 32 - r, C += o >>> B), A[D] = C;
          return A;
        },
        originalUnstuff2: function(E, A, I, a) {
          var Q = (1 << I) - 1, g = 0, D, B = 0, C = 0, o, r, s;
          for (D = 0; D < a; D++)
            B === 0 && (r = E[g++], B = 32, C = 0), B >= I ? (o = r >>> C & Q, B -= I, C += I) : (s = I - B, o = r >>> C & Q, r = E[g++], B = 32 - s, o |= (r & (1 << s) - 1) << I - s, C = s), A[D] = o;
          return A;
        }
      }, L = {
        HUFFMAN_LUT_BITS_MAX: 12,
        //use 2^12 lut, treat it like constant
        computeChecksumFletcher32: function(E) {
          for (var A = 65535, I = 65535, a = E.length, Q = Math.floor(a / 2), g = 0; Q; ) {
            var D = Q >= 359 ? 359 : Q;
            Q -= D;
            do
              A += E[g++] << 8, I += A += E[g++];
            while (--D);
            A = (A & 65535) + (A >>> 16), I = (I & 65535) + (I >>> 16);
          }
          return a & 1 && (I += A += E[g] << 8), A = (A & 65535) + (A >>> 16), I = (I & 65535) + (I >>> 16), (I << 16 | A) >>> 0;
        },
        readHeaderInfo: function(E, A) {
          var I = A.ptr, a = new Uint8Array(E, I, 6), Q = {};
          if (Q.fileIdentifierString = String.fromCharCode.apply(null, a), Q.fileIdentifierString.lastIndexOf("Lerc2", 0) !== 0)
            throw "Unexpected file identifier string (expect Lerc2 ): " + Q.fileIdentifierString;
          I += 6;
          var g = new DataView(E, I, 8), D = g.getInt32(0, !0);
          Q.fileVersion = D, I += 4, D >= 3 && (Q.checksum = g.getUint32(4, !0), I += 4), g = new DataView(E, I, 12), Q.height = g.getUint32(0, !0), Q.width = g.getUint32(4, !0), I += 8, D >= 4 ? (Q.numDims = g.getUint32(8, !0), I += 4) : Q.numDims = 1, g = new DataView(E, I, 40), Q.numValidPixel = g.getUint32(0, !0), Q.microBlockSize = g.getInt32(4, !0), Q.blobSize = g.getInt32(8, !0), Q.imageType = g.getInt32(12, !0), Q.maxZError = g.getFloat64(16, !0), Q.zMin = g.getFloat64(24, !0), Q.zMax = g.getFloat64(32, !0), I += 40, A.headerInfo = Q, A.ptr = I;
          var B, C;
          if (D >= 3 && (C = D >= 4 ? 52 : 48, B = this.computeChecksumFletcher32(new Uint8Array(E, I - C, Q.blobSize - 14)), B !== Q.checksum))
            throw "Checksum failed.";
          return !0;
        },
        checkMinMaxRanges: function(E, A) {
          var I = A.headerInfo, a = this.getDataTypeArray(I.imageType), Q = I.numDims * this.getDataTypeSize(I.imageType), g = this.readSubArray(E, A.ptr, a, Q), D = this.readSubArray(E, A.ptr + Q, a, Q);
          A.ptr += 2 * Q;
          var B, C = !0;
          for (B = 0; B < I.numDims; B++)
            if (g[B] !== D[B]) {
              C = !1;
              break;
            }
          return I.minValues = g, I.maxValues = D, C;
        },
        readSubArray: function(E, A, I, a) {
          var Q;
          if (I === Uint8Array)
            Q = new Uint8Array(E, A, a);
          else {
            var g = new ArrayBuffer(a), D = new Uint8Array(g);
            D.set(new Uint8Array(E, A, a)), Q = new I(g);
          }
          return Q;
        },
        readMask: function(E, A) {
          var I = A.ptr, a = A.headerInfo, Q = a.width * a.height, g = a.numValidPixel, D = new DataView(E, I, 4), B = {};
          if (B.numBytes = D.getUint32(0, !0), I += 4, (g === 0 || Q === g) && B.numBytes !== 0)
            throw "invalid mask";
          var C, o;
          if (g === 0)
            C = new Uint8Array(Math.ceil(Q / 8)), B.bitset = C, o = new Uint8Array(Q), A.pixels.resultMask = o, I += B.numBytes;
          else if (B.numBytes > 0) {
            C = new Uint8Array(Math.ceil(Q / 8)), D = new DataView(E, I, B.numBytes);
            var r = D.getInt16(0, !0), s = 2, f = 0, e = 0;
            do {
              if (r > 0)
                for (; r--; )
                  C[f++] = D.getUint8(s++);
              else
                for (e = D.getUint8(s++), r = -r; r--; )
                  C[f++] = e;
              r = D.getInt16(s, !0), s += 2;
            } while (s < B.numBytes);
            if (r !== -32768 || f < C.length)
              throw "Unexpected end of mask RLE encoding";
            o = new Uint8Array(Q);
            var i = 0, t = 0;
            for (t = 0; t < Q; t++)
              t & 7 ? (i = C[t >> 3], i <<= t & 7) : i = C[t >> 3], i & 128 && (o[t] = 1);
            A.pixels.resultMask = o, B.bitset = C, I += B.numBytes;
          }
          return A.ptr = I, A.mask = B, !0;
        },
        readDataOneSweep: function(E, A, I, a) {
          var Q = A.ptr, g = A.headerInfo, D = g.numDims, B = g.width * g.height, C = g.imageType, o = g.numValidPixel * L.getDataTypeSize(C) * D, r, s = A.pixels.resultMask;
          if (I === Uint8Array)
            r = new Uint8Array(E, Q, o);
          else {
            var f = new ArrayBuffer(o), e = new Uint8Array(f);
            e.set(new Uint8Array(E, Q, o)), r = new I(f);
          }
          if (r.length === B * D)
            a ? A.pixels.resultPixels = L.swapDimensionOrder(r, B, D, I, !0) : A.pixels.resultPixels = r;
          else {
            A.pixels.resultPixels = new I(B * D);
            var i = 0, t = 0, F = 0, S = 0;
            if (D > 1) {
              if (a) {
                for (t = 0; t < B; t++)
                  if (s[t])
                    for (S = t, F = 0; F < D; F++, S += B)
                      A.pixels.resultPixels[S] = r[i++];
              } else
                for (t = 0; t < B; t++)
                  if (s[t])
                    for (S = t * D, F = 0; F < D; F++)
                      A.pixels.resultPixels[S + F] = r[i++];
            } else
              for (t = 0; t < B; t++)
                s[t] && (A.pixels.resultPixels[t] = r[i++]);
          }
          return Q += o, A.ptr = Q, !0;
        },
        readHuffmanTree: function(E, A) {
          var I = this.HUFFMAN_LUT_BITS_MAX, a = new DataView(E, A.ptr, 16);
          A.ptr += 16;
          var Q = a.getInt32(0, !0);
          if (Q < 2)
            throw "unsupported Huffman version";
          var g = a.getInt32(4, !0), D = a.getInt32(8, !0), B = a.getInt32(12, !0);
          if (D >= B)
            return !1;
          var C = new Uint32Array(B - D);
          L.decodeBits(E, A, C);
          var o = [], r, s, f, e;
          for (r = D; r < B; r++)
            s = r - (r < g ? 0 : g), o[s] = { first: C[r - D], second: null };
          var i = E.byteLength - A.ptr, t = Math.ceil(i / 4), F = new ArrayBuffer(t * 4), S = new Uint8Array(F);
          S.set(new Uint8Array(E, A.ptr, i));
          var h = new Uint32Array(F), U = 0, G, R = 0;
          for (G = h[0], r = D; r < B; r++)
            s = r - (r < g ? 0 : g), e = o[s].first, e > 0 && (o[s].second = G << U >>> 32 - e, 32 - U >= e ? (U += e, U === 32 && (U = 0, R++, G = h[R])) : (U += e - 32, R++, G = h[R], o[s].second |= G >>> 32 - U));
          var w = 0, n = 0, l = new d();
          for (r = 0; r < o.length; r++)
            o[r] !== void 0 && (w = Math.max(w, o[r].first));
          w >= I ? n = I : n = w;
          var y = [], k, M, c, N, q, m;
          for (r = D; r < B; r++)
            if (s = r - (r < g ? 0 : g), e = o[s].first, e > 0)
              if (k = [e, s], e <= n)
                for (M = o[s].second << n - e, c = 1 << n - e, f = 0; f < c; f++)
                  y[M | f] = k;
              else
                for (M = o[s].second, m = l, N = e - 1; N >= 0; N--)
                  q = M >>> N & 1, q ? (m.right || (m.right = new d()), m = m.right) : (m.left || (m.left = new d()), m = m.left), N === 0 && !m.val && (m.val = k[1]);
          return {
            decodeLut: y,
            numBitsLUTQick: n,
            numBitsLUT: w,
            tree: l,
            stuffedData: h,
            srcPtr: R,
            bitPos: U
          };
        },
        readHuffman: function(E, A, I, a) {
          var Q = A.headerInfo, g = Q.numDims, D = A.headerInfo.height, B = A.headerInfo.width, C = B * D, o = this.readHuffmanTree(E, A), r = o.decodeLut, s = o.tree, f = o.stuffedData, e = o.srcPtr, i = o.bitPos, t = o.numBitsLUTQick, F = o.numBitsLUT, S = A.headerInfo.imageType === 0 ? 128 : 0, h, U, G, R = A.pixels.resultMask, w, n, l, y, k, M, c, N = 0;
          i > 0 && (e++, i = 0);
          var q = f[e], m = A.encodeMode === 1, O = new I(C * g), v = O, Y;
          if (g < 2 || m) {
            for (Y = 0; Y < g; Y++)
              if (g > 1 && (v = new I(O.buffer, C * Y, C), N = 0), A.headerInfo.numValidPixel === B * D)
                for (M = 0, y = 0; y < D; y++)
                  for (k = 0; k < B; k++, M++) {
                    if (U = 0, w = q << i >>> 32 - t, n = w, 32 - i < t && (w |= f[e + 1] >>> 64 - i - t, n = w), r[n])
                      U = r[n][1], i += r[n][0];
                    else
                      for (w = q << i >>> 32 - F, n = w, 32 - i < F && (w |= f[e + 1] >>> 64 - i - F, n = w), h = s, c = 0; c < F; c++)
                        if (l = w >>> F - c - 1 & 1, h = l ? h.right : h.left, !(h.left || h.right)) {
                          U = h.val, i = i + c + 1;
                          break;
                        }
                    i >= 32 && (i -= 32, e++, q = f[e]), G = U - S, m ? (k > 0 ? G += N : y > 0 ? G += v[M - B] : G += N, G &= 255, v[M] = G, N = G) : v[M] = G;
                  }
              else
                for (M = 0, y = 0; y < D; y++)
                  for (k = 0; k < B; k++, M++)
                    if (R[M]) {
                      if (U = 0, w = q << i >>> 32 - t, n = w, 32 - i < t && (w |= f[e + 1] >>> 64 - i - t, n = w), r[n])
                        U = r[n][1], i += r[n][0];
                      else
                        for (w = q << i >>> 32 - F, n = w, 32 - i < F && (w |= f[e + 1] >>> 64 - i - F, n = w), h = s, c = 0; c < F; c++)
                          if (l = w >>> F - c - 1 & 1, h = l ? h.right : h.left, !(h.left || h.right)) {
                            U = h.val, i = i + c + 1;
                            break;
                          }
                      i >= 32 && (i -= 32, e++, q = f[e]), G = U - S, m ? (k > 0 && R[M - 1] ? G += N : y > 0 && R[M - B] ? G += v[M - B] : G += N, G &= 255, v[M] = G, N = G) : v[M] = G;
                    }
          } else
            for (M = 0, y = 0; y < D; y++)
              for (k = 0; k < B; k++)
                if (M = y * B + k, !R || R[M])
                  for (Y = 0; Y < g; Y++, M += C) {
                    if (U = 0, w = q << i >>> 32 - t, n = w, 32 - i < t && (w |= f[e + 1] >>> 64 - i - t, n = w), r[n])
                      U = r[n][1], i += r[n][0];
                    else
                      for (w = q << i >>> 32 - F, n = w, 32 - i < F && (w |= f[e + 1] >>> 64 - i - F, n = w), h = s, c = 0; c < F; c++)
                        if (l = w >>> F - c - 1 & 1, h = l ? h.right : h.left, !(h.left || h.right)) {
                          U = h.val, i = i + c + 1;
                          break;
                        }
                    i >= 32 && (i -= 32, e++, q = f[e]), G = U - S, v[M] = G;
                  }
          A.ptr = A.ptr + (e + 1) * 4 + (i > 0 ? 4 : 0), A.pixels.resultPixels = O, g > 1 && !a && (A.pixels.resultPixels = L.swapDimensionOrder(O, C, g, I));
        },
        decodeBits: function(E, A, I, a, Q) {
          {
            var g = A.headerInfo, D = g.fileVersion, B = 0, C = E.byteLength - A.ptr >= 5 ? 5 : E.byteLength - A.ptr, o = new DataView(E, A.ptr, C), r = o.getUint8(0);
            B++;
            var s = r >> 6, f = s === 0 ? 4 : 3 - s, e = (r & 32) > 0, i = r & 31, t = 0;
            if (f === 1)
              t = o.getUint8(B), B++;
            else if (f === 2)
              t = o.getUint16(B, !0), B += 2;
            else if (f === 4)
              t = o.getUint32(B, !0), B += 4;
            else
              throw "Invalid valid pixel count type";
            var F = 2 * g.maxZError, S, h, U, G, R, w, n, l, y, k = g.numDims > 1 ? g.maxValues[Q] : g.zMax;
            if (e) {
              for (A.counter.lut++, l = o.getUint8(B), B++, G = Math.ceil((l - 1) * i / 8), R = Math.ceil(G / 4), h = new ArrayBuffer(R * 4), U = new Uint8Array(h), A.ptr += B, U.set(new Uint8Array(E, A.ptr, G)), n = new Uint32Array(h), A.ptr += G, y = 0; l - 1 >>> y; )
                y++;
              G = Math.ceil(t * y / 8), R = Math.ceil(G / 4), h = new ArrayBuffer(R * 4), U = new Uint8Array(h), U.set(new Uint8Array(E, A.ptr, G)), S = new Uint32Array(h), A.ptr += G, D >= 3 ? w = u.unstuffLUT2(n, i, l - 1, a, F, k) : w = u.unstuffLUT(n, i, l - 1, a, F, k), D >= 3 ? u.unstuff2(S, I, y, t, w) : u.unstuff(S, I, y, t, w);
            } else
              A.counter.bitstuffer++, y = i, A.ptr += B, y > 0 && (G = Math.ceil(t * y / 8), R = Math.ceil(G / 4), h = new ArrayBuffer(R * 4), U = new Uint8Array(h), U.set(new Uint8Array(E, A.ptr, G)), S = new Uint32Array(h), A.ptr += G, D >= 3 ? a == null ? u.originalUnstuff2(S, I, y, t) : u.unstuff2(S, I, y, t, !1, a, F, k) : a == null ? u.originalUnstuff(S, I, y, t) : u.unstuff(S, I, y, t, !1, a, F, k));
          }
        },
        readTiles: function(E, A, I, a) {
          var Q = A.headerInfo, g = Q.width, D = Q.height, B = g * D, C = Q.microBlockSize, o = Q.imageType, r = L.getDataTypeSize(o), s = Math.ceil(g / C), f = Math.ceil(D / C);
          A.pixels.numBlocksY = f, A.pixels.numBlocksX = s, A.pixels.ptr = 0;
          var e = 0, i = 0, t = 0, F = 0, S = 0, h = 0, U = 0, G = 0, R = 0, w = 0, n = 0, l = 0, y = 0, k = 0, M = 0, c = 0, N, q, m, O, v, Y, P = new I(C * C), eA = D % C || C, aA = g % C || C, AA, b, $ = Q.numDims, W, K = A.pixels.resultMask, H = A.pixels.resultPixels, rA = Q.fileVersion, CA = rA >= 5 ? 14 : 15, p, IA = Q.zMax, V;
          for (t = 0; t < f; t++)
            for (S = t !== f - 1 ? C : eA, F = 0; F < s; F++)
              for (h = F !== s - 1 ? C : aA, n = t * g * C + F * C, l = g - h, W = 0; W < $; W++) {
                if ($ > 1 ? (V = H, n = t * g * C + F * C, H = new I(A.pixels.resultPixels.buffer, B * W * r, B), IA = Q.maxValues[W]) : V = null, U = E.byteLength - A.ptr, N = new DataView(E, A.ptr, Math.min(10, U)), q = {}, c = 0, G = N.getUint8(0), c++, p = Q.fileVersion >= 5 ? G & 4 : 0, R = G >> 6 & 255, w = G >> 2 & CA, w !== (F * C >> 3 & CA) || p && W === 0)
                  throw "integrity issue";
                if (Y = G & 3, Y > 3)
                  throw A.ptr += c, "Invalid block encoding (" + Y + ")";
                if (Y === 2) {
                  if (p)
                    if (K)
                      for (e = 0; e < S; e++)
                        for (i = 0; i < h; i++)
                          K[n] && (H[n] = V[n]), n++;
                    else
                      for (e = 0; e < S; e++)
                        for (i = 0; i < h; i++)
                          H[n] = V[n], n++;
                  A.counter.constant++, A.ptr += c;
                  continue;
                } else if (Y === 0) {
                  if (p)
                    throw "integrity issue";
                  if (A.counter.uncompressed++, A.ptr += c, y = S * h * r, k = E.byteLength - A.ptr, y = y < k ? y : k, m = new ArrayBuffer(y % r === 0 ? y : y + r - y % r), O = new Uint8Array(m), O.set(new Uint8Array(E, A.ptr, y)), v = new I(m), M = 0, K)
                    for (e = 0; e < S; e++) {
                      for (i = 0; i < h; i++)
                        K[n] && (H[n] = v[M++]), n++;
                      n += l;
                    }
                  else
                    for (e = 0; e < S; e++) {
                      for (i = 0; i < h; i++)
                        H[n++] = v[M++];
                      n += l;
                    }
                  A.ptr += M * r;
                } else if (AA = L.getDataTypeUsed(p && o < 6 ? 4 : o, R), b = L.getOnePixel(q, c, AA, N), c += L.getDataTypeSize(AA), Y === 3)
                  if (A.ptr += c, A.counter.constantoffset++, K)
                    for (e = 0; e < S; e++) {
                      for (i = 0; i < h; i++)
                        K[n] && (H[n] = p ? Math.min(IA, V[n] + b) : b), n++;
                      n += l;
                    }
                  else
                    for (e = 0; e < S; e++) {
                      for (i = 0; i < h; i++)
                        H[n] = p ? Math.min(IA, V[n] + b) : b, n++;
                      n += l;
                    }
                else if (A.ptr += c, L.decodeBits(E, A, P, b, W), c = 0, p)
                  if (K)
                    for (e = 0; e < S; e++) {
                      for (i = 0; i < h; i++)
                        K[n] && (H[n] = P[c++] + V[n]), n++;
                      n += l;
                    }
                  else
                    for (e = 0; e < S; e++) {
                      for (i = 0; i < h; i++)
                        H[n] = P[c++] + V[n], n++;
                      n += l;
                    }
                else if (K)
                  for (e = 0; e < S; e++) {
                    for (i = 0; i < h; i++)
                      K[n] && (H[n] = P[c++]), n++;
                    n += l;
                  }
                else
                  for (e = 0; e < S; e++) {
                    for (i = 0; i < h; i++)
                      H[n++] = P[c++];
                    n += l;
                  }
              }
          $ > 1 && !a && (A.pixels.resultPixels = L.swapDimensionOrder(A.pixels.resultPixels, B, $, I));
        },
        /*****************
        *  private methods (helper methods)
        *****************/
        formatFileInfo: function(E) {
          return {
            fileIdentifierString: E.headerInfo.fileIdentifierString,
            fileVersion: E.headerInfo.fileVersion,
            imageType: E.headerInfo.imageType,
            height: E.headerInfo.height,
            width: E.headerInfo.width,
            numValidPixel: E.headerInfo.numValidPixel,
            microBlockSize: E.headerInfo.microBlockSize,
            blobSize: E.headerInfo.blobSize,
            maxZError: E.headerInfo.maxZError,
            pixelType: L.getPixelType(E.headerInfo.imageType),
            eofOffset: E.eofOffset,
            mask: E.mask ? {
              numBytes: E.mask.numBytes
            } : null,
            pixels: {
              numBlocksX: E.pixels.numBlocksX,
              numBlocksY: E.pixels.numBlocksY,
              //"numBytes": data.pixels.numBytes,
              maxValue: E.headerInfo.zMax,
              minValue: E.headerInfo.zMin,
              noDataValue: E.noDataValue
            }
          };
        },
        constructConstantSurface: function(E, A) {
          var I = E.headerInfo.zMax, a = E.headerInfo.zMin, Q = E.headerInfo.maxValues, g = E.headerInfo.numDims, D = E.headerInfo.height * E.headerInfo.width, B = 0, C = 0, o = 0, r = E.pixels.resultMask, s = E.pixels.resultPixels;
          if (r)
            if (g > 1) {
              if (A)
                for (B = 0; B < g; B++)
                  for (o = B * D, I = Q[B], C = 0; C < D; C++)
                    r[C] && (s[o + C] = I);
              else
                for (C = 0; C < D; C++)
                  if (r[C])
                    for (o = C * g, B = 0; B < g; B++)
                      s[o + g] = Q[B];
            } else
              for (C = 0; C < D; C++)
                r[C] && (s[C] = I);
          else if (g > 1 && a !== I)
            if (A)
              for (B = 0; B < g; B++)
                for (o = B * D, I = Q[B], C = 0; C < D; C++)
                  s[o + C] = I;
            else
              for (C = 0; C < D; C++)
                for (o = C * g, B = 0; B < g; B++)
                  s[o + B] = Q[B];
          else
            for (C = 0; C < D * g; C++)
              s[C] = I;
        },
        getDataTypeArray: function(E) {
          var A;
          switch (E) {
            case 0:
              A = Int8Array;
              break;
            case 1:
              A = Uint8Array;
              break;
            case 2:
              A = Int16Array;
              break;
            case 3:
              A = Uint16Array;
              break;
            case 4:
              A = Int32Array;
              break;
            case 5:
              A = Uint32Array;
              break;
            case 6:
              A = Float32Array;
              break;
            case 7:
              A = Float64Array;
              break;
            default:
              A = Float32Array;
          }
          return A;
        },
        getPixelType: function(E) {
          var A;
          switch (E) {
            case 0:
              A = "S8";
              break;
            case 1:
              A = "U8";
              break;
            case 2:
              A = "S16";
              break;
            case 3:
              A = "U16";
              break;
            case 4:
              A = "S32";
              break;
            case 5:
              A = "U32";
              break;
            case 6:
              A = "F32";
              break;
            case 7:
              A = "F64";
              break;
            default:
              A = "F32";
          }
          return A;
        },
        isValidPixelValue: function(E, A) {
          if (A == null)
            return !1;
          var I;
          switch (E) {
            case 0:
              I = A >= -128 && A <= 127;
              break;
            case 1:
              I = A >= 0 && A <= 255;
              break;
            case 2:
              I = A >= -32768 && A <= 32767;
              break;
            case 3:
              I = A >= 0 && A <= 65536;
              break;
            case 4:
              I = A >= -2147483648 && A <= 2147483647;
              break;
            case 5:
              I = A >= 0 && A <= 4294967296;
              break;
            case 6:
              I = A >= -34027999387901484e22 && A <= 34027999387901484e22;
              break;
            case 7:
              I = A >= -17976931348623157e292 && A <= 17976931348623157e292;
              break;
            default:
              I = !1;
          }
          return I;
        },
        getDataTypeSize: function(E) {
          var A = 0;
          switch (E) {
            case 0:
            case 1:
              A = 1;
              break;
            case 2:
            case 3:
              A = 2;
              break;
            case 4:
            case 5:
            case 6:
              A = 4;
              break;
            case 7:
              A = 8;
              break;
            default:
              A = E;
          }
          return A;
        },
        getDataTypeUsed: function(E, A) {
          var I = E;
          switch (E) {
            case 2:
            case 4:
              I = E - A;
              break;
            case 3:
            case 5:
              I = E - 2 * A;
              break;
            case 6:
              A === 0 ? I = E : A === 1 ? I = 2 : I = 1;
              break;
            case 7:
              A === 0 ? I = E : I = E - 2 * A + 1;
              break;
            default:
              I = E;
              break;
          }
          return I;
        },
        getOnePixel: function(E, A, I, a) {
          var Q = 0;
          switch (I) {
            case 0:
              Q = a.getInt8(A);
              break;
            case 1:
              Q = a.getUint8(A);
              break;
            case 2:
              Q = a.getInt16(A, !0);
              break;
            case 3:
              Q = a.getUint16(A, !0);
              break;
            case 4:
              Q = a.getInt32(A, !0);
              break;
            case 5:
              Q = a.getUInt32(A, !0);
              break;
            case 6:
              Q = a.getFloat32(A, !0);
              break;
            case 7:
              Q = a.getFloat64(A, !0);
              break;
            default:
              throw "the decoder does not understand this pixel type";
          }
          return Q;
        },
        swapDimensionOrder: function(E, A, I, a, Q) {
          var g = 0, D = 0, B = 0, C = 0, o = E;
          if (I > 1)
            if (o = new a(A * I), Q)
              for (g = 0; g < A; g++)
                for (C = g, B = 0; B < I; B++, C += A)
                  o[C] = E[D++];
            else
              for (g = 0; g < A; g++)
                for (C = g, B = 0; B < I; B++, C += A)
                  o[D++] = E[C];
          return o;
        }
      }, d = function(E, A, I) {
        this.val = E, this.left = A, this.right = I;
      }, z = {
        /*
        * ********removed options compared to LERC1. We can bring some of them back if needed.
         * removed pixel type. LERC2 is typed and doesn't require user to give pixel type
         * changed encodedMaskData to maskData. LERC2 's js version make it faster to use maskData directly.
         * removed returnMask. mask is used by LERC2 internally and is cost free. In case of user input mask, it's returned as well and has neglible cost.
         * removed nodatavalue. Because LERC2 pixels are typed, nodatavalue will sacrify a useful value for many types (8bit, 16bit) etc,
         *       user has to be knowledgable enough about raster and their data to avoid usability issues. so nodata value is simply removed now.
         *       We can add it back later if their's a clear requirement.
         * removed encodedMask. This option was not implemented in LercDecode. It can be done after decoding (less efficient)
         * removed computeUsedBitDepths.
         *
         *
         * response changes compared to LERC1
         * 1. encodedMaskData is not available
         * 2. noDataValue is optional (returns only if user's noDataValue is with in the valid data type range)
         * 3. maskData is always available
        */
        /*****************
        *  public properties
        ******************/
        //HUFFMAN_LUT_BITS_MAX: 12, //use 2^12 lut, not configurable
        /*****************
        *  public methods
        *****************/
        /**
         * Decode a LERC2 byte stream and return an object containing the pixel data and optional metadata.
         *
         * @param {ArrayBuffer} input The LERC input byte stream
         * @param {object} [options] options Decoding options
         * @param {number} [options.inputOffset] The number of bytes to skip in the input byte stream. A valid LERC file is expected at that position
         * @param {boolean} [options.returnFileInfo] If true, the return value will have a fileInfo property that contains metadata obtained from the LERC headers and the decoding process
         * @param {boolean} [options.returnPixelInterleavedDims]  If true, returned dimensions are pixel-interleaved, a.k.a [p1_dim0, p1_dim1, p1_dimn, p2_dim0...], default is [p1_dim0, p2_dim0, ..., p1_dim1, p2_dim1...]
         */
        decode: function(E, A) {
          A = A || {};
          var I = A.noDataValue, a = 0, Q = {};
          if (Q.ptr = A.inputOffset || 0, Q.pixels = {}, !!L.readHeaderInfo(E, Q)) {
            var g = Q.headerInfo, D = g.fileVersion, B = L.getDataTypeArray(g.imageType);
            if (D > 5)
              throw "unsupported lerc version 2." + D;
            L.readMask(E, Q), g.numValidPixel !== g.width * g.height && !Q.pixels.resultMask && (Q.pixels.resultMask = A.maskData);
            var C = g.width * g.height;
            Q.pixels.resultPixels = new B(C * g.numDims), Q.counter = {
              onesweep: 0,
              uncompressed: 0,
              lut: 0,
              bitstuffer: 0,
              constant: 0,
              constantoffset: 0
            };
            var o = !A.returnPixelInterleavedDims;
            if (g.numValidPixel !== 0)
              if (g.zMax === g.zMin)
                L.constructConstantSurface(Q, o);
              else if (D >= 4 && L.checkMinMaxRanges(E, Q))
                L.constructConstantSurface(Q, o);
              else {
                var r = new DataView(E, Q.ptr, 2), s = r.getUint8(0);
                if (Q.ptr++, s)
                  L.readDataOneSweep(E, Q, B, o);
                else if (D > 1 && g.imageType <= 1 && Math.abs(g.maxZError - 0.5) < 1e-5) {
                  var f = r.getUint8(1);
                  if (Q.ptr++, Q.encodeMode = f, f > 2 || D < 4 && f > 1)
                    throw "Invalid Huffman flag " + f;
                  f ? L.readHuffman(E, Q, B, o) : L.readTiles(E, Q, B, o);
                } else
                  L.readTiles(E, Q, B, o);
              }
            Q.eofOffset = Q.ptr;
            var e;
            A.inputOffset ? (e = Q.headerInfo.blobSize + A.inputOffset - Q.ptr, Math.abs(e) >= 1 && (Q.eofOffset = A.inputOffset + Q.headerInfo.blobSize)) : (e = Q.headerInfo.blobSize - Q.ptr, Math.abs(e) >= 1 && (Q.eofOffset = Q.headerInfo.blobSize));
            var i = {
              width: g.width,
              height: g.height,
              pixelData: Q.pixels.resultPixels,
              minValue: g.zMin,
              maxValue: g.zMax,
              validPixelCount: g.numValidPixel,
              dimCount: g.numDims,
              dimStats: {
                minValues: g.minValues,
                maxValues: g.maxValues
              },
              maskData: Q.pixels.resultMask
              //noDataValue: noDataValue
            };
            if (Q.pixels.resultMask && L.isValidPixelValue(g.imageType, I)) {
              var t = Q.pixels.resultMask;
              for (a = 0; a < C; a++)
                t[a] || (i.pixelData[a] = I);
              i.noDataValue = I;
            }
            return Q.noDataValue = I, A.returnFileInfo && (i.fileInfo = L.formatFileInfo(Q)), i;
          }
        },
        getBandCount: function(E) {
          var A = 0, I = 0, a = {};
          for (a.ptr = 0, a.pixels = {}; I < E.byteLength - 58; )
            L.readHeaderInfo(E, a), I += a.headerInfo.blobSize, A++, a.ptr = I;
          return A;
        }
      };
      return z;
    }(), Z = function() {
      var u = new ArrayBuffer(4), L = new Uint8Array(u), d = new Uint32Array(u);
      return d[0] = 1, L[0] === 1;
    }(), X = {
      /************wrapper**********************************************/
      /**
       * A wrapper for decoding both LERC1 and LERC2 byte streams capable of handling multiband pixel blocks for various pixel types.
       *
       * @alias module:Lerc
       * @param {ArrayBuffer} input The LERC input byte stream
       * @param {object} [options] The decoding options below are optional.
       * @param {number} [options.inputOffset] The number of bytes to skip in the input byte stream. A valid Lerc file is expected at that position.
       * @param {string} [options.pixelType] (LERC1 only) Default value is F32. Valid pixel types for input are U8/S8/S16/U16/S32/U32/F32.
       * @param {number} [options.noDataValue] (LERC1 only). It is recommended to use the returned mask instead of setting this value.
       * @param {boolean} [options.returnPixelInterleavedDims] (nDim LERC2 only) If true, returned dimensions are pixel-interleaved, a.k.a [p1_dim0, p1_dim1, p1_dimn, p2_dim0...], default is [p1_dim0, p2_dim0, ..., p1_dim1, p2_dim1...]
       * @returns {{width, height, pixels, pixelType, mask, statistics}}
         * @property {number} width Width of decoded image.
         * @property {number} height Height of decoded image.
         * @property {array} pixels [band1, band2, …] Each band is a typed array of width*height.
         * @property {string} pixelType The type of pixels represented in the output.
         * @property {mask} mask Typed array with a size of width*height, or null if all pixels are valid.
         * @property {array} statistics [statistics_band1, statistics_band2, …] Each element is a statistics object representing min and max values
      **/
      decode: function(u, L) {
        if (!Z)
          throw "Big endian system is not supported.";
        L = L || {};
        var d = L.inputOffset || 0, z = new Uint8Array(u, d, 10), E = String.fromCharCode.apply(null, z), A, I;
        if (E.trim() === "CntZImage")
          A = J, I = 1;
        else if (E.substring(0, 5) === "Lerc2")
          A = T, I = 2;
        else
          throw "Unexpected file identifier string: " + E;
        for (var a = 0, Q = u.byteLength - 10, g, D = [], B, C, o = {
          width: 0,
          height: 0,
          pixels: [],
          pixelType: L.pixelType,
          mask: null,
          statistics: []
        }, r = 0; d < Q; ) {
          var s = A.decode(u, {
            inputOffset: d,
            //for both lerc1 and lerc2
            encodedMaskData: g,
            //lerc1 only
            maskData: C,
            //lerc2 only
            returnMask: a === 0,
            //lerc1 only
            returnEncodedMask: a === 0,
            //lerc1 only
            returnFileInfo: !0,
            //for both lerc1 and lerc2
            returnPixelInterleavedDims: L.returnPixelInterleavedDims,
            //for ndim lerc2 only
            pixelType: L.pixelType || null,
            //lerc1 only
            noDataValue: L.noDataValue || null
            //lerc1 only
          });
          d = s.fileInfo.eofOffset, C = s.maskData, a === 0 && (g = s.encodedMaskData, o.width = s.width, o.height = s.height, o.dimCount = s.dimCount || 1, o.pixelType = s.pixelType || s.fileInfo.pixelType, o.mask = C), I > 1 && (C && D.push(C), s.fileInfo.mask && s.fileInfo.mask.numBytes > 0 && r++), a++, o.pixels.push(s.pixelData), o.statistics.push({
            minValue: s.minValue,
            maxValue: s.maxValue,
            noDataValue: s.noDataValue,
            dimStats: s.dimStats
          });
        }
        var f, e, i;
        if (I > 1 && r > 1) {
          for (i = o.width * o.height, o.bandMasks = D, C = new Uint8Array(i), C.set(D[0]), f = 1; f < D.length; f++)
            for (B = D[f], e = 0; e < i; e++)
              C[e] = C[e] & B[e];
          o.maskData = C;
        }
        return o;
      }
    };
    j.exports ? j.exports = X : this.Lerc = X;
  })();
})(iA);
var fA = iA.exports;
const tA = /* @__PURE__ */ sA(fA);
let _, x, QA;
const BA = {
  env: {
    emscripten_notify_memory_growth: function(j) {
      QA = new Uint8Array(x.exports.memory.buffer);
    }
  }
};
class wA {
  init() {
    return _ || (typeof fetch < "u" ? _ = fetch("data:application/wasm;base64," + EA).then((J) => J.arrayBuffer()).then((J) => WebAssembly.instantiate(J, BA)).then(this._init) : _ = WebAssembly.instantiate(Buffer.from(EA, "base64"), BA).then(this._init), _);
  }
  _init(J) {
    x = J.instance, BA.env.emscripten_notify_memory_growth(0);
  }
  decode(J, T = 0) {
    if (!x)
      throw new Error("ZSTDDecoder: Await .init() before decoding.");
    const Z = J.byteLength, X = x.exports.malloc(Z);
    QA.set(J, X), T = T || Number(x.exports.ZSTD_findDecompressedSize(X, Z));
    const u = x.exports.malloc(T), L = x.exports.ZSTD_decompress(u, T, X, Z), d = QA.slice(u, u + L);
    return x.exports.free(X), x.exports.free(u), d;
  }
}
const EA = "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IAMNACAEQQNxBEADQCACRQ0FIAAgAkF/aiICaiIDIAEgAmotAAA6AAAgA0EDcQ0ACwsgAkEDTQ0AA0AgACACQXxqIgJqIAEgAmooAgA2AgAgAkEDSw0ACwsgAkUNAgNAIAAgAkF/aiICaiABIAJqLQAAOgAAIAINAAsMAgsgAkEDTQ0AIAIhBANAIAMgASgCADYCACABQQRqIQEgA0EEaiEDIARBfGoiBEEDSw0ACyACQQNxIQILIAJFDQADQCADIAEtAAA6AAAgA0EBaiEDIAFBAWohASACQX9qIgINAAsLIAAL8wICAn8BfgJAIAJFDQAgACACaiIDQX9qIAE6AAAgACABOgAAIAJBA0kNACADQX5qIAE6AAAgACABOgABIANBfWogAToAACAAIAE6AAIgAkEHSQ0AIANBfGogAToAACAAIAE6AAMgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIEayICQSBJDQAgAa0iBUIghiAFhCEFIAMgBGohAQNAIAEgBTcDGCABIAU3AxAgASAFNwMIIAEgBTcDACABQSBqIQEgAkFgaiICQR9LDQALCyAACy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAIajYCACADCy8BAn8gACgCBCAAKAIAQQJ0aiICLQACIQMgACACLwEAIAEgAi0AAxAFajYCACADCx8AIAAgASACKAIEEAg2AgAgARAEGiAAIAJBCGo2AgQLCAAgAGdBH3MLugUBDX8jAEEQayIKJAACfyAEQQNNBEAgCkEANgIMIApBDGogAyAEEAsaIAAgASACIApBDGpBBBAVIgBBbCAAEAMbIAAgACAESxsMAQsgAEEAIAEoAgBBAXRBAmoQECENQVQgAygAACIGQQ9xIgBBCksNABogAiAAQQVqNgIAIAMgBGoiAkF8aiEMIAJBeWohDiACQXtqIRAgAEEGaiELQQQh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ASIDNgLE4AEgACgCvOABIQQgACABNgK84AEgACABIAJqNgK44AEgACABIAQgA2tqNgLA4AELpgEBAX8gACAAKALs4QEQFjYCyOABIABCADcD+OABIABCADcDuOABIABBwOABakIANwMAIABBqNAAaiIBQYyAgOAANgIAIABBADYCmOIBIABCADcDiOEBIABCAzcDgOEBIABBrNABakHgEikCADcCACAAQbTQAWpB6BIoAgA2AgAgACABNgIMIAAgAEGYIGo2AgggACAAQaAwajYCBCAAIABBEGo2AgALYQEBf0G4fyEDAkAgAUEDSQ0AIAIgABAhIgFBA3YiADYCCCACIAFBAXE2AgQgAiABQQF2QQNxIgM2AgACQCADQX9qIgFBAksNAAJAIAFBAWsOAgEAAgtBbA8LIAAhAwsgAwsMACAAIAEgAkEAEC4LiAQCA38CfiADEBYhBCAAQQBBKBAQIQAgBCACSwRAIAQPCyABRQRAQX8PCwJAAkAgA0EBRg0AIAEoAAAiBkGo6r5pRg0AQXYhAyAGQXBxQdDUtMIBRw0BQQghAyACQQhJDQEgAEEAQSgQECEAIAEoAAQhASAAQQE2AhQgACABrTcDAEEADwsgASACIAMQLyIDIAJLDQAgACADNgIYQXIhAyABIARqIgVBf2otAAAiAkEIcQ0AIAJBIHEiBkUEQEFwIQMgBS0AACIFQacBSw0BIAVBB3GtQgEgBUEDdkEKaq2GIgdCA4h+IAd8IQggBEEBaiEECyACQQZ2IQMgAkECdiEFAkAgAkEDcUF/aiICQQJLBEBBACECDAELAkACQAJAIAJBAWsOAgECAAsgASAEai0AACECIARBAWohBAwCCyABIARqLwAAIQIgBEECaiEEDAELIAEgBGooAAAhAiAEQQRqIQQLIAVBAXEhBQJ+AkACQAJAIANBf2oiA0ECTQRAIANBAWsOAgIDAQtCfyAGRQ0DGiABIARqMQAADAMLIAEgBGovAACtQoACfAwCCyABIARqKAAArQwBCyABIARqKQAACyEHIAAgBTYCICAAIAI2AhwgACAHNwMAQQAhAyAAQQA2AhQgACAHIAggBhsiBzcDCCAAIAdCgIAIIAdCgIAIVBs+AhALIAMLWwEBf0G4fyEDIAIQFiICIAFNBH8gACACakF/ai0AACIAQQNxQQJ0QaAeaigCACACaiAAQQZ2IgFBAnRBsB5qKAIAaiAAQSBxIgBFaiABRSAAQQV2cWoFQbh/CwsdACAAKAKQ4gEQWiAAQQA2AqDiASAAQgA3A5DiAQu1AwEFfyMAQZACayIKJABBuH8hBgJAIAVFDQAgBCwAACIIQf8BcSEHAkAgCEF/TARAIAdBgn9qQQF2IgggBU8NAkFsIQYgB0GBf2oiBUGAAk8NAiAEQQFqIQdBACEGA0AgBiAFTwRAIAUhBiAIIQcMAwUgACAGaiAHIAZBAXZqIgQtAABBBHY6AAAgACAGQQFyaiAELQAAQQ9xOgAAIAZBAmohBgwBCwAACwALIAcgBU8NASAAIARBAWogByAKEFMiBhADDQELIAYhBEEAIQYgAUEAQTQQECEJQQAhBQNAIAQgBkcEQCAAIAZqIggtAAAiAUELSwRAQWwhBgwDBSAJIAFBAnRqIgEgASgCAEEBajYCACAGQQFqIQZBASAILQAAdEEBdSAFaiEFDAILAAsLQWwhBiAFRQ0AIAUQFEEBaiIBQQxLDQAgAyABNgIAQQFBASABdCAFayIDEBQiAXQgA0cNACAAIARqIAFBAWoiADoAACAJIABBAnRqIgAgACgCAEEBajYCACAJKAIEIgBBAkkgAEEBcXINACACIARBAWo2AgAgB0EBaiEGCyAKQZACaiQAIAYLxhEBDH8jAEHwAGsiBSQAQWwhCwJAIANBCkkNACACLwAAIQogAi8AAiEJIAIvAAQhByAFQQhqIAQQDgJAIAMgByAJIApqakEGaiIMSQ0AIAUtAAohCCAFQdgAaiACQQZqIgIgChAGIgsQAw0BIAVBQGsgAiAKaiICIAkQBiILEAMNASAFQShqIAIgCWoiAiAHEAYiCxADDQEgBUEQaiACIAdqIAMgDGsQBiILEAMNASAAIAFqIg9BfWohECAEQQRqIQZBASELIAAgAUEDakECdiIDaiIMIANqIgIgA2oiDiEDIAIhBCAMIQcDQCALIAMgEElxBEAgACAGIAVB2ABqIAgQAkECdGoiCS8BADsAACAFQdgAaiAJLQACEAEgCS0AAyELIAcgBiAFQUBrIAgQAkECdGoiCS8BADsAACAFQUBrIAktAAIQASAJLQADIQogBCAGIAVBKGogCBACQQJ0aiIJLwEAOwAAIAVBKGogCS0AAhABIAktAAMhCSADIAYgBUEQaiAIEAJBAnRqIg0vAQA7AAAgBUEQaiANLQACEAEgDS0AAyENIAAgC2oiCyAGIAVB2ABqIAgQAkECdGoiAC8BADsAACAFQdgAaiAALQACEAEgAC0AAyEAIAcgCmoiCiAGIAVBQGsgCBACQQJ0aiIHLwEAOwAAIAVBQGsgBy0AAhABIActAAMhByAEIAlqIgkgBiAFQShqIAgQAkECdGoiBC8BADsAACAFQShqIAQtAAIQASAELQADIQQgAyANaiIDIAYgBUEQaiAIEAJBAnRqIg0vAQA7AAAgBUEQaiANLQACEAEgACALaiEAIAcgCmohByAEIAlqIQQgAyANLQADaiEDIAVB2ABqEA0gBUFAaxANciAFQShqEA1yIAVBEGoQDXJFIQsMAQsLIAQgDksgByACS3INAEFsIQsgACAMSw0BIAxBfWohCQNAQQAgACAJSSAFQdgAahAEGwRAIAAgBiAFQdgAaiAIEAJBAnRqIgovAQA7AAAgBUHYAGogCi0AAhABIAAgCi0AA2oiACAGIAVB2ABqIAgQAkECdGoiCi8BADsAACAFQdgAaiAKLQACEAEgACAKLQADaiEADAEFIAxBfmohCgNAIAVB2ABqEAQgACAKS3JFBEAgACAGIAVB2ABqIAgQAkECdGoiCS8BADsAACAFQdgAaiAJLQACEAEgACAJLQADaiEADAELCwNAIAAgCk0EQCAAIAYgBUHYAGogCBACQQJ0aiIJLwEAOwAAIAVB2ABqIAktAAIQASAAIAktAANqIQAMAQsLAkAgACAMTw0AIAAgBiAFQdgAaiAIEAIiAEECdGoiDC0AADoAACAMLQADQQFGBEAgBUHYAGogDC0AAhABDAELIAUoAlxBH0sNACAFQdgAaiAGIABBAnRqLQACEAEgBSgCXEEhSQ0AIAVBIDYCXAsgAkF9aiEMA0BBACAHIAxJIAVBQGsQBBsEQCAHIAYgBUFAayAIEAJBAnRqIgAvAQA7AAAgBUFAayAALQACEAEgByAALQADaiIAIAYgBUFAayAIEAJBAnRqIgcvAQA7AAAgBUFAayAHLQACEAEgACAHLQADaiEHDAEFIAJBfmohDANAIAVBQGsQBCAHIAxLckUEQCAHIAYgBUFAayAIEAJBAnRqIgAvAQA7AAAgBUFAayAALQACEAEgByAALQADaiEHDAELCwNAIAcgDE0EQCAHIAYgBUFAayAIEAJBAnRqIgAvAQA7AAAgBUFAayAALQACEAEgByAALQADaiEHDAELCwJAIAcgAk8NACAHIAYgBUFAayAIEAIiAEECdGoiAi0AADoAACACLQADQQFGBEAgBUFAayACLQACEAEMAQsgBSgCREEfSw0AIAVBQGsgBiAAQQJ0ai0AAhABIAUoAkRBIUkNACAFQSA2AkQLIA5BfWohAgNAQQAgBCACSSAFQShqEAQbBEAgBCAGIAVBKGogCBACQQJ0aiIALwEAOwAAIAVBKGogAC0AAhABIAQgAC0AA2oiACAGIAVBKGogCBACQQJ0aiIELwEAOwAAIAVBKGogBC0AAhABIAAgBC0AA2ohBAwBBSAOQX5qIQIDQCAFQShqEAQgBCACS3JFBEAgBCAGIAVBKGogCBACQQJ0aiIALwEAOwAAIAVBKGogAC0AAhABIAQgAC0AA2ohBAwBCwsDQCAEIAJNBEAgBCAGIAVBKGogCBACQQJ0aiIALwEAOwAAIAVBKGogAC0AAhABIAQgAC0AA2ohBAwBCwsCQCAEIA5PDQAgBCAGIAVBKGogCBACIgBBAnRqIgItAAA6AAAgAi0AA0EBRgRAIAVBKGogAi0AAhABDAELIAUoAixBH0sNACAFQShqIAYgAEECdGotAAIQASAFKAIsQSFJDQAgBUEgNgIsCwNAQQAgAyAQSSAFQRBqEAQbBEAgAyAGIAVBEGogCBACQQJ0aiIALwEAOwAAIAVBEGogAC0AAhABIAMgAC0AA2oiACAGIAVBEGogCBACQQJ0aiICLwEAOwAAIAVBEGogAi0AAhABIAAgAi0AA2ohAwwBBSAPQX5qIQIDQCAFQRBqEAQgAyACS3JFBEAgAyAGIAVBEGogCBACQQJ0aiIALwEAOwAAIAVBEGogAC0AAhABIAMgAC0AA2ohAwwBCwsDQCADIAJNBEAgAyAGIAVBEGogCBACQQJ0aiIALwEAOwAAIAVBEGogAC0AAhABIAMgAC0AA2ohAwwBCwsCQCADIA9PDQAgAyAGIAVBEGogCBACIgBBAnRqIgItAAA6AAAgAi0AA0EBRgRAIAVBEGogAi0AAhABDAELIAUoAhRBH0sNACAFQRBqIAYgAEECdGotAAIQASAFKAIUQSFJDQAgBUEgNgIUCyABQWwgBUHYAGoQCiAFQUBrEApxIAVBKGoQCnEgBUEQahAKcRshCwwJCwAACwALAAALAAsAAAsACwAACwALQWwhCwsgBUHwAGokACALC7UEAQ5/IwBBEGsiBiQAIAZBBGogABAOQVQhBQJAIARB3AtJDQAgBi0ABCEHIANB8ARqQQBB7AAQECEIIAdBDEsNACADQdwJaiIJIAggBkEIaiAGQQxqIAEgAhAxIhAQA0UEQCAGKAIMIgQgB0sNASADQdwFaiEPIANBpAVqIREgAEEEaiESIANBqAVqIQEgBCEFA0AgBSICQX9qIQUgCCACQQJ0aigCAEUNAAsgAkEBaiEOQQEhBQNAIAUgDk9FBEAgCCAFQQJ0IgtqKAIAIQwgASALaiAKNgIAIAVBAWohBSAKIAxqIQoMAQsLIAEgCjYCAEEAIQUgBigCCCELA0AgBSALRkUEQCABIAUgCWotAAAiDEECdGoiDSANKAIAIg1BAWo2AgAgDyANQQF0aiINIAw6AAEgDSAFOgAAIAVBAWohBQwBCwtBACEBIANBADYCqAUgBEF/cyAHaiEJQQEhBQNAIAUgDk9FBEAgCCAFQQJ0IgtqKAIAIQwgAyALaiABNgIAIAwgBSAJanQgAWohASAFQQFqIQUMAQsLIAcgBEEBaiIBIAJrIgRrQQFqIQgDQEEBIQUgBCAIT0UEQANAIAUgDk9FBEAgBUECdCIJIAMgBEE0bGpqIAMgCWooAgAgBHY2AgAgBUEBaiEFDAELCyAEQQFqIQQMAQsLIBIgByAPIAogESADIAIgARBkIAZBAToABSAGIAc6AAYgACAGKAIENgIACyAQIQULIAZBEGokACAFC8ENAQt/IwBB8ABrIgUkAEFsIQkCQCADQQpJDQAgAi8AACEKIAIvAAIhDCACLwAEIQYgBUEIaiAEEA4CQCADIAYgCiAMampBBmoiDUkNACAFLQAKIQcgBUHYAGogAkEGaiICIAoQBiIJEAMNASAFQUBrIAIgCmoiAiAMEAYiCRADDQEgBUEoaiACIAxqIgIgBhAGIgkQAw0BIAVBEGogAiAGaiADIA1rEAYiCRADDQEgACABaiIOQX1qIQ8gBEEEaiEGQQEhCSAAIAFBA2pBAnYiAmoiCiACaiIMIAJqIg0hAyAMIQQgCiECA0AgCSADIA9JcQRAIAYgBUHYAGogBxACQQF0aiIILQAAIQsgBUHYAGogCC0AARABIAAgCzoAACAGIAVBQGsgBxACQQF0aiIILQAAIQsgBUFAayAILQABEAEgAiALOgAAIAYgBUEoaiAHEAJBAXRqIggtAAAhCyAFQShqIAgtAAEQASAEIAs6AAAgBiAFQRBqIAcQAkEBdGoiCC0AACELIAVBEGogCC0AARABIAMgCzoAACAGIAVB2ABqIAcQAkEBdGoiCC0AACELIAVB2ABqIAgtAAEQASAAIAs6AAEgBiAFQUBrIAcQAkEBdGoiCC0AACELIAVBQGsgCC0AARABIAIgCzoAASAGIAVBKGogBxACQQF0aiIILQAAIQsgBUEoaiAILQABEAEgBCALOgABIAYgBUEQaiAHEAJBAXRqIggtAAAhCyAFQRBqIAgtAAEQASADIAs6AAEgA0ECaiEDIARBAmohBCACQQJqIQIgAEECaiEAIAkgBUHYAGoQDUVxIAVBQGsQDUVxIAVBKGoQDUVxIAVBEGoQDUVxIQkMAQsLIAQgDUsgAiAMS3INAEFsIQkgACAKSw0BIApBfWohCQNAIAVB2ABqEAQgACAJT3JFBEAgBiAFQdgAaiAHEAJBAXRqIggtAAAhCyAFQdgAaiAILQABEAEgACALOgAAIAYgBUHYAGogBxACQQF0aiIILQAAIQsgBUHYAGogCC0AARABIAAgCzoAASAAQQJqIQAMAQsLA0AgBUHYAGoQBCAAIApPckUEQCAGIAVB2ABqIAcQAkEBdGoiCS0AACEIIAVB2ABqIAktAAEQASAAIAg6AAAgAEEBaiEADAELCwNAIAAgCkkEQCAGIAVB2ABqIAcQAkEBdGoiCS0AACEIIAVB2ABqIAktAAEQASAAIAg6AAAgAEEBaiEADAELCyAMQX1qIQADQCAFQUBrEAQgAiAAT3JFBEAgBiAFQUBrIAcQAkEBdGoiCi0AACEJIAVBQGsgCi0AARABIAIgCToAACAGIAVBQGsgBxACQQF0aiIKLQAAIQkgBUFAayAKLQABEAEgAiAJOgABIAJBAmohAgwBCwsDQCAFQUBrEAQgAiAMT3JFBEAgBiAFQUBrIAcQAkEBdGoiAC0AACEKIAVBQGsgAC0AARABIAIgCjoAACACQQFqIQIMAQsLA0AgAiAMSQRAIAYgBUFAayAHEAJBAXRqIgAtAAAhCiAFQUBrIAAtAAEQASACIAo6AAAgAkEBaiECDAELCyANQX1qIQADQCAFQShqEAQgBCAAT3JFBEAgBiAFQShqIAcQAkEBdGoiAi0AACEKIAVBKGogAi0AARABIAQgCjoAACAGIAVBKGogBxACQQF0aiICLQAAIQogBUEoaiACLQABEAEgBCAKOgABIARBAmohBAwBCwsDQCAFQShqEAQgBCANT3JFBEAgBiAFQShqIAcQAkEBdGoiAC0AACECIAVBKGogAC0AARABIAQgAjoAACAEQQFqIQQMAQsLA0AgBCANSQRAIAYgBUEoaiAHEAJBAXRqIgAtAAAhAiAFQShqIAAtAAEQASAEIAI6AAAgBEEBaiEEDAELCwNAIAVBEGoQBCADIA9PckUEQCAGIAVBEGogBxACQQF0aiIALQAAIQIgBUEQaiAALQABEAEgAyACOgAAIAYgBUEQaiAHEAJBAXRqIgAtAAAhAiAFQRBqIAAtAAEQASADIAI6AAEgA0ECaiEDDAELCwNAIAVBEGoQBCADIA5PckUEQCAGIAVBEGogBxACQQF0aiIALQAAIQIgBUEQaiAALQABEAEgAyACOgAAIANBAWohAwwBCwsDQCADIA5JBEAgBiAFQRBqIAcQAkEBdGoiAC0AACECIAVBEGogAC0AARABIAMgAjoAACADQQFqIQMMAQsLIAFBbCAFQdgAahAKIAVBQGsQCnEgBUEoahAKcSAFQRBqEApxGyEJDAELQWwhCQsgBUHwAGokACAJC8oCAQR/IwBBIGsiBSQAIAUgBBAOIAUtAAIhByAFQQhqIAIgAxAGIgIQA0UEQCAEQQRqIQIgACABaiIDQX1qIQQDQCAFQQhqEAQgACAET3JFBEAgAiAFQQhqIAcQAkEBdGoiBi0AACEIIAVBCGogBi0AARABIAAgCDoAACACIAVBCGogBxACQQF0aiIGLQAAIQggBUEIaiAGLQABEAEgACAIOgABIABBAmohAAwBCwsDQCAFQQhqEAQgACADT3JFBEAgAiAFQQhqIAcQAkEBdGoiBC0AACEGIAVBCGogBC0AARABIAAgBjoAACAAQQFqIQAMAQsLA0AgACADT0UEQCACIAVBCGogBxACQQF0aiIELQAAIQYgBUEIaiAELQABEAEgACAGOgAAIABBAWohAAwBCwsgAUFsIAVBCGoQChshAgsgBUEgaiQAIAILtgMBCX8jAEEQayIGJAAgBkEANgIMIAZBADYCCEFUIQQCQAJAIANBQGsiDCADIAZBCGogBkEMaiABIAIQMSICEAMNACAGQQRqIAAQDiAGKAIMIgcgBi0ABEEBaksNASAAQQRqIQogBkEAOgAFIAYgBzoABiAAIAYoAgQ2AgAgB0EBaiEJQQEhBANAIAQgCUkEQCADIARBAnRqIgEoAgAhACABIAU2AgAgACAEQX9qdCAFaiEFIARBAWohBAwBCwsgB0EBaiEHQQAhBSAGKAIIIQkDQCAFIAlGDQEgAyAFIAxqLQAAIgRBAnRqIgBBASAEdEEBdSILIAAoAgAiAWoiADYCACAHIARrIQhBACEEAkAgC0EDTQRAA0AgBCALRg0CIAogASAEakEBdGoiACAIOgABIAAgBToAACAEQQFqIQQMAAALAAsDQCABIABPDQEgCiABQQF0aiIEIAg6AAEgBCAFOgAAIAQgCDoAAyAEIAU6AAIgBCAIOgAFIAQgBToABCAEIAg6AAcgBCAFOgAGIAFBBGohAQwAAAsACyAFQQFqIQUMAAALAAsgAiEECyAGQRBqJAAgBAutAQECfwJAQYQgKAIAIABHIAAoAgBBAXYiAyABa0F4aiICQXhxQQhHcgR/IAIFIAMQJ0UNASACQQhqC0EQSQ0AIAAgACgCACICQQFxIAAgAWpBD2pBeHEiASAAa0EBdHI2AgAgASAANgIEIAEgASgCAEEBcSAAIAJBAXZqIAFrIgJBAXRyNgIAQYQgIAEgAkH/////B3FqQQRqQYQgKAIAIABGGyABNgIAIAEQJQsLygIBBX8CQAJAAkAgAEEIIABBCEsbZ0EfcyAAaUEBR2oiAUEESSAAIAF2cg0AIAFBAnRB/B5qKAIAIgJFDQADQCACQXhqIgMoAgBBAXZBeGoiBSAATwRAIAIgBUEIIAVBCEsbZ0Efc0ECdEGAH2oiASgCAEYEQCABIAIoAgQ2AgALDAMLIARBHksNASAEQQFqIQQgAigCBCICDQALC0EAIQMgAUEgTw0BA0AgAUECdEGAH2ooAgAiAkUEQCABQR5LIQIgAUEBaiEBIAJFDQEMAwsLIAIgAkF4aiIDKAIAQQF2QXhqIgFBCCABQQhLG2dBH3NBAnRBgB9qIgEoAgBGBEAgASACKAIENgIACwsgAigCACIBBEAgASACKAIENgIECyACKAIEIgEEQCABIAIoAgA2AgALIAMgAygCAEEBcjYCACADIAAQNwsgAwvhCwINfwV+IwBB8ABrIgckACAHIAAoAvDhASIINgJcIAEgAmohDSAIIAAoAoDiAWohDwJAAkAgBUUEQCABIQQMAQsgACgCxOABIRAgACgCwOABIREgACgCvOABIQ4gAEEBNgKM4QFBACEIA0AgCEEDRwRAIAcgCEECdCICaiAAIAJqQazQAWooAgA2AkQgCEEBaiEIDAELC0FsIQwgB0EYaiADIAQQBhADDQEgB0EsaiAHQRhqIAAoAgAQEyAHQTRqIAdBGGogACgCCBATIAdBPGogB0EYaiAAKAIEEBMgDUFgaiESIAEhBEEAIQwDQCAHKAIwIAcoAixBA3RqKQIAIhRCEIinQf8BcSEIIAcoAkAgBygCPEEDdGopAgAiFUIQiKdB/wFxIQsgBygCOCAHKAI0QQN0aikCACIWQiCIpyEJIBVCIIghFyAUQiCIpyECAkAgFkIQiKdB/wFxIgNBAk8EQAJAIAZFIANBGUlyRQRAIAkgB0EYaiADQSAgBygCHGsiCiAKIANLGyIKEAUgAyAKayIDdGohCSAHQRhqEAQaIANFDQEgB0EYaiADEAUgCWohCQwBCyAHQRhqIAMQBSAJaiEJIAdBGGoQBBoLIAcpAkQhGCAHIAk2AkQgByAYNwNIDAELAkAgA0UEQCACBEAgBygCRCEJDAMLIAcoAkghCQwBCwJAAkAgB0EYakEBEAUgCSACRWpqIgNBA0YEQCAHKAJEQX9qIgMgA0VqIQkMAQsgA0ECdCAHaigCRCIJIAlFaiEJIANBAUYNAQsgByAHKAJINgJMCwsgByAHKAJENgJIIAcgCTYCRAsgF6chAyALBEAgB0EYaiALEAUgA2ohAwsgCCALakEUTwRAIAdBGGoQBBoLIAgEQCAHQRhqIAgQBSACaiECCyAHQRhqEAQaIAcgB0EYaiAUQhiIp0H/AXEQCCAUp0H//wNxajYCLCAHIAdBGGogFUIYiKdB/wFxEAggFadB//8DcWo2AjwgB0EYahAEGiAHIAdBGGogFkIYiKdB/wFxEAggFqdB//8DcWo2AjQgByACNgJgIAcoAlwhCiAHIAk2AmggByADNgJkAkACQAJAIAQgAiADaiILaiASSw0AIAIgCmoiEyAPSw0AIA0gBGsgC0Egak8NAQsgByAHKQNoNwMQIAcgBykDYDcDCCAEIA0gB0EIaiAHQdwAaiAPIA4gESAQEB4hCwwBCyACIARqIQggBCAKEAcgAkERTwRAIARBEGohAgNAIAIgCkEQaiIKEAcgAkEQaiICIAhJDQALCyAIIAlrIQIgByATNgJcIAkgCCAOa0sEQCAJIAggEWtLBEBBbCELDAILIBAgAiAOayICaiIKIANqIBBNBEAgCCAKIAMQDxoMAgsgCCAKQQAgAmsQDyEIIAcgAiADaiIDNgJkIAggAmshCCAOIQILIAlBEE8EQCADIAhqIQMDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALDAELAkAgCUEHTQRAIAggAi0AADoAACAIIAItAAE6AAEgCCACLQACOgACIAggAi0AAzoAAyAIQQRqIAIgCUECdCIDQcAeaigCAGoiAhAXIAIgA0HgHmooAgBrIQIgBygCZCEDDAELIAggAhAMCyADQQlJDQAgAyAIaiEDIAhBCGoiCCACQQhqIgJrQQ9MBEADQCAIIAIQDCACQQhqIQIgCEEIaiIIIANJDQAMAgALAAsDQCAIIAIQByACQRBqIQIgCEEQaiIIIANJDQALCyAHQRhqEAQaIAsgDCALEAMiAhshDCAEIAQgC2ogAhshBCAFQX9qIgUNAAsgDBADDQFBbCEMIAdBGGoQBEECSQ0BQQAhCANAIAhBA0cEQCAAIAhBAnQiAmpBrNABaiACIAdqKAJENgIAIAhBAWohCAwBCwsgBygCXCEIC0G6fyEMIA8gCGsiACANIARrSw0AIAQEfyAEIAggABALIABqBUEACyABayEMCyAHQfAAaiQAIAwLkRcCFn8FfiMAQdABayIHJAAgByAAKALw4QEiCDYCvAEgASACaiESIAggACgCgOIBaiETAkACQCAFRQRAIAEhAwwBCyAAKALE4AEhESAAKALA4AEhFSAAKAK84AEhDyAAQQE2AozhAUEAIQgDQCAIQQNHBEAgByAIQQJ0IgJqIAAgAmpBrNABaigCADYCVCAIQQFqIQgMAQsLIAcgETYCZCAHIA82AmAgByABIA9rNgJoQWwhECAHQShqIAMgBBAGEAMNASAFQQQgBUEESBshFyAHQTxqIAdBKGogACgCABATIAdBxABqIAdBKGogACgCCBATIAdBzABqIAdB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IAdB0AFqJAAgEAslACAAQgA3AgAgAEEAOwEIIABBADoACyAAIAE2AgwgACACOgAKC7QFAQN/IwBBMGsiBCQAIABB/wFqIgVBfWohBgJAIAMvAQIEQCAEQRhqIAEgAhAGIgIQAw0BIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahASOgAAIAMgBEEIaiAEQRhqEBI6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0FIAEgBEEQaiAEQRhqEBI6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBSABIARBCGogBEEYahASOgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEjoAACABIAJqIABrIQIMAwsgAyAEQRBqIARBGGoQEjoAAiADIARBCGogBEEYahASOgADIANBBGohAwwAAAsACyAEQRhqIAEgAhAGIgIQAw0AIARBEGogBEEYaiADEBwgBEEIaiAEQRhqIAMQHCAAIQMDQAJAIARBGGoQBCADIAZPckUEQCADIARBEGogBEEYahAROgAAIAMgBEEIaiAEQRhqEBE6AAEgBEEYahAERQ0BIANBAmohAwsgBUF+aiEFAn8DQEG6fyECIAMiASAFSw0EIAEgBEEQaiAEQRhqEBE6AAAgAUEBaiEDIARBGGoQBEEDRgRAQQIhAiAEQQhqDAILIAMgBUsNBCABIARBCGogBEEYahAROgABIAFBAmohA0EDIQIgBEEYahAEQQNHDQALIARBEGoLIQUgAyAFIARBGGoQEToAACABIAJqIABrIQIMAgsgAyAEQRBqIARBGGoQEToAAiADIARBCGogBEEYahAROgADIANBBGohAwwAAAsACyAEQTBqJAAgAgtpAQF/An8CQAJAIAJBB00NACABKAAAQbfIwuF+Rw0AIAAgASgABDYCmOIBQWIgAEEQaiABIAIQPiIDEAMNAhogAEKBgICAEDcDiOEBIAAgASADaiACIANrECoMAQsgACABIAIQKgtBAAsLrQMBBn8jAEGAAWsiAyQAQWIhCAJAIAJBCUkNACAAQZjQAGogAUEIaiIEIAJBeGogAEGY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wOABCwutAgIEfwF+IwBBQGoiBCQAAkACQCACQQhJDQAgASgAAEFwcUHQ1LTCAUcNACABIAIQIiEBIABCADcDCCAAQQA2AgQgACABNgIADAELIARBGGogASACEC0iAxADBEAgACADEBoMAQsgAwRAIABBuH8QGgwBCyACIAQoAjAiA2shAiABIANqIQMDQAJAIAAgAyACIARBCGoQLCIFEAMEfyAFBSACIAVBA2oiBU8NAUG4fwsQGgwCCyAGQQFqIQYgAiAFayECIAMgBWohAyAEKAIMRQ0ACyAEKAI4BEAgAkEDTQRAIABBuH8QGgwCCyADQQRqIQMLIAQoAighAiAEKQMYIQcgAEEANgIEIAAgAyABazYCACAAIAIgBmytIAcgB0J/URs3AwgLIARBQGskAAslAQF/IwBBEGsiAiQAIAIgACABEFEgAigCACEAIAJBEGokACAAC30BBH8jAEGQBGsiBCQAIARB/wE2AggCQCAEQRBqIARBCGogBEEMaiABIAIQFSIGEAMEQCAGIQUMAQtBVCEFIAQoAgwiB0EGSw0AIAMgBEEQaiAEKAIIIAcQQSIFEAMNACAAIAEgBmogAiAGayADEDwhBQsgBEGQBGokACAFC4cBAgJ/An5BABAWIQMCQANAIAEgA08EQAJAIAAoAABBcHFB0NS0wgFGBEAgACABECIiAhADRQ0BQn4PCyAAIAEQVSIEQn1WDQMgBCAFfCIFIARUIQJCfiEEIAINAyAAIAEQUiICEAMNAwsgASACayEBIAAgAmohAAwBCwtCfiAFIAEbIQQLIAQLPwIBfwF+IwBBMGsiAiQAAn5CfiACQQhqIAAgARAtDQAaQgAgAigCHEEBRg0AGiACKQMICyEDIAJBMGokACADC40BAQJ/IwBBMGsiASQAAkAgAEUNACAAKAKI4gENACABIABB/OEBaigCADYCKCABIAApAvThATcDICAAEDAgACgCqOIBIQIgASABKAIoNgIYIAEgASkDIDcDECACIAFBEGoQGyAAQQA2AqjiASABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALKgECfyMAQRBrIgAkACAAQQA2AgggAEIANwMAIAAQWCEBIABBEGokACABC4cBAQN/IwBBEGsiAiQAAkAgACgCAEUgACgCBEVzDQAgAiAAKAIINgIIIAIgACkCADcDAAJ/IAIoAgAiAQRAIAIoAghBqOMJIAERBQAMAQtBqOMJECgLIgFFDQAgASAAKQIANwL04QEgAUH84QFqIAAoAgg2AgAgARBZIAEhAwsgAkEQaiQAIAMLywEBAn8jAEEgayIBJAAgAEGBgIDAADYCtOIBIABBADYCiOIBIABBADYC7OEBIABCADcDkOIBIABBADYCpOMJIABBADYC3OIBIABCADcCzOIBIABBADYCvOIBIABBADYCxOABIABCADcCnOIBIABBpOIBakIANwIAIABBrOIBakEANgIAIAFCADcCECABQgA3AhggASABKQMYNwMIIAEgASkDEDcDACABKAIIQQh2QQFxIQIgAEEANgLg4gEgACACNgKM4gEgAUEgaiQAC3YBA38jAEEwayIBJAAgAARAIAEgAEHE0AFqIgIoAgA2AiggASAAKQK80AE3AyAgACgCACEDIAEgAigCADYCGCABIAApArzQATcDECADIAFBEGoQGyABIAEoAig2AgggASABKQMgNwMAIAAgARAbCyABQTBqJAALzAEBAX8gACABKAK00AE2ApjiASAAIAEoAgQiAjYCwOABIAAgAjYCvOABIAAgAiABKAIIaiICNgK44AEgACACNgLE4AEgASgCuNABBEAgAEKBgICAEDcDiOEBIAAgAUGk0ABqNgIMIAAgAUGUIGo2AgggACABQZwwajYCBCAAIAFBDGo2AgAgAEGs0AFqIAFBqNABaigCADYCACAAQbDQAWogAUGs0AFqKAIANgIAIABBtNABaiABQbDQAWooAgA2AgAPCyAAQgA3A4jhAQs7ACACRQRAQbp/DwsgBEUEQEFsDwsgAiAEEGAEQCAAIAEgAiADIAQgBRBhDwsgACABIAIgAyAEIAUQZQtGAQF/IwBBEGsiBSQAIAVBCGogBBAOAn8gBS0ACQRAIAAgASACIAMgBBAyDAELIAAgASACIAMgBBA0CyEAIAVBEGokACAACzQAIAAgAyAEIAUQNiIFEAMEQCAFDwsgBSAESQR/IAEgAiADIAVqIAQgBWsgABA1BUG4fwsLRgEBfyMAQRBrIgUkACAFQQhqIAQQDgJ/IAUtAAkEQCAAIAEgAiADIAQQYgwBCyAAIAEgAiADIAQQNQshACAFQRBqJAAgAAtZAQF/QQ8hAiABIABJBEAgAUEE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", hA = new wA();
class kA extends DA {
  constructor(J) {
    super(), this.planarConfiguration = typeof J.PlanarConfiguration < "u" ? J.PlanarConfiguration : 1, this.samplesPerPixel = typeof J.SamplesPerPixel < "u" ? J.SamplesPerPixel : 1, this.addCompression = J.LercParameters[nA.AddCompression];
  }
  decodeBlock(J) {
    switch (this.addCompression) {
      case gA.None:
        break;
      case gA.Deflate:
        J = oA(new Uint8Array(J)).buffer;
        break;
      case gA.Zstandard:
        J = hA.decode(new Uint8Array(J)).buffer;
        break;
      default:
        throw new Error(`Unsupported LERC additional compression method identifier: ${this.addCompression}`);
    }
    return tA.decode(J, { returnPixelInterleavedDims: this.planarConfiguration === 1 }).pixels[0].buffer;
  }
}
export {
  kA as default,
  hA as zstd
};
