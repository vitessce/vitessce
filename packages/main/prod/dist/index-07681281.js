import { g as jp, R as rh, O as us, P as cs, S as ih, a as Wl, N as Gp, A as Hp, j as ye, V as Qe, b as oe, c as Xa, L as Xl, d as Vp, U as Wp, W as Xp, C as Kp, B as Yp, e as Qp, f as qp, h as Zp, T as Jp, G as wi, M as Ft, i as $p, k as em, l as Tu, m as oh, n as Ki, o as Yi, Q as Ga, p as Bf, q as sh, r as Ku, s as tm, t as fs, F as ah, u as Wn, v as nm, w as rm, D as im, x as Qr, y as nr, I as om, z as lh, E as Yu, H as sm, J as am, K as ds, X as lm, Y as vo, Z as uh, _ as Eu, $ as um, a0 as Kl, a1 as cm, a2 as Qu, a3 as qu, a4 as fm, a5 as ch, a6 as dm, a7 as Xn, a8 as hm, a9 as pm, aa as mm, ab as vm, ac as fh, ad as gm, ae as ym, af as xm, ag as dh, ah as Sm, ai as wm, aj as _m, ak as Tm, al as Em, am as Am, an as Cm, ao as go, ap as xi, aq as Au, ar as zf, as as jf, at as Gf, au as Mt, av as $r, aw as Pm, ax as hh, ay as Hf, az as Cu, aA as Mm, aB as bm, aC as Ha, aD as Vf, aE as Zr, aF as gr, aG as Lm, aH as yo, aI as Rm, aJ as km, aK as Um, aL as Dm, aM as ph, aN as Zu, aO as as, aP as mh, aQ as Nn, aR as Fm, aS as Im, aT as Om, aU as Nm } from "./index-9cbc2532.js";
import * as te from "react";
import Bm, { useState as an, useRef as yr, useEffect as kr, useMemo as zm, forwardRef as jm } from "react";
import "react-dom";
var vh = { exports: {} }, Ai = {};
/**
 * @license React
 * react-reconciler-constants.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Ai.ConcurrentRoot = 1;
Ai.ContinuousEventPriority = 4;
Ai.DefaultEventPriority = 16;
Ai.DiscreteEventPriority = 1;
Ai.IdleEventPriority = 536870912;
Ai.LegacyRoot = 0;
vh.exports = Ai;
var ho = vh.exports;
const Gm = (c) => typeof c == "object" && typeof c.then == "function", da = [];
function Hm(c, e, s = (a, r) => a === r) {
  if (c === e)
    return !0;
  if (!c || !e)
    return !1;
  const a = c.length;
  if (e.length !== a)
    return !1;
  for (let r = 0; r < a; r++)
    if (!s(c[r], e[r]))
      return !1;
  return !0;
}
function Vm(c, e = null, s = !1, a = {}) {
  e === null && (e = [c]);
  for (const n of da)
    if (Hm(e, n.keys, n.equal)) {
      if (s)
        return;
      if (Object.prototype.hasOwnProperty.call(n, "error"))
        throw n.error;
      if (Object.prototype.hasOwnProperty.call(n, "response"))
        return a.lifespan && a.lifespan > 0 && (n.timeout && clearTimeout(n.timeout), n.timeout = setTimeout(n.remove, a.lifespan)), n.response;
      if (!s)
        throw n.promise;
    }
  const r = {
    keys: e,
    equal: a.equal,
    remove: () => {
      const n = da.indexOf(r);
      n !== -1 && da.splice(n, 1);
    },
    promise: (
      // Execute the promise
      (Gm(c) ? c : c(...e)).then((n) => {
        r.response = n, a.lifespan && a.lifespan > 0 && (r.timeout = setTimeout(r.remove, a.lifespan));
      }).catch((n) => r.error = n)
    )
  };
  if (da.push(r), !s)
    throw r.promise;
}
const Wm = (c, e, s) => Vm(c, e, !1, s);
var gh = { exports: {} }, yh = { exports: {} }, xh = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function(c) {
  function e(K, V) {
    var G = K.length;
    K.push(V);
    e:
      for (; 0 < G; ) {
        var F = G - 1 >>> 1, j = K[F];
        if (0 < r(j, V))
          K[F] = V, K[G] = j, G = F;
        else
          break e;
      }
  }
  function s(K) {
    return K.length === 0 ? null : K[0];
  }
  function a(K) {
    if (K.length === 0)
      return null;
    var V = K[0], G = K.pop();
    if (G !== V) {
      K[0] = G;
      e:
        for (var F = 0, j = K.length, W = j >>> 1; F < W; ) {
          var $ = 2 * (F + 1) - 1, Y = K[$], se = $ + 1, X = K[se];
          if (0 > r(Y, G))
            se < j && 0 > r(X, Y) ? (K[F] = X, K[se] = G, F = se) : (K[F] = Y, K[$] = G, F = $);
          else if (se < j && 0 > r(X, G))
            K[F] = X, K[se] = G, F = se;
          else
            break e;
        }
    }
    return V;
  }
  function r(K, V) {
    var G = K.sortIndex - V.sortIndex;
    return G !== 0 ? G : K.id - V.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var n = performance;
    c.unstable_now = function() {
      return n.now();
    };
  } else {
    var o = Date, u = o.now();
    c.unstable_now = function() {
      return o.now() - u;
    };
  }
  var l = [], f = [], d = 1, p = null, v = 3, g = !1, x = !1, E = !1, _ = typeof setTimeout == "function" ? setTimeout : null, S = typeof clearTimeout == "function" ? clearTimeout : null, A = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function T(K) {
    for (var V = s(f); V !== null; ) {
      if (V.callback === null)
        a(f);
      else if (V.startTime <= K)
        a(f), V.sortIndex = V.expirationTime, e(l, V);
      else
        break;
      V = s(f);
    }
  }
  function C(K) {
    if (E = !1, T(K), !x)
      if (s(l) !== null)
        x = !0, Z(P);
      else {
        var V = s(f);
        V !== null && ce(C, V.startTime - K);
      }
  }
  function P(K, V) {
    x = !1, E && (E = !1, S(L), L = -1), g = !0;
    var G = v;
    try {
      for (T(V), p = s(l); p !== null && (!(p.expirationTime > V) || K && !I()); ) {
        var F = p.callback;
        if (typeof F == "function") {
          p.callback = null, v = p.priorityLevel;
          var j = F(p.expirationTime <= V);
          V = c.unstable_now(), typeof j == "function" ? p.callback = j : p === s(l) && a(l), T(V);
        } else
          a(l);
        p = s(l);
      }
      if (p !== null)
        var W = !0;
      else {
        var $ = s(f);
        $ !== null && ce(C, $.startTime - V), W = !1;
      }
      return W;
    } finally {
      p = null, v = G, g = !1;
    }
  }
  var M = !1, b = null, L = -1, U = 5, R = -1;
  function I() {
    return !(c.unstable_now() - R < U);
  }
  function k() {
    if (b !== null) {
      var K = c.unstable_now();
      R = K;
      var V = !0;
      try {
        V = b(!0, K);
      } finally {
        V ? O() : (M = !1, b = null);
      }
    } else
      M = !1;
  }
  var O;
  if (typeof A == "function")
    O = function() {
      A(k);
    };
  else if (typeof MessageChannel < "u") {
    var N = new MessageChannel(), J = N.port2;
    N.port1.onmessage = k, O = function() {
      J.postMessage(null);
    };
  } else
    O = function() {
      _(k, 0);
    };
  function Z(K) {
    b = K, M || (M = !0, O());
  }
  function ce(K, V) {
    L = _(function() {
      K(c.unstable_now());
    }, V);
  }
  c.unstable_IdlePriority = 5, c.unstable_ImmediatePriority = 1, c.unstable_LowPriority = 4, c.unstable_NormalPriority = 3, c.unstable_Profiling = null, c.unstable_UserBlockingPriority = 2, c.unstable_cancelCallback = function(K) {
    K.callback = null;
  }, c.unstable_continueExecution = function() {
    x || g || (x = !0, Z(P));
  }, c.unstable_forceFrameRate = function(K) {
    0 > K || 125 < K ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : U = 0 < K ? Math.floor(1e3 / K) : 5;
  }, c.unstable_getCurrentPriorityLevel = function() {
    return v;
  }, c.unstable_getFirstCallbackNode = function() {
    return s(l);
  }, c.unstable_next = function(K) {
    switch (v) {
      case 1:
      case 2:
      case 3:
        var V = 3;
        break;
      default:
        V = v;
    }
    var G = v;
    v = V;
    try {
      return K();
    } finally {
      v = G;
    }
  }, c.unstable_pauseExecution = function() {
  }, c.unstable_requestPaint = function() {
  }, c.unstable_runWithPriority = function(K, V) {
    switch (K) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        K = 3;
    }
    var G = v;
    v = K;
    try {
      return V();
    } finally {
      v = G;
    }
  }, c.unstable_scheduleCallback = function(K, V, G) {
    var F = c.unstable_now();
    switch (typeof G == "object" && G !== null ? (G = G.delay, G = typeof G == "number" && 0 < G ? F + G : F) : G = F, K) {
      case 1:
        var j = -1;
        break;
      case 2:
        j = 250;
        break;
      case 5:
        j = 1073741823;
        break;
      case 4:
        j = 1e4;
        break;
      default:
        j = 5e3;
    }
    return j = G + j, K = { id: d++, callback: V, priorityLevel: K, startTime: G, expirationTime: j, sortIndex: -1 }, G > F ? (K.sortIndex = G, e(f, K), s(l) === null && K === s(f) && (E ? (S(L), L = -1) : E = !0, ce(C, G - F))) : (K.sortIndex = j, e(l, K), x || g || (x = !0, Z(P))), K;
  }, c.unstable_shouldYield = I, c.unstable_wrapCallback = function(K) {
    var V = v;
    return function() {
      var G = v;
      v = V;
      try {
        return K.apply(this, arguments);
      } finally {
        v = G;
      }
    };
  };
})(xh);
yh.exports = xh;
var Pu = yh.exports;
/**
 * @license React
 * react-reconciler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Xm = function(e) {
  var s = {}, a = Bm, r = Pu, n = Object.assign;
  function o(t) {
    for (var i = "https://reactjs.org/docs/error-decoder.html?invariant=" + t, h = 1; h < arguments.length; h++)
      i += "&args[]=" + encodeURIComponent(arguments[h]);
    return "Minified React error #" + t + "; visit " + i + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var u = a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, l = Symbol.for("react.element"), f = Symbol.for("react.portal"), d = Symbol.for("react.fragment"), p = Symbol.for("react.strict_mode"), v = Symbol.for("react.profiler"), g = Symbol.for("react.provider"), x = Symbol.for("react.context"), E = Symbol.for("react.forward_ref"), _ = Symbol.for("react.suspense"), S = Symbol.for("react.suspense_list"), A = Symbol.for("react.memo"), T = Symbol.for("react.lazy"), C = Symbol.for("react.offscreen"), P = Symbol.iterator;
  function M(t) {
    return t === null || typeof t != "object" ? null : (t = P && t[P] || t["@@iterator"], typeof t == "function" ? t : null);
  }
  function b(t) {
    if (t == null)
      return null;
    if (typeof t == "function")
      return t.displayName || t.name || null;
    if (typeof t == "string")
      return t;
    switch (t) {
      case d:
        return "Fragment";
      case f:
        return "Portal";
      case v:
        return "Profiler";
      case p:
        return "StrictMode";
      case _:
        return "Suspense";
      case S:
        return "SuspenseList";
    }
    if (typeof t == "object")
      switch (t.$$typeof) {
        case x:
          return (t.displayName || "Context") + ".Consumer";
        case g:
          return (t._context.displayName || "Context") + ".Provider";
        case E:
          var i = t.render;
          return t = t.displayName, t || (t = i.displayName || i.name || "", t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef"), t;
        case A:
          return i = t.displayName || null, i !== null ? i : b(t.type) || "Memo";
        case T:
          i = t._payload, t = t._init;
          try {
            return b(t(i));
          } catch {
          }
      }
    return null;
  }
  function L(t) {
    var i = t.type;
    switch (t.tag) {
      case 24:
        return "Cache";
      case 9:
        return (i.displayName || "Context") + ".Consumer";
      case 10:
        return (i._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return t = i.render, t = t.displayName || t.name || "", i.displayName || (t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return i;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return b(i);
      case 8:
        return i === p ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof i == "function")
          return i.displayName || i.name || null;
        if (typeof i == "string")
          return i;
    }
    return null;
  }
  function U(t) {
    var i = t, h = t;
    if (t.alternate)
      for (; i.return; )
        i = i.return;
    else {
      t = i;
      do
        i = t, i.flags & 4098 && (h = i.return), t = i.return;
      while (t);
    }
    return i.tag === 3 ? h : null;
  }
  function R(t) {
    if (U(t) !== t)
      throw Error(o(188));
  }
  function I(t) {
    var i = t.alternate;
    if (!i) {
      if (i = U(t), i === null)
        throw Error(o(188));
      return i !== t ? null : t;
    }
    for (var h = t, m = i; ; ) {
      var y = h.return;
      if (y === null)
        break;
      var w = y.alternate;
      if (w === null) {
        if (m = y.return, m !== null) {
          h = m;
          continue;
        }
        break;
      }
      if (y.child === w.child) {
        for (w = y.child; w; ) {
          if (w === h)
            return R(y), t;
          if (w === m)
            return R(y), i;
          w = w.sibling;
        }
        throw Error(o(188));
      }
      if (h.return !== m.return)
        h = y, m = w;
      else {
        for (var D = !1, z = y.child; z; ) {
          if (z === h) {
            D = !0, h = y, m = w;
            break;
          }
          if (z === m) {
            D = !0, m = y, h = w;
            break;
          }
          z = z.sibling;
        }
        if (!D) {
          for (z = w.child; z; ) {
            if (z === h) {
              D = !0, h = w, m = y;
              break;
            }
            if (z === m) {
              D = !0, m = w, h = y;
              break;
            }
            z = z.sibling;
          }
          if (!D)
            throw Error(o(189));
        }
      }
      if (h.alternate !== m)
        throw Error(o(190));
    }
    if (h.tag !== 3)
      throw Error(o(188));
    return h.stateNode.current === h ? t : i;
  }
  function k(t) {
    return t = I(t), t !== null ? O(t) : null;
  }
  function O(t) {
    if (t.tag === 5 || t.tag === 6)
      return t;
    for (t = t.child; t !== null; ) {
      var i = O(t);
      if (i !== null)
        return i;
      t = t.sibling;
    }
    return null;
  }
  function N(t) {
    if (t.tag === 5 || t.tag === 6)
      return t;
    for (t = t.child; t !== null; ) {
      if (t.tag !== 4) {
        var i = N(t);
        if (i !== null)
          return i;
      }
      t = t.sibling;
    }
    return null;
  }
  var J = Array.isArray, Z = e.getPublicInstance, ce = e.getRootHostContext, K = e.getChildHostContext, V = e.prepareForCommit, G = e.resetAfterCommit, F = e.createInstance, j = e.appendInitialChild, W = e.finalizeInitialChildren, $ = e.prepareUpdate, Y = e.shouldSetTextContent, se = e.createTextInstance, X = e.scheduleTimeout, q = e.cancelTimeout, re = e.noTimeout, pe = e.isPrimaryRenderer, ae = e.supportsMutation, ie = e.supportsPersistence, fe = e.supportsHydration, ve = e.getInstanceFromNode, me = e.preparePortalMount, we = e.getCurrentEventPriority, Fe = e.detachDeletedInstance, de = e.supportsMicrotasks, Me = e.scheduleMicrotask, Te = e.supportsTestSelectors, le = e.findFiberRoot, je = e.getBoundingRect, _e = e.getTextContent, Ee = e.isHiddenSubtree, xe = e.matchAccessibilityRole, tt = e.setFocusIfFocusable, be = e.setupIntersectionObserver, Le = e.appendChild, Oe = e.appendChildToContainer, Ge = e.commitTextUpdate, st = e.commitMount, ct = e.commitUpdate, Ke = e.insertBefore, We = e.insertInContainerBefore, Ue = e.removeChild, B = e.removeChildFromContainer, ue = e.resetTextContent, Pe = e.hideInstance, Re = e.hideTextInstance, Ae = e.unhideInstance, Ye = e.unhideTextInstance, kt = e.clearContainer, at = e.cloneInstance, Xe = e.createContainerChildSet, nt = e.appendChildToContainerChildSet, et = e.finalizeContainerChildren, ze = e.replaceContainerChildren, rt = e.cloneHiddenInstance, pt = e.cloneHiddenTextInstance, vt = e.canHydrateInstance, Et = e.canHydrateTextInstance, pn = e.canHydrateSuspenseInstance, Kn = e.isSuspenseInstancePending, mn = e.isSuspenseInstanceFallback, rr = e.registerSuspenseInstanceRetry, vn = e.getNextHydratableSibling, Yn = e.getFirstHydratableChild, Gt = e.getFirstHydratableChildWithinContainer, xr = e.getFirstHydratableChildWithinSuspenseInstance, xs = e.hydrateInstance, _o = e.hydrateTextInstance, qa = e.hydrateSuspenseInstance, Ss = e.getNextHydratableInstanceAfterSuspenseInstance, ei = e.commitHydratedContainer, To = e.commitHydratedSuspenseInstance, Za = e.clearSuspenseBoundary, ws = e.clearSuspenseBoundaryFromContainer, Pi = e.shouldDeleteUnhydratedTailInstances, Eo = e.didNotMatchHydratedContainerTextInstance, Ao = e.didNotMatchHydratedTextInstance, ke;
  function Qn(t) {
    if (ke === void 0)
      try {
        throw Error();
      } catch (h) {
        var i = h.stack.trim().match(/\n( *(at )?)/);
        ke = i && i[1] || "";
      }
    return `
` + ke + t;
  }
  var Co = !1;
  function ir(t, i) {
    if (!t || Co)
      return "";
    Co = !0;
    var h = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (i)
        if (i = function() {
          throw Error();
        }, Object.defineProperty(i.prototype, "props", { set: function() {
          throw Error();
        } }), typeof Reflect == "object" && Reflect.construct) {
          try {
            Reflect.construct(i, []);
          } catch (he) {
            var m = he;
          }
          Reflect.construct(t, [], i);
        } else {
          try {
            i.call();
          } catch (he) {
            m = he;
          }
          t.call(i.prototype);
        }
      else {
        try {
          throw Error();
        } catch (he) {
          m = he;
        }
        t();
      }
    } catch (he) {
      if (he && m && typeof he.stack == "string") {
        for (var y = he.stack.split(`
`), w = m.stack.split(`
`), D = y.length - 1, z = w.length - 1; 1 <= D && 0 <= z && y[D] !== w[z]; )
          z--;
        for (; 1 <= D && 0 <= z; D--, z--)
          if (y[D] !== w[z]) {
            if (D !== 1 || z !== 1)
              do
                if (D--, z--, 0 > z || y[D] !== w[z]) {
                  var ne = `
` + y[D].replace(" at new ", " at ");
                  return t.displayName && ne.includes("<anonymous>") && (ne = ne.replace("<anonymous>", t.displayName)), ne;
                }
              while (1 <= D && 0 <= z);
            break;
          }
      }
    } finally {
      Co = !1, Error.prepareStackTrace = h;
    }
    return (t = t ? t.displayName || t.name : "") ? Qn(t) : "";
  }
  var Mi = Object.prototype.hasOwnProperty, bi = [], or = -1;
  function gn(t) {
    return { current: t };
  }
  function lt(t) {
    0 > or || (t.current = bi[or], bi[or] = null, or--);
  }
  function ut(t, i) {
    or++, bi[or] = t.current, t.current = i;
  }
  var yn = {}, Ut = gn(yn), It = gn(!1), sr = yn;
  function bn(t, i) {
    var h = t.type.contextTypes;
    if (!h)
      return yn;
    var m = t.stateNode;
    if (m && m.__reactInternalMemoizedUnmaskedChildContext === i)
      return m.__reactInternalMemoizedMaskedChildContext;
    var y = {}, w;
    for (w in h)
      y[w] = i[w];
    return m && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = i, t.__reactInternalMemoizedMaskedChildContext = y), y;
  }
  function Ot(t) {
    return t = t.childContextTypes, t != null;
  }
  function qn() {
    lt(It), lt(Ut);
  }
  function Li(t, i, h) {
    if (Ut.current !== yn)
      throw Error(o(168));
    ut(Ut, i), ut(It, h);
  }
  function Ri(t, i, h) {
    var m = t.stateNode;
    if (i = i.childContextTypes, typeof m.getChildContext != "function")
      return h;
    m = m.getChildContext();
    for (var y in m)
      if (!(y in i))
        throw Error(o(108, L(t) || "Unknown", y));
    return n({}, h, m);
  }
  function Fr(t) {
    return t = (t = t.stateNode) && t.__reactInternalMemoizedMergedChildContext || yn, sr = Ut.current, ut(Ut, t), ut(It, It.current), !0;
  }
  function xn(t, i, h) {
    var m = t.stateNode;
    if (!m)
      throw Error(o(169));
    h ? (t = Ri(t, i, sr), m.__reactInternalMemoizedMergedChildContext = t, lt(It), lt(Ut), ut(Ut, t)) : lt(It), ut(It, h);
  }
  var Sn = Math.clz32 ? Math.clz32 : _s, ki = Math.log, ti = Math.LN2;
  function _s(t) {
    return t >>>= 0, t === 0 ? 32 : 31 - (ki(t) / ti | 0) | 0;
  }
  var Sr = 64, wr = 4194304;
  function _r(t) {
    switch (t & -t) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return t & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return t;
    }
  }
  function ni(t, i) {
    var h = t.pendingLanes;
    if (h === 0)
      return 0;
    var m = 0, y = t.suspendedLanes, w = t.pingedLanes, D = h & 268435455;
    if (D !== 0) {
      var z = D & ~y;
      z !== 0 ? m = _r(z) : (w &= D, w !== 0 && (m = _r(w)));
    } else
      D = h & ~y, D !== 0 ? m = _r(D) : w !== 0 && (m = _r(w));
    if (m === 0)
      return 0;
    if (i !== 0 && i !== m && !(i & y) && (y = m & -m, w = i & -i, y >= w || y === 16 && (w & 4194240) !== 0))
      return i;
    if (m & 4 && (m |= h & 16), i = t.entangledLanes, i !== 0)
      for (t = t.entanglements, i &= m; 0 < i; )
        h = 31 - Sn(i), y = 1 << h, m |= t[h], i &= ~y;
    return m;
  }
  function Ts(t, i) {
    switch (t) {
      case 1:
      case 2:
      case 4:
        return i + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return i + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function Po(t, i) {
    for (var h = t.suspendedLanes, m = t.pingedLanes, y = t.expirationTimes, w = t.pendingLanes; 0 < w; ) {
      var D = 31 - Sn(w), z = 1 << D, ne = y[D];
      ne === -1 ? (!(z & h) || z & m) && (y[D] = Ts(z, i)) : ne <= i && (t.expiredLanes |= z), w &= ~z;
    }
  }
  function Tr(t) {
    return t = t.pendingLanes & -1073741825, t !== 0 ? t : t & 1073741824 ? 1073741824 : 0;
  }
  function Ui(t) {
    for (var i = [], h = 0; 31 > h; h++)
      i.push(t);
    return i;
  }
  function ar(t, i, h) {
    t.pendingLanes |= i, i !== 536870912 && (t.suspendedLanes = 0, t.pingedLanes = 0), t = t.eventTimes, i = 31 - Sn(i), t[i] = h;
  }
  function Ir(t, i) {
    var h = t.pendingLanes & ~i;
    t.pendingLanes = i, t.suspendedLanes = 0, t.pingedLanes = 0, t.expiredLanes &= i, t.mutableReadLanes &= i, t.entangledLanes &= i, i = t.entanglements;
    var m = t.eventTimes;
    for (t = t.expirationTimes; 0 < h; ) {
      var y = 31 - Sn(h), w = 1 << y;
      i[y] = 0, m[y] = -1, t[y] = -1, h &= ~w;
    }
  }
  function lr(t, i) {
    var h = t.entangledLanes |= i;
    for (t = t.entanglements; h; ) {
      var m = 31 - Sn(h), y = 1 << m;
      y & i | t[m] & i && (t[m] |= i), h &= ~y;
    }
  }
  var Je = 0;
  function Mo(t) {
    return t &= -t, 1 < t ? 4 < t ? t & 268435455 ? 16 : 536870912 : 4 : 1;
  }
  var Er = r.unstable_scheduleCallback, Di = r.unstable_cancelCallback, bo = r.unstable_shouldYield, Es = r.unstable_requestPaint, gt = r.unstable_now, ri = r.unstable_ImmediatePriority, As = r.unstable_UserBlockingPriority, en = r.unstable_NormalPriority, Lo = r.unstable_IdlePriority, ii = null, wn = null;
  function Ro(t) {
    if (wn && typeof wn.onCommitFiberRoot == "function")
      try {
        wn.onCommitFiberRoot(ii, t, void 0, (t.current.flags & 128) === 128);
      } catch {
      }
  }
  function Cs(t, i) {
    return t === i && (t !== 0 || 1 / t === 1 / i) || t !== t && i !== i;
  }
  var _n = typeof Object.is == "function" ? Object.is : Cs, tn = null, ur = !1, Ln = !1;
  function ko(t) {
    tn === null ? tn = [t] : tn.push(t);
  }
  function Uo(t) {
    ur = !0, ko(t);
  }
  function un() {
    if (!Ln && tn !== null) {
      Ln = !0;
      var t = 0, i = Je;
      try {
        var h = tn;
        for (Je = 1; t < h.length; t++) {
          var m = h[t];
          do
            m = m(!0);
          while (m !== null);
        }
        tn = null, ur = !1;
      } catch (y) {
        throw tn !== null && (tn = tn.slice(t + 1)), Er(ri, un), y;
      } finally {
        Je = i, Ln = !1;
      }
    }
    return null;
  }
  var oi = u.ReactCurrentBatchConfig;
  function si(t, i) {
    if (_n(t, i))
      return !0;
    if (typeof t != "object" || t === null || typeof i != "object" || i === null)
      return !1;
    var h = Object.keys(t), m = Object.keys(i);
    if (h.length !== m.length)
      return !1;
    for (m = 0; m < h.length; m++) {
      var y = h[m];
      if (!Mi.call(i, y) || !_n(t[y], i[y]))
        return !1;
    }
    return !0;
  }
  function ai(t) {
    switch (t.tag) {
      case 5:
        return Qn(t.type);
      case 16:
        return Qn("Lazy");
      case 13:
        return Qn("Suspense");
      case 19:
        return Qn("SuspenseList");
      case 0:
      case 2:
      case 15:
        return t = ir(t.type, !1), t;
      case 11:
        return t = ir(t.type.render, !1), t;
      case 1:
        return t = ir(t.type, !0), t;
      default:
        return "";
    }
  }
  function nn(t, i) {
    if (t && t.defaultProps) {
      i = n({}, i), t = t.defaultProps;
      for (var h in t)
        i[h] === void 0 && (i[h] = t[h]);
      return i;
    }
    return i;
  }
  var Nt = gn(null), Fi = null, Zn = null, Or = null;
  function Ii() {
    Or = Zn = Fi = null;
  }
  function Ps(t, i, h) {
    pe ? (ut(Nt, i._currentValue), i._currentValue = h) : (ut(Nt, i._currentValue2), i._currentValue2 = h);
  }
  function Bt(t) {
    var i = Nt.current;
    lt(Nt), pe ? t._currentValue = i : t._currentValue2 = i;
  }
  function rn(t, i, h) {
    for (; t !== null; ) {
      var m = t.alternate;
      if ((t.childLanes & i) !== i ? (t.childLanes |= i, m !== null && (m.childLanes |= i)) : m !== null && (m.childLanes & i) !== i && (m.childLanes |= i), t === h)
        break;
      t = t.return;
    }
  }
  function At(t, i) {
    Fi = t, Or = Zn = null, t = t.dependencies, t !== null && t.firstContext !== null && (t.lanes & i && (Cn = !0), t.firstContext = null);
  }
  function Ct(t) {
    var i = pe ? t._currentValue : t._currentValue2;
    if (Or !== t)
      if (t = { context: t, memoizedValue: i, next: null }, Zn === null) {
        if (Fi === null)
          throw Error(o(308));
        Zn = t, Fi.dependencies = { lanes: 0, firstContext: t };
      } else
        Zn = Zn.next = t;
    return i;
  }
  var Tn = null, Nr = !1;
  function Ja(t) {
    t.updateQueue = { baseState: t.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function fc(t, i) {
    t = t.updateQueue, i.updateQueue === t && (i.updateQueue = { baseState: t.baseState, firstBaseUpdate: t.firstBaseUpdate, lastBaseUpdate: t.lastBaseUpdate, shared: t.shared, effects: t.effects });
  }
  function Ar(t, i) {
    return { eventTime: t, lane: i, tag: 0, payload: null, callback: null, next: null };
  }
  function Br(t, i) {
    var h = t.updateQueue;
    h !== null && (h = h.shared, bt !== null && t.mode & 1 && !(Ze & 2) ? (t = h.interleaved, t === null ? (i.next = i, Tn === null ? Tn = [h] : Tn.push(h)) : (i.next = t.next, t.next = i), h.interleaved = i) : (t = h.pending, t === null ? i.next = i : (i.next = t.next, t.next = i), h.pending = i));
  }
  function Ms(t, i, h) {
    if (i = i.updateQueue, i !== null && (i = i.shared, (h & 4194240) !== 0)) {
      var m = i.lanes;
      m &= t.pendingLanes, h |= m, i.lanes = h, lr(t, h);
    }
  }
  function dc(t, i) {
    var h = t.updateQueue, m = t.alternate;
    if (m !== null && (m = m.updateQueue, h === m)) {
      var y = null, w = null;
      if (h = h.firstBaseUpdate, h !== null) {
        do {
          var D = { eventTime: h.eventTime, lane: h.lane, tag: h.tag, payload: h.payload, callback: h.callback, next: null };
          w === null ? y = w = D : w = w.next = D, h = h.next;
        } while (h !== null);
        w === null ? y = w = i : w = w.next = i;
      } else
        y = w = i;
      h = { baseState: m.baseState, firstBaseUpdate: y, lastBaseUpdate: w, shared: m.shared, effects: m.effects }, t.updateQueue = h;
      return;
    }
    t = h.lastBaseUpdate, t === null ? h.firstBaseUpdate = i : t.next = i, h.lastBaseUpdate = i;
  }
  function bs(t, i, h, m) {
    var y = t.updateQueue;
    Nr = !1;
    var w = y.firstBaseUpdate, D = y.lastBaseUpdate, z = y.shared.pending;
    if (z !== null) {
      y.shared.pending = null;
      var ne = z, he = ne.next;
      ne.next = null, D === null ? w = he : D.next = he, D = ne;
      var Ce = t.alternate;
      Ce !== null && (Ce = Ce.updateQueue, z = Ce.lastBaseUpdate, z !== D && (z === null ? Ce.firstBaseUpdate = he : z.next = he, Ce.lastBaseUpdate = ne));
    }
    if (w !== null) {
      var He = y.baseState;
      D = 0, Ce = he = ne = null, z = w;
      do {
        var Ne = z.lane, ft = z.eventTime;
        if ((m & Ne) === Ne) {
          Ce !== null && (Ce = Ce.next = {
            eventTime: ft,
            lane: 0,
            tag: z.tag,
            payload: z.payload,
            callback: z.callback,
            next: null
          });
          e: {
            var Ie = t, $t = z;
            switch (Ne = i, ft = h, $t.tag) {
              case 1:
                if (Ie = $t.payload, typeof Ie == "function") {
                  He = Ie.call(ft, He, Ne);
                  break e;
                }
                He = Ie;
                break e;
              case 3:
                Ie.flags = Ie.flags & -65537 | 128;
              case 0:
                if (Ie = $t.payload, Ne = typeof Ie == "function" ? Ie.call(ft, He, Ne) : Ie, Ne == null)
                  break e;
                He = n({}, He, Ne);
                break e;
              case 2:
                Nr = !0;
            }
          }
          z.callback !== null && z.lane !== 0 && (t.flags |= 64, Ne = y.effects, Ne === null ? y.effects = [z] : Ne.push(z));
        } else
          ft = { eventTime: ft, lane: Ne, tag: z.tag, payload: z.payload, callback: z.callback, next: null }, Ce === null ? (he = Ce = ft, ne = He) : Ce = Ce.next = ft, D |= Ne;
        if (z = z.next, z === null) {
          if (z = y.shared.pending, z === null)
            break;
          Ne = z, z = Ne.next, Ne.next = null, y.lastBaseUpdate = Ne, y.shared.pending = null;
        }
      } while (1);
      if (Ce === null && (ne = He), y.baseState = ne, y.firstBaseUpdate = he, y.lastBaseUpdate = Ce, i = y.shared.interleaved, i !== null) {
        y = i;
        do
          D |= y.lane, y = y.next;
        while (y !== i);
      } else
        w === null && (y.shared.lanes = 0);
      Wi |= D, t.lanes = D, t.memoizedState = He;
    }
  }
  function hc(t, i, h) {
    if (t = i.effects, i.effects = null, t !== null)
      for (i = 0; i < t.length; i++) {
        var m = t[i], y = m.callback;
        if (y !== null) {
          if (m.callback = null, m = h, typeof y != "function")
            throw Error(o(191, y));
          y.call(m);
        }
      }
  }
  var pc = new a.Component().refs;
  function $a(t, i, h, m) {
    i = t.memoizedState, h = h(m, i), h = h == null ? i : n({}, i, h), t.memoizedState = h, t.lanes === 0 && (t.updateQueue.baseState = h);
  }
  var Ls = { isMounted: function(t) {
    return (t = t._reactInternals) ? U(t) === t : !1;
  }, enqueueSetState: function(t, i, h) {
    t = t._reactInternals;
    var m = sn(), y = Gr(t), w = Ar(m, y);
    w.payload = i, h != null && (w.callback = h), Br(t, w), i = Fn(t, y, m), i !== null && Ms(i, t, y);
  }, enqueueReplaceState: function(t, i, h) {
    t = t._reactInternals;
    var m = sn(), y = Gr(t), w = Ar(m, y);
    w.tag = 1, w.payload = i, h != null && (w.callback = h), Br(t, w), i = Fn(t, y, m), i !== null && Ms(i, t, y);
  }, enqueueForceUpdate: function(t, i) {
    t = t._reactInternals;
    var h = sn(), m = Gr(t), y = Ar(
      h,
      m
    );
    y.tag = 2, i != null && (y.callback = i), Br(t, y), i = Fn(t, m, h), i !== null && Ms(i, t, m);
  } };
  function mc(t, i, h, m, y, w, D) {
    return t = t.stateNode, typeof t.shouldComponentUpdate == "function" ? t.shouldComponentUpdate(m, w, D) : i.prototype && i.prototype.isPureReactComponent ? !si(h, m) || !si(y, w) : !0;
  }
  function vc(t, i, h) {
    var m = !1, y = yn, w = i.contextType;
    return typeof w == "object" && w !== null ? w = Ct(w) : (y = Ot(i) ? sr : Ut.current, m = i.contextTypes, w = (m = m != null) ? bn(t, y) : yn), i = new i(h, w), t.memoizedState = i.state !== null && i.state !== void 0 ? i.state : null, i.updater = Ls, t.stateNode = i, i._reactInternals = t, m && (t = t.stateNode, t.__reactInternalMemoizedUnmaskedChildContext = y, t.__reactInternalMemoizedMaskedChildContext = w), i;
  }
  function gc(t, i, h, m) {
    t = i.state, typeof i.componentWillReceiveProps == "function" && i.componentWillReceiveProps(h, m), typeof i.UNSAFE_componentWillReceiveProps == "function" && i.UNSAFE_componentWillReceiveProps(h, m), i.state !== t && Ls.enqueueReplaceState(i, i.state, null);
  }
  function el(t, i, h, m) {
    var y = t.stateNode;
    y.props = h, y.state = t.memoizedState, y.refs = pc, Ja(t);
    var w = i.contextType;
    typeof w == "object" && w !== null ? y.context = Ct(w) : (w = Ot(i) ? sr : Ut.current, y.context = bn(t, w)), y.state = t.memoizedState, w = i.getDerivedStateFromProps, typeof w == "function" && ($a(t, i, w, h), y.state = t.memoizedState), typeof i.getDerivedStateFromProps == "function" || typeof y.getSnapshotBeforeUpdate == "function" || typeof y.UNSAFE_componentWillMount != "function" && typeof y.componentWillMount != "function" || (i = y.state, typeof y.componentWillMount == "function" && y.componentWillMount(), typeof y.UNSAFE_componentWillMount == "function" && y.UNSAFE_componentWillMount(), i !== y.state && Ls.enqueueReplaceState(y, y.state, null), bs(t, h, y, m), y.state = t.memoizedState), typeof y.componentDidMount == "function" && (t.flags |= 4194308);
  }
  var Oi = [], Ni = 0, Rs = null, ks = 0, Rn = [], kn = 0, li = null, Cr = 1, Pr = "";
  function ui(t, i) {
    Oi[Ni++] = ks, Oi[Ni++] = Rs, Rs = t, ks = i;
  }
  function yc(t, i, h) {
    Rn[kn++] = Cr, Rn[kn++] = Pr, Rn[kn++] = li, li = t;
    var m = Cr;
    t = Pr;
    var y = 32 - Sn(m) - 1;
    m &= ~(1 << y), h += 1;
    var w = 32 - Sn(i) + y;
    if (30 < w) {
      var D = y - y % 5;
      w = (m & (1 << D) - 1).toString(32), m >>= D, y -= D, Cr = 1 << 32 - Sn(i) + y | h << y | m, Pr = w + t;
    } else
      Cr = 1 << w | h << y | m, Pr = t;
  }
  function tl(t) {
    t.return !== null && (ui(t, 1), yc(t, 1, 0));
  }
  function nl(t) {
    for (; t === Rs; )
      Rs = Oi[--Ni], Oi[Ni] = null, ks = Oi[--Ni], Oi[Ni] = null;
    for (; t === li; )
      li = Rn[--kn], Rn[kn] = null, Pr = Rn[--kn], Rn[kn] = null, Cr = Rn[--kn], Rn[kn] = null;
  }
  var En = null, An = null, mt = !1, Do = !1, Jn = null;
  function xc(t, i) {
    var h = In(5, null, null, 0);
    h.elementType = "DELETED", h.stateNode = i, h.return = t, i = t.deletions, i === null ? (t.deletions = [h], t.flags |= 16) : i.push(h);
  }
  function Sc(t, i) {
    switch (t.tag) {
      case 5:
        return i = vt(i, t.type, t.pendingProps), i !== null ? (t.stateNode = i, En = t, An = Yn(i), !0) : !1;
      case 6:
        return i = Et(i, t.pendingProps), i !== null ? (t.stateNode = i, En = t, An = null, !0) : !1;
      case 13:
        if (i = pn(i), i !== null) {
          var h = li !== null ? { id: Cr, overflow: Pr } : null;
          return t.memoizedState = { dehydrated: i, treeContext: h, retryLane: 1073741824 }, h = In(18, null, null, 0), h.stateNode = i, h.return = t, t.child = h, En = t, An = null, !0;
        }
        return !1;
      default:
        return !1;
    }
  }
  function rl(t) {
    return (t.mode & 1) !== 0 && (t.flags & 128) === 0;
  }
  function il(t) {
    if (mt) {
      var i = An;
      if (i) {
        var h = i;
        if (!Sc(t, i)) {
          if (rl(t))
            throw Error(o(418));
          i = vn(h);
          var m = En;
          i && Sc(t, i) ? xc(m, h) : (t.flags = t.flags & -4097 | 2, mt = !1, En = t);
        }
      } else {
        if (rl(t))
          throw Error(o(418));
        t.flags = t.flags & -4097 | 2, mt = !1, En = t;
      }
    }
  }
  function wc(t) {
    for (t = t.return; t !== null && t.tag !== 5 && t.tag !== 3 && t.tag !== 13; )
      t = t.return;
    En = t;
  }
  function Fo(t) {
    if (!fe || t !== En)
      return !1;
    if (!mt)
      return wc(t), mt = !0, !1;
    if (t.tag !== 3 && (t.tag !== 5 || Pi(t.type) && !Y(t.type, t.memoizedProps))) {
      var i = An;
      if (i) {
        if (rl(t)) {
          for (t = An; t; )
            t = vn(t);
          throw Error(o(418));
        }
        for (; i; )
          xc(t, i), i = vn(i);
      }
    }
    if (wc(t), t.tag === 13) {
      if (!fe)
        throw Error(o(316));
      if (t = t.memoizedState, t = t !== null ? t.dehydrated : null, !t)
        throw Error(o(317));
      An = Ss(t);
    } else
      An = En ? vn(t.stateNode) : null;
    return !0;
  }
  function Bi() {
    fe && (An = En = null, Do = mt = !1);
  }
  function ol(t) {
    Jn === null ? Jn = [t] : Jn.push(t);
  }
  function Io(t, i, h) {
    if (t = h.ref, t !== null && typeof t != "function" && typeof t != "object") {
      if (h._owner) {
        if (h = h._owner, h) {
          if (h.tag !== 1)
            throw Error(o(309));
          var m = h.stateNode;
        }
        if (!m)
          throw Error(o(147, t));
        var y = m, w = "" + t;
        return i !== null && i.ref !== null && typeof i.ref == "function" && i.ref._stringRef === w ? i.ref : (i = function(D) {
          var z = y.refs;
          z === pc && (z = y.refs = {}), D === null ? delete z[w] : z[w] = D;
        }, i._stringRef = w, i);
      }
      if (typeof t != "string")
        throw Error(o(284));
      if (!h._owner)
        throw Error(o(290, t));
    }
    return t;
  }
  function Us(t, i) {
    throw t = Object.prototype.toString.call(i), Error(o(31, t === "[object Object]" ? "object with keys {" + Object.keys(i).join(", ") + "}" : t));
  }
  function _c(t) {
    var i = t._init;
    return i(t._payload);
  }
  function Tc(t) {
    function i(Q, H) {
      if (t) {
        var ee = Q.deletions;
        ee === null ? (Q.deletions = [H], Q.flags |= 16) : ee.push(H);
      }
    }
    function h(Q, H) {
      if (!t)
        return null;
      for (; H !== null; )
        i(Q, H), H = H.sibling;
      return null;
    }
    function m(Q, H) {
      for (Q = /* @__PURE__ */ new Map(); H !== null; )
        H.key !== null ? Q.set(H.key, H) : Q.set(H.index, H), H = H.sibling;
      return Q;
    }
    function y(Q, H) {
      return Q = Vr(Q, H), Q.index = 0, Q.sibling = null, Q;
    }
    function w(Q, H, ee) {
      return Q.index = ee, t ? (ee = Q.alternate, ee !== null ? (ee = ee.index, ee < H ? (Q.flags |= 2, H) : ee) : (Q.flags |= 2, H)) : (Q.flags |= 1048576, H);
    }
    function D(Q) {
      return t && Q.alternate === null && (Q.flags |= 2), Q;
    }
    function z(Q, H, ee, Se) {
      return H === null || H.tag !== 6 ? (H = Gl(ee, Q.mode, Se), H.return = Q, H) : (H = y(H, ee), H.return = Q, H);
    }
    function ne(Q, H, ee, Se) {
      var De = ee.type;
      return De === d ? Ce(Q, H, ee.props.children, Se, ee.key) : H !== null && (H.elementType === De || typeof De == "object" && De !== null && De.$$typeof === T && _c(De) === H.type) ? (Se = y(H, ee.props), Se.ref = Io(Q, H, ee), Se.return = Q, Se) : (Se = ca(ee.type, ee.key, ee.props, null, Q.mode, Se), Se.ref = Io(Q, H, ee), Se.return = Q, Se);
    }
    function he(Q, H, ee, Se) {
      return H === null || H.tag !== 4 || H.stateNode.containerInfo !== ee.containerInfo || H.stateNode.implementation !== ee.implementation ? (H = Hl(ee, Q.mode, Se), H.return = Q, H) : (H = y(H, ee.children || []), H.return = Q, H);
    }
    function Ce(Q, H, ee, Se, De) {
      return H === null || H.tag !== 7 ? (H = vi(ee, Q.mode, Se, De), H.return = Q, H) : (H = y(H, ee), H.return = Q, H);
    }
    function He(Q, H, ee) {
      if (typeof H == "string" && H !== "" || typeof H == "number")
        return H = Gl("" + H, Q.mode, ee), H.return = Q, H;
      if (typeof H == "object" && H !== null) {
        switch (H.$$typeof) {
          case l:
            return ee = ca(H.type, H.key, H.props, null, Q.mode, ee), ee.ref = Io(Q, null, H), ee.return = Q, ee;
          case f:
            return H = Hl(H, Q.mode, ee), H.return = Q, H;
          case T:
            var Se = H._init;
            return He(Q, Se(H._payload), ee);
        }
        if (J(H) || M(H))
          return H = vi(H, Q.mode, ee, null), H.return = Q, H;
        Us(Q, H);
      }
      return null;
    }
    function Ne(Q, H, ee, Se) {
      var De = H !== null ? H.key : null;
      if (typeof ee == "string" && ee !== "" || typeof ee == "number")
        return De !== null ? null : z(Q, H, "" + ee, Se);
      if (typeof ee == "object" && ee !== null) {
        switch (ee.$$typeof) {
          case l:
            return ee.key === De ? ne(Q, H, ee, Se) : null;
          case f:
            return ee.key === De ? he(Q, H, ee, Se) : null;
          case T:
            return De = ee._init, Ne(
              Q,
              H,
              De(ee._payload),
              Se
            );
        }
        if (J(ee) || M(ee))
          return De !== null ? null : Ce(Q, H, ee, Se, null);
        Us(Q, ee);
      }
      return null;
    }
    function ft(Q, H, ee, Se, De) {
      if (typeof Se == "string" && Se !== "" || typeof Se == "number")
        return Q = Q.get(ee) || null, z(H, Q, "" + Se, De);
      if (typeof Se == "object" && Se !== null) {
        switch (Se.$$typeof) {
          case l:
            return Q = Q.get(Se.key === null ? ee : Se.key) || null, ne(H, Q, Se, De);
          case f:
            return Q = Q.get(Se.key === null ? ee : Se.key) || null, he(H, Q, Se, De);
          case T:
            var qe = Se._init;
            return ft(Q, H, ee, qe(Se._payload), De);
        }
        if (J(Se) || M(Se))
          return Q = Q.get(ee) || null, Ce(H, Q, Se, De, null);
        Us(H, Se);
      }
      return null;
    }
    function Ie(Q, H, ee, Se) {
      for (var De = null, qe = null, Ve = H, it = H = 0, jt = null; Ve !== null && it < ee.length; it++) {
        Ve.index > it ? (jt = Ve, Ve = null) : jt = Ve.sibling;
        var ot = Ne(Q, Ve, ee[it], Se);
        if (ot === null) {
          Ve === null && (Ve = jt);
          break;
        }
        t && Ve && ot.alternate === null && i(Q, Ve), H = w(ot, H, it), qe === null ? De = ot : qe.sibling = ot, qe = ot, Ve = jt;
      }
      if (it === ee.length)
        return h(Q, Ve), mt && ui(Q, it), De;
      if (Ve === null) {
        for (; it < ee.length; it++)
          Ve = He(Q, ee[it], Se), Ve !== null && (H = w(Ve, H, it), qe === null ? De = Ve : qe.sibling = Ve, qe = Ve);
        return mt && ui(Q, it), De;
      }
      for (Ve = m(Q, Ve); it < ee.length; it++)
        jt = ft(Ve, Q, it, ee[it], Se), jt !== null && (t && jt.alternate !== null && Ve.delete(jt.key === null ? it : jt.key), H = w(jt, H, it), qe === null ? De = jt : qe.sibling = jt, qe = jt);
      return t && Ve.forEach(function(Wr) {
        return i(Q, Wr);
      }), mt && ui(Q, it), De;
    }
    function $t(Q, H, ee, Se) {
      var De = M(ee);
      if (typeof De != "function")
        throw Error(o(150));
      if (ee = De.call(ee), ee == null)
        throw Error(o(151));
      for (var qe = De = null, Ve = H, it = H = 0, jt = null, ot = ee.next(); Ve !== null && !ot.done; it++, ot = ee.next()) {
        Ve.index > it ? (jt = Ve, Ve = null) : jt = Ve.sibling;
        var Wr = Ne(Q, Ve, ot.value, Se);
        if (Wr === null) {
          Ve === null && (Ve = jt);
          break;
        }
        t && Ve && Wr.alternate === null && i(Q, Ve), H = w(Wr, H, it), qe === null ? De = Wr : qe.sibling = Wr, qe = Wr, Ve = jt;
      }
      if (ot.done)
        return h(
          Q,
          Ve
        ), mt && ui(Q, it), De;
      if (Ve === null) {
        for (; !ot.done; it++, ot = ee.next())
          ot = He(Q, ot.value, Se), ot !== null && (H = w(ot, H, it), qe === null ? De = ot : qe.sibling = ot, qe = ot);
        return mt && ui(Q, it), De;
      }
      for (Ve = m(Q, Ve); !ot.done; it++, ot = ee.next())
        ot = ft(Ve, Q, it, ot.value, Se), ot !== null && (t && ot.alternate !== null && Ve.delete(ot.key === null ? it : ot.key), H = w(ot, H, it), qe === null ? De = ot : qe.sibling = ot, qe = ot);
      return t && Ve.forEach(function(zp) {
        return i(Q, zp);
      }), mt && ui(Q, it), De;
    }
    function On(Q, H, ee, Se) {
      if (typeof ee == "object" && ee !== null && ee.type === d && ee.key === null && (ee = ee.props.children), typeof ee == "object" && ee !== null) {
        switch (ee.$$typeof) {
          case l:
            e: {
              for (var De = ee.key, qe = H; qe !== null; ) {
                if (qe.key === De) {
                  if (De = ee.type, De === d) {
                    if (qe.tag === 7) {
                      h(Q, qe.sibling), H = y(qe, ee.props.children), H.return = Q, Q = H;
                      break e;
                    }
                  } else if (qe.elementType === De || typeof De == "object" && De !== null && De.$$typeof === T && _c(De) === qe.type) {
                    h(Q, qe.sibling), H = y(qe, ee.props), H.ref = Io(Q, qe, ee), H.return = Q, Q = H;
                    break e;
                  }
                  h(Q, qe);
                  break;
                } else
                  i(Q, qe);
                qe = qe.sibling;
              }
              ee.type === d ? (H = vi(ee.props.children, Q.mode, Se, ee.key), H.return = Q, Q = H) : (Se = ca(ee.type, ee.key, ee.props, null, Q.mode, Se), Se.ref = Io(Q, H, ee), Se.return = Q, Q = Se);
            }
            return D(Q);
          case f:
            e: {
              for (qe = ee.key; H !== null; ) {
                if (H.key === qe)
                  if (H.tag === 4 && H.stateNode.containerInfo === ee.containerInfo && H.stateNode.implementation === ee.implementation) {
                    h(Q, H.sibling), H = y(H, ee.children || []), H.return = Q, Q = H;
                    break e;
                  } else {
                    h(Q, H);
                    break;
                  }
                else
                  i(Q, H);
                H = H.sibling;
              }
              H = Hl(ee, Q.mode, Se), H.return = Q, Q = H;
            }
            return D(Q);
          case T:
            return qe = ee._init, On(Q, H, qe(ee._payload), Se);
        }
        if (J(ee))
          return Ie(Q, H, ee, Se);
        if (M(ee))
          return $t(Q, H, ee, Se);
        Us(Q, ee);
      }
      return typeof ee == "string" && ee !== "" || typeof ee == "number" ? (ee = "" + ee, H !== null && H.tag === 6 ? (h(Q, H.sibling), H = y(H, ee), H.return = Q, Q = H) : (h(Q, H), H = Gl(ee, Q.mode, Se), H.return = Q, Q = H), D(Q)) : h(Q, H);
    }
    return On;
  }
  var zi = Tc(!0), Ec = Tc(!1), Oo = {}, Un = gn(Oo), No = gn(Oo), ji = gn(Oo);
  function cr(t) {
    if (t === Oo)
      throw Error(o(174));
    return t;
  }
  function sl(t, i) {
    ut(ji, i), ut(No, t), ut(Un, Oo), t = ce(i), lt(Un), ut(Un, t);
  }
  function Gi() {
    lt(Un), lt(No), lt(ji);
  }
  function Ac(t) {
    var i = cr(ji.current), h = cr(Un.current);
    i = K(h, t.type, i), h !== i && (ut(No, t), ut(Un, i));
  }
  function al(t) {
    No.current === t && (lt(Un), lt(No));
  }
  var yt = gn(0);
  function Ds(t) {
    for (var i = t; i !== null; ) {
      if (i.tag === 13) {
        var h = i.memoizedState;
        if (h !== null && (h = h.dehydrated, h === null || Kn(h) || mn(h)))
          return i;
      } else if (i.tag === 19 && i.memoizedProps.revealOrder !== void 0) {
        if (i.flags & 128)
          return i;
      } else if (i.child !== null) {
        i.child.return = i, i = i.child;
        continue;
      }
      if (i === t)
        break;
      for (; i.sibling === null; ) {
        if (i.return === null || i.return === t)
          return null;
        i = i.return;
      }
      i.sibling.return = i.return, i = i.sibling;
    }
    return null;
  }
  var ll = [];
  function ul() {
    for (var t = 0; t < ll.length; t++) {
      var i = ll[t];
      pe ? i._workInProgressVersionPrimary = null : i._workInProgressVersionSecondary = null;
    }
    ll.length = 0;
  }
  var Fs = u.ReactCurrentDispatcher, Dn = u.ReactCurrentBatchConfig, Hi = 0, St = null, qt = null, zt = null, Is = !1, Bo = !1, zo = 0, fp = 0;
  function Zt() {
    throw Error(o(321));
  }
  function cl(t, i) {
    if (i === null)
      return !1;
    for (var h = 0; h < i.length && h < t.length; h++)
      if (!_n(t[h], i[h]))
        return !1;
    return !0;
  }
  function fl(t, i, h, m, y, w) {
    if (Hi = w, St = i, i.memoizedState = null, i.updateQueue = null, i.lanes = 0, Fs.current = t === null || t.memoizedState === null ? mp : vp, t = h(m, y), Bo) {
      w = 0;
      do {
        if (Bo = !1, zo = 0, 25 <= w)
          throw Error(o(301));
        w += 1, zt = qt = null, i.updateQueue = null, Fs.current = gp, t = h(m, y);
      } while (Bo);
    }
    if (Fs.current = js, i = qt !== null && qt.next !== null, Hi = 0, zt = qt = St = null, Is = !1, i)
      throw Error(o(300));
    return t;
  }
  function dl() {
    var t = zo !== 0;
    return zo = 0, t;
  }
  function Mr() {
    var t = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return zt === null ? St.memoizedState = zt = t : zt = zt.next = t, zt;
  }
  function fr() {
    if (qt === null) {
      var t = St.alternate;
      t = t !== null ? t.memoizedState : null;
    } else
      t = qt.next;
    var i = zt === null ? St.memoizedState : zt.next;
    if (i !== null)
      zt = i, qt = t;
    else {
      if (t === null)
        throw Error(o(310));
      qt = t, t = { memoizedState: qt.memoizedState, baseState: qt.baseState, baseQueue: qt.baseQueue, queue: qt.queue, next: null }, zt === null ? St.memoizedState = zt = t : zt = zt.next = t;
    }
    return zt;
  }
  function ci(t, i) {
    return typeof i == "function" ? i(t) : i;
  }
  function Os(t) {
    var i = fr(), h = i.queue;
    if (h === null)
      throw Error(o(311));
    h.lastRenderedReducer = t;
    var m = qt, y = m.baseQueue, w = h.pending;
    if (w !== null) {
      if (y !== null) {
        var D = y.next;
        y.next = w.next, w.next = D;
      }
      m.baseQueue = y = w, h.pending = null;
    }
    if (y !== null) {
      w = y.next, m = m.baseState;
      var z = D = null, ne = null, he = w;
      do {
        var Ce = he.lane;
        if ((Hi & Ce) === Ce)
          ne !== null && (ne = ne.next = { lane: 0, action: he.action, hasEagerState: he.hasEagerState, eagerState: he.eagerState, next: null }), m = he.hasEagerState ? he.eagerState : t(m, he.action);
        else {
          var He = {
            lane: Ce,
            action: he.action,
            hasEagerState: he.hasEagerState,
            eagerState: he.eagerState,
            next: null
          };
          ne === null ? (z = ne = He, D = m) : ne = ne.next = He, St.lanes |= Ce, Wi |= Ce;
        }
        he = he.next;
      } while (he !== null && he !== w);
      ne === null ? D = m : ne.next = z, _n(m, i.memoizedState) || (Cn = !0), i.memoizedState = m, i.baseState = D, i.baseQueue = ne, h.lastRenderedState = m;
    }
    if (t = h.interleaved, t !== null) {
      y = t;
      do
        w = y.lane, St.lanes |= w, Wi |= w, y = y.next;
      while (y !== t);
    } else
      y === null && (h.lanes = 0);
    return [i.memoizedState, h.dispatch];
  }
  function Ns(t) {
    var i = fr(), h = i.queue;
    if (h === null)
      throw Error(o(311));
    h.lastRenderedReducer = t;
    var m = h.dispatch, y = h.pending, w = i.memoizedState;
    if (y !== null) {
      h.pending = null;
      var D = y = y.next;
      do
        w = t(w, D.action), D = D.next;
      while (D !== y);
      _n(w, i.memoizedState) || (Cn = !0), i.memoizedState = w, i.baseQueue === null && (i.baseState = w), h.lastRenderedState = w;
    }
    return [w, m];
  }
  function Cc() {
  }
  function Pc(t, i) {
    var h = St, m = fr(), y = i(), w = !_n(m.memoizedState, y);
    if (w && (m.memoizedState = y, Cn = !0), m = m.queue, Go(Lc.bind(null, h, m, t), [t]), m.getSnapshot !== i || w || zt !== null && zt.memoizedState.tag & 1) {
      if (h.flags |= 2048, jo(9, bc.bind(null, h, m, y, i), void 0, null), bt === null)
        throw Error(o(349));
      Hi & 30 || Mc(h, i, y);
    }
    return y;
  }
  function Mc(t, i, h) {
    t.flags |= 16384, t = { getSnapshot: i, value: h }, i = St.updateQueue, i === null ? (i = { lastEffect: null, stores: null }, St.updateQueue = i, i.stores = [t]) : (h = i.stores, h === null ? i.stores = [t] : h.push(t));
  }
  function bc(t, i, h, m) {
    i.value = h, i.getSnapshot = m, Rc(i) && Fn(t, 1, -1);
  }
  function Lc(t, i, h) {
    return h(function() {
      Rc(i) && Fn(t, 1, -1);
    });
  }
  function Rc(t) {
    var i = t.getSnapshot;
    t = t.value;
    try {
      var h = i();
      return !_n(t, h);
    } catch {
      return !0;
    }
  }
  function hl(t) {
    var i = Mr();
    return typeof t == "function" && (t = t()), i.memoizedState = i.baseState = t, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: ci, lastRenderedState: t }, i.queue = t, t = t.dispatch = pp.bind(null, St, t), [i.memoizedState, t];
  }
  function jo(t, i, h, m) {
    return t = { tag: t, create: i, destroy: h, deps: m, next: null }, i = St.updateQueue, i === null ? (i = { lastEffect: null, stores: null }, St.updateQueue = i, i.lastEffect = t.next = t) : (h = i.lastEffect, h === null ? i.lastEffect = t.next = t : (m = h.next, h.next = t, t.next = m, i.lastEffect = t)), t;
  }
  function kc() {
    return fr().memoizedState;
  }
  function Bs(t, i, h, m) {
    var y = Mr();
    St.flags |= t, y.memoizedState = jo(1 | i, h, void 0, m === void 0 ? null : m);
  }
  function zs(t, i, h, m) {
    var y = fr();
    m = m === void 0 ? null : m;
    var w = void 0;
    if (qt !== null) {
      var D = qt.memoizedState;
      if (w = D.destroy, m !== null && cl(m, D.deps)) {
        y.memoizedState = jo(i, h, w, m);
        return;
      }
    }
    St.flags |= t, y.memoizedState = jo(1 | i, h, w, m);
  }
  function pl(t, i) {
    return Bs(8390656, 8, t, i);
  }
  function Go(t, i) {
    return zs(2048, 8, t, i);
  }
  function Uc(t, i) {
    return zs(4, 2, t, i);
  }
  function Dc(t, i) {
    return zs(4, 4, t, i);
  }
  function Fc(t, i) {
    if (typeof i == "function")
      return t = t(), i(t), function() {
        i(null);
      };
    if (i != null)
      return t = t(), i.current = t, function() {
        i.current = null;
      };
  }
  function Ic(t, i, h) {
    return h = h != null ? h.concat([t]) : null, zs(4, 4, Fc.bind(null, i, t), h);
  }
  function ml() {
  }
  function Oc(t, i) {
    var h = fr();
    i = i === void 0 ? null : i;
    var m = h.memoizedState;
    return m !== null && i !== null && cl(i, m[1]) ? m[0] : (h.memoizedState = [t, i], t);
  }
  function Nc(t, i) {
    var h = fr();
    i = i === void 0 ? null : i;
    var m = h.memoizedState;
    return m !== null && i !== null && cl(i, m[1]) ? m[0] : (t = t(), h.memoizedState = [t, i], t);
  }
  function dp(t, i) {
    var h = Je;
    Je = h !== 0 && 4 > h ? h : 4, t(!0);
    var m = Dn.transition;
    Dn.transition = {};
    try {
      t(!1), i();
    } finally {
      Je = h, Dn.transition = m;
    }
  }
  function Bc() {
    return fr().memoizedState;
  }
  function hp(t, i, h) {
    var m = Gr(t);
    h = { lane: m, action: h, hasEagerState: !1, eagerState: null, next: null }, zc(t) ? jc(i, h) : (Gc(t, i, h), h = sn(), t = Fn(t, m, h), t !== null && Hc(t, i, m));
  }
  function pp(t, i, h) {
    var m = Gr(t), y = { lane: m, action: h, hasEagerState: !1, eagerState: null, next: null };
    if (zc(t))
      jc(i, y);
    else {
      Gc(t, i, y);
      var w = t.alternate;
      if (t.lanes === 0 && (w === null || w.lanes === 0) && (w = i.lastRenderedReducer, w !== null))
        try {
          var D = i.lastRenderedState, z = w(D, h);
          if (y.hasEagerState = !0, y.eagerState = z, _n(z, D))
            return;
        } catch {
        } finally {
        }
      h = sn(), t = Fn(t, m, h), t !== null && Hc(t, i, m);
    }
  }
  function zc(t) {
    var i = t.alternate;
    return t === St || i !== null && i === St;
  }
  function jc(t, i) {
    Bo = Is = !0;
    var h = t.pending;
    h === null ? i.next = i : (i.next = h.next, h.next = i), t.pending = i;
  }
  function Gc(t, i, h) {
    bt !== null && t.mode & 1 && !(Ze & 2) ? (t = i.interleaved, t === null ? (h.next = h, Tn === null ? Tn = [i] : Tn.push(i)) : (h.next = t.next, t.next = h), i.interleaved = h) : (t = i.pending, t === null ? h.next = h : (h.next = t.next, t.next = h), i.pending = h);
  }
  function Hc(t, i, h) {
    if (h & 4194240) {
      var m = i.lanes;
      m &= t.pendingLanes, h |= m, i.lanes = h, lr(t, h);
    }
  }
  var js = { readContext: Ct, useCallback: Zt, useContext: Zt, useEffect: Zt, useImperativeHandle: Zt, useInsertionEffect: Zt, useLayoutEffect: Zt, useMemo: Zt, useReducer: Zt, useRef: Zt, useState: Zt, useDebugValue: Zt, useDeferredValue: Zt, useTransition: Zt, useMutableSource: Zt, useSyncExternalStore: Zt, useId: Zt, unstable_isNewReconciler: !1 }, mp = { readContext: Ct, useCallback: function(t, i) {
    return Mr().memoizedState = [t, i === void 0 ? null : i], t;
  }, useContext: Ct, useEffect: pl, useImperativeHandle: function(t, i, h) {
    return h = h != null ? h.concat([t]) : null, Bs(
      4194308,
      4,
      Fc.bind(null, i, t),
      h
    );
  }, useLayoutEffect: function(t, i) {
    return Bs(4194308, 4, t, i);
  }, useInsertionEffect: function(t, i) {
    return Bs(4, 2, t, i);
  }, useMemo: function(t, i) {
    var h = Mr();
    return i = i === void 0 ? null : i, t = t(), h.memoizedState = [t, i], t;
  }, useReducer: function(t, i, h) {
    var m = Mr();
    return i = h !== void 0 ? h(i) : i, m.memoizedState = m.baseState = i, t = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: t, lastRenderedState: i }, m.queue = t, t = t.dispatch = hp.bind(null, St, t), [m.memoizedState, t];
  }, useRef: function(t) {
    var i = Mr();
    return t = { current: t }, i.memoizedState = t;
  }, useState: hl, useDebugValue: ml, useDeferredValue: function(t) {
    var i = hl(t), h = i[0], m = i[1];
    return pl(function() {
      var y = Dn.transition;
      Dn.transition = {};
      try {
        m(t);
      } finally {
        Dn.transition = y;
      }
    }, [t]), h;
  }, useTransition: function() {
    var t = hl(!1), i = t[0];
    return t = dp.bind(null, t[1]), Mr().memoizedState = t, [i, t];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(t, i, h) {
    var m = St, y = Mr();
    if (mt) {
      if (h === void 0)
        throw Error(o(407));
      h = h();
    } else {
      if (h = i(), bt === null)
        throw Error(o(349));
      Hi & 30 || Mc(m, i, h);
    }
    y.memoizedState = h;
    var w = { value: h, getSnapshot: i };
    return y.queue = w, pl(Lc.bind(null, m, w, t), [t]), m.flags |= 2048, jo(9, bc.bind(null, m, w, h, i), void 0, null), h;
  }, useId: function() {
    var t = Mr(), i = bt.identifierPrefix;
    if (mt) {
      var h = Pr, m = Cr;
      h = (m & ~(1 << 32 - Sn(m) - 1)).toString(32) + h, i = ":" + i + "R" + h, h = zo++, 0 < h && (i += "H" + h.toString(32)), i += ":";
    } else
      h = fp++, i = ":" + i + "r" + h.toString(32) + ":";
    return t.memoizedState = i;
  }, unstable_isNewReconciler: !1 }, vp = {
    readContext: Ct,
    useCallback: Oc,
    useContext: Ct,
    useEffect: Go,
    useImperativeHandle: Ic,
    useInsertionEffect: Uc,
    useLayoutEffect: Dc,
    useMemo: Nc,
    useReducer: Os,
    useRef: kc,
    useState: function() {
      return Os(ci);
    },
    useDebugValue: ml,
    useDeferredValue: function(t) {
      var i = Os(ci), h = i[0], m = i[1];
      return Go(function() {
        var y = Dn.transition;
        Dn.transition = {};
        try {
          m(t);
        } finally {
          Dn.transition = y;
        }
      }, [t]), h;
    },
    useTransition: function() {
      var t = Os(ci)[0], i = fr().memoizedState;
      return [t, i];
    },
    useMutableSource: Cc,
    useSyncExternalStore: Pc,
    useId: Bc,
    unstable_isNewReconciler: !1
  }, gp = {
    readContext: Ct,
    useCallback: Oc,
    useContext: Ct,
    useEffect: Go,
    useImperativeHandle: Ic,
    useInsertionEffect: Uc,
    useLayoutEffect: Dc,
    useMemo: Nc,
    useReducer: Ns,
    useRef: kc,
    useState: function() {
      return Ns(ci);
    },
    useDebugValue: ml,
    useDeferredValue: function(t) {
      var i = Ns(ci), h = i[0], m = i[1];
      return Go(function() {
        var y = Dn.transition;
        Dn.transition = {};
        try {
          m(t);
        } finally {
          Dn.transition = y;
        }
      }, [t]), h;
    },
    useTransition: function() {
      var t = Ns(ci)[0], i = fr().memoizedState;
      return [t, i];
    },
    useMutableSource: Cc,
    useSyncExternalStore: Pc,
    useId: Bc,
    unstable_isNewReconciler: !1
  };
  function vl(t, i) {
    try {
      var h = "", m = i;
      do
        h += ai(m), m = m.return;
      while (m);
      var y = h;
    } catch (w) {
      y = `
Error generating stack: ` + w.message + `
` + w.stack;
    }
    return { value: t, source: i, stack: y };
  }
  function gl(t, i) {
    try {
      console.error(i.value);
    } catch (h) {
      setTimeout(function() {
        throw h;
      });
    }
  }
  var yp = typeof WeakMap == "function" ? WeakMap : Map;
  function Vc(t, i, h) {
    h = Ar(-1, h), h.tag = 3, h.payload = { element: null };
    var m = i.value;
    return h.callback = function() {
      ra || (ra = !0, Fl = m), gl(t, i);
    }, h;
  }
  function Wc(t, i, h) {
    h = Ar(-1, h), h.tag = 3;
    var m = t.type.getDerivedStateFromError;
    if (typeof m == "function") {
      var y = i.value;
      h.payload = function() {
        return m(y);
      }, h.callback = function() {
        gl(t, i);
      };
    }
    var w = t.stateNode;
    return w !== null && typeof w.componentDidCatch == "function" && (h.callback = function() {
      gl(t, i), typeof m != "function" && (zr === null ? zr = /* @__PURE__ */ new Set([this]) : zr.add(this));
      var D = i.stack;
      this.componentDidCatch(i.value, { componentStack: D !== null ? D : "" });
    }), h;
  }
  function Xc(t, i, h) {
    var m = t.pingCache;
    if (m === null) {
      m = t.pingCache = new yp();
      var y = /* @__PURE__ */ new Set();
      m.set(i, y);
    } else
      y = m.get(i), y === void 0 && (y = /* @__PURE__ */ new Set(), m.set(i, y));
    y.has(h) || (y.add(h), t = kp.bind(null, t, i, h), i.then(t, t));
  }
  function Kc(t) {
    do {
      var i;
      if ((i = t.tag === 13) && (i = t.memoizedState, i = i !== null ? i.dehydrated !== null : !0), i)
        return t;
      t = t.return;
    } while (t !== null);
    return null;
  }
  function Yc(t, i, h, m, y) {
    return t.mode & 1 ? (t.flags |= 65536, t.lanes = y, t) : (t === i ? t.flags |= 65536 : (t.flags |= 128, h.flags |= 131072, h.flags &= -52805, h.tag === 1 && (h.alternate === null ? h.tag = 17 : (i = Ar(-1, 1), i.tag = 2, Br(h, i))), h.lanes |= 1), t);
  }
  function dr(t) {
    t.flags |= 4;
  }
  function Qc(t, i) {
    if (t !== null && t.child === i.child)
      return !0;
    if (i.flags & 16)
      return !1;
    for (t = i.child; t !== null; ) {
      if (t.flags & 12854 || t.subtreeFlags & 12854)
        return !1;
      t = t.sibling;
    }
    return !0;
  }
  var Ho, Vo, Gs, Hs;
  if (ae)
    Ho = function(t, i) {
      for (var h = i.child; h !== null; ) {
        if (h.tag === 5 || h.tag === 6)
          j(t, h.stateNode);
        else if (h.tag !== 4 && h.child !== null) {
          h.child.return = h, h = h.child;
          continue;
        }
        if (h === i)
          break;
        for (; h.sibling === null; ) {
          if (h.return === null || h.return === i)
            return;
          h = h.return;
        }
        h.sibling.return = h.return, h = h.sibling;
      }
    }, Vo = function() {
    }, Gs = function(t, i, h, m, y) {
      if (t = t.memoizedProps, t !== m) {
        var w = i.stateNode, D = cr(Un.current);
        h = $(w, h, t, m, y, D), (i.updateQueue = h) && dr(i);
      }
    }, Hs = function(t, i, h, m) {
      h !== m && dr(i);
    };
  else if (ie) {
    Ho = function(t, i, h, m) {
      for (var y = i.child; y !== null; ) {
        if (y.tag === 5) {
          var w = y.stateNode;
          h && m && (w = rt(w, y.type, y.memoizedProps, y)), j(t, w);
        } else if (y.tag === 6)
          w = y.stateNode, h && m && (w = pt(w, y.memoizedProps, y)), j(t, w);
        else if (y.tag !== 4) {
          if (y.tag === 22 && y.memoizedState !== null)
            w = y.child, w !== null && (w.return = y), Ho(t, y, !0, !0);
          else if (y.child !== null) {
            y.child.return = y, y = y.child;
            continue;
          }
        }
        if (y === i)
          break;
        for (; y.sibling === null; ) {
          if (y.return === null || y.return === i)
            return;
          y = y.return;
        }
        y.sibling.return = y.return, y = y.sibling;
      }
    };
    var qc = function(t, i, h, m) {
      for (var y = i.child; y !== null; ) {
        if (y.tag === 5) {
          var w = y.stateNode;
          h && m && (w = rt(w, y.type, y.memoizedProps, y)), nt(t, w);
        } else if (y.tag === 6)
          w = y.stateNode, h && m && (w = pt(w, y.memoizedProps, y)), nt(t, w);
        else if (y.tag !== 4) {
          if (y.tag === 22 && y.memoizedState !== null)
            w = y.child, w !== null && (w.return = y), qc(t, y, !0, !0);
          else if (y.child !== null) {
            y.child.return = y, y = y.child;
            continue;
          }
        }
        if (y === i)
          break;
        for (; y.sibling === null; ) {
          if (y.return === null || y.return === i)
            return;
          y = y.return;
        }
        y.sibling.return = y.return, y = y.sibling;
      }
    };
    Vo = function(t, i) {
      var h = i.stateNode;
      if (!Qc(t, i)) {
        t = h.containerInfo;
        var m = Xe(t);
        qc(m, i, !1, !1), h.pendingChildren = m, dr(i), et(t, m);
      }
    }, Gs = function(t, i, h, m, y) {
      var w = t.stateNode, D = t.memoizedProps;
      if ((t = Qc(t, i)) && D === m)
        i.stateNode = w;
      else {
        var z = i.stateNode, ne = cr(Un.current), he = null;
        D !== m && (he = $(z, h, D, m, y, ne)), t && he === null ? i.stateNode = w : (w = at(w, he, h, D, m, i, t, z), W(w, h, m, y, ne) && dr(i), i.stateNode = w, t ? dr(i) : Ho(w, i, !1, !1));
      }
    }, Hs = function(t, i, h, m) {
      h !== m ? (t = cr(ji.current), h = cr(Un.current), i.stateNode = se(m, t, h, i), dr(i)) : i.stateNode = t.stateNode;
    };
  } else
    Vo = function() {
    }, Gs = function() {
    }, Hs = function() {
    };
  function Wo(t, i) {
    if (!mt)
      switch (t.tailMode) {
        case "hidden":
          i = t.tail;
          for (var h = null; i !== null; )
            i.alternate !== null && (h = i), i = i.sibling;
          h === null ? t.tail = null : h.sibling = null;
          break;
        case "collapsed":
          h = t.tail;
          for (var m = null; h !== null; )
            h.alternate !== null && (m = h), h = h.sibling;
          m === null ? i || t.tail === null ? t.tail = null : t.tail.sibling = null : m.sibling = null;
      }
  }
  function Jt(t) {
    var i = t.alternate !== null && t.alternate.child === t.child, h = 0, m = 0;
    if (i)
      for (var y = t.child; y !== null; )
        h |= y.lanes | y.childLanes, m |= y.subtreeFlags & 14680064, m |= y.flags & 14680064, y.return = t, y = y.sibling;
    else
      for (y = t.child; y !== null; )
        h |= y.lanes | y.childLanes, m |= y.subtreeFlags, m |= y.flags, y.return = t, y = y.sibling;
    return t.subtreeFlags |= m, t.childLanes = h, i;
  }
  function xp(t, i, h) {
    var m = i.pendingProps;
    switch (nl(i), i.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return Jt(i), null;
      case 1:
        return Ot(i.type) && qn(), Jt(i), null;
      case 3:
        return m = i.stateNode, Gi(), lt(It), lt(Ut), ul(), m.pendingContext && (m.context = m.pendingContext, m.pendingContext = null), (t === null || t.child === null) && (Fo(i) ? dr(i) : t === null || t.memoizedState.isDehydrated && !(i.flags & 256) || (i.flags |= 1024, Jn !== null && (Nl(Jn), Jn = null))), Vo(t, i), Jt(i), null;
      case 5:
        al(i), h = cr(ji.current);
        var y = i.type;
        if (t !== null && i.stateNode != null)
          Gs(t, i, y, m, h), t.ref !== i.ref && (i.flags |= 512, i.flags |= 2097152);
        else {
          if (!m) {
            if (i.stateNode === null)
              throw Error(o(166));
            return Jt(i), null;
          }
          if (t = cr(Un.current), Fo(i)) {
            if (!fe)
              throw Error(o(175));
            t = xs(i.stateNode, i.type, i.memoizedProps, h, t, i, !Do), i.updateQueue = t, t !== null && dr(i);
          } else {
            var w = F(y, m, h, t, i);
            Ho(w, i, !1, !1), i.stateNode = w, W(w, y, m, h, t) && dr(i);
          }
          i.ref !== null && (i.flags |= 512, i.flags |= 2097152);
        }
        return Jt(i), null;
      case 6:
        if (t && i.stateNode != null)
          Hs(t, i, t.memoizedProps, m);
        else {
          if (typeof m != "string" && i.stateNode === null)
            throw Error(o(166));
          if (t = cr(ji.current), h = cr(Un.current), Fo(i)) {
            if (!fe)
              throw Error(o(176));
            if (t = i.stateNode, m = i.memoizedProps, (h = _o(t, m, i, !Do)) && (y = En, y !== null))
              switch (w = (y.mode & 1) !== 0, y.tag) {
                case 3:
                  Eo(y.stateNode.containerInfo, t, m, w);
                  break;
                case 5:
                  Ao(y.type, y.memoizedProps, y.stateNode, t, m, w);
              }
            h && dr(i);
          } else
            i.stateNode = se(m, t, h, i);
        }
        return Jt(i), null;
      case 13:
        if (lt(yt), m = i.memoizedState, mt && An !== null && i.mode & 1 && !(i.flags & 128)) {
          for (t = An; t; )
            t = vn(t);
          return Bi(), i.flags |= 98560, i;
        }
        if (m !== null && m.dehydrated !== null) {
          if (m = Fo(i), t === null) {
            if (!m)
              throw Error(o(318));
            if (!fe)
              throw Error(o(344));
            if (t = i.memoizedState, t = t !== null ? t.dehydrated : null, !t)
              throw Error(o(317));
            qa(t, i);
          } else
            Bi(), !(i.flags & 128) && (i.memoizedState = null), i.flags |= 4;
          return Jt(i), null;
        }
        return Jn !== null && (Nl(Jn), Jn = null), i.flags & 128 ? (i.lanes = h, i) : (m = m !== null, h = !1, t === null ? Fo(i) : h = t.memoizedState !== null, m && !h && (i.child.flags |= 8192, i.mode & 1 && (t === null || yt.current & 1 ? Dt === 0 && (Dt = 3) : zl())), i.updateQueue !== null && (i.flags |= 4), Jt(i), null);
      case 4:
        return Gi(), Vo(t, i), t === null && me(i.stateNode.containerInfo), Jt(i), null;
      case 10:
        return Bt(i.type._context), Jt(i), null;
      case 17:
        return Ot(i.type) && qn(), Jt(i), null;
      case 19:
        if (lt(yt), y = i.memoizedState, y === null)
          return Jt(i), null;
        if (m = (i.flags & 128) !== 0, w = y.rendering, w === null)
          if (m)
            Wo(y, !1);
          else {
            if (Dt !== 0 || t !== null && t.flags & 128)
              for (t = i.child; t !== null; ) {
                if (w = Ds(t), w !== null) {
                  for (i.flags |= 128, Wo(y, !1), t = w.updateQueue, t !== null && (i.updateQueue = t, i.flags |= 4), i.subtreeFlags = 0, t = h, m = i.child; m !== null; )
                    h = m, y = t, h.flags &= 14680066, w = h.alternate, w === null ? (h.childLanes = 0, h.lanes = y, h.child = null, h.subtreeFlags = 0, h.memoizedProps = null, h.memoizedState = null, h.updateQueue = null, h.dependencies = null, h.stateNode = null) : (h.childLanes = w.childLanes, h.lanes = w.lanes, h.child = w.child, h.subtreeFlags = 0, h.deletions = null, h.memoizedProps = w.memoizedProps, h.memoizedState = w.memoizedState, h.updateQueue = w.updateQueue, h.type = w.type, y = w.dependencies, h.dependencies = y === null ? null : { lanes: y.lanes, firstContext: y.firstContext }), m = m.sibling;
                  return ut(yt, yt.current & 1 | 2), i.child;
                }
                t = t.sibling;
              }
            y.tail !== null && gt() > Dl && (i.flags |= 128, m = !0, Wo(y, !1), i.lanes = 4194304);
          }
        else {
          if (!m)
            if (t = Ds(w), t !== null) {
              if (i.flags |= 128, m = !0, t = t.updateQueue, t !== null && (i.updateQueue = t, i.flags |= 4), Wo(y, !0), y.tail === null && y.tailMode === "hidden" && !w.alternate && !mt)
                return Jt(i), null;
            } else
              2 * gt() - y.renderingStartTime > Dl && h !== 1073741824 && (i.flags |= 128, m = !0, Wo(y, !1), i.lanes = 4194304);
          y.isBackwards ? (w.sibling = i.child, i.child = w) : (t = y.last, t !== null ? t.sibling = w : i.child = w, y.last = w);
        }
        return y.tail !== null ? (i = y.tail, y.rendering = i, y.tail = i.sibling, y.renderingStartTime = gt(), i.sibling = null, t = yt.current, ut(yt, m ? t & 1 | 2 : t & 1), i) : (Jt(i), null);
      case 22:
      case 23:
        return Bl(), m = i.memoizedState !== null, t !== null && t.memoizedState !== null !== m && (i.flags |= 8192), m && i.mode & 1 ? Pn & 1073741824 && (Jt(i), ae && i.subtreeFlags & 6 && (i.flags |= 8192)) : Jt(i), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(o(156, i.tag));
  }
  var Sp = u.ReactCurrentOwner, Cn = !1;
  function on(t, i, h, m) {
    i.child = t === null ? Ec(i, null, h, m) : zi(i, t.child, h, m);
  }
  function Zc(t, i, h, m, y) {
    h = h.render;
    var w = i.ref;
    return At(i, y), m = fl(t, i, h, m, w, y), h = dl(), t !== null && !Cn ? (i.updateQueue = t.updateQueue, i.flags &= -2053, t.lanes &= ~y, br(t, i, y)) : (mt && h && tl(i), i.flags |= 1, on(t, i, m, y), i.child);
  }
  function Jc(t, i, h, m, y) {
    if (t === null) {
      var w = h.type;
      return typeof w == "function" && !jl(w) && w.defaultProps === void 0 && h.compare === null && h.defaultProps === void 0 ? (i.tag = 15, i.type = w, $c(t, i, w, m, y)) : (t = ca(h.type, null, m, i, i.mode, y), t.ref = i.ref, t.return = i, i.child = t);
    }
    if (w = t.child, !(t.lanes & y)) {
      var D = w.memoizedProps;
      if (h = h.compare, h = h !== null ? h : si, h(D, m) && t.ref === i.ref)
        return br(t, i, y);
    }
    return i.flags |= 1, t = Vr(w, m), t.ref = i.ref, t.return = i, i.child = t;
  }
  function $c(t, i, h, m, y) {
    if (t !== null && si(t.memoizedProps, m) && t.ref === i.ref)
      if (Cn = !1, (t.lanes & y) !== 0)
        t.flags & 131072 && (Cn = !0);
      else
        return i.lanes = t.lanes, br(t, i, y);
    return yl(t, i, h, m, y);
  }
  function ef(t, i, h) {
    var m = i.pendingProps, y = m.children, w = t !== null ? t.memoizedState : null;
    if (m.mode === "hidden")
      if (!(i.mode & 1))
        i.memoizedState = { baseLanes: 0, cachePool: null }, ut(Vi, Pn), Pn |= h;
      else if (h & 1073741824)
        i.memoizedState = { baseLanes: 0, cachePool: null }, m = w !== null ? w.baseLanes : h, ut(Vi, Pn), Pn |= m;
      else
        return t = w !== null ? w.baseLanes | h : h, i.lanes = i.childLanes = 1073741824, i.memoizedState = { baseLanes: t, cachePool: null }, i.updateQueue = null, ut(Vi, Pn), Pn |= t, null;
    else
      w !== null ? (m = w.baseLanes | h, i.memoizedState = null) : m = h, ut(Vi, Pn), Pn |= m;
    return on(t, i, y, h), i.child;
  }
  function tf(t, i) {
    var h = i.ref;
    (t === null && h !== null || t !== null && t.ref !== h) && (i.flags |= 512, i.flags |= 2097152);
  }
  function yl(t, i, h, m, y) {
    var w = Ot(h) ? sr : Ut.current;
    return w = bn(i, w), At(i, y), h = fl(t, i, h, m, w, y), m = dl(), t !== null && !Cn ? (i.updateQueue = t.updateQueue, i.flags &= -2053, t.lanes &= ~y, br(t, i, y)) : (mt && m && tl(i), i.flags |= 1, on(t, i, h, y), i.child);
  }
  function nf(t, i, h, m, y) {
    if (Ot(h)) {
      var w = !0;
      Fr(i);
    } else
      w = !1;
    if (At(i, y), i.stateNode === null)
      t !== null && (t.alternate = null, i.alternate = null, i.flags |= 2), vc(i, h, m), el(i, h, m, y), m = !0;
    else if (t === null) {
      var D = i.stateNode, z = i.memoizedProps;
      D.props = z;
      var ne = D.context, he = h.contextType;
      typeof he == "object" && he !== null ? he = Ct(he) : (he = Ot(h) ? sr : Ut.current, he = bn(i, he));
      var Ce = h.getDerivedStateFromProps, He = typeof Ce == "function" || typeof D.getSnapshotBeforeUpdate == "function";
      He || typeof D.UNSAFE_componentWillReceiveProps != "function" && typeof D.componentWillReceiveProps != "function" || (z !== m || ne !== he) && gc(i, D, m, he), Nr = !1;
      var Ne = i.memoizedState;
      D.state = Ne, bs(i, m, D, y), ne = i.memoizedState, z !== m || Ne !== ne || It.current || Nr ? (typeof Ce == "function" && ($a(i, h, Ce, m), ne = i.memoizedState), (z = Nr || mc(i, h, z, m, Ne, ne, he)) ? (He || typeof D.UNSAFE_componentWillMount != "function" && typeof D.componentWillMount != "function" || (typeof D.componentWillMount == "function" && D.componentWillMount(), typeof D.UNSAFE_componentWillMount == "function" && D.UNSAFE_componentWillMount()), typeof D.componentDidMount == "function" && (i.flags |= 4194308)) : (typeof D.componentDidMount == "function" && (i.flags |= 4194308), i.memoizedProps = m, i.memoizedState = ne), D.props = m, D.state = ne, D.context = he, m = z) : (typeof D.componentDidMount == "function" && (i.flags |= 4194308), m = !1);
    } else {
      D = i.stateNode, fc(t, i), z = i.memoizedProps, he = i.type === i.elementType ? z : nn(i.type, z), D.props = he, He = i.pendingProps, Ne = D.context, ne = h.contextType, typeof ne == "object" && ne !== null ? ne = Ct(ne) : (ne = Ot(h) ? sr : Ut.current, ne = bn(i, ne));
      var ft = h.getDerivedStateFromProps;
      (Ce = typeof ft == "function" || typeof D.getSnapshotBeforeUpdate == "function") || typeof D.UNSAFE_componentWillReceiveProps != "function" && typeof D.componentWillReceiveProps != "function" || (z !== He || Ne !== ne) && gc(i, D, m, ne), Nr = !1, Ne = i.memoizedState, D.state = Ne, bs(i, m, D, y);
      var Ie = i.memoizedState;
      z !== He || Ne !== Ie || It.current || Nr ? (typeof ft == "function" && ($a(i, h, ft, m), Ie = i.memoizedState), (he = Nr || mc(i, h, he, m, Ne, Ie, ne) || !1) ? (Ce || typeof D.UNSAFE_componentWillUpdate != "function" && typeof D.componentWillUpdate != "function" || (typeof D.componentWillUpdate == "function" && D.componentWillUpdate(
        m,
        Ie,
        ne
      ), typeof D.UNSAFE_componentWillUpdate == "function" && D.UNSAFE_componentWillUpdate(m, Ie, ne)), typeof D.componentDidUpdate == "function" && (i.flags |= 4), typeof D.getSnapshotBeforeUpdate == "function" && (i.flags |= 1024)) : (typeof D.componentDidUpdate != "function" || z === t.memoizedProps && Ne === t.memoizedState || (i.flags |= 4), typeof D.getSnapshotBeforeUpdate != "function" || z === t.memoizedProps && Ne === t.memoizedState || (i.flags |= 1024), i.memoizedProps = m, i.memoizedState = Ie), D.props = m, D.state = Ie, D.context = ne, m = he) : (typeof D.componentDidUpdate != "function" || z === t.memoizedProps && Ne === t.memoizedState || (i.flags |= 4), typeof D.getSnapshotBeforeUpdate != "function" || z === t.memoizedProps && Ne === t.memoizedState || (i.flags |= 1024), m = !1);
    }
    return xl(t, i, h, m, w, y);
  }
  function xl(t, i, h, m, y, w) {
    tf(t, i);
    var D = (i.flags & 128) !== 0;
    if (!m && !D)
      return y && xn(i, h, !1), br(t, i, w);
    m = i.stateNode, Sp.current = i;
    var z = D && typeof h.getDerivedStateFromError != "function" ? null : m.render();
    return i.flags |= 1, t !== null && D ? (i.child = zi(i, t.child, null, w), i.child = zi(i, null, z, w)) : on(t, i, z, w), i.memoizedState = m.state, y && xn(i, h, !0), i.child;
  }
  function rf(t) {
    var i = t.stateNode;
    i.pendingContext ? Li(t, i.pendingContext, i.pendingContext !== i.context) : i.context && Li(t, i.context, !1), sl(t, i.containerInfo);
  }
  function of(t, i, h, m, y) {
    return Bi(), ol(y), i.flags |= 256, on(t, i, h, m), i.child;
  }
  var Vs = { dehydrated: null, treeContext: null, retryLane: 0 };
  function Ws(t) {
    return { baseLanes: t, cachePool: null };
  }
  function sf(t, i, h) {
    var m = i.pendingProps, y = yt.current, w = !1, D = (i.flags & 128) !== 0, z;
    if ((z = D) || (z = t !== null && t.memoizedState === null ? !1 : (y & 2) !== 0), z ? (w = !0, i.flags &= -129) : (t === null || t.memoizedState !== null) && (y |= 1), ut(yt, y & 1), t === null)
      return il(i), t = i.memoizedState, t !== null && (t = t.dehydrated, t !== null) ? (i.mode & 1 ? mn(t) ? i.lanes = 8 : i.lanes = 1073741824 : i.lanes = 1, null) : (y = m.children, t = m.fallback, w ? (m = i.mode, w = i.child, y = { mode: "hidden", children: y }, !(m & 1) && w !== null ? (w.childLanes = 0, w.pendingProps = y) : w = fa(y, m, 0, null), t = vi(t, m, h, null), w.return = i, t.return = i, w.sibling = t, i.child = w, i.child.memoizedState = Ws(h), i.memoizedState = Vs, t) : Sl(i, y));
    if (y = t.memoizedState, y !== null) {
      if (z = y.dehydrated, z !== null) {
        if (D)
          return i.flags & 256 ? (i.flags &= -257, Xs(t, i, h, Error(o(422)))) : i.memoizedState !== null ? (i.child = t.child, i.flags |= 128, null) : (w = m.fallback, y = i.mode, m = fa({ mode: "visible", children: m.children }, y, 0, null), w = vi(w, y, h, null), w.flags |= 2, m.return = i, w.return = i, m.sibling = w, i.child = m, i.mode & 1 && zi(
            i,
            t.child,
            null,
            h
          ), i.child.memoizedState = Ws(h), i.memoizedState = Vs, w);
        if (!(i.mode & 1))
          i = Xs(t, i, h, null);
        else if (mn(z))
          i = Xs(t, i, h, Error(o(419)));
        else if (m = (h & t.childLanes) !== 0, Cn || m) {
          if (m = bt, m !== null) {
            switch (h & -h) {
              case 4:
                w = 2;
                break;
              case 16:
                w = 8;
                break;
              case 64:
              case 128:
              case 256:
              case 512:
              case 1024:
              case 2048:
              case 4096:
              case 8192:
              case 16384:
              case 32768:
              case 65536:
              case 131072:
              case 262144:
              case 524288:
              case 1048576:
              case 2097152:
              case 4194304:
              case 8388608:
              case 16777216:
              case 33554432:
              case 67108864:
                w = 32;
                break;
              case 536870912:
                w = 268435456;
                break;
              default:
                w = 0;
            }
            m = w & (m.suspendedLanes | h) ? 0 : w, m !== 0 && m !== y.retryLane && (y.retryLane = m, Fn(t, m, -1));
          }
          zl(), i = Xs(t, i, h, Error(o(421)));
        } else
          Kn(z) ? (i.flags |= 128, i.child = t.child, i = Up.bind(null, t), rr(z, i), i = null) : (h = y.treeContext, fe && (An = xr(z), En = i, mt = !0, Jn = null, Do = !1, h !== null && (Rn[kn++] = Cr, Rn[kn++] = Pr, Rn[kn++] = li, Cr = h.id, Pr = h.overflow, li = i)), i = Sl(i, i.pendingProps.children), i.flags |= 4096);
        return i;
      }
      return w ? (m = lf(t, i, m.children, m.fallback, h), w = i.child, y = t.child.memoizedState, w.memoizedState = y === null ? Ws(h) : { baseLanes: y.baseLanes | h, cachePool: null }, w.childLanes = t.childLanes & ~h, i.memoizedState = Vs, m) : (h = af(t, i, m.children, h), i.memoizedState = null, h);
    }
    return w ? (m = lf(t, i, m.children, m.fallback, h), w = i.child, y = t.child.memoizedState, w.memoizedState = y === null ? Ws(h) : { baseLanes: y.baseLanes | h, cachePool: null }, w.childLanes = t.childLanes & ~h, i.memoizedState = Vs, m) : (h = af(t, i, m.children, h), i.memoizedState = null, h);
  }
  function Sl(t, i) {
    return i = fa({ mode: "visible", children: i }, t.mode, 0, null), i.return = t, t.child = i;
  }
  function af(t, i, h, m) {
    var y = t.child;
    return t = y.sibling, h = Vr(y, { mode: "visible", children: h }), !(i.mode & 1) && (h.lanes = m), h.return = i, h.sibling = null, t !== null && (m = i.deletions, m === null ? (i.deletions = [t], i.flags |= 16) : m.push(t)), i.child = h;
  }
  function lf(t, i, h, m, y) {
    var w = i.mode;
    t = t.child;
    var D = t.sibling, z = { mode: "hidden", children: h };
    return !(w & 1) && i.child !== t ? (h = i.child, h.childLanes = 0, h.pendingProps = z, i.deletions = null) : (h = Vr(t, z), h.subtreeFlags = t.subtreeFlags & 14680064), D !== null ? m = Vr(D, m) : (m = vi(m, w, y, null), m.flags |= 2), m.return = i, h.return = i, h.sibling = m, i.child = h, m;
  }
  function Xs(t, i, h, m) {
    return m !== null && ol(m), zi(i, t.child, null, h), t = Sl(i, i.pendingProps.children), t.flags |= 2, i.memoizedState = null, t;
  }
  function uf(t, i, h) {
    t.lanes |= i;
    var m = t.alternate;
    m !== null && (m.lanes |= i), rn(t.return, i, h);
  }
  function wl(t, i, h, m, y) {
    var w = t.memoizedState;
    w === null ? t.memoizedState = { isBackwards: i, rendering: null, renderingStartTime: 0, last: m, tail: h, tailMode: y } : (w.isBackwards = i, w.rendering = null, w.renderingStartTime = 0, w.last = m, w.tail = h, w.tailMode = y);
  }
  function cf(t, i, h) {
    var m = i.pendingProps, y = m.revealOrder, w = m.tail;
    if (on(t, i, m.children, h), m = yt.current, m & 2)
      m = m & 1 | 2, i.flags |= 128;
    else {
      if (t !== null && t.flags & 128)
        e:
          for (t = i.child; t !== null; ) {
            if (t.tag === 13)
              t.memoizedState !== null && uf(t, h, i);
            else if (t.tag === 19)
              uf(t, h, i);
            else if (t.child !== null) {
              t.child.return = t, t = t.child;
              continue;
            }
            if (t === i)
              break e;
            for (; t.sibling === null; ) {
              if (t.return === null || t.return === i)
                break e;
              t = t.return;
            }
            t.sibling.return = t.return, t = t.sibling;
          }
      m &= 1;
    }
    if (ut(yt, m), !(i.mode & 1))
      i.memoizedState = null;
    else
      switch (y) {
        case "forwards":
          for (h = i.child, y = null; h !== null; )
            t = h.alternate, t !== null && Ds(t) === null && (y = h), h = h.sibling;
          h = y, h === null ? (y = i.child, i.child = null) : (y = h.sibling, h.sibling = null), wl(i, !1, y, h, w);
          break;
        case "backwards":
          for (h = null, y = i.child, i.child = null; y !== null; ) {
            if (t = y.alternate, t !== null && Ds(t) === null) {
              i.child = y;
              break;
            }
            t = y.sibling, y.sibling = h, h = y, y = t;
          }
          wl(i, !0, h, null, w);
          break;
        case "together":
          wl(i, !1, null, null, void 0);
          break;
        default:
          i.memoizedState = null;
      }
    return i.child;
  }
  function br(t, i, h) {
    if (t !== null && (i.dependencies = t.dependencies), Wi |= i.lanes, !(h & i.childLanes))
      return null;
    if (t !== null && i.child !== t.child)
      throw Error(o(153));
    if (i.child !== null) {
      for (t = i.child, h = Vr(t, t.pendingProps), i.child = h, h.return = i; t.sibling !== null; )
        t = t.sibling, h = h.sibling = Vr(t, t.pendingProps), h.return = i;
      h.sibling = null;
    }
    return i.child;
  }
  function wp(t, i, h) {
    switch (i.tag) {
      case 3:
        rf(i), Bi();
        break;
      case 5:
        Ac(i);
        break;
      case 1:
        Ot(i.type) && Fr(i);
        break;
      case 4:
        sl(i, i.stateNode.containerInfo);
        break;
      case 10:
        Ps(i, i.type._context, i.memoizedProps.value);
        break;
      case 13:
        var m = i.memoizedState;
        if (m !== null)
          return m.dehydrated !== null ? (ut(yt, yt.current & 1), i.flags |= 128, null) : h & i.child.childLanes ? sf(t, i, h) : (ut(yt, yt.current & 1), t = br(t, i, h), t !== null ? t.sibling : null);
        ut(yt, yt.current & 1);
        break;
      case 19:
        if (m = (h & i.childLanes) !== 0, t.flags & 128) {
          if (m)
            return cf(
              t,
              i,
              h
            );
          i.flags |= 128;
        }
        var y = i.memoizedState;
        if (y !== null && (y.rendering = null, y.tail = null, y.lastEffect = null), ut(yt, yt.current), m)
          break;
        return null;
      case 22:
      case 23:
        return i.lanes = 0, ef(t, i, h);
    }
    return br(t, i, h);
  }
  function _p(t, i) {
    switch (nl(i), i.tag) {
      case 1:
        return Ot(i.type) && qn(), t = i.flags, t & 65536 ? (i.flags = t & -65537 | 128, i) : null;
      case 3:
        return Gi(), lt(It), lt(Ut), ul(), t = i.flags, t & 65536 && !(t & 128) ? (i.flags = t & -65537 | 128, i) : null;
      case 5:
        return al(i), null;
      case 13:
        if (lt(yt), t = i.memoizedState, t !== null && t.dehydrated !== null) {
          if (i.alternate === null)
            throw Error(o(340));
          Bi();
        }
        return t = i.flags, t & 65536 ? (i.flags = t & -65537 | 128, i) : null;
      case 19:
        return lt(yt), null;
      case 4:
        return Gi(), null;
      case 10:
        return Bt(i.type._context), null;
      case 22:
      case 23:
        return Bl(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var Ks = !1, fi = !1, Tp = typeof WeakSet == "function" ? WeakSet : Set, ge = null;
  function Ys(t, i) {
    var h = t.ref;
    if (h !== null)
      if (typeof h == "function")
        try {
          h(null);
        } catch (m) {
          dn(t, i, m);
        }
      else
        h.current = null;
  }
  function _l(t, i, h) {
    try {
      h();
    } catch (m) {
      dn(t, i, m);
    }
  }
  var ff = !1;
  function Ep(t, i) {
    for (V(t.containerInfo), ge = i; ge !== null; )
      if (t = ge, i = t.child, (t.subtreeFlags & 1028) !== 0 && i !== null)
        i.return = t, ge = i;
      else
        for (; ge !== null; ) {
          t = ge;
          try {
            var h = t.alternate;
            if (t.flags & 1024)
              switch (t.tag) {
                case 0:
                case 11:
                case 15:
                  break;
                case 1:
                  if (h !== null) {
                    var m = h.memoizedProps, y = h.memoizedState, w = t.stateNode, D = w.getSnapshotBeforeUpdate(t.elementType === t.type ? m : nn(t.type, m), y);
                    w.__reactInternalSnapshotBeforeUpdate = D;
                  }
                  break;
                case 3:
                  ae && kt(t.stateNode.containerInfo);
                  break;
                case 5:
                case 6:
                case 4:
                case 17:
                  break;
                default:
                  throw Error(o(163));
              }
          } catch (z) {
            dn(t, t.return, z);
          }
          if (i = t.sibling, i !== null) {
            i.return = t.return, ge = i;
            break;
          }
          ge = t.return;
        }
    return h = ff, ff = !1, h;
  }
  function di(t, i, h) {
    var m = i.updateQueue;
    if (m = m !== null ? m.lastEffect : null, m !== null) {
      var y = m = m.next;
      do {
        if ((y.tag & t) === t) {
          var w = y.destroy;
          y.destroy = void 0, w !== void 0 && _l(i, h, w);
        }
        y = y.next;
      } while (y !== m);
    }
  }
  function Xo(t, i) {
    if (i = i.updateQueue, i = i !== null ? i.lastEffect : null, i !== null) {
      var h = i = i.next;
      do {
        if ((h.tag & t) === t) {
          var m = h.create;
          h.destroy = m();
        }
        h = h.next;
      } while (h !== i);
    }
  }
  function Tl(t) {
    var i = t.ref;
    if (i !== null) {
      var h = t.stateNode;
      switch (t.tag) {
        case 5:
          t = Z(h);
          break;
        default:
          t = h;
      }
      typeof i == "function" ? i(t) : i.current = t;
    }
  }
  function df(t, i, h) {
    if (wn && typeof wn.onCommitFiberUnmount == "function")
      try {
        wn.onCommitFiberUnmount(ii, i);
      } catch {
      }
    switch (i.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (t = i.updateQueue, t !== null && (t = t.lastEffect, t !== null)) {
          var m = t = t.next;
          do {
            var y = m, w = y.destroy;
            y = y.tag, w !== void 0 && (y & 2 || y & 4) && _l(i, h, w), m = m.next;
          } while (m !== t);
        }
        break;
      case 1:
        if (Ys(i, h), t = i.stateNode, typeof t.componentWillUnmount == "function")
          try {
            t.props = i.memoizedProps, t.state = i.memoizedState, t.componentWillUnmount();
          } catch (D) {
            dn(
              i,
              h,
              D
            );
          }
        break;
      case 5:
        Ys(i, h);
        break;
      case 4:
        ae ? yf(t, i, h) : ie && ie && (i = i.stateNode.containerInfo, h = Xe(i), ze(i, h));
    }
  }
  function hf(t, i, h) {
    for (var m = i; ; )
      if (df(t, m, h), m.child === null || ae && m.tag === 4) {
        if (m === i)
          break;
        for (; m.sibling === null; ) {
          if (m.return === null || m.return === i)
            return;
          m = m.return;
        }
        m.sibling.return = m.return, m = m.sibling;
      } else
        m.child.return = m, m = m.child;
  }
  function pf(t) {
    var i = t.alternate;
    i !== null && (t.alternate = null, pf(i)), t.child = null, t.deletions = null, t.sibling = null, t.tag === 5 && (i = t.stateNode, i !== null && Fe(i)), t.stateNode = null, t.return = null, t.dependencies = null, t.memoizedProps = null, t.memoizedState = null, t.pendingProps = null, t.stateNode = null, t.updateQueue = null;
  }
  function mf(t) {
    return t.tag === 5 || t.tag === 3 || t.tag === 4;
  }
  function vf(t) {
    e:
      for (; ; ) {
        for (; t.sibling === null; ) {
          if (t.return === null || mf(t.return))
            return null;
          t = t.return;
        }
        for (t.sibling.return = t.return, t = t.sibling; t.tag !== 5 && t.tag !== 6 && t.tag !== 18; ) {
          if (t.flags & 2 || t.child === null || t.tag === 4)
            continue e;
          t.child.return = t, t = t.child;
        }
        if (!(t.flags & 2))
          return t.stateNode;
      }
  }
  function gf(t) {
    if (ae) {
      e: {
        for (var i = t.return; i !== null; ) {
          if (mf(i))
            break e;
          i = i.return;
        }
        throw Error(o(160));
      }
      var h = i;
      switch (h.tag) {
        case 5:
          i = h.stateNode, h.flags & 32 && (ue(i), h.flags &= -33), h = vf(t), Al(t, h, i);
          break;
        case 3:
        case 4:
          i = h.stateNode.containerInfo, h = vf(t), El(t, h, i);
          break;
        default:
          throw Error(o(161));
      }
    }
  }
  function El(t, i, h) {
    var m = t.tag;
    if (m === 5 || m === 6)
      t = t.stateNode, i ? We(h, t, i) : Oe(h, t);
    else if (m !== 4 && (t = t.child, t !== null))
      for (El(t, i, h), t = t.sibling; t !== null; )
        El(t, i, h), t = t.sibling;
  }
  function Al(t, i, h) {
    var m = t.tag;
    if (m === 5 || m === 6)
      t = t.stateNode, i ? Ke(h, t, i) : Le(h, t);
    else if (m !== 4 && (t = t.child, t !== null))
      for (Al(t, i, h), t = t.sibling; t !== null; )
        Al(t, i, h), t = t.sibling;
  }
  function yf(t, i, h) {
    for (var m = i, y = !1, w, D; ; ) {
      if (!y) {
        y = m.return;
        e:
          for (; ; ) {
            if (y === null)
              throw Error(o(160));
            switch (w = y.stateNode, y.tag) {
              case 5:
                D = !1;
                break e;
              case 3:
                w = w.containerInfo, D = !0;
                break e;
              case 4:
                w = w.containerInfo, D = !0;
                break e;
            }
            y = y.return;
          }
        y = !0;
      }
      if (m.tag === 5 || m.tag === 6)
        hf(t, m, h), D ? B(w, m.stateNode) : Ue(w, m.stateNode);
      else if (m.tag === 18)
        D ? ws(w, m.stateNode) : Za(w, m.stateNode);
      else if (m.tag === 4) {
        if (m.child !== null) {
          w = m.stateNode.containerInfo, D = !0, m.child.return = m, m = m.child;
          continue;
        }
      } else if (df(t, m, h), m.child !== null) {
        m.child.return = m, m = m.child;
        continue;
      }
      if (m === i)
        break;
      for (; m.sibling === null; ) {
        if (m.return === null || m.return === i)
          return;
        m = m.return, m.tag === 4 && (y = !1);
      }
      m.sibling.return = m.return, m = m.sibling;
    }
  }
  function Cl(t, i) {
    if (ae) {
      switch (i.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          di(3, i, i.return), Xo(3, i), di(5, i, i.return);
          return;
        case 1:
          return;
        case 5:
          var h = i.stateNode;
          if (h != null) {
            var m = i.memoizedProps;
            t = t !== null ? t.memoizedProps : m;
            var y = i.type, w = i.updateQueue;
            i.updateQueue = null, w !== null && ct(h, w, y, t, m, i);
          }
          return;
        case 6:
          if (i.stateNode === null)
            throw Error(o(162));
          h = i.memoizedProps, Ge(i.stateNode, t !== null ? t.memoizedProps : h, h);
          return;
        case 3:
          fe && t !== null && t.memoizedState.isDehydrated && ei(i.stateNode.containerInfo);
          return;
        case 12:
          return;
        case 13:
          Qs(i);
          return;
        case 19:
          Qs(i);
          return;
        case 17:
          return;
      }
      throw Error(o(163));
    }
    switch (i.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        di(3, i, i.return), Xo(3, i), di(5, i, i.return);
        return;
      case 12:
        return;
      case 13:
        Qs(i);
        return;
      case 19:
        Qs(i);
        return;
      case 3:
        fe && t !== null && t.memoizedState.isDehydrated && ei(i.stateNode.containerInfo);
        break;
      case 22:
      case 23:
        return;
    }
    e:
      if (ie) {
        switch (i.tag) {
          case 1:
          case 5:
          case 6:
            break e;
          case 3:
          case 4:
            i = i.stateNode, ze(i.containerInfo, i.pendingChildren);
            break e;
        }
        throw Error(o(163));
      }
  }
  function Qs(t) {
    var i = t.updateQueue;
    if (i !== null) {
      t.updateQueue = null;
      var h = t.stateNode;
      h === null && (h = t.stateNode = new Tp()), i.forEach(function(m) {
        var y = Dp.bind(null, t, m);
        h.has(m) || (h.add(m), m.then(y, y));
      });
    }
  }
  function Ap(t, i) {
    for (ge = i; ge !== null; ) {
      i = ge;
      var h = i.deletions;
      if (h !== null)
        for (var m = 0; m < h.length; m++) {
          var y = h[m];
          try {
            var w = t;
            ae ? yf(w, y, i) : hf(w, y, i);
            var D = y.alternate;
            D !== null && (D.return = null), y.return = null;
          } catch (De) {
            dn(y, i, De);
          }
        }
      if (h = i.child, i.subtreeFlags & 12854 && h !== null)
        h.return = i, ge = h;
      else
        for (; ge !== null; ) {
          i = ge;
          try {
            var z = i.flags;
            if (z & 32 && ae && ue(i.stateNode), z & 512) {
              var ne = i.alternate;
              if (ne !== null) {
                var he = ne.ref;
                he !== null && (typeof he == "function" ? he(null) : he.current = null);
              }
            }
            if (z & 8192)
              switch (i.tag) {
                case 13:
                  if (i.memoizedState !== null) {
                    var Ce = i.alternate;
                    (Ce === null || Ce.memoizedState === null) && (Ul = gt());
                  }
                  break;
                case 22:
                  var He = i.memoizedState !== null, Ne = i.alternate, ft = Ne !== null && Ne.memoizedState !== null;
                  if (h = i, ae) {
                    e:
                      if (m = h, y = He, w = null, ae)
                        for (var Ie = m; ; ) {
                          if (Ie.tag === 5) {
                            if (w === null) {
                              w = Ie;
                              var $t = Ie.stateNode;
                              y ? Pe($t) : Ae(Ie.stateNode, Ie.memoizedProps);
                            }
                          } else if (Ie.tag === 6) {
                            if (w === null) {
                              var On = Ie.stateNode;
                              y ? Re(On) : Ye(On, Ie.memoizedProps);
                            }
                          } else if ((Ie.tag !== 22 && Ie.tag !== 23 || Ie.memoizedState === null || Ie === m) && Ie.child !== null) {
                            Ie.child.return = Ie, Ie = Ie.child;
                            continue;
                          }
                          if (Ie === m)
                            break;
                          for (; Ie.sibling === null; ) {
                            if (Ie.return === null || Ie.return === m)
                              break e;
                            w === Ie && (w = null), Ie = Ie.return;
                          }
                          w === Ie && (w = null), Ie.sibling.return = Ie.return, Ie = Ie.sibling;
                        }
                  }
                  if (He && !ft && h.mode & 1) {
                    ge = h;
                    for (var Q = h.child; Q !== null; ) {
                      for (h = ge = Q; ge !== null; ) {
                        m = ge;
                        var H = m.child;
                        switch (m.tag) {
                          case 0:
                          case 11:
                          case 14:
                          case 15:
                            di(4, m, m.return);
                            break;
                          case 1:
                            Ys(m, m.return);
                            var ee = m.stateNode;
                            if (typeof ee.componentWillUnmount == "function") {
                              var Se = m.return;
                              try {
                                ee.props = m.memoizedProps, ee.state = m.memoizedState, ee.componentWillUnmount();
                              } catch (De) {
                                dn(
                                  m,
                                  Se,
                                  De
                                );
                              }
                            }
                            break;
                          case 5:
                            Ys(m, m.return);
                            break;
                          case 22:
                            if (m.memoizedState !== null) {
                              wf(h);
                              continue;
                            }
                        }
                        H !== null ? (H.return = m, ge = H) : wf(h);
                      }
                      Q = Q.sibling;
                    }
                  }
              }
            switch (z & 4102) {
              case 2:
                gf(i), i.flags &= -3;
                break;
              case 6:
                gf(i), i.flags &= -3, Cl(i.alternate, i);
                break;
              case 4096:
                i.flags &= -4097;
                break;
              case 4100:
                i.flags &= -4097, Cl(i.alternate, i);
                break;
              case 4:
                Cl(i.alternate, i);
            }
          } catch (De) {
            dn(i, i.return, De);
          }
          if (h = i.sibling, h !== null) {
            h.return = i.return, ge = h;
            break;
          }
          ge = i.return;
        }
    }
  }
  function Cp(t, i, h) {
    ge = t, xf(t);
  }
  function xf(t, i, h) {
    for (var m = (t.mode & 1) !== 0; ge !== null; ) {
      var y = ge, w = y.child;
      if (y.tag === 22 && m) {
        var D = y.memoizedState !== null || Ks;
        if (!D) {
          var z = y.alternate, ne = z !== null && z.memoizedState !== null || fi;
          z = Ks;
          var he = fi;
          if (Ks = D, (fi = ne) && !he)
            for (ge = y; ge !== null; )
              D = ge, ne = D.child, D.tag === 22 && D.memoizedState !== null ? _f(y) : ne !== null ? (ne.return = D, ge = ne) : _f(y);
          for (; w !== null; )
            ge = w, xf(w), w = w.sibling;
          ge = y, Ks = z, fi = he;
        }
        Sf(t);
      } else
        y.subtreeFlags & 8772 && w !== null ? (w.return = y, ge = w) : Sf(t);
    }
  }
  function Sf(t) {
    for (; ge !== null; ) {
      var i = ge;
      if (i.flags & 8772) {
        var h = i.alternate;
        try {
          if (i.flags & 8772)
            switch (i.tag) {
              case 0:
              case 11:
              case 15:
                fi || Xo(5, i);
                break;
              case 1:
                var m = i.stateNode;
                if (i.flags & 4 && !fi)
                  if (h === null)
                    m.componentDidMount();
                  else {
                    var y = i.elementType === i.type ? h.memoizedProps : nn(i.type, h.memoizedProps);
                    m.componentDidUpdate(y, h.memoizedState, m.__reactInternalSnapshotBeforeUpdate);
                  }
                var w = i.updateQueue;
                w !== null && hc(i, w, m);
                break;
              case 3:
                var D = i.updateQueue;
                if (D !== null) {
                  if (h = null, i.child !== null)
                    switch (i.child.tag) {
                      case 5:
                        h = Z(i.child.stateNode);
                        break;
                      case 1:
                        h = i.child.stateNode;
                    }
                  hc(i, D, h);
                }
                break;
              case 5:
                var z = i.stateNode;
                h === null && i.flags & 4 && st(z, i.type, i.memoizedProps, i);
                break;
              case 6:
                break;
              case 4:
                break;
              case 12:
                break;
              case 13:
                if (fe && i.memoizedState === null) {
                  var ne = i.alternate;
                  if (ne !== null) {
                    var he = ne.memoizedState;
                    if (he !== null) {
                      var Ce = he.dehydrated;
                      Ce !== null && To(Ce);
                    }
                  }
                }
                break;
              case 19:
              case 17:
              case 21:
              case 22:
              case 23:
                break;
              default:
                throw Error(o(163));
            }
          fi || i.flags & 512 && Tl(i);
        } catch (He) {
          dn(i, i.return, He);
        }
      }
      if (i === t) {
        ge = null;
        break;
      }
      if (h = i.sibling, h !== null) {
        h.return = i.return, ge = h;
        break;
      }
      ge = i.return;
    }
  }
  function wf(t) {
    for (; ge !== null; ) {
      var i = ge;
      if (i === t) {
        ge = null;
        break;
      }
      var h = i.sibling;
      if (h !== null) {
        h.return = i.return, ge = h;
        break;
      }
      ge = i.return;
    }
  }
  function _f(t) {
    for (; ge !== null; ) {
      var i = ge;
      try {
        switch (i.tag) {
          case 0:
          case 11:
          case 15:
            var h = i.return;
            try {
              Xo(4, i);
            } catch (ne) {
              dn(i, h, ne);
            }
            break;
          case 1:
            var m = i.stateNode;
            if (typeof m.componentDidMount == "function") {
              var y = i.return;
              try {
                m.componentDidMount();
              } catch (ne) {
                dn(i, y, ne);
              }
            }
            var w = i.return;
            try {
              Tl(i);
            } catch (ne) {
              dn(i, w, ne);
            }
            break;
          case 5:
            var D = i.return;
            try {
              Tl(i);
            } catch (ne) {
              dn(i, D, ne);
            }
        }
      } catch (ne) {
        dn(i, i.return, ne);
      }
      if (i === t) {
        ge = null;
        break;
      }
      var z = i.sibling;
      if (z !== null) {
        z.return = i.return, ge = z;
        break;
      }
      ge = i.return;
    }
  }
  var qs = 0, Zs = 1, Js = 2, $s = 3, ea = 4;
  if (typeof Symbol == "function" && Symbol.for) {
    var Ko = Symbol.for;
    qs = Ko("selector.component"), Zs = Ko("selector.has_pseudo_class"), Js = Ko("selector.role"), $s = Ko("selector.test_id"), ea = Ko("selector.text");
  }
  function Pl(t) {
    var i = ve(t);
    if (i != null) {
      if (typeof i.memoizedProps["data-testname"] != "string")
        throw Error(o(364));
      return i;
    }
    if (t = le(t), t === null)
      throw Error(o(362));
    return t.stateNode.current;
  }
  function Ml(t, i) {
    switch (i.$$typeof) {
      case qs:
        if (t.type === i.value)
          return !0;
        break;
      case Zs:
        e: {
          i = i.value, t = [t, 0];
          for (var h = 0; h < t.length; ) {
            var m = t[h++], y = t[h++], w = i[y];
            if (m.tag !== 5 || !Ee(m)) {
              for (; w != null && Ml(m, w); )
                y++, w = i[y];
              if (y === i.length) {
                i = !0;
                break e;
              } else
                for (m = m.child; m !== null; )
                  t.push(m, y), m = m.sibling;
            }
          }
          i = !1;
        }
        return i;
      case Js:
        if (t.tag === 5 && xe(t.stateNode, i.value))
          return !0;
        break;
      case ea:
        if ((t.tag === 5 || t.tag === 6) && (t = _e(t), t !== null && 0 <= t.indexOf(i.value)))
          return !0;
        break;
      case $s:
        if (t.tag === 5 && (t = t.memoizedProps["data-testname"], typeof t == "string" && t.toLowerCase() === i.value.toLowerCase()))
          return !0;
        break;
      default:
        throw Error(o(365));
    }
    return !1;
  }
  function bl(t) {
    switch (t.$$typeof) {
      case qs:
        return "<" + (b(t.value) || "Unknown") + ">";
      case Zs:
        return ":has(" + (bl(t) || "") + ")";
      case Js:
        return '[role="' + t.value + '"]';
      case ea:
        return '"' + t.value + '"';
      case $s:
        return '[data-testname="' + t.value + '"]';
      default:
        throw Error(o(365));
    }
  }
  function Tf(t, i) {
    var h = [];
    t = [t, 0];
    for (var m = 0; m < t.length; ) {
      var y = t[m++], w = t[m++], D = i[w];
      if (y.tag !== 5 || !Ee(y)) {
        for (; D != null && Ml(y, D); )
          w++, D = i[w];
        if (w === i.length)
          h.push(y);
        else
          for (y = y.child; y !== null; )
            t.push(y, w), y = y.sibling;
      }
    }
    return h;
  }
  function Ll(t, i) {
    if (!Te)
      throw Error(o(363));
    t = Pl(t), t = Tf(t, i), i = [], t = Array.from(t);
    for (var h = 0; h < t.length; ) {
      var m = t[h++];
      if (m.tag === 5)
        Ee(m) || i.push(m.stateNode);
      else
        for (m = m.child; m !== null; )
          t.push(m), m = m.sibling;
    }
    return i;
  }
  var Pp = Math.ceil, ta = u.ReactCurrentDispatcher, Rl = u.ReactCurrentOwner, Pt = u.ReactCurrentBatchConfig, Ze = 0, bt = null, Lt = null, Ht = 0, Pn = 0, Vi = gn(0), Dt = 0, Yo = null, Wi = 0, na = 0, kl = 0, Qo = null, cn = null, Ul = 0, Dl = 1 / 0;
  function Xi() {
    Dl = gt() + 500;
  }
  var ra = !1, Fl = null, zr = null, ia = !1, jr = null, oa = 0, qo = 0, Il = null, sa = -1, aa = 0;
  function sn() {
    return Ze & 6 ? gt() : sa !== -1 ? sa : sa = gt();
  }
  function Gr(t) {
    return t.mode & 1 ? Ze & 2 && Ht !== 0 ? Ht & -Ht : oi.transition !== null ? (aa === 0 && (t = Sr, Sr <<= 1, !(Sr & 4194240) && (Sr = 64), aa = t), aa) : (t = Je, t !== 0 ? t : we()) : 1;
  }
  function Fn(t, i, h) {
    if (50 < qo)
      throw qo = 0, Il = null, Error(o(185));
    var m = la(t, i);
    return m === null ? null : (ar(m, i, h), (!(Ze & 2) || m !== bt) && (m === bt && (!(Ze & 2) && (na |= i), Dt === 4 && Hr(m, Ht)), fn(m, h), i === 1 && Ze === 0 && !(t.mode & 1) && (Xi(), ur && un())), m);
  }
  function la(t, i) {
    t.lanes |= i;
    var h = t.alternate;
    for (h !== null && (h.lanes |= i), h = t, t = t.return; t !== null; )
      t.childLanes |= i, h = t.alternate, h !== null && (h.childLanes |= i), h = t, t = t.return;
    return h.tag === 3 ? h.stateNode : null;
  }
  function fn(t, i) {
    var h = t.callbackNode;
    Po(t, i);
    var m = ni(t, t === bt ? Ht : 0);
    if (m === 0)
      h !== null && Di(h), t.callbackNode = null, t.callbackPriority = 0;
    else if (i = m & -m, t.callbackPriority !== i) {
      if (h != null && Di(h), i === 1)
        t.tag === 0 ? Uo(Af.bind(null, t)) : ko(Af.bind(null, t)), de ? Me(function() {
          Ze === 0 && un();
        }) : Er(ri, un), h = null;
      else {
        switch (Mo(m)) {
          case 1:
            h = ri;
            break;
          case 4:
            h = As;
            break;
          case 16:
            h = en;
            break;
          case 536870912:
            h = Lo;
            break;
          default:
            h = en;
        }
        h = Df(h, Ef.bind(null, t));
      }
      t.callbackPriority = i, t.callbackNode = h;
    }
  }
  function Ef(t, i) {
    if (sa = -1, aa = 0, Ze & 6)
      throw Error(o(327));
    var h = t.callbackNode;
    if (mi() && t.callbackNode !== h)
      return null;
    var m = ni(t, t === bt ? Ht : 0);
    if (m === 0)
      return null;
    if (m & 30 || m & t.expiredLanes || i)
      i = ua(t, m);
    else {
      i = m;
      var y = Ze;
      Ze |= 2;
      var w = Mf();
      (bt !== t || Ht !== i) && (Xi(), hi(t, i));
      do
        try {
          Lp();
          break;
        } catch (z) {
          Pf(t, z);
        }
      while (1);
      Ii(), ta.current = w, Ze = y, Lt !== null ? i = 0 : (bt = null, Ht = 0, i = Dt);
    }
    if (i !== 0) {
      if (i === 2 && (y = Tr(t), y !== 0 && (m = y, i = Ol(t, y))), i === 1)
        throw h = Yo, hi(t, 0), Hr(t, m), fn(t, gt()), h;
      if (i === 6)
        Hr(t, m);
      else {
        if (y = t.current.alternate, !(m & 30) && !Mp(y) && (i = ua(t, m), i === 2 && (w = Tr(t), w !== 0 && (m = w, i = Ol(t, w))), i === 1))
          throw h = Yo, hi(t, 0), Hr(t, m), fn(t, gt()), h;
        switch (t.finishedWork = y, t.finishedLanes = m, i) {
          case 0:
          case 1:
            throw Error(o(345));
          case 2:
            pi(t, cn);
            break;
          case 3:
            if (Hr(t, m), (m & 130023424) === m && (i = Ul + 500 - gt(), 10 < i)) {
              if (ni(t, 0) !== 0)
                break;
              if (y = t.suspendedLanes, (y & m) !== m) {
                sn(), t.pingedLanes |= t.suspendedLanes & y;
                break;
              }
              t.timeoutHandle = X(pi.bind(null, t, cn), i);
              break;
            }
            pi(t, cn);
            break;
          case 4:
            if (Hr(t, m), (m & 4194240) === m)
              break;
            for (i = t.eventTimes, y = -1; 0 < m; ) {
              var D = 31 - Sn(m);
              w = 1 << D, D = i[D], D > y && (y = D), m &= ~w;
            }
            if (m = y, m = gt() - m, m = (120 > m ? 120 : 480 > m ? 480 : 1080 > m ? 1080 : 1920 > m ? 1920 : 3e3 > m ? 3e3 : 4320 > m ? 4320 : 1960 * Pp(m / 1960)) - m, 10 < m) {
              t.timeoutHandle = X(pi.bind(null, t, cn), m);
              break;
            }
            pi(t, cn);
            break;
          case 5:
            pi(t, cn);
            break;
          default:
            throw Error(o(329));
        }
      }
    }
    return fn(t, gt()), t.callbackNode === h ? Ef.bind(null, t) : null;
  }
  function Ol(t, i) {
    var h = Qo;
    return t.current.memoizedState.isDehydrated && (hi(t, i).flags |= 256), t = ua(t, i), t !== 2 && (i = cn, cn = h, i !== null && Nl(i)), t;
  }
  function Nl(t) {
    cn === null ? cn = t : cn.push.apply(cn, t);
  }
  function Mp(t) {
    for (var i = t; ; ) {
      if (i.flags & 16384) {
        var h = i.updateQueue;
        if (h !== null && (h = h.stores, h !== null))
          for (var m = 0; m < h.length; m++) {
            var y = h[m], w = y.getSnapshot;
            y = y.value;
            try {
              if (!_n(w(), y))
                return !1;
            } catch {
              return !1;
            }
          }
      }
      if (h = i.child, i.subtreeFlags & 16384 && h !== null)
        h.return = i, i = h;
      else {
        if (i === t)
          break;
        for (; i.sibling === null; ) {
          if (i.return === null || i.return === t)
            return !0;
          i = i.return;
        }
        i.sibling.return = i.return, i = i.sibling;
      }
    }
    return !0;
  }
  function Hr(t, i) {
    for (i &= ~kl, i &= ~na, t.suspendedLanes |= i, t.pingedLanes &= ~i, t = t.expirationTimes; 0 < i; ) {
      var h = 31 - Sn(i), m = 1 << h;
      t[h] = -1, i &= ~m;
    }
  }
  function Af(t) {
    if (Ze & 6)
      throw Error(o(327));
    mi();
    var i = ni(t, 0);
    if (!(i & 1))
      return fn(t, gt()), null;
    var h = ua(t, i);
    if (t.tag !== 0 && h === 2) {
      var m = Tr(t);
      m !== 0 && (i = m, h = Ol(t, m));
    }
    if (h === 1)
      throw h = Yo, hi(t, 0), Hr(t, i), fn(t, gt()), h;
    if (h === 6)
      throw Error(o(345));
    return t.finishedWork = t.current.alternate, t.finishedLanes = i, pi(t, cn), fn(t, gt()), null;
  }
  function Cf(t) {
    jr !== null && jr.tag === 0 && !(Ze & 6) && mi();
    var i = Ze;
    Ze |= 1;
    var h = Pt.transition, m = Je;
    try {
      if (Pt.transition = null, Je = 1, t)
        return t();
    } finally {
      Je = m, Pt.transition = h, Ze = i, !(Ze & 6) && un();
    }
  }
  function Bl() {
    Pn = Vi.current, lt(Vi);
  }
  function hi(t, i) {
    t.finishedWork = null, t.finishedLanes = 0;
    var h = t.timeoutHandle;
    if (h !== re && (t.timeoutHandle = re, q(h)), Lt !== null)
      for (h = Lt.return; h !== null; ) {
        var m = h;
        switch (nl(m), m.tag) {
          case 1:
            m = m.type.childContextTypes, m != null && qn();
            break;
          case 3:
            Gi(), lt(It), lt(Ut), ul();
            break;
          case 5:
            al(m);
            break;
          case 4:
            Gi();
            break;
          case 13:
            lt(yt);
            break;
          case 19:
            lt(yt);
            break;
          case 10:
            Bt(m.type._context);
            break;
          case 22:
          case 23:
            Bl();
        }
        h = h.return;
      }
    if (bt = t, Lt = t = Vr(t.current, null), Ht = Pn = i, Dt = 0, Yo = null, kl = na = Wi = 0, cn = Qo = null, Tn !== null) {
      for (i = 0; i < Tn.length; i++)
        if (h = Tn[i], m = h.interleaved, m !== null) {
          h.interleaved = null;
          var y = m.next, w = h.pending;
          if (w !== null) {
            var D = w.next;
            w.next = y, m.next = D;
          }
          h.pending = m;
        }
      Tn = null;
    }
    return t;
  }
  function Pf(t, i) {
    do {
      var h = Lt;
      try {
        if (Ii(), Fs.current = js, Is) {
          for (var m = St.memoizedState; m !== null; ) {
            var y = m.queue;
            y !== null && (y.pending = null), m = m.next;
          }
          Is = !1;
        }
        if (Hi = 0, zt = qt = St = null, Bo = !1, zo = 0, Rl.current = null, h === null || h.return === null) {
          Dt = 1, Yo = i, Lt = null;
          break;
        }
        e: {
          var w = t, D = h.return, z = h, ne = i;
          if (i = Ht, z.flags |= 32768, ne !== null && typeof ne == "object" && typeof ne.then == "function") {
            var he = ne, Ce = z, He = Ce.tag;
            if (!(Ce.mode & 1) && (He === 0 || He === 11 || He === 15)) {
              var Ne = Ce.alternate;
              Ne ? (Ce.updateQueue = Ne.updateQueue, Ce.memoizedState = Ne.memoizedState, Ce.lanes = Ne.lanes) : (Ce.updateQueue = null, Ce.memoizedState = null);
            }
            var ft = Kc(D);
            if (ft !== null) {
              ft.flags &= -257, Yc(ft, D, z, w, i), ft.mode & 1 && Xc(w, he, i), i = ft, ne = he;
              var Ie = i.updateQueue;
              if (Ie === null) {
                var $t = /* @__PURE__ */ new Set();
                $t.add(ne), i.updateQueue = $t;
              } else
                Ie.add(ne);
              break e;
            } else {
              if (!(i & 1)) {
                Xc(w, he, i), zl();
                break e;
              }
              ne = Error(o(426));
            }
          } else if (mt && z.mode & 1) {
            var On = Kc(D);
            if (On !== null) {
              !(On.flags & 65536) && (On.flags |= 256), Yc(On, D, z, w, i), ol(ne);
              break e;
            }
          }
          w = ne, Dt !== 4 && (Dt = 2), Qo === null ? Qo = [w] : Qo.push(w), ne = vl(ne, z), z = D;
          do {
            switch (z.tag) {
              case 3:
                z.flags |= 65536, i &= -i, z.lanes |= i;
                var Q = Vc(z, ne, i);
                dc(z, Q);
                break e;
              case 1:
                w = ne;
                var H = z.type, ee = z.stateNode;
                if (!(z.flags & 128) && (typeof H.getDerivedStateFromError == "function" || ee !== null && typeof ee.componentDidCatch == "function" && (zr === null || !zr.has(ee)))) {
                  z.flags |= 65536, i &= -i, z.lanes |= i;
                  var Se = Wc(z, w, i);
                  dc(z, Se);
                  break e;
                }
            }
            z = z.return;
          } while (z !== null);
        }
        Lf(h);
      } catch (De) {
        i = De, Lt === h && h !== null && (Lt = h = h.return);
        continue;
      }
      break;
    } while (1);
  }
  function Mf() {
    var t = ta.current;
    return ta.current = js, t === null ? js : t;
  }
  function zl() {
    (Dt === 0 || Dt === 3 || Dt === 2) && (Dt = 4), bt === null || !(Wi & 268435455) && !(na & 268435455) || Hr(bt, Ht);
  }
  function ua(t, i) {
    var h = Ze;
    Ze |= 2;
    var m = Mf();
    bt === t && Ht === i || hi(t, i);
    do
      try {
        bp();
        break;
      } catch (y) {
        Pf(t, y);
      }
    while (1);
    if (Ii(), Ze = h, ta.current = m, Lt !== null)
      throw Error(o(261));
    return bt = null, Ht = 0, Dt;
  }
  function bp() {
    for (; Lt !== null; )
      bf(Lt);
  }
  function Lp() {
    for (; Lt !== null && !bo(); )
      bf(Lt);
  }
  function bf(t) {
    var i = Uf(t.alternate, t, Pn);
    t.memoizedProps = t.pendingProps, i === null ? Lf(t) : Lt = i, Rl.current = null;
  }
  function Lf(t) {
    var i = t;
    do {
      var h = i.alternate;
      if (t = i.return, i.flags & 32768) {
        if (h = _p(h, i), h !== null) {
          h.flags &= 32767, Lt = h;
          return;
        }
        if (t !== null)
          t.flags |= 32768, t.subtreeFlags = 0, t.deletions = null;
        else {
          Dt = 6, Lt = null;
          return;
        }
      } else if (h = xp(h, i, Pn), h !== null) {
        Lt = h;
        return;
      }
      if (i = i.sibling, i !== null) {
        Lt = i;
        return;
      }
      Lt = i = t;
    } while (i !== null);
    Dt === 0 && (Dt = 5);
  }
  function pi(t, i) {
    var h = Je, m = Pt.transition;
    try {
      Pt.transition = null, Je = 1, Rp(t, i, h);
    } finally {
      Pt.transition = m, Je = h;
    }
    return null;
  }
  function Rp(t, i, h) {
    do
      mi();
    while (jr !== null);
    if (Ze & 6)
      throw Error(o(327));
    var m = t.finishedWork, y = t.finishedLanes;
    if (m === null)
      return null;
    if (t.finishedWork = null, t.finishedLanes = 0, m === t.current)
      throw Error(o(177));
    t.callbackNode = null, t.callbackPriority = 0;
    var w = m.lanes | m.childLanes;
    if (Ir(t, w), t === bt && (Lt = bt = null, Ht = 0), !(m.subtreeFlags & 2064) && !(m.flags & 2064) || ia || (ia = !0, Df(en, function() {
      return mi(), null;
    })), w = (m.flags & 15990) !== 0, m.subtreeFlags & 15990 || w) {
      w = Pt.transition, Pt.transition = null;
      var D = Je;
      Je = 1;
      var z = Ze;
      Ze |= 4, Rl.current = null, Ep(t, m), Ap(t, m), G(t.containerInfo), t.current = m, Cp(m), Es(), Ze = z, Je = D, Pt.transition = w;
    } else
      t.current = m;
    if (ia && (ia = !1, jr = t, oa = y), w = t.pendingLanes, w === 0 && (zr = null), Ro(m.stateNode), fn(t, gt()), i !== null)
      for (h = t.onRecoverableError, m = 0; m < i.length; m++)
        h(i[m]);
    if (ra)
      throw ra = !1, t = Fl, Fl = null, t;
    return oa & 1 && t.tag !== 0 && mi(), w = t.pendingLanes, w & 1 ? t === Il ? qo++ : (qo = 0, Il = t) : qo = 0, un(), null;
  }
  function mi() {
    if (jr !== null) {
      var t = Mo(oa), i = Pt.transition, h = Je;
      try {
        if (Pt.transition = null, Je = 16 > t ? 16 : t, jr === null)
          var m = !1;
        else {
          if (t = jr, jr = null, oa = 0, Ze & 6)
            throw Error(o(331));
          var y = Ze;
          for (Ze |= 4, ge = t.current; ge !== null; ) {
            var w = ge, D = w.child;
            if (ge.flags & 16) {
              var z = w.deletions;
              if (z !== null) {
                for (var ne = 0; ne < z.length; ne++) {
                  var he = z[ne];
                  for (ge = he; ge !== null; ) {
                    var Ce = ge;
                    switch (Ce.tag) {
                      case 0:
                      case 11:
                      case 15:
                        di(8, Ce, w);
                    }
                    var He = Ce.child;
                    if (He !== null)
                      He.return = Ce, ge = He;
                    else
                      for (; ge !== null; ) {
                        Ce = ge;
                        var Ne = Ce.sibling, ft = Ce.return;
                        if (pf(Ce), Ce === he) {
                          ge = null;
                          break;
                        }
                        if (Ne !== null) {
                          Ne.return = ft, ge = Ne;
                          break;
                        }
                        ge = ft;
                      }
                  }
                }
                var Ie = w.alternate;
                if (Ie !== null) {
                  var $t = Ie.child;
                  if ($t !== null) {
                    Ie.child = null;
                    do {
                      var On = $t.sibling;
                      $t.sibling = null, $t = On;
                    } while ($t !== null);
                  }
                }
                ge = w;
              }
            }
            if (w.subtreeFlags & 2064 && D !== null)
              D.return = w, ge = D;
            else
              e:
                for (; ge !== null; ) {
                  if (w = ge, w.flags & 2048)
                    switch (w.tag) {
                      case 0:
                      case 11:
                      case 15:
                        di(9, w, w.return);
                    }
                  var Q = w.sibling;
                  if (Q !== null) {
                    Q.return = w.return, ge = Q;
                    break e;
                  }
                  ge = w.return;
                }
          }
          var H = t.current;
          for (ge = H; ge !== null; ) {
            D = ge;
            var ee = D.child;
            if (D.subtreeFlags & 2064 && ee !== null)
              ee.return = D, ge = ee;
            else
              e:
                for (D = H; ge !== null; ) {
                  if (z = ge, z.flags & 2048)
                    try {
                      switch (z.tag) {
                        case 0:
                        case 11:
                        case 15:
                          Xo(9, z);
                      }
                    } catch (De) {
                      dn(z, z.return, De);
                    }
                  if (z === D) {
                    ge = null;
                    break e;
                  }
                  var Se = z.sibling;
                  if (Se !== null) {
                    Se.return = z.return, ge = Se;
                    break e;
                  }
                  ge = z.return;
                }
          }
          if (Ze = y, un(), wn && typeof wn.onPostCommitFiberRoot == "function")
            try {
              wn.onPostCommitFiberRoot(ii, t);
            } catch {
            }
          m = !0;
        }
        return m;
      } finally {
        Je = h, Pt.transition = i;
      }
    }
    return !1;
  }
  function Rf(t, i, h) {
    i = vl(h, i), i = Vc(t, i, 1), Br(t, i), i = sn(), t = la(t, 1), t !== null && (ar(t, 1, i), fn(t, i));
  }
  function dn(t, i, h) {
    if (t.tag === 3)
      Rf(t, t, h);
    else
      for (; i !== null; ) {
        if (i.tag === 3) {
          Rf(i, t, h);
          break;
        } else if (i.tag === 1) {
          var m = i.stateNode;
          if (typeof i.type.getDerivedStateFromError == "function" || typeof m.componentDidCatch == "function" && (zr === null || !zr.has(m))) {
            t = vl(h, t), t = Wc(i, t, 1), Br(i, t), t = sn(), i = la(i, 1), i !== null && (ar(i, 1, t), fn(i, t));
            break;
          }
        }
        i = i.return;
      }
  }
  function kp(t, i, h) {
    var m = t.pingCache;
    m !== null && m.delete(i), i = sn(), t.pingedLanes |= t.suspendedLanes & h, bt === t && (Ht & h) === h && (Dt === 4 || Dt === 3 && (Ht & 130023424) === Ht && 500 > gt() - Ul ? hi(t, 0) : kl |= h), fn(t, i);
  }
  function kf(t, i) {
    i === 0 && (t.mode & 1 ? (i = wr, wr <<= 1, !(wr & 130023424) && (wr = 4194304)) : i = 1);
    var h = sn();
    t = la(t, i), t !== null && (ar(t, i, h), fn(t, h));
  }
  function Up(t) {
    var i = t.memoizedState, h = 0;
    i !== null && (h = i.retryLane), kf(t, h);
  }
  function Dp(t, i) {
    var h = 0;
    switch (t.tag) {
      case 13:
        var m = t.stateNode, y = t.memoizedState;
        y !== null && (h = y.retryLane);
        break;
      case 19:
        m = t.stateNode;
        break;
      default:
        throw Error(o(314));
    }
    m !== null && m.delete(i), kf(t, h);
  }
  var Uf;
  Uf = function(t, i, h) {
    if (t !== null)
      if (t.memoizedProps !== i.pendingProps || It.current)
        Cn = !0;
      else {
        if (!(t.lanes & h) && !(i.flags & 128))
          return Cn = !1, wp(t, i, h);
        Cn = !!(t.flags & 131072);
      }
    else
      Cn = !1, mt && i.flags & 1048576 && yc(i, ks, i.index);
    switch (i.lanes = 0, i.tag) {
      case 2:
        var m = i.type;
        t !== null && (t.alternate = null, i.alternate = null, i.flags |= 2), t = i.pendingProps;
        var y = bn(i, Ut.current);
        At(i, h), y = fl(null, i, m, t, y, h);
        var w = dl();
        return i.flags |= 1, typeof y == "object" && y !== null && typeof y.render == "function" && y.$$typeof === void 0 ? (i.tag = 1, i.memoizedState = null, i.updateQueue = null, Ot(m) ? (w = !0, Fr(i)) : w = !1, i.memoizedState = y.state !== null && y.state !== void 0 ? y.state : null, Ja(i), y.updater = Ls, i.stateNode = y, y._reactInternals = i, el(i, m, t, h), i = xl(null, i, m, !0, w, h)) : (i.tag = 0, mt && w && tl(i), on(null, i, y, h), i = i.child), i;
      case 16:
        m = i.elementType;
        e: {
          switch (t !== null && (t.alternate = null, i.alternate = null, i.flags |= 2), t = i.pendingProps, y = m._init, m = y(m._payload), i.type = m, y = i.tag = Ip(m), t = nn(m, t), y) {
            case 0:
              i = yl(null, i, m, t, h);
              break e;
            case 1:
              i = nf(
                null,
                i,
                m,
                t,
                h
              );
              break e;
            case 11:
              i = Zc(null, i, m, t, h);
              break e;
            case 14:
              i = Jc(null, i, m, nn(m.type, t), h);
              break e;
          }
          throw Error(o(306, m, ""));
        }
        return i;
      case 0:
        return m = i.type, y = i.pendingProps, y = i.elementType === m ? y : nn(m, y), yl(t, i, m, y, h);
      case 1:
        return m = i.type, y = i.pendingProps, y = i.elementType === m ? y : nn(m, y), nf(t, i, m, y, h);
      case 3:
        e: {
          if (rf(i), t === null)
            throw Error(o(387));
          m = i.pendingProps, w = i.memoizedState, y = w.element, fc(t, i), bs(i, m, null, h);
          var D = i.memoizedState;
          if (m = D.element, fe && w.isDehydrated)
            if (w = {
              element: m,
              isDehydrated: !1,
              cache: D.cache,
              transitions: D.transitions
            }, i.updateQueue.baseState = w, i.memoizedState = w, i.flags & 256) {
              y = Error(o(423)), i = of(t, i, m, h, y);
              break e;
            } else if (m !== y) {
              y = Error(o(424)), i = of(t, i, m, h, y);
              break e;
            } else
              for (fe && (An = Gt(i.stateNode.containerInfo), En = i, mt = !0, Jn = null, Do = !1), h = Ec(i, null, m, h), i.child = h; h; )
                h.flags = h.flags & -3 | 4096, h = h.sibling;
          else {
            if (Bi(), m === y) {
              i = br(t, i, h);
              break e;
            }
            on(t, i, m, h);
          }
          i = i.child;
        }
        return i;
      case 5:
        return Ac(i), t === null && il(i), m = i.type, y = i.pendingProps, w = t !== null ? t.memoizedProps : null, D = y.children, Y(m, y) ? D = null : w !== null && Y(m, w) && (i.flags |= 32), tf(t, i), on(t, i, D, h), i.child;
      case 6:
        return t === null && il(i), null;
      case 13:
        return sf(t, i, h);
      case 4:
        return sl(i, i.stateNode.containerInfo), m = i.pendingProps, t === null ? i.child = zi(i, null, m, h) : on(t, i, m, h), i.child;
      case 11:
        return m = i.type, y = i.pendingProps, y = i.elementType === m ? y : nn(m, y), Zc(t, i, m, y, h);
      case 7:
        return on(t, i, i.pendingProps, h), i.child;
      case 8:
        return on(t, i, i.pendingProps.children, h), i.child;
      case 12:
        return on(t, i, i.pendingProps.children, h), i.child;
      case 10:
        e: {
          if (m = i.type._context, y = i.pendingProps, w = i.memoizedProps, D = y.value, Ps(i, m, D), w !== null)
            if (_n(w.value, D)) {
              if (w.children === y.children && !It.current) {
                i = br(t, i, h);
                break e;
              }
            } else
              for (w = i.child, w !== null && (w.return = i); w !== null; ) {
                var z = w.dependencies;
                if (z !== null) {
                  D = w.child;
                  for (var ne = z.firstContext; ne !== null; ) {
                    if (ne.context === m) {
                      if (w.tag === 1) {
                        ne = Ar(-1, h & -h), ne.tag = 2;
                        var he = w.updateQueue;
                        if (he !== null) {
                          he = he.shared;
                          var Ce = he.pending;
                          Ce === null ? ne.next = ne : (ne.next = Ce.next, Ce.next = ne), he.pending = ne;
                        }
                      }
                      w.lanes |= h, ne = w.alternate, ne !== null && (ne.lanes |= h), rn(w.return, h, i), z.lanes |= h;
                      break;
                    }
                    ne = ne.next;
                  }
                } else if (w.tag === 10)
                  D = w.type === i.type ? null : w.child;
                else if (w.tag === 18) {
                  if (D = w.return, D === null)
                    throw Error(o(341));
                  D.lanes |= h, z = D.alternate, z !== null && (z.lanes |= h), rn(D, h, i), D = w.sibling;
                } else
                  D = w.child;
                if (D !== null)
                  D.return = w;
                else
                  for (D = w; D !== null; ) {
                    if (D === i) {
                      D = null;
                      break;
                    }
                    if (w = D.sibling, w !== null) {
                      w.return = D.return, D = w;
                      break;
                    }
                    D = D.return;
                  }
                w = D;
              }
          on(t, i, y.children, h), i = i.child;
        }
        return i;
      case 9:
        return y = i.type, m = i.pendingProps.children, At(i, h), y = Ct(y), m = m(y), i.flags |= 1, on(t, i, m, h), i.child;
      case 14:
        return m = i.type, y = nn(m, i.pendingProps), y = nn(m.type, y), Jc(t, i, m, y, h);
      case 15:
        return $c(t, i, i.type, i.pendingProps, h);
      case 17:
        return m = i.type, y = i.pendingProps, y = i.elementType === m ? y : nn(m, y), t !== null && (t.alternate = null, i.alternate = null, i.flags |= 2), i.tag = 1, Ot(m) ? (t = !0, Fr(i)) : t = !1, At(i, h), vc(i, m, y), el(i, m, y, h), xl(null, i, m, !0, t, h);
      case 19:
        return cf(t, i, h);
      case 22:
        return ef(t, i, h);
    }
    throw Error(o(156, i.tag));
  };
  function Df(t, i) {
    return Er(t, i);
  }
  function Fp(t, i, h, m) {
    this.tag = t, this.key = h, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = i, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = m, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function In(t, i, h, m) {
    return new Fp(t, i, h, m);
  }
  function jl(t) {
    return t = t.prototype, !(!t || !t.isReactComponent);
  }
  function Ip(t) {
    if (typeof t == "function")
      return jl(t) ? 1 : 0;
    if (t != null) {
      if (t = t.$$typeof, t === E)
        return 11;
      if (t === A)
        return 14;
    }
    return 2;
  }
  function Vr(t, i) {
    var h = t.alternate;
    return h === null ? (h = In(t.tag, i, t.key, t.mode), h.elementType = t.elementType, h.type = t.type, h.stateNode = t.stateNode, h.alternate = t, t.alternate = h) : (h.pendingProps = i, h.type = t.type, h.flags = 0, h.subtreeFlags = 0, h.deletions = null), h.flags = t.flags & 14680064, h.childLanes = t.childLanes, h.lanes = t.lanes, h.child = t.child, h.memoizedProps = t.memoizedProps, h.memoizedState = t.memoizedState, h.updateQueue = t.updateQueue, i = t.dependencies, h.dependencies = i === null ? null : { lanes: i.lanes, firstContext: i.firstContext }, h.sibling = t.sibling, h.index = t.index, h.ref = t.ref, h;
  }
  function ca(t, i, h, m, y, w) {
    var D = 2;
    if (m = t, typeof t == "function")
      jl(t) && (D = 1);
    else if (typeof t == "string")
      D = 5;
    else
      e:
        switch (t) {
          case d:
            return vi(h.children, y, w, i);
          case p:
            D = 8, y |= 8;
            break;
          case v:
            return t = In(12, h, i, y | 2), t.elementType = v, t.lanes = w, t;
          case _:
            return t = In(13, h, i, y), t.elementType = _, t.lanes = w, t;
          case S:
            return t = In(19, h, i, y), t.elementType = S, t.lanes = w, t;
          case C:
            return fa(h, y, w, i);
          default:
            if (typeof t == "object" && t !== null)
              switch (t.$$typeof) {
                case g:
                  D = 10;
                  break e;
                case x:
                  D = 9;
                  break e;
                case E:
                  D = 11;
                  break e;
                case A:
                  D = 14;
                  break e;
                case T:
                  D = 16, m = null;
                  break e;
              }
            throw Error(o(130, t == null ? t : typeof t, ""));
        }
    return i = In(D, h, i, y), i.elementType = t, i.type = m, i.lanes = w, i;
  }
  function vi(t, i, h, m) {
    return t = In(7, t, m, i), t.lanes = h, t;
  }
  function fa(t, i, h, m) {
    return t = In(22, t, m, i), t.elementType = C, t.lanes = h, t.stateNode = {}, t;
  }
  function Gl(t, i, h) {
    return t = In(6, t, null, i), t.lanes = h, t;
  }
  function Hl(t, i, h) {
    return i = In(4, t.children !== null ? t.children : [], t.key, i), i.lanes = h, i.stateNode = { containerInfo: t.containerInfo, pendingChildren: null, implementation: t.implementation }, i;
  }
  function Op(t, i, h, m, y) {
    this.tag = i, this.containerInfo = t, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = re, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Ui(0), this.expirationTimes = Ui(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ui(0), this.identifierPrefix = m, this.onRecoverableError = y, fe && (this.mutableSourceEagerHydrationData = null);
  }
  function Ff(t, i, h, m, y, w, D, z, ne) {
    return t = new Op(t, i, h, z, ne), i === 1 ? (i = 1, w === !0 && (i |= 8)) : i = 0, w = In(3, null, null, i), t.current = w, w.stateNode = t, w.memoizedState = { element: m, isDehydrated: h, cache: null, transitions: null }, Ja(w), t;
  }
  function If(t) {
    if (!t)
      return yn;
    t = t._reactInternals;
    e: {
      if (U(t) !== t || t.tag !== 1)
        throw Error(o(170));
      var i = t;
      do {
        switch (i.tag) {
          case 3:
            i = i.stateNode.context;
            break e;
          case 1:
            if (Ot(i.type)) {
              i = i.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        i = i.return;
      } while (i !== null);
      throw Error(o(171));
    }
    if (t.tag === 1) {
      var h = t.type;
      if (Ot(h))
        return Ri(t, h, i);
    }
    return i;
  }
  function Of(t) {
    var i = t._reactInternals;
    if (i === void 0)
      throw typeof t.render == "function" ? Error(o(188)) : (t = Object.keys(t).join(","), Error(o(268, t)));
    return t = k(i), t === null ? null : t.stateNode;
  }
  function Nf(t, i) {
    if (t = t.memoizedState, t !== null && t.dehydrated !== null) {
      var h = t.retryLane;
      t.retryLane = h !== 0 && h < i ? h : i;
    }
  }
  function Vl(t, i) {
    Nf(t, i), (t = t.alternate) && Nf(t, i);
  }
  function Np(t) {
    return t = k(t), t === null ? null : t.stateNode;
  }
  function Bp() {
    return null;
  }
  return s.attemptContinuousHydration = function(t) {
    if (t.tag === 13) {
      var i = sn();
      Fn(t, 134217728, i), Vl(t, 134217728);
    }
  }, s.attemptHydrationAtCurrentPriority = function(t) {
    if (t.tag === 13) {
      var i = sn(), h = Gr(t);
      Fn(t, h, i), Vl(t, h);
    }
  }, s.attemptSynchronousHydration = function(t) {
    switch (t.tag) {
      case 3:
        var i = t.stateNode;
        if (i.current.memoizedState.isDehydrated) {
          var h = _r(i.pendingLanes);
          h !== 0 && (lr(i, h | 1), fn(i, gt()), !(Ze & 6) && (Xi(), un()));
        }
        break;
      case 13:
        var m = sn();
        Cf(function() {
          return Fn(t, 1, m);
        }), Vl(t, 1);
    }
  }, s.batchedUpdates = function(t, i) {
    var h = Ze;
    Ze |= 1;
    try {
      return t(i);
    } finally {
      Ze = h, Ze === 0 && (Xi(), ur && un());
    }
  }, s.createComponentSelector = function(t) {
    return { $$typeof: qs, value: t };
  }, s.createContainer = function(t, i, h, m, y, w, D) {
    return Ff(t, i, !1, null, h, m, y, w, D);
  }, s.createHasPseudoClassSelector = function(t) {
    return { $$typeof: Zs, value: t };
  }, s.createHydrationContainer = function(t, i, h, m, y, w, D, z, ne) {
    return t = Ff(h, m, !0, t, y, w, D, z, ne), t.context = If(null), h = t.current, m = sn(), y = Gr(h), w = Ar(m, y), w.callback = i ?? null, Br(h, w), t.current.lanes = y, ar(t, y, m), fn(t, m), t;
  }, s.createPortal = function(t, i, h) {
    var m = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: f, key: m == null ? null : "" + m, children: t, containerInfo: i, implementation: h };
  }, s.createRoleSelector = function(t) {
    return { $$typeof: Js, value: t };
  }, s.createTestNameSelector = function(t) {
    return { $$typeof: $s, value: t };
  }, s.createTextSelector = function(t) {
    return { $$typeof: ea, value: t };
  }, s.deferredUpdates = function(t) {
    var i = Je, h = Pt.transition;
    try {
      return Pt.transition = null, Je = 16, t();
    } finally {
      Je = i, Pt.transition = h;
    }
  }, s.discreteUpdates = function(t, i, h, m, y) {
    var w = Je, D = Pt.transition;
    try {
      return Pt.transition = null, Je = 1, t(i, h, m, y);
    } finally {
      Je = w, Pt.transition = D, Ze === 0 && Xi();
    }
  }, s.findAllNodes = Ll, s.findBoundingRects = function(t, i) {
    if (!Te)
      throw Error(o(363));
    i = Ll(t, i), t = [];
    for (var h = 0; h < i.length; h++)
      t.push(je(i[h]));
    for (i = t.length - 1; 0 < i; i--) {
      h = t[i];
      for (var m = h.x, y = m + h.width, w = h.y, D = w + h.height, z = i - 1; 0 <= z; z--)
        if (i !== z) {
          var ne = t[z], he = ne.x, Ce = he + ne.width, He = ne.y, Ne = He + ne.height;
          if (m >= he && w >= He && y <= Ce && D <= Ne) {
            t.splice(i, 1);
            break;
          } else if (m !== he || h.width !== ne.width || Ne < w || He > D) {
            if (!(w !== He || h.height !== ne.height || Ce < m || he > y)) {
              he > m && (ne.width += he - m, ne.x = m), Ce < y && (ne.width = y - he), t.splice(i, 1);
              break;
            }
          } else {
            He > w && (ne.height += He - w, ne.y = w), Ne < D && (ne.height = D - He), t.splice(i, 1);
            break;
          }
        }
    }
    return t;
  }, s.findHostInstance = Of, s.findHostInstanceWithNoPortals = function(t) {
    return t = I(t), t = t !== null ? N(t) : null, t === null ? null : t.stateNode;
  }, s.findHostInstanceWithWarning = function(t) {
    return Of(t);
  }, s.flushControlled = function(t) {
    var i = Ze;
    Ze |= 1;
    var h = Pt.transition, m = Je;
    try {
      Pt.transition = null, Je = 1, t();
    } finally {
      Je = m, Pt.transition = h, Ze = i, Ze === 0 && (Xi(), un());
    }
  }, s.flushPassiveEffects = mi, s.flushSync = Cf, s.focusWithin = function(t, i) {
    if (!Te)
      throw Error(o(363));
    for (t = Pl(t), i = Tf(t, i), i = Array.from(i), t = 0; t < i.length; ) {
      var h = i[t++];
      if (!Ee(h)) {
        if (h.tag === 5 && tt(h.stateNode))
          return !0;
        for (h = h.child; h !== null; )
          i.push(h), h = h.sibling;
      }
    }
    return !1;
  }, s.getCurrentUpdatePriority = function() {
    return Je;
  }, s.getFindAllNodesFailureDescription = function(t, i) {
    if (!Te)
      throw Error(o(363));
    var h = 0, m = [];
    t = [Pl(t), 0];
    for (var y = 0; y < t.length; ) {
      var w = t[y++], D = t[y++], z = i[D];
      if ((w.tag !== 5 || !Ee(w)) && (Ml(w, z) && (m.push(bl(z)), D++, D > h && (h = D)), D < i.length))
        for (w = w.child; w !== null; )
          t.push(w, D), w = w.sibling;
    }
    if (h < i.length) {
      for (t = []; h < i.length; h++)
        t.push(bl(i[h]));
      return `findAllNodes was able to match part of the selector:
  ` + (m.join(" > ") + `

No matching component was found for:
  `) + t.join(" > ");
    }
    return null;
  }, s.getPublicRootInstance = function(t) {
    if (t = t.current, !t.child)
      return null;
    switch (t.child.tag) {
      case 5:
        return Z(t.child.stateNode);
      default:
        return t.child.stateNode;
    }
  }, s.injectIntoDevTools = function(t) {
    if (t = { bundleType: t.bundleType, version: t.version, rendererPackageName: t.rendererPackageName, rendererConfig: t.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: u.ReactCurrentDispatcher, findHostInstanceByFiber: Np, findFiberByHostInstance: t.findFiberByHostInstance || Bp, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.0.0-fc46dba67-20220329" }, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u")
      t = !1;
    else {
      var i = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (i.isDisabled || !i.supportsFiber)
        t = !0;
      else {
        try {
          ii = i.inject(t), wn = i;
        } catch {
        }
        t = !!i.checkDCE;
      }
    }
    return t;
  }, s.isAlreadyRendering = function() {
    return !1;
  }, s.observeVisibleRects = function(t, i, h, m) {
    if (!Te)
      throw Error(o(363));
    t = Ll(t, i);
    var y = be(t, h, m).disconnect;
    return { disconnect: function() {
      y();
    } };
  }, s.registerMutableSourceForHydration = function(t, i) {
    var h = i._getVersion;
    h = h(i._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [i, h] : t.mutableSourceEagerHydrationData.push(i, h);
  }, s.runWithPriority = function(t, i) {
    var h = Je;
    try {
      return Je = t, i();
    } finally {
      Je = h;
    }
  }, s.shouldError = function() {
    return null;
  }, s.shouldSuspend = function() {
    return !1;
  }, s.updateContainer = function(t, i, h, m) {
    var y = i.current, w = sn(), D = Gr(y);
    return h = If(h), i.context === null ? i.context = h : i.pendingContext = h, i = Ar(w, D), i.payload = { element: t }, m = m === void 0 ? null : m, m !== null && (i.callback = m), Br(y, i), t = Fn(y, D, w), t !== null && Ms(t, y, D), D;
  }, s;
};
gh.exports = Xm;
var Km = gh.exports;
const Ym = /* @__PURE__ */ jp(Km), Ju = {}, $u = (c) => void Object.assign(Ju, c);
function Qm(c, e) {
  function s(d, {
    args: p = [],
    attach: v,
    ...g
  }, x) {
    let E = `${d[0].toUpperCase()}${d.slice(1)}`, _;
    if (d === "primitive") {
      if (g.object === void 0)
        throw new Error("R3F: Primitives without 'object' are invalid!");
      const S = g.object;
      _ = uo(S, {
        type: d,
        root: x,
        attach: v,
        primitive: !0
      });
    } else {
      const S = Ju[E];
      if (!S)
        throw new Error(`R3F: ${E} is not part of the THREE namespace! Did you forget to extend? See: https://docs.pmnd.rs/react-three-fiber/api/objects#using-3rd-party-objects-declaratively`);
      if (!Array.isArray(p))
        throw new Error("R3F: The args prop must be an array!");
      _ = uo(new S(...p), {
        type: d,
        root: x,
        attach: v,
        // Save args in case we need to reconstruct later for HMR
        memoizedProps: {
          args: p
        }
      });
    }
    return _.__r3f.attach === void 0 && (_.isBufferGeometry ? _.__r3f.attach = "geometry" : _.isMaterial && (_.__r3f.attach = "material")), E !== "inject" && ql(_, g), _;
  }
  function a(d, p) {
    let v = !1;
    if (p) {
      var g, x;
      (g = p.__r3f) != null && g.attach ? Ql(d, p, p.__r3f.attach) : p.isObject3D && d.isObject3D && (d.add(p), v = !0), v || (x = d.__r3f) == null || x.objects.push(p), p.__r3f || uo(p, {}), p.__r3f.parent = d, bu(p), co(p);
    }
  }
  function r(d, p, v) {
    let g = !1;
    if (p) {
      var x, E;
      if ((x = p.__r3f) != null && x.attach)
        Ql(d, p, p.__r3f.attach);
      else if (p.isObject3D && d.isObject3D) {
        p.parent = d, p.dispatchEvent({
          type: "added"
        }), d.dispatchEvent({
          type: "childadded",
          child: p
        });
        const _ = d.children.filter((A) => A !== p), S = _.indexOf(v);
        d.children = [..._.slice(0, S), p, ..._.slice(S)], g = !0;
      }
      g || (E = d.__r3f) == null || E.objects.push(p), p.__r3f || uo(p, {}), p.__r3f.parent = d, bu(p), co(p);
    }
  }
  function n(d, p, v = !1) {
    d && [...d].forEach((g) => o(p, g, v));
  }
  function o(d, p, v) {
    if (p) {
      var g, x, E;
      if (p.__r3f && (p.__r3f.parent = null), (g = d.__r3f) != null && g.objects && (d.__r3f.objects = d.__r3f.objects.filter((C) => C !== p)), (x = p.__r3f) != null && x.attach)
        Qf(d, p, p.__r3f.attach);
      else if (p.isObject3D && d.isObject3D) {
        var _;
        d.remove(p), (_ = p.__r3f) != null && _.root && nv(Na(p), p);
      }
      const A = (E = p.__r3f) == null ? void 0 : E.primitive, T = !A && (v === void 0 ? p.dispose !== null : v);
      if (!A) {
        var S;
        n((S = p.__r3f) == null ? void 0 : S.objects, p, T), n(p.children, p, T);
      }
      if (delete p.__r3f, T && p.dispose && p.type !== "Scene") {
        const C = () => {
          try {
            p.dispose();
          } catch {
          }
        };
        typeof IS_REACT_ACT_ENVIRONMENT > "u" ? Pu.unstable_scheduleCallback(Pu.unstable_IdlePriority, C) : C();
      }
      co(d);
    }
  }
  function u(d, p, v, g) {
    var x;
    const E = (x = d.__r3f) == null ? void 0 : x.parent;
    if (!E)
      return;
    const _ = s(p, v, d.__r3f.root);
    if (d.children) {
      for (const S of d.children)
        S.__r3f && a(_, S);
      d.children = d.children.filter((S) => !S.__r3f);
    }
    d.__r3f.objects.forEach((S) => a(_, S)), d.__r3f.objects = [], d.__r3f.autoRemovedBeforeAppend || o(E, d), _.parent && (_.__r3f.autoRemovedBeforeAppend = !0), a(E, _), _.raycast && _.__r3f.eventCount && Na(_).getState().internal.interaction.push(_), [g, g.alternate].forEach((S) => {
      S !== null && (S.stateNode = _, S.ref && (typeof S.ref == "function" ? S.ref(_) : S.ref.current = _));
    });
  }
  const l = () => {
  };
  return {
    reconciler: Ym({
      createInstance: s,
      removeChild: o,
      appendChild: a,
      appendInitialChild: a,
      insertBefore: r,
      supportsMutation: !0,
      isPrimaryRenderer: !1,
      supportsPersistence: !1,
      supportsHydration: !1,
      noTimeout: -1,
      appendChildToContainer: (d, p) => {
        if (!p)
          return;
        const v = d.getState().scene;
        v.__r3f && (v.__r3f.root = d, a(v, p));
      },
      removeChildFromContainer: (d, p) => {
        p && o(d.getState().scene, p);
      },
      insertInContainerBefore: (d, p, v) => {
        if (!p || !v)
          return;
        const g = d.getState().scene;
        g.__r3f && r(g, p, v);
      },
      getRootHostContext: () => null,
      getChildHostContext: (d) => d,
      finalizeInitialChildren(d) {
        var p;
        return !!((p = d?.__r3f) != null ? p : {}).handlers;
      },
      prepareUpdate(d, p, v, g) {
        var x;
        if (((x = d?.__r3f) != null ? x : {}).primitive && g.object && g.object !== d)
          return [!0];
        {
          const {
            args: _ = [],
            children: S,
            ...A
          } = g, {
            args: T = [],
            children: C,
            ...P
          } = v;
          if (!Array.isArray(_))
            throw new Error("R3F: the args prop must be an array!");
          if (_.some((b, L) => b !== T[L]))
            return [!0];
          const M = Ch(d, A, P, !0);
          return M.changes.length ? [!1, M] : null;
        }
      },
      commitUpdate(d, [p, v], g, x, E, _) {
        p ? u(d, g, E, _) : ql(d, v);
      },
      commitMount(d, p, v, g) {
        var x;
        const E = (x = d.__r3f) != null ? x : {};
        d.raycast && E.handlers && E.eventCount && Na(d).getState().internal.interaction.push(d);
      },
      getPublicInstance: (d) => d,
      prepareForCommit: () => null,
      preparePortalMount: (d) => uo(d.getState().scene),
      resetAfterCommit: () => {
      },
      shouldSetTextContent: () => !1,
      clearContainer: () => !1,
      hideInstance(d) {
        var p;
        const {
          attach: v,
          parent: g
        } = (p = d.__r3f) != null ? p : {};
        v && g && Qf(g, d, v), d.isObject3D && (d.visible = !1), co(d);
      },
      unhideInstance(d, p) {
        var v;
        const {
          attach: g,
          parent: x
        } = (v = d.__r3f) != null ? v : {};
        g && x && Ql(x, d, g), (d.isObject3D && p.visible == null || p.visible) && (d.visible = !0), co(d);
      },
      createTextInstance: l,
      hideTextInstance: l,
      unhideTextInstance: l,
      // https://github.com/pmndrs/react-three-fiber/pull/2360#discussion_r916356874
      // @ts-expect-error
      getCurrentEventPriority: () => e ? e() : ho.DefaultEventPriority,
      beforeActiveInstanceBlur: () => {
      },
      afterActiveInstanceBlur: () => {
      },
      detachDeletedInstance: () => {
      },
      now: typeof performance < "u" && dt.fun(performance.now) ? performance.now : dt.fun(Date.now) ? Date.now : () => 0,
      // https://github.com/pmndrs/react-three-fiber/pull/2360#discussion_r920883503
      scheduleTimeout: dt.fun(setTimeout) ? setTimeout : void 0,
      cancelTimeout: dt.fun(clearTimeout) ? clearTimeout : void 0
    }),
    applyProps: ql
  };
}
var Wf, Xf;
const Yl = (c) => "colorSpace" in c || "outputColorSpace" in c, Sh = () => {
  var c;
  return (c = Ju.ColorManagement) != null ? c : null;
}, wh = (c) => c && c.isOrthographicCamera, qm = (c) => c && c.hasOwnProperty("current"), ys = typeof window < "u" && ((Wf = window.document) != null && Wf.createElement || ((Xf = window.navigator) == null ? void 0 : Xf.product) === "ReactNative") ? te.useLayoutEffect : te.useEffect;
function _h(c) {
  const e = te.useRef(c);
  return ys(() => void (e.current = c), [c]), e;
}
function Zm({
  set: c
}) {
  return ys(() => (c(new Promise(() => null)), () => c(!1)), [c]), null;
}
class Th extends te.Component {
  constructor(...e) {
    super(...e), this.state = {
      error: !1
    };
  }
  componentDidCatch(e) {
    this.props.set(e);
  }
  render() {
    return this.state.error ? null : this.props.children;
  }
}
Th.getDerivedStateFromError = () => ({
  error: !0
});
const Eh = "__default", Kf = /* @__PURE__ */ new Map(), Jm = (c) => c && !!c.memoized && !!c.changes;
function Ah(c) {
  var e;
  const s = typeof window < "u" ? (e = window.devicePixelRatio) != null ? e : 2 : 1;
  return Array.isArray(c) ? Math.min(Math.max(c[0], s), c[1]) : c;
}
const Zo = (c) => {
  var e;
  return (e = c.__r3f) == null ? void 0 : e.root.getState();
};
function Na(c) {
  let e = c.__r3f.root;
  for (; e.getState().previousRoot; )
    e = e.getState().previousRoot;
  return e;
}
const dt = {
  obj: (c) => c === Object(c) && !dt.arr(c) && typeof c != "function",
  fun: (c) => typeof c == "function",
  str: (c) => typeof c == "string",
  num: (c) => typeof c == "number",
  boo: (c) => typeof c == "boolean",
  und: (c) => c === void 0,
  arr: (c) => Array.isArray(c),
  equ(c, e, {
    arrays: s = "shallow",
    objects: a = "reference",
    strict: r = !0
  } = {}) {
    if (typeof c != typeof e || !!c != !!e)
      return !1;
    if (dt.str(c) || dt.num(c) || dt.boo(c))
      return c === e;
    const n = dt.obj(c);
    if (n && a === "reference")
      return c === e;
    const o = dt.arr(c);
    if (o && s === "reference")
      return c === e;
    if ((o || n) && c === e)
      return !0;
    let u;
    for (u in c)
      if (!(u in e))
        return !1;
    if (n && s === "shallow" && a === "shallow") {
      for (u in r ? e : c)
        if (!dt.equ(c[u], e[u], {
          strict: r,
          objects: "reference"
        }))
          return !1;
    } else
      for (u in r ? e : c)
        if (c[u] !== e[u])
          return !1;
    if (dt.und(u)) {
      if (o && c.length === 0 && e.length === 0 || n && Object.keys(c).length === 0 && Object.keys(e).length === 0)
        return !0;
      if (c !== e)
        return !1;
    }
    return !0;
  }
};
function $m(c) {
  c.dispose && c.type !== "Scene" && c.dispose();
  for (const e in c)
    e.dispose == null || e.dispose(), delete c[e];
}
function uo(c, e) {
  const s = c;
  return s.__r3f = {
    type: "",
    root: null,
    previousAttach: null,
    memoizedProps: {},
    eventCount: 0,
    handlers: {},
    objects: [],
    parent: null,
    ...e
  }, c;
}
function Mu(c, e) {
  let s = c;
  if (e.includes("-")) {
    const a = e.split("-"), r = a.pop();
    return s = a.reduce((n, o) => n[o], c), {
      target: s,
      key: r
    };
  } else
    return {
      target: s,
      key: e
    };
}
const Yf = /-\d+$/;
function Ql(c, e, s) {
  if (dt.str(s)) {
    if (Yf.test(s)) {
      const n = s.replace(Yf, ""), {
        target: o,
        key: u
      } = Mu(c, n);
      Array.isArray(o[u]) || (o[u] = []);
    }
    const {
      target: a,
      key: r
    } = Mu(c, s);
    e.__r3f.previousAttach = a[r], a[r] = e;
  } else
    e.__r3f.previousAttach = s(c, e);
}
function Qf(c, e, s) {
  var a, r;
  if (dt.str(s)) {
    const {
      target: n,
      key: o
    } = Mu(c, s), u = e.__r3f.previousAttach;
    u === void 0 ? delete n[o] : n[o] = u;
  } else
    (a = e.__r3f) == null || a.previousAttach == null || a.previousAttach(c, e);
  (r = e.__r3f) == null || delete r.previousAttach;
}
function Ch(c, {
  children: e,
  key: s,
  ref: a,
  ...r
}, {
  children: n,
  key: o,
  ref: u,
  ...l
} = {}, f = !1) {
  const d = c.__r3f, p = Object.entries(r), v = [];
  if (f) {
    const x = Object.keys(l);
    for (let E = 0; E < x.length; E++)
      r.hasOwnProperty(x[E]) || p.unshift([x[E], Eh + "remove"]);
  }
  p.forEach(([x, E]) => {
    var _;
    if ((_ = c.__r3f) != null && _.primitive && x === "object" || dt.equ(E, l[x]))
      return;
    if (/^on(Pointer|Click|DoubleClick|ContextMenu|Wheel)/.test(x))
      return v.push([x, E, !0, []]);
    let S = [];
    x.includes("-") && (S = x.split("-")), v.push([x, E, !1, S]);
    for (const A in r) {
      const T = r[A];
      A.startsWith(`${x}-`) && v.push([A, T, !1, A.split("-")]);
    }
  });
  const g = {
    ...r
  };
  return d != null && d.memoizedProps && d != null && d.memoizedProps.args && (g.args = d.memoizedProps.args), d != null && d.memoizedProps && d != null && d.memoizedProps.attach && (g.attach = d.memoizedProps.attach), {
    memoized: g,
    changes: v
  };
}
const ev = typeof process < "u" && !1;
function ql(c, e) {
  var s;
  const a = c.__r3f, r = a?.root, n = r == null || r.getState == null ? void 0 : r.getState(), {
    memoized: o,
    changes: u
  } = Jm(e) ? e : Ch(c, e), l = a?.eventCount;
  c.__r3f && (c.__r3f.memoizedProps = o);
  for (let v = 0; v < u.length; v++) {
    let [g, x, E, _] = u[v];
    if (Yl(c)) {
      const C = "srgb", P = "srgb-linear";
      g === "encoding" ? (g = "colorSpace", x = x === 3001 ? C : P) : g === "outputEncoding" && (g = "outputColorSpace", x = x === 3001 ? C : P);
    }
    let S = c, A = S[g];
    if (_.length && (A = _.reduce((T, C) => T[C], c), !(A && A.set))) {
      const [T, ...C] = _.reverse();
      S = C.reverse().reduce((P, M) => P[M], c), g = T;
    }
    if (x === Eh + "remove")
      if (S.constructor) {
        let T = Kf.get(S.constructor);
        T || (T = new S.constructor(), Kf.set(S.constructor, T)), x = T[g];
      } else
        x = 0;
    if (E && a)
      x ? a.handlers[g] = x : delete a.handlers[g], a.eventCount = Object.keys(a.handlers).length;
    else if (A && A.set && (A.copy || A instanceof Xl)) {
      if (Array.isArray(x))
        A.fromArray ? A.fromArray(x) : A.set(...x);
      else if (A.copy && x && x.constructor && // Some environments may break strict identity checks by duplicating versions of three.js.
      // Loosen to unminified names, ignoring descendents.
      // https://github.com/pmndrs/react-three-fiber/issues/2856
      // TODO: fix upstream and remove in v9
      (ev ? A.constructor.name === x.constructor.name : A.constructor === x.constructor))
        A.copy(x);
      else if (x !== void 0) {
        var f;
        const T = (f = A) == null ? void 0 : f.isColor;
        !T && A.setScalar ? A.setScalar(x) : A instanceof Xl && x instanceof Xl ? A.mask = x.mask : A.set(x), !Sh() && n && !n.linear && T && A.convertSRGBToLinear();
      }
    } else {
      var d;
      if (S[g] = x, (d = S[g]) != null && d.isTexture && // sRGB textures must be RGBA8 since r137 https://github.com/mrdoob/three.js/pull/23129
      S[g].format === Vp && S[g].type === Wp && n) {
        const T = S[g];
        Yl(T) && Yl(n.gl) ? T.colorSpace = n.gl.outputColorSpace : T.encoding = n.gl.outputEncoding;
      }
    }
    co(c);
  }
  if (a && a.parent && c.raycast && l !== a.eventCount) {
    const v = Na(c).getState().internal, g = v.interaction.indexOf(c);
    g > -1 && v.interaction.splice(g, 1), a.eventCount && v.interaction.push(c);
  }
  return !(u.length === 1 && u[0][0] === "onUpdate") && u.length && (s = c.__r3f) != null && s.parent && bu(c), c;
}
function co(c) {
  var e, s;
  const a = (e = c.__r3f) == null || (s = e.root) == null || s.getState == null ? void 0 : s.getState();
  a && a.internal.frames === 0 && a.invalidate();
}
function bu(c) {
  c.onUpdate == null || c.onUpdate(c);
}
function Ph(c, e) {
  c.manual || (wh(c) ? (c.left = e.width / -2, c.right = e.width / 2, c.top = e.height / 2, c.bottom = e.height / -2) : c.aspect = e.width / e.height, c.updateProjectionMatrix(), c.updateMatrixWorld());
}
function ha(c) {
  return (c.eventObject || c.object).uuid + "/" + c.index + c.instanceId;
}
function tv() {
  var c;
  const e = typeof self < "u" && self || typeof window < "u" && window;
  if (!e)
    return ho.DefaultEventPriority;
  switch ((c = e.event) == null ? void 0 : c.type) {
    case "click":
    case "contextmenu":
    case "dblclick":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
      return ho.DiscreteEventPriority;
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "pointerenter":
    case "pointerleave":
    case "wheel":
      return ho.ContinuousEventPriority;
    default:
      return ho.DefaultEventPriority;
  }
}
function Mh(c, e, s, a) {
  const r = s.get(e);
  r && (s.delete(e), s.size === 0 && (c.delete(a), r.target.releasePointerCapture(a)));
}
function nv(c, e) {
  const {
    internal: s
  } = c.getState();
  s.interaction = s.interaction.filter((a) => a !== e), s.initialHits = s.initialHits.filter((a) => a !== e), s.hovered.forEach((a, r) => {
    (a.eventObject === e || a.object === e) && s.hovered.delete(r);
  }), s.capturedMap.forEach((a, r) => {
    Mh(s.capturedMap, e, a, r);
  });
}
function rv(c) {
  function e(l) {
    const {
      internal: f
    } = c.getState(), d = l.offsetX - f.initialClick[0], p = l.offsetY - f.initialClick[1];
    return Math.round(Math.sqrt(d * d + p * p));
  }
  function s(l) {
    return l.filter((f) => ["Move", "Over", "Enter", "Out", "Leave"].some((d) => {
      var p;
      return (p = f.__r3f) == null ? void 0 : p.handlers["onPointer" + d];
    }));
  }
  function a(l, f) {
    const d = c.getState(), p = /* @__PURE__ */ new Set(), v = [], g = f ? f(d.internal.interaction) : d.internal.interaction;
    for (let S = 0; S < g.length; S++) {
      const A = Zo(g[S]);
      A && (A.raycaster.camera = void 0);
    }
    d.previousRoot || d.events.compute == null || d.events.compute(l, d);
    function x(S) {
      const A = Zo(S);
      if (!A || !A.events.enabled || A.raycaster.camera === null)
        return [];
      if (A.raycaster.camera === void 0) {
        var T;
        A.events.compute == null || A.events.compute(l, A, (T = A.previousRoot) == null ? void 0 : T.getState()), A.raycaster.camera === void 0 && (A.raycaster.camera = null);
      }
      return A.raycaster.camera ? A.raycaster.intersectObject(S, !0) : [];
    }
    let E = g.flatMap(x).sort((S, A) => {
      const T = Zo(S.object), C = Zo(A.object);
      return !T || !C ? S.distance - A.distance : C.events.priority - T.events.priority || S.distance - A.distance;
    }).filter((S) => {
      const A = ha(S);
      return p.has(A) ? !1 : (p.add(A), !0);
    });
    d.events.filter && (E = d.events.filter(E, d));
    for (const S of E) {
      let A = S.object;
      for (; A; ) {
        var _;
        (_ = A.__r3f) != null && _.eventCount && v.push({
          ...S,
          eventObject: A
        }), A = A.parent;
      }
    }
    if ("pointerId" in l && d.internal.capturedMap.has(l.pointerId))
      for (let S of d.internal.capturedMap.get(l.pointerId).values())
        p.has(ha(S.intersection)) || v.push(S.intersection);
    return v;
  }
  function r(l, f, d, p) {
    const v = c.getState();
    if (l.length) {
      const g = {
        stopped: !1
      };
      for (const x of l) {
        const E = Zo(x.object) || v, {
          raycaster: _,
          pointer: S,
          camera: A,
          internal: T
        } = E, C = new oe(S.x, S.y, 0).unproject(A), P = (R) => {
          var I, k;
          return (I = (k = T.capturedMap.get(R)) == null ? void 0 : k.has(x.eventObject)) != null ? I : !1;
        }, M = (R) => {
          const I = {
            intersection: x,
            target: f.target
          };
          T.capturedMap.has(R) ? T.capturedMap.get(R).set(x.eventObject, I) : T.capturedMap.set(R, /* @__PURE__ */ new Map([[x.eventObject, I]])), f.target.setPointerCapture(R);
        }, b = (R) => {
          const I = T.capturedMap.get(R);
          I && Mh(T.capturedMap, x.eventObject, I, R);
        };
        let L = {};
        for (let R in f) {
          let I = f[R];
          typeof I != "function" && (L[R] = I);
        }
        let U = {
          ...x,
          ...L,
          pointer: S,
          intersections: l,
          stopped: g.stopped,
          delta: d,
          unprojectedPoint: C,
          ray: _.ray,
          camera: A,
          // Hijack stopPropagation, which just sets a flag
          stopPropagation() {
            const R = "pointerId" in f && T.capturedMap.get(f.pointerId);
            if (
              // ...if this pointer hasn't been captured
              (!R || // ... or if the hit object is capturing the pointer
              R.has(x.eventObject)) && (U.stopped = g.stopped = !0, T.hovered.size && Array.from(T.hovered.values()).find((I) => I.eventObject === x.eventObject))
            ) {
              const I = l.slice(0, l.indexOf(x));
              n([...I, x]);
            }
          },
          // there should be a distinction between target and currentTarget
          target: {
            hasPointerCapture: P,
            setPointerCapture: M,
            releasePointerCapture: b
          },
          currentTarget: {
            hasPointerCapture: P,
            setPointerCapture: M,
            releasePointerCapture: b
          },
          nativeEvent: f
        };
        if (p(U), g.stopped === !0)
          break;
      }
    }
    return l;
  }
  function n(l) {
    const {
      internal: f
    } = c.getState();
    for (const d of f.hovered.values())
      if (!l.length || !l.find((p) => p.object === d.object && p.index === d.index && p.instanceId === d.instanceId)) {
        const v = d.eventObject.__r3f, g = v?.handlers;
        if (f.hovered.delete(ha(d)), v != null && v.eventCount) {
          const x = {
            ...d,
            intersections: l
          };
          g.onPointerOut == null || g.onPointerOut(x), g.onPointerLeave == null || g.onPointerLeave(x);
        }
      }
  }
  function o(l, f) {
    for (let d = 0; d < f.length; d++) {
      const p = f[d].__r3f;
      p == null || p.handlers.onPointerMissed == null || p.handlers.onPointerMissed(l);
    }
  }
  function u(l) {
    switch (l) {
      case "onPointerLeave":
      case "onPointerCancel":
        return () => n([]);
      case "onLostPointerCapture":
        return (f) => {
          const {
            internal: d
          } = c.getState();
          "pointerId" in f && d.capturedMap.has(f.pointerId) && requestAnimationFrame(() => {
            d.capturedMap.has(f.pointerId) && (d.capturedMap.delete(f.pointerId), n([]));
          });
        };
    }
    return function(d) {
      const {
        onPointerMissed: p,
        internal: v
      } = c.getState();
      v.lastEvent.current = d;
      const g = l === "onPointerMove", x = l === "onClick" || l === "onContextMenu" || l === "onDoubleClick", _ = a(d, g ? s : void 0), S = x ? e(d) : 0;
      l === "onPointerDown" && (v.initialClick = [d.offsetX, d.offsetY], v.initialHits = _.map((T) => T.eventObject)), x && !_.length && S <= 2 && (o(d, v.interaction), p && p(d)), g && n(_);
      function A(T) {
        const C = T.eventObject, P = C.__r3f, M = P?.handlers;
        if (P != null && P.eventCount)
          if (g) {
            if (M.onPointerOver || M.onPointerEnter || M.onPointerOut || M.onPointerLeave) {
              const b = ha(T), L = v.hovered.get(b);
              L ? L.stopped && T.stopPropagation() : (v.hovered.set(b, T), M.onPointerOver == null || M.onPointerOver(T), M.onPointerEnter == null || M.onPointerEnter(T));
            }
            M.onPointerMove == null || M.onPointerMove(T);
          } else {
            const b = M[l];
            b ? (!x || v.initialHits.includes(C)) && (o(d, v.interaction.filter((L) => !v.initialHits.includes(L))), b(T)) : x && v.initialHits.includes(C) && o(d, v.interaction.filter((L) => !v.initialHits.includes(L)));
          }
      }
      r(_, d, S, A);
    };
  }
  return {
    handlePointer: u
  };
}
const iv = ["set", "get", "setSize", "setFrameloop", "setDpr", "events", "invalidate", "advance", "size", "viewport"], bh = (c) => !!(c != null && c.render), ec = /* @__PURE__ */ te.createContext(null), ov = (c, e) => {
  const s = Xa((u, l) => {
    const f = new oe(), d = new oe(), p = new oe();
    function v(S = l().camera, A = d, T = l().size) {
      const {
        width: C,
        height: P,
        top: M,
        left: b
      } = T, L = C / P;
      A.isVector3 ? p.copy(A) : p.set(...A);
      const U = S.getWorldPosition(f).distanceTo(p);
      if (wh(S))
        return {
          width: C / S.zoom,
          height: P / S.zoom,
          top: M,
          left: b,
          factor: 1,
          distance: U,
          aspect: L
        };
      {
        const R = S.fov * Math.PI / 180, I = 2 * Math.tan(R / 2) * U, k = I * (C / P);
        return {
          width: k,
          height: I,
          top: M,
          left: b,
          factor: C / k,
          distance: U,
          aspect: L
        };
      }
    }
    let g;
    const x = (S) => u((A) => ({
      performance: {
        ...A.performance,
        current: S
      }
    })), E = new Qe();
    return {
      set: u,
      get: l,
      // Mock objects that have to be configured
      gl: null,
      camera: null,
      raycaster: null,
      events: {
        priority: 1,
        enabled: !0,
        connected: !1
      },
      xr: null,
      scene: null,
      invalidate: (S = 1) => c(l(), S),
      advance: (S, A) => e(S, A, l()),
      legacy: !1,
      linear: !1,
      flat: !1,
      controls: null,
      clock: new Zp(),
      pointer: E,
      mouse: E,
      frameloop: "always",
      onPointerMissed: void 0,
      performance: {
        current: 1,
        min: 0.5,
        max: 1,
        debounce: 200,
        regress: () => {
          const S = l();
          g && clearTimeout(g), S.performance.current !== S.performance.min && x(S.performance.min), g = setTimeout(() => x(l().performance.max), S.performance.debounce);
        }
      },
      size: {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        updateStyle: !1
      },
      viewport: {
        initialDpr: 0,
        dpr: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        aspect: 0,
        distance: 0,
        factor: 0,
        getCurrentViewport: v
      },
      setEvents: (S) => u((A) => ({
        ...A,
        events: {
          ...A.events,
          ...S
        }
      })),
      setSize: (S, A, T, C, P) => {
        const M = l().camera, b = {
          width: S,
          height: A,
          top: C || 0,
          left: P || 0,
          updateStyle: T
        };
        u((L) => ({
          size: b,
          viewport: {
            ...L.viewport,
            ...v(M, d, b)
          }
        }));
      },
      setDpr: (S) => u((A) => {
        const T = Ah(S);
        return {
          viewport: {
            ...A.viewport,
            dpr: T,
            initialDpr: A.viewport.initialDpr || T
          }
        };
      }),
      setFrameloop: (S = "always") => {
        const A = l().clock;
        A.stop(), A.elapsedTime = 0, S !== "never" && (A.start(), A.elapsedTime = 0), u(() => ({
          frameloop: S
        }));
      },
      previousRoot: void 0,
      internal: {
        active: !1,
        priority: 0,
        frames: 0,
        lastEvent: /* @__PURE__ */ te.createRef(),
        interaction: [],
        hovered: /* @__PURE__ */ new Map(),
        subscribers: [],
        initialClick: [0, 0],
        initialHits: [],
        capturedMap: /* @__PURE__ */ new Map(),
        subscribe: (S, A, T) => {
          const C = l().internal;
          return C.priority = C.priority + (A > 0 ? 1 : 0), C.subscribers.push({
            ref: S,
            priority: A,
            store: T
          }), C.subscribers = C.subscribers.sort((P, M) => P.priority - M.priority), () => {
            const P = l().internal;
            P != null && P.subscribers && (P.priority = P.priority - (A > 0 ? 1 : 0), P.subscribers = P.subscribers.filter((M) => M.ref !== S));
          };
        }
      }
    };
  }), a = s.getState();
  let r = a.size, n = a.viewport.dpr, o = a.camera;
  return s.subscribe(() => {
    const {
      camera: u,
      size: l,
      viewport: f,
      gl: d,
      set: p
    } = s.getState();
    if (l.width !== r.width || l.height !== r.height || f.dpr !== n) {
      var v;
      r = l, n = f.dpr, Ph(u, l), d.setPixelRatio(f.dpr);
      const g = (v = l.updateStyle) != null ? v : typeof HTMLCanvasElement < "u" && d.domElement instanceof HTMLCanvasElement;
      d.setSize(l.width, l.height, g);
    }
    u !== o && (o = u, p((g) => ({
      viewport: {
        ...g.viewport,
        ...g.viewport.getCurrentViewport(u)
      }
    })));
  }), s.subscribe((u) => c(u)), s;
};
let pa, sv = /* @__PURE__ */ new Set(), av = /* @__PURE__ */ new Set(), lv = /* @__PURE__ */ new Set();
function Zl(c, e) {
  if (c.size)
    for (const {
      callback: s
    } of c.values())
      s(e);
}
function Jo(c, e) {
  switch (c) {
    case "before":
      return Zl(sv, e);
    case "after":
      return Zl(av, e);
    case "tail":
      return Zl(lv, e);
  }
}
let Jl, $l;
function eu(c, e, s) {
  let a = e.clock.getDelta();
  for (e.frameloop === "never" && typeof c == "number" && (a = c - e.clock.elapsedTime, e.clock.oldTime = e.clock.elapsedTime, e.clock.elapsedTime = c), Jl = e.internal.subscribers, pa = 0; pa < Jl.length; pa++)
    $l = Jl[pa], $l.ref.current($l.store.getState(), a, s);
  return !e.internal.priority && e.gl.render && e.gl.render(e.scene, e.camera), e.internal.frames = Math.max(0, e.internal.frames - 1), e.frameloop === "always" ? 1 : e.internal.frames;
}
function uv(c) {
  let e = !1, s = !1, a, r, n;
  function o(f) {
    r = requestAnimationFrame(o), e = !0, a = 0, Jo("before", f), s = !0;
    for (const p of c.values()) {
      var d;
      n = p.store.getState(), n.internal.active && (n.frameloop === "always" || n.internal.frames > 0) && !((d = n.gl.xr) != null && d.isPresenting) && (a += eu(f, n));
    }
    if (s = !1, Jo("after", f), a === 0)
      return Jo("tail", f), e = !1, cancelAnimationFrame(r);
  }
  function u(f, d = 1) {
    var p;
    if (!f)
      return c.forEach((v) => u(v.store.getState(), d));
    (p = f.gl.xr) != null && p.isPresenting || !f.internal.active || f.frameloop === "never" || (d > 1 ? f.internal.frames = Math.min(60, f.internal.frames + d) : s ? f.internal.frames = 2 : f.internal.frames = 1, e || (e = !0, requestAnimationFrame(o)));
  }
  function l(f, d = !0, p, v) {
    if (d && Jo("before", f), p)
      eu(f, p, v);
    else
      for (const g of c.values())
        eu(f, g.store.getState());
    d && Jo("after", f);
  }
  return {
    loop: o,
    invalidate: u,
    advance: l
  };
}
function tc() {
  const c = te.useContext(ec);
  if (!c)
    throw new Error("R3F: Hooks can only be used within the Canvas component!");
  return c;
}
function Qt(c = (s) => s, e) {
  return tc()(c, e);
}
function Ci(c, e = 0) {
  const s = tc(), a = s.getState().internal.subscribe, r = _h(c);
  return ys(() => a(r, e, s), [e, a, s]), null;
}
const xo = /* @__PURE__ */ new Map(), {
  invalidate: qf,
  advance: Zf
} = uv(xo), {
  reconciler: gs,
  applyProps: Qi
} = Qm(xo, tv), qi = {
  objects: "shallow",
  strict: !1
}, cv = (c, e) => {
  const s = typeof c == "function" ? c(e) : c;
  return bh(s) ? s : new Xp({
    powerPreference: "high-performance",
    canvas: e,
    antialias: !0,
    alpha: !0,
    ...c
  });
};
function fv(c, e) {
  const s = typeof HTMLCanvasElement < "u" && c instanceof HTMLCanvasElement;
  if (e) {
    const {
      width: a,
      height: r,
      top: n,
      left: o,
      updateStyle: u = s
    } = e;
    return {
      width: a,
      height: r,
      top: n,
      left: o,
      updateStyle: u
    };
  } else if (typeof HTMLCanvasElement < "u" && c instanceof HTMLCanvasElement && c.parentElement) {
    const {
      width: a,
      height: r,
      top: n,
      left: o
    } = c.parentElement.getBoundingClientRect();
    return {
      width: a,
      height: r,
      top: n,
      left: o,
      updateStyle: s
    };
  } else if (typeof OffscreenCanvas < "u" && c instanceof OffscreenCanvas)
    return {
      width: c.width,
      height: c.height,
      top: 0,
      left: 0,
      updateStyle: s
    };
  return {
    width: 0,
    height: 0,
    top: 0,
    left: 0
  };
}
function dv(c) {
  const e = xo.get(c), s = e?.fiber, a = e?.store;
  e && console.warn("R3F.createRoot should only be called once!");
  const r = typeof reportError == "function" ? (
    // In modern browsers, reportError will dispatch an error event,
    // emulating an uncaught JavaScript error.
    reportError
  ) : (
    // In older browsers and test environments, fallback to console.error.
    console.error
  ), n = a || ov(qf, Zf), o = s || gs.createContainer(n, ho.ConcurrentRoot, null, !1, null, "", r, null);
  e || xo.set(c, {
    fiber: o,
    store: n
  });
  let u, l = !1, f;
  return {
    configure(d = {}) {
      let {
        gl: p,
        size: v,
        scene: g,
        events: x,
        onCreated: E,
        shadows: _ = !1,
        linear: S = !1,
        flat: A = !1,
        legacy: T = !1,
        orthographic: C = !1,
        frameloop: P = "always",
        dpr: M = [1, 2],
        performance: b,
        raycaster: L,
        camera: U,
        onPointerMissed: R
      } = d, I = n.getState(), k = I.gl;
      I.gl || I.set({
        gl: k = cv(p, c)
      });
      let O = I.raycaster;
      O || I.set({
        raycaster: O = new rh()
      });
      const {
        params: N,
        ...J
      } = L || {};
      if (dt.equ(J, O, qi) || Qi(O, {
        ...J
      }), dt.equ(N, O.params, qi) || Qi(O, {
        params: {
          ...O.params,
          ...N
        }
      }), !I.camera || I.camera === f && !dt.equ(f, U, qi)) {
        f = U;
        const G = U instanceof Kp, F = G ? U : C ? new us(0, 0, 0, 0, 0.1, 1e3) : new cs(75, 0, 0.1, 1e3);
        G || (F.position.z = 5, U && (Qi(F, U), ("aspect" in U || "left" in U || "right" in U || "bottom" in U || "top" in U) && (F.manual = !0, F.updateProjectionMatrix())), !I.camera && !(U != null && U.rotation) && F.lookAt(0, 0, 0)), I.set({
          camera: F
        }), O.camera = F;
      }
      if (!I.scene) {
        let G;
        g != null && g.isScene ? G = g : (G = new ih(), g && Qi(G, g)), I.set({
          scene: uo(G)
        });
      }
      if (!I.xr) {
        var Z;
        const G = (W, $) => {
          const Y = n.getState();
          Y.frameloop !== "never" && Zf(W, !0, Y, $);
        }, F = () => {
          const W = n.getState();
          W.gl.xr.enabled = W.gl.xr.isPresenting, W.gl.xr.setAnimationLoop(W.gl.xr.isPresenting ? G : null), W.gl.xr.isPresenting || qf(W);
        }, j = {
          connect() {
            const W = n.getState().gl;
            W.xr.addEventListener("sessionstart", F), W.xr.addEventListener("sessionend", F);
          },
          disconnect() {
            const W = n.getState().gl;
            W.xr.removeEventListener("sessionstart", F), W.xr.removeEventListener("sessionend", F);
          }
        };
        typeof ((Z = k.xr) == null ? void 0 : Z.addEventListener) == "function" && j.connect(), I.set({
          xr: j
        });
      }
      if (k.shadowMap) {
        const G = k.shadowMap.enabled, F = k.shadowMap.type;
        if (k.shadowMap.enabled = !!_, dt.boo(_))
          k.shadowMap.type = Wl;
        else if (dt.str(_)) {
          var ce;
          const j = {
            basic: Yp,
            percentage: Qp,
            soft: Wl,
            variance: qp
          };
          k.shadowMap.type = (ce = j[_]) != null ? ce : Wl;
        } else
          dt.obj(_) && Object.assign(k.shadowMap, _);
        (G !== k.shadowMap.enabled || F !== k.shadowMap.type) && (k.shadowMap.needsUpdate = !0);
      }
      const K = Sh();
      K && ("enabled" in K ? K.enabled = !T : "legacyMode" in K && (K.legacyMode = T)), l || Qi(k, {
        outputEncoding: S ? 3e3 : 3001,
        toneMapping: A ? Gp : Hp
      }), I.legacy !== T && I.set(() => ({
        legacy: T
      })), I.linear !== S && I.set(() => ({
        linear: S
      })), I.flat !== A && I.set(() => ({
        flat: A
      })), p && !dt.fun(p) && !bh(p) && !dt.equ(p, k, qi) && Qi(k, p), x && !I.events.handlers && I.set({
        events: x(n)
      });
      const V = fv(c, v);
      return dt.equ(V, I.size, qi) || I.setSize(V.width, V.height, V.updateStyle, V.top, V.left), M && I.viewport.dpr !== Ah(M) && I.setDpr(M), I.frameloop !== P && I.setFrameloop(P), I.onPointerMissed || I.set({
        onPointerMissed: R
      }), b && !dt.equ(b, I.performance, qi) && I.set((G) => ({
        performance: {
          ...G.performance,
          ...b
        }
      })), u = E, l = !0, this;
    },
    render(d) {
      return l || this.configure(), gs.updateContainer(/* @__PURE__ */ ye.jsx(hv, {
        store: n,
        children: d,
        onCreated: u,
        rootElement: c
      }), o, null, () => {
      }), n;
    },
    unmount() {
      Lh(c);
    }
  };
}
function hv({
  store: c,
  children: e,
  onCreated: s,
  rootElement: a
}) {
  return ys(() => {
    const r = c.getState();
    r.set((n) => ({
      internal: {
        ...n.internal,
        active: !0
      }
    })), s && s(r), c.getState().events.connected || r.events.connect == null || r.events.connect(a);
  }, []), /* @__PURE__ */ ye.jsx(ec.Provider, {
    value: c,
    children: e
  });
}
function Lh(c, e) {
  const s = xo.get(c), a = s?.fiber;
  if (a) {
    const r = s?.store.getState();
    r && (r.internal.active = !1), gs.updateContainer(null, a, null, () => {
      r && setTimeout(() => {
        try {
          var n, o, u, l;
          r.events.disconnect == null || r.events.disconnect(), (n = r.gl) == null || (o = n.renderLists) == null || o.dispose == null || o.dispose(), (u = r.gl) == null || u.forceContextLoss == null || u.forceContextLoss(), (l = r.gl) != null && l.xr && r.xr.disconnect(), $m(r), xo.delete(c), e && e(c);
        } catch {
        }
      }, 500);
    });
  }
}
function Lu(c, e, s) {
  return /* @__PURE__ */ ye.jsx(pv, {
    children: c,
    container: e,
    state: s
  }, e.uuid);
}
function pv({
  state: c = {},
  children: e,
  container: s
}) {
  const {
    events: a,
    size: r,
    ...n
  } = c, o = tc(), [u] = te.useState(() => new rh()), [l] = te.useState(() => new Qe()), f = te.useCallback(
    (p, v) => {
      const g = {
        ...p
      };
      Object.keys(p).forEach((E) => {
        // Some props should be off-limits
        (iv.includes(E) || // Otherwise filter out the props that are different and let the inject layer take precedence
        // Unless the inject layer props is undefined, then we keep the root layer
        p[E] !== v[E] && v[E]) && delete g[E];
      });
      let x;
      if (v && r) {
        const E = v.camera;
        x = p.viewport.getCurrentViewport(E, new oe(), r), E !== p.camera && Ph(E, r);
      }
      return {
        // The intersect consists of the previous root state
        ...g,
        // Portals have their own scene, which forms the root, a raycaster and a pointer
        scene: s,
        raycaster: u,
        pointer: l,
        mouse: l,
        // Their previous root is the layer before it
        previousRoot: o,
        // Events, size and viewport can be overridden by the inject layer
        events: {
          ...p.events,
          ...v?.events,
          ...a
        },
        size: {
          ...p.size,
          ...r
        },
        viewport: {
          ...p.viewport,
          ...x
        },
        ...n
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [c]
  ), [d] = te.useState(() => {
    const p = o.getState();
    return Xa((g, x) => ({
      ...p,
      scene: s,
      raycaster: u,
      pointer: l,
      mouse: l,
      previousRoot: o,
      events: {
        ...p.events,
        ...a
      },
      size: {
        ...p.size,
        ...r
      },
      ...n,
      // Set and get refer to this root-state
      set: g,
      get: x,
      // Layers are allowed to override events
      setEvents: (E) => g((_) => ({
        ..._,
        events: {
          ..._.events,
          ...E
        }
      }))
    }));
  });
  return te.useEffect(() => {
    const p = o.subscribe((v) => d.setState((g) => f(v, g)));
    return () => {
      p();
    };
  }, [f]), te.useEffect(() => {
    d.setState((p) => f(o.getState(), p));
  }, [f]), te.useEffect(() => () => {
    d.destroy();
  }, []), /* @__PURE__ */ ye.jsx(ye.Fragment, {
    children: gs.createPortal(/* @__PURE__ */ ye.jsx(ec.Provider, {
      value: d,
      children: e
    }), d, null)
  });
}
gs.injectIntoDevTools({
  bundleType: 0,
  rendererPackageName: "@react-three/fiber",
  version: te.version
});
const tu = {
  onClick: ["click", !1],
  onContextMenu: ["contextmenu", !1],
  onDoubleClick: ["dblclick", !1],
  onWheel: ["wheel", !0],
  onPointerDown: ["pointerdown", !0],
  onPointerUp: ["pointerup", !0],
  onPointerLeave: ["pointerleave", !0],
  onPointerMove: ["pointermove", !0],
  onPointerCancel: ["pointercancel", !0],
  onLostPointerCapture: ["lostpointercapture", !0]
};
function mv(c) {
  const {
    handlePointer: e
  } = rv(c);
  return {
    priority: 1,
    enabled: !0,
    compute(s, a, r) {
      a.pointer.set(s.offsetX / a.size.width * 2 - 1, -(s.offsetY / a.size.height) * 2 + 1), a.raycaster.setFromCamera(a.pointer, a.camera);
    },
    connected: void 0,
    handlers: Object.keys(tu).reduce((s, a) => ({
      ...s,
      [a]: e(a)
    }), {}),
    update: () => {
      var s;
      const {
        events: a,
        internal: r
      } = c.getState();
      (s = r.lastEvent) != null && s.current && a.handlers && a.handlers.onPointerMove(r.lastEvent.current);
    },
    connect: (s) => {
      var a;
      const {
        set: r,
        events: n
      } = c.getState();
      n.disconnect == null || n.disconnect(), r((o) => ({
        events: {
          ...o.events,
          connected: s
        }
      })), Object.entries((a = n.handlers) != null ? a : []).forEach(([o, u]) => {
        const [l, f] = tu[o];
        s.addEventListener(l, u, {
          passive: f
        });
      });
    },
    disconnect: () => {
      const {
        set: s,
        events: a
      } = c.getState();
      if (a.connected) {
        var r;
        Object.entries((r = a.handlers) != null ? r : []).forEach(([n, o]) => {
          if (a && a.connected instanceof HTMLElement) {
            const [u] = tu[n];
            a.connected.removeEventListener(u, o);
          }
        }), s((n) => ({
          events: {
            ...n.events,
            connected: void 0
          }
        }));
      }
    }
  };
}
function Jf(c, e) {
  let s;
  return (...a) => {
    window.clearTimeout(s), s = window.setTimeout(() => c(...a), e);
  };
}
function vv({ debounce: c, scroll: e, polyfill: s, offsetSize: a } = { debounce: 0, scroll: !1, offsetSize: !1 }) {
  const r = s || (typeof window > "u" ? class {
  } : window.ResizeObserver);
  if (!r)
    throw new Error("This browser does not support ResizeObserver out of the box. See: https://github.com/react-spring/react-use-measure/#resize-observer-polyfills");
  const [n, o] = an({ left: 0, top: 0, width: 0, height: 0, bottom: 0, right: 0, x: 0, y: 0 }), u = yr({ element: null, scrollContainers: null, resizeObserver: null, lastBounds: n, orientationHandler: null }), l = c ? typeof c == "number" ? c : c.scroll : null, f = c ? typeof c == "number" ? c : c.resize : null, d = yr(!1);
  kr(() => (d.current = !0, () => void (d.current = !1)));
  const [p, v, g] = zm(() => {
    const S = () => {
      if (!u.current.element)
        return;
      const { left: A, top: T, width: C, height: P, bottom: M, right: b, x: L, y: U } = u.current.element.getBoundingClientRect(), R = { left: A, top: T, width: C, height: P, bottom: M, right: b, x: L, y: U };
      u.current.element instanceof HTMLElement && a && (R.height = u.current.element.offsetHeight, R.width = u.current.element.offsetWidth), Object.freeze(R), d.current && !Sv(u.current.lastBounds, R) && o(u.current.lastBounds = R);
    };
    return [S, f ? Jf(S, f) : S, l ? Jf(S, l) : S];
  }, [o, a, l, f]);
  function x() {
    u.current.scrollContainers && (u.current.scrollContainers.forEach((S) => S.removeEventListener("scroll", g, !0)), u.current.scrollContainers = null), u.current.resizeObserver && (u.current.resizeObserver.disconnect(), u.current.resizeObserver = null), u.current.orientationHandler && ("orientation" in screen && "removeEventListener" in screen.orientation ? screen.orientation.removeEventListener("change", u.current.orientationHandler) : "onorientationchange" in window && window.removeEventListener("orientationchange", u.current.orientationHandler));
  }
  function E() {
    u.current.element && (u.current.resizeObserver = new r(g), u.current.resizeObserver.observe(u.current.element), e && u.current.scrollContainers && u.current.scrollContainers.forEach((S) => S.addEventListener("scroll", g, { capture: !0, passive: !0 })), u.current.orientationHandler = () => {
      g();
    }, "orientation" in screen && "addEventListener" in screen.orientation ? screen.orientation.addEventListener("change", u.current.orientationHandler) : "onorientationchange" in window && window.addEventListener("orientationchange", u.current.orientationHandler));
  }
  const _ = (S) => {
    !S || S === u.current.element || (x(), u.current.element = S, u.current.scrollContainers = Rh(S), E());
  };
  return yv(g, !!e), gv(v), kr(() => {
    x(), E();
  }, [e, g, v]), kr(() => x, []), [_, n, p];
}
function gv(c) {
  kr(() => {
    const e = c;
    return window.addEventListener("resize", e), () => void window.removeEventListener("resize", e);
  }, [c]);
}
function yv(c, e) {
  kr(() => {
    if (e) {
      const s = c;
      return window.addEventListener("scroll", s, { capture: !0, passive: !0 }), () => void window.removeEventListener("scroll", s, !0);
    }
  }, [c, e]);
}
function Rh(c) {
  const e = [];
  if (!c || c === document.body)
    return e;
  const { overflow: s, overflowX: a, overflowY: r } = window.getComputedStyle(c);
  return [s, a, r].some((n) => n === "auto" || n === "scroll") && e.push(c), [...e, ...Rh(c.parentElement)];
}
const xv = ["x", "y", "top", "bottom", "left", "right", "width", "height"], Sv = (c, e) => xv.every((s) => c[s] === e[s]);
var wv = Object.defineProperty, _v = Object.defineProperties, Tv = Object.getOwnPropertyDescriptors, $f = Object.getOwnPropertySymbols, Ev = Object.prototype.hasOwnProperty, Av = Object.prototype.propertyIsEnumerable, ed = (c, e, s) => e in c ? wv(c, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : c[e] = s, td = (c, e) => {
  for (var s in e || (e = {}))
    Ev.call(e, s) && ed(c, s, e[s]);
  if ($f)
    for (var s of $f(e))
      Av.call(e, s) && ed(c, s, e[s]);
  return c;
}, Cv = (c, e) => _v(c, Tv(e)), nd, rd;
typeof window < "u" && ((nd = window.document) != null && nd.createElement || ((rd = window.navigator) == null ? void 0 : rd.product) === "ReactNative") ? te.useLayoutEffect : te.useEffect;
function kh(c, e, s) {
  if (!c)
    return;
  if (s(c) === !0)
    return c;
  let a = e ? c.return : c.child;
  for (; a; ) {
    const r = kh(a, e, s);
    if (r)
      return r;
    a = e ? null : a.sibling;
  }
}
function Uh(c) {
  try {
    return Object.defineProperties(c, {
      _currentRenderer: {
        get() {
          return null;
        },
        set() {
        }
      },
      _currentRenderer2: {
        get() {
          return null;
        },
        set() {
        }
      }
    });
  } catch {
    return c;
  }
}
const id = console.error;
console.error = function() {
  const c = [...arguments].join("");
  if (c?.startsWith("Warning:") && c.includes("useContext")) {
    console.error = id;
    return;
  }
  return id.apply(this, arguments);
};
const nc = Uh(te.createContext(null));
class Dh extends te.Component {
  render() {
    return /* @__PURE__ */ te.createElement(nc.Provider, {
      value: this._reactInternals
    }, this.props.children);
  }
}
function Pv() {
  const c = te.useContext(nc);
  if (c === null)
    throw new Error("its-fine: useFiber must be called within a <FiberProvider />!");
  const e = te.useId();
  return te.useMemo(() => {
    for (const a of [c, c?.alternate]) {
      if (!a)
        continue;
      const r = kh(a, !1, (n) => {
        let o = n.memoizedState;
        for (; o; ) {
          if (o.memoizedState === e)
            return !0;
          o = o.next;
        }
      });
      if (r)
        return r;
    }
  }, [c, e]);
}
function Mv() {
  const c = Pv(), [e] = te.useState(() => /* @__PURE__ */ new Map());
  e.clear();
  let s = c;
  for (; s; ) {
    if (s.type && typeof s.type == "object") {
      const r = s.type._context === void 0 && s.type.Provider === s.type ? s.type : s.type._context;
      r && r !== nc && !e.has(r) && e.set(r, te.useContext(Uh(r)));
    }
    s = s.return;
  }
  return e;
}
function bv() {
  const c = Mv();
  return te.useMemo(
    () => Array.from(c.keys()).reduce(
      (e, s) => (a) => /* @__PURE__ */ te.createElement(e, null, /* @__PURE__ */ te.createElement(s.Provider, Cv(td({}, a), {
        value: c.get(s)
      }))),
      (e) => /* @__PURE__ */ te.createElement(Dh, td({}, e))
    ),
    [c]
  );
}
const Lv = /* @__PURE__ */ te.forwardRef(function({
  children: e,
  fallback: s,
  resize: a,
  style: r,
  gl: n,
  events: o = mv,
  eventSource: u,
  eventPrefix: l,
  shadows: f,
  linear: d,
  flat: p,
  legacy: v,
  orthographic: g,
  frameloop: x,
  dpr: E,
  performance: _,
  raycaster: S,
  camera: A,
  scene: T,
  onPointerMissed: C,
  onCreated: P,
  ...M
}, b) {
  te.useMemo(() => $u(Jp), []);
  const L = bv(), [U, R] = vv({
    scroll: !0,
    debounce: {
      scroll: 50,
      resize: 0
    },
    ...a
  }), I = te.useRef(null), k = te.useRef(null);
  te.useImperativeHandle(b, () => I.current);
  const O = _h(C), [N, J] = te.useState(!1), [Z, ce] = te.useState(!1);
  if (N)
    throw N;
  if (Z)
    throw Z;
  const K = te.useRef(null);
  ys(() => {
    const G = I.current;
    R.width > 0 && R.height > 0 && G && (K.current || (K.current = dv(G)), K.current.configure({
      gl: n,
      events: o,
      shadows: f,
      linear: d,
      flat: p,
      legacy: v,
      orthographic: g,
      frameloop: x,
      dpr: E,
      performance: _,
      raycaster: S,
      camera: A,
      scene: T,
      size: R,
      // Pass mutable reference to onPointerMissed so it's free to update
      onPointerMissed: (...F) => O.current == null ? void 0 : O.current(...F),
      onCreated: (F) => {
        F.events.connect == null || F.events.connect(u ? qm(u) ? u.current : u : k.current), l && F.setEvents({
          compute: (j, W) => {
            const $ = j[l + "X"], Y = j[l + "Y"];
            W.pointer.set($ / W.size.width * 2 - 1, -(Y / W.size.height) * 2 + 1), W.raycaster.setFromCamera(W.pointer, W.camera);
          }
        }), P?.(F);
      }
    }), K.current.render(/* @__PURE__ */ ye.jsx(L, {
      children: /* @__PURE__ */ ye.jsx(Th, {
        set: ce,
        children: /* @__PURE__ */ ye.jsx(te.Suspense, {
          fallback: /* @__PURE__ */ ye.jsx(Zm, {
            set: J
          }),
          children: e ?? null
        })
      })
    })));
  }), te.useEffect(() => {
    const G = I.current;
    if (G)
      return () => Lh(G);
  }, []);
  const V = u ? "none" : "auto";
  return /* @__PURE__ */ ye.jsx("div", {
    ref: k,
    style: {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      pointerEvents: V,
      ...r
    },
    ...M,
    children: /* @__PURE__ */ ye.jsx("div", {
      ref: U,
      style: {
        width: "100%",
        height: "100%"
      },
      children: /* @__PURE__ */ ye.jsx("canvas", {
        ref: I,
        style: {
          display: "block"
        },
        children: s
      })
    })
  });
}), Rv = /* @__PURE__ */ te.forwardRef(function(e, s) {
  return /* @__PURE__ */ ye.jsx(Dh, {
    children: /* @__PURE__ */ ye.jsx(Lv, {
      ...e,
      ref: s
    })
  });
});
class kv extends wi {
  constructor(e, s) {
    super(), this.inputSource = null, this.xrControllerModel = null, this.index = e, this.controller = s.xr.getController(e), this.grip = s.xr.getControllerGrip(e), this.hand = s.xr.getHand(e), this.grip.userData.name = "grip", this.controller.userData.name = "controller", this.hand.userData.name = "hand", this.visible = !1, this.add(this.controller, this.grip, this.hand), this._onConnected = this._onConnected.bind(this), this._onDisconnected = this._onDisconnected.bind(this), this.controller.addEventListener("connected", this._onConnected), this.controller.addEventListener("disconnected", this._onDisconnected);
  }
  _onConnected(e) {
    e.fake || e.data && (this.visible = !0, this.inputSource = e.data, this.dispatchEvent(e));
  }
  _onDisconnected(e) {
    e.fake || (this.visible = !1, this.inputSource = null, this.dispatchEvent(e));
  }
  dispose() {
    this.controller.removeEventListener("connected", this._onConnected), this.controller.removeEventListener("disconnected", this._onDisconnected);
  }
}
var od, sd;
const Uv = (c) => Array.from(new Set(c)), zn = typeof window < "u" && ((od = window.document) != null && od.createElement || ((sd = window.navigator) == null ? void 0 : sd.product) === "ReactNative") ? te.useLayoutEffect : te.useEffect;
function vr(c) {
  const e = te.useRef(c);
  return zn(() => void (e.current = c), [c]), e;
}
function Zi(c, e, { handedness: s } = {}) {
  const a = vr(e), r = Tt((n) => n.controllers);
  zn(() => {
    const n = r.map((o) => {
      if (s && o.inputSource && o.inputSource.handedness !== s)
        return;
      const u = (l) => a.current({ nativeEvent: l, target: o });
      return o.controller.addEventListener(c, u), () => o.controller.removeEventListener(c, u);
    });
    return () => n.forEach((o) => o?.());
  }, [r, s, c]);
}
const ad = new Ft();
function Dv({ children: c }) {
  const e = Qt((p) => p.events), s = Qt((p) => p.get), a = Qt((p) => p.raycaster), r = Tt((p) => p.controllers), n = Tt((p) => p.interactions), o = Tt((p) => p.hoverState), u = Tt((p) => p.hasInteraction), l = Tt((p) => p.getInteraction), f = te.useCallback(
    (p) => {
      const v = Array.from(n.keys());
      return ad.identity().extractRotation(p.matrixWorld), a.ray.origin.setFromMatrixPosition(p.matrixWorld), a.ray.direction.set(0, 0, -1).applyMatrix4(ad), a.intersectObjects(v, !0);
    },
    [n, a]
  );
  Ci(() => {
    var p;
    if (n.size !== 0)
      for (const v of r) {
        if (!((p = v.inputSource) != null && p.handedness))
          return;
        const g = o[v.inputSource.handedness], x = /* @__PURE__ */ new Set();
        let E = f(v.controller);
        if (e.filter)
          E = e.filter(E, s());
        else {
          const _ = E.find((S) => S?.object);
          _ && (E = [_]);
        }
        for (const _ of E) {
          let S = _.object;
          for (; S; ) {
            if (u(S, "onHover") && !g.has(S)) {
              const T = l(S, "onHover");
              for (const C of T)
                C({ target: v, intersection: _, intersections: E });
            }
            const A = l(S, "onMove");
            A?.forEach((T) => T({ target: v, intersection: _, intersections: E })), g.set(S, _), x.add(S.id), S = S.parent;
          }
        }
        for (const _ of g.keys())
          if (!x.has(_.id)) {
            g.delete(_);
            const S = l(_, "onBlur");
            if (!S)
              continue;
            for (const A of S)
              A({ target: v, intersections: E });
          }
      }
  });
  const d = te.useCallback(
    (p) => (v) => {
      var g;
      if (!((g = v.target.inputSource) != null && g.handedness))
        return;
      const x = o[v.target.inputSource.handedness], E = Array.from(new Set(x.values()));
      n.forEach((_, S) => {
        var A, T, C;
        if (x.has(S)) {
          if (!_[p])
            return;
          for (const P of _[p])
            (A = P.current) == null || A.call(P, { target: v.target, intersection: x.get(S), intersections: E });
        } else if (p === "onSelect" && _.onSelectMissed)
          for (const P of _.onSelectMissed)
            (T = P.current) == null || T.call(P, { target: v.target, intersections: E });
        else if (p === "onSqueeze" && _.onSqueezeMissed)
          for (const P of _.onSqueezeMissed)
            (C = P.current) == null || C.call(P, { target: v.target, intersections: E });
      });
    },
    [o, n]
  );
  return Zi("select", d("onSelect")), Zi("selectstart", d("onSelectStart")), Zi("selectend", d("onSelectEnd")), Zi("squeeze", d("onSqueeze")), Zi("squeezeend", d("onSqueezeEnd")), Zi("squeezestart", d("onSqueezeStart")), /* @__PURE__ */ te.createElement(te.Fragment, null, c);
}
function $n(c, e, s) {
  const a = Tt((o) => o.addInteraction), r = Tt((o) => o.removeInteraction), n = vr(s);
  zn(() => {
    const o = c.current;
    if (!(!o || !n.current))
      return a(o, e, n), () => r(o, e, n);
  }, [c, e, a, r]);
}
const Fv = te.forwardRef(function({
  onHover: e,
  onBlur: s,
  onSelectStart: a,
  onSelectEnd: r,
  onSelectMissed: n,
  onSelect: o,
  onSqueezeStart: u,
  onSqueezeEnd: l,
  onSqueezeMissed: f,
  onSqueeze: d,
  onMove: p,
  children: v
}, g) {
  const x = te.useRef(null);
  return te.useImperativeHandle(g, () => x.current), $n(x, "onHover", e), $n(x, "onBlur", s), $n(x, "onSelectStart", a), $n(x, "onSelectEnd", r), $n(x, "onSelectMissed", n), $n(x, "onSelect", o), $n(x, "onSqueezeStart", u), $n(x, "onSqueezeEnd", l), $n(x, "onSqueezeMissed", f), $n(x, "onSqueeze", d), $n(x, "onMove", p), /* @__PURE__ */ te.createElement("group", {
    ref: x
  }, v);
}), Iv = te.forwardRef(function({ onSelectStart: e, onSelectEnd: s, children: a, ...r }, n) {
  const o = te.useRef(), u = te.useRef(null), l = te.useMemo(() => new Ft(), []);
  return te.useImperativeHandle(n, () => u.current), Ci(() => {
    const f = o.current, d = u.current;
    f && (d.applyMatrix4(l), d.applyMatrix4(f.matrixWorld), d.updateMatrixWorld(), l.copy(f.matrixWorld).invert());
  }), /* @__PURE__ */ te.createElement(Fv, {
    ref: u,
    onSelectStart: (f) => {
      o.current = f.target.controller, l.copy(f.target.controller.matrixWorld).invert(), e?.(f);
    },
    onSelectEnd: (f) => {
      f.target.controller === o.current && (o.current = void 0), s?.(f);
    },
    ...r
  }, a);
}), Fh = te.createContext(null), _i = Xa((c, e) => ({ set: c, get: e, session: null, referenceSpaceType: null }));
function Ov({
  foveation: c = 0,
  frameRate: e = void 0,
  referenceSpace: s = "local-floor",
  onSessionStart: a,
  onSessionEnd: r,
  onVisibilityChange: n,
  onInputSourcesChange: o,
  children: u
}) {
  const l = Qt((T) => T.gl), f = Qt((T) => T.camera), d = Tt((T) => T.player), p = Tt((T) => T.get), v = Tt((T) => T.set), g = Tt((T) => T.session), x = Tt((T) => T.controllers), E = vr(a), _ = vr(r), S = vr(n), A = vr(o);
  return zn(() => {
    const T = [0, 1].map((C) => {
      const P = new kv(C, l), M = () => v((L) => ({ controllers: [...L.controllers, P] })), b = () => v((L) => ({ controllers: L.controllers.filter((U) => U !== P) }));
      return P.addEventListener("connected", M), P.addEventListener("disconnected", b), () => {
        P.removeEventListener("connected", M), P.removeEventListener("disconnected", b);
      };
    });
    return () => T.forEach((C) => C());
  }, [l, v]), zn(() => _i.subscribe(({ session: T }) => v(() => ({ session: T }))), [l.xr, v]), zn(() => {
    l.xr.setFoveation(c), v(() => ({ foveation: c }));
  }, [l.xr, c, v]), zn(() => {
    var T;
    try {
      e && ((T = g?.updateTargetFrameRate) == null || T.call(g, e));
    } catch {
    }
    v(() => ({ frameRate: e }));
  }, [g, e, v]), zn(() => {
    const T = _i.getState();
    l.xr.setReferenceSpaceType(s), v(() => ({ referenceSpace: s })), T.set({ referenceSpaceType: s });
  }, [l.xr, s, v]), zn(() => {
    if (!g)
      return void l.xr.setSession(null);
    const T = (b) => {
      var L;
      v(() => ({ isPresenting: !0 })), (L = E.current) == null || L.call(E, { nativeEvent: { ...b, target: g }, target: g });
    }, C = (b) => {
      var L;
      v(() => ({ isPresenting: !1, session: null })), _i.setState(() => ({ session: null })), (L = _.current) == null || L.call(_, { nativeEvent: { ...b, target: g }, target: g });
    }, P = (b) => {
      var L;
      (L = S.current) == null || L.call(S, { nativeEvent: b, target: g });
    }, M = (b) => {
      var L;
      const U = Object.values(g.inputSources).some((R) => R.hand);
      v(() => ({ isHandTracking: U })), (L = A.current) == null || L.call(A, { nativeEvent: b, target: g });
    };
    return l.xr.addEventListener("sessionstart", T), l.xr.addEventListener("sessionend", C), g.addEventListener("visibilitychange", P), g.addEventListener("inputsourceschange", M), l.xr.setSession(g).then(() => {
      l.xr.setFoveation(p().foveation);
    }), () => {
      l.xr.removeEventListener("sessionstart", T), l.xr.removeEventListener("sessionend", C), g.removeEventListener("visibilitychange", P), g.removeEventListener("inputsourceschange", M);
    };
  }, [g, l.xr, v, p]), /* @__PURE__ */ te.createElement(Dv, null, /* @__PURE__ */ te.createElement("primitive", {
    object: d
  }, /* @__PURE__ */ te.createElement("primitive", {
    object: f
  }), x.map((T) => /* @__PURE__ */ te.createElement("primitive", {
    key: T.index,
    object: T
  }))), u);
}
function Nv(c) {
  const e = te.useMemo(
    () => Xa((s, a) => ({
      set: s,
      get: a,
      controllers: [],
      isPresenting: !1,
      isHandTracking: !1,
      player: new wi(),
      session: null,
      foveation: 0,
      referenceSpace: "local-floor",
      hoverState: {
        left: /* @__PURE__ */ new Map(),
        right: /* @__PURE__ */ new Map(),
        none: /* @__PURE__ */ new Map()
      },
      interactions: /* @__PURE__ */ new Map(),
      hasInteraction(r, n) {
        var o;
        return !!((o = a().interactions.get(r)) != null && o[n].some((u) => u.current));
      },
      getInteraction(r, n) {
        var o;
        return (o = a().interactions.get(r)) == null ? void 0 : o[n].reduce((u, l) => (l.current && u.push(l.current), u), []);
      },
      addInteraction(r, n, o) {
        const u = a().interactions;
        u.has(r) || u.set(r, {
          onHover: [],
          onBlur: [],
          onSelect: [],
          onSelectEnd: [],
          onSelectStart: [],
          onSelectMissed: [],
          onSqueeze: [],
          onSqueezeEnd: [],
          onSqueezeStart: [],
          onSqueezeMissed: [],
          onMove: []
        }), u.get(r)[n].push(o);
      },
      removeInteraction(r, n, o) {
        const u = a().interactions.get(r);
        if (u) {
          const l = u[n].indexOf(o);
          l !== -1 && u[n].splice(l, 1);
        }
      }
    })),
    []
  );
  return /* @__PURE__ */ te.createElement(Fh.Provider, {
    value: e
  }, /* @__PURE__ */ te.createElement(Ov, {
    ...c
  }));
}
const Bv = (c, e) => {
  var s;
  if (!(!c && !e))
    return c && !e ? { optionalFeatures: [c] } : c && e ? { ...e, optionalFeatures: Uv([...(s = e.optionalFeatures) != null ? s : [], c]) } : e;
}, zv = async (c, e) => {
  const s = _i.getState();
  if (s.session) {
    console.warn("@react-three/xr: session already started, please stop it first");
    return;
  }
  const a = Bv(s.referenceSpaceType, e), r = await navigator.xr.requestSession(c, a);
  return s.set(() => ({ session: r })), r;
}, jv = async () => {
  const c = _i.getState();
  if (!c.session) {
    console.warn("@react-three/xr: no session to stop, please start it first");
    return;
  }
  await c.session.end(), c.set({ session: null });
}, Gv = async (c, { sessionInit: e, enterOnly: s, exitOnly: a } = {}) => {
  const r = _i.getState();
  if (!(r.session && s) && !(!r.session && a))
    return r.session ? await jv() : await zv(c, e);
}, Hv = (c, e, s) => {
  switch (c) {
    case "entered":
      return `Exit ${e}`;
    case "exited":
      return `Enter ${e}`;
    case "unsupported":
    default:
      switch (s) {
        case "https":
          return "HTTPS needed";
        case "security":
          return `${e} blocked`;
        case "unknown":
        default:
          return `${e} unsupported`;
      }
  }
}, rc = te.forwardRef(function({ mode: e, sessionInit: s, enterOnly: a = !1, exitOnly: r = !1, onClick: n, onError: o, children: u, ...l }, f) {
  var d;
  const [p, v] = te.useState("exited"), [g, x] = te.useState("unknown"), E = Hv(p, e, g), _ = e === "inline" ? e : `immersive-${e.toLowerCase()}`, S = vr(o);
  zn(() => {
    if (!navigator?.xr)
      return void v("unsupported");
    navigator.xr.isSessionSupported(_).then((T) => {
      if (T)
        v("exited");
      else {
        const C = location.protocol === "https:";
        v("unsupported"), x(C ? "unknown" : "https");
      }
    }).catch((T) => {
      v("unsupported"), "name" in T && T.name === "SecurityError" ? x("security") : x("unknown");
    });
  }, [_]), zn(
    () => _i.subscribe((T) => {
      T.session ? v("entered") : p !== "unsupported" && v("exited");
    }),
    [p]
  );
  const A = te.useCallback(
    async (T) => {
      n?.(T);
      try {
        Gv(_, { sessionInit: s, enterOnly: a, exitOnly: r });
      } catch (C) {
        const P = S.current;
        if (P && C instanceof Error)
          P(C);
        else
          throw C;
      }
    },
    [n, _, s, a, r, S]
  );
  return /* @__PURE__ */ te.createElement("button", {
    ...l,
    ref: f,
    onClick: p === "unsupported" ? n : A
  }, (d = typeof u == "function" ? u(p) : u) != null ? d : E);
}), Ih = {
  position: "absolute",
  bottom: "24px",
  left: "50%",
  transform: "translateX(-50%)",
  padding: "12px 24px",
  border: "1px solid white",
  borderRadius: "4px",
  background: "rgba(0, 0, 0, 0.1)",
  color: "white",
  font: "normal 0.8125rem sans-serif",
  outline: "none",
  zIndex: 99999,
  cursor: "pointer"
};
te.forwardRef(
  ({
    style: c = Ih,
    sessionInit: e = {
      domOverlay: typeof document < "u" ? { root: document.body } : void 0,
      optionalFeatures: ["hit-test", "dom-overlay", "dom-overlay-for-handheld-ar"]
    },
    children: s,
    ...a
  }, r) => /* @__PURE__ */ te.createElement(rc, {
    ...a,
    ref: r,
    mode: "AR",
    style: c,
    sessionInit: e
  }, s)
);
te.forwardRef(
  ({
    style: c = Ih,
    sessionInit: e = { optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking", "layers"] },
    children: s,
    ...a
  }, r) => /* @__PURE__ */ te.createElement(rc, {
    ...a,
    ref: r,
    mode: "VR",
    style: c,
    sessionInit: e
  }, s)
);
function Tt(c = (s) => s, e) {
  const s = te.useContext(Fh);
  if (!s)
    throw new Error("useXR must be used within an <XR /> component!");
  return s(c, e);
}
const ic = /* @__PURE__ */ (() => parseInt($p.replace(/\D+/g, "")))(), Oh = ic >= 125 ? "uv1" : "uv2";
function ld(c, e) {
  if (e === em)
    return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), c;
  if (e === Tu || e === oh) {
    let s = c.getIndex();
    if (s === null) {
      const o = [], u = c.getAttribute("position");
      if (u !== void 0) {
        for (let l = 0; l < u.count; l++)
          o.push(l);
        c.setIndex(o), s = c.getIndex();
      } else
        return console.error(
          "THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."
        ), c;
    }
    const a = s.count - 2, r = [];
    if (s)
      if (e === Tu)
        for (let o = 1; o <= a; o++)
          r.push(s.getX(0)), r.push(s.getX(o)), r.push(s.getX(o + 1));
      else
        for (let o = 0; o < a; o++)
          o % 2 === 0 ? (r.push(s.getX(o)), r.push(s.getX(o + 1)), r.push(s.getX(o + 2))) : (r.push(s.getX(o + 2)), r.push(s.getX(o + 1)), r.push(s.getX(o)));
    r.length / 3 !== a && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    const n = c.clone();
    return n.setIndex(r), n.clearGroups(), n;
  } else
    return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", e), c;
}
var Vv = Object.defineProperty, Wv = (c, e, s) => e in c ? Vv(c, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : c[e] = s, Xv = (c, e, s) => (Wv(c, typeof e != "symbol" ? e + "" : e, s), s);
class Kv {
  constructor() {
    Xv(this, "_listeners");
  }
  /**
   * Adds a listener to an event type.
   * @param type The type of event to listen to.
   * @param listener The function that gets called when the event is fired.
   */
  addEventListener(e, s) {
    this._listeners === void 0 && (this._listeners = {});
    const a = this._listeners;
    a[e] === void 0 && (a[e] = []), a[e].indexOf(s) === -1 && a[e].push(s);
  }
  /**
      * Checks if listener is added to an event type.
      * @param type The type of event to listen to.
      * @param listener The function that gets called when the event is fired.
      */
  hasEventListener(e, s) {
    if (this._listeners === void 0)
      return !1;
    const a = this._listeners;
    return a[e] !== void 0 && a[e].indexOf(s) !== -1;
  }
  /**
      * Removes a listener from an event type.
      * @param type The type of the listener that gets removed.
      * @param listener The listener function that gets removed.
      */
  removeEventListener(e, s) {
    if (this._listeners === void 0)
      return;
    const r = this._listeners[e];
    if (r !== void 0) {
      const n = r.indexOf(s);
      n !== -1 && r.splice(n, 1);
    }
  }
  /**
      * Fire an event type.
      * @param event The event that gets fired.
      */
  dispatchEvent(e) {
    if (this._listeners === void 0)
      return;
    const a = this._listeners[e.type];
    if (a !== void 0) {
      e.target = this;
      const r = a.slice(0);
      for (let n = 0, o = r.length; n < o; n++)
        r[n].call(this, e);
      e.target = null;
    }
  }
}
var Yv = Object.defineProperty, Qv = (c, e, s) => e in c ? Yv(c, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : c[e] = s, Be = (c, e, s) => (Qv(c, typeof e != "symbol" ? e + "" : e, s), s);
const ma = /* @__PURE__ */ new sh(), ud = /* @__PURE__ */ new Ku(), qv = Math.cos(70 * (Math.PI / 180)), cd = (c, e) => (c % e + e) % e;
let Zv = class extends Kv {
  constructor(e, s) {
    super(), Be(this, "object"), Be(this, "domElement"), Be(this, "enabled", !0), Be(this, "target", new oe()), Be(this, "minDistance", 0), Be(this, "maxDistance", 1 / 0), Be(this, "minZoom", 0), Be(this, "maxZoom", 1 / 0), Be(this, "minPolarAngle", 0), Be(this, "maxPolarAngle", Math.PI), Be(this, "minAzimuthAngle", -1 / 0), Be(this, "maxAzimuthAngle", 1 / 0), Be(this, "enableDamping", !1), Be(this, "dampingFactor", 0.05), Be(this, "enableZoom", !0), Be(this, "zoomSpeed", 1), Be(this, "enableRotate", !0), Be(this, "rotateSpeed", 1), Be(this, "enablePan", !0), Be(this, "panSpeed", 1), Be(this, "screenSpacePanning", !0), Be(this, "keyPanSpeed", 7), Be(this, "zoomToCursor", !1), Be(this, "autoRotate", !1), Be(this, "autoRotateSpeed", 2), Be(this, "reverseOrbit", !1), Be(this, "reverseHorizontalOrbit", !1), Be(this, "reverseVerticalOrbit", !1), Be(this, "keys", { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" }), Be(this, "mouseButtons", {
      LEFT: Ki.ROTATE,
      MIDDLE: Ki.DOLLY,
      RIGHT: Ki.PAN
    }), Be(this, "touches", { ONE: Yi.ROTATE, TWO: Yi.DOLLY_PAN }), Be(this, "target0"), Be(this, "position0"), Be(this, "zoom0"), Be(this, "_domElementKeyEvents", null), Be(this, "getPolarAngle"), Be(this, "getAzimuthalAngle"), Be(this, "setPolarAngle"), Be(this, "setAzimuthalAngle"), Be(this, "getDistance"), Be(this, "getZoomScale"), Be(this, "listenToKeyEvents"), Be(this, "stopListenToKeyEvents"), Be(this, "saveState"), Be(this, "reset"), Be(this, "update"), Be(this, "connect"), Be(this, "dispose"), Be(this, "dollyIn"), Be(this, "dollyOut"), Be(this, "getScale"), Be(this, "setScale"), this.object = e, this.domElement = s, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this.getPolarAngle = () => d.phi, this.getAzimuthalAngle = () => d.theta, this.setPolarAngle = (B) => {
      let ue = cd(B, 2 * Math.PI), Pe = d.phi;
      Pe < 0 && (Pe += 2 * Math.PI), ue < 0 && (ue += 2 * Math.PI);
      let Re = Math.abs(ue - Pe);
      2 * Math.PI - Re < Re && (ue < Pe ? ue += 2 * Math.PI : Pe += 2 * Math.PI), p.phi = ue - Pe, a.update();
    }, this.setAzimuthalAngle = (B) => {
      let ue = cd(B, 2 * Math.PI), Pe = d.theta;
      Pe < 0 && (Pe += 2 * Math.PI), ue < 0 && (ue += 2 * Math.PI);
      let Re = Math.abs(ue - Pe);
      2 * Math.PI - Re < Re && (ue < Pe ? ue += 2 * Math.PI : Pe += 2 * Math.PI), p.theta = ue - Pe, a.update();
    }, this.getDistance = () => a.object.position.distanceTo(a.target), this.listenToKeyEvents = (B) => {
      B.addEventListener("keydown", Le), this._domElementKeyEvents = B;
    }, this.stopListenToKeyEvents = () => {
      this._domElementKeyEvents.removeEventListener("keydown", Le), this._domElementKeyEvents = null;
    }, this.saveState = () => {
      a.target0.copy(a.target), a.position0.copy(a.object.position), a.zoom0 = a.object.zoom;
    }, this.reset = () => {
      a.target.copy(a.target0), a.object.position.copy(a.position0), a.object.zoom = a.zoom0, a.object.updateProjectionMatrix(), a.dispatchEvent(r), a.update(), l = u.NONE;
    }, this.update = (() => {
      const B = new oe(), ue = new oe(0, 1, 0), Pe = new Ga().setFromUnitVectors(e.up, ue), Re = Pe.clone().invert(), Ae = new oe(), Ye = new Ga(), kt = 2 * Math.PI;
      return function() {
        const Xe = a.object.position;
        Pe.setFromUnitVectors(e.up, ue), Re.copy(Pe).invert(), B.copy(Xe).sub(a.target), B.applyQuaternion(Pe), d.setFromVector3(B), a.autoRotate && l === u.NONE && N(k()), a.enableDamping ? (d.theta += p.theta * a.dampingFactor, d.phi += p.phi * a.dampingFactor) : (d.theta += p.theta, d.phi += p.phi);
        let nt = a.minAzimuthAngle, et = a.maxAzimuthAngle;
        isFinite(nt) && isFinite(et) && (nt < -Math.PI ? nt += kt : nt > Math.PI && (nt -= kt), et < -Math.PI ? et += kt : et > Math.PI && (et -= kt), nt <= et ? d.theta = Math.max(nt, Math.min(et, d.theta)) : d.theta = d.theta > (nt + et) / 2 ? Math.max(nt, d.theta) : Math.min(et, d.theta)), d.phi = Math.max(a.minPolarAngle, Math.min(a.maxPolarAngle, d.phi)), d.makeSafe(), a.enableDamping === !0 ? a.target.addScaledVector(g, a.dampingFactor) : a.target.add(g), a.zoomToCursor && U || a.object.isOrthographicCamera ? d.radius = W(d.radius) : d.radius = W(d.radius * v), B.setFromSpherical(d), B.applyQuaternion(Re), Xe.copy(a.target).add(B), a.object.matrixAutoUpdate || a.object.updateMatrix(), a.object.lookAt(a.target), a.enableDamping === !0 ? (p.theta *= 1 - a.dampingFactor, p.phi *= 1 - a.dampingFactor, g.multiplyScalar(1 - a.dampingFactor)) : (p.set(0, 0, 0), g.set(0, 0, 0));
        let ze = !1;
        if (a.zoomToCursor && U) {
          let rt = null;
          if (a.object instanceof cs && a.object.isPerspectiveCamera) {
            const pt = B.length();
            rt = W(pt * v);
            const vt = pt - rt;
            a.object.position.addScaledVector(b, vt), a.object.updateMatrixWorld();
          } else if (a.object.isOrthographicCamera) {
            const pt = new oe(L.x, L.y, 0);
            pt.unproject(a.object), a.object.zoom = Math.max(a.minZoom, Math.min(a.maxZoom, a.object.zoom / v)), a.object.updateProjectionMatrix(), ze = !0;
            const vt = new oe(L.x, L.y, 0);
            vt.unproject(a.object), a.object.position.sub(vt).add(pt), a.object.updateMatrixWorld(), rt = B.length();
          } else
            console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), a.zoomToCursor = !1;
          rt !== null && (a.screenSpacePanning ? a.target.set(0, 0, -1).transformDirection(a.object.matrix).multiplyScalar(rt).add(a.object.position) : (ma.origin.copy(a.object.position), ma.direction.set(0, 0, -1).transformDirection(a.object.matrix), Math.abs(a.object.up.dot(ma.direction)) < qv ? e.lookAt(a.target) : (ud.setFromNormalAndCoplanarPoint(a.object.up, a.target), ma.intersectPlane(ud, a.target))));
        } else
          a.object instanceof us && a.object.isOrthographicCamera && (ze = v !== 1, ze && (a.object.zoom = Math.max(a.minZoom, Math.min(a.maxZoom, a.object.zoom / v)), a.object.updateProjectionMatrix()));
        return v = 1, U = !1, ze || Ae.distanceToSquared(a.object.position) > f || 8 * (1 - Ye.dot(a.object.quaternion)) > f ? (a.dispatchEvent(r), Ae.copy(a.object.position), Ye.copy(a.object.quaternion), ze = !1, !0) : !1;
      };
    })(), this.connect = (B) => {
      a.domElement = B, a.domElement.style.touchAction = "none", a.domElement.addEventListener("contextmenu", st), a.domElement.addEventListener("pointerdown", je), a.domElement.addEventListener("pointercancel", Ee), a.domElement.addEventListener("wheel", be);
    }, this.dispose = () => {
      var B, ue, Pe, Re, Ae, Ye;
      a.domElement && (a.domElement.style.touchAction = "auto"), (B = a.domElement) == null || B.removeEventListener("contextmenu", st), (ue = a.domElement) == null || ue.removeEventListener("pointerdown", je), (Pe = a.domElement) == null || Pe.removeEventListener("pointercancel", Ee), (Re = a.domElement) == null || Re.removeEventListener("wheel", be), (Ae = a.domElement) == null || Ae.ownerDocument.removeEventListener("pointermove", _e), (Ye = a.domElement) == null || Ye.ownerDocument.removeEventListener("pointerup", Ee), a._domElementKeyEvents !== null && a._domElementKeyEvents.removeEventListener("keydown", Le);
    };
    const a = this, r = { type: "change" }, n = { type: "start" }, o = { type: "end" }, u = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6
    };
    let l = u.NONE;
    const f = 1e-6, d = new Bf(), p = new Bf();
    let v = 1;
    const g = new oe(), x = new Qe(), E = new Qe(), _ = new Qe(), S = new Qe(), A = new Qe(), T = new Qe(), C = new Qe(), P = new Qe(), M = new Qe(), b = new oe(), L = new Qe();
    let U = !1;
    const R = [], I = {};
    function k() {
      return 2 * Math.PI / 60 / 60 * a.autoRotateSpeed;
    }
    function O() {
      return Math.pow(0.95, a.zoomSpeed);
    }
    function N(B) {
      a.reverseOrbit || a.reverseHorizontalOrbit ? p.theta += B : p.theta -= B;
    }
    function J(B) {
      a.reverseOrbit || a.reverseVerticalOrbit ? p.phi += B : p.phi -= B;
    }
    const Z = (() => {
      const B = new oe();
      return function(Pe, Re) {
        B.setFromMatrixColumn(Re, 0), B.multiplyScalar(-Pe), g.add(B);
      };
    })(), ce = (() => {
      const B = new oe();
      return function(Pe, Re) {
        a.screenSpacePanning === !0 ? B.setFromMatrixColumn(Re, 1) : (B.setFromMatrixColumn(Re, 0), B.crossVectors(a.object.up, B)), B.multiplyScalar(Pe), g.add(B);
      };
    })(), K = (() => {
      const B = new oe();
      return function(Pe, Re) {
        const Ae = a.domElement;
        if (Ae && a.object instanceof cs && a.object.isPerspectiveCamera) {
          const Ye = a.object.position;
          B.copy(Ye).sub(a.target);
          let kt = B.length();
          kt *= Math.tan(a.object.fov / 2 * Math.PI / 180), Z(2 * Pe * kt / Ae.clientHeight, a.object.matrix), ce(2 * Re * kt / Ae.clientHeight, a.object.matrix);
        } else
          Ae && a.object instanceof us && a.object.isOrthographicCamera ? (Z(
            Pe * (a.object.right - a.object.left) / a.object.zoom / Ae.clientWidth,
            a.object.matrix
          ), ce(
            Re * (a.object.top - a.object.bottom) / a.object.zoom / Ae.clientHeight,
            a.object.matrix
          )) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), a.enablePan = !1);
      };
    })();
    function V(B) {
      a.object instanceof cs && a.object.isPerspectiveCamera || a.object instanceof us && a.object.isOrthographicCamera ? v = B : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), a.enableZoom = !1);
    }
    function G(B) {
      V(v / B);
    }
    function F(B) {
      V(v * B);
    }
    function j(B) {
      if (!a.zoomToCursor || !a.domElement)
        return;
      U = !0;
      const ue = a.domElement.getBoundingClientRect(), Pe = B.clientX - ue.left, Re = B.clientY - ue.top, Ae = ue.width, Ye = ue.height;
      L.x = Pe / Ae * 2 - 1, L.y = -(Re / Ye) * 2 + 1, b.set(L.x, L.y, 1).unproject(a.object).sub(a.object.position).normalize();
    }
    function W(B) {
      return Math.max(a.minDistance, Math.min(a.maxDistance, B));
    }
    function $(B) {
      x.set(B.clientX, B.clientY);
    }
    function Y(B) {
      j(B), C.set(B.clientX, B.clientY);
    }
    function se(B) {
      S.set(B.clientX, B.clientY);
    }
    function X(B) {
      E.set(B.clientX, B.clientY), _.subVectors(E, x).multiplyScalar(a.rotateSpeed);
      const ue = a.domElement;
      ue && (N(2 * Math.PI * _.x / ue.clientHeight), J(2 * Math.PI * _.y / ue.clientHeight)), x.copy(E), a.update();
    }
    function q(B) {
      P.set(B.clientX, B.clientY), M.subVectors(P, C), M.y > 0 ? G(O()) : M.y < 0 && F(O()), C.copy(P), a.update();
    }
    function re(B) {
      A.set(B.clientX, B.clientY), T.subVectors(A, S).multiplyScalar(a.panSpeed), K(T.x, T.y), S.copy(A), a.update();
    }
    function pe(B) {
      j(B), B.deltaY < 0 ? F(O()) : B.deltaY > 0 && G(O()), a.update();
    }
    function ae(B) {
      let ue = !1;
      switch (B.code) {
        case a.keys.UP:
          K(0, a.keyPanSpeed), ue = !0;
          break;
        case a.keys.BOTTOM:
          K(0, -a.keyPanSpeed), ue = !0;
          break;
        case a.keys.LEFT:
          K(a.keyPanSpeed, 0), ue = !0;
          break;
        case a.keys.RIGHT:
          K(-a.keyPanSpeed, 0), ue = !0;
          break;
      }
      ue && (B.preventDefault(), a.update());
    }
    function ie() {
      if (R.length == 1)
        x.set(R[0].pageX, R[0].pageY);
      else {
        const B = 0.5 * (R[0].pageX + R[1].pageX), ue = 0.5 * (R[0].pageY + R[1].pageY);
        x.set(B, ue);
      }
    }
    function fe() {
      if (R.length == 1)
        S.set(R[0].pageX, R[0].pageY);
      else {
        const B = 0.5 * (R[0].pageX + R[1].pageX), ue = 0.5 * (R[0].pageY + R[1].pageY);
        S.set(B, ue);
      }
    }
    function ve() {
      const B = R[0].pageX - R[1].pageX, ue = R[0].pageY - R[1].pageY, Pe = Math.sqrt(B * B + ue * ue);
      C.set(0, Pe);
    }
    function me() {
      a.enableZoom && ve(), a.enablePan && fe();
    }
    function we() {
      a.enableZoom && ve(), a.enableRotate && ie();
    }
    function Fe(B) {
      if (R.length == 1)
        E.set(B.pageX, B.pageY);
      else {
        const Pe = Ue(B), Re = 0.5 * (B.pageX + Pe.x), Ae = 0.5 * (B.pageY + Pe.y);
        E.set(Re, Ae);
      }
      _.subVectors(E, x).multiplyScalar(a.rotateSpeed);
      const ue = a.domElement;
      ue && (N(2 * Math.PI * _.x / ue.clientHeight), J(2 * Math.PI * _.y / ue.clientHeight)), x.copy(E);
    }
    function de(B) {
      if (R.length == 1)
        A.set(B.pageX, B.pageY);
      else {
        const ue = Ue(B), Pe = 0.5 * (B.pageX + ue.x), Re = 0.5 * (B.pageY + ue.y);
        A.set(Pe, Re);
      }
      T.subVectors(A, S).multiplyScalar(a.panSpeed), K(T.x, T.y), S.copy(A);
    }
    function Me(B) {
      const ue = Ue(B), Pe = B.pageX - ue.x, Re = B.pageY - ue.y, Ae = Math.sqrt(Pe * Pe + Re * Re);
      P.set(0, Ae), M.set(0, Math.pow(P.y / C.y, a.zoomSpeed)), G(M.y), C.copy(P);
    }
    function Te(B) {
      a.enableZoom && Me(B), a.enablePan && de(B);
    }
    function le(B) {
      a.enableZoom && Me(B), a.enableRotate && Fe(B);
    }
    function je(B) {
      var ue, Pe;
      a.enabled !== !1 && (R.length === 0 && ((ue = a.domElement) == null || ue.ownerDocument.addEventListener("pointermove", _e), (Pe = a.domElement) == null || Pe.ownerDocument.addEventListener("pointerup", Ee)), ct(B), B.pointerType === "touch" ? Oe(B) : xe(B));
    }
    function _e(B) {
      a.enabled !== !1 && (B.pointerType === "touch" ? Ge(B) : tt(B));
    }
    function Ee(B) {
      var ue, Pe, Re;
      Ke(B), R.length === 0 && ((ue = a.domElement) == null || ue.releasePointerCapture(B.pointerId), (Pe = a.domElement) == null || Pe.ownerDocument.removeEventListener("pointermove", _e), (Re = a.domElement) == null || Re.ownerDocument.removeEventListener("pointerup", Ee)), a.dispatchEvent(o), l = u.NONE;
    }
    function xe(B) {
      let ue;
      switch (B.button) {
        case 0:
          ue = a.mouseButtons.LEFT;
          break;
        case 1:
          ue = a.mouseButtons.MIDDLE;
          break;
        case 2:
          ue = a.mouseButtons.RIGHT;
          break;
        default:
          ue = -1;
      }
      switch (ue) {
        case Ki.DOLLY:
          if (a.enableZoom === !1)
            return;
          Y(B), l = u.DOLLY;
          break;
        case Ki.ROTATE:
          if (B.ctrlKey || B.metaKey || B.shiftKey) {
            if (a.enablePan === !1)
              return;
            se(B), l = u.PAN;
          } else {
            if (a.enableRotate === !1)
              return;
            $(B), l = u.ROTATE;
          }
          break;
        case Ki.PAN:
          if (B.ctrlKey || B.metaKey || B.shiftKey) {
            if (a.enableRotate === !1)
              return;
            $(B), l = u.ROTATE;
          } else {
            if (a.enablePan === !1)
              return;
            se(B), l = u.PAN;
          }
          break;
        default:
          l = u.NONE;
      }
      l !== u.NONE && a.dispatchEvent(n);
    }
    function tt(B) {
      if (a.enabled !== !1)
        switch (l) {
          case u.ROTATE:
            if (a.enableRotate === !1)
              return;
            X(B);
            break;
          case u.DOLLY:
            if (a.enableZoom === !1)
              return;
            q(B);
            break;
          case u.PAN:
            if (a.enablePan === !1)
              return;
            re(B);
            break;
        }
    }
    function be(B) {
      a.enabled === !1 || a.enableZoom === !1 || l !== u.NONE && l !== u.ROTATE || (B.preventDefault(), a.dispatchEvent(n), pe(B), a.dispatchEvent(o));
    }
    function Le(B) {
      a.enabled === !1 || a.enablePan === !1 || ae(B);
    }
    function Oe(B) {
      switch (We(B), R.length) {
        case 1:
          switch (a.touches.ONE) {
            case Yi.ROTATE:
              if (a.enableRotate === !1)
                return;
              ie(), l = u.TOUCH_ROTATE;
              break;
            case Yi.PAN:
              if (a.enablePan === !1)
                return;
              fe(), l = u.TOUCH_PAN;
              break;
            default:
              l = u.NONE;
          }
          break;
        case 2:
          switch (a.touches.TWO) {
            case Yi.DOLLY_PAN:
              if (a.enableZoom === !1 && a.enablePan === !1)
                return;
              me(), l = u.TOUCH_DOLLY_PAN;
              break;
            case Yi.DOLLY_ROTATE:
              if (a.enableZoom === !1 && a.enableRotate === !1)
                return;
              we(), l = u.TOUCH_DOLLY_ROTATE;
              break;
            default:
              l = u.NONE;
          }
          break;
        default:
          l = u.NONE;
      }
      l !== u.NONE && a.dispatchEvent(n);
    }
    function Ge(B) {
      switch (We(B), l) {
        case u.TOUCH_ROTATE:
          if (a.enableRotate === !1)
            return;
          Fe(B), a.update();
          break;
        case u.TOUCH_PAN:
          if (a.enablePan === !1)
            return;
          de(B), a.update();
          break;
        case u.TOUCH_DOLLY_PAN:
          if (a.enableZoom === !1 && a.enablePan === !1)
            return;
          Te(B), a.update();
          break;
        case u.TOUCH_DOLLY_ROTATE:
          if (a.enableZoom === !1 && a.enableRotate === !1)
            return;
          le(B), a.update();
          break;
        default:
          l = u.NONE;
      }
    }
    function st(B) {
      a.enabled !== !1 && B.preventDefault();
    }
    function ct(B) {
      R.push(B);
    }
    function Ke(B) {
      delete I[B.pointerId];
      for (let ue = 0; ue < R.length; ue++)
        if (R[ue].pointerId == B.pointerId) {
          R.splice(ue, 1);
          return;
        }
    }
    function We(B) {
      let ue = I[B.pointerId];
      ue === void 0 && (ue = new Qe(), I[B.pointerId] = ue), ue.set(B.pageX, B.pageY);
    }
    function Ue(B) {
      const ue = B.pointerId === R[0].pointerId ? R[1] : R[0];
      return I[ue.pointerId];
    }
    this.dollyIn = (B = O()) => {
      F(B), a.update();
    }, this.dollyOut = (B = O()) => {
      G(B), a.update();
    }, this.getScale = () => v, this.setScale = (B) => {
      V(B), a.update();
    }, this.getZoomScale = () => O(), s !== void 0 && this.connect(s), this.update();
  }
};
function Va(c) {
  if (typeof TextDecoder < "u")
    return new TextDecoder().decode(c);
  let e = "";
  for (let s = 0, a = c.length; s < a; s++)
    e += String.fromCharCode(c[s]);
  try {
    return decodeURIComponent(escape(e));
  } catch {
    return e;
  }
}
const Si = "srgb", Ur = "srgb-linear", fd = 3001, Jv = 3e3;
class Nh extends tm {
  constructor(e) {
    super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(s) {
      return new rg(s);
    }), this.register(function(s) {
      return new ig(s);
    }), this.register(function(s) {
      return new hg(s);
    }), this.register(function(s) {
      return new pg(s);
    }), this.register(function(s) {
      return new mg(s);
    }), this.register(function(s) {
      return new sg(s);
    }), this.register(function(s) {
      return new ag(s);
    }), this.register(function(s) {
      return new lg(s);
    }), this.register(function(s) {
      return new ug(s);
    }), this.register(function(s) {
      return new ng(s);
    }), this.register(function(s) {
      return new cg(s);
    }), this.register(function(s) {
      return new og(s);
    }), this.register(function(s) {
      return new dg(s);
    }), this.register(function(s) {
      return new fg(s);
    }), this.register(function(s) {
      return new eg(s);
    }), this.register(function(s) {
      return new vg(s);
    }), this.register(function(s) {
      return new gg(s);
    });
  }
  load(e, s, a, r) {
    const n = this;
    let o;
    if (this.resourcePath !== "")
      o = this.resourcePath;
    else if (this.path !== "") {
      const f = fs.extractUrlBase(e);
      o = fs.resolveURL(f, this.path);
    } else
      o = fs.extractUrlBase(e);
    this.manager.itemStart(e);
    const u = function(f) {
      r ? r(f) : console.error(f), n.manager.itemError(e), n.manager.itemEnd(e);
    }, l = new ah(this.manager);
    l.setPath(this.path), l.setResponseType("arraybuffer"), l.setRequestHeader(this.requestHeader), l.setWithCredentials(this.withCredentials), l.load(
      e,
      function(f) {
        try {
          n.parse(
            f,
            o,
            function(d) {
              s(d), n.manager.itemEnd(e);
            },
            u
          );
        } catch (d) {
          u(d);
        }
      },
      a,
      u
    );
  }
  setDRACOLoader(e) {
    return this.dracoLoader = e, this;
  }
  setDDSLoader() {
    throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".');
  }
  setKTX2Loader(e) {
    return this.ktx2Loader = e, this;
  }
  setMeshoptDecoder(e) {
    return this.meshoptDecoder = e, this;
  }
  register(e) {
    return this.pluginCallbacks.indexOf(e) === -1 && this.pluginCallbacks.push(e), this;
  }
  unregister(e) {
    return this.pluginCallbacks.indexOf(e) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e), 1), this;
  }
  parse(e, s, a, r) {
    let n;
    const o = {}, u = {};
    if (typeof e == "string")
      n = JSON.parse(e);
    else if (e instanceof ArrayBuffer)
      if (Va(new Uint8Array(e.slice(0, 4))) === Bh) {
        try {
          o[$e.KHR_BINARY_GLTF] = new yg(e);
        } catch (d) {
          r && r(d);
          return;
        }
        n = JSON.parse(o[$e.KHR_BINARY_GLTF].content);
      } else
        n = JSON.parse(Va(new Uint8Array(e)));
    else
      n = e;
    if (n.asset === void 0 || n.asset.version[0] < 2) {
      r && r(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const l = new Rg(n, {
      path: s || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    l.fileLoader.setRequestHeader(this.requestHeader);
    for (let f = 0; f < this.pluginCallbacks.length; f++) {
      const d = this.pluginCallbacks[f](l);
      d.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), u[d.name] = d, o[d.name] = !0;
    }
    if (n.extensionsUsed)
      for (let f = 0; f < n.extensionsUsed.length; ++f) {
        const d = n.extensionsUsed[f], p = n.extensionsRequired || [];
        switch (d) {
          case $e.KHR_MATERIALS_UNLIT:
            o[d] = new tg();
            break;
          case $e.KHR_DRACO_MESH_COMPRESSION:
            o[d] = new xg(n, this.dracoLoader);
            break;
          case $e.KHR_TEXTURE_TRANSFORM:
            o[d] = new Sg();
            break;
          case $e.KHR_MESH_QUANTIZATION:
            o[d] = new wg();
            break;
          default:
            p.indexOf(d) >= 0 && u[d] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + d + '".');
        }
      }
    l.setExtensions(o), l.setPlugins(u), l.parse(a, r);
  }
  parseAsync(e, s) {
    const a = this;
    return new Promise(function(r, n) {
      a.parse(e, s, r, n);
    });
  }
}
function $v() {
  let c = {};
  return {
    get: function(e) {
      return c[e];
    },
    add: function(e, s) {
      c[e] = s;
    },
    remove: function(e) {
      delete c[e];
    },
    removeAll: function() {
      c = {};
    }
  };
}
const $e = {
  KHR_BINARY_GLTF: "KHR_binary_glTF",
  KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
  KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
  KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
  KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion",
  KHR_MATERIALS_IOR: "KHR_materials_ior",
  KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
  KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
  KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
  KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
  KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
  KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
  KHR_MATERIALS_VOLUME: "KHR_materials_volume",
  KHR_TEXTURE_BASISU: "KHR_texture_basisu",
  KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
  KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
  KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
  EXT_MATERIALS_BUMP: "EXT_materials_bump",
  EXT_TEXTURE_WEBP: "EXT_texture_webp",
  EXT_TEXTURE_AVIF: "EXT_texture_avif",
  EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
  EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
};
class eg {
  constructor(e) {
    this.parser = e, this.name = $e.KHR_LIGHTS_PUNCTUAL, this.cache = { refs: {}, uses: {} };
  }
  _markDefs() {
    const e = this.parser, s = this.parser.json.nodes || [];
    for (let a = 0, r = s.length; a < r; a++) {
      const n = s[a];
      n.extensions && n.extensions[this.name] && n.extensions[this.name].light !== void 0 && e._addNodeRef(this.cache, n.extensions[this.name].light);
    }
  }
  _loadLight(e) {
    const s = this.parser, a = "light:" + e;
    let r = s.cache.get(a);
    if (r)
      return r;
    const n = s.json, l = ((n.extensions && n.extensions[this.name] || {}).lights || [])[e];
    let f;
    const d = new Wn(16777215);
    l.color !== void 0 && d.setRGB(l.color[0], l.color[1], l.color[2], Ur);
    const p = l.range !== void 0 ? l.range : 0;
    switch (l.type) {
      case "directional":
        f = new im(d), f.target.position.set(0, 0, -1), f.add(f.target);
        break;
      case "point":
        f = new rm(d), f.distance = p;
        break;
      case "spot":
        f = new nm(d), f.distance = p, l.spot = l.spot || {}, l.spot.innerConeAngle = l.spot.innerConeAngle !== void 0 ? l.spot.innerConeAngle : 0, l.spot.outerConeAngle = l.spot.outerConeAngle !== void 0 ? l.spot.outerConeAngle : Math.PI / 4, f.angle = l.spot.outerConeAngle, f.penumbra = 1 - l.spot.innerConeAngle / l.spot.outerConeAngle, f.target.position.set(0, 0, -1), f.add(f.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + l.type);
    }
    return f.position.set(0, 0, 0), f.decay = 2, Rr(f, l), l.intensity !== void 0 && (f.intensity = l.intensity), f.name = s.createUniqueName(l.name || "light_" + e), r = Promise.resolve(f), s.cache.add(a, r), r;
  }
  getDependency(e, s) {
    if (e === "light")
      return this._loadLight(s);
  }
  createNodeAttachment(e) {
    const s = this, a = this.parser, n = a.json.nodes[e], u = (n.extensions && n.extensions[this.name] || {}).light;
    return u === void 0 ? null : this._loadLight(u).then(function(l) {
      return a._getNodeRef(s.cache, u, l);
    });
  }
}
class tg {
  constructor() {
    this.name = $e.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return Qr;
  }
  extendParams(e, s, a) {
    const r = [];
    e.color = new Wn(1, 1, 1), e.opacity = 1;
    const n = s.pbrMetallicRoughness;
    if (n) {
      if (Array.isArray(n.baseColorFactor)) {
        const o = n.baseColorFactor;
        e.color.setRGB(o[0], o[1], o[2], Ur), e.opacity = o[3];
      }
      n.baseColorTexture !== void 0 && r.push(a.assignTexture(e, "map", n.baseColorTexture, Si));
    }
    return Promise.all(r);
  }
}
class ng {
  constructor(e) {
    this.parser = e, this.name = $e.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(e, s) {
    const r = this.parser.json.materials[e];
    if (!r.extensions || !r.extensions[this.name])
      return Promise.resolve();
    const n = r.extensions[this.name].emissiveStrength;
    return n !== void 0 && (s.emissiveIntensity = n), Promise.resolve();
  }
}
class rg {
  constructor(e) {
    this.parser = e, this.name = $e.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(e) {
    const a = this.parser.json.materials[e];
    return !a.extensions || !a.extensions[this.name] ? null : nr;
  }
  extendMaterialParams(e, s) {
    const a = this.parser, r = a.json.materials[e];
    if (!r.extensions || !r.extensions[this.name])
      return Promise.resolve();
    const n = [], o = r.extensions[this.name];
    if (o.clearcoatFactor !== void 0 && (s.clearcoat = o.clearcoatFactor), o.clearcoatTexture !== void 0 && n.push(a.assignTexture(s, "clearcoatMap", o.clearcoatTexture)), o.clearcoatRoughnessFactor !== void 0 && (s.clearcoatRoughness = o.clearcoatRoughnessFactor), o.clearcoatRoughnessTexture !== void 0 && n.push(a.assignTexture(s, "clearcoatRoughnessMap", o.clearcoatRoughnessTexture)), o.clearcoatNormalTexture !== void 0 && (n.push(a.assignTexture(s, "clearcoatNormalMap", o.clearcoatNormalTexture)), o.clearcoatNormalTexture.scale !== void 0)) {
      const u = o.clearcoatNormalTexture.scale;
      s.clearcoatNormalScale = new Qe(u, u);
    }
    return Promise.all(n);
  }
}
class ig {
  constructor(e) {
    this.parser = e, this.name = $e.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(e) {
    const a = this.parser.json.materials[e];
    return !a.extensions || !a.extensions[this.name] ? null : nr;
  }
  extendMaterialParams(e, s) {
    const r = this.parser.json.materials[e];
    if (!r.extensions || !r.extensions[this.name])
      return Promise.resolve();
    const n = r.extensions[this.name];
    return s.dispersion = n.dispersion !== void 0 ? n.dispersion : 0, Promise.resolve();
  }
}
class og {
  constructor(e) {
    this.parser = e, this.name = $e.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(e) {
    const a = this.parser.json.materials[e];
    return !a.extensions || !a.extensions[this.name] ? null : nr;
  }
  extendMaterialParams(e, s) {
    const a = this.parser, r = a.json.materials[e];
    if (!r.extensions || !r.extensions[this.name])
      return Promise.resolve();
    const n = [], o = r.extensions[this.name];
    return o.iridescenceFactor !== void 0 && (s.iridescence = o.iridescenceFactor), o.iridescenceTexture !== void 0 && n.push(a.assignTexture(s, "iridescenceMap", o.iridescenceTexture)), o.iridescenceIor !== void 0 && (s.iridescenceIOR = o.iridescenceIor), s.iridescenceThicknessRange === void 0 && (s.iridescenceThicknessRange = [100, 400]), o.iridescenceThicknessMinimum !== void 0 && (s.iridescenceThicknessRange[0] = o.iridescenceThicknessMinimum), o.iridescenceThicknessMaximum !== void 0 && (s.iridescenceThicknessRange[1] = o.iridescenceThicknessMaximum), o.iridescenceThicknessTexture !== void 0 && n.push(
      a.assignTexture(s, "iridescenceThicknessMap", o.iridescenceThicknessTexture)
    ), Promise.all(n);
  }
}
class sg {
  constructor(e) {
    this.parser = e, this.name = $e.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(e) {
    const a = this.parser.json.materials[e];
    return !a.extensions || !a.extensions[this.name] ? null : nr;
  }
  extendMaterialParams(e, s) {
    const a = this.parser, r = a.json.materials[e];
    if (!r.extensions || !r.extensions[this.name])
      return Promise.resolve();
    const n = [];
    s.sheenColor = new Wn(0, 0, 0), s.sheenRoughness = 0, s.sheen = 1;
    const o = r.extensions[this.name];
    if (o.sheenColorFactor !== void 0) {
      const u = o.sheenColorFactor;
      s.sheenColor.setRGB(u[0], u[1], u[2], Ur);
    }
    return o.sheenRoughnessFactor !== void 0 && (s.sheenRoughness = o.sheenRoughnessFactor), o.sheenColorTexture !== void 0 && n.push(a.assignTexture(s, "sheenColorMap", o.sheenColorTexture, Si)), o.sheenRoughnessTexture !== void 0 && n.push(a.assignTexture(s, "sheenRoughnessMap", o.sheenRoughnessTexture)), Promise.all(n);
  }
}
class ag {
  constructor(e) {
    this.parser = e, this.name = $e.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(e) {
    const a = this.parser.json.materials[e];
    return !a.extensions || !a.extensions[this.name] ? null : nr;
  }
  extendMaterialParams(e, s) {
    const a = this.parser, r = a.json.materials[e];
    if (!r.extensions || !r.extensions[this.name])
      return Promise.resolve();
    const n = [], o = r.extensions[this.name];
    return o.transmissionFactor !== void 0 && (s.transmission = o.transmissionFactor), o.transmissionTexture !== void 0 && n.push(a.assignTexture(s, "transmissionMap", o.transmissionTexture)), Promise.all(n);
  }
}
class lg {
  constructor(e) {
    this.parser = e, this.name = $e.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(e) {
    const a = this.parser.json.materials[e];
    return !a.extensions || !a.extensions[this.name] ? null : nr;
  }
  extendMaterialParams(e, s) {
    const a = this.parser, r = a.json.materials[e];
    if (!r.extensions || !r.extensions[this.name])
      return Promise.resolve();
    const n = [], o = r.extensions[this.name];
    s.thickness = o.thicknessFactor !== void 0 ? o.thicknessFactor : 0, o.thicknessTexture !== void 0 && n.push(a.assignTexture(s, "thicknessMap", o.thicknessTexture)), s.attenuationDistance = o.attenuationDistance || 1 / 0;
    const u = o.attenuationColor || [1, 1, 1];
    return s.attenuationColor = new Wn().setRGB(
      u[0],
      u[1],
      u[2],
      Ur
    ), Promise.all(n);
  }
}
class ug {
  constructor(e) {
    this.parser = e, this.name = $e.KHR_MATERIALS_IOR;
  }
  getMaterialType(e) {
    const a = this.parser.json.materials[e];
    return !a.extensions || !a.extensions[this.name] ? null : nr;
  }
  extendMaterialParams(e, s) {
    const r = this.parser.json.materials[e];
    if (!r.extensions || !r.extensions[this.name])
      return Promise.resolve();
    const n = r.extensions[this.name];
    return s.ior = n.ior !== void 0 ? n.ior : 1.5, Promise.resolve();
  }
}
class cg {
  constructor(e) {
    this.parser = e, this.name = $e.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(e) {
    const a = this.parser.json.materials[e];
    return !a.extensions || !a.extensions[this.name] ? null : nr;
  }
  extendMaterialParams(e, s) {
    const a = this.parser, r = a.json.materials[e];
    if (!r.extensions || !r.extensions[this.name])
      return Promise.resolve();
    const n = [], o = r.extensions[this.name];
    s.specularIntensity = o.specularFactor !== void 0 ? o.specularFactor : 1, o.specularTexture !== void 0 && n.push(a.assignTexture(s, "specularIntensityMap", o.specularTexture));
    const u = o.specularColorFactor || [1, 1, 1];
    return s.specularColor = new Wn().setRGB(u[0], u[1], u[2], Ur), o.specularColorTexture !== void 0 && n.push(
      a.assignTexture(s, "specularColorMap", o.specularColorTexture, Si)
    ), Promise.all(n);
  }
}
class fg {
  constructor(e) {
    this.parser = e, this.name = $e.EXT_MATERIALS_BUMP;
  }
  getMaterialType(e) {
    const a = this.parser.json.materials[e];
    return !a.extensions || !a.extensions[this.name] ? null : nr;
  }
  extendMaterialParams(e, s) {
    const a = this.parser, r = a.json.materials[e];
    if (!r.extensions || !r.extensions[this.name])
      return Promise.resolve();
    const n = [], o = r.extensions[this.name];
    return s.bumpScale = o.bumpFactor !== void 0 ? o.bumpFactor : 1, o.bumpTexture !== void 0 && n.push(a.assignTexture(s, "bumpMap", o.bumpTexture)), Promise.all(n);
  }
}
class dg {
  constructor(e) {
    this.parser = e, this.name = $e.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(e) {
    const a = this.parser.json.materials[e];
    return !a.extensions || !a.extensions[this.name] ? null : nr;
  }
  extendMaterialParams(e, s) {
    const a = this.parser, r = a.json.materials[e];
    if (!r.extensions || !r.extensions[this.name])
      return Promise.resolve();
    const n = [], o = r.extensions[this.name];
    return o.anisotropyStrength !== void 0 && (s.anisotropy = o.anisotropyStrength), o.anisotropyRotation !== void 0 && (s.anisotropyRotation = o.anisotropyRotation), o.anisotropyTexture !== void 0 && n.push(a.assignTexture(s, "anisotropyMap", o.anisotropyTexture)), Promise.all(n);
  }
}
class hg {
  constructor(e) {
    this.parser = e, this.name = $e.KHR_TEXTURE_BASISU;
  }
  loadTexture(e) {
    const s = this.parser, a = s.json, r = a.textures[e];
    if (!r.extensions || !r.extensions[this.name])
      return null;
    const n = r.extensions[this.name], o = s.options.ktx2Loader;
    if (!o) {
      if (a.extensionsRequired && a.extensionsRequired.indexOf(this.name) >= 0)
        throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      return null;
    }
    return s.loadTextureImage(e, n.source, o);
  }
}
class pg {
  constructor(e) {
    this.parser = e, this.name = $e.EXT_TEXTURE_WEBP, this.isSupported = null;
  }
  loadTexture(e) {
    const s = this.name, a = this.parser, r = a.json, n = r.textures[e];
    if (!n.extensions || !n.extensions[s])
      return null;
    const o = n.extensions[s], u = r.images[o.source];
    let l = a.textureLoader;
    if (u.uri) {
      const f = a.options.manager.getHandler(u.uri);
      f !== null && (l = f);
    }
    return this.detectSupport().then(function(f) {
      if (f)
        return a.loadTextureImage(e, o.source, l);
      if (r.extensionsRequired && r.extensionsRequired.indexOf(s) >= 0)
        throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");
      return a.loadTexture(e);
    });
  }
  detectSupport() {
    return this.isSupported || (this.isSupported = new Promise(function(e) {
      const s = new Image();
      s.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA", s.onload = s.onerror = function() {
        e(s.height === 1);
      };
    })), this.isSupported;
  }
}
class mg {
  constructor(e) {
    this.parser = e, this.name = $e.EXT_TEXTURE_AVIF, this.isSupported = null;
  }
  loadTexture(e) {
    const s = this.name, a = this.parser, r = a.json, n = r.textures[e];
    if (!n.extensions || !n.extensions[s])
      return null;
    const o = n.extensions[s], u = r.images[o.source];
    let l = a.textureLoader;
    if (u.uri) {
      const f = a.options.manager.getHandler(u.uri);
      f !== null && (l = f);
    }
    return this.detectSupport().then(function(f) {
      if (f)
        return a.loadTextureImage(e, o.source, l);
      if (r.extensionsRequired && r.extensionsRequired.indexOf(s) >= 0)
        throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");
      return a.loadTexture(e);
    });
  }
  detectSupport() {
    return this.isSupported || (this.isSupported = new Promise(function(e) {
      const s = new Image();
      s.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=", s.onload = s.onerror = function() {
        e(s.height === 1);
      };
    })), this.isSupported;
  }
}
class vg {
  constructor(e) {
    this.name = $e.EXT_MESHOPT_COMPRESSION, this.parser = e;
  }
  loadBufferView(e) {
    const s = this.parser.json, a = s.bufferViews[e];
    if (a.extensions && a.extensions[this.name]) {
      const r = a.extensions[this.name], n = this.parser.getDependency("buffer", r.buffer), o = this.parser.options.meshoptDecoder;
      if (!o || !o.supported) {
        if (s.extensionsRequired && s.extensionsRequired.indexOf(this.name) >= 0)
          throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        return null;
      }
      return n.then(function(u) {
        const l = r.byteOffset || 0, f = r.byteLength || 0, d = r.count, p = r.byteStride, v = new Uint8Array(u, l, f);
        return o.decodeGltfBufferAsync ? o.decodeGltfBufferAsync(d, p, v, r.mode, r.filter).then(function(g) {
          return g.buffer;
        }) : o.ready.then(function() {
          const g = new ArrayBuffer(d * p);
          return o.decodeGltfBuffer(
            new Uint8Array(g),
            d,
            p,
            v,
            r.mode,
            r.filter
          ), g;
        });
      });
    } else
      return null;
  }
}
class gg {
  constructor(e) {
    this.name = $e.EXT_MESH_GPU_INSTANCING, this.parser = e;
  }
  createNodeMesh(e) {
    const s = this.parser.json, a = s.nodes[e];
    if (!a.extensions || !a.extensions[this.name] || a.mesh === void 0)
      return null;
    const r = s.meshes[a.mesh];
    for (const f of r.primitives)
      if (f.mode !== Bn.TRIANGLES && f.mode !== Bn.TRIANGLE_STRIP && f.mode !== Bn.TRIANGLE_FAN && f.mode !== void 0)
        return null;
    const o = a.extensions[this.name].attributes, u = [], l = {};
    for (const f in o)
      u.push(
        this.parser.getDependency("accessor", o[f]).then((d) => (l[f] = d, l[f]))
      );
    return u.length < 1 ? null : (u.push(this.parser.createNodeMesh(e)), Promise.all(u).then((f) => {
      const d = f.pop(), p = d.isGroup ? d.children : [d], v = f[0].count, g = [];
      for (const x of p) {
        const E = new Ft(), _ = new oe(), S = new Ga(), A = new oe(1, 1, 1), T = new om(x.geometry, x.material, v);
        for (let C = 0; C < v; C++)
          l.TRANSLATION && _.fromBufferAttribute(l.TRANSLATION, C), l.ROTATION && S.fromBufferAttribute(l.ROTATION, C), l.SCALE && A.fromBufferAttribute(l.SCALE, C), T.setMatrixAt(C, E.compose(_, S, A));
        for (const C in l)
          if (C === "_COLOR_0") {
            const P = l[C];
            T.instanceColor = new lh(P.array, P.itemSize, P.normalized);
          } else
            C !== "TRANSLATION" && C !== "ROTATION" && C !== "SCALE" && x.geometry.setAttribute(C, l[C]);
        Yu.prototype.copy.call(T, x), this.parser.assignFinalMaterial(T), g.push(T);
      }
      return d.isGroup ? (d.clear(), d.add(...g), d) : g[0];
    }));
  }
}
const Bh = "glTF", $o = 12, dd = { JSON: 1313821514, BIN: 5130562 };
class yg {
  constructor(e) {
    this.name = $e.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const s = new DataView(e, 0, $o);
    if (this.header = {
      magic: Va(new Uint8Array(e.slice(0, 4))),
      version: s.getUint32(4, !0),
      length: s.getUint32(8, !0)
    }, this.header.magic !== Bh)
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2)
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const a = this.header.length - $o, r = new DataView(e, $o);
    let n = 0;
    for (; n < a; ) {
      const o = r.getUint32(n, !0);
      n += 4;
      const u = r.getUint32(n, !0);
      if (n += 4, u === dd.JSON) {
        const l = new Uint8Array(e, $o + n, o);
        this.content = Va(l);
      } else if (u === dd.BIN) {
        const l = $o + n;
        this.body = e.slice(l, l + o);
      }
      n += o;
    }
    if (this.content === null)
      throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}
class xg {
  constructor(e, s) {
    if (!s)
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = $e.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = s, this.dracoLoader.preload();
  }
  decodePrimitive(e, s) {
    const a = this.json, r = this.dracoLoader, n = e.extensions[this.name].bufferView, o = e.extensions[this.name].attributes, u = {}, l = {}, f = {};
    for (const d in o) {
      const p = Ru[d] || d.toLowerCase();
      u[p] = o[d];
    }
    for (const d in e.attributes) {
      const p = Ru[d] || d.toLowerCase();
      if (o[d] !== void 0) {
        const v = a.accessors[e.attributes[d]], g = mo[v.componentType];
        f[p] = g.name, l[p] = v.normalized === !0;
      }
    }
    return s.getDependency("bufferView", n).then(function(d) {
      return new Promise(function(p, v) {
        r.decodeDracoFile(
          d,
          function(g) {
            for (const x in g.attributes) {
              const E = g.attributes[x], _ = l[x];
              _ !== void 0 && (E.normalized = _);
            }
            p(g);
          },
          u,
          f,
          Ur,
          v
        );
      });
    });
  }
}
class Sg {
  constructor() {
    this.name = $e.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(e, s) {
    return (s.texCoord === void 0 || s.texCoord === e.channel) && s.offset === void 0 && s.rotation === void 0 && s.scale === void 0 || (e = e.clone(), s.texCoord !== void 0 && (e.channel = s.texCoord), s.offset !== void 0 && e.offset.fromArray(s.offset), s.rotation !== void 0 && (e.rotation = s.rotation), s.scale !== void 0 && e.repeat.fromArray(s.scale), e.needsUpdate = !0), e;
  }
}
class wg {
  constructor() {
    this.name = $e.KHR_MESH_QUANTIZATION;
  }
}
class zh extends Pm {
  constructor(e, s, a, r) {
    super(e, s, a, r);
  }
  copySampleValue_(e) {
    const s = this.resultBuffer, a = this.sampleValues, r = this.valueSize, n = e * r * 3 + r;
    for (let o = 0; o !== r; o++)
      s[o] = a[n + o];
    return s;
  }
  interpolate_(e, s, a, r) {
    const n = this.resultBuffer, o = this.sampleValues, u = this.valueSize, l = u * 2, f = u * 3, d = r - s, p = (a - s) / d, v = p * p, g = v * p, x = e * f, E = x - f, _ = -2 * g + 3 * v, S = g - v, A = 1 - _, T = S - v + p;
    for (let C = 0; C !== u; C++) {
      const P = o[E + C + u], M = o[E + C + l] * d, b = o[x + C + u], L = o[x + C] * d;
      n[C] = A * P + T * M + _ * b + S * L;
    }
    return n;
  }
}
const _g = /* @__PURE__ */ new Ga();
class Tg extends zh {
  interpolate_(e, s, a, r) {
    const n = super.interpolate_(e, s, a, r);
    return _g.fromArray(n).normalize().toArray(n), n;
  }
}
const Bn = {
  FLOAT: 5126,
  //FLOAT_MAT2: 35674,
  FLOAT_MAT3: 35675,
  FLOAT_MAT4: 35676,
  FLOAT_VEC2: 35664,
  FLOAT_VEC3: 35665,
  FLOAT_VEC4: 35666,
  LINEAR: 9729,
  REPEAT: 10497,
  SAMPLER_2D: 35678,
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6,
  UNSIGNED_BYTE: 5121,
  UNSIGNED_SHORT: 5123
}, mo = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}, hd = {
  9728: Sm,
  9729: vo,
  9984: wm,
  9985: _m,
  9986: Tm,
  9987: uh
}, pd = {
  33071: Em,
  33648: Am,
  10497: Eu
}, nu = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}, Ru = {
  POSITION: "position",
  NORMAL: "normal",
  TANGENT: "tangent",
  // uv => uv1, 4 uv channels
  // https://github.com/mrdoob/three.js/pull/25943
  // https://github.com/mrdoob/three.js/pull/25788
  ...ic >= 152 ? {
    TEXCOORD_0: "uv",
    TEXCOORD_1: "uv1",
    TEXCOORD_2: "uv2",
    TEXCOORD_3: "uv3"
  } : {
    TEXCOORD_0: "uv",
    TEXCOORD_1: "uv2"
  },
  COLOR_0: "color",
  WEIGHTS_0: "skinWeight",
  JOINTS_0: "skinIndex"
}, Xr = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
}, Eg = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: dh,
  STEP: Cm
}, ru = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function Ag(c) {
  return c.DefaultMaterial === void 0 && (c.DefaultMaterial = new Qu({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: go
  })), c.DefaultMaterial;
}
function gi(c, e, s) {
  for (const a in s.extensions)
    c[a] === void 0 && (e.userData.gltfExtensions = e.userData.gltfExtensions || {}, e.userData.gltfExtensions[a] = s.extensions[a]);
}
function Rr(c, e) {
  e.extras !== void 0 && (typeof e.extras == "object" ? Object.assign(c.userData, e.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + e.extras));
}
function Cg(c, e, s) {
  let a = !1, r = !1, n = !1;
  for (let f = 0, d = e.length; f < d; f++) {
    const p = e[f];
    if (p.POSITION !== void 0 && (a = !0), p.NORMAL !== void 0 && (r = !0), p.COLOR_0 !== void 0 && (n = !0), a && r && n)
      break;
  }
  if (!a && !r && !n)
    return Promise.resolve(c);
  const o = [], u = [], l = [];
  for (let f = 0, d = e.length; f < d; f++) {
    const p = e[f];
    if (a) {
      const v = p.POSITION !== void 0 ? s.getDependency("accessor", p.POSITION) : c.attributes.position;
      o.push(v);
    }
    if (r) {
      const v = p.NORMAL !== void 0 ? s.getDependency("accessor", p.NORMAL) : c.attributes.normal;
      u.push(v);
    }
    if (n) {
      const v = p.COLOR_0 !== void 0 ? s.getDependency("accessor", p.COLOR_0) : c.attributes.color;
      l.push(v);
    }
  }
  return Promise.all([
    Promise.all(o),
    Promise.all(u),
    Promise.all(l)
  ]).then(function(f) {
    const d = f[0], p = f[1], v = f[2];
    return a && (c.morphAttributes.position = d), r && (c.morphAttributes.normal = p), n && (c.morphAttributes.color = v), c.morphTargetsRelative = !0, c;
  });
}
function Pg(c, e) {
  if (c.updateMorphTargets(), e.weights !== void 0)
    for (let s = 0, a = e.weights.length; s < a; s++)
      c.morphTargetInfluences[s] = e.weights[s];
  if (e.extras && Array.isArray(e.extras.targetNames)) {
    const s = e.extras.targetNames;
    if (c.morphTargetInfluences.length === s.length) {
      c.morphTargetDictionary = {};
      for (let a = 0, r = s.length; a < r; a++)
        c.morphTargetDictionary[s[a]] = a;
    } else
      console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
  }
}
function Mg(c) {
  let e;
  const s = c.extensions && c.extensions[$e.KHR_DRACO_MESH_COMPRESSION];
  if (s ? e = "draco:" + s.bufferView + ":" + s.indices + ":" + iu(s.attributes) : e = c.indices + ":" + iu(c.attributes) + ":" + c.mode, c.targets !== void 0)
    for (let a = 0, r = c.targets.length; a < r; a++)
      e += ":" + iu(c.targets[a]);
  return e;
}
function iu(c) {
  let e = "";
  const s = Object.keys(c).sort();
  for (let a = 0, r = s.length; a < r; a++)
    e += s[a] + ":" + c[s[a]] + ";";
  return e;
}
function ku(c) {
  switch (c) {
    case Int8Array:
      return 1 / 127;
    case Uint8Array:
      return 1 / 255;
    case Int16Array:
      return 1 / 32767;
    case Uint16Array:
      return 1 / 65535;
    default:
      throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
  }
}
function bg(c) {
  return c.search(/\.jpe?g($|\?)/i) > 0 || c.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : c.search(/\.webp($|\?)/i) > 0 || c.search(/^data\:image\/webp/) === 0 ? "image/webp" : "image/png";
}
const Lg = /* @__PURE__ */ new Ft();
class Rg {
  constructor(e = {}, s = {}) {
    this.json = e, this.extensions = {}, this.plugins = {}, this.options = s, this.cache = new $v(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = { refs: {}, uses: {} }, this.cameraCache = { refs: {}, uses: {} }, this.lightCache = { refs: {}, uses: {} }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let a = !1, r = !1, n = -1;
    typeof navigator < "u" && typeof navigator.userAgent < "u" && (a = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) === !0, r = navigator.userAgent.indexOf("Firefox") > -1, n = r ? navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1] : -1), typeof createImageBitmap > "u" || a || r && n < 98 ? this.textureLoader = new sm(this.options.manager) : this.textureLoader = new am(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new ah(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
  }
  setExtensions(e) {
    this.extensions = e;
  }
  setPlugins(e) {
    this.plugins = e;
  }
  parse(e, s) {
    const a = this, r = this.json, n = this.extensions;
    this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function(o) {
      return o._markDefs && o._markDefs();
    }), Promise.all(
      this._invokeAll(function(o) {
        return o.beforeRoot && o.beforeRoot();
      })
    ).then(function() {
      return Promise.all([
        a.getDependencies("scene"),
        a.getDependencies("animation"),
        a.getDependencies("camera")
      ]);
    }).then(function(o) {
      const u = {
        scene: o[0][r.scene || 0],
        scenes: o[0],
        animations: o[1],
        cameras: o[2],
        asset: r.asset,
        parser: a,
        userData: {}
      };
      return gi(n, u, r), Rr(u, r), Promise.all(
        a._invokeAll(function(l) {
          return l.afterRoot && l.afterRoot(u);
        })
      ).then(function() {
        for (const l of u.scenes)
          l.updateMatrixWorld();
        e(u);
      });
    }).catch(s);
  }
  /**
   * Marks the special nodes/meshes in json for efficient parse.
   */
  _markDefs() {
    const e = this.json.nodes || [], s = this.json.skins || [], a = this.json.meshes || [];
    for (let r = 0, n = s.length; r < n; r++) {
      const o = s[r].joints;
      for (let u = 0, l = o.length; u < l; u++)
        e[o[u]].isBone = !0;
    }
    for (let r = 0, n = e.length; r < n; r++) {
      const o = e[r];
      o.mesh !== void 0 && (this._addNodeRef(this.meshCache, o.mesh), o.skin !== void 0 && (a[o.mesh].isSkinnedMesh = !0)), o.camera !== void 0 && this._addNodeRef(this.cameraCache, o.camera);
    }
  }
  /**
   * Counts references to shared node / Object3D resources. These resources
   * can be reused, or "instantiated", at multiple nodes in the scene
   * hierarchy. Mesh, Camera, and Light instances are instantiated and must
   * be marked. Non-scenegraph resources (like Materials, Geometries, and
   * Textures) can be reused directly and are not marked here.
   *
   * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
   */
  _addNodeRef(e, s) {
    s !== void 0 && (e.refs[s] === void 0 && (e.refs[s] = e.uses[s] = 0), e.refs[s]++);
  }
  /** Returns a reference to a shared resource, cloning it if necessary. */
  _getNodeRef(e, s, a) {
    if (e.refs[s] <= 1)
      return a;
    const r = a.clone(), n = (o, u) => {
      const l = this.associations.get(o);
      l != null && this.associations.set(u, l);
      for (const [f, d] of o.children.entries())
        n(d, u.children[f]);
    };
    return n(a, r), r.name += "_instance_" + e.uses[s]++, r;
  }
  _invokeOne(e) {
    const s = Object.values(this.plugins);
    s.push(this);
    for (let a = 0; a < s.length; a++) {
      const r = e(s[a]);
      if (r)
        return r;
    }
    return null;
  }
  _invokeAll(e) {
    const s = Object.values(this.plugins);
    s.unshift(this);
    const a = [];
    for (let r = 0; r < s.length; r++) {
      const n = e(s[r]);
      n && a.push(n);
    }
    return a;
  }
  /**
   * Requests the specified dependency asynchronously, with caching.
   * @param {string} type
   * @param {number} index
   * @return {Promise<Object3D|Material|THREE.Texture|AnimationClip|ArrayBuffer|Object>}
   */
  getDependency(e, s) {
    const a = e + ":" + s;
    let r = this.cache.get(a);
    if (!r) {
      switch (e) {
        case "scene":
          r = this.loadScene(s);
          break;
        case "node":
          r = this._invokeOne(function(n) {
            return n.loadNode && n.loadNode(s);
          });
          break;
        case "mesh":
          r = this._invokeOne(function(n) {
            return n.loadMesh && n.loadMesh(s);
          });
          break;
        case "accessor":
          r = this.loadAccessor(s);
          break;
        case "bufferView":
          r = this._invokeOne(function(n) {
            return n.loadBufferView && n.loadBufferView(s);
          });
          break;
        case "buffer":
          r = this.loadBuffer(s);
          break;
        case "material":
          r = this._invokeOne(function(n) {
            return n.loadMaterial && n.loadMaterial(s);
          });
          break;
        case "texture":
          r = this._invokeOne(function(n) {
            return n.loadTexture && n.loadTexture(s);
          });
          break;
        case "skin":
          r = this.loadSkin(s);
          break;
        case "animation":
          r = this._invokeOne(function(n) {
            return n.loadAnimation && n.loadAnimation(s);
          });
          break;
        case "camera":
          r = this.loadCamera(s);
          break;
        default:
          if (r = this._invokeOne(function(n) {
            return n != this && n.getDependency && n.getDependency(e, s);
          }), !r)
            throw new Error("Unknown type: " + e);
          break;
      }
      this.cache.add(a, r);
    }
    return r;
  }
  /**
   * Requests all dependencies of the specified type asynchronously, with caching.
   * @param {string} type
   * @return {Promise<Array<Object>>}
   */
  getDependencies(e) {
    let s = this.cache.get(e);
    if (!s) {
      const a = this, r = this.json[e + (e === "mesh" ? "es" : "s")] || [];
      s = Promise.all(
        r.map(function(n, o) {
          return a.getDependency(e, o);
        })
      ), this.cache.add(e, s);
    }
    return s;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   * @param {number} bufferIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBuffer(e) {
    const s = this.json.buffers[e], a = this.fileLoader;
    if (s.type && s.type !== "arraybuffer")
      throw new Error("THREE.GLTFLoader: " + s.type + " buffer type is not supported.");
    if (s.uri === void 0 && e === 0)
      return Promise.resolve(this.extensions[$e.KHR_BINARY_GLTF].body);
    const r = this.options;
    return new Promise(function(n, o) {
      a.load(fs.resolveURL(s.uri, r.path), n, void 0, function() {
        o(new Error('THREE.GLTFLoader: Failed to load buffer "' + s.uri + '".'));
      });
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   * @param {number} bufferViewIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBufferView(e) {
    const s = this.json.bufferViews[e];
    return this.getDependency("buffer", s.buffer).then(function(a) {
      const r = s.byteLength || 0, n = s.byteOffset || 0;
      return a.slice(n, n + r);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
   * @param {number} accessorIndex
   * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
   */
  loadAccessor(e) {
    const s = this, a = this.json, r = this.json.accessors[e];
    if (r.bufferView === void 0 && r.sparse === void 0) {
      const o = nu[r.type], u = mo[r.componentType], l = r.normalized === !0, f = new u(r.count * o);
      return Promise.resolve(new ds(f, o, l));
    }
    const n = [];
    return r.bufferView !== void 0 ? n.push(this.getDependency("bufferView", r.bufferView)) : n.push(null), r.sparse !== void 0 && (n.push(this.getDependency("bufferView", r.sparse.indices.bufferView)), n.push(this.getDependency("bufferView", r.sparse.values.bufferView))), Promise.all(n).then(function(o) {
      const u = o[0], l = nu[r.type], f = mo[r.componentType], d = f.BYTES_PER_ELEMENT, p = d * l, v = r.byteOffset || 0, g = r.bufferView !== void 0 ? a.bufferViews[r.bufferView].byteStride : void 0, x = r.normalized === !0;
      let E, _;
      if (g && g !== p) {
        const S = Math.floor(v / g), A = "InterleavedBuffer:" + r.bufferView + ":" + r.componentType + ":" + S + ":" + r.count;
        let T = s.cache.get(A);
        T || (E = new f(u, S * g, r.count * g / d), T = new lm(E, g / d), s.cache.add(A, T)), _ = new xi(
          T,
          l,
          v % g / d,
          x
        );
      } else
        u === null ? E = new f(r.count * l) : E = new f(u, v, r.count * l), _ = new ds(E, l, x);
      if (r.sparse !== void 0) {
        const S = nu.SCALAR, A = mo[r.sparse.indices.componentType], T = r.sparse.indices.byteOffset || 0, C = r.sparse.values.byteOffset || 0, P = new A(
          o[1],
          T,
          r.sparse.count * S
        ), M = new f(o[2], C, r.sparse.count * l);
        u !== null && (_ = new ds(
          _.array.slice(),
          _.itemSize,
          _.normalized
        ));
        for (let b = 0, L = P.length; b < L; b++) {
          const U = P[b];
          if (_.setX(U, M[b * l]), l >= 2 && _.setY(U, M[b * l + 1]), l >= 3 && _.setZ(U, M[b * l + 2]), l >= 4 && _.setW(U, M[b * l + 3]), l >= 5)
            throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
      }
      return _;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
   * @param {number} textureIndex
   * @return {Promise<THREE.Texture|null>}
   */
  loadTexture(e) {
    const s = this.json, a = this.options, n = s.textures[e].source, o = s.images[n];
    let u = this.textureLoader;
    if (o.uri) {
      const l = a.manager.getHandler(o.uri);
      l !== null && (u = l);
    }
    return this.loadTextureImage(e, n, u);
  }
  loadTextureImage(e, s, a) {
    const r = this, n = this.json, o = n.textures[e], u = n.images[s], l = (u.uri || u.bufferView) + ":" + o.sampler;
    if (this.textureCache[l])
      return this.textureCache[l];
    const f = this.loadImageSource(s, a).then(function(d) {
      d.flipY = !1, d.name = o.name || u.name || "", d.name === "" && typeof u.uri == "string" && u.uri.startsWith("data:image/") === !1 && (d.name = u.uri);
      const v = (n.samplers || {})[o.sampler] || {};
      return d.magFilter = hd[v.magFilter] || vo, d.minFilter = hd[v.minFilter] || uh, d.wrapS = pd[v.wrapS] || Eu, d.wrapT = pd[v.wrapT] || Eu, r.associations.set(d, { textures: e }), d;
    }).catch(function() {
      return null;
    });
    return this.textureCache[l] = f, f;
  }
  loadImageSource(e, s) {
    const a = this, r = this.json, n = this.options;
    if (this.sourceCache[e] !== void 0)
      return this.sourceCache[e].then((p) => p.clone());
    const o = r.images[e], u = self.URL || self.webkitURL;
    let l = o.uri || "", f = !1;
    if (o.bufferView !== void 0)
      l = a.getDependency("bufferView", o.bufferView).then(function(p) {
        f = !0;
        const v = new Blob([p], { type: o.mimeType });
        return l = u.createObjectURL(v), l;
      });
    else if (o.uri === void 0)
      throw new Error("THREE.GLTFLoader: Image " + e + " is missing URI and bufferView");
    const d = Promise.resolve(l).then(function(p) {
      return new Promise(function(v, g) {
        let x = v;
        s.isImageBitmapLoader === !0 && (x = function(E) {
          const _ = new Au(E);
          _.needsUpdate = !0, v(_);
        }), s.load(fs.resolveURL(p, n.path), x, void 0, g);
      });
    }).then(function(p) {
      return f === !0 && u.revokeObjectURL(l), Rr(p, o), p.userData.mimeType = o.mimeType || bg(o.uri), p;
    }).catch(function(p) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", l), p;
    });
    return this.sourceCache[e] = d, d;
  }
  /**
   * Asynchronously assigns a texture to the given material parameters.
   * @param {Object} materialParams
   * @param {string} mapName
   * @param {Object} mapDef
   * @return {Promise<Texture>}
   */
  assignTexture(e, s, a, r) {
    const n = this;
    return this.getDependency("texture", a.index).then(function(o) {
      if (!o)
        return null;
      if (a.texCoord !== void 0 && a.texCoord > 0 && (o = o.clone(), o.channel = a.texCoord), n.extensions[$e.KHR_TEXTURE_TRANSFORM]) {
        const u = a.extensions !== void 0 ? a.extensions[$e.KHR_TEXTURE_TRANSFORM] : void 0;
        if (u) {
          const l = n.associations.get(o);
          o = n.extensions[$e.KHR_TEXTURE_TRANSFORM].extendTexture(o, u), n.associations.set(o, l);
        }
      }
      return r !== void 0 && (typeof r == "number" && (r = r === fd ? Si : Ur), "colorSpace" in o ? o.colorSpace = r : o.encoding = r === Si ? fd : Jv), e[s] = o, o;
    });
  }
  /**
   * Assigns final material to a Mesh, Line, or Points instance. The instance
   * already has a material (generated from the glTF material options alone)
   * but reuse of the same glTF material may require multiple threejs materials
   * to accommodate different primitive types, defines, etc. New materials will
   * be created if necessary, and reused from a cache.
   * @param  {Object3D} mesh Mesh, Line, or Points instance.
   */
  assignFinalMaterial(e) {
    const s = e.geometry;
    let a = e.material;
    const r = s.attributes.tangent === void 0, n = s.attributes.color !== void 0, o = s.attributes.normal === void 0;
    if (e.isPoints) {
      const u = "PointsMaterial:" + a.uuid;
      let l = this.cache.get(u);
      l || (l = new um(), Kl.prototype.copy.call(l, a), l.color.copy(a.color), l.map = a.map, l.sizeAttenuation = !1, this.cache.add(u, l)), a = l;
    } else if (e.isLine) {
      const u = "LineBasicMaterial:" + a.uuid;
      let l = this.cache.get(u);
      l || (l = new cm(), Kl.prototype.copy.call(l, a), l.color.copy(a.color), l.map = a.map, this.cache.add(u, l)), a = l;
    }
    if (r || n || o) {
      let u = "ClonedMaterial:" + a.uuid + ":";
      r && (u += "derivative-tangents:"), n && (u += "vertex-colors:"), o && (u += "flat-shading:");
      let l = this.cache.get(u);
      l || (l = a.clone(), n && (l.vertexColors = !0), o && (l.flatShading = !0), r && (l.normalScale && (l.normalScale.y *= -1), l.clearcoatNormalScale && (l.clearcoatNormalScale.y *= -1)), this.cache.add(u, l), this.associations.set(l, this.associations.get(a))), a = l;
    }
    e.material = a;
  }
  getMaterialType() {
    return Qu;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
   * @param {number} materialIndex
   * @return {Promise<Material>}
   */
  loadMaterial(e) {
    const s = this, a = this.json, r = this.extensions, n = a.materials[e];
    let o;
    const u = {}, l = n.extensions || {}, f = [];
    if (l[$e.KHR_MATERIALS_UNLIT]) {
      const p = r[$e.KHR_MATERIALS_UNLIT];
      o = p.getMaterialType(), f.push(p.extendParams(u, n, s));
    } else {
      const p = n.pbrMetallicRoughness || {};
      if (u.color = new Wn(1, 1, 1), u.opacity = 1, Array.isArray(p.baseColorFactor)) {
        const v = p.baseColorFactor;
        u.color.setRGB(v[0], v[1], v[2], Ur), u.opacity = v[3];
      }
      p.baseColorTexture !== void 0 && f.push(s.assignTexture(u, "map", p.baseColorTexture, Si)), u.metalness = p.metallicFactor !== void 0 ? p.metallicFactor : 1, u.roughness = p.roughnessFactor !== void 0 ? p.roughnessFactor : 1, p.metallicRoughnessTexture !== void 0 && (f.push(s.assignTexture(u, "metalnessMap", p.metallicRoughnessTexture)), f.push(s.assignTexture(u, "roughnessMap", p.metallicRoughnessTexture))), o = this._invokeOne(function(v) {
        return v.getMaterialType && v.getMaterialType(e);
      }), f.push(
        Promise.all(
          this._invokeAll(function(v) {
            return v.extendMaterialParams && v.extendMaterialParams(e, u);
          })
        )
      );
    }
    n.doubleSided === !0 && (u.side = qu);
    const d = n.alphaMode || ru.OPAQUE;
    if (d === ru.BLEND ? (u.transparent = !0, u.depthWrite = !1) : (u.transparent = !1, d === ru.MASK && (u.alphaTest = n.alphaCutoff !== void 0 ? n.alphaCutoff : 0.5)), n.normalTexture !== void 0 && o !== Qr && (f.push(s.assignTexture(u, "normalMap", n.normalTexture)), u.normalScale = new Qe(1, 1), n.normalTexture.scale !== void 0)) {
      const p = n.normalTexture.scale;
      u.normalScale.set(p, p);
    }
    if (n.occlusionTexture !== void 0 && o !== Qr && (f.push(s.assignTexture(u, "aoMap", n.occlusionTexture)), n.occlusionTexture.strength !== void 0 && (u.aoMapIntensity = n.occlusionTexture.strength)), n.emissiveFactor !== void 0 && o !== Qr) {
      const p = n.emissiveFactor;
      u.emissive = new Wn().setRGB(
        p[0],
        p[1],
        p[2],
        Ur
      );
    }
    return n.emissiveTexture !== void 0 && o !== Qr && f.push(s.assignTexture(u, "emissiveMap", n.emissiveTexture, Si)), Promise.all(f).then(function() {
      const p = new o(u);
      return n.name && (p.name = n.name), Rr(p, n), s.associations.set(p, { materials: e }), n.extensions && gi(r, p, n), p;
    });
  }
  /** When Object3D instances are targeted by animation, they need unique names. */
  createUniqueName(e) {
    const s = fm.sanitizeNodeName(e || "");
    return s in this.nodeNamesUsed ? s + "_" + ++this.nodeNamesUsed[s] : (this.nodeNamesUsed[s] = 0, s);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
   *
   * Creates BufferGeometries from primitives.
   *
   * @param {Array<GLTF.Primitive>} primitives
   * @return {Promise<Array<BufferGeometry>>}
   */
  loadGeometries(e) {
    const s = this, a = this.extensions, r = this.primitiveCache;
    function n(u) {
      return a[$e.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(u, s).then(function(l) {
        return md(l, u, s);
      });
    }
    const o = [];
    for (let u = 0, l = e.length; u < l; u++) {
      const f = e[u], d = Mg(f), p = r[d];
      if (p)
        o.push(p.promise);
      else {
        let v;
        f.extensions && f.extensions[$e.KHR_DRACO_MESH_COMPRESSION] ? v = n(f) : v = md(new ch(), f, s), r[d] = { primitive: f, promise: v }, o.push(v);
      }
    }
    return Promise.all(o);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
   * @param {number} meshIndex
   * @return {Promise<Group|Mesh|SkinnedMesh>}
   */
  loadMesh(e) {
    const s = this, a = this.json, r = this.extensions, n = a.meshes[e], o = n.primitives, u = [];
    for (let l = 0, f = o.length; l < f; l++) {
      const d = o[l].material === void 0 ? Ag(this.cache) : this.getDependency("material", o[l].material);
      u.push(d);
    }
    return u.push(s.loadGeometries(o)), Promise.all(u).then(function(l) {
      const f = l.slice(0, l.length - 1), d = l[l.length - 1], p = [];
      for (let g = 0, x = d.length; g < x; g++) {
        const E = d[g], _ = o[g];
        let S;
        const A = f[g];
        if (_.mode === Bn.TRIANGLES || _.mode === Bn.TRIANGLE_STRIP || _.mode === Bn.TRIANGLE_FAN || _.mode === void 0)
          S = n.isSkinnedMesh === !0 ? new dm(E, A) : new Xn(E, A), S.isSkinnedMesh === !0 && S.normalizeSkinWeights(), _.mode === Bn.TRIANGLE_STRIP ? S.geometry = ld(S.geometry, oh) : _.mode === Bn.TRIANGLE_FAN && (S.geometry = ld(S.geometry, Tu));
        else if (_.mode === Bn.LINES)
          S = new hm(E, A);
        else if (_.mode === Bn.LINE_STRIP)
          S = new pm(E, A);
        else if (_.mode === Bn.LINE_LOOP)
          S = new mm(E, A);
        else if (_.mode === Bn.POINTS)
          S = new vm(E, A);
        else
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + _.mode);
        Object.keys(S.geometry.morphAttributes).length > 0 && Pg(S, n), S.name = s.createUniqueName(n.name || "mesh_" + e), Rr(S, n), _.extensions && gi(r, S, _), s.assignFinalMaterial(S), p.push(S);
      }
      for (let g = 0, x = p.length; g < x; g++)
        s.associations.set(p[g], {
          meshes: e,
          primitives: g
        });
      if (p.length === 1)
        return n.extensions && gi(r, p[0], n), p[0];
      const v = new wi();
      n.extensions && gi(r, v, n), s.associations.set(v, { meshes: e });
      for (let g = 0, x = p.length; g < x; g++)
        v.add(p[g]);
      return v;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
   * @param {number} cameraIndex
   * @return {Promise<THREE.Camera>}
   */
  loadCamera(e) {
    let s;
    const a = this.json.cameras[e], r = a[a.type];
    if (!r) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return;
    }
    return a.type === "perspective" ? s = new cs(
      fh.radToDeg(r.yfov),
      r.aspectRatio || 1,
      r.znear || 1,
      r.zfar || 2e6
    ) : a.type === "orthographic" && (s = new us(-r.xmag, r.xmag, r.ymag, -r.ymag, r.znear, r.zfar)), a.name && (s.name = this.createUniqueName(a.name)), Rr(s, a), Promise.resolve(s);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
   * @param {number} skinIndex
   * @return {Promise<Skeleton>}
   */
  loadSkin(e) {
    const s = this.json.skins[e], a = [];
    for (let r = 0, n = s.joints.length; r < n; r++)
      a.push(this._loadNodeShallow(s.joints[r]));
    return s.inverseBindMatrices !== void 0 ? a.push(this.getDependency("accessor", s.inverseBindMatrices)) : a.push(null), Promise.all(a).then(function(r) {
      const n = r.pop(), o = r, u = [], l = [];
      for (let f = 0, d = o.length; f < d; f++) {
        const p = o[f];
        if (p) {
          u.push(p);
          const v = new Ft();
          n !== null && v.fromArray(n.array, f * 16), l.push(v);
        } else
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', s.joints[f]);
      }
      return new gm(u, l);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
   * @param {number} animationIndex
   * @return {Promise<AnimationClip>}
   */
  loadAnimation(e) {
    const s = this.json, a = this, r = s.animations[e], n = r.name ? r.name : "animation_" + e, o = [], u = [], l = [], f = [], d = [];
    for (let p = 0, v = r.channels.length; p < v; p++) {
      const g = r.channels[p], x = r.samplers[g.sampler], E = g.target, _ = E.node, S = r.parameters !== void 0 ? r.parameters[x.input] : x.input, A = r.parameters !== void 0 ? r.parameters[x.output] : x.output;
      E.node !== void 0 && (o.push(this.getDependency("node", _)), u.push(this.getDependency("accessor", S)), l.push(this.getDependency("accessor", A)), f.push(x), d.push(E));
    }
    return Promise.all([
      Promise.all(o),
      Promise.all(u),
      Promise.all(l),
      Promise.all(f),
      Promise.all(d)
    ]).then(function(p) {
      const v = p[0], g = p[1], x = p[2], E = p[3], _ = p[4], S = [];
      for (let A = 0, T = v.length; A < T; A++) {
        const C = v[A], P = g[A], M = x[A], b = E[A], L = _[A];
        if (C === void 0)
          continue;
        C.updateMatrix && C.updateMatrix();
        const U = a._createAnimationTracks(C, P, M, b, L);
        if (U)
          for (let R = 0; R < U.length; R++)
            S.push(U[R]);
      }
      return new ym(n, void 0, S);
    });
  }
  createNodeMesh(e) {
    const s = this.json, a = this, r = s.nodes[e];
    return r.mesh === void 0 ? null : a.getDependency("mesh", r.mesh).then(function(n) {
      const o = a._getNodeRef(a.meshCache, r.mesh, n);
      return r.weights !== void 0 && o.traverse(function(u) {
        if (u.isMesh)
          for (let l = 0, f = r.weights.length; l < f; l++)
            u.morphTargetInfluences[l] = r.weights[l];
      }), o;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
   * @param {number} nodeIndex
   * @return {Promise<Object3D>}
   */
  loadNode(e) {
    const s = this.json, a = this, r = s.nodes[e], n = a._loadNodeShallow(e), o = [], u = r.children || [];
    for (let f = 0, d = u.length; f < d; f++)
      o.push(a.getDependency("node", u[f]));
    const l = r.skin === void 0 ? Promise.resolve(null) : a.getDependency("skin", r.skin);
    return Promise.all([n, Promise.all(o), l]).then(function(f) {
      const d = f[0], p = f[1], v = f[2];
      v !== null && d.traverse(function(g) {
        g.isSkinnedMesh && g.bind(v, Lg);
      });
      for (let g = 0, x = p.length; g < x; g++)
        d.add(p[g]);
      return d;
    });
  }
  // ._loadNodeShallow() parses a single node.
  // skin and child nodes are created and added in .loadNode() (no '_' prefix).
  _loadNodeShallow(e) {
    const s = this.json, a = this.extensions, r = this;
    if (this.nodeCache[e] !== void 0)
      return this.nodeCache[e];
    const n = s.nodes[e], o = n.name ? r.createUniqueName(n.name) : "", u = [], l = r._invokeOne(function(f) {
      return f.createNodeMesh && f.createNodeMesh(e);
    });
    return l && u.push(l), n.camera !== void 0 && u.push(
      r.getDependency("camera", n.camera).then(function(f) {
        return r._getNodeRef(r.cameraCache, n.camera, f);
      })
    ), r._invokeAll(function(f) {
      return f.createNodeAttachment && f.createNodeAttachment(e);
    }).forEach(function(f) {
      u.push(f);
    }), this.nodeCache[e] = Promise.all(u).then(function(f) {
      let d;
      if (n.isBone === !0 ? d = new xm() : f.length > 1 ? d = new wi() : f.length === 1 ? d = f[0] : d = new Yu(), d !== f[0])
        for (let p = 0, v = f.length; p < v; p++)
          d.add(f[p]);
      if (n.name && (d.userData.name = n.name, d.name = o), Rr(d, n), n.extensions && gi(a, d, n), n.matrix !== void 0) {
        const p = new Ft();
        p.fromArray(n.matrix), d.applyMatrix4(p);
      } else
        n.translation !== void 0 && d.position.fromArray(n.translation), n.rotation !== void 0 && d.quaternion.fromArray(n.rotation), n.scale !== void 0 && d.scale.fromArray(n.scale);
      return r.associations.has(d) || r.associations.set(d, {}), r.associations.get(d).nodes = e, d;
    }), this.nodeCache[e];
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
   * @param {number} sceneIndex
   * @return {Promise<Group>}
   */
  loadScene(e) {
    const s = this.extensions, a = this.json.scenes[e], r = this, n = new wi();
    a.name && (n.name = r.createUniqueName(a.name)), Rr(n, a), a.extensions && gi(s, n, a);
    const o = a.nodes || [], u = [];
    for (let l = 0, f = o.length; l < f; l++)
      u.push(r.getDependency("node", o[l]));
    return Promise.all(u).then(function(l) {
      for (let d = 0, p = l.length; d < p; d++)
        n.add(l[d]);
      const f = (d) => {
        const p = /* @__PURE__ */ new Map();
        for (const [v, g] of r.associations)
          (v instanceof Kl || v instanceof Au) && p.set(v, g);
        return d.traverse((v) => {
          const g = r.associations.get(v);
          g != null && p.set(v, g);
        }), p;
      };
      return r.associations = f(n), n;
    });
  }
  _createAnimationTracks(e, s, a, r, n) {
    const o = [], u = e.name ? e.name : e.uuid, l = [];
    Xr[n.path] === Xr.weights ? e.traverse(function(v) {
      v.morphTargetInfluences && l.push(v.name ? v.name : v.uuid);
    }) : l.push(u);
    let f;
    switch (Xr[n.path]) {
      case Xr.weights:
        f = jf;
        break;
      case Xr.rotation:
        f = Gf;
        break;
      case Xr.position:
      case Xr.scale:
        f = zf;
        break;
      default:
        switch (a.itemSize) {
          case 1:
            f = jf;
            break;
          case 2:
          case 3:
          default:
            f = zf;
            break;
        }
        break;
    }
    const d = r.interpolation !== void 0 ? Eg[r.interpolation] : dh, p = this._getArrayFromAccessor(a);
    for (let v = 0, g = l.length; v < g; v++) {
      const x = new f(
        l[v] + "." + Xr[n.path],
        s.array,
        p,
        d
      );
      r.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(x), o.push(x);
    }
    return o;
  }
  _getArrayFromAccessor(e) {
    let s = e.array;
    if (e.normalized) {
      const a = ku(s.constructor), r = new Float32Array(s.length);
      for (let n = 0, o = s.length; n < o; n++)
        r[n] = s[n] * a;
      s = r;
    }
    return s;
  }
  _createCubicSplineTrackInterpolant(e) {
    e.createInterpolant = function(a) {
      const r = this instanceof Gf ? Tg : zh;
      return new r(this.times, this.values, this.getValueSize() / 3, a);
    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
}
function kg(c, e, s) {
  const a = e.attributes, r = new Mt();
  if (a.POSITION !== void 0) {
    const u = s.json.accessors[a.POSITION], l = u.min, f = u.max;
    if (l !== void 0 && f !== void 0) {
      if (r.set(new oe(l[0], l[1], l[2]), new oe(f[0], f[1], f[2])), u.normalized) {
        const d = ku(mo[u.componentType]);
        r.min.multiplyScalar(d), r.max.multiplyScalar(d);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else
    return;
  const n = e.targets;
  if (n !== void 0) {
    const u = new oe(), l = new oe();
    for (let f = 0, d = n.length; f < d; f++) {
      const p = n[f];
      if (p.POSITION !== void 0) {
        const v = s.json.accessors[p.POSITION], g = v.min, x = v.max;
        if (g !== void 0 && x !== void 0) {
          if (l.setX(Math.max(Math.abs(g[0]), Math.abs(x[0]))), l.setY(Math.max(Math.abs(g[1]), Math.abs(x[1]))), l.setZ(Math.max(Math.abs(g[2]), Math.abs(x[2]))), v.normalized) {
            const E = ku(mo[v.componentType]);
            l.multiplyScalar(E);
          }
          u.max(l);
        } else
          console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      }
    }
    r.expandByVector(u);
  }
  c.boundingBox = r;
  const o = new $r();
  r.getCenter(o.center), o.radius = r.min.distanceTo(r.max) / 2, c.boundingSphere = o;
}
function md(c, e, s) {
  const a = e.attributes, r = [];
  function n(o, u) {
    return s.getDependency("accessor", o).then(function(l) {
      c.setAttribute(u, l);
    });
  }
  for (const o in a) {
    const u = Ru[o] || o.toLowerCase();
    u in c.attributes || r.push(n(a[o], u));
  }
  if (e.indices !== void 0 && !c.index) {
    const o = s.getDependency("accessor", e.indices).then(function(u) {
      c.setIndex(u);
    });
    r.push(o);
  }
  return Rr(c, e), kg(c, e, s), Promise.all(r).then(function() {
    return e.targets !== void 0 ? Cg(c, e.targets, s) : c;
  });
}
var Ug = Object.defineProperty, Dg = (c, e, s) => e in c ? Ug(c, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : c[e] = s, xt = (c, e, s) => (Dg(c, typeof e != "symbol" ? e + "" : e, s), s);
const wt = {
  Handedness: {
    NONE: "none",
    LEFT: "left",
    RIGHT: "right"
  },
  ComponentState: {
    DEFAULT: "default",
    TOUCHED: "touched",
    PRESSED: "pressed"
  },
  ComponentProperty: {
    BUTTON: "button",
    X_AXIS: "xAxis",
    Y_AXIS: "yAxis",
    STATE: "state"
  },
  ComponentType: {
    TRIGGER: "trigger",
    SQUEEZE: "squeeze",
    TOUCHPAD: "touchpad",
    THUMBSTICK: "thumbstick",
    BUTTON: "button"
  },
  ButtonTouchThreshold: 0.05,
  AxisTouchThreshold: 0.1,
  VisualResponseProperty: {
    TRANSFORM: "transform",
    VISIBILITY: "visibility"
  }
};
async function jh(c) {
  const e = await fetch(c);
  if (e.ok)
    return e.json();
  throw new Error(e.statusText);
}
async function Fg(c) {
  if (!c)
    throw new Error("No basePath supplied");
  return await jh(`${c}/profilesList.json`);
}
async function Ig(c, e, s = null, a = !0) {
  if (!c)
    throw new Error("No xrInputSource supplied");
  if (!e)
    throw new Error("No basePath supplied");
  const r = await Fg(e);
  let n;
  if (c.profiles.some((l) => {
    const f = r[l];
    return f && (n = {
      profileId: l,
      profilePath: `${e}/${f.path}`,
      deprecated: !!f.deprecated
    }), !!n;
  }), !n) {
    if (!s)
      throw new Error("No matching profile name found");
    const l = r[s];
    if (!l)
      throw new Error(`No matching profile name found and default profile "${s}" missing.`);
    n = {
      profileId: s,
      profilePath: `${e}/${l.path}`,
      deprecated: !!l.deprecated
    };
  }
  const o = await jh(n.profilePath);
  let u;
  if (a) {
    let l;
    if (c.handedness === "any" ? l = o.layouts[Object.keys(o.layouts)[0]] : l = o.layouts[c.handedness], !l)
      throw new Error(`No matching handedness, ${c.handedness}, in profile ${n.profileId}`);
    l.assetPath && (u = n.profilePath.replace("profile.json", l.assetPath));
  }
  return { profile: o, assetPath: u };
}
const Og = {
  xAxis: 0,
  yAxis: 0,
  button: 0,
  state: wt.ComponentState.DEFAULT
};
function Ng(c = 0, e = 0) {
  let s = c, a = e;
  if (Math.sqrt(c * c + e * e) > 1) {
    const o = Math.atan2(e, c);
    s = Math.cos(o), a = Math.sin(o);
  }
  return {
    normalizedXAxis: s * 0.5 + 0.5,
    normalizedYAxis: a * 0.5 + 0.5
  };
}
class Bg {
  constructor(e) {
    xt(this, "value"), xt(this, "componentProperty"), xt(this, "states"), xt(this, "valueNodeName"), xt(this, "valueNodeProperty"), xt(this, "minNodeName"), xt(this, "maxNodeName"), xt(this, "valueNode"), xt(this, "minNode"), xt(this, "maxNode"), this.componentProperty = e.componentProperty, this.states = e.states, this.valueNodeName = e.valueNodeName, this.valueNodeProperty = e.valueNodeProperty, this.valueNodeProperty === wt.VisualResponseProperty.TRANSFORM && (this.minNodeName = e.minNodeName, this.maxNodeName = e.maxNodeName), this.value = 0, this.updateFromComponent(Og);
  }
  /**
   * Computes the visual response's interpolation weight based on component state
   * @param {Object} componentValues - The component from which to update
   * @param {number | undefined} xAxis - The reported X axis value of the component
   * @param {number | undefined} yAxis - The reported Y axis value of the component
   * @param {number | undefined} button - The reported value of the component's button
   * @param {string} state - The component's active state
   */
  updateFromComponent({
    xAxis: e,
    yAxis: s,
    button: a,
    state: r
  }) {
    const { normalizedXAxis: n, normalizedYAxis: o } = Ng(e, s);
    switch (this.componentProperty) {
      case wt.ComponentProperty.X_AXIS:
        this.value = this.states.includes(r) ? n : 0.5;
        break;
      case wt.ComponentProperty.Y_AXIS:
        this.value = this.states.includes(r) ? o : 0.5;
        break;
      case wt.ComponentProperty.BUTTON:
        this.value = this.states.includes(r) && a ? a : 0;
        break;
      case wt.ComponentProperty.STATE:
        this.valueNodeProperty === wt.VisualResponseProperty.VISIBILITY ? this.value = this.states.includes(r) : this.value = this.states.includes(r) ? 1 : 0;
        break;
      default:
        throw new Error(`Unexpected visualResponse componentProperty ${this.componentProperty}`);
    }
  }
}
class zg {
  /**
   * @param {string} componentId - Id of the component
   * @param {InputProfileComponent} componentDescription - Description of the component to be created
   */
  constructor(e, s) {
    if (xt(this, "id"), xt(this, "values"), xt(this, "type"), xt(this, "gamepadIndices"), xt(this, "rootNodeName"), xt(this, "visualResponses"), xt(this, "touchPointNodeName"), xt(this, "touchPointNode"), !e || !s || !s.visualResponses || !s.gamepadIndices || Object.keys(s.gamepadIndices).length === 0)
      throw new Error("Invalid arguments supplied");
    this.id = e, this.type = s.type, this.rootNodeName = s.rootNodeName, this.touchPointNodeName = s.touchPointNodeName, this.visualResponses = {}, Object.keys(s.visualResponses).forEach((a) => {
      const r = new Bg(s.visualResponses[a]);
      this.visualResponses[a] = r;
    }), this.gamepadIndices = Object.assign({}, s.gamepadIndices), this.values = {
      state: wt.ComponentState.DEFAULT,
      button: this.gamepadIndices.button !== void 0 ? 0 : void 0,
      xAxis: this.gamepadIndices.xAxis !== void 0 ? 0 : void 0,
      yAxis: this.gamepadIndices.yAxis !== void 0 ? 0 : void 0
    };
  }
  get data() {
    return { id: this.id, ...this.values };
  }
  /**
   * @description Poll for updated data based on current gamepad state
   * @param {Object} gamepad - The gamepad object from which the component data should be polled
   */
  updateFromGamepad(e) {
    if (this.values.state = wt.ComponentState.DEFAULT, this.gamepadIndices.button !== void 0 && e.buttons.length > this.gamepadIndices.button) {
      const s = e.buttons[this.gamepadIndices.button];
      this.values.button = s.value, this.values.button = this.values.button < 0 ? 0 : this.values.button, this.values.button = this.values.button > 1 ? 1 : this.values.button, s.pressed || this.values.button === 1 ? this.values.state = wt.ComponentState.PRESSED : (s.touched || this.values.button > wt.ButtonTouchThreshold) && (this.values.state = wt.ComponentState.TOUCHED);
    }
    this.gamepadIndices.xAxis !== void 0 && e.axes.length > this.gamepadIndices.xAxis && (this.values.xAxis = e.axes[this.gamepadIndices.xAxis], this.values.xAxis = this.values.xAxis < -1 ? -1 : this.values.xAxis, this.values.xAxis = this.values.xAxis > 1 ? 1 : this.values.xAxis, this.values.state === wt.ComponentState.DEFAULT && Math.abs(this.values.xAxis) > wt.AxisTouchThreshold && (this.values.state = wt.ComponentState.TOUCHED)), this.gamepadIndices.yAxis !== void 0 && e.axes.length > this.gamepadIndices.yAxis && (this.values.yAxis = e.axes[this.gamepadIndices.yAxis], this.values.yAxis = this.values.yAxis < -1 ? -1 : this.values.yAxis, this.values.yAxis = this.values.yAxis > 1 ? 1 : this.values.yAxis, this.values.state === wt.ComponentState.DEFAULT && Math.abs(this.values.yAxis) > wt.AxisTouchThreshold && (this.values.state = wt.ComponentState.TOUCHED)), Object.values(this.visualResponses).forEach((s) => {
      s.updateFromComponent(this.values);
    });
  }
}
class jg {
  /**
   * @param {XRInputSource} xrInputSource - The XRInputSource to build the MotionController around
   * @param {Profile} profile - The best matched profile description for the supplied xrInputSource
   * @param {string} assetUrl
   */
  constructor(e, s, a) {
    if (xt(this, "xrInputSource"), xt(this, "assetUrl"), xt(this, "layoutDescription"), xt(this, "id"), xt(this, "components"), !e)
      throw new Error("No xrInputSource supplied");
    if (!s)
      throw new Error("No profile supplied");
    if (!s.layouts[e.handedness])
      throw new Error("No layout for " + e.handedness + " handedness");
    this.xrInputSource = e, this.assetUrl = a, this.id = s.profileId, this.layoutDescription = s.layouts[e.handedness], this.components = {}, Object.keys(this.layoutDescription.components).forEach((r) => {
      const n = this.layoutDescription.components[r];
      this.components[r] = new zg(r, n);
    }), this.updateFromGamepad();
  }
  get gripSpace() {
    return this.xrInputSource.gripSpace;
  }
  get targetRaySpace() {
    return this.xrInputSource.targetRaySpace;
  }
  /**
   * @description Returns a subset of component data for simplified debugging
   */
  get data() {
    const e = [];
    return Object.values(this.components).forEach((s) => {
      e.push(s.data);
    }), e;
  }
  /**
   * @description Poll for updated data based on current gamepad state
   */
  updateFromGamepad() {
    Object.values(this.components).forEach((e) => {
      e.updateFromGamepad(this.xrInputSource.gamepad);
    });
  }
}
const vd = /* @__PURE__ */ new Mt(), va = /* @__PURE__ */ new oe();
class oc extends hh {
  constructor() {
    super(), this.isLineSegmentsGeometry = !0, this.type = "LineSegmentsGeometry";
    const e = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0], s = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2], a = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
    this.setIndex(a), this.setAttribute("position", new Hf(e, 3)), this.setAttribute("uv", new Hf(s, 2));
  }
  applyMatrix4(e) {
    const s = this.attributes.instanceStart, a = this.attributes.instanceEnd;
    return s !== void 0 && (s.applyMatrix4(e), a.applyMatrix4(e), s.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  setPositions(e) {
    let s;
    e instanceof Float32Array ? s = e : Array.isArray(e) && (s = new Float32Array(e));
    const a = new Cu(s, 6, 1);
    return this.setAttribute("instanceStart", new xi(a, 3, 0)), this.setAttribute("instanceEnd", new xi(a, 3, 3)), this.computeBoundingBox(), this.computeBoundingSphere(), this;
  }
  setColors(e, s = 3) {
    let a;
    e instanceof Float32Array ? a = e : Array.isArray(e) && (a = new Float32Array(e));
    const r = new Cu(a, s * 2, 1);
    return this.setAttribute("instanceColorStart", new xi(r, s, 0)), this.setAttribute("instanceColorEnd", new xi(r, s, s)), this;
  }
  fromWireframeGeometry(e) {
    return this.setPositions(e.attributes.position.array), this;
  }
  fromEdgesGeometry(e) {
    return this.setPositions(e.attributes.position.array), this;
  }
  fromMesh(e) {
    return this.fromWireframeGeometry(new Mm(e.geometry)), this;
  }
  fromLineSegments(e) {
    const s = e.geometry;
    return this.setPositions(s.attributes.position.array), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new Mt());
    const e = this.attributes.instanceStart, s = this.attributes.instanceEnd;
    e !== void 0 && s !== void 0 && (this.boundingBox.setFromBufferAttribute(e), vd.setFromBufferAttribute(s), this.boundingBox.union(vd));
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new $r()), this.boundingBox === null && this.computeBoundingBox();
    const e = this.attributes.instanceStart, s = this.attributes.instanceEnd;
    if (e !== void 0 && s !== void 0) {
      const a = this.boundingSphere.center;
      this.boundingBox.getCenter(a);
      let r = 0;
      for (let n = 0, o = e.count; n < o; n++)
        va.fromBufferAttribute(e, n), r = Math.max(r, a.distanceToSquared(va)), va.fromBufferAttribute(s, n), r = Math.max(r, a.distanceToSquared(va));
      this.boundingSphere.radius = Math.sqrt(r), isNaN(this.boundingSphere.radius) && console.error(
        "THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",
        this
      );
    }
  }
  toJSON() {
  }
  applyMatrix(e) {
    return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."), this.applyMatrix4(e);
  }
}
class Gh extends oc {
  constructor() {
    super(), this.isLineGeometry = !0, this.type = "LineGeometry";
  }
  setPositions(e) {
    const s = e.length - 3, a = new Float32Array(2 * s);
    for (let r = 0; r < s; r += 3)
      a[2 * r] = e[r], a[2 * r + 1] = e[r + 1], a[2 * r + 2] = e[r + 2], a[2 * r + 3] = e[r + 3], a[2 * r + 4] = e[r + 4], a[2 * r + 5] = e[r + 5];
    return super.setPositions(a), this;
  }
  setColors(e, s = 3) {
    const a = e.length - s, r = new Float32Array(2 * a);
    if (s === 3)
      for (let n = 0; n < a; n += s)
        r[2 * n] = e[n], r[2 * n + 1] = e[n + 1], r[2 * n + 2] = e[n + 2], r[2 * n + 3] = e[n + 3], r[2 * n + 4] = e[n + 4], r[2 * n + 5] = e[n + 5];
    else
      for (let n = 0; n < a; n += s)
        r[2 * n] = e[n], r[2 * n + 1] = e[n + 1], r[2 * n + 2] = e[n + 2], r[2 * n + 3] = e[n + 3], r[2 * n + 4] = e[n + 4], r[2 * n + 5] = e[n + 5], r[2 * n + 6] = e[n + 6], r[2 * n + 7] = e[n + 7];
    return super.setColors(r, s), this;
  }
  fromLine(e) {
    const s = e.geometry;
    return this.setPositions(s.attributes.position.array), this;
  }
}
class sc extends bm {
  constructor(e) {
    super({
      type: "LineMaterial",
      uniforms: Ha.clone(
        Ha.merge([
          Vf.common,
          Vf.fog,
          {
            worldUnits: { value: 1 },
            linewidth: { value: 1 },
            resolution: { value: new Qe(1, 1) },
            dashOffset: { value: 0 },
            dashScale: { value: 1 },
            dashSize: { value: 1 },
            gapSize: { value: 1 }
            // todo FIX - maybe change to totalSize
          }
        ])
      ),
      vertexShader: (
        /* glsl */
        `
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`
      ),
      fragmentShader: (
        /* glsl */
        `
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${ic >= 154 ? "colorspace_fragment" : "encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`
      ),
      clipping: !0
      // required for clipping support
    }), this.isLineMaterial = !0, this.onBeforeCompile = function() {
      this.transparent ? this.defines.USE_LINE_COLOR_ALPHA = "1" : delete this.defines.USE_LINE_COLOR_ALPHA;
    }, Object.defineProperties(this, {
      color: {
        enumerable: !0,
        get: function() {
          return this.uniforms.diffuse.value;
        },
        set: function(s) {
          this.uniforms.diffuse.value = s;
        }
      },
      worldUnits: {
        enumerable: !0,
        get: function() {
          return "WORLD_UNITS" in this.defines;
        },
        set: function(s) {
          s === !0 ? this.defines.WORLD_UNITS = "" : delete this.defines.WORLD_UNITS;
        }
      },
      linewidth: {
        enumerable: !0,
        get: function() {
          return this.uniforms.linewidth.value;
        },
        set: function(s) {
          this.uniforms.linewidth.value = s;
        }
      },
      dashed: {
        enumerable: !0,
        get: function() {
          return "USE_DASH" in this.defines;
        },
        set(s) {
          !!s != "USE_DASH" in this.defines && (this.needsUpdate = !0), s === !0 ? this.defines.USE_DASH = "" : delete this.defines.USE_DASH;
        }
      },
      dashScale: {
        enumerable: !0,
        get: function() {
          return this.uniforms.dashScale.value;
        },
        set: function(s) {
          this.uniforms.dashScale.value = s;
        }
      },
      dashSize: {
        enumerable: !0,
        get: function() {
          return this.uniforms.dashSize.value;
        },
        set: function(s) {
          this.uniforms.dashSize.value = s;
        }
      },
      dashOffset: {
        enumerable: !0,
        get: function() {
          return this.uniforms.dashOffset.value;
        },
        set: function(s) {
          this.uniforms.dashOffset.value = s;
        }
      },
      gapSize: {
        enumerable: !0,
        get: function() {
          return this.uniforms.gapSize.value;
        },
        set: function(s) {
          this.uniforms.gapSize.value = s;
        }
      },
      opacity: {
        enumerable: !0,
        get: function() {
          return this.uniforms.opacity.value;
        },
        set: function(s) {
          this.uniforms.opacity.value = s;
        }
      },
      resolution: {
        enumerable: !0,
        get: function() {
          return this.uniforms.resolution.value;
        },
        set: function(s) {
          this.uniforms.resolution.value.copy(s);
        }
      },
      alphaToCoverage: {
        enumerable: !0,
        get: function() {
          return "USE_ALPHA_TO_COVERAGE" in this.defines;
        },
        set: function(s) {
          !!s != "USE_ALPHA_TO_COVERAGE" in this.defines && (this.needsUpdate = !0), s === !0 ? (this.defines.USE_ALPHA_TO_COVERAGE = "", this.extensions.derivatives = !0) : (delete this.defines.USE_ALPHA_TO_COVERAGE, this.extensions.derivatives = !1);
        }
      }
    }), this.setValues(e);
  }
}
const ou = /* @__PURE__ */ new Zr(), gd = /* @__PURE__ */ new oe(), yd = /* @__PURE__ */ new oe(), Vt = /* @__PURE__ */ new Zr(), Wt = /* @__PURE__ */ new Zr(), hr = /* @__PURE__ */ new Zr(), su = /* @__PURE__ */ new oe(), au = /* @__PURE__ */ new Ft(), Yt = /* @__PURE__ */ new gr(), xd = /* @__PURE__ */ new oe(), ga = /* @__PURE__ */ new Mt(), ya = /* @__PURE__ */ new $r(), pr = /* @__PURE__ */ new Zr();
let mr, Ti;
function Sd(c, e, s) {
  return pr.set(0, 0, -e, 1).applyMatrix4(c.projectionMatrix), pr.multiplyScalar(1 / pr.w), pr.x = Ti / s.width, pr.y = Ti / s.height, pr.applyMatrix4(c.projectionMatrixInverse), pr.multiplyScalar(1 / pr.w), Math.abs(Math.max(pr.x, pr.y));
}
function Gg(c, e) {
  const s = c.matrixWorld, a = c.geometry, r = a.attributes.instanceStart, n = a.attributes.instanceEnd, o = Math.min(a.instanceCount, r.count);
  for (let u = 0, l = o; u < l; u++) {
    Yt.start.fromBufferAttribute(r, u), Yt.end.fromBufferAttribute(n, u), Yt.applyMatrix4(s);
    const f = new oe(), d = new oe();
    mr.distanceSqToSegment(Yt.start, Yt.end, d, f), d.distanceTo(f) < Ti * 0.5 && e.push({
      point: d,
      pointOnLine: f,
      distance: mr.origin.distanceTo(d),
      object: c,
      face: null,
      faceIndex: u,
      uv: null,
      [Oh]: null
    });
  }
}
function Hg(c, e, s) {
  const a = e.projectionMatrix, n = c.material.resolution, o = c.matrixWorld, u = c.geometry, l = u.attributes.instanceStart, f = u.attributes.instanceEnd, d = Math.min(u.instanceCount, l.count), p = -e.near;
  mr.at(1, hr), hr.w = 1, hr.applyMatrix4(e.matrixWorldInverse), hr.applyMatrix4(a), hr.multiplyScalar(1 / hr.w), hr.x *= n.x / 2, hr.y *= n.y / 2, hr.z = 0, su.copy(hr), au.multiplyMatrices(e.matrixWorldInverse, o);
  for (let v = 0, g = d; v < g; v++) {
    if (Vt.fromBufferAttribute(l, v), Wt.fromBufferAttribute(f, v), Vt.w = 1, Wt.w = 1, Vt.applyMatrix4(au), Wt.applyMatrix4(au), Vt.z > p && Wt.z > p)
      continue;
    if (Vt.z > p) {
      const T = Vt.z - Wt.z, C = (Vt.z - p) / T;
      Vt.lerp(Wt, C);
    } else if (Wt.z > p) {
      const T = Wt.z - Vt.z, C = (Wt.z - p) / T;
      Wt.lerp(Vt, C);
    }
    Vt.applyMatrix4(a), Wt.applyMatrix4(a), Vt.multiplyScalar(1 / Vt.w), Wt.multiplyScalar(1 / Wt.w), Vt.x *= n.x / 2, Vt.y *= n.y / 2, Wt.x *= n.x / 2, Wt.y *= n.y / 2, Yt.start.copy(Vt), Yt.start.z = 0, Yt.end.copy(Wt), Yt.end.z = 0;
    const E = Yt.closestPointToPointParameter(su, !0);
    Yt.at(E, xd);
    const _ = fh.lerp(Vt.z, Wt.z, E), S = _ >= -1 && _ <= 1, A = su.distanceTo(xd) < Ti * 0.5;
    if (S && A) {
      Yt.start.fromBufferAttribute(l, v), Yt.end.fromBufferAttribute(f, v), Yt.start.applyMatrix4(o), Yt.end.applyMatrix4(o);
      const T = new oe(), C = new oe();
      mr.distanceSqToSegment(Yt.start, Yt.end, C, T), s.push({
        point: C,
        pointOnLine: T,
        distance: mr.origin.distanceTo(C),
        object: c,
        face: null,
        faceIndex: v,
        uv: null,
        [Oh]: null
      });
    }
  }
}
class Hh extends Xn {
  constructor(e = new oc(), s = new sc({ color: Math.random() * 16777215 })) {
    super(e, s), this.isLineSegments2 = !0, this.type = "LineSegments2";
  }
  // for backwards-compatibility, but could be a method of LineSegmentsGeometry...
  computeLineDistances() {
    const e = this.geometry, s = e.attributes.instanceStart, a = e.attributes.instanceEnd, r = new Float32Array(2 * s.count);
    for (let o = 0, u = 0, l = s.count; o < l; o++, u += 2)
      gd.fromBufferAttribute(s, o), yd.fromBufferAttribute(a, o), r[u] = u === 0 ? 0 : r[u - 1], r[u + 1] = r[u] + gd.distanceTo(yd);
    const n = new Cu(r, 2, 1);
    return e.setAttribute("instanceDistanceStart", new xi(n, 1, 0)), e.setAttribute("instanceDistanceEnd", new xi(n, 1, 1)), this;
  }
  raycast(e, s) {
    const a = this.material.worldUnits, r = e.camera;
    r === null && !a && console.error(
      'LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.'
    );
    const n = e.params.Line2 !== void 0 && e.params.Line2.threshold || 0;
    mr = e.ray;
    const o = this.matrixWorld, u = this.geometry, l = this.material;
    Ti = l.linewidth + n, u.boundingSphere === null && u.computeBoundingSphere(), ya.copy(u.boundingSphere).applyMatrix4(o);
    let f;
    if (a)
      f = Ti * 0.5;
    else {
      const p = Math.max(r.near, ya.distanceToPoint(mr.origin));
      f = Sd(r, p, l.resolution);
    }
    if (ya.radius += f, mr.intersectsSphere(ya) === !1)
      return;
    u.boundingBox === null && u.computeBoundingBox(), ga.copy(u.boundingBox).applyMatrix4(o);
    let d;
    if (a)
      d = Ti * 0.5;
    else {
      const p = Math.max(r.near, ga.distanceToPoint(mr.origin));
      d = Sd(r, p, l.resolution);
    }
    ga.expandByScalar(d), mr.intersectsBox(ga) !== !1 && (a ? Gg(this, s) : Hg(this, r, s));
  }
  onBeforeRender(e) {
    const s = this.material.uniforms;
    s && s.resolution && (e.getViewport(ou), this.material.uniforms.resolution.value.set(ou.z, ou.w));
  }
}
class Vg extends Hh {
  constructor(e = new Gh(), s = new sc({ color: Math.random() * 16777215 })) {
    super(e, s), this.isLine2 = !0, this.type = "Line2";
  }
}
const Wg = "https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles", Xg = "generic-trigger";
class Kg {
  constructor(e = null, s = Wg) {
    this.gltfLoader = e ?? new Nh(), this.path = s, this._assetCache = {};
  }
  initializeControllerModel(e, s) {
    return s.targetRayMode !== "tracked-pointer" || !s.gamepad ? Promise.resolve() : Ig(s, this.path, Xg).then(({ profile: a, assetPath: r }) => {
      if (!r)
        throw new Error("no asset path");
      const n = new jg(s, a, r);
      e.connectMotionController(n);
      const o = n.assetUrl, u = this._assetCache[o];
      if (u) {
        const l = u.scene.clone();
        e.connectModel(l);
      } else {
        if (!this.gltfLoader)
          throw new Error("GLTFLoader not set.");
        this.gltfLoader.setPath(""), this.gltfLoader.load(
          o,
          (l) => {
            if (!e.motionController) {
              console.warn("motionController gone while gltf load, bailing...");
              return;
            }
            this._assetCache[o] = l;
            const f = l.scene.clone();
            e.connectModel(f);
          },
          void 0,
          () => {
            throw new Error(`Asset ${o} missing or malformed.`);
          }
        );
      }
    }).catch((a) => {
      console.warn(a);
    });
  }
}
const wd = (c) => "envMap" in c, _d = (c, e) => {
  c.envMap = e, c.needsUpdate = !0;
}, Vh = (c, e) => {
  e instanceof Xn && (Array.isArray(e.material) ? e.material.forEach((s) => wd(s) ? _d(s, c) : void 0) : wd(e.material) && _d(e.material, c));
}, Td = (c) => "envMapIntensity" in c, Ed = (c, e) => {
  c.envMapIntensity = e, c.needsUpdate = !0;
}, Uu = (c, e) => {
  e instanceof Xn && (Array.isArray(e.material) ? e.material.forEach((s) => Td(s) ? Ed(s, c) : void 0) : Td(e.material) && Ed(e.material, c));
};
function Yg(c, e) {
  Object.values(c.components).forEach((s) => {
    const { type: a, touchPointNodeName: r, visualResponses: n } = s;
    if (a === wt.ComponentType.TOUCHPAD && r)
      if (s.touchPointNode = e.getObjectByName(r), s.touchPointNode) {
        const o = new Lm(1e-3), u = new Qr({ color: 255 }), l = new Xn(o, u);
        s.touchPointNode.add(l);
      } else
        console.warn(`Could not find touch dot, ${s.touchPointNodeName}, in touchpad component ${s.id}`);
    Object.values(n).forEach((o) => {
      const { valueNodeName: u, minNodeName: l, maxNodeName: f, valueNodeProperty: d } = o;
      if (d === wt.VisualResponseProperty.TRANSFORM && l && f) {
        if (o.minNode = e.getObjectByName(l), o.maxNode = e.getObjectByName(f), !o.minNode) {
          console.warn(`Could not find ${l} in the model`);
          return;
        }
        if (!o.maxNode) {
          console.warn(`Could not find ${f} in the model`);
          return;
        }
      }
      o.valueNode = e.getObjectByName(u), o.valueNode || console.warn(`Could not find ${u} in the model`);
    });
  });
}
function Qg(c, e) {
  Yg(c.motionController, e), (c.envMap || c.envMapIntensity != null) && e.traverse((s) => {
    c.envMap && Vh(c.envMap, s), c.envMapIntensity != null && Uu(c.envMapIntensity, s);
  }), c.add(e);
}
class qg extends wi {
  constructor() {
    super(), this.motionController = null, this.envMap = null, this.envMapIntensity = 1, this.scene = null;
  }
  setEnvironmentMap(e, s = 1) {
    var a;
    return this.envMap === e && this.envMapIntensity === s ? this : (this.envMap = e, this.envMapIntensity = s, (a = this.scene) == null || a.traverse((r) => {
      Vh(e, r), Uu(s, r);
    }), this);
  }
  setEnvironmentMapIntensity(e) {
    var s;
    return this.envMapIntensity === e ? this : (this.envMapIntensity = e, (s = this.scene) == null || s.traverse((a) => Uu(e, a)), this);
  }
  connectModel(e) {
    if (!this.motionController) {
      console.warn("scene tried to add, but no motion controller");
      return;
    }
    this.scene = e, Qg(this, e), this.dispatchEvent({
      type: "modelconnected",
      data: e
    });
  }
  connectMotionController(e) {
    this.motionController = e, this.dispatchEvent({
      type: "motionconnected",
      data: e
    });
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.motionController && (this.motionController.updateFromGamepad(), Object.values(this.motionController.components).forEach((s) => {
      Object.values(s.visualResponses).forEach((a) => {
        const { valueNode: r, minNode: n, maxNode: o, value: u, valueNodeProperty: l } = a;
        r && (l === wt.VisualResponseProperty.VISIBILITY && typeof u == "boolean" ? r.visible = u : l === wt.VisualResponseProperty.TRANSFORM && n && o && typeof u == "number" && (r.quaternion.slerpQuaternions(n.quaternion, o.quaternion, u), r.position.lerpVectors(n.position, o.position, u)));
      });
    }));
  }
  disconnect() {
    this.dispatchEvent({
      type: "motiondisconnected",
      data: this.motionController
    }), this.dispatchEvent({
      type: "modeldisconnected",
      data: this.scene
    }), this.motionController = null, this.scene && this.remove(this.scene), this.scene = null;
  }
  dispose() {
    this.disconnect();
  }
}
const Zg = te.forwardRef(function({ target: e, hideOnBlur: s = !1, ...a }, r) {
  const n = Tt((l) => l.hoverState), o = te.useRef(null), u = te.useMemo(
    () => new ch().setFromPoints([new oe(0, 0, 0), new oe(0, 0, -1)]),
    []
  );
  return te.useImperativeHandle(r, () => o.current), Ci(() => {
    if (!e.inputSource)
      return;
    let l = 1;
    const f = n[e.inputSource.handedness].values().next().value;
    f && e.inputSource.handedness !== "none" ? (l = f.distance, s && (o.current.visible = !1)) : s && (o.current.visible = !0);
    const d = -0.01;
    o.current.scale.z = l + d;
  }), /* @__PURE__ */ te.createElement("line", {
    ref: o,
    geometry: u,
    "material-opacity": 0.8,
    "material-transparent": !0,
    ...a
  });
}), Jg = new Kg(), $g = ({
  target: c,
  envMap: e,
  envMapIntensity: s
}) => {
  const a = te.useRef(null), r = vr((l) => {
    e != null && l.setEnvironmentMap(e);
  }), n = vr((l) => l.setEnvironmentMap(null)), o = vr((l) => {
    s != null && l.setEnvironmentMapIntensity(s);
  }), u = te.useCallback(
    (l) => {
      var f, d, p;
      if (a.current = l, l) {
        if (c.xrControllerModel = l, (f = c.inputSource) != null && f.hand)
          return;
        r.current(l), o.current(l), c.inputSource ? Jg.initializeControllerModel(l, c.inputSource) : console.warn("no input source on XRController when handleControllerModel");
      } else {
        if ((d = c.inputSource) != null && d.hand)
          return;
        (p = c.xrControllerModel) == null || p.disconnect(), c.xrControllerModel = null;
      }
    },
    [c, o, r]
  );
  return te.useLayoutEffect(() => {
    a.current && (e ? r.current(a.current) : n.current(a.current));
  }, [e, r, n]), te.useLayoutEffect(() => {
    a.current && o.current(a.current);
  }, [s, o]), /* @__PURE__ */ te.createElement("xRControllerModel", {
    ref: u
  });
};
function e0({ rayMaterial: c = {}, hideRaysOnBlur: e = !1, envMap: s, envMapIntensity: a }) {
  const r = Tt((u) => u.controllers), n = Tt((u) => u.isHandTracking), o = te.useMemo(
    () => Object.entries(c).reduce(
      (u, [l, f]) => ({
        ...u,
        [`material-${l}`]: f
      }),
      {}
    ),
    [JSON.stringify(c)]
  );
  return te.useMemo(() => $u({ XRControllerModel: qg }), []), /* @__PURE__ */ te.createElement(te.Fragment, null, r.map((u, l) => /* @__PURE__ */ te.createElement(te.Fragment, {
    key: l
  }, Lu(/* @__PURE__ */ te.createElement($g, {
    target: u,
    envMap: s,
    envMapIntensity: a
  }), u.grip), Lu(
    /* @__PURE__ */ te.createElement(Zg, {
      visible: !n,
      hideOnBlur: e,
      target: u,
      ...o
    }),
    u.controller
  ))));
}
const t0 = "https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/generic-hand/";
class n0 {
  constructor(e, s, a = t0, r, n) {
    this.controller = s, this.handModel = e, this.bones = [];
    const o = new Nh();
    n || o.setPath(a), o.load(n ?? `${r}.glb`, (u) => {
      const l = u.scene.children[0];
      this.handModel.add(l), this.scene = l;
      const f = l.getObjectByProperty("type", "SkinnedMesh");
      f.frustumCulled = !1, f.castShadow = !0, f.receiveShadow = !0, [
        "wrist",
        "thumb-metacarpal",
        "thumb-phalanx-proximal",
        "thumb-phalanx-distal",
        "thumb-tip",
        "index-finger-metacarpal",
        "index-finger-phalanx-proximal",
        "index-finger-phalanx-intermediate",
        "index-finger-phalanx-distal",
        "index-finger-tip",
        "middle-finger-metacarpal",
        "middle-finger-phalanx-proximal",
        "middle-finger-phalanx-intermediate",
        "middle-finger-phalanx-distal",
        "middle-finger-tip",
        "ring-finger-metacarpal",
        "ring-finger-phalanx-proximal",
        "ring-finger-phalanx-intermediate",
        "ring-finger-phalanx-distal",
        "ring-finger-tip",
        "pinky-finger-metacarpal",
        "pinky-finger-phalanx-proximal",
        "pinky-finger-phalanx-intermediate",
        "pinky-finger-phalanx-distal",
        "pinky-finger-tip"
      ].forEach((p) => {
        const v = l.getObjectByName(p);
        v !== void 0 ? v.jointName = p : console.warn(`Couldn't find ${p} in ${r} hand mesh`), this.bones.push(v);
      });
    });
  }
  updateMesh() {
    const e = this.controller.joints;
    let s = !0;
    for (let a = 0; a < this.bones.length; a++) {
      const r = this.bones[a];
      if (r) {
        const n = e[r.jointName];
        if (n.visible) {
          const o = n.position;
          r.position.copy(o), r.quaternion.copy(n.quaternion), s = !1;
        }
      }
    }
    s && this.scene ? this.scene.visible = !1 : this.scene && (this.scene.visible = !0);
  }
  dispose() {
    this.scene && this.handModel.remove(this.scene);
  }
}
const r0 = 0.01, i0 = "index-finger-tip";
class o0 extends Yu {
  constructor(e, s, a) {
    super(), this._onConnected = (r) => {
      const n = r.data;
      n.hand && !this.motionController && (this.xrInputSource = n, this.motionController = new n0(
        this,
        this.controller,
        void 0,
        n.handedness,
        n.handedness === "left" ? this.leftModelPath : this.rightModelPath
      ));
    }, this._onDisconnected = () => {
      var r;
      (r = this.xrInputSource) != null && r.hand && this.motionControllerCleanup();
    }, this.controller = e, this.motionController = null, this.envMap = null, this.leftModelPath = s, this.rightModelPath = a, this.mesh = null, this.xrInputSource = null, e.addEventListener("connected", this._onConnected), e.addEventListener("disconnected", this._onDisconnected);
  }
  motionControllerCleanup() {
    var e;
    this.clear(), (e = this.motionController) == null || e.dispose(), this.motionController = null;
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.motionController && this.motionController.updateMesh();
  }
  getPointerPosition() {
    const e = this.controller.joints[i0];
    return e ? e.position : null;
  }
  intersectBoxObject(e) {
    const s = this.getPointerPosition();
    if (s) {
      const a = new $r(s, r0), r = new Mt().setFromObject(e);
      return a.intersectsBox(r);
    } else
      return !1;
  }
  checkButton(e) {
    this.intersectBoxObject(e) ? e.onPress() : e.onClear(), e.isPressed() && e.whilePressed();
  }
  dispose() {
    this.motionControllerCleanup(), this.controller.removeEventListener("connected", this._onConnected), this.controller.removeEventListener("disconnected", this._onDisconnected);
  }
}
function s0({ modelLeft: c, modelRight: e }) {
  const s = Tt((a) => a.controllers);
  return te.useMemo(() => $u({ OculusHandModel: o0 }), []), zn(() => {
    for (const a of s)
      a.hand.dispatchEvent({ type: "connected", data: a.inputSource, fake: !0 });
  }, [s, c, e]), /* @__PURE__ */ te.createElement(te.Fragment, null, s.map(({ hand: a }) => Lu(/* @__PURE__ */ te.createElement("oculusHandModel", {
    args: [a, c, e]
  }), a)));
}
const a0 = /* @__PURE__ */ te.forwardRef(function({
  points: e,
  color: s = 16777215,
  vertexColors: a,
  linewidth: r,
  lineWidth: n,
  segments: o,
  dashed: u,
  ...l
}, f) {
  var d, p;
  const v = Qt((S) => S.size), g = te.useMemo(() => o ? new Hh() : new Vg(), [o]), [x] = te.useState(() => new sc()), E = (a == null || (d = a[0]) == null ? void 0 : d.length) === 4 ? 4 : 3, _ = te.useMemo(() => {
    const S = o ? new oc() : new Gh(), A = e.map((T) => {
      const C = Array.isArray(T);
      return T instanceof oe || T instanceof Zr ? [T.x, T.y, T.z] : T instanceof Qe ? [T.x, T.y, 0] : C && T.length === 3 ? [T[0], T[1], T[2]] : C && T.length === 2 ? [T[0], T[1], 0] : T;
    });
    if (S.setPositions(A.flat()), a) {
      s = 16777215;
      const T = a.map((C) => C instanceof Wn ? C.toArray() : C);
      S.setColors(T.flat(), E);
    }
    return S;
  }, [e, o, a, E]);
  return te.useLayoutEffect(() => {
    g.computeLineDistances();
  }, [e, g]), te.useLayoutEffect(() => {
    u ? x.defines.USE_DASH = "" : delete x.defines.USE_DASH, x.needsUpdate = !0;
  }, [u, x]), te.useEffect(() => () => {
    _.dispose(), x.dispose();
  }, [_]), /* @__PURE__ */ te.createElement("primitive", yo({
    object: g,
    ref: f
  }, l), /* @__PURE__ */ te.createElement("primitive", {
    object: _,
    attach: "geometry"
  }), /* @__PURE__ */ te.createElement("primitive", yo({
    object: x,
    attach: "material",
    color: s,
    vertexColors: !!a,
    resolution: [v.width, v.height],
    linewidth: (p = r ?? n) !== null && p !== void 0 ? p : 1,
    dashed: u,
    transparent: E === 4
  }, l)));
});
function l0() {
  var c = /* @__PURE__ */ Object.create(null);
  function e(r, n) {
    var o = r.id, u = r.name, l = r.dependencies;
    l === void 0 && (l = []);
    var f = r.init;
    f === void 0 && (f = function() {
    });
    var d = r.getTransferables;
    if (d === void 0 && (d = null), !c[o])
      try {
        l = l.map(function(v) {
          return v && v.isWorkerModule && (e(v, function(g) {
            if (g instanceof Error)
              throw g;
          }), v = c[v.id].value), v;
        }), f = a("<" + u + ">.init", f), d && (d = a("<" + u + ">.getTransferables", d));
        var p = null;
        typeof f == "function" ? p = f.apply(void 0, l) : console.error("worker module init function failed to rehydrate"), c[o] = {
          id: o,
          value: p,
          getTransferables: d
        }, n(p);
      } catch (v) {
        v && v.noLog || console.error(v), n(v);
      }
  }
  function s(r, n) {
    var o, u = r.id, l = r.args;
    (!c[u] || typeof c[u].value != "function") && n(new Error("Worker module " + u + ": not found or its 'init' did not return a function"));
    try {
      var f = (o = c[u]).value.apply(o, l);
      f && typeof f.then == "function" ? f.then(d, function(p) {
        return n(p instanceof Error ? p : new Error("" + p));
      }) : d(f);
    } catch (p) {
      n(p);
    }
    function d(p) {
      try {
        var v = c[u].getTransferables && c[u].getTransferables(p);
        (!v || !Array.isArray(v) || !v.length) && (v = void 0), n(p, v);
      } catch (g) {
        console.error(g), n(g);
      }
    }
  }
  function a(r, n) {
    var o = void 0;
    self.troikaDefine = function(l) {
      return o = l;
    };
    var u = URL.createObjectURL(
      new Blob(
        ["/** " + r.replace(/\*/g, "") + ` **/

troikaDefine(
` + n + `
)`],
        { type: "application/javascript" }
      )
    );
    try {
      importScripts(u);
    } catch (l) {
      console.error(l);
    }
    return URL.revokeObjectURL(u), delete self.troikaDefine, o;
  }
  self.addEventListener("message", function(r) {
    var n = r.data, o = n.messageId, u = n.action, l = n.data;
    try {
      u === "registerModule" && e(l, function(f) {
        f instanceof Error ? postMessage({
          messageId: o,
          success: !1,
          error: f.message
        }) : postMessage({
          messageId: o,
          success: !0,
          result: { isCallable: typeof f == "function" }
        });
      }), u === "callModule" && s(l, function(f, d) {
        f instanceof Error ? postMessage({
          messageId: o,
          success: !1,
          error: f.message
        }) : postMessage({
          messageId: o,
          success: !0,
          result: f
        }, d || void 0);
      });
    } catch (f) {
      postMessage({
        messageId: o,
        success: !1,
        error: f.stack
      });
    }
  });
}
function u0(c) {
  var e = function() {
    for (var s = [], a = arguments.length; a--; )
      s[a] = arguments[a];
    return e._getInitResult().then(function(r) {
      if (typeof r == "function")
        return r.apply(void 0, s);
      throw new Error("Worker module function was called but `init` did not return a callable function");
    });
  };
  return e._getInitResult = function() {
    var s = c.dependencies, a = c.init;
    s = Array.isArray(s) ? s.map(function(n) {
      return n && (n = n.onMainThread || n, n._getInitResult && (n = n._getInitResult())), n;
    }) : [];
    var r = Promise.all(s).then(function(n) {
      return a.apply(null, n);
    });
    return e._getInitResult = function() {
      return r;
    }, r;
  }, e;
}
var Wh = function() {
  var c = !1;
  if (typeof window < "u" && typeof window.document < "u")
    try {
      var e = new Worker(
        URL.createObjectURL(new Blob([""], { type: "application/javascript" }))
      );
      e.terminate(), c = !0;
    } catch (s) {
      typeof process < "u", console.log(
        "Troika createWorkerModule: web workers not allowed; falling back to main thread execution. Cause: [" + s.message + "]"
      );
    }
  return Wh = function() {
    return c;
  }, c;
}, c0 = 0, f0 = 0, lu = !1, hs = /* @__PURE__ */ Object.create(null), ps = /* @__PURE__ */ Object.create(null), Du = /* @__PURE__ */ Object.create(null);
function So(c) {
  if ((!c || typeof c.init != "function") && !lu)
    throw new Error("requires `options.init` function");
  var e = c.dependencies, s = c.init, a = c.getTransferables, r = c.workerId, n = u0(c);
  r == null && (r = "#default");
  var o = "workerModule" + ++c0, u = c.name || o, l = null;
  e = e && e.map(function(d) {
    return typeof d == "function" && !d.workerModuleData && (lu = !0, d = So({
      workerId: r,
      name: "<" + u + "> function dependency: " + d.name,
      init: `function(){return (
` + Ba(d) + `
)}`
    }), lu = !1), d && d.workerModuleData && (d = d.workerModuleData), d;
  });
  function f() {
    for (var d = [], p = arguments.length; p--; )
      d[p] = arguments[p];
    if (!Wh())
      return n.apply(void 0, d);
    if (!l) {
      l = Ad(r, "registerModule", f.workerModuleData);
      var v = function() {
        l = null, ps[r].delete(v);
      };
      (ps[r] || (ps[r] = /* @__PURE__ */ new Set())).add(v);
    }
    return l.then(function(g) {
      var x = g.isCallable;
      if (x)
        return Ad(r, "callModule", { id: o, args: d });
      throw new Error("Worker module function was called but `init` did not return a callable function");
    });
  }
  return f.workerModuleData = {
    isWorkerModule: !0,
    id: o,
    name: u,
    dependencies: e,
    init: Ba(s),
    getTransferables: a && Ba(a)
  }, f.onMainThread = n, f;
}
function d0(c) {
  ps[c] && ps[c].forEach(function(e) {
    e();
  }), hs[c] && (hs[c].terminate(), delete hs[c]);
}
function Ba(c) {
  var e = c.toString();
  return !/^function/.test(e) && /^\w+\s*\(/.test(e) && (e = "function " + e), e;
}
function h0(c) {
  var e = hs[c];
  if (!e) {
    var s = Ba(l0);
    e = hs[c] = new Worker(
      URL.createObjectURL(
        new Blob(
          ["/** Worker Module Bootstrap: " + c.replace(/\*/g, "") + ` **/

;(` + s + ")()"],
          { type: "application/javascript" }
        )
      )
    ), e.onmessage = function(a) {
      var r = a.data, n = r.messageId, o = Du[n];
      if (!o)
        throw new Error("WorkerModule response with empty or unknown messageId");
      delete Du[n], o(r);
    };
  }
  return e;
}
function Ad(c, e, s) {
  return new Promise(function(a, r) {
    var n = ++f0;
    Du[n] = function(o) {
      o.success ? a(o.result) : r(new Error("Error in worker " + e + " call: " + o.error));
    }, h0(c).postMessage({
      messageId: n,
      action: e,
      data: s
    });
  });
}
function Xh() {
  var c = function(e) {
    function s(V, G, F, j, W, $, Y, se) {
      var X = 1 - Y;
      se.x = X * X * V + 2 * X * Y * F + Y * Y * W, se.y = X * X * G + 2 * X * Y * j + Y * Y * $;
    }
    function a(V, G, F, j, W, $, Y, se, X, q) {
      var re = 1 - X;
      q.x = re * re * re * V + 3 * re * re * X * F + 3 * re * X * X * W + X * X * X * Y, q.y = re * re * re * G + 3 * re * re * X * j + 3 * re * X * X * $ + X * X * X * se;
    }
    function r(V, G) {
      for (var F = /([MLQCZ])([^MLQCZ]*)/g, j, W, $, Y, se; j = F.exec(V); ) {
        var X = j[2].replace(/^\s*|\s*$/g, "").split(/[,\s]+/).map(function(q) {
          return parseFloat(q);
        });
        switch (j[1]) {
          case "M":
            Y = W = X[0], se = $ = X[1];
            break;
          case "L":
            (X[0] !== Y || X[1] !== se) && G("L", Y, se, Y = X[0], se = X[1]);
            break;
          case "Q": {
            G("Q", Y, se, Y = X[2], se = X[3], X[0], X[1]);
            break;
          }
          case "C": {
            G("C", Y, se, Y = X[4], se = X[5], X[0], X[1], X[2], X[3]);
            break;
          }
          case "Z":
            (Y !== W || se !== $) && G("L", Y, se, W, $);
            break;
        }
      }
    }
    function n(V, G, F) {
      F === void 0 && (F = 16);
      var j = { x: 0, y: 0 };
      r(V, function(W, $, Y, se, X, q, re, pe, ae) {
        switch (W) {
          case "L":
            G($, Y, se, X);
            break;
          case "Q": {
            for (var ie = $, fe = Y, ve = 1; ve < F; ve++)
              s(
                $,
                Y,
                q,
                re,
                se,
                X,
                ve / (F - 1),
                j
              ), G(ie, fe, j.x, j.y), ie = j.x, fe = j.y;
            break;
          }
          case "C": {
            for (var me = $, we = Y, Fe = 1; Fe < F; Fe++)
              a(
                $,
                Y,
                q,
                re,
                pe,
                ae,
                se,
                X,
                Fe / (F - 1),
                j
              ), G(me, we, j.x, j.y), me = j.x, we = j.y;
            break;
          }
        }
      });
    }
    var o = "precision highp float;attribute vec2 aUV;varying vec2 vUV;void main(){vUV=aUV;gl_Position=vec4(mix(vec2(-1.0),vec2(1.0),aUV),0.0,1.0);}", u = "precision highp float;uniform sampler2D tex;varying vec2 vUV;void main(){gl_FragColor=texture2D(tex,vUV);}", l = /* @__PURE__ */ new WeakMap(), f = {
      premultipliedAlpha: !1,
      preserveDrawingBuffer: !0,
      antialias: !1,
      depth: !1
    };
    function d(V, G) {
      var F = V.getContext ? V.getContext("webgl", f) : V, j = l.get(F);
      if (!j) {
        let re = function(me) {
          var we = $[me];
          if (!we && (we = $[me] = F.getExtension(me), !we))
            throw new Error(me + " not supported");
          return we;
        }, pe = function(me, we) {
          var Fe = F.createShader(we);
          return F.shaderSource(Fe, me), F.compileShader(Fe), Fe;
        }, ae = function(me, we, Fe, de) {
          if (!Y[me]) {
            var Me = {}, Te = {}, le = F.createProgram();
            F.attachShader(le, pe(we, F.VERTEX_SHADER)), F.attachShader(le, pe(Fe, F.FRAGMENT_SHADER)), F.linkProgram(le), Y[me] = {
              program: le,
              transaction: function(_e) {
                F.useProgram(le), _e({
                  setUniform: function(xe, tt) {
                    for (var be = [], Le = arguments.length - 2; Le-- > 0; )
                      be[Le] = arguments[Le + 2];
                    var Oe = Te[tt] || (Te[tt] = F.getUniformLocation(le, tt));
                    F["uniform" + xe].apply(F, [Oe].concat(be));
                  },
                  setAttribute: function(xe, tt, be, Le, Oe) {
                    var Ge = Me[xe];
                    Ge || (Ge = Me[xe] = {
                      buf: F.createBuffer(),
                      // TODO should we destroy our buffers?
                      loc: F.getAttribLocation(le, xe),
                      data: null
                    }), F.bindBuffer(F.ARRAY_BUFFER, Ge.buf), F.vertexAttribPointer(Ge.loc, tt, F.FLOAT, !1, 0, 0), F.enableVertexAttribArray(Ge.loc), W ? F.vertexAttribDivisor(Ge.loc, Le) : re("ANGLE_instanced_arrays").vertexAttribDivisorANGLE(Ge.loc, Le), Oe !== Ge.data && (F.bufferData(F.ARRAY_BUFFER, Oe, be), Ge.data = Oe);
                  }
                });
              }
            };
          }
          Y[me].transaction(de);
        }, ie = function(me, we) {
          X++;
          try {
            F.activeTexture(F.TEXTURE0 + X);
            var Fe = se[me];
            Fe || (Fe = se[me] = F.createTexture(), F.bindTexture(F.TEXTURE_2D, Fe), F.texParameteri(F.TEXTURE_2D, F.TEXTURE_MIN_FILTER, F.NEAREST), F.texParameteri(F.TEXTURE_2D, F.TEXTURE_MAG_FILTER, F.NEAREST)), F.bindTexture(F.TEXTURE_2D, Fe), we(Fe, X);
          } finally {
            X--;
          }
        }, fe = function(me, we, Fe) {
          var de = F.createFramebuffer();
          q.push(de), F.bindFramebuffer(F.FRAMEBUFFER, de), F.activeTexture(F.TEXTURE0 + we), F.bindTexture(F.TEXTURE_2D, me), F.framebufferTexture2D(F.FRAMEBUFFER, F.COLOR_ATTACHMENT0, F.TEXTURE_2D, me, 0);
          try {
            Fe(de);
          } finally {
            F.deleteFramebuffer(de), F.bindFramebuffer(F.FRAMEBUFFER, q[--q.length - 1] || null);
          }
        }, ve = function() {
          $ = {}, Y = {}, se = {}, X = -1, q.length = 0;
        };
        var W = typeof WebGL2RenderingContext < "u" && F instanceof WebGL2RenderingContext, $ = {}, Y = {}, se = {}, X = -1, q = [];
        F.canvas.addEventListener("webglcontextlost", function(me) {
          ve(), me.preventDefault();
        }, !1), l.set(F, j = {
          gl: F,
          isWebGL2: W,
          getExtension: re,
          withProgram: ae,
          withTexture: ie,
          withTextureFramebuffer: fe,
          handleContextLoss: ve
        });
      }
      G(j);
    }
    function p(V, G, F, j, W, $, Y, se) {
      Y === void 0 && (Y = 15), se === void 0 && (se = null), d(V, function(X) {
        var q = X.gl, re = X.withProgram, pe = X.withTexture;
        pe("copy", function(ae, ie) {
          q.texImage2D(q.TEXTURE_2D, 0, q.RGBA, W, $, 0, q.RGBA, q.UNSIGNED_BYTE, G), re("copy", o, u, function(fe) {
            var ve = fe.setUniform, me = fe.setAttribute;
            me("aUV", 2, q.STATIC_DRAW, 0, new Float32Array([0, 0, 2, 0, 0, 2])), ve("1i", "image", ie), q.bindFramebuffer(q.FRAMEBUFFER, se || null), q.disable(q.BLEND), q.colorMask(Y & 8, Y & 4, Y & 2, Y & 1), q.viewport(F, j, W, $), q.scissor(F, j, W, $), q.drawArrays(q.TRIANGLES, 0, 3);
          });
        });
      });
    }
    function v(V, G, F) {
      var j = V.width, W = V.height;
      d(V, function($) {
        var Y = $.gl, se = new Uint8Array(j * W * 4);
        Y.readPixels(0, 0, j, W, Y.RGBA, Y.UNSIGNED_BYTE, se), V.width = G, V.height = F, p(Y, se, 0, 0, j, W);
      });
    }
    var g = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      withWebGLContext: d,
      renderImageData: p,
      resizeWebGLCanvasWithoutClearing: v
    });
    function x(V, G, F, j, W, $) {
      $ === void 0 && ($ = 1);
      var Y = new Uint8Array(V * G), se = j[2] - j[0], X = j[3] - j[1], q = [];
      n(F, function(me, we, Fe, de) {
        q.push({
          x1: me,
          y1: we,
          x2: Fe,
          y2: de,
          minX: Math.min(me, Fe),
          minY: Math.min(we, de),
          maxX: Math.max(me, Fe),
          maxY: Math.max(we, de)
        });
      }), q.sort(function(me, we) {
        return me.maxX - we.maxX;
      });
      for (var re = 0; re < V; re++)
        for (var pe = 0; pe < G; pe++) {
          var ae = fe(
            j[0] + se * (re + 0.5) / V,
            j[1] + X * (pe + 0.5) / G
          ), ie = Math.pow(1 - Math.abs(ae) / W, $) / 2;
          ae < 0 && (ie = 1 - ie), ie = Math.max(0, Math.min(255, Math.round(ie * 255))), Y[pe * V + re] = ie;
        }
      return Y;
      function fe(me, we) {
        for (var Fe = 1 / 0, de = 1 / 0, Me = q.length; Me--; ) {
          var Te = q[Me];
          if (Te.maxX + de <= me)
            break;
          if (me + de > Te.minX && we - de < Te.maxY && we + de > Te.minY) {
            var le = S(me, we, Te.x1, Te.y1, Te.x2, Te.y2);
            le < Fe && (Fe = le, de = Math.sqrt(Fe));
          }
        }
        return ve(me, we) && (de = -de), de;
      }
      function ve(me, we) {
        for (var Fe = 0, de = q.length; de--; ) {
          var Me = q[de];
          if (Me.maxX <= me)
            break;
          var Te = Me.y1 > we != Me.y2 > we && me < (Me.x2 - Me.x1) * (we - Me.y1) / (Me.y2 - Me.y1) + Me.x1;
          Te && (Fe += Me.y1 < Me.y2 ? 1 : -1);
        }
        return Fe !== 0;
      }
    }
    function E(V, G, F, j, W, $, Y, se, X, q) {
      $ === void 0 && ($ = 1), se === void 0 && (se = 0), X === void 0 && (X = 0), q === void 0 && (q = 0), _(V, G, F, j, W, $, Y, null, se, X, q);
    }
    function _(V, G, F, j, W, $, Y, se, X, q, re) {
      $ === void 0 && ($ = 1), X === void 0 && (X = 0), q === void 0 && (q = 0), re === void 0 && (re = 0);
      for (var pe = x(V, G, F, j, W, $), ae = new Uint8Array(pe.length * 4), ie = 0; ie < pe.length; ie++)
        ae[ie * 4 + re] = pe[ie];
      p(Y, ae, X, q, V, G, 1 << 3 - re, se);
    }
    function S(V, G, F, j, W, $) {
      var Y = W - F, se = $ - j, X = Y * Y + se * se, q = X ? Math.max(0, Math.min(1, ((V - F) * Y + (G - j) * se) / X)) : 0, re = V - (F + q * Y), pe = G - (j + q * se);
      return re * re + pe * pe;
    }
    var A = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      generate: x,
      generateIntoCanvas: E,
      generateIntoFramebuffer: _
    }), T = "precision highp float;uniform vec4 uGlyphBounds;attribute vec2 aUV;attribute vec4 aLineSegment;varying vec4 vLineSegment;varying vec2 vGlyphXY;void main(){vLineSegment=aLineSegment;vGlyphXY=mix(uGlyphBounds.xy,uGlyphBounds.zw,aUV);gl_Position=vec4(mix(vec2(-1.0),vec2(1.0),aUV),0.0,1.0);}", C = "precision highp float;uniform vec4 uGlyphBounds;uniform float uMaxDistance;uniform float uExponent;varying vec4 vLineSegment;varying vec2 vGlyphXY;float absDistToSegment(vec2 point,vec2 lineA,vec2 lineB){vec2 lineDir=lineB-lineA;float lenSq=dot(lineDir,lineDir);float t=lenSq==0.0 ? 0.0 : clamp(dot(point-lineA,lineDir)/lenSq,0.0,1.0);vec2 linePt=lineA+t*lineDir;return distance(point,linePt);}void main(){vec4 seg=vLineSegment;vec2 p=vGlyphXY;float dist=absDistToSegment(p,seg.xy,seg.zw);float val=pow(1.0-clamp(dist/uMaxDistance,0.0,1.0),uExponent)*0.5;bool crossing=(seg.y>p.y!=seg.w>p.y)&&(p.x<(seg.z-seg.x)*(p.y-seg.y)/(seg.w-seg.y)+seg.x);bool crossingUp=crossing&&vLineSegment.y<vLineSegment.w;gl_FragColor=vec4(crossingUp ? 1.0/255.0 : 0.0,crossing&&!crossingUp ? 1.0/255.0 : 0.0,0.0,val);}", P = "precision highp float;uniform sampler2D tex;varying vec2 vUV;void main(){vec4 color=texture2D(tex,vUV);bool inside=color.r!=color.g;float val=inside ? 1.0-color.a : color.a;gl_FragColor=vec4(val);}", M = new Float32Array([0, 0, 2, 0, 0, 2]), b = null, L = !1, U = {}, R = /* @__PURE__ */ new WeakMap();
    function I(V) {
      if (!L && !J(V))
        throw new Error("WebGL generation not supported");
    }
    function k(V, G, F, j, W, $, Y) {
      if ($ === void 0 && ($ = 1), Y === void 0 && (Y = null), !Y && (Y = b, !Y)) {
        var se = typeof OffscreenCanvas == "function" ? new OffscreenCanvas(1, 1) : typeof document < "u" ? document.createElement("canvas") : null;
        if (!se)
          throw new Error("OffscreenCanvas or DOM canvas not supported");
        Y = b = se.getContext("webgl", { depth: !1 });
      }
      I(Y);
      var X = new Uint8Array(V * G * 4);
      d(Y, function(ae) {
        var ie = ae.gl, fe = ae.withTexture, ve = ae.withTextureFramebuffer;
        fe("readable", function(me, we) {
          ie.texImage2D(ie.TEXTURE_2D, 0, ie.RGBA, V, G, 0, ie.RGBA, ie.UNSIGNED_BYTE, null), ve(me, we, function(Fe) {
            N(
              V,
              G,
              F,
              j,
              W,
              $,
              ie,
              Fe,
              0,
              0,
              0
              // red channel
            ), ie.readPixels(0, 0, V, G, ie.RGBA, ie.UNSIGNED_BYTE, X);
          });
        });
      });
      for (var q = new Uint8Array(V * G), re = 0, pe = 0; re < X.length; re += 4)
        q[pe++] = X[re];
      return q;
    }
    function O(V, G, F, j, W, $, Y, se, X, q) {
      $ === void 0 && ($ = 1), se === void 0 && (se = 0), X === void 0 && (X = 0), q === void 0 && (q = 0), N(V, G, F, j, W, $, Y, null, se, X, q);
    }
    function N(V, G, F, j, W, $, Y, se, X, q, re) {
      $ === void 0 && ($ = 1), X === void 0 && (X = 0), q === void 0 && (q = 0), re === void 0 && (re = 0), I(Y);
      var pe = [];
      n(F, function(ae, ie, fe, ve) {
        pe.push(ae, ie, fe, ve);
      }), pe = new Float32Array(pe), d(Y, function(ae) {
        var ie = ae.gl, fe = ae.isWebGL2, ve = ae.getExtension, me = ae.withProgram, we = ae.withTexture, Fe = ae.withTextureFramebuffer, de = ae.handleContextLoss;
        if (we("rawDistances", function(Me, Te) {
          (V !== Me._lastWidth || G !== Me._lastHeight) && ie.texImage2D(
            ie.TEXTURE_2D,
            0,
            ie.RGBA,
            Me._lastWidth = V,
            Me._lastHeight = G,
            0,
            ie.RGBA,
            ie.UNSIGNED_BYTE,
            null
          ), me("main", T, C, function(le) {
            var je = le.setAttribute, _e = le.setUniform, Ee = !fe && ve("ANGLE_instanced_arrays"), xe = !fe && ve("EXT_blend_minmax");
            je("aUV", 2, ie.STATIC_DRAW, 0, M), je("aLineSegment", 4, ie.DYNAMIC_DRAW, 1, pe), _e.apply(void 0, ["4f", "uGlyphBounds"].concat(j)), _e("1f", "uMaxDistance", W), _e("1f", "uExponent", $), Fe(Me, Te, function(tt) {
              ie.enable(ie.BLEND), ie.colorMask(!0, !0, !0, !0), ie.viewport(0, 0, V, G), ie.scissor(0, 0, V, G), ie.blendFunc(ie.ONE, ie.ONE), ie.blendEquationSeparate(ie.FUNC_ADD, fe ? ie.MAX : xe.MAX_EXT), ie.clear(ie.COLOR_BUFFER_BIT), fe ? ie.drawArraysInstanced(ie.TRIANGLES, 0, 3, pe.length / 4) : Ee.drawArraysInstancedANGLE(ie.TRIANGLES, 0, 3, pe.length / 4);
            });
          }), me("post", o, P, function(le) {
            le.setAttribute("aUV", 2, ie.STATIC_DRAW, 0, M), le.setUniform("1i", "tex", Te), ie.bindFramebuffer(ie.FRAMEBUFFER, se), ie.disable(ie.BLEND), ie.colorMask(re === 0, re === 1, re === 2, re === 3), ie.viewport(X, q, V, G), ie.scissor(X, q, V, G), ie.drawArrays(ie.TRIANGLES, 0, 3);
          });
        }), ie.isContextLost())
          throw de(), new Error("webgl context lost");
      });
    }
    function J(V) {
      var G = !V || V === b ? U : V.canvas || V, F = R.get(G);
      if (F === void 0) {
        L = !0;
        var j = null;
        try {
          var W = [
            97,
            106,
            97,
            61,
            99,
            137,
            118,
            80,
            80,
            118,
            137,
            99,
            61,
            97,
            106,
            97
          ], $ = k(
            4,
            4,
            "M8,8L16,8L24,24L16,24Z",
            [0, 0, 32, 32],
            24,
            1,
            V
          );
          F = $ && W.length === $.length && $.every(function(Y, se) {
            return Y === W[se];
          }), F || (j = "bad trial run results", console.info(W, $));
        } catch (Y) {
          F = !1, j = Y.message;
        }
        j && console.warn("WebGL SDF generation not supported:", j), L = !1, R.set(G, F);
      }
      return F;
    }
    var Z = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      generate: k,
      generateIntoCanvas: O,
      generateIntoFramebuffer: N,
      isSupported: J
    });
    function ce(V, G, F, j, W, $) {
      W === void 0 && (W = Math.max(j[2] - j[0], j[3] - j[1]) / 2), $ === void 0 && ($ = 1);
      try {
        return k.apply(Z, arguments);
      } catch (Y) {
        return console.info("WebGL SDF generation failed, falling back to JS", Y), x.apply(A, arguments);
      }
    }
    function K(V, G, F, j, W, $, Y, se, X, q) {
      W === void 0 && (W = Math.max(j[2] - j[0], j[3] - j[1]) / 2), $ === void 0 && ($ = 1), se === void 0 && (se = 0), X === void 0 && (X = 0), q === void 0 && (q = 0);
      try {
        return O.apply(Z, arguments);
      } catch (re) {
        return console.info("WebGL SDF generation failed, falling back to JS", re), E.apply(A, arguments);
      }
    }
    return e.forEachPathCommand = r, e.generate = ce, e.generateIntoCanvas = K, e.javascript = A, e.pathToLineSegments = n, e.webgl = Z, e.webglUtils = g, Object.defineProperty(e, "__esModule", { value: !0 }), e;
  }({});
  return c;
}
function p0() {
  var c = function(e) {
    var s = {
      R: "13k,1a,2,3,3,2+1j,ch+16,a+1,5+2,2+n,5,a,4,6+16,4+3,h+1b,4mo,179q,2+9,2+11,2i9+7y,2+68,4,3+4,5+13,4+3,2+4k,3+29,8+cf,1t+7z,w+17,3+3m,1t+3z,16o1+5r,8+30,8+mc,29+1r,29+4v,75+73",
      EN: "1c+9,3d+1,6,187+9,513,4+5,7+9,sf+j,175h+9,qw+q,161f+1d,4xt+a,25i+9",
      ES: "17,2,6dp+1,f+1,av,16vr,mx+1,4o,2",
      ET: "z+2,3h+3,b+1,ym,3e+1,2o,p4+1,8,6u,7c,g6,1wc,1n9+4,30+1b,2n,6d,qhx+1,h0m,a+1,49+2,63+1,4+1,6bb+3,12jj",
      AN: "16o+5,2j+9,2+1,35,ed,1ff2+9,87+u",
      CS: "18,2+1,b,2u,12k,55v,l,17v0,2,3,53,2+1,b",
      B: "a,3,f+2,2v,690",
      S: "9,2,k",
      WS: "c,k,4f4,1vk+a,u,1j,335",
      ON: "x+1,4+4,h+5,r+5,r+3,z,5+3,2+1,2+1,5,2+2,3+4,o,w,ci+1,8+d,3+d,6+8,2+g,39+1,9,6+1,2,33,b8,3+1,3c+1,7+1,5r,b,7h+3,sa+5,2,3i+6,jg+3,ur+9,2v,ij+1,9g+9,7+a,8m,4+1,49+x,14u,2+2,c+2,e+2,e+2,e+1,i+n,e+e,2+p,u+2,e+2,36+1,2+3,2+1,b,2+2,6+5,2,2,2,h+1,5+4,6+3,3+f,16+2,5+3l,3+81,1y+p,2+40,q+a,m+13,2r+ch,2+9e,75+hf,3+v,2+2w,6e+5,f+6,75+2a,1a+p,2+2g,d+5x,r+b,6+3,4+o,g,6+1,6+2,2k+1,4,2j,5h+z,1m+1,1e+f,t+2,1f+e,d+3,4o+3,2s+1,w,535+1r,h3l+1i,93+2,2s,b+1,3l+x,2v,4g+3,21+3,kz+1,g5v+1,5a,j+9,n+v,2,3,2+8,2+1,3+2,2,3,46+1,4+4,h+5,r+5,r+a,3h+2,4+6,b+4,78,1r+24,4+c,4,1hb,ey+6,103+j,16j+c,1ux+7,5+g,fsh,jdq+1t,4,57+2e,p1,1m,1m,1m,1m,4kt+1,7j+17,5+2r,d+e,3+e,2+e,2+10,m+4,w,1n+5,1q,4z+5,4b+rb,9+c,4+c,4+37,d+2g,8+b,l+b,5+1j,9+9,7+13,9+t,3+1,27+3c,2+29,2+3q,d+d,3+4,4+2,6+6,a+o,8+6,a+2,e+6,16+42,2+1i",
      BN: "0+8,6+d,2s+5,2+p,e,4m9,1kt+2,2b+5,5+5,17q9+v,7k,6p+8,6+1,119d+3,440+7,96s+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+75,6p+2rz,1ben+1,1ekf+1,1ekf+1",
      NSM: "lc+33,7o+6,7c+18,2,2+1,2+1,2,21+a,1d+k,h,2u+6,3+5,3+1,2+3,10,v+q,2k+a,1n+8,a,p+3,2+8,2+2,2+4,18+2,3c+e,2+v,1k,2,5+7,5,4+6,b+1,u,1n,5+3,9,l+1,r,3+1,1m,5+1,5+1,3+2,4,v+1,4,c+1,1m,5+4,2+1,5,l+1,n+5,2,1n,3,2+3,9,8+1,c+1,v,1q,d,1f,4,1m+2,6+2,2+3,8+1,c+1,u,1n,g+1,l+1,t+1,1m+1,5+3,9,l+1,u,21,8+2,2,2j,3+6,d+7,2r,3+8,c+5,23+1,s,2,2,1k+d,2+4,2+1,6+a,2+z,a,2v+3,2+5,2+1,3+1,q+1,5+2,h+3,e,3+1,7,g,jk+2,qb+2,u+2,u+1,v+1,1t+1,2+6,9,3+a,a,1a+2,3c+1,z,3b+2,5+1,a,7+2,64+1,3,1n,2+6,2,2,3+7,7+9,3,1d+g,1s+3,1d,2+4,2,6,15+8,d+1,x+3,3+1,2+2,1l,2+1,4,2+2,1n+7,3+1,49+2,2+c,2+6,5,7,4+1,5j+1l,2+4,k1+w,2db+2,3y,2p+v,ff+3,30+1,n9x+3,2+9,x+1,29+1,7l,4,5,q+1,6,48+1,r+h,e,13+7,q+a,1b+2,1d,3+3,3+1,14,1w+5,3+1,3+1,d,9,1c,1g,2+2,3+1,6+1,2,17+1,9,6n,3,5,fn5,ki+f,h+f,r2,6b,46+4,1af+2,2+1,6+3,15+2,5,4m+1,fy+3,as+1,4a+a,4x,1j+e,1l+2,1e+3,3+1,1y+2,11+4,2+7,1r,d+1,1h+8,b+3,3,2o+2,3,2+1,7,4h,4+7,m+1,1m+1,4,12+6,4+4,5g+7,3+2,2,o,2d+5,2,5+1,2+1,6n+3,7+1,2+1,s+1,2e+7,3,2+1,2z,2,3+5,2,2u+2,3+3,2+4,78+8,2+1,75+1,2,5,41+3,3+1,5,x+5,3+1,15+5,3+3,9,a+5,3+2,1b+c,2+1,bb+6,2+5,2d+l,3+6,2+1,2+1,3f+5,4,2+1,2+6,2,21+1,4,2,9o+1,f0c+4,1o+6,t5,1s+3,2a,f5l+1,43t+2,i+7,3+6,v+3,45+2,1j0+1i,5+1d,9,f,n+4,2+e,11t+6,2+g,3+6,2+1,2+4,7a+6,c6+3,15t+6,32+6,gzhy+6n",
      AL: "16w,3,2,e+1b,z+2,2+2s,g+1,8+1,b+m,2+t,s+2i,c+e,4h+f,1d+1e,1bwe+dp,3+3z,x+c,2+1,35+3y,2rm+z,5+7,b+5,dt+l,c+u,17nl+27,1t+27,4x+6n,3+d",
      LRO: "6ct",
      RLO: "6cu",
      LRE: "6cq",
      RLE: "6cr",
      PDF: "6cs",
      LRI: "6ee",
      RLI: "6ef",
      FSI: "6eg",
      PDI: "6eh"
    }, a = {}, r = {};
    a.L = 1, r[1] = "L", Object.keys(s).forEach(function(de, Me) {
      a[de] = 1 << Me + 1, r[a[de]] = de;
    }), Object.freeze(a);
    var n = a.LRI | a.RLI | a.FSI, o = a.L | a.R | a.AL, u = a.B | a.S | a.WS | a.ON | a.FSI | a.LRI | a.RLI | a.PDI, l = a.BN | a.RLE | a.LRE | a.RLO | a.LRO | a.PDF, f = a.S | a.WS | a.B | n | a.PDI | l, d = null;
    function p() {
      if (!d) {
        d = /* @__PURE__ */ new Map();
        var de = function(Te) {
          if (s.hasOwnProperty(Te)) {
            var le = 0;
            s[Te].split(",").forEach(function(je) {
              var _e = je.split("+"), Ee = _e[0], xe = _e[1];
              Ee = parseInt(Ee, 36), xe = xe ? parseInt(xe, 36) : 0, d.set(le += Ee, a[Te]);
              for (var tt = 0; tt < xe; tt++)
                d.set(++le, a[Te]);
            });
          }
        };
        for (var Me in s)
          de(Me);
      }
    }
    function v(de) {
      return p(), d.get(de.codePointAt(0)) || a.L;
    }
    function g(de) {
      return r[v(de)];
    }
    var x = {
      pairs: "14>1,1e>2,u>2,2wt>1,1>1,1ge>1,1wp>1,1j>1,f>1,hm>1,1>1,u>1,u6>1,1>1,+5,28>1,w>1,1>1,+3,b8>1,1>1,+3,1>3,-1>-1,3>1,1>1,+2,1s>1,1>1,x>1,th>1,1>1,+2,db>1,1>1,+3,3>1,1>1,+2,14qm>1,1>1,+1,4q>1,1e>2,u>2,2>1,+1",
      canonical: "6f1>-6dx,6dy>-6dx,6ec>-6ed,6ee>-6ed,6ww>2jj,-2ji>2jj,14r4>-1e7l,1e7m>-1e7l,1e7m>-1e5c,1e5d>-1e5b,1e5c>-14qx,14qy>-14qx,14vn>-1ecg,1ech>-1ecg,1edu>-1ecg,1eci>-1ecg,1eda>-1ecg,1eci>-1ecg,1eci>-168q,168r>-168q,168s>-14ye,14yf>-14ye"
    };
    function E(de, Me) {
      var Te = 36, le = 0, je = /* @__PURE__ */ new Map(), _e = Me && /* @__PURE__ */ new Map(), Ee;
      return de.split(",").forEach(function xe(tt) {
        if (tt.indexOf("+") !== -1)
          for (var be = +tt; be--; )
            xe(Ee);
        else {
          Ee = tt;
          var Le = tt.split(">"), Oe = Le[0], Ge = Le[1];
          Oe = String.fromCodePoint(le += parseInt(Oe, Te)), Ge = String.fromCodePoint(le += parseInt(Ge, Te)), je.set(Oe, Ge), Me && _e.set(Ge, Oe);
        }
      }), { map: je, reverseMap: _e };
    }
    var _, S, A;
    function T() {
      if (!_) {
        var de = E(x.pairs, !0), Me = de.map, Te = de.reverseMap;
        _ = Me, S = Te, A = E(x.canonical, !1).map;
      }
    }
    function C(de) {
      return T(), _.get(de) || null;
    }
    function P(de) {
      return T(), S.get(de) || null;
    }
    function M(de) {
      return T(), A.get(de) || null;
    }
    var b = a.L, L = a.R, U = a.EN, R = a.ES, I = a.ET, k = a.AN, O = a.CS, N = a.B, J = a.S, Z = a.ON, ce = a.BN, K = a.NSM, V = a.AL, G = a.LRO, F = a.RLO, j = a.LRE, W = a.RLE, $ = a.PDF, Y = a.LRI, se = a.RLI, X = a.FSI, q = a.PDI;
    function re(de, Me) {
      for (var Te = 125, le = new Uint32Array(de.length), je = 0; je < de.length; je++)
        le[je] = v(de[je]);
      var _e = /* @__PURE__ */ new Map();
      function Ee(Bt, rn) {
        var At = le[Bt];
        le[Bt] = rn, _e.set(At, _e.get(At) - 1), At & u && _e.set(u, _e.get(u) - 1), _e.set(rn, (_e.get(rn) || 0) + 1), rn & u && _e.set(u, (_e.get(u) || 0) + 1);
      }
      for (var xe = new Uint8Array(de.length), tt = /* @__PURE__ */ new Map(), be = [], Le = null, Oe = 0; Oe < de.length; Oe++)
        Le || be.push(Le = {
          start: Oe,
          end: de.length - 1,
          // 3.3.1 P2-P3: Determine the paragraph level
          level: Me === "rtl" ? 1 : Me === "ltr" ? 0 : Ii(Oe, !1)
        }), le[Oe] & N && (Le.end = Oe, Le = null);
      for (var Ge = W | j | F | G | n | q | $ | N, st = function(Bt) {
        return Bt + (Bt & 1 ? 1 : 2);
      }, ct = function(Bt) {
        return Bt + (Bt & 1 ? 2 : 1);
      }, Ke = 0; Ke < be.length; Ke++) {
        Le = be[Ke];
        var We = [{
          _level: Le.level,
          _override: 0,
          //0=neutral, 1=L, 2=R
          _isolate: 0
          //bool
        }], Ue = void 0, B = 0, ue = 0, Pe = 0;
        _e.clear();
        for (var Re = Le.start; Re <= Le.end; Re++) {
          var Ae = le[Re];
          if (Ue = We[We.length - 1], _e.set(Ae, (_e.get(Ae) || 0) + 1), Ae & u && _e.set(u, (_e.get(u) || 0) + 1), Ae & Ge)
            if (Ae & (W | j)) {
              xe[Re] = Ue._level;
              var Ye = (Ae === W ? ct : st)(Ue._level);
              Ye <= Te && !B && !ue ? We.push({
                _level: Ye,
                _override: 0,
                _isolate: 0
              }) : B || ue++;
            } else if (Ae & (F | G)) {
              xe[Re] = Ue._level;
              var kt = (Ae === F ? ct : st)(Ue._level);
              kt <= Te && !B && !ue ? We.push({
                _level: kt,
                _override: Ae & F ? L : b,
                _isolate: 0
              }) : B || ue++;
            } else if (Ae & n) {
              Ae & X && (Ae = Ii(Re + 1, !0) === 1 ? se : Y), xe[Re] = Ue._level, Ue._override && Ee(Re, Ue._override);
              var at = (Ae === se ? ct : st)(Ue._level);
              at <= Te && B === 0 && ue === 0 ? (Pe++, We.push({
                _level: at,
                _override: 0,
                _isolate: 1,
                _isolInitIndex: Re
              })) : B++;
            } else if (Ae & q) {
              if (B > 0)
                B--;
              else if (Pe > 0) {
                for (ue = 0; !We[We.length - 1]._isolate; )
                  We.pop();
                var Xe = We[We.length - 1]._isolInitIndex;
                Xe != null && (tt.set(Xe, Re), tt.set(Re, Xe)), We.pop(), Pe--;
              }
              Ue = We[We.length - 1], xe[Re] = Ue._level, Ue._override && Ee(Re, Ue._override);
            } else
              Ae & $ ? (B === 0 && (ue > 0 ? ue-- : !Ue._isolate && We.length > 1 && (We.pop(), Ue = We[We.length - 1])), xe[Re] = Ue._level) : Ae & N && (xe[Re] = Le.level);
          else
            xe[Re] = Ue._level, Ue._override && Ae !== ce && Ee(Re, Ue._override);
        }
        for (var nt = [], et = null, ze = Le.start; ze <= Le.end; ze++) {
          var rt = le[ze];
          if (!(rt & l)) {
            var pt = xe[ze], vt = rt & n, Et = rt === q;
            et && pt === et._level ? (et._end = ze, et._endsWithIsolInit = vt) : nt.push(et = {
              _start: ze,
              _end: ze,
              _level: pt,
              _startsWithPDI: Et,
              _endsWithIsolInit: vt
            });
          }
        }
        for (var pn = [], Kn = 0; Kn < nt.length; Kn++) {
          var mn = nt[Kn];
          if (!mn._startsWithPDI || mn._startsWithPDI && !tt.has(mn._start)) {
            for (var rr = [et = mn], vn = void 0; et && et._endsWithIsolInit && (vn = tt.get(et._end)) != null; )
              for (var Yn = Kn + 1; Yn < nt.length; Yn++)
                if (nt[Yn]._start === vn) {
                  rr.push(et = nt[Yn]);
                  break;
                }
            for (var Gt = [], xr = 0; xr < rr.length; xr++)
              for (var xs = rr[xr], _o = xs._start; _o <= xs._end; _o++)
                Gt.push(_o);
            for (var qa = xe[Gt[0]], Ss = Le.level, ei = Gt[0] - 1; ei >= 0; ei--)
              if (!(le[ei] & l)) {
                Ss = xe[ei];
                break;
              }
            var To = Gt[Gt.length - 1], Za = xe[To], ws = Le.level;
            if (!(le[To] & n)) {
              for (var Pi = To + 1; Pi <= Le.end; Pi++)
                if (!(le[Pi] & l)) {
                  ws = xe[Pi];
                  break;
                }
            }
            pn.push({
              _seqIndices: Gt,
              _sosType: Math.max(Ss, qa) % 2 ? L : b,
              _eosType: Math.max(ws, Za) % 2 ? L : b
            });
          }
        }
        for (var Eo = 0; Eo < pn.length; Eo++) {
          var Ao = pn[Eo], ke = Ao._seqIndices, Qn = Ao._sosType, Co = Ao._eosType, ir = xe[ke[0]] & 1 ? L : b;
          if (_e.get(K))
            for (var Mi = 0; Mi < ke.length; Mi++) {
              var bi = ke[Mi];
              if (le[bi] & K) {
                for (var or = Qn, gn = Mi - 1; gn >= 0; gn--)
                  if (!(le[ke[gn]] & l)) {
                    or = le[ke[gn]];
                    break;
                  }
                Ee(bi, or & (n | q) ? Z : or);
              }
            }
          if (_e.get(U))
            for (var lt = 0; lt < ke.length; lt++) {
              var ut = ke[lt];
              if (le[ut] & U)
                for (var yn = lt - 1; yn >= -1; yn--) {
                  var Ut = yn === -1 ? Qn : le[ke[yn]];
                  if (Ut & o) {
                    Ut === V && Ee(ut, k);
                    break;
                  }
                }
            }
          if (_e.get(V))
            for (var It = 0; It < ke.length; It++) {
              var sr = ke[It];
              le[sr] & V && Ee(sr, L);
            }
          if (_e.get(R) || _e.get(O))
            for (var bn = 1; bn < ke.length - 1; bn++) {
              var Ot = ke[bn];
              if (le[Ot] & (R | O)) {
                for (var qn = 0, Li = 0, Ri = bn - 1; Ri >= 0 && (qn = le[ke[Ri]], !!(qn & l)); Ri--)
                  ;
                for (var Fr = bn + 1; Fr < ke.length && (Li = le[ke[Fr]], !!(Li & l)); Fr++)
                  ;
                qn === Li && (le[Ot] === R ? qn === U : qn & (U | k)) && Ee(Ot, qn);
              }
            }
          if (_e.get(U))
            for (var xn = 0; xn < ke.length; xn++) {
              var Sn = ke[xn];
              if (le[Sn] & U) {
                for (var ki = xn - 1; ki >= 0 && le[ke[ki]] & (I | l); ki--)
                  Ee(ke[ki], U);
                for (xn++; xn < ke.length && le[ke[xn]] & (I | l | U); xn++)
                  le[ke[xn]] !== U && Ee(ke[xn], U);
              }
            }
          if (_e.get(I) || _e.get(R) || _e.get(O))
            for (var ti = 0; ti < ke.length; ti++) {
              var _s = ke[ti];
              if (le[_s] & (I | R | O)) {
                Ee(_s, Z);
                for (var Sr = ti - 1; Sr >= 0 && le[ke[Sr]] & l; Sr--)
                  Ee(ke[Sr], Z);
                for (var wr = ti + 1; wr < ke.length && le[ke[wr]] & l; wr++)
                  Ee(ke[wr], Z);
              }
            }
          if (_e.get(U))
            for (var _r = 0, ni = Qn; _r < ke.length; _r++) {
              var Ts = ke[_r], Po = le[Ts];
              Po & U ? ni === b && Ee(Ts, b) : Po & o && (ni = Po);
            }
          if (_e.get(u)) {
            var Tr = L | U | k, Ui = Tr | b, ar = [];
            {
              for (var Ir = [], lr = 0; lr < ke.length; lr++)
                if (le[ke[lr]] & u) {
                  var Je = de[ke[lr]], Mo = void 0;
                  if (C(Je) !== null)
                    if (Ir.length < 63)
                      Ir.push({ char: Je, seqIndex: lr });
                    else
                      break;
                  else if ((Mo = P(Je)) !== null)
                    for (var Er = Ir.length - 1; Er >= 0; Er--) {
                      var Di = Ir[Er].char;
                      if (Di === Mo || Di === P(M(Je)) || C(M(Di)) === Je) {
                        ar.push([Ir[Er].seqIndex, lr]), Ir.length = Er;
                        break;
                      }
                    }
                }
              ar.sort(function(Bt, rn) {
                return Bt[0] - rn[0];
              });
            }
            for (var bo = 0; bo < ar.length; bo++) {
              for (var Es = ar[bo], gt = Es[0], ri = Es[1], As = !1, en = 0, Lo = gt + 1; Lo < ri; Lo++) {
                var ii = ke[Lo];
                if (le[ii] & Ui) {
                  As = !0;
                  var wn = le[ii] & Tr ? L : b;
                  if (wn === ir) {
                    en = wn;
                    break;
                  }
                }
              }
              if (As && !en) {
                en = Qn;
                for (var Ro = gt - 1; Ro >= 0; Ro--) {
                  var Cs = ke[Ro];
                  if (le[Cs] & Ui) {
                    var _n = le[Cs] & Tr ? L : b;
                    _n !== ir ? en = _n : en = ir;
                    break;
                  }
                }
              }
              if (en) {
                if (le[ke[gt]] = le[ke[ri]] = en, en !== ir) {
                  for (var tn = gt + 1; tn < ke.length; tn++)
                    if (!(le[ke[tn]] & l)) {
                      v(de[ke[tn]]) & K && (le[ke[tn]] = en);
                      break;
                    }
                }
                if (en !== ir) {
                  for (var ur = ri + 1; ur < ke.length; ur++)
                    if (!(le[ke[ur]] & l)) {
                      v(de[ke[ur]]) & K && (le[ke[ur]] = en);
                      break;
                    }
                }
              }
            }
            for (var Ln = 0; Ln < ke.length; Ln++)
              if (le[ke[Ln]] & u) {
                for (var ko = Ln, Uo = Ln, un = Qn, oi = Ln - 1; oi >= 0; oi--)
                  if (le[ke[oi]] & l)
                    ko = oi;
                  else {
                    un = le[ke[oi]] & Tr ? L : b;
                    break;
                  }
                for (var si = Co, ai = Ln + 1; ai < ke.length; ai++)
                  if (le[ke[ai]] & (u | l))
                    Uo = ai;
                  else {
                    si = le[ke[ai]] & Tr ? L : b;
                    break;
                  }
                for (var nn = ko; nn <= Uo; nn++)
                  le[ke[nn]] = un === si ? un : ir;
                Ln = Uo;
              }
          }
        }
        for (var Nt = Le.start; Nt <= Le.end; Nt++) {
          var Fi = xe[Nt], Zn = le[Nt];
          if (Fi & 1 ? Zn & (b | U | k) && xe[Nt]++ : Zn & L ? xe[Nt]++ : Zn & (k | U) && (xe[Nt] += 2), Zn & l && (xe[Nt] = Nt === 0 ? Le.level : xe[Nt - 1]), Nt === Le.end || v(de[Nt]) & (J | N))
            for (var Or = Nt; Or >= 0 && v(de[Or]) & f; Or--)
              xe[Or] = Le.level;
        }
      }
      return {
        levels: xe,
        paragraphs: be
      };
      function Ii(Bt, rn) {
        for (var At = Bt; At < de.length; At++) {
          var Ct = le[At];
          if (Ct & (L | V))
            return 1;
          if (Ct & (N | b) || rn && Ct === q)
            return 0;
          if (Ct & n) {
            var Tn = Ps(At);
            At = Tn === -1 ? de.length : Tn;
          }
        }
        return 0;
      }
      function Ps(Bt) {
        for (var rn = 1, At = Bt + 1; At < de.length; At++) {
          var Ct = le[At];
          if (Ct & N)
            break;
          if (Ct & q) {
            if (--rn === 0)
              return At;
          } else
            Ct & n && rn++;
        }
        return -1;
      }
    }
    var pe = "14>1,j>2,t>2,u>2,1a>g,2v3>1,1>1,1ge>1,1wd>1,b>1,1j>1,f>1,ai>3,-2>3,+1,8>1k0,-1jq>1y7,-1y6>1hf,-1he>1h6,-1h5>1ha,-1h8>1qi,-1pu>1,6>3u,-3s>7,6>1,1>1,f>1,1>1,+2,3>1,1>1,+13,4>1,1>1,6>1eo,-1ee>1,3>1mg,-1me>1mk,-1mj>1mi,-1mg>1mi,-1md>1,1>1,+2,1>10k,-103>1,1>1,4>1,5>1,1>1,+10,3>1,1>8,-7>8,+1,-6>7,+1,a>1,1>1,u>1,u6>1,1>1,+5,26>1,1>1,2>1,2>2,8>1,7>1,4>1,1>1,+5,b8>1,1>1,+3,1>3,-2>1,2>1,1>1,+2,c>1,3>1,1>1,+2,h>1,3>1,a>1,1>1,2>1,3>1,1>1,d>1,f>1,3>1,1a>1,1>1,6>1,7>1,13>1,k>1,1>1,+19,4>1,1>1,+2,2>1,1>1,+18,m>1,a>1,1>1,lk>1,1>1,4>1,2>1,f>1,3>1,1>1,+3,db>1,1>1,+3,3>1,1>1,+2,14qm>1,1>1,+1,6>1,4j>1,j>2,t>2,u>2,2>1,+1", ae;
    function ie() {
      if (!ae) {
        var de = E(pe, !0), Me = de.map, Te = de.reverseMap;
        Te.forEach(function(le, je) {
          Me.set(je, le);
        }), ae = Me;
      }
    }
    function fe(de) {
      return ie(), ae.get(de) || null;
    }
    function ve(de, Me, Te, le) {
      var je = de.length;
      Te = Math.max(0, Te == null ? 0 : +Te), le = Math.min(je - 1, le == null ? je - 1 : +le);
      for (var _e = /* @__PURE__ */ new Map(), Ee = Te; Ee <= le; Ee++)
        if (Me[Ee] & 1) {
          var xe = fe(de[Ee]);
          xe !== null && _e.set(Ee, xe);
        }
      return _e;
    }
    function me(de, Me, Te, le) {
      var je = de.length;
      Te = Math.max(0, Te == null ? 0 : +Te), le = Math.min(je - 1, le == null ? je - 1 : +le);
      var _e = [];
      return Me.paragraphs.forEach(function(Ee) {
        var xe = Math.max(Te, Ee.start), tt = Math.min(le, Ee.end);
        if (xe < tt) {
          for (var be = Me.levels.slice(xe, tt + 1), Le = tt; Le >= xe && v(de[Le]) & f; Le--)
            be[Le] = Ee.level;
          for (var Oe = Ee.level, Ge = 1 / 0, st = 0; st < be.length; st++) {
            var ct = be[st];
            ct > Oe && (Oe = ct), ct < Ge && (Ge = ct | 1);
          }
          for (var Ke = Oe; Ke >= Ge; Ke--)
            for (var We = 0; We < be.length; We++)
              if (be[We] >= Ke) {
                for (var Ue = We; We + 1 < be.length && be[We + 1] >= Ke; )
                  We++;
                We > Ue && _e.push([Ue + xe, We + xe]);
              }
        }
      }), _e;
    }
    function we(de, Me, Te, le) {
      var je = Fe(de, Me, Te, le), _e = [].concat(de);
      return je.forEach(function(Ee, xe) {
        _e[xe] = (Me.levels[Ee] & 1 ? fe(de[Ee]) : null) || de[Ee];
      }), _e.join("");
    }
    function Fe(de, Me, Te, le) {
      for (var je = me(de, Me, Te, le), _e = [], Ee = 0; Ee < de.length; Ee++)
        _e[Ee] = Ee;
      return je.forEach(function(xe) {
        for (var tt = xe[0], be = xe[1], Le = _e.slice(tt, be + 1), Oe = Le.length; Oe--; )
          _e[be - Oe] = Le[Oe];
      }), _e;
    }
    return e.closingToOpeningBracket = P, e.getBidiCharType = v, e.getBidiCharTypeName = g, e.getCanonicalBracket = M, e.getEmbeddingLevels = re, e.getMirroredCharacter = fe, e.getMirroredCharactersMap = ve, e.getReorderSegments = me, e.getReorderedIndices = Fe, e.getReorderedString = we, e.openingToClosingBracket = C, Object.defineProperty(e, "__esModule", { value: !0 }), e;
  }({});
  return c;
}
const Kh = /\bvoid\s+main\s*\(\s*\)\s*{/g;
function Fu(c) {
  const e = /^[ \t]*#include +<([\w\d./]+)>/gm;
  function s(a, r) {
    let n = Dm[r];
    return n ? Fu(n) : a;
  }
  return c.replace(e, s);
}
const Kt = [];
for (let c = 0; c < 256; c++)
  Kt[c] = (c < 16 ? "0" : "") + c.toString(16);
function m0() {
  const c = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, s = Math.random() * 4294967295 | 0, a = Math.random() * 4294967295 | 0;
  return (Kt[c & 255] + Kt[c >> 8 & 255] + Kt[c >> 16 & 255] + Kt[c >> 24 & 255] + "-" + Kt[e & 255] + Kt[e >> 8 & 255] + "-" + Kt[e >> 16 & 15 | 64] + Kt[e >> 24 & 255] + "-" + Kt[s & 63 | 128] + Kt[s >> 8 & 255] + "-" + Kt[s >> 16 & 255] + Kt[s >> 24 & 255] + Kt[a & 255] + Kt[a >> 8 & 255] + Kt[a >> 16 & 255] + Kt[a >> 24 & 255]).toUpperCase();
}
const yi = Object.assign || function() {
  let c = arguments[0];
  for (let e = 1, s = arguments.length; e < s; e++) {
    let a = arguments[e];
    if (a)
      for (let r in a)
        Object.prototype.hasOwnProperty.call(a, r) && (c[r] = a[r]);
  }
  return c;
}, v0 = Date.now(), Cd = /* @__PURE__ */ new WeakMap(), Pd = /* @__PURE__ */ new Map();
let g0 = 1e10;
function Iu(c, e) {
  const s = w0(e);
  let a = Cd.get(c);
  if (a || Cd.set(c, a = /* @__PURE__ */ Object.create(null)), a[s])
    return new a[s]();
  const r = `_onBeforeCompile${s}`, n = function(f, d) {
    c.onBeforeCompile.call(this, f, d);
    const p = this.customProgramCacheKey() + "|" + f.vertexShader + "|" + f.fragmentShader;
    let v = Pd[p];
    if (!v) {
      const g = y0(this, f, e, s);
      v = Pd[p] = g;
    }
    f.vertexShader = v.vertexShader, f.fragmentShader = v.fragmentShader, yi(f.uniforms, this.uniforms), e.timeUniform && (f.uniforms[e.timeUniform] = {
      get value() {
        return Date.now() - v0;
      }
    }), this[r] && this[r](f);
  }, o = function() {
    return u(e.chained ? c : c.clone());
  }, u = function(f) {
    const d = Object.create(f, l);
    return Object.defineProperty(d, "baseMaterial", { value: c }), Object.defineProperty(d, "id", { value: g0++ }), d.uuid = m0(), d.uniforms = yi({}, f.uniforms, e.uniforms), d.defines = yi({}, f.defines, e.defines), d.defines[`TROIKA_DERIVED_MATERIAL_${s}`] = "", d.extensions = yi({}, f.extensions, e.extensions), d._listeners = void 0, d;
  }, l = {
    constructor: { value: o },
    isDerivedMaterial: { value: !0 },
    type: {
      get: () => c.type,
      set: (f) => {
        c.type = f;
      }
    },
    isDerivedFrom: {
      writable: !0,
      configurable: !0,
      value: function(f) {
        const d = this.baseMaterial;
        return f === d || d.isDerivedMaterial && d.isDerivedFrom(f) || !1;
      }
    },
    customProgramCacheKey: {
      writable: !0,
      configurable: !0,
      value: function() {
        return c.customProgramCacheKey() + "|" + s;
      }
    },
    onBeforeCompile: {
      get() {
        return n;
      },
      set(f) {
        this[r] = f;
      }
    },
    copy: {
      writable: !0,
      configurable: !0,
      value: function(f) {
        return c.copy.call(this, f), !c.isShaderMaterial && !c.isDerivedMaterial && (yi(this.extensions, f.extensions), yi(this.defines, f.defines), yi(this.uniforms, Ha.clone(f.uniforms))), this;
      }
    },
    clone: {
      writable: !0,
      configurable: !0,
      value: function() {
        const f = new c.constructor();
        return u(f).copy(this);
      }
    },
    /**
     * Utility to get a MeshDepthMaterial that will honor this derived material's vertex
     * transformations and discarded fragments.
     */
    getDepthMaterial: {
      writable: !0,
      configurable: !0,
      value: function() {
        let f = this._depthMaterial;
        return f || (f = this._depthMaterial = Iu(
          c.isDerivedMaterial ? c.getDepthMaterial() : new Rm({ depthPacking: km }),
          e
        ), f.defines.IS_DEPTH_MATERIAL = "", f.uniforms = this.uniforms), f;
      }
    },
    /**
     * Utility to get a MeshDistanceMaterial that will honor this derived material's vertex
     * transformations and discarded fragments.
     */
    getDistanceMaterial: {
      writable: !0,
      configurable: !0,
      value: function() {
        let f = this._distanceMaterial;
        return f || (f = this._distanceMaterial = Iu(
          c.isDerivedMaterial ? c.getDistanceMaterial() : new Um(),
          e
        ), f.defines.IS_DISTANCE_MATERIAL = "", f.uniforms = this.uniforms), f;
      }
    },
    dispose: {
      writable: !0,
      configurable: !0,
      value() {
        const { _depthMaterial: f, _distanceMaterial: d } = this;
        f && f.dispose(), d && d.dispose(), c.dispose.call(this);
      }
    }
  };
  return a[s] = o, new o();
}
function y0(c, { vertexShader: e, fragmentShader: s }, a, r) {
  let {
    vertexDefs: n,
    vertexMainIntro: o,
    vertexMainOutro: u,
    vertexTransform: l,
    fragmentDefs: f,
    fragmentMainIntro: d,
    fragmentMainOutro: p,
    fragmentColorTransform: v,
    customRewriter: g,
    timeUniform: x
  } = a;
  if (n = n || "", o = o || "", u = u || "", f = f || "", d = d || "", p = p || "", (l || g) && (e = Fu(e)), (v || g) && (s = s.replace(
    /^[ \t]*#include <((?:tonemapping|encodings|colorspace|fog|premultiplied_alpha|dithering)_fragment)>/gm,
    `
//!BEGIN_POST_CHUNK $1
$&
//!END_POST_CHUNK
`
  ), s = Fu(s)), g) {
    let E = g({ vertexShader: e, fragmentShader: s });
    e = E.vertexShader, s = E.fragmentShader;
  }
  if (v) {
    let E = [];
    s = s.replace(
      /^\/\/!BEGIN_POST_CHUNK[^]+?^\/\/!END_POST_CHUNK/gm,
      // [^]+? = non-greedy match of any chars including newlines
      (_) => (E.push(_), "")
    ), p = `${v}
${E.join(`
`)}
${p}`;
  }
  if (x) {
    const E = `
uniform float ${x};
`;
    n = E + n, f = E + f;
  }
  return l && (e = `vec3 troika_position_${r};
vec3 troika_normal_${r};
vec2 troika_uv_${r};
${e}
`, n = `${n}
void troikaVertexTransform${r}(inout vec3 position, inout vec3 normal, inout vec2 uv) {
  ${l}
}
`, o = `
troika_position_${r} = vec3(position);
troika_normal_${r} = vec3(normal);
troika_uv_${r} = vec2(uv);
troikaVertexTransform${r}(troika_position_${r}, troika_normal_${r}, troika_uv_${r});
${o}
`, e = e.replace(/\b(position|normal|uv)\b/g, (E, _, S, A) => /\battribute\s+vec[23]\s+$/.test(A.substr(0, S)) ? _ : `troika_${_}_${r}`), c.map && c.map.channel > 0 || (e = e.replace(/\bMAP_UV\b/g, `troika_uv_${r}`))), e = Md(e, r, n, o, u), s = Md(s, r, f, d, p), {
    vertexShader: e,
    fragmentShader: s
  };
}
function Md(c, e, s, a, r) {
  return (a || r || s) && (c = c.replace(
    Kh,
    `
${s}
void troikaOrigMain${e}() {`
  ), c += `
void main() {
  ${a}
  troikaOrigMain${e}();
  ${r}
}`), c;
}
function x0(c, e) {
  return c === "uniforms" ? void 0 : typeof e == "function" ? e.toString() : e;
}
let S0 = 0;
const bd = /* @__PURE__ */ new Map();
function w0(c) {
  const e = JSON.stringify(c, x0);
  let s = bd.get(e);
  return s == null && bd.set(e, s = ++S0), s;
}
/*!
Custom build of Typr.ts (https://github.com/fredli74/Typr.ts) for use in Troika text rendering.
Original MIT license applies: https://github.com/fredli74/Typr.ts/blob/master/LICENSE
*/
function _0() {
  return typeof window > "u" && (self.window = self), function(c) {
    var e = { parse: function(r) {
      var n = e._bin, o = new Uint8Array(r);
      if (n.readASCII(o, 0, 4) == "ttcf") {
        var u = 4;
        n.readUshort(o, u), u += 2, n.readUshort(o, u), u += 2;
        var l = n.readUint(o, u);
        u += 4;
        for (var f = [], d = 0; d < l; d++) {
          var p = n.readUint(o, u);
          u += 4, f.push(e._readFont(o, p));
        }
        return f;
      }
      return [e._readFont(o, 0)];
    }, _readFont: function(r, n) {
      var o = e._bin, u = n;
      o.readFixed(r, n), n += 4;
      var l = o.readUshort(r, n);
      n += 2, o.readUshort(r, n), n += 2, o.readUshort(r, n), n += 2, o.readUshort(r, n), n += 2;
      for (var f = ["cmap", "head", "hhea", "maxp", "hmtx", "name", "OS/2", "post", "loca", "glyf", "kern", "CFF ", "GDEF", "GPOS", "GSUB", "SVG "], d = { _data: r, _offset: u }, p = {}, v = 0; v < l; v++) {
        var g = o.readASCII(r, n, 4);
        n += 4, o.readUint(r, n), n += 4;
        var x = o.readUint(r, n);
        n += 4;
        var E = o.readUint(r, n);
        n += 4, p[g] = { offset: x, length: E };
      }
      for (v = 0; v < f.length; v++) {
        var _ = f[v];
        p[_] && (d[_.trim()] = e[_.trim()].parse(r, p[_].offset, p[_].length, d));
      }
      return d;
    }, _tabOffset: function(r, n, o) {
      for (var u = e._bin, l = u.readUshort(r, o + 4), f = o + 12, d = 0; d < l; d++) {
        var p = u.readASCII(r, f, 4);
        f += 4, u.readUint(r, f), f += 4;
        var v = u.readUint(r, f);
        if (f += 4, u.readUint(r, f), f += 4, p == n)
          return v;
      }
      return 0;
    } };
    e._bin = { readFixed: function(r, n) {
      return (r[n] << 8 | r[n + 1]) + (r[n + 2] << 8 | r[n + 3]) / 65540;
    }, readF2dot14: function(r, n) {
      return e._bin.readShort(r, n) / 16384;
    }, readInt: function(r, n) {
      return e._bin._view(r).getInt32(n);
    }, readInt8: function(r, n) {
      return e._bin._view(r).getInt8(n);
    }, readShort: function(r, n) {
      return e._bin._view(r).getInt16(n);
    }, readUshort: function(r, n) {
      return e._bin._view(r).getUint16(n);
    }, readUshorts: function(r, n, o) {
      for (var u = [], l = 0; l < o; l++)
        u.push(e._bin.readUshort(r, n + 2 * l));
      return u;
    }, readUint: function(r, n) {
      return e._bin._view(r).getUint32(n);
    }, readUint64: function(r, n) {
      return 4294967296 * e._bin.readUint(r, n) + e._bin.readUint(r, n + 4);
    }, readASCII: function(r, n, o) {
      for (var u = "", l = 0; l < o; l++)
        u += String.fromCharCode(r[n + l]);
      return u;
    }, readUnicode: function(r, n, o) {
      for (var u = "", l = 0; l < o; l++) {
        var f = r[n++] << 8 | r[n++];
        u += String.fromCharCode(f);
      }
      return u;
    }, _tdec: typeof window < "u" && window.TextDecoder ? new window.TextDecoder() : null, readUTF8: function(r, n, o) {
      var u = e._bin._tdec;
      return u && n == 0 && o == r.length ? u.decode(r) : e._bin.readASCII(r, n, o);
    }, readBytes: function(r, n, o) {
      for (var u = [], l = 0; l < o; l++)
        u.push(r[n + l]);
      return u;
    }, readASCIIArray: function(r, n, o) {
      for (var u = [], l = 0; l < o; l++)
        u.push(String.fromCharCode(r[n + l]));
      return u;
    }, _view: function(r) {
      return r._dataView || (r._dataView = r.buffer ? new DataView(r.buffer, r.byteOffset, r.byteLength) : new DataView(new Uint8Array(r).buffer));
    } }, e._lctf = {}, e._lctf.parse = function(r, n, o, u, l) {
      var f = e._bin, d = {}, p = n;
      f.readFixed(r, n), n += 4;
      var v = f.readUshort(r, n);
      n += 2;
      var g = f.readUshort(r, n);
      n += 2;
      var x = f.readUshort(r, n);
      return n += 2, d.scriptList = e._lctf.readScriptList(r, p + v), d.featureList = e._lctf.readFeatureList(r, p + g), d.lookupList = e._lctf.readLookupList(r, p + x, l), d;
    }, e._lctf.readLookupList = function(r, n, o) {
      var u = e._bin, l = n, f = [], d = u.readUshort(r, n);
      n += 2;
      for (var p = 0; p < d; p++) {
        var v = u.readUshort(r, n);
        n += 2;
        var g = e._lctf.readLookupTable(r, l + v, o);
        f.push(g);
      }
      return f;
    }, e._lctf.readLookupTable = function(r, n, o) {
      var u = e._bin, l = n, f = { tabs: [] };
      f.ltype = u.readUshort(r, n), n += 2, f.flag = u.readUshort(r, n), n += 2;
      var d = u.readUshort(r, n);
      n += 2;
      for (var p = f.ltype, v = 0; v < d; v++) {
        var g = u.readUshort(r, n);
        n += 2;
        var x = o(r, p, l + g, f);
        f.tabs.push(x);
      }
      return f;
    }, e._lctf.numOfOnes = function(r) {
      for (var n = 0, o = 0; o < 32; o++)
        r >>> o & 1 && n++;
      return n;
    }, e._lctf.readClassDef = function(r, n) {
      var o = e._bin, u = [], l = o.readUshort(r, n);
      if (n += 2, l == 1) {
        var f = o.readUshort(r, n);
        n += 2;
        var d = o.readUshort(r, n);
        n += 2;
        for (var p = 0; p < d; p++)
          u.push(f + p), u.push(f + p), u.push(o.readUshort(r, n)), n += 2;
      }
      if (l == 2) {
        var v = o.readUshort(r, n);
        for (n += 2, p = 0; p < v; p++)
          u.push(o.readUshort(r, n)), n += 2, u.push(o.readUshort(r, n)), n += 2, u.push(o.readUshort(r, n)), n += 2;
      }
      return u;
    }, e._lctf.getInterval = function(r, n) {
      for (var o = 0; o < r.length; o += 3) {
        var u = r[o], l = r[o + 1];
        if (r[o + 2], u <= n && n <= l)
          return o;
      }
      return -1;
    }, e._lctf.readCoverage = function(r, n) {
      var o = e._bin, u = {};
      u.fmt = o.readUshort(r, n), n += 2;
      var l = o.readUshort(r, n);
      return n += 2, u.fmt == 1 && (u.tab = o.readUshorts(r, n, l)), u.fmt == 2 && (u.tab = o.readUshorts(r, n, 3 * l)), u;
    }, e._lctf.coverageIndex = function(r, n) {
      var o = r.tab;
      if (r.fmt == 1)
        return o.indexOf(n);
      if (r.fmt == 2) {
        var u = e._lctf.getInterval(o, n);
        if (u != -1)
          return o[u + 2] + (n - o[u]);
      }
      return -1;
    }, e._lctf.readFeatureList = function(r, n) {
      var o = e._bin, u = n, l = [], f = o.readUshort(r, n);
      n += 2;
      for (var d = 0; d < f; d++) {
        var p = o.readASCII(r, n, 4);
        n += 4;
        var v = o.readUshort(r, n);
        n += 2;
        var g = e._lctf.readFeatureTable(r, u + v);
        g.tag = p.trim(), l.push(g);
      }
      return l;
    }, e._lctf.readFeatureTable = function(r, n) {
      var o = e._bin, u = n, l = {}, f = o.readUshort(r, n);
      n += 2, f > 0 && (l.featureParams = u + f);
      var d = o.readUshort(r, n);
      n += 2, l.tab = [];
      for (var p = 0; p < d; p++)
        l.tab.push(o.readUshort(r, n + 2 * p));
      return l;
    }, e._lctf.readScriptList = function(r, n) {
      var o = e._bin, u = n, l = {}, f = o.readUshort(r, n);
      n += 2;
      for (var d = 0; d < f; d++) {
        var p = o.readASCII(r, n, 4);
        n += 4;
        var v = o.readUshort(r, n);
        n += 2, l[p.trim()] = e._lctf.readScriptTable(r, u + v);
      }
      return l;
    }, e._lctf.readScriptTable = function(r, n) {
      var o = e._bin, u = n, l = {}, f = o.readUshort(r, n);
      n += 2, f > 0 && (l.default = e._lctf.readLangSysTable(r, u + f));
      var d = o.readUshort(r, n);
      n += 2;
      for (var p = 0; p < d; p++) {
        var v = o.readASCII(r, n, 4);
        n += 4;
        var g = o.readUshort(r, n);
        n += 2, l[v.trim()] = e._lctf.readLangSysTable(r, u + g);
      }
      return l;
    }, e._lctf.readLangSysTable = function(r, n) {
      var o = e._bin, u = {};
      o.readUshort(r, n), n += 2, u.reqFeature = o.readUshort(r, n), n += 2;
      var l = o.readUshort(r, n);
      return n += 2, u.features = o.readUshorts(r, n, l), u;
    }, e.CFF = {}, e.CFF.parse = function(r, n, o) {
      var u = e._bin;
      (r = new Uint8Array(r.buffer, n, o))[n = 0], r[++n], r[++n], r[++n], n++;
      var l = [];
      n = e.CFF.readIndex(r, n, l);
      for (var f = [], d = 0; d < l.length - 1; d++)
        f.push(u.readASCII(r, n + l[d], l[d + 1] - l[d]));
      n += l[l.length - 1];
      var p = [];
      n = e.CFF.readIndex(r, n, p);
      var v = [];
      for (d = 0; d < p.length - 1; d++)
        v.push(e.CFF.readDict(r, n + p[d], n + p[d + 1]));
      n += p[p.length - 1];
      var g = v[0], x = [];
      n = e.CFF.readIndex(r, n, x);
      var E = [];
      for (d = 0; d < x.length - 1; d++)
        E.push(u.readASCII(r, n + x[d], x[d + 1] - x[d]));
      if (n += x[x.length - 1], e.CFF.readSubrs(r, n, g), g.CharStrings) {
        n = g.CharStrings, x = [], n = e.CFF.readIndex(r, n, x);
        var _ = [];
        for (d = 0; d < x.length - 1; d++)
          _.push(u.readBytes(r, n + x[d], x[d + 1] - x[d]));
        g.CharStrings = _;
      }
      if (g.ROS) {
        n = g.FDArray;
        var S = [];
        for (n = e.CFF.readIndex(r, n, S), g.FDArray = [], d = 0; d < S.length - 1; d++) {
          var A = e.CFF.readDict(r, n + S[d], n + S[d + 1]);
          e.CFF._readFDict(r, A, E), g.FDArray.push(A);
        }
        n += S[S.length - 1], n = g.FDSelect, g.FDSelect = [];
        var T = r[n];
        if (n++, T != 3)
          throw T;
        var C = u.readUshort(r, n);
        for (n += 2, d = 0; d < C + 1; d++)
          g.FDSelect.push(u.readUshort(r, n), r[n + 2]), n += 3;
      }
      return g.Encoding && (g.Encoding = e.CFF.readEncoding(r, g.Encoding, g.CharStrings.length)), g.charset && (g.charset = e.CFF.readCharset(r, g.charset, g.CharStrings.length)), e.CFF._readFDict(r, g, E), g;
    }, e.CFF._readFDict = function(r, n, o) {
      var u;
      for (var l in n.Private && (u = n.Private[1], n.Private = e.CFF.readDict(r, u, u + n.Private[0]), n.Private.Subrs && e.CFF.readSubrs(r, u + n.Private.Subrs, n.Private)), n)
        ["FamilyName", "FontName", "FullName", "Notice", "version", "Copyright"].indexOf(l) != -1 && (n[l] = o[n[l] - 426 + 35]);
    }, e.CFF.readSubrs = function(r, n, o) {
      var u = e._bin, l = [];
      n = e.CFF.readIndex(r, n, l);
      var f, d = l.length;
      f = d < 1240 ? 107 : d < 33900 ? 1131 : 32768, o.Bias = f, o.Subrs = [];
      for (var p = 0; p < l.length - 1; p++)
        o.Subrs.push(u.readBytes(r, n + l[p], l[p + 1] - l[p]));
    }, e.CFF.tableSE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 0, 111, 112, 113, 114, 0, 115, 116, 117, 118, 119, 120, 121, 122, 0, 123, 0, 124, 125, 126, 127, 128, 129, 130, 131, 0, 132, 133, 0, 134, 135, 136, 137, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 138, 0, 139, 0, 0, 0, 0, 140, 141, 142, 143, 0, 0, 0, 0, 0, 144, 0, 0, 0, 145, 0, 0, 146, 147, 148, 149, 0, 0, 0, 0], e.CFF.glyphByUnicode = function(r, n) {
      for (var o = 0; o < r.charset.length; o++)
        if (r.charset[o] == n)
          return o;
      return -1;
    }, e.CFF.glyphBySE = function(r, n) {
      return n < 0 || n > 255 ? -1 : e.CFF.glyphByUnicode(r, e.CFF.tableSE[n]);
    }, e.CFF.readEncoding = function(r, n, o) {
      e._bin;
      var u = [".notdef"], l = r[n];
      if (n++, l != 0)
        throw "error: unknown encoding format: " + l;
      var f = r[n];
      n++;
      for (var d = 0; d < f; d++)
        u.push(r[n + d]);
      return u;
    }, e.CFF.readCharset = function(r, n, o) {
      var u = e._bin, l = [".notdef"], f = r[n];
      if (n++, f == 0)
        for (var d = 0; d < o; d++) {
          var p = u.readUshort(r, n);
          n += 2, l.push(p);
        }
      else {
        if (f != 1 && f != 2)
          throw "error: format: " + f;
        for (; l.length < o; ) {
          p = u.readUshort(r, n), n += 2;
          var v = 0;
          for (f == 1 ? (v = r[n], n++) : (v = u.readUshort(r, n), n += 2), d = 0; d <= v; d++)
            l.push(p), p++;
        }
      }
      return l;
    }, e.CFF.readIndex = function(r, n, o) {
      var u = e._bin, l = u.readUshort(r, n) + 1, f = r[n += 2];
      if (n++, f == 1)
        for (var d = 0; d < l; d++)
          o.push(r[n + d]);
      else if (f == 2)
        for (d = 0; d < l; d++)
          o.push(u.readUshort(r, n + 2 * d));
      else if (f == 3)
        for (d = 0; d < l; d++)
          o.push(16777215 & u.readUint(r, n + 3 * d - 1));
      else if (l != 1)
        throw "unsupported offset size: " + f + ", count: " + l;
      return (n += l * f) - 1;
    }, e.CFF.getCharString = function(r, n, o) {
      var u = e._bin, l = r[n], f = r[n + 1];
      r[n + 2], r[n + 3], r[n + 4];
      var d = 1, p = null, v = null;
      l <= 20 && (p = l, d = 1), l == 12 && (p = 100 * l + f, d = 2), 21 <= l && l <= 27 && (p = l, d = 1), l == 28 && (v = u.readShort(r, n + 1), d = 3), 29 <= l && l <= 31 && (p = l, d = 1), 32 <= l && l <= 246 && (v = l - 139, d = 1), 247 <= l && l <= 250 && (v = 256 * (l - 247) + f + 108, d = 2), 251 <= l && l <= 254 && (v = 256 * -(l - 251) - f - 108, d = 2), l == 255 && (v = u.readInt(r, n + 1) / 65535, d = 5), o.val = v ?? "o" + p, o.size = d;
    }, e.CFF.readCharString = function(r, n, o) {
      for (var u = n + o, l = e._bin, f = []; n < u; ) {
        var d = r[n], p = r[n + 1];
        r[n + 2], r[n + 3], r[n + 4];
        var v = 1, g = null, x = null;
        d <= 20 && (g = d, v = 1), d == 12 && (g = 100 * d + p, v = 2), d != 19 && d != 20 || (g = d, v = 2), 21 <= d && d <= 27 && (g = d, v = 1), d == 28 && (x = l.readShort(r, n + 1), v = 3), 29 <= d && d <= 31 && (g = d, v = 1), 32 <= d && d <= 246 && (x = d - 139, v = 1), 247 <= d && d <= 250 && (x = 256 * (d - 247) + p + 108, v = 2), 251 <= d && d <= 254 && (x = 256 * -(d - 251) - p - 108, v = 2), d == 255 && (x = l.readInt(r, n + 1) / 65535, v = 5), f.push(x ?? "o" + g), n += v;
      }
      return f;
    }, e.CFF.readDict = function(r, n, o) {
      for (var u = e._bin, l = {}, f = []; n < o; ) {
        var d = r[n], p = r[n + 1];
        r[n + 2], r[n + 3], r[n + 4];
        var v = 1, g = null, x = null;
        if (d == 28 && (x = u.readShort(r, n + 1), v = 3), d == 29 && (x = u.readInt(r, n + 1), v = 5), 32 <= d && d <= 246 && (x = d - 139, v = 1), 247 <= d && d <= 250 && (x = 256 * (d - 247) + p + 108, v = 2), 251 <= d && d <= 254 && (x = 256 * -(d - 251) - p - 108, v = 2), d == 255)
          throw x = u.readInt(r, n + 1) / 65535, v = 5, "unknown number";
        if (d == 30) {
          var E = [];
          for (v = 1; ; ) {
            var _ = r[n + v];
            v++;
            var S = _ >> 4, A = 15 & _;
            if (S != 15 && E.push(S), A != 15 && E.push(A), A == 15)
              break;
          }
          for (var T = "", C = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ".", "e", "e-", "reserved", "-", "endOfNumber"], P = 0; P < E.length; P++)
            T += C[E[P]];
          x = parseFloat(T);
        }
        d <= 21 && (g = ["version", "Notice", "FullName", "FamilyName", "Weight", "FontBBox", "BlueValues", "OtherBlues", "FamilyBlues", "FamilyOtherBlues", "StdHW", "StdVW", "escape", "UniqueID", "XUID", "charset", "Encoding", "CharStrings", "Private", "Subrs", "defaultWidthX", "nominalWidthX"][d], v = 1, d == 12 && (g = ["Copyright", "isFixedPitch", "ItalicAngle", "UnderlinePosition", "UnderlineThickness", "PaintType", "CharstringType", "FontMatrix", "StrokeWidth", "BlueScale", "BlueShift", "BlueFuzz", "StemSnapH", "StemSnapV", "ForceBold", 0, 0, "LanguageGroup", "ExpansionFactor", "initialRandomSeed", "SyntheticBase", "PostScript", "BaseFontName", "BaseFontBlend", 0, 0, 0, 0, 0, 0, "ROS", "CIDFontVersion", "CIDFontRevision", "CIDFontType", "CIDCount", "UIDBase", "FDArray", "FDSelect", "FontName"][p], v = 2)), g != null ? (l[g] = f.length == 1 ? f[0] : f, f = []) : f.push(x), n += v;
      }
      return l;
    }, e.cmap = {}, e.cmap.parse = function(r, n, o) {
      r = new Uint8Array(r.buffer, n, o), n = 0;
      var u = e._bin, l = {};
      u.readUshort(r, n), n += 2;
      var f = u.readUshort(r, n);
      n += 2;
      var d = [];
      l.tables = [];
      for (var p = 0; p < f; p++) {
        var v = u.readUshort(r, n);
        n += 2;
        var g = u.readUshort(r, n);
        n += 2;
        var x = u.readUint(r, n);
        n += 4;
        var E = "p" + v + "e" + g, _ = d.indexOf(x);
        if (_ == -1) {
          var S;
          _ = l.tables.length, d.push(x);
          var A = u.readUshort(r, x);
          A == 0 ? S = e.cmap.parse0(r, x) : A == 4 ? S = e.cmap.parse4(r, x) : A == 6 ? S = e.cmap.parse6(r, x) : A == 12 ? S = e.cmap.parse12(r, x) : console.debug("unknown format: " + A, v, g, x), l.tables.push(S);
        }
        if (l[E] != null)
          throw "multiple tables for one platform+encoding";
        l[E] = _;
      }
      return l;
    }, e.cmap.parse0 = function(r, n) {
      var o = e._bin, u = {};
      u.format = o.readUshort(r, n), n += 2;
      var l = o.readUshort(r, n);
      n += 2, o.readUshort(r, n), n += 2, u.map = [];
      for (var f = 0; f < l - 6; f++)
        u.map.push(r[n + f]);
      return u;
    }, e.cmap.parse4 = function(r, n) {
      var o = e._bin, u = n, l = {};
      l.format = o.readUshort(r, n), n += 2;
      var f = o.readUshort(r, n);
      n += 2, o.readUshort(r, n), n += 2;
      var d = o.readUshort(r, n);
      n += 2;
      var p = d / 2;
      l.searchRange = o.readUshort(r, n), n += 2, l.entrySelector = o.readUshort(r, n), n += 2, l.rangeShift = o.readUshort(r, n), n += 2, l.endCount = o.readUshorts(r, n, p), n += 2 * p, n += 2, l.startCount = o.readUshorts(r, n, p), n += 2 * p, l.idDelta = [];
      for (var v = 0; v < p; v++)
        l.idDelta.push(o.readShort(r, n)), n += 2;
      for (l.idRangeOffset = o.readUshorts(r, n, p), n += 2 * p, l.glyphIdArray = []; n < u + f; )
        l.glyphIdArray.push(o.readUshort(r, n)), n += 2;
      return l;
    }, e.cmap.parse6 = function(r, n) {
      var o = e._bin, u = {};
      u.format = o.readUshort(r, n), n += 2, o.readUshort(r, n), n += 2, o.readUshort(r, n), n += 2, u.firstCode = o.readUshort(r, n), n += 2;
      var l = o.readUshort(r, n);
      n += 2, u.glyphIdArray = [];
      for (var f = 0; f < l; f++)
        u.glyphIdArray.push(o.readUshort(r, n)), n += 2;
      return u;
    }, e.cmap.parse12 = function(r, n) {
      var o = e._bin, u = {};
      u.format = o.readUshort(r, n), n += 2, n += 2, o.readUint(r, n), n += 4, o.readUint(r, n), n += 4;
      var l = o.readUint(r, n);
      n += 4, u.groups = [];
      for (var f = 0; f < l; f++) {
        var d = n + 12 * f, p = o.readUint(r, d + 0), v = o.readUint(r, d + 4), g = o.readUint(r, d + 8);
        u.groups.push([p, v, g]);
      }
      return u;
    }, e.glyf = {}, e.glyf.parse = function(r, n, o, u) {
      for (var l = [], f = 0; f < u.maxp.numGlyphs; f++)
        l.push(null);
      return l;
    }, e.glyf._parseGlyf = function(r, n) {
      var o = e._bin, u = r._data, l = e._tabOffset(u, "glyf", r._offset) + r.loca[n];
      if (r.loca[n] == r.loca[n + 1])
        return null;
      var f = {};
      if (f.noc = o.readShort(u, l), l += 2, f.xMin = o.readShort(u, l), l += 2, f.yMin = o.readShort(u, l), l += 2, f.xMax = o.readShort(u, l), l += 2, f.yMax = o.readShort(u, l), l += 2, f.xMin >= f.xMax || f.yMin >= f.yMax)
        return null;
      if (f.noc > 0) {
        f.endPts = [];
        for (var d = 0; d < f.noc; d++)
          f.endPts.push(o.readUshort(u, l)), l += 2;
        var p = o.readUshort(u, l);
        if (l += 2, u.length - l < p)
          return null;
        f.instructions = o.readBytes(u, l, p), l += p;
        var v = f.endPts[f.noc - 1] + 1;
        for (f.flags = [], d = 0; d < v; d++) {
          var g = u[l];
          if (l++, f.flags.push(g), (8 & g) != 0) {
            var x = u[l];
            l++;
            for (var E = 0; E < x; E++)
              f.flags.push(g), d++;
          }
        }
        for (f.xs = [], d = 0; d < v; d++) {
          var _ = (2 & f.flags[d]) != 0, S = (16 & f.flags[d]) != 0;
          _ ? (f.xs.push(S ? u[l] : -u[l]), l++) : S ? f.xs.push(0) : (f.xs.push(o.readShort(u, l)), l += 2);
        }
        for (f.ys = [], d = 0; d < v; d++)
          _ = (4 & f.flags[d]) != 0, S = (32 & f.flags[d]) != 0, _ ? (f.ys.push(S ? u[l] : -u[l]), l++) : S ? f.ys.push(0) : (f.ys.push(o.readShort(u, l)), l += 2);
        var A = 0, T = 0;
        for (d = 0; d < v; d++)
          A += f.xs[d], T += f.ys[d], f.xs[d] = A, f.ys[d] = T;
      } else {
        var C;
        f.parts = [];
        do {
          C = o.readUshort(u, l), l += 2;
          var P = { m: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, p1: -1, p2: -1 };
          if (f.parts.push(P), P.glyphIndex = o.readUshort(u, l), l += 2, 1 & C) {
            var M = o.readShort(u, l);
            l += 2;
            var b = o.readShort(u, l);
            l += 2;
          } else
            M = o.readInt8(u, l), l++, b = o.readInt8(u, l), l++;
          2 & C ? (P.m.tx = M, P.m.ty = b) : (P.p1 = M, P.p2 = b), 8 & C ? (P.m.a = P.m.d = o.readF2dot14(u, l), l += 2) : 64 & C ? (P.m.a = o.readF2dot14(u, l), l += 2, P.m.d = o.readF2dot14(u, l), l += 2) : 128 & C && (P.m.a = o.readF2dot14(u, l), l += 2, P.m.b = o.readF2dot14(u, l), l += 2, P.m.c = o.readF2dot14(u, l), l += 2, P.m.d = o.readF2dot14(u, l), l += 2);
        } while (32 & C);
        if (256 & C) {
          var L = o.readUshort(u, l);
          for (l += 2, f.instr = [], d = 0; d < L; d++)
            f.instr.push(u[l]), l++;
        }
      }
      return f;
    }, e.GDEF = {}, e.GDEF.parse = function(r, n, o, u) {
      var l = n;
      n += 4;
      var f = e._bin.readUshort(r, n);
      return { glyphClassDef: f === 0 ? null : e._lctf.readClassDef(r, l + f) };
    }, e.GPOS = {}, e.GPOS.parse = function(r, n, o, u) {
      return e._lctf.parse(r, n, o, u, e.GPOS.subt);
    }, e.GPOS.subt = function(r, n, o, u) {
      var l = e._bin, f = o, d = {};
      if (d.fmt = l.readUshort(r, o), o += 2, n == 1 || n == 2 || n == 3 || n == 7 || n == 8 && d.fmt <= 2) {
        var p = l.readUshort(r, o);
        o += 2, d.coverage = e._lctf.readCoverage(r, p + f);
      }
      if (n == 1 && d.fmt == 1) {
        var v = l.readUshort(r, o);
        o += 2, v != 0 && (d.pos = e.GPOS.readValueRecord(r, o, v));
      } else if (n == 2 && d.fmt >= 1 && d.fmt <= 2) {
        v = l.readUshort(r, o), o += 2;
        var g = l.readUshort(r, o);
        o += 2;
        var x = e._lctf.numOfOnes(v), E = e._lctf.numOfOnes(g);
        if (d.fmt == 1) {
          d.pairsets = [];
          var _ = l.readUshort(r, o);
          o += 2;
          for (var S = 0; S < _; S++) {
            var A = f + l.readUshort(r, o);
            o += 2;
            var T = l.readUshort(r, A);
            A += 2;
            for (var C = [], P = 0; P < T; P++) {
              var M = l.readUshort(r, A);
              A += 2, v != 0 && (k = e.GPOS.readValueRecord(r, A, v), A += 2 * x), g != 0 && (O = e.GPOS.readValueRecord(r, A, g), A += 2 * E), C.push({ gid2: M, val1: k, val2: O });
            }
            d.pairsets.push(C);
          }
        }
        if (d.fmt == 2) {
          var b = l.readUshort(r, o);
          o += 2;
          var L = l.readUshort(r, o);
          o += 2;
          var U = l.readUshort(r, o);
          o += 2;
          var R = l.readUshort(r, o);
          for (o += 2, d.classDef1 = e._lctf.readClassDef(r, f + b), d.classDef2 = e._lctf.readClassDef(r, f + L), d.matrix = [], S = 0; S < U; S++) {
            var I = [];
            for (P = 0; P < R; P++) {
              var k = null, O = null;
              v != 0 && (k = e.GPOS.readValueRecord(r, o, v), o += 2 * x), g != 0 && (O = e.GPOS.readValueRecord(r, o, g), o += 2 * E), I.push({ val1: k, val2: O });
            }
            d.matrix.push(I);
          }
        }
      } else if (n == 4 && d.fmt == 1)
        d.markCoverage = e._lctf.readCoverage(r, l.readUshort(r, o) + f), d.baseCoverage = e._lctf.readCoverage(r, l.readUshort(r, o + 2) + f), d.markClassCount = l.readUshort(r, o + 4), d.markArray = e.GPOS.readMarkArray(r, l.readUshort(r, o + 6) + f), d.baseArray = e.GPOS.readBaseArray(r, l.readUshort(r, o + 8) + f, d.markClassCount);
      else if (n == 6 && d.fmt == 1)
        d.mark1Coverage = e._lctf.readCoverage(r, l.readUshort(r, o) + f), d.mark2Coverage = e._lctf.readCoverage(r, l.readUshort(r, o + 2) + f), d.markClassCount = l.readUshort(r, o + 4), d.mark1Array = e.GPOS.readMarkArray(r, l.readUshort(r, o + 6) + f), d.mark2Array = e.GPOS.readBaseArray(r, l.readUshort(r, o + 8) + f, d.markClassCount);
      else {
        if (n == 9 && d.fmt == 1) {
          var N = l.readUshort(r, o);
          o += 2;
          var J = l.readUint(r, o);
          if (o += 4, u.ltype == 9)
            u.ltype = N;
          else if (u.ltype != N)
            throw "invalid extension substitution";
          return e.GPOS.subt(r, u.ltype, f + J);
        }
        console.debug("unsupported GPOS table LookupType", n, "format", d.fmt);
      }
      return d;
    }, e.GPOS.readValueRecord = function(r, n, o) {
      var u = e._bin, l = [];
      return l.push(1 & o ? u.readShort(r, n) : 0), n += 1 & o ? 2 : 0, l.push(2 & o ? u.readShort(r, n) : 0), n += 2 & o ? 2 : 0, l.push(4 & o ? u.readShort(r, n) : 0), n += 4 & o ? 2 : 0, l.push(8 & o ? u.readShort(r, n) : 0), n += 8 & o ? 2 : 0, l;
    }, e.GPOS.readBaseArray = function(r, n, o) {
      var u = e._bin, l = [], f = n, d = u.readUshort(r, n);
      n += 2;
      for (var p = 0; p < d; p++) {
        for (var v = [], g = 0; g < o; g++)
          v.push(e.GPOS.readAnchorRecord(r, f + u.readUshort(r, n))), n += 2;
        l.push(v);
      }
      return l;
    }, e.GPOS.readMarkArray = function(r, n) {
      var o = e._bin, u = [], l = n, f = o.readUshort(r, n);
      n += 2;
      for (var d = 0; d < f; d++) {
        var p = e.GPOS.readAnchorRecord(r, o.readUshort(r, n + 2) + l);
        p.markClass = o.readUshort(r, n), u.push(p), n += 4;
      }
      return u;
    }, e.GPOS.readAnchorRecord = function(r, n) {
      var o = e._bin, u = {};
      return u.fmt = o.readUshort(r, n), u.x = o.readShort(r, n + 2), u.y = o.readShort(r, n + 4), u;
    }, e.GSUB = {}, e.GSUB.parse = function(r, n, o, u) {
      return e._lctf.parse(r, n, o, u, e.GSUB.subt);
    }, e.GSUB.subt = function(r, n, o, u) {
      var l = e._bin, f = o, d = {};
      if (d.fmt = l.readUshort(r, o), o += 2, n != 1 && n != 2 && n != 4 && n != 5 && n != 6)
        return null;
      if (n == 1 || n == 2 || n == 4 || n == 5 && d.fmt <= 2 || n == 6 && d.fmt <= 2) {
        var p = l.readUshort(r, o);
        o += 2, d.coverage = e._lctf.readCoverage(r, f + p);
      }
      if (n == 1 && d.fmt >= 1 && d.fmt <= 2) {
        if (d.fmt == 1)
          d.delta = l.readShort(r, o), o += 2;
        else if (d.fmt == 2) {
          var v = l.readUshort(r, o);
          o += 2, d.newg = l.readUshorts(r, o, v), o += 2 * d.newg.length;
        }
      } else if (n == 2 && d.fmt == 1) {
        v = l.readUshort(r, o), o += 2, d.seqs = [];
        for (var g = 0; g < v; g++) {
          var x = l.readUshort(r, o) + f;
          o += 2;
          var E = l.readUshort(r, x);
          d.seqs.push(l.readUshorts(r, x + 2, E));
        }
      } else if (n == 4)
        for (d.vals = [], v = l.readUshort(r, o), o += 2, g = 0; g < v; g++) {
          var _ = l.readUshort(r, o);
          o += 2, d.vals.push(e.GSUB.readLigatureSet(r, f + _));
        }
      else if (n == 5 && d.fmt == 2) {
        if (d.fmt == 2) {
          var S = l.readUshort(r, o);
          o += 2, d.cDef = e._lctf.readClassDef(r, f + S), d.scset = [];
          var A = l.readUshort(r, o);
          for (o += 2, g = 0; g < A; g++) {
            var T = l.readUshort(r, o);
            o += 2, d.scset.push(T == 0 ? null : e.GSUB.readSubClassSet(r, f + T));
          }
        }
      } else if (n == 6 && d.fmt == 3) {
        if (d.fmt == 3) {
          for (g = 0; g < 3; g++) {
            v = l.readUshort(r, o), o += 2;
            for (var C = [], P = 0; P < v; P++)
              C.push(e._lctf.readCoverage(r, f + l.readUshort(r, o + 2 * P)));
            o += 2 * v, g == 0 && (d.backCvg = C), g == 1 && (d.inptCvg = C), g == 2 && (d.ahedCvg = C);
          }
          v = l.readUshort(r, o), o += 2, d.lookupRec = e.GSUB.readSubstLookupRecords(r, o, v);
        }
      } else {
        if (n == 7 && d.fmt == 1) {
          var M = l.readUshort(r, o);
          o += 2;
          var b = l.readUint(r, o);
          if (o += 4, u.ltype == 9)
            u.ltype = M;
          else if (u.ltype != M)
            throw "invalid extension substitution";
          return e.GSUB.subt(r, u.ltype, f + b);
        }
        console.debug("unsupported GSUB table LookupType", n, "format", d.fmt);
      }
      return d;
    }, e.GSUB.readSubClassSet = function(r, n) {
      var o = e._bin.readUshort, u = n, l = [], f = o(r, n);
      n += 2;
      for (var d = 0; d < f; d++) {
        var p = o(r, n);
        n += 2, l.push(e.GSUB.readSubClassRule(r, u + p));
      }
      return l;
    }, e.GSUB.readSubClassRule = function(r, n) {
      var o = e._bin.readUshort, u = {}, l = o(r, n), f = o(r, n += 2);
      n += 2, u.input = [];
      for (var d = 0; d < l - 1; d++)
        u.input.push(o(r, n)), n += 2;
      return u.substLookupRecords = e.GSUB.readSubstLookupRecords(r, n, f), u;
    }, e.GSUB.readSubstLookupRecords = function(r, n, o) {
      for (var u = e._bin.readUshort, l = [], f = 0; f < o; f++)
        l.push(u(r, n), u(r, n + 2)), n += 4;
      return l;
    }, e.GSUB.readChainSubClassSet = function(r, n) {
      var o = e._bin, u = n, l = [], f = o.readUshort(r, n);
      n += 2;
      for (var d = 0; d < f; d++) {
        var p = o.readUshort(r, n);
        n += 2, l.push(e.GSUB.readChainSubClassRule(r, u + p));
      }
      return l;
    }, e.GSUB.readChainSubClassRule = function(r, n) {
      for (var o = e._bin, u = {}, l = ["backtrack", "input", "lookahead"], f = 0; f < l.length; f++) {
        var d = o.readUshort(r, n);
        n += 2, f == 1 && d--, u[l[f]] = o.readUshorts(r, n, d), n += 2 * u[l[f]].length;
      }
      return d = o.readUshort(r, n), n += 2, u.subst = o.readUshorts(r, n, 2 * d), n += 2 * u.subst.length, u;
    }, e.GSUB.readLigatureSet = function(r, n) {
      var o = e._bin, u = n, l = [], f = o.readUshort(r, n);
      n += 2;
      for (var d = 0; d < f; d++) {
        var p = o.readUshort(r, n);
        n += 2, l.push(e.GSUB.readLigature(r, u + p));
      }
      return l;
    }, e.GSUB.readLigature = function(r, n) {
      var o = e._bin, u = { chain: [] };
      u.nglyph = o.readUshort(r, n), n += 2;
      var l = o.readUshort(r, n);
      n += 2;
      for (var f = 0; f < l - 1; f++)
        u.chain.push(o.readUshort(r, n)), n += 2;
      return u;
    }, e.head = {}, e.head.parse = function(r, n, o) {
      var u = e._bin, l = {};
      return u.readFixed(r, n), n += 4, l.fontRevision = u.readFixed(r, n), n += 4, u.readUint(r, n), n += 4, u.readUint(r, n), n += 4, l.flags = u.readUshort(r, n), n += 2, l.unitsPerEm = u.readUshort(r, n), n += 2, l.created = u.readUint64(r, n), n += 8, l.modified = u.readUint64(r, n), n += 8, l.xMin = u.readShort(r, n), n += 2, l.yMin = u.readShort(r, n), n += 2, l.xMax = u.readShort(r, n), n += 2, l.yMax = u.readShort(r, n), n += 2, l.macStyle = u.readUshort(r, n), n += 2, l.lowestRecPPEM = u.readUshort(r, n), n += 2, l.fontDirectionHint = u.readShort(r, n), n += 2, l.indexToLocFormat = u.readShort(r, n), n += 2, l.glyphDataFormat = u.readShort(r, n), n += 2, l;
    }, e.hhea = {}, e.hhea.parse = function(r, n, o) {
      var u = e._bin, l = {};
      return u.readFixed(r, n), n += 4, l.ascender = u.readShort(r, n), n += 2, l.descender = u.readShort(r, n), n += 2, l.lineGap = u.readShort(r, n), n += 2, l.advanceWidthMax = u.readUshort(r, n), n += 2, l.minLeftSideBearing = u.readShort(r, n), n += 2, l.minRightSideBearing = u.readShort(r, n), n += 2, l.xMaxExtent = u.readShort(r, n), n += 2, l.caretSlopeRise = u.readShort(r, n), n += 2, l.caretSlopeRun = u.readShort(r, n), n += 2, l.caretOffset = u.readShort(r, n), n += 2, n += 8, l.metricDataFormat = u.readShort(r, n), n += 2, l.numberOfHMetrics = u.readUshort(r, n), n += 2, l;
    }, e.hmtx = {}, e.hmtx.parse = function(r, n, o, u) {
      for (var l = e._bin, f = { aWidth: [], lsBearing: [] }, d = 0, p = 0, v = 0; v < u.maxp.numGlyphs; v++)
        v < u.hhea.numberOfHMetrics && (d = l.readUshort(r, n), n += 2, p = l.readShort(r, n), n += 2), f.aWidth.push(d), f.lsBearing.push(p);
      return f;
    }, e.kern = {}, e.kern.parse = function(r, n, o, u) {
      var l = e._bin, f = l.readUshort(r, n);
      if (n += 2, f == 1)
        return e.kern.parseV1(r, n - 2, o, u);
      var d = l.readUshort(r, n);
      n += 2;
      for (var p = { glyph1: [], rval: [] }, v = 0; v < d; v++) {
        n += 2, o = l.readUshort(r, n), n += 2;
        var g = l.readUshort(r, n);
        n += 2;
        var x = g >>> 8;
        if ((x &= 15) != 0)
          throw "unknown kern table format: " + x;
        n = e.kern.readFormat0(r, n, p);
      }
      return p;
    }, e.kern.parseV1 = function(r, n, o, u) {
      var l = e._bin;
      l.readFixed(r, n), n += 4;
      var f = l.readUint(r, n);
      n += 4;
      for (var d = { glyph1: [], rval: [] }, p = 0; p < f; p++) {
        l.readUint(r, n), n += 4;
        var v = l.readUshort(r, n);
        n += 2, l.readUshort(r, n), n += 2;
        var g = v >>> 8;
        if ((g &= 15) != 0)
          throw "unknown kern table format: " + g;
        n = e.kern.readFormat0(r, n, d);
      }
      return d;
    }, e.kern.readFormat0 = function(r, n, o) {
      var u = e._bin, l = -1, f = u.readUshort(r, n);
      n += 2, u.readUshort(r, n), n += 2, u.readUshort(r, n), n += 2, u.readUshort(r, n), n += 2;
      for (var d = 0; d < f; d++) {
        var p = u.readUshort(r, n);
        n += 2;
        var v = u.readUshort(r, n);
        n += 2;
        var g = u.readShort(r, n);
        n += 2, p != l && (o.glyph1.push(p), o.rval.push({ glyph2: [], vals: [] }));
        var x = o.rval[o.rval.length - 1];
        x.glyph2.push(v), x.vals.push(g), l = p;
      }
      return n;
    }, e.loca = {}, e.loca.parse = function(r, n, o, u) {
      var l = e._bin, f = [], d = u.head.indexToLocFormat, p = u.maxp.numGlyphs + 1;
      if (d == 0)
        for (var v = 0; v < p; v++)
          f.push(l.readUshort(r, n + (v << 1)) << 1);
      if (d == 1)
        for (v = 0; v < p; v++)
          f.push(l.readUint(r, n + (v << 2)));
      return f;
    }, e.maxp = {}, e.maxp.parse = function(r, n, o) {
      var u = e._bin, l = {}, f = u.readUint(r, n);
      return n += 4, l.numGlyphs = u.readUshort(r, n), n += 2, f == 65536 && (l.maxPoints = u.readUshort(r, n), n += 2, l.maxContours = u.readUshort(r, n), n += 2, l.maxCompositePoints = u.readUshort(r, n), n += 2, l.maxCompositeContours = u.readUshort(r, n), n += 2, l.maxZones = u.readUshort(r, n), n += 2, l.maxTwilightPoints = u.readUshort(r, n), n += 2, l.maxStorage = u.readUshort(r, n), n += 2, l.maxFunctionDefs = u.readUshort(r, n), n += 2, l.maxInstructionDefs = u.readUshort(r, n), n += 2, l.maxStackElements = u.readUshort(r, n), n += 2, l.maxSizeOfInstructions = u.readUshort(r, n), n += 2, l.maxComponentElements = u.readUshort(r, n), n += 2, l.maxComponentDepth = u.readUshort(r, n), n += 2), l;
    }, e.name = {}, e.name.parse = function(r, n, o) {
      var u = e._bin, l = {};
      u.readUshort(r, n), n += 2;
      var f = u.readUshort(r, n);
      n += 2, u.readUshort(r, n);
      for (var d, p = ["copyright", "fontFamily", "fontSubfamily", "ID", "fullName", "version", "postScriptName", "trademark", "manufacturer", "designer", "description", "urlVendor", "urlDesigner", "licence", "licenceURL", "---", "typoFamilyName", "typoSubfamilyName", "compatibleFull", "sampleText", "postScriptCID", "wwsFamilyName", "wwsSubfamilyName", "lightPalette", "darkPalette"], v = n += 2, g = 0; g < f; g++) {
        var x = u.readUshort(r, n);
        n += 2;
        var E = u.readUshort(r, n);
        n += 2;
        var _ = u.readUshort(r, n);
        n += 2;
        var S = u.readUshort(r, n);
        n += 2;
        var A = u.readUshort(r, n);
        n += 2;
        var T = u.readUshort(r, n);
        n += 2;
        var C, P = p[S], M = v + 12 * f + T;
        if (x == 0)
          C = u.readUnicode(r, M, A / 2);
        else if (x == 3 && E == 0)
          C = u.readUnicode(r, M, A / 2);
        else if (E == 0)
          C = u.readASCII(r, M, A);
        else if (E == 1)
          C = u.readUnicode(r, M, A / 2);
        else if (E == 3)
          C = u.readUnicode(r, M, A / 2);
        else {
          if (x != 1)
            throw "unknown encoding " + E + ", platformID: " + x;
          C = u.readASCII(r, M, A), console.debug("reading unknown MAC encoding " + E + " as ASCII");
        }
        var b = "p" + x + "," + _.toString(16);
        l[b] == null && (l[b] = {}), l[b][P !== void 0 ? P : S] = C, l[b]._lang = _;
      }
      for (var L in l)
        if (l[L].postScriptName != null && l[L]._lang == 1033)
          return l[L];
      for (var L in l)
        if (l[L].postScriptName != null && l[L]._lang == 0)
          return l[L];
      for (var L in l)
        if (l[L].postScriptName != null && l[L]._lang == 3084)
          return l[L];
      for (var L in l)
        if (l[L].postScriptName != null)
          return l[L];
      for (var L in l) {
        d = L;
        break;
      }
      return console.debug("returning name table with languageID " + l[d]._lang), l[d];
    }, e["OS/2"] = {}, e["OS/2"].parse = function(r, n, o) {
      var u = e._bin.readUshort(r, n);
      n += 2;
      var l = {};
      if (u == 0)
        e["OS/2"].version0(r, n, l);
      else if (u == 1)
        e["OS/2"].version1(r, n, l);
      else if (u == 2 || u == 3 || u == 4)
        e["OS/2"].version2(r, n, l);
      else {
        if (u != 5)
          throw "unknown OS/2 table version: " + u;
        e["OS/2"].version5(r, n, l);
      }
      return l;
    }, e["OS/2"].version0 = function(r, n, o) {
      var u = e._bin;
      return o.xAvgCharWidth = u.readShort(r, n), n += 2, o.usWeightClass = u.readUshort(r, n), n += 2, o.usWidthClass = u.readUshort(r, n), n += 2, o.fsType = u.readUshort(r, n), n += 2, o.ySubscriptXSize = u.readShort(r, n), n += 2, o.ySubscriptYSize = u.readShort(r, n), n += 2, o.ySubscriptXOffset = u.readShort(r, n), n += 2, o.ySubscriptYOffset = u.readShort(r, n), n += 2, o.ySuperscriptXSize = u.readShort(r, n), n += 2, o.ySuperscriptYSize = u.readShort(r, n), n += 2, o.ySuperscriptXOffset = u.readShort(r, n), n += 2, o.ySuperscriptYOffset = u.readShort(r, n), n += 2, o.yStrikeoutSize = u.readShort(r, n), n += 2, o.yStrikeoutPosition = u.readShort(r, n), n += 2, o.sFamilyClass = u.readShort(r, n), n += 2, o.panose = u.readBytes(r, n, 10), n += 10, o.ulUnicodeRange1 = u.readUint(r, n), n += 4, o.ulUnicodeRange2 = u.readUint(r, n), n += 4, o.ulUnicodeRange3 = u.readUint(r, n), n += 4, o.ulUnicodeRange4 = u.readUint(r, n), n += 4, o.achVendID = [u.readInt8(r, n), u.readInt8(r, n + 1), u.readInt8(r, n + 2), u.readInt8(r, n + 3)], n += 4, o.fsSelection = u.readUshort(r, n), n += 2, o.usFirstCharIndex = u.readUshort(r, n), n += 2, o.usLastCharIndex = u.readUshort(r, n), n += 2, o.sTypoAscender = u.readShort(r, n), n += 2, o.sTypoDescender = u.readShort(r, n), n += 2, o.sTypoLineGap = u.readShort(r, n), n += 2, o.usWinAscent = u.readUshort(r, n), n += 2, o.usWinDescent = u.readUshort(r, n), n += 2;
    }, e["OS/2"].version1 = function(r, n, o) {
      var u = e._bin;
      return n = e["OS/2"].version0(r, n, o), o.ulCodePageRange1 = u.readUint(r, n), n += 4, o.ulCodePageRange2 = u.readUint(r, n), n += 4;
    }, e["OS/2"].version2 = function(r, n, o) {
      var u = e._bin;
      return n = e["OS/2"].version1(r, n, o), o.sxHeight = u.readShort(r, n), n += 2, o.sCapHeight = u.readShort(r, n), n += 2, o.usDefault = u.readUshort(r, n), n += 2, o.usBreak = u.readUshort(r, n), n += 2, o.usMaxContext = u.readUshort(r, n), n += 2;
    }, e["OS/2"].version5 = function(r, n, o) {
      var u = e._bin;
      return n = e["OS/2"].version2(r, n, o), o.usLowerOpticalPointSize = u.readUshort(r, n), n += 2, o.usUpperOpticalPointSize = u.readUshort(r, n), n += 2;
    }, e.post = {}, e.post.parse = function(r, n, o) {
      var u = e._bin, l = {};
      return l.version = u.readFixed(r, n), n += 4, l.italicAngle = u.readFixed(r, n), n += 4, l.underlinePosition = u.readShort(r, n), n += 2, l.underlineThickness = u.readShort(r, n), n += 2, l;
    }, e == null && (e = {}), e.U == null && (e.U = {}), e.U.codeToGlyph = function(r, n) {
      var o = r.cmap, u = -1;
      if (o.p0e4 != null ? u = o.p0e4 : o.p3e1 != null ? u = o.p3e1 : o.p1e0 != null ? u = o.p1e0 : o.p0e3 != null && (u = o.p0e3), u == -1)
        throw "no familiar platform and encoding!";
      var l = o.tables[u];
      if (l.format == 0)
        return n >= l.map.length ? 0 : l.map[n];
      if (l.format == 4) {
        for (var f = -1, d = 0; d < l.endCount.length; d++)
          if (n <= l.endCount[d]) {
            f = d;
            break;
          }
        return f == -1 || l.startCount[f] > n ? 0 : 65535 & (l.idRangeOffset[f] != 0 ? l.glyphIdArray[n - l.startCount[f] + (l.idRangeOffset[f] >> 1) - (l.idRangeOffset.length - f)] : n + l.idDelta[f]);
      }
      if (l.format == 12) {
        if (n > l.groups[l.groups.length - 1][1])
          return 0;
        for (d = 0; d < l.groups.length; d++) {
          var p = l.groups[d];
          if (p[0] <= n && n <= p[1])
            return p[2] + (n - p[0]);
        }
        return 0;
      }
      throw "unknown cmap table format " + l.format;
    }, e.U.glyphToPath = function(r, n) {
      var o = { cmds: [], crds: [] };
      if (r.SVG && r.SVG.entries[n]) {
        var u = r.SVG.entries[n];
        return u == null ? o : (typeof u == "string" && (u = e.SVG.toPath(u), r.SVG.entries[n] = u), u);
      }
      if (r.CFF) {
        var l = { x: 0, y: 0, stack: [], nStems: 0, haveWidth: !1, width: r.CFF.Private ? r.CFF.Private.defaultWidthX : 0, open: !1 }, f = r.CFF, d = r.CFF.Private;
        if (f.ROS) {
          for (var p = 0; f.FDSelect[p + 2] <= n; )
            p += 2;
          d = f.FDArray[f.FDSelect[p + 1]].Private;
        }
        e.U._drawCFF(r.CFF.CharStrings[n], l, f, d, o);
      } else
        r.glyf && e.U._drawGlyf(n, r, o);
      return o;
    }, e.U._drawGlyf = function(r, n, o) {
      var u = n.glyf[r];
      u == null && (u = n.glyf[r] = e.glyf._parseGlyf(n, r)), u != null && (u.noc > -1 ? e.U._simpleGlyph(u, o) : e.U._compoGlyph(u, n, o));
    }, e.U._simpleGlyph = function(r, n) {
      for (var o = 0; o < r.noc; o++) {
        for (var u = o == 0 ? 0 : r.endPts[o - 1] + 1, l = r.endPts[o], f = u; f <= l; f++) {
          var d = f == u ? l : f - 1, p = f == l ? u : f + 1, v = 1 & r.flags[f], g = 1 & r.flags[d], x = 1 & r.flags[p], E = r.xs[f], _ = r.ys[f];
          if (f == u)
            if (v) {
              if (!g) {
                e.U.P.moveTo(n, E, _);
                continue;
              }
              e.U.P.moveTo(n, r.xs[d], r.ys[d]);
            } else
              g ? e.U.P.moveTo(n, r.xs[d], r.ys[d]) : e.U.P.moveTo(n, (r.xs[d] + E) / 2, (r.ys[d] + _) / 2);
          v ? g && e.U.P.lineTo(n, E, _) : x ? e.U.P.qcurveTo(n, E, _, r.xs[p], r.ys[p]) : e.U.P.qcurveTo(n, E, _, (E + r.xs[p]) / 2, (_ + r.ys[p]) / 2);
        }
        e.U.P.closePath(n);
      }
    }, e.U._compoGlyph = function(r, n, o) {
      for (var u = 0; u < r.parts.length; u++) {
        var l = { cmds: [], crds: [] }, f = r.parts[u];
        e.U._drawGlyf(f.glyphIndex, n, l);
        for (var d = f.m, p = 0; p < l.crds.length; p += 2) {
          var v = l.crds[p], g = l.crds[p + 1];
          o.crds.push(v * d.a + g * d.b + d.tx), o.crds.push(v * d.c + g * d.d + d.ty);
        }
        for (p = 0; p < l.cmds.length; p++)
          o.cmds.push(l.cmds[p]);
      }
    }, e.U._getGlyphClass = function(r, n) {
      var o = e._lctf.getInterval(n, r);
      return o == -1 ? 0 : n[o + 2];
    }, e.U._applySubs = function(r, n, o, u) {
      for (var l = r.length - n - 1, f = 0; f < o.tabs.length; f++)
        if (o.tabs[f] != null) {
          var d, p = o.tabs[f];
          if (!p.coverage || (d = e._lctf.coverageIndex(p.coverage, r[n])) != -1) {
            if (o.ltype == 1)
              r[n], p.fmt == 1 ? r[n] = r[n] + p.delta : r[n] = p.newg[d];
            else if (o.ltype == 4)
              for (var v = p.vals[d], g = 0; g < v.length; g++) {
                var x = v[g], E = x.chain.length;
                if (!(E > l)) {
                  for (var _ = !0, S = 0, A = 0; A < E; A++) {
                    for (; r[n + S + (1 + A)] == -1; )
                      S++;
                    x.chain[A] != r[n + S + (1 + A)] && (_ = !1);
                  }
                  if (_) {
                    for (r[n] = x.nglyph, A = 0; A < E + S; A++)
                      r[n + A + 1] = -1;
                    break;
                  }
                }
              }
            else if (o.ltype == 5 && p.fmt == 2)
              for (var T = e._lctf.getInterval(p.cDef, r[n]), C = p.cDef[T + 2], P = p.scset[C], M = 0; M < P.length; M++) {
                var b = P[M], L = b.input;
                if (!(L.length > l)) {
                  for (_ = !0, A = 0; A < L.length; A++) {
                    var U = e._lctf.getInterval(p.cDef, r[n + 1 + A]);
                    if (T == -1 && p.cDef[U + 2] != L[A]) {
                      _ = !1;
                      break;
                    }
                  }
                  if (_) {
                    var R = b.substLookupRecords;
                    for (g = 0; g < R.length; g += 2)
                      R[g], R[g + 1];
                  }
                }
              }
            else if (o.ltype == 6 && p.fmt == 3) {
              if (!e.U._glsCovered(r, p.backCvg, n - p.backCvg.length) || !e.U._glsCovered(r, p.inptCvg, n) || !e.U._glsCovered(r, p.ahedCvg, n + p.inptCvg.length))
                continue;
              var I = p.lookupRec;
              for (M = 0; M < I.length; M += 2) {
                T = I[M];
                var k = u[I[M + 1]];
                e.U._applySubs(r, n + T, k, u);
              }
            }
          }
        }
    }, e.U._glsCovered = function(r, n, o) {
      for (var u = 0; u < n.length; u++)
        if (e._lctf.coverageIndex(n[u], r[o + u]) == -1)
          return !1;
      return !0;
    }, e.U.glyphsToPath = function(r, n, o) {
      for (var u = { cmds: [], crds: [] }, l = 0, f = 0; f < n.length; f++) {
        var d = n[f];
        if (d != -1) {
          for (var p = f < n.length - 1 && n[f + 1] != -1 ? n[f + 1] : 0, v = e.U.glyphToPath(r, d), g = 0; g < v.crds.length; g += 2)
            u.crds.push(v.crds[g] + l), u.crds.push(v.crds[g + 1]);
          for (o && u.cmds.push(o), g = 0; g < v.cmds.length; g++)
            u.cmds.push(v.cmds[g]);
          o && u.cmds.push("X"), l += r.hmtx.aWidth[d], f < n.length - 1 && (l += e.U.getPairAdjustment(r, d, p));
        }
      }
      return u;
    }, e.U.P = {}, e.U.P.moveTo = function(r, n, o) {
      r.cmds.push("M"), r.crds.push(n, o);
    }, e.U.P.lineTo = function(r, n, o) {
      r.cmds.push("L"), r.crds.push(n, o);
    }, e.U.P.curveTo = function(r, n, o, u, l, f, d) {
      r.cmds.push("C"), r.crds.push(n, o, u, l, f, d);
    }, e.U.P.qcurveTo = function(r, n, o, u, l) {
      r.cmds.push("Q"), r.crds.push(n, o, u, l);
    }, e.U.P.closePath = function(r) {
      r.cmds.push("Z");
    }, e.U._drawCFF = function(r, n, o, u, l) {
      for (var f = n.stack, d = n.nStems, p = n.haveWidth, v = n.width, g = n.open, x = 0, E = n.x, _ = n.y, S = 0, A = 0, T = 0, C = 0, P = 0, M = 0, b = 0, L = 0, U = 0, R = 0, I = { val: 0, size: 0 }; x < r.length; ) {
        e.CFF.getCharString(r, x, I);
        var k = I.val;
        if (x += I.size, k == "o1" || k == "o18")
          f.length % 2 != 0 && !p && (v = f.shift() + u.nominalWidthX), d += f.length >> 1, f.length = 0, p = !0;
        else if (k == "o3" || k == "o23")
          f.length % 2 != 0 && !p && (v = f.shift() + u.nominalWidthX), d += f.length >> 1, f.length = 0, p = !0;
        else if (k == "o4")
          f.length > 1 && !p && (v = f.shift() + u.nominalWidthX, p = !0), g && e.U.P.closePath(l), _ += f.pop(), e.U.P.moveTo(l, E, _), g = !0;
        else if (k == "o5")
          for (; f.length > 0; )
            E += f.shift(), _ += f.shift(), e.U.P.lineTo(l, E, _);
        else if (k == "o6" || k == "o7")
          for (var O = f.length, N = k == "o6", J = 0; J < O; J++) {
            var Z = f.shift();
            N ? E += Z : _ += Z, N = !N, e.U.P.lineTo(l, E, _);
          }
        else if (k == "o8" || k == "o24") {
          O = f.length;
          for (var ce = 0; ce + 6 <= O; )
            S = E + f.shift(), A = _ + f.shift(), T = S + f.shift(), C = A + f.shift(), E = T + f.shift(), _ = C + f.shift(), e.U.P.curveTo(l, S, A, T, C, E, _), ce += 6;
          k == "o24" && (E += f.shift(), _ += f.shift(), e.U.P.lineTo(l, E, _));
        } else {
          if (k == "o11")
            break;
          if (k == "o1234" || k == "o1235" || k == "o1236" || k == "o1237")
            k == "o1234" && (A = _, T = (S = E + f.shift()) + f.shift(), R = C = A + f.shift(), M = C, L = _, E = (b = (P = (U = T + f.shift()) + f.shift()) + f.shift()) + f.shift(), e.U.P.curveTo(l, S, A, T, C, U, R), e.U.P.curveTo(l, P, M, b, L, E, _)), k == "o1235" && (S = E + f.shift(), A = _ + f.shift(), T = S + f.shift(), C = A + f.shift(), U = T + f.shift(), R = C + f.shift(), P = U + f.shift(), M = R + f.shift(), b = P + f.shift(), L = M + f.shift(), E = b + f.shift(), _ = L + f.shift(), f.shift(), e.U.P.curveTo(l, S, A, T, C, U, R), e.U.P.curveTo(l, P, M, b, L, E, _)), k == "o1236" && (S = E + f.shift(), A = _ + f.shift(), T = S + f.shift(), R = C = A + f.shift(), M = C, b = (P = (U = T + f.shift()) + f.shift()) + f.shift(), L = M + f.shift(), E = b + f.shift(), e.U.P.curveTo(l, S, A, T, C, U, R), e.U.P.curveTo(l, P, M, b, L, E, _)), k == "o1237" && (S = E + f.shift(), A = _ + f.shift(), T = S + f.shift(), C = A + f.shift(), U = T + f.shift(), R = C + f.shift(), P = U + f.shift(), M = R + f.shift(), b = P + f.shift(), L = M + f.shift(), Math.abs(b - E) > Math.abs(L - _) ? E = b + f.shift() : _ = L + f.shift(), e.U.P.curveTo(l, S, A, T, C, U, R), e.U.P.curveTo(l, P, M, b, L, E, _));
          else if (k == "o14") {
            if (f.length > 0 && !p && (v = f.shift() + o.nominalWidthX, p = !0), f.length == 4) {
              var K = f.shift(), V = f.shift(), G = f.shift(), F = f.shift(), j = e.CFF.glyphBySE(o, G), W = e.CFF.glyphBySE(o, F);
              e.U._drawCFF(o.CharStrings[j], n, o, u, l), n.x = K, n.y = V, e.U._drawCFF(o.CharStrings[W], n, o, u, l);
            }
            g && (e.U.P.closePath(l), g = !1);
          } else if (k == "o19" || k == "o20")
            f.length % 2 != 0 && !p && (v = f.shift() + u.nominalWidthX), d += f.length >> 1, f.length = 0, p = !0, x += d + 7 >> 3;
          else if (k == "o21")
            f.length > 2 && !p && (v = f.shift() + u.nominalWidthX, p = !0), _ += f.pop(), E += f.pop(), g && e.U.P.closePath(l), e.U.P.moveTo(l, E, _), g = !0;
          else if (k == "o22")
            f.length > 1 && !p && (v = f.shift() + u.nominalWidthX, p = !0), E += f.pop(), g && e.U.P.closePath(l), e.U.P.moveTo(l, E, _), g = !0;
          else if (k == "o25") {
            for (; f.length > 6; )
              E += f.shift(), _ += f.shift(), e.U.P.lineTo(l, E, _);
            S = E + f.shift(), A = _ + f.shift(), T = S + f.shift(), C = A + f.shift(), E = T + f.shift(), _ = C + f.shift(), e.U.P.curveTo(l, S, A, T, C, E, _);
          } else if (k == "o26")
            for (f.length % 2 && (E += f.shift()); f.length > 0; )
              S = E, A = _ + f.shift(), E = T = S + f.shift(), _ = (C = A + f.shift()) + f.shift(), e.U.P.curveTo(l, S, A, T, C, E, _);
          else if (k == "o27")
            for (f.length % 2 && (_ += f.shift()); f.length > 0; )
              A = _, T = (S = E + f.shift()) + f.shift(), C = A + f.shift(), E = T + f.shift(), _ = C, e.U.P.curveTo(l, S, A, T, C, E, _);
          else if (k == "o10" || k == "o29") {
            var $ = k == "o10" ? u : o;
            if (f.length == 0)
              console.debug("error: empty stack");
            else {
              var Y = f.pop(), se = $.Subrs[Y + $.Bias];
              n.x = E, n.y = _, n.nStems = d, n.haveWidth = p, n.width = v, n.open = g, e.U._drawCFF(se, n, o, u, l), E = n.x, _ = n.y, d = n.nStems, p = n.haveWidth, v = n.width, g = n.open;
            }
          } else if (k == "o30" || k == "o31") {
            var X = f.length, q = (ce = 0, k == "o31");
            for (ce += X - (O = -3 & X); ce < O; )
              q ? (A = _, T = (S = E + f.shift()) + f.shift(), _ = (C = A + f.shift()) + f.shift(), O - ce == 5 ? (E = T + f.shift(), ce++) : E = T, q = !1) : (S = E, A = _ + f.shift(), T = S + f.shift(), C = A + f.shift(), E = T + f.shift(), O - ce == 5 ? (_ = C + f.shift(), ce++) : _ = C, q = !0), e.U.P.curveTo(l, S, A, T, C, E, _), ce += 4;
          } else {
            if ((k + "").charAt(0) == "o")
              throw console.debug("Unknown operation: " + k, r), k;
            f.push(k);
          }
        }
      }
      n.x = E, n.y = _, n.nStems = d, n.haveWidth = p, n.width = v, n.open = g;
    };
    var s = e, a = { Typr: s };
    return c.Typr = s, c.default = a, Object.defineProperty(c, "__esModule", { value: !0 }), c;
  }({}).Typr;
}
/*!
Custom bundle of woff2otf (https://github.com/arty-name/woff2otf) with fflate
(https://github.com/101arrowz/fflate) for use in Troika text rendering. 
Original licenses apply: 
- fflate: https://github.com/101arrowz/fflate/blob/master/LICENSE (MIT)
- woff2otf.js: https://github.com/arty-name/woff2otf/blob/master/woff2otf.js (Apache2)
*/
function T0() {
  return function(c) {
    var e = Uint8Array, s = Uint16Array, a = Uint32Array, r = new e([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]), n = new e([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]), o = new e([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), u = function(k, O) {
      for (var N = new s(31), J = 0; J < 31; ++J)
        N[J] = O += 1 << k[J - 1];
      var Z = new a(N[30]);
      for (J = 1; J < 30; ++J)
        for (var ce = N[J]; ce < N[J + 1]; ++ce)
          Z[ce] = ce - N[J] << 5 | J;
      return [N, Z];
    }, l = u(r, 2), f = l[0], d = l[1];
    f[28] = 258, d[258] = 28;
    for (var p = u(n, 0)[0], v = new s(32768), g = 0; g < 32768; ++g) {
      var x = (43690 & g) >>> 1 | (21845 & g) << 1;
      x = (61680 & (x = (52428 & x) >>> 2 | (13107 & x) << 2)) >>> 4 | (3855 & x) << 4, v[g] = ((65280 & x) >>> 8 | (255 & x) << 8) >>> 1;
    }
    var E = function(k, O, N) {
      for (var J = k.length, Z = 0, ce = new s(O); Z < J; ++Z)
        ++ce[k[Z] - 1];
      var K, V = new s(O);
      for (Z = 0; Z < O; ++Z)
        V[Z] = V[Z - 1] + ce[Z - 1] << 1;
      if (N) {
        K = new s(1 << O);
        var G = 15 - O;
        for (Z = 0; Z < J; ++Z)
          if (k[Z])
            for (var F = Z << 4 | k[Z], j = O - k[Z], W = V[k[Z] - 1]++ << j, $ = W | (1 << j) - 1; W <= $; ++W)
              K[v[W] >>> G] = F;
      } else
        for (K = new s(J), Z = 0; Z < J; ++Z)
          k[Z] && (K[Z] = v[V[k[Z] - 1]++] >>> 15 - k[Z]);
      return K;
    }, _ = new e(288);
    for (g = 0; g < 144; ++g)
      _[g] = 8;
    for (g = 144; g < 256; ++g)
      _[g] = 9;
    for (g = 256; g < 280; ++g)
      _[g] = 7;
    for (g = 280; g < 288; ++g)
      _[g] = 8;
    var S = new e(32);
    for (g = 0; g < 32; ++g)
      S[g] = 5;
    var A = E(_, 9, 1), T = E(S, 5, 1), C = function(k) {
      for (var O = k[0], N = 1; N < k.length; ++N)
        k[N] > O && (O = k[N]);
      return O;
    }, P = function(k, O, N) {
      var J = O / 8 | 0;
      return (k[J] | k[J + 1] << 8) >> (7 & O) & N;
    }, M = function(k, O) {
      var N = O / 8 | 0;
      return (k[N] | k[N + 1] << 8 | k[N + 2] << 16) >> (7 & O);
    }, b = ["unexpected EOF", "invalid block type", "invalid length/literal", "invalid distance", "stream finished", "no stream handler", , "no callback", "invalid UTF-8 data", "extra field too long", "date not in range 1980-2099", "filename too long", "stream finishing", "invalid zip data"], L = function(k, O, N) {
      var J = new Error(O || b[k]);
      if (J.code = k, Error.captureStackTrace && Error.captureStackTrace(J, L), !N)
        throw J;
      return J;
    }, U = function(k, O, N) {
      var J = k.length;
      if (!J || N && !N.l && J < 5)
        return O || new e(0);
      var Z = !O || N, ce = !N || N.i;
      N || (N = {}), O || (O = new e(3 * J));
      var K, V = function(Ue) {
        var B = O.length;
        if (Ue > B) {
          var ue = new e(Math.max(2 * B, Ue));
          ue.set(O), O = ue;
        }
      }, G = N.f || 0, F = N.p || 0, j = N.b || 0, W = N.l, $ = N.d, Y = N.m, se = N.n, X = 8 * J;
      do {
        if (!W) {
          N.f = G = P(k, F, 1);
          var q = P(k, F + 1, 3);
          if (F += 3, !q) {
            var re = k[(Te = ((K = F) / 8 | 0) + (7 & K && 1) + 4) - 4] | k[Te - 3] << 8, pe = Te + re;
            if (pe > J) {
              ce && L(0);
              break;
            }
            Z && V(j + re), O.set(k.subarray(Te, pe), j), N.b = j += re, N.p = F = 8 * pe;
            continue;
          }
          if (q == 1)
            W = A, $ = T, Y = 9, se = 5;
          else if (q == 2) {
            var ae = P(k, F, 31) + 257, ie = P(k, F + 10, 15) + 4, fe = ae + P(k, F + 5, 31) + 1;
            F += 14;
            for (var ve = new e(fe), me = new e(19), we = 0; we < ie; ++we)
              me[o[we]] = P(k, F + 3 * we, 7);
            F += 3 * ie;
            var Fe = C(me), de = (1 << Fe) - 1, Me = E(me, Fe, 1);
            for (we = 0; we < fe; ) {
              var Te, le = Me[P(k, F, de)];
              if (F += 15 & le, (Te = le >>> 4) < 16)
                ve[we++] = Te;
              else {
                var je = 0, _e = 0;
                for (Te == 16 ? (_e = 3 + P(k, F, 3), F += 2, je = ve[we - 1]) : Te == 17 ? (_e = 3 + P(k, F, 7), F += 3) : Te == 18 && (_e = 11 + P(k, F, 127), F += 7); _e--; )
                  ve[we++] = je;
              }
            }
            var Ee = ve.subarray(0, ae), xe = ve.subarray(ae);
            Y = C(Ee), se = C(xe), W = E(Ee, Y, 1), $ = E(xe, se, 1);
          } else
            L(1);
          if (F > X) {
            ce && L(0);
            break;
          }
        }
        Z && V(j + 131072);
        for (var tt = (1 << Y) - 1, be = (1 << se) - 1, Le = F; ; Le = F) {
          var Oe = (je = W[M(k, F) & tt]) >>> 4;
          if ((F += 15 & je) > X) {
            ce && L(0);
            break;
          }
          if (je || L(2), Oe < 256)
            O[j++] = Oe;
          else {
            if (Oe == 256) {
              Le = F, W = null;
              break;
            }
            var Ge = Oe - 254;
            if (Oe > 264) {
              var st = r[we = Oe - 257];
              Ge = P(k, F, (1 << st) - 1) + f[we], F += st;
            }
            var ct = $[M(k, F) & be], Ke = ct >>> 4;
            if (ct || L(3), F += 15 & ct, xe = p[Ke], Ke > 3 && (st = n[Ke], xe += M(k, F) & (1 << st) - 1, F += st), F > X) {
              ce && L(0);
              break;
            }
            Z && V(j + 131072);
            for (var We = j + Ge; j < We; j += 4)
              O[j] = O[j - xe], O[j + 1] = O[j + 1 - xe], O[j + 2] = O[j + 2 - xe], O[j + 3] = O[j + 3 - xe];
            j = We;
          }
        }
        N.l = W, N.p = Le, N.b = j, W && (G = 1, N.m = Y, N.d = $, N.n = se);
      } while (!G);
      return j == O.length ? O : function(Ue, B, ue) {
        (B == null || B < 0) && (B = 0), (ue == null || ue > Ue.length) && (ue = Ue.length);
        var Pe = new (Ue instanceof s ? s : Ue instanceof a ? a : e)(ue - B);
        return Pe.set(Ue.subarray(B, ue)), Pe;
      }(O, 0, j);
    }, R = new e(0), I = typeof TextDecoder < "u" && new TextDecoder();
    try {
      I.decode(R, { stream: !0 });
    } catch {
    }
    return c.convert_streams = function(k) {
      var O = new DataView(k), N = 0;
      function J() {
        var ae = O.getUint16(N);
        return N += 2, ae;
      }
      function Z() {
        var ae = O.getUint32(N);
        return N += 4, ae;
      }
      function ce(ae) {
        re.setUint16(pe, ae), pe += 2;
      }
      function K(ae) {
        re.setUint32(pe, ae), pe += 4;
      }
      for (var V = { signature: Z(), flavor: Z(), length: Z(), numTables: J(), reserved: J(), totalSfntSize: Z(), majorVersion: J(), minorVersion: J(), metaOffset: Z(), metaLength: Z(), metaOrigLength: Z(), privOffset: Z(), privLength: Z() }, G = 0; Math.pow(2, G) <= V.numTables; )
        G++;
      G--;
      for (var F = 16 * Math.pow(2, G), j = 16 * V.numTables - F, W = 12, $ = [], Y = 0; Y < V.numTables; Y++)
        $.push({ tag: Z(), offset: Z(), compLength: Z(), origLength: Z(), origChecksum: Z() }), W += 16;
      var se, X = new Uint8Array(12 + 16 * $.length + $.reduce(function(ae, ie) {
        return ae + ie.origLength + 4;
      }, 0)), q = X.buffer, re = new DataView(q), pe = 0;
      return K(V.flavor), ce(V.numTables), ce(F), ce(G), ce(j), $.forEach(function(ae) {
        K(ae.tag), K(ae.origChecksum), K(W), K(ae.origLength), ae.outOffset = W, (W += ae.origLength) % 4 != 0 && (W += 4 - W % 4);
      }), $.forEach(function(ae) {
        var ie, fe = k.slice(ae.offset, ae.offset + ae.compLength);
        if (ae.compLength != ae.origLength) {
          var ve = new Uint8Array(ae.origLength);
          ie = new Uint8Array(fe, 2), U(ie, ve);
        } else
          ve = new Uint8Array(fe);
        X.set(ve, ae.outOffset);
        var me = 0;
        (W = ae.outOffset + ae.origLength) % 4 != 0 && (me = 4 - W % 4), X.set(new Uint8Array(me).buffer, ae.outOffset + ae.origLength), se = W + me;
      }), q.slice(0, se);
    }, Object.defineProperty(c, "__esModule", { value: !0 }), c;
  }({}).convert_streams;
}
function E0(c, e) {
  const s = {
    M: 2,
    L: 2,
    Q: 4,
    C: 6,
    Z: 0
  }, a = { C: "18g,ca,368,1kz", D: "17k,6,2,2+4,5+c,2+6,2+1,10+1,9+f,j+11,2+1,a,2,2+1,15+2,3,j+2,6+3,2+8,2,2,2+1,w+a,4+e,3+3,2,3+2,3+5,23+w,2f+4,3,2+9,2,b,2+3,3,1k+9,6+1,3+1,2+2,2+d,30g,p+y,1,1+1g,f+x,2,sd2+1d,jf3+4,f+3,2+4,2+2,b+3,42,2,4+2,2+1,2,3,t+1,9f+w,2,el+2,2+g,d+2,2l,2+1,5,3+1,2+1,2,3,6,16wm+1v", R: "17m+3,2,2,6+3,m,15+2,2+2,h+h,13,3+8,2,2,3+1,2,p+1,x,5+4,5,a,2,2,3,u,c+2,g+1,5,2+1,4+1,5j,6+1,2,b,2+2,f,2+1,1s+2,2,3+1,7,1ez0,2,2+1,4+4,b,4,3,b,42,2+2,4,3,2+1,2,o+3,ae,ep,x,2o+2,3+1,3,5+1,6", L: "x9u,jff,a,fd,jv", T: "4t,gj+33,7o+4,1+1,7c+18,2,2+1,2+1,2,21+a,2,1b+k,h,2u+6,3+5,3+1,2+3,y,2,v+q,2k+a,1n+8,a,p+3,2+8,2+2,2+4,18+2,3c+e,2+v,1k,2,5+7,5,4+6,b+1,u,1n,5+3,9,l+1,r,3+1,1m,5+1,5+1,3+2,4,v+1,4,c+1,1m,5+4,2+1,5,l+1,n+5,2,1n,3,2+3,9,8+1,c+1,v,1q,d,1f,4,1m+2,6+2,2+3,8+1,c+1,u,1n,3,7,6+1,l+1,t+1,1m+1,5+3,9,l+1,u,21,8+2,2,2j,3+6,d+7,2r,3+8,c+5,23+1,s,2,2,1k+d,2+4,2+1,6+a,2+z,a,2v+3,2+5,2+1,3+1,q+1,5+2,h+3,e,3+1,7,g,jk+2,qb+2,u+2,u+1,v+1,1t+1,2+6,9,3+a,a,1a+2,3c+1,z,3b+2,5+1,a,7+2,64+1,3,1n,2+6,2,2,3+7,7+9,3,1d+d,1,1+1,1s+3,1d,2+4,2,6,15+8,d+1,x+3,3+1,2+2,1l,2+1,4,2+2,1n+7,3+1,49+2,2+c,2+6,5,7,4+1,5j+1l,2+4,ek,3+1,r+4,1e+4,6+5,2p+c,1+3,1,1+2,1+b,2db+2,3y,2p+v,ff+3,30+1,n9x,1+2,2+9,x+1,29+1,7l,4,5,q+1,6,48+1,r+h,e,13+7,q+a,1b+2,1d,3+3,3+1,14,1w+5,3+1,3+1,d,9,1c,1g,2+2,3+1,6+1,2,17+1,9,6n,3,5,fn5,ki+f,h+f,5s,6y+2,ea,6b,46+4,1af+2,2+1,6+3,15+2,5,4m+1,fy+3,as+1,4a+a,4x,1j+e,1l+2,1e+3,3+1,1y+2,11+4,2+7,1r,d+1,1h+8,b+3,3,2o+2,3,2+1,7,4h,4+7,m+1,1m+1,4,12+6,4+4,5g+7,3+2,2,o,2d+5,2,5+1,2+1,6n+3,7+1,2+1,s+1,2e+7,3,2+1,2z,2,3+5,2,2u+2,3+3,2+4,78+8,2+1,75+1,2,5,41+3,3+1,5,x+9,15+5,3+3,9,a+5,3+2,1b+c,2+1,bb+6,2+5,2,2b+l,3+6,2+1,2+1,3f+5,4,2+1,2+6,2,21+1,4,2,9o+1,470+8,at4+4,1o+6,t5,1s+3,2a,f5l+1,2+3,43o+2,a+7,1+7,3+6,v+3,45+2,1j0+1i,5+1d,9,f,n+4,2+e,11t+6,2+g,3+6,2+1,2+4,7a+6,c6+3,15t+6,32+6,1,gzau,v+2n,3l+6n" }, r = 1, n = 2, o = 4, u = 8, l = 16, f = 32;
  let d;
  function p(b) {
    if (!d) {
      const L = {
        R: n,
        L: r,
        D: o,
        C: l,
        U: f,
        T: u
      };
      d = /* @__PURE__ */ new Map();
      for (let U in a) {
        let R = 0;
        a[U].split(",").forEach((I) => {
          let [k, O] = I.split("+");
          k = parseInt(k, 36), O = O ? parseInt(O, 36) : 0, d.set(R += k, L[U]);
          for (let N = O; N--; )
            d.set(++R, L[U]);
        });
      }
    }
    return d.get(b) || f;
  }
  const v = 1, g = 2, x = 3, E = 4, _ = [null, "isol", "init", "fina", "medi"];
  function S(b) {
    const L = new Uint8Array(b.length);
    let U = f, R = v, I = -1;
    for (let k = 0; k < b.length; k++) {
      const O = b.codePointAt(k);
      let N = p(O) | 0, J = v;
      N & u || (U & (r | o | l) ? N & (n | o | l) ? (J = x, (R === v || R === x) && L[I]++) : N & (r | f) && (R === g || R === E) && L[I]-- : U & (n | f) && (R === g || R === E) && L[I]--, R = L[k] = J, U = N, I = k, O > 65535 && k++);
    }
    return L;
  }
  function A(b, L) {
    const U = [];
    for (let I = 0; I < L.length; I++) {
      const k = L.codePointAt(I);
      k > 65535 && I++, U.push(c.U.codeToGlyph(b, k));
    }
    const R = b.GSUB;
    if (R) {
      const { lookupList: I, featureList: k } = R;
      let O;
      const N = /^(rlig|liga|mset|isol|init|fina|medi|half|pres|blws|ccmp)$/, J = [];
      k.forEach((Z) => {
        if (N.test(Z.tag))
          for (let ce = 0; ce < Z.tab.length; ce++) {
            if (J[Z.tab[ce]])
              continue;
            J[Z.tab[ce]] = !0;
            const K = I[Z.tab[ce]], V = /^(isol|init|fina|medi)$/.test(Z.tag);
            V && !O && (O = S(L));
            for (let G = 0; G < U.length; G++)
              (!O || !V || _[O[G]] === Z.tag) && c.U._applySubs(U, G, K, I);
          }
      });
    }
    return U;
  }
  function T(b, L) {
    const U = new Int16Array(L.length * 3);
    let R = 0;
    for (; R < L.length; R++) {
      const N = L[R];
      if (N === -1)
        continue;
      U[R * 3 + 2] = b.hmtx.aWidth[N];
      const J = b.GPOS;
      if (J) {
        const Z = J.lookupList;
        for (let ce = 0; ce < Z.length; ce++) {
          const K = Z[ce];
          for (let V = 0; V < K.tabs.length; V++) {
            const G = K.tabs[V];
            if (K.ltype === 1) {
              if (c._lctf.coverageIndex(G.coverage, N) !== -1 && G.pos) {
                O(G.pos, R);
                break;
              }
            } else if (K.ltype === 2) {
              let F = null, j = I();
              if (j !== -1) {
                const W = c._lctf.coverageIndex(G.coverage, L[j]);
                if (W !== -1) {
                  if (G.fmt === 1) {
                    const $ = G.pairsets[W];
                    for (let Y = 0; Y < $.length; Y++)
                      $[Y].gid2 === N && (F = $[Y]);
                  } else if (G.fmt === 2) {
                    const $ = c.U._getGlyphClass(L[j], G.classDef1), Y = c.U._getGlyphClass(N, G.classDef2);
                    F = G.matrix[$][Y];
                  }
                  if (F) {
                    F.val1 && O(F.val1, j), F.val2 && O(F.val2, R);
                    break;
                  }
                }
              }
            } else if (K.ltype === 4) {
              const F = c._lctf.coverageIndex(G.markCoverage, N);
              if (F !== -1) {
                const j = I(k), W = j === -1 ? -1 : c._lctf.coverageIndex(G.baseCoverage, L[j]);
                if (W !== -1) {
                  const $ = G.markArray[F], Y = G.baseArray[W][$.markClass];
                  U[R * 3] = Y.x - $.x + U[j * 3] - U[j * 3 + 2], U[R * 3 + 1] = Y.y - $.y + U[j * 3 + 1];
                  break;
                }
              }
            } else if (K.ltype === 6) {
              const F = c._lctf.coverageIndex(G.mark1Coverage, N);
              if (F !== -1) {
                const j = I();
                if (j !== -1) {
                  const W = L[j];
                  if (C(b, W) === 3) {
                    const $ = c._lctf.coverageIndex(G.mark2Coverage, W);
                    if ($ !== -1) {
                      const Y = G.mark1Array[F], se = G.mark2Array[$][Y.markClass];
                      U[R * 3] = se.x - Y.x + U[j * 3] - U[j * 3 + 2], U[R * 3 + 1] = se.y - Y.y + U[j * 3 + 1];
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      } else if (b.kern && !b.cff) {
        const Z = I();
        if (Z !== -1) {
          const ce = b.kern.glyph1.indexOf(L[Z]);
          if (ce !== -1) {
            const K = b.kern.rval[ce].glyph2.indexOf(N);
            K !== -1 && (U[Z * 3 + 2] += b.kern.rval[ce].vals[K]);
          }
        }
      }
    }
    return U;
    function I(N) {
      for (let J = R - 1; J >= 0; J--)
        if (L[J] !== -1 && (!N || N(L[J])))
          return J;
      return -1;
    }
    function k(N) {
      return C(b, N) === 1;
    }
    function O(N, J) {
      for (let Z = 0; Z < 3; Z++)
        U[J * 3 + Z] += N[Z] || 0;
    }
  }
  function C(b, L) {
    const U = b.GDEF && b.GDEF.glyphClassDef;
    return U ? c.U._getGlyphClass(L, U) : 0;
  }
  function P(...b) {
    for (let L = 0; L < b.length; L++)
      if (typeof b[L] == "number")
        return b[L];
  }
  function M(b) {
    const L = /* @__PURE__ */ Object.create(null), U = b["OS/2"], R = b.hhea, I = b.head.unitsPerEm, k = P(U && U.sTypoAscender, R && R.ascender, I), O = {
      unitsPerEm: I,
      ascender: k,
      descender: P(U && U.sTypoDescender, R && R.descender, 0),
      capHeight: P(U && U.sCapHeight, k),
      xHeight: P(U && U.sxHeight, k),
      lineGap: P(U && U.sTypoLineGap, R && R.lineGap),
      supportsCodePoint(N) {
        return c.U.codeToGlyph(b, N) > 0;
      },
      forEachGlyph(N, J, Z, ce) {
        let K = 0;
        const V = 1 / O.unitsPerEm * J, G = A(b, N);
        let F = 0;
        const j = T(b, G);
        return G.forEach((W, $) => {
          if (W !== -1) {
            let Y = L[W];
            if (!Y) {
              const { cmds: se, crds: X } = c.U.glyphToPath(b, W);
              let q = "", re = 0;
              for (let ve = 0, me = se.length; ve < me; ve++) {
                const we = s[se[ve]];
                q += se[ve];
                for (let Fe = 1; Fe <= we; Fe++)
                  q += (Fe > 1 ? "," : "") + X[re++];
              }
              let pe, ae, ie, fe;
              if (X.length) {
                pe = ae = 1 / 0, ie = fe = -1 / 0;
                for (let ve = 0, me = X.length; ve < me; ve += 2) {
                  let we = X[ve], Fe = X[ve + 1];
                  we < pe && (pe = we), Fe < ae && (ae = Fe), we > ie && (ie = we), Fe > fe && (fe = Fe);
                }
              } else
                pe = ie = ae = fe = 0;
              Y = L[W] = {
                index: W,
                advanceWidth: b.hmtx.aWidth[W],
                xMin: pe,
                yMin: ae,
                xMax: ie,
                yMax: fe,
                path: q
              };
            }
            ce.call(
              null,
              Y,
              K + j[$ * 3] * V,
              j[$ * 3 + 1] * V,
              F
            ), K += j[$ * 3 + 2] * V, Z && (K += Z * J);
          }
          F += N.codePointAt(F) > 65535 ? 2 : 1;
        }), K;
      }
    };
    return O;
  }
  return function(L) {
    const U = new Uint8Array(L, 0, 4), R = c._bin.readASCII(U, 0, 4);
    if (R === "wOFF")
      L = e(L);
    else if (R === "wOF2")
      throw new Error("woff2 fonts not supported");
    return M(c.parse(L)[0]);
  };
}
const A0 = /* @__PURE__ */ So({
  name: "Typr Font Parser",
  dependencies: [_0, T0, E0],
  init(c, e, s) {
    const a = c(), r = e();
    return s(a, r);
  }
});
/*!
Custom bundle of @unicode-font-resolver/client v1.0.2 (https://github.com/lojjic/unicode-font-resolver)
for use in Troika text rendering. 
Original MIT license applies
*/
function C0() {
  return function(c) {
    var e = function() {
      this.buckets = /* @__PURE__ */ new Map();
    };
    e.prototype.add = function(T) {
      var C = T >> 5;
      this.buckets.set(C, (this.buckets.get(C) || 0) | 1 << (31 & T));
    }, e.prototype.has = function(T) {
      var C = this.buckets.get(T >> 5);
      return C !== void 0 && (C & 1 << (31 & T)) != 0;
    }, e.prototype.serialize = function() {
      var T = [];
      return this.buckets.forEach(function(C, P) {
        T.push((+P).toString(36) + ":" + C.toString(36));
      }), T.join(",");
    }, e.prototype.deserialize = function(T) {
      var C = this;
      this.buckets.clear(), T.split(",").forEach(function(P) {
        var M = P.split(":");
        C.buckets.set(parseInt(M[0], 36), parseInt(M[1], 36));
      });
    };
    var s = Math.pow(2, 8), a = s - 1, r = ~a;
    function n(T) {
      var C = function(M) {
        return M & r;
      }(T).toString(16), P = function(M) {
        return (M & r) + s - 1;
      }(T).toString(16);
      return "codepoint-index/plane" + (T >> 16) + "/" + C + "-" + P + ".json";
    }
    function o(T, C) {
      var P = T & a, M = C.codePointAt(P / 6 | 0);
      return ((M = (M || 48) - 48) & 1 << P % 6) != 0;
    }
    function u(T, C) {
      var P;
      (P = T, P.replace(/U\+/gi, "").replace(/^,+|,+$/g, "").split(/,+/).map(function(M) {
        return M.split("-").map(function(b) {
          return parseInt(b.trim(), 16);
        });
      })).forEach(function(M) {
        var b = M[0], L = M[1];
        L === void 0 && (L = b), C(b, L);
      });
    }
    function l(T, C) {
      u(T, function(P, M) {
        for (var b = P; b <= M; b++)
          C(b);
      });
    }
    var f = {}, d = {}, p = /* @__PURE__ */ new WeakMap(), v = "https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data";
    function g(T) {
      var C = p.get(T);
      return C || (C = new e(), l(T.ranges, function(P) {
        return C.add(P);
      }), p.set(T, C)), C;
    }
    var x, E = /* @__PURE__ */ new Map();
    function _(T, C, P) {
      return T[C] ? C : T[P] ? P : function(M) {
        for (var b in M)
          return b;
      }(T);
    }
    function S(T, C) {
      var P = C;
      if (!T.includes(P)) {
        P = 1 / 0;
        for (var M = 0; M < T.length; M++)
          Math.abs(T[M] - C) < Math.abs(P - C) && (P = T[M]);
      }
      return P;
    }
    function A(T) {
      return x || (x = /* @__PURE__ */ new Set(), l("9-D,20,85,A0,1680,2000-200A,2028-202F,205F,3000", function(C) {
        x.add(C);
      })), x.has(T);
    }
    return c.CodePointSet = e, c.clearCache = function() {
      f = {}, d = {};
    }, c.getFontsForString = function(T, C) {
      C === void 0 && (C = {});
      var P, M = C.lang;
      M === void 0 && (M = /\p{Script=Hangul}/u.test(P = T) ? "ko" : /\p{Script=Hiragana}|\p{Script=Katakana}/u.test(P) ? "ja" : "en");
      var b = C.category;
      b === void 0 && (b = "sans-serif");
      var L = C.style;
      L === void 0 && (L = "normal");
      var U = C.weight;
      U === void 0 && (U = 400);
      var R = (C.dataUrl || v).replace(/\/$/g, ""), I = /* @__PURE__ */ new Map(), k = new Uint8Array(T.length), O = {}, N = {}, J = new Array(T.length), Z = /* @__PURE__ */ new Map(), ce = !1;
      function K(F) {
        var j = E.get(F);
        return j || (j = fetch(R + "/" + F).then(function(W) {
          if (!W.ok)
            throw new Error(W.statusText);
          return W.json().then(function($) {
            if (!Array.isArray($) || $[0] !== 1)
              throw new Error("Incorrect schema version; need 1, got " + $[0]);
            return $[1];
          });
        }).catch(function(W) {
          if (R !== v)
            return ce || (console.error('unicode-font-resolver: Failed loading from dataUrl "' + R + '", trying default CDN. ' + W.message), ce = !0), R = v, E.delete(F), K(F);
          throw W;
        }), E.set(F, j)), j;
      }
      for (var V = function(F) {
        var j = T.codePointAt(F), W = n(j);
        J[F] = W, f[W] || Z.has(W) || Z.set(W, K(W).then(function($) {
          f[W] = $;
        })), j > 65535 && (F++, G = F);
      }, G = 0; G < T.length; G++)
        V(G);
      return Promise.all(Z.values()).then(function() {
        Z.clear();
        for (var F = function(W) {
          var $ = T.codePointAt(W), Y = null, se = f[J[W]], X = void 0;
          for (var q in se) {
            var re = N[q];
            if (re === void 0 && (re = N[q] = new RegExp(q).test(M || "en")), re) {
              for (var pe in X = q, se[q])
                if (o($, se[q][pe])) {
                  Y = pe;
                  break;
                }
              break;
            }
          }
          if (!Y) {
            e:
              for (var ae in se)
                if (ae !== X) {
                  for (var ie in se[ae])
                    if (o($, se[ae][ie])) {
                      Y = ie;
                      break e;
                    }
                }
          }
          Y || (console.debug("No font coverage for U+" + $.toString(16)), Y = "latin"), J[W] = Y, d[Y] || Z.has(Y) || Z.set(Y, K("font-meta/" + Y + ".json").then(function(fe) {
            d[Y] = fe;
          })), $ > 65535 && (W++, j = W);
        }, j = 0; j < T.length; j++)
          F(j);
        return Promise.all(Z.values());
      }).then(function() {
        for (var F, j = null, W = 0; W < T.length; W++) {
          var $ = T.codePointAt(W);
          if (j && (A($) || g(j).has($)))
            k[W] = k[W - 1];
          else {
            j = d[J[W]];
            var Y = O[j.id];
            if (!Y) {
              var se = j.typeforms, X = _(se, b, "sans-serif"), q = _(se[X], L, "normal"), re = S((F = se[X]) === null || F === void 0 ? void 0 : F[q], U);
              Y = O[j.id] = R + "/font-files/" + j.id + "/" + X + "." + q + "." + re + ".woff";
            }
            var pe = I.get(Y);
            pe == null && (pe = I.size, I.set(Y, pe)), k[W] = pe;
          }
          $ > 65535 && (W++, k[W] = k[W - 1]);
        }
        return { fontUrls: Array.from(I.keys()), chars: k };
      });
    }, Object.defineProperty(c, "__esModule", { value: !0 }), c;
  }({});
}
function P0(c, e) {
  const s = /* @__PURE__ */ Object.create(null), a = /* @__PURE__ */ Object.create(null);
  function r(o, u) {
    const l = (f) => {
      console.error(`Failure loading font ${o}`, f);
    };
    try {
      const f = new XMLHttpRequest();
      f.open("get", o, !0), f.responseType = "arraybuffer", f.onload = function() {
        if (f.status >= 400)
          l(new Error(f.statusText));
        else if (f.status > 0)
          try {
            const d = c(f.response);
            d.src = o, u(d);
          } catch (d) {
            l(d);
          }
      }, f.onerror = l, f.send();
    } catch (f) {
      l(f);
    }
  }
  function n(o, u) {
    let l = s[o];
    l ? u(l) : a[o] ? a[o].push(u) : (a[o] = [u], r(o, (f) => {
      f.src = o, s[o] = f, a[o].forEach((d) => d(f)), delete a[o];
    }));
  }
  return function(o, u, {
    lang: l,
    fonts: f = [],
    style: d = "normal",
    weight: p = "normal",
    unicodeFontsURL: v
  } = {}) {
    const g = new Uint8Array(o.length), x = [];
    o.length || A();
    const E = /* @__PURE__ */ new Map(), _ = [];
    if (d !== "italic" && (d = "normal"), typeof p != "number" && (p = p === "bold" ? 700 : 400), f && !Array.isArray(f) && (f = [f]), f = f.slice().filter((C) => !C.lang || C.lang.test(l)).reverse(), f.length) {
      let b = 0;
      (function L(U = 0) {
        for (let R = U, I = o.length; R < I; R++) {
          const k = o.codePointAt(R);
          if (b === 1 && x[g[R - 1]].supportsCodePoint(k) || R > 0 && /\s/.test(o[R]))
            g[R] = g[R - 1], b === 2 && (_[_.length - 1][1] = R);
          else
            for (let O = g[R], N = f.length; O <= N; O++)
              if (O === N) {
                const J = b === 2 ? _[_.length - 1] : _[_.length] = [R, R];
                J[1] = R, b = 2;
              } else {
                g[R] = O;
                const { src: J, unicodeRange: Z } = f[O];
                if (!Z || T(k, Z)) {
                  const ce = s[J];
                  if (!ce) {
                    n(J, () => {
                      L(R);
                    });
                    return;
                  }
                  if (ce.supportsCodePoint(k)) {
                    let K = E.get(ce);
                    typeof K != "number" && (K = x.length, x.push(ce), E.set(ce, K)), g[R] = K, b = 1;
                    break;
                  }
                }
              }
          k > 65535 && R + 1 < I && (g[R + 1] = g[R], R++, b === 2 && (_[_.length - 1][1] = R));
        }
        S();
      })();
    } else
      _.push([0, o.length - 1]), S();
    function S() {
      if (_.length) {
        const C = _.map((P) => o.substring(P[0], P[1] + 1)).join(`
`);
        e.getFontsForString(C, {
          lang: l || void 0,
          style: d,
          weight: p,
          dataUrl: v
        }).then(({ fontUrls: P, chars: M }) => {
          const b = x.length;
          let L = 0;
          _.forEach((R) => {
            for (let I = 0, k = R[1] - R[0]; I <= k; I++)
              g[R[0] + I] = M[L++] + b;
            L++;
          });
          let U = 0;
          P.forEach((R, I) => {
            n(R, (k) => {
              x[I + b] = k, ++U === P.length && A();
            });
          });
        });
      } else
        A();
    }
    function A() {
      u({
        chars: g,
        fonts: x
      });
    }
    function T(C, P) {
      for (let M = 0; M < P.length; M++) {
        const [b, L = b] = P[M];
        if (b <= C && C <= L)
          return !0;
      }
      return !1;
    }
  };
}
const M0 = /* @__PURE__ */ So({
  name: "FontResolver",
  dependencies: [
    P0,
    A0,
    C0
  ],
  init(c, e, s) {
    return c(e, s());
  }
});
function b0(c, e) {
  const a = /[\u00AD\u034F\u061C\u115F-\u1160\u17B4-\u17B5\u180B-\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFF8]/, r = "[^\\S\\u00A0]", n = new RegExp(`${r}|[\\-\\u007C\\u00AD\\u2010\\u2012-\\u2014\\u2027\\u2056\\u2E17\\u2E40]`);
  function o({ text: x, lang: E, fonts: _, style: S, weight: A, preResolvedFonts: T, unicodeFontsURL: C }, P) {
    const M = ({ chars: b, fonts: L }) => {
      let U, R;
      const I = [];
      for (let k = 0; k < b.length; k++)
        b[k] !== R ? (R = b[k], I.push(U = { start: k, end: k, fontObj: L[b[k]] })) : U.end = k;
      P(I);
    };
    T ? M(T) : c(
      x,
      M,
      { lang: E, fonts: _, style: S, weight: A, unicodeFontsURL: C }
    );
  }
  function u({
    text: x = "",
    font: E,
    lang: _,
    sdfGlyphSize: S = 64,
    fontSize: A = 400,
    fontWeight: T = 1,
    fontStyle: C = "normal",
    letterSpacing: P = 0,
    lineHeight: M = "normal",
    maxWidth: b = 1 / 0,
    direction: L,
    textAlign: U = "left",
    textIndent: R = 0,
    whiteSpace: I = "normal",
    overflowWrap: k = "normal",
    anchorX: O = 0,
    anchorY: N = 0,
    metricsOnly: J = !1,
    unicodeFontsURL: Z,
    preResolvedFonts: ce = null,
    includeCaretPositions: K = !1,
    chunkedBoundsSize: V = 8192,
    colorRanges: G = null
  }, F) {
    const j = p(), W = { fontLoad: 0, typesetting: 0 };
    x.indexOf("\r") > -1 && (console.info("Typesetter: got text with \\r chars; normalizing to \\n"), x = x.replace(/\r\n/g, `
`).replace(/\r/g, `
`)), A = +A, P = +P, b = +b, M = M || "normal", R = +R, o({
      text: x,
      lang: _,
      style: C,
      weight: T,
      fonts: typeof E == "string" ? [{ src: E }] : E,
      unicodeFontsURL: Z,
      preResolvedFonts: ce
    }, ($) => {
      W.fontLoad = p() - j;
      const Y = isFinite(b);
      let se = null, X = null, q = null, re = null, pe = null, ae = null, ie = null, fe = null, ve = 0, me = 0, we = I !== "nowrap";
      const Fe = /* @__PURE__ */ new Map(), de = p();
      let Me = R, Te = 0, le = new v();
      const je = [le];
      $.forEach((be) => {
        const { fontObj: Le } = be, { ascender: Oe, descender: Ge, unitsPerEm: st, lineGap: ct, capHeight: Ke, xHeight: We } = Le;
        let Ue = Fe.get(Le);
        if (!Ue) {
          const Ae = A / st, Ye = M === "normal" ? (Oe - Ge + ct) * Ae : M * A, kt = (Ye - (Oe - Ge) * Ae) / 2, at = Math.min(Ye, (Oe - Ge) * Ae), Xe = (Oe + Ge) / 2 * Ae + at / 2;
          Ue = {
            index: Fe.size,
            src: Le.src,
            fontObj: Le,
            fontSizeMult: Ae,
            unitsPerEm: st,
            ascender: Oe * Ae,
            descender: Ge * Ae,
            capHeight: Ke * Ae,
            xHeight: We * Ae,
            lineHeight: Ye,
            baseline: -kt - Oe * Ae,
            // baseline offset from top of line height
            // cap: -halfLeading - capHeight * fontSizeMult, // cap from top of line height
            // ex: -halfLeading - xHeight * fontSizeMult, // ex from top of line height
            caretTop: Xe,
            caretBottom: Xe - at
          }, Fe.set(Le, Ue);
        }
        const { fontSizeMult: B } = Ue, ue = x.slice(be.start, be.end + 1);
        let Pe, Re;
        Le.forEachGlyph(ue, A, P, (Ae, Ye, kt, at) => {
          Ye += Te, at += be.start, Pe = Ye, Re = Ae;
          const Xe = x.charAt(at), nt = Ae.advanceWidth * B, et = le.count;
          let ze;
          if ("isEmpty" in Ae || (Ae.isWhitespace = !!Xe && new RegExp(r).test(Xe), Ae.canBreakAfter = !!Xe && n.test(Xe), Ae.isEmpty = Ae.xMin === Ae.xMax || Ae.yMin === Ae.yMax || a.test(Xe)), !Ae.isWhitespace && !Ae.isEmpty && me++, we && Y && !Ae.isWhitespace && Ye + nt + Me > b && et) {
            if (le.glyphAt(et - 1).glyphObj.canBreakAfter)
              ze = new v(), Me = -Ye;
            else
              for (let pt = et; pt--; )
                if (pt === 0 && k === "break-word") {
                  ze = new v(), Me = -Ye;
                  break;
                } else if (le.glyphAt(pt).glyphObj.canBreakAfter) {
                  ze = le.splitAt(pt + 1);
                  const vt = ze.glyphAt(0).x;
                  Me -= vt;
                  for (let Et = ze.count; Et--; )
                    ze.glyphAt(Et).x -= vt;
                  break;
                }
            ze && (le.isSoftWrapped = !0, le = ze, je.push(le), ve = b);
          }
          let rt = le.glyphAt(le.count);
          rt.glyphObj = Ae, rt.x = Ye + Me, rt.y = kt, rt.width = nt, rt.charIndex = at, rt.fontData = Ue, Xe === `
` && (le = new v(), je.push(le), Me = -(Ye + nt + P * A) + R);
        }), Te = Pe + Re.advanceWidth * B + P * A;
      });
      let _e = 0;
      je.forEach((be) => {
        let Le = !0;
        for (let Oe = be.count; Oe--; ) {
          const Ge = be.glyphAt(Oe);
          Le && !Ge.glyphObj.isWhitespace && (be.width = Ge.x + Ge.width, be.width > ve && (ve = be.width), Le = !1);
          let { lineHeight: st, capHeight: ct, xHeight: Ke, baseline: We } = Ge.fontData;
          st > be.lineHeight && (be.lineHeight = st);
          const Ue = We - be.baseline;
          Ue < 0 && (be.baseline += Ue, be.cap += Ue, be.ex += Ue), be.cap = Math.max(be.cap, be.baseline + ct), be.ex = Math.max(be.ex, be.baseline + Ke);
        }
        be.baseline -= _e, be.cap -= _e, be.ex -= _e, _e += be.lineHeight;
      });
      let Ee = 0, xe = 0;
      if (O && (typeof O == "number" ? Ee = -O : typeof O == "string" && (Ee = -ve * (O === "left" ? 0 : O === "center" ? 0.5 : O === "right" ? 1 : f(O)))), N && (typeof N == "number" ? xe = -N : typeof N == "string" && (xe = N === "top" ? 0 : N === "top-baseline" ? -je[0].baseline : N === "top-cap" ? -je[0].cap : N === "top-ex" ? -je[0].ex : N === "middle" ? _e / 2 : N === "bottom" ? _e : N === "bottom-baseline" ? -je[je.length - 1].baseline : f(N) * _e)), !J) {
        const be = e.getEmbeddingLevels(x, L);
        se = new Uint16Array(me), X = new Uint8Array(me), q = new Float32Array(me * 2), re = {}, ie = [1 / 0, 1 / 0, -1 / 0, -1 / 0], fe = [], K && (ae = new Float32Array(x.length * 4)), G && (pe = new Uint8Array(me * 3));
        let Le = 0, Oe = -1, Ge = -1, st, ct;
        if (je.forEach((Ke, We) => {
          let { count: Ue, width: B } = Ke;
          if (Ue > 0) {
            let ue = 0;
            for (let at = Ue; at-- && Ke.glyphAt(at).glyphObj.isWhitespace; )
              ue++;
            let Pe = 0, Re = 0;
            if (U === "center")
              Pe = (ve - B) / 2;
            else if (U === "right")
              Pe = ve - B;
            else if (U === "justify" && Ke.isSoftWrapped) {
              let at = 0;
              for (let Xe = Ue - ue; Xe--; )
                Ke.glyphAt(Xe).glyphObj.isWhitespace && at++;
              Re = (ve - B) / at;
            }
            if (Re || Pe) {
              let at = 0;
              for (let Xe = 0; Xe < Ue; Xe++) {
                let nt = Ke.glyphAt(Xe);
                const et = nt.glyphObj;
                nt.x += Pe + at, Re !== 0 && et.isWhitespace && Xe < Ue - ue && (at += Re, nt.width += Re);
              }
            }
            const Ae = e.getReorderSegments(
              x,
              be,
              Ke.glyphAt(0).charIndex,
              Ke.glyphAt(Ke.count - 1).charIndex
            );
            for (let at = 0; at < Ae.length; at++) {
              const [Xe, nt] = Ae[at];
              let et = 1 / 0, ze = -1 / 0;
              for (let rt = 0; rt < Ue; rt++)
                if (Ke.glyphAt(rt).charIndex >= Xe) {
                  let pt = rt, vt = rt;
                  for (; vt < Ue; vt++) {
                    let Et = Ke.glyphAt(vt);
                    if (Et.charIndex > nt)
                      break;
                    vt < Ue - ue && (et = Math.min(et, Et.x), ze = Math.max(ze, Et.x + Et.width));
                  }
                  for (let Et = pt; Et < vt; Et++) {
                    const pn = Ke.glyphAt(Et);
                    pn.x = ze - (pn.x + pn.width - et);
                  }
                  break;
                }
            }
            let Ye;
            const kt = (at) => Ye = at;
            for (let at = 0; at < Ue; at++) {
              const Xe = Ke.glyphAt(at);
              Ye = Xe.glyphObj;
              const nt = Ye.index, et = be.levels[Xe.charIndex] & 1;
              if (et) {
                const ze = e.getMirroredCharacter(x[Xe.charIndex]);
                ze && Xe.fontData.fontObj.forEachGlyph(ze, 0, 0, kt);
              }
              if (K) {
                const { charIndex: ze, fontData: rt } = Xe, pt = Xe.x + Ee, vt = Xe.x + Xe.width + Ee;
                ae[ze * 4] = et ? vt : pt, ae[ze * 4 + 1] = et ? pt : vt, ae[ze * 4 + 2] = Ke.baseline + rt.caretBottom + xe, ae[ze * 4 + 3] = Ke.baseline + rt.caretTop + xe;
                const Et = ze - Oe;
                Et > 1 && d(ae, Oe, Et), Oe = ze;
              }
              if (G) {
                const { charIndex: ze } = Xe;
                for (; ze > Ge; )
                  Ge++, G.hasOwnProperty(Ge) && (ct = G[Ge]);
              }
              if (!Ye.isWhitespace && !Ye.isEmpty) {
                const ze = Le++, { fontSizeMult: rt, src: pt, index: vt } = Xe.fontData, Et = re[pt] || (re[pt] = {});
                Et[nt] || (Et[nt] = {
                  path: Ye.path,
                  pathBounds: [Ye.xMin, Ye.yMin, Ye.xMax, Ye.yMax]
                });
                const pn = Xe.x + Ee, Kn = Xe.y + Ke.baseline + xe;
                q[ze * 2] = pn, q[ze * 2 + 1] = Kn;
                const mn = pn + Ye.xMin * rt, rr = Kn + Ye.yMin * rt, vn = pn + Ye.xMax * rt, Yn = Kn + Ye.yMax * rt;
                mn < ie[0] && (ie[0] = mn), rr < ie[1] && (ie[1] = rr), vn > ie[2] && (ie[2] = vn), Yn > ie[3] && (ie[3] = Yn), ze % V === 0 && (st = { start: ze, end: ze, rect: [1 / 0, 1 / 0, -1 / 0, -1 / 0] }, fe.push(st)), st.end++;
                const Gt = st.rect;
                if (mn < Gt[0] && (Gt[0] = mn), rr < Gt[1] && (Gt[1] = rr), vn > Gt[2] && (Gt[2] = vn), Yn > Gt[3] && (Gt[3] = Yn), se[ze] = nt, X[ze] = vt, G) {
                  const xr = ze * 3;
                  pe[xr] = ct >> 16 & 255, pe[xr + 1] = ct >> 8 & 255, pe[xr + 2] = ct & 255;
                }
              }
            }
          }
        }), ae) {
          const Ke = x.length - Oe;
          Ke > 1 && d(ae, Oe, Ke);
        }
      }
      const tt = [];
      Fe.forEach(({ index: be, src: Le, unitsPerEm: Oe, ascender: Ge, descender: st, lineHeight: ct, capHeight: Ke, xHeight: We }) => {
        tt[be] = { src: Le, unitsPerEm: Oe, ascender: Ge, descender: st, lineHeight: ct, capHeight: Ke, xHeight: We };
      }), W.typesetting = p() - de, F({
        glyphIds: se,
        //id for each glyph, specific to that glyph's font
        glyphFontIndices: X,
        //index into fontData for each glyph
        glyphPositions: q,
        //x,y of each glyph's origin in layout
        glyphData: re,
        //dict holding data about each glyph appearing in the text
        fontData: tt,
        //data about each font used in the text
        caretPositions: ae,
        //startX,endX,bottomY caret positions for each char
        // caretHeight, //height of cursor from bottom to top - todo per glyph?
        glyphColors: pe,
        //color for each glyph, if color ranges supplied
        chunkedBounds: fe,
        //total rects per (n=chunkedBoundsSize) consecutive glyphs
        fontSize: A,
        //calculated em height
        topBaseline: xe + je[0].baseline,
        //y coordinate of the top line's baseline
        blockBounds: [
          //bounds for the whole block of text, including vertical padding for lineHeight
          Ee,
          xe - _e,
          Ee + ve,
          xe
        ],
        visibleBounds: ie,
        //total bounds of visible text paths, may be larger or smaller than blockBounds
        timings: W
      });
    });
  }
  function l(x, E) {
    u({ ...x, metricsOnly: !0 }, (_) => {
      const [S, A, T, C] = _.blockBounds;
      E({
        width: T - S,
        height: C - A
      });
    });
  }
  function f(x) {
    let E = x.match(/^([\d.]+)%$/), _ = E ? parseFloat(E[1]) : NaN;
    return isNaN(_) ? 0 : _ / 100;
  }
  function d(x, E, _) {
    const S = x[E * 4], A = x[E * 4 + 1], T = x[E * 4 + 2], C = x[E * 4 + 3], P = (A - S) / _;
    for (let M = 0; M < _; M++) {
      const b = (E + M) * 4;
      x[b] = S + P * M, x[b + 1] = S + P * (M + 1), x[b + 2] = T, x[b + 3] = C;
    }
  }
  function p() {
    return (self.performance || Date).now();
  }
  function v() {
    this.data = [];
  }
  const g = ["glyphObj", "x", "y", "width", "charIndex", "fontData"];
  return v.prototype = {
    width: 0,
    lineHeight: 0,
    baseline: 0,
    cap: 0,
    ex: 0,
    isSoftWrapped: !1,
    get count() {
      return Math.ceil(this.data.length / g.length);
    },
    glyphAt(x) {
      let E = v.flyweight;
      return E.data = this.data, E.index = x, E;
    },
    splitAt(x) {
      let E = new v();
      return E.data = this.data.splice(x * g.length), E;
    }
  }, v.flyweight = g.reduce((x, E, _, S) => (Object.defineProperty(x, E, {
    get() {
      return this.data[this.index * g.length + _];
    },
    set(A) {
      this.data[this.index * g.length + _] = A;
    }
  }), x), { data: null, index: 0 }), {
    typeset: u,
    measure: l
  };
}
const Ei = () => (self.performance || Date).now(), Ka = /* @__PURE__ */ Xh();
let Ld;
function L0(c, e, s, a, r, n, o, u, l, f, d = !0) {
  return d ? k0(c, e, s, a, r, n, o, u, l, f).then(
    null,
    (p) => (Ld || (console.warn("WebGL SDF generation failed, falling back to JS", p), Ld = !0), kd(c, e, s, a, r, n, o, u, l, f))
  ) : kd(c, e, s, a, r, n, o, u, l, f);
}
const za = [], R0 = 5;
let Ou = 0;
function Yh() {
  const c = Ei();
  for (; za.length && Ei() - c < R0; )
    za.shift()();
  Ou = za.length ? setTimeout(Yh, 0) : 0;
}
const k0 = (...c) => new Promise((e, s) => {
  za.push(() => {
    const a = Ei();
    try {
      Ka.webgl.generateIntoCanvas(...c), e({ timing: Ei() - a });
    } catch (r) {
      s(r);
    }
  }), Ou || (Ou = setTimeout(Yh, 0));
}), U0 = 4, D0 = 2e3, Rd = {};
let F0 = 0;
function kd(c, e, s, a, r, n, o, u, l, f) {
  const d = "TroikaTextSDFGenerator_JS_" + F0++ % U0;
  let p = Rd[d];
  return p || (p = Rd[d] = {
    workerModule: So({
      name: d,
      workerId: d,
      dependencies: [
        Xh,
        Ei
      ],
      init(v, g) {
        const x = v().javascript.generate;
        return function(...E) {
          const _ = g();
          return {
            textureData: x(...E),
            timing: g() - _
          };
        };
      },
      getTransferables(v) {
        return [v.textureData.buffer];
      }
    }),
    requests: 0,
    idleTimer: null
  }), p.requests++, clearTimeout(p.idleTimer), p.workerModule(c, e, s, a, r, n).then(({ textureData: v, timing: g }) => {
    const x = Ei(), E = new Uint8Array(v.length * 4);
    for (let _ = 0; _ < v.length; _++)
      E[_ * 4 + f] = v[_];
    return Ka.webglUtils.renderImageData(o, E, u, l, c, e, 1 << 3 - f), g += Ei() - x, --p.requests === 0 && (p.idleTimer = setTimeout(() => {
      d0(d);
    }, D0)), { timing: g };
  });
}
function I0(c) {
  c._warm || (Ka.webgl.isSupported(c), c._warm = !0);
}
const O0 = Ka.webglUtils.resizeWebGLCanvasWithoutClearing, fo = {
  defaultFontURL: null,
  unicodeFontsURL: null,
  sdfGlyphSize: 64,
  sdfMargin: 1 / 16,
  sdfExponent: 9,
  textureWidth: 2048,
  useWorker: !0
}, N0 = /* @__PURE__ */ new Wn();
function Ji() {
  return (self.performance || Date).now();
}
const Ud = /* @__PURE__ */ Object.create(null);
function Qh(c, e) {
  c = j0({}, c);
  const s = Ji(), { defaultFontURL: a } = fo, r = [];
  if (a && r.push({ label: "default", src: Dd(a) }), c.font && r.push({ label: "user", src: Dd(c.font) }), c.font = r, c.text = "" + c.text, c.sdfGlyphSize = c.sdfGlyphSize || fo.sdfGlyphSize, c.unicodeFontsURL = c.unicodeFontsURL || fo.unicodeFontsURL, c.colorRanges != null) {
    let g = {};
    for (let x in c.colorRanges)
      if (c.colorRanges.hasOwnProperty(x)) {
        let E = c.colorRanges[x];
        typeof E != "number" && (E = N0.set(E).getHex()), g[x] = E;
      }
    c.colorRanges = g;
  }
  Object.freeze(c);
  const { textureWidth: n, sdfExponent: o } = fo, { sdfGlyphSize: u } = c, l = n / u * 4;
  let f = Ud[u];
  if (!f) {
    const g = document.createElement("canvas");
    g.width = n, g.height = u * 256 / l, f = Ud[u] = {
      glyphCount: 0,
      sdfGlyphSize: u,
      sdfCanvas: g,
      sdfTexture: new Au(
        g,
        void 0,
        void 0,
        void 0,
        vo,
        vo
      ),
      contextLost: !1,
      glyphsByFont: /* @__PURE__ */ new Map()
    }, f.sdfTexture.generateMipmaps = !1, B0(f);
  }
  const { sdfTexture: d, sdfCanvas: p } = f;
  Jh(c).then((g) => {
    const { glyphIds: x, glyphFontIndices: E, fontData: _, glyphPositions: S, fontSize: A, timings: T } = g, C = [], P = new Float32Array(x.length * 4);
    let M = 0, b = 0;
    const L = Ji(), U = _.map((N) => {
      let J = f.glyphsByFont.get(N.src);
      return J || f.glyphsByFont.set(N.src, J = /* @__PURE__ */ new Map()), J;
    });
    x.forEach((N, J) => {
      const Z = E[J], { src: ce, unitsPerEm: K } = _[Z];
      let V = U[Z].get(N);
      if (!V) {
        const { path: $, pathBounds: Y } = g.glyphData[ce][N], se = Math.max(Y[2] - Y[0], Y[3] - Y[1]) / u * (fo.sdfMargin * u + 0.5), X = f.glyphCount++, q = [
          Y[0] - se,
          Y[1] - se,
          Y[2] + se,
          Y[3] + se
        ];
        U[Z].set(N, V = { path: $, atlasIndex: X, sdfViewBox: q }), C.push(V);
      }
      const { sdfViewBox: G } = V, F = S[b++], j = S[b++], W = A / K;
      P[M++] = F + G[0] * W, P[M++] = j + G[1] * W, P[M++] = F + G[2] * W, P[M++] = j + G[3] * W, x[J] = V.atlasIndex;
    }), T.quads = (T.quads || 0) + (Ji() - L);
    const R = Ji();
    T.sdf = {};
    const I = p.height, k = Math.ceil(f.glyphCount / l), O = Math.pow(2, Math.ceil(Math.log2(k * u)));
    O > I && (console.info(`Increasing SDF texture size ${I}->${O}`), O0(p, n, O), d.dispose()), Promise.all(C.map(
      (N) => qh(N, f, c.gpuAccelerateSDF).then(({ timing: J }) => {
        T.sdf[N.atlasIndex] = J;
      })
    )).then(() => {
      C.length && !f.contextLost && (Zh(f), d.needsUpdate = !0), T.sdfTotal = Ji() - R, T.total = Ji() - s, e(Object.freeze({
        parameters: c,
        sdfTexture: d,
        sdfGlyphSize: u,
        sdfExponent: o,
        glyphBounds: P,
        glyphAtlasIndices: x,
        glyphColors: g.glyphColors,
        caretPositions: g.caretPositions,
        chunkedBounds: g.chunkedBounds,
        ascender: g.ascender,
        descender: g.descender,
        lineHeight: g.lineHeight,
        capHeight: g.capHeight,
        xHeight: g.xHeight,
        topBaseline: g.topBaseline,
        blockBounds: g.blockBounds,
        visibleBounds: g.visibleBounds,
        timings: g.timings
      }));
    });
  }), Promise.resolve().then(() => {
    f.contextLost || I0(p);
  });
}
function qh({ path: c, atlasIndex: e, sdfViewBox: s }, { sdfGlyphSize: a, sdfCanvas: r, contextLost: n }, o) {
  if (n)
    return Promise.resolve({ timing: -1 });
  const { textureWidth: u, sdfExponent: l } = fo, f = Math.max(s[2] - s[0], s[3] - s[1]), d = Math.floor(e / 4), p = d % (u / a) * a, v = Math.floor(d / (u / a)) * a, g = e % 4;
  return L0(a, a, c, s, f, l, r, p, v, g, o);
}
function B0(c) {
  const e = c.sdfCanvas;
  e.addEventListener("webglcontextlost", (s) => {
    console.log("Context Lost", s), s.preventDefault(), c.contextLost = !0;
  }), e.addEventListener("webglcontextrestored", (s) => {
    console.log("Context Restored", s), c.contextLost = !1;
    const a = [];
    c.glyphsByFont.forEach((r) => {
      r.forEach((n) => {
        a.push(qh(n, c, !0));
      });
    }), Promise.all(a).then(() => {
      Zh(c), c.sdfTexture.needsUpdate = !0;
    });
  });
}
function z0({ font: c, characters: e, sdfGlyphSize: s }, a) {
  let r = Array.isArray(e) ? e.join(`
`) : "" + e;
  Qh({ font: c, sdfGlyphSize: s, text: r }, a);
}
function j0(c, e) {
  for (let s in e)
    e.hasOwnProperty(s) && (c[s] = e[s]);
  return c;
}
let xa;
function Dd(c) {
  return xa || (xa = typeof document > "u" ? {} : document.createElement("a")), xa.href = c, xa.href;
}
function Zh(c) {
  if (typeof createImageBitmap != "function") {
    console.info("Safari<15: applying SDF canvas workaround");
    const { sdfCanvas: e, sdfTexture: s } = c, { width: a, height: r } = e, n = c.sdfCanvas.getContext("webgl");
    let o = s.image.data;
    (!o || o.length !== a * r * 4) && (o = new Uint8Array(a * r * 4), s.image = { width: a, height: r, data: o }, s.flipY = !1, s.isDataTexture = !0), n.readPixels(0, 0, a, r, n.RGBA, n.UNSIGNED_BYTE, o);
  }
}
const G0 = /* @__PURE__ */ So({
  name: "Typesetter",
  dependencies: [
    b0,
    M0,
    p0
  ],
  init(c, e, s) {
    return c(e, s());
  }
}), Jh = /* @__PURE__ */ So({
  name: "Typesetter",
  dependencies: [
    G0
  ],
  init(c) {
    return function(e) {
      return new Promise((s) => {
        c.typeset(e, s);
      });
    };
  },
  getTransferables(c) {
    const e = [];
    for (let s in c)
      c[s] && c[s].buffer && e.push(c[s].buffer);
    return e;
  }
});
Jh.onMainThread;
const Fd = {};
function H0(c) {
  let e = Fd[c];
  return e || (e = Fd[c] = new Zu(1, 1, c, c).translate(0.5, 0.5, 0)), e;
}
const V0 = "aTroikaGlyphBounds", Id = "aTroikaGlyphIndex", W0 = "aTroikaGlyphColor";
class X0 extends hh {
  constructor() {
    super(), this.detail = 1, this.curveRadius = 0, this.groups = [
      { start: 0, count: 1 / 0, materialIndex: 0 },
      { start: 0, count: 1 / 0, materialIndex: 1 }
    ], this.boundingSphere = new $r(), this.boundingBox = new Mt();
  }
  computeBoundingSphere() {
  }
  computeBoundingBox() {
  }
  set detail(e) {
    if (e !== this._detail) {
      this._detail = e, (typeof e != "number" || e < 1) && (e = 1);
      let s = H0(e);
      ["position", "normal", "uv"].forEach((a) => {
        this.attributes[a] = s.attributes[a].clone();
      }), this.setIndex(s.getIndex().clone());
    }
  }
  get detail() {
    return this._detail;
  }
  set curveRadius(e) {
    e !== this._curveRadius && (this._curveRadius = e, this._updateBounds());
  }
  get curveRadius() {
    return this._curveRadius;
  }
  /**
   * Update the geometry for a new set of glyphs.
   * @param {Float32Array} glyphBounds - An array holding the planar bounds for all glyphs
   *        to be rendered, 4 entries for each glyph: x1,x2,y1,y1
   * @param {Float32Array} glyphAtlasIndices - An array holding the index of each glyph within
   *        the SDF atlas texture.
   * @param {Array} blockBounds - An array holding the [minX, minY, maxX, maxY] across all glyphs
   * @param {Array} [chunkedBounds] - An array of objects describing bounds for each chunk of N
   *        consecutive glyphs: `{start:N, end:N, rect:[minX, minY, maxX, maxY]}`. This can be
   *        used with `applyClipRect` to choose an optimized `instanceCount`.
   * @param {Uint8Array} [glyphColors] - An array holding r,g,b values for each glyph.
   */
  updateGlyphs(e, s, a, r, n) {
    this.updateAttributeData(V0, e, 4), this.updateAttributeData(Id, s, 1), this.updateAttributeData(W0, n, 3), this._blockBounds = a, this._chunkedBounds = r, this.instanceCount = s.length, this._updateBounds();
  }
  _updateBounds() {
    const e = this._blockBounds;
    if (e) {
      const { curveRadius: s, boundingBox: a } = this;
      if (s) {
        const { PI: r, floor: n, min: o, max: u, sin: l, cos: f } = Math, d = r / 2, p = r * 2, v = Math.abs(s), g = e[0] / v, x = e[2] / v, E = n((g + d) / p) !== n((x + d) / p) ? -v : o(l(g) * v, l(x) * v), _ = n((g - d) / p) !== n((x - d) / p) ? v : u(l(g) * v, l(x) * v), S = n((g + r) / p) !== n((x + r) / p) ? v * 2 : u(v - f(g) * v, v - f(x) * v);
        a.min.set(E, e[1], s < 0 ? -S : 0), a.max.set(_, e[3], s < 0 ? 0 : S);
      } else
        a.min.set(e[0], e[1], 0), a.max.set(e[2], e[3], 0);
      a.getBoundingSphere(this.boundingSphere);
    }
  }
  /**
   * Given a clipping rect, and the chunkedBounds from the last updateGlyphs call, choose the lowest
   * `instanceCount` that will show all glyphs within the clipped view. This is an optimization
   * for long blocks of text that are clipped, to skip vertex shader evaluation for glyphs that would
   * be clipped anyway.
   *
   * Note that since `drawElementsInstanced[ANGLE]` only accepts an instance count and not a starting
   * offset, this optimization becomes less effective as the clipRect moves closer to the end of the
   * text block. We could fix that by switching from instancing to a full geometry with a drawRange,
   * but at the expense of much larger attribute buffers (see classdoc above.)
   *
   * @param {Vector4} clipRect
   */
  applyClipRect(e) {
    let s = this.getAttribute(Id).count, a = this._chunkedBounds;
    if (a)
      for (let r = a.length; r--; ) {
        s = a[r].end;
        let n = a[r].rect;
        if (n[1] < e.w && n[3] > e.y && n[0] < e.z && n[2] > e.x)
          break;
      }
    this.instanceCount = s;
  }
  /**
   * Utility for updating instance attributes with automatic resizing
   */
  updateAttributeData(e, s, a) {
    const r = this.getAttribute(e);
    s ? r && r.array.length === s.length ? (r.array.set(s), r.needsUpdate = !0) : (this.setAttribute(e, new lh(s, a)), delete this._maxInstanceCount, this.dispose()) : r && this.deleteAttribute(e);
  }
}
const K0 = `
uniform vec2 uTroikaSDFTextureSize;
uniform float uTroikaSDFGlyphSize;
uniform vec4 uTroikaTotalBounds;
uniform vec4 uTroikaClipRect;
uniform mat3 uTroikaOrient;
uniform bool uTroikaUseGlyphColors;
uniform float uTroikaEdgeOffset;
uniform float uTroikaBlurRadius;
uniform vec2 uTroikaPositionOffset;
uniform float uTroikaCurveRadius;
attribute vec4 aTroikaGlyphBounds;
attribute float aTroikaGlyphIndex;
attribute vec3 aTroikaGlyphColor;
varying vec2 vTroikaGlyphUV;
varying vec4 vTroikaTextureUVBounds;
varying float vTroikaTextureChannel;
varying vec3 vTroikaGlyphColor;
varying vec2 vTroikaGlyphDimensions;
`, Y0 = `
vec4 bounds = aTroikaGlyphBounds;
bounds.xz += uTroikaPositionOffset.x;
bounds.yw -= uTroikaPositionOffset.y;

vec4 outlineBounds = vec4(
  bounds.xy - uTroikaEdgeOffset - uTroikaBlurRadius,
  bounds.zw + uTroikaEdgeOffset + uTroikaBlurRadius
);
vec4 clippedBounds = vec4(
  clamp(outlineBounds.xy, uTroikaClipRect.xy, uTroikaClipRect.zw),
  clamp(outlineBounds.zw, uTroikaClipRect.xy, uTroikaClipRect.zw)
);

vec2 clippedXY = (mix(clippedBounds.xy, clippedBounds.zw, position.xy) - bounds.xy) / (bounds.zw - bounds.xy);

position.xy = mix(bounds.xy, bounds.zw, clippedXY);

uv = (position.xy - uTroikaTotalBounds.xy) / (uTroikaTotalBounds.zw - uTroikaTotalBounds.xy);

float rad = uTroikaCurveRadius;
if (rad != 0.0) {
  float angle = position.x / rad;
  position.xz = vec2(sin(angle) * rad, rad - cos(angle) * rad);
  normal.xz = vec2(sin(angle), cos(angle));
}
  
position = uTroikaOrient * position;
normal = uTroikaOrient * normal;

vTroikaGlyphUV = clippedXY.xy;
vTroikaGlyphDimensions = vec2(bounds[2] - bounds[0], bounds[3] - bounds[1]);


float txCols = uTroikaSDFTextureSize.x / uTroikaSDFGlyphSize;
vec2 txUvPerSquare = uTroikaSDFGlyphSize / uTroikaSDFTextureSize;
vec2 txStartUV = txUvPerSquare * vec2(
  mod(floor(aTroikaGlyphIndex / 4.0), txCols),
  floor(floor(aTroikaGlyphIndex / 4.0) / txCols)
);
vTroikaTextureUVBounds = vec4(txStartUV, vec2(txStartUV) + txUvPerSquare);
vTroikaTextureChannel = mod(aTroikaGlyphIndex, 4.0);
`, Q0 = `
uniform sampler2D uTroikaSDFTexture;
uniform vec2 uTroikaSDFTextureSize;
uniform float uTroikaSDFGlyphSize;
uniform float uTroikaSDFExponent;
uniform float uTroikaEdgeOffset;
uniform float uTroikaFillOpacity;
uniform float uTroikaBlurRadius;
uniform vec3 uTroikaStrokeColor;
uniform float uTroikaStrokeWidth;
uniform float uTroikaStrokeOpacity;
uniform bool uTroikaSDFDebug;
varying vec2 vTroikaGlyphUV;
varying vec4 vTroikaTextureUVBounds;
varying float vTroikaTextureChannel;
varying vec2 vTroikaGlyphDimensions;

float troikaSdfValueToSignedDistance(float alpha) {
  // Inverse of exponential encoding in webgl-sdf-generator
  
  float maxDimension = max(vTroikaGlyphDimensions.x, vTroikaGlyphDimensions.y);
  float absDist = (1.0 - pow(2.0 * (alpha > 0.5 ? 1.0 - alpha : alpha), 1.0 / uTroikaSDFExponent)) * maxDimension;
  float signedDist = absDist * (alpha > 0.5 ? -1.0 : 1.0);
  return signedDist;
}

float troikaGlyphUvToSdfValue(vec2 glyphUV) {
  vec2 textureUV = mix(vTroikaTextureUVBounds.xy, vTroikaTextureUVBounds.zw, glyphUV);
  vec4 rgba = texture2D(uTroikaSDFTexture, textureUV);
  float ch = floor(vTroikaTextureChannel + 0.5); //NOTE: can't use round() in WebGL1
  return ch == 0.0 ? rgba.r : ch == 1.0 ? rgba.g : ch == 2.0 ? rgba.b : rgba.a;
}

float troikaGlyphUvToDistance(vec2 uv) {
  return troikaSdfValueToSignedDistance(troikaGlyphUvToSdfValue(uv));
}

float troikaGetAADist() {
  
  #if defined(GL_OES_standard_derivatives) || __VERSION__ >= 300
  return length(fwidth(vTroikaGlyphUV * vTroikaGlyphDimensions)) * 0.5;
  #else
  return vTroikaGlyphDimensions.x / 64.0;
  #endif
}

float troikaGetFragDistValue() {
  vec2 clampedGlyphUV = clamp(vTroikaGlyphUV, 0.5 / uTroikaSDFGlyphSize, 1.0 - 0.5 / uTroikaSDFGlyphSize);
  float distance = troikaGlyphUvToDistance(clampedGlyphUV);
 
  // Extrapolate distance when outside bounds:
  distance += clampedGlyphUV == vTroikaGlyphUV ? 0.0 : 
    length((vTroikaGlyphUV - clampedGlyphUV) * vTroikaGlyphDimensions);

  

  return distance;
}

float troikaGetEdgeAlpha(float distance, float distanceOffset, float aaDist) {
  #if defined(IS_DEPTH_MATERIAL) || defined(IS_DISTANCE_MATERIAL)
  float alpha = step(-distanceOffset, -distance);
  #else

  float alpha = smoothstep(
    distanceOffset + aaDist,
    distanceOffset - aaDist,
    distance
  );
  #endif

  return alpha;
}
`, q0 = `
float aaDist = troikaGetAADist();
float fragDistance = troikaGetFragDistValue();
float edgeAlpha = uTroikaSDFDebug ?
  troikaGlyphUvToSdfValue(vTroikaGlyphUV) :
  troikaGetEdgeAlpha(fragDistance, uTroikaEdgeOffset, max(aaDist, uTroikaBlurRadius));

#if !defined(IS_DEPTH_MATERIAL) && !defined(IS_DISTANCE_MATERIAL)
vec4 fillRGBA = gl_FragColor;
fillRGBA.a *= uTroikaFillOpacity;
vec4 strokeRGBA = uTroikaStrokeWidth == 0.0 ? fillRGBA : vec4(uTroikaStrokeColor, uTroikaStrokeOpacity);
if (fillRGBA.a == 0.0) fillRGBA.rgb = strokeRGBA.rgb;
gl_FragColor = mix(fillRGBA, strokeRGBA, smoothstep(
  -uTroikaStrokeWidth - aaDist,
  -uTroikaStrokeWidth + aaDist,
  fragDistance
));
gl_FragColor.a *= edgeAlpha;
#endif

if (edgeAlpha == 0.0) {
  discard;
}
`;
function Z0(c) {
  const e = Iu(c, {
    chained: !0,
    extensions: {
      derivatives: !0
    },
    uniforms: {
      uTroikaSDFTexture: { value: null },
      uTroikaSDFTextureSize: { value: new Qe() },
      uTroikaSDFGlyphSize: { value: 0 },
      uTroikaSDFExponent: { value: 0 },
      uTroikaTotalBounds: { value: new Zr(0, 0, 0, 0) },
      uTroikaClipRect: { value: new Zr(0, 0, 0, 0) },
      uTroikaEdgeOffset: { value: 0 },
      uTroikaFillOpacity: { value: 1 },
      uTroikaPositionOffset: { value: new Qe() },
      uTroikaCurveRadius: { value: 0 },
      uTroikaBlurRadius: { value: 0 },
      uTroikaStrokeWidth: { value: 0 },
      uTroikaStrokeColor: { value: new Wn() },
      uTroikaStrokeOpacity: { value: 1 },
      uTroikaOrient: { value: new ph() },
      uTroikaUseGlyphColors: { value: !0 },
      uTroikaSDFDebug: { value: !1 }
    },
    vertexDefs: K0,
    vertexTransform: Y0,
    fragmentDefs: Q0,
    fragmentColorTransform: q0,
    customRewriter({ vertexShader: s, fragmentShader: a }) {
      let r = /\buniform\s+vec3\s+diffuse\b/;
      return r.test(a) && (a = a.replace(r, "varying vec3 vTroikaGlyphColor").replace(/\bdiffuse\b/g, "vTroikaGlyphColor"), r.test(s) || (s = s.replace(
        Kh,
        `uniform vec3 diffuse;
$&
vTroikaGlyphColor = uTroikaUseGlyphColors ? aTroikaGlyphColor / 255.0 : diffuse;
`
      ))), { vertexShader: s, fragmentShader: a };
    }
  });
  return e.transparent = !0, e.forceSinglePass = !0, Object.defineProperties(e, {
    isTroikaTextMaterial: { value: !0 },
    // WebGLShadowMap reverses the side of the shadow material by default, which fails
    // for planes, so here we force the `shadowSide` to always match the main side.
    shadowSide: {
      get() {
        return this.side;
      },
      set() {
      }
    }
  }), e;
}
const ac = /* @__PURE__ */ new Qr({
  color: 16777215,
  side: qu,
  transparent: !0
}), Od = 8421504, Nd = /* @__PURE__ */ new Ft(), Sa = /* @__PURE__ */ new oe(), uu = /* @__PURE__ */ new oe(), es = [], J0 = /* @__PURE__ */ new oe(), cu = "+x+y";
function Bd(c) {
  return Array.isArray(c) ? c[0] : c;
}
let $h = () => {
  const c = new Xn(
    new Zu(1, 1),
    ac
  );
  return $h = () => c, c;
}, ep = () => {
  const c = new Xn(
    new Zu(1, 1, 32, 1),
    ac
  );
  return ep = () => c, c;
};
const $0 = { type: "syncstart" }, e1 = { type: "synccomplete" }, tp = [
  "font",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "lang",
  "letterSpacing",
  "lineHeight",
  "maxWidth",
  "overflowWrap",
  "text",
  "direction",
  "textAlign",
  "textIndent",
  "whiteSpace",
  "anchorX",
  "anchorY",
  "colorRanges",
  "sdfGlyphSize"
], t1 = tp.concat(
  "material",
  "color",
  "depthOffset",
  "clipRect",
  "curveRadius",
  "orientation",
  "glyphGeometryDetail"
);
let np = class extends Xn {
  constructor() {
    const e = new X0();
    super(e, null), this.text = "", this.anchorX = 0, this.anchorY = 0, this.curveRadius = 0, this.direction = "auto", this.font = null, this.unicodeFontsURL = null, this.fontSize = 0.1, this.fontWeight = "normal", this.fontStyle = "normal", this.lang = null, this.letterSpacing = 0, this.lineHeight = "normal", this.maxWidth = 1 / 0, this.overflowWrap = "normal", this.textAlign = "left", this.textIndent = 0, this.whiteSpace = "normal", this.material = null, this.color = null, this.colorRanges = null, this.outlineWidth = 0, this.outlineColor = 0, this.outlineOpacity = 1, this.outlineBlur = 0, this.outlineOffsetX = 0, this.outlineOffsetY = 0, this.strokeWidth = 0, this.strokeColor = Od, this.strokeOpacity = 1, this.fillOpacity = 1, this.depthOffset = 0, this.clipRect = null, this.orientation = cu, this.glyphGeometryDetail = 1, this.sdfGlyphSize = null, this.gpuAccelerateSDF = !0, this.debugSDF = !1;
  }
  /**
   * Updates the text rendering according to the current text-related configuration properties.
   * This is an async process, so you can pass in a callback function to be executed when it
   * finishes.
   * @param {function} [callback]
   */
  sync(e) {
    this._needsSync && (this._needsSync = !1, this._isSyncing ? (this._queuedSyncs || (this._queuedSyncs = [])).push(e) : (this._isSyncing = !0, this.dispatchEvent($0), Qh({
      text: this.text,
      font: this.font,
      lang: this.lang,
      fontSize: this.fontSize || 0.1,
      fontWeight: this.fontWeight || "normal",
      fontStyle: this.fontStyle || "normal",
      letterSpacing: this.letterSpacing || 0,
      lineHeight: this.lineHeight || "normal",
      maxWidth: this.maxWidth,
      direction: this.direction || "auto",
      textAlign: this.textAlign,
      textIndent: this.textIndent,
      whiteSpace: this.whiteSpace,
      overflowWrap: this.overflowWrap,
      anchorX: this.anchorX,
      anchorY: this.anchorY,
      colorRanges: this.colorRanges,
      includeCaretPositions: !0,
      //TODO parameterize
      sdfGlyphSize: this.sdfGlyphSize,
      gpuAccelerateSDF: this.gpuAccelerateSDF,
      unicodeFontsURL: this.unicodeFontsURL
    }, (s) => {
      this._isSyncing = !1, this._textRenderInfo = s, this.geometry.updateGlyphs(
        s.glyphBounds,
        s.glyphAtlasIndices,
        s.blockBounds,
        s.chunkedBounds,
        s.glyphColors
      );
      const a = this._queuedSyncs;
      a && (this._queuedSyncs = null, this._needsSync = !0, this.sync(() => {
        a.forEach((r) => r && r());
      })), this.dispatchEvent(e1), e && e();
    })));
  }
  /**
   * Initiate a sync if needed - note it won't complete until next frame at the
   * earliest so if possible it's a good idea to call sync() manually as soon as
   * all the properties have been set.
   * @override
   */
  onBeforeRender(e, s, a, r, n, o) {
    this.sync(), n.isTroikaTextMaterial && this._prepareForRender(n);
  }
  /**
   * Shortcut to dispose the geometry specific to this instance.
   * Note: we don't also dispose the derived material here because if anything else is
   * sharing the same base material it will result in a pause next frame as the program
   * is recompiled. Instead users can dispose the base material manually, like normal,
   * and we'll also dispose the derived material at that time.
   */
  dispose() {
    this.geometry.dispose();
  }
  /**
   * @property {TroikaTextRenderInfo|null} textRenderInfo
   * @readonly
   * The current processed rendering data for this TextMesh, returned by the TextBuilder after
   * a `sync()` call. This will be `null` initially, and may be stale for a short period until
   * the asynchrous `sync()` process completes.
   */
  get textRenderInfo() {
    return this._textRenderInfo || null;
  }
  /**
   * Create the text derived material from the base material. Can be overridden to use a custom
   * derived material.
   */
  createDerivedMaterial(e) {
    return Z0(e);
  }
  // Handler for automatically wrapping the base material with our upgrades. We do the wrapping
  // lazily on _read_ rather than write to avoid unnecessary wrapping on transient values.
  get material() {
    let e = this._derivedMaterial;
    const s = this._baseMaterial || this._defaultMaterial || (this._defaultMaterial = ac.clone());
    if ((!e || !e.isDerivedFrom(s)) && (e = this._derivedMaterial = this.createDerivedMaterial(s), s.addEventListener("dispose", function a() {
      s.removeEventListener("dispose", a), e.dispose();
    })), this.hasOutline()) {
      let a = e._outlineMtl;
      return a || (a = e._outlineMtl = Object.create(e, {
        id: { value: e.id + 0.1 }
      }), a.isTextOutlineMaterial = !0, a.depthWrite = !1, a.map = null, e.addEventListener("dispose", function r() {
        e.removeEventListener("dispose", r), a.dispose();
      })), [
        a,
        e
      ];
    } else
      return e;
  }
  set material(e) {
    e && e.isTroikaTextMaterial ? (this._derivedMaterial = e, this._baseMaterial = e.baseMaterial) : this._baseMaterial = e;
  }
  hasOutline() {
    return !!(this.outlineWidth || this.outlineBlur || this.outlineOffsetX || this.outlineOffsetY);
  }
  get glyphGeometryDetail() {
    return this.geometry.detail;
  }
  set glyphGeometryDetail(e) {
    this.geometry.detail = e;
  }
  get curveRadius() {
    return this.geometry.curveRadius;
  }
  set curveRadius(e) {
    this.geometry.curveRadius = e;
  }
  // Create and update material for shadows upon request:
  get customDepthMaterial() {
    return Bd(this.material).getDepthMaterial();
  }
  set customDepthMaterial(e) {
  }
  get customDistanceMaterial() {
    return Bd(this.material).getDistanceMaterial();
  }
  set customDistanceMaterial(e) {
  }
  _prepareForRender(e) {
    const s = e.isTextOutlineMaterial, a = e.uniforms, r = this.textRenderInfo;
    if (r) {
      const { sdfTexture: u, blockBounds: l } = r;
      a.uTroikaSDFTexture.value = u, a.uTroikaSDFTextureSize.value.set(u.image.width, u.image.height), a.uTroikaSDFGlyphSize.value = r.sdfGlyphSize, a.uTroikaSDFExponent.value = r.sdfExponent, a.uTroikaTotalBounds.value.fromArray(l), a.uTroikaUseGlyphColors.value = !s && !!r.glyphColors;
      let f = 0, d = 0, p = 0, v, g, x, E = 0, _ = 0;
      if (s) {
        let { outlineWidth: A, outlineOffsetX: T, outlineOffsetY: C, outlineBlur: P, outlineOpacity: M } = this;
        f = this._parsePercent(A) || 0, d = Math.max(0, this._parsePercent(P) || 0), v = M, E = this._parsePercent(T) || 0, _ = this._parsePercent(C) || 0;
      } else
        p = Math.max(0, this._parsePercent(this.strokeWidth) || 0), p && (x = this.strokeColor, a.uTroikaStrokeColor.value.set(x ?? Od), g = this.strokeOpacity, g == null && (g = 1)), v = this.fillOpacity;
      a.uTroikaEdgeOffset.value = f, a.uTroikaPositionOffset.value.set(E, _), a.uTroikaBlurRadius.value = d, a.uTroikaStrokeWidth.value = p, a.uTroikaStrokeOpacity.value = g, a.uTroikaFillOpacity.value = v ?? 1, a.uTroikaCurveRadius.value = this.curveRadius || 0;
      let S = this.clipRect;
      if (S && Array.isArray(S) && S.length === 4)
        a.uTroikaClipRect.value.fromArray(S);
      else {
        const A = (this.fontSize || 0.1) * 100;
        a.uTroikaClipRect.value.set(
          l[0] - A,
          l[1] - A,
          l[2] + A,
          l[3] + A
        );
      }
      this.geometry.applyClipRect(a.uTroikaClipRect.value);
    }
    a.uTroikaSDFDebug.value = !!this.debugSDF, e.polygonOffset = !!this.depthOffset, e.polygonOffsetFactor = e.polygonOffsetUnits = this.depthOffset || 0;
    const n = s ? this.outlineColor || 0 : this.color;
    if (n == null)
      delete e.color;
    else {
      const u = e.hasOwnProperty("color") ? e.color : e.color = new Wn();
      (n !== u._input || typeof n == "object") && u.set(u._input = n);
    }
    let o = this.orientation || cu;
    if (o !== e._orientation) {
      let u = a.uTroikaOrient.value;
      o = o.replace(/[^-+xyz]/g, "");
      let l = o !== cu && o.match(/^([-+])([xyz])([-+])([xyz])$/);
      if (l) {
        let [, f, d, p, v] = l;
        Sa.set(0, 0, 0)[d] = f === "-" ? 1 : -1, uu.set(0, 0, 0)[v] = p === "-" ? -1 : 1, Nd.lookAt(J0, Sa.cross(uu), uu), u.setFromMatrix4(Nd);
      } else
        u.identity();
      e._orientation = o;
    }
  }
  _parsePercent(e) {
    if (typeof e == "string") {
      let s = e.match(/^(-?[\d.]+)%$/), a = s ? parseFloat(s[1]) : NaN;
      e = (isNaN(a) ? 0 : a / 100) * this.fontSize;
    }
    return e;
  }
  /**
   * Translate a point in local space to an x/y in the text plane.
   */
  localPositionToTextCoords(e, s = new Qe()) {
    s.copy(e);
    const a = this.curveRadius;
    return a && (s.x = Math.atan2(e.x, Math.abs(a) - Math.abs(e.z)) * Math.abs(a)), s;
  }
  /**
   * Translate a point in world space to an x/y in the text plane.
   */
  worldPositionToTextCoords(e, s = new Qe()) {
    return Sa.copy(e), this.localPositionToTextCoords(this.worldToLocal(Sa), s);
  }
  /**
   * @override Custom raycasting to test against the whole text block's max rectangular bounds
   * TODO is there any reason to make this more granular, like within individual line or glyph rects?
   */
  raycast(e, s) {
    const { textRenderInfo: a, curveRadius: r } = this;
    if (a) {
      const n = a.blockBounds, o = r ? ep() : $h(), u = o.geometry, { position: l, uv: f } = u.attributes;
      for (let d = 0; d < f.count; d++) {
        let p = n[0] + f.getX(d) * (n[2] - n[0]);
        const v = n[1] + f.getY(d) * (n[3] - n[1]);
        let g = 0;
        r && (g = r - Math.cos(p / r) * r, p = Math.sin(p / r) * r), l.setXYZ(d, p, v, g);
      }
      u.boundingSphere = this.geometry.boundingSphere, u.boundingBox = this.geometry.boundingBox, o.matrixWorld = this.matrixWorld, o.material.side = this.material.side, es.length = 0, o.raycast(e, es);
      for (let d = 0; d < es.length; d++)
        es[d].object = this, s.push(es[d]);
    }
  }
  copy(e) {
    const s = this.geometry;
    return super.copy(e), this.geometry = s, t1.forEach((a) => {
      this[a] = e[a];
    }), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
tp.forEach((c) => {
  const e = "_private_" + c;
  Object.defineProperty(np.prototype, c, {
    get() {
      return this[e];
    },
    set(s) {
      s !== this[e] && (this[e] = s, this._needsSync = !0);
    }
  });
});
new Mt();
new Wn();
const rp = /* @__PURE__ */ te.forwardRef(({
  sdfGlyphSize: c = 64,
  anchorX: e = "center",
  anchorY: s = "middle",
  font: a,
  fontSize: r = 1,
  children: n,
  characters: o,
  onSync: u,
  ...l
}, f) => {
  const d = Qt(({
    invalidate: x
  }) => x), [p] = te.useState(() => new np()), [v, g] = te.useMemo(() => {
    const x = [];
    let E = "";
    return te.Children.forEach(n, (_) => {
      typeof _ == "string" || typeof _ == "number" ? E += _ : x.push(_);
    }), [x, E];
  }, [n]);
  return Wm(() => new Promise((x) => z0({
    font: a,
    characters: o
  }, x)), ["troika-text", a, o]), te.useLayoutEffect(() => void p.sync(() => {
    d(), u && u(p);
  })), te.useEffect(() => () => p.dispose(), [p]), /* @__PURE__ */ te.createElement("primitive", yo({
    object: p,
    ref: f,
    font: a,
    text: g,
    anchorX: e,
    anchorY: s,
    fontSize: r,
    sdfGlyphSize: c
  }, l), v);
}), n1 = /* @__PURE__ */ te.forwardRef(({
  makeDefault: c,
  camera: e,
  regress: s,
  domElement: a,
  enableDamping: r = !0,
  keyEvents: n = !1,
  onChange: o,
  onStart: u,
  onEnd: l,
  ...f
}, d) => {
  const p = Qt((M) => M.invalidate), v = Qt((M) => M.camera), g = Qt((M) => M.gl), x = Qt((M) => M.events), E = Qt((M) => M.setEvents), _ = Qt((M) => M.set), S = Qt((M) => M.get), A = Qt((M) => M.performance), T = e || v, C = a || x.connected || g.domElement, P = te.useMemo(() => new Zv(T), [T]);
  return Ci(() => {
    P.enabled && P.update();
  }, -1), te.useEffect(() => (n && P.connect(n === !0 ? C : n), P.connect(C), () => void P.dispose()), [n, C, s, P, p]), te.useEffect(() => {
    const M = (U) => {
      p(), s && A.regress(), o && o(U);
    }, b = (U) => {
      u && u(U);
    }, L = (U) => {
      l && l(U);
    };
    return P.addEventListener("change", M), P.addEventListener("start", b), P.addEventListener("end", L), () => {
      P.removeEventListener("start", b), P.removeEventListener("end", L), P.removeEventListener("change", M);
    };
  }, [o, u, l, P, p, E]), te.useEffect(() => {
    if (c) {
      const M = S().controls;
      return _({
        controls: P
      }), () => _({
        controls: M
      });
    }
  }, [c, P]), /* @__PURE__ */ te.createElement("primitive", yo({
    ref: d,
    object: P,
    enableDamping: r
  }, f));
}), ip = 0, r1 = 1, op = 2, zd = 2, fu = 1.25, jd = 1, ms = 6 * 4 + 4 + 4, Ya = 65535, i1 = Math.pow(2, -24), du = Symbol("SKIP_GENERATION");
function o1(c) {
  return c.index ? c.index.count : c.attributes.position.count;
}
function wo(c) {
  return o1(c) / 3;
}
function s1(c, e = ArrayBuffer) {
  return c > 65535 ? new Uint32Array(new e(4 * c)) : new Uint16Array(new e(2 * c));
}
function a1(c, e) {
  if (!c.index) {
    const s = c.attributes.position.count, a = e.useSharedArrayBuffer ? SharedArrayBuffer : ArrayBuffer, r = s1(s, a);
    c.setIndex(new ds(r, 1));
    for (let n = 0; n < s; n++)
      r[n] = n;
  }
}
function sp(c, e) {
  const s = wo(c), a = e || c.drawRange, r = a.start / 3, n = (a.start + a.count) / 3, o = Math.max(0, r), u = Math.min(s, n) - o;
  return [{
    offset: Math.floor(o),
    count: Math.floor(u)
  }];
}
function ap(c, e) {
  if (!c.groups || !c.groups.length)
    return sp(c, e);
  const s = [], a = /* @__PURE__ */ new Set(), r = e || c.drawRange, n = r.start / 3, o = (r.start + r.count) / 3;
  for (const l of c.groups) {
    const f = l.start / 3, d = (l.start + l.count) / 3;
    a.add(Math.max(n, f)), a.add(Math.min(o, d));
  }
  const u = Array.from(a.values()).sort((l, f) => l - f);
  for (let l = 0; l < u.length - 1; l++) {
    const f = u[l], d = u[l + 1];
    s.push({
      offset: Math.floor(f),
      count: Math.floor(d - f)
    });
  }
  return s;
}
function l1(c, e) {
  const s = wo(c), a = ap(c, e).sort((o, u) => o.offset - u.offset), r = a[a.length - 1];
  r.count = Math.min(s - r.offset, r.count);
  let n = 0;
  return a.forEach(({ count: o }) => n += o), s !== n;
}
function hu(c, e, s, a, r) {
  let n = 1 / 0, o = 1 / 0, u = 1 / 0, l = -1 / 0, f = -1 / 0, d = -1 / 0, p = 1 / 0, v = 1 / 0, g = 1 / 0, x = -1 / 0, E = -1 / 0, _ = -1 / 0;
  for (let S = e * 6, A = (e + s) * 6; S < A; S += 6) {
    const T = c[S + 0], C = c[S + 1], P = T - C, M = T + C;
    P < n && (n = P), M > l && (l = M), T < p && (p = T), T > x && (x = T);
    const b = c[S + 2], L = c[S + 3], U = b - L, R = b + L;
    U < o && (o = U), R > f && (f = R), b < v && (v = b), b > E && (E = b);
    const I = c[S + 4], k = c[S + 5], O = I - k, N = I + k;
    O < u && (u = O), N > d && (d = N), I < g && (g = I), I > _ && (_ = I);
  }
  a[0] = n, a[1] = o, a[2] = u, a[3] = l, a[4] = f, a[5] = d, r[0] = p, r[1] = v, r[2] = g, r[3] = x, r[4] = E, r[5] = _;
}
function u1(c, e = null, s = null, a = null) {
  const r = c.attributes.position, n = c.index ? c.index.array : null, o = wo(c), u = r.normalized;
  let l;
  e === null ? (l = new Float32Array(o * 6 * 4), s = 0, a = o) : (l = e, s = s || 0, a = a || o);
  const f = r.array, d = r.offset || 0;
  let p = 3;
  r.isInterleavedBufferAttribute && (p = r.data.stride);
  const v = ["getX", "getY", "getZ"];
  for (let g = s; g < s + a; g++) {
    const x = g * 3, E = g * 6;
    let _ = x + 0, S = x + 1, A = x + 2;
    n && (_ = n[_], S = n[S], A = n[A]), u || (_ = _ * p + d, S = S * p + d, A = A * p + d);
    for (let T = 0; T < 3; T++) {
      let C, P, M;
      u ? (C = r[v[T]](_), P = r[v[T]](S), M = r[v[T]](A)) : (C = f[_ + T], P = f[S + T], M = f[A + T]);
      let b = C;
      P < b && (b = P), M < b && (b = M);
      let L = C;
      P > L && (L = P), M > L && (L = M);
      const U = (L - b) / 2, R = T * 2;
      l[E + R + 0] = b + U, l[E + R + 1] = U + (Math.abs(b) + U) * i1;
    }
  }
  return l;
}
function _t(c, e, s) {
  return s.min.x = e[c], s.min.y = e[c + 1], s.min.z = e[c + 2], s.max.x = e[c + 3], s.max.y = e[c + 4], s.max.z = e[c + 5], s;
}
function Gd(c) {
  let e = -1, s = -1 / 0;
  for (let a = 0; a < 3; a++) {
    const r = c[a + 3] - c[a];
    r > s && (s = r, e = a);
  }
  return e;
}
function Hd(c, e) {
  e.set(c);
}
function Vd(c, e, s) {
  let a, r;
  for (let n = 0; n < 3; n++) {
    const o = n + 3;
    a = c[n], r = e[n], s[n] = a < r ? a : r, a = c[o], r = e[o], s[o] = a > r ? a : r;
  }
}
function wa(c, e, s) {
  for (let a = 0; a < 3; a++) {
    const r = e[c + 2 * a], n = e[c + 2 * a + 1], o = r - n, u = r + n;
    o < s[a] && (s[a] = o), u > s[a + 3] && (s[a + 3] = u);
  }
}
function ts(c) {
  const e = c[3] - c[0], s = c[4] - c[1], a = c[5] - c[2];
  return 2 * (e * s + s * a + a * e);
}
const Lr = 32, c1 = (c, e) => c.candidate - e.candidate, Kr = new Array(Lr).fill().map(() => ({
  count: 0,
  bounds: new Float32Array(6),
  rightCacheBounds: new Float32Array(6),
  leftCacheBounds: new Float32Array(6),
  candidate: 0
})), _a = new Float32Array(6);
function f1(c, e, s, a, r, n) {
  let o = -1, u = 0;
  if (n === ip)
    o = Gd(e), o !== -1 && (u = (e[o] + e[o + 3]) / 2);
  else if (n === r1)
    o = Gd(c), o !== -1 && (u = d1(s, a, r, o));
  else if (n === op) {
    const l = ts(c);
    let f = fu * r;
    const d = a * 6, p = (a + r) * 6;
    for (let v = 0; v < 3; v++) {
      const g = e[v], _ = (e[v + 3] - g) / Lr;
      if (r < Lr / 4) {
        const S = [...Kr];
        S.length = r;
        let A = 0;
        for (let C = d; C < p; C += 6, A++) {
          const P = S[A];
          P.candidate = s[C + 2 * v], P.count = 0;
          const {
            bounds: M,
            leftCacheBounds: b,
            rightCacheBounds: L
          } = P;
          for (let U = 0; U < 3; U++)
            L[U] = 1 / 0, L[U + 3] = -1 / 0, b[U] = 1 / 0, b[U + 3] = -1 / 0, M[U] = 1 / 0, M[U + 3] = -1 / 0;
          wa(C, s, M);
        }
        S.sort(c1);
        let T = r;
        for (let C = 0; C < T; C++) {
          const P = S[C];
          for (; C + 1 < T && S[C + 1].candidate === P.candidate; )
            S.splice(C + 1, 1), T--;
        }
        for (let C = d; C < p; C += 6) {
          const P = s[C + 2 * v];
          for (let M = 0; M < T; M++) {
            const b = S[M];
            P >= b.candidate ? wa(C, s, b.rightCacheBounds) : (wa(C, s, b.leftCacheBounds), b.count++);
          }
        }
        for (let C = 0; C < T; C++) {
          const P = S[C], M = P.count, b = r - P.count, L = P.leftCacheBounds, U = P.rightCacheBounds;
          let R = 0;
          M !== 0 && (R = ts(L) / l);
          let I = 0;
          b !== 0 && (I = ts(U) / l);
          const k = jd + fu * (R * M + I * b);
          k < f && (o = v, f = k, u = P.candidate);
        }
      } else {
        for (let T = 0; T < Lr; T++) {
          const C = Kr[T];
          C.count = 0, C.candidate = g + _ + T * _;
          const P = C.bounds;
          for (let M = 0; M < 3; M++)
            P[M] = 1 / 0, P[M + 3] = -1 / 0;
        }
        for (let T = d; T < p; T += 6) {
          let M = ~~((s[T + 2 * v] - g) / _);
          M >= Lr && (M = Lr - 1);
          const b = Kr[M];
          b.count++, wa(T, s, b.bounds);
        }
        const S = Kr[Lr - 1];
        Hd(S.bounds, S.rightCacheBounds);
        for (let T = Lr - 2; T >= 0; T--) {
          const C = Kr[T], P = Kr[T + 1];
          Vd(C.bounds, P.rightCacheBounds, C.rightCacheBounds);
        }
        let A = 0;
        for (let T = 0; T < Lr - 1; T++) {
          const C = Kr[T], P = C.count, M = C.bounds, L = Kr[T + 1].rightCacheBounds;
          P !== 0 && (A === 0 ? Hd(M, _a) : Vd(M, _a, _a)), A += P;
          let U = 0, R = 0;
          A !== 0 && (U = ts(_a) / l);
          const I = r - A;
          I !== 0 && (R = ts(L) / l);
          const k = jd + fu * (U * A + R * I);
          k < f && (o = v, f = k, u = C.candidate);
        }
      }
    }
  } else
    console.warn(`MeshBVH: Invalid build strategy value ${n} used.`);
  return { axis: o, pos: u };
}
function d1(c, e, s, a) {
  let r = 0;
  for (let n = e, o = e + s; n < o; n++)
    r += c[n * 6 + a * 2];
  return r / s;
}
class pu {
  constructor() {
    this.boundingData = new Float32Array(6);
  }
}
function h1(c, e, s, a, r, n) {
  let o = a, u = a + r - 1;
  const l = n.pos, f = n.axis * 2;
  for (; ; ) {
    for (; o <= u && s[o * 6 + f] < l; )
      o++;
    for (; o <= u && s[u * 6 + f] >= l; )
      u--;
    if (o < u) {
      for (let d = 0; d < 3; d++) {
        let p = e[o * 3 + d];
        e[o * 3 + d] = e[u * 3 + d], e[u * 3 + d] = p;
      }
      for (let d = 0; d < 6; d++) {
        let p = s[o * 6 + d];
        s[o * 6 + d] = s[u * 6 + d], s[u * 6 + d] = p;
      }
      o++, u--;
    } else
      return o;
  }
}
function p1(c, e, s, a, r, n) {
  let o = a, u = a + r - 1;
  const l = n.pos, f = n.axis * 2;
  for (; ; ) {
    for (; o <= u && s[o * 6 + f] < l; )
      o++;
    for (; o <= u && s[u * 6 + f] >= l; )
      u--;
    if (o < u) {
      let d = c[o];
      c[o] = c[u], c[u] = d;
      for (let p = 0; p < 6; p++) {
        let v = s[o * 6 + p];
        s[o * 6 + p] = s[u * 6 + p], s[u * 6 + p] = v;
      }
      o++, u--;
    } else
      return o;
  }
}
function hn(c, e) {
  return e[c + 15] === 65535;
}
function Mn(c, e) {
  return e[c + 6];
}
function jn(c, e) {
  return e[c + 14];
}
function Gn(c) {
  return c + 8;
}
function Hn(c, e) {
  return e[c + 6];
}
function lp(c, e) {
  return e[c + 7];
}
let up, ls, ja, cp;
const m1 = Math.pow(2, 32);
function Nu(c) {
  return "count" in c ? 1 : 1 + Nu(c.left) + Nu(c.right);
}
function v1(c, e, s) {
  return up = new Float32Array(s), ls = new Uint32Array(s), ja = new Uint16Array(s), cp = new Uint8Array(s), Bu(c, e);
}
function Bu(c, e) {
  const s = c / 4, a = c / 2, r = "count" in e, n = e.boundingData;
  for (let o = 0; o < 6; o++)
    up[s + o] = n[o];
  if (r)
    if (e.buffer) {
      const o = e.buffer;
      cp.set(new Uint8Array(o), c);
      for (let u = c, l = c + o.byteLength; u < l; u += ms) {
        const f = u / 2;
        hn(f, ja) || (ls[u / 4 + 6] += s);
      }
      return c + o.byteLength;
    } else {
      const o = e.offset, u = e.count;
      return ls[s + 6] = o, ja[a + 14] = u, ja[a + 15] = Ya, c + ms;
    }
  else {
    const o = e.left, u = e.right, l = e.splitAxis;
    let f;
    if (f = Bu(c + ms, o), f / 4 > m1)
      throw new Error("MeshBVH: Cannot store child pointer greater than 32 bits.");
    return ls[s + 6] = f / 4, f = Bu(f, u), ls[s + 7] = l, f;
  }
}
function g1(c, e) {
  const s = (c.index ? c.index.count : c.attributes.position.count) / 3, a = s > 2 ** 16, r = a ? 4 : 2, n = e ? new SharedArrayBuffer(s * r) : new ArrayBuffer(s * r), o = a ? new Uint32Array(n) : new Uint16Array(n);
  for (let u = 0, l = o.length; u < l; u++)
    o[u] = u;
  return o;
}
function y1(c, e, s, a, r) {
  const {
    maxDepth: n,
    verbose: o,
    maxLeafTris: u,
    strategy: l,
    onProgress: f,
    indirect: d
  } = r, p = c._indirectBuffer, v = c.geometry, g = v.index ? v.index.array : null, x = d ? p1 : h1, E = wo(v), _ = new Float32Array(6);
  let S = !1;
  const A = new pu();
  return hu(e, s, a, A.boundingData, _), C(A, s, a, _), A;
  function T(P) {
    f && f(P / E);
  }
  function C(P, M, b, L = null, U = 0) {
    if (!S && U >= n && (S = !0, o && (console.warn(`MeshBVH: Max depth of ${n} reached when generating BVH. Consider increasing maxDepth.`), console.warn(v))), b <= u || U >= n)
      return T(M + b), P.offset = M, P.count = b, P;
    const R = f1(P.boundingData, L, e, M, b, l);
    if (R.axis === -1)
      return T(M + b), P.offset = M, P.count = b, P;
    const I = x(p, g, e, M, b, R);
    if (I === M || I === M + b)
      T(M + b), P.offset = M, P.count = b;
    else {
      P.splitAxis = R.axis;
      const k = new pu(), O = M, N = I - M;
      P.left = k, hu(e, O, N, k.boundingData, _), C(k, O, N, _, U + 1);
      const J = new pu(), Z = I, ce = b - N;
      P.right = J, hu(e, Z, ce, J.boundingData, _), C(J, Z, ce, _, U + 1);
    }
    return P;
  }
}
function x1(c, e) {
  const s = c.geometry;
  e.indirect && (c._indirectBuffer = g1(s, e.useSharedArrayBuffer), l1(s, e.range) && !e.verbose && console.warn(
    'MeshBVH: Provided geometry contains groups or a range that do not fully span the vertex contents while using the "indirect" option. BVH may incorrectly report intersections on unrendered portions of the geometry.'
  )), c._indirectBuffer || a1(s, e);
  const a = e.useSharedArrayBuffer ? SharedArrayBuffer : ArrayBuffer, r = u1(s), n = e.indirect ? sp(s, e.range) : ap(s, e.range);
  c._roots = n.map((o) => {
    const u = y1(c, r, o.offset, o.count, e), l = Nu(u), f = new a(ms * l);
    return v1(0, u, f), f;
  });
}
class Dr {
  constructor() {
    this.min = 1 / 0, this.max = -1 / 0;
  }
  setFromPointsField(e, s) {
    let a = 1 / 0, r = -1 / 0;
    for (let n = 0, o = e.length; n < o; n++) {
      const l = e[n][s];
      a = l < a ? l : a, r = l > r ? l : r;
    }
    this.min = a, this.max = r;
  }
  setFromPoints(e, s) {
    let a = 1 / 0, r = -1 / 0;
    for (let n = 0, o = s.length; n < o; n++) {
      const u = s[n], l = e.dot(u);
      a = l < a ? l : a, r = l > r ? l : r;
    }
    this.min = a, this.max = r;
  }
  isSeparated(e) {
    return this.min > e.max || e.min > this.max;
  }
}
Dr.prototype.setFromBox = function() {
  const c = new oe();
  return function(s, a) {
    const r = a.min, n = a.max;
    let o = 1 / 0, u = -1 / 0;
    for (let l = 0; l <= 1; l++)
      for (let f = 0; f <= 1; f++)
        for (let d = 0; d <= 1; d++) {
          c.x = r.x * l + n.x * (1 - l), c.y = r.y * f + n.y * (1 - f), c.z = r.z * d + n.z * (1 - d);
          const p = s.dot(c);
          o = Math.min(p, o), u = Math.max(p, u);
        }
    this.min = o, this.max = u;
  };
}();
const S1 = function() {
  const c = new oe(), e = new oe(), s = new oe();
  return function(r, n, o) {
    const u = r.start, l = c, f = n.start, d = e;
    s.subVectors(u, f), c.subVectors(r.end, r.start), e.subVectors(n.end, n.start);
    const p = s.dot(d), v = d.dot(l), g = d.dot(d), x = s.dot(l), _ = l.dot(l) * g - v * v;
    let S, A;
    _ !== 0 ? S = (p * v - x * g) / _ : S = 0, A = (p + S * v) / g, o.x = S, o.y = A;
  };
}(), lc = function() {
  const c = new Qe(), e = new oe(), s = new oe();
  return function(r, n, o, u) {
    S1(r, n, c);
    let l = c.x, f = c.y;
    if (l >= 0 && l <= 1 && f >= 0 && f <= 1) {
      r.at(l, o), n.at(f, u);
      return;
    } else if (l >= 0 && l <= 1) {
      f < 0 ? n.at(0, u) : n.at(1, u), r.closestPointToPoint(u, !0, o);
      return;
    } else if (f >= 0 && f <= 1) {
      l < 0 ? r.at(0, o) : r.at(1, o), n.closestPointToPoint(o, !0, u);
      return;
    } else {
      let d;
      l < 0 ? d = r.start : d = r.end;
      let p;
      f < 0 ? p = n.start : p = n.end;
      const v = e, g = s;
      if (r.closestPointToPoint(p, !0, e), n.closestPointToPoint(d, !0, s), v.distanceToSquared(p) <= g.distanceToSquared(d)) {
        o.copy(v), u.copy(p);
        return;
      } else {
        o.copy(d), u.copy(g);
        return;
      }
    }
  };
}(), w1 = function() {
  const c = new oe(), e = new oe(), s = new Ku(), a = new gr();
  return function(n, o) {
    const { radius: u, center: l } = n, { a: f, b: d, c: p } = o;
    if (a.start = f, a.end = d, a.closestPointToPoint(l, !0, c).distanceTo(l) <= u || (a.start = f, a.end = p, a.closestPointToPoint(l, !0, c).distanceTo(l) <= u) || (a.start = d, a.end = p, a.closestPointToPoint(l, !0, c).distanceTo(l) <= u))
      return !0;
    const E = o.getPlane(s);
    if (Math.abs(E.distanceToPoint(l)) <= u) {
      const S = E.projectPoint(l, e);
      if (o.containsPoint(S))
        return !0;
    }
    return !1;
  };
}(), _1 = 1e-15;
function mu(c) {
  return Math.abs(c) < _1;
}
class tr extends as {
  constructor(...e) {
    super(...e), this.isExtendedTriangle = !0, this.satAxes = new Array(4).fill().map(() => new oe()), this.satBounds = new Array(4).fill().map(() => new Dr()), this.points = [this.a, this.b, this.c], this.sphere = new $r(), this.plane = new Ku(), this.needsUpdate = !0;
  }
  intersectsSphere(e) {
    return w1(e, this);
  }
  update() {
    const e = this.a, s = this.b, a = this.c, r = this.points, n = this.satAxes, o = this.satBounds, u = n[0], l = o[0];
    this.getNormal(u), l.setFromPoints(u, r);
    const f = n[1], d = o[1];
    f.subVectors(e, s), d.setFromPoints(f, r);
    const p = n[2], v = o[2];
    p.subVectors(s, a), v.setFromPoints(p, r);
    const g = n[3], x = o[3];
    g.subVectors(a, e), x.setFromPoints(g, r), this.sphere.setFromPoints(this.points), this.plane.setFromNormalAndCoplanarPoint(u, e), this.needsUpdate = !1;
  }
}
tr.prototype.closestPointToSegment = function() {
  const c = new oe(), e = new oe(), s = new gr();
  return function(r, n = null, o = null) {
    const { start: u, end: l } = r, f = this.points;
    let d, p = 1 / 0;
    for (let v = 0; v < 3; v++) {
      const g = (v + 1) % 3;
      s.start.copy(f[v]), s.end.copy(f[g]), lc(s, r, c, e), d = c.distanceToSquared(e), d < p && (p = d, n && n.copy(c), o && o.copy(e));
    }
    return this.closestPointToPoint(u, c), d = u.distanceToSquared(c), d < p && (p = d, n && n.copy(c), o && o.copy(u)), this.closestPointToPoint(l, c), d = l.distanceToSquared(c), d < p && (p = d, n && n.copy(c), o && o.copy(l)), Math.sqrt(p);
  };
}();
tr.prototype.intersectsTriangle = function() {
  const c = new tr(), e = new Array(3), s = new Array(3), a = new Dr(), r = new Dr(), n = new oe(), o = new oe(), u = new oe(), l = new oe(), f = new oe(), d = new gr(), p = new gr(), v = new gr(), g = new oe();
  function x(E, _, S) {
    const A = E.points;
    let T = 0, C = -1;
    for (let P = 0; P < 3; P++) {
      const { start: M, end: b } = d;
      M.copy(A[P]), b.copy(A[(P + 1) % 3]), d.delta(o);
      const L = mu(_.distanceToPoint(M));
      if (mu(_.normal.dot(o)) && L) {
        S.copy(d), T = 2;
        break;
      }
      const U = _.intersectLine(d, g);
      if (!U && L && g.copy(M), (U || L) && !mu(g.distanceTo(b))) {
        if (T <= 1)
          (T === 1 ? S.start : S.end).copy(g), L && (C = T);
        else if (T >= 2) {
          (C === 1 ? S.start : S.end).copy(g), T = 2;
          break;
        }
        if (T++, T === 2 && C === -1)
          break;
      }
    }
    return T;
  }
  return function(_, S = null, A = !1) {
    this.needsUpdate && this.update(), _.isExtendedTriangle ? _.needsUpdate && _.update() : (c.copy(_), c.update(), _ = c);
    const T = this.plane, C = _.plane;
    if (Math.abs(T.normal.dot(C.normal)) > 1 - 1e-10) {
      const P = this.satBounds, M = this.satAxes;
      s[0] = _.a, s[1] = _.b, s[2] = _.c;
      for (let U = 0; U < 4; U++) {
        const R = P[U], I = M[U];
        if (a.setFromPoints(I, s), R.isSeparated(a))
          return !1;
      }
      const b = _.satBounds, L = _.satAxes;
      e[0] = this.a, e[1] = this.b, e[2] = this.c;
      for (let U = 0; U < 4; U++) {
        const R = b[U], I = L[U];
        if (a.setFromPoints(I, e), R.isSeparated(a))
          return !1;
      }
      for (let U = 0; U < 4; U++) {
        const R = M[U];
        for (let I = 0; I < 4; I++) {
          const k = L[I];
          if (n.crossVectors(R, k), a.setFromPoints(n, e), r.setFromPoints(n, s), a.isSeparated(r))
            return !1;
        }
      }
      return S && (A || console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0."), S.start.set(0, 0, 0), S.end.set(0, 0, 0)), !0;
    } else {
      const P = x(this, C, p);
      if (P === 1 && _.containsPoint(p.end))
        return S && (S.start.copy(p.end), S.end.copy(p.end)), !0;
      if (P !== 2)
        return !1;
      const M = x(_, T, v);
      if (M === 1 && this.containsPoint(v.end))
        return S && (S.start.copy(v.end), S.end.copy(v.end)), !0;
      if (M !== 2)
        return !1;
      if (p.delta(u), v.delta(l), u.dot(l) < 0) {
        let O = v.start;
        v.start = v.end, v.end = O;
      }
      const b = p.start.dot(u), L = p.end.dot(u), U = v.start.dot(u), R = v.end.dot(u), I = L < U, k = b < R;
      return b !== R && U !== L && I === k ? !1 : (S && (f.subVectors(p.start, v.start), f.dot(u) > 0 ? S.start.copy(p.start) : S.start.copy(v.start), f.subVectors(p.end, v.end), f.dot(u) < 0 ? S.end.copy(p.end) : S.end.copy(v.end)), !0);
    }
  };
}();
tr.prototype.distanceToPoint = function() {
  const c = new oe();
  return function(s) {
    return this.closestPointToPoint(s, c), s.distanceTo(c);
  };
}();
tr.prototype.distanceToTriangle = function() {
  const c = new oe(), e = new oe(), s = ["a", "b", "c"], a = new gr(), r = new gr();
  return function(o, u = null, l = null) {
    const f = u || l ? a : null;
    if (this.intersectsTriangle(o, f))
      return (u || l) && (u && f.getCenter(u), l && f.getCenter(l)), 0;
    let d = 1 / 0;
    for (let p = 0; p < 3; p++) {
      let v;
      const g = s[p], x = o[g];
      this.closestPointToPoint(x, c), v = x.distanceToSquared(c), v < d && (d = v, u && u.copy(c), l && l.copy(x));
      const E = this[g];
      o.closestPointToPoint(E, c), v = E.distanceToSquared(c), v < d && (d = v, u && u.copy(E), l && l.copy(c));
    }
    for (let p = 0; p < 3; p++) {
      const v = s[p], g = s[(p + 1) % 3];
      a.set(this[v], this[g]);
      for (let x = 0; x < 3; x++) {
        const E = s[x], _ = s[(x + 1) % 3];
        r.set(o[E], o[_]), lc(a, r, c, e);
        const S = c.distanceToSquared(e);
        S < d && (d = S, u && u.copy(c), l && l.copy(e));
      }
    }
    return Math.sqrt(d);
  };
}();
class ln {
  constructor(e, s, a) {
    this.isOrientedBox = !0, this.min = new oe(), this.max = new oe(), this.matrix = new Ft(), this.invMatrix = new Ft(), this.points = new Array(8).fill().map(() => new oe()), this.satAxes = new Array(3).fill().map(() => new oe()), this.satBounds = new Array(3).fill().map(() => new Dr()), this.alignedSatBounds = new Array(3).fill().map(() => new Dr()), this.needsUpdate = !1, e && this.min.copy(e), s && this.max.copy(s), a && this.matrix.copy(a);
  }
  set(e, s, a) {
    this.min.copy(e), this.max.copy(s), this.matrix.copy(a), this.needsUpdate = !0;
  }
  copy(e) {
    this.min.copy(e.min), this.max.copy(e.max), this.matrix.copy(e.matrix), this.needsUpdate = !0;
  }
}
ln.prototype.update = function() {
  return function() {
    const e = this.matrix, s = this.min, a = this.max, r = this.points;
    for (let f = 0; f <= 1; f++)
      for (let d = 0; d <= 1; d++)
        for (let p = 0; p <= 1; p++) {
          const v = 1 * f | 2 * d | 4 * p, g = r[v];
          g.x = f ? a.x : s.x, g.y = d ? a.y : s.y, g.z = p ? a.z : s.z, g.applyMatrix4(e);
        }
    const n = this.satBounds, o = this.satAxes, u = r[0];
    for (let f = 0; f < 3; f++) {
      const d = o[f], p = n[f], v = 1 << f, g = r[v];
      d.subVectors(u, g), p.setFromPoints(d, r);
    }
    const l = this.alignedSatBounds;
    l[0].setFromPointsField(r, "x"), l[1].setFromPointsField(r, "y"), l[2].setFromPointsField(r, "z"), this.invMatrix.copy(this.matrix).invert(), this.needsUpdate = !1;
  };
}();
ln.prototype.intersectsBox = function() {
  const c = new Dr();
  return function(s) {
    this.needsUpdate && this.update();
    const a = s.min, r = s.max, n = this.satBounds, o = this.satAxes, u = this.alignedSatBounds;
    if (c.min = a.x, c.max = r.x, u[0].isSeparated(c) || (c.min = a.y, c.max = r.y, u[1].isSeparated(c)) || (c.min = a.z, c.max = r.z, u[2].isSeparated(c)))
      return !1;
    for (let l = 0; l < 3; l++) {
      const f = o[l], d = n[l];
      if (c.setFromBox(f, s), d.isSeparated(c))
        return !1;
    }
    return !0;
  };
}();
ln.prototype.intersectsTriangle = function() {
  const c = new tr(), e = new Array(3), s = new Dr(), a = new Dr(), r = new oe();
  return function(o) {
    this.needsUpdate && this.update(), o.isExtendedTriangle ? o.needsUpdate && o.update() : (c.copy(o), c.update(), o = c);
    const u = this.satBounds, l = this.satAxes;
    e[0] = o.a, e[1] = o.b, e[2] = o.c;
    for (let v = 0; v < 3; v++) {
      const g = u[v], x = l[v];
      if (s.setFromPoints(x, e), g.isSeparated(s))
        return !1;
    }
    const f = o.satBounds, d = o.satAxes, p = this.points;
    for (let v = 0; v < 3; v++) {
      const g = f[v], x = d[v];
      if (s.setFromPoints(x, p), g.isSeparated(s))
        return !1;
    }
    for (let v = 0; v < 3; v++) {
      const g = l[v];
      for (let x = 0; x < 4; x++) {
        const E = d[x];
        if (r.crossVectors(g, E), s.setFromPoints(r, e), a.setFromPoints(r, p), s.isSeparated(a))
          return !1;
      }
    }
    return !0;
  };
}();
ln.prototype.closestPointToPoint = function() {
  return function(e, s) {
    return this.needsUpdate && this.update(), s.copy(e).applyMatrix4(this.invMatrix).clamp(this.min, this.max).applyMatrix4(this.matrix), s;
  };
}();
ln.prototype.distanceToPoint = function() {
  const c = new oe();
  return function(s) {
    return this.closestPointToPoint(s, c), s.distanceTo(c);
  };
}();
ln.prototype.distanceToBox = function() {
  const c = ["x", "y", "z"], e = new Array(12).fill().map(() => new gr()), s = new Array(12).fill().map(() => new gr()), a = new oe(), r = new oe();
  return function(o, u = 0, l = null, f = null) {
    if (this.needsUpdate && this.update(), this.intersectsBox(o))
      return (l || f) && (o.getCenter(r), this.closestPointToPoint(r, a), o.closestPointToPoint(a, r), l && l.copy(a), f && f.copy(r)), 0;
    const d = u * u, p = o.min, v = o.max, g = this.points;
    let x = 1 / 0;
    for (let _ = 0; _ < 8; _++) {
      const S = g[_];
      r.copy(S).clamp(p, v);
      const A = S.distanceToSquared(r);
      if (A < x && (x = A, l && l.copy(S), f && f.copy(r), A < d))
        return Math.sqrt(A);
    }
    let E = 0;
    for (let _ = 0; _ < 3; _++)
      for (let S = 0; S <= 1; S++)
        for (let A = 0; A <= 1; A++) {
          const T = (_ + 1) % 3, C = (_ + 2) % 3, P = S << T | A << C, M = 1 << _ | S << T | A << C, b = g[P], L = g[M];
          e[E].set(b, L);
          const R = c[_], I = c[T], k = c[C], O = s[E], N = O.start, J = O.end;
          N[R] = p[R], N[I] = S ? p[I] : v[I], N[k] = A ? p[k] : v[I], J[R] = v[R], J[I] = S ? p[I] : v[I], J[k] = A ? p[k] : v[I], E++;
        }
    for (let _ = 0; _ <= 1; _++)
      for (let S = 0; S <= 1; S++)
        for (let A = 0; A <= 1; A++) {
          r.x = _ ? v.x : p.x, r.y = S ? v.y : p.y, r.z = A ? v.z : p.z, this.closestPointToPoint(r, a);
          const T = r.distanceToSquared(a);
          if (T < x && (x = T, l && l.copy(a), f && f.copy(r), T < d))
            return Math.sqrt(T);
        }
    for (let _ = 0; _ < 12; _++) {
      const S = e[_];
      for (let A = 0; A < 12; A++) {
        const T = s[A];
        lc(S, T, a, r);
        const C = a.distanceToSquared(r);
        if (C < x && (x = C, l && l.copy(a), f && f.copy(r), C < d))
          return Math.sqrt(C);
      }
    }
    return Math.sqrt(x);
  };
}();
class uc {
  constructor(e) {
    this._getNewPrimitive = e, this._primitives = [];
  }
  getPrimitive() {
    const e = this._primitives;
    return e.length === 0 ? this._getNewPrimitive() : e.pop();
  }
  releasePrimitive(e) {
    this._primitives.push(e);
  }
}
class T1 extends uc {
  constructor() {
    super(() => new tr());
  }
}
const Vn = /* @__PURE__ */ new T1();
class E1 {
  constructor() {
    this.float32Array = null, this.uint16Array = null, this.uint32Array = null;
    const e = [];
    let s = null;
    this.setBuffer = (a) => {
      s && e.push(s), s = a, this.float32Array = new Float32Array(a), this.uint16Array = new Uint16Array(a), this.uint32Array = new Uint32Array(a);
    }, this.clearBuffer = () => {
      s = null, this.float32Array = null, this.uint16Array = null, this.uint32Array = null, e.length !== 0 && this.setBuffer(e.pop());
    };
  }
}
const ht = new E1();
let qr, po;
const $i = [], Ta = /* @__PURE__ */ new uc(() => new Mt());
function A1(c, e, s, a, r, n) {
  qr = Ta.getPrimitive(), po = Ta.getPrimitive(), $i.push(qr, po), ht.setBuffer(c._roots[e]);
  const o = zu(0, c.geometry, s, a, r, n);
  ht.clearBuffer(), Ta.releasePrimitive(qr), Ta.releasePrimitive(po), $i.pop(), $i.pop();
  const u = $i.length;
  return u > 0 && (po = $i[u - 1], qr = $i[u - 2]), o;
}
function zu(c, e, s, a, r = null, n = 0, o = 0) {
  const { float32Array: u, uint16Array: l, uint32Array: f } = ht;
  let d = c * 2;
  if (hn(d, l)) {
    const v = Mn(c, f), g = jn(d, l);
    return _t(c, u, qr), a(v, g, !1, o, n + c, qr);
  } else {
    let R = function(k) {
      const { uint16Array: O, uint32Array: N } = ht;
      let J = k * 2;
      for (; !hn(J, O); )
        k = Gn(k), J = k * 2;
      return Mn(k, N);
    }, I = function(k) {
      const { uint16Array: O, uint32Array: N } = ht;
      let J = k * 2;
      for (; !hn(J, O); )
        k = Hn(k, N), J = k * 2;
      return Mn(k, N) + jn(J, O);
    };
    const v = Gn(c), g = Hn(c, f);
    let x = v, E = g, _, S, A, T;
    if (r && (A = qr, T = po, _t(x, u, A), _t(E, u, T), _ = r(A), S = r(T), S < _)) {
      x = g, E = v;
      const k = _;
      _ = S, S = k, A = T;
    }
    A || (A = qr, _t(x, u, A));
    const C = hn(x * 2, l), P = s(A, C, _, o + 1, n + x);
    let M;
    if (P === zd) {
      const k = R(x), N = I(x) - k;
      M = a(k, N, !0, o + 1, n + x, A);
    } else
      M = P && zu(
        x,
        e,
        s,
        a,
        r,
        n,
        o + 1
      );
    if (M)
      return !0;
    T = po, _t(E, u, T);
    const b = hn(E * 2, l), L = s(T, b, S, o + 1, n + E);
    let U;
    if (L === zd) {
      const k = R(E), N = I(E) - k;
      U = a(k, N, !0, o + 1, n + E, T);
    } else
      U = L && zu(
        E,
        e,
        s,
        a,
        r,
        n,
        o + 1
      );
    return !!U;
  }
}
const ns = /* @__PURE__ */ new oe(), vu = /* @__PURE__ */ new oe();
function C1(c, e, s = {}, a = 0, r = 1 / 0) {
  const n = a * a, o = r * r;
  let u = 1 / 0, l = null;
  if (c.shapecast(
    {
      boundsTraverseOrder: (d) => (ns.copy(e).clamp(d.min, d.max), ns.distanceToSquared(e)),
      intersectsBounds: (d, p, v) => v < u && v < o,
      intersectsTriangle: (d, p) => {
        d.closestPointToPoint(e, ns);
        const v = e.distanceToSquared(ns);
        return v < u && (vu.copy(ns), u = v, l = p), v < n;
      }
    }
  ), u === 1 / 0)
    return null;
  const f = Math.sqrt(u);
  return s.point ? s.point.copy(vu) : s.point = vu.clone(), s.distance = f, s.faceIndex = l, s;
}
const eo = /* @__PURE__ */ new oe(), to = /* @__PURE__ */ new oe(), no = /* @__PURE__ */ new oe(), Ea = /* @__PURE__ */ new Qe(), Aa = /* @__PURE__ */ new Qe(), Ca = /* @__PURE__ */ new Qe(), Wd = /* @__PURE__ */ new oe(), Xd = /* @__PURE__ */ new oe(), Kd = /* @__PURE__ */ new oe(), Pa = /* @__PURE__ */ new oe();
function P1(c, e, s, a, r, n, o, u) {
  let l;
  if (n === mh ? l = c.intersectTriangle(a, s, e, !0, r) : l = c.intersectTriangle(e, s, a, n !== qu, r), l === null)
    return null;
  const f = c.origin.distanceTo(r);
  return f < o || f > u ? null : {
    distance: f,
    point: r.clone()
  };
}
function M1(c, e, s, a, r, n, o, u, l, f, d) {
  eo.fromBufferAttribute(e, n), to.fromBufferAttribute(e, o), no.fromBufferAttribute(e, u);
  const p = P1(c, eo, to, no, Pa, l, f, d);
  if (p) {
    a && (Ea.fromBufferAttribute(a, n), Aa.fromBufferAttribute(a, o), Ca.fromBufferAttribute(a, u), p.uv = as.getInterpolation(Pa, eo, to, no, Ea, Aa, Ca, new Qe())), r && (Ea.fromBufferAttribute(r, n), Aa.fromBufferAttribute(r, o), Ca.fromBufferAttribute(r, u), p.uv1 = as.getInterpolation(Pa, eo, to, no, Ea, Aa, Ca, new Qe())), s && (Wd.fromBufferAttribute(s, n), Xd.fromBufferAttribute(s, o), Kd.fromBufferAttribute(s, u), p.normal = as.getInterpolation(Pa, eo, to, no, Wd, Xd, Kd, new oe()), p.normal.dot(c.direction) > 0 && p.normal.multiplyScalar(-1));
    const v = {
      a: n,
      b: o,
      c: u,
      normal: new oe(),
      materialIndex: 0
    };
    as.getNormal(eo, to, no, v.normal), p.face = v, p.faceIndex = n;
  }
  return p;
}
function Qa(c, e, s, a, r, n, o) {
  const u = a * 3;
  let l = u + 0, f = u + 1, d = u + 2;
  const p = c.index;
  c.index && (l = p.getX(l), f = p.getX(f), d = p.getX(d));
  const { position: v, normal: g, uv: x, uv1: E } = c.attributes, _ = M1(s, v, g, x, E, l, f, d, e, n, o);
  return _ ? (_.faceIndex = a, r && r.push(_), _) : null;
}
function Rt(c, e, s, a) {
  const r = c.a, n = c.b, o = c.c;
  let u = e, l = e + 1, f = e + 2;
  s && (u = s.getX(u), l = s.getX(l), f = s.getX(f)), r.x = a.getX(u), r.y = a.getY(u), r.z = a.getZ(u), n.x = a.getX(l), n.y = a.getY(l), n.z = a.getZ(l), o.x = a.getX(f), o.y = a.getY(f), o.z = a.getZ(f);
}
function b1(c, e, s, a, r, n, o, u) {
  const { geometry: l, _indirectBuffer: f } = c;
  for (let d = a, p = a + r; d < p; d++)
    Qa(l, e, s, d, n, o, u);
}
function L1(c, e, s, a, r, n, o) {
  const { geometry: u, _indirectBuffer: l } = c;
  let f = 1 / 0, d = null;
  for (let p = a, v = a + r; p < v; p++) {
    let g;
    g = Qa(u, e, s, p, null, n, o), g && g.distance < f && (d = g, f = g.distance);
  }
  return d;
}
function R1(c, e, s, a, r, n, o) {
  const { geometry: u } = s, { index: l } = u, f = u.attributes.position;
  for (let d = c, p = e + c; d < p; d++) {
    let v;
    if (v = d, Rt(o, v * 3, l, f), o.needsUpdate = !0, a(o, v, r, n))
      return !0;
  }
  return !1;
}
function k1(c, e = null) {
  e && Array.isArray(e) && (e = new Set(e));
  const s = c.geometry, a = s.index ? s.index.array : null, r = s.attributes.position;
  let n, o, u, l, f = 0;
  const d = c._roots;
  for (let v = 0, g = d.length; v < g; v++)
    n = d[v], o = new Uint32Array(n), u = new Uint16Array(n), l = new Float32Array(n), p(0, f), f += n.byteLength;
  function p(v, g, x = !1) {
    const E = v * 2;
    if (u[E + 15] === Ya) {
      const S = o[v + 6], A = u[E + 14];
      let T = 1 / 0, C = 1 / 0, P = 1 / 0, M = -1 / 0, b = -1 / 0, L = -1 / 0;
      for (let U = 3 * S, R = 3 * (S + A); U < R; U++) {
        let I = a[U];
        const k = r.getX(I), O = r.getY(I), N = r.getZ(I);
        k < T && (T = k), k > M && (M = k), O < C && (C = O), O > b && (b = O), N < P && (P = N), N > L && (L = N);
      }
      return l[v + 0] !== T || l[v + 1] !== C || l[v + 2] !== P || l[v + 3] !== M || l[v + 4] !== b || l[v + 5] !== L ? (l[v + 0] = T, l[v + 1] = C, l[v + 2] = P, l[v + 3] = M, l[v + 4] = b, l[v + 5] = L, !0) : !1;
    } else {
      const S = v + 8, A = o[v + 6], T = S + g, C = A + g;
      let P = x, M = !1, b = !1;
      e ? P || (M = e.has(T), b = e.has(C), P = !M && !b) : (M = !0, b = !0);
      const L = P || M, U = P || b;
      let R = !1;
      L && (R = p(S, g, P));
      let I = !1;
      U && (I = p(A, g, P));
      const k = R || I;
      if (k)
        for (let O = 0; O < 3; O++) {
          const N = S + O, J = A + O, Z = l[N], ce = l[N + 3], K = l[J], V = l[J + 3];
          l[v + O] = Z < K ? Z : K, l[v + O + 3] = ce > V ? ce : V;
        }
      return k;
    }
  }
}
function Jr(c, e, s, a, r) {
  let n, o, u, l, f, d;
  const p = 1 / s.direction.x, v = 1 / s.direction.y, g = 1 / s.direction.z, x = s.origin.x, E = s.origin.y, _ = s.origin.z;
  let S = e[c], A = e[c + 3], T = e[c + 1], C = e[c + 3 + 1], P = e[c + 2], M = e[c + 3 + 2];
  return p >= 0 ? (n = (S - x) * p, o = (A - x) * p) : (n = (A - x) * p, o = (S - x) * p), v >= 0 ? (u = (T - E) * v, l = (C - E) * v) : (u = (C - E) * v, l = (T - E) * v), n > l || u > o || ((u > n || isNaN(n)) && (n = u), (l < o || isNaN(o)) && (o = l), g >= 0 ? (f = (P - _) * g, d = (M - _) * g) : (f = (M - _) * g, d = (P - _) * g), n > d || f > o) ? !1 : ((f > n || n !== n) && (n = f), (d < o || o !== o) && (o = d), n <= r && o >= a);
}
function U1(c, e, s, a, r, n, o, u) {
  const { geometry: l, _indirectBuffer: f } = c;
  for (let d = a, p = a + r; d < p; d++) {
    let v = f ? f[d] : d;
    Qa(l, e, s, v, n, o, u);
  }
}
function D1(c, e, s, a, r, n, o) {
  const { geometry: u, _indirectBuffer: l } = c;
  let f = 1 / 0, d = null;
  for (let p = a, v = a + r; p < v; p++) {
    let g;
    g = Qa(u, e, s, l ? l[p] : p, null, n, o), g && g.distance < f && (d = g, f = g.distance);
  }
  return d;
}
function F1(c, e, s, a, r, n, o) {
  const { geometry: u } = s, { index: l } = u, f = u.attributes.position;
  for (let d = c, p = e + c; d < p; d++) {
    let v;
    if (v = s.resolveTriangleIndex(d), Rt(o, v * 3, l, f), o.needsUpdate = !0, a(o, v, r, n))
      return !0;
  }
  return !1;
}
function I1(c, e, s, a, r, n, o) {
  ht.setBuffer(c._roots[e]), ju(0, c, s, a, r, n, o), ht.clearBuffer();
}
function ju(c, e, s, a, r, n, o) {
  const { float32Array: u, uint16Array: l, uint32Array: f } = ht, d = c * 2;
  if (hn(d, l)) {
    const v = Mn(c, f), g = jn(d, l);
    b1(e, s, a, v, g, r, n, o);
  } else {
    const v = Gn(c);
    Jr(v, u, a, n, o) && ju(v, e, s, a, r, n, o);
    const g = Hn(c, f);
    Jr(g, u, a, n, o) && ju(g, e, s, a, r, n, o);
  }
}
const O1 = ["x", "y", "z"];
function N1(c, e, s, a, r, n) {
  ht.setBuffer(c._roots[e]);
  const o = Gu(0, c, s, a, r, n);
  return ht.clearBuffer(), o;
}
function Gu(c, e, s, a, r, n) {
  const { float32Array: o, uint16Array: u, uint32Array: l } = ht;
  let f = c * 2;
  if (hn(f, u)) {
    const p = Mn(c, l), v = jn(f, u);
    return L1(e, s, a, p, v, r, n);
  } else {
    const p = lp(c, l), v = O1[p], x = a.direction[v] >= 0;
    let E, _;
    x ? (E = Gn(c), _ = Hn(c, l)) : (E = Hn(c, l), _ = Gn(c));
    const A = Jr(E, o, a, r, n) ? Gu(E, e, s, a, r, n) : null;
    if (A) {
      const P = A.point[v];
      if (x ? P <= o[_ + p] : (
        // min bounding data
        P >= o[_ + p + 3]
      ))
        return A;
    }
    const C = Jr(_, o, a, r, n) ? Gu(_, e, s, a, r, n) : null;
    return A && C ? A.distance <= C.distance ? A : C : A || C || null;
  }
}
const Ma = /* @__PURE__ */ new Mt(), ro = /* @__PURE__ */ new tr(), io = /* @__PURE__ */ new tr(), rs = /* @__PURE__ */ new Ft(), Yd = /* @__PURE__ */ new ln(), ba = /* @__PURE__ */ new ln();
function B1(c, e, s, a) {
  ht.setBuffer(c._roots[e]);
  const r = Hu(0, c, s, a);
  return ht.clearBuffer(), r;
}
function Hu(c, e, s, a, r = null) {
  const { float32Array: n, uint16Array: o, uint32Array: u } = ht;
  let l = c * 2;
  if (r === null && (s.boundingBox || s.computeBoundingBox(), Yd.set(s.boundingBox.min, s.boundingBox.max, a), r = Yd), hn(l, o)) {
    const d = e.geometry, p = d.index, v = d.attributes.position, g = s.index, x = s.attributes.position, E = Mn(c, u), _ = jn(l, o);
    if (rs.copy(a).invert(), s.boundsTree)
      return _t(c, n, ba), ba.matrix.copy(rs), ba.needsUpdate = !0, s.boundsTree.shapecast({
        intersectsBounds: (A) => ba.intersectsBox(A),
        intersectsTriangle: (A) => {
          A.a.applyMatrix4(a), A.b.applyMatrix4(a), A.c.applyMatrix4(a), A.needsUpdate = !0;
          for (let T = E * 3, C = (_ + E) * 3; T < C; T += 3)
            if (Rt(io, T, p, v), io.needsUpdate = !0, A.intersectsTriangle(io))
              return !0;
          return !1;
        }
      });
    for (let S = E * 3, A = (_ + E) * 3; S < A; S += 3) {
      Rt(ro, S, p, v), ro.a.applyMatrix4(rs), ro.b.applyMatrix4(rs), ro.c.applyMatrix4(rs), ro.needsUpdate = !0;
      for (let T = 0, C = g.count; T < C; T += 3)
        if (Rt(io, T, g, x), io.needsUpdate = !0, ro.intersectsTriangle(io))
          return !0;
    }
  } else {
    const d = c + 8, p = u[c + 6];
    return _t(d, n, Ma), !!(r.intersectsBox(Ma) && Hu(d, e, s, a, r) || (_t(p, n, Ma), r.intersectsBox(Ma) && Hu(p, e, s, a, r)));
  }
}
const La = /* @__PURE__ */ new Ft(), gu = /* @__PURE__ */ new ln(), is = /* @__PURE__ */ new ln(), z1 = /* @__PURE__ */ new oe(), j1 = /* @__PURE__ */ new oe(), G1 = /* @__PURE__ */ new oe(), H1 = /* @__PURE__ */ new oe();
function V1(c, e, s, a = {}, r = {}, n = 0, o = 1 / 0) {
  e.boundingBox || e.computeBoundingBox(), gu.set(e.boundingBox.min, e.boundingBox.max, s), gu.needsUpdate = !0;
  const u = c.geometry, l = u.attributes.position, f = u.index, d = e.attributes.position, p = e.index, v = Vn.getPrimitive(), g = Vn.getPrimitive();
  let x = z1, E = j1, _ = null, S = null;
  r && (_ = G1, S = H1);
  let A = 1 / 0, T = null, C = null;
  return La.copy(s).invert(), is.matrix.copy(La), c.shapecast(
    {
      boundsTraverseOrder: (P) => gu.distanceToBox(P),
      intersectsBounds: (P, M, b) => b < A && b < o ? (M && (is.min.copy(P.min), is.max.copy(P.max), is.needsUpdate = !0), !0) : !1,
      intersectsRange: (P, M) => {
        if (e.boundsTree)
          return e.boundsTree.shapecast({
            boundsTraverseOrder: (L) => is.distanceToBox(L),
            intersectsBounds: (L, U, R) => R < A && R < o,
            intersectsRange: (L, U) => {
              for (let R = L, I = L + U; R < I; R++) {
                Rt(g, 3 * R, p, d), g.a.applyMatrix4(s), g.b.applyMatrix4(s), g.c.applyMatrix4(s), g.needsUpdate = !0;
                for (let k = P, O = P + M; k < O; k++) {
                  Rt(v, 3 * k, f, l), v.needsUpdate = !0;
                  const N = v.distanceToTriangle(g, x, _);
                  if (N < A && (E.copy(x), S && S.copy(_), A = N, T = k, C = R), N < n)
                    return !0;
                }
              }
            }
          });
        {
          const b = wo(e);
          for (let L = 0, U = b; L < U; L++) {
            Rt(g, 3 * L, p, d), g.a.applyMatrix4(s), g.b.applyMatrix4(s), g.c.applyMatrix4(s), g.needsUpdate = !0;
            for (let R = P, I = P + M; R < I; R++) {
              Rt(v, 3 * R, f, l), v.needsUpdate = !0;
              const k = v.distanceToTriangle(g, x, _);
              if (k < A && (E.copy(x), S && S.copy(_), A = k, T = R, C = L), k < n)
                return !0;
            }
          }
        }
      }
    }
  ), Vn.releasePrimitive(v), Vn.releasePrimitive(g), A === 1 / 0 ? null : (a.point ? a.point.copy(E) : a.point = E.clone(), a.distance = A, a.faceIndex = T, r && (r.point ? r.point.copy(S) : r.point = S.clone(), r.point.applyMatrix4(La), E.applyMatrix4(La), r.distance = E.sub(r.point).length(), r.faceIndex = C), a);
}
function W1(c, e = null) {
  e && Array.isArray(e) && (e = new Set(e));
  const s = c.geometry, a = s.index ? s.index.array : null, r = s.attributes.position;
  let n, o, u, l, f = 0;
  const d = c._roots;
  for (let v = 0, g = d.length; v < g; v++)
    n = d[v], o = new Uint32Array(n), u = new Uint16Array(n), l = new Float32Array(n), p(0, f), f += n.byteLength;
  function p(v, g, x = !1) {
    const E = v * 2;
    if (u[E + 15] === Ya) {
      const S = o[v + 6], A = u[E + 14];
      let T = 1 / 0, C = 1 / 0, P = 1 / 0, M = -1 / 0, b = -1 / 0, L = -1 / 0;
      for (let U = S, R = S + A; U < R; U++) {
        const I = 3 * c.resolveTriangleIndex(U);
        for (let k = 0; k < 3; k++) {
          let O = I + k;
          O = a ? a[O] : O;
          const N = r.getX(O), J = r.getY(O), Z = r.getZ(O);
          N < T && (T = N), N > M && (M = N), J < C && (C = J), J > b && (b = J), Z < P && (P = Z), Z > L && (L = Z);
        }
      }
      return l[v + 0] !== T || l[v + 1] !== C || l[v + 2] !== P || l[v + 3] !== M || l[v + 4] !== b || l[v + 5] !== L ? (l[v + 0] = T, l[v + 1] = C, l[v + 2] = P, l[v + 3] = M, l[v + 4] = b, l[v + 5] = L, !0) : !1;
    } else {
      const S = v + 8, A = o[v + 6], T = S + g, C = A + g;
      let P = x, M = !1, b = !1;
      e ? P || (M = e.has(T), b = e.has(C), P = !M && !b) : (M = !0, b = !0);
      const L = P || M, U = P || b;
      let R = !1;
      L && (R = p(S, g, P));
      let I = !1;
      U && (I = p(A, g, P));
      const k = R || I;
      if (k)
        for (let O = 0; O < 3; O++) {
          const N = S + O, J = A + O, Z = l[N], ce = l[N + 3], K = l[J], V = l[J + 3];
          l[v + O] = Z < K ? Z : K, l[v + O + 3] = ce > V ? ce : V;
        }
      return k;
    }
  }
}
function X1(c, e, s, a, r, n, o) {
  ht.setBuffer(c._roots[e]), Vu(0, c, s, a, r, n, o), ht.clearBuffer();
}
function Vu(c, e, s, a, r, n, o) {
  const { float32Array: u, uint16Array: l, uint32Array: f } = ht, d = c * 2;
  if (hn(d, l)) {
    const v = Mn(c, f), g = jn(d, l);
    U1(e, s, a, v, g, r, n, o);
  } else {
    const v = Gn(c);
    Jr(v, u, a, n, o) && Vu(v, e, s, a, r, n, o);
    const g = Hn(c, f);
    Jr(g, u, a, n, o) && Vu(g, e, s, a, r, n, o);
  }
}
const K1 = ["x", "y", "z"];
function Y1(c, e, s, a, r, n) {
  ht.setBuffer(c._roots[e]);
  const o = Wu(0, c, s, a, r, n);
  return ht.clearBuffer(), o;
}
function Wu(c, e, s, a, r, n) {
  const { float32Array: o, uint16Array: u, uint32Array: l } = ht;
  let f = c * 2;
  if (hn(f, u)) {
    const p = Mn(c, l), v = jn(f, u);
    return D1(e, s, a, p, v, r, n);
  } else {
    const p = lp(c, l), v = K1[p], x = a.direction[v] >= 0;
    let E, _;
    x ? (E = Gn(c), _ = Hn(c, l)) : (E = Hn(c, l), _ = Gn(c));
    const A = Jr(E, o, a, r, n) ? Wu(E, e, s, a, r, n) : null;
    if (A) {
      const P = A.point[v];
      if (x ? P <= o[_ + p] : (
        // min bounding data
        P >= o[_ + p + 3]
      ))
        return A;
    }
    const C = Jr(_, o, a, r, n) ? Wu(_, e, s, a, r, n) : null;
    return A && C ? A.distance <= C.distance ? A : C : A || C || null;
  }
}
const Ra = /* @__PURE__ */ new Mt(), oo = /* @__PURE__ */ new tr(), so = /* @__PURE__ */ new tr(), os = /* @__PURE__ */ new Ft(), Qd = /* @__PURE__ */ new ln(), ka = /* @__PURE__ */ new ln();
function Q1(c, e, s, a) {
  ht.setBuffer(c._roots[e]);
  const r = Xu(0, c, s, a);
  return ht.clearBuffer(), r;
}
function Xu(c, e, s, a, r = null) {
  const { float32Array: n, uint16Array: o, uint32Array: u } = ht;
  let l = c * 2;
  if (r === null && (s.boundingBox || s.computeBoundingBox(), Qd.set(s.boundingBox.min, s.boundingBox.max, a), r = Qd), hn(l, o)) {
    const d = e.geometry, p = d.index, v = d.attributes.position, g = s.index, x = s.attributes.position, E = Mn(c, u), _ = jn(l, o);
    if (os.copy(a).invert(), s.boundsTree)
      return _t(c, n, ka), ka.matrix.copy(os), ka.needsUpdate = !0, s.boundsTree.shapecast({
        intersectsBounds: (A) => ka.intersectsBox(A),
        intersectsTriangle: (A) => {
          A.a.applyMatrix4(a), A.b.applyMatrix4(a), A.c.applyMatrix4(a), A.needsUpdate = !0;
          for (let T = E, C = _ + E; T < C; T++)
            if (Rt(so, 3 * e.resolveTriangleIndex(T), p, v), so.needsUpdate = !0, A.intersectsTriangle(so))
              return !0;
          return !1;
        }
      });
    for (let S = E, A = _ + E; S < A; S++) {
      const T = e.resolveTriangleIndex(S);
      Rt(oo, 3 * T, p, v), oo.a.applyMatrix4(os), oo.b.applyMatrix4(os), oo.c.applyMatrix4(os), oo.needsUpdate = !0;
      for (let C = 0, P = g.count; C < P; C += 3)
        if (Rt(so, C, g, x), so.needsUpdate = !0, oo.intersectsTriangle(so))
          return !0;
    }
  } else {
    const d = c + 8, p = u[c + 6];
    return _t(d, n, Ra), !!(r.intersectsBox(Ra) && Xu(d, e, s, a, r) || (_t(p, n, Ra), r.intersectsBox(Ra) && Xu(p, e, s, a, r)));
  }
}
const Ua = /* @__PURE__ */ new Ft(), yu = /* @__PURE__ */ new ln(), ss = /* @__PURE__ */ new ln(), q1 = /* @__PURE__ */ new oe(), Z1 = /* @__PURE__ */ new oe(), J1 = /* @__PURE__ */ new oe(), $1 = /* @__PURE__ */ new oe();
function ey(c, e, s, a = {}, r = {}, n = 0, o = 1 / 0) {
  e.boundingBox || e.computeBoundingBox(), yu.set(e.boundingBox.min, e.boundingBox.max, s), yu.needsUpdate = !0;
  const u = c.geometry, l = u.attributes.position, f = u.index, d = e.attributes.position, p = e.index, v = Vn.getPrimitive(), g = Vn.getPrimitive();
  let x = q1, E = Z1, _ = null, S = null;
  r && (_ = J1, S = $1);
  let A = 1 / 0, T = null, C = null;
  return Ua.copy(s).invert(), ss.matrix.copy(Ua), c.shapecast(
    {
      boundsTraverseOrder: (P) => yu.distanceToBox(P),
      intersectsBounds: (P, M, b) => b < A && b < o ? (M && (ss.min.copy(P.min), ss.max.copy(P.max), ss.needsUpdate = !0), !0) : !1,
      intersectsRange: (P, M) => {
        if (e.boundsTree) {
          const b = e.boundsTree;
          return b.shapecast({
            boundsTraverseOrder: (L) => ss.distanceToBox(L),
            intersectsBounds: (L, U, R) => R < A && R < o,
            intersectsRange: (L, U) => {
              for (let R = L, I = L + U; R < I; R++) {
                const k = b.resolveTriangleIndex(R);
                Rt(g, 3 * k, p, d), g.a.applyMatrix4(s), g.b.applyMatrix4(s), g.c.applyMatrix4(s), g.needsUpdate = !0;
                for (let O = P, N = P + M; O < N; O++) {
                  const J = c.resolveTriangleIndex(O);
                  Rt(v, 3 * J, f, l), v.needsUpdate = !0;
                  const Z = v.distanceToTriangle(g, x, _);
                  if (Z < A && (E.copy(x), S && S.copy(_), A = Z, T = O, C = R), Z < n)
                    return !0;
                }
              }
            }
          });
        } else {
          const b = wo(e);
          for (let L = 0, U = b; L < U; L++) {
            Rt(g, 3 * L, p, d), g.a.applyMatrix4(s), g.b.applyMatrix4(s), g.c.applyMatrix4(s), g.needsUpdate = !0;
            for (let R = P, I = P + M; R < I; R++) {
              const k = c.resolveTriangleIndex(R);
              Rt(v, 3 * k, f, l), v.needsUpdate = !0;
              const O = v.distanceToTriangle(g, x, _);
              if (O < A && (E.copy(x), S && S.copy(_), A = O, T = R, C = L), O < n)
                return !0;
            }
          }
        }
      }
    }
  ), Vn.releasePrimitive(v), Vn.releasePrimitive(g), A === 1 / 0 ? null : (a.point ? a.point.copy(E) : a.point = E.clone(), a.distance = A, a.faceIndex = T, r && (r.point ? r.point.copy(S) : r.point = S.clone(), r.point.applyMatrix4(Ua), E.applyMatrix4(Ua), r.distance = E.sub(r.point).length(), r.faceIndex = C), a);
}
function ty() {
  return typeof SharedArrayBuffer < "u";
}
const vs = new ht.constructor(), Wa = new ht.constructor(), Yr = new uc(() => new Mt()), ao = new Mt(), lo = new Mt(), xu = new Mt(), Su = new Mt();
let wu = !1;
function ny(c, e, s, a) {
  if (wu)
    throw new Error("MeshBVH: Recursive calls to bvhcast not supported.");
  wu = !0;
  const r = c._roots, n = e._roots;
  let o, u = 0, l = 0;
  const f = new Ft().copy(s).invert();
  for (let d = 0, p = r.length; d < p; d++) {
    vs.setBuffer(r[d]), l = 0;
    const v = Yr.getPrimitive();
    _t(0, vs.float32Array, v), v.applyMatrix4(f);
    for (let g = 0, x = n.length; g < x && (Wa.setBuffer(n[g]), o = er(
      0,
      0,
      s,
      f,
      a,
      u,
      l,
      0,
      0,
      v
    ), Wa.clearBuffer(), l += n[g].length, !o); g++)
      ;
    if (Yr.releasePrimitive(v), vs.clearBuffer(), u += r[d].length, o)
      break;
  }
  return wu = !1, o;
}
function er(c, e, s, a, r, n = 0, o = 0, u = 0, l = 0, f = null, d = !1) {
  let p, v;
  d ? (p = Wa, v = vs) : (p = vs, v = Wa);
  const g = p.float32Array, x = p.uint32Array, E = p.uint16Array, _ = v.float32Array, S = v.uint32Array, A = v.uint16Array, T = c * 2, C = e * 2, P = hn(T, E), M = hn(C, A);
  let b = !1;
  if (M && P)
    d ? b = r(
      Mn(e, S),
      jn(e * 2, A),
      Mn(c, x),
      jn(c * 2, E),
      l,
      o + e,
      u,
      n + c
    ) : b = r(
      Mn(c, x),
      jn(c * 2, E),
      Mn(e, S),
      jn(e * 2, A),
      u,
      n + c,
      l,
      o + e
    );
  else if (M) {
    const L = Yr.getPrimitive();
    _t(e, _, L), L.applyMatrix4(s);
    const U = Gn(c), R = Hn(c, x);
    _t(U, g, ao), _t(R, g, lo);
    const I = L.intersectsBox(ao), k = L.intersectsBox(lo);
    b = I && er(
      e,
      U,
      a,
      s,
      r,
      o,
      n,
      l,
      u + 1,
      L,
      !d
    ) || k && er(
      e,
      R,
      a,
      s,
      r,
      o,
      n,
      l,
      u + 1,
      L,
      !d
    ), Yr.releasePrimitive(L);
  } else {
    const L = Gn(e), U = Hn(e, S);
    _t(L, _, xu), _t(U, _, Su);
    const R = f.intersectsBox(xu), I = f.intersectsBox(Su);
    if (R && I)
      b = er(
        c,
        L,
        s,
        a,
        r,
        n,
        o,
        u,
        l + 1,
        f,
        d
      ) || er(
        c,
        U,
        s,
        a,
        r,
        n,
        o,
        u,
        l + 1,
        f,
        d
      );
    else if (R)
      if (P)
        b = er(
          c,
          L,
          s,
          a,
          r,
          n,
          o,
          u,
          l + 1,
          f,
          d
        );
      else {
        const k = Yr.getPrimitive();
        k.copy(xu).applyMatrix4(s);
        const O = Gn(c), N = Hn(c, x);
        _t(O, g, ao), _t(N, g, lo);
        const J = k.intersectsBox(ao), Z = k.intersectsBox(lo);
        b = J && er(
          L,
          O,
          a,
          s,
          r,
          o,
          n,
          l,
          u + 1,
          k,
          !d
        ) || Z && er(
          L,
          N,
          a,
          s,
          r,
          o,
          n,
          l,
          u + 1,
          k,
          !d
        ), Yr.releasePrimitive(k);
      }
    else if (I)
      if (P)
        b = er(
          c,
          U,
          s,
          a,
          r,
          n,
          o,
          u,
          l + 1,
          f,
          d
        );
      else {
        const k = Yr.getPrimitive();
        k.copy(Su).applyMatrix4(s);
        const O = Gn(c), N = Hn(c, x);
        _t(O, g, ao), _t(N, g, lo);
        const J = k.intersectsBox(ao), Z = k.intersectsBox(lo);
        b = J && er(
          U,
          O,
          a,
          s,
          r,
          o,
          n,
          l,
          u + 1,
          k,
          !d
        ) || Z && er(
          U,
          N,
          a,
          s,
          r,
          o,
          n,
          l,
          u + 1,
          k,
          !d
        ), Yr.releasePrimitive(k);
      }
  }
  return b;
}
const Da = /* @__PURE__ */ new ln(), qd = /* @__PURE__ */ new Mt(), ry = {
  strategy: ip,
  maxDepth: 40,
  maxLeafTris: 10,
  useSharedArrayBuffer: !1,
  setBoundingBox: !0,
  onProgress: null,
  indirect: !1,
  verbose: !0,
  range: null
};
class cc {
  static serialize(e, s = {}) {
    s = {
      cloneBuffers: !0,
      ...s
    };
    const a = e.geometry, r = e._roots, n = e._indirectBuffer, o = a.getIndex();
    let u;
    return s.cloneBuffers ? u = {
      roots: r.map((l) => l.slice()),
      index: o ? o.array.slice() : null,
      indirectBuffer: n ? n.slice() : null
    } : u = {
      roots: r,
      index: o ? o.array : null,
      indirectBuffer: n
    }, u;
  }
  static deserialize(e, s, a = {}) {
    a = {
      setIndex: !0,
      indirect: !!e.indirectBuffer,
      ...a
    };
    const { index: r, roots: n, indirectBuffer: o } = e, u = new cc(s, { ...a, [du]: !0 });
    if (u._roots = n, u._indirectBuffer = o || null, a.setIndex) {
      const l = s.getIndex();
      if (l === null) {
        const f = new ds(e.index, 1, !1);
        s.setIndex(f);
      } else
        l.array !== r && (l.array.set(r), l.needsUpdate = !0);
    }
    return u;
  }
  get indirect() {
    return !!this._indirectBuffer;
  }
  constructor(e, s = {}) {
    if (e.isBufferGeometry) {
      if (e.index && e.index.isInterleavedBufferAttribute)
        throw new Error("MeshBVH: InterleavedBufferAttribute is not supported for the index attribute.");
    } else
      throw new Error("MeshBVH: Only BufferGeometries are supported.");
    if (s = Object.assign({
      ...ry,
      // undocumented options
      // Whether to skip generating the tree. Used for deserialization.
      [du]: !1
    }, s), s.useSharedArrayBuffer && !ty())
      throw new Error("MeshBVH: SharedArrayBuffer is not available.");
    this.geometry = e, this._roots = null, this._indirectBuffer = null, s[du] || (x1(this, s), !e.boundingBox && s.setBoundingBox && (e.boundingBox = this.getBoundingBox(new Mt()))), this.resolveTriangleIndex = s.indirect ? (a) => this._indirectBuffer[a] : (a) => a;
  }
  refit(e = null) {
    return (this.indirect ? W1 : k1)(this, e);
  }
  traverse(e, s = 0) {
    const a = this._roots[s], r = new Uint32Array(a), n = new Uint16Array(a);
    o(0);
    function o(u, l = 0) {
      const f = u * 2, d = n[f + 15] === Ya;
      if (d) {
        const p = r[u + 6], v = n[f + 14];
        e(l, d, new Float32Array(a, u * 4, 6), p, v);
      } else {
        const p = u + ms / 4, v = r[u + 6], g = r[u + 7];
        e(l, d, new Float32Array(a, u * 4, 6), g) || (o(p, l + 1), o(v, l + 1));
      }
    }
  }
  /* Core Cast Functions */
  raycast(e, s = go, a = 0, r = 1 / 0) {
    const n = this._roots, o = this.geometry, u = [], l = s.isMaterial, f = Array.isArray(s), d = o.groups, p = l ? s.side : s, v = this.indirect ? X1 : I1;
    for (let g = 0, x = n.length; g < x; g++) {
      const E = f ? s[d[g].materialIndex].side : p, _ = u.length;
      if (v(this, g, E, e, u, a, r), f) {
        const S = d[g].materialIndex;
        for (let A = _, T = u.length; A < T; A++)
          u[A].face.materialIndex = S;
      }
    }
    return u;
  }
  raycastFirst(e, s = go, a = 0, r = 1 / 0) {
    const n = this._roots, o = this.geometry, u = s.isMaterial, l = Array.isArray(s);
    let f = null;
    const d = o.groups, p = u ? s.side : s, v = this.indirect ? Y1 : N1;
    for (let g = 0, x = n.length; g < x; g++) {
      const E = l ? s[d[g].materialIndex].side : p, _ = v(this, g, E, e, a, r);
      _ != null && (f == null || _.distance < f.distance) && (f = _, l && (_.face.materialIndex = d[g].materialIndex));
    }
    return f;
  }
  intersectsGeometry(e, s) {
    let a = !1;
    const r = this._roots, n = this.indirect ? Q1 : B1;
    for (let o = 0, u = r.length; o < u && (a = n(this, o, e, s), !a); o++)
      ;
    return a;
  }
  shapecast(e) {
    const s = Vn.getPrimitive(), a = this.indirect ? F1 : R1;
    let {
      boundsTraverseOrder: r,
      intersectsBounds: n,
      intersectsRange: o,
      intersectsTriangle: u
    } = e;
    if (o && u) {
      const p = o;
      o = (v, g, x, E, _) => p(v, g, x, E, _) ? !0 : a(v, g, this, u, x, E, s);
    } else
      o || (u ? o = (p, v, g, x) => a(p, v, this, u, g, x, s) : o = (p, v, g) => g);
    let l = !1, f = 0;
    const d = this._roots;
    for (let p = 0, v = d.length; p < v; p++) {
      const g = d[p];
      if (l = A1(this, p, n, o, r, f), l)
        break;
      f += g.byteLength;
    }
    return Vn.releasePrimitive(s), l;
  }
  bvhcast(e, s, a) {
    let {
      intersectsRanges: r,
      intersectsTriangles: n
    } = a;
    const o = Vn.getPrimitive(), u = this.geometry.index, l = this.geometry.attributes.position, f = this.indirect ? (x) => {
      const E = this.resolveTriangleIndex(x);
      Rt(o, E * 3, u, l);
    } : (x) => {
      Rt(o, x * 3, u, l);
    }, d = Vn.getPrimitive(), p = e.geometry.index, v = e.geometry.attributes.position, g = e.indirect ? (x) => {
      const E = e.resolveTriangleIndex(x);
      Rt(d, E * 3, p, v);
    } : (x) => {
      Rt(d, x * 3, p, v);
    };
    if (n) {
      const x = (E, _, S, A, T, C, P, M) => {
        for (let b = S, L = S + A; b < L; b++) {
          g(b), d.a.applyMatrix4(s), d.b.applyMatrix4(s), d.c.applyMatrix4(s), d.needsUpdate = !0;
          for (let U = E, R = E + _; U < R; U++)
            if (f(U), o.needsUpdate = !0, n(o, d, U, b, T, C, P, M))
              return !0;
        }
        return !1;
      };
      if (r) {
        const E = r;
        r = function(_, S, A, T, C, P, M, b) {
          return E(_, S, A, T, C, P, M, b) ? !0 : x(_, S, A, T, C, P, M, b);
        };
      } else
        r = x;
    }
    return ny(this, e, s, r);
  }
  /* Derived Cast Functions */
  intersectsBox(e, s) {
    return Da.set(e.min, e.max, s), Da.needsUpdate = !0, this.shapecast(
      {
        intersectsBounds: (a) => Da.intersectsBox(a),
        intersectsTriangle: (a) => Da.intersectsTriangle(a)
      }
    );
  }
  intersectsSphere(e) {
    return this.shapecast(
      {
        intersectsBounds: (s) => e.intersectsBox(s),
        intersectsTriangle: (s) => s.intersectsSphere(e)
      }
    );
  }
  closestPointToGeometry(e, s, a = {}, r = {}, n = 0, o = 1 / 0) {
    return (this.indirect ? ey : V1)(
      this,
      e,
      s,
      a,
      r,
      n,
      o
    );
  }
  closestPointToPoint(e, s = {}, a = 0, r = 1 / 0) {
    return C1(
      this,
      e,
      s,
      a,
      r
    );
  }
  getBoundingBox(e) {
    return e.makeEmpty(), this._roots.forEach((a) => {
      _t(0, new Float32Array(a), qd), e.union(qd);
    }), e;
  }
}
function Zd(c, e, s) {
  return c === null ? null : (c.point.applyMatrix4(e.matrixWorld), c.distance = c.point.distanceTo(s.ray.origin), c.object = e, c);
}
const Fa = /* @__PURE__ */ new sh(), Jd = /* @__PURE__ */ new oe(), $d = /* @__PURE__ */ new Ft(), iy = Xn.prototype.raycast, oy = null, eh = /* @__PURE__ */ new oe(), Xt = /* @__PURE__ */ new Xn(), Ia = [];
function sy(c, e) {
  this.isBatchedMesh ? ay.call(this, c, e) : ly.call(this, c, e);
}
function ay(c, e) {
  if (this.boundsTrees) {
    const s = this.boundsTrees, a = this._drawInfo, r = this._drawRanges, n = this.matrixWorld;
    Xt.material = this.material, Xt.geometry = this.geometry;
    const o = Xt.geometry.boundsTree, u = Xt.geometry.drawRange;
    Xt.geometry.boundingSphere === null && (Xt.geometry.boundingSphere = new $r());
    for (let l = 0, f = a.length; l < f; l++) {
      if (!this.getVisibleAt(l))
        continue;
      const d = a[l].geometryIndex;
      if (Xt.geometry.boundsTree = s[d], this.getMatrixAt(l, Xt.matrixWorld).premultiply(n), !Xt.geometry.boundsTree) {
        this.getBoundingBoxAt(d, Xt.geometry.boundingBox), this.getBoundingSphereAt(d, Xt.geometry.boundingSphere);
        const p = r[d];
        Xt.geometry.setDrawRange(p.start, p.count);
      }
      Xt.raycast(c, Ia);
      for (let p = 0, v = Ia.length; p < v; p++) {
        const g = Ia[p];
        g.object = this, g.batchId = l, e.push(g);
      }
      Ia.length = 0;
    }
    Xt.geometry.boundsTree = o, Xt.geometry.drawRange = u, Xt.material = null, Xt.geometry = null;
  } else
    oy.call(this, c, e);
}
function ly(c, e) {
  if (this.geometry.boundsTree) {
    if (this.material === void 0)
      return;
    $d.copy(this.matrixWorld).invert(), Fa.copy(c.ray).applyMatrix4($d), eh.setFromMatrixScale(this.matrixWorld), Jd.copy(Fa.direction).multiply(eh);
    const s = Jd.length(), a = c.near / s, r = c.far / s, n = this.geometry.boundsTree;
    if (c.firstHitOnly === !0) {
      const o = Zd(n.raycastFirst(Fa, this.material, a, r), this, c);
      o && e.push(o);
    } else {
      const o = n.raycast(Fa, this.material, a, r);
      for (let u = 0, l = o.length; u < l; u++) {
        const f = Zd(o[u], this, c);
        f && e.push(f);
      }
    }
  } else
    iy.call(this, c, e);
}
function uy(c = {}) {
  return this.boundsTree = new cc(this, c), this.boundsTree;
}
function cy() {
  this.boundsTree = null;
}
const th = (c) => c.isMesh, fy = /* @__PURE__ */ te.forwardRef(({
  enabled: c = !0,
  firstHitOnly: e = !1,
  children: s,
  strategy: a = op,
  verbose: r = !1,
  setBoundingBox: n = !0,
  maxDepth: o = 40,
  maxLeafTris: u = 10,
  indirect: l = !1,
  ...f
}, d) => {
  const p = te.useRef(null), v = Qt((g) => g.raycaster);
  return te.useImperativeHandle(d, () => p.current, []), te.useEffect(() => {
    if (c) {
      const g = {
        strategy: a,
        verbose: r,
        setBoundingBox: n,
        maxDepth: o,
        maxLeafTris: u,
        indirect: l
      }, x = p.current;
      return v.firstHitOnly = e, x.traverse((E) => {
        th(E) && !E.geometry.boundsTree && E.raycast === Xn.prototype.raycast && (E.raycast = sy, E.geometry.computeBoundsTree = uy, E.geometry.disposeBoundsTree = cy, E.geometry.computeBoundsTree(g));
      }), () => {
        delete v.firstHitOnly, x.traverse((E) => {
          th(E) && E.geometry.boundsTree && (E.geometry.disposeBoundsTree(), E.raycast = Xn.prototype.raycast);
        });
      };
    }
  }, []), /* @__PURE__ */ te.createElement("group", yo({
    ref: p
  }, f), s);
}), dy = /* @__PURE__ */ te.forwardRef(function({
  children: e,
  disable: s,
  disableX: a,
  disableY: r,
  disableZ: n,
  left: o,
  right: u,
  top: l,
  bottom: f,
  front: d,
  back: p,
  onCentered: v,
  precise: g = !0,
  cacheKey: x = 0,
  ...E
}, _) {
  const S = te.useRef(null), A = te.useRef(null), T = te.useRef(null);
  return te.useLayoutEffect(() => {
    A.current.matrixWorld.identity();
    const C = new Mt().setFromObject(T.current, g), P = new oe(), M = new $r(), b = C.max.x - C.min.x, L = C.max.y - C.min.y, U = C.max.z - C.min.z;
    C.getCenter(P), C.getBoundingSphere(M);
    const R = l ? L / 2 : f ? -L / 2 : 0, I = o ? -b / 2 : u ? b / 2 : 0, k = d ? U / 2 : p ? -U / 2 : 0;
    A.current.position.set(s || a ? 0 : -P.x + I, s || r ? 0 : -P.y + R, s || n ? 0 : -P.z + k), typeof v < "u" && v({
      parent: S.current.parent,
      container: S.current,
      width: b,
      height: L,
      depth: U,
      boundingBox: C,
      boundingSphere: M,
      center: P,
      verticalAlignment: R,
      horizontalAlignment: I,
      depthAlignment: k
    });
  }, [x, v, l, o, d, s, a, r, n, g, u, f, p]), te.useImperativeHandle(_, () => S.current, []), /* @__PURE__ */ te.createElement("group", yo({
    ref: S
  }, E), /* @__PURE__ */ te.createElement("group", {
    ref: A
  }, /* @__PURE__ */ te.createElement("group", {
    ref: T
  }, e)));
});
function hy() {
  const { controllers: c } = Tt(), e = yr(), s = yr();
  return Ci(() => {
    if (c && c[0] && c[1]) {
      if (c[0].controller) {
        const a = c[0].hand.joints["index-finger-tip"].position;
        e.current.position.copy(a);
      }
      if (c[1].controller) {
        const a = c[1].hand.joints["index-finger-tip"].position;
        s.current.position.copy(a);
      }
    }
  }), ye.jsxs(ye.Fragment, { children: [ye.jsxs("mesh", { name: "leftTipBbox", ref: s, children: [ye.jsx("boxGeometry", { args: [0.02, 0.02, 0.02] }), ye.jsx("meshStandardMaterial", { color: "blue", transparent: !0, opacity: 0 })] }), ye.jsxs("mesh", { name: "rightTipBbox", ref: e, children: [ye.jsx("boxGeometry", { args: [0.02, 0.02, 0.02] }), ye.jsx("meshStandardMaterial", { color: "orange", transparent: !0, opacity: 0 })] })] });
}
function _u(c) {
  const { currentLine: e, scale: s } = c, a = yr();
  return ye.jsxs("group", { children: [ye.jsx(dy, { bottom: !0, right: !0, position: [e.midPoint.x, e.midPoint.y, e.midPoint.z], rotation: [0, 0, 0], children: ye.jsx(rp, { color: "gray", scale: 0.05, ref: a, children: `${(e.startPoint.distanceTo(e.endPoint) * s).toFixed(2)} µm` }) }), ye.jsx(a0, {
    points: [e.startPoint, e.endPoint],
    color: "white",
    lineWidth: 2,
    dashed: !1,
    segments: !0
  })] });
}
function py(c) {
  const { segmentationGroup: e, segmentationSettings: s, segmentationSceneScale: a, renderingSettings: r, materialRef: n, highlightEntity: o, setObsHighlight: u } = c, l = yr(), f = yr(), d = yr(), { isPresenting: p } = Tt();
  kr(() => {
    p && l?.current ? n !== null && (n.current.material.uniforms.u_physical_Pixel.value = 0.2) : p || n !== null && (n.current.material.uniforms.u_physical_Pixel.value = 2.5);
  }, [p]);
  const { scene: v } = Qt(), { controllers: g } = Tt(), [x, E] = an(!1), [_, S] = an(!1), [A, T] = an(!1), [C, P] = an({
    startPoint: new oe(),
    midPoint: new oe(),
    endPoint: new oe(),
    setStartPoint: !1,
    setEndPoint: !1
  }), [M, b] = an([]), [L, U] = an(0);
  return Ci(() => {
    if (p) {
      const R = v.getObjectByName("rightTipBbox"), I = v.getObjectByName("leftTipBbox"), k = new Mt().setFromObject(I), O = new Mt().setFromObject(R);
      let N = !1;
      if (U(L - 1), k.intersectsBox(O) && k.max.x !== -O.min.x && (E(!0), T(!0), P({
        startPoint: new oe(),
        midPoint: new oe(),
        endPoint: new oe(),
        setStartPoint: !1,
        setEndPoint: !1
      })), x) {
        let J = g[1].hand.joints["index-finger-tip"].position.clone(), Z = g[0].hand.joints["index-finger-tip"].position.clone();
        J = J.applyMatrix4(d.current.matrixWorld.clone().invert()), Z = Z.applyMatrix4(d.current.matrixWorld.clone().invert());
        let ce = J.clone(), K = Z.clone();
        C.setStartPoint && (ce = C.startPoint), C.setEndPoint && (K = C.endPoint), P({
          startPoint: ce,
          midPoint: new oe().addVectors(ce, K).multiplyScalar(0.5),
          endPoint: K,
          setStartPoint: C.setStartPoint,
          setEndPoint: C.setEndPoint
        }), g[0].hand.inputState.pinching === !0 && P({
          startPoint: C.startPoint,
          midPoint: C.midPoint,
          endPoint: C.endPoint,
          setStartPoint: C.setStartPoint,
          setEndPoint: !0
        }), g[1].hand.inputState.pinching === !0 && P({
          startPoint: C.startPoint,
          midPoint: C.midPoint,
          endPoint: C.endPoint,
          setStartPoint: !0,
          setEndPoint: C.setEndPoint
        }), C.setStartPoint && C.setEndPoint && (M.push(C), b(M), T(!1), E(!1), U(8));
      } else
        L <= 0 && l?.current && p && (l.current.children[0].children.forEach((J, Z) => {
          const ce = l.current.children[0].children[Z], K = new Mt().setFromObject(ce), V = k.intersectsBox(K), G = O.intersectsBox(K);
          (V || G) && (N = !0, u(ce.name), S(!0), g[1] !== void 0 && V && g[1].hand.inputState.pinching === !0 && (U(10), N = !1, g[1].hand.inputState.pinching = !1), g[0] !== void 0 && G && g[0].hand.inputState.pinching === !0 && (U(10), N = !1, g[0].hand.inputState.pinching = !1));
        }), !N && _ && (u(null), S(!1)));
    }
  }, [x, _, C, M, A, L, p]), ye.jsx("group", { children: Tt().isPresenting ? ye.jsxs(Iv, { children: [ye.jsxs("group", { ref: d, children: [e?.visible ? ye.jsxs("group", { children: [ye.jsx("hemisphereLight", { skyColor: 8421504, groundColor: 6316128 }), ye.jsx("directionalLight", { color: 16777215, position: [0, -800, 0] }), ye.jsx("primitive", { ref: l, object: e, position: [-0.18, 1.13, -1], scale: [
    2e-3 * a[0],
    2e-3 * a[1],
    2e-3 * a[2]
  ] })] }) : null, r.uniforms && r.shader ? ye.jsx("group", { children: ye.jsxs("mesh", { name: "cube", position: [-0.18, 1.13, -1], rotation: [0, 0, 0], scale: [
    2e-3 * r.meshScale[0],
    2e-3 * r.meshScale[1],
    2e-3 * r.meshScale[2]
  ], ref: n, children: [ye.jsx("boxGeometry", { args: r.geometrySize }), ye.jsx("shaderMaterial", { customProgramCacheKey: () => "1", side: go, uniforms: r.uniforms, needsUpdate: !0, transparent: !0, vertexShader: r.shader.vertexShader, fragmentShader: r.shader.fragmentShader })] }) }) : null] }), ye.jsx("group", { name: "currentLine", ref: f, children: A ? ye.jsx(_u, { currentLine: C, scale: 1 / 2e-3 * 0.4 }) : null }), ye.jsx("group", { name: "lines", children: M.map((R) => ye.jsx(_u, { currentLine: R, scale: 1 / 2e-3 * 0.4 })) })] }) : ye.jsxs("group", { children: [ye.jsxs("group", { children: [e?.visible ? ye.jsxs("group", { children: [ye.jsx("hemisphereLight", { skyColor: 8421504, groundColor: 6316128 }), ye.jsx("directionalLight", { color: 16777215, position: [0, -800, 0] }), ye.jsx("directionalLight", { color: 16777215, position: [0, 800, 0] }), ye.jsx(fy, { firstHitOnly: !0, children: ye.jsx("primitive", { ref: l, object: e, position: [0, 0, 0], onClick: (R) => {
    R.object.parent.userData.name === "finalPass" && o(R.object.name, R.object.userData.layerScope, R.object.userData.channelScope);
  }, onPointerOver: (R) => {
    u(R.object.name);
  }, onPointerOut: (R) => u(null) }) })] }) : null, r.uniforms && r.shader ? ye.jsx("group", { children: ye.jsxs("mesh", { scale: r.meshScale, ref: n, children: [ye.jsx("boxGeometry", { args: r.geometrySize }), ye.jsx("shaderMaterial", { customProgramCacheKey: () => "1", side: go, uniforms: r.uniforms, needsUpdate: !0, transparent: !0, vertexShader: r.shader.vertexShader, fragmentShader: r.shader.fragmentShader })] }) }) : null] }), ye.jsx("group", { name: "lines", children: M.map((R) => ye.jsx(_u, { currentLine: R, scale: 1 })) })] }) });
}
function my() {
  const { controllers: c } = Tt();
  return Ci(() => {
    c?.[0] && c?.[1] && (c[0]?.hand?.children?.[25]?.children?.[0]?.children?.[0] && (c[0].hand.children[25].children[0].children[0].material.transparent = !0, c[0].hand.children[25].children[0].children[0].material.opacity = 0.5), c[1]?.hand?.children?.[25]?.children?.[0]?.children?.[0] && (c[1].hand.children[25].children[0].children[0].material.transparent = !0, c[1].hand.children[25].children[0].children[0].material.opacity = 0.5));
  }), null;
}
class vy {
  /**
   * @param {number} xLength Width of the volume
   * @param {number} yLength Length of the volume
   * @param {number} zLength Depth of the volume
   * @param {string} type The type of data (uint8, uint16, ...)
   * @param {ArrayBuffer} arrayBuffer The buffer with volume data
   */
  constructor(e, s, a, r, n) {
    if (this.spacing = [1, 1, 1], this.offset = [0, 0, 0], this.matrix = new ph(), this.matrix.identity(), this.sliceList = [], this.lowerThresholdValue = -1 / 0, this.upperThresholdValue = 1 / 0, arguments.length > 0) {
      switch (this.xLength = Number(e) || 1, this.yLength = Number(s) || 1, this.zLength = Number(a) || 1, r) {
        case "Uint8":
        case "uint8":
        case "uchar":
        case "unsigned char":
        case "uint8_t":
          this.data = new Uint8Array(n);
          break;
        case "Int8":
        case "int8":
        case "signed char":
        case "int8_t":
          this.data = new Int8Array(n);
          break;
        case "Int16":
        case "int16":
        case "short":
        case "short int":
        case "signed short":
        case "signed short int":
        case "int16_t":
          this.data = new Int16Array(n);
          break;
        case "Uint16":
        case "uint16":
        case "ushort":
        case "unsigned short":
        case "unsigned short int":
        case "uint16_t":
          this.data = new Uint16Array(n);
          break;
        case "Int32":
        case "int32":
        case "int":
        case "signed int":
        case "int32_t":
          this.data = new Int32Array(n);
          break;
        case "Uint32":
        case "uint32":
        case "uint":
        case "unsigned int":
        case "uint32_t":
          this.data = new Uint32Array(n);
          break;
        case "longlong":
        case "long long":
        case "long long int":
        case "signed long long":
        case "signed long long int":
        case "int64":
        case "int64_t":
        case "ulonglong":
        case "unsigned long long":
        case "unsigned long long int":
        case "uint64":
        case "uint64_t":
          throw new Error("uint64_t type is not supported in JavaScript");
        case "Float32":
        case "float32":
        case "float":
          this.data = new Float32Array(n);
          break;
        case "Float64":
        case "float64":
        case "double":
          this.data = new Float64Array(n);
          break;
        default:
          this.data = new Uint8Array(n);
      }
      if (this.data.length !== this.xLength * this.yLength * this.zLength)
        throw new Error("lengths are not matching arrayBuffer size");
    }
  }
  get lowerThreshold() {
    return this.lowerThresholdValue;
  }
  set lowerThreshold(e) {
    this.lowerThresholdValue = e, this.sliceList.forEach((s) => {
      s.geometryNeedsUpdate = !0;
    });
  }
  get upperThreshold() {
    return this.upperThresholdValue;
  }
  set upperThreshold(e) {
    this.upperThresholdValue = e, this.sliceList.forEach((s) => {
      s.geometryNeedsUpdate = !0;
    });
  }
  /**
   * Shortcut for data[access(i,j,k)]
   * @param {number} i    First coordinate
   * @param {number} j    Second coordinate
   * @param {number} k    Third coordinate
   * @returns {number}  value in the data array
   */
  getData(e, s, a) {
    return this.data[a * this.xLength * this.yLength + s * this.xLength + e];
  }
  /**
   * Compute the index in the data
   * array corresponding to the given coordinates in IJK system
   * @param {number} i    First coordinate
   * @param {number} j    Second coordinate
   * @param {number} k    Third coordinate
   * @returns {number}  index
   */
  access(e, s, a) {
    return a * this.xLength * this.yLength + s * this.xLength + e;
  }
  /**
   * Retrieve the IJK coordinates of the voxel
   * corresponding of the given index in the data
   * @param {number} index index of the voxel
   * @returns {Array}  [x,y,z]
   */
  reverseAccess(e) {
    const s = Math.floor(e / (this.yLength * this.xLength)), a = Math.floor((e - s * this.yLength * this.xLength) / this.xLength);
    return [e - s * this.yLength * this.xLength - a * this.xLength, a, s];
  }
  /**
   * Apply a function to all the voxels, be careful,
   * the value will be replaced
   * @param {Function} functionToMap A function to apply to every voxel,
   * will be called with the following parameters:
   * - value of the voxel
   * - index of the voxel
   * - the data (TypedArray)
   * @param {Object} context  You can specify a context in which call the function,
   * default if this Volume
   * @returns {Volume} this
   */
  map(e, s) {
    const { length: a } = this.data, r = s || this;
    for (let n = 0; n < a; n++)
      this.data[n] = e.call(r, this.data[n], n, this.data);
    return this;
  }
  /**
   * Compute the orientation
   * of the slice and returns all the information relative to the
   * geometry such as sliceAccess,
   * the plane matrix (orientation and position in RAS coordinate)
   * and the dimensions of the plane in both coordinate system.
   * @param {string} axis  the normal axis to the slice 'x' 'y' or 'z'
   * @param {number} index the index of the slice
   * @returns {Object} an object containing all the usefull information
   * on the geometry of the slice
   */
  extractPerpendicularPlane(e, s) {
    const a = new Ft().identity(), r = this;
    let n, o, u, l;
    const f = new oe(), d = new oe(), p = new oe(), v = new oe(this.xLength, this.yLength, this.zLength);
    switch (e) {
      case "x":
        f.set(1, 0, 0), d.set(0, 0, -1), p.set(0, -1, 0), n = this.spacing[2], o = this.spacing[1], l = new oe(s, 0, 0), a.multiply(new Ft().makeRotationY(Math.PI / 2)), u = (r.RASDimensions[0] - 1) / 2, a.setPosition(new oe(s - u, 0, 0));
        break;
      case "y":
        f.set(0, 1, 0), d.set(1, 0, 0), p.set(0, 0, 1), n = this.spacing[0], o = this.spacing[2], l = new oe(0, s, 0), a.multiply(new Ft().makeRotationX(-Math.PI / 2)), u = (r.RASDimensions[1] - 1) / 2, a.setPosition(new oe(0, s - u, 0));
        break;
      case "z":
      default:
        f.set(0, 0, 1), d.set(1, 0, 0), p.set(0, -1, 0), n = this.spacing[0], o = this.spacing[1], l = new oe(0, 0, s), u = (r.RASDimensions[2] - 1) / 2, a.setPosition(new oe(0, 0, s - u));
        break;
    }
    d.applyMatrix4(r.inverseMatrix).normalize(), d.argVar = "i", p.applyMatrix4(r.inverseMatrix).normalize(), p.argVar = "j", f.applyMatrix4(r.inverseMatrix).normalize();
    const g = Math.floor(Math.abs(d.dot(v))), x = Math.floor(Math.abs(p.dot(v))), E = Math.abs(g * n), _ = Math.abs(x * o);
    l = Math.abs(Math.round(l.applyMatrix4(r.inverseMatrix).dot(f)));
    const S = [new oe(1, 0, 0), new oe(0, 1, 0), new oe(0, 0, 1)], A = [d, p, f].find((M) => Math.abs(M.dot(S[0])) > 0.9), T = [d, p, f].find((M) => Math.abs(M.dot(S[1])) > 0.9), C = [d, p, f].find((M) => Math.abs(M.dot(S[2])) > 0.9);
    function P(M, b) {
      const L = A === f ? l : A.arglet === "i" ? M : b, U = T === f ? l : T.arglet === "i" ? M : b, R = C === f ? l : C.arglet === "i" ? M : b, I = A.dot(S[0]) > 0 ? L : r.xLength - 1 - L, k = T.dot(S[1]) > 0 ? U : r.yLength - 1 - U, O = C.dot(S[2]) > 0 ? R : r.zLength - 1 - R;
      return r.access(I, k, O);
    }
    return {
      iLength: g,
      jLength: x,
      sliceAccess: P,
      matrix: a,
      planeWidth: E,
      planeHeight: _
    };
  }
  /**
   * Compute the minimum
   * and the maximum of the data in the volume
   * @returns {Array} [min,max]
   */
  computeMinMax() {
    let e = 1 / 0, s = -1 / 0;
    const a = this.data.length;
    let r = 0;
    for (r = 0; r < a; r++)
      if (!Number.isNaN(this.data[r])) {
        const n = this.data[r];
        e = Math.min(e, n), s = Math.max(s, n);
      }
    return this.min = e, this.max = s, [e, s];
  }
}
const gy = {
  uniforms: {
    u_size: { value: new oe(1, 1, 1) },
    u_renderstyle: { value: 0 },
    u_renderthreshold: { value: 0.5 },
    u_opacity: { value: 0.5 },
    u_clim: { value: new Qe(0.2, 0.8) },
    u_clim2: { value: new Qe(0.2, 0.8) },
    u_clim3: { value: new Qe(0.2, 0.8) },
    u_clim4: { value: new Qe(0.2, 0.8) },
    u_clim5: { value: new Qe(0.2, 0.8) },
    u_clim6: { value: new Qe(0.2, 0.8) },
    u_xClip: { value: new Qe(-1, 1e6) },
    u_yClip: { value: new Qe(-1, 1e6) },
    u_zClip: { value: new Qe(-1, 1e6) },
    u_data: { value: null },
    u_stop_geom: { value: null },
    u_geo_color: { value: null },
    u_window_size: { value: new Qe(1, 1) },
    u_vol_scale: { value: new Qe(1, 1, 1) },
    u_physical_Pixel: { value: 0.5 },
    volumeTex: { value: null },
    volumeTex2: { value: null },
    volumeTex3: { value: null },
    volumeTex4: { value: null },
    volumeTex5: { value: null },
    volumeTex6: { value: null },
    u_color: { value: new oe(0, 0, 0) },
    u_color2: { value: new oe(0, 0, 0) },
    u_color3: { value: new oe(0, 0, 0) },
    u_color4: { value: new oe(0, 0, 0) },
    u_color5: { value: new oe(0, 0, 0) },
    u_color6: { value: new oe(0, 0, 0) },
    u_cmdata: { value: null },
    near: { value: 0.1 },
    far: { value: 1e4 },
    alphaScale: { value: 0 },
    dtScale: { value: 1 },
    volumeCount: { value: 0 },
    finalGamma: { value: 0 },
    boxSize: { value: new oe(1, 1, 1) }
  },
  vertexShader: [
    "out vec3 rayDirUnnorm;",
    "out vec3 cameraCorrected;",
    "uniform vec3 u_vol_scale;",
    "uniform vec3 u_size;",
    "varying vec3 worldSpaceCoords;",
    "varying vec2 vUv;",
    "varying vec4 glPosition;",
    "uniform highp vec3 boxSize;",
    "void main()",
    "{",
    "   worldSpaceCoords = position / boxSize + vec3(0.5, 0.5, 0.5); //move it from [-0.5;0.5] to [0,1]",
    "   cameraCorrected = (inverse(modelMatrix) * vec4(cameraPosition, 1.)).xyz;",
    "   rayDirUnnorm = position - cameraCorrected;",
    "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "   glPosition = gl_Position;",
    "   vUv = uv;",
    "}"
  ].join(`
`),
  fragmentShader: [
    "#include <packing>",
    "precision highp float;",
    " precision mediump sampler3D;",
    "in vec3 rayDirUnnorm;",
    "in vec3 cameraCorrected;",
    "uniform sampler3D volumeTex;",
    "uniform sampler3D volumeTex2;",
    "uniform sampler3D volumeTex3;",
    "uniform sampler3D volumeTex4;",
    "uniform sampler3D volumeTex5;",
    "uniform sampler3D volumeTex6;",
    "uniform vec2 u_clim;",
    "uniform vec2 u_clim2;",
    "uniform vec2 u_clim3;",
    "uniform vec2 u_clim4;",
    "uniform vec2 u_clim5;",
    "uniform vec2 u_clim6;",
    "uniform vec2 u_window_size;",
    "uniform vec2 u_xClip;",
    "uniform vec2 u_yClip;",
    "uniform vec2 u_zClip;",
    "uniform sampler2D u_cmdata;",
    "uniform sampler2D u_stop_geom;",
    "uniform sampler2D u_geo_color;",
    "uniform vec3 u_color;",
    "uniform vec3 u_color2;",
    "uniform vec3 u_color3;",
    "uniform vec3 u_color4;",
    "uniform vec3 u_color5;",
    "uniform vec3 u_color6;",
    "uniform float alphaScale;",
    "uniform float dtScale;",
    "uniform float finalGamma;",
    "uniform float volumeCount;",
    "uniform highp vec3 boxSize;",
    "uniform vec3 u_size;",
    "uniform int u_renderstyle;",
    "uniform float u_opacity;",
    "uniform vec3 u_vol_scale;",
    "uniform float near;",
    "uniform float u_physical_Pixel;",
    "varying vec2 vUv;",
    "varying vec4 glPosition;",
    "uniform float far;",
    "varying vec3 worldSpaceCoords;",
    "float linearize_z(float z) {",
    "        return near * far / (far + z * (near - far));",
    "}",
    "vec2 intersect_hit(vec3 orig, vec3 dir) {",
    "  vec3 boxMin = vec3(-0.5) * boxSize;",
    "  vec3 boxMax = vec3( 0.5) * boxSize;",
    "  if(u_xClip.x > -1.0){   boxMin.x = u_xClip.x-(boxSize.x/2.0);",
    "   if(u_xClip.y < boxSize.x)",
    "       boxMax.x = u_xClip.y-(boxSize.x/2.0);",
    "  }",
    "  if(u_yClip.x > -1.0){   boxMin.y = u_yClip.x-(boxSize.y/2.0);",
    "   if(u_yClip.y < boxSize.y)",
    "      boxMax.y = u_yClip.y-(boxSize.y/2.0);",
    "  }",
    "  if(u_zClip.x > -1.0){   boxMin.z = u_zClip.x-(boxSize.z/2.0);",
    "   if(u_zClip.y < boxSize.z)       boxMax.z = u_zClip.y-(boxSize.z/2.0);",
    "  }",
    "  vec3 invDir = 1.0 / dir;",
    "  vec3 tmin0 = (boxMin - orig) * invDir;",
    "  vec3 tmax0 = (boxMax - orig) * invDir;",
    "  vec3 tmin = min(tmin0, tmax0);",
    "  vec3 tmax = max(tmin0, tmax0);",
    "  float t0 = max(tmin.x, max(tmin.y, tmin.z));",
    "  float t1 = min(tmax.x, min(tmax.y, tmax.z));",
    "  return vec2(t0, t1);",
    "}",
    "   // Pseudo-random number gen from",
    "   // http://www.reedbeta.com/blog/quick-and-easy-gpu-random-numbers-in-d3d11/",
    "   // with some tweaks for the range of values",
    "       float wang_hash(int seed) {",
    "     seed = (seed ^ 61) ^ (seed >> 16);",
    "     seed *= 9;",
    "     seed = seed ^ (seed >> 4);",
    "     seed *= 0x27d4eb2d;",
    "     seed = seed ^ (seed >> 15);",
    "     return float(seed % 2147483647) / float(2147483647);",
    "     }",
    "float linear_to_srgb(float x) {",
    "   if (x <= 0.0031308f) {",
    "     return 12.92f * x;",
    "   }",
    "   return 1.055f * pow(x, 1.f / 2.4f) - 0.055f;",
    "}",
    "void main(void) {",
    // For finding the settings for the MESH
    // "  gl_FragColor = vec4(worldSpaceCoords.x,worldSpaceCoords.y,worldSpaceCoords.z,0.5);",
    // "  return;",
    //
    "  //STEP 1: Normalize the view Ray",
    "  vec3 rayDir = normalize(rayDirUnnorm);",
    "  //STEP 2: Intersect the ray with the volume bounds to find the interval along the ray overlapped by the volume",
    "  vec2 t_hit = intersect_hit(cameraCorrected, rayDir);",
    "  if (t_hit.x >= t_hit.y) {",
    "    discard;",
    "  }",
    "  //No sample behind the eye",
    "  t_hit.x = max(t_hit.x, 0.0);",
    "  //STEP 3: Compute the step size to march through the volume grid",
    "  ivec3 volumeTexSize = textureSize(volumeTex, 0);",
    "  vec3 dt_vec = 1.0 / (vec3(volumeTexSize) * abs(rayDir));",
    "  float dt = min(dt_vec.x, min(dt_vec.y, dt_vec.z));",
    "  dt = max(1.0, dt);",
    "  // Ray starting point, in the real space where the box may not be a cube.",
    "  // Prevents a lost WebGL context.",
    // "   if (dt < 0.0000001) {",
    // "     gl_FragColor = vec4(1.0);",
    // "     return;",
    // "   }",
    " float offset = wang_hash(int(gl_FragCoord.x + 640.0 * gl_FragCoord.y));",
    " vec3 p = cameraCorrected + (t_hit.x + offset + dt) * rayDir;",
    "  // Most browsers do not need this initialization, but add it to be safe.",
    "  gl_FragColor = vec4(0.0);",
    "  p = p / boxSize + vec3(0.5);",
    "  vec3 step = (rayDir * dt) / boxSize;",
    "  // ",
    "  // Initialization of some variables.",
    "  float max_val = 0.0;",
    "  float max_val2 = 0.0;",
    "  float max_val3 = 0.0;",
    "  float max_val4 = 0.0;",
    "  float max_val5 = 0.0;",
    "  float max_val6 = 0.0;",
    "  vec3 rgbCombo = vec3(0.0);",
    "  float total = 0.0;",
    "  int max_i = 30000;",
    "  int i = 0;",
    "  float x = gl_FragCoord.x/u_window_size.x;",
    "  float y = gl_FragCoord.y/u_window_size.y;",
    "  vec3 meshPos = texture2D(u_stop_geom, vec2(x,y)).xyz;",
    // "  vec3 meshPos = texture2D(u_stop_geom, vec2(gl_FragCoord.x,gl_FragCoord.y)).xyz;",
    //  "  gl_FragColor = vec4(meshPos,1.0);",
    //  "  return;",
    "  float dist = 1000.0;",
    "  for (float t = t_hit.x; t < t_hit.y; t += dt) {",
    "       if(meshPos != vec3(0.0))           dist = distance(p,meshPos);",
    "      float val = texture(volumeTex, p.xyz).r;",
    "      val = max(0.0, (val - u_clim[0]) / (u_clim[1] - u_clim[0]));",
    "      rgbCombo += max(0.0, min(1.0, val)) * u_color;",
    "      total += val;",
    "      if(volumeCount > 1.0){           float val2 = texture(volumeTex2, p.xyz).r;",
    "           val2 = max(0.0,(val2 - u_clim2[0]) / (u_clim2[1] - u_clim2[0]));",
    "           rgbCombo += max(0.0, min(1.0, val2)) * u_color2;",
    "           total += val2;",
    "       }",
    "       if(volumeCount > 2.0){           float val3 = texture(volumeTex3, p.xyz).r;",
    "           val3 = max(0.0,(val3 - u_clim3[0]) / (u_clim3[1] - u_clim3[0]));",
    "           rgbCombo += max(0.0, min(1.0, val3)) * u_color3;",
    "           total += val3;",
    "       }",
    "       if(volumeCount > 3.0){           float val4 = texture(volumeTex4, p.xyz).r;",
    "           val4 = max(0.0,(val4 - u_clim4[0]) / (u_clim4[1] - u_clim4[0]));",
    "           rgbCombo += max(0.0, min(1.0, val4)) * u_color4;",
    "           total += val4;",
    "       }",
    "       if(volumeCount > 4.0){           float val5 = texture(volumeTex5, p.xyz).r;",
    "           val5 = max(0.0,(val5 - u_clim5[0]) / (u_clim5[1] - u_clim5[0]));",
    "           rgbCombo += max(0.0, min(1.0, val5)) * u_color5;",
    "           total += val5;",
    "        }",
    "        if(volumeCount > 5.0){           float val6 = texture(volumeTex6, p.xyz).r;",
    "           val6 = max(0.0,(val6 - u_clim6[0]) / (u_clim6[1] - u_clim6[0]));",
    "           rgbCombo += max(0.0, min(1.0, val6)) * u_color6;",
    "           total += val6;",
    "       }",
    // STOP the traversal if there has been data and the distance to the object is too small
    "       if(total > 0.0 && dist < 0.1){",
    "           break;",
    "       }else if(dist < 0.1){           gl_FragColor = vec4(0.0,0.0,0.0,0.0);",
    "           break;",
    "       }",
    "       if(u_renderstyle == 0 && (max_val > u_clim[1] && max_val2 >= u_clim2[1] && max_val3 >= u_clim3[1] && max_val4 >= u_clim4[1] && max_val5 >= u_clim5[1] &&  max_val6 >= u_clim6[1])) break;",
    "       if(u_renderstyle == 2){           total = min(total, 1.0);",
    "           vec4 val_color = vec4(rgbCombo, total);",
    "           val_color.a = 1.0 - pow(1.0 - val_color.a, 1.0);",
    "           gl_FragColor.rgb += (1.0 - gl_FragColor.a) * val_color.a * val_color.rgb;",
    "           gl_FragColor.a += (1.0 - gl_FragColor.a) * val_color.a * dtScale;",
    "           if (gl_FragColor.a >= 0.95) {",
    "               break;",
    "           }",
    "       }",
    // "       }",
    "       p += step;",
    "  }",
    "   gl_FragDepth = distance(worldSpaceCoords,p)*u_physical_Pixel;",
    // "   gl_FragColor = vec4(gl_FragDepth,gl_FragDepth,gl_FragDepth,1.0);",
    // "   return;",
    "   if(u_renderstyle == 0 && (max_val <  u_clim[0] && max_val2 < u_clim2[0] && max_val3 < u_clim3[0] &&   max_val4 <  u_clim4[0] && max_val5 <  u_clim5[0] && max_val6 <  u_clim6[0])){",
    "        gl_FragColor = vec4(0,0,0,0);",
    "   }else if(u_renderstyle == 0){",
    "       max_val = (max_val - u_clim[0]) / (u_clim[1] - u_clim[0]);",
    "       max_val2 = (max_val2 - u_clim2[0]) / (u_clim2[1] - u_clim2[0]);",
    "       max_val3 = (max_val3 - u_clim3[0]) / (u_clim3[1] - u_clim3[0]);",
    "       max_val4 = (max_val4 - u_clim4[0]) / (u_clim4[1] - u_clim4[0]);",
    "       max_val5 = (max_val5 - u_clim5[0]) / (u_clim5[1] - u_clim5[0]);",
    "       max_val6 = (max_val6 - u_clim6[0]) / (u_clim6[1] - u_clim6[0]);",
    "       vec3 color = u_color * max_val;",
    "       if(volumeCount > 1.0) color = color +  u_color2 * max_val2;",
    "       if(volumeCount > 3.0) color = color +  u_color4 * max_val4;",
    "       if(volumeCount > 2.0) color = color +  u_color3 * max_val3;",
    "       if(volumeCount > 4.0) color = color +  u_color5 * max_val5;",
    "       if(volumeCount > 5.0) color = color +  u_color6 * max_val6;",
    "       vec3 colorCorrected = vec3(min(color[0], 1.0), min(color[1],1.0), min(color[2],1.0));",
    "        gl_FragColor = vec4(color,1.0);",
    "    }",
    "    gl_FragColor.r = linear_to_srgb(gl_FragColor.r);",
    "    gl_FragColor.g = linear_to_srgb(gl_FragColor.g);",
    "    gl_FragColor.b = linear_to_srgb(gl_FragColor.b);",
    "}"
  ].join(`
`)
}, yy = {
  maximumIntensityProjection: 0,
  minimumIntensityProjection: 1,
  additive: 2
};
function xy(c, e, s, a, r, n) {
  const { spatialRenderingMode: o } = n, u = r?.image?.instance?.getData();
  if (!u)
    return {
      channelsVisible: null,
      resolution: null,
      data: null,
      colors: null,
      contrastLimits: null,
      allChannels: null,
      channelTargetC: null
    };
  const l = r.image.instance, f = o === "3D", d = e[Nn.PHOTOMETRIC_INTERPRETATION] === "RGB", p = e[Nn.VOLUMETRIC_RENDERING_ALGORITHM], v = yy[p], g = e[Nn.SPATIAL_LAYER_VISIBLE], x = e[Nn.SPATIAL_LAYER_OPACITY];
  l.isInterleaved();
  const E = d ? [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255]
  ] : s.map((R) => a[R][Nn.SPATIAL_CHANNEL_COLOR]), _ = d ? [
    [0, 255],
    [0, 255],
    [0, 255]
  ] : s.map((R) => a[R][Nn.SPATIAL_CHANNEL_WINDOW] || [0, 255]), S = d ? [
    // Layer visible AND channel visible
    g && !0,
    g && !0,
    g && !0
  ] : s.map((R) => (
    // Layer visible AND channel visible
    g && a[R][Nn.SPATIAL_CHANNEL_VISIBLE]
  )), A = d ? [
    // Layer visible AND channel visible
    g && !0,
    g && !0,
    g && !0
  ] : s.map((R) => (
    // Layer visible AND channel visible
    g && a[R][Nn.SPATIAL_TARGET_C]
  )), T = l.getAutoTargetResolution(), C = e[Nn.SPATIAL_TARGET_RESOLUTION], P = C === null || Number.isNaN(C) ? T : C, M = r.image.loaders[0].channels;
  let b = e[Nn.SPATIAL_SLICE_X], L = e[Nn.SPATIAL_SLICE_Y], U = e[Nn.SPATIAL_SLICE_Z];
  return b = b !== null ? b : new Qe(-1, 1e5), L = L !== null ? L : new Qe(-1, 1e5), U = U !== null ? U : new Qe(-1, 1e5), {
    channelsVisible: S,
    allChannels: M,
    channelTargetC: A,
    resolution: P,
    data: u,
    colors: E,
    contrastLimits: _,
    is3dMode: f,
    renderingMode: v,
    layerTransparency: x,
    xSlice: b,
    ySlice: L,
    zSlice: U
  };
}
function Sy(c, e, s, a, r) {
  const { images: n = {}, imageLayerScopes: o, imageLayerCoordination: u, imageChannelScopesByLayer: l, imageChannelCoordination: f } = c, d = o[0], p = l[d], v = u[0][d], g = f[0][d], { channelsVisible: x, allChannels: E, channelTargetC: _, resolution: S, data: A, colors: T, contrastLimits: C, is3dMode: P, renderingMode: M, layerTransparency: b, xSlice: L, ySlice: U, zSlice: R } = xy(d, v, p, g, n[d], c);
  return _ !== null && (e.channelTargetC.length !== 0 && (e.channelTargetC.toString() !== _.toString() || e.resolution.toString() !== S.toString()) ? a || r(!0) : (e.channelsVisible.toString() !== x.toString() || e.colors.toString() !== T.toString() || e.is3dMode !== P || e.contrastLimits.toString() !== C.toString() || e.renderingMode.toString() !== M.toString() || e.layerTransparency.toString() !== b.toString() || e.xSlice.toString() !== L.toString() || e.ySlice.toString() !== U.toString() || e.zSlice.toString() !== R.toString()) && (s({
    channelsVisible: x,
    allChannels: E,
    channelTargetC: _,
    resolution: S,
    data: A,
    colors: T,
    contrastLimits: C,
    is3dMode: P,
    renderingMode: M,
    layerTransparency: b,
    xSlice: L,
    ySlice: U,
    zSlice: R
  }), r(!1))), {
    images: n,
    layerScope: d,
    imageLayerScopes: o,
    imageLayerCoordination: u,
    imageChannelScopesByLayer: l,
    imageChannelCoordination: f,
    channelsVisible: x,
    allChannels: E,
    channelTargetC: _,
    resolution: S,
    data: A,
    colors: T,
    contrastLimits: C,
    is3dMode: P,
    renderingMode: M,
    layerTransparency: b,
    xSlice: L,
    ySlice: U,
    zSlice: R
  };
}
function Oa(c, e) {
  const [s, a] = e;
  return (c - s) / Math.sqrt(a ** 2 - s ** 2);
}
function wy(c, e, s, a, r, n, o, u, l, f, d, p, v) {
  c.boxSize.value.set(s.xLength, s.yLength, s.zLength), c.volumeTex.value = e.length > 0 ? e[0] : null, c.volumeTex2.value = e.length > 1 ? e[1] : null, c.volumeTex3.value = e.length > 2 ? e[2] : null, c.volumeTex4.value = e.length > 3 ? e[3] : null, c.volumeTex5.value = e.length > 4 ? e[4] : null, c.volumeTex6.value = e.length > 5 ? e[5] : null, c.near.value = 0.1, c.far.value = 3e3, c.alphaScale.value = 1, c.dtScale.value = u, c.finalGamma.value = 4.5, c.volumeCount.value = e.length, c.u_size.value.set(s.xLength, s.yLength, s.zLength), c.u_stop_geom.value = null, c.u_window_size.value.set(0, 0), c.u_vol_scale.value.set(1 / s.xLength, 1 / s.yLength, 1 / s.zLength * 2), c.u_renderstyle.value = r, c.u_clim.value.set(n.length > 0 ? n[0][0] : null, n.length > 0 ? n[0][1] : null), c.u_clim2.value.set(n.length > 1 ? n[1][0] : null, n.length > 1 ? n[1][1] : null), c.u_clim3.value.set(n.length > 2 ? n[2][0] : null, n.length > 2 ? n[2][1] : null), c.u_clim4.value.set(n.length > 3 ? n[3][0] : null, n.length > 3 ? n[3][1] : null), c.u_clim5.value.set(n.length > 4 ? n[4][0] : null, n.length > 4 ? n[4][1] : null), c.u_clim6.value.set(n.length > 5 ? n[5][0] : null, n.length > 5 ? n[5][1] : null), c.u_xClip.value.set(l[0] * (1 / p[0]) / v[0] * s.xLength, l[1] * (1 / p[0]) / v[0] * s.xLength), c.u_yClip.value.set(f[0] * (1 / p[1]) / v[1] * s.yLength, f[1] * (1 / p[1]) / v[1] * s.yLength), c.u_zClip.value.set(d[0] * (1 / p[2]) / v[2] * s.zLength, d[1] * (1 / p[1]) / v[2] * s.zLength), c.u_color.value.set(o.length > 0 ? o[0][0] : null, o.length > 0 ? o[0][1] : null, o.length > 0 ? o[0][2] : null), c.u_color2.value.set(o.length > 1 ? o[1][0] : null, o.length > 1 ? o[1][1] : null, o.length > 1 ? o[1][2] : null), c.u_color3.value.set(o.length > 2 ? o[2][0] : null, o.length > 2 ? o[2][1] : null, o.length > 2 ? o[2][2] : null), c.u_color4.value.set(o.length > 3 ? o[3][0] : null, o.length > 3 ? o[3][1] : null, o.length > 3 ? o[3][2] : null), c.u_color5.value.set(o.length > 4 ? o[4][0] : null, o.length > 4 ? o[4][1] : null, o.length > 4 ? o[4][2] : null), c.u_color6.value.set(o.length > 5 ? o[5][0] : null, o.length > 5 ? o[5][1] : null, o.length > 5 ? o[5][2] : null);
}
function nh(c, e, s, a, r, n, o, u, l, f, d, p, v, g) {
  const x = [], E = [], _ = [];
  let S = null;
  if (e.forEach((P, M) => {
    s[M] && (S = c.get(P), x.push(r.get(P)), E.push([a[M][0] / 255, a[M][1] / 255, a[M][2] / 255]), n[M][0] === 0 && n[M][1] === 255 ? _.push([
      Oa(o.get(P)[0], o.get(P)),
      Oa(o.get(P)[1], o.get(P))
    ]) : _.push([
      Oa(n[M][0], o.get(P)),
      Oa(n[M][1], o.get(P))
    ]));
  }), S === null)
    return null;
  const A = {
    clim1: 0.01,
    clim2: 0.7,
    isothreshold: 0.15,
    opacity: 1,
    colormap: "gray"
  }, T = gy, C = Ha.clone(T.uniforms);
  return wy(C, x, S, A, l, _, E, f, d, p, v, [u[0].size, u[1].size, u[2] ? u[2].size : 1], g), [
    C,
    T,
    [1, u[1].size / u[0].size, u[2] ? u[2].size / u[0].size : 1],
    [S.xLength, S.yLength, S.zLength],
    [1, S.yLength / S.xLength, S.zLength / S.xLength]
  ];
}
const _y = {
  Uint8: Uint8Array,
  Uint16: Uint16Array,
  Uint32: Uint32Array,
  Int8: Int8Array,
  Int16: Int16Array,
  Int32: Int32Array,
  Float32: Float32Array,
  Float64: Float64Array
};
async function Ty({ source: c, selection: e, onUpdate: s = () => {
}, downsampleDepth: a = 1, signal: r }) {
  const { shape: n, labels: o, dtype: u } = c, { height: l, width: f } = Nm(c), d = n[o.indexOf("z")], p = Math.max(1, Math.floor(d / a)), v = l * f, g = _y[u], x = new g(v * p);
  return await Promise.all(new Array(p).fill(0).map(async (E, _) => {
    const S = {
      ...e,
      z: _ * a
    }, { data: A } = await c.getRaster({
      selection: S,
      signal: r
    });
    let T = 0;
    for (s({ z: _, total: p, progress: 0.5 }); T < v; ) {
      const C = _ * v + (v - T - 1), P = (f - T - 1) % f + f * Math.floor(T / f);
      x[C] = A[P], T += 1;
    }
    s({ z: _, total: p, progress: 1 });
  })), {
    data: x,
    height: l,
    width: f,
    depth: p
  };
}
function Ey(c, e, s) {
  return Ty({
    source: s[e],
    selection: { t: 0, c },
    // corresponds to the first channel of the first timepoint
    downsampleDepth: 2 ** e
  });
}
function Ay(c) {
  const e = new vy();
  return e.xLength = c.width, e.yLength = c.height, e.zLength = c.depth, e.data = c.data, e;
}
function Cy(c) {
  const e = new Fm(c.data, c.xLength, c.yLength, c.zLength);
  return e.format = Im, e.type = Om, e.generateMipmaps = !1, e.minFilter = vo, e.magFilter = vo, e.needsUpdate = !0, e;
}
function Py(c) {
  const { x: e, y: s, z: a } = c?.meta?.physicalSizes ?? {};
  return [e, s, a];
}
function My(c) {
  const [e, s] = c.computeMinMax(), a = new Float32Array(c.data.length);
  for (let r = 0; r < c.data.length; r++)
    a[r] = (c.data[r] - e) / Math.sqrt(s ** 2 - e ** 2);
  return a;
}
async function by(c, e, s, a, r, n, o) {
  let u = null, l = null;
  const { shape: f, labels: d } = s[0], p = c.filter((g) => !a.has(g) || e !== o), v = await Promise.all(p.map((g) => Ey(g, e, s)));
  return p.forEach((g, x) => {
    const E = v[x];
    u = Ay(E);
    const _ = u.computeMinMax();
    u.data = My(u), a.set(g, u), r.set(g, Cy(u)), n.set(g, _), l = Py(s[e]);
  }), [
    a,
    r,
    n,
    l,
    [f[d.indexOf("x")], f[d.indexOf("y")], f[d.indexOf("z")]]
  ];
}
function Ly(c) {
  const e = yr(null), s = yr(null), [a, r] = an(!1), [n, o] = an(!1), [u, l] = an(null), [f, d] = an([1, 1, 1]), [p, v] = an({
    uniforms: null,
    shader: null,
    meshScale: null,
    geometrySize: null,
    boxSize: null
  }), [g, x] = an({
    volumes: /* @__PURE__ */ new Map(),
    textures: /* @__PURE__ */ new Map(),
    volumeMinMax: /* @__PURE__ */ new Map(),
    scale: null,
    resolution: null,
    originalScale: null
  }), [E, _] = an({
    channelsVisible: [],
    allChannels: [],
    channelTargetC: [],
    resolution: null,
    data: null,
    colors: [],
    contrastLimits: [],
    is3dMode: !1,
    renderingMode: null,
    layerTransparency: 1
  }), [S, A] = an({
    visible: !0,
    color: [1, 1, 1],
    opacity: 1,
    multiVisible: "",
    multiOpacity: "",
    multiColor: "",
    data: null,
    obsSets: []
  }), { images: T, layerScope: C, channelsVisible: P, allChannels: M, channelTargetC: b, resolution: L, data: U, colors: R, contrastLimits: I, is3dMode: k, renderingMode: O, layerTransparency: N, xSlice: J, ySlice: Z, zSlice: ce } = Sy(c, E, _, n, o), { obsSegmentations: K, onEntitySelected: V, segmentationLayerCoordination: G, segmentationChannelCoordination: F, segmentationChannelScopesByLayer: j } = c;
  let W = () => {
  };
  const $ = [];
  if (F[0][C] !== void 0) {
    const X = F[0][C][C], { setObsHighlight: q } = F[1][C][C];
    W = q;
    const re = F[0][C][C].additionalObsSets;
    re !== null && X.obsSetSelection.forEach((pe) => {
      const ae = pe[1];
      re.tree[0].children.forEach((ie) => {
        ie.name === ae && ie.set.forEach(([fe]) => {
          const ve = { name: "", id: "", color: [255, 255, 255] };
          ve.name = ae, ve.id = fe, X.obsSetColor.forEach((me) => {
            me.path[1] === ae && (ve.color = me.color);
          }), $.push(ve);
        });
      });
    }), X.obsHighlight !== null && $.push({ name: "", id: X.obsHighlight, color: [255, 34, 0] });
  }
  if (K?.[C]?.obsSegmentations && u == null) {
    const { scene: X, sceneOptions: q } = K[C].obsSegmentations;
    if (X?.children) {
      const re = new ih(), pe = new wi();
      pe.userData.name = "finalPass", X.children.forEach((ie) => {
        let fe = ie;
        fe.material === void 0 && (fe = ie.children[0]), (fe.material instanceof nr || fe.material instanceof Qr) && (fe.material = new Qu());
        let ve = fe.name.replace("mesh_", "").replace("mesh", "").replace("glb", "").replace("_dec", "").replace("_Decobj", "").replace("obj", "").replace("_DEc", "").replace(".", "").replace("_Dec", "");
        ve.includes("_") && (ve = ve.split("_")[0]), fe.name = ve, fe.userData.name = ve, fe.userData.layerScope = C, fe.material.transparent = !0, fe.material.writeDepthTexture = !0, fe.material.depthTest = !0, fe.material.depthWrite = !0, fe.material.needsUpdate = !0, fe.material.side = q?.materialSide === "back" ? mh : go;
        const me = fe.clone();
        me.geometry = fe.geometry.clone(), me.geometry.translate(q?.targetX ?? 0, q?.targetY ?? 0, q?.targetZ ?? 0), me.geometry.scale(q?.scaleX ?? 1, q?.scaleY ?? 1, q?.scaleZ ?? 1), me.geometry.rotateX(q?.rotationX ?? 0), me.geometry.rotateY(q?.rotationY ?? 0), me.geometry.rotateZ(q?.rotationZ ?? 0);
        const we = fe.clone();
        we.material = fe.material.clone(), we.geometry = me.geometry.clone(), pe.add(we);
      }), re.add(pe), re.scale.set(q?.sceneScaleX ?? 1, q?.sceneScaleY ?? 1, q?.sceneScaleZ ?? 1);
      const ae = [
        q?.sceneScaleX ?? 1,
        q?.sceneScaleY ?? 1,
        q?.sceneScaleZ ?? 1
      ];
      d(ae), re.rotateX(q?.sceneRotationX ?? 0), re.rotateY(q?.sceneRotationY ?? 0), re.rotateZ(q?.sceneRotationZ ?? 0), l(re);
    }
  }
  if (F[0] !== void 0 && F[0][C] !== void 0) {
    const X = F[0][C][C];
    let q = "";
    $.forEach((pe) => {
      q += `${pe.id};${pe.color.toString()};${pe.name}`;
    });
    let re = "";
    if (S.obsSets.forEach((pe) => {
      re += `${pe.id};${pe.color.toString()};${pe.name}`;
    }), j[C].length > 1) {
      let pe = "", ae = "", ie = "", fe = !1, ve = 0;
      j[C].forEach((me) => {
        const we = F[0][C][me];
        pe += `${we.spatialChannelColor.toString()};`, ae += `${we.spatialChannelOpacity};`, ie += `${we.spatialChannelVisible};`, fe |= we.spatialChannelVisible, ve += we.spatialChannelOpacity;
      }), (pe !== S.multiColor || ae !== S.multiOpacity || ie !== S.multiVisible) && A({
        color: X.spatialChannelColor,
        opacity: ve,
        visible: fe,
        multiColor: pe,
        multiVisible: ie,
        multiOpacity: ae,
        data: K,
        obsSets: $
      });
    } else
      (X.spatialChannelColor.toString() !== S.color.toString() || X.spatialChannelVisible !== S.visible || X.spatialChannelOpacity !== S.opacity || q !== re) && A({
        color: X.spatialChannelColor,
        opacity: X.spatialChannelOpacity,
        visible: X.spatialChannelVisible,
        multiColor: "",
        multiVisible: "",
        multiOpacity: "",
        data: K,
        obsSets: $
      });
  }
  if (kr(() => {
    if (u !== null) {
      let X = 0, q = 0;
      for (let re = 0; re < u.children.length; re++)
        u.children[re].userData.name === "finalPass" ? q = re : X = re;
      u.children[q].children.forEach((re, pe) => {
        let { color: ae } = S;
        const ie = re.userData.name;
        if (S.obsSets.forEach((fe) => {
          fe.id === ie && (ae = fe.color);
        }), j[C].length > 1)
          j[C].forEach((fe) => {
            const ve = F[0][C][fe];
            ve.spatialTargetC === ie && (re.material.color.r = ve.spatialChannelColor[0] / 255, re.material.color.g = ve.spatialChannelColor[1] / 255, re.material.color.b = ve.spatialChannelColor[2] / 255, re.material.opacity = ve.spatialChannelOpacity, re.visible = ve.spatialChannelVisible, re.material.needsUpdate = !0, re.userData.layerScope = C, re.userData.channelScope = fe, u.children[X].children[pe].material.needsUpdate = !0);
          });
        else {
          re.material.color.r = ae[0] / 255, re.material.color.g = ae[1] / 255, re.material.color.b = ae[2] / 255, re.material.opacity = S.opacity, re.material.visible = S.visible, re.material.needsUpdate = !0, re.userData.layerScope = C;
          const fe = Object.keys(F[0][C])?.[0];
          re.userData.channelScope = fe;
        }
      });
    }
  }, [S, u]), T[C]?.image?.instance?.getData() !== void 0 && !n && !a && I !== null && I[0][1] !== 255 && k && (o(!0), r(!0)), kr(() => {
    const X = async () => {
      const q = await by(b, L, U, g.volumes, g.textures, g.volumeMinMax, g.resolution);
      if (q[0] !== null)
        if (x({
          resolution: L,
          volumes: q[0],
          textures: q[1],
          volumeMinMax: q[2],
          scale: q[3] !== null ? q[3] : g.scale,
          originalScale: q[4]
        }), !p.uniforms || !p.shader) {
          const re = nh(q[0], b, P, R, q[1], I, q[2], q[3], O, N, J, Z, ce, q[4]);
          re !== null && v({
            uniforms: re[0],
            shader: re[1],
            meshScale: re[2],
            geometrySize: re[3],
            boxSize: re[4]
          });
        } else
          _({
            channelsVisible: P,
            allChannels: M,
            channelTargetC: b,
            resolution: L,
            data: U,
            colors: R,
            contrastLimits: I,
            is3dMode: k,
            renderingMode: O,
            layerTransparency: N,
            xSlice: J,
            ySlice: Z,
            zSlice: ce
          });
    };
    n && (L !== E.resolution && e.current && (e.current.material.uniforms.volumeCount.value = 0, e.current.material.uniforms.volumeTex.value = null), X(), o(!1));
  }, [n]), kr(() => {
    if (p.uniforms && p.shader) {
      const X = nh(g.volumes, E.channelTargetC, E.channelsVisible, E.colors, g.textures, E.contrastLimits, g.volumeMinMax, g.scale, E.renderingMode, E.layerTransparency, E.xSlice, E.ySlice, E.zSlice, g.originalScale);
      if (X !== null) {
        let q = 0;
        E.channelsVisible.forEach((re) => {
          re && q++;
        }), o(!1), e?.current?.material?.uniforms && (e.current.material.uniforms.u_clim.value = X[0].u_clim.value, e.current.material.uniforms.u_clim2.value = X[0].u_clim2.value, e.current.material.uniforms.u_clim3.value = X[0].u_clim3.value, e.current.material.uniforms.u_clim4.value = X[0].u_clim4.value, e.current.material.uniforms.u_clim5.value = X[0].u_clim5.value, e.current.material.uniforms.u_clim6.value = X[0].u_clim6.value, e.current.material.uniforms.u_xClip.value = X[0].u_xClip.value, e.current.material.uniforms.u_yClip.value = X[0].u_yClip.value, e.current.material.uniforms.u_zClip.value = X[0].u_zClip.value, e.current.material.uniforms.u_color.value = X[0].u_color.value, e.current.material.uniforms.u_color2.value = X[0].u_color2.value, e.current.material.uniforms.u_color3.value = X[0].u_color3.value, e.current.material.uniforms.u_color4.value = X[0].u_color4.value, e.current.material.uniforms.u_color5.value = X[0].u_color5.value, e.current.material.uniforms.u_color6.value = X[0].u_color6.value, e.current.material.uniforms.volumeTex.value = X[0].volumeTex.value, e.current.material.uniforms.volumeTex2.value = X[0].volumeTex2.value, e.current.material.uniforms.volumeTex3.value = X[0].volumeTex3.value, e.current.material.uniforms.volumeTex4.value = X[0].volumeTex4.value, e.current.material.uniforms.volumeTex5.value = X[0].volumeTex5.value, e.current.material.uniforms.volumeTex6.value = X[0].volumeTex6.value, e.current.material.uniforms.volumeCount.value = q, e.current.material.uniforms.u_renderstyle.value = E.renderingMode, e.current.material.uniforms.dtScale.value = E.layerTransparency);
      } else
        e?.current?.material?.uniforms && (e.current.material.uniforms.volumeCount.value = 0, e.current.material.uniforms.volumeTex.value = null);
    }
  }, [E]), !E.is3dMode)
    return null;
  if (E.is3dMode && (!p.uniforms || !p.shader))
    return ye.jsxs("group", { children: [ye.jsx("ambientLight", {}), ye.jsx("pointLight", { position: [10, 10, 10] }), ye.jsx(rp, { color: "white", scale: 20, fontWeight: 1e3, children: "Loading ..." })] });
  const se = {
    segmentationGroup: u,
    segmentationSettings: S,
    segmentationSceneScale: f,
    renderingSettings: p,
    materialRef: e,
    highlightEntity: V,
    setObsHighlight: W
  };
  return ye.jsxs("group", { children: [ye.jsx(e0, {}), ye.jsx(s0, {}), ye.jsx(hy, {}), ye.jsx(my, {}), ye.jsx(py, { ...se }), ye.jsx(n1, { ref: s, enableDamping: !1, dampingFactor: 0, zoomDampingFactor: 0, smoothZoom: !1 })] });
}
const Iy = jm((c, e) => ye.jsxs("div", { style: { width: "100%", height: "100%" }, children: [ye.jsx(rc, { mode: "AR", sessionInit: { optionalFeatures: ["hand-tracking"] }, style: {
  border: "none",
  background: "rgba(0, 0, 0, 0.0)",
  zIndex: 1,
  position: "absolute"
}, children: (s) => s !== "unsupported" ? ye.jsx("div", { style: {
  border: "1px solid white",
  padding: "12px 24px",
  borderRadius: "4px",
  background: "rgba(0, 0, 0, 0.1)",
  color: "white",
  font: "normal 0.8125rem sans-serif",
  outline: "none",
  cursor: "pointer"
}, children: s === "entered" ? "Exit AR" : "Enter AR" }) : null }), ye.jsx(Rv, { style: { position: "absolute", top: 0, left: 0 }, camera: {
  fov: 50,
  up: [0, 1, 0],
  position: [0, 0, 800],
  near: 0.1,
  far: 3e3
}, gl: { antialias: !0, logarithmicDepthBuffer: !1 }, ref: e, children: ye.jsx(Nv, { children: ye.jsx(Ly, { ...c }) }) })] }));
export {
  Iy as SpatialWrapper
};
