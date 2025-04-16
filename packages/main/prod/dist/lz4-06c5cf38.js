var EI = Object.defineProperty;
var iI = (p, Q, D) => Q in p ? EI(p, Q, { enumerable: !0, configurable: !0, writable: !0, value: D }) : p[Q] = D;
var L = (p, Q, D) => (iI(p, typeof Q != "symbol" ? Q + "" : Q, D), D);
import { _ as rI } from "./chunk-INHXZS53-098e8433.js";
var tI = (() => (typeof document < "u" && document.currentScript && document.currentScript.src, function(p = {}) {
  var Q = p, D, d;
  Q.ready = new Promise((A, I) => {
    D = A, d = I;
  });
  var m = Object.assign({}, Q), J = Q.printErr || console.error.bind(console);
  Object.assign(Q, m), m = null;
  var X;
  Q.wasmBinary && (X = Q.wasmBinary), typeof WebAssembly != "object" && z("no native wasm support detected");
  var P, CA = !1, x, h, T, K, Y, f, EA, iA;
  function rA() {
    var A = P.buffer;
    Q.HEAP8 = x = new Int8Array(A), Q.HEAP16 = T = new Int16Array(A), Q.HEAPU8 = h = new Uint8Array(A), Q.HEAPU16 = K = new Uint16Array(A), Q.HEAP32 = Y = new Int32Array(A), Q.HEAPU32 = f = new Uint32Array(A), Q.HEAPF32 = EA = new Float32Array(A), Q.HEAPF64 = iA = new Float64Array(A);
  }
  var tA = [], eA = [], oA = [];
  function WA() {
    var A = Q.preRun.shift();
    tA.unshift(A);
  }
  var W = 0, q = null;
  function z(A) {
    throw Q.onAbort?.(A), A = "Aborted(" + A + ")", J(A), CA = !0, A = new WebAssembly.RuntimeError(A + ". Build with -sASSERTIONS for more info."), d(A), A;
  }
  var aA = (A) => A.startsWith("data:application/octet-stream;base64,"), SA = (A) => A.startsWith("file://"), H;
  if (H = "lz4_codec.wasm", !aA(H)) {
    var nA = H;
    H = Q.locateFile ? Q.locateFile(nA, "") : "" + nA;
  }
  function mA(A) {
    return Promise.resolve().then(() => {
      if (A == H && X)
        var I = new Uint8Array(X);
      else
        throw "both async and sync fetching of the wasm failed";
      return I;
    });
  }
  function sA(A, I, B) {
    return mA(A).then((g) => WebAssembly.instantiate(g, I)).then((g) => g).then(B, (g) => {
      J(`failed to asynchronously prepare wasm: ${g}`), z(g);
    });
  }
  function YA(A, I) {
    var B = H;
    return X || typeof WebAssembly.instantiateStreaming != "function" || aA(B) || SA(B) || typeof fetch != "function" ? sA(B, A, I) : fetch(B, { credentials: "same-origin" }).then((g) => WebAssembly.instantiateStreaming(g, A).then(I, function(C) {
      return J(`wasm streaming compile failed: ${C}`), J("falling back to ArrayBuffer instantiation"), sA(B, A, I);
    }));
  }
  var $ = (A) => {
    for (; 0 < A.length; )
      A.shift()(Q);
  };
  function HA(A) {
    this.D = A - 24, this.K = function(I) {
      f[this.D + 4 >> 2] = I;
    }, this.J = function(I) {
      f[this.D + 8 >> 2] = I;
    }, this.F = function(I, B) {
      this.G(), this.K(I), this.J(B);
    }, this.G = function() {
      f[this.D + 16 >> 2] = 0;
    };
  }
  var DA = 0, hA, y = (A) => {
    for (var I = ""; h[A]; )
      I += hA[h[A++]];
    return I;
  }, v = {}, S = {}, j = {}, w, vA = (A) => {
    throw new w(A);
  }, _, MA = (A, I) => {
    function B(t) {
      if (t = I(t), t.length !== g.length)
        throw new _("Mismatched type converter count");
      for (var E = 0; E < g.length; ++E)
        N(g[E], t[E]);
    }
    var g = [];
    g.forEach(function(t) {
      j[t] = A;
    });
    var C = Array(A.length), i = [], r = 0;
    A.forEach((t, E) => {
      S.hasOwnProperty(t) ? C[E] = S[t] : (i.push(t), v.hasOwnProperty(t) || (v[t] = []), v[t].push(() => {
        C[E] = S[t], ++r, r === i.length && B(C);
      }));
    }), i.length === 0 && B(C);
  };
  function LA(A, I, B = {}) {
    var g = I.name;
    if (!A)
      throw new w(`type "${g}" must have a positive integer typeid pointer`);
    if (S.hasOwnProperty(A)) {
      if (B.M)
        return;
      throw new w(`Cannot register type '${g}' twice`);
    }
    S[A] = I, delete j[A], v.hasOwnProperty(A) && (I = v[A], delete v[A], I.forEach((C) => C()));
  }
  function N(A, I, B = {}) {
    if (!("argPackAdvance" in I))
      throw new TypeError("registerType registeredInstance requires argPackAdvance");
    LA(A, I, B);
  }
  function fA() {
    this.B = [void 0], this.H = [];
  }
  var l = new fA(), wA = (A) => {
    A >= l.D && --l.get(A).I === 0 && l.G(A);
  }, cA = (A) => {
    switch (A) {
      case void 0:
        return 1;
      case null:
        return 2;
      case !0:
        return 3;
      case !1:
        return 4;
      default:
        return l.F({ I: 1, value: A });
    }
  };
  function lA(A) {
    return this.fromWireType(Y[A >> 2]);
  }
  var ZA = (A, I) => {
    switch (I) {
      case 4:
        return function(B) {
          return this.fromWireType(EA[B >> 2]);
        };
      case 8:
        return function(B) {
          return this.fromWireType(iA[B >> 3]);
        };
      default:
        throw new TypeError(`invalid float width (${I}): ${A}`);
    }
  }, AA = (A, I) => Object.defineProperty(I, "name", { value: A }), bA = (A) => {
    for (; A.length; ) {
      var I = A.pop();
      A.pop()(I);
    }
  };
  function FA(A) {
    for (var I = 1; I < A.length; ++I)
      if (A[I] !== null && A[I].C === void 0)
        return !0;
    return !1;
  }
  function TA(A) {
    var I = Function;
    if (!(I instanceof Function))
      throw new TypeError(`new_ called with constructor type ${typeof I} which is not a function`);
    var B = AA(I.name || "unknownFunctionName", function() {
    });
    return B.prototype = I.prototype, B = new B(), A = I.apply(B, A), A instanceof Object ? A : B;
  }
  var qA = (A, I) => {
    if (Q[A].A === void 0) {
      var B = Q[A];
      Q[A] = function() {
        if (!Q[A].A.hasOwnProperty(arguments.length))
          throw new w(`Function '${I}' called with an invalid number of arguments (${arguments.length}) - expects one of (${Q[A].A})!`);
        return Q[A].A[arguments.length].apply(this, arguments);
      }, Q[A].A = [], Q[A].A[B.L] = B;
    }
  }, XA = (A, I, B) => {
    if (Q.hasOwnProperty(A)) {
      if (B === void 0 || Q[A].A !== void 0 && Q[A].A[B] !== void 0)
        throw new w(`Cannot register public name '${A}' twice`);
      if (qA(A, A), Q.hasOwnProperty(B))
        throw new w(`Cannot register multiple overloads of a function with the same number of arguments (${B})!`);
      Q[A].A[B] = I;
    } else
      Q[A] = I, B !== void 0 && (Q[A].O = B);
  }, PA = (A, I) => {
    for (var B = [], g = 0; g < A; g++)
      B.push(f[I + 4 * g >> 2]);
    return B;
  }, IA, KA = (A, I) => {
    var B = [];
    return function() {
      if (B.length = 0, Object.assign(B, arguments), A.includes("j")) {
        var g = Q["dynCall_" + A];
        g = B && B.length ? g.apply(null, [I].concat(B)) : g.call(null, I);
      } else
        g = IA.get(I).apply(null, B);
      return g;
    };
  }, jA = (A, I) => {
    A = y(A);
    var B = A.includes("j") ? KA(A, I) : IA.get(I);
    if (typeof B != "function")
      throw new w(`unknown function pointer with signature ${A}: ${I}`);
    return B;
  }, yA, uA = (A) => {
    A = GA(A);
    var I = y(A);
    return G(A), I;
  }, OA = (A, I) => {
    function B(i) {
      C[i] || S[i] || (j[i] ? j[i].forEach(B) : (g.push(i), C[i] = !0));
    }
    var g = [], C = {};
    throw I.forEach(B), new yA(`${A}: ` + g.map(uA).join([", "]));
  }, VA = (A) => {
    A = A.trim();
    const I = A.indexOf("(");
    return I !== -1 ? A.substr(0, I) : A;
  }, xA = (A, I, B) => {
    switch (I) {
      case 1:
        return B ? (g) => x[g >> 0] : (g) => h[g >> 0];
      case 2:
        return B ? (g) => T[g >> 1] : (g) => K[g >> 1];
      case 4:
        return B ? (g) => Y[g >> 2] : (g) => f[g >> 2];
      default:
        throw new TypeError(`invalid integer width (${I}): ${A}`);
    }
  };
  function zA(A) {
    return this.fromWireType(f[A >> 2]);
  }
  for (var RA = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0, dA = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, $A = (A, I) => {
    for (var B = A >> 1, g = B + I / 2; !(B >= g) && K[B]; )
      ++B;
    if (B <<= 1, 32 < B - A && dA)
      return dA.decode(h.subarray(A, B));
    for (B = "", g = 0; !(g >= I / 2); ++g) {
      var C = T[A + 2 * g >> 1];
      if (C == 0)
        break;
      B += String.fromCharCode(C);
    }
    return B;
  }, _A = (A, I, B) => {
    if (B ?? (B = 2147483647), 2 > B)
      return 0;
    B -= 2;
    var g = I;
    B = B < 2 * A.length ? B / 2 : A.length;
    for (var C = 0; C < B; ++C)
      T[I >> 1] = A.charCodeAt(C), I += 2;
    return T[I >> 1] = 0, I - g;
  }, AI = (A) => 2 * A.length, II = (A, I) => {
    for (var B = 0, g = ""; !(B >= I / 4); ) {
      var C = Y[A + 4 * B >> 2];
      if (C == 0)
        break;
      ++B, 65536 <= C ? (C -= 65536, g += String.fromCharCode(55296 | C >> 10, 56320 | C & 1023)) : g += String.fromCharCode(C);
    }
    return g;
  }, BI = (A, I, B) => {
    if (B ?? (B = 2147483647), 4 > B)
      return 0;
    var g = I;
    B = g + B - 4;
    for (var C = 0; C < A.length; ++C) {
      var i = A.charCodeAt(C);
      if (55296 <= i && 57343 >= i) {
        var r = A.charCodeAt(++C);
        i = 65536 + ((i & 1023) << 10) | r & 1023;
      }
      if (Y[I >> 2] = i, I += 4, I + 4 > B)
        break;
    }
    return Y[I >> 2] = 0, I - g;
  }, gI = (A) => {
    for (var I = 0, B = 0; B < A.length; ++B) {
      var g = A.charCodeAt(B);
      55296 <= g && 57343 >= g && ++B, I += 4;
    }
    return I;
  }, NA = Array(256), O = 0; 256 > O; ++O)
    NA[O] = String.fromCharCode(O);
  hA = NA, w = Q.BindingError = class extends Error {
    constructor(A) {
      super(A), this.name = "BindingError";
    }
  }, _ = Q.InternalError = class extends Error {
    constructor(A) {
      super(A), this.name = "InternalError";
    }
  }, Object.assign(fA.prototype, { get(A) {
    return this.B[A];
  }, has(A) {
    return this.B[A] !== void 0;
  }, F(A) {
    var I = this.H.pop() || this.B.length;
    return this.B[I] = A, I;
  }, G(A) {
    this.B[A] = void 0, this.H.push(A);
  } }), l.B.push({ value: void 0 }, { value: null }, { value: !0 }, { value: !1 }), l.D = l.B.length, Q.count_emval_handles = () => {
    for (var A = 0, I = l.D; I < l.B.length; ++I)
      l.B[I] !== void 0 && ++A;
    return A;
  }, yA = Q.UnboundTypeError = ((A, I) => {
    var B = AA(I, function(g) {
      this.name = I, this.message = g, g = Error(g).stack, g !== void 0 && (this.stack = this.toString() + `
` + g.replace(/^Error(:[^\n]*)?\n/, ""));
    });
    return B.prototype = Object.create(A.prototype), B.prototype.constructor = B, B.prototype.toString = function() {
      return this.message === void 0 ? this.name : `${this.name}: ${this.message}`;
    }, B;
  })(Error, "UnboundTypeError");
  var QI = { n: (A, I, B) => {
    throw new HA(A).F(I, B), DA = A, DA;
  }, o: () => {
  }, l: (A, I, B, g) => {
    I = y(I), N(A, { name: I, fromWireType: function(C) {
      return !!C;
    }, toWireType: function(C, i) {
      return i ? B : g;
    }, argPackAdvance: 8, readValueFromPointer: function(C) {
      return this.fromWireType(h[C]);
    }, C: null });
  }, k: (A, I) => {
    I = y(I), N(A, { name: I, fromWireType: (B) => {
      if (!B)
        throw new w("Cannot use deleted val. handle = " + B);
      var g = l.get(B).value;
      return wA(B), g;
    }, toWireType: (B, g) => cA(g), argPackAdvance: 8, readValueFromPointer: lA, C: null });
  }, i: (A, I, B) => {
    I = y(I), N(A, { name: I, fromWireType: (g) => g, toWireType: (g, C) => C, argPackAdvance: 8, readValueFromPointer: ZA(I, B), C: null });
  }, d: (A, I, B, g, C, i, r) => {
    var t = PA(I, B);
    A = y(A), A = VA(A), C = jA(g, C), XA(A, function() {
      OA(`Cannot call ${A} due to unbound types`, t);
    }, I - 1), MA(t, function(E) {
      var o = A, a = A;
      E = [E[0], null].concat(E.slice(1));
      var n = C, e = E.length;
      if (2 > e)
        throw new w("argTypes array size mismatch! Must at least get return value and 'this' types!");
      var s = E[1] !== null && !1, F = FA(E), u = E[0].name !== "void";
      n = [vA, n, i, bA, E[0], E[1]];
      for (var c = 0; c < e - 2; ++c)
        n.push(E[c + 2]);
      if (!F)
        for (c = s ? 1 : 2; c < E.length; ++c)
          E[c].C !== null && n.push(E[c].C);
      F = FA(E), c = E.length;
      var R = "", M = "";
      for (e = 0; e < c - 2; ++e)
        R += (e !== 0 ? ", " : "") + "arg" + e, M += (e !== 0 ? ", " : "") + "arg" + e + "Wired";
      R = `
        return function (${R}) {
        if (arguments.length !== ${c - 2}) {
          throwBindingError('function ${a} called with ' + arguments.length + ' arguments, expected ${c - 2}');
        }`, F && (R += `var destructors = [];
`);
      var JA = F ? "destructors" : "null", gA = "throwBindingError invoker fn runDestructors retType classParam".split(" ");
      for (s && (R += "var thisWired = classParam['toWireType'](" + JA + `, this);
`), e = 0; e < c - 2; ++e)
        R += "var arg" + e + "Wired = argType" + e + "['toWireType'](" + JA + ", arg" + e + "); // " + E[e + 2].name + `
`, gA.push("argType" + e);
      if (s && (M = "thisWired" + (0 < M.length ? ", " : "") + M), R += (u || r ? "var rv = " : "") + "invoker(fn" + (0 < M.length ? ", " : "") + M + `);
`, F)
        R += `runDestructors(destructors);
`;
      else
        for (e = s ? 1 : 2; e < E.length; ++e)
          s = e === 1 ? "thisWired" : "arg" + (e - 2) + "Wired", E[e].C !== null && (R += s + "_dtor(" + s + "); // " + E[e].name + `
`, gA.push(s + "_dtor"));
      u && (R += `var ret = retType['fromWireType'](rv);
return ret;
`);
      let [UA, CI] = [gA, R + `}
`];
      if (UA.push(CI), E = TA(UA).apply(null, n), a = AA(a, E), E = I - 1, !Q.hasOwnProperty(o))
        throw new _("Replacing nonexistant public symbol");
      return Q[o].A !== void 0 && E !== void 0 ? Q[o].A[E] = a : (Q[o] = a, Q[o].L = E), [];
    });
  }, b: (A, I, B, g, C) => {
    if (I = y(I), C === -1 && (C = 4294967295), C = (t) => t, g === 0) {
      var i = 32 - 8 * B;
      C = (t) => t << i >>> i;
    }
    var r = I.includes("unsigned") ? function(t, E) {
      return E >>> 0;
    } : function(t, E) {
      return E;
    };
    N(A, {
      name: I,
      fromWireType: C,
      toWireType: r,
      argPackAdvance: 8,
      readValueFromPointer: xA(I, B, g !== 0),
      C: null
    });
  }, a: (A, I, B) => {
    function g(i) {
      return new C(x.buffer, f[i + 4 >> 2], f[i >> 2]);
    }
    var C = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][I];
    B = y(B), N(A, { name: B, fromWireType: g, argPackAdvance: 8, readValueFromPointer: g }, { M: !0 });
  }, e: (A, I) => {
    I = y(I);
    var B = I === "std::string";
    N(A, { name: I, fromWireType: function(g) {
      var C = f[g >> 2], i = g + 4;
      if (B)
        for (var r = i, t = 0; t <= C; ++t) {
          var E = i + t;
          if (t == C || h[E] == 0) {
            if (r) {
              var o = r, a = h, n = o + (E - r);
              for (r = o; a[r] && !(r >= n); )
                ++r;
              if (16 < r - o && a.buffer && RA)
                o = RA.decode(a.subarray(o, r));
              else {
                for (n = ""; o < r; ) {
                  var e = a[o++];
                  if (e & 128) {
                    var s = a[o++] & 63;
                    if ((e & 224) == 192)
                      n += String.fromCharCode((e & 31) << 6 | s);
                    else {
                      var F = a[o++] & 63;
                      e = (e & 240) == 224 ? (e & 15) << 12 | s << 6 | F : (e & 7) << 18 | s << 12 | F << 6 | a[o++] & 63, 65536 > e ? n += String.fromCharCode(e) : (e -= 65536, n += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
                    }
                  } else
                    n += String.fromCharCode(e);
                }
                o = n;
              }
            } else
              o = "";
            if (u === void 0)
              var u = o;
            else
              u += String.fromCharCode(0), u += o;
            r = E + 1;
          }
        }
      else {
        for (u = Array(C), t = 0; t < C; ++t)
          u[t] = String.fromCharCode(h[i + t]);
        u = u.join("");
      }
      return G(g), u;
    }, toWireType: function(g, C) {
      C instanceof ArrayBuffer && (C = new Uint8Array(C));
      var i, r = typeof C == "string";
      if (!(r || C instanceof Uint8Array || C instanceof Uint8ClampedArray || C instanceof Int8Array))
        throw new w("Cannot pass non-string to std::string");
      var t;
      if (B && r)
        for (i = t = 0; i < C.length; ++i) {
          var E = C.charCodeAt(i);
          127 >= E ? t++ : 2047 >= E ? t += 2 : 55296 <= E && 57343 >= E ? (t += 4, ++i) : t += 3;
        }
      else
        t = C.length;
      if (i = t, t = BA(4 + i + 1), E = t + 4, f[t >> 2] = i, B && r) {
        if (r = E, E = i + 1, i = h, 0 < E) {
          E = r + E - 1;
          for (var o = 0; o < C.length; ++o) {
            var a = C.charCodeAt(o);
            if (55296 <= a && 57343 >= a) {
              var n = C.charCodeAt(++o);
              a = 65536 + ((a & 1023) << 10) | n & 1023;
            }
            if (127 >= a) {
              if (r >= E)
                break;
              i[r++] = a;
            } else {
              if (2047 >= a) {
                if (r + 1 >= E)
                  break;
                i[r++] = 192 | a >> 6;
              } else {
                if (65535 >= a) {
                  if (r + 2 >= E)
                    break;
                  i[r++] = 224 | a >> 12;
                } else {
                  if (r + 3 >= E)
                    break;
                  i[r++] = 240 | a >> 18, i[r++] = 128 | a >> 12 & 63;
                }
                i[r++] = 128 | a >> 6 & 63;
              }
              i[r++] = 128 | a & 63;
            }
          }
          i[r] = 0;
        }
      } else if (r)
        for (r = 0; r < i; ++r) {
          if (o = C.charCodeAt(r), 255 < o)
            throw G(E), new w("String has UTF-16 code units that do not fit in 8 bits");
          h[E + r] = o;
        }
      else
        for (r = 0; r < i; ++r)
          h[E + r] = C[r];
      return g !== null && g.push(G, t), t;
    }, argPackAdvance: 8, readValueFromPointer: zA, C(g) {
      G(g);
    } });
  }, c: (A, I, B) => {
    if (B = y(B), I === 2)
      var g = $A, C = _A, i = AI, r = () => K, t = 1;
    else
      I === 4 && (g = II, C = BI, i = gI, r = () => f, t = 2);
    N(A, { name: B, fromWireType: (E) => {
      for (var o = f[E >> 2], a = r(), n, e = E + 4, s = 0; s <= o; ++s) {
        var F = E + 4 + s * I;
        (s == o || a[F >> t] == 0) && (e = g(e, F - e), n === void 0 ? n = e : (n += String.fromCharCode(0), n += e), e = F + I);
      }
      return G(E), n;
    }, toWireType: (E, o) => {
      if (typeof o != "string")
        throw new w(`Cannot pass non-string to C++ string type ${B}`);
      var a = i(o), n = BA(4 + a + I);
      return f[n >> 2] = a >> t, C(o, n + 4, a + I), E !== null && E.push(G, n), n;
    }, argPackAdvance: 8, readValueFromPointer: lA, C(E) {
      G(E);
    } });
  }, m: (A, I) => {
    I = y(I), N(A, { N: !0, name: I, argPackAdvance: 0, fromWireType: () => {
    }, toWireType: () => {
    } });
  }, g: wA, j: (A) => {
    4 < A && (l.get(A).I += 1);
  }, f: (A, I) => {
    var B = S[A];
    if (B === void 0)
      throw A = "_emval_take_value has unknown type " + uA(A), new w(A);
    return A = B, A = A.readValueFromPointer(I), cA(A);
  }, h: () => {
    z("");
  }, q: (A, I, B) => h.copyWithin(A, I, I + B), p: (A) => {
    var I = h.length;
    if (A >>>= 0, 2147483648 < A)
      return !1;
    for (var B = 1; 4 >= B; B *= 2) {
      var g = I * (1 + 0.2 / B);
      g = Math.min(g, A + 100663296);
      var C = Math;
      g = Math.max(A, g);
      A: {
        C = (C.min.call(C, 2147483648, g + (65536 - g % 65536) % 65536) - P.buffer.byteLength + 65535) / 65536;
        try {
          P.grow(C), rA();
          var i = 1;
          break A;
        } catch {
        }
        i = void 0;
      }
      if (i)
        return !0;
    }
    return !1;
  } }, U = function() {
    function A(B) {
      return U = B.exports, P = U.r, rA(), IA = U.w, eA.unshift(U.s), W--, Q.monitorRunDependencies?.(W), W == 0 && q && (B = q, q = null, B()), U;
    }
    var I = { a: QI };
    if (W++, Q.monitorRunDependencies?.(W), Q.instantiateWasm)
      try {
        return Q.instantiateWasm(
          I,
          A
        );
      } catch (B) {
        J(`Module.instantiateWasm callback failed with error: ${B}`), d(B);
      }
    return YA(I, function(B) {
      A(B.instance);
    }).catch(d), {};
  }(), BA = (A) => (BA = U.t)(A), G = (A) => (G = U.u)(A), GA = (A) => (GA = U.v)(A), V;
  q = function A() {
    V || pA(), V || (q = A);
  };
  function pA() {
    function A() {
      if (!V && (V = !0, Q.calledRun = !0, !CA)) {
        if ($(eA), D(Q), Q.onRuntimeInitialized && Q.onRuntimeInitialized(), Q.postRun)
          for (typeof Q.postRun == "function" && (Q.postRun = [Q.postRun]); Q.postRun.length; ) {
            var I = Q.postRun.shift();
            oA.unshift(I);
          }
        $(oA);
      }
    }
    if (!(0 < W)) {
      if (Q.preRun)
        for (typeof Q.preRun == "function" && (Q.preRun = [Q.preRun]); Q.preRun.length; )
          WA();
      $(tA), 0 < W || (Q.setStatus ? (Q.setStatus("Running..."), setTimeout(function() {
        setTimeout(function() {
          Q.setStatus("");
        }, 1), A();
      }, 1)) : A());
    }
  }
  if (Q.preInit)
    for (typeof Q.preInit == "function" && (Q.preInit = [Q.preInit]); 0 < Q.preInit.length; )
      Q.preInit.pop()();
  return pA(), p.ready;
}))(), eI = tI, oI = rI("AGFzbQEAAAABTgxgA39/fwBgAX8Bf2AAAGADf39/AX9gAX8AYAR/f39/AGAFf39/f38AYAJ/fwBgBn9/f39/fwBgAn9/AX9gB39/f39/f38AYAR/f35+AAJnEQFhAWEAAAFhAWIABgFhAWMAAAFhAWQACgFhAWUABwFhAWYACQFhAWcABAFhAWgAAgFhAWkAAAFhAWoABAFhAWsABwFhAWwABQFhAW0ABwFhAW4AAAFhAW8ACgFhAXAAAQFhAXEAAAMsKwMDBAEDBAMCCwQBAAAFCQQBAgEBAwIAAQEBCAYFBQYIAwMCAgECBAADBwkEBQFwAR8fBQcBAYACgIACBggBfwFB8KYECwcdBwFyAgABcwAYAXQAFAF1ABMBdgA1AXcBAAF4ACoJJAEAQQELHiY7Ojk4NzYjIjMhFiAgMhooGhYxKywtFjAvLiEWKQqqZCvyAgICfwF+AkAgAkUNACAAIAE6AAAgACACaiIDQQFrIAE6AAAgAkEDSQ0AIAAgAToAAiAAIAE6AAEgA0EDayABOgAAIANBAmsgAToAACACQQdJDQAgACABOgADIANBBGsgAToAACACQQlJDQAgAEEAIABrQQNxIgRqIgMgAUH/AXFBgYKECGwiATYCACADIAIgBGtBfHEiBGoiAkEEayABNgIAIARBCUkNACADIAE2AgggAyABNgIEIAJBCGsgATYCACACQQxrIAE2AgAgBEEZSQ0AIAMgATYCGCADIAE2AhQgAyABNgIQIAMgATYCDCACQRBrIAE2AgAgAkEUayABNgIAIAJBGGsgATYCACACQRxrIAE2AgAgBCADQQRxQRhyIgRrIgJBIEkNACABrUKBgICAEH4hBSADIARqIQEDQCABIAU3AxggASAFNwMQIAEgBTcDCCABIAU3AwAgAUEgaiEBIAJBIGsiAkEfSw0ACwsgAAtxAQF/IAJFBEAgACgCBCABKAIERg8LIAAgAUYEQEEBDwsCQCAAKAIEIgItAAAiAEUgACABKAIEIgEtAAAiA0dyDQADQCABLQABIQMgAi0AASIARQ0BIAFBAWohASACQQFqIQIgACADRg0ACwsgACADRgvMAgEFfyAABEAgAEEEayIDKAIAIgQhASADIQIgAEEIaygCACIAIABBfnEiAEcEQCACIABrIgIoAgQiASACKAIIIgU2AgggBSABNgIEIAAgBGohAQsgAyAEaiIAKAIAIgMgACADakEEaygCAEcEQCAAKAIEIgQgACgCCCIANgIIIAAgBDYCBCABIANqIQELIAIgATYCACACIAFBfHFqQQRrIAFBAXI2AgAgAgJ/IAIoAgBBCGsiAEH/AE0EQCAAQQN2QQFrDAELIABnIQMgAEEdIANrdkEEcyADQQJ0a0HuAGogAEH/H00NABpBPyAAQR4gA2t2QQJzIANBAXRrQccAaiIAIABBP08bCyIBQQR0IgBBgB5qNgIEIAIgAEGIHmoiACgCADYCCCAAIAI2AgAgAigCCCACNgIEQYgmQYgmKQMAQgEgAa2GhDcDAAsLlAQCCH8CfkEIIQMCQAJAA0AgAyADQQFrcSAAQUdLcg0BIANBCCADQQhLIgcbIQNBiCYpAwAiCQJ/QQggAEEDakF8cSAAQQhNGyIAQf8ATQRAIABBA3ZBAWsMAQsgAEEdIABnIgFrdkEEcyABQQJ0a0HuAGogAEH/H00NABpBPyAAQR4gAWt2QQJzIAFBAXRrQccAaiIBIAFBP08bCyIErYgiClBFBEADQCAKIAp6IgqIIQkCfiAEIAqnaiIEQQR0IgJBiB5qKAIAIgEgAkGAHmoiBkcEQCABIAMgABAXIgUNBiABKAIEIgUgASgCCCIINgIIIAggBTYCBCABIAY2AgggASACQYQeaiICKAIANgIEIAIgATYCACABKAIEIAE2AgggBEEBaiEEIAlCAYgMAQtBiCZBiCYpAwBCfiAErYmDNwMAIAlCAYULIgpCAFINAAtBiCYpAwAhCQtBPyAJeadrIQYCQCAJUARAQQAhAQwBCyAGQQR0IgJBiB5qKAIAIQEgCUKAgICABFQNAEHjACEEIAEgAkGAHmoiAkYNAANAIARFDQEgASADIAAQFyIFDQQgBEEBayEEIAEoAggiASACRw0ACyACIQELIAAgA0EwakEwIAcbahAbDQALIAFFDQAgASAGQQR0QYAeaiICRg0AA0AgASADIAAQFyIFDQIgASgCCCIBIAJHDQALC0EAIQULIAULgAQBA38gAkGABE8EQCAAIAEgAhAQIAAPCyAAIAJqIQMCQCAAIAFzQQNxRQRAAkAgAEEDcUUEQCAAIQIMAQsgAkUEQCAAIQIMAQsgACECA0AgAiABLQAAOgAAIAFBAWohASACQQFqIgJBA3FFDQEgAiADSQ0ACwsCQCADQXxxIgRBwABJDQAgAiAEQUBqIgVLDQADQCACIAEoAgA2AgAgAiABKAIENgIEIAIgASgCCDYCCCACIAEoAgw2AgwgAiABKAIQNgIQIAIgASgCFDYCFCACIAEoAhg2AhggAiABKAIcNgIcIAIgASgCIDYCICACIAEoAiQ2AiQgAiABKAIoNgIoIAIgASgCLDYCLCACIAEoAjA2AjAgAiABKAI0NgI0IAIgASgCODYCOCACIAEoAjw2AjwgAUFAayEBIAJBQGsiAiAFTQ0ACwsgAiAETw0BA0AgAiABKAIANgIAIAFBBGohASACQQRqIgIgBEkNAAsMAQsgA0EESQRAIAAhAgwBCyAAIANBBGsiBEsEQCAAIQIMAQsgACECA0AgAiABLQAAOgAAIAIgAS0AAToAASACIAEtAAI6AAIgAiABLQADOgADIAFBBGohASACQQRqIgIgBE0NAAsLIAIgA0kEQANAIAIgAS0AADoAACABQQFqIQEgAkEBaiICIANHDQALCyAACwYAIAAQEwuXAwEEfyABIABBBGoiBGpBAWtBACABa3EiBSACaiAAIAAoAgAiAWpBBGtNBH8gACgCBCIDIAAoAggiBjYCCCAGIAM2AgQgBCAFRwRAIAAgAEEEaygCAEF+cWsiAyAFIARrIgQgAygCAGoiBTYCACADIAVBfHFqQQRrIAU2AgAgACAEaiIAIAEgBGsiATYCAAsCfyABIAJBGGpPBEAgACACakEIaiIDIAEgAmtBCGsiATYCACADIAFBfHFqQQRrIAFBAXI2AgAgAwJ/IAMoAgBBCGsiAUH/AE0EQCABQQN2QQFrDAELIAFnIQQgAUEdIARrdkEEcyAEQQJ0a0HuAGogAUH/H00NABpBPyABQR4gBGt2QQJzIARBAXRrQccAaiIBIAFBP08bCyIBQQR0IgRBgB5qNgIEIAMgBEGIHmoiBCgCADYCCCAEIAM2AgAgAygCCCADNgIEQYgmQYgmKQMAQgEgAa2GhDcDACAAIAJBCGoiATYCACAAIAFBfHFqDAELIAAgAWoLQQRrIAE2AgAgAEEEagUgAwsLiAEBA38DQCAAQQR0IgFBhB5qIAFBgB5qIgI2AgAgAUGIHmogAjYCACAAQQFqIgBBwABHDQALQTAQGxpBlCZBATYCAEGYJkEANgIAECZBmCZBnCYoAgA2AgBBnCZBlCY2AgBBoCZBCTYCAEGkJkEANgIAECJBpCZBnCYoAgA2AgBBnCZBoCY2AgALHAAgACABQQggAqcgAkIgiKcgA6cgA0IgiKcQDgsIACAAECMQEwv0AwEFfwJ/QeQcKAIAIgIgAEEHakF4cSIBQQdqQXhxIgNqIQACQCADQQAgACACTRtFBEAgAD8AQRB0TQ0BIAAQDw0BC0HwHUEwNgIAQX8MAQtB5BwgADYCACACCyICQX9HBEAgASACaiIAQQRrQRA2AgAgAEEQayIDQRA2AgACQAJ/QYAmKAIAIgEEfyABKAIIBUEACyACRgRAIAIgAkEEaygCAEF+cWsiBEEEaygCACEFIAEgADYCCCAEIAVBfnFrIgAgACgCAGpBBGstAABBAXEEQCAAKAIEIgEgACgCCCIENgIIIAQgATYCBCAAIAMgAGsiATYCAAwDCyACQRBrDAELIAJBEDYCACACIAA2AgggAiABNgIEIAJBEDYCDEGAJiACNgIAIAJBEGoLIgAgAyAAayIBNgIACyAAIAFBfHFqQQRrIAFBAXI2AgAgAAJ/IAAoAgBBCGsiAUH/AE0EQCABQQN2QQFrDAELIAFBHSABZyIDa3ZBBHMgA0ECdGtB7gBqIAFB/x9NDQAaQT8gAUEeIANrdkECcyADQQF0a0HHAGoiASABQT9PGwsiAUEEdCIDQYAeajYCBCAAIANBiB5qIgMoAgA2AgggAyAANgIAIAAoAgggADYCBEGIJkGIJikDAEIBIAGthoQ3AwALIAJBf0cLXQEBfyAAKAIQIgNFBEAgAEEBNgIkIAAgAjYCGCAAIAE2AhAPCwJAIAEgA0YEQCAAKAIYQQJHDQEgACACNgIYDwsgAEEBOgA2IABBAjYCGCAAIAAoAiRBAWo2AiQLCyAAAkAgACgCBCABRw0AIAAoAhxBAUYNACAAIAI2AhwLC5oBACAAQQE6ADUCQCAAKAIEIAJHDQAgAEEBOgA0AkAgACgCECICRQRAIABBATYCJCAAIAM2AhggACABNgIQIANBAUcNAiAAKAIwQQFGDQEMAgsgASACRgRAIAAoAhgiAkECRgRAIAAgAzYCGCADIQILIAAoAjBBAUcNAiACQQFGDQEMAgsgACAAKAIkQQFqNgIkCyAAQQE6ADYLC/4CAQN/IwBB8ABrIgIkACAAKAIAIgNBBGsoAgAhBCADQQhrKAIAIQMgAkIANwJMIAJCADcCVCACQgA3AlwgAkIANwJkIAJBADYAayACQgA3AkQgAkGYFzYCQCACIAA2AjwgAiABNgI4AkAgBCABQQAQEgRAQQAgACADGyEADAELIAAgACADaiIDTgRAIAJCADcCLCACQQA2ADMgAkIANwIUIAJCADcCHCACQgA3AiQgAkIANwIMIAIgATYCCCACIAA2AgQgAiAENgIAIAJBATYCMCAEIAIgAyADQQFBACAEKAIAKAIUEQgAIAIoAhgNAQtBACEAIAQgAkE4aiADQQFBACAEKAIAKAIYEQYAAkACQCACKAJcDgIAAQILIAIoAkxBACACKAJYQQFGG0EAIAIoAlRBAUYbQQAgAigCYEEBRhshAAwBCyACKAJQQQFHBEAgAigCYA0BIAIoAlRBAUcNASACKAJYQQFHDQELIAIoAkghAAsgAkHwAGokACAACwIACwQAIAAL4QMAQYgZQc0JEAxBlBlB3whBAUEAEAtBoBlBywhBAUGAf0H/ABABQbgZQcQIQQFBgH9B/wAQAUGsGUHCCEEBQQBB/wEQAUHEGUGJCEECQYCAfkH//wEQAUHQGUGACEECQQBB//8DEAFB3BlBmAhBBEGAgICAeEH/////BxABQegZQY8IQQRBAEF/EAFB9BlB/QhBBEGAgICAeEH/////BxABQYAaQfQIQQRBAEF/EAFBjBpBrwhCgICAgICAgICAf0L///////////8AEBlBmBpBrghCAEJ/EBlBpBpBqAhBBBAIQbAaQcYJQQgQCEGgEEGcCRAEQegQQcoNEARBsBFBBEGCCRACQfwRQQJBqAkQAkHIEkEEQbcJEAJB5BJB5AgQCkGME0EAQYUNEABBtBNBAEHrDRAAQdwTQQFBow0QAEGEFEECQdIJEABBrBRBA0HxCRAAQdQUQQRBmQoQAEH8FEEFQbYKEABBpBVBBEGQDhAAQcwVQQVBrg4QAEG0E0EAQZwLEABB3BNBAUH7ChAAQYQUQQJB3gsQAEGsFEEDQbwLEABB1BRBBEHkDBAAQfwUQQVBwgwQAEH0FUEIQaEMEABBnBZBCUH/CxAAQcQWQQZB3AoQAEHsFkEHQdUOEAALMQECfyAAQYQbNgIAIAAoAgRBDGsiASABKAIIQQFrIgI2AgggAkEASARAIAEQEwsgAAs1AQF/QQEgACAAQQFNGyEAAkADQCAAEBQiAQ0BQeAmKAIAIgEEQCABEQIADAELCxAHAAsgAQvTAQECfyACQfD///8HSQRAAkACQCACQQtPBEAgAkEPckEBaiIEECQhAyAAIARBgICAgHhyNgIIIAAgAzYCACAAIAI2AgQMAQsgACACOgALIAAhAyACRQ0BCyADIAEgAhAnCyACIANqQQA6AAAgAA8LQdgAEBRB0ABqIgBB2Bw2AgAgAEGEGzYCAEEZECQiAUEANgIIIAFCjICAgMABNwIAIAFBDGoiAkGUCSkAADcABSABQY8JKQAANwAMIAAgAjYCBCAAQbQbNgIAIABB1BtBCBANAAs7AEG3CEECQfgOQYAPQQJBA0EAEANBuQhBA0GED0GQD0EEQQVBABADQZwIQQFBmA9BnA9BBkEHQQAQAwvVAgECfwJAIAAgAUYNACABIAAgAmoiBGtBACACQQF0a00EQCAAIAEgAhAVGg8LIAAgAXNBA3EhAwJAAkAgACABSQRAIAMNAiAAQQNxRQ0BA0AgAkUNBCAAIAEtAAA6AAAgAUEBaiEBIAJBAWshAiAAQQFqIgBBA3ENAAsMAQsCQCADDQAgBEEDcQRAA0AgAkUNBSAAIAJBAWsiAmoiAyABIAJqLQAAOgAAIANBA3ENAAsLIAJBA00NAANAIAAgAkEEayICaiABIAJqKAIANgIAIAJBA0sNAAsLIAJFDQIDQCAAIAJBAWsiAmogASACai0AADoAACACDQALDAILIAJBA00NAANAIAAgASgCADYCACABQQRqIQEgAEEEaiEAIAJBBGsiAkEDSw0ACwsgAkUNAANAIAAgAS0AADoAACAAQQFqIQAgAUEBaiEBIAJBAWsiAg0ACwsLBwAgACgCBAsFAEHQCAsVACAARQRAQQAPCyAAQagYEB9BAEcLGgAgACABKAIIIAUQEgRAIAEgAiADIAQQHgsLkQEAIAAgASgCCCAEEBIEQCABIAIgAxAdDwsCQCAAIAEoAgAgBBASRQ0AAkAgAiABKAIQRwRAIAEoAhQgAkcNAQsgA0EBRw0BIAFBATYCIA8LIAEgAjYCFCABIAM2AiAgASABKAIoQQFqNgIoAkAgASgCJEEBRw0AIAEoAhhBAkcNACABQQE6ADYLIAFBBDYCLAsLGAAgACABKAIIQQAQEgRAIAEgAiADEBwLCzEAIAAgASgCCEEAEBIEQCABIAIgAxAcDwsgACgCCCIAIAEgAiADIAAoAgAoAhwRBQAL8gEAIAAgASgCCCAEEBIEQCABIAIgAxAdDwsCQCAAIAEoAgAgBBASBEACQCACIAEoAhBHBEAgASgCFCACRw0BCyADQQFHDQIgAUEBNgIgDwsgASADNgIgAkAgASgCLEEERg0AIAFBADsBNCAAKAIIIgAgASACIAJBASAEIAAoAgAoAhQRCAAgAS0ANQRAIAFBAzYCLCABLQA0RQ0BDAMLIAFBBDYCLAsgASACNgIUIAEgASgCKEEBajYCKCABKAIkQQFHDQEgASgCGEECRw0BIAFBAToANg8LIAAoAggiACABIAIgAyAEIAAoAgAoAhgRBgALCzcAIAAgASgCCCAFEBIEQCABIAIgAyAEEB4PCyAAKAIIIgAgASACIAMgBCAFIAAoAgAoAhQRCAALnAEBAn8jAEFAaiIDJAACf0EBIAAgAUEAEBINABpBACABRQ0AGkEAIAFByBcQHyIBRQ0AGiADQQxqQQBBNBARGiADQQE2AjggA0F/NgIUIAMgADYCECADIAE2AgggASADQQhqIAIoAgBBASABKAIAKAIcEQUAIAMoAiAiAEEBRgRAIAIgAygCGDYCAAsgAEEBRgshBCADQUBrJAAgBAsKACAAIAFBABASCwUAEDQACwUAEAcAC5gBAQN/An8CQAJAIAAoAgQiAiIAQQNxRQ0AQQAgAC0AAEUNAhoDQCAAQQFqIgBBA3FFDQEgAC0AAA0ACwwBCwNAIAAiAUEEaiEAIAEoAgAiA0F/cyADQYGChAhrcUGAgYKEeHFFDQALA0AgASIAQQFqIQEgAC0AAA0ACwsgACACawtBAWoiABAUIgEEfyABIAIgABAVBUEACwsKAEGQJigCABATCwcAIAARAgAL1C0BI38jAEGggAFrIgQkACABKAIAIR0gASgCBCABLQALIgMgA8BBAEgiBxsiA0GAgIDwB0siCEUEQCADIANB/wFuakEQaiEFC0GQJiAFQQRqEBQiBjYCACAGIANBGHY6AAMgBiADQRB2OgACIAYgA0EIdjoAASAGIAM6AAAgBEEAQaCAARARIQsgHSABIAcbIQlBASACIAJBAUwbIQEgBkEEaiEQAkACQAJAIAgEf0EABSADIANB/wFuakEQagsgBUwEQCADQYqABEwEQCADQYCAgPAHSw0EIAMgCWohDyALQQM7AYaAASALIAM2AoCAASALIAM2ApCAASADQQ1JBEAgCSEFIBAhAwwECyAPQQVrIRMgD0ELayEOIAsgCSgAAEGx893xeWxBEnZB/v8AcWpBADsBACAPQQZrIREgD0EIayENIAFBBnQhFCAQIQMgCSEFA0AgBUEBaiECIAUoAAEhCkEBIQEgFCEIA0AgAiIEIAFqIgIgDksNBSALIApBsfPd8XlsQRJ2Qf7/AHFqIgEvAQAhHiACKAAAIQogASAEIAlrOwEAIAhBBnUhASAIQQFqIQggHiAJaiIGKAAAIAQoAABHDQALIAQgBWsiAkGOAmshASACQQ9rIQpBACEMIAJB7wFqIhUhBwNAAkAgDCEWIAchFyAKIRIgASEYIAYiAiAJTSAEIgggBU1yDQAgAUEBayEBIApBAWshCiAHQQFrIQcgDEEBaiEMIARBAWsiBC0AACACQQFrIgYtAABGDQELCyADQQFqIQQCQCAIIAVrIgFBD08EQCADQfABOgAAIAFBD2siCkH/AU4EQCAEQf8BIBUgFkH9AyAKIApB/QNOG2prQf8BbkEBahARGiAXQf0DIBIgEkH9A04ba0H/AW4iBkGBfmwgGGohCiADIAZqQQJqIQQLIAQgCjoAACAEQQFqIQQMAQsgAyABQQR0OgAACyABIARqIQEDQCAEIAUpAAA3AAAgBUEIaiEFIARBCGoiBCABSQ0ACyADIQogCCEFA0AgASAFIAJrOwAAIAJBBGohBCABQQJqIQMCQAJAAkACQCANAn8gBUEEaiIGIA1PBEAgBgwBCyAGKAAAIAQoAABzIgQNAiACQQhqIQQgBUEIagsiAksEQANAIAIoAAAgBCgAAHMiBwRAIAIgB2hBA3ZqIQIMAwsgBEEEaiEEIAJBBGoiAiANSQ0ACwsCQCACIBFPDQAgBC8AACACLwAARw0AIARBAmohBCACQQJqIQILIAIgE08NACACIAQtAAAgAi0AAEZqIQILIAIgBmsiBCAFakEEaiEFIARBD0kNASAKIAotAABBD2o6AAAgA0F/NgAAIARBD2siAkH8B08EQCAEQYsIayICQfwHbiIDQYR4bCACaiECIAFBBmpB/wEgA0ECdCIBQQRqEBEgAWohAwsgAyACQf//A3FB/wFuIgFqIgMgASACajoAACADQQFqIQMMAgsgBSAEaEEDdiIEQQRyaiEFCyAKIAotAAAgBGo6AAALIAUgDk8NBSALIAVBAmsiASgAAEGx893xeWxBEnZB/v8AcWogASAJazsBACALIAUoAABBsfPd8XlsQRJ2Qf7/AHFqIgEvAQAhHyABIAUgCWs7AQAgHyAJaiICKAAAIAUoAABHDQEgA0EAOgAAIANBAWohASADIQoMAAsACwALIANBgICA8AdLDQMgAyAJaiENIAsgAzYCgIABIAsgAzYCkIABIAtBAUECIAlB//8DSxs7AYaAASAJKAAAQbHz3fF5bEEUdiECAkAgCUGAgARPBEAgCyACQQJ0aiAJNgIADAELIAsgAkECdGpBADYCAAsgDUEFayEVIA1BC2shDiANQQZrIRkgDUEIayETIAFBBnQiCkEBciESIAlBgIAESSERIBAhByAJIQUDQCAFQQJqIQIgBUEBaiEEIAUoAAFBsfPd8XlsQRR2IQgCQCARRQRAIAohBiASIQEgAiAOSw0EA0AgCyAIQQJ0aiIDKAIAIQggAigAACEgIAMgBDYCACAEIAhB//8Dak0EQCAIKAAAIAQoAABGDQMLIAZBBnUhAyAgQbHz3fF5bEEUdiEIIAEhBiABQQFqIQEgAyACIgRqIgIgDk0NAAsMBAsgCiEDIBIhASACIA5LDQMDQCALIAhBAnRqIggoAgAhBiACKAAAISEgCCAEIAlrIgg2AgAgCCAGQf//A2pNBEAgBiAJaiIIKAAAIAQoAABGDQILIANBBnUhBiAhQbHz3fF5bEEUdiEIIAEiA0EBaiEBIA4gBiACIgRqIgJPDQALDAMLIAQgBWsiAkGOAmshASACQQ9rIQZBACEDIAJB7wFqIhohDANAAkAgAyEXIAwhGCAGIRYgASEPIAgiAiAJTSAEIhQgBU1yDQAgAUEBayEBIAZBAWshBiAMQQFrIQwgA0EBaiEDIARBAWsiBC0AACACQQFrIggtAABGDQELCyAHQQFqIQQCQCAUIAVrIgNBD08EQCAHQfABOgAAIANBD2siAUH/AU4EQCAEQf8BIBogF0H9AyABIAFB/QNOG2prQf8BbkEBahARGiAYQf0DIBYgFkH9A04ba0H/AW4iBkGBfmwgD2ohASAGIAdqQQJqIQQLIAQgAToAACAEQQFqIQQMAQsgByADQQR0OgAACyADIARqIQEDQCAEIAUpAAA3AAAgBUEIaiEFIARBCGoiBCABSQ0ACyAHIQYgFCEFA0AgASAFIAJrOwAAIAJBBGohBCABQQJqIQcCQAJAAkACQCATAn8gBUEEaiIDIBNPBEAgAwwBCyADKAAAIAQoAABzIgQNAiACQQhqIQQgBUEIagsiAksEQANAIAIoAAAgBCgAAHMiCARAIAIgCGhBA3ZqIQIMAwsgBEEEaiEEIAJBBGoiAiATSQ0ACwsCQCACIBlPDQAgBC8AACACLwAARw0AIARBAmohBCACQQJqIQILIAIgFU8NACACIAQtAAAgAi0AAEZqIQILIAIgA2siBCAFakEEaiEFIARBD0kNASAGIAYtAABBD2o6AAAgB0F/NgAAIARBD2siAkH8B08EQCAEQYsIayICQfwHbiIDQYR4bCACaiECIAFBBmpB/wEgA0ECdCIBQQRqEBEgAWohBwsgByACQf//A3FB/wFuIgFqIgMgASACajoAACADQQFqIQcMAgsgBSAEaEEDdiIEQQRyaiEFCyAGIAYtAAAgBGo6AAALIAUgDk8NAyAFQQJrIgEoAABBsfPd8XlsQRR2IQICQCARRQRAIAsgAkECdGogATYCACALIAUoAABBsfPd8XlsQRJ2Qfz/AHFqIgEoAgAhAiABIAU2AgAgAkH//wNqIAVJDQMgAigAACAFKAAARw0DDAELIAsgAkECdGogASAJazYCACALIAUoAABBsfPd8XlsQRJ2Qfz/AHFqIgIoAgAhASACIAUgCWsiAjYCACABQf//A2ogAkkNAiABIAlqIgIoAAAgBSgAAEcNAgsgB0EAOgAAIAdBAWohASAHIQYMAAsACwALAkAgA0GKgARMBEAgA0GAgIDwB0sNBCAFIBBqIQ0gAyAJaiEPIAtBAzsBhoABIAsgAzYCgIABIAsgAzYCkIABIANBDUkEQCAJIQUgECEDDAILIA9BBWshFSAPQQtrIREgCyAJKAAAQbHz3fF5bEESdkH+/wBxakEAOwEAIA9BBmshGSAPQQhrIQ4gAUEGdCEUIBAhAyAJIQUDQCAFQQFqIQIgBSgAASEKQQEhASAUIQgDQCACIgQgAWoiAiARSw0DIAsgCkGx893xeWxBEnZB/v8AcWoiAS8BACEiIAIoAAAhCiABIAQgCWs7AQAgCEEGdSEBIAhBAWohCCAiIAlqIgYoAAAgBCgAAEcNAAsgBCAFayICQY4CayEBIAJBD2shCkEAIQwgAkHvAWoiGiEHA0ACQCAMIRYgByEXIAohEiABIRggBiICIAlNIAQiCCAFTXINACABQQFrIQEgCkEBayEKIAdBAWshByAMQQFqIQwgBEEBayIELQAAIAJBAWsiBi0AAEYNAQsLIANBAWoiBCAIIAVrIgFqIAFB/wFuakEIaiANSw0FAkAgAUEPTwRAIANB8AE6AAAgAUEPayIKQf8BTgRAIARB/wEgGiAWQf0DIAogCkH9A04bamtB/wFuQQFqEBEaIBdB/QMgEiASQf0DThtrQf8BbiIGQYF+bCAYaiEKIAMgBmpBAmohBAsgBCAKOgAAIARBAWohBAwBCyADIAFBBHQ6AAALIAEgBGohAQNAIAQgBSkAADcAACAFQQhqIQUgBEEIaiIEIAFJDQALIAMhCiAIIQUDQCABIAUgAms7AAAgAkEEaiEEIAECfwJAIA4CfyAFQQRqIgMgDk8EQCADDAELIAMoAAAgBCgAAHMiBg0BIAJBCGohBCAFQQhqCyICSwRAA0AgAigAACAEKAAAcyIGBEAgAiAGaEEDdmogA2sMBAsgBEEEaiEEIAJBBGoiAiAOSQ0ACwsCQCACIBlPDQAgBC8AACACLwAARw0AIARBAmohBCACQQJqIQILIAIgFUkEfyACIAQtAAAgAi0AAEZqBSACCyADawwBCyAGaEEDdgsiBkHwAWpB/wFuakEIaiANSw0GIAFBAmohAyAFIAZqQQRqIQUgCi0AACECAkAgBkEPTwRAIAogAkEPajoAACADQX82AAAgBkEPayICQfwHTwRAIAZBiwhrIgJB/AduIgNBhHhsIAJqIQIgAUEGakH/ASADQQJ0IgFBBGoQESABaiEDCyADIAJB//8DcUH/AW4iAWoiAyABIAJqOgAAIANBAWohAwwBCyAKIAIgBmo6AAALIAUgEU8NAyALIAVBAmsiASgAAEGx893xeWxBEnZB/v8AcWogASAJazsBACALIAUoAABBsfPd8XlsQRJ2Qf7/AHFqIgEvAQAhIyABIAUgCWs7AQAgIyAJaiICKAAAIAUoAABHDQEgA0EAOgAAIANBAWohASADIQoMAAsACwALIANBgICA8AdLDQMgAyAJaiENIAsgAzYCgIABIAsgAzYCkIABIAtBAUECIAlB//8DSxs7AYaAASAJKAAAQbHz3fF5bEEUdiECAkAgCUGAgARPBEAgCyACQQJ0aiAJNgIADAELIAsgAkECdGpBADYCAAsgBSAQaiERIA1BBWshGiANQQtrIQ4gDUEGayEbIA1BCGshFSABQQZ0IgpBAXIhEiAJQYCABEkhGSAQIQcgCSEFA0ACQCAFQQJqIQIgBUEBaiEEIAUoAAFBsfPd8XlsQRR2IQgCQCAZRQRAIAohBiASIQEgAiAOSw0CA0AgCyAIQQJ0aiIDKAIAIQggAigAACEkIAMgBDYCACAEIAhB//8Dak0EQCAIKAAAIAQoAABGDQMLIAZBBnUhAyAkQbHz3fF5bEEUdiEIIAEhBiABQQFqIQEgAyACIgRqIgIgDk0NAAsMAgsgCiEDIBIhASACIA5LDQEDQCALIAhBAnRqIggoAgAhBiACKAAAISUgCCAEIAlrIgg2AgAgCCAGQf//A2pNBEAgBiAJaiIIKAAAIAQoAABGDQILIANBBnUhBiAlQbHz3fF5bEEUdiEIIAEiA0EBaiEBIA4gBiACIgRqIgJPDQALDAELIAQgBWsiAkGOAmshASACQQ9rIQZBACEDIAJB7wFqIhwhDANAAkAgAyEXIAwhGCAGIRYgASEPIAgiAiAJTSAEIhQgBU1yDQAgAUEBayEBIAZBAWshBiAMQQFrIQwgA0EBaiEDIARBAWsiBC0AACACQQFrIggtAABGDQELCyAHQQFqIgQgFCAFayIDaiADQf8BbmpBCGogEUsNBQJAIANBD08EQCAHQfABOgAAIANBD2siAUH/AU4EQCAEQf8BIBwgF0H9AyABIAFB/QNOG2prQf8BbkEBahARGiAYQf0DIBYgFkH9A04ba0H/AW4iBkGBfmwgD2ohASAGIAdqQQJqIQQLIAQgAToAACAEQQFqIQQMAQsgByADQQR0OgAACyADIARqIQEDQCAEIAUpAAA3AAAgBUEIaiEFIARBCGoiBCABSQ0ACyAUIQUDQCABIAUgAms7AAAgAkEEaiEEIAECfwJAIBUCfyAFQQRqIgMgFU8EQCADDAELIAMoAAAgBCgAAHMiBg0BIAJBCGohBCAFQQhqCyICSwRAA0AgAigAACAEKAAAcyIGBEAgAiAGaEEDdmogA2sMBAsgBEEEaiEEIAJBBGoiAiAVSQ0ACwsCQCACIBtPDQAgBC8AACACLwAARw0AIARBAmohBCACQQJqIQILIAIgGkkEfyACIAQtAAAgAi0AAEZqBSACCyADawwBCyAGaEEDdgsiA0HwAWpB/wFuakEIaiARSw0GIAFBAmohAiADIAVqQQRqIQUgBy0AACEGAn8gA0EPTwRAIAcgBkEPajoAACACQX82AAAgA0EPayIIQfwHTwRAIANBiwhrIgJB/AduIgNBhHhsIAJqIQggAUEGakH/ASADQQJ0IgFBBGoQESABaiECCyACIAhB//8DcUH/AW4iAWoiAiABIAhqOgAAIAJBAWoMAQsgByADIAZqOgAAIAILIQcgBSAOTw0BIAVBAmsiASgAAEGx893xeWxBFHYhAgJAIBlFBEAgCyACQQJ0aiABNgIAIAsgBSgAAEGx893xeWxBEnZB/P8AcWoiASgCACECIAEgBTYCACACQf//A2ogBUkNBCACKAAAIAUoAABHDQQMAQsgCyACQQJ0aiABIAlrNgIAIAsgBSgAAEGx893xeWxBEnZB/P8AcWoiAigCACEBIAIgBSAJayICNgIAIAFB//8DaiACSQ0DIAEgCWoiAigAACAFKAAARw0DCyAHQQA6AAAgB0EBaiEBDAALAAsLIAcgDSAFayIDaiADQfABakH/AW5qQQFqIBFLDQMgB0EBaiECAkAgA0EPTwRAIAdB8AE6AAAgA0EPayIBQf8BTwRAIAJB/wEgA0GOAmsiAUH/AW4iAkEBaiIGEBEaIAJBgX5sIAFqIQEgAiAHakECaiECIAYgB2ohBwsgAiABOgAAIAdBAmohAgwBCyAHIANBBHQ6AAALIAIgBSADEBUgA2ogEGshEwwDCyADIA8gBWsiBmogBkHwAWpB/wFuakEBaiANSw0CIANBAWohAgJAIAZBD08EQCADQfABOgAAIAZBD2siAUH/AU8EQCACQf8BIAZBjgJrIgFB/wFuIgJBAWoiBBARGiACQYF+bCABaiEBIAIgA2pBAmohAiADIARqIQMLIAIgAToAACADQQJqIQIMAQsgAyAGQQR0OgAACyACIAUgBhAVIAZqIBBrIRMMAgsgB0EBaiECAkAgDSAFayIDQQ9PBEAgB0HwAToAACADQQ9rIgFB/wFPBEAgAkH/ASADQY4CayIBQf8BbiICQQFqIgYQERogAkGBfmwgAWohASACIAdqQQJqIQIgBiAHaiEHCyACIAE6AAAgB0ECaiECDAELIAcgA0EEdDoAAAsgAiAFIAMQFSADaiAQayETDAELIANBAWohAgJAIA8gBWsiBkEPTwRAIANB8AE6AAAgBkEPayIBQf8BTwRAIAJB/wEgBkGOAmsiAUH/AW4iAkEBaiIEEBEaIAJBgX5sIAFqIQEgAiADakECaiECIAMgBGohAwsgAiABOgAAIANBAmohAgwBCyADIAZBBHQ6AAALIAIgBSAGEBUgBmogEGshEwsgC0GQJigCADYCBCALIBNBBGo2AgAgAEHcEyALEAU2AgQgAEHoHDYCACALQaCAAWokAAtlAQF/IwBBIGsiAyQAIANBGGogA0EMaiABQQRqIAEoAgAQJSIBIAIgABEAACADKAIcIgAQCSADKAIcIgIEQCACEAYgA0EANgIcCyABLAALQQBIBEAgASgCABATCyADQSBqJAAgAAv0BwEVfyMAQRBrIgkkACABKAIEIRZBkCYgASgCACABIAEtAAsiA8BBAEgiBBsiASgAACIGEBQiCDYCACAWIAMgBBsiA0EEayECIAFBBGohDgJ/IAZFBEBBfyACQQFHDQEaQX9BACAOLQAAGwwBC0F/IAJFDQAaIAEgA2oiCkEQayERIAYgCGoiC0EgayESIAtBBWshEyALQQdrIQwgCkEEayEUIApBCGshFSALQQxrIQ8gCkEPayEQIA4hBiAIIQECQANAAkAgBkEBaiECAkACfwJAAkAgBi0AACIHQQR2IgNBD0cEQCABIBJLIAIgEU9yDQEgASACKQAANwAAIAEgAikACDcACCABIANqIgQgAiADaiIBLwAAIg1rIQUgAUECaiEGIAdBD3EiB0EPRiANQQhJcg0CIAUgCEkNBCAEIAUpAAA3AAAgBCAFKQAINwAIIAQgBS8AEDsAECAEIAdqQQRqIQEMBgtBACEDIAIgEE8NBgNAAkAgAyACLQAAIgZqIQMgAkEBaiICIBBPDQAgBkH/AUYNAQsLIANBD2oiAyABQX9zSyADIAJBf3NLcg0GCwJAIAEgA2oiBCAPSw0AIAIgA2oiBiAVSw0AA0AgASACKQAANwAAIAJBCGohAiABQQhqIgEgBEkNAAsgB0EPcSEHIAQgBi8AACINayEFIAZBAmoMAgsgAiADaiAKRyAEIAtLcg0FIAEgAiADECcgBCAIawwGCyAGCyEBQQAhAyAHQQ9HBEAgASEGDAELA0AgAUEBaiIGIBRPDQIgAyABLQAAIgJqIQMgBiEBIAJB/wFGDQALIAEhAiADQQ9qIgcgBEF/c0sNAwsgBSAISQ0AIAQgB0EEaiIHaiEBAn8gDUEHTQRAIARBADYAACAEIAUtAAA6AAAgBCAFLQABOgABIAQgBS0AAjoAAiAEIAUtAAM6AAMgBCAFIA1BAnQiAkGgD2ooAgBqIgMoAAA2AAQgAyACQcAPaigCAGsMAQsgBCAFKQAANwAAIAVBCGoLIQIgBEEIaiEDIAEgD0sEQCABIBNLDQEgAiEEIAMhBSADIAxJBEADQCAFIAQpAAA3AAAgBEEIaiEEIAVBCGoiBSAMSQ0ACyACIAwgA2tqIQIgDCEDCyABIANNDQIDQCADIAItAAA6AAAgAkEBaiECIANBAWoiAyABSQ0ACwwCCyADIAIpAAA3AAAgB0ERSQ0BIARBEGohAwNAIAMgAikACDcAACACQQhqIQIgA0EIaiIDIAFJDQALDAELCyAGIQILIAJBf3MgDmoLIQEgCSAINgIMIAkgATYCCCAAQdwTIAlBCGoQBTYCBCAAQegcNgIAIAlBEGokAAtjAQJ/IwBBIGsiAiQAIAJBGGogAkEMaiABQQRqIAEoAgAQJSIBIAARBwAgAigCHCIAEAkgAigCHCIDBEAgAxAGIAJBADYCHAsgASwAC0EASARAIAEoAgAQEwsgAkEgaiQAIAALC4AVBgBBgAgLvQd1bnNpZ25lZCBzaG9ydAB1bnNpZ25lZCBpbnQAZnJlZV9yZXN1bHQAZmxvYXQAdWludDY0X3QAZGVjb21wcmVzcwB1bnNpZ25lZCBjaGFyAHN0ZDo6ZXhjZXB0aW9uAGJvb2wAZW1zY3JpcHRlbjo6dmFsAHVuc2lnbmVkIGxvbmcAc3RkOjp3c3RyaW5nAGJhc2ljX3N0cmluZwBzdGQ6OnN0cmluZwBzdGQ6OnUxNnN0cmluZwBzdGQ6OnUzMnN0cmluZwBkb3VibGUAdm9pZABlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgc2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgaW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxmbG9hdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDY0X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDY0X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBjaGFyPgBzdGQ6OmJhc2ljX3N0cmluZzx1bnNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPgAAAABkCQAAIAgAAGlpaQBkCQAAIAgAANwMAABpaWlpAAAAAIgMAAB2aQAAAAAAAAEAAAACAAAAAQAAAAAAAAAEAAAABAAAAAQAQcwPC5UN//////z///8BAAAAAgAAAAMAAABOU3QzX18yMTJiYXNpY19zdHJpbmdJY05TXzExY2hhcl90cmFpdHNJY0VFTlNfOWFsbG9jYXRvckljRUVFRQAA6A0AAOAHAABOU3QzX18yMTJiYXNpY19zdHJpbmdJaE5TXzExY2hhcl90cmFpdHNJaEVFTlNfOWFsbG9jYXRvckloRUVFRQAA6A0AACgIAABOU3QzX18yMTJiYXNpY19zdHJpbmdJd05TXzExY2hhcl90cmFpdHNJd0VFTlNfOWFsbG9jYXRvckl3RUVFRQAA6A0AAHAIAABOU3QzX18yMTJiYXNpY19zdHJpbmdJRHNOU18xMWNoYXJfdHJhaXRzSURzRUVOU185YWxsb2NhdG9ySURzRUVFRQAAAOgNAAC4CAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSURpTlNfMTFjaGFyX3RyYWl0c0lEaUVFTlNfOWFsbG9jYXRvcklEaUVFRUUAAADoDQAABAkAAE4xMGVtc2NyaXB0ZW4zdmFsRQAA6A0AAFAJAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ljRUUAAOgNAABsCQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJYUVFAADoDQAAlAkAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWhFRQAA6A0AALwJAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lzRUUAAOgNAADkCQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJdEVFAADoDQAADAoAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWlFRQAA6A0AADQKAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lqRUUAAOgNAABcCgAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJbEVFAADoDQAAhAoAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SW1FRQAA6A0AAKwKAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0l4RUUAAOgNAADUCgAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJeUVFAADoDQAA/AoAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWZFRQAA6A0AACQLAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lkRUUAAOgNAABMCwAATjEwX19jeHhhYml2MTE2X19zaGltX3R5cGVfaW5mb0UAAAAAKA4AAHQLAAAYDgAATjEwX19jeHhhYml2MTE3X19jbGFzc190eXBlX2luZm9FAAAAKA4AAKQLAACYCwAATjEwX19jeHhhYml2MTE3X19wYmFzZV90eXBlX2luZm9FAAAAKA4AANQLAACYCwAATjEwX19jeHhhYml2MTE5X19wb2ludGVyX3R5cGVfaW5mb0UAKA4AAAQMAAD4CwAAAAAAAHgMAAALAAAADAAAAA0AAAAOAAAADwAAAE4xMF9fY3h4YWJpdjEyM19fZnVuZGFtZW50YWxfdHlwZV9pbmZvRQAoDgAAUAwAAJgLAAB2AAAAPAwAAIQMAABiAAAAPAwAAJAMAABjAAAAPAwAAJwMAABoAAAAPAwAAKgMAABhAAAAPAwAALQMAABzAAAAPAwAAMAMAAB0AAAAPAwAAMwMAABpAAAAPAwAANgMAABqAAAAPAwAAOQMAABsAAAAPAwAAPAMAABtAAAAPAwAAPwMAAB4AAAAPAwAAAgNAAB5AAAAPAwAABQNAABmAAAAPAwAACANAABkAAAAPAwAACwNAABOMTBfX2N4eGFiaXYxMjBfX3NpX2NsYXNzX3R5cGVfaW5mb0UAAAAAKA4AADgNAADICwAAU3Q5ZXhjZXB0aW9uAAAAAAAAAACgDQAACAAAABAAAAARAAAAU3QxMWxvZ2ljX2Vycm9yACgOAACQDQAASA4AAAAAAADUDQAACAAAABIAAAARAAAAU3QxMmxlbmd0aF9lcnJvcgAAAAAoDgAAwA0AAKANAAAAAAAAyAsAAAsAAAATAAAADQAAAA4AAAAUAAAAFQAAABYAAAAXAAAAU3Q5dHlwZV9pbmZvAAAAAOgNAAAIDgAAAAAAAGANAAALAAAAGAAAAA0AAAAOAAAAFAAAABkAAAAaAAAAGwAAAOgNAABsDQAAAAAAAEgOAAAcAAAAHQAAAB4AQeQcCwNwEwEAQYAdCwEqAEHIHQsCSBMAQewdCwEK"), QA = 1, Z = 2113929216, b, kA = () => eI({ noInitialRun: !0, wasmBinary: oI }), k, aI = (k = class {
  constructor(Q = QA) {
    L(this, "max_buffer_size", Z);
    L(this, "acceleration");
    if (!Number.isInteger(Q))
      throw Error(`Invalid acceleration "${Q}". Must be a positive integer.`);
    this.acceleration = Q <= 0 ? QA : Q;
  }
  static fromConfig({ acceleration: Q }) {
    return new k(Q);
  }
  async encode(Q) {
    if (b || (b = kA()), Q.length > Z)
      throw Error(`Codec does not support buffers of > ${Z} bytes.`);
    const D = await b, d = D.compress(Q, this.acceleration), m = new Uint8Array(d);
    return D.free_result(), m;
  }
  async decode(Q, D) {
    if (b || (b = kA()), Q.length > Z)
      throw Error(`Codec does not support buffers of > ${Z} bytes.`);
    const d = await b, m = d.decompress(Q), J = new Uint8Array(m);
    return d.free_result(), D !== void 0 ? (D.set(J), D) : J;
  }
}, L(k, "codecId", "lz4"), L(k, "DEFAULT_ACCELERATION", QA), L(k, "max_buffer_size", Z), k), DI = aI;
export {
  DI as default
};
