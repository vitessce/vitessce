import * as React from "react";
import React__default, { Children, isValidElement, cloneElement, useState, useEffect, useCallback, useMemo, useContext, useRef } from "react";
import { usePlotOptionsStyles, OptionsContainer, OptionSelect, useLoaders, useCoordination, useFeatureLabelsData, useObsFeatureMatrixIndices, useReady, useUrls, TitleInfo } from "@vitessce/vit-s";
import * as ReactDOM from "react-dom";
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace(n) {
  if (n.__esModule)
    return n;
  var f = n.default;
  if (typeof f == "function") {
    var a = function a2() {
      if (this instanceof a2) {
        return Reflect.construct(f, arguments, this.constructor);
      }
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else
    a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var jsxRuntime = { exports: {} };
var reactJsxRuntime_development = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
{
  (function() {
    var React2 = React__default;
    var REACT_ELEMENT_TYPE = Symbol.for("react.element");
    var REACT_PORTAL_TYPE = Symbol.for("react.portal");
    var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
    var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
    var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
    var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
    var REACT_CONTEXT_TYPE = Symbol.for("react.context");
    var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
    var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
    var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
    var REACT_MEMO_TYPE = Symbol.for("react.memo");
    var REACT_LAZY_TYPE = Symbol.for("react.lazy");
    var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
    var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    var FAUX_ITERATOR_SYMBOL = "@@iterator";
    function getIteratorFn(maybeIterable) {
      if (maybeIterable === null || typeof maybeIterable !== "object") {
        return null;
      }
      var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
      if (typeof maybeIterator === "function") {
        return maybeIterator;
      }
      return null;
    }
    var ReactSharedInternals = React2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function error(format) {
      {
        {
          for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }
          printWarning2("error", format, args);
        }
      }
    }
    function printWarning2(level, format, args) {
      {
        var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
        var stack = ReactDebugCurrentFrame2.getStackAddendum();
        if (stack !== "") {
          format += "%s";
          args = args.concat([stack]);
        }
        var argsWithFormat = args.map(function(item) {
          return String(item);
        });
        argsWithFormat.unshift("Warning: " + format);
        Function.prototype.apply.call(console[level], console, argsWithFormat);
      }
    }
    var enableScopeAPI = false;
    var enableCacheElement = false;
    var enableTransitionTracing = false;
    var enableLegacyHidden = false;
    var enableDebugTracing = false;
    var REACT_MODULE_REFERENCE;
    {
      REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
    }
    function isValidElementType(type) {
      if (typeof type === "string" || typeof type === "function") {
        return true;
      }
      if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
        return true;
      }
      if (typeof type === "object" && type !== null) {
        if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
        // types supported by any Flight configuration anywhere since
        // we don't know which Flight build this will end up being used
        // with.
        type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
          return true;
        }
      }
      return false;
    }
    function getWrappedName2(outerType, innerType, wrapperName) {
      var displayName = outerType.displayName;
      if (displayName) {
        return displayName;
      }
      var functionName = innerType.displayName || innerType.name || "";
      return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
    }
    function getContextName(type) {
      return type.displayName || "Context";
    }
    function getComponentNameFromType(type) {
      if (type == null) {
        return null;
      }
      {
        if (typeof type.tag === "number") {
          error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
        }
      }
      if (typeof type === "function") {
        return type.displayName || type.name || null;
      }
      if (typeof type === "string") {
        return type;
      }
      switch (type) {
        case REACT_FRAGMENT_TYPE:
          return "Fragment";
        case REACT_PORTAL_TYPE:
          return "Portal";
        case REACT_PROFILER_TYPE:
          return "Profiler";
        case REACT_STRICT_MODE_TYPE:
          return "StrictMode";
        case REACT_SUSPENSE_TYPE:
          return "Suspense";
        case REACT_SUSPENSE_LIST_TYPE:
          return "SuspenseList";
      }
      if (typeof type === "object") {
        switch (type.$$typeof) {
          case REACT_CONTEXT_TYPE:
            var context = type;
            return getContextName(context) + ".Consumer";
          case REACT_PROVIDER_TYPE:
            var provider = type;
            return getContextName(provider._context) + ".Provider";
          case REACT_FORWARD_REF_TYPE:
            return getWrappedName2(type, type.render, "ForwardRef");
          case REACT_MEMO_TYPE:
            var outerName = type.displayName || null;
            if (outerName !== null) {
              return outerName;
            }
            return getComponentNameFromType(type.type) || "Memo";
          case REACT_LAZY_TYPE: {
            var lazyComponent = type;
            var payload = lazyComponent._payload;
            var init = lazyComponent._init;
            try {
              return getComponentNameFromType(init(payload));
            } catch (x) {
              return null;
            }
          }
        }
      }
      return null;
    }
    var assign2 = Object.assign;
    var disabledDepth = 0;
    var prevLog;
    var prevInfo;
    var prevWarn;
    var prevError;
    var prevGroup;
    var prevGroupCollapsed;
    var prevGroupEnd;
    function disabledLog() {
    }
    disabledLog.__reactDisabledLog = true;
    function disableLogs() {
      {
        if (disabledDepth === 0) {
          prevLog = console.log;
          prevInfo = console.info;
          prevWarn = console.warn;
          prevError = console.error;
          prevGroup = console.group;
          prevGroupCollapsed = console.groupCollapsed;
          prevGroupEnd = console.groupEnd;
          var props = {
            configurable: true,
            enumerable: true,
            value: disabledLog,
            writable: true
          };
          Object.defineProperties(console, {
            info: props,
            log: props,
            warn: props,
            error: props,
            group: props,
            groupCollapsed: props,
            groupEnd: props
          });
        }
        disabledDepth++;
      }
    }
    function reenableLogs() {
      {
        disabledDepth--;
        if (disabledDepth === 0) {
          var props = {
            configurable: true,
            enumerable: true,
            writable: true
          };
          Object.defineProperties(console, {
            log: assign2({}, props, {
              value: prevLog
            }),
            info: assign2({}, props, {
              value: prevInfo
            }),
            warn: assign2({}, props, {
              value: prevWarn
            }),
            error: assign2({}, props, {
              value: prevError
            }),
            group: assign2({}, props, {
              value: prevGroup
            }),
            groupCollapsed: assign2({}, props, {
              value: prevGroupCollapsed
            }),
            groupEnd: assign2({}, props, {
              value: prevGroupEnd
            })
          });
        }
        if (disabledDepth < 0) {
          error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
        }
      }
    }
    var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
    var prefix2;
    function describeBuiltInComponentFrame(name, source, ownerFn) {
      {
        if (prefix2 === void 0) {
          try {
            throw Error();
          } catch (x) {
            var match = x.stack.trim().match(/\n( *(at )?)/);
            prefix2 = match && match[1] || "";
          }
        }
        return "\n" + prefix2 + name;
      }
    }
    var reentry = false;
    var componentFrameCache;
    {
      var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
      componentFrameCache = new PossiblyWeakMap();
    }
    function describeNativeComponentFrame(fn, construct) {
      if (!fn || reentry) {
        return "";
      }
      {
        var frame = componentFrameCache.get(fn);
        if (frame !== void 0) {
          return frame;
        }
      }
      var control;
      reentry = true;
      var previousPrepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var previousDispatcher;
      {
        previousDispatcher = ReactCurrentDispatcher.current;
        ReactCurrentDispatcher.current = null;
        disableLogs();
      }
      try {
        if (construct) {
          var Fake = function() {
            throw Error();
          };
          Object.defineProperty(Fake.prototype, "props", {
            set: function() {
              throw Error();
            }
          });
          if (typeof Reflect === "object" && Reflect.construct) {
            try {
              Reflect.construct(Fake, []);
            } catch (x) {
              control = x;
            }
            Reflect.construct(fn, [], Fake);
          } else {
            try {
              Fake.call();
            } catch (x) {
              control = x;
            }
            fn.call(Fake.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (x) {
            control = x;
          }
          fn();
        }
      } catch (sample) {
        if (sample && control && typeof sample.stack === "string") {
          var sampleLines = sample.stack.split("\n");
          var controlLines = control.stack.split("\n");
          var s = sampleLines.length - 1;
          var c = controlLines.length - 1;
          while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
            c--;
          }
          for (; s >= 1 && c >= 0; s--, c--) {
            if (sampleLines[s] !== controlLines[c]) {
              if (s !== 1 || c !== 1) {
                do {
                  s--;
                  c--;
                  if (c < 0 || sampleLines[s] !== controlLines[c]) {
                    var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                    if (fn.displayName && _frame.includes("<anonymous>")) {
                      _frame = _frame.replace("<anonymous>", fn.displayName);
                    }
                    {
                      if (typeof fn === "function") {
                        componentFrameCache.set(fn, _frame);
                      }
                    }
                    return _frame;
                  }
                } while (s >= 1 && c >= 0);
              }
              break;
            }
          }
        }
      } finally {
        reentry = false;
        {
          ReactCurrentDispatcher.current = previousDispatcher;
          reenableLogs();
        }
        Error.prepareStackTrace = previousPrepareStackTrace;
      }
      var name = fn ? fn.displayName || fn.name : "";
      var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
      {
        if (typeof fn === "function") {
          componentFrameCache.set(fn, syntheticFrame);
        }
      }
      return syntheticFrame;
    }
    function describeFunctionComponentFrame(fn, source, ownerFn) {
      {
        return describeNativeComponentFrame(fn, false);
      }
    }
    function shouldConstruct(Component) {
      var prototype = Component.prototype;
      return !!(prototype && prototype.isReactComponent);
    }
    function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
      if (type == null) {
        return "";
      }
      if (typeof type === "function") {
        {
          return describeNativeComponentFrame(type, shouldConstruct(type));
        }
      }
      if (typeof type === "string") {
        return describeBuiltInComponentFrame(type);
      }
      switch (type) {
        case REACT_SUSPENSE_TYPE:
          return describeBuiltInComponentFrame("Suspense");
        case REACT_SUSPENSE_LIST_TYPE:
          return describeBuiltInComponentFrame("SuspenseList");
      }
      if (typeof type === "object") {
        switch (type.$$typeof) {
          case REACT_FORWARD_REF_TYPE:
            return describeFunctionComponentFrame(type.render);
          case REACT_MEMO_TYPE:
            return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
          case REACT_LAZY_TYPE: {
            var lazyComponent = type;
            var payload = lazyComponent._payload;
            var init = lazyComponent._init;
            try {
              return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
            } catch (x) {
            }
          }
        }
      }
      return "";
    }
    var hasOwnProperty2 = Object.prototype.hasOwnProperty;
    var loggedTypeFailures = {};
    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
    function setCurrentlyValidatingElement(element) {
      {
        if (element) {
          var owner = element._owner;
          var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
          ReactDebugCurrentFrame.setExtraStackFrame(stack);
        } else {
          ReactDebugCurrentFrame.setExtraStackFrame(null);
        }
      }
    }
    function checkPropTypes2(typeSpecs, values2, location, componentName, element) {
      {
        var has2 = Function.call.bind(hasOwnProperty2);
        for (var typeSpecName in typeSpecs) {
          if (has2(typeSpecs, typeSpecName)) {
            var error$1 = void 0;
            try {
              if (typeof typeSpecs[typeSpecName] !== "function") {
                var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                err.name = "Invariant Violation";
                throw err;
              }
              error$1 = typeSpecs[typeSpecName](values2, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (ex) {
              error$1 = ex;
            }
            if (error$1 && !(error$1 instanceof Error)) {
              setCurrentlyValidatingElement(element);
              error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
              setCurrentlyValidatingElement(null);
            }
            if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
              loggedTypeFailures[error$1.message] = true;
              setCurrentlyValidatingElement(element);
              error("Failed %s type: %s", location, error$1.message);
              setCurrentlyValidatingElement(null);
            }
          }
        }
      }
    }
    var isArrayImpl = Array.isArray;
    function isArray2(a) {
      return isArrayImpl(a);
    }
    function typeName(value) {
      {
        var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
        var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
        return type;
      }
    }
    function willCoercionThrow(value) {
      {
        try {
          testStringCoercion(value);
          return false;
        } catch (e) {
          return true;
        }
      }
    }
    function testStringCoercion(value) {
      return "" + value;
    }
    function checkKeyStringCoercion(value) {
      {
        if (willCoercionThrow(value)) {
          error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
          return testStringCoercion(value);
        }
      }
    }
    var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
    var RESERVED_PROPS = {
      key: true,
      ref: true,
      __self: true,
      __source: true
    };
    var specialPropKeyWarningShown;
    var specialPropRefWarningShown;
    var didWarnAboutStringRefs;
    {
      didWarnAboutStringRefs = {};
    }
    function hasValidRef(config) {
      {
        if (hasOwnProperty2.call(config, "ref")) {
          var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
          if (getter && getter.isReactWarning) {
            return false;
          }
        }
      }
      return config.ref !== void 0;
    }
    function hasValidKey(config) {
      {
        if (hasOwnProperty2.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) {
            return false;
          }
        }
      }
      return config.key !== void 0;
    }
    function warnIfStringRefCannotBeAutoConverted(config, self2) {
      {
        if (typeof config.ref === "string" && ReactCurrentOwner.current && self2 && ReactCurrentOwner.current.stateNode !== self2) {
          var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
          if (!didWarnAboutStringRefs[componentName]) {
            error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', getComponentNameFromType(ReactCurrentOwner.current.type), config.ref);
            didWarnAboutStringRefs[componentName] = true;
          }
        }
      }
    }
    function defineKeyPropWarningGetter(props, displayName) {
      {
        var warnAboutAccessingKey = function() {
          if (!specialPropKeyWarningShown) {
            specialPropKeyWarningShown = true;
            error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
          }
        };
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
    }
    function defineRefPropWarningGetter(props, displayName) {
      {
        var warnAboutAccessingRef = function() {
          if (!specialPropRefWarningShown) {
            specialPropRefWarningShown = true;
            error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
          }
        };
        warnAboutAccessingRef.isReactWarning = true;
        Object.defineProperty(props, "ref", {
          get: warnAboutAccessingRef,
          configurable: true
        });
      }
    }
    var ReactElement = function(type, key, ref, self2, source, owner, props) {
      var element = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: REACT_ELEMENT_TYPE,
        // Built-in properties that belong on the element
        type,
        key,
        ref,
        props,
        // Record the component responsible for creating this element.
        _owner: owner
      };
      {
        element._store = {};
        Object.defineProperty(element._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: false
        });
        Object.defineProperty(element, "_self", {
          configurable: false,
          enumerable: false,
          writable: false,
          value: self2
        });
        Object.defineProperty(element, "_source", {
          configurable: false,
          enumerable: false,
          writable: false,
          value: source
        });
        if (Object.freeze) {
          Object.freeze(element.props);
          Object.freeze(element);
        }
      }
      return element;
    };
    function jsxDEV(type, config, maybeKey, source, self2) {
      {
        var propName;
        var props = {};
        var key = null;
        var ref = null;
        if (maybeKey !== void 0) {
          {
            checkKeyStringCoercion(maybeKey);
          }
          key = "" + maybeKey;
        }
        if (hasValidKey(config)) {
          {
            checkKeyStringCoercion(config.key);
          }
          key = "" + config.key;
        }
        if (hasValidRef(config)) {
          ref = config.ref;
          warnIfStringRefCannotBeAutoConverted(config, self2);
        }
        for (propName in config) {
          if (hasOwnProperty2.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
            props[propName] = config[propName];
          }
        }
        if (type && type.defaultProps) {
          var defaultProps2 = type.defaultProps;
          for (propName in defaultProps2) {
            if (props[propName] === void 0) {
              props[propName] = defaultProps2[propName];
            }
          }
        }
        if (key || ref) {
          var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
          if (key) {
            defineKeyPropWarningGetter(props, displayName);
          }
          if (ref) {
            defineRefPropWarningGetter(props, displayName);
          }
        }
        return ReactElement(type, key, ref, self2, source, ReactCurrentOwner.current, props);
      }
    }
    var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
    var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
    function setCurrentlyValidatingElement$1(element) {
      {
        if (element) {
          var owner = element._owner;
          var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
          ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
        } else {
          ReactDebugCurrentFrame$1.setExtraStackFrame(null);
        }
      }
    }
    var propTypesMisspellWarningShown;
    {
      propTypesMisspellWarningShown = false;
    }
    function isValidElement2(object) {
      {
        return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
      }
    }
    function getDeclarationErrorAddendum() {
      {
        if (ReactCurrentOwner$1.current) {
          var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);
          if (name) {
            return "\n\nCheck the render method of `" + name + "`.";
          }
        }
        return "";
      }
    }
    function getSourceInfoErrorAddendum(source) {
      {
        if (source !== void 0) {
          var fileName = source.fileName.replace(/^.*[\\\/]/, "");
          var lineNumber = source.lineNumber;
          return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
        }
        return "";
      }
    }
    var ownerHasKeyUseWarning = {};
    function getCurrentComponentErrorInfo(parentType) {
      {
        var info = getDeclarationErrorAddendum();
        if (!info) {
          var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
          if (parentName) {
            info = "\n\nCheck the top-level render call using <" + parentName + ">.";
          }
        }
        return info;
      }
    }
    function validateExplicitKey(element, parentType) {
      {
        if (!element._store || element._store.validated || element.key != null) {
          return;
        }
        element._store.validated = true;
        var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
        if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
          return;
        }
        ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
        var childOwner = "";
        if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
          childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
        }
        setCurrentlyValidatingElement$1(element);
        error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
        setCurrentlyValidatingElement$1(null);
      }
    }
    function validateChildKeys(node, parentType) {
      {
        if (typeof node !== "object") {
          return;
        }
        if (isArray2(node)) {
          for (var i = 0; i < node.length; i++) {
            var child = node[i];
            if (isValidElement2(child)) {
              validateExplicitKey(child, parentType);
            }
          }
        } else if (isValidElement2(node)) {
          if (node._store) {
            node._store.validated = true;
          }
        } else if (node) {
          var iteratorFn = getIteratorFn(node);
          if (typeof iteratorFn === "function") {
            if (iteratorFn !== node.entries) {
              var iterator = iteratorFn.call(node);
              var step;
              while (!(step = iterator.next()).done) {
                if (isValidElement2(step.value)) {
                  validateExplicitKey(step.value, parentType);
                }
              }
            }
          }
        }
      }
    }
    function validatePropTypes(element) {
      {
        var type = element.type;
        if (type === null || type === void 0 || typeof type === "string") {
          return;
        }
        var propTypes2;
        if (typeof type === "function") {
          propTypes2 = type.propTypes;
        } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        type.$$typeof === REACT_MEMO_TYPE)) {
          propTypes2 = type.propTypes;
        } else {
          return;
        }
        if (propTypes2) {
          var name = getComponentNameFromType(type);
          checkPropTypes2(propTypes2, element.props, "prop", name, element);
        } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
          propTypesMisspellWarningShown = true;
          var _name = getComponentNameFromType(type);
          error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
        }
        if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
          error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
        }
      }
    }
    function validateFragmentProps(fragment) {
      {
        var keys2 = Object.keys(fragment.props);
        for (var i = 0; i < keys2.length; i++) {
          var key = keys2[i];
          if (key !== "children" && key !== "key") {
            setCurrentlyValidatingElement$1(fragment);
            error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
            setCurrentlyValidatingElement$1(null);
            break;
          }
        }
        if (fragment.ref !== null) {
          setCurrentlyValidatingElement$1(fragment);
          error("Invalid attribute `ref` supplied to `React.Fragment`.");
          setCurrentlyValidatingElement$1(null);
        }
      }
    }
    var didWarnAboutKeySpread = {};
    function jsxWithValidation(type, props, key, isStaticChildren, source, self2) {
      {
        var validType = isValidElementType(type);
        if (!validType) {
          var info = "";
          if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
            info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
          }
          var sourceInfo = getSourceInfoErrorAddendum(source);
          if (sourceInfo) {
            info += sourceInfo;
          } else {
            info += getDeclarationErrorAddendum();
          }
          var typeString;
          if (type === null) {
            typeString = "null";
          } else if (isArray2(type)) {
            typeString = "array";
          } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
            typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
            info = " Did you accidentally export a JSX literal instead of a component?";
          } else {
            typeString = typeof type;
          }
          error("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
        }
        var element = jsxDEV(type, props, key, source, self2);
        if (element == null) {
          return element;
        }
        if (validType) {
          var children = props.children;
          if (children !== void 0) {
            if (isStaticChildren) {
              if (isArray2(children)) {
                for (var i = 0; i < children.length; i++) {
                  validateChildKeys(children[i], type);
                }
                if (Object.freeze) {
                  Object.freeze(children);
                }
              } else {
                error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
              }
            } else {
              validateChildKeys(children, type);
            }
          }
        }
        {
          if (hasOwnProperty2.call(props, "key")) {
            var componentName = getComponentNameFromType(type);
            var keys2 = Object.keys(props).filter(function(k) {
              return k !== "key";
            });
            var beforeExample = keys2.length > 0 ? "{key: someKey, " + keys2.join(": ..., ") + ": ...}" : "{key: someKey}";
            if (!didWarnAboutKeySpread[componentName + beforeExample]) {
              var afterExample = keys2.length > 0 ? "{" + keys2.join(": ..., ") + ": ...}" : "{}";
              error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);
              didWarnAboutKeySpread[componentName + beforeExample] = true;
            }
          }
        }
        if (type === REACT_FRAGMENT_TYPE) {
          validateFragmentProps(element);
        } else {
          validatePropTypes(element);
        }
        return element;
      }
    }
    function jsxWithValidationStatic(type, props, key) {
      {
        return jsxWithValidation(type, props, key, true);
      }
    }
    function jsxWithValidationDynamic(type, props, key) {
      {
        return jsxWithValidation(type, props, key, false);
      }
    }
    var jsx = jsxWithValidationDynamic;
    var jsxs = jsxWithValidationStatic;
    reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
    reactJsxRuntime_development.jsx = jsx;
    reactJsxRuntime_development.jsxs = jsxs;
  })();
}
{
  jsxRuntime.exports = reactJsxRuntime_development;
}
var jsxRuntimeExports = jsxRuntime.exports;
function commonjsRequire(path) {
  throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var pluralize$1 = { exports: {} };
(function(module2, exports2) {
  (function(root2, pluralize2) {
    if (typeof commonjsRequire === "function" && true && true) {
      module2.exports = pluralize2();
    } else {
      root2.pluralize = pluralize2();
    }
  })(commonjsGlobal, function() {
    var pluralRules = [];
    var singularRules = [];
    var uncountables = {};
    var irregularPlurals = {};
    var irregularSingles = {};
    function sanitizeRule(rule) {
      if (typeof rule === "string") {
        return new RegExp("^" + rule + "$", "i");
      }
      return rule;
    }
    function restoreCase(word, token) {
      if (word === token)
        return token;
      if (word === word.toLowerCase())
        return token.toLowerCase();
      if (word === word.toUpperCase())
        return token.toUpperCase();
      if (word[0] === word[0].toUpperCase()) {
        return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
      }
      return token.toLowerCase();
    }
    function interpolate(str, args) {
      return str.replace(/\$(\d{1,2})/g, function(match, index) {
        return args[index] || "";
      });
    }
    function replace(word, rule) {
      return word.replace(rule[0], function(match, index) {
        var result = interpolate(rule[1], arguments);
        if (match === "") {
          return restoreCase(word[index - 1], result);
        }
        return restoreCase(match, result);
      });
    }
    function sanitizeWord(token, word, rules) {
      if (!token.length || uncountables.hasOwnProperty(token)) {
        return word;
      }
      var len = rules.length;
      while (len--) {
        var rule = rules[len];
        if (rule[0].test(word))
          return replace(word, rule);
      }
      return word;
    }
    function replaceWord(replaceMap, keepMap, rules) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token)) {
          return restoreCase(word, token);
        }
        if (replaceMap.hasOwnProperty(token)) {
          return restoreCase(word, replaceMap[token]);
        }
        return sanitizeWord(token, word, rules);
      };
    }
    function checkWord(replaceMap, keepMap, rules, bool) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token))
          return true;
        if (replaceMap.hasOwnProperty(token))
          return false;
        return sanitizeWord(token, token, rules) === token;
      };
    }
    function pluralize2(word, count, inclusive) {
      var pluralized = count === 1 ? pluralize2.singular(word) : pluralize2.plural(word);
      return (inclusive ? count + " " : "") + pluralized;
    }
    pluralize2.plural = replaceWord(
      irregularSingles,
      irregularPlurals,
      pluralRules
    );
    pluralize2.isPlural = checkWord(
      irregularSingles,
      irregularPlurals,
      pluralRules
    );
    pluralize2.singular = replaceWord(
      irregularPlurals,
      irregularSingles,
      singularRules
    );
    pluralize2.isSingular = checkWord(
      irregularPlurals,
      irregularSingles,
      singularRules
    );
    pluralize2.addPluralRule = function(rule, replacement) {
      pluralRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize2.addSingularRule = function(rule, replacement) {
      singularRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize2.addUncountableRule = function(word) {
      if (typeof word === "string") {
        uncountables[word.toLowerCase()] = true;
        return;
      }
      pluralize2.addPluralRule(word, "$0");
      pluralize2.addSingularRule(word, "$0");
    };
    pluralize2.addIrregularRule = function(single, plural) {
      plural = plural.toLowerCase();
      single = single.toLowerCase();
      irregularSingles[single] = plural;
      irregularPlurals[plural] = single;
    };
    [
      // Pronouns.
      ["I", "we"],
      ["me", "us"],
      ["he", "they"],
      ["she", "they"],
      ["them", "them"],
      ["myself", "ourselves"],
      ["yourself", "yourselves"],
      ["itself", "themselves"],
      ["herself", "themselves"],
      ["himself", "themselves"],
      ["themself", "themselves"],
      ["is", "are"],
      ["was", "were"],
      ["has", "have"],
      ["this", "these"],
      ["that", "those"],
      // Words ending in with a consonant and `o`.
      ["echo", "echoes"],
      ["dingo", "dingoes"],
      ["volcano", "volcanoes"],
      ["tornado", "tornadoes"],
      ["torpedo", "torpedoes"],
      // Ends with `us`.
      ["genus", "genera"],
      ["viscus", "viscera"],
      // Ends with `ma`.
      ["stigma", "stigmata"],
      ["stoma", "stomata"],
      ["dogma", "dogmata"],
      ["lemma", "lemmata"],
      ["schema", "schemata"],
      ["anathema", "anathemata"],
      // Other irregular rules.
      ["ox", "oxen"],
      ["axe", "axes"],
      ["die", "dice"],
      ["yes", "yeses"],
      ["foot", "feet"],
      ["eave", "eaves"],
      ["goose", "geese"],
      ["tooth", "teeth"],
      ["quiz", "quizzes"],
      ["human", "humans"],
      ["proof", "proofs"],
      ["carve", "carves"],
      ["valve", "valves"],
      ["looey", "looies"],
      ["thief", "thieves"],
      ["groove", "grooves"],
      ["pickaxe", "pickaxes"],
      ["passerby", "passersby"]
    ].forEach(function(rule) {
      return pluralize2.addIrregularRule(rule[0], rule[1]);
    });
    [
      [/s?$/i, "s"],
      [/[^\u0000-\u007F]$/i, "$0"],
      [/([^aeiou]ese)$/i, "$1"],
      [/(ax|test)is$/i, "$1es"],
      [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, "$1es"],
      [/(e[mn]u)s?$/i, "$1s"],
      [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, "$1"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1i"],
      [/(alumn|alg|vertebr)(?:a|ae)$/i, "$1ae"],
      [/(seraph|cherub)(?:im)?$/i, "$1im"],
      [/(her|at|gr)o$/i, "$1oes"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, "$1a"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, "$1a"],
      [/sis$/i, "ses"],
      [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, "$1$2ves"],
      [/([^aeiouy]|qu)y$/i, "$1ies"],
      [/([^ch][ieo][ln])ey$/i, "$1ies"],
      [/(x|ch|ss|sh|zz)$/i, "$1es"],
      [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, "$1ices"],
      [/\b((?:tit)?m|l)(?:ice|ouse)$/i, "$1ice"],
      [/(pe)(?:rson|ople)$/i, "$1ople"],
      [/(child)(?:ren)?$/i, "$1ren"],
      [/eaux$/i, "$0"],
      [/m[ae]n$/i, "men"],
      ["thou", "you"]
    ].forEach(function(rule) {
      return pluralize2.addPluralRule(rule[0], rule[1]);
    });
    [
      [/s$/i, ""],
      [/(ss)$/i, "$1"],
      [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, "$1fe"],
      [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, "$1f"],
      [/ies$/i, "y"],
      [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, "$1ie"],
      [/\b(mon|smil)ies$/i, "$1ey"],
      [/\b((?:tit)?m|l)ice$/i, "$1ouse"],
      [/(seraph|cherub)im$/i, "$1"],
      [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, "$1"],
      [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, "$1sis"],
      [/(movie|twelve|abuse|e[mn]u)s$/i, "$1"],
      [/(test)(?:is|es)$/i, "$1is"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1us"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, "$1um"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, "$1on"],
      [/(alumn|alg|vertebr)ae$/i, "$1a"],
      [/(cod|mur|sil|vert|ind)ices$/i, "$1ex"],
      [/(matr|append)ices$/i, "$1ix"],
      [/(pe)(rson|ople)$/i, "$1rson"],
      [/(child)ren$/i, "$1"],
      [/(eau)x?$/i, "$1"],
      [/men$/i, "man"]
    ].forEach(function(rule) {
      return pluralize2.addSingularRule(rule[0], rule[1]);
    });
    [
      // Singular words with no plurals.
      "adulthood",
      "advice",
      "agenda",
      "aid",
      "aircraft",
      "alcohol",
      "ammo",
      "analytics",
      "anime",
      "athletics",
      "audio",
      "bison",
      "blood",
      "bream",
      "buffalo",
      "butter",
      "carp",
      "cash",
      "chassis",
      "chess",
      "clothing",
      "cod",
      "commerce",
      "cooperation",
      "corps",
      "debris",
      "diabetes",
      "digestion",
      "elk",
      "energy",
      "equipment",
      "excretion",
      "expertise",
      "firmware",
      "flounder",
      "fun",
      "gallows",
      "garbage",
      "graffiti",
      "hardware",
      "headquarters",
      "health",
      "herpes",
      "highjinks",
      "homework",
      "housework",
      "information",
      "jeans",
      "justice",
      "kudos",
      "labour",
      "literature",
      "machinery",
      "mackerel",
      "mail",
      "media",
      "mews",
      "moose",
      "music",
      "mud",
      "manga",
      "news",
      "only",
      "personnel",
      "pike",
      "plankton",
      "pliers",
      "police",
      "pollution",
      "premises",
      "rain",
      "research",
      "rice",
      "salmon",
      "scissors",
      "series",
      "sewage",
      "shambles",
      "shrimp",
      "software",
      "species",
      "staff",
      "swine",
      "tennis",
      "traffic",
      "transportation",
      "trout",
      "tuna",
      "wealth",
      "welfare",
      "whiting",
      "wildebeest",
      "wildlife",
      "you",
      /pok[eé]mon$/i,
      // Regexes.
      /[^aeiou]ese$/i,
      // "chinese", "japanese"
      /deer$/i,
      // "deer", "reindeer"
      /fish$/i,
      // "fish", "blowfish", "angelfish"
      /measles$/i,
      /o[iu]s$/i,
      // "carnivorous"
      /pox$/i,
      // "chickpox", "smallpox"
      /sheep$/i
    ].forEach(pluralize2.addUncountableRule);
    return pluralize2;
  });
})(pluralize$1);
var pluralizeExports = pluralize$1.exports;
const plur = /* @__PURE__ */ getDefaultExportFromCjs(pluralizeExports);
plur.addPluralRule("glomerulus", "glomeruli");
plur.addPluralRule("interstitium", "interstitia");
function commaNumber(n) {
  const nf = new Intl.NumberFormat("en-US");
  return nf.format(n);
}
function capitalize$1(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
}
function pluralize(word, count = null) {
  return plur(word, count);
}
const ViewType = {
  DESCRIPTION: "description",
  STATUS: "status",
  SCATTERPLOT: "scatterplot",
  SPATIAL: "spatial",
  SPATIAL_BETA: "spatialBeta",
  HEATMAP: "heatmap",
  LAYER_CONTROLLER: "layerController",
  LAYER_CONTROLLER_BETA: "layerControllerBeta",
  GENOMIC_PROFILES: "genomicProfiles",
  GATING: "gating",
  FEATURE_LIST: "featureList",
  OBS_SETS: "obsSets",
  OBS_SET_SIZES: "obsSetSizes",
  OBS_SET_FEATURE_VALUE_DISTRIBUTION: "obsSetFeatureValueDistribution",
  FEATURE_VALUE_HISTOGRAM: "featureValueHistogram",
  FEATURE_BAR_PLOT: "featureBarPlot"
};
const CoordinationType = {
  META_COORDINATION_SCOPES: "metaCoordinationScopes",
  META_COORDINATION_SCOPES_BY: "metaCoordinationScopesBy",
  DATASET: "dataset",
  // Entity types
  OBS_TYPE: "obsType",
  FEATURE_TYPE: "featureType",
  FEATURE_VALUE_TYPE: "featureValueType",
  OBS_LABELS_TYPE: "obsLabelsType",
  // Other types
  EMBEDDING_TYPE: "embeddingType",
  EMBEDDING_ZOOM: "embeddingZoom",
  EMBEDDING_ROTATION: "embeddingRotation",
  EMBEDDING_TARGET_X: "embeddingTargetX",
  EMBEDDING_TARGET_Y: "embeddingTargetY",
  EMBEDDING_TARGET_Z: "embeddingTargetZ",
  EMBEDDING_OBS_SET_POLYGONS_VISIBLE: "embeddingObsSetPolygonsVisible",
  EMBEDDING_OBS_SET_LABELS_VISIBLE: "embeddingObsSetLabelsVisible",
  EMBEDDING_OBS_SET_LABEL_SIZE: "embeddingObsSetLabelSize",
  EMBEDDING_OBS_RADIUS: "embeddingObsRadius",
  EMBEDDING_OBS_RADIUS_MODE: "embeddingObsRadiusMode",
  EMBEDDING_OBS_OPACITY: "embeddingObsOpacity",
  EMBEDDING_OBS_OPACITY_MODE: "embeddingObsOpacityMode",
  SPATIAL_ZOOM: "spatialZoom",
  SPATIAL_ROTATION: "spatialRotation",
  SPATIAL_TARGET_X: "spatialTargetX",
  SPATIAL_TARGET_Y: "spatialTargetY",
  SPATIAL_TARGET_Z: "spatialTargetZ",
  SPATIAL_TARGET_T: "spatialTargetT",
  SPATIAL_ROTATION_X: "spatialRotationX",
  SPATIAL_ROTATION_Y: "spatialRotationY",
  SPATIAL_ROTATION_Z: "spatialRotationZ",
  SPATIAL_ROTATION_ORBIT: "spatialRotationOrbit",
  SPATIAL_ORBIT_AXIS: "spatialOrbitAxis",
  SPATIAL_AXIS_FIXED: "spatialAxisFixed",
  HEATMAP_ZOOM_X: "heatmapZoomX",
  HEATMAP_ZOOM_Y: "heatmapZoomY",
  HEATMAP_TARGET_X: "heatmapTargetX",
  HEATMAP_TARGET_Y: "heatmapTargetY",
  OBS_FILTER: "obsFilter",
  OBS_HIGHLIGHT: "obsHighlight",
  OBS_SET_SELECTION: "obsSetSelection",
  OBS_SET_HIGHLIGHT: "obsSetHighlight",
  OBS_SET_EXPANSION: "obsSetExpansion",
  OBS_SET_COLOR: "obsSetColor",
  FEATURE_FILTER: "featureFilter",
  FEATURE_HIGHLIGHT: "featureHighlight",
  FEATURE_SELECTION: "featureSelection",
  FEATURE_VALUE_COLORMAP: "featureValueColormap",
  FEATURE_VALUE_TRANSFORM: "featureValueTransform",
  FEATURE_VALUE_COLORMAP_RANGE: "featureValueColormapRange",
  OBS_COLOR_ENCODING: "obsColorEncoding",
  SPATIAL_IMAGE_LAYER: "spatialImageLayer",
  SPATIAL_SEGMENTATION_LAYER: "spatialSegmentationLayer",
  SPATIAL_POINT_LAYER: "spatialPointLayer",
  SPATIAL_NEIGHBORHOOD_LAYER: "spatialNeighborhoodLayer",
  GENOMIC_ZOOM_X: "genomicZoomX",
  GENOMIC_ZOOM_Y: "genomicZoomY",
  GENOMIC_TARGET_X: "genomicTargetX",
  GENOMIC_TARGET_Y: "genomicTargetY",
  ADDITIONAL_OBS_SETS: "additionalObsSets",
  // TODO: use obsHighlight rather than moleculeHighlight.
  MOLECULE_HIGHLIGHT: "moleculeHighlight",
  GATING_FEATURE_SELECTION_X: "gatingFeatureSelectionX",
  GATING_FEATURE_SELECTION_Y: "gatingFeatureSelectionY",
  FEATURE_VALUE_TRANSFORM_COEFFICIENT: "featureValueTransformCoefficient",
  TOOLTIPS_VISIBLE: "tooltipsVisible",
  FILE_UID: "fileUid",
  IMAGE_LAYER: "imageLayer",
  IMAGE_CHANNEL: "imageChannel",
  SEGMENTATION_LAYER: "segmentationLayer",
  SEGMENTATION_CHANNEL: "segmentationChannel",
  SPATIAL_TARGET_C: "spatialTargetC",
  SPATIAL_LAYER_VISIBLE: "spatialLayerVisible",
  SPATIAL_LAYER_OPACITY: "spatialLayerOpacity",
  SPATIAL_LAYER_COLORMAP: "spatialLayerColormap",
  SPATIAL_LAYER_TRANSPARENT_COLOR: "spatialLayerTransparentColor",
  SPATIAL_LAYER_MODEL_MATRIX: "spatialLayerModelMatrix",
  SPATIAL_SEGMENTATION_FILLED: "spatialSegmentationFilled",
  SPATIAL_SEGMENTATION_STROKE_WIDTH: "spatialSegmentationStrokeWidth",
  SPATIAL_CHANNEL_COLOR: "spatialChannelColor",
  SPATIAL_CHANNEL_VISIBLE: "spatialChannelVisible",
  SPATIAL_CHANNEL_OPACITY: "spatialChannelOpacity",
  SPATIAL_CHANNEL_WINDOW: "spatialChannelWindow",
  PHOTOMETRIC_INTERPRETATION: "photometricInterpretation",
  // For 3D volume rendering
  SPATIAL_RENDERING_MODE: "spatialRenderingMode",
  // For whole spatial view
  VOLUMETRIC_RENDERING_ALGORITHM: "volumetricRenderingAlgorithm",
  // Could be per-image-layer
  SPATIAL_TARGET_RESOLUTION: "spatialTargetResolution",
  // Per-spatial-layer
  // For clipping plane sliders
  SPATIAL_SLICE_X: "spatialSliceX",
  SPATIAL_SLICE_Y: "spatialSliceY",
  SPATIAL_SLICE_Z: "spatialSliceZ",
  // For spatial spot and point layers
  SPOT_LAYER: "spotLayer",
  POINT_LAYER: "pointLayer",
  SPATIAL_SPOT_RADIUS: "spatialSpotRadius",
  // In micrometers?
  SPATIAL_SPOT_FILLED: "spatialSpotFilled",
  SPATIAL_SPOT_STROKE_WIDTH: "spatialSpotStrokeWidth",
  SPATIAL_LAYER_COLOR: "spatialLayerColor",
  PIXEL_HIGHLIGHT: "pixelHighlight",
  // Per-image-layer
  TOOLTIP_CROSSHAIRS_VISIBLE: "tooltipCrosshairsVisible",
  LEGEND_VISIBLE: "legendVisible",
  SPATIAL_CHANNEL_LABELS_VISIBLE: "spatialChannelLabelsVisible",
  SPATIAL_CHANNEL_LABELS_ORIENTATION: "spatialChannelLabelsOrientation",
  SPATIAL_CHANNEL_LABEL_SIZE: "spatialChannelLabelSize",
  // Multi-sample / comparative
  SAMPLE_TYPE: "sampleType",
  SAMPLE_SET_SELECTION: "sampleSetSelection"
};
const COMPONENT_COORDINATION_TYPES = {
  [ViewType.SCATTERPLOT]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
    CoordinationType.OBS_LABELS_TYPE,
    CoordinationType.EMBEDDING_TYPE,
    CoordinationType.EMBEDDING_ZOOM,
    CoordinationType.EMBEDDING_ROTATION,
    CoordinationType.EMBEDDING_TARGET_X,
    CoordinationType.EMBEDDING_TARGET_Y,
    CoordinationType.EMBEDDING_TARGET_Z,
    CoordinationType.EMBEDDING_OBS_SET_POLYGONS_VISIBLE,
    CoordinationType.EMBEDDING_OBS_SET_LABELS_VISIBLE,
    CoordinationType.EMBEDDING_OBS_SET_LABEL_SIZE,
    CoordinationType.EMBEDDING_OBS_RADIUS,
    CoordinationType.EMBEDDING_OBS_RADIUS_MODE,
    CoordinationType.EMBEDDING_OBS_OPACITY,
    CoordinationType.EMBEDDING_OBS_OPACITY_MODE,
    CoordinationType.OBS_FILTER,
    CoordinationType.OBS_HIGHLIGHT,
    CoordinationType.OBS_SET_SELECTION,
    CoordinationType.OBS_SET_HIGHLIGHT,
    CoordinationType.OBS_SET_COLOR,
    CoordinationType.FEATURE_HIGHLIGHT,
    CoordinationType.FEATURE_SELECTION,
    CoordinationType.FEATURE_VALUE_COLORMAP,
    CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
    CoordinationType.OBS_COLOR_ENCODING,
    CoordinationType.ADDITIONAL_OBS_SETS,
    CoordinationType.TOOLTIPS_VISIBLE
  ],
  [ViewType.GATING]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
    CoordinationType.EMBEDDING_TYPE,
    CoordinationType.EMBEDDING_ZOOM,
    CoordinationType.EMBEDDING_ROTATION,
    CoordinationType.EMBEDDING_TARGET_X,
    CoordinationType.EMBEDDING_TARGET_Y,
    CoordinationType.EMBEDDING_TARGET_Z,
    CoordinationType.EMBEDDING_OBS_SET_POLYGONS_VISIBLE,
    CoordinationType.EMBEDDING_OBS_SET_LABELS_VISIBLE,
    CoordinationType.EMBEDDING_OBS_SET_LABEL_SIZE,
    CoordinationType.EMBEDDING_OBS_RADIUS,
    CoordinationType.EMBEDDING_OBS_RADIUS_MODE,
    CoordinationType.EMBEDDING_OBS_OPACITY,
    CoordinationType.EMBEDDING_OBS_OPACITY_MODE,
    CoordinationType.OBS_FILTER,
    CoordinationType.OBS_HIGHLIGHT,
    CoordinationType.OBS_SET_SELECTION,
    CoordinationType.OBS_SET_HIGHLIGHT,
    CoordinationType.OBS_SET_COLOR,
    CoordinationType.FEATURE_HIGHLIGHT,
    CoordinationType.FEATURE_SELECTION,
    CoordinationType.FEATURE_VALUE_COLORMAP,
    CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
    CoordinationType.OBS_COLOR_ENCODING,
    CoordinationType.ADDITIONAL_OBS_SETS,
    CoordinationType.FEATURE_VALUE_TRANSFORM,
    CoordinationType.FEATURE_VALUE_TRANSFORM_COEFFICIENT,
    CoordinationType.GATING_FEATURE_SELECTION_X,
    CoordinationType.GATING_FEATURE_SELECTION_Y
  ],
  [ViewType.SPATIAL]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.OBS_LABELS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
    CoordinationType.SPATIAL_ZOOM,
    CoordinationType.SPATIAL_ROTATION,
    CoordinationType.SPATIAL_IMAGE_LAYER,
    CoordinationType.SPATIAL_SEGMENTATION_LAYER,
    CoordinationType.SPATIAL_POINT_LAYER,
    CoordinationType.SPATIAL_NEIGHBORHOOD_LAYER,
    CoordinationType.SPATIAL_TARGET_X,
    CoordinationType.SPATIAL_TARGET_Y,
    CoordinationType.SPATIAL_TARGET_Z,
    CoordinationType.SPATIAL_ROTATION_X,
    CoordinationType.SPATIAL_ROTATION_Y,
    CoordinationType.SPATIAL_ROTATION_Z,
    CoordinationType.SPATIAL_ROTATION_ORBIT,
    CoordinationType.SPATIAL_ORBIT_AXIS,
    CoordinationType.SPATIAL_AXIS_FIXED,
    CoordinationType.OBS_FILTER,
    CoordinationType.OBS_HIGHLIGHT,
    CoordinationType.OBS_SET_SELECTION,
    CoordinationType.OBS_SET_HIGHLIGHT,
    CoordinationType.OBS_SET_COLOR,
    CoordinationType.FEATURE_HIGHLIGHT,
    CoordinationType.FEATURE_SELECTION,
    CoordinationType.FEATURE_VALUE_COLORMAP,
    CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
    CoordinationType.OBS_COLOR_ENCODING,
    CoordinationType.ADDITIONAL_OBS_SETS,
    CoordinationType.MOLECULE_HIGHLIGHT,
    CoordinationType.TOOLTIPS_VISIBLE
  ],
  [ViewType.SPATIAL_BETA]: [
    CoordinationType.META_COORDINATION_SCOPES,
    CoordinationType.META_COORDINATION_SCOPES_BY,
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.OBS_LABELS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
    CoordinationType.SPATIAL_ZOOM,
    CoordinationType.SPATIAL_ROTATION,
    CoordinationType.SPATIAL_POINT_LAYER,
    CoordinationType.SPATIAL_NEIGHBORHOOD_LAYER,
    CoordinationType.SPATIAL_TARGET_X,
    CoordinationType.SPATIAL_TARGET_Y,
    CoordinationType.SPATIAL_TARGET_Z,
    CoordinationType.SPATIAL_TARGET_T,
    CoordinationType.SPATIAL_ROTATION_X,
    CoordinationType.SPATIAL_ROTATION_Y,
    CoordinationType.SPATIAL_ROTATION_Z,
    CoordinationType.SPATIAL_ROTATION_ORBIT,
    CoordinationType.SPATIAL_ORBIT_AXIS,
    CoordinationType.SPATIAL_AXIS_FIXED,
    CoordinationType.OBS_FILTER,
    CoordinationType.OBS_HIGHLIGHT,
    CoordinationType.OBS_SET_SELECTION,
    CoordinationType.OBS_SET_HIGHLIGHT,
    CoordinationType.OBS_SET_COLOR,
    CoordinationType.FEATURE_HIGHLIGHT,
    CoordinationType.FEATURE_SELECTION,
    CoordinationType.FEATURE_VALUE_COLORMAP,
    CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
    CoordinationType.OBS_COLOR_ENCODING,
    CoordinationType.ADDITIONAL_OBS_SETS,
    CoordinationType.MOLECULE_HIGHLIGHT,
    CoordinationType.TOOLTIPS_VISIBLE,
    CoordinationType.FILE_UID,
    CoordinationType.SPATIAL_TARGET_C,
    CoordinationType.SPATIAL_LAYER_VISIBLE,
    CoordinationType.SPATIAL_LAYER_OPACITY,
    CoordinationType.SPATIAL_LAYER_COLORMAP,
    CoordinationType.SPATIAL_LAYER_TRANSPARENT_COLOR,
    CoordinationType.SPATIAL_LAYER_MODEL_MATRIX,
    CoordinationType.SPATIAL_CHANNEL_COLOR,
    CoordinationType.SPATIAL_SEGMENTATION_FILLED,
    CoordinationType.SPATIAL_SEGMENTATION_STROKE_WIDTH,
    CoordinationType.IMAGE_LAYER,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.IMAGE_CHANNEL,
    CoordinationType.SEGMENTATION_CHANNEL,
    CoordinationType.SPATIAL_CHANNEL_VISIBLE,
    CoordinationType.SPATIAL_CHANNEL_OPACITY,
    CoordinationType.SPATIAL_CHANNEL_WINDOW,
    CoordinationType.SPATIAL_RENDERING_MODE,
    CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM,
    CoordinationType.SPATIAL_TARGET_RESOLUTION,
    CoordinationType.SPATIAL_SLICE_X,
    CoordinationType.SPATIAL_SLICE_Y,
    CoordinationType.SPATIAL_SLICE_Z,
    CoordinationType.SPOT_LAYER,
    CoordinationType.POINT_LAYER,
    CoordinationType.SPATIAL_SPOT_RADIUS,
    CoordinationType.SPATIAL_SPOT_FILLED,
    CoordinationType.SPATIAL_SPOT_STROKE_WIDTH,
    CoordinationType.SPATIAL_LAYER_COLOR,
    CoordinationType.PIXEL_HIGHLIGHT,
    CoordinationType.TOOLTIP_CROSSHAIRS_VISIBLE,
    CoordinationType.LEGEND_VISIBLE,
    CoordinationType.SPATIAL_CHANNEL_LABELS_VISIBLE,
    CoordinationType.SPATIAL_CHANNEL_LABELS_ORIENTATION,
    CoordinationType.SPATIAL_CHANNEL_LABEL_SIZE
  ],
  [ViewType.HEATMAP]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.OBS_LABELS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
    CoordinationType.HEATMAP_ZOOM_X,
    CoordinationType.HEATMAP_ZOOM_Y,
    CoordinationType.HEATMAP_TARGET_X,
    CoordinationType.HEATMAP_TARGET_Y,
    CoordinationType.OBS_FILTER,
    CoordinationType.OBS_HIGHLIGHT,
    CoordinationType.OBS_SET_SELECTION,
    CoordinationType.OBS_SET_HIGHLIGHT,
    CoordinationType.OBS_SET_COLOR,
    CoordinationType.FEATURE_FILTER,
    CoordinationType.FEATURE_HIGHLIGHT,
    CoordinationType.FEATURE_SELECTION,
    CoordinationType.FEATURE_VALUE_COLORMAP,
    CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
    CoordinationType.OBS_COLOR_ENCODING,
    CoordinationType.ADDITIONAL_OBS_SETS,
    CoordinationType.TOOLTIPS_VISIBLE
  ],
  [ViewType.OBS_SETS]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.OBS_SET_SELECTION,
    CoordinationType.OBS_SET_EXPANSION,
    CoordinationType.OBS_SET_HIGHLIGHT,
    CoordinationType.OBS_SET_COLOR,
    CoordinationType.OBS_COLOR_ENCODING,
    CoordinationType.ADDITIONAL_OBS_SETS,
    CoordinationType.FEATURE_SELECTION
  ],
  [ViewType.OBS_SET_SIZES]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.OBS_SET_SELECTION,
    CoordinationType.OBS_SET_EXPANSION,
    CoordinationType.OBS_SET_HIGHLIGHT,
    CoordinationType.OBS_SET_COLOR,
    CoordinationType.ADDITIONAL_OBS_SETS
  ],
  [ViewType.STATUS]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_HIGHLIGHT,
    CoordinationType.FEATURE_HIGHLIGHT,
    CoordinationType.OBS_SET_HIGHLIGHT,
    CoordinationType.MOLECULE_HIGHLIGHT
  ],
  [ViewType.FEATURE_LIST]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
    CoordinationType.FEATURE_FILTER,
    CoordinationType.FEATURE_HIGHLIGHT,
    CoordinationType.FEATURE_SELECTION,
    CoordinationType.OBS_COLOR_ENCODING,
    CoordinationType.OBS_SET_SELECTION
  ],
  [ViewType.OBS_SET_FEATURE_VALUE_DISTRIBUTION]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
    CoordinationType.FEATURE_SELECTION,
    CoordinationType.FEATURE_VALUE_TRANSFORM,
    CoordinationType.FEATURE_VALUE_TRANSFORM_COEFFICIENT,
    CoordinationType.OBS_SET_SELECTION,
    CoordinationType.OBS_SET_HIGHLIGHT,
    CoordinationType.OBS_SET_COLOR,
    CoordinationType.ADDITIONAL_OBS_SETS,
    CoordinationType.SAMPLE_TYPE,
    CoordinationType.SAMPLE_SET_SELECTION
  ],
  [ViewType.FEATURE_VALUE_HISTOGRAM]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
    CoordinationType.FEATURE_SELECTION,
    CoordinationType.ADDITIONAL_OBS_SETS,
    CoordinationType.OBS_SET_COLOR,
    CoordinationType.OBS_COLOR_ENCODING,
    CoordinationType.OBS_SET_SELECTION
  ],
  [ViewType.LAYER_CONTROLLER]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
    CoordinationType.SPATIAL_IMAGE_LAYER,
    CoordinationType.SPATIAL_SEGMENTATION_LAYER,
    CoordinationType.SPATIAL_POINT_LAYER,
    CoordinationType.SPATIAL_NEIGHBORHOOD_LAYER,
    CoordinationType.SPATIAL_ZOOM,
    CoordinationType.SPATIAL_TARGET_X,
    CoordinationType.SPATIAL_TARGET_Y,
    CoordinationType.SPATIAL_TARGET_Z,
    CoordinationType.SPATIAL_ROTATION_X,
    CoordinationType.SPATIAL_ROTATION_Y,
    CoordinationType.SPATIAL_ROTATION_Z,
    CoordinationType.SPATIAL_ROTATION_ORBIT,
    CoordinationType.SPATIAL_ORBIT_AXIS
  ],
  [ViewType.LAYER_CONTROLLER_BETA]: [
    CoordinationType.META_COORDINATION_SCOPES,
    CoordinationType.META_COORDINATION_SCOPES_BY,
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
    CoordinationType.SPATIAL_POINT_LAYER,
    CoordinationType.SPATIAL_NEIGHBORHOOD_LAYER,
    CoordinationType.SPATIAL_ZOOM,
    CoordinationType.SPATIAL_TARGET_X,
    CoordinationType.SPATIAL_TARGET_Y,
    CoordinationType.SPATIAL_TARGET_Z,
    CoordinationType.SPATIAL_TARGET_T,
    CoordinationType.SPATIAL_ROTATION_X,
    CoordinationType.SPATIAL_ROTATION_Y,
    CoordinationType.SPATIAL_ROTATION_Z,
    CoordinationType.SPATIAL_ROTATION_ORBIT,
    CoordinationType.SPATIAL_ORBIT_AXIS,
    CoordinationType.FILE_UID,
    CoordinationType.SPATIAL_TARGET_C,
    CoordinationType.SPATIAL_LAYER_VISIBLE,
    CoordinationType.SPATIAL_LAYER_OPACITY,
    CoordinationType.SPATIAL_LAYER_COLORMAP,
    CoordinationType.SPATIAL_LAYER_TRANSPARENT_COLOR,
    CoordinationType.SPATIAL_LAYER_MODEL_MATRIX,
    CoordinationType.SPATIAL_CHANNEL_COLOR,
    CoordinationType.SPATIAL_SEGMENTATION_FILLED,
    CoordinationType.SPATIAL_SEGMENTATION_STROKE_WIDTH,
    CoordinationType.IMAGE_CHANNEL,
    CoordinationType.IMAGE_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SPATIAL_CHANNEL_VISIBLE,
    CoordinationType.SPATIAL_CHANNEL_OPACITY,
    CoordinationType.SPATIAL_CHANNEL_WINDOW,
    CoordinationType.PHOTOMETRIC_INTERPRETATION,
    CoordinationType.SPATIAL_RENDERING_MODE,
    CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM,
    CoordinationType.SPATIAL_TARGET_RESOLUTION,
    CoordinationType.SPATIAL_SLICE_X,
    CoordinationType.SPATIAL_SLICE_Y,
    CoordinationType.SPATIAL_SLICE_Z,
    CoordinationType.SPOT_LAYER,
    CoordinationType.POINT_LAYER,
    CoordinationType.SPATIAL_SPOT_RADIUS,
    CoordinationType.SPATIAL_SPOT_FILLED,
    CoordinationType.SPATIAL_SPOT_STROKE_WIDTH,
    CoordinationType.SPATIAL_LAYER_COLOR,
    CoordinationType.OBS_COLOR_ENCODING,
    CoordinationType.FEATURE_VALUE_COLORMAP,
    CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
    CoordinationType.FEATURE_SELECTION,
    CoordinationType.TOOLTIPS_VISIBLE,
    CoordinationType.TOOLTIP_CROSSHAIRS_VISIBLE,
    CoordinationType.LEGEND_VISIBLE,
    CoordinationType.SPATIAL_CHANNEL_LABELS_VISIBLE,
    CoordinationType.SPATIAL_CHANNEL_LABELS_ORIENTATION,
    CoordinationType.SPATIAL_CHANNEL_LABEL_SIZE
  ],
  [ViewType.GENOMIC_PROFILES]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
    CoordinationType.GENOMIC_ZOOM_X,
    CoordinationType.GENOMIC_ZOOM_Y,
    CoordinationType.GENOMIC_TARGET_X,
    CoordinationType.GENOMIC_TARGET_Y,
    CoordinationType.FEATURE_FILTER,
    CoordinationType.FEATURE_HIGHLIGHT,
    CoordinationType.FEATURE_SELECTION,
    CoordinationType.OBS_SET_SELECTION,
    CoordinationType.OBS_SET_HIGHLIGHT,
    CoordinationType.OBS_SET_COLOR,
    CoordinationType.ADDITIONAL_OBS_SETS
  ],
  [ViewType.DESCRIPTION]: [
    CoordinationType.DATASET,
    CoordinationType.SPATIAL_IMAGE_LAYER
  ],
  higlass: [
    CoordinationType.DATASET,
    CoordinationType.GENOMIC_ZOOM_X,
    CoordinationType.GENOMIC_ZOOM_Y,
    CoordinationType.GENOMIC_TARGET_X,
    CoordinationType.GENOMIC_TARGET_Y,
    CoordinationType.FEATURE_FILTER,
    CoordinationType.FEATURE_HIGHLIGHT,
    CoordinationType.FEATURE_SELECTION
  ],
  [ViewType.FEATURE_BAR_PLOT]: [
    CoordinationType.DATASET,
    CoordinationType.OBS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
    CoordinationType.FEATURE_SELECTION,
    CoordinationType.FEATURE_VALUE_TRANSFORM,
    CoordinationType.FEATURE_VALUE_TRANSFORM_COEFFICIENT,
    CoordinationType.OBS_SET_SELECTION,
    CoordinationType.OBS_SET_HIGHLIGHT,
    CoordinationType.OBS_HIGHLIGHT,
    CoordinationType.OBS_SET_COLOR,
    CoordinationType.OBS_COLOR_ENCODING,
    CoordinationType.ADDITIONAL_OBS_SETS
  ]
};
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
const freeGlobal$1 = freeGlobal;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal$1 || freeSelf || Function("return this")();
const root$1 = root;
var Symbol$1 = root$1.Symbol;
const Symbol$2 = Symbol$1;
var objectProto$b = Object.prototype;
var hasOwnProperty$9 = objectProto$b.hasOwnProperty;
var nativeObjectToString$1 = objectProto$b.toString;
var symToStringTag$1 = Symbol$2 ? Symbol$2.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty$9.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var objectProto$a = Object.prototype;
var nativeObjectToString = objectProto$a.toString;
function objectToString(value) {
  return nativeObjectToString.call(value);
}
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$2 ? Symbol$2.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var symbolTag$1 = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag$1;
}
function arrayMap(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}
var isArray = Array.isArray;
const isArray$1 = isArray;
var INFINITY$2 = 1 / 0;
var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : void 0, symbolToString = symbolProto$1 ? symbolProto$1.toString : void 0;
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray$1(value)) {
    return arrayMap(value, baseToString) + "";
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY$2 ? "-0" : result;
}
function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
function identity(value) {
  return value;
}
var asyncTag = "[object AsyncFunction]", funcTag$1 = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  var tag = baseGetTag(value);
  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var coreJsData = root$1["__core-js_shared__"];
const coreJsData$1 = coreJsData;
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData$1 && coreJsData$1.keys && coreJsData$1.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var funcProto$1 = Function.prototype;
var funcToString$1 = funcProto$1.toString;
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
}
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto = Function.prototype, objectProto$9 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$8 = objectProto$9.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString.call(hasOwnProperty$8).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}
function getValue(object, key) {
  return object == null ? void 0 : object[key];
}
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : void 0;
}
var WeakMap$1 = getNative(root$1, "WeakMap");
const WeakMap$2 = WeakMap$1;
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}
function noop() {
}
var HOT_COUNT = 800, HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut(func) {
  var count = 0, lastCalled = 0;
  return function() {
    var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(void 0, arguments);
  };
}
function constant(value) {
  return function() {
    return value;
  };
}
var defineProperty$2 = function() {
  try {
    var func = getNative(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e) {
  }
}();
const defineProperty$3 = defineProperty$2;
var baseSetToString = !defineProperty$3 ? identity : function(func, string) {
  return defineProperty$3(func, "toString", {
    "configurable": true,
    "enumerable": false,
    "value": constant(string),
    "writable": true
  });
};
const baseSetToString$1 = baseSetToString;
var setToString = shortOut(baseSetToString$1);
const setToString$1 = setToString;
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
  while (fromRight ? index-- : ++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}
function baseIsNaN(value) {
  return value !== value;
}
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1, length = array.length;
  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}
function baseIndexOf(array, value, fromIndex) {
  return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
}
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}
var MAX_SAFE_INTEGER$1 = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
function eq(value, other) {
  return value === other || value !== value && other !== other;
}
var nativeMax = Math.max;
function overRest(func, start, transform2) {
  start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
  return function() {
    var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform2(array);
    return apply(func, this, otherArgs);
  };
}
function baseRest(func, start) {
  return setToString$1(overRest(func, start, identity), func + "");
}
var MAX_SAFE_INTEGER = 9007199254740991;
function isLength(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
    return eq(object[index], value);
  }
  return false;
}
var objectProto$8 = Object.prototype;
function isPrototype(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$8;
  return value === proto;
}
function baseTimes(n, iteratee) {
  var index = -1, result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}
var argsTag$2 = "[object Arguments]";
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag$2;
}
var objectProto$7 = Object.prototype;
var hasOwnProperty$7 = objectProto$7.hasOwnProperty;
var propertyIsEnumerable$1 = objectProto$7.propertyIsEnumerable;
var isArguments = baseIsArguments(function() {
  return arguments;
}()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$7.call(value, "callee") && !propertyIsEnumerable$1.call(value, "callee");
};
const isArguments$1 = isArguments;
function stubFalse() {
  return false;
}
var freeExports$1 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule$1 = freeExports$1 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
var Buffer = moduleExports$1 ? root$1.Buffer : void 0;
var nativeIsBuffer = Buffer ? Buffer.isBuffer : void 0;
var isBuffer = nativeIsBuffer || stubFalse;
const isBuffer$1 = isBuffer;
var argsTag$1 = "[object Arguments]", arrayTag$1 = "[object Array]", boolTag$1 = "[object Boolean]", dateTag$1 = "[object Date]", errorTag$1 = "[object Error]", funcTag = "[object Function]", mapTag$2 = "[object Map]", numberTag$1 = "[object Number]", objectTag$2 = "[object Object]", regexpTag$1 = "[object RegExp]", setTag$2 = "[object Set]", stringTag$1 = "[object String]", weakMapTag$1 = "[object WeakMap]";
var arrayBufferTag$1 = "[object ArrayBuffer]", dataViewTag$2 = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag] = typedArrayTags[mapTag$2] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] = typedArrayTags[setTag$2] = typedArrayTags[stringTag$1] = typedArrayTags[weakMapTag$1] = false;
function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}
var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var freeProcess = moduleExports && freeGlobal$1.process;
var nodeUtil = function() {
  try {
    var types = freeModule && freeModule.require && freeModule.require("util").types;
    if (types) {
      return types;
    }
    return freeProcess && freeProcess.binding && freeProcess.binding("util");
  } catch (e) {
  }
}();
const nodeUtil$1 = nodeUtil;
var nodeIsTypedArray = nodeUtil$1 && nodeUtil$1.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
const isTypedArray$1 = isTypedArray;
var objectProto$6 = Object.prototype;
var hasOwnProperty$6 = objectProto$6.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray$1(value), isArg = !isArr && isArguments$1(value), isBuff = !isArr && !isArg && isBuffer$1(value), isType = !isArr && !isArg && !isBuff && isTypedArray$1(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$6.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
    (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
    isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
function overArg(func, transform2) {
  return function(arg) {
    return func(transform2(arg));
  };
}
var nativeKeys = overArg(Object.keys, Object);
const nativeKeys$1 = nativeKeys;
var objectProto$5 = Object.prototype;
var hasOwnProperty$5 = objectProto$5.hasOwnProperty;
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys$1(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$5.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
function keys$1(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
function isKey(value, object) {
  if (isArray$1(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
var nativeCreate = getNative(Object, "create");
const nativeCreate$1 = nativeCreate;
function hashClear() {
  this.__data__ = nativeCreate$1 ? nativeCreate$1(null) : {};
  this.size = 0;
}
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
var objectProto$4 = Object.prototype;
var hasOwnProperty$4 = objectProto$4.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate$1) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? void 0 : result;
  }
  return hasOwnProperty$4.call(data, key) ? data[key] : void 0;
}
var objectProto$3 = Object.prototype;
var hasOwnProperty$3 = objectProto$3.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate$1 ? data[key] !== void 0 : hasOwnProperty$3.call(data, key);
}
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate$1 && value === void 0 ? HASH_UNDEFINED$1 : value;
  return this;
}
function Hash(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = hashClear;
Hash.prototype["delete"] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
  var data = this.__data__, index = assocIndexOf(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}
function listCacheGet(key) {
  var data = this.__data__, index = assocIndexOf(data, key);
  return index < 0 ? void 0 : data[index][1];
}
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}
function listCacheSet(key, value) {
  var data = this.__data__, index = assocIndexOf(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}
function ListCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = listCacheClear;
ListCache.prototype["delete"] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
var Map$1 = getNative(root$1, "Map");
const Map$2 = Map$1;
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash(),
    "map": new (Map$2 || ListCache)(),
    "string": new Hash()
  };
}
function isKeyable(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
function mapCacheDelete(key) {
  var result = getMapData(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}
function mapCacheSet(key, value) {
  var data = getMapData(this, key), size2 = data.size;
  data.set(key, value);
  this.size += data.size == size2 ? 0 : 1;
  return this;
}
function MapCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype["delete"] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
var FUNC_ERROR_TEXT = "Expected a function";
function memoize$1(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache2 = memoized.cache;
    if (cache2.has(key)) {
      return cache2.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache2.set(key, result) || cache2;
    return result;
  };
  memoized.cache = new (memoize$1.Cache || MapCache)();
  return memoized;
}
memoize$1.Cache = MapCache;
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(func) {
  var result = memoize$1(func, function(key) {
    if (cache2.size === MAX_MEMOIZE_SIZE) {
      cache2.clear();
    }
    return key;
  });
  var cache2 = result.cache;
  return result;
}
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46) {
    result.push("");
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
  });
  return result;
});
const stringToPath$1 = stringToPath;
function toString(value) {
  return value == null ? "" : baseToString(value);
}
function castPath(value, object) {
  if (isArray$1(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath$1(toString(value));
}
var INFINITY$1 = 1 / 0;
function toKey(value) {
  if (typeof value == "string" || isSymbol(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -INFINITY$1 ? "-0" : result;
}
function baseGet(object, path) {
  path = castPath(path, object);
  var index = 0, length = path.length;
  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return index && index == length ? object : void 0;
}
function get(object, path, defaultValue) {
  var result = object == null ? void 0 : baseGet(object, path);
  return result === void 0 ? defaultValue : result;
}
function arrayPush(array, values2) {
  var index = -1, length = values2.length, offset = array.length;
  while (++index < length) {
    array[offset + index] = values2[index];
  }
  return array;
}
var spreadableSymbol = Symbol$2 ? Symbol$2.isConcatSpreadable : void 0;
function isFlattenable(value) {
  return isArray$1(value) || isArguments$1(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1, length = array.length;
  predicate || (predicate = isFlattenable);
  result || (result = []);
  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}
function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}
function stackDelete(key) {
  var data = this.__data__, result = data["delete"](key);
  this.size = data.size;
  return result;
}
function stackGet(key) {
  return this.__data__.get(key);
}
function stackHas(key) {
  return this.__data__.has(key);
}
var LARGE_ARRAY_SIZE$2 = 200;
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map$2 || pairs.length < LARGE_ARRAY_SIZE$2 - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
Stack.prototype.clear = stackClear;
Stack.prototype["delete"] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
function arrayFilter(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
function stubArray() {
  return [];
}
var objectProto$2 = Object.prototype;
var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};
const getSymbols$1 = getSymbols;
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray$1(object) ? result : arrayPush(result, symbolsFunc(object));
}
function getAllKeys(object) {
  return baseGetAllKeys(object, keys$1, getSymbols$1);
}
var DataView = getNative(root$1, "DataView");
const DataView$1 = DataView;
var Promise$1 = getNative(root$1, "Promise");
const Promise$2 = Promise$1;
var Set = getNative(root$1, "Set");
const Set$1 = Set;
var mapTag$1 = "[object Map]", objectTag$1 = "[object Object]", promiseTag = "[object Promise]", setTag$1 = "[object Set]", weakMapTag = "[object WeakMap]";
var dataViewTag$1 = "[object DataView]";
var dataViewCtorString = toSource(DataView$1), mapCtorString = toSource(Map$2), promiseCtorString = toSource(Promise$2), setCtorString = toSource(Set$1), weakMapCtorString = toSource(WeakMap$2);
var getTag = baseGetTag;
if (DataView$1 && getTag(new DataView$1(new ArrayBuffer(1))) != dataViewTag$1 || Map$2 && getTag(new Map$2()) != mapTag$1 || Promise$2 && getTag(Promise$2.resolve()) != promiseTag || Set$1 && getTag(new Set$1()) != setTag$1 || WeakMap$2 && getTag(new WeakMap$2()) != weakMapTag) {
  getTag = function(value) {
    var result = baseGetTag(value), Ctor = result == objectTag$1 ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag$1;
        case mapCtorString:
          return mapTag$1;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag$1;
        case weakMapCtorString:
          return weakMapTag;
      }
    }
    return result;
  };
}
const getTag$1 = getTag;
var Uint8Array$1 = root$1.Uint8Array;
const Uint8Array$2 = Uint8Array$1;
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}
function setCacheHas(value) {
  return this.__data__.has(value);
}
function SetCache(values2) {
  var index = -1, length = values2 == null ? 0 : values2.length;
  this.__data__ = new MapCache();
  while (++index < length) {
    this.add(values2[index]);
  }
}
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;
function arraySome(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}
function cacheHas(cache2, key) {
  return cache2.has(key);
}
var COMPARE_PARTIAL_FLAG$5 = 1, COMPARE_UNORDERED_FLAG$3 = 2;
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$5, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG$3 ? new SetCache() : void 0;
  stack.set(array, other);
  stack.set(other, array);
  while (++index < arrLength) {
    var arrValue = array[index], othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== void 0) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!arraySome(other, function(othValue2, othIndex) {
        if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }
  stack["delete"](array);
  stack["delete"](other);
  return result;
}
function mapToArray(map) {
  var index = -1, result = Array(map.size);
  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}
function setToArray(set2) {
  var index = -1, result = Array(set2.size);
  set2.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}
var COMPARE_PARTIAL_FLAG$4 = 1, COMPARE_UNORDERED_FLAG$2 = 2;
var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]";
var symbolProto = Symbol$2 ? Symbol$2.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array$2(object), new Uint8Array$2(other))) {
        return false;
      }
      return true;
    case boolTag:
    case dateTag:
    case numberTag:
      return eq(+object, +other);
    case errorTag:
      return object.name == other.name && object.message == other.message;
    case regexpTag:
    case stringTag:
      return object == other + "";
    case mapTag:
      var convert = mapToArray;
    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4;
      convert || (convert = setToArray);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$2;
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack["delete"](object);
      return result;
    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}
var COMPARE_PARTIAL_FLAG$3 = 1;
var objectProto$1 = Object.prototype;
var hasOwnProperty$2 = objectProto$1.hasOwnProperty;
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$2.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    }
    if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack["delete"](object);
  stack["delete"](other);
  return result;
}
var COMPARE_PARTIAL_FLAG$2 = 1;
var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
var objectProto = Object.prototype;
var hasOwnProperty$1 = objectProto.hasOwnProperty;
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray$1(object), othIsArr = isArray$1(other), objTag = objIsArr ? arrayTag : getTag$1(object), othTag = othIsArr ? arrayTag : getTag$1(other);
  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;
  var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer$1(object)) {
    if (!isBuffer$1(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack());
    return objIsArr || isTypedArray$1(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG$2)) {
    var objIsWrapped = objIsObj && hasOwnProperty$1.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty$1.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack());
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}
var COMPARE_PARTIAL_FLAG$1 = 1, COMPARE_UNORDERED_FLAG$1 = 2;
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length, length = index, noCustomizer = !customizer;
  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0], objValue = object[key], srcValue = data[1];
    if (noCustomizer && data[2]) {
      if (objValue === void 0 && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack();
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === void 0 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, customizer, stack) : result)) {
        return false;
      }
    }
  }
  return true;
}
function isStrictComparable(value) {
  return value === value && !isObject(value);
}
function getMatchData(object) {
  var result = keys$1(object), length = result.length;
  while (length--) {
    var key = result[length], value = object[key];
    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
  };
}
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}
function hasPath(object, path, hasFunc) {
  path = castPath(path, object);
  var index = -1, length = path.length, result = false;
  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) && (isArray$1(object) || isArguments$1(object));
}
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}
var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return objValue === void 0 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}
function baseProperty(key) {
  return function(object) {
    return object == null ? void 0 : object[key];
  };
}
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}
function baseIteratee(value) {
  if (typeof value == "function") {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == "object") {
    return isArray$1(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
  }
  return property(value);
}
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}
var baseFor = createBaseFor();
const baseFor$1 = baseFor;
function baseForOwn(object, iteratee) {
  return object && baseFor$1(object, iteratee, keys$1);
}
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
    while (fromRight ? index-- : ++index < length) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}
var baseEach = createBaseEach(baseForOwn);
const baseEach$1 = baseEach;
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}
function arrayIncludesWith(array, value, comparator) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}
var LARGE_ARRAY_SIZE$1 = 200;
function baseDifference(array, values2, iteratee, comparator) {
  var index = -1, includes = arrayIncludes, isCommon = true, length = array.length, result = [], valuesLength = values2.length;
  if (!length) {
    return result;
  }
  if (iteratee) {
    values2 = arrayMap(values2, baseUnary(iteratee));
  }
  if (comparator) {
    includes = arrayIncludesWith;
    isCommon = false;
  } else if (values2.length >= LARGE_ARRAY_SIZE$1) {
    includes = cacheHas;
    isCommon = false;
    values2 = new SetCache(values2);
  }
  outer:
    while (++index < length) {
      var value = array[index], computed = iteratee == null ? value : iteratee(value);
      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var valuesIndex = valuesLength;
        while (valuesIndex--) {
          if (values2[valuesIndex] === computed) {
            continue outer;
          }
        }
        result.push(value);
      } else if (!includes(values2, computed, comparator)) {
        result.push(value);
      }
    }
  return result;
}
var difference = baseRest(function(array, values2) {
  return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true)) : [];
});
const difference$1 = difference;
function arrayEvery(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (!predicate(array[index], index, array)) {
      return false;
    }
  }
  return true;
}
function baseEvery(collection, predicate) {
  var result = true;
  baseEach$1(collection, function(value, index, collection2) {
    result = !!predicate(value, index, collection2);
    return result;
  });
  return result;
}
function every(collection, predicate, guard) {
  var func = isArray$1(collection) ? arrayEvery : baseEvery;
  if (guard && isIterateeCall(collection, predicate, guard)) {
    predicate = void 0;
  }
  return func(collection, baseIteratee(predicate));
}
function isEqual(value, other) {
  return baseIsEqual(value, other);
}
var INFINITY = 1 / 0;
var createSet = !(Set$1 && 1 / setToArray(new Set$1([, -0]))[1] == INFINITY) ? noop : function(values2) {
  return new Set$1(values2);
};
const createSet$1 = createSet;
var LARGE_ARRAY_SIZE = 200;
function baseUniq(array, iteratee, comparator) {
  var index = -1, includes = arrayIncludes, length = array.length, isCommon = true, result = [], seen = result;
  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  } else if (length >= LARGE_ARRAY_SIZE) {
    var set2 = iteratee ? null : createSet$1(array);
    if (set2) {
      return setToArray(set2);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache();
  } else {
    seen = iteratee ? [] : result;
  }
  outer:
    while (++index < length) {
      var value = array[index], computed = iteratee ? iteratee(value) : value;
      value = comparator || value !== 0 ? value : 0;
      if (isCommon && computed === computed) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer;
          }
        }
        if (iteratee) {
          seen.push(computed);
        }
        result.push(value);
      } else if (!includes(seen, computed, comparator)) {
        if (seen !== result) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
  return result;
}
var union = baseRest(function(arrays) {
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
});
const union$1 = union;
var common = {
  black: "#000",
  white: "#fff"
};
const common$1 = common;
var red = {
  50: "#ffebee",
  100: "#ffcdd2",
  200: "#ef9a9a",
  300: "#e57373",
  400: "#ef5350",
  500: "#f44336",
  600: "#e53935",
  700: "#d32f2f",
  800: "#c62828",
  900: "#b71c1c",
  A100: "#ff8a80",
  A200: "#ff5252",
  A400: "#ff1744",
  A700: "#d50000"
};
const red$1 = red;
var pink = {
  50: "#fce4ec",
  100: "#f8bbd0",
  200: "#f48fb1",
  300: "#f06292",
  400: "#ec407a",
  500: "#e91e63",
  600: "#d81b60",
  700: "#c2185b",
  800: "#ad1457",
  900: "#880e4f",
  A100: "#ff80ab",
  A200: "#ff4081",
  A400: "#f50057",
  A700: "#c51162"
};
const pink$1 = pink;
var indigo = {
  50: "#e8eaf6",
  100: "#c5cae9",
  200: "#9fa8da",
  300: "#7986cb",
  400: "#5c6bc0",
  500: "#3f51b5",
  600: "#3949ab",
  700: "#303f9f",
  800: "#283593",
  900: "#1a237e",
  A100: "#8c9eff",
  A200: "#536dfe",
  A400: "#3d5afe",
  A700: "#304ffe"
};
const indigo$1 = indigo;
var blue = {
  50: "#e3f2fd",
  100: "#bbdefb",
  200: "#90caf9",
  300: "#64b5f6",
  400: "#42a5f5",
  500: "#2196f3",
  600: "#1e88e5",
  700: "#1976d2",
  800: "#1565c0",
  900: "#0d47a1",
  A100: "#82b1ff",
  A200: "#448aff",
  A400: "#2979ff",
  A700: "#2962ff"
};
const blue$1 = blue;
var green = {
  50: "#e8f5e9",
  100: "#c8e6c9",
  200: "#a5d6a7",
  300: "#81c784",
  400: "#66bb6a",
  500: "#4caf50",
  600: "#43a047",
  700: "#388e3c",
  800: "#2e7d32",
  900: "#1b5e20",
  A100: "#b9f6ca",
  A200: "#69f0ae",
  A400: "#00e676",
  A700: "#00c853"
};
const green$1 = green;
var orange = {
  50: "#fff3e0",
  100: "#ffe0b2",
  200: "#ffcc80",
  300: "#ffb74d",
  400: "#ffa726",
  500: "#ff9800",
  600: "#fb8c00",
  700: "#f57c00",
  800: "#ef6c00",
  900: "#e65100",
  A100: "#ffd180",
  A200: "#ffab40",
  A400: "#ff9100",
  A700: "#ff6d00"
};
const orange$1 = orange;
var grey = {
  50: "#fafafa",
  100: "#f5f5f5",
  200: "#eeeeee",
  300: "#e0e0e0",
  400: "#bdbdbd",
  500: "#9e9e9e",
  600: "#757575",
  700: "#616161",
  800: "#424242",
  900: "#212121",
  A100: "#d5d5d5",
  A200: "#aaaaaa",
  A400: "#303030",
  A700: "#616161"
};
const grey$1 = grey;
function chainPropTypes(propType1, propType2) {
  return function validate() {
    return propType1.apply(void 0, arguments) || propType2.apply(void 0, arguments);
  };
}
function _extends$1() {
  return _extends$1 = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r2 in t)
        ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
    }
    return n;
  }, _extends$1.apply(null, arguments);
}
function _typeof$2(o) {
  "@babel/helpers - typeof";
  return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof$2(o);
}
function isPlainObject(item) {
  return item && _typeof$2(item) === "object" && item.constructor === Object;
}
function deepmerge(target, source) {
  var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
    clone: true
  };
  var output = options.clone ? _extends$1({}, target) : target;
  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach(function(key) {
      if (key === "__proto__") {
        return;
      }
      if (isPlainObject(source[key]) && key in target) {
        output[key] = deepmerge(target[key], source[key], options);
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}
var propTypes = { exports: {} };
var reactIs$2 = { exports: {} };
var reactIs_development$1 = {};
/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
{
  (function() {
    var hasSymbol2 = typeof Symbol === "function" && Symbol.for;
    var REACT_ELEMENT_TYPE = hasSymbol2 ? Symbol.for("react.element") : 60103;
    var REACT_PORTAL_TYPE = hasSymbol2 ? Symbol.for("react.portal") : 60106;
    var REACT_FRAGMENT_TYPE = hasSymbol2 ? Symbol.for("react.fragment") : 60107;
    var REACT_STRICT_MODE_TYPE = hasSymbol2 ? Symbol.for("react.strict_mode") : 60108;
    var REACT_PROFILER_TYPE = hasSymbol2 ? Symbol.for("react.profiler") : 60114;
    var REACT_PROVIDER_TYPE = hasSymbol2 ? Symbol.for("react.provider") : 60109;
    var REACT_CONTEXT_TYPE = hasSymbol2 ? Symbol.for("react.context") : 60110;
    var REACT_ASYNC_MODE_TYPE = hasSymbol2 ? Symbol.for("react.async_mode") : 60111;
    var REACT_CONCURRENT_MODE_TYPE = hasSymbol2 ? Symbol.for("react.concurrent_mode") : 60111;
    var REACT_FORWARD_REF_TYPE = hasSymbol2 ? Symbol.for("react.forward_ref") : 60112;
    var REACT_SUSPENSE_TYPE = hasSymbol2 ? Symbol.for("react.suspense") : 60113;
    var REACT_SUSPENSE_LIST_TYPE = hasSymbol2 ? Symbol.for("react.suspense_list") : 60120;
    var REACT_MEMO_TYPE = hasSymbol2 ? Symbol.for("react.memo") : 60115;
    var REACT_LAZY_TYPE = hasSymbol2 ? Symbol.for("react.lazy") : 60116;
    var REACT_BLOCK_TYPE = hasSymbol2 ? Symbol.for("react.block") : 60121;
    var REACT_FUNDAMENTAL_TYPE = hasSymbol2 ? Symbol.for("react.fundamental") : 60117;
    var REACT_RESPONDER_TYPE = hasSymbol2 ? Symbol.for("react.responder") : 60118;
    var REACT_SCOPE_TYPE = hasSymbol2 ? Symbol.for("react.scope") : 60119;
    function isValidElementType(type) {
      return typeof type === "string" || typeof type === "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === "object" && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
    }
    function typeOf(object) {
      if (typeof object === "object" && object !== null) {
        var $$typeof = object.$$typeof;
        switch ($$typeof) {
          case REACT_ELEMENT_TYPE:
            var type = object.type;
            switch (type) {
              case REACT_ASYNC_MODE_TYPE:
              case REACT_CONCURRENT_MODE_TYPE:
              case REACT_FRAGMENT_TYPE:
              case REACT_PROFILER_TYPE:
              case REACT_STRICT_MODE_TYPE:
              case REACT_SUSPENSE_TYPE:
                return type;
              default:
                var $$typeofType = type && type.$$typeof;
                switch ($$typeofType) {
                  case REACT_CONTEXT_TYPE:
                  case REACT_FORWARD_REF_TYPE:
                  case REACT_LAZY_TYPE:
                  case REACT_MEMO_TYPE:
                  case REACT_PROVIDER_TYPE:
                    return $$typeofType;
                  default:
                    return $$typeof;
                }
            }
          case REACT_PORTAL_TYPE:
            return $$typeof;
        }
      }
      return void 0;
    }
    var AsyncMode = REACT_ASYNC_MODE_TYPE;
    var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
    var ContextConsumer = REACT_CONTEXT_TYPE;
    var ContextProvider = REACT_PROVIDER_TYPE;
    var Element = REACT_ELEMENT_TYPE;
    var ForwardRef = REACT_FORWARD_REF_TYPE;
    var Fragment = REACT_FRAGMENT_TYPE;
    var Lazy = REACT_LAZY_TYPE;
    var Memo = REACT_MEMO_TYPE;
    var Portal = REACT_PORTAL_TYPE;
    var Profiler = REACT_PROFILER_TYPE;
    var StrictMode = REACT_STRICT_MODE_TYPE;
    var Suspense = REACT_SUSPENSE_TYPE;
    var hasWarnedAboutDeprecatedIsAsyncMode = false;
    function isAsyncMode(object) {
      {
        if (!hasWarnedAboutDeprecatedIsAsyncMode) {
          hasWarnedAboutDeprecatedIsAsyncMode = true;
          console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.");
        }
      }
      return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
    }
    function isConcurrentMode(object) {
      return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
    }
    function isContextConsumer(object) {
      return typeOf(object) === REACT_CONTEXT_TYPE;
    }
    function isContextProvider(object) {
      return typeOf(object) === REACT_PROVIDER_TYPE;
    }
    function isElement(object) {
      return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function isForwardRef(object) {
      return typeOf(object) === REACT_FORWARD_REF_TYPE;
    }
    function isFragment(object) {
      return typeOf(object) === REACT_FRAGMENT_TYPE;
    }
    function isLazy(object) {
      return typeOf(object) === REACT_LAZY_TYPE;
    }
    function isMemo(object) {
      return typeOf(object) === REACT_MEMO_TYPE;
    }
    function isPortal(object) {
      return typeOf(object) === REACT_PORTAL_TYPE;
    }
    function isProfiler(object) {
      return typeOf(object) === REACT_PROFILER_TYPE;
    }
    function isStrictMode(object) {
      return typeOf(object) === REACT_STRICT_MODE_TYPE;
    }
    function isSuspense(object) {
      return typeOf(object) === REACT_SUSPENSE_TYPE;
    }
    reactIs_development$1.AsyncMode = AsyncMode;
    reactIs_development$1.ConcurrentMode = ConcurrentMode;
    reactIs_development$1.ContextConsumer = ContextConsumer;
    reactIs_development$1.ContextProvider = ContextProvider;
    reactIs_development$1.Element = Element;
    reactIs_development$1.ForwardRef = ForwardRef;
    reactIs_development$1.Fragment = Fragment;
    reactIs_development$1.Lazy = Lazy;
    reactIs_development$1.Memo = Memo;
    reactIs_development$1.Portal = Portal;
    reactIs_development$1.Profiler = Profiler;
    reactIs_development$1.StrictMode = StrictMode;
    reactIs_development$1.Suspense = Suspense;
    reactIs_development$1.isAsyncMode = isAsyncMode;
    reactIs_development$1.isConcurrentMode = isConcurrentMode;
    reactIs_development$1.isContextConsumer = isContextConsumer;
    reactIs_development$1.isContextProvider = isContextProvider;
    reactIs_development$1.isElement = isElement;
    reactIs_development$1.isForwardRef = isForwardRef;
    reactIs_development$1.isFragment = isFragment;
    reactIs_development$1.isLazy = isLazy;
    reactIs_development$1.isMemo = isMemo;
    reactIs_development$1.isPortal = isPortal;
    reactIs_development$1.isProfiler = isProfiler;
    reactIs_development$1.isStrictMode = isStrictMode;
    reactIs_development$1.isSuspense = isSuspense;
    reactIs_development$1.isValidElementType = isValidElementType;
    reactIs_development$1.typeOf = typeOf;
  })();
}
{
  reactIs$2.exports = reactIs_development$1;
}
var reactIsExports$1 = reactIs$2.exports;
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var getOwnPropertySymbols$1 = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
function toObject(val) {
  if (val === null || val === void 0) {
    throw new TypeError("Object.assign cannot be called with null or undefined");
  }
  return Object(val);
}
function shouldUseNative() {
  try {
    if (!Object.assign) {
      return false;
    }
    var test1 = new String("abc");
    test1[5] = "de";
    if (Object.getOwnPropertyNames(test1)[0] === "5") {
      return false;
    }
    var test2 = {};
    for (var i = 0; i < 10; i++) {
      test2["_" + String.fromCharCode(i)] = i;
    }
    var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
      return test2[n];
    });
    if (order2.join("") !== "0123456789") {
      return false;
    }
    var test3 = {};
    "abcdefghijklmnopqrst".split("").forEach(function(letter) {
      test3[letter] = letter;
    });
    if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
var objectAssign = shouldUseNative() ? Object.assign : function(target, source) {
  var from;
  var to = toObject(target);
  var symbols;
  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);
    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
    if (getOwnPropertySymbols$1) {
      symbols = getOwnPropertySymbols$1(from);
      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }
  return to;
};
var ReactPropTypesSecret$2 = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
var ReactPropTypesSecret_1 = ReactPropTypesSecret$2;
var has$2 = Function.call.bind(Object.prototype.hasOwnProperty);
var printWarning$1 = function() {
};
{
  var ReactPropTypesSecret$1 = ReactPropTypesSecret_1;
  var loggedTypeFailures = {};
  var has$1 = has$2;
  printWarning$1 = function(text) {
    var message = "Warning: " + text;
    if (typeof console !== "undefined") {
      console.error(message);
    }
    try {
      throw new Error(message);
    } catch (x) {
    }
  };
}
function checkPropTypes$1(typeSpecs, values2, location, componentName, getStack) {
  {
    for (var typeSpecName in typeSpecs) {
      if (has$1(typeSpecs, typeSpecName)) {
        var error;
        try {
          if (typeof typeSpecs[typeSpecName] !== "function") {
            var err = Error(
              (componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
            );
            err.name = "Invariant Violation";
            throw err;
          }
          error = typeSpecs[typeSpecName](values2, typeSpecName, componentName, location, null, ReactPropTypesSecret$1);
        } catch (ex) {
          error = ex;
        }
        if (error && !(error instanceof Error)) {
          printWarning$1(
            (componentName || "React class") + ": type specification of " + location + " `" + typeSpecName + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof error + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
          );
        }
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          loggedTypeFailures[error.message] = true;
          var stack = getStack ? getStack() : "";
          printWarning$1(
            "Failed " + location + " type: " + error.message + (stack != null ? stack : "")
          );
        }
      }
    }
  }
}
checkPropTypes$1.resetWarningCache = function() {
  {
    loggedTypeFailures = {};
  }
};
var checkPropTypes_1 = checkPropTypes$1;
var ReactIs$1 = reactIsExports$1;
var assign = objectAssign;
var ReactPropTypesSecret = ReactPropTypesSecret_1;
var has = has$2;
var checkPropTypes = checkPropTypes_1;
var printWarning = function() {
};
{
  printWarning = function(text) {
    var message = "Warning: " + text;
    if (typeof console !== "undefined") {
      console.error(message);
    }
    try {
      throw new Error(message);
    } catch (x) {
    }
  };
}
function emptyFunctionThatReturnsNull() {
  return null;
}
var factoryWithTypeCheckers = function(isValidElement2, throwOnDirectAccess) {
  var ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = "@@iterator";
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === "function") {
      return iteratorFn;
    }
  }
  var ANONYMOUS = "<<anonymous>>";
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker("array"),
    bigint: createPrimitiveTypeChecker("bigint"),
    bool: createPrimitiveTypeChecker("boolean"),
    func: createPrimitiveTypeChecker("function"),
    number: createPrimitiveTypeChecker("number"),
    object: createPrimitiveTypeChecker("object"),
    string: createPrimitiveTypeChecker("string"),
    symbol: createPrimitiveTypeChecker("symbol"),
    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    elementType: createElementTypeTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker,
    exact: createStrictShapeTypeChecker
  };
  function is(x, y) {
    if (x === y) {
      return x !== 0 || 1 / x === 1 / y;
    } else {
      return x !== x && y !== y;
    }
  }
  function PropTypeError(message, data) {
    this.message = message;
    this.data = data && typeof data === "object" ? data : {};
    this.stack = "";
  }
  PropTypeError.prototype = Error.prototype;
  function createChainableTypeChecker(validate) {
    {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;
      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          var err = new Error(
            "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
          );
          err.name = "Invariant Violation";
          throw err;
        } else if (typeof console !== "undefined") {
          var cacheKey = componentName + ":" + propName;
          if (!manualPropTypeCallCache[cacheKey] && // Avoid spamming the console because they are often not actionable except for lib authors
          manualPropTypeWarningCount < 3) {
            printWarning(
              "You are manually calling a React.PropTypes validation function for the `" + propFullName + "` prop on `" + componentName + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required " + ("in `" + componentName + "`, but its value is `null`."));
          }
          return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required in " + ("`" + componentName + "`, but its value is `undefined`."));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }
    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);
    return chainedCheckType;
  }
  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        var preciseType = getPreciseType(propValue);
        return new PropTypeError(
          "Invalid " + location + " `" + propFullName + "` of type " + ("`" + preciseType + "` supplied to `" + componentName + "`, expected ") + ("`" + expectedType + "`."),
          { expectedType }
        );
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunctionThatReturnsNull);
  }
  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== "function") {
        return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside arrayOf.");
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an array."));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + "[" + i + "]", ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement2(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement."));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createElementTypeTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!ReactIs$1.isValidElementType(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement type."));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + actualClassName + "` supplied to `" + componentName + "`, expected ") + ("instance of `" + expectedClassName + "`."));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      {
        if (arguments.length > 1) {
          printWarning(
            "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
          );
        } else {
          printWarning("Invalid argument supplied to oneOf, expected an array.");
        }
      }
      return emptyFunctionThatReturnsNull;
    }
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }
      var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
        var type = getPreciseType(value);
        if (type === "symbol") {
          return String(value);
        }
        return value;
      });
      return new PropTypeError("Invalid " + location + " `" + propFullName + "` of value `" + String(propValue) + "` " + ("supplied to `" + componentName + "`, expected one of " + valuesString + "."));
    }
    return createChainableTypeChecker(validate);
  }
  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== "function") {
        return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside objectOf.");
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== "object") {
        return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an object."));
      }
      for (var key in propValue) {
        if (has(propValue, key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      printWarning("Invalid argument supplied to oneOfType, expected an instance of array.");
      return emptyFunctionThatReturnsNull;
    }
    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== "function") {
        printWarning(
          "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + getPostfixForTypeWarning(checker) + " at index " + i + "."
        );
        return emptyFunctionThatReturnsNull;
      }
    }
    function validate(props, propName, componentName, location, propFullName) {
      var expectedTypes = [];
      for (var i2 = 0; i2 < arrayOfTypeCheckers.length; i2++) {
        var checker2 = arrayOfTypeCheckers[i2];
        var checkerResult = checker2(props, propName, componentName, location, propFullName, ReactPropTypesSecret);
        if (checkerResult == null) {
          return null;
        }
        if (checkerResult.data && has(checkerResult.data, "expectedType")) {
          expectedTypes.push(checkerResult.data.expectedType);
        }
      }
      var expectedTypesMessage = expectedTypes.length > 0 ? ", expected one of type [" + expectedTypes.join(", ") + "]" : "";
      return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`" + expectedTypesMessage + "."));
    }
    return createChainableTypeChecker(validate);
  }
  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`, expected a ReactNode."));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function invalidValidatorError(componentName, location, propFullName, key, type) {
    return new PropTypeError(
      (componentName || "React class") + ": " + location + " type `" + propFullName + "." + key + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + type + "`."
    );
  }
  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== "object") {
        return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (typeof checker !== "function") {
          return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
        }
        var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function createStrictShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== "object") {
        return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
      }
      var allKeys = assign({}, props[propName], shapeTypes);
      for (var key in allKeys) {
        var checker = shapeTypes[key];
        if (has(shapeTypes, key) && typeof checker !== "function") {
          return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
        }
        if (!checker) {
          return new PropTypeError(
            "Invalid " + location + " `" + propFullName + "` key `" + key + "` supplied to `" + componentName + "`.\nBad object: " + JSON.stringify(props[propName], null, "  ") + "\nValid keys: " + JSON.stringify(Object.keys(shapeTypes), null, "  ")
          );
        }
        var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }
  function isNode(propValue) {
    switch (typeof propValue) {
      case "number":
      case "string":
      case "undefined":
        return true;
      case "boolean":
        return !propValue;
      case "object":
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement2(propValue)) {
          return true;
        }
        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }
        return true;
      default:
        return false;
    }
  }
  function isSymbol2(propType, propValue) {
    if (propType === "symbol") {
      return true;
    }
    if (!propValue) {
      return false;
    }
    if (propValue["@@toStringTag"] === "Symbol") {
      return true;
    }
    if (typeof Symbol === "function" && propValue instanceof Symbol) {
      return true;
    }
    return false;
  }
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return "array";
    }
    if (propValue instanceof RegExp) {
      return "object";
    }
    if (isSymbol2(propType, propValue)) {
      return "symbol";
    }
    return propType;
  }
  function getPreciseType(propValue) {
    if (typeof propValue === "undefined" || propValue === null) {
      return "" + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === "object") {
      if (propValue instanceof Date) {
        return "date";
      } else if (propValue instanceof RegExp) {
        return "regexp";
      }
    }
    return propType;
  }
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case "array":
      case "object":
        return "an " + type;
      case "boolean":
      case "date":
      case "regexp":
        return "a " + type;
      default:
        return type;
    }
  }
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }
  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
  ReactPropTypes.PropTypes = ReactPropTypes;
  return ReactPropTypes;
};
{
  var ReactIs = reactIsExports$1;
  var throwOnDirectAccess = true;
  propTypes.exports = factoryWithTypeCheckers(ReactIs.isElement, throwOnDirectAccess);
}
var propTypesExports = propTypes.exports;
const PropTypes = /* @__PURE__ */ getDefaultExportFromCjs(propTypesExports);
function isClassComponent(elementType) {
  var _elementType$prototyp = elementType.prototype, prototype = _elementType$prototyp === void 0 ? {} : _elementType$prototyp;
  return Boolean(prototype.isReactComponent);
}
function elementTypeAcceptingRef(props, propName, componentName, location, propFullName) {
  var propValue = props[propName];
  var safePropName = propFullName || propName;
  if (propValue == null) {
    return null;
  }
  var warningHint;
  if (typeof propValue === "function" && !isClassComponent(propValue)) {
    warningHint = "Did you accidentally provide a plain function component instead?";
  }
  if (warningHint !== void 0) {
    return new Error("Invalid ".concat(location, " `").concat(safePropName, "` supplied to `").concat(componentName, "`. ") + "Expected an element type that can hold a ref. ".concat(warningHint, " ") + "For more information see https://mui.com/r/caveat-with-refs-guide");
  }
  return null;
}
const elementTypeAcceptingRef$1 = chainPropTypes(propTypesExports.elementType, elementTypeAcceptingRef);
function toPrimitive$1(t, r2) {
  if ("object" != _typeof$2(t) || !t)
    return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r2 || "default");
    if ("object" != _typeof$2(i))
      return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r2 ? String : Number)(t);
}
function toPropertyKey$1(t) {
  var i = toPrimitive$1(t, "string");
  return "symbol" == _typeof$2(i) ? i : i + "";
}
function _defineProperty(e, r2, t) {
  return (r2 = toPropertyKey$1(r2)) in e ? Object.defineProperty(e, r2, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r2] = t, e;
}
var specialProperty = "exact-prop: ​";
function exactProp(propTypes2) {
  return _extends$1({}, propTypes2, _defineProperty({}, specialProperty, function(props) {
    var unsupportedProps = Object.keys(props).filter(function(prop) {
      return !propTypes2.hasOwnProperty(prop);
    });
    if (unsupportedProps.length > 0) {
      return new Error("The following props are not supported: ".concat(unsupportedProps.map(function(prop) {
        return "`".concat(prop, "`");
      }).join(", "), ". Please remove them."));
    }
    return null;
  }));
}
var reactIs$1 = { exports: {} };
var reactIs_development = {};
/** @license React v17.0.2
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
{
  (function() {
    var REACT_ELEMENT_TYPE = 60103;
    var REACT_PORTAL_TYPE = 60106;
    var REACT_FRAGMENT_TYPE = 60107;
    var REACT_STRICT_MODE_TYPE = 60108;
    var REACT_PROFILER_TYPE = 60114;
    var REACT_PROVIDER_TYPE = 60109;
    var REACT_CONTEXT_TYPE = 60110;
    var REACT_FORWARD_REF_TYPE = 60112;
    var REACT_SUSPENSE_TYPE = 60113;
    var REACT_SUSPENSE_LIST_TYPE = 60120;
    var REACT_MEMO_TYPE = 60115;
    var REACT_LAZY_TYPE = 60116;
    var REACT_BLOCK_TYPE = 60121;
    var REACT_SERVER_BLOCK_TYPE = 60122;
    var REACT_FUNDAMENTAL_TYPE = 60117;
    var REACT_DEBUG_TRACING_MODE_TYPE = 60129;
    var REACT_LEGACY_HIDDEN_TYPE = 60131;
    if (typeof Symbol === "function" && Symbol.for) {
      var symbolFor = Symbol.for;
      REACT_ELEMENT_TYPE = symbolFor("react.element");
      REACT_PORTAL_TYPE = symbolFor("react.portal");
      REACT_FRAGMENT_TYPE = symbolFor("react.fragment");
      REACT_STRICT_MODE_TYPE = symbolFor("react.strict_mode");
      REACT_PROFILER_TYPE = symbolFor("react.profiler");
      REACT_PROVIDER_TYPE = symbolFor("react.provider");
      REACT_CONTEXT_TYPE = symbolFor("react.context");
      REACT_FORWARD_REF_TYPE = symbolFor("react.forward_ref");
      REACT_SUSPENSE_TYPE = symbolFor("react.suspense");
      REACT_SUSPENSE_LIST_TYPE = symbolFor("react.suspense_list");
      REACT_MEMO_TYPE = symbolFor("react.memo");
      REACT_LAZY_TYPE = symbolFor("react.lazy");
      REACT_BLOCK_TYPE = symbolFor("react.block");
      REACT_SERVER_BLOCK_TYPE = symbolFor("react.server.block");
      REACT_FUNDAMENTAL_TYPE = symbolFor("react.fundamental");
      symbolFor("react.scope");
      symbolFor("react.opaque.id");
      REACT_DEBUG_TRACING_MODE_TYPE = symbolFor("react.debug_trace_mode");
      symbolFor("react.offscreen");
      REACT_LEGACY_HIDDEN_TYPE = symbolFor("react.legacy_hidden");
    }
    var enableScopeAPI = false;
    function isValidElementType(type) {
      if (typeof type === "string" || typeof type === "function") {
        return true;
      }
      if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_DEBUG_TRACING_MODE_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_LEGACY_HIDDEN_TYPE || enableScopeAPI) {
        return true;
      }
      if (typeof type === "object" && type !== null) {
        if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_BLOCK_TYPE || type[0] === REACT_SERVER_BLOCK_TYPE) {
          return true;
        }
      }
      return false;
    }
    function typeOf(object) {
      if (typeof object === "object" && object !== null) {
        var $$typeof = object.$$typeof;
        switch ($$typeof) {
          case REACT_ELEMENT_TYPE:
            var type = object.type;
            switch (type) {
              case REACT_FRAGMENT_TYPE:
              case REACT_PROFILER_TYPE:
              case REACT_STRICT_MODE_TYPE:
              case REACT_SUSPENSE_TYPE:
              case REACT_SUSPENSE_LIST_TYPE:
                return type;
              default:
                var $$typeofType = type && type.$$typeof;
                switch ($$typeofType) {
                  case REACT_CONTEXT_TYPE:
                  case REACT_FORWARD_REF_TYPE:
                  case REACT_LAZY_TYPE:
                  case REACT_MEMO_TYPE:
                  case REACT_PROVIDER_TYPE:
                    return $$typeofType;
                  default:
                    return $$typeof;
                }
            }
          case REACT_PORTAL_TYPE:
            return $$typeof;
        }
      }
      return void 0;
    }
    var ContextConsumer = REACT_CONTEXT_TYPE;
    var ContextProvider = REACT_PROVIDER_TYPE;
    var Element = REACT_ELEMENT_TYPE;
    var ForwardRef = REACT_FORWARD_REF_TYPE;
    var Fragment = REACT_FRAGMENT_TYPE;
    var Lazy = REACT_LAZY_TYPE;
    var Memo = REACT_MEMO_TYPE;
    var Portal = REACT_PORTAL_TYPE;
    var Profiler = REACT_PROFILER_TYPE;
    var StrictMode = REACT_STRICT_MODE_TYPE;
    var Suspense = REACT_SUSPENSE_TYPE;
    var hasWarnedAboutDeprecatedIsAsyncMode = false;
    var hasWarnedAboutDeprecatedIsConcurrentMode = false;
    function isAsyncMode(object) {
      {
        if (!hasWarnedAboutDeprecatedIsAsyncMode) {
          hasWarnedAboutDeprecatedIsAsyncMode = true;
          console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 18+.");
        }
      }
      return false;
    }
    function isConcurrentMode(object) {
      {
        if (!hasWarnedAboutDeprecatedIsConcurrentMode) {
          hasWarnedAboutDeprecatedIsConcurrentMode = true;
          console["warn"]("The ReactIs.isConcurrentMode() alias has been deprecated, and will be removed in React 18+.");
        }
      }
      return false;
    }
    function isContextConsumer(object) {
      return typeOf(object) === REACT_CONTEXT_TYPE;
    }
    function isContextProvider(object) {
      return typeOf(object) === REACT_PROVIDER_TYPE;
    }
    function isElement(object) {
      return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function isForwardRef(object) {
      return typeOf(object) === REACT_FORWARD_REF_TYPE;
    }
    function isFragment(object) {
      return typeOf(object) === REACT_FRAGMENT_TYPE;
    }
    function isLazy(object) {
      return typeOf(object) === REACT_LAZY_TYPE;
    }
    function isMemo(object) {
      return typeOf(object) === REACT_MEMO_TYPE;
    }
    function isPortal(object) {
      return typeOf(object) === REACT_PORTAL_TYPE;
    }
    function isProfiler(object) {
      return typeOf(object) === REACT_PROFILER_TYPE;
    }
    function isStrictMode(object) {
      return typeOf(object) === REACT_STRICT_MODE_TYPE;
    }
    function isSuspense(object) {
      return typeOf(object) === REACT_SUSPENSE_TYPE;
    }
    reactIs_development.ContextConsumer = ContextConsumer;
    reactIs_development.ContextProvider = ContextProvider;
    reactIs_development.Element = Element;
    reactIs_development.ForwardRef = ForwardRef;
    reactIs_development.Fragment = Fragment;
    reactIs_development.Lazy = Lazy;
    reactIs_development.Memo = Memo;
    reactIs_development.Portal = Portal;
    reactIs_development.Profiler = Profiler;
    reactIs_development.StrictMode = StrictMode;
    reactIs_development.Suspense = Suspense;
    reactIs_development.isAsyncMode = isAsyncMode;
    reactIs_development.isConcurrentMode = isConcurrentMode;
    reactIs_development.isContextConsumer = isContextConsumer;
    reactIs_development.isContextProvider = isContextProvider;
    reactIs_development.isElement = isElement;
    reactIs_development.isForwardRef = isForwardRef;
    reactIs_development.isFragment = isFragment;
    reactIs_development.isLazy = isLazy;
    reactIs_development.isMemo = isMemo;
    reactIs_development.isPortal = isPortal;
    reactIs_development.isProfiler = isProfiler;
    reactIs_development.isStrictMode = isStrictMode;
    reactIs_development.isSuspense = isSuspense;
    reactIs_development.isValidElementType = isValidElementType;
    reactIs_development.typeOf = typeOf;
  })();
}
{
  reactIs$1.exports = reactIs_development;
}
var reactIsExports = reactIs$1.exports;
var fnNameMatchRegex = /^\s*function(?:\s|\s*\/\*.*\*\/\s*)+([^(\s/]*)\s*/;
function getFunctionName(fn) {
  var match = "".concat(fn).match(fnNameMatchRegex);
  var name = match && match[1];
  return name || "";
}
function getFunctionComponentName(Component) {
  var fallback = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
  return Component.displayName || Component.name || getFunctionName(Component) || fallback;
}
function getWrappedName(outerType, innerType, wrapperName) {
  var functionName = getFunctionComponentName(innerType);
  return outerType.displayName || (functionName !== "" ? "".concat(wrapperName, "(").concat(functionName, ")") : wrapperName);
}
function getDisplayName(Component) {
  if (Component == null) {
    return void 0;
  }
  if (typeof Component === "string") {
    return Component;
  }
  if (typeof Component === "function") {
    return getFunctionComponentName(Component, "Component");
  }
  if (_typeof$2(Component) === "object") {
    switch (Component.$$typeof) {
      case reactIsExports.ForwardRef:
        return getWrappedName(Component, Component.render, "ForwardRef");
      case reactIsExports.Memo:
        return getWrappedName(Component, Component.type, "memo");
      default:
        return void 0;
    }
  }
  return void 0;
}
var refType = PropTypes.oneOfType([PropTypes.func, PropTypes.object]);
const refType$1 = refType;
function clamp(value) {
  var min = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
  var max = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
  {
    if (value < min || value > max) {
      console.error("Material-UI: The value provided ".concat(value, " is out of range [").concat(min, ", ").concat(max, "]."));
    }
  }
  return Math.min(Math.max(min, value), max);
}
function hexToRgb(color) {
  color = color.substr(1);
  var re = new RegExp(".{1,".concat(color.length >= 6 ? 2 : 1, "}"), "g");
  var colors = color.match(re);
  if (colors && colors[0].length === 1) {
    colors = colors.map(function(n) {
      return n + n;
    });
  }
  return colors ? "rgb".concat(colors.length === 4 ? "a" : "", "(").concat(colors.map(function(n, index) {
    return index < 3 ? parseInt(n, 16) : Math.round(parseInt(n, 16) / 255 * 1e3) / 1e3;
  }).join(", "), ")") : "";
}
function hslToRgb(color) {
  color = decomposeColor(color);
  var _color = color, values2 = _color.values;
  var h = values2[0];
  var s = values2[1] / 100;
  var l = values2[2] / 100;
  var a = s * Math.min(l, 1 - l);
  var f = function f2(n) {
    var k = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  var type = "rgb";
  var rgb = [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  if (color.type === "hsla") {
    type += "a";
    rgb.push(values2[3]);
  }
  return recomposeColor({
    type,
    values: rgb
  });
}
function decomposeColor(color) {
  if (color.type) {
    return color;
  }
  if (color.charAt(0) === "#") {
    return decomposeColor(hexToRgb(color));
  }
  var marker = color.indexOf("(");
  var type = color.substring(0, marker);
  if (["rgb", "rgba", "hsl", "hsla"].indexOf(type) === -1) {
    throw new Error("Material-UI: Unsupported `".concat(color, "` color.\nWe support the following formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()."));
  }
  var values2 = color.substring(marker + 1, color.length - 1).split(",");
  values2 = values2.map(function(value) {
    return parseFloat(value);
  });
  return {
    type,
    values: values2
  };
}
function recomposeColor(color) {
  var type = color.type;
  var values2 = color.values;
  if (type.indexOf("rgb") !== -1) {
    values2 = values2.map(function(n, i) {
      return i < 3 ? parseInt(n, 10) : n;
    });
  } else if (type.indexOf("hsl") !== -1) {
    values2[1] = "".concat(values2[1], "%");
    values2[2] = "".concat(values2[2], "%");
  }
  return "".concat(type, "(").concat(values2.join(", "), ")");
}
function getContrastRatio(foreground, background) {
  var lumA = getLuminance(foreground);
  var lumB = getLuminance(background);
  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
}
function getLuminance(color) {
  color = decomposeColor(color);
  var rgb = color.type === "hsl" ? decomposeColor(hslToRgb(color)).values : color.values;
  rgb = rgb.map(function(val) {
    val /= 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return Number((0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]).toFixed(3));
}
function alpha(color, value) {
  color = decomposeColor(color);
  value = clamp(value);
  if (color.type === "rgb" || color.type === "hsl") {
    color.type += "a";
  }
  color.values[3] = value;
  return recomposeColor(color);
}
function darken(color, coefficient) {
  color = decomposeColor(color);
  coefficient = clamp(coefficient);
  if (color.type.indexOf("hsl") !== -1) {
    color.values[2] *= 1 - coefficient;
  } else if (color.type.indexOf("rgb") !== -1) {
    for (var i = 0; i < 3; i += 1) {
      color.values[i] *= 1 - coefficient;
    }
  }
  return recomposeColor(color);
}
function lighten(color, coefficient) {
  color = decomposeColor(color);
  coefficient = clamp(coefficient);
  if (color.type.indexOf("hsl") !== -1) {
    color.values[2] += (100 - color.values[2]) * coefficient;
  } else if (color.type.indexOf("rgb") !== -1) {
    for (var i = 0; i < 3; i += 1) {
      color.values[i] += (255 - color.values[i]) * coefficient;
    }
  }
  return recomposeColor(color);
}
function _objectWithoutPropertiesLoose(r2, e) {
  if (null == r2)
    return {};
  var t = {};
  for (var n in r2)
    if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n))
        continue;
      t[n] = r2[n];
    }
  return t;
}
function _objectWithoutProperties(e, t) {
  if (null == e)
    return {};
  var o, r2, i = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    for (r2 = 0; r2 < n.length; r2++)
      o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
var keys = ["xs", "sm", "md", "lg", "xl"];
function createBreakpoints(breakpoints) {
  var _breakpoints$values = breakpoints.values, values2 = _breakpoints$values === void 0 ? {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  } : _breakpoints$values, _breakpoints$unit = breakpoints.unit, unit = _breakpoints$unit === void 0 ? "px" : _breakpoints$unit, _breakpoints$step = breakpoints.step, step = _breakpoints$step === void 0 ? 5 : _breakpoints$step, other = _objectWithoutProperties(breakpoints, ["values", "unit", "step"]);
  function up(key) {
    var value = typeof values2[key] === "number" ? values2[key] : key;
    return "@media (min-width:".concat(value).concat(unit, ")");
  }
  function down(key) {
    var endIndex = keys.indexOf(key) + 1;
    var upperbound = values2[keys[endIndex]];
    if (endIndex === keys.length) {
      return up("xs");
    }
    var value = typeof upperbound === "number" && endIndex > 0 ? upperbound : key;
    return "@media (max-width:".concat(value - step / 100).concat(unit, ")");
  }
  function between(start, end) {
    var endIndex = keys.indexOf(end);
    if (endIndex === keys.length - 1) {
      return up(start);
    }
    return "@media (min-width:".concat(typeof values2[start] === "number" ? values2[start] : start).concat(unit, ") and ") + "(max-width:".concat((endIndex !== -1 && typeof values2[keys[endIndex + 1]] === "number" ? values2[keys[endIndex + 1]] : end) - step / 100).concat(unit, ")");
  }
  function only(key) {
    return between(key, key);
  }
  var warnedOnce2 = false;
  function width(key) {
    {
      if (!warnedOnce2) {
        warnedOnce2 = true;
        console.warn(["Material-UI: The `theme.breakpoints.width` utility is deprecated because it's redundant.", "Use the `theme.breakpoints.values` instead."].join("\n"));
      }
    }
    return values2[key];
  }
  return _extends$1({
    keys,
    values: values2,
    up,
    down,
    between,
    only,
    width
  }, other);
}
function createMixins(breakpoints, spacing, mixins) {
  var _toolbar;
  return _extends$1({
    gutters: function gutters() {
      var styles8 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      console.warn(["Material-UI: theme.mixins.gutters() is deprecated.", "You can use the source of the mixin directly:", "\n      paddingLeft: theme.spacing(2),\n      paddingRight: theme.spacing(2),\n      [theme.breakpoints.up('sm')]: {\n        paddingLeft: theme.spacing(3),\n        paddingRight: theme.spacing(3),\n      },\n      "].join("\n"));
      return _extends$1({
        paddingLeft: spacing(2),
        paddingRight: spacing(2)
      }, styles8, _defineProperty({}, breakpoints.up("sm"), _extends$1({
        paddingLeft: spacing(3),
        paddingRight: spacing(3)
      }, styles8[breakpoints.up("sm")])));
    },
    toolbar: (_toolbar = {
      minHeight: 56
    }, _defineProperty(_toolbar, "".concat(breakpoints.up("xs"), " and (orientation: landscape)"), {
      minHeight: 48
    }), _defineProperty(_toolbar, breakpoints.up("sm"), {
      minHeight: 64
    }), _toolbar)
  }, mixins);
}
var light = {
  // The colors used to style the text.
  text: {
    // The most important text.
    primary: "rgba(0, 0, 0, 0.87)",
    // Secondary text.
    secondary: "rgba(0, 0, 0, 0.54)",
    // Disabled text have even lower visual prominence.
    disabled: "rgba(0, 0, 0, 0.38)",
    // Text hints.
    hint: "rgba(0, 0, 0, 0.38)"
  },
  // The color used to divide different elements.
  divider: "rgba(0, 0, 0, 0.12)",
  // The background colors used to style the surfaces.
  // Consistency between these values is important.
  background: {
    paper: common$1.white,
    default: grey$1[50]
  },
  // The colors used to style the action elements.
  action: {
    // The color of an active action like an icon button.
    active: "rgba(0, 0, 0, 0.54)",
    // The color of an hovered action.
    hover: "rgba(0, 0, 0, 0.04)",
    hoverOpacity: 0.04,
    // The color of a selected action.
    selected: "rgba(0, 0, 0, 0.08)",
    selectedOpacity: 0.08,
    // The color of a disabled action.
    disabled: "rgba(0, 0, 0, 0.26)",
    // The background color of a disabled action.
    disabledBackground: "rgba(0, 0, 0, 0.12)",
    disabledOpacity: 0.38,
    focus: "rgba(0, 0, 0, 0.12)",
    focusOpacity: 0.12,
    activatedOpacity: 0.12
  }
};
var dark = {
  text: {
    primary: common$1.white,
    secondary: "rgba(255, 255, 255, 0.7)",
    disabled: "rgba(255, 255, 255, 0.5)",
    hint: "rgba(255, 255, 255, 0.5)",
    icon: "rgba(255, 255, 255, 0.5)"
  },
  divider: "rgba(255, 255, 255, 0.12)",
  background: {
    paper: grey$1[800],
    default: "#303030"
  },
  action: {
    active: common$1.white,
    hover: "rgba(255, 255, 255, 0.08)",
    hoverOpacity: 0.08,
    selected: "rgba(255, 255, 255, 0.16)",
    selectedOpacity: 0.16,
    disabled: "rgba(255, 255, 255, 0.3)",
    disabledBackground: "rgba(255, 255, 255, 0.12)",
    disabledOpacity: 0.38,
    focus: "rgba(255, 255, 255, 0.12)",
    focusOpacity: 0.12,
    activatedOpacity: 0.24
  }
};
function addLightOrDark(intent, direction, shade, tonalOffset) {
  var tonalOffsetLight = tonalOffset.light || tonalOffset;
  var tonalOffsetDark = tonalOffset.dark || tonalOffset * 1.5;
  if (!intent[direction]) {
    if (intent.hasOwnProperty(shade)) {
      intent[direction] = intent[shade];
    } else if (direction === "light") {
      intent.light = lighten(intent.main, tonalOffsetLight);
    } else if (direction === "dark") {
      intent.dark = darken(intent.main, tonalOffsetDark);
    }
  }
}
function createPalette(palette) {
  var _palette$primary = palette.primary, primary = _palette$primary === void 0 ? {
    light: indigo$1[300],
    main: indigo$1[500],
    dark: indigo$1[700]
  } : _palette$primary, _palette$secondary = palette.secondary, secondary = _palette$secondary === void 0 ? {
    light: pink$1.A200,
    main: pink$1.A400,
    dark: pink$1.A700
  } : _palette$secondary, _palette$error = palette.error, error = _palette$error === void 0 ? {
    light: red$1[300],
    main: red$1[500],
    dark: red$1[700]
  } : _palette$error, _palette$warning = palette.warning, warning2 = _palette$warning === void 0 ? {
    light: orange$1[300],
    main: orange$1[500],
    dark: orange$1[700]
  } : _palette$warning, _palette$info = palette.info, info = _palette$info === void 0 ? {
    light: blue$1[300],
    main: blue$1[500],
    dark: blue$1[700]
  } : _palette$info, _palette$success = palette.success, success = _palette$success === void 0 ? {
    light: green$1[300],
    main: green$1[500],
    dark: green$1[700]
  } : _palette$success, _palette$type = palette.type, type = _palette$type === void 0 ? "light" : _palette$type, _palette$contrastThre = palette.contrastThreshold, contrastThreshold = _palette$contrastThre === void 0 ? 3 : _palette$contrastThre, _palette$tonalOffset = palette.tonalOffset, tonalOffset = _palette$tonalOffset === void 0 ? 0.2 : _palette$tonalOffset, other = _objectWithoutProperties(palette, ["primary", "secondary", "error", "warning", "info", "success", "type", "contrastThreshold", "tonalOffset"]);
  function getContrastText(background) {
    var contrastText = getContrastRatio(background, dark.text.primary) >= contrastThreshold ? dark.text.primary : light.text.primary;
    {
      var contrast = getContrastRatio(background, contrastText);
      if (contrast < 3) {
        console.error(["Material-UI: The contrast ratio of ".concat(contrast, ":1 for ").concat(contrastText, " on ").concat(background), "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join("\n"));
      }
    }
    return contrastText;
  }
  var augmentColor = function augmentColor2(color) {
    var mainShade = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 500;
    var lightShade = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 300;
    var darkShade = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 700;
    color = _extends$1({}, color);
    if (!color.main && color[mainShade]) {
      color.main = color[mainShade];
    }
    if (!color.main) {
      throw new Error("Material-UI: The color provided to augmentColor(color) is invalid.\nThe color object needs to have a `main` property or a `".concat(mainShade, "` property."));
    }
    if (typeof color.main !== "string") {
      throw new Error("Material-UI: The color provided to augmentColor(color) is invalid.\n`color.main` should be a string, but `".concat(JSON.stringify(color.main), '` was provided instead.\n\nDid you intend to use one of the following approaches?\n\nimport { green } from "@material-ui/core/colors";\n\nconst theme1 = createTheme({ palette: {\n  primary: green,\n} });\n\nconst theme2 = createTheme({ palette: {\n  primary: { main: green[500] },\n} });'));
    }
    addLightOrDark(color, "light", lightShade, tonalOffset);
    addLightOrDark(color, "dark", darkShade, tonalOffset);
    if (!color.contrastText) {
      color.contrastText = getContrastText(color.main);
    }
    return color;
  };
  var types = {
    dark,
    light
  };
  {
    if (!types[type]) {
      console.error("Material-UI: The palette type `".concat(type, "` is not supported."));
    }
  }
  var paletteOutput = deepmerge(_extends$1({
    // A collection of common colors.
    common: common$1,
    // The palette type, can be light or dark.
    type,
    // The colors used to represent primary interface elements for a user.
    primary: augmentColor(primary),
    // The colors used to represent secondary interface elements for a user.
    secondary: augmentColor(secondary, "A400", "A200", "A700"),
    // The colors used to represent interface elements that the user should be made aware of.
    error: augmentColor(error),
    // The colors used to represent potentially dangerous actions or important messages.
    warning: augmentColor(warning2),
    // The colors used to present information to the user that is neutral and not necessarily important.
    info: augmentColor(info),
    // The colors used to indicate the successful completion of an action that user triggered.
    success: augmentColor(success),
    // The grey colors.
    grey: grey$1,
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold,
    // Takes a background color and returns the text color that maximizes the contrast.
    getContrastText,
    // Generate a rich color object.
    augmentColor,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset
  }, types[type]), other);
  return paletteOutput;
}
function round(value) {
  return Math.round(value * 1e5) / 1e5;
}
var warnedOnce = false;
function roundWithDeprecationWarning(value) {
  {
    if (!warnedOnce) {
      console.warn(["Material-UI: The `theme.typography.round` helper is deprecated.", "Head to https://mui.com/r/migration-v4/#theme for a migration path."].join("\n"));
      warnedOnce = true;
    }
  }
  return round(value);
}
var caseAllCaps = {
  textTransform: "uppercase"
};
var defaultFontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';
function createTypography(palette, typography) {
  var _ref = typeof typography === "function" ? typography(palette) : typography, _ref$fontFamily = _ref.fontFamily, fontFamily = _ref$fontFamily === void 0 ? defaultFontFamily : _ref$fontFamily, _ref$fontSize = _ref.fontSize, fontSize = _ref$fontSize === void 0 ? 14 : _ref$fontSize, _ref$fontWeightLight = _ref.fontWeightLight, fontWeightLight = _ref$fontWeightLight === void 0 ? 300 : _ref$fontWeightLight, _ref$fontWeightRegula = _ref.fontWeightRegular, fontWeightRegular = _ref$fontWeightRegula === void 0 ? 400 : _ref$fontWeightRegula, _ref$fontWeightMedium = _ref.fontWeightMedium, fontWeightMedium = _ref$fontWeightMedium === void 0 ? 500 : _ref$fontWeightMedium, _ref$fontWeightBold = _ref.fontWeightBold, fontWeightBold = _ref$fontWeightBold === void 0 ? 700 : _ref$fontWeightBold, _ref$htmlFontSize = _ref.htmlFontSize, htmlFontSize = _ref$htmlFontSize === void 0 ? 16 : _ref$htmlFontSize, allVariants = _ref.allVariants, pxToRem2 = _ref.pxToRem, other = _objectWithoutProperties(_ref, ["fontFamily", "fontSize", "fontWeightLight", "fontWeightRegular", "fontWeightMedium", "fontWeightBold", "htmlFontSize", "allVariants", "pxToRem"]);
  {
    if (typeof fontSize !== "number") {
      console.error("Material-UI: `fontSize` is required to be a number.");
    }
    if (typeof htmlFontSize !== "number") {
      console.error("Material-UI: `htmlFontSize` is required to be a number.");
    }
  }
  var coef = fontSize / 14;
  var pxToRem = pxToRem2 || function(size2) {
    return "".concat(size2 / htmlFontSize * coef, "rem");
  };
  var buildVariant = function buildVariant2(fontWeight, size2, lineHeight, letterSpacing, casing) {
    return _extends$1({
      fontFamily,
      fontWeight,
      fontSize: pxToRem(size2),
      // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
      lineHeight
    }, fontFamily === defaultFontFamily ? {
      letterSpacing: "".concat(round(letterSpacing / size2), "em")
    } : {}, casing, allVariants);
  };
  var variants = {
    h1: buildVariant(fontWeightLight, 96, 1.167, -1.5),
    h2: buildVariant(fontWeightLight, 60, 1.2, -0.5),
    h3: buildVariant(fontWeightRegular, 48, 1.167, 0),
    h4: buildVariant(fontWeightRegular, 34, 1.235, 0.25),
    h5: buildVariant(fontWeightRegular, 24, 1.334, 0),
    h6: buildVariant(fontWeightMedium, 20, 1.6, 0.15),
    subtitle1: buildVariant(fontWeightRegular, 16, 1.75, 0.15),
    subtitle2: buildVariant(fontWeightMedium, 14, 1.57, 0.1),
    body1: buildVariant(fontWeightRegular, 16, 1.5, 0.15),
    body2: buildVariant(fontWeightRegular, 14, 1.43, 0.15),
    button: buildVariant(fontWeightMedium, 14, 1.75, 0.4, caseAllCaps),
    caption: buildVariant(fontWeightRegular, 12, 1.66, 0.4),
    overline: buildVariant(fontWeightRegular, 12, 2.66, 1, caseAllCaps)
  };
  return deepmerge(_extends$1({
    htmlFontSize,
    pxToRem,
    round: roundWithDeprecationWarning,
    // TODO v5: remove
    fontFamily,
    fontSize,
    fontWeightLight,
    fontWeightRegular,
    fontWeightMedium,
    fontWeightBold
  }, variants), other, {
    clone: false
    // No need to clone deep
  });
}
var shadowKeyUmbraOpacity = 0.2;
var shadowKeyPenumbraOpacity = 0.14;
var shadowAmbientShadowOpacity = 0.12;
function createShadow() {
  return ["".concat(arguments.length <= 0 ? void 0 : arguments[0], "px ").concat(arguments.length <= 1 ? void 0 : arguments[1], "px ").concat(arguments.length <= 2 ? void 0 : arguments[2], "px ").concat(arguments.length <= 3 ? void 0 : arguments[3], "px rgba(0,0,0,").concat(shadowKeyUmbraOpacity, ")"), "".concat(arguments.length <= 4 ? void 0 : arguments[4], "px ").concat(arguments.length <= 5 ? void 0 : arguments[5], "px ").concat(arguments.length <= 6 ? void 0 : arguments[6], "px ").concat(arguments.length <= 7 ? void 0 : arguments[7], "px rgba(0,0,0,").concat(shadowKeyPenumbraOpacity, ")"), "".concat(arguments.length <= 8 ? void 0 : arguments[8], "px ").concat(arguments.length <= 9 ? void 0 : arguments[9], "px ").concat(arguments.length <= 10 ? void 0 : arguments[10], "px ").concat(arguments.length <= 11 ? void 0 : arguments[11], "px rgba(0,0,0,").concat(shadowAmbientShadowOpacity, ")")].join(",");
}
var shadows = ["none", createShadow(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), createShadow(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), createShadow(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), createShadow(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), createShadow(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), createShadow(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), createShadow(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), createShadow(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), createShadow(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), createShadow(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), createShadow(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), createShadow(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), createShadow(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), createShadow(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), createShadow(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), createShadow(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), createShadow(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), createShadow(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), createShadow(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), createShadow(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), createShadow(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), createShadow(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), createShadow(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), createShadow(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)];
const shadows$1 = shadows;
var shape = {
  borderRadius: 4
};
const shape$1 = shape;
var responsivePropType = PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object, PropTypes.array]);
const responsivePropType$1 = responsivePropType;
function _arrayLikeToArray(r2, a) {
  (null == a || a > r2.length) && (a = r2.length);
  for (var e = 0, n = Array(a); e < a; e++)
    n[e] = r2[e];
  return n;
}
function _arrayWithoutHoles(r2) {
  if (Array.isArray(r2))
    return _arrayLikeToArray(r2);
}
function _iterableToArray(r2) {
  if ("undefined" != typeof Symbol && null != r2[Symbol.iterator] || null != r2["@@iterator"])
    return Array.from(r2);
}
function _unsupportedIterableToArray(r2, a) {
  if (r2) {
    if ("string" == typeof r2)
      return _arrayLikeToArray(r2, a);
    var t = {}.toString.call(r2).slice(8, -1);
    return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r2, a) : void 0;
  }
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _toConsumableArray(r2) {
  return _arrayWithoutHoles(r2) || _iterableToArray(r2) || _unsupportedIterableToArray(r2) || _nonIterableSpread();
}
function _arrayWithHoles(r2) {
  if (Array.isArray(r2))
    return r2;
}
function _iterableToArrayLimit(r2, l) {
  var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
  if (null != t) {
    var e, n, i, u, a = [], f = true, o = false;
    try {
      if (i = (t = t.call(r2)).next, 0 === l) {
        if (Object(t) !== t)
          return;
        f = false;
      } else
        for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true)
          ;
    } catch (r3) {
      o = true, n = r3;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u))
          return;
      } finally {
        if (o)
          throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray(r2, e) {
  return _arrayWithHoles(r2) || _iterableToArrayLimit(r2, e) || _unsupportedIterableToArray(r2, e) || _nonIterableRest();
}
var spacingKeys = ["m", "mt", "mr", "mb", "ml", "mx", "my", "p", "pt", "pr", "pb", "pl", "px", "py", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginX", "marginY", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingX", "paddingY"];
function createUnarySpacing(theme) {
  var themeSpacing = theme.spacing || 8;
  if (typeof themeSpacing === "number") {
    return function(abs) {
      {
        if (typeof abs !== "number") {
          console.error("Material-UI: Expected spacing argument to be a number, got ".concat(abs, "."));
        }
      }
      return themeSpacing * abs;
    };
  }
  if (Array.isArray(themeSpacing)) {
    return function(abs) {
      {
        if (abs > themeSpacing.length - 1) {
          console.error(["Material-UI: The value provided (".concat(abs, ") overflows."), "The supported values are: ".concat(JSON.stringify(themeSpacing), "."), "".concat(abs, " > ").concat(themeSpacing.length - 1, ", you need to add the missing values.")].join("\n"));
        }
      }
      return themeSpacing[abs];
    };
  }
  if (typeof themeSpacing === "function") {
    return themeSpacing;
  }
  {
    console.error(["Material-UI: The `theme.spacing` value (".concat(themeSpacing, ") is invalid."), "It should be a number, an array or a function."].join("\n"));
  }
  return function() {
    return void 0;
  };
}
spacingKeys.reduce(function(obj, key) {
  obj[key] = responsivePropType$1;
  return obj;
}, {});
var warnOnce;
function createSpacing() {
  var spacingInput = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 8;
  if (spacingInput.mui) {
    return spacingInput;
  }
  var transform2 = createUnarySpacing({
    spacing: spacingInput
  });
  var spacing = function spacing2() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    {
      if (!(args.length <= 4)) {
        console.error("Material-UI: Too many arguments provided, expected between 0 and 4, got ".concat(args.length));
      }
    }
    if (args.length === 0) {
      return transform2(1);
    }
    if (args.length === 1) {
      return transform2(args[0]);
    }
    return args.map(function(argument) {
      if (typeof argument === "string") {
        return argument;
      }
      var output = transform2(argument);
      return typeof output === "number" ? "".concat(output, "px") : output;
    }).join(" ");
  };
  Object.defineProperty(spacing, "unit", {
    get: function get3() {
      {
        if (!warnOnce || false) {
          console.error(["Material-UI: theme.spacing.unit usage has been deprecated.", "It will be removed in v5.", "You can replace `theme.spacing.unit * y` with `theme.spacing(y)`.", "", "You can use the `https://github.com/mui-org/material-ui/tree/master/packages/material-ui-codemod/README.md#theme-spacing-api` migration helper to make the process smoother."].join("\n"));
        }
        warnOnce = true;
      }
      return spacingInput;
    }
  });
  spacing.mui = true;
  return spacing;
}
var easing = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
};
var duration = {
  shortest: 150,
  shorter: 200,
  short: 250,
  // most basic recommended timing
  standard: 300,
  // this is to be used in complex animations
  complex: 375,
  // recommended when something is entering screen
  enteringScreen: 225,
  // recommended when something is leaving screen
  leavingScreen: 195
};
function formatMs(milliseconds) {
  return "".concat(Math.round(milliseconds), "ms");
}
const transitions = {
  easing,
  duration,
  create: function create() {
    var props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ["all"];
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var _options$duration = options.duration, durationOption = _options$duration === void 0 ? duration.standard : _options$duration, _options$easing = options.easing, easingOption = _options$easing === void 0 ? easing.easeInOut : _options$easing, _options$delay = options.delay, delay = _options$delay === void 0 ? 0 : _options$delay, other = _objectWithoutProperties(options, ["duration", "easing", "delay"]);
    {
      var isString = function isString2(value) {
        return typeof value === "string";
      };
      var isNumber = function isNumber2(value) {
        return !isNaN(parseFloat(value));
      };
      if (!isString(props) && !Array.isArray(props)) {
        console.error('Material-UI: Argument "props" must be a string or Array.');
      }
      if (!isNumber(durationOption) && !isString(durationOption)) {
        console.error('Material-UI: Argument "duration" must be a number or a string but found '.concat(durationOption, "."));
      }
      if (!isString(easingOption)) {
        console.error('Material-UI: Argument "easing" must be a string.');
      }
      if (!isNumber(delay) && !isString(delay)) {
        console.error('Material-UI: Argument "delay" must be a number or a string.');
      }
      if (Object.keys(other).length !== 0) {
        console.error("Material-UI: Unrecognized argument(s) [".concat(Object.keys(other).join(","), "]."));
      }
    }
    return (Array.isArray(props) ? props : [props]).map(function(animatedProp) {
      return "".concat(animatedProp, " ").concat(typeof durationOption === "string" ? durationOption : formatMs(durationOption), " ").concat(easingOption, " ").concat(typeof delay === "string" ? delay : formatMs(delay));
    }).join(",");
  },
  getAutoHeightDuration: function getAutoHeightDuration(height) {
    if (!height) {
      return 0;
    }
    var constant2 = height / 36;
    return Math.round((4 + 15 * Math.pow(constant2, 0.25) + constant2 / 5) * 10);
  }
};
var zIndex = {
  mobileStepper: 1e3,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};
const zIndex$1 = zIndex;
function createTheme() {
  var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  var _options$breakpoints = options.breakpoints, breakpointsInput = _options$breakpoints === void 0 ? {} : _options$breakpoints, _options$mixins = options.mixins, mixinsInput = _options$mixins === void 0 ? {} : _options$mixins, _options$palette = options.palette, paletteInput = _options$palette === void 0 ? {} : _options$palette, spacingInput = options.spacing, _options$typography = options.typography, typographyInput = _options$typography === void 0 ? {} : _options$typography, other = _objectWithoutProperties(options, ["breakpoints", "mixins", "palette", "spacing", "typography"]);
  var palette = createPalette(paletteInput);
  var breakpoints = createBreakpoints(breakpointsInput);
  var spacing = createSpacing(spacingInput);
  var muiTheme = deepmerge({
    breakpoints,
    direction: "ltr",
    mixins: createMixins(breakpoints, spacing, mixinsInput),
    overrides: {},
    // Inject custom styles
    palette,
    props: {},
    // Provide default props
    shadows: shadows$1,
    typography: createTypography(palette, typographyInput),
    spacing,
    shape: shape$1,
    transitions,
    zIndex: zIndex$1
  }, other);
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }
  muiTheme = args.reduce(function(acc, argument) {
    return deepmerge(acc, argument);
  }, muiTheme);
  {
    var pseudoClasses2 = ["checked", "disabled", "error", "focused", "focusVisible", "required", "expanded", "selected"];
    var traverse = function traverse2(node, parentKey) {
      var depth = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
      var key;
      for (key in node) {
        var child = node[key];
        if (depth === 1) {
          if (key.indexOf("Mui") === 0 && child) {
            traverse2(child, key, depth + 1);
          }
        } else if (pseudoClasses2.indexOf(key) !== -1 && Object.keys(child).length > 0) {
          {
            console.error(["Material-UI: The `".concat(parentKey, "` component increases ") + "the CSS specificity of the `".concat(key, "` internal state."), "You can not override it like this: ", JSON.stringify(node, null, 2), "", "Instead, you need to use the $ruleName syntax:", JSON.stringify({
              root: _defineProperty({}, "&$".concat(key), child)
            }, null, 2), "", "https://mui.com/r/pseudo-classes-guide"].join("\n"));
          }
          node[key] = {};
        }
      }
    };
    traverse(muiTheme.overrides);
  }
  return muiTheme;
}
var hasSymbol = typeof Symbol === "function" && Symbol.for;
const nested = hasSymbol ? Symbol.for("mui.nested") : "__THEME_NESTED__";
var pseudoClasses = ["checked", "disabled", "error", "focused", "focusVisible", "required", "expanded", "selected"];
function createGenerateClassName() {
  var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  var _options$disableGloba = options.disableGlobal, disableGlobal = _options$disableGloba === void 0 ? false : _options$disableGloba;
  options.productionPrefix;
  var _options$seed = options.seed, seed = _options$seed === void 0 ? "" : _options$seed;
  var seedPrefix = seed === "" ? "" : "".concat(seed, "-");
  var ruleCounter = 0;
  var getNextCounterId = function getNextCounterId2() {
    ruleCounter += 1;
    {
      if (ruleCounter >= 1e10) {
        console.warn(["Material-UI: You might have a memory leak.", "The ruleCounter is not supposed to grow that much."].join(""));
      }
    }
    return ruleCounter;
  };
  return function(rule, styleSheet) {
    var name = styleSheet.options.name;
    if (name && name.indexOf("Mui") === 0 && !styleSheet.options.link && !disableGlobal) {
      if (pseudoClasses.indexOf(rule.key) !== -1) {
        return "Mui-".concat(rule.key);
      }
      var prefix2 = "".concat(seedPrefix).concat(name, "-").concat(rule.key);
      if (!styleSheet.options.theme[nested] || seed !== "") {
        return prefix2;
      }
      return "".concat(prefix2, "-").concat(getNextCounterId());
    }
    var suffix = "".concat(rule.key, "-").concat(getNextCounterId());
    if (styleSheet.options.classNamePrefix) {
      return "".concat(seedPrefix).concat(styleSheet.options.classNamePrefix, "-").concat(suffix);
    }
    return "".concat(seedPrefix).concat(suffix);
  };
}
function getThemeProps(params) {
  var theme = params.theme, name = params.name, props = params.props;
  if (!theme || !theme.props || !theme.props[name]) {
    return props;
  }
  var defaultProps2 = theme.props[name];
  var propName;
  for (propName in defaultProps2) {
    if (props[propName] === void 0) {
      props[propName] = defaultProps2[propName];
    }
  }
  return props;
}
var isProduction = false;
function warning(condition, message) {
  if (!isProduction) {
    if (condition) {
      return;
    }
    var text = "Warning: " + message;
    if (typeof console !== "undefined") {
      console.warn(text);
    }
    try {
      throw Error(text);
    } catch (x) {
    }
  }
}
var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
  return typeof obj;
} : function(obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};
var isBrowser = (typeof window === "undefined" ? "undefined" : _typeof$1(window)) === "object" && (typeof document === "undefined" ? "undefined" : _typeof$1(document)) === "object" && document.nodeType === 9;
function _defineProperties(e, r2) {
  for (var t = 0; t < r2.length; t++) {
    var o = r2[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, toPropertyKey$1(o.key), o);
  }
}
function _createClass(e, r2, t) {
  return r2 && _defineProperties(e.prototype, r2), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
    return t2.__proto__ = e2, t2;
  }, _setPrototypeOf(t, e);
}
function _inheritsLoose(t, o) {
  t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
}
function _assertThisInitialized(e) {
  if (void 0 === e)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
var plainObjectConstrurctor = {}.constructor;
function cloneStyle(style) {
  if (style == null || typeof style !== "object")
    return style;
  if (Array.isArray(style))
    return style.map(cloneStyle);
  if (style.constructor !== plainObjectConstrurctor)
    return style;
  var newStyle = {};
  for (var name in style) {
    newStyle[name] = cloneStyle(style[name]);
  }
  return newStyle;
}
function createRule(name, decl, options) {
  if (name === void 0) {
    name = "unnamed";
  }
  var jss2 = options.jss;
  var declCopy = cloneStyle(decl);
  var rule = jss2.plugins.onCreateRule(name, declCopy, options);
  if (rule)
    return rule;
  if (name[0] === "@") {
    warning(false, "[JSS] Unknown rule " + name);
  }
  return null;
}
var join = function join2(value, by) {
  var result = "";
  for (var i = 0; i < value.length; i++) {
    if (value[i] === "!important")
      break;
    if (result)
      result += by;
    result += value[i];
  }
  return result;
};
var toCssValue = function toCssValue2(value) {
  if (!Array.isArray(value))
    return value;
  var cssValue = "";
  if (Array.isArray(value[0])) {
    for (var i = 0; i < value.length; i++) {
      if (value[i] === "!important")
        break;
      if (cssValue)
        cssValue += ", ";
      cssValue += join(value[i], " ");
    }
  } else
    cssValue = join(value, ", ");
  if (value[value.length - 1] === "!important") {
    cssValue += " !important";
  }
  return cssValue;
};
function getWhitespaceSymbols(options) {
  if (options && options.format === false) {
    return {
      linebreak: "",
      space: ""
    };
  }
  return {
    linebreak: "\n",
    space: " "
  };
}
function indentStr(str, indent) {
  var result = "";
  for (var index = 0; index < indent; index++) {
    result += "  ";
  }
  return result + str;
}
function toCss(selector, style, options) {
  if (options === void 0) {
    options = {};
  }
  var result = "";
  if (!style)
    return result;
  var _options = options, _options$indent = _options.indent, indent = _options$indent === void 0 ? 0 : _options$indent;
  var fallbacks = style.fallbacks;
  if (options.format === false) {
    indent = -Infinity;
  }
  var _getWhitespaceSymbols = getWhitespaceSymbols(options), linebreak = _getWhitespaceSymbols.linebreak, space = _getWhitespaceSymbols.space;
  if (selector)
    indent++;
  if (fallbacks) {
    if (Array.isArray(fallbacks)) {
      for (var index = 0; index < fallbacks.length; index++) {
        var fallback = fallbacks[index];
        for (var prop in fallback) {
          var value = fallback[prop];
          if (value != null) {
            if (result)
              result += linebreak;
            result += indentStr(prop + ":" + space + toCssValue(value) + ";", indent);
          }
        }
      }
    } else {
      for (var _prop in fallbacks) {
        var _value = fallbacks[_prop];
        if (_value != null) {
          if (result)
            result += linebreak;
          result += indentStr(_prop + ":" + space + toCssValue(_value) + ";", indent);
        }
      }
    }
  }
  for (var _prop2 in style) {
    var _value2 = style[_prop2];
    if (_value2 != null && _prop2 !== "fallbacks") {
      if (result)
        result += linebreak;
      result += indentStr(_prop2 + ":" + space + toCssValue(_value2) + ";", indent);
    }
  }
  if (!result && !options.allowEmpty)
    return result;
  if (!selector)
    return result;
  indent--;
  if (result)
    result = "" + linebreak + result + linebreak;
  return indentStr("" + selector + space + "{" + result, indent) + indentStr("}", indent);
}
var escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;
var nativeEscape = typeof CSS !== "undefined" && CSS.escape;
var escape = function(str) {
  return nativeEscape ? nativeEscape(str) : str.replace(escapeRegex, "\\$1");
};
var BaseStyleRule = /* @__PURE__ */ function() {
  function BaseStyleRule2(key, style, options) {
    this.type = "style";
    this.isProcessed = false;
    var sheet = options.sheet, Renderer = options.Renderer;
    this.key = key;
    this.options = options;
    this.style = style;
    if (sheet)
      this.renderer = sheet.renderer;
    else if (Renderer)
      this.renderer = new Renderer();
  }
  var _proto = BaseStyleRule2.prototype;
  _proto.prop = function prop(name, value, options) {
    if (value === void 0)
      return this.style[name];
    var force = options ? options.force : false;
    if (!force && this.style[name] === value)
      return this;
    var newValue = value;
    if (!options || options.process !== false) {
      newValue = this.options.jss.plugins.onChangeValue(value, name, this);
    }
    var isEmpty = newValue == null || newValue === false;
    var isDefined = name in this.style;
    if (isEmpty && !isDefined && !force)
      return this;
    var remove = isEmpty && isDefined;
    if (remove)
      delete this.style[name];
    else
      this.style[name] = newValue;
    if (this.renderable && this.renderer) {
      if (remove)
        this.renderer.removeProperty(this.renderable, name);
      else
        this.renderer.setProperty(this.renderable, name, newValue);
      return this;
    }
    var sheet = this.options.sheet;
    if (sheet && sheet.attached) {
      warning(false, '[JSS] Rule is not linked. Missing sheet option "link: true".');
    }
    return this;
  };
  return BaseStyleRule2;
}();
var StyleRule = /* @__PURE__ */ function(_BaseStyleRule) {
  _inheritsLoose(StyleRule2, _BaseStyleRule);
  function StyleRule2(key, style, options) {
    var _this;
    _this = _BaseStyleRule.call(this, key, style, options) || this;
    var selector = options.selector, scoped = options.scoped, sheet = options.sheet, generateId = options.generateId;
    if (selector) {
      _this.selectorText = selector;
    } else if (scoped !== false) {
      _this.id = generateId(_assertThisInitialized(_assertThisInitialized(_this)), sheet);
      _this.selectorText = "." + escape(_this.id);
    }
    return _this;
  }
  var _proto2 = StyleRule2.prototype;
  _proto2.applyTo = function applyTo(renderable) {
    var renderer = this.renderer;
    if (renderer) {
      var json = this.toJSON();
      for (var prop in json) {
        renderer.setProperty(renderable, prop, json[prop]);
      }
    }
    return this;
  };
  _proto2.toJSON = function toJSON() {
    var json = {};
    for (var prop in this.style) {
      var value = this.style[prop];
      if (typeof value !== "object")
        json[prop] = value;
      else if (Array.isArray(value))
        json[prop] = toCssValue(value);
    }
    return json;
  };
  _proto2.toString = function toString2(options) {
    var sheet = this.options.sheet;
    var link = sheet ? sheet.options.link : false;
    var opts = link ? _extends$1({}, options, {
      allowEmpty: true
    }) : options;
    return toCss(this.selectorText, this.style, opts);
  };
  _createClass(StyleRule2, [{
    key: "selector",
    set: function set2(selector) {
      if (selector === this.selectorText)
        return;
      this.selectorText = selector;
      var renderer = this.renderer, renderable = this.renderable;
      if (!renderable || !renderer)
        return;
      var hasChanged = renderer.setSelector(renderable, selector);
      if (!hasChanged) {
        renderer.replaceRule(renderable, this);
      }
    },
    get: function get3() {
      return this.selectorText;
    }
  }]);
  return StyleRule2;
}(BaseStyleRule);
var pluginStyleRule = {
  onCreateRule: function onCreateRule(key, style, options) {
    if (key[0] === "@" || options.parent && options.parent.type === "keyframes") {
      return null;
    }
    return new StyleRule(key, style, options);
  }
};
var defaultToStringOptions = {
  indent: 1,
  children: true
};
var atRegExp = /@([\w-]+)/;
var ConditionalRule = /* @__PURE__ */ function() {
  function ConditionalRule2(key, styles8, options) {
    this.type = "conditional";
    this.isProcessed = false;
    this.key = key;
    var atMatch = key.match(atRegExp);
    this.at = atMatch ? atMatch[1] : "unknown";
    this.query = options.name || "@" + this.at;
    this.options = options;
    this.rules = new RuleList(_extends$1({}, options, {
      parent: this
    }));
    for (var name in styles8) {
      this.rules.add(name, styles8[name]);
    }
    this.rules.process();
  }
  var _proto = ConditionalRule2.prototype;
  _proto.getRule = function getRule(name) {
    return this.rules.get(name);
  };
  _proto.indexOf = function indexOf(rule) {
    return this.rules.indexOf(rule);
  };
  _proto.addRule = function addRule(name, style, options) {
    var rule = this.rules.add(name, style, options);
    if (!rule)
      return null;
    this.options.jss.plugins.onProcessRule(rule);
    return rule;
  };
  _proto.replaceRule = function replaceRule(name, style, options) {
    var newRule = this.rules.replace(name, style, options);
    if (newRule)
      this.options.jss.plugins.onProcessRule(newRule);
    return newRule;
  };
  _proto.toString = function toString2(options) {
    if (options === void 0) {
      options = defaultToStringOptions;
    }
    var _getWhitespaceSymbols = getWhitespaceSymbols(options), linebreak = _getWhitespaceSymbols.linebreak;
    if (options.indent == null)
      options.indent = defaultToStringOptions.indent;
    if (options.children == null)
      options.children = defaultToStringOptions.children;
    if (options.children === false) {
      return this.query + " {}";
    }
    var children = this.rules.toString(options);
    return children ? this.query + " {" + linebreak + children + linebreak + "}" : "";
  };
  return ConditionalRule2;
}();
var keyRegExp = /@container|@media|@supports\s+/;
var pluginConditionalRule = {
  onCreateRule: function onCreateRule2(key, styles8, options) {
    return keyRegExp.test(key) ? new ConditionalRule(key, styles8, options) : null;
  }
};
var defaultToStringOptions$1 = {
  indent: 1,
  children: true
};
var nameRegExp = /@keyframes\s+([\w-]+)/;
var KeyframesRule = /* @__PURE__ */ function() {
  function KeyframesRule2(key, frames, options) {
    this.type = "keyframes";
    this.at = "@keyframes";
    this.isProcessed = false;
    var nameMatch = key.match(nameRegExp);
    if (nameMatch && nameMatch[1]) {
      this.name = nameMatch[1];
    } else {
      this.name = "noname";
      warning(false, "[JSS] Bad keyframes name " + key);
    }
    this.key = this.type + "-" + this.name;
    this.options = options;
    var scoped = options.scoped, sheet = options.sheet, generateId = options.generateId;
    this.id = scoped === false ? this.name : escape(generateId(this, sheet));
    this.rules = new RuleList(_extends$1({}, options, {
      parent: this
    }));
    for (var name in frames) {
      this.rules.add(name, frames[name], _extends$1({}, options, {
        parent: this
      }));
    }
    this.rules.process();
  }
  var _proto = KeyframesRule2.prototype;
  _proto.toString = function toString2(options) {
    if (options === void 0) {
      options = defaultToStringOptions$1;
    }
    var _getWhitespaceSymbols = getWhitespaceSymbols(options), linebreak = _getWhitespaceSymbols.linebreak;
    if (options.indent == null)
      options.indent = defaultToStringOptions$1.indent;
    if (options.children == null)
      options.children = defaultToStringOptions$1.children;
    if (options.children === false) {
      return this.at + " " + this.id + " {}";
    }
    var children = this.rules.toString(options);
    if (children)
      children = "" + linebreak + children + linebreak;
    return this.at + " " + this.id + " {" + children + "}";
  };
  return KeyframesRule2;
}();
var keyRegExp$1 = /@keyframes\s+/;
var refRegExp$1 = /\$([\w-]+)/g;
var findReferencedKeyframe = function findReferencedKeyframe2(val, keyframes) {
  if (typeof val === "string") {
    return val.replace(refRegExp$1, function(match, name) {
      if (name in keyframes) {
        return keyframes[name];
      }
      warning(false, '[JSS] Referenced keyframes rule "' + name + '" is not defined.');
      return match;
    });
  }
  return val;
};
var replaceRef = function replaceRef2(style, prop, keyframes) {
  var value = style[prop];
  var refKeyframe = findReferencedKeyframe(value, keyframes);
  if (refKeyframe !== value) {
    style[prop] = refKeyframe;
  }
};
var pluginKeyframesRule = {
  onCreateRule: function onCreateRule3(key, frames, options) {
    return typeof key === "string" && keyRegExp$1.test(key) ? new KeyframesRule(key, frames, options) : null;
  },
  // Animation name ref replacer.
  onProcessStyle: function onProcessStyle(style, rule, sheet) {
    if (rule.type !== "style" || !sheet)
      return style;
    if ("animation-name" in style)
      replaceRef(style, "animation-name", sheet.keyframes);
    if ("animation" in style)
      replaceRef(style, "animation", sheet.keyframes);
    return style;
  },
  onChangeValue: function onChangeValue(val, prop, rule) {
    var sheet = rule.options.sheet;
    if (!sheet) {
      return val;
    }
    switch (prop) {
      case "animation":
        return findReferencedKeyframe(val, sheet.keyframes);
      case "animation-name":
        return findReferencedKeyframe(val, sheet.keyframes);
      default:
        return val;
    }
  }
};
var KeyframeRule = /* @__PURE__ */ function(_BaseStyleRule) {
  _inheritsLoose(KeyframeRule2, _BaseStyleRule);
  function KeyframeRule2() {
    return _BaseStyleRule.apply(this, arguments) || this;
  }
  var _proto = KeyframeRule2.prototype;
  _proto.toString = function toString2(options) {
    var sheet = this.options.sheet;
    var link = sheet ? sheet.options.link : false;
    var opts = link ? _extends$1({}, options, {
      allowEmpty: true
    }) : options;
    return toCss(this.key, this.style, opts);
  };
  return KeyframeRule2;
}(BaseStyleRule);
var pluginKeyframeRule = {
  onCreateRule: function onCreateRule4(key, style, options) {
    if (options.parent && options.parent.type === "keyframes") {
      return new KeyframeRule(key, style, options);
    }
    return null;
  }
};
var FontFaceRule = /* @__PURE__ */ function() {
  function FontFaceRule2(key, style, options) {
    this.type = "font-face";
    this.at = "@font-face";
    this.isProcessed = false;
    this.key = key;
    this.style = style;
    this.options = options;
  }
  var _proto = FontFaceRule2.prototype;
  _proto.toString = function toString2(options) {
    var _getWhitespaceSymbols = getWhitespaceSymbols(options), linebreak = _getWhitespaceSymbols.linebreak;
    if (Array.isArray(this.style)) {
      var str = "";
      for (var index = 0; index < this.style.length; index++) {
        str += toCss(this.at, this.style[index]);
        if (this.style[index + 1])
          str += linebreak;
      }
      return str;
    }
    return toCss(this.at, this.style, options);
  };
  return FontFaceRule2;
}();
var keyRegExp$2 = /@font-face/;
var pluginFontFaceRule = {
  onCreateRule: function onCreateRule5(key, style, options) {
    return keyRegExp$2.test(key) ? new FontFaceRule(key, style, options) : null;
  }
};
var ViewportRule = /* @__PURE__ */ function() {
  function ViewportRule2(key, style, options) {
    this.type = "viewport";
    this.at = "@viewport";
    this.isProcessed = false;
    this.key = key;
    this.style = style;
    this.options = options;
  }
  var _proto = ViewportRule2.prototype;
  _proto.toString = function toString2(options) {
    return toCss(this.key, this.style, options);
  };
  return ViewportRule2;
}();
var pluginViewportRule = {
  onCreateRule: function onCreateRule6(key, style, options) {
    return key === "@viewport" || key === "@-ms-viewport" ? new ViewportRule(key, style, options) : null;
  }
};
var SimpleRule = /* @__PURE__ */ function() {
  function SimpleRule2(key, value, options) {
    this.type = "simple";
    this.isProcessed = false;
    this.key = key;
    this.value = value;
    this.options = options;
  }
  var _proto = SimpleRule2.prototype;
  _proto.toString = function toString2(options) {
    if (Array.isArray(this.value)) {
      var str = "";
      for (var index = 0; index < this.value.length; index++) {
        str += this.key + " " + this.value[index] + ";";
        if (this.value[index + 1])
          str += "\n";
      }
      return str;
    }
    return this.key + " " + this.value + ";";
  };
  return SimpleRule2;
}();
var keysMap = {
  "@charset": true,
  "@import": true,
  "@namespace": true
};
var pluginSimpleRule = {
  onCreateRule: function onCreateRule7(key, value, options) {
    return key in keysMap ? new SimpleRule(key, value, options) : null;
  }
};
var plugins$1 = [pluginStyleRule, pluginConditionalRule, pluginKeyframesRule, pluginKeyframeRule, pluginFontFaceRule, pluginViewportRule, pluginSimpleRule];
var defaultUpdateOptions = {
  process: true
};
var forceUpdateOptions = {
  force: true,
  process: true
  /**
   * Contains rules objects and allows adding/removing etc.
   * Is used for e.g. by `StyleSheet` or `ConditionalRule`.
   */
};
var RuleList = /* @__PURE__ */ function() {
  function RuleList2(options) {
    this.map = {};
    this.raw = {};
    this.index = [];
    this.counter = 0;
    this.options = options;
    this.classes = options.classes;
    this.keyframes = options.keyframes;
  }
  var _proto = RuleList2.prototype;
  _proto.add = function add(name, decl, ruleOptions) {
    var _this$options = this.options, parent = _this$options.parent, sheet = _this$options.sheet, jss2 = _this$options.jss, Renderer = _this$options.Renderer, generateId = _this$options.generateId, scoped = _this$options.scoped;
    var options = _extends$1({
      classes: this.classes,
      parent,
      sheet,
      jss: jss2,
      Renderer,
      generateId,
      scoped,
      name,
      keyframes: this.keyframes,
      selector: void 0
    }, ruleOptions);
    var key = name;
    if (name in this.raw) {
      key = name + "-d" + this.counter++;
    }
    this.raw[key] = decl;
    if (key in this.classes) {
      options.selector = "." + escape(this.classes[key]);
    }
    var rule = createRule(key, decl, options);
    if (!rule)
      return null;
    this.register(rule);
    var index = options.index === void 0 ? this.index.length : options.index;
    this.index.splice(index, 0, rule);
    return rule;
  };
  _proto.replace = function replace(name, decl, ruleOptions) {
    var oldRule = this.get(name);
    var oldIndex = this.index.indexOf(oldRule);
    if (oldRule) {
      this.remove(oldRule);
    }
    var options = ruleOptions;
    if (oldIndex !== -1)
      options = _extends$1({}, ruleOptions, {
        index: oldIndex
      });
    return this.add(name, decl, options);
  };
  _proto.get = function get3(nameOrSelector) {
    return this.map[nameOrSelector];
  };
  _proto.remove = function remove(rule) {
    this.unregister(rule);
    delete this.raw[rule.key];
    this.index.splice(this.index.indexOf(rule), 1);
  };
  _proto.indexOf = function indexOf(rule) {
    return this.index.indexOf(rule);
  };
  _proto.process = function process() {
    var plugins2 = this.options.jss.plugins;
    this.index.slice(0).forEach(plugins2.onProcessRule, plugins2);
  };
  _proto.register = function register(rule) {
    this.map[rule.key] = rule;
    if (rule instanceof StyleRule) {
      this.map[rule.selector] = rule;
      if (rule.id)
        this.classes[rule.key] = rule.id;
    } else if (rule instanceof KeyframesRule && this.keyframes) {
      this.keyframes[rule.name] = rule.id;
    }
  };
  _proto.unregister = function unregister(rule) {
    delete this.map[rule.key];
    if (rule instanceof StyleRule) {
      delete this.map[rule.selector];
      delete this.classes[rule.key];
    } else if (rule instanceof KeyframesRule) {
      delete this.keyframes[rule.name];
    }
  };
  _proto.update = function update2() {
    var name;
    var data;
    var options;
    if (typeof (arguments.length <= 0 ? void 0 : arguments[0]) === "string") {
      name = arguments.length <= 0 ? void 0 : arguments[0];
      data = arguments.length <= 1 ? void 0 : arguments[1];
      options = arguments.length <= 2 ? void 0 : arguments[2];
    } else {
      data = arguments.length <= 0 ? void 0 : arguments[0];
      options = arguments.length <= 1 ? void 0 : arguments[1];
      name = null;
    }
    if (name) {
      this.updateOne(this.get(name), data, options);
    } else {
      for (var index = 0; index < this.index.length; index++) {
        this.updateOne(this.index[index], data, options);
      }
    }
  };
  _proto.updateOne = function updateOne(rule, data, options) {
    if (options === void 0) {
      options = defaultUpdateOptions;
    }
    var _this$options2 = this.options, plugins2 = _this$options2.jss.plugins, sheet = _this$options2.sheet;
    if (rule.rules instanceof RuleList2) {
      rule.rules.update(data, options);
      return;
    }
    var style = rule.style;
    plugins2.onUpdate(data, rule, sheet, options);
    if (options.process && style && style !== rule.style) {
      plugins2.onProcessStyle(rule.style, rule, sheet);
      for (var prop in rule.style) {
        var nextValue = rule.style[prop];
        var prevValue = style[prop];
        if (nextValue !== prevValue) {
          rule.prop(prop, nextValue, forceUpdateOptions);
        }
      }
      for (var _prop in style) {
        var _nextValue = rule.style[_prop];
        var _prevValue = style[_prop];
        if (_nextValue == null && _nextValue !== _prevValue) {
          rule.prop(_prop, null, forceUpdateOptions);
        }
      }
    }
  };
  _proto.toString = function toString2(options) {
    var str = "";
    var sheet = this.options.sheet;
    var link = sheet ? sheet.options.link : false;
    var _getWhitespaceSymbols = getWhitespaceSymbols(options), linebreak = _getWhitespaceSymbols.linebreak;
    for (var index = 0; index < this.index.length; index++) {
      var rule = this.index[index];
      var css2 = rule.toString(options);
      if (!css2 && !link)
        continue;
      if (str)
        str += linebreak;
      str += css2;
    }
    return str;
  };
  return RuleList2;
}();
var StyleSheet = /* @__PURE__ */ function() {
  function StyleSheet2(styles8, options) {
    this.attached = false;
    this.deployed = false;
    this.classes = {};
    this.keyframes = {};
    this.options = _extends$1({}, options, {
      sheet: this,
      parent: this,
      classes: this.classes,
      keyframes: this.keyframes
    });
    if (options.Renderer) {
      this.renderer = new options.Renderer(this);
    }
    this.rules = new RuleList(this.options);
    for (var name in styles8) {
      this.rules.add(name, styles8[name]);
    }
    this.rules.process();
  }
  var _proto = StyleSheet2.prototype;
  _proto.attach = function attach2() {
    if (this.attached)
      return this;
    if (this.renderer)
      this.renderer.attach();
    this.attached = true;
    if (!this.deployed)
      this.deploy();
    return this;
  };
  _proto.detach = function detach2() {
    if (!this.attached)
      return this;
    if (this.renderer)
      this.renderer.detach();
    this.attached = false;
    return this;
  };
  _proto.addRule = function addRule(name, decl, options) {
    var queue = this.queue;
    if (this.attached && !queue)
      this.queue = [];
    var rule = this.rules.add(name, decl, options);
    if (!rule)
      return null;
    this.options.jss.plugins.onProcessRule(rule);
    if (this.attached) {
      if (!this.deployed)
        return rule;
      if (queue)
        queue.push(rule);
      else {
        this.insertRule(rule);
        if (this.queue) {
          this.queue.forEach(this.insertRule, this);
          this.queue = void 0;
        }
      }
      return rule;
    }
    this.deployed = false;
    return rule;
  };
  _proto.replaceRule = function replaceRule(nameOrSelector, decl, options) {
    var oldRule = this.rules.get(nameOrSelector);
    if (!oldRule)
      return this.addRule(nameOrSelector, decl, options);
    var newRule = this.rules.replace(nameOrSelector, decl, options);
    if (newRule) {
      this.options.jss.plugins.onProcessRule(newRule);
    }
    if (this.attached) {
      if (!this.deployed)
        return newRule;
      if (this.renderer) {
        if (!newRule) {
          this.renderer.deleteRule(oldRule);
        } else if (oldRule.renderable) {
          this.renderer.replaceRule(oldRule.renderable, newRule);
        }
      }
      return newRule;
    }
    this.deployed = false;
    return newRule;
  };
  _proto.insertRule = function insertRule2(rule) {
    if (this.renderer) {
      this.renderer.insertRule(rule);
    }
  };
  _proto.addRules = function addRules(styles8, options) {
    var added = [];
    for (var name in styles8) {
      var rule = this.addRule(name, styles8[name], options);
      if (rule)
        added.push(rule);
    }
    return added;
  };
  _proto.getRule = function getRule(nameOrSelector) {
    return this.rules.get(nameOrSelector);
  };
  _proto.deleteRule = function deleteRule(name) {
    var rule = typeof name === "object" ? name : this.rules.get(name);
    if (!rule || // Style sheet was created without link: true and attached, in this case we
    // won't be able to remove the CSS rule from the DOM.
    this.attached && !rule.renderable) {
      return false;
    }
    this.rules.remove(rule);
    if (this.attached && rule.renderable && this.renderer) {
      return this.renderer.deleteRule(rule.renderable);
    }
    return true;
  };
  _proto.indexOf = function indexOf(rule) {
    return this.rules.indexOf(rule);
  };
  _proto.deploy = function deploy() {
    if (this.renderer)
      this.renderer.deploy();
    this.deployed = true;
    return this;
  };
  _proto.update = function update2() {
    var _this$rules;
    (_this$rules = this.rules).update.apply(_this$rules, arguments);
    return this;
  };
  _proto.updateOne = function updateOne(rule, data, options) {
    this.rules.updateOne(rule, data, options);
    return this;
  };
  _proto.toString = function toString2(options) {
    return this.rules.toString(options);
  };
  return StyleSheet2;
}();
var PluginsRegistry = /* @__PURE__ */ function() {
  function PluginsRegistry2() {
    this.plugins = {
      internal: [],
      external: []
    };
    this.registry = {};
  }
  var _proto = PluginsRegistry2.prototype;
  _proto.onCreateRule = function onCreateRule8(name, decl, options) {
    for (var i = 0; i < this.registry.onCreateRule.length; i++) {
      var rule = this.registry.onCreateRule[i](name, decl, options);
      if (rule)
        return rule;
    }
    return null;
  };
  _proto.onProcessRule = function onProcessRule(rule) {
    if (rule.isProcessed)
      return;
    var sheet = rule.options.sheet;
    for (var i = 0; i < this.registry.onProcessRule.length; i++) {
      this.registry.onProcessRule[i](rule, sheet);
    }
    if (rule.style)
      this.onProcessStyle(rule.style, rule, sheet);
    rule.isProcessed = true;
  };
  _proto.onProcessStyle = function onProcessStyle2(style, rule, sheet) {
    for (var i = 0; i < this.registry.onProcessStyle.length; i++) {
      rule.style = this.registry.onProcessStyle[i](rule.style, rule, sheet);
    }
  };
  _proto.onProcessSheet = function onProcessSheet(sheet) {
    for (var i = 0; i < this.registry.onProcessSheet.length; i++) {
      this.registry.onProcessSheet[i](sheet);
    }
  };
  _proto.onUpdate = function onUpdate(data, rule, sheet, options) {
    for (var i = 0; i < this.registry.onUpdate.length; i++) {
      this.registry.onUpdate[i](data, rule, sheet, options);
    }
  };
  _proto.onChangeValue = function onChangeValue2(value, prop, rule) {
    var processedValue = value;
    for (var i = 0; i < this.registry.onChangeValue.length; i++) {
      processedValue = this.registry.onChangeValue[i](processedValue, prop, rule);
    }
    return processedValue;
  };
  _proto.use = function use(newPlugin, options) {
    if (options === void 0) {
      options = {
        queue: "external"
      };
    }
    var plugins2 = this.plugins[options.queue];
    if (plugins2.indexOf(newPlugin) !== -1) {
      return;
    }
    plugins2.push(newPlugin);
    this.registry = [].concat(this.plugins.external, this.plugins.internal).reduce(function(registry, plugin) {
      for (var name in plugin) {
        if (name in registry) {
          registry[name].push(plugin[name]);
        } else {
          warning(false, '[JSS] Unknown hook "' + name + '".');
        }
      }
      return registry;
    }, {
      onCreateRule: [],
      onProcessRule: [],
      onProcessStyle: [],
      onProcessSheet: [],
      onChangeValue: [],
      onUpdate: []
    });
  };
  return PluginsRegistry2;
}();
var SheetsRegistry = /* @__PURE__ */ function() {
  function SheetsRegistry2() {
    this.registry = [];
  }
  var _proto = SheetsRegistry2.prototype;
  _proto.add = function add(sheet) {
    var registry = this.registry;
    var index = sheet.options.index;
    if (registry.indexOf(sheet) !== -1)
      return;
    if (registry.length === 0 || index >= this.index) {
      registry.push(sheet);
      return;
    }
    for (var i = 0; i < registry.length; i++) {
      if (registry[i].options.index > index) {
        registry.splice(i, 0, sheet);
        return;
      }
    }
  };
  _proto.reset = function reset() {
    this.registry = [];
  };
  _proto.remove = function remove(sheet) {
    var index = this.registry.indexOf(sheet);
    this.registry.splice(index, 1);
  };
  _proto.toString = function toString2(_temp) {
    var _ref = _temp === void 0 ? {} : _temp, attached = _ref.attached, options = _objectWithoutPropertiesLoose(_ref, ["attached"]);
    var _getWhitespaceSymbols = getWhitespaceSymbols(options), linebreak = _getWhitespaceSymbols.linebreak;
    var css2 = "";
    for (var i = 0; i < this.registry.length; i++) {
      var sheet = this.registry[i];
      if (attached != null && sheet.attached !== attached) {
        continue;
      }
      if (css2)
        css2 += linebreak;
      css2 += sheet.toString(options);
    }
    return css2;
  };
  _createClass(SheetsRegistry2, [{
    key: "index",
    /**
     * Current highest index number.
     */
    get: function get3() {
      return this.registry.length === 0 ? 0 : this.registry[this.registry.length - 1].options.index;
    }
  }]);
  return SheetsRegistry2;
}();
var sheets = new SheetsRegistry();
var globalThis$1 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" && window.Math === Math ? window : typeof self !== "undefined" && self.Math === Math ? self : Function("return this")();
var ns = "2f1acc6c3a606b082e5eef5e54414ffb";
if (globalThis$1[ns] == null)
  globalThis$1[ns] = 0;
var moduleId = globalThis$1[ns]++;
var maxRules = 1e10;
var createGenerateId = function createGenerateId2(options) {
  if (options === void 0) {
    options = {};
  }
  var ruleCounter = 0;
  var generateId = function generateId2(rule, sheet) {
    ruleCounter += 1;
    if (ruleCounter > maxRules) {
      warning(false, "[JSS] You might have a memory leak. Rule counter is at " + ruleCounter + ".");
    }
    var jssId = "";
    var prefix2 = "";
    if (sheet) {
      if (sheet.options.classNamePrefix) {
        prefix2 = sheet.options.classNamePrefix;
      }
      if (sheet.options.jss.id != null) {
        jssId = String(sheet.options.jss.id);
      }
    }
    if (options.minify) {
      return "" + (prefix2 || "c") + moduleId + jssId + ruleCounter;
    }
    return prefix2 + rule.key + "-" + moduleId + (jssId ? "-" + jssId : "") + "-" + ruleCounter;
  };
  return generateId;
};
var memoize = function memoize2(fn) {
  var value;
  return function() {
    if (!value)
      value = fn();
    return value;
  };
};
var getPropertyValue = function getPropertyValue2(cssRule, prop) {
  try {
    if (cssRule.attributeStyleMap) {
      return cssRule.attributeStyleMap.get(prop);
    }
    return cssRule.style.getPropertyValue(prop);
  } catch (err) {
    return "";
  }
};
var setProperty = function setProperty2(cssRule, prop, value) {
  try {
    var cssValue = value;
    if (Array.isArray(value)) {
      cssValue = toCssValue(value);
    }
    if (cssRule.attributeStyleMap) {
      cssRule.attributeStyleMap.set(prop, cssValue);
    } else {
      var indexOfImportantFlag = cssValue ? cssValue.indexOf("!important") : -1;
      var cssValueWithoutImportantFlag = indexOfImportantFlag > -1 ? cssValue.substr(0, indexOfImportantFlag - 1) : cssValue;
      cssRule.style.setProperty(prop, cssValueWithoutImportantFlag, indexOfImportantFlag > -1 ? "important" : "");
    }
  } catch (err) {
    return false;
  }
  return true;
};
var removeProperty = function removeProperty2(cssRule, prop) {
  try {
    if (cssRule.attributeStyleMap) {
      cssRule.attributeStyleMap.delete(prop);
    } else {
      cssRule.style.removeProperty(prop);
    }
  } catch (err) {
    warning(false, '[JSS] DOMException "' + err.message + '" was thrown. Tried to remove property "' + prop + '".');
  }
};
var setSelector = function setSelector2(cssRule, selectorText) {
  cssRule.selectorText = selectorText;
  return cssRule.selectorText === selectorText;
};
var getHead = memoize(function() {
  return document.querySelector("head");
});
function findHigherSheet(registry, options) {
  for (var i = 0; i < registry.length; i++) {
    var sheet = registry[i];
    if (sheet.attached && sheet.options.index > options.index && sheet.options.insertionPoint === options.insertionPoint) {
      return sheet;
    }
  }
  return null;
}
function findHighestSheet(registry, options) {
  for (var i = registry.length - 1; i >= 0; i--) {
    var sheet = registry[i];
    if (sheet.attached && sheet.options.insertionPoint === options.insertionPoint) {
      return sheet;
    }
  }
  return null;
}
function findCommentNode(text) {
  var head = getHead();
  for (var i = 0; i < head.childNodes.length; i++) {
    var node = head.childNodes[i];
    if (node.nodeType === 8 && node.nodeValue.trim() === text) {
      return node;
    }
  }
  return null;
}
function findPrevNode(options) {
  var registry = sheets.registry;
  if (registry.length > 0) {
    var sheet = findHigherSheet(registry, options);
    if (sheet && sheet.renderer) {
      return {
        parent: sheet.renderer.element.parentNode,
        node: sheet.renderer.element
      };
    }
    sheet = findHighestSheet(registry, options);
    if (sheet && sheet.renderer) {
      return {
        parent: sheet.renderer.element.parentNode,
        node: sheet.renderer.element.nextSibling
      };
    }
  }
  var insertionPoint = options.insertionPoint;
  if (insertionPoint && typeof insertionPoint === "string") {
    var comment = findCommentNode(insertionPoint);
    if (comment) {
      return {
        parent: comment.parentNode,
        node: comment.nextSibling
      };
    }
    warning(false, '[JSS] Insertion point "' + insertionPoint + '" not found.');
  }
  return false;
}
function insertStyle(style, options) {
  var insertionPoint = options.insertionPoint;
  var nextNode = findPrevNode(options);
  if (nextNode !== false && nextNode.parent) {
    nextNode.parent.insertBefore(style, nextNode.node);
    return;
  }
  if (insertionPoint && typeof insertionPoint.nodeType === "number") {
    var insertionPointElement = insertionPoint;
    var parentNode = insertionPointElement.parentNode;
    if (parentNode)
      parentNode.insertBefore(style, insertionPointElement.nextSibling);
    else
      warning(false, "[JSS] Insertion point is not in the DOM.");
    return;
  }
  getHead().appendChild(style);
}
var getNonce = memoize(function() {
  var node = document.querySelector('meta[property="csp-nonce"]');
  return node ? node.getAttribute("content") : null;
});
var _insertRule = function insertRule(container, rule, index) {
  try {
    if ("insertRule" in container) {
      container.insertRule(rule, index);
    } else if ("appendRule" in container) {
      container.appendRule(rule);
    }
  } catch (err) {
    warning(false, "[JSS] " + err.message);
    return false;
  }
  return container.cssRules[index];
};
var getValidRuleInsertionIndex = function getValidRuleInsertionIndex2(container, index) {
  var maxIndex = container.cssRules.length;
  if (index === void 0 || index > maxIndex) {
    return maxIndex;
  }
  return index;
};
var createStyle = function createStyle2() {
  var el2 = document.createElement("style");
  el2.textContent = "\n";
  return el2;
};
var DomRenderer = /* @__PURE__ */ function() {
  function DomRenderer2(sheet) {
    this.getPropertyValue = getPropertyValue;
    this.setProperty = setProperty;
    this.removeProperty = removeProperty;
    this.setSelector = setSelector;
    this.hasInsertedRules = false;
    this.cssRules = [];
    if (sheet)
      sheets.add(sheet);
    this.sheet = sheet;
    var _ref = this.sheet ? this.sheet.options : {}, media = _ref.media, meta = _ref.meta, element = _ref.element;
    this.element = element || createStyle();
    this.element.setAttribute("data-jss", "");
    if (media)
      this.element.setAttribute("media", media);
    if (meta)
      this.element.setAttribute("data-meta", meta);
    var nonce = getNonce();
    if (nonce)
      this.element.setAttribute("nonce", nonce);
  }
  var _proto = DomRenderer2.prototype;
  _proto.attach = function attach2() {
    if (this.element.parentNode || !this.sheet)
      return;
    insertStyle(this.element, this.sheet.options);
    var deployed = Boolean(this.sheet && this.sheet.deployed);
    if (this.hasInsertedRules && deployed) {
      this.hasInsertedRules = false;
      this.deploy();
    }
  };
  _proto.detach = function detach2() {
    if (!this.sheet)
      return;
    var parentNode = this.element.parentNode;
    if (parentNode)
      parentNode.removeChild(this.element);
    if (this.sheet.options.link) {
      this.cssRules = [];
      this.element.textContent = "\n";
    }
  };
  _proto.deploy = function deploy() {
    var sheet = this.sheet;
    if (!sheet)
      return;
    if (sheet.options.link) {
      this.insertRules(sheet.rules);
      return;
    }
    this.element.textContent = "\n" + sheet.toString() + "\n";
  };
  _proto.insertRules = function insertRules(rules, nativeParent) {
    for (var i = 0; i < rules.index.length; i++) {
      this.insertRule(rules.index[i], i, nativeParent);
    }
  };
  _proto.insertRule = function insertRule2(rule, index, nativeParent) {
    if (nativeParent === void 0) {
      nativeParent = this.element.sheet;
    }
    if (rule.rules) {
      var parent = rule;
      var latestNativeParent = nativeParent;
      if (rule.type === "conditional" || rule.type === "keyframes") {
        var _insertionIndex = getValidRuleInsertionIndex(nativeParent, index);
        latestNativeParent = _insertRule(nativeParent, parent.toString({
          children: false
        }), _insertionIndex);
        if (latestNativeParent === false) {
          return false;
        }
        this.refCssRule(rule, _insertionIndex, latestNativeParent);
      }
      this.insertRules(parent.rules, latestNativeParent);
      return latestNativeParent;
    }
    var ruleStr = rule.toString();
    if (!ruleStr)
      return false;
    var insertionIndex = getValidRuleInsertionIndex(nativeParent, index);
    var nativeRule = _insertRule(nativeParent, ruleStr, insertionIndex);
    if (nativeRule === false) {
      return false;
    }
    this.hasInsertedRules = true;
    this.refCssRule(rule, insertionIndex, nativeRule);
    return nativeRule;
  };
  _proto.refCssRule = function refCssRule(rule, index, cssRule) {
    rule.renderable = cssRule;
    if (rule.options.parent instanceof StyleSheet) {
      this.cssRules.splice(index, 0, cssRule);
    }
  };
  _proto.deleteRule = function deleteRule(cssRule) {
    var sheet = this.element.sheet;
    var index = this.indexOf(cssRule);
    if (index === -1)
      return false;
    sheet.deleteRule(index);
    this.cssRules.splice(index, 1);
    return true;
  };
  _proto.indexOf = function indexOf(cssRule) {
    return this.cssRules.indexOf(cssRule);
  };
  _proto.replaceRule = function replaceRule(cssRule, rule) {
    var index = this.indexOf(cssRule);
    if (index === -1)
      return false;
    this.element.sheet.deleteRule(index);
    this.cssRules.splice(index, 1);
    return this.insertRule(rule, index);
  };
  _proto.getRules = function getRules() {
    return this.element.sheet.cssRules;
  };
  return DomRenderer2;
}();
var instanceCounter = 0;
var Jss = /* @__PURE__ */ function() {
  function Jss2(options) {
    this.id = instanceCounter++;
    this.version = "10.10.0";
    this.plugins = new PluginsRegistry();
    this.options = {
      id: {
        minify: false
      },
      createGenerateId,
      Renderer: isBrowser ? DomRenderer : null,
      plugins: []
    };
    this.generateId = createGenerateId({
      minify: false
    });
    for (var i = 0; i < plugins$1.length; i++) {
      this.plugins.use(plugins$1[i], {
        queue: "internal"
      });
    }
    this.setup(options);
  }
  var _proto = Jss2.prototype;
  _proto.setup = function setup(options) {
    if (options === void 0) {
      options = {};
    }
    if (options.createGenerateId) {
      this.options.createGenerateId = options.createGenerateId;
    }
    if (options.id) {
      this.options.id = _extends$1({}, this.options.id, options.id);
    }
    if (options.createGenerateId || options.id) {
      this.generateId = this.options.createGenerateId(this.options.id);
    }
    if (options.insertionPoint != null)
      this.options.insertionPoint = options.insertionPoint;
    if ("Renderer" in options) {
      this.options.Renderer = options.Renderer;
    }
    if (options.plugins)
      this.use.apply(this, options.plugins);
    return this;
  };
  _proto.createStyleSheet = function createStyleSheet(styles8, options) {
    if (options === void 0) {
      options = {};
    }
    var _options = options, index = _options.index;
    if (typeof index !== "number") {
      index = sheets.index === 0 ? 0 : sheets.index + 1;
    }
    var sheet = new StyleSheet(styles8, _extends$1({}, options, {
      jss: this,
      generateId: options.generateId || this.generateId,
      insertionPoint: this.options.insertionPoint,
      Renderer: this.options.Renderer,
      index
    }));
    this.plugins.onProcessSheet(sheet);
    return sheet;
  };
  _proto.removeStyleSheet = function removeStyleSheet(sheet) {
    sheet.detach();
    sheets.remove(sheet);
    return this;
  };
  _proto.createRule = function createRule$1(name, style, options) {
    if (style === void 0) {
      style = {};
    }
    if (options === void 0) {
      options = {};
    }
    if (typeof name === "object") {
      return this.createRule(void 0, name, style);
    }
    var ruleOptions = _extends$1({}, options, {
      name,
      jss: this,
      Renderer: this.options.Renderer
    });
    if (!ruleOptions.generateId)
      ruleOptions.generateId = this.generateId;
    if (!ruleOptions.classes)
      ruleOptions.classes = {};
    if (!ruleOptions.keyframes)
      ruleOptions.keyframes = {};
    var rule = createRule(name, style, ruleOptions);
    if (rule)
      this.plugins.onProcessRule(rule);
    return rule;
  };
  _proto.use = function use() {
    var _this = this;
    for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
      plugins2[_key] = arguments[_key];
    }
    plugins2.forEach(function(plugin) {
      _this.plugins.use(plugin);
    });
    return this;
  };
  return Jss2;
}();
var createJss = function createJss2(options) {
  return new Jss(options);
};
var hasCSSTOMSupport = typeof CSS === "object" && CSS != null && "number" in CSS;
function getDynamicStyles(styles8) {
  var to = null;
  for (var key in styles8) {
    var value = styles8[key];
    var type = typeof value;
    if (type === "function") {
      if (!to)
        to = {};
      to[key] = value;
    } else if (type === "object" && value !== null && !Array.isArray(value)) {
      var extracted = getDynamicStyles(value);
      if (extracted) {
        if (!to)
          to = {};
        to[key] = extracted;
      }
    }
  }
  return to;
}
/**
 * A better abstraction over CSS.
 *
 * @copyright Oleg Isonen (Slobodskoi) / Isonen 2014-present
 * @website https://github.com/cssinjs/jss
 * @license MIT
 */
createJss();
var now = Date.now();
var fnValuesNs = "fnValues" + now;
var fnRuleNs = "fnStyle" + ++now;
var functionPlugin = function functionPlugin2() {
  return {
    onCreateRule: function onCreateRule8(name, decl, options) {
      if (typeof decl !== "function")
        return null;
      var rule = createRule(name, {}, options);
      rule[fnRuleNs] = decl;
      return rule;
    },
    onProcessStyle: function onProcessStyle2(style, rule) {
      if (fnValuesNs in rule || fnRuleNs in rule)
        return style;
      var fnValues = {};
      for (var prop in style) {
        var value = style[prop];
        if (typeof value !== "function")
          continue;
        delete style[prop];
        fnValues[prop] = value;
      }
      rule[fnValuesNs] = fnValues;
      return style;
    },
    onUpdate: function onUpdate(data, rule, sheet, options) {
      var styleRule = rule;
      var fnRule = styleRule[fnRuleNs];
      if (fnRule) {
        styleRule.style = fnRule(data) || {};
      }
      var fnValues = styleRule[fnValuesNs];
      if (fnValues) {
        for (var _prop in fnValues) {
          styleRule.prop(_prop, fnValues[_prop](data), options);
        }
      }
    }
  };
};
const functions = functionPlugin;
var at = "@global";
var atPrefix = "@global ";
var GlobalContainerRule = /* @__PURE__ */ function() {
  function GlobalContainerRule2(key, styles8, options) {
    this.type = "global";
    this.at = at;
    this.isProcessed = false;
    this.key = key;
    this.options = options;
    this.rules = new RuleList(_extends$1({}, options, {
      parent: this
    }));
    for (var selector in styles8) {
      this.rules.add(selector, styles8[selector]);
    }
    this.rules.process();
  }
  var _proto = GlobalContainerRule2.prototype;
  _proto.getRule = function getRule(name) {
    return this.rules.get(name);
  };
  _proto.addRule = function addRule(name, style, options) {
    var rule = this.rules.add(name, style, options);
    if (rule)
      this.options.jss.plugins.onProcessRule(rule);
    return rule;
  };
  _proto.replaceRule = function replaceRule(name, style, options) {
    var newRule = this.rules.replace(name, style, options);
    if (newRule)
      this.options.jss.plugins.onProcessRule(newRule);
    return newRule;
  };
  _proto.indexOf = function indexOf(rule) {
    return this.rules.indexOf(rule);
  };
  _proto.toString = function toString2(options) {
    return this.rules.toString(options);
  };
  return GlobalContainerRule2;
}();
var GlobalPrefixedRule = /* @__PURE__ */ function() {
  function GlobalPrefixedRule2(key, style, options) {
    this.type = "global";
    this.at = at;
    this.isProcessed = false;
    this.key = key;
    this.options = options;
    var selector = key.substr(atPrefix.length);
    this.rule = options.jss.createRule(selector, style, _extends$1({}, options, {
      parent: this
    }));
  }
  var _proto2 = GlobalPrefixedRule2.prototype;
  _proto2.toString = function toString2(options) {
    return this.rule ? this.rule.toString(options) : "";
  };
  return GlobalPrefixedRule2;
}();
var separatorRegExp$1 = /\s*,\s*/g;
function addScope(selector, scope) {
  var parts = selector.split(separatorRegExp$1);
  var scoped = "";
  for (var i = 0; i < parts.length; i++) {
    scoped += scope + " " + parts[i].trim();
    if (parts[i + 1])
      scoped += ", ";
  }
  return scoped;
}
function handleNestedGlobalContainerRule(rule, sheet) {
  var options = rule.options, style = rule.style;
  var rules = style ? style[at] : null;
  if (!rules)
    return;
  for (var name in rules) {
    sheet.addRule(name, rules[name], _extends$1({}, options, {
      selector: addScope(name, rule.selector)
    }));
  }
  delete style[at];
}
function handlePrefixedGlobalRule(rule, sheet) {
  var options = rule.options, style = rule.style;
  for (var prop in style) {
    if (prop[0] !== "@" || prop.substr(0, at.length) !== at)
      continue;
    var selector = addScope(prop.substr(at.length), rule.selector);
    sheet.addRule(selector, style[prop], _extends$1({}, options, {
      selector
    }));
    delete style[prop];
  }
}
function jssGlobal() {
  function onCreateRule8(name, styles8, options) {
    if (!name)
      return null;
    if (name === at) {
      return new GlobalContainerRule(name, styles8, options);
    }
    if (name[0] === "@" && name.substr(0, atPrefix.length) === atPrefix) {
      return new GlobalPrefixedRule(name, styles8, options);
    }
    var parent = options.parent;
    if (parent) {
      if (parent.type === "global" || parent.options.parent && parent.options.parent.type === "global") {
        options.scoped = false;
      }
    }
    if (!options.selector && options.scoped === false) {
      options.selector = name;
    }
    return null;
  }
  function onProcessRule(rule, sheet) {
    if (rule.type !== "style" || !sheet)
      return;
    handleNestedGlobalContainerRule(rule, sheet);
    handlePrefixedGlobalRule(rule, sheet);
  }
  return {
    onCreateRule: onCreateRule8,
    onProcessRule
  };
}
var separatorRegExp = /\s*,\s*/g;
var parentRegExp = /&/g;
var refRegExp = /\$([\w-]+)/g;
function jssNested() {
  function getReplaceRef(container, sheet) {
    return function(match, key) {
      var rule = container.getRule(key) || sheet && sheet.getRule(key);
      if (rule) {
        return rule.selector;
      }
      warning(false, '[JSS] Could not find the referenced rule "' + key + '" in "' + (container.options.meta || container.toString()) + '".');
      return key;
    };
  }
  function replaceParentRefs(nestedProp, parentProp) {
    var parentSelectors = parentProp.split(separatorRegExp);
    var nestedSelectors = nestedProp.split(separatorRegExp);
    var result = "";
    for (var i = 0; i < parentSelectors.length; i++) {
      var parent = parentSelectors[i];
      for (var j = 0; j < nestedSelectors.length; j++) {
        var nested2 = nestedSelectors[j];
        if (result)
          result += ", ";
        result += nested2.indexOf("&") !== -1 ? nested2.replace(parentRegExp, parent) : parent + " " + nested2;
      }
    }
    return result;
  }
  function getOptions(rule, container, prevOptions) {
    if (prevOptions)
      return _extends$1({}, prevOptions, {
        index: prevOptions.index + 1
      });
    var nestingLevel = rule.options.nestingLevel;
    nestingLevel = nestingLevel === void 0 ? 1 : nestingLevel + 1;
    var options = _extends$1({}, rule.options, {
      nestingLevel,
      index: container.indexOf(rule) + 1
      // We don't need the parent name to be set options for chlid.
    });
    delete options.name;
    return options;
  }
  function onProcessStyle2(style, rule, sheet) {
    if (rule.type !== "style")
      return style;
    var styleRule = rule;
    var container = styleRule.options.parent;
    var options;
    var replaceRef3;
    for (var prop in style) {
      var isNested = prop.indexOf("&") !== -1;
      var isNestedConditional = prop[0] === "@";
      if (!isNested && !isNestedConditional)
        continue;
      options = getOptions(styleRule, container, options);
      if (isNested) {
        var selector = replaceParentRefs(prop, styleRule.selector);
        if (!replaceRef3)
          replaceRef3 = getReplaceRef(container, sheet);
        selector = selector.replace(refRegExp, replaceRef3);
        var name = styleRule.key + "-" + prop;
        if ("replaceRule" in container) {
          container.replaceRule(name, style[prop], _extends$1({}, options, {
            selector
          }));
        } else {
          container.addRule(name, style[prop], _extends$1({}, options, {
            selector
          }));
        }
      } else if (isNestedConditional) {
        container.addRule(prop, {}, options).addRule(styleRule.key, style[prop], {
          selector: styleRule.selector
        });
      }
      delete style[prop];
    }
    return style;
  }
  return {
    onProcessStyle: onProcessStyle2
  };
}
var uppercasePattern = /[A-Z]/g;
var msPattern = /^ms-/;
var cache$2 = {};
function toHyphenLower(match) {
  return "-" + match.toLowerCase();
}
function hyphenateStyleName(name) {
  if (cache$2.hasOwnProperty(name)) {
    return cache$2[name];
  }
  var hName = name.replace(uppercasePattern, toHyphenLower);
  return cache$2[name] = msPattern.test(hName) ? "-" + hName : hName;
}
function convertCase(style) {
  var converted = {};
  for (var prop in style) {
    var key = prop.indexOf("--") === 0 ? prop : hyphenateStyleName(prop);
    converted[key] = style[prop];
  }
  if (style.fallbacks) {
    if (Array.isArray(style.fallbacks))
      converted.fallbacks = style.fallbacks.map(convertCase);
    else
      converted.fallbacks = convertCase(style.fallbacks);
  }
  return converted;
}
function camelCase() {
  function onProcessStyle2(style) {
    if (Array.isArray(style)) {
      for (var index = 0; index < style.length; index++) {
        style[index] = convertCase(style[index]);
      }
      return style;
    }
    return convertCase(style);
  }
  function onChangeValue2(value, prop, rule) {
    if (prop.indexOf("--") === 0) {
      return value;
    }
    var hyphenatedProp = hyphenateStyleName(prop);
    if (prop === hyphenatedProp)
      return value;
    rule.prop(hyphenatedProp, value);
    return null;
  }
  return {
    onProcessStyle: onProcessStyle2,
    onChangeValue: onChangeValue2
  };
}
var px = hasCSSTOMSupport && CSS ? CSS.px : "px";
var ms = hasCSSTOMSupport && CSS ? CSS.ms : "ms";
var percent = hasCSSTOMSupport && CSS ? CSS.percent : "%";
var defaultUnits = {
  // Animation properties
  "animation-delay": ms,
  "animation-duration": ms,
  // Background properties
  "background-position": px,
  "background-position-x": px,
  "background-position-y": px,
  "background-size": px,
  // Border Properties
  border: px,
  "border-bottom": px,
  "border-bottom-left-radius": px,
  "border-bottom-right-radius": px,
  "border-bottom-width": px,
  "border-left": px,
  "border-left-width": px,
  "border-radius": px,
  "border-right": px,
  "border-right-width": px,
  "border-top": px,
  "border-top-left-radius": px,
  "border-top-right-radius": px,
  "border-top-width": px,
  "border-width": px,
  "border-block": px,
  "border-block-end": px,
  "border-block-end-width": px,
  "border-block-start": px,
  "border-block-start-width": px,
  "border-block-width": px,
  "border-inline": px,
  "border-inline-end": px,
  "border-inline-end-width": px,
  "border-inline-start": px,
  "border-inline-start-width": px,
  "border-inline-width": px,
  "border-start-start-radius": px,
  "border-start-end-radius": px,
  "border-end-start-radius": px,
  "border-end-end-radius": px,
  // Margin properties
  margin: px,
  "margin-bottom": px,
  "margin-left": px,
  "margin-right": px,
  "margin-top": px,
  "margin-block": px,
  "margin-block-end": px,
  "margin-block-start": px,
  "margin-inline": px,
  "margin-inline-end": px,
  "margin-inline-start": px,
  // Padding properties
  padding: px,
  "padding-bottom": px,
  "padding-left": px,
  "padding-right": px,
  "padding-top": px,
  "padding-block": px,
  "padding-block-end": px,
  "padding-block-start": px,
  "padding-inline": px,
  "padding-inline-end": px,
  "padding-inline-start": px,
  // Mask properties
  "mask-position-x": px,
  "mask-position-y": px,
  "mask-size": px,
  // Width and height properties
  height: px,
  width: px,
  "min-height": px,
  "max-height": px,
  "min-width": px,
  "max-width": px,
  // Position properties
  bottom: px,
  left: px,
  top: px,
  right: px,
  inset: px,
  "inset-block": px,
  "inset-block-end": px,
  "inset-block-start": px,
  "inset-inline": px,
  "inset-inline-end": px,
  "inset-inline-start": px,
  // Shadow properties
  "box-shadow": px,
  "text-shadow": px,
  // Column properties
  "column-gap": px,
  "column-rule": px,
  "column-rule-width": px,
  "column-width": px,
  // Font and text properties
  "font-size": px,
  "font-size-delta": px,
  "letter-spacing": px,
  "text-decoration-thickness": px,
  "text-indent": px,
  "text-stroke": px,
  "text-stroke-width": px,
  "word-spacing": px,
  // Motion properties
  motion: px,
  "motion-offset": px,
  // Outline properties
  outline: px,
  "outline-offset": px,
  "outline-width": px,
  // Perspective properties
  perspective: px,
  "perspective-origin-x": percent,
  "perspective-origin-y": percent,
  // Transform properties
  "transform-origin": percent,
  "transform-origin-x": percent,
  "transform-origin-y": percent,
  "transform-origin-z": percent,
  // Transition properties
  "transition-delay": ms,
  "transition-duration": ms,
  // Alignment properties
  "vertical-align": px,
  "flex-basis": px,
  // Some random properties
  "shape-margin": px,
  size: px,
  gap: px,
  // Grid properties
  grid: px,
  "grid-gap": px,
  "row-gap": px,
  "grid-row-gap": px,
  "grid-column-gap": px,
  "grid-template-rows": px,
  "grid-template-columns": px,
  "grid-auto-rows": px,
  "grid-auto-columns": px,
  // Not existing properties.
  // Used to avoid issues with jss-plugin-expand integration.
  "box-shadow-x": px,
  "box-shadow-y": px,
  "box-shadow-blur": px,
  "box-shadow-spread": px,
  "font-line-height": px,
  "text-shadow-x": px,
  "text-shadow-y": px,
  "text-shadow-blur": px
};
function addCamelCasedVersion(obj) {
  var regExp2 = /(-[a-z])/g;
  var replace = function replace2(str) {
    return str[1].toUpperCase();
  };
  var newObj = {};
  for (var key in obj) {
    newObj[key] = obj[key];
    newObj[key.replace(regExp2, replace)] = obj[key];
  }
  return newObj;
}
var units = addCamelCasedVersion(defaultUnits);
function iterate(prop, value, options) {
  if (value == null)
    return value;
  if (Array.isArray(value)) {
    for (var i = 0; i < value.length; i++) {
      value[i] = iterate(prop, value[i], options);
    }
  } else if (typeof value === "object") {
    if (prop === "fallbacks") {
      for (var innerProp in value) {
        value[innerProp] = iterate(innerProp, value[innerProp], options);
      }
    } else {
      for (var _innerProp in value) {
        value[_innerProp] = iterate(prop + "-" + _innerProp, value[_innerProp], options);
      }
    }
  } else if (typeof value === "number" && isNaN(value) === false) {
    var unit = options[prop] || units[prop];
    if (unit && !(value === 0 && unit === px)) {
      return typeof unit === "function" ? unit(value).toString() : "" + value + unit;
    }
    return value.toString();
  }
  return value;
}
function defaultUnit(options) {
  if (options === void 0) {
    options = {};
  }
  var camelCasedOptions = addCamelCasedVersion(options);
  function onProcessStyle2(style, rule) {
    if (rule.type !== "style")
      return style;
    for (var prop in style) {
      style[prop] = iterate(prop, style[prop], camelCasedOptions);
    }
    return style;
  }
  function onChangeValue2(value, prop) {
    return iterate(prop, value, camelCasedOptions);
  }
  return {
    onProcessStyle: onProcessStyle2,
    onChangeValue: onChangeValue2
  };
}
var js = "";
var css = "";
var vendor = "";
var browser = "";
var isTouch = isBrowser && "ontouchstart" in document.documentElement;
if (isBrowser) {
  var jsCssMap = {
    Moz: "-moz-",
    ms: "-ms-",
    O: "-o-",
    Webkit: "-webkit-"
  };
  var _document$createEleme = document.createElement("p"), style = _document$createEleme.style;
  var testProp = "Transform";
  for (var key in jsCssMap) {
    if (key + testProp in style) {
      js = key;
      css = jsCssMap[key];
      break;
    }
  }
  if (js === "Webkit" && "msHyphens" in style) {
    js = "ms";
    css = jsCssMap.ms;
    browser = "edge";
  }
  if (js === "Webkit" && "-apple-trailing-word" in style) {
    vendor = "apple";
  }
}
var prefix = {
  js,
  css,
  vendor,
  browser,
  isTouch
};
function supportedKeyframes(key) {
  if (key[1] === "-")
    return key;
  if (prefix.js === "ms")
    return key;
  return "@" + prefix.css + "keyframes" + key.substr(10);
}
var appearence = {
  noPrefill: ["appearance"],
  supportedProperty: function supportedProperty(prop) {
    if (prop !== "appearance")
      return false;
    if (prefix.js === "ms")
      return "-webkit-" + prop;
    return prefix.css + prop;
  }
};
var colorAdjust = {
  noPrefill: ["color-adjust"],
  supportedProperty: function supportedProperty2(prop) {
    if (prop !== "color-adjust")
      return false;
    if (prefix.js === "Webkit")
      return prefix.css + "print-" + prop;
    return prop;
  }
};
var regExp = /[-\s]+(.)?/g;
function toUpper(match, c) {
  return c ? c.toUpperCase() : "";
}
function camelize(str) {
  return str.replace(regExp, toUpper);
}
function pascalize(str) {
  return camelize("-" + str);
}
var mask = {
  noPrefill: ["mask"],
  supportedProperty: function supportedProperty3(prop, style) {
    if (!/^mask/.test(prop))
      return false;
    if (prefix.js === "Webkit") {
      var longhand = "mask-image";
      if (camelize(longhand) in style) {
        return prop;
      }
      if (prefix.js + pascalize(longhand) in style) {
        return prefix.css + prop;
      }
    }
    return prop;
  }
};
var textOrientation = {
  noPrefill: ["text-orientation"],
  supportedProperty: function supportedProperty4(prop) {
    if (prop !== "text-orientation")
      return false;
    if (prefix.vendor === "apple" && !prefix.isTouch) {
      return prefix.css + prop;
    }
    return prop;
  }
};
var transform = {
  noPrefill: ["transform"],
  supportedProperty: function supportedProperty5(prop, style, options) {
    if (prop !== "transform")
      return false;
    if (options.transform) {
      return prop;
    }
    return prefix.css + prop;
  }
};
var transition = {
  noPrefill: ["transition"],
  supportedProperty: function supportedProperty6(prop, style, options) {
    if (prop !== "transition")
      return false;
    if (options.transition) {
      return prop;
    }
    return prefix.css + prop;
  }
};
var writingMode = {
  noPrefill: ["writing-mode"],
  supportedProperty: function supportedProperty7(prop) {
    if (prop !== "writing-mode")
      return false;
    if (prefix.js === "Webkit" || prefix.js === "ms" && prefix.browser !== "edge") {
      return prefix.css + prop;
    }
    return prop;
  }
};
var userSelect = {
  noPrefill: ["user-select"],
  supportedProperty: function supportedProperty8(prop) {
    if (prop !== "user-select")
      return false;
    if (prefix.js === "Moz" || prefix.js === "ms" || prefix.vendor === "apple") {
      return prefix.css + prop;
    }
    return prop;
  }
};
var breakPropsOld = {
  supportedProperty: function supportedProperty9(prop, style) {
    if (!/^break-/.test(prop))
      return false;
    if (prefix.js === "Webkit") {
      var jsProp = "WebkitColumn" + pascalize(prop);
      return jsProp in style ? prefix.css + "column-" + prop : false;
    }
    if (prefix.js === "Moz") {
      var _jsProp = "page" + pascalize(prop);
      return _jsProp in style ? "page-" + prop : false;
    }
    return false;
  }
};
var inlineLogicalOld = {
  supportedProperty: function supportedProperty10(prop, style) {
    if (!/^(border|margin|padding)-inline/.test(prop))
      return false;
    if (prefix.js === "Moz")
      return prop;
    var newProp = prop.replace("-inline", "");
    return prefix.js + pascalize(newProp) in style ? prefix.css + newProp : false;
  }
};
var unprefixed = {
  supportedProperty: function supportedProperty11(prop, style) {
    return camelize(prop) in style ? prop : false;
  }
};
var prefixed = {
  supportedProperty: function supportedProperty12(prop, style) {
    var pascalized = pascalize(prop);
    if (prop[0] === "-")
      return prop;
    if (prop[0] === "-" && prop[1] === "-")
      return prop;
    if (prefix.js + pascalized in style)
      return prefix.css + prop;
    if (prefix.js !== "Webkit" && "Webkit" + pascalized in style)
      return "-webkit-" + prop;
    return false;
  }
};
var scrollSnap = {
  supportedProperty: function supportedProperty13(prop) {
    if (prop.substring(0, 11) !== "scroll-snap")
      return false;
    if (prefix.js === "ms") {
      return "" + prefix.css + prop;
    }
    return prop;
  }
};
var overscrollBehavior = {
  supportedProperty: function supportedProperty14(prop) {
    if (prop !== "overscroll-behavior")
      return false;
    if (prefix.js === "ms") {
      return prefix.css + "scroll-chaining";
    }
    return prop;
  }
};
var propMap = {
  "flex-grow": "flex-positive",
  "flex-shrink": "flex-negative",
  "flex-basis": "flex-preferred-size",
  "justify-content": "flex-pack",
  order: "flex-order",
  "align-items": "flex-align",
  "align-content": "flex-line-pack"
  // 'align-self' is handled by 'align-self' plugin.
};
var flex2012 = {
  supportedProperty: function supportedProperty15(prop, style) {
    var newProp = propMap[prop];
    if (!newProp)
      return false;
    return prefix.js + pascalize(newProp) in style ? prefix.css + newProp : false;
  }
};
var propMap$1 = {
  flex: "box-flex",
  "flex-grow": "box-flex",
  "flex-direction": ["box-orient", "box-direction"],
  order: "box-ordinal-group",
  "align-items": "box-align",
  "flex-flow": ["box-orient", "box-direction"],
  "justify-content": "box-pack"
};
var propKeys = Object.keys(propMap$1);
var prefixCss = function prefixCss2(p) {
  return prefix.css + p;
};
var flex2009 = {
  supportedProperty: function supportedProperty16(prop, style, _ref) {
    var multiple = _ref.multiple;
    if (propKeys.indexOf(prop) > -1) {
      var newProp = propMap$1[prop];
      if (!Array.isArray(newProp)) {
        return prefix.js + pascalize(newProp) in style ? prefix.css + newProp : false;
      }
      if (!multiple)
        return false;
      for (var i = 0; i < newProp.length; i++) {
        if (!(prefix.js + pascalize(newProp[0]) in style)) {
          return false;
        }
      }
      return newProp.map(prefixCss);
    }
    return false;
  }
};
var plugins = [appearence, colorAdjust, mask, textOrientation, transform, transition, writingMode, userSelect, breakPropsOld, inlineLogicalOld, unprefixed, prefixed, scrollSnap, overscrollBehavior, flex2012, flex2009];
var propertyDetectors = plugins.filter(function(p) {
  return p.supportedProperty;
}).map(function(p) {
  return p.supportedProperty;
});
var noPrefill = plugins.filter(function(p) {
  return p.noPrefill;
}).reduce(function(a, p) {
  a.push.apply(a, _toConsumableArray(p.noPrefill));
  return a;
}, []);
var el;
var cache = {};
if (isBrowser) {
  el = document.createElement("p");
  var computed = window.getComputedStyle(document.documentElement, "");
  for (var key$1 in computed) {
    if (!isNaN(key$1))
      cache[computed[key$1]] = computed[key$1];
  }
  noPrefill.forEach(function(x) {
    return delete cache[x];
  });
}
function supportedProperty17(prop, options) {
  if (options === void 0) {
    options = {};
  }
  if (!el)
    return prop;
  if (cache[prop] != null) {
    return cache[prop];
  }
  if (prop === "transition" || prop === "transform") {
    options[prop] = prop in el.style;
  }
  for (var i = 0; i < propertyDetectors.length; i++) {
    cache[prop] = propertyDetectors[i](prop, el.style, options);
    if (cache[prop])
      break;
  }
  try {
    el.style[prop] = "";
  } catch (err) {
    return false;
  }
  return cache[prop];
}
var cache$1 = {};
var transitionProperties = {
  transition: 1,
  "transition-property": 1,
  "-webkit-transition": 1,
  "-webkit-transition-property": 1
};
var transPropsRegExp = /(^\s*[\w-]+)|, (\s*[\w-]+)(?![^()]*\))/g;
var el$1;
function prefixTransitionCallback(match, p1, p2) {
  if (p1 === "var")
    return "var";
  if (p1 === "all")
    return "all";
  if (p2 === "all")
    return ", all";
  var prefixedValue = p1 ? supportedProperty17(p1) : ", " + supportedProperty17(p2);
  if (!prefixedValue)
    return p1 || p2;
  return prefixedValue;
}
if (isBrowser)
  el$1 = document.createElement("p");
function supportedValue(property2, value) {
  var prefixedValue = value;
  if (!el$1 || property2 === "content")
    return value;
  if (typeof prefixedValue !== "string" || !isNaN(parseInt(prefixedValue, 10))) {
    return prefixedValue;
  }
  var cacheKey = property2 + prefixedValue;
  if (cache$1[cacheKey] != null) {
    return cache$1[cacheKey];
  }
  try {
    el$1.style[property2] = prefixedValue;
  } catch (err) {
    cache$1[cacheKey] = false;
    return false;
  }
  if (transitionProperties[property2]) {
    prefixedValue = prefixedValue.replace(transPropsRegExp, prefixTransitionCallback);
  } else if (el$1.style[property2] === "") {
    prefixedValue = prefix.css + prefixedValue;
    if (prefixedValue === "-ms-flex")
      el$1.style[property2] = "-ms-flexbox";
    el$1.style[property2] = prefixedValue;
    if (el$1.style[property2] === "") {
      cache$1[cacheKey] = false;
      return false;
    }
  }
  el$1.style[property2] = "";
  cache$1[cacheKey] = prefixedValue;
  return cache$1[cacheKey];
}
function jssVendorPrefixer() {
  function onProcessRule(rule) {
    if (rule.type === "keyframes") {
      var atRule = rule;
      atRule.at = supportedKeyframes(atRule.at);
    }
  }
  function prefixStyle(style) {
    for (var prop in style) {
      var value = style[prop];
      if (prop === "fallbacks" && Array.isArray(value)) {
        style[prop] = value.map(prefixStyle);
        continue;
      }
      var changeProp = false;
      var supportedProp = supportedProperty17(prop);
      if (supportedProp && supportedProp !== prop)
        changeProp = true;
      var changeValue = false;
      var supportedValue$1 = supportedValue(supportedProp, toCssValue(value));
      if (supportedValue$1 && supportedValue$1 !== value)
        changeValue = true;
      if (changeProp || changeValue) {
        if (changeProp)
          delete style[prop];
        style[supportedProp || prop] = supportedValue$1 || value;
      }
    }
    return style;
  }
  function onProcessStyle2(style, rule) {
    if (rule.type !== "style")
      return style;
    return prefixStyle(style);
  }
  function onChangeValue2(value, prop) {
    return supportedValue(prop, toCssValue(value)) || value;
  }
  return {
    onProcessRule,
    onProcessStyle: onProcessStyle2,
    onChangeValue: onChangeValue2
  };
}
function jssPropsSort() {
  var sort = function sort2(prop0, prop1) {
    if (prop0.length === prop1.length) {
      return prop0 > prop1 ? 1 : -1;
    }
    return prop0.length - prop1.length;
  };
  return {
    onProcessStyle: function onProcessStyle2(style, rule) {
      if (rule.type !== "style")
        return style;
      var newStyle = {};
      var props = Object.keys(style).sort(sort);
      for (var i = 0; i < props.length; i++) {
        newStyle[props[i]] = style[props[i]];
      }
      return newStyle;
    }
  };
}
function jssPreset() {
  return {
    plugins: [
      functions(),
      jssGlobal(),
      jssNested(),
      camelCase(),
      defaultUnit(),
      // Disable the vendor prefixer server-side, it does nothing.
      // This way, we can get a performance boost.
      // In the documentation, we are using `autoprefixer` to solve this problem.
      typeof window === "undefined" ? null : jssVendorPrefixer(),
      jssPropsSort()
    ]
  };
}
function mergeClasses() {
  var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  var baseClasses = options.baseClasses, newClasses = options.newClasses, Component = options.Component;
  if (!newClasses) {
    return baseClasses;
  }
  var nextClasses = _extends$1({}, baseClasses);
  {
    if (typeof newClasses === "string") {
      console.error(["Material-UI: The value `".concat(newClasses, "` ") + "provided to the classes prop of ".concat(getDisplayName(Component), " is incorrect."), "You might want to use the className prop instead."].join("\n"));
      return baseClasses;
    }
  }
  Object.keys(newClasses).forEach(function(key) {
    {
      if (!baseClasses[key] && newClasses[key]) {
        console.error(["Material-UI: The key `".concat(key, "` ") + "provided to the classes prop is not implemented in ".concat(getDisplayName(Component), "."), "You can only override one of the following: ".concat(Object.keys(baseClasses).join(","), ".")].join("\n"));
      }
      if (newClasses[key] && typeof newClasses[key] !== "string") {
        console.error(["Material-UI: The key `".concat(key, "` ") + "provided to the classes prop is not valid for ".concat(getDisplayName(Component), "."), "You need to provide a non empty string instead of: ".concat(newClasses[key], ".")].join("\n"));
      }
    }
    if (newClasses[key]) {
      nextClasses[key] = "".concat(baseClasses[key], " ").concat(newClasses[key]);
    }
  });
  return nextClasses;
}
var multiKeyStore = {
  set: function set(cache2, key1, key2, value) {
    var subCache = cache2.get(key1);
    if (!subCache) {
      subCache = /* @__PURE__ */ new Map();
      cache2.set(key1, subCache);
    }
    subCache.set(key2, value);
  },
  get: function get2(cache2, key1, key2) {
    var subCache = cache2.get(key1);
    return subCache ? subCache.get(key2) : void 0;
  },
  delete: function _delete(cache2, key1, key2) {
    var subCache = cache2.get(key1);
    subCache.delete(key2);
  }
};
const multiKeyStore$1 = multiKeyStore;
var ThemeContext = React__default.createContext(null);
{
  ThemeContext.displayName = "ThemeContext";
}
const ThemeContext$1 = ThemeContext;
function useTheme() {
  var theme = React__default.useContext(ThemeContext$1);
  {
    React__default.useDebugValue(theme);
  }
  return theme;
}
var jss = createJss(jssPreset());
var generateClassName = createGenerateClassName();
var sheetsManager = /* @__PURE__ */ new Map();
var defaultOptions = {
  disableGeneration: false,
  generateClassName,
  jss,
  sheetsCache: null,
  sheetsManager,
  sheetsRegistry: null
};
var StylesContext = React__default.createContext(defaultOptions);
{
  StylesContext.displayName = "StylesContext";
}
var injectFirstNode;
function StylesProvider(props) {
  var children = props.children, _props$injectFirst = props.injectFirst, injectFirst = _props$injectFirst === void 0 ? false : _props$injectFirst, _props$disableGenerat = props.disableGeneration, disableGeneration = _props$disableGenerat === void 0 ? false : _props$disableGenerat, localOptions = _objectWithoutProperties(props, ["children", "injectFirst", "disableGeneration"]);
  var outerOptions = React__default.useContext(StylesContext);
  var context = _extends$1({}, outerOptions, {
    disableGeneration
  }, localOptions);
  {
    if (typeof window === "undefined" && !context.sheetsManager) {
      console.error("Material-UI: You need to use the ServerStyleSheets API when rendering on the server.");
    }
  }
  {
    if (context.jss.options.insertionPoint && injectFirst) {
      console.error("Material-UI: You cannot use a custom insertionPoint and <StylesContext injectFirst> at the same time.");
    }
  }
  {
    if (injectFirst && localOptions.jss) {
      console.error("Material-UI: You cannot use the jss and injectFirst props at the same time.");
    }
  }
  if (!context.jss.options.insertionPoint && injectFirst && typeof window !== "undefined") {
    if (!injectFirstNode) {
      var head = document.head;
      injectFirstNode = document.createComment("mui-inject-first");
      head.insertBefore(injectFirstNode, head.firstChild);
    }
    context.jss = createJss({
      plugins: jssPreset().plugins,
      insertionPoint: injectFirstNode
    });
  }
  return /* @__PURE__ */ React__default.createElement(StylesContext.Provider, {
    value: context
  }, children);
}
StylesProvider.propTypes = {
  /**
   * Your component tree.
   */
  children: PropTypes.node.isRequired,
  /**
   * You can disable the generation of the styles with this option.
   * It can be useful when traversing the React tree outside of the HTML
   * rendering step on the server.
   * Let's say you are using react-apollo to extract all
   * the queries made by the interface server-side - you can significantly speed up the traversal with this prop.
   */
  disableGeneration: PropTypes.bool,
  /**
   * JSS's class name generator.
   */
  generateClassName: PropTypes.func,
  /**
   * By default, the styles are injected last in the <head> element of the page.
   * As a result, they gain more specificity than any other style sheet.
   * If you want to override Material-UI's styles, set this prop.
   */
  injectFirst: PropTypes.bool,
  /**
   * JSS's instance.
   */
  jss: PropTypes.object,
  /**
   * @ignore
   */
  serverGenerateClassName: PropTypes.func,
  /**
   * @ignore
   *
   * Beta feature.
   *
   * Cache for the sheets.
   */
  sheetsCache: PropTypes.object,
  /**
   * @ignore
   *
   * The sheetsManager is used to deduplicate style sheet injection in the page.
   * It's deduplicating using the (theme, styles) couple.
   * On the server, you should provide a new instance for each request.
   */
  sheetsManager: PropTypes.object,
  /**
   * @ignore
   *
   * Collect the sheets.
   */
  sheetsRegistry: PropTypes.object
};
{
  StylesProvider.propTypes = exactProp(StylesProvider.propTypes);
}
var indexCounter = -1e9;
function increment() {
  indexCounter += 1;
  {
    if (indexCounter >= 0) {
      console.warn(["Material-UI: You might have a memory leak.", "The indexCounter is not supposed to grow that much."].join("\n"));
    }
  }
  return indexCounter;
}
var noopTheme = {};
const noopTheme$1 = noopTheme;
function getStylesCreator(stylesOrCreator) {
  var themingEnabled = typeof stylesOrCreator === "function";
  {
    if (_typeof$2(stylesOrCreator) !== "object" && !themingEnabled) {
      console.error(["Material-UI: The `styles` argument provided is invalid.", "You need to provide a function generating the styles or a styles object."].join("\n"));
    }
  }
  return {
    create: function create2(theme, name) {
      var styles8;
      try {
        styles8 = themingEnabled ? stylesOrCreator(theme) : stylesOrCreator;
      } catch (err) {
        {
          if (themingEnabled === true && theme === noopTheme$1) {
            console.error(["Material-UI: The `styles` argument provided is invalid.", "You are providing a function without a theme in the context.", "One of the parent elements needs to use a ThemeProvider."].join("\n"));
          }
        }
        throw err;
      }
      if (!name || !theme.overrides || !theme.overrides[name]) {
        return styles8;
      }
      var overrides = theme.overrides[name];
      var stylesWithOverrides = _extends$1({}, styles8);
      Object.keys(overrides).forEach(function(key) {
        {
          if (!stylesWithOverrides[key]) {
            console.warn(["Material-UI: You are trying to override a style that does not exist.", "Fix the `".concat(key, "` key of `theme.overrides.").concat(name, "`.")].join("\n"));
          }
        }
        stylesWithOverrides[key] = deepmerge(stylesWithOverrides[key], overrides[key]);
      });
      return stylesWithOverrides;
    },
    options: {}
  };
}
function getClasses(_ref, classes, Component) {
  var state = _ref.state, stylesOptions = _ref.stylesOptions;
  if (stylesOptions.disableGeneration) {
    return classes || {};
  }
  if (!state.cacheClasses) {
    state.cacheClasses = {
      // Cache for the finalized classes value.
      value: null,
      // Cache for the last used classes prop pointer.
      lastProp: null,
      // Cache for the last used rendered classes pointer.
      lastJSS: {}
    };
  }
  var generate = false;
  if (state.classes !== state.cacheClasses.lastJSS) {
    state.cacheClasses.lastJSS = state.classes;
    generate = true;
  }
  if (classes !== state.cacheClasses.lastProp) {
    state.cacheClasses.lastProp = classes;
    generate = true;
  }
  if (generate) {
    state.cacheClasses.value = mergeClasses({
      baseClasses: state.cacheClasses.lastJSS,
      newClasses: classes,
      Component
    });
  }
  return state.cacheClasses.value;
}
function attach(_ref2, props) {
  var state = _ref2.state, theme = _ref2.theme, stylesOptions = _ref2.stylesOptions, stylesCreator = _ref2.stylesCreator, name = _ref2.name;
  if (stylesOptions.disableGeneration) {
    return;
  }
  var sheetManager = multiKeyStore$1.get(stylesOptions.sheetsManager, stylesCreator, theme);
  if (!sheetManager) {
    sheetManager = {
      refs: 0,
      staticSheet: null,
      dynamicStyles: null
    };
    multiKeyStore$1.set(stylesOptions.sheetsManager, stylesCreator, theme, sheetManager);
  }
  var options = _extends$1({}, stylesCreator.options, stylesOptions, {
    theme,
    flip: typeof stylesOptions.flip === "boolean" ? stylesOptions.flip : theme.direction === "rtl"
  });
  options.generateId = options.serverGenerateClassName || options.generateClassName;
  var sheetsRegistry = stylesOptions.sheetsRegistry;
  if (sheetManager.refs === 0) {
    var staticSheet;
    if (stylesOptions.sheetsCache) {
      staticSheet = multiKeyStore$1.get(stylesOptions.sheetsCache, stylesCreator, theme);
    }
    var styles8 = stylesCreator.create(theme, name);
    if (!staticSheet) {
      staticSheet = stylesOptions.jss.createStyleSheet(styles8, _extends$1({
        link: false
      }, options));
      staticSheet.attach();
      if (stylesOptions.sheetsCache) {
        multiKeyStore$1.set(stylesOptions.sheetsCache, stylesCreator, theme, staticSheet);
      }
    }
    if (sheetsRegistry) {
      sheetsRegistry.add(staticSheet);
    }
    sheetManager.staticSheet = staticSheet;
    sheetManager.dynamicStyles = getDynamicStyles(styles8);
  }
  if (sheetManager.dynamicStyles) {
    var dynamicSheet = stylesOptions.jss.createStyleSheet(sheetManager.dynamicStyles, _extends$1({
      link: true
    }, options));
    dynamicSheet.update(props);
    dynamicSheet.attach();
    state.dynamicSheet = dynamicSheet;
    state.classes = mergeClasses({
      baseClasses: sheetManager.staticSheet.classes,
      newClasses: dynamicSheet.classes
    });
    if (sheetsRegistry) {
      sheetsRegistry.add(dynamicSheet);
    }
  } else {
    state.classes = sheetManager.staticSheet.classes;
  }
  sheetManager.refs += 1;
}
function update(_ref3, props) {
  var state = _ref3.state;
  if (state.dynamicSheet) {
    state.dynamicSheet.update(props);
  }
}
function detach(_ref4) {
  var state = _ref4.state, theme = _ref4.theme, stylesOptions = _ref4.stylesOptions, stylesCreator = _ref4.stylesCreator;
  if (stylesOptions.disableGeneration) {
    return;
  }
  var sheetManager = multiKeyStore$1.get(stylesOptions.sheetsManager, stylesCreator, theme);
  sheetManager.refs -= 1;
  var sheetsRegistry = stylesOptions.sheetsRegistry;
  if (sheetManager.refs === 0) {
    multiKeyStore$1.delete(stylesOptions.sheetsManager, stylesCreator, theme);
    stylesOptions.jss.removeStyleSheet(sheetManager.staticSheet);
    if (sheetsRegistry) {
      sheetsRegistry.remove(sheetManager.staticSheet);
    }
  }
  if (state.dynamicSheet) {
    stylesOptions.jss.removeStyleSheet(state.dynamicSheet);
    if (sheetsRegistry) {
      sheetsRegistry.remove(state.dynamicSheet);
    }
  }
}
function useSynchronousEffect(func, values2) {
  var key = React__default.useRef([]);
  var output;
  var currentKey = React__default.useMemo(function() {
    return {};
  }, values2);
  if (key.current !== currentKey) {
    key.current = currentKey;
    output = func();
  }
  React__default.useEffect(
    function() {
      return function() {
        if (output) {
          output();
        }
      };
    },
    [currentKey]
    // eslint-disable-line react-hooks/exhaustive-deps
  );
}
function makeStyles$1(stylesOrCreator) {
  var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  var name = options.name, classNamePrefixOption = options.classNamePrefix, Component = options.Component, _options$defaultTheme = options.defaultTheme, defaultTheme2 = _options$defaultTheme === void 0 ? noopTheme$1 : _options$defaultTheme, stylesOptions2 = _objectWithoutProperties(options, ["name", "classNamePrefix", "Component", "defaultTheme"]);
  var stylesCreator = getStylesCreator(stylesOrCreator);
  var classNamePrefix = name || classNamePrefixOption || "makeStyles";
  stylesCreator.options = {
    index: increment(),
    name,
    meta: classNamePrefix,
    classNamePrefix
  };
  var useStyles2 = function useStyles3() {
    var props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var theme = useTheme() || defaultTheme2;
    var stylesOptions = _extends$1({}, React__default.useContext(StylesContext), stylesOptions2);
    var instance = React__default.useRef();
    var shouldUpdate = React__default.useRef();
    useSynchronousEffect(function() {
      var current = {
        name,
        state: {},
        stylesCreator,
        stylesOptions,
        theme
      };
      attach(current, props);
      shouldUpdate.current = false;
      instance.current = current;
      return function() {
        detach(current);
      };
    }, [theme, stylesCreator]);
    React__default.useEffect(function() {
      if (shouldUpdate.current) {
        update(instance.current, props);
      }
      shouldUpdate.current = true;
    });
    var classes = getClasses(instance.current, props.classes, Component);
    {
      React__default.useDebugValue(classes);
    }
    return classes;
  };
  return useStyles2;
}
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e)
    n += e;
  else if ("object" == typeof e)
    if (Array.isArray(e))
      for (t = 0; t < e.length; t++)
        e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    else
      for (t in e)
        e[t] && (n && (n += " "), n += t);
  return n;
}
function clsx() {
  for (var e, t, f = 0, n = ""; f < arguments.length; )
    (e = arguments[f++]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
const clsx_m = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clsx,
  default: clsx
}, Symbol.toStringTag, { value: "Module" }));
var reactIs = reactIsExports$1;
var REACT_STATICS = {
  childContextTypes: true,
  contextType: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  getDerivedStateFromError: true,
  getDerivedStateFromProps: true,
  mixins: true,
  propTypes: true,
  type: true
};
var KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true
};
var FORWARD_REF_STATICS = {
  "$$typeof": true,
  render: true,
  defaultProps: true,
  displayName: true,
  propTypes: true
};
var MEMO_STATICS = {
  "$$typeof": true,
  compare: true,
  defaultProps: true,
  displayName: true,
  propTypes: true,
  type: true
};
var TYPE_STATICS = {};
TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;
function getStatics(component) {
  if (reactIs.isMemo(component)) {
    return MEMO_STATICS;
  }
  return TYPE_STATICS[component["$$typeof"]] || REACT_STATICS;
}
var defineProperty$1 = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf$1 = Object.getPrototypeOf;
var objectPrototype = Object.prototype;
function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
  if (typeof sourceComponent !== "string") {
    if (objectPrototype) {
      var inheritedComponent = getPrototypeOf$1(sourceComponent);
      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
      }
    }
    var keys2 = getOwnPropertyNames(sourceComponent);
    if (getOwnPropertySymbols) {
      keys2 = keys2.concat(getOwnPropertySymbols(sourceComponent));
    }
    var targetStatics = getStatics(targetComponent);
    var sourceStatics = getStatics(sourceComponent);
    for (var i = 0; i < keys2.length; ++i) {
      var key = keys2[i];
      if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
        var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
        try {
          defineProperty$1(targetComponent, key, descriptor);
        } catch (e) {
        }
      }
    }
  }
  return targetComponent;
}
var hoistNonReactStatics_cjs = hoistNonReactStatics;
const hoistNonReactStatics$1 = /* @__PURE__ */ getDefaultExportFromCjs(hoistNonReactStatics_cjs);
var withStyles$1 = function withStyles(stylesOrCreator) {
  var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  return function(Component) {
    var defaultTheme2 = options.defaultTheme, _options$withTheme = options.withTheme, withTheme = _options$withTheme === void 0 ? false : _options$withTheme, name = options.name, stylesOptions = _objectWithoutProperties(options, ["defaultTheme", "withTheme", "name"]);
    {
      if (Component === void 0) {
        throw new Error(["You are calling withStyles(styles)(Component) with an undefined component.", "You may have forgotten to import it."].join("\n"));
      }
    }
    var classNamePrefix = name;
    {
      if (!name) {
        var displayName = getDisplayName(Component);
        if (displayName !== void 0) {
          classNamePrefix = displayName;
        }
      }
    }
    var useStyles2 = makeStyles$1(stylesOrCreator, _extends$1({
      defaultTheme: defaultTheme2,
      Component,
      name: name || Component.displayName,
      classNamePrefix
    }, stylesOptions));
    var WithStyles = /* @__PURE__ */ React__default.forwardRef(function WithStyles2(props, ref) {
      props.classes;
      var innerRef = props.innerRef, other = _objectWithoutProperties(props, ["classes", "innerRef"]);
      var classes = useStyles2(_extends$1({}, Component.defaultProps, props));
      var theme;
      var more = other;
      if (typeof name === "string" || withTheme) {
        theme = useTheme() || defaultTheme2;
        if (name) {
          more = getThemeProps({
            theme,
            name,
            props: other
          });
        }
        if (withTheme && !more.theme) {
          more.theme = theme;
        }
      }
      return /* @__PURE__ */ React__default.createElement(Component, _extends$1({
        ref: innerRef || ref,
        classes
      }, more));
    });
    WithStyles.propTypes = {
      /**
       * Override or extend the styles applied to the component.
       */
      classes: PropTypes.object,
      /**
       * Use that prop to pass a ref to the decorated component.
       * @deprecated
       */
      innerRef: chainPropTypes(PropTypes.oneOfType([PropTypes.func, PropTypes.object]), function(props) {
        if (props.innerRef == null) {
          return null;
        }
        return null;
      })
    };
    {
      WithStyles.displayName = "WithStyles(".concat(getDisplayName(Component), ")");
    }
    hoistNonReactStatics$1(WithStyles, Component);
    {
      WithStyles.Naked = Component;
      WithStyles.options = options;
      WithStyles.useStyles = useStyles2;
    }
    return WithStyles;
  };
};
const withStylesWithoutDefault = withStyles$1;
var defaultTheme = createTheme();
const defaultTheme$1 = defaultTheme;
function makeStyles(stylesOrCreator) {
  var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  return makeStyles$1(stylesOrCreator, _extends$1({
    defaultTheme: defaultTheme$1
  }, options));
}
function withStyles2(stylesOrCreator, options) {
  return withStylesWithoutDefault(stylesOrCreator, _extends$1({
    defaultTheme: defaultTheme$1
  }, options));
}
function capitalize(string) {
  if (typeof string !== "string") {
    throw new Error("Material-UI: capitalize(string) expects a string argument.");
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}
var styles$7 = function styles(theme) {
  return {
    /* Styles applied to the root element. */
    root: {
      userSelect: "none",
      width: "1em",
      height: "1em",
      display: "inline-block",
      fill: "currentColor",
      flexShrink: 0,
      fontSize: theme.typography.pxToRem(24),
      transition: theme.transitions.create("fill", {
        duration: theme.transitions.duration.shorter
      })
    },
    /* Styles applied to the root element if `color="primary"`. */
    colorPrimary: {
      color: theme.palette.primary.main
    },
    /* Styles applied to the root element if `color="secondary"`. */
    colorSecondary: {
      color: theme.palette.secondary.main
    },
    /* Styles applied to the root element if `color="action"`. */
    colorAction: {
      color: theme.palette.action.active
    },
    /* Styles applied to the root element if `color="error"`. */
    colorError: {
      color: theme.palette.error.main
    },
    /* Styles applied to the root element if `color="disabled"`. */
    colorDisabled: {
      color: theme.palette.action.disabled
    },
    /* Styles applied to the root element if `fontSize="inherit"`. */
    fontSizeInherit: {
      fontSize: "inherit"
    },
    /* Styles applied to the root element if `fontSize="small"`. */
    fontSizeSmall: {
      fontSize: theme.typography.pxToRem(20)
    },
    /* Styles applied to the root element if `fontSize="large"`. */
    fontSizeLarge: {
      fontSize: theme.typography.pxToRem(35)
    }
  };
};
var SvgIcon = /* @__PURE__ */ React.forwardRef(function SvgIcon2(props, ref) {
  var children = props.children, classes = props.classes, className = props.className, _props$color = props.color, color = _props$color === void 0 ? "inherit" : _props$color, _props$component = props.component, Component = _props$component === void 0 ? "svg" : _props$component, _props$fontSize = props.fontSize, fontSize = _props$fontSize === void 0 ? "medium" : _props$fontSize, htmlColor = props.htmlColor, titleAccess = props.titleAccess, _props$viewBox = props.viewBox, viewBox = _props$viewBox === void 0 ? "0 0 24 24" : _props$viewBox, other = _objectWithoutProperties(props, ["children", "classes", "className", "color", "component", "fontSize", "htmlColor", "titleAccess", "viewBox"]);
  return /* @__PURE__ */ React.createElement(Component, _extends$1({
    className: clsx(classes.root, className, color !== "inherit" && classes["color".concat(capitalize(color))], fontSize !== "default" && fontSize !== "medium" && classes["fontSize".concat(capitalize(fontSize))]),
    focusable: "false",
    viewBox,
    color: htmlColor,
    "aria-hidden": titleAccess ? void 0 : true,
    role: titleAccess ? "img" : void 0,
    ref
  }, other), children, titleAccess ? /* @__PURE__ */ React.createElement("title", null, titleAccess) : null);
});
SvgIcon.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------
  /**
   * Node passed into the SVG element.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The color of the component. It supports those theme colors that make sense for this component.
   * You can use the `htmlColor` prop to apply a color attribute to the SVG element.
   */
  color: PropTypes.oneOf(["action", "disabled", "error", "inherit", "primary", "secondary"]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * The fontSize applied to the icon. Defaults to 24px, but can be configure to inherit font size.
   */
  fontSize: chainPropTypes(PropTypes.oneOf(["default", "inherit", "large", "medium", "small"]), function(props) {
    var fontSize = props.fontSize;
    if (fontSize === "default") {
      throw new Error('Material-UI: `fontSize="default"` is deprecated. Use `fontSize="medium"` instead.');
    }
    return null;
  }),
  /**
   * Applies a color attribute to the SVG element.
   */
  htmlColor: PropTypes.string,
  /**
   * The shape-rendering attribute. The behavior of the different options is described on the
   * [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering).
   * If you are having issues with blurry icons you should investigate this property.
   */
  shapeRendering: PropTypes.string,
  /**
   * Provides a human-readable title for the element that contains it.
   * https://www.w3.org/TR/SVG-access/#Equivalent
   */
  titleAccess: PropTypes.string,
  /**
   * Allows you to redefine what the coordinates without units mean inside an SVG element.
   * For example, if the SVG element is 500 (width) by 200 (height),
   * and you pass viewBox="0 0 50 20",
   * this means that the coordinates inside the SVG will go from the top left corner (0,0)
   * to bottom right (50,20) and each unit will be worth 10px.
   */
  viewBox: PropTypes.string
};
SvgIcon.muiName = "SvgIcon";
const SvgIcon$1 = withStyles2(styles$7, {
  name: "MuiSvgIcon"
})(SvgIcon);
function createSvgIcon(path, displayName) {
  var Component = function Component2(props, ref) {
    return /* @__PURE__ */ React__default.createElement(SvgIcon$1, _extends$1({
      ref
    }, props), path);
  };
  {
    Component.displayName = "".concat(displayName, "Icon");
  }
  Component.muiName = SvgIcon$1.muiName;
  return /* @__PURE__ */ React__default.memo(/* @__PURE__ */ React__default.forwardRef(Component));
}
function deprecatedPropType(validator, reason) {
  return function(props, propName, componentName, location, propFullName) {
    var componentNameSafe = componentName || "<<anonymous>>";
    var propFullNameSafe = propFullName || propName;
    if (typeof props[propName] !== "undefined") {
      return new Error("The ".concat(location, " `").concat(propFullNameSafe, "` of ") + "`".concat(componentNameSafe, "` is deprecated. ").concat(reason));
    }
    return null;
  };
}
function setRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}
function useControlled(_ref) {
  var controlled = _ref.controlled, defaultProp = _ref.default, name = _ref.name, _ref$state = _ref.state, state = _ref$state === void 0 ? "value" : _ref$state;
  var _React$useRef = React.useRef(controlled !== void 0), isControlled = _React$useRef.current;
  var _React$useState = React.useState(defaultProp), valueState = _React$useState[0], setValue = _React$useState[1];
  var value = isControlled ? controlled : valueState;
  {
    React.useEffect(function() {
      if (isControlled !== (controlled !== void 0)) {
        console.error(["Material-UI: A component is changing the ".concat(isControlled ? "" : "un", "controlled ").concat(state, " state of ").concat(name, " to be ").concat(isControlled ? "un" : "", "controlled."), "Elements should not switch from uncontrolled to controlled (or vice versa).", "Decide between using a controlled or uncontrolled ".concat(name, " ") + "element for the lifetime of the component.", "The nature of the state is determined during the first render, it's considered controlled if the value is not `undefined`.", "More info: https://fb.me/react-controlled-components"].join("\n"));
      }
    }, [controlled]);
    var _React$useRef2 = React.useRef(defaultProp), defaultValue = _React$useRef2.current;
    React.useEffect(function() {
      if (!isControlled && defaultValue !== defaultProp) {
        console.error(["Material-UI: A component is changing the default ".concat(state, " state of an uncontrolled ").concat(name, " after being initialized. ") + "To suppress this warning opt to use a controlled ".concat(name, ".")].join("\n"));
      }
    }, [JSON.stringify(defaultProp)]);
  }
  var setValueIfUncontrolled = React.useCallback(function(newValue) {
    if (!isControlled) {
      setValue(newValue);
    }
  }, []);
  return [value, setValueIfUncontrolled];
}
var useEnhancedEffect$1 = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
function useEventCallback(fn) {
  var ref = React.useRef(fn);
  useEnhancedEffect$1(function() {
    ref.current = fn;
  });
  return React.useCallback(function() {
    return ref.current.apply(void 0, arguments);
  }, []);
}
function useForkRef(refA, refB) {
  return React.useMemo(function() {
    if (refA == null && refB == null) {
      return null;
    }
    return function(refValue) {
      setRef(refA, refValue);
      setRef(refB, refValue);
    };
  }, [refA, refB]);
}
var hadKeyboardEvent = true;
var hadFocusVisibleRecently = false;
var hadFocusVisibleRecentlyTimeout = null;
var inputTypesWhitelist = {
  text: true,
  search: true,
  url: true,
  tel: true,
  email: true,
  password: true,
  number: true,
  date: true,
  month: true,
  week: true,
  time: true,
  datetime: true,
  "datetime-local": true
};
function focusTriggersKeyboardModality(node) {
  var type = node.type, tagName = node.tagName;
  if (tagName === "INPUT" && inputTypesWhitelist[type] && !node.readOnly) {
    return true;
  }
  if (tagName === "TEXTAREA" && !node.readOnly) {
    return true;
  }
  if (node.isContentEditable) {
    return true;
  }
  return false;
}
function handleKeyDown(event) {
  if (event.metaKey || event.altKey || event.ctrlKey) {
    return;
  }
  hadKeyboardEvent = true;
}
function handlePointerDown() {
  hadKeyboardEvent = false;
}
function handleVisibilityChange() {
  if (this.visibilityState === "hidden") {
    if (hadFocusVisibleRecently) {
      hadKeyboardEvent = true;
    }
  }
}
function prepare(doc) {
  doc.addEventListener("keydown", handleKeyDown, true);
  doc.addEventListener("mousedown", handlePointerDown, true);
  doc.addEventListener("pointerdown", handlePointerDown, true);
  doc.addEventListener("touchstart", handlePointerDown, true);
  doc.addEventListener("visibilitychange", handleVisibilityChange, true);
}
function isFocusVisible(event) {
  var target = event.target;
  try {
    return target.matches(":focus-visible");
  } catch (error) {
  }
  return hadKeyboardEvent || focusTriggersKeyboardModality(target);
}
function handleBlurVisible() {
  hadFocusVisibleRecently = true;
  window.clearTimeout(hadFocusVisibleRecentlyTimeout);
  hadFocusVisibleRecentlyTimeout = window.setTimeout(function() {
    hadFocusVisibleRecently = false;
  }, 100);
}
function useIsFocusVisible() {
  var ref = React.useCallback(function(instance) {
    var node = ReactDOM.findDOMNode(instance);
    if (node != null) {
      prepare(node.ownerDocument);
    }
  }, []);
  {
    React.useDebugValue(isFocusVisible);
  }
  return {
    isFocusVisible,
    onBlurVisible: handleBlurVisible,
    ref
  };
}
const TransitionGroupContext = React__default.createContext(null);
function getChildMapping(children, mapFn) {
  var mapper = function mapper2(child) {
    return mapFn && isValidElement(child) ? mapFn(child) : child;
  };
  var result = /* @__PURE__ */ Object.create(null);
  if (children)
    Children.map(children, function(c) {
      return c;
    }).forEach(function(child) {
      result[child.key] = mapper(child);
    });
  return result;
}
function mergeChildMappings(prev, next) {
  prev = prev || {};
  next = next || {};
  function getValueForKey(key) {
    return key in next ? next[key] : prev[key];
  }
  var nextKeysPending = /* @__PURE__ */ Object.create(null);
  var pendingKeys = [];
  for (var prevKey in prev) {
    if (prevKey in next) {
      if (pendingKeys.length) {
        nextKeysPending[prevKey] = pendingKeys;
        pendingKeys = [];
      }
    } else {
      pendingKeys.push(prevKey);
    }
  }
  var i;
  var childMapping = {};
  for (var nextKey in next) {
    if (nextKeysPending[nextKey]) {
      for (i = 0; i < nextKeysPending[nextKey].length; i++) {
        var pendingNextKey = nextKeysPending[nextKey][i];
        childMapping[nextKeysPending[nextKey][i]] = getValueForKey(pendingNextKey);
      }
    }
    childMapping[nextKey] = getValueForKey(nextKey);
  }
  for (i = 0; i < pendingKeys.length; i++) {
    childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i]);
  }
  return childMapping;
}
function getProp(child, prop, props) {
  return props[prop] != null ? props[prop] : child.props[prop];
}
function getInitialChildMapping(props, onExited) {
  return getChildMapping(props.children, function(child) {
    return cloneElement(child, {
      onExited: onExited.bind(null, child),
      in: true,
      appear: getProp(child, "appear", props),
      enter: getProp(child, "enter", props),
      exit: getProp(child, "exit", props)
    });
  });
}
function getNextChildMapping(nextProps, prevChildMapping, onExited) {
  var nextChildMapping = getChildMapping(nextProps.children);
  var children = mergeChildMappings(prevChildMapping, nextChildMapping);
  Object.keys(children).forEach(function(key) {
    var child = children[key];
    if (!isValidElement(child))
      return;
    var hasPrev = key in prevChildMapping;
    var hasNext = key in nextChildMapping;
    var prevChild = prevChildMapping[key];
    var isLeaving = isValidElement(prevChild) && !prevChild.props.in;
    if (hasNext && (!hasPrev || isLeaving)) {
      children[key] = cloneElement(child, {
        onExited: onExited.bind(null, child),
        in: true,
        exit: getProp(child, "exit", nextProps),
        enter: getProp(child, "enter", nextProps)
      });
    } else if (!hasNext && hasPrev && !isLeaving) {
      children[key] = cloneElement(child, {
        in: false
      });
    } else if (hasNext && hasPrev && isValidElement(prevChild)) {
      children[key] = cloneElement(child, {
        onExited: onExited.bind(null, child),
        in: prevChild.props.in,
        exit: getProp(child, "exit", nextProps),
        enter: getProp(child, "enter", nextProps)
      });
    }
  });
  return children;
}
var values = Object.values || function(obj) {
  return Object.keys(obj).map(function(k) {
    return obj[k];
  });
};
var defaultProps = {
  component: "div",
  childFactory: function childFactory(child) {
    return child;
  }
};
var TransitionGroup = /* @__PURE__ */ function(_React$Component) {
  _inheritsLoose(TransitionGroup2, _React$Component);
  function TransitionGroup2(props, context) {
    var _this;
    _this = _React$Component.call(this, props, context) || this;
    var handleExited = _this.handleExited.bind(_assertThisInitialized(_this));
    _this.state = {
      contextValue: {
        isMounting: true
      },
      handleExited,
      firstRender: true
    };
    return _this;
  }
  var _proto = TransitionGroup2.prototype;
  _proto.componentDidMount = function componentDidMount() {
    this.mounted = true;
    this.setState({
      contextValue: {
        isMounting: false
      }
    });
  };
  _proto.componentWillUnmount = function componentWillUnmount() {
    this.mounted = false;
  };
  TransitionGroup2.getDerivedStateFromProps = function getDerivedStateFromProps(nextProps, _ref) {
    var prevChildMapping = _ref.children, handleExited = _ref.handleExited, firstRender = _ref.firstRender;
    return {
      children: firstRender ? getInitialChildMapping(nextProps, handleExited) : getNextChildMapping(nextProps, prevChildMapping, handleExited),
      firstRender: false
    };
  };
  _proto.handleExited = function handleExited(child, node) {
    var currentChildMapping = getChildMapping(this.props.children);
    if (child.key in currentChildMapping)
      return;
    if (child.props.onExited) {
      child.props.onExited(node);
    }
    if (this.mounted) {
      this.setState(function(state) {
        var children = _extends$1({}, state.children);
        delete children[child.key];
        return {
          children
        };
      });
    }
  };
  _proto.render = function render() {
    var _this$props = this.props, Component = _this$props.component, childFactory2 = _this$props.childFactory, props = _objectWithoutPropertiesLoose(_this$props, ["component", "childFactory"]);
    var contextValue = this.state.contextValue;
    var children = values(this.state.children).map(childFactory2);
    delete props.appear;
    delete props.enter;
    delete props.exit;
    if (Component === null) {
      return /* @__PURE__ */ React__default.createElement(TransitionGroupContext.Provider, {
        value: contextValue
      }, children);
    }
    return /* @__PURE__ */ React__default.createElement(TransitionGroupContext.Provider, {
      value: contextValue
    }, /* @__PURE__ */ React__default.createElement(Component, props, children));
  };
  return TransitionGroup2;
}(React__default.Component);
TransitionGroup.propTypes = {
  /**
   * `<TransitionGroup>` renders a `<div>` by default. You can change this
   * behavior by providing a `component` prop.
   * If you use React v16+ and would like to avoid a wrapping `<div>` element
   * you can pass in `component={null}`. This is useful if the wrapping div
   * borks your css styles.
   */
  component: PropTypes.any,
  /**
   * A set of `<Transition>` components, that are toggled `in` and out as they
   * leave. the `<TransitionGroup>` will inject specific transition props, so
   * remember to spread them through if you are wrapping the `<Transition>` as
   * with our `<Fade>` example.
   *
   * While this component is meant for multiple `Transition` or `CSSTransition`
   * children, sometimes you may want to have a single transition child with
   * content that you want to be transitioned out and in when you change it
   * (e.g. routes, images etc.) In that case you can change the `key` prop of
   * the transition child as you change its content, this will cause
   * `TransitionGroup` to transition the child out and back in.
   */
  children: PropTypes.node,
  /**
   * A convenience prop that enables or disables appear animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  appear: PropTypes.bool,
  /**
   * A convenience prop that enables or disables enter animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  enter: PropTypes.bool,
  /**
   * A convenience prop that enables or disables exit animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  exit: PropTypes.bool,
  /**
   * You may need to apply reactive updates to a child as it is exiting.
   * This is generally done by using `cloneElement` however in the case of an exiting
   * child the element has already been removed and not accessible to the consumer.
   *
   * If you do need to update a child as it leaves you can provide a `childFactory`
   * to wrap every child, even the ones that are leaving.
   *
   * @type Function(child: ReactElement) -> ReactElement
   */
  childFactory: PropTypes.func
};
TransitionGroup.defaultProps = defaultProps;
const TransitionGroup$1 = TransitionGroup;
var useEnhancedEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;
function Ripple(props) {
  var classes = props.classes, _props$pulsate = props.pulsate, pulsate = _props$pulsate === void 0 ? false : _props$pulsate, rippleX = props.rippleX, rippleY = props.rippleY, rippleSize = props.rippleSize, inProp = props.in, _props$onExited = props.onExited, onExited = _props$onExited === void 0 ? function() {
  } : _props$onExited, timeout = props.timeout;
  var _React$useState = React.useState(false), leaving = _React$useState[0], setLeaving = _React$useState[1];
  var rippleClassName = clsx(classes.ripple, classes.rippleVisible, pulsate && classes.ripplePulsate);
  var rippleStyles = {
    width: rippleSize,
    height: rippleSize,
    top: -(rippleSize / 2) + rippleY,
    left: -(rippleSize / 2) + rippleX
  };
  var childClassName = clsx(classes.child, leaving && classes.childLeaving, pulsate && classes.childPulsate);
  var handleExited = useEventCallback(onExited);
  useEnhancedEffect(function() {
    if (!inProp) {
      setLeaving(true);
      var timeoutId = setTimeout(handleExited, timeout);
      return function() {
        clearTimeout(timeoutId);
      };
    }
    return void 0;
  }, [handleExited, inProp, timeout]);
  return /* @__PURE__ */ React.createElement("span", {
    className: rippleClassName,
    style: rippleStyles
  }, /* @__PURE__ */ React.createElement("span", {
    className: childClassName
  }));
}
Ripple.propTypes = {
  /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
  classes: PropTypes.object.isRequired,
  /**
   * @ignore - injected from TransitionGroup
   */
  in: PropTypes.bool,
  /**
   * @ignore - injected from TransitionGroup
   */
  onExited: PropTypes.func,
  /**
   * If `true`, the ripple pulsates, typically indicating the keyboard focus state of an element.
   */
  pulsate: PropTypes.bool,
  /**
   * Diameter of the ripple.
   */
  rippleSize: PropTypes.number,
  /**
   * Horizontal position of the ripple center.
   */
  rippleX: PropTypes.number,
  /**
   * Vertical position of the ripple center.
   */
  rippleY: PropTypes.number,
  /**
   * exit delay
   */
  timeout: PropTypes.number.isRequired
};
var DURATION = 550;
var DELAY_RIPPLE = 80;
var styles$6 = function styles2(theme) {
  return {
    /* Styles applied to the root element. */
    root: {
      overflow: "hidden",
      pointerEvents: "none",
      position: "absolute",
      zIndex: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderRadius: "inherit"
    },
    /* Styles applied to the internal `Ripple` components `ripple` class. */
    ripple: {
      opacity: 0,
      position: "absolute"
    },
    /* Styles applied to the internal `Ripple` components `rippleVisible` class. */
    rippleVisible: {
      opacity: 0.3,
      transform: "scale(1)",
      animation: "$enter ".concat(DURATION, "ms ").concat(theme.transitions.easing.easeInOut)
    },
    /* Styles applied to the internal `Ripple` components `ripplePulsate` class. */
    ripplePulsate: {
      animationDuration: "".concat(theme.transitions.duration.shorter, "ms")
    },
    /* Styles applied to the internal `Ripple` components `child` class. */
    child: {
      opacity: 1,
      display: "block",
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      backgroundColor: "currentColor"
    },
    /* Styles applied to the internal `Ripple` components `childLeaving` class. */
    childLeaving: {
      opacity: 0,
      animation: "$exit ".concat(DURATION, "ms ").concat(theme.transitions.easing.easeInOut)
    },
    /* Styles applied to the internal `Ripple` components `childPulsate` class. */
    childPulsate: {
      position: "absolute",
      left: 0,
      top: 0,
      animation: "$pulsate 2500ms ".concat(theme.transitions.easing.easeInOut, " 200ms infinite")
    },
    "@keyframes enter": {
      "0%": {
        transform: "scale(0)",
        opacity: 0.1
      },
      "100%": {
        transform: "scale(1)",
        opacity: 0.3
      }
    },
    "@keyframes exit": {
      "0%": {
        opacity: 1
      },
      "100%": {
        opacity: 0
      }
    },
    "@keyframes pulsate": {
      "0%": {
        transform: "scale(1)"
      },
      "50%": {
        transform: "scale(0.92)"
      },
      "100%": {
        transform: "scale(1)"
      }
    }
  };
};
var TouchRipple = /* @__PURE__ */ React.forwardRef(function TouchRipple2(props, ref) {
  var _props$center = props.center, centerProp = _props$center === void 0 ? false : _props$center, classes = props.classes, className = props.className, other = _objectWithoutProperties(props, ["center", "classes", "className"]);
  var _React$useState = React.useState([]), ripples = _React$useState[0], setRipples = _React$useState[1];
  var nextKey = React.useRef(0);
  var rippleCallback = React.useRef(null);
  React.useEffect(function() {
    if (rippleCallback.current) {
      rippleCallback.current();
      rippleCallback.current = null;
    }
  }, [ripples]);
  var ignoringMouseDown = React.useRef(false);
  var startTimer = React.useRef(null);
  var startTimerCommit = React.useRef(null);
  var container = React.useRef(null);
  React.useEffect(function() {
    return function() {
      clearTimeout(startTimer.current);
    };
  }, []);
  var startCommit = React.useCallback(function(params) {
    var pulsate2 = params.pulsate, rippleX = params.rippleX, rippleY = params.rippleY, rippleSize = params.rippleSize, cb = params.cb;
    setRipples(function(oldRipples) {
      return [].concat(_toConsumableArray(oldRipples), [/* @__PURE__ */ React.createElement(Ripple, {
        key: nextKey.current,
        classes,
        timeout: DURATION,
        pulsate: pulsate2,
        rippleX,
        rippleY,
        rippleSize
      })]);
    });
    nextKey.current += 1;
    rippleCallback.current = cb;
  }, [classes]);
  var start = React.useCallback(function() {
    var event = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var cb = arguments.length > 2 ? arguments[2] : void 0;
    var _options$pulsate = options.pulsate, pulsate2 = _options$pulsate === void 0 ? false : _options$pulsate, _options$center = options.center, center = _options$center === void 0 ? centerProp || options.pulsate : _options$center, _options$fakeElement = options.fakeElement, fakeElement = _options$fakeElement === void 0 ? false : _options$fakeElement;
    if (event.type === "mousedown" && ignoringMouseDown.current) {
      ignoringMouseDown.current = false;
      return;
    }
    if (event.type === "touchstart") {
      ignoringMouseDown.current = true;
    }
    var element = fakeElement ? null : container.current;
    var rect = element ? element.getBoundingClientRect() : {
      width: 0,
      height: 0,
      left: 0,
      top: 0
    };
    var rippleX;
    var rippleY;
    var rippleSize;
    if (center || event.clientX === 0 && event.clientY === 0 || !event.clientX && !event.touches) {
      rippleX = Math.round(rect.width / 2);
      rippleY = Math.round(rect.height / 2);
    } else {
      var _ref = event.touches ? event.touches[0] : event, clientX = _ref.clientX, clientY = _ref.clientY;
      rippleX = Math.round(clientX - rect.left);
      rippleY = Math.round(clientY - rect.top);
    }
    if (center) {
      rippleSize = Math.sqrt((2 * Math.pow(rect.width, 2) + Math.pow(rect.height, 2)) / 3);
      if (rippleSize % 2 === 0) {
        rippleSize += 1;
      }
    } else {
      var sizeX = Math.max(Math.abs((element ? element.clientWidth : 0) - rippleX), rippleX) * 2 + 2;
      var sizeY = Math.max(Math.abs((element ? element.clientHeight : 0) - rippleY), rippleY) * 2 + 2;
      rippleSize = Math.sqrt(Math.pow(sizeX, 2) + Math.pow(sizeY, 2));
    }
    if (event.touches) {
      if (startTimerCommit.current === null) {
        startTimerCommit.current = function() {
          startCommit({
            pulsate: pulsate2,
            rippleX,
            rippleY,
            rippleSize,
            cb
          });
        };
        startTimer.current = setTimeout(function() {
          if (startTimerCommit.current) {
            startTimerCommit.current();
            startTimerCommit.current = null;
          }
        }, DELAY_RIPPLE);
      }
    } else {
      startCommit({
        pulsate: pulsate2,
        rippleX,
        rippleY,
        rippleSize,
        cb
      });
    }
  }, [centerProp, startCommit]);
  var pulsate = React.useCallback(function() {
    start({}, {
      pulsate: true
    });
  }, [start]);
  var stop = React.useCallback(function(event, cb) {
    clearTimeout(startTimer.current);
    if (event.type === "touchend" && startTimerCommit.current) {
      event.persist();
      startTimerCommit.current();
      startTimerCommit.current = null;
      startTimer.current = setTimeout(function() {
        stop(event, cb);
      });
      return;
    }
    startTimerCommit.current = null;
    setRipples(function(oldRipples) {
      if (oldRipples.length > 0) {
        return oldRipples.slice(1);
      }
      return oldRipples;
    });
    rippleCallback.current = cb;
  }, []);
  React.useImperativeHandle(ref, function() {
    return {
      pulsate,
      start,
      stop
    };
  }, [pulsate, start, stop]);
  return /* @__PURE__ */ React.createElement("span", _extends$1({
    className: clsx(classes.root, className),
    ref: container
  }, other), /* @__PURE__ */ React.createElement(TransitionGroup$1, {
    component: null,
    exit: true
  }, ripples));
});
TouchRipple.propTypes = {
  /**
   * If `true`, the ripple starts at the center of the component
   * rather than at the point of interaction.
   */
  center: PropTypes.bool,
  /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
  classes: PropTypes.object.isRequired,
  /**
   * @ignore
   */
  className: PropTypes.string
};
const TouchRipple$1 = withStyles2(styles$6, {
  flip: false,
  name: "MuiTouchRipple"
})(/* @__PURE__ */ React.memo(TouchRipple));
var styles$5 = {
  /* Styles applied to the root element. */
  root: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    WebkitTapHighlightColor: "transparent",
    backgroundColor: "transparent",
    // Reset default value
    // We disable the focus ring for mouse, touch and keyboard users.
    outline: 0,
    border: 0,
    margin: 0,
    // Remove the margin in Safari
    borderRadius: 0,
    padding: 0,
    // Remove the padding in Firefox
    cursor: "pointer",
    userSelect: "none",
    verticalAlign: "middle",
    "-moz-appearance": "none",
    // Reset
    "-webkit-appearance": "none",
    // Reset
    textDecoration: "none",
    // So we take precedent over the style of a native <a /> element.
    color: "inherit",
    "&::-moz-focus-inner": {
      borderStyle: "none"
      // Remove Firefox dotted outline.
    },
    "&$disabled": {
      pointerEvents: "none",
      // Disable link interactions
      cursor: "default"
    },
    "@media print": {
      colorAdjust: "exact"
    }
  },
  /* Pseudo-class applied to the root element if `disabled={true}`. */
  disabled: {},
  /* Pseudo-class applied to the root element if keyboard focused. */
  focusVisible: {}
};
var ButtonBase = /* @__PURE__ */ React.forwardRef(function ButtonBase2(props, ref) {
  var action = props.action, buttonRefProp = props.buttonRef, _props$centerRipple = props.centerRipple, centerRipple = _props$centerRipple === void 0 ? false : _props$centerRipple, children = props.children, classes = props.classes, className = props.className, _props$component = props.component, component = _props$component === void 0 ? "button" : _props$component, _props$disabled = props.disabled, disabled = _props$disabled === void 0 ? false : _props$disabled, _props$disableRipple = props.disableRipple, disableRipple = _props$disableRipple === void 0 ? false : _props$disableRipple, _props$disableTouchRi = props.disableTouchRipple, disableTouchRipple = _props$disableTouchRi === void 0 ? false : _props$disableTouchRi, _props$focusRipple = props.focusRipple, focusRipple = _props$focusRipple === void 0 ? false : _props$focusRipple, focusVisibleClassName = props.focusVisibleClassName, onBlur = props.onBlur, onClick = props.onClick, onFocus = props.onFocus, onFocusVisible = props.onFocusVisible, onKeyDown = props.onKeyDown, onKeyUp = props.onKeyUp, onMouseDown = props.onMouseDown, onMouseLeave = props.onMouseLeave, onMouseUp = props.onMouseUp, onTouchEnd = props.onTouchEnd, onTouchMove = props.onTouchMove, onTouchStart = props.onTouchStart, onDragLeave = props.onDragLeave, _props$tabIndex = props.tabIndex, tabIndex = _props$tabIndex === void 0 ? 0 : _props$tabIndex, TouchRippleProps = props.TouchRippleProps, _props$type = props.type, type = _props$type === void 0 ? "button" : _props$type, other = _objectWithoutProperties(props, ["action", "buttonRef", "centerRipple", "children", "classes", "className", "component", "disabled", "disableRipple", "disableTouchRipple", "focusRipple", "focusVisibleClassName", "onBlur", "onClick", "onFocus", "onFocusVisible", "onKeyDown", "onKeyUp", "onMouseDown", "onMouseLeave", "onMouseUp", "onTouchEnd", "onTouchMove", "onTouchStart", "onDragLeave", "tabIndex", "TouchRippleProps", "type"]);
  var buttonRef = React.useRef(null);
  function getButtonNode() {
    return ReactDOM.findDOMNode(buttonRef.current);
  }
  var rippleRef = React.useRef(null);
  var _React$useState = React.useState(false), focusVisible = _React$useState[0], setFocusVisible = _React$useState[1];
  if (disabled && focusVisible) {
    setFocusVisible(false);
  }
  var _useIsFocusVisible = useIsFocusVisible(), isFocusVisible2 = _useIsFocusVisible.isFocusVisible, onBlurVisible = _useIsFocusVisible.onBlurVisible, focusVisibleRef = _useIsFocusVisible.ref;
  React.useImperativeHandle(action, function() {
    return {
      focusVisible: function focusVisible2() {
        setFocusVisible(true);
        buttonRef.current.focus();
      }
    };
  }, []);
  React.useEffect(function() {
    if (focusVisible && focusRipple && !disableRipple) {
      rippleRef.current.pulsate();
    }
  }, [disableRipple, focusRipple, focusVisible]);
  function useRippleHandler(rippleAction, eventCallback) {
    var skipRippleAction = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : disableTouchRipple;
    return useEventCallback(function(event) {
      if (eventCallback) {
        eventCallback(event);
      }
      var ignore = skipRippleAction;
      if (!ignore && rippleRef.current) {
        rippleRef.current[rippleAction](event);
      }
      return true;
    });
  }
  var handleMouseDown = useRippleHandler("start", onMouseDown);
  var handleDragLeave = useRippleHandler("stop", onDragLeave);
  var handleMouseUp = useRippleHandler("stop", onMouseUp);
  var handleMouseLeave = useRippleHandler("stop", function(event) {
    if (focusVisible) {
      event.preventDefault();
    }
    if (onMouseLeave) {
      onMouseLeave(event);
    }
  });
  var handleTouchStart = useRippleHandler("start", onTouchStart);
  var handleTouchEnd = useRippleHandler("stop", onTouchEnd);
  var handleTouchMove = useRippleHandler("stop", onTouchMove);
  var handleBlur = useRippleHandler("stop", function(event) {
    if (focusVisible) {
      onBlurVisible(event);
      setFocusVisible(false);
    }
    if (onBlur) {
      onBlur(event);
    }
  }, false);
  var handleFocus = useEventCallback(function(event) {
    if (!buttonRef.current) {
      buttonRef.current = event.currentTarget;
    }
    if (isFocusVisible2(event)) {
      setFocusVisible(true);
      if (onFocusVisible) {
        onFocusVisible(event);
      }
    }
    if (onFocus) {
      onFocus(event);
    }
  });
  var isNonNativeButton = function isNonNativeButton2() {
    var button = getButtonNode();
    return component && component !== "button" && !(button.tagName === "A" && button.href);
  };
  var keydownRef = React.useRef(false);
  var handleKeyDown2 = useEventCallback(function(event) {
    if (focusRipple && !keydownRef.current && focusVisible && rippleRef.current && event.key === " ") {
      keydownRef.current = true;
      event.persist();
      rippleRef.current.stop(event, function() {
        rippleRef.current.start(event);
      });
    }
    if (event.target === event.currentTarget && isNonNativeButton() && event.key === " ") {
      event.preventDefault();
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
    if (event.target === event.currentTarget && isNonNativeButton() && event.key === "Enter" && !disabled) {
      event.preventDefault();
      if (onClick) {
        onClick(event);
      }
    }
  });
  var handleKeyUp = useEventCallback(function(event) {
    if (focusRipple && event.key === " " && rippleRef.current && focusVisible && !event.defaultPrevented) {
      keydownRef.current = false;
      event.persist();
      rippleRef.current.stop(event, function() {
        rippleRef.current.pulsate(event);
      });
    }
    if (onKeyUp) {
      onKeyUp(event);
    }
    if (onClick && event.target === event.currentTarget && isNonNativeButton() && event.key === " " && !event.defaultPrevented) {
      onClick(event);
    }
  });
  var ComponentProp = component;
  if (ComponentProp === "button" && other.href) {
    ComponentProp = "a";
  }
  var buttonProps = {};
  if (ComponentProp === "button") {
    buttonProps.type = type;
    buttonProps.disabled = disabled;
  } else {
    if (ComponentProp !== "a" || !other.href) {
      buttonProps.role = "button";
    }
    buttonProps["aria-disabled"] = disabled;
  }
  var handleUserRef = useForkRef(buttonRefProp, ref);
  var handleOwnRef = useForkRef(focusVisibleRef, buttonRef);
  var handleRef = useForkRef(handleUserRef, handleOwnRef);
  var _React$useState2 = React.useState(false), mountedState = _React$useState2[0], setMountedState = _React$useState2[1];
  React.useEffect(function() {
    setMountedState(true);
  }, []);
  var enableTouchRipple = mountedState && !disableRipple && !disabled;
  {
    React.useEffect(function() {
      if (enableTouchRipple && !rippleRef.current) {
        console.error(["Material-UI: The `component` prop provided to ButtonBase is invalid.", "Please make sure the children prop is rendered in this custom component."].join("\n"));
      }
    }, [enableTouchRipple]);
  }
  return /* @__PURE__ */ React.createElement(ComponentProp, _extends$1({
    className: clsx(classes.root, className, focusVisible && [classes.focusVisible, focusVisibleClassName], disabled && classes.disabled),
    onBlur: handleBlur,
    onClick,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown2,
    onKeyUp: handleKeyUp,
    onMouseDown: handleMouseDown,
    onMouseLeave: handleMouseLeave,
    onMouseUp: handleMouseUp,
    onDragLeave: handleDragLeave,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
    onTouchStart: handleTouchStart,
    ref: handleRef,
    tabIndex: disabled ? -1 : tabIndex
  }, buttonProps, other), children, enableTouchRipple ? (
    /* TouchRipple is only needed client-side, x2 boost on the server. */
    /* @__PURE__ */ React.createElement(TouchRipple$1, _extends$1({
      ref: rippleRef,
      center: centerRipple
    }, TouchRippleProps))
  ) : null);
});
ButtonBase.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------
  /**
   * A ref for imperative actions.
   * It currently only supports `focusVisible()` action.
   */
  action: refType$1,
  /**
   * @ignore
   *
   * Use that prop to pass a ref to the native button component.
   * @deprecated Use `ref` instead.
   */
  buttonRef: deprecatedPropType(refType$1, "Use `ref` instead."),
  /**
   * If `true`, the ripples will be centered.
   * They won't start at the cursor interaction position.
   */
  centerRipple: PropTypes.bool,
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: elementTypeAcceptingRef$1,
  /**
   * If `true`, the base button will be disabled.
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, the ripple effect will be disabled.
   *
   * ⚠️ Without a ripple there is no styling for :focus-visible by default. Be sure
   * to highlight the element by applying separate styles with the `focusVisibleClassName`.
   */
  disableRipple: PropTypes.bool,
  /**
   * If `true`, the touch ripple effect will be disabled.
   */
  disableTouchRipple: PropTypes.bool,
  /**
   * If `true`, the base button will have a keyboard focus ripple.
   */
  focusRipple: PropTypes.bool,
  /**
   * This prop can help identify which element has keyboard focus.
   * The class name will be applied when the element gains the focus through keyboard interaction.
   * It's a polyfill for the [CSS :focus-visible selector](https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo).
   * The rationale for using this feature [is explained here](https://github.com/WICG/focus-visible/blob/master/explainer.md).
   * A [polyfill can be used](https://github.com/WICG/focus-visible) to apply a `focus-visible` class to other components
   * if needed.
   */
  focusVisibleClassName: PropTypes.string,
  /**
   * @ignore
   */
  href: PropTypes.string,
  /**
   * @ignore
   */
  onBlur: PropTypes.func,
  /**
   * @ignore
   */
  onClick: PropTypes.func,
  /**
   * @ignore
   */
  onDragLeave: PropTypes.func,
  /**
   * @ignore
   */
  onFocus: PropTypes.func,
  /**
   * Callback fired when the component is focused with a keyboard.
   * We trigger a `onFocus` callback too.
   */
  onFocusVisible: PropTypes.func,
  /**
   * @ignore
   */
  onKeyDown: PropTypes.func,
  /**
   * @ignore
   */
  onKeyUp: PropTypes.func,
  /**
   * @ignore
   */
  onMouseDown: PropTypes.func,
  /**
   * @ignore
   */
  onMouseLeave: PropTypes.func,
  /**
   * @ignore
   */
  onMouseUp: PropTypes.func,
  /**
   * @ignore
   */
  onTouchEnd: PropTypes.func,
  /**
   * @ignore
   */
  onTouchMove: PropTypes.func,
  /**
   * @ignore
   */
  onTouchStart: PropTypes.func,
  /**
   * @ignore
   */
  tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * Props applied to the `TouchRipple` element.
   */
  TouchRippleProps: PropTypes.object,
  /**
   * @ignore
   */
  type: PropTypes.oneOfType([PropTypes.oneOf(["button", "reset", "submit"]), PropTypes.string])
};
const ButtonBase$1 = withStyles2(styles$5, {
  name: "MuiButtonBase"
})(ButtonBase);
var styles$4 = function styles3(theme) {
  return {
    /* Styles applied to the root element. */
    root: {
      textAlign: "center",
      flex: "0 0 auto",
      fontSize: theme.typography.pxToRem(24),
      padding: 12,
      borderRadius: "50%",
      overflow: "visible",
      // Explicitly set the default value to solve a bug on IE 11.
      color: theme.palette.action.active,
      transition: theme.transitions.create("background-color", {
        duration: theme.transitions.duration.shortest
      }),
      "&:hover": {
        backgroundColor: alpha(theme.palette.action.active, theme.palette.action.hoverOpacity),
        // Reset on touch devices, it doesn't add specificity
        "@media (hover: none)": {
          backgroundColor: "transparent"
        }
      },
      "&$disabled": {
        backgroundColor: "transparent",
        color: theme.palette.action.disabled
      }
    },
    /* Styles applied to the root element if `edge="start"`. */
    edgeStart: {
      marginLeft: -12,
      "$sizeSmall&": {
        marginLeft: -3
      }
    },
    /* Styles applied to the root element if `edge="end"`. */
    edgeEnd: {
      marginRight: -12,
      "$sizeSmall&": {
        marginRight: -3
      }
    },
    /* Styles applied to the root element if `color="inherit"`. */
    colorInherit: {
      color: "inherit"
    },
    /* Styles applied to the root element if `color="primary"`. */
    colorPrimary: {
      color: theme.palette.primary.main,
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
        // Reset on touch devices, it doesn't add specificity
        "@media (hover: none)": {
          backgroundColor: "transparent"
        }
      }
    },
    /* Styles applied to the root element if `color="secondary"`. */
    colorSecondary: {
      color: theme.palette.secondary.main,
      "&:hover": {
        backgroundColor: alpha(theme.palette.secondary.main, theme.palette.action.hoverOpacity),
        // Reset on touch devices, it doesn't add specificity
        "@media (hover: none)": {
          backgroundColor: "transparent"
        }
      }
    },
    /* Pseudo-class applied to the root element if `disabled={true}`. */
    disabled: {},
    /* Styles applied to the root element if `size="small"`. */
    sizeSmall: {
      padding: 3,
      fontSize: theme.typography.pxToRem(18)
    },
    /* Styles applied to the children container element. */
    label: {
      width: "100%",
      display: "flex",
      alignItems: "inherit",
      justifyContent: "inherit"
    }
  };
};
var IconButton = /* @__PURE__ */ React.forwardRef(function IconButton2(props, ref) {
  var _props$edge = props.edge, edge = _props$edge === void 0 ? false : _props$edge, children = props.children, classes = props.classes, className = props.className, _props$color = props.color, color = _props$color === void 0 ? "default" : _props$color, _props$disabled = props.disabled, disabled = _props$disabled === void 0 ? false : _props$disabled, _props$disableFocusRi = props.disableFocusRipple, disableFocusRipple = _props$disableFocusRi === void 0 ? false : _props$disableFocusRi, _props$size = props.size, size2 = _props$size === void 0 ? "medium" : _props$size, other = _objectWithoutProperties(props, ["edge", "children", "classes", "className", "color", "disabled", "disableFocusRipple", "size"]);
  return /* @__PURE__ */ React.createElement(ButtonBase$1, _extends$1({
    className: clsx(classes.root, className, color !== "default" && classes["color".concat(capitalize(color))], disabled && classes.disabled, size2 === "small" && classes["size".concat(capitalize(size2))], {
      "start": classes.edgeStart,
      "end": classes.edgeEnd
    }[edge]),
    centerRipple: true,
    focusRipple: !disableFocusRipple,
    disabled,
    ref
  }, other), /* @__PURE__ */ React.createElement("span", {
    className: classes.label
  }, children));
});
IconButton.propTypes = {
  /**
   * The icon element.
   */
  children: chainPropTypes(PropTypes.node, function(props) {
    var found = React.Children.toArray(props.children).some(function(child) {
      return /* @__PURE__ */ React.isValidElement(child) && child.props.onClick;
    });
    if (found) {
      return new Error(["Material-UI: You are providing an onClick event listener to a child of a button element.", "Firefox will never trigger the event.", "You should move the onClick listener to the parent button element.", "https://github.com/mui-org/material-ui/issues/13957"].join("\n"));
    }
    return null;
  }),
  /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
  classes: PropTypes.object.isRequired,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The color of the component. It supports those theme colors that make sense for this component.
   */
  color: PropTypes.oneOf(["default", "inherit", "primary", "secondary"]),
  /**
   * If `true`, the button will be disabled.
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, the  keyboard focus ripple will be disabled.
   */
  disableFocusRipple: PropTypes.bool,
  /**
   * If `true`, the ripple effect will be disabled.
   */
  disableRipple: PropTypes.bool,
  /**
   * If given, uses a negative margin to counteract the padding on one
   * side (this is often helpful for aligning the left or right
   * side of the icon with content above or below, without ruining the border
   * size and shape).
   */
  edge: PropTypes.oneOf(["start", "end", false]),
  /**
   * The size of the button.
   * `small` is equivalent to the dense button styling.
   */
  size: PropTypes.oneOf(["small", "medium"])
};
const IconButton$1 = withStyles2(styles$4, {
  name: "MuiIconButton"
})(IconButton);
var FormControlContext = React.createContext();
{
  FormControlContext.displayName = "FormControlContext";
}
const FormControlContext$1 = FormControlContext;
function useFormControl() {
  return React.useContext(FormControlContext$1);
}
var styles$3 = {
  root: {
    padding: 9
  },
  checked: {},
  disabled: {},
  input: {
    cursor: "inherit",
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    margin: 0,
    padding: 0,
    zIndex: 1
  }
};
var SwitchBase = /* @__PURE__ */ React.forwardRef(function SwitchBase2(props, ref) {
  var autoFocus = props.autoFocus, checkedProp = props.checked, checkedIcon = props.checkedIcon, classes = props.classes, className = props.className, defaultChecked = props.defaultChecked, disabledProp = props.disabled, icon = props.icon, id = props.id, inputProps = props.inputProps, inputRef = props.inputRef, name = props.name, onBlur = props.onBlur, onChange = props.onChange, onFocus = props.onFocus, readOnly = props.readOnly, required = props.required, tabIndex = props.tabIndex, type = props.type, value = props.value, other = _objectWithoutProperties(props, ["autoFocus", "checked", "checkedIcon", "classes", "className", "defaultChecked", "disabled", "icon", "id", "inputProps", "inputRef", "name", "onBlur", "onChange", "onFocus", "readOnly", "required", "tabIndex", "type", "value"]);
  var _useControlled = useControlled({
    controlled: checkedProp,
    default: Boolean(defaultChecked),
    name: "SwitchBase",
    state: "checked"
  }), _useControlled2 = _slicedToArray(_useControlled, 2), checked = _useControlled2[0], setCheckedState = _useControlled2[1];
  var muiFormControl = useFormControl();
  var handleFocus = function handleFocus2(event) {
    if (onFocus) {
      onFocus(event);
    }
    if (muiFormControl && muiFormControl.onFocus) {
      muiFormControl.onFocus(event);
    }
  };
  var handleBlur = function handleBlur2(event) {
    if (onBlur) {
      onBlur(event);
    }
    if (muiFormControl && muiFormControl.onBlur) {
      muiFormControl.onBlur(event);
    }
  };
  var handleInputChange = function handleInputChange2(event) {
    var newChecked = event.target.checked;
    setCheckedState(newChecked);
    if (onChange) {
      onChange(event, newChecked);
    }
  };
  var disabled = disabledProp;
  if (muiFormControl) {
    if (typeof disabled === "undefined") {
      disabled = muiFormControl.disabled;
    }
  }
  var hasLabelFor = type === "checkbox" || type === "radio";
  return /* @__PURE__ */ React.createElement(IconButton$1, _extends$1({
    component: "span",
    className: clsx(classes.root, className, checked && classes.checked, disabled && classes.disabled),
    disabled,
    tabIndex: null,
    role: void 0,
    onFocus: handleFocus,
    onBlur: handleBlur,
    ref
  }, other), /* @__PURE__ */ React.createElement("input", _extends$1({
    autoFocus,
    checked: checkedProp,
    defaultChecked,
    className: classes.input,
    disabled,
    id: hasLabelFor && id,
    name,
    onChange: handleInputChange,
    readOnly,
    ref: inputRef,
    required,
    tabIndex,
    type,
    value
  }, inputProps)), checked ? checkedIcon : icon);
});
SwitchBase.propTypes = {
  /**
   * If `true`, the `input` element will be focused during the first mount.
   */
  autoFocus: PropTypes.bool,
  /**
   * If `true`, the component is checked.
   */
  checked: PropTypes.bool,
  /**
   * The icon to display when the component is checked.
   */
  checkedIcon: PropTypes.node.isRequired,
  /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
  classes: PropTypes.object.isRequired,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * @ignore
   */
  defaultChecked: PropTypes.bool,
  /**
   * If `true`, the switch will be disabled.
   */
  disabled: PropTypes.bool,
  /**
   * The icon to display when the component is unchecked.
   */
  icon: PropTypes.node.isRequired,
  /**
   * The id of the `input` element.
   */
  id: PropTypes.string,
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  inputProps: PropTypes.object,
  /**
   * Pass a ref to the `input` element.
   */
  inputRef: refType$1,
  /*
   * @ignore
   */
  name: PropTypes.string,
  /**
   * @ignore
   */
  onBlur: PropTypes.func,
  /**
   * Callback fired when the state is changed.
   *
   * @param {object} event The event source of the callback.
   * You can pull out the new checked state by accessing `event.target.checked` (boolean).
   */
  onChange: PropTypes.func,
  /**
   * @ignore
   */
  onFocus: PropTypes.func,
  /**
   * It prevents the user from changing the value of the field
   * (not from interacting with the field).
   */
  readOnly: PropTypes.bool,
  /**
   * If `true`, the `input` element will be required.
   */
  required: PropTypes.bool,
  /**
   * @ignore
   */
  tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /**
   * The input component prop `type`.
   */
  type: PropTypes.string.isRequired,
  /**
   * The value of the component.
   */
  value: PropTypes.any
};
const SwitchBase$1 = withStyles2(styles$3, {
  name: "PrivateSwitchBase"
})(SwitchBase);
const CheckBoxOutlineBlankIcon = createSvgIcon(/* @__PURE__ */ React.createElement("path", {
  d: "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
}), "CheckBoxOutlineBlank");
const CheckBoxIcon = createSvgIcon(/* @__PURE__ */ React.createElement("path", {
  d: "M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
}), "CheckBox");
const IndeterminateCheckBoxIcon = createSvgIcon(/* @__PURE__ */ React.createElement("path", {
  d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"
}), "IndeterminateCheckBox");
var styles$2 = function styles4(theme) {
  return {
    /* Styles applied to the root element. */
    root: {
      color: theme.palette.text.secondary
    },
    /* Pseudo-class applied to the root element if `checked={true}`. */
    checked: {},
    /* Pseudo-class applied to the root element if `disabled={true}`. */
    disabled: {},
    /* Pseudo-class applied to the root element if `indeterminate={true}`. */
    indeterminate: {},
    /* Styles applied to the root element if `color="primary"`. */
    colorPrimary: {
      "&$checked": {
        color: theme.palette.primary.main,
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.hoverOpacity),
          // Reset on touch devices, it doesn't add specificity
          "@media (hover: none)": {
            backgroundColor: "transparent"
          }
        }
      },
      "&$disabled": {
        color: theme.palette.action.disabled
      }
    },
    /* Styles applied to the root element if `color="secondary"`. */
    colorSecondary: {
      "&$checked": {
        color: theme.palette.secondary.main,
        "&:hover": {
          backgroundColor: alpha(theme.palette.secondary.main, theme.palette.action.hoverOpacity),
          // Reset on touch devices, it doesn't add specificity
          "@media (hover: none)": {
            backgroundColor: "transparent"
          }
        }
      },
      "&$disabled": {
        color: theme.palette.action.disabled
      }
    }
  };
};
var defaultCheckedIcon = /* @__PURE__ */ React.createElement(CheckBoxIcon, null);
var defaultIcon = /* @__PURE__ */ React.createElement(CheckBoxOutlineBlankIcon, null);
var defaultIndeterminateIcon = /* @__PURE__ */ React.createElement(IndeterminateCheckBoxIcon, null);
var Checkbox = /* @__PURE__ */ React.forwardRef(function Checkbox2(props, ref) {
  var _props$checkedIcon = props.checkedIcon, checkedIcon = _props$checkedIcon === void 0 ? defaultCheckedIcon : _props$checkedIcon, classes = props.classes, _props$color = props.color, color = _props$color === void 0 ? "secondary" : _props$color, _props$icon = props.icon, iconProp = _props$icon === void 0 ? defaultIcon : _props$icon, _props$indeterminate = props.indeterminate, indeterminate = _props$indeterminate === void 0 ? false : _props$indeterminate, _props$indeterminateI = props.indeterminateIcon, indeterminateIconProp = _props$indeterminateI === void 0 ? defaultIndeterminateIcon : _props$indeterminateI, inputProps = props.inputProps, _props$size = props.size, size2 = _props$size === void 0 ? "medium" : _props$size, other = _objectWithoutProperties(props, ["checkedIcon", "classes", "color", "icon", "indeterminate", "indeterminateIcon", "inputProps", "size"]);
  var icon = indeterminate ? indeterminateIconProp : iconProp;
  var indeterminateIcon = indeterminate ? indeterminateIconProp : checkedIcon;
  return /* @__PURE__ */ React.createElement(SwitchBase$1, _extends$1({
    type: "checkbox",
    classes: {
      root: clsx(classes.root, classes["color".concat(capitalize(color))], indeterminate && classes.indeterminate),
      checked: classes.checked,
      disabled: classes.disabled
    },
    color,
    inputProps: _extends$1({
      "data-indeterminate": indeterminate
    }, inputProps),
    icon: /* @__PURE__ */ React.cloneElement(icon, {
      fontSize: icon.props.fontSize === void 0 && size2 === "small" ? size2 : icon.props.fontSize
    }),
    checkedIcon: /* @__PURE__ */ React.cloneElement(indeterminateIcon, {
      fontSize: indeterminateIcon.props.fontSize === void 0 && size2 === "small" ? size2 : indeterminateIcon.props.fontSize
    }),
    ref
  }, other));
});
Checkbox.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit the d.ts file and run "yarn proptypes"     |
  // ----------------------------------------------------------------------
  /**
   * If `true`, the component is checked.
   */
  checked: PropTypes.bool,
  /**
   * The icon to display when the component is checked.
   */
  checkedIcon: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
  classes: PropTypes.object,
  /**
   * The color of the component. It supports those theme colors that make sense for this component.
   */
  color: PropTypes.oneOf(["default", "primary", "secondary"]),
  /**
   * If `true`, the checkbox will be disabled.
   */
  disabled: PropTypes.bool,
  /**
   * If `true`, the ripple effect will be disabled.
   */
  disableRipple: PropTypes.bool,
  /**
   * The icon to display when the component is unchecked.
   */
  icon: PropTypes.node,
  /**
   * The id of the `input` element.
   */
  id: PropTypes.string,
  /**
   * If `true`, the component appears indeterminate.
   * This does not set the native input element to indeterminate due
   * to inconsistent behavior across browsers.
   * However, we set a `data-indeterminate` attribute on the input.
   */
  indeterminate: PropTypes.bool,
  /**
   * The icon to display when the component is indeterminate.
   */
  indeterminateIcon: PropTypes.node,
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Attributes) applied to the `input` element.
   */
  inputProps: PropTypes.object,
  /**
   * Pass a ref to the `input` element.
   */
  inputRef: refType$1,
  /**
   * Callback fired when the state is changed.
   *
   * @param {object} event The event source of the callback.
   * You can pull out the new checked state by accessing `event.target.checked` (boolean).
   */
  onChange: PropTypes.func,
  /**
   * If `true`, the `input` element will be required.
   */
  required: PropTypes.bool,
  /**
   * The size of the checkbox.
   * `small` is equivalent to the dense checkbox styling.
   */
  size: PropTypes.oneOf(["medium", "small"]),
  /**
   * The value of the component. The DOM API casts this to a string.
   * The browser uses "on" as the default value.
   */
  value: PropTypes.any
};
const Checkbox$1 = withStyles2(styles$2, {
  name: "MuiCheckbox"
})(Checkbox);
var TableContext = React.createContext();
{
  TableContext.displayName = "TableContext";
}
const TableContext$1 = TableContext;
var Tablelvl2Context = React.createContext();
{
  Tablelvl2Context.displayName = "Tablelvl2Context";
}
const Tablelvl2Context$1 = Tablelvl2Context;
var styles$1 = function styles5(theme) {
  return {
    /* Styles applied to the root element. */
    root: _extends$1({}, theme.typography.body2, {
      display: "table-cell",
      verticalAlign: "inherit",
      // Workaround for a rendering bug with spanned columns in Chrome 62.0.
      // Removes the alpha (sets it to 1), and lightens or darkens the theme color.
      borderBottom: "1px solid\n    ".concat(theme.palette.type === "light" ? lighten(alpha(theme.palette.divider, 1), 0.88) : darken(alpha(theme.palette.divider, 1), 0.68)),
      textAlign: "left",
      padding: 16
    }),
    /* Styles applied to the root element if `variant="head"` or `context.table.head`. */
    head: {
      color: theme.palette.text.primary,
      lineHeight: theme.typography.pxToRem(24),
      fontWeight: theme.typography.fontWeightMedium
    },
    /* Styles applied to the root element if `variant="body"` or `context.table.body`. */
    body: {
      color: theme.palette.text.primary
    },
    /* Styles applied to the root element if `variant="footer"` or `context.table.footer`. */
    footer: {
      color: theme.palette.text.secondary,
      lineHeight: theme.typography.pxToRem(21),
      fontSize: theme.typography.pxToRem(12)
    },
    /* Styles applied to the root element if `size="small"`. */
    sizeSmall: {
      padding: "6px 24px 6px 16px",
      "&:last-child": {
        paddingRight: 16
      },
      "&$paddingCheckbox": {
        width: 24,
        // prevent the checkbox column from growing
        padding: "0 12px 0 16px",
        "&:last-child": {
          paddingLeft: 12,
          paddingRight: 16
        },
        "& > *": {
          padding: 0
        }
      }
    },
    /* Styles applied to the root element if `padding="checkbox"`. */
    paddingCheckbox: {
      width: 48,
      // prevent the checkbox column from growing
      padding: "0 0 0 4px",
      "&:last-child": {
        paddingLeft: 0,
        paddingRight: 4
      }
    },
    /* Styles applied to the root element if `padding="none"`. */
    paddingNone: {
      padding: 0,
      "&:last-child": {
        padding: 0
      }
    },
    /* Styles applied to the root element if `align="left"`. */
    alignLeft: {
      textAlign: "left"
    },
    /* Styles applied to the root element if `align="center"`. */
    alignCenter: {
      textAlign: "center"
    },
    /* Styles applied to the root element if `align="right"`. */
    alignRight: {
      textAlign: "right",
      flexDirection: "row-reverse"
    },
    /* Styles applied to the root element if `align="justify"`. */
    alignJustify: {
      textAlign: "justify"
    },
    /* Styles applied to the root element if `context.table.stickyHeader={true}`. */
    stickyHeader: {
      position: "sticky",
      top: 0,
      left: 0,
      zIndex: 2,
      backgroundColor: theme.palette.background.default
    }
  };
};
var TableCell = /* @__PURE__ */ React.forwardRef(function TableCell2(props, ref) {
  var _props$align = props.align, align = _props$align === void 0 ? "inherit" : _props$align, classes = props.classes, className = props.className, component = props.component, paddingProp = props.padding, scopeProp = props.scope, sizeProp = props.size, sortDirection = props.sortDirection, variantProp = props.variant, other = _objectWithoutProperties(props, ["align", "classes", "className", "component", "padding", "scope", "size", "sortDirection", "variant"]);
  var table = React.useContext(TableContext$1);
  var tablelvl2 = React.useContext(Tablelvl2Context$1);
  var isHeadCell = tablelvl2 && tablelvl2.variant === "head";
  var role;
  var Component;
  if (component) {
    Component = component;
    role = isHeadCell ? "columnheader" : "cell";
  } else {
    Component = isHeadCell ? "th" : "td";
  }
  var scope = scopeProp;
  if (!scope && isHeadCell) {
    scope = "col";
  }
  var padding = paddingProp || (table && table.padding ? table.padding : "normal");
  var size2 = sizeProp || (table && table.size ? table.size : "medium");
  var variant = variantProp || tablelvl2 && tablelvl2.variant;
  var ariaSort = null;
  if (sortDirection) {
    ariaSort = sortDirection === "asc" ? "ascending" : "descending";
  }
  return /* @__PURE__ */ React.createElement(Component, _extends$1({
    ref,
    className: clsx(classes.root, classes[variant], className, align !== "inherit" && classes["align".concat(capitalize(align))], padding !== "normal" && classes["padding".concat(capitalize(padding))], size2 !== "medium" && classes["size".concat(capitalize(size2))], variant === "head" && table && table.stickyHeader && classes.stickyHeader),
    "aria-sort": ariaSort,
    role,
    scope
  }, other));
});
TableCell.propTypes = {
  /**
   * Set the text-align on the table cell content.
   *
   * Monetary or generally number fields **should be right aligned** as that allows
   * you to add them up quickly in your head without having to worry about decimals.
   */
  align: PropTypes.oneOf(["center", "inherit", "justify", "left", "right"]),
  /**
   * The table cell contents.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
  classes: PropTypes.object,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * Sets the padding applied to the cell.
   * By default, the Table parent component set the value (`normal`).
   * `default` is deprecated, use `normal` instead.
   */
  padding: chainPropTypes(PropTypes.oneOf(["normal", "checkbox", "none", "default"]), function(props) {
    if (props.padding === "default") {
      return new Error('Material-UI: padding="default" was renamed to padding="normal" for consistency.');
    }
    return null;
  }),
  /**
   * Set scope attribute.
   */
  scope: PropTypes.string,
  /**
   * Specify the size of the cell.
   * By default, the Table parent component set the value (`medium`).
   */
  size: PropTypes.oneOf(["medium", "small"]),
  /**
   * Set aria-sort direction.
   */
  sortDirection: PropTypes.oneOf(["asc", "desc", false]),
  /**
   * Specify the cell type.
   * By default, the TableHead, TableBody or TableFooter parent component set the value.
   */
  variant: PropTypes.oneOf(["body", "footer", "head"])
};
const TableCell$1 = withStyles2(styles$1, {
  name: "MuiTableCell"
})(TableCell);
var styles6 = function styles7(theme) {
  return {
    /* Styles applied to the root element. */
    root: {
      color: "inherit",
      display: "table-row",
      verticalAlign: "middle",
      // We disable the focus ring for mouse, touch and keyboard users.
      outline: 0,
      "&$hover:hover": {
        backgroundColor: theme.palette.action.hover
      },
      "&$selected, &$selected:hover": {
        backgroundColor: alpha(theme.palette.secondary.main, theme.palette.action.selectedOpacity)
      }
    },
    /* Pseudo-class applied to the root element if `selected={true}`. */
    selected: {},
    /* Pseudo-class applied to the root element if `hover={true}`. */
    hover: {},
    /* Styles applied to the root element if table variant="head". */
    head: {},
    /* Styles applied to the root element if table variant="footer". */
    footer: {}
  };
};
var defaultComponent = "tr";
var TableRow = /* @__PURE__ */ React.forwardRef(function TableRow2(props, ref) {
  var classes = props.classes, className = props.className, _props$component = props.component, Component = _props$component === void 0 ? defaultComponent : _props$component, _props$hover = props.hover, hover = _props$hover === void 0 ? false : _props$hover, _props$selected = props.selected, selected = _props$selected === void 0 ? false : _props$selected, other = _objectWithoutProperties(props, ["classes", "className", "component", "hover", "selected"]);
  var tablelvl2 = React.useContext(Tablelvl2Context$1);
  return /* @__PURE__ */ React.createElement(Component, _extends$1({
    ref,
    className: clsx(classes.root, className, tablelvl2 && {
      "head": classes.head,
      "footer": classes.footer
    }[tablelvl2.variant], hover && classes.hover, selected && classes.selected),
    role: Component === defaultComponent ? null : "row"
  }, other));
});
TableRow.propTypes = {
  /**
   * Should be valid <tr> children such as `TableCell`.
   */
  children: PropTypes.node,
  /**
   * Override or extend the styles applied to the component.
   * See [CSS API](#css) below for more details.
   */
  classes: PropTypes.object.isRequired,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * If `true`, the table row will shade on hover.
   */
  hover: PropTypes.bool,
  /**
   * If `true`, the table row will have the selected shading.
   */
  selected: PropTypes.bool
};
const TableRow$1 = withStyles2(styles6, {
  name: "MuiTableRow"
})(TableRow);
var AutoSizer$1 = {};
var interopRequireDefault = { exports: {} };
(function(module2) {
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : {
      "default": e
    };
  }
  module2.exports = _interopRequireDefault, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
})(interopRequireDefault);
var interopRequireDefaultExports = interopRequireDefault.exports;
var AutoSizer = {};
var _typeof = { exports: {} };
var hasRequired_typeof;
function require_typeof() {
  if (hasRequired_typeof)
    return _typeof.exports;
  hasRequired_typeof = 1;
  (function(module2) {
    function _typeof2(o) {
      "@babel/helpers - typeof";
      return module2.exports = _typeof2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, module2.exports.__esModule = true, module2.exports["default"] = module2.exports, _typeof2(o);
    }
    module2.exports = _typeof2, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(_typeof);
  return _typeof.exports;
}
var classCallCheck = { exports: {} };
var hasRequiredClassCallCheck;
function requireClassCallCheck() {
  if (hasRequiredClassCallCheck)
    return classCallCheck.exports;
  hasRequiredClassCallCheck = 1;
  (function(module2) {
    function _classCallCheck(a, n) {
      if (!(a instanceof n))
        throw new TypeError("Cannot call a class as a function");
    }
    module2.exports = _classCallCheck, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(classCallCheck);
  return classCallCheck.exports;
}
var createClass = { exports: {} };
var toPropertyKey = { exports: {} };
var toPrimitive = { exports: {} };
var hasRequiredToPrimitive;
function requireToPrimitive() {
  if (hasRequiredToPrimitive)
    return toPrimitive.exports;
  hasRequiredToPrimitive = 1;
  (function(module2) {
    var _typeof2 = require_typeof()["default"];
    function toPrimitive2(t, r2) {
      if ("object" != _typeof2(t) || !t)
        return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r2 || "default");
        if ("object" != _typeof2(i))
          return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r2 ? String : Number)(t);
    }
    module2.exports = toPrimitive2, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(toPrimitive);
  return toPrimitive.exports;
}
var hasRequiredToPropertyKey;
function requireToPropertyKey() {
  if (hasRequiredToPropertyKey)
    return toPropertyKey.exports;
  hasRequiredToPropertyKey = 1;
  (function(module2) {
    var _typeof2 = require_typeof()["default"];
    var toPrimitive2 = requireToPrimitive();
    function toPropertyKey2(t) {
      var i = toPrimitive2(t, "string");
      return "symbol" == _typeof2(i) ? i : i + "";
    }
    module2.exports = toPropertyKey2, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(toPropertyKey);
  return toPropertyKey.exports;
}
var hasRequiredCreateClass;
function requireCreateClass() {
  if (hasRequiredCreateClass)
    return createClass.exports;
  hasRequiredCreateClass = 1;
  (function(module2) {
    var toPropertyKey2 = requireToPropertyKey();
    function _defineProperties2(e, r2) {
      for (var t = 0; t < r2.length; t++) {
        var o = r2[t];
        o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, toPropertyKey2(o.key), o);
      }
    }
    function _createClass2(e, r2, t) {
      return r2 && _defineProperties2(e.prototype, r2), t && _defineProperties2(e, t), Object.defineProperty(e, "prototype", {
        writable: false
      }), e;
    }
    module2.exports = _createClass2, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(createClass);
  return createClass.exports;
}
var possibleConstructorReturn = { exports: {} };
var assertThisInitialized = { exports: {} };
var hasRequiredAssertThisInitialized;
function requireAssertThisInitialized() {
  if (hasRequiredAssertThisInitialized)
    return assertThisInitialized.exports;
  hasRequiredAssertThisInitialized = 1;
  (function(module2) {
    function _assertThisInitialized2(e) {
      if (void 0 === e)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      return e;
    }
    module2.exports = _assertThisInitialized2, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(assertThisInitialized);
  return assertThisInitialized.exports;
}
var hasRequiredPossibleConstructorReturn;
function requirePossibleConstructorReturn() {
  if (hasRequiredPossibleConstructorReturn)
    return possibleConstructorReturn.exports;
  hasRequiredPossibleConstructorReturn = 1;
  (function(module2) {
    var _typeof2 = require_typeof()["default"];
    var assertThisInitialized2 = requireAssertThisInitialized();
    function _possibleConstructorReturn(t, e) {
      if (e && ("object" == _typeof2(e) || "function" == typeof e))
        return e;
      if (void 0 !== e)
        throw new TypeError("Derived constructors may only return object or undefined");
      return assertThisInitialized2(t);
    }
    module2.exports = _possibleConstructorReturn, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(possibleConstructorReturn);
  return possibleConstructorReturn.exports;
}
var getPrototypeOf = { exports: {} };
var hasRequiredGetPrototypeOf;
function requireGetPrototypeOf() {
  if (hasRequiredGetPrototypeOf)
    return getPrototypeOf.exports;
  hasRequiredGetPrototypeOf = 1;
  (function(module2) {
    function _getPrototypeOf(t) {
      return module2.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t2) {
        return t2.__proto__ || Object.getPrototypeOf(t2);
      }, module2.exports.__esModule = true, module2.exports["default"] = module2.exports, _getPrototypeOf(t);
    }
    module2.exports = _getPrototypeOf, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(getPrototypeOf);
  return getPrototypeOf.exports;
}
var inherits = { exports: {} };
var setPrototypeOf = { exports: {} };
var hasRequiredSetPrototypeOf;
function requireSetPrototypeOf() {
  if (hasRequiredSetPrototypeOf)
    return setPrototypeOf.exports;
  hasRequiredSetPrototypeOf = 1;
  (function(module2) {
    function _setPrototypeOf2(t, e) {
      return module2.exports = _setPrototypeOf2 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
        return t2.__proto__ = e2, t2;
      }, module2.exports.__esModule = true, module2.exports["default"] = module2.exports, _setPrototypeOf2(t, e);
    }
    module2.exports = _setPrototypeOf2, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(setPrototypeOf);
  return setPrototypeOf.exports;
}
var hasRequiredInherits;
function requireInherits() {
  if (hasRequiredInherits)
    return inherits.exports;
  hasRequiredInherits = 1;
  (function(module2) {
    var setPrototypeOf2 = requireSetPrototypeOf();
    function _inherits(t, e) {
      if ("function" != typeof e && null !== e)
        throw new TypeError("Super expression must either be null or a function");
      t.prototype = Object.create(e && e.prototype, {
        constructor: {
          value: t,
          writable: true,
          configurable: true
        }
      }), Object.defineProperty(t, "prototype", {
        writable: false
      }), e && setPrototypeOf2(t, e);
    }
    module2.exports = _inherits, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(inherits);
  return inherits.exports;
}
var defineProperty = { exports: {} };
var hasRequiredDefineProperty;
function requireDefineProperty() {
  if (hasRequiredDefineProperty)
    return defineProperty.exports;
  hasRequiredDefineProperty = 1;
  (function(module2) {
    var toPropertyKey2 = requireToPropertyKey();
    function _defineProperty2(e, r2, t) {
      return (r2 = toPropertyKey2(r2)) in e ? Object.defineProperty(e, r2, {
        value: t,
        enumerable: true,
        configurable: true,
        writable: true
      }) : e[r2] = t, e;
    }
    module2.exports = _defineProperty2, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(defineProperty);
  return defineProperty.exports;
}
var detectElementResize = {};
var hasRequiredDetectElementResize;
function requireDetectElementResize() {
  if (hasRequiredDetectElementResize)
    return detectElementResize;
  hasRequiredDetectElementResize = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = createDetectElementResize;
    function createDetectElementResize(nonce, hostWindow) {
      var _window;
      if (typeof hostWindow !== "undefined") {
        _window = hostWindow;
      } else if (typeof window !== "undefined") {
        _window = window;
      } else if (typeof self !== "undefined") {
        _window = self;
      } else {
        _window = commonjsGlobal;
      }
      var attachEvent = typeof _window.document !== "undefined" && _window.document.attachEvent;
      if (!attachEvent) {
        var requestFrame = function() {
          var raf = _window.requestAnimationFrame || _window.mozRequestAnimationFrame || _window.webkitRequestAnimationFrame || function(fn) {
            return _window.setTimeout(fn, 20);
          };
          return function(fn) {
            return raf(fn);
          };
        }();
        var cancelFrame = function() {
          var cancel = _window.cancelAnimationFrame || _window.mozCancelAnimationFrame || _window.webkitCancelAnimationFrame || _window.clearTimeout;
          return function(id) {
            return cancel(id);
          };
        }();
        var resetTriggers = function resetTriggers2(element) {
          var triggers = element.__resizeTriggers__, expand = triggers.firstElementChild, contract = triggers.lastElementChild, expandChild = expand.firstElementChild;
          contract.scrollLeft = contract.scrollWidth;
          contract.scrollTop = contract.scrollHeight;
          expandChild.style.width = expand.offsetWidth + 1 + "px";
          expandChild.style.height = expand.offsetHeight + 1 + "px";
          expand.scrollLeft = expand.scrollWidth;
          expand.scrollTop = expand.scrollHeight;
        };
        var checkTriggers = function checkTriggers2(element) {
          return element.offsetWidth != element.__resizeLast__.width || element.offsetHeight != element.__resizeLast__.height;
        };
        var scrollListener = function scrollListener2(e) {
          if (e.target.className && typeof e.target.className.indexOf === "function" && e.target.className.indexOf("contract-trigger") < 0 && e.target.className.indexOf("expand-trigger") < 0) {
            return;
          }
          var element = this;
          resetTriggers(this);
          if (this.__resizeRAF__) {
            cancelFrame(this.__resizeRAF__);
          }
          this.__resizeRAF__ = requestFrame(function() {
            if (checkTriggers(element)) {
              element.__resizeLast__.width = element.offsetWidth;
              element.__resizeLast__.height = element.offsetHeight;
              element.__resizeListeners__.forEach(function(fn) {
                fn.call(element, e);
              });
            }
          });
        };
        var animation = false, keyframeprefix = "", animationstartevent = "animationstart", domPrefixes = "Webkit Moz O ms".split(" "), startEvents = "webkitAnimationStart animationstart oAnimationStart MSAnimationStart".split(" "), pfx = "";
        {
          var elm = _window.document.createElement("fakeelement");
          if (elm.style.animationName !== void 0) {
            animation = true;
          }
          if (animation === false) {
            for (var i = 0; i < domPrefixes.length; i++) {
              if (elm.style[domPrefixes[i] + "AnimationName"] !== void 0) {
                pfx = domPrefixes[i];
                keyframeprefix = "-" + pfx.toLowerCase() + "-";
                animationstartevent = startEvents[i];
                animation = true;
                break;
              }
            }
          }
        }
        var animationName = "resizeanim";
        var animationKeyframes = "@" + keyframeprefix + "keyframes " + animationName + " { from { opacity: 0; } to { opacity: 0; } } ";
        var animationStyle = keyframeprefix + "animation: 1ms " + animationName + "; ";
      }
      var createStyles = function createStyles2(doc) {
        if (!doc.getElementById("detectElementResize")) {
          var css2 = (animationKeyframes ? animationKeyframes : "") + ".resize-triggers { " + (animationStyle ? animationStyle : "") + 'visibility: hidden; opacity: 0; } .resize-triggers, .resize-triggers > div, .contract-trigger:before { content: " "; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; z-index: -1; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }', head = doc.head || doc.getElementsByTagName("head")[0], style = doc.createElement("style");
          style.id = "detectElementResize";
          style.type = "text/css";
          if (nonce != null) {
            style.setAttribute("nonce", nonce);
          }
          if (style.styleSheet) {
            style.styleSheet.cssText = css2;
          } else {
            style.appendChild(doc.createTextNode(css2));
          }
          head.appendChild(style);
        }
      };
      var addResizeListener = function addResizeListener2(element, fn) {
        if (attachEvent) {
          element.attachEvent("onresize", fn);
        } else {
          if (!element.__resizeTriggers__) {
            var doc = element.ownerDocument;
            var elementStyle = _window.getComputedStyle(element);
            if (elementStyle && elementStyle.position == "static") {
              element.style.position = "relative";
            }
            createStyles(doc);
            element.__resizeLast__ = {};
            element.__resizeListeners__ = [];
            (element.__resizeTriggers__ = doc.createElement("div")).className = "resize-triggers";
            var expandTrigger = doc.createElement("div");
            expandTrigger.className = "expand-trigger";
            expandTrigger.appendChild(doc.createElement("div"));
            var contractTrigger = doc.createElement("div");
            contractTrigger.className = "contract-trigger";
            element.__resizeTriggers__.appendChild(expandTrigger);
            element.__resizeTriggers__.appendChild(contractTrigger);
            element.appendChild(element.__resizeTriggers__);
            resetTriggers(element);
            element.addEventListener("scroll", scrollListener, true);
            if (animationstartevent) {
              element.__resizeTriggers__.__animationListener__ = function animationListener(e) {
                if (e.animationName == animationName) {
                  resetTriggers(element);
                }
              };
              element.__resizeTriggers__.addEventListener(animationstartevent, element.__resizeTriggers__.__animationListener__);
            }
          }
          element.__resizeListeners__.push(fn);
        }
      };
      var removeResizeListener = function removeResizeListener2(element, fn) {
        if (attachEvent) {
          element.detachEvent("onresize", fn);
        } else {
          element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
          if (!element.__resizeListeners__.length) {
            element.removeEventListener("scroll", scrollListener, true);
            if (element.__resizeTriggers__.__animationListener__) {
              element.__resizeTriggers__.removeEventListener(animationstartevent, element.__resizeTriggers__.__animationListener__);
              element.__resizeTriggers__.__animationListener__ = null;
            }
            try {
              element.__resizeTriggers__ = !element.removeChild(element.__resizeTriggers__);
            } catch (e) {
            }
          }
        }
      };
      return {
        addResizeListener,
        removeResizeListener
      };
    }
  })(detectElementResize);
  return detectElementResize;
}
var hasRequiredAutoSizer;
function requireAutoSizer() {
  if (hasRequiredAutoSizer)
    return AutoSizer;
  hasRequiredAutoSizer = 1;
  (function(exports2) {
    var _interopRequireDefault = interopRequireDefaultExports;
    var _typeof2 = require_typeof();
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var _classCallCheck2 = _interopRequireDefault(requireClassCallCheck());
    var _createClass2 = _interopRequireDefault(requireCreateClass());
    var _possibleConstructorReturn2 = _interopRequireDefault(requirePossibleConstructorReturn());
    var _getPrototypeOf2 = _interopRequireDefault(requireGetPrototypeOf());
    var _inherits2 = _interopRequireDefault(requireInherits());
    var _defineProperty2 = _interopRequireDefault(requireDefineProperty());
    var React2 = _interopRequireWildcard(React__default);
    var _detectElementResize = _interopRequireDefault(requireDetectElementResize());
    function _getRequireWildcardCache(e) {
      if ("function" != typeof WeakMap)
        return null;
      var r2 = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
      return (_getRequireWildcardCache = function _getRequireWildcardCache2(e2) {
        return e2 ? t : r2;
      })(e);
    }
    function _interopRequireWildcard(e, r2) {
      if (!r2 && e && e.__esModule)
        return e;
      if (null === e || "object" != _typeof2(e) && "function" != typeof e)
        return { "default": e };
      var t = _getRequireWildcardCache(r2);
      if (t && t.has(e))
        return t.get(e);
      var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var u in e)
        if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
          var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
          i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
        }
      return n["default"] = e, t && t.set(e, n), n;
    }
    function ownKeys(e, r2) {
      var t = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r2 && (o = o.filter(function(r3) {
          return Object.getOwnPropertyDescriptor(e, r3).enumerable;
        })), t.push.apply(t, o);
      }
      return t;
    }
    function _objectSpread(e) {
      for (var r2 = 1; r2 < arguments.length; r2++) {
        var t = null != arguments[r2] ? arguments[r2] : {};
        r2 % 2 ? ownKeys(Object(t), true).forEach(function(r3) {
          (0, _defineProperty2["default"])(e, r3, t[r3]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r3) {
          Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
        });
      }
      return e;
    }
    function _callSuper(t, o, e) {
      return o = (0, _getPrototypeOf2["default"])(o), (0, _possibleConstructorReturn2["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2["default"])(t).constructor) : o.apply(t, e));
    }
    function _isNativeReflectConstruct() {
      try {
        var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
        }));
      } catch (t2) {
      }
      return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
        return !!t;
      })();
    }
    var AutoSizer2 = exports2["default"] = /* @__PURE__ */ function(_React$Component) {
      function AutoSizer3() {
        var _this;
        (0, _classCallCheck2["default"])(this, AutoSizer3);
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        _this = _callSuper(this, AutoSizer3, [].concat(args));
        (0, _defineProperty2["default"])(_this, "state", {
          height: _this.props.defaultHeight || 0,
          width: _this.props.defaultWidth || 0
        });
        (0, _defineProperty2["default"])(_this, "_parentNode", void 0);
        (0, _defineProperty2["default"])(_this, "_autoSizer", void 0);
        (0, _defineProperty2["default"])(_this, "_window", void 0);
        (0, _defineProperty2["default"])(_this, "_detectElementResize", void 0);
        (0, _defineProperty2["default"])(_this, "_onResize", function() {
          var _this$props = _this.props, disableHeight = _this$props.disableHeight, disableWidth = _this$props.disableWidth, onResize = _this$props.onResize;
          if (_this._parentNode) {
            var height = _this._parentNode.offsetHeight || 0;
            var width = _this._parentNode.offsetWidth || 0;
            var win = _this._window || window;
            var style = win.getComputedStyle(_this._parentNode) || {};
            var paddingLeft = parseInt(style.paddingLeft, 10) || 0;
            var paddingRight = parseInt(style.paddingRight, 10) || 0;
            var paddingTop = parseInt(style.paddingTop, 10) || 0;
            var paddingBottom = parseInt(style.paddingBottom, 10) || 0;
            var newHeight = height - paddingTop - paddingBottom;
            var newWidth = width - paddingLeft - paddingRight;
            if (!disableHeight && _this.state.height !== newHeight || !disableWidth && _this.state.width !== newWidth) {
              _this.setState({
                height: height - paddingTop - paddingBottom,
                width: width - paddingLeft - paddingRight
              });
              onResize({
                height,
                width
              });
            }
          }
        });
        (0, _defineProperty2["default"])(_this, "_setRef", function(autoSizer) {
          _this._autoSizer = autoSizer;
        });
        return _this;
      }
      (0, _inherits2["default"])(AutoSizer3, _React$Component);
      return (0, _createClass2["default"])(AutoSizer3, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          var nonce = this.props.nonce;
          if (this._autoSizer && this._autoSizer.parentNode && this._autoSizer.parentNode.ownerDocument && this._autoSizer.parentNode.ownerDocument.defaultView && this._autoSizer.parentNode instanceof this._autoSizer.parentNode.ownerDocument.defaultView.HTMLElement) {
            this._parentNode = this._autoSizer.parentNode;
            this._window = this._autoSizer.parentNode.ownerDocument.defaultView;
            this._detectElementResize = (0, _detectElementResize["default"])(nonce, this._window);
            this._detectElementResize.addResizeListener(this._parentNode, this._onResize);
            this._onResize();
          }
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          if (this._detectElementResize && this._parentNode) {
            this._detectElementResize.removeResizeListener(this._parentNode, this._onResize);
          }
        }
      }, {
        key: "render",
        value: function render() {
          var _this$props2 = this.props, children = _this$props2.children, className = _this$props2.className, disableHeight = _this$props2.disableHeight, disableWidth = _this$props2.disableWidth, style = _this$props2.style;
          var _this$state = this.state, height = _this$state.height, width = _this$state.width;
          var outerStyle = {
            overflow: "visible"
          };
          var childParams = {};
          if (!disableHeight) {
            outerStyle.height = 0;
            childParams.height = height;
          }
          if (!disableWidth) {
            outerStyle.width = 0;
            childParams.width = width;
          }
          return /* @__PURE__ */ React2.createElement("div", {
            className,
            ref: this._setRef,
            style: _objectSpread(_objectSpread({}, outerStyle), style)
          }, children(childParams));
        }
      }]);
    }(React2.Component);
    (0, _defineProperty2["default"])(AutoSizer2, "defaultProps", {
      onResize: function onResize() {
      },
      disableHeight: false,
      disableWidth: false,
      style: {}
    });
  })(AutoSizer);
  return AutoSizer;
}
(function(exports2) {
  var _interopRequireDefault = interopRequireDefaultExports;
  Object.defineProperty(exports2, "__esModule", {
    value: true
  });
  Object.defineProperty(exports2, "AutoSizer", {
    enumerable: true,
    get: function get3() {
      return _AutoSizer["default"];
    }
  });
  Object.defineProperty(exports2, "default", {
    enumerable: true,
    get: function get3() {
      return _AutoSizer["default"];
    }
  });
  var _AutoSizer = _interopRequireDefault(requireAutoSizer());
})(AutoSizer$1);
var Table$1 = {};
var createMultiSort = {};
var hasRequiredCreateMultiSort;
function requireCreateMultiSort() {
  if (hasRequiredCreateMultiSort)
    return createMultiSort;
  hasRequiredCreateMultiSort = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = createMultiSort2;
    function createMultiSort2(sortCallback) {
      var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, defaultSortBy = _ref.defaultSortBy, _ref$defaultSortDirec = _ref.defaultSortDirection, defaultSortDirection = _ref$defaultSortDirec === void 0 ? {} : _ref$defaultSortDirec;
      if (!sortCallback) {
        throw Error('Required parameter "sortCallback" not specified');
      }
      var sortBy = defaultSortBy || [];
      var sortDirection = {};
      sortBy.forEach(function(dataKey) {
        sortDirection[dataKey] = defaultSortDirection[dataKey] !== void 0 ? defaultSortDirection[dataKey] : "ASC";
      });
      function sort(_ref2) {
        var defaultSortDirection2 = _ref2.defaultSortDirection, event = _ref2.event, dataKey = _ref2.sortBy;
        if (event.shiftKey) {
          if (sortDirection[dataKey] !== void 0) {
            sortDirection[dataKey] = sortDirection[dataKey] === "ASC" ? "DESC" : "ASC";
          } else {
            sortDirection[dataKey] = defaultSortDirection2;
            sortBy.push(dataKey);
          }
        } else if (event.ctrlKey || event.metaKey) {
          var index = sortBy.indexOf(dataKey);
          if (index >= 0) {
            sortBy.splice(index, 1);
            delete sortDirection[dataKey];
          }
        } else {
          sortBy.length = 0;
          sortBy.push(dataKey);
          var sortDirectionKeys = Object.keys(sortDirection);
          sortDirectionKeys.forEach(function(key) {
            if (key !== dataKey)
              delete sortDirection[key];
          });
          if (sortDirection[dataKey] !== void 0) {
            sortDirection[dataKey] = sortDirection[dataKey] === "ASC" ? "DESC" : "ASC";
          } else {
            sortDirection[dataKey] = defaultSortDirection2;
          }
        }
        sortCallback({
          sortBy,
          sortDirection
        });
      }
      return {
        sort,
        sortBy,
        sortDirection
      };
    }
  })(createMultiSort);
  return createMultiSort;
}
var defaultCellDataGetter = {};
var hasRequiredDefaultCellDataGetter;
function requireDefaultCellDataGetter() {
  if (hasRequiredDefaultCellDataGetter)
    return defaultCellDataGetter;
  hasRequiredDefaultCellDataGetter = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = defaultCellDataGetter2;
    function defaultCellDataGetter2(_ref) {
      var dataKey = _ref.dataKey, rowData = _ref.rowData;
      if (typeof rowData.get === "function") {
        return rowData.get(dataKey);
      } else {
        return rowData[dataKey];
      }
    }
  })(defaultCellDataGetter);
  return defaultCellDataGetter;
}
var defaultCellRenderer = {};
var hasRequiredDefaultCellRenderer;
function requireDefaultCellRenderer() {
  if (hasRequiredDefaultCellRenderer)
    return defaultCellRenderer;
  hasRequiredDefaultCellRenderer = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = defaultCellRenderer2;
    function defaultCellRenderer2(_ref) {
      var cellData = _ref.cellData;
      if (cellData == null) {
        return "";
      } else {
        return String(cellData);
      }
    }
  })(defaultCellRenderer);
  return defaultCellRenderer;
}
var defaultHeaderRowRenderer = {};
var hasRequiredDefaultHeaderRowRenderer;
function requireDefaultHeaderRowRenderer() {
  if (hasRequiredDefaultHeaderRowRenderer)
    return defaultHeaderRowRenderer;
  hasRequiredDefaultHeaderRowRenderer = 1;
  (function(exports2) {
    var _typeof2 = require_typeof();
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = defaultHeaderRowRenderer2;
    var React2 = _interopRequireWildcard(React__default);
    function _getRequireWildcardCache(e) {
      if ("function" != typeof WeakMap)
        return null;
      var r2 = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
      return (_getRequireWildcardCache = function _getRequireWildcardCache2(e2) {
        return e2 ? t : r2;
      })(e);
    }
    function _interopRequireWildcard(e, r2) {
      if (!r2 && e && e.__esModule)
        return e;
      if (null === e || "object" != _typeof2(e) && "function" != typeof e)
        return { "default": e };
      var t = _getRequireWildcardCache(r2);
      if (t && t.has(e))
        return t.get(e);
      var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var u in e)
        if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
          var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
          i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
        }
      return n["default"] = e, t && t.set(e, n), n;
    }
    function defaultHeaderRowRenderer2(_ref) {
      var className = _ref.className, columns = _ref.columns, style = _ref.style;
      return /* @__PURE__ */ React2.createElement("div", {
        className,
        role: "row",
        style
      }, columns);
    }
  })(defaultHeaderRowRenderer);
  return defaultHeaderRowRenderer;
}
var defaultHeaderRenderer = {};
var SortIndicator = {};
const require$$9 = /* @__PURE__ */ getAugmentedNamespace(clsx_m);
var SortDirection = {};
var hasRequiredSortDirection;
function requireSortDirection() {
  if (hasRequiredSortDirection)
    return SortDirection;
  hasRequiredSortDirection = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var SortDirection2 = {
      /**
       * Sort items in ascending order.
       * This means arranging from the lowest value to the highest (e.g. a-z, 0-9).
       */
      ASC: "ASC",
      /**
       * Sort items in descending order.
       * This means arranging from the highest value to the lowest (e.g. z-a, 9-0).
       */
      DESC: "DESC"
    };
    exports2["default"] = SortDirection2;
  })(SortDirection);
  return SortDirection;
}
var hasRequiredSortIndicator;
function requireSortIndicator() {
  if (hasRequiredSortIndicator)
    return SortIndicator;
  hasRequiredSortIndicator = 1;
  (function(exports2) {
    var _interopRequireDefault = interopRequireDefaultExports;
    var _typeof2 = require_typeof();
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = SortIndicator2;
    var _clsx = _interopRequireDefault(require$$9);
    var _propTypes = _interopRequireDefault(propTypesExports);
    var React2 = _interopRequireWildcard(React__default);
    var _SortDirection = _interopRequireDefault(requireSortDirection());
    function _getRequireWildcardCache(e) {
      if ("function" != typeof WeakMap)
        return null;
      var r2 = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
      return (_getRequireWildcardCache = function _getRequireWildcardCache2(e2) {
        return e2 ? t : r2;
      })(e);
    }
    function _interopRequireWildcard(e, r2) {
      if (!r2 && e && e.__esModule)
        return e;
      if (null === e || "object" != _typeof2(e) && "function" != typeof e)
        return { "default": e };
      var t = _getRequireWildcardCache(r2);
      if (t && t.has(e))
        return t.get(e);
      var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var u in e)
        if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
          var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
          i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
        }
      return n["default"] = e, t && t.set(e, n), n;
    }
    function SortIndicator2(_ref) {
      var sortDirection = _ref.sortDirection;
      var classNames = (0, _clsx["default"])("ReactVirtualized__Table__sortableHeaderIcon", {
        "ReactVirtualized__Table__sortableHeaderIcon--ASC": sortDirection === _SortDirection["default"].ASC,
        "ReactVirtualized__Table__sortableHeaderIcon--DESC": sortDirection === _SortDirection["default"].DESC
      });
      return /* @__PURE__ */ React2.createElement("svg", {
        className: classNames,
        width: 18,
        height: 18,
        viewBox: "0 0 24 24"
      }, sortDirection === _SortDirection["default"].ASC ? /* @__PURE__ */ React2.createElement("path", {
        d: "M7 14l5-5 5 5z"
      }) : /* @__PURE__ */ React2.createElement("path", {
        d: "M7 10l5 5 5-5z"
      }), /* @__PURE__ */ React2.createElement("path", {
        d: "M0 0h24v24H0z",
        fill: "none"
      }));
    }
    SortIndicator2.propTypes = {
      sortDirection: _propTypes["default"].oneOf([_SortDirection["default"].ASC, _SortDirection["default"].DESC])
    };
  })(SortIndicator);
  return SortIndicator;
}
var hasRequiredDefaultHeaderRenderer;
function requireDefaultHeaderRenderer() {
  if (hasRequiredDefaultHeaderRenderer)
    return defaultHeaderRenderer;
  hasRequiredDefaultHeaderRenderer = 1;
  (function(exports2) {
    var _interopRequireDefault = interopRequireDefaultExports;
    var _typeof2 = require_typeof();
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = defaultHeaderRenderer2;
    var React2 = _interopRequireWildcard(React__default);
    var _SortIndicator = _interopRequireDefault(requireSortIndicator());
    function _getRequireWildcardCache(e) {
      if ("function" != typeof WeakMap)
        return null;
      var r2 = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
      return (_getRequireWildcardCache = function _getRequireWildcardCache2(e2) {
        return e2 ? t : r2;
      })(e);
    }
    function _interopRequireWildcard(e, r2) {
      if (!r2 && e && e.__esModule)
        return e;
      if (null === e || "object" != _typeof2(e) && "function" != typeof e)
        return { "default": e };
      var t = _getRequireWildcardCache(r2);
      if (t && t.has(e))
        return t.get(e);
      var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var u in e)
        if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
          var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
          i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
        }
      return n["default"] = e, t && t.set(e, n), n;
    }
    function defaultHeaderRenderer2(_ref) {
      var dataKey = _ref.dataKey, label = _ref.label, sortBy = _ref.sortBy, sortDirection = _ref.sortDirection;
      var showSortIndicator = sortBy === dataKey;
      var children = [/* @__PURE__ */ React2.createElement("span", {
        className: "ReactVirtualized__Table__headerTruncatedText",
        key: "label",
        title: typeof label === "string" ? label : null
      }, label)];
      if (showSortIndicator) {
        children.push(/* @__PURE__ */ React2.createElement(_SortIndicator["default"], {
          key: "SortIndicator",
          sortDirection
        }));
      }
      return children;
    }
  })(defaultHeaderRenderer);
  return defaultHeaderRenderer;
}
var defaultRowRenderer = {};
var _extends = { exports: {} };
var hasRequired_extends;
function require_extends() {
  if (hasRequired_extends)
    return _extends.exports;
  hasRequired_extends = 1;
  (function(module2) {
    function _extends2() {
      return module2.exports = _extends2 = Object.assign ? Object.assign.bind() : function(n) {
        for (var e = 1; e < arguments.length; e++) {
          var t = arguments[e];
          for (var r2 in t)
            ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
        }
        return n;
      }, module2.exports.__esModule = true, module2.exports["default"] = module2.exports, _extends2.apply(null, arguments);
    }
    module2.exports = _extends2, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(_extends);
  return _extends.exports;
}
var hasRequiredDefaultRowRenderer;
function requireDefaultRowRenderer() {
  if (hasRequiredDefaultRowRenderer)
    return defaultRowRenderer;
  hasRequiredDefaultRowRenderer = 1;
  (function(exports2) {
    var _interopRequireDefault = interopRequireDefaultExports;
    var _typeof2 = require_typeof();
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = defaultRowRenderer2;
    var _extends2 = _interopRequireDefault(require_extends());
    var React2 = _interopRequireWildcard(React__default);
    function _getRequireWildcardCache(e) {
      if ("function" != typeof WeakMap)
        return null;
      var r2 = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
      return (_getRequireWildcardCache = function _getRequireWildcardCache2(e2) {
        return e2 ? t : r2;
      })(e);
    }
    function _interopRequireWildcard(e, r2) {
      if (!r2 && e && e.__esModule)
        return e;
      if (null === e || "object" != _typeof2(e) && "function" != typeof e)
        return { "default": e };
      var t = _getRequireWildcardCache(r2);
      if (t && t.has(e))
        return t.get(e);
      var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var u in e)
        if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
          var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
          i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
        }
      return n["default"] = e, t && t.set(e, n), n;
    }
    function defaultRowRenderer2(_ref) {
      var className = _ref.className, columns = _ref.columns, index = _ref.index, key = _ref.key, onRowClick = _ref.onRowClick, onRowDoubleClick = _ref.onRowDoubleClick, onRowMouseOut = _ref.onRowMouseOut, onRowMouseOver = _ref.onRowMouseOver, onRowRightClick = _ref.onRowRightClick, rowData = _ref.rowData, style = _ref.style;
      var a11yProps = {
        "aria-rowindex": index + 1
      };
      if (onRowClick || onRowDoubleClick || onRowMouseOut || onRowMouseOver || onRowRightClick) {
        a11yProps["aria-label"] = "row";
        a11yProps.tabIndex = 0;
        if (onRowClick) {
          a11yProps.onClick = function(event) {
            return onRowClick({
              event,
              index,
              rowData
            });
          };
        }
        if (onRowDoubleClick) {
          a11yProps.onDoubleClick = function(event) {
            return onRowDoubleClick({
              event,
              index,
              rowData
            });
          };
        }
        if (onRowMouseOut) {
          a11yProps.onMouseOut = function(event) {
            return onRowMouseOut({
              event,
              index,
              rowData
            });
          };
        }
        if (onRowMouseOver) {
          a11yProps.onMouseOver = function(event) {
            return onRowMouseOver({
              event,
              index,
              rowData
            });
          };
        }
        if (onRowRightClick) {
          a11yProps.onContextMenu = function(event) {
            return onRowRightClick({
              event,
              index,
              rowData
            });
          };
        }
      }
      return /* @__PURE__ */ React2.createElement("div", (0, _extends2["default"])({}, a11yProps, {
        className,
        key,
        role: "row",
        style
      }), columns);
    }
  })(defaultRowRenderer);
  return defaultRowRenderer;
}
var Column = {};
var hasRequiredColumn;
function requireColumn() {
  if (hasRequiredColumn)
    return Column;
  hasRequiredColumn = 1;
  (function(exports2) {
    var _interopRequireDefault = interopRequireDefaultExports;
    var _typeof2 = require_typeof();
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var _createClass2 = _interopRequireDefault(requireCreateClass());
    var _classCallCheck2 = _interopRequireDefault(requireClassCallCheck());
    var _possibleConstructorReturn2 = _interopRequireDefault(requirePossibleConstructorReturn());
    var _getPrototypeOf2 = _interopRequireDefault(requireGetPrototypeOf());
    var _inherits2 = _interopRequireDefault(requireInherits());
    var _defineProperty2 = _interopRequireDefault(requireDefineProperty());
    var _propTypes = _interopRequireDefault(propTypesExports);
    var React2 = _interopRequireWildcard(React__default);
    var _defaultHeaderRenderer = _interopRequireDefault(requireDefaultHeaderRenderer());
    var _defaultCellRenderer = _interopRequireDefault(requireDefaultCellRenderer());
    var _defaultCellDataGetter = _interopRequireDefault(requireDefaultCellDataGetter());
    var _SortDirection = _interopRequireDefault(requireSortDirection());
    function _getRequireWildcardCache(e) {
      if ("function" != typeof WeakMap)
        return null;
      var r2 = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
      return (_getRequireWildcardCache = function _getRequireWildcardCache2(e2) {
        return e2 ? t : r2;
      })(e);
    }
    function _interopRequireWildcard(e, r2) {
      if (!r2 && e && e.__esModule)
        return e;
      if (null === e || "object" != _typeof2(e) && "function" != typeof e)
        return { "default": e };
      var t = _getRequireWildcardCache(r2);
      if (t && t.has(e))
        return t.get(e);
      var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var u in e)
        if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
          var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
          i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
        }
      return n["default"] = e, t && t.set(e, n), n;
    }
    function _callSuper(t, o, e) {
      return o = (0, _getPrototypeOf2["default"])(o), (0, _possibleConstructorReturn2["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2["default"])(t).constructor) : o.apply(t, e));
    }
    function _isNativeReflectConstruct() {
      try {
        var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
        }));
      } catch (t2) {
      }
      return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
        return !!t;
      })();
    }
    var Column2 = exports2["default"] = /* @__PURE__ */ function(_React$Component) {
      function Column3() {
        (0, _classCallCheck2["default"])(this, Column3);
        return _callSuper(this, Column3, arguments);
      }
      (0, _inherits2["default"])(Column3, _React$Component);
      return (0, _createClass2["default"])(Column3);
    }(React2.Component);
    (0, _defineProperty2["default"])(Column2, "defaultProps", {
      cellDataGetter: _defaultCellDataGetter["default"],
      cellRenderer: _defaultCellRenderer["default"],
      defaultSortDirection: _SortDirection["default"].ASC,
      flexGrow: 0,
      flexShrink: 1,
      headerRenderer: _defaultHeaderRenderer["default"],
      style: {}
    });
    Column2.propTypes = {
      /** Optional aria-label value to set on the column header */
      "aria-label": _propTypes["default"].string,
      /**
       * Callback responsible for returning a cell's data, given its :dataKey
       * ({ columnData: any, dataKey: string, rowData: any }): any
       */
      cellDataGetter: _propTypes["default"].func,
      /**
       * Callback responsible for rendering a cell's contents.
       * ({ cellData: any, columnData: any, dataKey: string, rowData: any, rowIndex: number }): node
       */
      cellRenderer: _propTypes["default"].func,
      /** Optional CSS class to apply to cell */
      className: _propTypes["default"].string,
      /** Optional additional data passed to this column's :cellDataGetter */
      columnData: _propTypes["default"].object,
      /** Uniquely identifies the row-data attribute corresponding to this cell */
      dataKey: _propTypes["default"].any.isRequired,
      /** Optional direction to be used when clicked the first time */
      defaultSortDirection: _propTypes["default"].oneOf([_SortDirection["default"].ASC, _SortDirection["default"].DESC]),
      /** If sort is enabled for the table at large, disable it for this column */
      disableSort: _propTypes["default"].bool,
      /** Flex grow style; defaults to 0 */
      flexGrow: _propTypes["default"].number,
      /** Flex shrink style; defaults to 1 */
      flexShrink: _propTypes["default"].number,
      /** Optional CSS class to apply to this column's header */
      headerClassName: _propTypes["default"].string,
      /**
       * Optional callback responsible for rendering a column header contents.
       * ({ columnData: object, dataKey: string, disableSort: boolean, label: node, sortBy: string, sortDirection: string }): PropTypes.node
       */
      headerRenderer: _propTypes["default"].func.isRequired,
      /** Optional inline style to apply to this column's header */
      headerStyle: _propTypes["default"].object,
      /** Optional id to set on the column header */
      id: _propTypes["default"].string,
      /** Header label for this column */
      label: _propTypes["default"].node,
      /** Maximum width of column; this property will only be used if :flexGrow is > 0. */
      maxWidth: _propTypes["default"].number,
      /** Minimum width of column. */
      minWidth: _propTypes["default"].number,
      /** Optional inline style to apply to cell */
      style: _propTypes["default"].object,
      /** Flex basis (width) for this column; This value can grow or shrink based on :flexGrow and :flexShrink properties. */
      width: _propTypes["default"].number.isRequired
    };
  })(Column);
  return Column;
}
var Table = {};
var Grid$1 = {};
var Grid = {};
var calculateSizeAndPositionDataAndUpdateScrollOffset = {};
var hasRequiredCalculateSizeAndPositionDataAndUpdateScrollOffset;
function requireCalculateSizeAndPositionDataAndUpdateScrollOffset() {
  if (hasRequiredCalculateSizeAndPositionDataAndUpdateScrollOffset)
    return calculateSizeAndPositionDataAndUpdateScrollOffset;
  hasRequiredCalculateSizeAndPositionDataAndUpdateScrollOffset = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = calculateSizeAndPositionDataAndUpdateScrollOffset2;
    function calculateSizeAndPositionDataAndUpdateScrollOffset2(_ref) {
      var cellCount = _ref.cellCount, cellSize = _ref.cellSize, computeMetadataCallback = _ref.computeMetadataCallback, computeMetadataCallbackProps = _ref.computeMetadataCallbackProps, nextCellsCount = _ref.nextCellsCount, nextCellSize = _ref.nextCellSize, nextScrollToIndex = _ref.nextScrollToIndex, scrollToIndex = _ref.scrollToIndex, updateScrollOffsetForScrollToIndex = _ref.updateScrollOffsetForScrollToIndex;
      if (cellCount !== nextCellsCount || (typeof cellSize === "number" || typeof nextCellSize === "number") && cellSize !== nextCellSize) {
        computeMetadataCallback(computeMetadataCallbackProps);
        if (scrollToIndex >= 0 && scrollToIndex === nextScrollToIndex) {
          updateScrollOffsetForScrollToIndex();
        }
      }
    }
  })(calculateSizeAndPositionDataAndUpdateScrollOffset);
  return calculateSizeAndPositionDataAndUpdateScrollOffset;
}
var ScalingCellSizeAndPositionManager = {};
var objectWithoutProperties = { exports: {} };
var objectWithoutPropertiesLoose = { exports: {} };
var hasRequiredObjectWithoutPropertiesLoose;
function requireObjectWithoutPropertiesLoose() {
  if (hasRequiredObjectWithoutPropertiesLoose)
    return objectWithoutPropertiesLoose.exports;
  hasRequiredObjectWithoutPropertiesLoose = 1;
  (function(module2) {
    function _objectWithoutPropertiesLoose2(r2, e) {
      if (null == r2)
        return {};
      var t = {};
      for (var n in r2)
        if ({}.hasOwnProperty.call(r2, n)) {
          if (-1 !== e.indexOf(n))
            continue;
          t[n] = r2[n];
        }
      return t;
    }
    module2.exports = _objectWithoutPropertiesLoose2, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(objectWithoutPropertiesLoose);
  return objectWithoutPropertiesLoose.exports;
}
var hasRequiredObjectWithoutProperties;
function requireObjectWithoutProperties() {
  if (hasRequiredObjectWithoutProperties)
    return objectWithoutProperties.exports;
  hasRequiredObjectWithoutProperties = 1;
  (function(module2) {
    var objectWithoutPropertiesLoose2 = requireObjectWithoutPropertiesLoose();
    function _objectWithoutProperties2(e, t) {
      if (null == e)
        return {};
      var o, r2, i = objectWithoutPropertiesLoose2(e, t);
      if (Object.getOwnPropertySymbols) {
        var n = Object.getOwnPropertySymbols(e);
        for (r2 = 0; r2 < n.length; r2++)
          o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
      }
      return i;
    }
    module2.exports = _objectWithoutProperties2, module2.exports.__esModule = true, module2.exports["default"] = module2.exports;
  })(objectWithoutProperties);
  return objectWithoutProperties.exports;
}
var CellSizeAndPositionManager = {};
var hasRequiredCellSizeAndPositionManager;
function requireCellSizeAndPositionManager() {
  if (hasRequiredCellSizeAndPositionManager)
    return CellSizeAndPositionManager;
  hasRequiredCellSizeAndPositionManager = 1;
  (function(exports2) {
    var _interopRequireDefault = interopRequireDefaultExports;
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var _classCallCheck2 = _interopRequireDefault(requireClassCallCheck());
    var _createClass2 = _interopRequireDefault(requireCreateClass());
    var _defineProperty2 = _interopRequireDefault(requireDefineProperty());
    exports2["default"] = /* @__PURE__ */ function() {
      function CellSizeAndPositionManager2(_ref) {
        var cellCount = _ref.cellCount, cellSizeGetter = _ref.cellSizeGetter, estimatedCellSize = _ref.estimatedCellSize;
        (0, _classCallCheck2["default"])(this, CellSizeAndPositionManager2);
        (0, _defineProperty2["default"])(this, "_cellSizeAndPositionData", {});
        (0, _defineProperty2["default"])(this, "_lastMeasuredIndex", -1);
        (0, _defineProperty2["default"])(this, "_lastBatchedIndex", -1);
        (0, _defineProperty2["default"])(this, "_cellCount", void 0);
        (0, _defineProperty2["default"])(this, "_cellSizeGetter", void 0);
        (0, _defineProperty2["default"])(this, "_estimatedCellSize", void 0);
        this._cellSizeGetter = cellSizeGetter;
        this._cellCount = cellCount;
        this._estimatedCellSize = estimatedCellSize;
      }
      return (0, _createClass2["default"])(CellSizeAndPositionManager2, [{
        key: "areOffsetsAdjusted",
        value: function areOffsetsAdjusted() {
          return false;
        }
      }, {
        key: "configure",
        value: function configure(_ref2) {
          var cellCount = _ref2.cellCount, estimatedCellSize = _ref2.estimatedCellSize, cellSizeGetter = _ref2.cellSizeGetter;
          this._cellCount = cellCount;
          this._estimatedCellSize = estimatedCellSize;
          this._cellSizeGetter = cellSizeGetter;
        }
      }, {
        key: "getCellCount",
        value: function getCellCount() {
          return this._cellCount;
        }
      }, {
        key: "getEstimatedCellSize",
        value: function getEstimatedCellSize() {
          return this._estimatedCellSize;
        }
      }, {
        key: "getLastMeasuredIndex",
        value: function getLastMeasuredIndex() {
          return this._lastMeasuredIndex;
        }
      }, {
        key: "getOffsetAdjustment",
        value: function getOffsetAdjustment() {
          return 0;
        }
        /**
         * This method returns the size and position for the cell at the specified index.
         * It just-in-time calculates (or used cached values) for cells leading up to the index.
         */
      }, {
        key: "getSizeAndPositionOfCell",
        value: function getSizeAndPositionOfCell(index) {
          if (index < 0 || index >= this._cellCount) {
            throw Error("Requested index ".concat(index, " is outside of range 0..").concat(this._cellCount));
          }
          if (index > this._lastMeasuredIndex) {
            var lastMeasuredCellSizeAndPosition = this.getSizeAndPositionOfLastMeasuredCell();
            var offset = lastMeasuredCellSizeAndPosition.offset + lastMeasuredCellSizeAndPosition.size;
            for (var i = this._lastMeasuredIndex + 1; i <= index; i++) {
              var size2 = this._cellSizeGetter({
                index: i
              });
              if (size2 === void 0 || isNaN(size2)) {
                throw Error("Invalid size returned for cell ".concat(i, " of value ").concat(size2));
              } else if (size2 === null) {
                this._cellSizeAndPositionData[i] = {
                  offset,
                  size: 0
                };
                this._lastBatchedIndex = index;
              } else {
                this._cellSizeAndPositionData[i] = {
                  offset,
                  size: size2
                };
                offset += size2;
                this._lastMeasuredIndex = index;
              }
            }
          }
          return this._cellSizeAndPositionData[index];
        }
      }, {
        key: "getSizeAndPositionOfLastMeasuredCell",
        value: function getSizeAndPositionOfLastMeasuredCell() {
          return this._lastMeasuredIndex >= 0 ? this._cellSizeAndPositionData[this._lastMeasuredIndex] : {
            offset: 0,
            size: 0
          };
        }
        /**
         * Total size of all cells being measured.
         * This value will be completely estimated initially.
         * As cells are measured, the estimate will be updated.
         */
      }, {
        key: "getTotalSize",
        value: function getTotalSize() {
          var lastMeasuredCellSizeAndPosition = this.getSizeAndPositionOfLastMeasuredCell();
          var totalSizeOfMeasuredCells = lastMeasuredCellSizeAndPosition.offset + lastMeasuredCellSizeAndPosition.size;
          var numUnmeasuredCells = this._cellCount - this._lastMeasuredIndex - 1;
          var totalSizeOfUnmeasuredCells = numUnmeasuredCells * this._estimatedCellSize;
          return totalSizeOfMeasuredCells + totalSizeOfUnmeasuredCells;
        }
        /**
         * Determines a new offset that ensures a certain cell is visible, given the current offset.
         * If the cell is already visible then the current offset will be returned.
         * If the current offset is too great or small, it will be adjusted just enough to ensure the specified index is visible.
         *
         * @param align Desired alignment within container; one of "auto" (default), "start", or "end"
         * @param containerSize Size (width or height) of the container viewport
         * @param currentOffset Container's current (x or y) offset
         * @param totalSize Total size (width or height) of all cells
         * @return Offset to use to ensure the specified cell is visible
         */
      }, {
        key: "getUpdatedOffsetForIndex",
        value: function getUpdatedOffsetForIndex(_ref3) {
          var _ref3$align = _ref3.align, align = _ref3$align === void 0 ? "auto" : _ref3$align, containerSize = _ref3.containerSize, currentOffset = _ref3.currentOffset, targetIndex = _ref3.targetIndex;
          if (containerSize <= 0) {
            return 0;
          }
          var datum = this.getSizeAndPositionOfCell(targetIndex);
          var maxOffset = datum.offset;
          var minOffset = maxOffset - containerSize + datum.size;
          var idealOffset;
          switch (align) {
            case "start":
              idealOffset = maxOffset;
              break;
            case "end":
              idealOffset = minOffset;
              break;
            case "center":
              idealOffset = maxOffset - (containerSize - datum.size) / 2;
              break;
            default:
              idealOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset));
              break;
          }
          var totalSize = this.getTotalSize();
          return Math.max(0, Math.min(totalSize - containerSize, idealOffset));
        }
      }, {
        key: "getVisibleCellRange",
        value: function getVisibleCellRange(params) {
          var containerSize = params.containerSize, offset = params.offset;
          var totalSize = this.getTotalSize();
          if (totalSize === 0) {
            return {};
          }
          var maxOffset = offset + containerSize;
          var start = this._findNearestCell(offset);
          var datum = this.getSizeAndPositionOfCell(start);
          offset = datum.offset + datum.size;
          var stop = start;
          while (offset < maxOffset && stop < this._cellCount - 1) {
            stop++;
            offset += this.getSizeAndPositionOfCell(stop).size;
          }
          return {
            start,
            stop
          };
        }
        /**
         * Clear all cached values for cells after the specified index.
         * This method should be called for any cell that has changed its size.
         * It will not immediately perform any calculations; they'll be performed the next time getSizeAndPositionOfCell() is called.
         */
      }, {
        key: "resetCell",
        value: function resetCell(index) {
          this._lastMeasuredIndex = Math.min(this._lastMeasuredIndex, index - 1);
        }
      }, {
        key: "_binarySearch",
        value: function _binarySearch(high, low, offset) {
          while (low <= high) {
            var middle = low + Math.floor((high - low) / 2);
            var currentOffset = this.getSizeAndPositionOfCell(middle).offset;
            if (currentOffset === offset) {
              return middle;
            } else if (currentOffset < offset) {
              low = middle + 1;
            } else if (currentOffset > offset) {
              high = middle - 1;
            }
          }
          if (low > 0) {
            return low - 1;
          } else {
            return 0;
          }
        }
      }, {
        key: "_exponentialSearch",
        value: function _exponentialSearch(index, offset) {
          var interval = 1;
          while (index < this._cellCount && this.getSizeAndPositionOfCell(index).offset < offset) {
            index += interval;
            interval *= 2;
          }
          return this._binarySearch(Math.min(index, this._cellCount - 1), Math.floor(index / 2), offset);
        }
        /**
         * Searches for the cell (index) nearest the specified offset.
         *
         * If no exact match is found the next lowest cell index will be returned.
         * This allows partially visible cells (with offsets just before/above the fold) to be visible.
         */
      }, {
        key: "_findNearestCell",
        value: function _findNearestCell(offset) {
          if (isNaN(offset)) {
            throw Error("Invalid offset ".concat(offset, " specified"));
          }
          offset = Math.max(0, offset);
          var lastMeasuredCellSizeAndPosition = this.getSizeAndPositionOfLastMeasuredCell();
          var lastMeasuredIndex = Math.max(0, this._lastMeasuredIndex);
          if (lastMeasuredCellSizeAndPosition.offset >= offset) {
            return this._binarySearch(lastMeasuredIndex, 0, offset);
          } else {
            return this._exponentialSearch(lastMeasuredIndex, offset);
          }
        }
      }]);
    }();
  })(CellSizeAndPositionManager);
  return CellSizeAndPositionManager;
}
var maxElementSize = {};
var hasRequiredMaxElementSize;
function requireMaxElementSize() {
  if (hasRequiredMaxElementSize)
    return maxElementSize;
  hasRequiredMaxElementSize = 1;
  Object.defineProperty(maxElementSize, "__esModule", {
    value: true
  });
  maxElementSize.getMaxElementSize = void 0;
  var DEFAULT_MAX_ELEMENT_SIZE = 15e5;
  var CHROME_MAX_ELEMENT_SIZE = 16777100;
  var isBrowser2 = function isBrowser3() {
    return typeof window !== "undefined";
  };
  var isChrome = function isChrome2() {
    return !!window.chrome;
  };
  maxElementSize.getMaxElementSize = function getMaxElementSize() {
    if (isBrowser2()) {
      if (isChrome()) {
        return CHROME_MAX_ELEMENT_SIZE;
      }
    }
    return DEFAULT_MAX_ELEMENT_SIZE;
  };
  return maxElementSize;
}
var hasRequiredScalingCellSizeAndPositionManager;
function requireScalingCellSizeAndPositionManager() {
  if (hasRequiredScalingCellSizeAndPositionManager)
    return ScalingCellSizeAndPositionManager;
  hasRequiredScalingCellSizeAndPositionManager = 1;
  (function(exports2) {
    var _interopRequireDefault = interopRequireDefaultExports;
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var _objectWithoutProperties2 = _interopRequireDefault(requireObjectWithoutProperties());
    var _classCallCheck2 = _interopRequireDefault(requireClassCallCheck());
    var _createClass2 = _interopRequireDefault(requireCreateClass());
    var _defineProperty2 = _interopRequireDefault(requireDefineProperty());
    var _CellSizeAndPositionManager = _interopRequireDefault(requireCellSizeAndPositionManager());
    var _maxElementSize = requireMaxElementSize();
    var _excluded = ["maxScrollSize"];
    exports2["default"] = /* @__PURE__ */ function() {
      function ScalingCellSizeAndPositionManager2(_ref) {
        var _ref$maxScrollSize = _ref.maxScrollSize, maxScrollSize = _ref$maxScrollSize === void 0 ? (0, _maxElementSize.getMaxElementSize)() : _ref$maxScrollSize, params = (0, _objectWithoutProperties2["default"])(_ref, _excluded);
        (0, _classCallCheck2["default"])(this, ScalingCellSizeAndPositionManager2);
        (0, _defineProperty2["default"])(this, "_cellSizeAndPositionManager", void 0);
        (0, _defineProperty2["default"])(this, "_maxScrollSize", void 0);
        this._cellSizeAndPositionManager = new _CellSizeAndPositionManager["default"](params);
        this._maxScrollSize = maxScrollSize;
      }
      return (0, _createClass2["default"])(ScalingCellSizeAndPositionManager2, [{
        key: "areOffsetsAdjusted",
        value: function areOffsetsAdjusted() {
          return this._cellSizeAndPositionManager.getTotalSize() > this._maxScrollSize;
        }
      }, {
        key: "configure",
        value: function configure(params) {
          this._cellSizeAndPositionManager.configure(params);
        }
      }, {
        key: "getCellCount",
        value: function getCellCount() {
          return this._cellSizeAndPositionManager.getCellCount();
        }
      }, {
        key: "getEstimatedCellSize",
        value: function getEstimatedCellSize() {
          return this._cellSizeAndPositionManager.getEstimatedCellSize();
        }
      }, {
        key: "getLastMeasuredIndex",
        value: function getLastMeasuredIndex() {
          return this._cellSizeAndPositionManager.getLastMeasuredIndex();
        }
        /**
         * Number of pixels a cell at the given position (offset) should be shifted in order to fit within the scaled container.
         * The offset passed to this function is scaled (safe) as well.
         */
      }, {
        key: "getOffsetAdjustment",
        value: function getOffsetAdjustment(_ref2) {
          var containerSize = _ref2.containerSize, offset = _ref2.offset;
          var totalSize = this._cellSizeAndPositionManager.getTotalSize();
          var safeTotalSize = this.getTotalSize();
          var offsetPercentage = this._getOffsetPercentage({
            containerSize,
            offset,
            totalSize: safeTotalSize
          });
          return Math.round(offsetPercentage * (safeTotalSize - totalSize));
        }
      }, {
        key: "getSizeAndPositionOfCell",
        value: function getSizeAndPositionOfCell(index) {
          return this._cellSizeAndPositionManager.getSizeAndPositionOfCell(index);
        }
      }, {
        key: "getSizeAndPositionOfLastMeasuredCell",
        value: function getSizeAndPositionOfLastMeasuredCell() {
          return this._cellSizeAndPositionManager.getSizeAndPositionOfLastMeasuredCell();
        }
        /** See CellSizeAndPositionManager#getTotalSize */
      }, {
        key: "getTotalSize",
        value: function getTotalSize() {
          return Math.min(this._maxScrollSize, this._cellSizeAndPositionManager.getTotalSize());
        }
        /** See CellSizeAndPositionManager#getUpdatedOffsetForIndex */
      }, {
        key: "getUpdatedOffsetForIndex",
        value: function getUpdatedOffsetForIndex(_ref3) {
          var _ref3$align = _ref3.align, align = _ref3$align === void 0 ? "auto" : _ref3$align, containerSize = _ref3.containerSize, currentOffset = _ref3.currentOffset, targetIndex = _ref3.targetIndex;
          currentOffset = this._safeOffsetToOffset({
            containerSize,
            offset: currentOffset
          });
          var offset = this._cellSizeAndPositionManager.getUpdatedOffsetForIndex({
            align,
            containerSize,
            currentOffset,
            targetIndex
          });
          return this._offsetToSafeOffset({
            containerSize,
            offset
          });
        }
        /** See CellSizeAndPositionManager#getVisibleCellRange */
      }, {
        key: "getVisibleCellRange",
        value: function getVisibleCellRange(_ref4) {
          var containerSize = _ref4.containerSize, offset = _ref4.offset;
          offset = this._safeOffsetToOffset({
            containerSize,
            offset
          });
          return this._cellSizeAndPositionManager.getVisibleCellRange({
            containerSize,
            offset
          });
        }
      }, {
        key: "resetCell",
        value: function resetCell(index) {
          this._cellSizeAndPositionManager.resetCell(index);
        }
      }, {
        key: "_getOffsetPercentage",
        value: function _getOffsetPercentage(_ref5) {
          var containerSize = _ref5.containerSize, offset = _ref5.offset, totalSize = _ref5.totalSize;
          return totalSize <= containerSize ? 0 : offset / (totalSize - containerSize);
        }
      }, {
        key: "_offsetToSafeOffset",
        value: function _offsetToSafeOffset(_ref6) {
          var containerSize = _ref6.containerSize, offset = _ref6.offset;
          var totalSize = this._cellSizeAndPositionManager.getTotalSize();
          var safeTotalSize = this.getTotalSize();
          if (totalSize === safeTotalSize) {
            return offset;
          } else {
            var offsetPercentage = this._getOffsetPercentage({
              containerSize,
              offset,
              totalSize
            });
            return Math.round(offsetPercentage * (safeTotalSize - containerSize));
          }
        }
      }, {
        key: "_safeOffsetToOffset",
        value: function _safeOffsetToOffset(_ref7) {
          var containerSize = _ref7.containerSize, offset = _ref7.offset;
          var totalSize = this._cellSizeAndPositionManager.getTotalSize();
          var safeTotalSize = this.getTotalSize();
          if (totalSize === safeTotalSize) {
            return offset;
          } else {
            var offsetPercentage = this._getOffsetPercentage({
              containerSize,
              offset,
              totalSize: safeTotalSize
            });
            return Math.round(offsetPercentage * (totalSize - containerSize));
          }
        }
      }]);
    }();
  })(ScalingCellSizeAndPositionManager);
  return ScalingCellSizeAndPositionManager;
}
var createCallbackMemoizer = {};
var hasRequiredCreateCallbackMemoizer;
function requireCreateCallbackMemoizer() {
  if (hasRequiredCreateCallbackMemoizer)
    return createCallbackMemoizer;
  hasRequiredCreateCallbackMemoizer = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = createCallbackMemoizer2;
    function createCallbackMemoizer2() {
      var requireAllKeys = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
      var cachedIndices = {};
      return function(_ref) {
        var callback = _ref.callback, indices = _ref.indices;
        var keys2 = Object.keys(indices);
        var allInitialized = !requireAllKeys || keys2.every(function(key) {
          var value = indices[key];
          return Array.isArray(value) ? value.length > 0 : value >= 0;
        });
        var indexChanged = keys2.length !== Object.keys(cachedIndices).length || keys2.some(function(key) {
          var cachedValue = cachedIndices[key];
          var value = indices[key];
          return Array.isArray(value) ? cachedValue.join(",") !== value.join(",") : cachedValue !== value;
        });
        cachedIndices = indices;
        if (allInitialized && indexChanged) {
          callback(indices);
        }
      };
    }
  })(createCallbackMemoizer);
  return createCallbackMemoizer;
}
var defaultOverscanIndicesGetter = {};
var hasRequiredDefaultOverscanIndicesGetter;
function requireDefaultOverscanIndicesGetter() {
  if (hasRequiredDefaultOverscanIndicesGetter)
    return defaultOverscanIndicesGetter;
  hasRequiredDefaultOverscanIndicesGetter = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.SCROLL_DIRECTION_VERTICAL = exports2.SCROLL_DIRECTION_HORIZONTAL = exports2.SCROLL_DIRECTION_FORWARD = exports2.SCROLL_DIRECTION_BACKWARD = void 0;
    exports2["default"] = defaultOverscanIndicesGetter2;
    exports2.SCROLL_DIRECTION_BACKWARD = -1;
    var SCROLL_DIRECTION_FORWARD = exports2.SCROLL_DIRECTION_FORWARD = 1;
    exports2.SCROLL_DIRECTION_HORIZONTAL = "horizontal";
    exports2.SCROLL_DIRECTION_VERTICAL = "vertical";
    function defaultOverscanIndicesGetter2(_ref) {
      var cellCount = _ref.cellCount, overscanCellsCount = _ref.overscanCellsCount, scrollDirection = _ref.scrollDirection, startIndex = _ref.startIndex, stopIndex = _ref.stopIndex;
      if (scrollDirection === SCROLL_DIRECTION_FORWARD) {
        return {
          overscanStartIndex: Math.max(0, startIndex),
          overscanStopIndex: Math.min(cellCount - 1, stopIndex + overscanCellsCount)
        };
      } else {
        return {
          overscanStartIndex: Math.max(0, startIndex - overscanCellsCount),
          overscanStopIndex: Math.min(cellCount - 1, stopIndex)
        };
      }
    }
  })(defaultOverscanIndicesGetter);
  return defaultOverscanIndicesGetter;
}
var updateScrollIndexHelper = {};
var hasRequiredUpdateScrollIndexHelper;
function requireUpdateScrollIndexHelper() {
  if (hasRequiredUpdateScrollIndexHelper)
    return updateScrollIndexHelper;
  hasRequiredUpdateScrollIndexHelper = 1;
  (function(exports2) {
    var _interopRequireDefault = interopRequireDefaultExports;
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = updateScrollIndexHelper2;
    _interopRequireDefault(requireScalingCellSizeAndPositionManager());
    function updateScrollIndexHelper2(_ref) {
      var cellSize = _ref.cellSize, cellSizeAndPositionManager = _ref.cellSizeAndPositionManager, previousCellsCount = _ref.previousCellsCount, previousCellSize = _ref.previousCellSize, previousScrollToAlignment = _ref.previousScrollToAlignment, previousScrollToIndex = _ref.previousScrollToIndex, previousSize = _ref.previousSize, scrollOffset = _ref.scrollOffset, scrollToAlignment = _ref.scrollToAlignment, scrollToIndex = _ref.scrollToIndex, size2 = _ref.size, sizeJustIncreasedFromZero = _ref.sizeJustIncreasedFromZero, updateScrollIndexCallback = _ref.updateScrollIndexCallback;
      var cellCount = cellSizeAndPositionManager.getCellCount();
      var hasScrollToIndex = scrollToIndex >= 0 && scrollToIndex < cellCount;
      var sizeHasChanged = size2 !== previousSize || sizeJustIncreasedFromZero || !previousCellSize || typeof cellSize === "number" && cellSize !== previousCellSize;
      if (hasScrollToIndex && (sizeHasChanged || scrollToAlignment !== previousScrollToAlignment || scrollToIndex !== previousScrollToIndex)) {
        updateScrollIndexCallback(scrollToIndex);
      } else if (!hasScrollToIndex && cellCount > 0 && (size2 < previousSize || cellCount < previousCellsCount)) {
        if (scrollOffset > cellSizeAndPositionManager.getTotalSize() - size2) {
          updateScrollIndexCallback(cellCount - 1);
        }
      }
    }
  })(updateScrollIndexHelper);
  return updateScrollIndexHelper;
}
var defaultCellRangeRenderer = {};
var hasRequiredDefaultCellRangeRenderer;
function requireDefaultCellRangeRenderer() {
  if (hasRequiredDefaultCellRangeRenderer)
    return defaultCellRangeRenderer;
  hasRequiredDefaultCellRangeRenderer = 1;
  (function(exports2) {
    var _interopRequireDefault = interopRequireDefaultExports;
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = defaultCellRangeRenderer2;
    var _react = _interopRequireDefault(React__default);
    function defaultCellRangeRenderer2(_ref) {
      var cellCache = _ref.cellCache, cellRenderer = _ref.cellRenderer, columnSizeAndPositionManager = _ref.columnSizeAndPositionManager, columnStartIndex = _ref.columnStartIndex, columnStopIndex = _ref.columnStopIndex, deferredMeasurementCache = _ref.deferredMeasurementCache, horizontalOffsetAdjustment = _ref.horizontalOffsetAdjustment, isScrolling = _ref.isScrolling, isScrollingOptOut = _ref.isScrollingOptOut, parent = _ref.parent, rowSizeAndPositionManager = _ref.rowSizeAndPositionManager, rowStartIndex = _ref.rowStartIndex, rowStopIndex = _ref.rowStopIndex, styleCache = _ref.styleCache, verticalOffsetAdjustment = _ref.verticalOffsetAdjustment, visibleColumnIndices = _ref.visibleColumnIndices, visibleRowIndices = _ref.visibleRowIndices;
      var renderedCells = [];
      var areOffsetsAdjusted = columnSizeAndPositionManager.areOffsetsAdjusted() || rowSizeAndPositionManager.areOffsetsAdjusted();
      var canCacheStyle = !isScrolling && !areOffsetsAdjusted;
      for (var rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
        var rowDatum = rowSizeAndPositionManager.getSizeAndPositionOfCell(rowIndex);
        for (var columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++) {
          var columnDatum = columnSizeAndPositionManager.getSizeAndPositionOfCell(columnIndex);
          var isVisible = columnIndex >= visibleColumnIndices.start && columnIndex <= visibleColumnIndices.stop && rowIndex >= visibleRowIndices.start && rowIndex <= visibleRowIndices.stop;
          var key = "".concat(rowIndex, "-").concat(columnIndex);
          var style = void 0;
          if (canCacheStyle && styleCache[key]) {
            style = styleCache[key];
          } else {
            if (deferredMeasurementCache && !deferredMeasurementCache.has(rowIndex, columnIndex)) {
              style = {
                height: "auto",
                left: 0,
                position: "absolute",
                top: 0,
                width: "auto"
              };
            } else {
              style = {
                height: rowDatum.size,
                left: columnDatum.offset + horizontalOffsetAdjustment,
                position: "absolute",
                top: rowDatum.offset + verticalOffsetAdjustment,
                width: columnDatum.size
              };
              styleCache[key] = style;
            }
          }
          var cellRendererParams = {
            columnIndex,
            isScrolling,
            isVisible,
            key,
            parent,
            rowIndex,
            style
          };
          var renderedCell = void 0;
          if ((isScrollingOptOut || isScrolling) && !horizontalOffsetAdjustment && !verticalOffsetAdjustment) {
            if (!cellCache[key]) {
              cellCache[key] = cellRenderer(cellRendererParams);
            }
            renderedCell = cellCache[key];
          } else {
            renderedCell = cellRenderer(cellRendererParams);
          }
          if (renderedCell == null || renderedCell === false) {
            continue;
          }
          {
            warnAboutMissingStyle(parent, renderedCell);
          }
          if (!renderedCell.props.role) {
            renderedCell = /* @__PURE__ */ _react["default"].cloneElement(renderedCell, {
              role: "gridcell"
            });
          }
          renderedCells.push(renderedCell);
        }
      }
      return renderedCells;
    }
    function warnAboutMissingStyle(parent, renderedCell) {
      {
        if (renderedCell) {
          if (renderedCell.type && renderedCell.type.__internalCellMeasurerFlag) {
            renderedCell = renderedCell.props.children;
          }
          if (renderedCell && renderedCell.props && renderedCell.props.style === void 0 && parent.__warnedAboutMissingStyle !== true) {
            parent.__warnedAboutMissingStyle = true;
            console.warn("Rendered cell should include style property for positioning.");
          }
        }
      }
    }
  })(defaultCellRangeRenderer);
  return defaultCellRangeRenderer;
}
const canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);
var size;
function scrollbarSize(recalc) {
  if (!size && size !== 0 || recalc) {
    if (canUseDOM) {
      var scrollDiv = document.createElement("div");
      scrollDiv.style.position = "absolute";
      scrollDiv.style.top = "-9999px";
      scrollDiv.style.width = "50px";
      scrollDiv.style.height = "50px";
      scrollDiv.style.overflow = "scroll";
      document.body.appendChild(scrollDiv);
      size = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
    }
  }
  return size;
}
const scrollbarSize$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: scrollbarSize
}, Symbol.toStringTag, { value: "Module" }));
const require$$17 = /* @__PURE__ */ getAugmentedNamespace(scrollbarSize$1);
function componentWillMount() {
  var state = this.constructor.getDerivedStateFromProps(this.props, this.state);
  if (state !== null && state !== void 0) {
    this.setState(state);
  }
}
function componentWillReceiveProps(nextProps) {
  function updater(prevState) {
    var state = this.constructor.getDerivedStateFromProps(nextProps, prevState);
    return state !== null && state !== void 0 ? state : null;
  }
  this.setState(updater.bind(this));
}
function componentWillUpdate(nextProps, nextState) {
  try {
    var prevProps = this.props;
    var prevState = this.state;
    this.props = nextProps;
    this.state = nextState;
    this.__reactInternalSnapshotFlag = true;
    this.__reactInternalSnapshot = this.getSnapshotBeforeUpdate(
      prevProps,
      prevState
    );
  } finally {
    this.props = prevProps;
    this.state = prevState;
  }
}
componentWillMount.__suppressDeprecationWarning = true;
componentWillReceiveProps.__suppressDeprecationWarning = true;
componentWillUpdate.__suppressDeprecationWarning = true;
function polyfill(Component) {
  var prototype = Component.prototype;
  if (!prototype || !prototype.isReactComponent) {
    throw new Error("Can only polyfill class components");
  }
  if (typeof Component.getDerivedStateFromProps !== "function" && typeof prototype.getSnapshotBeforeUpdate !== "function") {
    return Component;
  }
  var foundWillMountName = null;
  var foundWillReceivePropsName = null;
  var foundWillUpdateName = null;
  if (typeof prototype.componentWillMount === "function") {
    foundWillMountName = "componentWillMount";
  } else if (typeof prototype.UNSAFE_componentWillMount === "function") {
    foundWillMountName = "UNSAFE_componentWillMount";
  }
  if (typeof prototype.componentWillReceiveProps === "function") {
    foundWillReceivePropsName = "componentWillReceiveProps";
  } else if (typeof prototype.UNSAFE_componentWillReceiveProps === "function") {
    foundWillReceivePropsName = "UNSAFE_componentWillReceiveProps";
  }
  if (typeof prototype.componentWillUpdate === "function") {
    foundWillUpdateName = "componentWillUpdate";
  } else if (typeof prototype.UNSAFE_componentWillUpdate === "function") {
    foundWillUpdateName = "UNSAFE_componentWillUpdate";
  }
  if (foundWillMountName !== null || foundWillReceivePropsName !== null || foundWillUpdateName !== null) {
    var componentName = Component.displayName || Component.name;
    var newApiName = typeof Component.getDerivedStateFromProps === "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
    throw Error(
      "Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n" + componentName + " uses " + newApiName + " but also contains the following legacy lifecycles:" + (foundWillMountName !== null ? "\n  " + foundWillMountName : "") + (foundWillReceivePropsName !== null ? "\n  " + foundWillReceivePropsName : "") + (foundWillUpdateName !== null ? "\n  " + foundWillUpdateName : "") + "\n\nThe above lifecycles should be removed. Learn more about this warning here:\nhttps://fb.me/react-async-component-lifecycle-hooks"
    );
  }
  if (typeof Component.getDerivedStateFromProps === "function") {
    prototype.componentWillMount = componentWillMount;
    prototype.componentWillReceiveProps = componentWillReceiveProps;
  }
  if (typeof prototype.getSnapshotBeforeUpdate === "function") {
    if (typeof prototype.componentDidUpdate !== "function") {
      throw new Error(
        "Cannot polyfill getSnapshotBeforeUpdate() for components that do not define componentDidUpdate() on the prototype"
      );
    }
    prototype.componentWillUpdate = componentWillUpdate;
    var componentDidUpdate = prototype.componentDidUpdate;
    prototype.componentDidUpdate = function componentDidUpdatePolyfill(prevProps, prevState, maybeSnapshot) {
      var snapshot = this.__reactInternalSnapshotFlag ? this.__reactInternalSnapshot : maybeSnapshot;
      componentDidUpdate.call(this, prevProps, prevState, snapshot);
    };
  }
  return Component;
}
const reactLifecyclesCompat_es = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  polyfill
}, Symbol.toStringTag, { value: "Module" }));
const require$$18 = /* @__PURE__ */ getAugmentedNamespace(reactLifecyclesCompat_es);
var requestAnimationTimeout = {};
var animationFrame = {};
var hasRequiredAnimationFrame;
function requireAnimationFrame() {
  if (hasRequiredAnimationFrame)
    return animationFrame;
  hasRequiredAnimationFrame = 1;
  Object.defineProperty(animationFrame, "__esModule", {
    value: true
  });
  animationFrame.raf = animationFrame.caf = void 0;
  var win;
  if (typeof window !== "undefined") {
    win = window;
  } else if (typeof self !== "undefined") {
    win = self;
  } else {
    win = {};
  }
  var request = win.requestAnimationFrame || win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame || win.oRequestAnimationFrame || win.msRequestAnimationFrame || function(callback) {
    return win.setTimeout(callback, 1e3 / 60);
  };
  var cancel = win.cancelAnimationFrame || win.webkitCancelAnimationFrame || win.mozCancelAnimationFrame || win.oCancelAnimationFrame || win.msCancelAnimationFrame || function(id) {
    win.clearTimeout(id);
  };
  animationFrame.raf = request;
  animationFrame.caf = cancel;
  return animationFrame;
}
var hasRequiredRequestAnimationTimeout;
function requireRequestAnimationTimeout() {
  if (hasRequiredRequestAnimationTimeout)
    return requestAnimationTimeout;
  hasRequiredRequestAnimationTimeout = 1;
  Object.defineProperty(requestAnimationTimeout, "__esModule", {
    value: true
  });
  requestAnimationTimeout.requestAnimationTimeout = requestAnimationTimeout.cancelAnimationTimeout = void 0;
  var _animationFrame = requireAnimationFrame();
  requestAnimationTimeout.cancelAnimationTimeout = function cancelAnimationTimeout(frame) {
    return (0, _animationFrame.caf)(frame.id);
  };
  requestAnimationTimeout.requestAnimationTimeout = function requestAnimationTimeout2(callback, delay) {
    var start;
    Promise.resolve().then(function() {
      start = Date.now();
    });
    var _timeout = function timeout() {
      if (Date.now() - start >= delay) {
        callback.call();
      } else {
        frame.id = (0, _animationFrame.raf)(_timeout);
      }
    };
    var frame = {
      id: (0, _animationFrame.raf)(_timeout)
    };
    return frame;
  };
  return requestAnimationTimeout;
}
var hasRequiredGrid$1;
function requireGrid$1() {
  if (hasRequiredGrid$1)
    return Grid;
  hasRequiredGrid$1 = 1;
  (function(exports2) {
    var _interopRequireDefault = interopRequireDefaultExports;
    var _typeof3 = require_typeof();
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = exports2.DEFAULT_SCROLLING_RESET_TIME_INTERVAL = void 0;
    var _extends2 = _interopRequireDefault(require_extends());
    var _typeof2 = _interopRequireDefault(require_typeof());
    var _classCallCheck2 = _interopRequireDefault(requireClassCallCheck());
    var _createClass2 = _interopRequireDefault(requireCreateClass());
    var _possibleConstructorReturn2 = _interopRequireDefault(requirePossibleConstructorReturn());
    var _getPrototypeOf2 = _interopRequireDefault(requireGetPrototypeOf());
    var _inherits2 = _interopRequireDefault(requireInherits());
    var _defineProperty2 = _interopRequireDefault(requireDefineProperty());
    var React2 = _interopRequireWildcard(React__default);
    var _clsx = _interopRequireDefault(require$$9);
    var _calculateSizeAndPositionDataAndUpdateScrollOffset = _interopRequireDefault(requireCalculateSizeAndPositionDataAndUpdateScrollOffset());
    var _ScalingCellSizeAndPositionManager = _interopRequireDefault(requireScalingCellSizeAndPositionManager());
    var _createCallbackMemoizer = _interopRequireDefault(requireCreateCallbackMemoizer());
    var _defaultOverscanIndicesGetter = _interopRequireWildcard(requireDefaultOverscanIndicesGetter());
    var _updateScrollIndexHelper = _interopRequireDefault(requireUpdateScrollIndexHelper());
    var _defaultCellRangeRenderer = _interopRequireDefault(requireDefaultCellRangeRenderer());
    var _scrollbarSize = _interopRequireDefault(require$$17);
    var _reactLifecyclesCompat = require$$18;
    var _requestAnimationTimeout = requireRequestAnimationTimeout();
    function _getRequireWildcardCache(e) {
      if ("function" != typeof WeakMap)
        return null;
      var r2 = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
      return (_getRequireWildcardCache = function _getRequireWildcardCache2(e2) {
        return e2 ? t : r2;
      })(e);
    }
    function _interopRequireWildcard(e, r2) {
      if (!r2 && e && e.__esModule)
        return e;
      if (null === e || "object" != _typeof3(e) && "function" != typeof e)
        return { "default": e };
      var t = _getRequireWildcardCache(r2);
      if (t && t.has(e))
        return t.get(e);
      var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var u in e)
        if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
          var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
          i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
        }
      return n["default"] = e, t && t.set(e, n), n;
    }
    function ownKeys(e, r2) {
      var t = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r2 && (o = o.filter(function(r3) {
          return Object.getOwnPropertyDescriptor(e, r3).enumerable;
        })), t.push.apply(t, o);
      }
      return t;
    }
    function _objectSpread(e) {
      for (var r2 = 1; r2 < arguments.length; r2++) {
        var t = null != arguments[r2] ? arguments[r2] : {};
        r2 % 2 ? ownKeys(Object(t), true).forEach(function(r3) {
          (0, _defineProperty2["default"])(e, r3, t[r3]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r3) {
          Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
        });
      }
      return e;
    }
    function _callSuper(t, o, e) {
      return o = (0, _getPrototypeOf2["default"])(o), (0, _possibleConstructorReturn2["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2["default"])(t).constructor) : o.apply(t, e));
    }
    function _isNativeReflectConstruct() {
      try {
        var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
        }));
      } catch (t2) {
      }
      return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
        return !!t;
      })();
    }
    var DEFAULT_SCROLLING_RESET_TIME_INTERVAL = exports2.DEFAULT_SCROLLING_RESET_TIME_INTERVAL = 150;
    var SCROLL_POSITION_CHANGE_REASONS = {
      OBSERVED: "observed",
      REQUESTED: "requested"
    };
    var renderNull = function renderNull2() {
      return null;
    };
    var Grid2 = /* @__PURE__ */ function(_React$PureComponent) {
      function Grid3(props) {
        var _this;
        (0, _classCallCheck2["default"])(this, Grid3);
        _this = _callSuper(this, Grid3, [props]);
        (0, _defineProperty2["default"])(_this, "_onGridRenderedMemoizer", (0, _createCallbackMemoizer["default"])());
        (0, _defineProperty2["default"])(_this, "_onScrollMemoizer", (0, _createCallbackMemoizer["default"])(false));
        (0, _defineProperty2["default"])(_this, "_deferredInvalidateColumnIndex", null);
        (0, _defineProperty2["default"])(_this, "_deferredInvalidateRowIndex", null);
        (0, _defineProperty2["default"])(_this, "_recomputeScrollLeftFlag", false);
        (0, _defineProperty2["default"])(_this, "_recomputeScrollTopFlag", false);
        (0, _defineProperty2["default"])(_this, "_horizontalScrollBarSize", 0);
        (0, _defineProperty2["default"])(_this, "_verticalScrollBarSize", 0);
        (0, _defineProperty2["default"])(_this, "_scrollbarPresenceChanged", false);
        (0, _defineProperty2["default"])(_this, "_scrollingContainer", void 0);
        (0, _defineProperty2["default"])(_this, "_childrenToDisplay", void 0);
        (0, _defineProperty2["default"])(_this, "_columnStartIndex", void 0);
        (0, _defineProperty2["default"])(_this, "_columnStopIndex", void 0);
        (0, _defineProperty2["default"])(_this, "_rowStartIndex", void 0);
        (0, _defineProperty2["default"])(_this, "_rowStopIndex", void 0);
        (0, _defineProperty2["default"])(_this, "_renderedColumnStartIndex", 0);
        (0, _defineProperty2["default"])(_this, "_renderedColumnStopIndex", 0);
        (0, _defineProperty2["default"])(_this, "_renderedRowStartIndex", 0);
        (0, _defineProperty2["default"])(_this, "_renderedRowStopIndex", 0);
        (0, _defineProperty2["default"])(_this, "_initialScrollTop", void 0);
        (0, _defineProperty2["default"])(_this, "_initialScrollLeft", void 0);
        (0, _defineProperty2["default"])(_this, "_disablePointerEventsTimeoutId", void 0);
        (0, _defineProperty2["default"])(_this, "_styleCache", {});
        (0, _defineProperty2["default"])(_this, "_cellCache", {});
        (0, _defineProperty2["default"])(_this, "_debounceScrollEndedCallback", function() {
          _this._disablePointerEventsTimeoutId = null;
          _this.setState({
            isScrolling: false,
            needToResetStyleCache: false
          });
        });
        (0, _defineProperty2["default"])(_this, "_invokeOnGridRenderedHelper", function() {
          var onSectionRendered = _this.props.onSectionRendered;
          _this._onGridRenderedMemoizer({
            callback: onSectionRendered,
            indices: {
              columnOverscanStartIndex: _this._columnStartIndex,
              columnOverscanStopIndex: _this._columnStopIndex,
              columnStartIndex: _this._renderedColumnStartIndex,
              columnStopIndex: _this._renderedColumnStopIndex,
              rowOverscanStartIndex: _this._rowStartIndex,
              rowOverscanStopIndex: _this._rowStopIndex,
              rowStartIndex: _this._renderedRowStartIndex,
              rowStopIndex: _this._renderedRowStopIndex
            }
          });
        });
        (0, _defineProperty2["default"])(_this, "_setScrollingContainerRef", function(ref) {
          _this._scrollingContainer = ref;
          if (typeof _this.props.elementRef === "function") {
            _this.props.elementRef(ref);
          } else if ((0, _typeof2["default"])(_this.props.elementRef) === "object") {
            _this.props.elementRef.current = ref;
          }
        });
        (0, _defineProperty2["default"])(_this, "_onScroll", function(event) {
          if (event.target === _this._scrollingContainer) {
            _this.handleScrollEvent(event.target);
          }
        });
        var columnSizeAndPositionManager = new _ScalingCellSizeAndPositionManager["default"]({
          cellCount: props.columnCount,
          cellSizeGetter: function cellSizeGetter(params) {
            return Grid3._wrapSizeGetter(props.columnWidth)(params);
          },
          estimatedCellSize: Grid3._getEstimatedColumnSize(props)
        });
        var rowSizeAndPositionManager = new _ScalingCellSizeAndPositionManager["default"]({
          cellCount: props.rowCount,
          cellSizeGetter: function cellSizeGetter(params) {
            return Grid3._wrapSizeGetter(props.rowHeight)(params);
          },
          estimatedCellSize: Grid3._getEstimatedRowSize(props)
        });
        _this.state = {
          instanceProps: {
            columnSizeAndPositionManager,
            rowSizeAndPositionManager,
            prevColumnWidth: props.columnWidth,
            prevRowHeight: props.rowHeight,
            prevColumnCount: props.columnCount,
            prevRowCount: props.rowCount,
            prevIsScrolling: props.isScrolling === true,
            prevScrollToColumn: props.scrollToColumn,
            prevScrollToRow: props.scrollToRow,
            scrollbarSize: 0,
            scrollbarSizeMeasured: false
          },
          isScrolling: false,
          scrollDirectionHorizontal: _defaultOverscanIndicesGetter.SCROLL_DIRECTION_FORWARD,
          scrollDirectionVertical: _defaultOverscanIndicesGetter.SCROLL_DIRECTION_FORWARD,
          scrollLeft: 0,
          scrollTop: 0,
          scrollPositionChangeReason: null,
          needToResetStyleCache: false
        };
        if (props.scrollToRow > 0) {
          _this._initialScrollTop = _this._getCalculatedScrollTop(props, _this.state);
        }
        if (props.scrollToColumn > 0) {
          _this._initialScrollLeft = _this._getCalculatedScrollLeft(props, _this.state);
        }
        return _this;
      }
      (0, _inherits2["default"])(Grid3, _React$PureComponent);
      return (0, _createClass2["default"])(Grid3, [{
        key: "getOffsetForCell",
        value: function getOffsetForCell() {
          var _ref = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ref$alignment = _ref.alignment, alignment = _ref$alignment === void 0 ? this.props.scrollToAlignment : _ref$alignment, _ref$columnIndex = _ref.columnIndex, columnIndex = _ref$columnIndex === void 0 ? this.props.scrollToColumn : _ref$columnIndex, _ref$rowIndex = _ref.rowIndex, rowIndex = _ref$rowIndex === void 0 ? this.props.scrollToRow : _ref$rowIndex;
          var offsetProps = _objectSpread(_objectSpread({}, this.props), {}, {
            scrollToAlignment: alignment,
            scrollToColumn: columnIndex,
            scrollToRow: rowIndex
          });
          return {
            scrollLeft: this._getCalculatedScrollLeft(offsetProps),
            scrollTop: this._getCalculatedScrollTop(offsetProps)
          };
        }
        /**
         * Gets estimated total rows' height.
         */
      }, {
        key: "getTotalRowsHeight",
        value: function getTotalRowsHeight() {
          return this.state.instanceProps.rowSizeAndPositionManager.getTotalSize();
        }
        /**
         * Gets estimated total columns' width.
         */
      }, {
        key: "getTotalColumnsWidth",
        value: function getTotalColumnsWidth() {
          return this.state.instanceProps.columnSizeAndPositionManager.getTotalSize();
        }
        /**
         * This method handles a scroll event originating from an external scroll control.
         * It's an advanced method and should probably not be used unless you're implementing a custom scroll-bar solution.
         */
      }, {
        key: "handleScrollEvent",
        value: function handleScrollEvent(_ref2) {
          var _ref2$scrollLeft = _ref2.scrollLeft, scrollLeftParam = _ref2$scrollLeft === void 0 ? 0 : _ref2$scrollLeft, _ref2$scrollTop = _ref2.scrollTop, scrollTopParam = _ref2$scrollTop === void 0 ? 0 : _ref2$scrollTop;
          if (scrollTopParam < 0) {
            return;
          }
          this._debounceScrollEnded();
          var _this$props = this.props, autoHeight = _this$props.autoHeight, autoWidth = _this$props.autoWidth, height = _this$props.height, width = _this$props.width;
          var instanceProps = this.state.instanceProps;
          var scrollbarSize2 = instanceProps.scrollbarSize;
          var totalRowsHeight = instanceProps.rowSizeAndPositionManager.getTotalSize();
          var totalColumnsWidth = instanceProps.columnSizeAndPositionManager.getTotalSize();
          var scrollLeft = Math.min(Math.max(0, totalColumnsWidth - width + scrollbarSize2), scrollLeftParam);
          var scrollTop = Math.min(Math.max(0, totalRowsHeight - height + scrollbarSize2), scrollTopParam);
          if (this.state.scrollLeft !== scrollLeft || this.state.scrollTop !== scrollTop) {
            var scrollDirectionHorizontal = scrollLeft !== this.state.scrollLeft ? scrollLeft > this.state.scrollLeft ? _defaultOverscanIndicesGetter.SCROLL_DIRECTION_FORWARD : _defaultOverscanIndicesGetter.SCROLL_DIRECTION_BACKWARD : this.state.scrollDirectionHorizontal;
            var scrollDirectionVertical = scrollTop !== this.state.scrollTop ? scrollTop > this.state.scrollTop ? _defaultOverscanIndicesGetter.SCROLL_DIRECTION_FORWARD : _defaultOverscanIndicesGetter.SCROLL_DIRECTION_BACKWARD : this.state.scrollDirectionVertical;
            var newState = {
              isScrolling: true,
              scrollDirectionHorizontal,
              scrollDirectionVertical,
              scrollPositionChangeReason: SCROLL_POSITION_CHANGE_REASONS.OBSERVED
            };
            if (!autoHeight) {
              newState.scrollTop = scrollTop;
            }
            if (!autoWidth) {
              newState.scrollLeft = scrollLeft;
            }
            newState.needToResetStyleCache = false;
            this.setState(newState);
          }
          this._invokeOnScrollMemoizer({
            scrollLeft,
            scrollTop,
            totalColumnsWidth,
            totalRowsHeight
          });
        }
        /**
         * Invalidate Grid size and recompute visible cells.
         * This is a deferred wrapper for recomputeGridSize().
         * It sets a flag to be evaluated on cDM/cDU to avoid unnecessary renders.
         * This method is intended for advanced use-cases like CellMeasurer.
         */
        // @TODO (bvaughn) Add automated test coverage for this.
      }, {
        key: "invalidateCellSizeAfterRender",
        value: function invalidateCellSizeAfterRender(_ref3) {
          var columnIndex = _ref3.columnIndex, rowIndex = _ref3.rowIndex;
          this._deferredInvalidateColumnIndex = typeof this._deferredInvalidateColumnIndex === "number" ? Math.min(this._deferredInvalidateColumnIndex, columnIndex) : columnIndex;
          this._deferredInvalidateRowIndex = typeof this._deferredInvalidateRowIndex === "number" ? Math.min(this._deferredInvalidateRowIndex, rowIndex) : rowIndex;
        }
        /**
         * Pre-measure all columns and rows in a Grid.
         * Typically cells are only measured as needed and estimated sizes are used for cells that have not yet been measured.
         * This method ensures that the next call to getTotalSize() returns an exact size (as opposed to just an estimated one).
         */
      }, {
        key: "measureAllCells",
        value: function measureAllCells() {
          var _this$props2 = this.props, columnCount = _this$props2.columnCount, rowCount = _this$props2.rowCount;
          var instanceProps = this.state.instanceProps;
          instanceProps.columnSizeAndPositionManager.getSizeAndPositionOfCell(columnCount - 1);
          instanceProps.rowSizeAndPositionManager.getSizeAndPositionOfCell(rowCount - 1);
        }
        /**
         * Forced recompute of row heights and column widths.
         * This function should be called if dynamic column or row sizes have changed but nothing else has.
         * Since Grid only receives :columnCount and :rowCount it has no way of detecting when the underlying data changes.
         */
      }, {
        key: "recomputeGridSize",
        value: function recomputeGridSize() {
          var _ref4 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ref4$columnIndex = _ref4.columnIndex, columnIndex = _ref4$columnIndex === void 0 ? 0 : _ref4$columnIndex, _ref4$rowIndex = _ref4.rowIndex, rowIndex = _ref4$rowIndex === void 0 ? 0 : _ref4$rowIndex;
          var _this$props3 = this.props, scrollToColumn = _this$props3.scrollToColumn, scrollToRow = _this$props3.scrollToRow;
          var instanceProps = this.state.instanceProps;
          instanceProps.columnSizeAndPositionManager.resetCell(columnIndex);
          instanceProps.rowSizeAndPositionManager.resetCell(rowIndex);
          this._recomputeScrollLeftFlag = scrollToColumn >= 0 && (this.state.scrollDirectionHorizontal === _defaultOverscanIndicesGetter.SCROLL_DIRECTION_FORWARD ? columnIndex <= scrollToColumn : columnIndex >= scrollToColumn);
          this._recomputeScrollTopFlag = scrollToRow >= 0 && (this.state.scrollDirectionVertical === _defaultOverscanIndicesGetter.SCROLL_DIRECTION_FORWARD ? rowIndex <= scrollToRow : rowIndex >= scrollToRow);
          this._styleCache = {};
          this._cellCache = {};
          this.forceUpdate();
        }
        /**
         * Ensure column and row are visible.
         */
      }, {
        key: "scrollToCell",
        value: function scrollToCell(_ref5) {
          var columnIndex = _ref5.columnIndex, rowIndex = _ref5.rowIndex;
          var columnCount = this.props.columnCount;
          var props = this.props;
          if (columnCount > 1 && columnIndex !== void 0) {
            this._updateScrollLeftForScrollToColumn(_objectSpread(_objectSpread({}, props), {}, {
              scrollToColumn: columnIndex
            }));
          }
          if (rowIndex !== void 0) {
            this._updateScrollTopForScrollToRow(_objectSpread(_objectSpread({}, props), {}, {
              scrollToRow: rowIndex
            }));
          }
        }
      }, {
        key: "componentDidMount",
        value: function componentDidMount() {
          var _this$props4 = this.props, getScrollbarSize = _this$props4.getScrollbarSize, height = _this$props4.height, scrollLeft = _this$props4.scrollLeft, scrollToColumn = _this$props4.scrollToColumn, scrollTop = _this$props4.scrollTop, scrollToRow = _this$props4.scrollToRow, width = _this$props4.width;
          var instanceProps = this.state.instanceProps;
          this._initialScrollTop = 0;
          this._initialScrollLeft = 0;
          this._handleInvalidatedGridSize();
          if (!instanceProps.scrollbarSizeMeasured) {
            this.setState(function(prevState) {
              var stateUpdate2 = _objectSpread(_objectSpread({}, prevState), {}, {
                needToResetStyleCache: false
              });
              stateUpdate2.instanceProps.scrollbarSize = getScrollbarSize();
              stateUpdate2.instanceProps.scrollbarSizeMeasured = true;
              return stateUpdate2;
            });
          }
          if (typeof scrollLeft === "number" && scrollLeft >= 0 || typeof scrollTop === "number" && scrollTop >= 0) {
            var stateUpdate = Grid3._getScrollToPositionStateUpdate({
              prevState: this.state,
              scrollLeft,
              scrollTop
            });
            if (stateUpdate) {
              stateUpdate.needToResetStyleCache = false;
              this.setState(stateUpdate);
            }
          }
          if (this._scrollingContainer) {
            if (this._scrollingContainer.scrollLeft !== this.state.scrollLeft) {
              this._scrollingContainer.scrollLeft = this.state.scrollLeft;
            }
            if (this._scrollingContainer.scrollTop !== this.state.scrollTop) {
              this._scrollingContainer.scrollTop = this.state.scrollTop;
            }
          }
          var sizeIsBiggerThanZero = height > 0 && width > 0;
          if (scrollToColumn >= 0 && sizeIsBiggerThanZero) {
            this._updateScrollLeftForScrollToColumn();
          }
          if (scrollToRow >= 0 && sizeIsBiggerThanZero) {
            this._updateScrollTopForScrollToRow();
          }
          this._invokeOnGridRenderedHelper();
          this._invokeOnScrollMemoizer({
            scrollLeft: scrollLeft || 0,
            scrollTop: scrollTop || 0,
            totalColumnsWidth: instanceProps.columnSizeAndPositionManager.getTotalSize(),
            totalRowsHeight: instanceProps.rowSizeAndPositionManager.getTotalSize()
          });
          this._maybeCallOnScrollbarPresenceChange();
        }
        /**
         * @private
         * This method updates scrollLeft/scrollTop in state for the following conditions:
         * 1) New scroll-to-cell props have been set
         */
      }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps, prevState) {
          var _this2 = this;
          var _this$props5 = this.props, autoHeight = _this$props5.autoHeight, autoWidth = _this$props5.autoWidth, columnCount = _this$props5.columnCount, height = _this$props5.height, rowCount = _this$props5.rowCount, scrollToAlignment = _this$props5.scrollToAlignment, scrollToColumn = _this$props5.scrollToColumn, scrollToRow = _this$props5.scrollToRow, width = _this$props5.width;
          var _this$state = this.state, scrollLeft = _this$state.scrollLeft, scrollPositionChangeReason = _this$state.scrollPositionChangeReason, scrollTop = _this$state.scrollTop, instanceProps = _this$state.instanceProps;
          this._handleInvalidatedGridSize();
          var columnOrRowCountJustIncreasedFromZero = columnCount > 0 && prevProps.columnCount === 0 || rowCount > 0 && prevProps.rowCount === 0;
          if (scrollPositionChangeReason === SCROLL_POSITION_CHANGE_REASONS.REQUESTED) {
            if (!autoWidth && scrollLeft >= 0 && (scrollLeft !== this._scrollingContainer.scrollLeft || columnOrRowCountJustIncreasedFromZero)) {
              this._scrollingContainer.scrollLeft = scrollLeft;
            }
            if (!autoHeight && scrollTop >= 0 && (scrollTop !== this._scrollingContainer.scrollTop || columnOrRowCountJustIncreasedFromZero)) {
              this._scrollingContainer.scrollTop = scrollTop;
            }
          }
          var sizeJustIncreasedFromZero = (prevProps.width === 0 || prevProps.height === 0) && height > 0 && width > 0;
          if (this._recomputeScrollLeftFlag) {
            this._recomputeScrollLeftFlag = false;
            this._updateScrollLeftForScrollToColumn(this.props);
          } else {
            (0, _updateScrollIndexHelper["default"])({
              cellSizeAndPositionManager: instanceProps.columnSizeAndPositionManager,
              previousCellsCount: prevProps.columnCount,
              previousCellSize: prevProps.columnWidth,
              previousScrollToAlignment: prevProps.scrollToAlignment,
              previousScrollToIndex: prevProps.scrollToColumn,
              previousSize: prevProps.width,
              scrollOffset: scrollLeft,
              scrollToAlignment,
              scrollToIndex: scrollToColumn,
              size: width,
              sizeJustIncreasedFromZero,
              updateScrollIndexCallback: function updateScrollIndexCallback() {
                return _this2._updateScrollLeftForScrollToColumn(_this2.props);
              }
            });
          }
          if (this._recomputeScrollTopFlag) {
            this._recomputeScrollTopFlag = false;
            this._updateScrollTopForScrollToRow(this.props);
          } else {
            (0, _updateScrollIndexHelper["default"])({
              cellSizeAndPositionManager: instanceProps.rowSizeAndPositionManager,
              previousCellsCount: prevProps.rowCount,
              previousCellSize: prevProps.rowHeight,
              previousScrollToAlignment: prevProps.scrollToAlignment,
              previousScrollToIndex: prevProps.scrollToRow,
              previousSize: prevProps.height,
              scrollOffset: scrollTop,
              scrollToAlignment,
              scrollToIndex: scrollToRow,
              size: height,
              sizeJustIncreasedFromZero,
              updateScrollIndexCallback: function updateScrollIndexCallback() {
                return _this2._updateScrollTopForScrollToRow(_this2.props);
              }
            });
          }
          this._invokeOnGridRenderedHelper();
          if (scrollLeft !== prevState.scrollLeft || scrollTop !== prevState.scrollTop) {
            var totalRowsHeight = instanceProps.rowSizeAndPositionManager.getTotalSize();
            var totalColumnsWidth = instanceProps.columnSizeAndPositionManager.getTotalSize();
            this._invokeOnScrollMemoizer({
              scrollLeft,
              scrollTop,
              totalColumnsWidth,
              totalRowsHeight
            });
          }
          this._maybeCallOnScrollbarPresenceChange();
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          if (this._disablePointerEventsTimeoutId) {
            (0, _requestAnimationTimeout.cancelAnimationTimeout)(this._disablePointerEventsTimeoutId);
          }
        }
        /**
         * This method updates scrollLeft/scrollTop in state for the following conditions:
         * 1) Empty content (0 rows or columns)
         * 2) New scroll props overriding the current state
         * 3) Cells-count or cells-size has changed, making previous scroll offsets invalid
         */
      }, {
        key: "render",
        value: function render() {
          var _this$props6 = this.props, autoContainerWidth = _this$props6.autoContainerWidth, autoHeight = _this$props6.autoHeight, autoWidth = _this$props6.autoWidth, className = _this$props6.className, containerProps = _this$props6.containerProps, containerRole = _this$props6.containerRole, containerStyle = _this$props6.containerStyle, height = _this$props6.height, id = _this$props6.id, noContentRenderer = _this$props6.noContentRenderer, role = _this$props6.role, style = _this$props6.style, tabIndex = _this$props6.tabIndex, width = _this$props6.width;
          var _this$state2 = this.state, instanceProps = _this$state2.instanceProps, needToResetStyleCache = _this$state2.needToResetStyleCache;
          var isScrolling = this._isScrolling();
          var gridStyle = {
            boxSizing: "border-box",
            direction: "ltr",
            height: autoHeight ? "auto" : height,
            position: "relative",
            width: autoWidth ? "auto" : width,
            WebkitOverflowScrolling: "touch",
            willChange: "transform"
          };
          if (needToResetStyleCache) {
            this._styleCache = {};
          }
          if (!this.state.isScrolling) {
            this._resetStyleCache();
          }
          this._calculateChildrenToRender(this.props, this.state);
          var totalColumnsWidth = instanceProps.columnSizeAndPositionManager.getTotalSize();
          var totalRowsHeight = instanceProps.rowSizeAndPositionManager.getTotalSize();
          var verticalScrollBarSize = totalRowsHeight > height ? instanceProps.scrollbarSize : 0;
          var horizontalScrollBarSize = totalColumnsWidth > width ? instanceProps.scrollbarSize : 0;
          if (horizontalScrollBarSize !== this._horizontalScrollBarSize || verticalScrollBarSize !== this._verticalScrollBarSize) {
            this._horizontalScrollBarSize = horizontalScrollBarSize;
            this._verticalScrollBarSize = verticalScrollBarSize;
            this._scrollbarPresenceChanged = true;
          }
          gridStyle.overflowX = totalColumnsWidth + verticalScrollBarSize <= width ? "hidden" : "auto";
          gridStyle.overflowY = totalRowsHeight + horizontalScrollBarSize <= height ? "hidden" : "auto";
          var childrenToDisplay = this._childrenToDisplay;
          var showNoContentRenderer = childrenToDisplay.length === 0 && height > 0 && width > 0;
          return /* @__PURE__ */ React2.createElement("div", (0, _extends2["default"])({
            ref: this._setScrollingContainerRef
          }, containerProps, {
            "aria-label": this.props["aria-label"],
            "aria-readonly": this.props["aria-readonly"],
            className: (0, _clsx["default"])("ReactVirtualized__Grid", className),
            id,
            onScroll: this._onScroll,
            role,
            style: _objectSpread(_objectSpread({}, gridStyle), style),
            tabIndex
          }), childrenToDisplay.length > 0 && /* @__PURE__ */ React2.createElement("div", {
            className: "ReactVirtualized__Grid__innerScrollContainer",
            role: containerRole,
            style: _objectSpread({
              width: autoContainerWidth ? "auto" : totalColumnsWidth,
              height: totalRowsHeight,
              maxWidth: totalColumnsWidth,
              maxHeight: totalRowsHeight,
              overflow: "hidden",
              pointerEvents: isScrolling ? "none" : "",
              position: "relative"
            }, containerStyle)
          }, childrenToDisplay), showNoContentRenderer && noContentRenderer());
        }
        /* ---------------------------- Helper methods ---------------------------- */
      }, {
        key: "_calculateChildrenToRender",
        value: function _calculateChildrenToRender() {
          var props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.props;
          var state = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.state;
          var cellRenderer = props.cellRenderer, cellRangeRenderer = props.cellRangeRenderer, columnCount = props.columnCount, deferredMeasurementCache = props.deferredMeasurementCache, height = props.height, overscanColumnCount = props.overscanColumnCount, overscanIndicesGetter = props.overscanIndicesGetter, overscanRowCount = props.overscanRowCount, rowCount = props.rowCount, width = props.width, isScrollingOptOut = props.isScrollingOptOut;
          var scrollDirectionHorizontal = state.scrollDirectionHorizontal, scrollDirectionVertical = state.scrollDirectionVertical, instanceProps = state.instanceProps;
          var scrollTop = this._initialScrollTop > 0 ? this._initialScrollTop : state.scrollTop;
          var scrollLeft = this._initialScrollLeft > 0 ? this._initialScrollLeft : state.scrollLeft;
          var isScrolling = this._isScrolling(props, state);
          this._childrenToDisplay = [];
          if (height > 0 && width > 0) {
            var visibleColumnIndices = instanceProps.columnSizeAndPositionManager.getVisibleCellRange({
              containerSize: width,
              offset: scrollLeft
            });
            var visibleRowIndices = instanceProps.rowSizeAndPositionManager.getVisibleCellRange({
              containerSize: height,
              offset: scrollTop
            });
            var horizontalOffsetAdjustment = instanceProps.columnSizeAndPositionManager.getOffsetAdjustment({
              containerSize: width,
              offset: scrollLeft
            });
            var verticalOffsetAdjustment = instanceProps.rowSizeAndPositionManager.getOffsetAdjustment({
              containerSize: height,
              offset: scrollTop
            });
            this._renderedColumnStartIndex = visibleColumnIndices.start;
            this._renderedColumnStopIndex = visibleColumnIndices.stop;
            this._renderedRowStartIndex = visibleRowIndices.start;
            this._renderedRowStopIndex = visibleRowIndices.stop;
            var overscanColumnIndices = overscanIndicesGetter({
              direction: "horizontal",
              cellCount: columnCount,
              overscanCellsCount: overscanColumnCount,
              scrollDirection: scrollDirectionHorizontal,
              startIndex: typeof visibleColumnIndices.start === "number" ? visibleColumnIndices.start : 0,
              stopIndex: typeof visibleColumnIndices.stop === "number" ? visibleColumnIndices.stop : -1
            });
            var overscanRowIndices = overscanIndicesGetter({
              direction: "vertical",
              cellCount: rowCount,
              overscanCellsCount: overscanRowCount,
              scrollDirection: scrollDirectionVertical,
              startIndex: typeof visibleRowIndices.start === "number" ? visibleRowIndices.start : 0,
              stopIndex: typeof visibleRowIndices.stop === "number" ? visibleRowIndices.stop : -1
            });
            var columnStartIndex = overscanColumnIndices.overscanStartIndex;
            var columnStopIndex = overscanColumnIndices.overscanStopIndex;
            var rowStartIndex = overscanRowIndices.overscanStartIndex;
            var rowStopIndex = overscanRowIndices.overscanStopIndex;
            if (deferredMeasurementCache) {
              if (!deferredMeasurementCache.hasFixedHeight()) {
                for (var rowIndex = rowStartIndex; rowIndex <= rowStopIndex; rowIndex++) {
                  if (!deferredMeasurementCache.has(rowIndex, 0)) {
                    columnStartIndex = 0;
                    columnStopIndex = columnCount - 1;
                    break;
                  }
                }
              }
              if (!deferredMeasurementCache.hasFixedWidth()) {
                for (var columnIndex = columnStartIndex; columnIndex <= columnStopIndex; columnIndex++) {
                  if (!deferredMeasurementCache.has(0, columnIndex)) {
                    rowStartIndex = 0;
                    rowStopIndex = rowCount - 1;
                    break;
                  }
                }
              }
            }
            this._childrenToDisplay = cellRangeRenderer({
              cellCache: this._cellCache,
              cellRenderer,
              columnSizeAndPositionManager: instanceProps.columnSizeAndPositionManager,
              columnStartIndex,
              columnStopIndex,
              deferredMeasurementCache,
              horizontalOffsetAdjustment,
              isScrolling,
              isScrollingOptOut,
              parent: this,
              rowSizeAndPositionManager: instanceProps.rowSizeAndPositionManager,
              rowStartIndex,
              rowStopIndex,
              scrollLeft,
              scrollTop,
              styleCache: this._styleCache,
              verticalOffsetAdjustment,
              visibleColumnIndices,
              visibleRowIndices
            });
            this._columnStartIndex = columnStartIndex;
            this._columnStopIndex = columnStopIndex;
            this._rowStartIndex = rowStartIndex;
            this._rowStopIndex = rowStopIndex;
          }
        }
        /**
         * Sets an :isScrolling flag for a small window of time.
         * This flag is used to disable pointer events on the scrollable portion of the Grid.
         * This prevents jerky/stuttery mouse-wheel scrolling.
         */
      }, {
        key: "_debounceScrollEnded",
        value: function _debounceScrollEnded() {
          var scrollingResetTimeInterval = this.props.scrollingResetTimeInterval;
          if (this._disablePointerEventsTimeoutId) {
            (0, _requestAnimationTimeout.cancelAnimationTimeout)(this._disablePointerEventsTimeoutId);
          }
          this._disablePointerEventsTimeoutId = (0, _requestAnimationTimeout.requestAnimationTimeout)(this._debounceScrollEndedCallback, scrollingResetTimeInterval);
        }
      }, {
        key: "_handleInvalidatedGridSize",
        value: (
          /**
           * Check for batched CellMeasurer size invalidations.
           * This will occur the first time one or more previously unmeasured cells are rendered.
           */
          function _handleInvalidatedGridSize() {
            if (typeof this._deferredInvalidateColumnIndex === "number" && typeof this._deferredInvalidateRowIndex === "number") {
              var columnIndex = this._deferredInvalidateColumnIndex;
              var rowIndex = this._deferredInvalidateRowIndex;
              this._deferredInvalidateColumnIndex = null;
              this._deferredInvalidateRowIndex = null;
              this.recomputeGridSize({
                columnIndex,
                rowIndex
              });
            }
          }
        )
      }, {
        key: "_invokeOnScrollMemoizer",
        value: function _invokeOnScrollMemoizer(_ref6) {
          var _this3 = this;
          var scrollLeft = _ref6.scrollLeft, scrollTop = _ref6.scrollTop, totalColumnsWidth = _ref6.totalColumnsWidth, totalRowsHeight = _ref6.totalRowsHeight;
          this._onScrollMemoizer({
            callback: function callback(_ref7) {
              var scrollLeft2 = _ref7.scrollLeft, scrollTop2 = _ref7.scrollTop;
              var _this3$props = _this3.props, height = _this3$props.height, onScroll = _this3$props.onScroll, width = _this3$props.width;
              onScroll({
                clientHeight: height,
                clientWidth: width,
                scrollHeight: totalRowsHeight,
                scrollLeft: scrollLeft2,
                scrollTop: scrollTop2,
                scrollWidth: totalColumnsWidth
              });
            },
            indices: {
              scrollLeft,
              scrollTop
            }
          });
        }
      }, {
        key: "_isScrolling",
        value: function _isScrolling() {
          var props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.props;
          var state = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.state;
          return Object.hasOwnProperty.call(props, "isScrolling") ? Boolean(props.isScrolling) : Boolean(state.isScrolling);
        }
      }, {
        key: "_maybeCallOnScrollbarPresenceChange",
        value: function _maybeCallOnScrollbarPresenceChange() {
          if (this._scrollbarPresenceChanged) {
            var onScrollbarPresenceChange = this.props.onScrollbarPresenceChange;
            this._scrollbarPresenceChanged = false;
            onScrollbarPresenceChange({
              horizontal: this._horizontalScrollBarSize > 0,
              size: this.state.instanceProps.scrollbarSize,
              vertical: this._verticalScrollBarSize > 0
            });
          }
        }
      }, {
        key: "scrollToPosition",
        value: (
          /**
           * Scroll to the specified offset(s).
           * Useful for animating position changes.
           */
          function scrollToPosition(_ref8) {
            var scrollLeft = _ref8.scrollLeft, scrollTop = _ref8.scrollTop;
            var stateUpdate = Grid3._getScrollToPositionStateUpdate({
              prevState: this.state,
              scrollLeft,
              scrollTop
            });
            if (stateUpdate) {
              stateUpdate.needToResetStyleCache = false;
              this.setState(stateUpdate);
            }
          }
        )
      }, {
        key: "_getCalculatedScrollLeft",
        value: function _getCalculatedScrollLeft() {
          var props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.props;
          var state = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.state;
          return Grid3._getCalculatedScrollLeft(props, state);
        }
      }, {
        key: "_updateScrollLeftForScrollToColumn",
        value: function _updateScrollLeftForScrollToColumn() {
          var props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.props;
          var state = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.state;
          var stateUpdate = Grid3._getScrollLeftForScrollToColumnStateUpdate(props, state);
          if (stateUpdate) {
            stateUpdate.needToResetStyleCache = false;
            this.setState(stateUpdate);
          }
        }
      }, {
        key: "_getCalculatedScrollTop",
        value: function _getCalculatedScrollTop() {
          var props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.props;
          var state = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.state;
          return Grid3._getCalculatedScrollTop(props, state);
        }
      }, {
        key: "_resetStyleCache",
        value: function _resetStyleCache() {
          var styleCache = this._styleCache;
          var cellCache = this._cellCache;
          var isScrollingOptOut = this.props.isScrollingOptOut;
          this._cellCache = {};
          this._styleCache = {};
          for (var rowIndex = this._rowStartIndex; rowIndex <= this._rowStopIndex; rowIndex++) {
            for (var columnIndex = this._columnStartIndex; columnIndex <= this._columnStopIndex; columnIndex++) {
              var key = "".concat(rowIndex, "-").concat(columnIndex);
              this._styleCache[key] = styleCache[key];
              if (isScrollingOptOut) {
                this._cellCache[key] = cellCache[key];
              }
            }
          }
        }
      }, {
        key: "_updateScrollTopForScrollToRow",
        value: function _updateScrollTopForScrollToRow() {
          var props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.props;
          var state = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.state;
          var stateUpdate = Grid3._getScrollTopForScrollToRowStateUpdate(props, state);
          if (stateUpdate) {
            stateUpdate.needToResetStyleCache = false;
            this.setState(stateUpdate);
          }
        }
      }], [{
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(nextProps, prevState) {
          var newState = {};
          if (nextProps.columnCount === 0 && prevState.scrollLeft !== 0 || nextProps.rowCount === 0 && prevState.scrollTop !== 0) {
            newState.scrollLeft = 0;
            newState.scrollTop = 0;
          } else if (nextProps.scrollLeft !== prevState.scrollLeft && nextProps.scrollToColumn < 0 || nextProps.scrollTop !== prevState.scrollTop && nextProps.scrollToRow < 0) {
            Object.assign(newState, Grid3._getScrollToPositionStateUpdate({
              prevState,
              scrollLeft: nextProps.scrollLeft,
              scrollTop: nextProps.scrollTop
            }));
          }
          var instanceProps = prevState.instanceProps;
          newState.needToResetStyleCache = false;
          if (nextProps.columnWidth !== instanceProps.prevColumnWidth || nextProps.rowHeight !== instanceProps.prevRowHeight) {
            newState.needToResetStyleCache = true;
          }
          instanceProps.columnSizeAndPositionManager.configure({
            cellCount: nextProps.columnCount,
            estimatedCellSize: Grid3._getEstimatedColumnSize(nextProps),
            cellSizeGetter: Grid3._wrapSizeGetter(nextProps.columnWidth)
          });
          instanceProps.rowSizeAndPositionManager.configure({
            cellCount: nextProps.rowCount,
            estimatedCellSize: Grid3._getEstimatedRowSize(nextProps),
            cellSizeGetter: Grid3._wrapSizeGetter(nextProps.rowHeight)
          });
          if (instanceProps.prevColumnCount === 0 || instanceProps.prevRowCount === 0) {
            instanceProps.prevColumnCount = 0;
            instanceProps.prevRowCount = 0;
          }
          if (nextProps.autoHeight && nextProps.isScrolling === false && instanceProps.prevIsScrolling === true) {
            Object.assign(newState, {
              isScrolling: false
            });
          }
          var maybeStateA;
          var maybeStateB;
          (0, _calculateSizeAndPositionDataAndUpdateScrollOffset["default"])({
            cellCount: instanceProps.prevColumnCount,
            cellSize: typeof instanceProps.prevColumnWidth === "number" ? instanceProps.prevColumnWidth : null,
            computeMetadataCallback: function computeMetadataCallback() {
              return instanceProps.columnSizeAndPositionManager.resetCell(0);
            },
            computeMetadataCallbackProps: nextProps,
            nextCellsCount: nextProps.columnCount,
            nextCellSize: typeof nextProps.columnWidth === "number" ? nextProps.columnWidth : null,
            nextScrollToIndex: nextProps.scrollToColumn,
            scrollToIndex: instanceProps.prevScrollToColumn,
            updateScrollOffsetForScrollToIndex: function updateScrollOffsetForScrollToIndex() {
              maybeStateA = Grid3._getScrollLeftForScrollToColumnStateUpdate(nextProps, prevState);
            }
          });
          (0, _calculateSizeAndPositionDataAndUpdateScrollOffset["default"])({
            cellCount: instanceProps.prevRowCount,
            cellSize: typeof instanceProps.prevRowHeight === "number" ? instanceProps.prevRowHeight : null,
            computeMetadataCallback: function computeMetadataCallback() {
              return instanceProps.rowSizeAndPositionManager.resetCell(0);
            },
            computeMetadataCallbackProps: nextProps,
            nextCellsCount: nextProps.rowCount,
            nextCellSize: typeof nextProps.rowHeight === "number" ? nextProps.rowHeight : null,
            nextScrollToIndex: nextProps.scrollToRow,
            scrollToIndex: instanceProps.prevScrollToRow,
            updateScrollOffsetForScrollToIndex: function updateScrollOffsetForScrollToIndex() {
              maybeStateB = Grid3._getScrollTopForScrollToRowStateUpdate(nextProps, prevState);
            }
          });
          instanceProps.prevColumnCount = nextProps.columnCount;
          instanceProps.prevColumnWidth = nextProps.columnWidth;
          instanceProps.prevIsScrolling = nextProps.isScrolling === true;
          instanceProps.prevRowCount = nextProps.rowCount;
          instanceProps.prevRowHeight = nextProps.rowHeight;
          instanceProps.prevScrollToColumn = nextProps.scrollToColumn;
          instanceProps.prevScrollToRow = nextProps.scrollToRow;
          instanceProps.scrollbarSize = nextProps.getScrollbarSize();
          if (instanceProps.scrollbarSize === void 0) {
            instanceProps.scrollbarSizeMeasured = false;
            instanceProps.scrollbarSize = 0;
          } else {
            instanceProps.scrollbarSizeMeasured = true;
          }
          newState.instanceProps = instanceProps;
          return _objectSpread(_objectSpread(_objectSpread({}, newState), maybeStateA), maybeStateB);
        }
      }, {
        key: "_getEstimatedColumnSize",
        value: function _getEstimatedColumnSize(props) {
          return typeof props.columnWidth === "number" ? props.columnWidth : props.estimatedColumnSize;
        }
      }, {
        key: "_getEstimatedRowSize",
        value: function _getEstimatedRowSize(props) {
          return typeof props.rowHeight === "number" ? props.rowHeight : props.estimatedRowSize;
        }
      }, {
        key: "_getScrollToPositionStateUpdate",
        value: (
          /**
           * Get the updated state after scrolling to
           * scrollLeft and scrollTop
           */
          function _getScrollToPositionStateUpdate(_ref9) {
            var prevState = _ref9.prevState, scrollLeft = _ref9.scrollLeft, scrollTop = _ref9.scrollTop;
            var newState = {
              scrollPositionChangeReason: SCROLL_POSITION_CHANGE_REASONS.REQUESTED
            };
            if (typeof scrollLeft === "number" && scrollLeft >= 0) {
              newState.scrollDirectionHorizontal = scrollLeft > prevState.scrollLeft ? _defaultOverscanIndicesGetter.SCROLL_DIRECTION_FORWARD : _defaultOverscanIndicesGetter.SCROLL_DIRECTION_BACKWARD;
              newState.scrollLeft = scrollLeft;
            }
            if (typeof scrollTop === "number" && scrollTop >= 0) {
              newState.scrollDirectionVertical = scrollTop > prevState.scrollTop ? _defaultOverscanIndicesGetter.SCROLL_DIRECTION_FORWARD : _defaultOverscanIndicesGetter.SCROLL_DIRECTION_BACKWARD;
              newState.scrollTop = scrollTop;
            }
            if (typeof scrollLeft === "number" && scrollLeft >= 0 && scrollLeft !== prevState.scrollLeft || typeof scrollTop === "number" && scrollTop >= 0 && scrollTop !== prevState.scrollTop) {
              return newState;
            }
            return {};
          }
        )
      }, {
        key: "_wrapSizeGetter",
        value: function _wrapSizeGetter(value) {
          return typeof value === "function" ? value : function() {
            return value;
          };
        }
      }, {
        key: "_getCalculatedScrollLeft",
        value: function _getCalculatedScrollLeft(nextProps, prevState) {
          var columnCount = nextProps.columnCount, height = nextProps.height, scrollToAlignment = nextProps.scrollToAlignment, scrollToColumn = nextProps.scrollToColumn, width = nextProps.width;
          var scrollLeft = prevState.scrollLeft, instanceProps = prevState.instanceProps;
          if (columnCount > 0) {
            var finalColumn = columnCount - 1;
            var targetIndex = scrollToColumn < 0 ? finalColumn : Math.min(finalColumn, scrollToColumn);
            var totalRowsHeight = instanceProps.rowSizeAndPositionManager.getTotalSize();
            var scrollBarSize = instanceProps.scrollbarSizeMeasured && totalRowsHeight > height ? instanceProps.scrollbarSize : 0;
            return instanceProps.columnSizeAndPositionManager.getUpdatedOffsetForIndex({
              align: scrollToAlignment,
              containerSize: width - scrollBarSize,
              currentOffset: scrollLeft,
              targetIndex
            });
          }
          return 0;
        }
      }, {
        key: "_getScrollLeftForScrollToColumnStateUpdate",
        value: function _getScrollLeftForScrollToColumnStateUpdate(nextProps, prevState) {
          var scrollLeft = prevState.scrollLeft;
          var calculatedScrollLeft = Grid3._getCalculatedScrollLeft(nextProps, prevState);
          if (typeof calculatedScrollLeft === "number" && calculatedScrollLeft >= 0 && scrollLeft !== calculatedScrollLeft) {
            return Grid3._getScrollToPositionStateUpdate({
              prevState,
              scrollLeft: calculatedScrollLeft,
              scrollTop: -1
            });
          }
          return {};
        }
      }, {
        key: "_getCalculatedScrollTop",
        value: function _getCalculatedScrollTop(nextProps, prevState) {
          var height = nextProps.height, rowCount = nextProps.rowCount, scrollToAlignment = nextProps.scrollToAlignment, scrollToRow = nextProps.scrollToRow, width = nextProps.width;
          var scrollTop = prevState.scrollTop, instanceProps = prevState.instanceProps;
          if (rowCount > 0) {
            var finalRow = rowCount - 1;
            var targetIndex = scrollToRow < 0 ? finalRow : Math.min(finalRow, scrollToRow);
            var totalColumnsWidth = instanceProps.columnSizeAndPositionManager.getTotalSize();
            var scrollBarSize = instanceProps.scrollbarSizeMeasured && totalColumnsWidth > width ? instanceProps.scrollbarSize : 0;
            return instanceProps.rowSizeAndPositionManager.getUpdatedOffsetForIndex({
              align: scrollToAlignment,
              containerSize: height - scrollBarSize,
              currentOffset: scrollTop,
              targetIndex
            });
          }
          return 0;
        }
      }, {
        key: "_getScrollTopForScrollToRowStateUpdate",
        value: function _getScrollTopForScrollToRowStateUpdate(nextProps, prevState) {
          var scrollTop = prevState.scrollTop;
          var calculatedScrollTop = Grid3._getCalculatedScrollTop(nextProps, prevState);
          if (typeof calculatedScrollTop === "number" && calculatedScrollTop >= 0 && scrollTop !== calculatedScrollTop) {
            return Grid3._getScrollToPositionStateUpdate({
              prevState,
              scrollLeft: -1,
              scrollTop: calculatedScrollTop
            });
          }
          return {};
        }
      }]);
    }(React2.PureComponent);
    (0, _defineProperty2["default"])(Grid2, "defaultProps", {
      "aria-label": "grid",
      "aria-readonly": true,
      autoContainerWidth: false,
      autoHeight: false,
      autoWidth: false,
      cellRangeRenderer: _defaultCellRangeRenderer["default"],
      containerRole: "row",
      containerStyle: {},
      estimatedColumnSize: 100,
      estimatedRowSize: 30,
      getScrollbarSize: _scrollbarSize["default"],
      noContentRenderer: renderNull,
      onScroll: function onScroll() {
      },
      onScrollbarPresenceChange: function onScrollbarPresenceChange() {
      },
      onSectionRendered: function onSectionRendered() {
      },
      overscanColumnCount: 0,
      overscanIndicesGetter: _defaultOverscanIndicesGetter["default"],
      overscanRowCount: 10,
      role: "grid",
      scrollingResetTimeInterval: DEFAULT_SCROLLING_RESET_TIME_INTERVAL,
      scrollToAlignment: "auto",
      scrollToColumn: -1,
      scrollToRow: -1,
      style: {},
      tabIndex: 0,
      isScrollingOptOut: false
    });
    (0, _reactLifecyclesCompat.polyfill)(Grid2);
    exports2["default"] = Grid2;
  })(Grid);
  return Grid;
}
var accessibilityOverscanIndicesGetter = {};
var hasRequiredAccessibilityOverscanIndicesGetter;
function requireAccessibilityOverscanIndicesGetter() {
  if (hasRequiredAccessibilityOverscanIndicesGetter)
    return accessibilityOverscanIndicesGetter;
  hasRequiredAccessibilityOverscanIndicesGetter = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.SCROLL_DIRECTION_VERTICAL = exports2.SCROLL_DIRECTION_HORIZONTAL = exports2.SCROLL_DIRECTION_FORWARD = exports2.SCROLL_DIRECTION_BACKWARD = void 0;
    exports2["default"] = defaultOverscanIndicesGetter2;
    exports2.SCROLL_DIRECTION_BACKWARD = -1;
    var SCROLL_DIRECTION_FORWARD = exports2.SCROLL_DIRECTION_FORWARD = 1;
    exports2.SCROLL_DIRECTION_HORIZONTAL = "horizontal";
    exports2.SCROLL_DIRECTION_VERTICAL = "vertical";
    function defaultOverscanIndicesGetter2(_ref) {
      var cellCount = _ref.cellCount, overscanCellsCount = _ref.overscanCellsCount, scrollDirection = _ref.scrollDirection, startIndex = _ref.startIndex, stopIndex = _ref.stopIndex;
      overscanCellsCount = Math.max(1, overscanCellsCount);
      if (scrollDirection === SCROLL_DIRECTION_FORWARD) {
        return {
          overscanStartIndex: Math.max(0, startIndex - 1),
          overscanStopIndex: Math.min(cellCount - 1, stopIndex + overscanCellsCount)
        };
      } else {
        return {
          overscanStartIndex: Math.max(0, startIndex - overscanCellsCount),
          overscanStopIndex: Math.min(cellCount - 1, stopIndex + 1)
        };
      }
    }
  })(accessibilityOverscanIndicesGetter);
  return accessibilityOverscanIndicesGetter;
}
var hasRequiredGrid;
function requireGrid() {
  if (hasRequiredGrid)
    return Grid$1;
  hasRequiredGrid = 1;
  (function(exports2) {
    var _interopRequireDefault = interopRequireDefaultExports;
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    Object.defineProperty(exports2, "Grid", {
      enumerable: true,
      get: function get3() {
        return _Grid["default"];
      }
    });
    Object.defineProperty(exports2, "accessibilityOverscanIndicesGetter", {
      enumerable: true,
      get: function get3() {
        return _accessibilityOverscanIndicesGetter["default"];
      }
    });
    Object.defineProperty(exports2, "default", {
      enumerable: true,
      get: function get3() {
        return _Grid["default"];
      }
    });
    Object.defineProperty(exports2, "defaultCellRangeRenderer", {
      enumerable: true,
      get: function get3() {
        return _defaultCellRangeRenderer["default"];
      }
    });
    Object.defineProperty(exports2, "defaultOverscanIndicesGetter", {
      enumerable: true,
      get: function get3() {
        return _defaultOverscanIndicesGetter["default"];
      }
    });
    var _Grid = _interopRequireDefault(requireGrid$1());
    var _accessibilityOverscanIndicesGetter = _interopRequireDefault(requireAccessibilityOverscanIndicesGetter());
    var _defaultCellRangeRenderer = _interopRequireDefault(requireDefaultCellRangeRenderer());
    var _defaultOverscanIndicesGetter = _interopRequireDefault(requireDefaultOverscanIndicesGetter());
  })(Grid$1);
  return Grid$1;
}
var hasRequiredTable;
function requireTable() {
  if (hasRequiredTable)
    return Table;
  hasRequiredTable = 1;
  (function(exports2) {
    var _interopRequireDefault = interopRequireDefaultExports;
    var _typeof2 = require_typeof();
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2["default"] = void 0;
    var _extends2 = _interopRequireDefault(require_extends());
    var _classCallCheck2 = _interopRequireDefault(requireClassCallCheck());
    var _createClass2 = _interopRequireDefault(requireCreateClass());
    var _possibleConstructorReturn2 = _interopRequireDefault(requirePossibleConstructorReturn());
    var _getPrototypeOf2 = _interopRequireDefault(requireGetPrototypeOf());
    var _inherits2 = _interopRequireDefault(requireInherits());
    var _defineProperty2 = _interopRequireDefault(requireDefineProperty());
    var _clsx = _interopRequireDefault(require$$9);
    var _Column = _interopRequireDefault(requireColumn());
    var _propTypes = _interopRequireDefault(propTypesExports);
    var React2 = _interopRequireWildcard(React__default);
    var _Grid2 = _interopRequireWildcard(requireGrid());
    var _defaultRowRenderer = _interopRequireDefault(requireDefaultRowRenderer());
    var _defaultHeaderRowRenderer = _interopRequireDefault(requireDefaultHeaderRowRenderer());
    var _SortDirection = _interopRequireDefault(requireSortDirection());
    function _getRequireWildcardCache(e) {
      if ("function" != typeof WeakMap)
        return null;
      var r2 = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
      return (_getRequireWildcardCache = function _getRequireWildcardCache2(e2) {
        return e2 ? t : r2;
      })(e);
    }
    function _interopRequireWildcard(e, r2) {
      if (!r2 && e && e.__esModule)
        return e;
      if (null === e || "object" != _typeof2(e) && "function" != typeof e)
        return { "default": e };
      var t = _getRequireWildcardCache(r2);
      if (t && t.has(e))
        return t.get(e);
      var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var u in e)
        if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
          var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
          i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
        }
      return n["default"] = e, t && t.set(e, n), n;
    }
    function ownKeys(e, r2) {
      var t = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r2 && (o = o.filter(function(r3) {
          return Object.getOwnPropertyDescriptor(e, r3).enumerable;
        })), t.push.apply(t, o);
      }
      return t;
    }
    function _objectSpread(e) {
      for (var r2 = 1; r2 < arguments.length; r2++) {
        var t = null != arguments[r2] ? arguments[r2] : {};
        r2 % 2 ? ownKeys(Object(t), true).forEach(function(r3) {
          (0, _defineProperty2["default"])(e, r3, t[r3]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r3) {
          Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
        });
      }
      return e;
    }
    function _callSuper(t, o, e) {
      return o = (0, _getPrototypeOf2["default"])(o), (0, _possibleConstructorReturn2["default"])(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2["default"])(t).constructor) : o.apply(t, e));
    }
    function _isNativeReflectConstruct() {
      try {
        var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
        }));
      } catch (t2) {
      }
      return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
        return !!t;
      })();
    }
    var Table2 = exports2["default"] = /* @__PURE__ */ function(_React$PureComponent) {
      function Table3(props) {
        var _this;
        (0, _classCallCheck2["default"])(this, Table3);
        _this = _callSuper(this, Table3, [props]);
        _this.state = {
          scrollbarWidth: 0
        };
        _this._createColumn = _this._createColumn.bind(_this);
        _this._createRow = _this._createRow.bind(_this);
        _this._onScroll = _this._onScroll.bind(_this);
        _this._onSectionRendered = _this._onSectionRendered.bind(_this);
        _this._setRef = _this._setRef.bind(_this);
        _this._setGridElementRef = _this._setGridElementRef.bind(_this);
        return _this;
      }
      (0, _inherits2["default"])(Table3, _React$PureComponent);
      return (0, _createClass2["default"])(Table3, [{
        key: "forceUpdateGrid",
        value: function forceUpdateGrid() {
          if (this.Grid) {
            this.Grid.forceUpdate();
          }
        }
        /** See Grid#getOffsetForCell */
      }, {
        key: "getOffsetForRow",
        value: function getOffsetForRow(_ref) {
          var alignment = _ref.alignment, index = _ref.index;
          if (this.Grid) {
            var _this$Grid$getOffsetF = this.Grid.getOffsetForCell({
              alignment,
              rowIndex: index
            }), scrollTop = _this$Grid$getOffsetF.scrollTop;
            return scrollTop;
          }
          return 0;
        }
        /** CellMeasurer compatibility */
      }, {
        key: "invalidateCellSizeAfterRender",
        value: function invalidateCellSizeAfterRender(_ref2) {
          var columnIndex = _ref2.columnIndex, rowIndex = _ref2.rowIndex;
          if (this.Grid) {
            this.Grid.invalidateCellSizeAfterRender({
              rowIndex,
              columnIndex
            });
          }
        }
        /** See Grid#measureAllCells */
      }, {
        key: "measureAllRows",
        value: function measureAllRows() {
          if (this.Grid) {
            this.Grid.measureAllCells();
          }
        }
        /** CellMeasurer compatibility */
      }, {
        key: "recomputeGridSize",
        value: function recomputeGridSize() {
          var _ref3 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, _ref3$columnIndex = _ref3.columnIndex, columnIndex = _ref3$columnIndex === void 0 ? 0 : _ref3$columnIndex, _ref3$rowIndex = _ref3.rowIndex, rowIndex = _ref3$rowIndex === void 0 ? 0 : _ref3$rowIndex;
          if (this.Grid) {
            this.Grid.recomputeGridSize({
              rowIndex,
              columnIndex
            });
          }
        }
        /** See Grid#recomputeGridSize */
      }, {
        key: "recomputeRowHeights",
        value: function recomputeRowHeights() {
          var index = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
          if (this.Grid) {
            this.Grid.recomputeGridSize({
              rowIndex: index
            });
          }
        }
        /** See Grid#scrollToPosition */
      }, {
        key: "scrollToPosition",
        value: function scrollToPosition() {
          var scrollTop = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
          if (this.Grid) {
            this.Grid.scrollToPosition({
              scrollTop
            });
          }
        }
        /** See Grid#scrollToCell */
      }, {
        key: "scrollToRow",
        value: function scrollToRow() {
          var index = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
          if (this.Grid) {
            this.Grid.scrollToCell({
              columnIndex: 0,
              rowIndex: index
            });
          }
        }
      }, {
        key: "getScrollbarWidth",
        value: function getScrollbarWidth() {
          if (this.GridElement) {
            var _Grid = this.GridElement;
            var clientWidth = _Grid.clientWidth || 0;
            var offsetWidth = _Grid.offsetWidth || 0;
            return offsetWidth - clientWidth;
          }
          return 0;
        }
      }, {
        key: "componentDidMount",
        value: function componentDidMount() {
          this._setScrollbarWidth();
        }
      }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
          this._setScrollbarWidth();
        }
      }, {
        key: "render",
        value: function render() {
          var _this2 = this;
          var _this$props = this.props, children = _this$props.children, className = _this$props.className, disableHeader = _this$props.disableHeader, gridClassName = _this$props.gridClassName, gridStyle = _this$props.gridStyle, headerHeight = _this$props.headerHeight, headerRowRenderer = _this$props.headerRowRenderer, height = _this$props.height, id = _this$props.id, noRowsRenderer = _this$props.noRowsRenderer, rowClassName = _this$props.rowClassName, rowStyle = _this$props.rowStyle, scrollToIndex = _this$props.scrollToIndex, style = _this$props.style, width = _this$props.width;
          var scrollbarWidth = this.state.scrollbarWidth;
          var availableRowsHeight = disableHeader ? height : height - headerHeight;
          var rowClass = typeof rowClassName === "function" ? rowClassName({
            index: -1
          }) : rowClassName;
          var rowStyleObject = typeof rowStyle === "function" ? rowStyle({
            index: -1
          }) : rowStyle;
          this._cachedColumnStyles = [];
          React2.Children.toArray(children).forEach(function(column, index) {
            var flexStyles = _this2._getFlexStyleForColumn(column, column.props.style || _Column["default"].defaultProps.style);
            _this2._cachedColumnStyles[index] = _objectSpread({
              overflow: "hidden"
            }, flexStyles);
          });
          return /* @__PURE__ */ React2.createElement("div", {
            "aria-label": this.props["aria-label"],
            "aria-labelledby": this.props["aria-labelledby"],
            "aria-colcount": React2.Children.toArray(children).length,
            "aria-rowcount": this.props.rowCount,
            className: (0, _clsx["default"])("ReactVirtualized__Table", className),
            id,
            role: "grid",
            style
          }, !disableHeader && headerRowRenderer({
            className: (0, _clsx["default"])("ReactVirtualized__Table__headerRow", rowClass),
            columns: this._getHeaderColumns(),
            style: _objectSpread({
              height: headerHeight,
              overflow: "hidden",
              paddingRight: scrollbarWidth,
              width
            }, rowStyleObject)
          }), /* @__PURE__ */ React2.createElement(_Grid2["default"], (0, _extends2["default"])({}, this.props, {
            elementRef: this._setGridElementRef,
            "aria-readonly": null,
            autoContainerWidth: true,
            className: (0, _clsx["default"])("ReactVirtualized__Table__Grid", gridClassName),
            cellRenderer: this._createRow,
            columnWidth: width,
            columnCount: 1,
            height: availableRowsHeight,
            id: void 0,
            noContentRenderer: noRowsRenderer,
            onScroll: this._onScroll,
            onSectionRendered: this._onSectionRendered,
            ref: this._setRef,
            role: "rowgroup",
            scrollbarWidth,
            scrollToRow: scrollToIndex,
            style: _objectSpread(_objectSpread({}, gridStyle), {}, {
              overflowX: "hidden"
            })
          })));
        }
      }, {
        key: "_createColumn",
        value: function _createColumn(_ref4) {
          var column = _ref4.column, columnIndex = _ref4.columnIndex, isScrolling = _ref4.isScrolling, parent = _ref4.parent, rowData = _ref4.rowData, rowIndex = _ref4.rowIndex;
          var onColumnClick = this.props.onColumnClick;
          var _column$props = column.props, cellDataGetter = _column$props.cellDataGetter, cellRenderer = _column$props.cellRenderer, className = _column$props.className, columnData = _column$props.columnData, dataKey = _column$props.dataKey, id = _column$props.id;
          var cellData = cellDataGetter({
            columnData,
            dataKey,
            rowData
          });
          var renderedCell = cellRenderer({
            cellData,
            columnData,
            columnIndex,
            dataKey,
            isScrolling,
            parent,
            rowData,
            rowIndex
          });
          var onClick = function onClick2(event) {
            onColumnClick && onColumnClick({
              columnData,
              dataKey,
              event
            });
          };
          var style = this._cachedColumnStyles[columnIndex];
          var title = typeof renderedCell === "string" ? renderedCell : null;
          return /* @__PURE__ */ React2.createElement("div", {
            "aria-colindex": columnIndex + 1,
            "aria-describedby": id,
            className: (0, _clsx["default"])("ReactVirtualized__Table__rowColumn", className),
            key: "Row" + rowIndex + "-Col" + columnIndex,
            onClick,
            role: "gridcell",
            style,
            title
          }, renderedCell);
        }
      }, {
        key: "_createHeader",
        value: function _createHeader(_ref5) {
          var column = _ref5.column, index = _ref5.index;
          var _this$props2 = this.props, headerClassName = _this$props2.headerClassName, headerStyle = _this$props2.headerStyle, onHeaderClick = _this$props2.onHeaderClick, sort = _this$props2.sort, sortBy = _this$props2.sortBy, sortDirection = _this$props2.sortDirection;
          var _column$props2 = column.props, columnData = _column$props2.columnData, dataKey = _column$props2.dataKey, defaultSortDirection = _column$props2.defaultSortDirection, disableSort = _column$props2.disableSort, headerRenderer = _column$props2.headerRenderer, id = _column$props2.id, label = _column$props2.label;
          var sortEnabled = !disableSort && sort;
          var classNames = (0, _clsx["default"])("ReactVirtualized__Table__headerColumn", headerClassName, column.props.headerClassName, {
            ReactVirtualized__Table__sortableHeaderColumn: sortEnabled
          });
          var style = this._getFlexStyleForColumn(column, _objectSpread(_objectSpread({}, headerStyle), column.props.headerStyle));
          var renderedHeader = headerRenderer({
            columnData,
            dataKey,
            disableSort,
            label,
            sortBy,
            sortDirection
          });
          var headerOnClick, headerOnKeyDown, headerTabIndex, headerAriaSort, headerAriaLabel;
          if (sortEnabled || onHeaderClick) {
            var isFirstTimeSort = sortBy !== dataKey;
            var newSortDirection = isFirstTimeSort ? defaultSortDirection : sortDirection === _SortDirection["default"].DESC ? _SortDirection["default"].ASC : _SortDirection["default"].DESC;
            var onClick = function onClick2(event) {
              sortEnabled && sort({
                defaultSortDirection,
                event,
                sortBy: dataKey,
                sortDirection: newSortDirection
              });
              onHeaderClick && onHeaderClick({
                columnData,
                dataKey,
                event
              });
            };
            var onKeyDown = function onKeyDown2(event) {
              if (event.key === "Enter" || event.key === " ") {
                onClick(event);
              }
            };
            headerAriaLabel = column.props["aria-label"] || label || dataKey;
            headerAriaSort = "none";
            headerTabIndex = 0;
            headerOnClick = onClick;
            headerOnKeyDown = onKeyDown;
          }
          if (sortBy === dataKey) {
            headerAriaSort = sortDirection === _SortDirection["default"].ASC ? "ascending" : "descending";
          }
          return /* @__PURE__ */ React2.createElement("div", {
            "aria-label": headerAriaLabel,
            "aria-sort": headerAriaSort,
            className: classNames,
            id,
            key: "Header-Col" + index,
            onClick: headerOnClick,
            onKeyDown: headerOnKeyDown,
            role: "columnheader",
            style,
            tabIndex: headerTabIndex
          }, renderedHeader);
        }
      }, {
        key: "_createRow",
        value: function _createRow(_ref6) {
          var _this3 = this;
          var index = _ref6.rowIndex, isScrolling = _ref6.isScrolling, key = _ref6.key, parent = _ref6.parent, style = _ref6.style;
          var _this$props3 = this.props, children = _this$props3.children, onRowClick = _this$props3.onRowClick, onRowDoubleClick = _this$props3.onRowDoubleClick, onRowRightClick = _this$props3.onRowRightClick, onRowMouseOver = _this$props3.onRowMouseOver, onRowMouseOut = _this$props3.onRowMouseOut, rowClassName = _this$props3.rowClassName, rowGetter = _this$props3.rowGetter, rowRenderer = _this$props3.rowRenderer, rowStyle = _this$props3.rowStyle;
          var scrollbarWidth = this.state.scrollbarWidth;
          var rowClass = typeof rowClassName === "function" ? rowClassName({
            index
          }) : rowClassName;
          var rowStyleObject = typeof rowStyle === "function" ? rowStyle({
            index
          }) : rowStyle;
          var rowData = rowGetter({
            index
          });
          var columns = React2.Children.toArray(children).map(function(column, columnIndex) {
            return _this3._createColumn({
              column,
              columnIndex,
              isScrolling,
              parent,
              rowData,
              rowIndex: index,
              scrollbarWidth
            });
          });
          var className = (0, _clsx["default"])("ReactVirtualized__Table__row", rowClass);
          var flattenedStyle = _objectSpread(_objectSpread({}, style), {}, {
            height: this._getRowHeight(index),
            overflow: "hidden",
            paddingRight: scrollbarWidth
          }, rowStyleObject);
          return rowRenderer({
            className,
            columns,
            index,
            isScrolling,
            key,
            onRowClick,
            onRowDoubleClick,
            onRowRightClick,
            onRowMouseOver,
            onRowMouseOut,
            rowData,
            style: flattenedStyle
          });
        }
        /**
         * Determines the flex-shrink, flex-grow, and width values for a cell (header or column).
         */
      }, {
        key: "_getFlexStyleForColumn",
        value: function _getFlexStyleForColumn(column) {
          var customStyle = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          var flexValue = "".concat(column.props.flexGrow, " ").concat(column.props.flexShrink, " ").concat(column.props.width, "px");
          var style = _objectSpread(_objectSpread({}, customStyle), {}, {
            flex: flexValue,
            msFlex: flexValue,
            WebkitFlex: flexValue
          });
          if (column.props.maxWidth) {
            style.maxWidth = column.props.maxWidth;
          }
          if (column.props.minWidth) {
            style.minWidth = column.props.minWidth;
          }
          return style;
        }
      }, {
        key: "_getHeaderColumns",
        value: function _getHeaderColumns() {
          var _this4 = this;
          var _this$props4 = this.props, children = _this$props4.children, disableHeader = _this$props4.disableHeader;
          var items = disableHeader ? [] : React2.Children.toArray(children);
          return items.map(function(column, index) {
            return _this4._createHeader({
              column,
              index
            });
          });
        }
      }, {
        key: "_getRowHeight",
        value: function _getRowHeight(rowIndex) {
          var rowHeight = this.props.rowHeight;
          return typeof rowHeight === "function" ? rowHeight({
            index: rowIndex
          }) : rowHeight;
        }
      }, {
        key: "_onScroll",
        value: function _onScroll(_ref7) {
          var clientHeight = _ref7.clientHeight, scrollHeight = _ref7.scrollHeight, scrollTop = _ref7.scrollTop;
          var onScroll = this.props.onScroll;
          onScroll({
            clientHeight,
            scrollHeight,
            scrollTop
          });
        }
      }, {
        key: "_onSectionRendered",
        value: function _onSectionRendered(_ref8) {
          var rowOverscanStartIndex = _ref8.rowOverscanStartIndex, rowOverscanStopIndex = _ref8.rowOverscanStopIndex, rowStartIndex = _ref8.rowStartIndex, rowStopIndex = _ref8.rowStopIndex;
          var onRowsRendered = this.props.onRowsRendered;
          onRowsRendered({
            overscanStartIndex: rowOverscanStartIndex,
            overscanStopIndex: rowOverscanStopIndex,
            startIndex: rowStartIndex,
            stopIndex: rowStopIndex
          });
        }
      }, {
        key: "_setRef",
        value: function _setRef(ref) {
          this.Grid = ref;
        }
      }, {
        key: "_setGridElementRef",
        value: function _setGridElementRef(ref) {
          this.GridElement = ref;
        }
      }, {
        key: "_setScrollbarWidth",
        value: function _setScrollbarWidth() {
          var scrollbarWidth = this.getScrollbarWidth();
          this.setState({
            scrollbarWidth
          });
        }
      }]);
    }(React2.PureComponent);
    (0, _defineProperty2["default"])(Table2, "defaultProps", {
      disableHeader: false,
      estimatedRowSize: 30,
      headerHeight: 0,
      headerStyle: {},
      noRowsRenderer: function noRowsRenderer() {
        return null;
      },
      onRowsRendered: function onRowsRendered() {
        return null;
      },
      onScroll: function onScroll() {
        return null;
      },
      overscanIndicesGetter: _Grid2.accessibilityOverscanIndicesGetter,
      overscanRowCount: 10,
      rowRenderer: _defaultRowRenderer["default"],
      headerRowRenderer: _defaultHeaderRowRenderer["default"],
      rowStyle: {},
      scrollToAlignment: "auto",
      scrollToIndex: -1,
      style: {}
    });
    Table2.propTypes = {
      /** This is just set on the grid top element. */
      "aria-label": _propTypes["default"].string,
      /** This is just set on the grid top element. */
      "aria-labelledby": _propTypes["default"].string,
      /**
       * Removes fixed height from the scrollingContainer so that the total height
       * of rows can stretch the window. Intended for use with WindowScroller
       */
      autoHeight: _propTypes["default"].bool,
      /** One or more Columns describing the data displayed in this row */
      children: function children(props) {
        var children2 = React2.Children.toArray(props.children);
        for (var i = 0; i < children2.length; i++) {
          var childType = children2[i].type;
          if (childType !== _Column["default"] && !(childType.prototype instanceof _Column["default"])) {
            return new Error("Table only accepts children of type Column");
          }
        }
      },
      /** Optional CSS class name */
      className: _propTypes["default"].string,
      /** Disable rendering the header at all */
      disableHeader: _propTypes["default"].bool,
      /**
       * Used to estimate the total height of a Table before all of its rows have actually been measured.
       * The estimated total height is adjusted as rows are rendered.
       */
      estimatedRowSize: _propTypes["default"].number.isRequired,
      /** Optional custom CSS class name to attach to inner Grid element. */
      gridClassName: _propTypes["default"].string,
      /** Optional inline style to attach to inner Grid element. */
      gridStyle: _propTypes["default"].object,
      /** Optional CSS class to apply to all column headers */
      headerClassName: _propTypes["default"].string,
      /** Fixed height of header row */
      headerHeight: _propTypes["default"].number.isRequired,
      /**
       * Responsible for rendering a table row given an array of columns:
       * Should implement the following interface: ({
       *   className: string,
       *   columns: any[],
       *   style: any
       * }): PropTypes.node
       */
      headerRowRenderer: _propTypes["default"].func,
      /** Optional custom inline style to attach to table header columns. */
      headerStyle: _propTypes["default"].object,
      /** Fixed/available height for out DOM element */
      height: _propTypes["default"].number.isRequired,
      /** Optional id */
      id: _propTypes["default"].string,
      /** Optional renderer to be used in place of table body rows when rowCount is 0 */
      noRowsRenderer: _propTypes["default"].func,
      /**
       * Optional callback when a column is clicked.
       * ({ columnData: any, dataKey: string }): void
       */
      onColumnClick: _propTypes["default"].func,
      /**
       * Optional callback when a column's header is clicked.
       * ({ columnData: any, dataKey: string }): void
       */
      onHeaderClick: _propTypes["default"].func,
      /**
       * Callback invoked when a user clicks on a table row.
       * ({ index: number }): void
       */
      onRowClick: _propTypes["default"].func,
      /**
       * Callback invoked when a user double-clicks on a table row.
       * ({ index: number }): void
       */
      onRowDoubleClick: _propTypes["default"].func,
      /**
       * Callback invoked when the mouse leaves a table row.
       * ({ index: number }): void
       */
      onRowMouseOut: _propTypes["default"].func,
      /**
       * Callback invoked when a user moves the mouse over a table row.
       * ({ index: number }): void
       */
      onRowMouseOver: _propTypes["default"].func,
      /**
       * Callback invoked when a user right-clicks on a table row.
       * ({ index: number }): void
       */
      onRowRightClick: _propTypes["default"].func,
      /**
       * Callback invoked with information about the slice of rows that were just rendered.
       * ({ startIndex, stopIndex }): void
       */
      onRowsRendered: _propTypes["default"].func,
      /**
       * Callback invoked whenever the scroll offset changes within the inner scrollable region.
       * This callback can be used to sync scrolling between lists, tables, or grids.
       * ({ clientHeight, scrollHeight, scrollTop }): void
       */
      onScroll: _propTypes["default"].func.isRequired,
      /** See Grid#overscanIndicesGetter */
      overscanIndicesGetter: _propTypes["default"].func.isRequired,
      /**
       * Number of rows to render above/below the visible bounds of the list.
       * These rows can help for smoother scrolling on touch devices.
       */
      overscanRowCount: _propTypes["default"].number.isRequired,
      /**
       * Optional CSS class to apply to all table rows (including the header row).
       * This property can be a CSS class name (string) or a function that returns a class name.
       * If a function is provided its signature should be: ({ index: number }): string
       */
      rowClassName: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].func]),
      /**
       * Callback responsible for returning a data row given an index.
       * ({ index: number }): any
       */
      rowGetter: _propTypes["default"].func.isRequired,
      /**
       * Either a fixed row height (number) or a function that returns the height of a row given its index.
       * ({ index: number }): number
       */
      rowHeight: _propTypes["default"].oneOfType([_propTypes["default"].number, _propTypes["default"].func]).isRequired,
      /** Number of rows in table. */
      rowCount: _propTypes["default"].number.isRequired,
      /**
       * Responsible for rendering a table row given an array of columns:
       * Should implement the following interface: ({
       *   className: string,
       *   columns: Array,
       *   index: number,
       *   isScrolling: boolean,
       *   onRowClick: ?Function,
       *   onRowDoubleClick: ?Function,
       *   onRowMouseOver: ?Function,
       *   onRowMouseOut: ?Function,
       *   rowData: any,
       *   style: any
       * }): PropTypes.node
       */
      rowRenderer: _propTypes["default"].func,
      /** Optional custom inline style to attach to table rows. */
      rowStyle: _propTypes["default"].oneOfType([_propTypes["default"].object, _propTypes["default"].func]).isRequired,
      /** See Grid#scrollToAlignment */
      scrollToAlignment: _propTypes["default"].oneOf(["auto", "end", "start", "center"]).isRequired,
      /** Row index to ensure visible (by forcefully scrolling if necessary) */
      scrollToIndex: _propTypes["default"].number.isRequired,
      /** Vertical offset. */
      scrollTop: _propTypes["default"].number,
      /**
       * Sort function to be called if a sortable header is clicked.
       * Should implement the following interface: ({
       *   defaultSortDirection: 'ASC' | 'DESC',
       *   event: MouseEvent,
       *   sortBy: string,
       *   sortDirection: SortDirection
       * }): void
       */
      sort: _propTypes["default"].func,
      /** Table data is currently sorted by this :dataKey (if it is sorted at all) */
      sortBy: _propTypes["default"].string,
      /** Table data is currently sorted in this direction (if it is sorted at all) */
      sortDirection: _propTypes["default"].oneOf([_SortDirection["default"].ASC, _SortDirection["default"].DESC]),
      /** Optional inline style */
      style: _propTypes["default"].object,
      /** Tab index for focus */
      tabIndex: _propTypes["default"].number,
      /** Width of list */
      width: _propTypes["default"].number.isRequired
    };
  })(Table);
  return Table;
}
(function(exports2) {
  var _interopRequireDefault = interopRequireDefaultExports;
  Object.defineProperty(exports2, "__esModule", {
    value: true
  });
  Object.defineProperty(exports2, "Column", {
    enumerable: true,
    get: function get3() {
      return _Column["default"];
    }
  });
  Object.defineProperty(exports2, "SortDirection", {
    enumerable: true,
    get: function get3() {
      return _SortDirection["default"];
    }
  });
  Object.defineProperty(exports2, "SortIndicator", {
    enumerable: true,
    get: function get3() {
      return _SortIndicator["default"];
    }
  });
  Object.defineProperty(exports2, "Table", {
    enumerable: true,
    get: function get3() {
      return _Table["default"];
    }
  });
  Object.defineProperty(exports2, "createMultiSort", {
    enumerable: true,
    get: function get3() {
      return _createMultiSort["default"];
    }
  });
  exports2["default"] = void 0;
  Object.defineProperty(exports2, "defaultCellDataGetter", {
    enumerable: true,
    get: function get3() {
      return _defaultCellDataGetter["default"];
    }
  });
  Object.defineProperty(exports2, "defaultCellRenderer", {
    enumerable: true,
    get: function get3() {
      return _defaultCellRenderer["default"];
    }
  });
  Object.defineProperty(exports2, "defaultHeaderRenderer", {
    enumerable: true,
    get: function get3() {
      return _defaultHeaderRenderer["default"];
    }
  });
  Object.defineProperty(exports2, "defaultHeaderRowRenderer", {
    enumerable: true,
    get: function get3() {
      return _defaultHeaderRowRenderer["default"];
    }
  });
  Object.defineProperty(exports2, "defaultRowRenderer", {
    enumerable: true,
    get: function get3() {
      return _defaultRowRenderer["default"];
    }
  });
  var _createMultiSort = _interopRequireDefault(requireCreateMultiSort());
  var _defaultCellDataGetter = _interopRequireDefault(requireDefaultCellDataGetter());
  var _defaultCellRenderer = _interopRequireDefault(requireDefaultCellRenderer());
  var _defaultHeaderRowRenderer = _interopRequireDefault(requireDefaultHeaderRowRenderer());
  var _defaultHeaderRenderer = _interopRequireDefault(requireDefaultHeaderRenderer());
  var _defaultRowRenderer = _interopRequireDefault(requireDefaultRowRenderer());
  var _Column = _interopRequireDefault(requireColumn());
  var _SortDirection = _interopRequireDefault(requireSortDirection());
  var _SortIndicator = _interopRequireDefault(requireSortIndicator());
  var _Table = _interopRequireDefault(requireTable());
  exports2["default"] = _Table["default"];
})(Table$1);
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
const randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const native = {
  randomUUID
};
function v4(options, buf, offset) {
  if (native.randomUUID && !buf && !options) {
    return native.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
const useStyles$1 = makeStyles((theme) => ({
  selectableTable: {
    flex: "1 1 auto",
    outline: "none"
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    borderBottom: `1px solid ${theme.palette.secondaryBackgroundDim}`
    // map-get($theme-colors, "secondary-background-dim");
  },
  tableItem: {
    cursor: "pointer",
    userSelect: "none",
    "&.row-checked": {
      backgroundColor: theme.palette.secondaryBackgroundDim
      // map-get($theme-colors, "secondary-background-dim");
    },
    "&:not(.row-checked):hover": {
      /*
      @if $theme-name == dark {
          background-color: darken(map-get($theme-colors, "secondary-background-dim"), 10%);
      } @else {
          background-color: lighten(map-get($theme-colors, "secondary-background-dim"), 10%);
      }
      */
    }
  },
  tableCell: {
    textAlign: "left",
    flexBasis: 0,
    flexGrow: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  inputContainer: {
    width: "1em",
    "& label": {
      display: "block",
      margin: "0",
      cursor: "pointer"
    },
    "& input": {
      cursor: "pointer"
    }
  },
  hiddenInputColumn: {
    // Class for first column of inputs, to hide them if desired.
    display: "none"
  },
  radioOrCheckbox: {
    appearance: "none",
    /* create custom radiobutton appearance */
    display: "inline-block",
    width: "1em",
    height: "1em",
    margin: "0.3em 0.5em 0.0em 0.5em",
    padding: "6px",
    /* background-color only for content */
    backgroundClip: "content-box",
    border: `2px solid ${theme.palette.grayLight}`,
    // map-get($global-colors, "gray-light");
    backgroundColor: theme.palette.grayLight,
    // map-get($global-colors, "gray-light");
    "&:checked": {
      backgroundClip: "unset"
    }
  },
  tableRadio: {
    borderRadius: "50%"
  },
  tableCheckbox: {
    borderRadius: "2px"
  }
}));
const SHIFT_KEYCODE = 16;
function SelectableTable(props) {
  const {
    hasColorEncoding,
    columns,
    columnLabels,
    data,
    onChange,
    idKey = "id",
    valueKey = "value",
    allowMultiple = false,
    allowUncheck = false,
    showTableHead = true,
    showTableInputs = false,
    testHeight = void 0,
    testWidth = void 0
  } = props;
  const [selectedRows, setSelectedRows] = useState(null);
  const [isCheckingMultiple, setIsCheckingMultiple] = useState(false);
  useEffect(() => {
    function onKeyDown(event) {
      if (allowMultiple && event.keyCode === SHIFT_KEYCODE) {
        setIsCheckingMultiple(true);
      }
    }
    function onKeyUp(event) {
      if (allowMultiple && event.keyCode === SHIFT_KEYCODE) {
        setIsCheckingMultiple(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [allowMultiple]);
  const onSelectRow = useCallback((value, checked) => {
    if (checked || allowUncheck) {
      if (!isCheckingMultiple && (checked || !checked && allowMultiple && selectedRows.length > 1)) {
        setSelectedRows([value]);
      } else if (!allowMultiple && !checked) {
        setSelectedRows([]);
      } else {
        setSelectedRows(
          checked ? union$1(selectedRows || [], [value]) : difference$1(selectedRows || [], [value])
        );
      }
    }
  }, [allowMultiple, isCheckingMultiple, allowUncheck, selectedRows]);
  const handleInputChange = useCallback((event) => {
    const { target } = event;
    const { checked } = target;
    const { value } = target;
    onSelectRow(value, checked);
  }, [onSelectRow]);
  const getDataFromIds = useCallback((ids) => ids.map((id) => ({
    [idKey]: id,
    data: data.find((item) => item[idKey] === id)
  })), [data, idKey]);
  const isSelected = useCallback((id) => Array.isArray(selectedRows) && selectedRows.includes(id), [selectedRows]);
  useEffect(() => {
    const initialSelectedRows = data.map((d) => {
      if (d[valueKey]) {
        return d[idKey];
      }
      return null;
    }).filter(Boolean);
    if (!isEqual(initialSelectedRows, selectedRows)) {
      if (initialSelectedRows.length > 0) {
        setSelectedRows(initialSelectedRows);
      } else {
        setSelectedRows(null);
      }
    }
  }, [data, idKey, valueKey]);
  useEffect(() => {
    if (!onChange || !selectedRows) {
      return;
    }
    const selectedRowData = getDataFromIds(selectedRows);
    if (allowMultiple) {
      onChange(selectedRowData);
    } else if (selectedRows.length === 1) {
      onChange(selectedRowData[0]);
    } else if (selectedRows.length === 0) {
      onChange(null);
    }
  }, [selectedRows, allowMultiple]);
  const classes = useStyles$1();
  const inputUuid = v4();
  const rowRenderer = ({ index, style }) => (
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: clsx(classes.tableItem, classes.tableRow, { "row-checked": isSelected(data[index][idKey]) }),
        style,
        role: "button",
        onClick: () => onSelectRow(
          data[index][idKey],
          !isSelected(data[index][idKey]) || !hasColorEncoding
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: clsx(classes.inputContainer, classes.tableCell, { [classes.hiddenInputColumn]: !showTableInputs }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `${inputUuid}_${data[index][idKey]}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: `${inputUuid}_${data[index][idKey]}`,
              type: "checkbox",
              className: clsx(classes.radioOrCheckbox, isCheckingMultiple ? classes.tableCheckbox : classes.tableRadio),
              name: inputUuid,
              value: data[index][idKey],
              onChange: handleInputChange,
              checked: isSelected(data[index][idKey])
            }
          ) }) }),
          columns.map((column) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: classes.tableCell,
              children: data[index][column]
            },
            column
          ))
        ]
      },
      data[index][idKey]
    )
  );
  const headerRowRenderer = ({ style }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: classes.tableRow, style, children: columnLabels.map((columnLabel) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: classes.tableCell, style: { fontWeight: "bold" }, children: columnLabel }, columnLabel)) });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: classes.selectableTable, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoSizer$1.AutoSizer, { children: ({ width, height }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    Table$1.Table,
    {
      height: testHeight || height,
      gridStyle: { outline: "none" },
      rowCount: data.length,
      rowHeight: 24,
      headerHeight: showTableHead ? 24 : void 0,
      rowRenderer,
      width: testWidth || width,
      headerRowRenderer: showTableHead ? headerRowRenderer : void 0,
      rowGetter: ({ index }) => data[index]
    }
  ) }) });
}
const FEATURELIST_SORT_OPTIONS = [
  "alphabetical",
  "original"
];
const ALT_COLNAME = "Alternate ID";
const useStyles = makeStyles(() => ({
  searchBar: {
    marginBottom: "4px",
    border: "0",
    padding: "2px",
    borderRadius: "2px"
  }
}));
function FeatureList(props) {
  const {
    hasColorEncoding,
    geneList = [],
    featureLabelsMap,
    geneSelection = [],
    geneFilter = null,
    setGeneSelection,
    enableMultiSelect,
    showFeatureTable,
    featureListSort,
    featureListSortKey,
    hasFeatureLabels,
    primaryColumnName
  } = props;
  const classes = useStyles();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(geneList);
  const selectableTableSortKey = featureListSortKey === "featureIndex" ? "key" : "name";
  useEffect(() => {
    const results = geneList.filter((gene) => {
      var _a;
      return gene.toLowerCase().includes(searchTerm.toLowerCase()) || ((_a = featureLabelsMap == null ? void 0 : featureLabelsMap.get(gene)) == null ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    setSearchResults(results);
  }, [searchTerm, geneList, featureLabelsMap]);
  function onChange(selection) {
    if (setGeneSelection && selection) {
      if (Array.isArray(selection)) {
        if (selection.length > 0 && every(selection, (s) => s.key)) {
          setGeneSelection(selection.map((s) => s.key));
        } else {
          setGeneSelection(null);
        }
      } else if (selection.key) {
        setGeneSelection([selection.key]);
      }
    }
  }
  const data = useMemo(() => {
    const preSortedData = searchResults.filter((gene) => geneFilter ? geneFilter.includes(gene) : true).map(
      (gene) => ({
        key: gene,
        name: (featureLabelsMap == null ? void 0 : featureLabelsMap.get(gene)) || gene,
        value: geneSelection ? geneSelection.includes(gene) : false
      })
    );
    if (preSortedData && featureListSort === "alphabetical" && preSortedData.length > 0) {
      return preSortedData.sort(
        (a, b) => a[selectableTableSortKey].localeCompare(b[selectableTableSortKey])
      );
    }
    return preSortedData;
  }, [
    featureListSort,
    selectableTableSortKey,
    searchResults,
    geneFilter,
    featureLabelsMap,
    geneSelection
  ]);
  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const [columns, columnLabels] = useMemo(() => {
    if (showFeatureTable && hasFeatureLabels) {
      return [
        ["name", "key"],
        [primaryColumnName, ALT_COLNAME]
      ];
    }
    return [
      ["name"],
      [primaryColumnName]
    ];
  }, [showFeatureTable, primaryColumnName, hasFeatureLabels]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        className: classes.searchBar,
        type: "text",
        placeholder: "Search",
        value: searchTerm,
        onChange: handleChange
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SelectableTable,
      {
        columns,
        columnLabels,
        data,
        hasColorEncoding,
        idKey: "key",
        valueKey: "value",
        onChange,
        allowMultiple: enableMultiSelect,
        allowUncheck: enableMultiSelect,
        showTableHead: columnLabels.length > 1
      }
    )
  ] });
}
const $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c = typeof document !== "undefined" ? React__default.useLayoutEffect : () => {
};
const $b5e257d569688ac6$var$defaultContext = {
  prefix: String(Math.round(Math.random() * 1e10)),
  current: 0
};
const $b5e257d569688ac6$var$SSRContext = /* @__PURE__ */ React__default.createContext($b5e257d569688ac6$var$defaultContext);
const $b5e257d569688ac6$var$IsSSRContext = /* @__PURE__ */ React__default.createContext(false);
let $b5e257d569688ac6$var$canUseDOM = Boolean(typeof window !== "undefined" && window.document && window.document.createElement);
let $b5e257d569688ac6$var$componentIds = /* @__PURE__ */ new WeakMap();
function $b5e257d569688ac6$var$useCounter(isDisabled = false) {
  let ctx = useContext($b5e257d569688ac6$var$SSRContext);
  let ref = useRef(null);
  if (ref.current === null && !isDisabled) {
    var _React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_ReactCurrentOwner, _React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    let currentOwner = (_React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = React__default.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) === null || _React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED === void 0 ? void 0 : (_React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_ReactCurrentOwner = _React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner) === null || _React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_ReactCurrentOwner === void 0 ? void 0 : _React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_ReactCurrentOwner.current;
    if (currentOwner) {
      let prevComponentValue = $b5e257d569688ac6$var$componentIds.get(currentOwner);
      if (prevComponentValue == null)
        $b5e257d569688ac6$var$componentIds.set(currentOwner, {
          id: ctx.current,
          state: currentOwner.memoizedState
        });
      else if (currentOwner.memoizedState !== prevComponentValue.state) {
        ctx.current = prevComponentValue.id;
        $b5e257d569688ac6$var$componentIds.delete(currentOwner);
      }
    }
    ref.current = ++ctx.current;
  }
  return ref.current;
}
function $b5e257d569688ac6$var$useLegacySSRSafeId(defaultId) {
  let ctx = useContext($b5e257d569688ac6$var$SSRContext);
  if (ctx === $b5e257d569688ac6$var$defaultContext && !$b5e257d569688ac6$var$canUseDOM && true)
    console.warn("When server rendering, you must wrap your application in an <SSRProvider> to ensure consistent ids are generated between the client and server.");
  let counter = $b5e257d569688ac6$var$useCounter(!!defaultId);
  let prefix2 = ctx === $b5e257d569688ac6$var$defaultContext && false ? "react-aria" : `react-aria${ctx.prefix}`;
  return defaultId || `${prefix2}-${counter}`;
}
function $b5e257d569688ac6$var$useModernSSRSafeId(defaultId) {
  let id = React__default.useId();
  let [didSSR] = useState($b5e257d569688ac6$export$535bd6ca7f90a273());
  let prefix2 = didSSR || false ? "react-aria" : `react-aria${$b5e257d569688ac6$var$defaultContext.prefix}`;
  return defaultId || `${prefix2}-${id}`;
}
const $b5e257d569688ac6$export$619500959fc48b26 = typeof React__default["useId"] === "function" ? $b5e257d569688ac6$var$useModernSSRSafeId : $b5e257d569688ac6$var$useLegacySSRSafeId;
function $b5e257d569688ac6$var$getSnapshot() {
  return false;
}
function $b5e257d569688ac6$var$getServerSnapshot() {
  return true;
}
function $b5e257d569688ac6$var$subscribe(onStoreChange) {
  return () => {
  };
}
function $b5e257d569688ac6$export$535bd6ca7f90a273() {
  if (typeof React__default["useSyncExternalStore"] === "function")
    return React__default["useSyncExternalStore"]($b5e257d569688ac6$var$subscribe, $b5e257d569688ac6$var$getSnapshot, $b5e257d569688ac6$var$getServerSnapshot);
  return useContext($b5e257d569688ac6$var$IsSSRContext);
}
let $bdb11010cef70236$var$canUseDOM = Boolean(typeof window !== "undefined" && window.document && window.document.createElement);
let $bdb11010cef70236$export$d41a04c74483c6ef = /* @__PURE__ */ new Map();
let $bdb11010cef70236$var$registry;
if (typeof FinalizationRegistry !== "undefined")
  $bdb11010cef70236$var$registry = new FinalizationRegistry((heldValue) => {
    $bdb11010cef70236$export$d41a04c74483c6ef.delete(heldValue);
  });
function $bdb11010cef70236$export$f680877a34711e37(defaultId) {
  let [value, setValue] = useState(defaultId);
  let nextId = useRef(null);
  let res = $b5e257d569688ac6$export$619500959fc48b26(value);
  let cleanupRef = useRef(null);
  if ($bdb11010cef70236$var$registry)
    $bdb11010cef70236$var$registry.register(cleanupRef, res);
  if ($bdb11010cef70236$var$canUseDOM) {
    const cacheIdRef = $bdb11010cef70236$export$d41a04c74483c6ef.get(res);
    if (cacheIdRef && !cacheIdRef.includes(nextId))
      cacheIdRef.push(nextId);
    else
      $bdb11010cef70236$export$d41a04c74483c6ef.set(res, [
        nextId
      ]);
  }
  $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c(() => {
    let r2 = res;
    return () => {
      if ($bdb11010cef70236$var$registry)
        $bdb11010cef70236$var$registry.unregister(cleanupRef);
      $bdb11010cef70236$export$d41a04c74483c6ef.delete(r2);
    };
  }, [
    res
  ]);
  useEffect(() => {
    let newId = nextId.current;
    if (newId)
      setValue(newId);
    return () => {
      if (newId)
        nextId.current = null;
    };
  });
  return res;
}
function FeatureListOptions(props) {
  const {
    children,
    featureListSort,
    setFeatureListSort,
    featureListSortKey,
    setFeatureListSortKey,
    showFeatureTable,
    setShowFeatureTable,
    hasFeatureLabels,
    primaryColumnName
  } = props;
  const featureListId = $bdb11010cef70236$export$f680877a34711e37();
  function handleFeatureListSortChange(event) {
    setFeatureListSort(event.target.value);
  }
  function handleFeatureListSortKeyChange(event) {
    setFeatureListSortKey(event.target.value);
  }
  function handleShowTableChange(event) {
    setShowFeatureTable(event.target.checked);
  }
  const classes = usePlotOptionsStyles();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(OptionsContainer, { children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow$1, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell$1, { className: classes.labelCell, variant: "head", scope: "row", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `feature-list-sort-option-${featureListId}`, children: "Sort Ordering" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell$1, { variant: "body", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        OptionSelect,
        {
          className: classes.select,
          value: featureListSort,
          onChange: handleFeatureListSortChange,
          inputProps: {
            id: `feature-list-sort-option-${featureListId}`
          },
          children: FEATURELIST_SORT_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: option, children: option }, option))
        }
      ) })
    ] }),
    hasFeatureLabels ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow$1, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell$1, { className: classes.labelCell, variant: "head", scope: "row", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `feature-list-sort-key-${featureListId}`, children: "Sort Key" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell$1, { variant: "body", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          OptionSelect,
          {
            className: classes.select,
            disabled: featureListSort === "original",
            value: featureListSortKey,
            onChange: handleFeatureListSortKeyChange,
            inputProps: {
              "aria-label": "Select the feature list sort key",
              id: `feature-list-sort-key-${featureListId}`
            },
            children: hasFeatureLabels ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "featureLabels", children: primaryColumnName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "featureIndex", children: ALT_COLNAME })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "featureIndex", children: primaryColumnName })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow$1, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell$1, { className: classes.labelCell, variant: "head", scope: "row", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `feature-list-show-alternative-ids-${featureListId}`, children: "Show Alternate IDs" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell$1, { className: classes.inputCell, variant: "body", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Checkbox$1,
          {
            className: classes.tableCheckbox,
            checked: showFeatureTable,
            onChange: handleShowTableChange,
            name: "feature-list-show-table",
            color: "default",
            inputProps: {
              "aria-label": "Show or hide alternative feature ids",
              id: `feature-list-show-alternative-ids-${featureListId}`
            }
          }
        ) })
      ] })
    ] }) : null
  ] });
}
function FeatureListSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    variablesLabelOverride,
    theme,
    title: titleOverride,
    enableMultiSelect = false,
    showTable = false,
    sort = "alphabetical",
    sortKey = null,
    closeButtonVisible,
    downloadButtonVisible
  } = props;
  const loaders = useLoaders();
  const [{
    dataset,
    obsType,
    featureType,
    featureSelection: geneSelection,
    featureFilter: geneFilter,
    obsColorEncoding: cellColorEncoding
  }, {
    setFeatureSelection: setGeneSelection,
    setFeatureFilter: setGeneFilter,
    setFeatureHighlight: setGeneHighlight,
    setObsColorEncoding: setCellColorEncoding
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.FEATURE_LIST], coordinationScopes);
  const variablesLabel = variablesLabelOverride || featureType;
  const title = titleOverride || `${capitalize$1(variablesLabel)} List`;
  const [{ featureLabelsMap }, featureLabelsStatus, featureLabelsUrls] = useFeatureLabelsData(
    loaders,
    dataset,
    false,
    {},
    {},
    { featureType }
  );
  const [{ featureIndex }, matrixIndicesStatus, obsFeatureMatrixUrls] = useObsFeatureMatrixIndices(
    loaders,
    dataset,
    true,
    { obsType, featureType }
  );
  const isReady = useReady([
    featureLabelsStatus,
    matrixIndicesStatus
  ]);
  const urls = useUrls([
    featureLabelsUrls,
    obsFeatureMatrixUrls
  ]);
  const geneList = featureIndex || [];
  const numGenes = geneList.length;
  const hasFeatureLabels = Boolean(featureLabelsMap);
  function setGeneSelectionAndColorEncoding(newSelection) {
    setGeneSelection(newSelection);
    setCellColorEncoding("geneSelection");
  }
  const [showFeatureTable, setShowFeatureTable] = useState(showTable);
  const [featureListSort, setFeatureListSort] = useState(sort);
  const [featureListSortKey, setFeatureListSortKey] = useState(null);
  const initialSortKey = sortKey || (hasFeatureLabels ? "featureLabels" : "featureIndex");
  const primaryColumnName = `${capitalize$1(featureType)} ID`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    TitleInfo,
    {
      title,
      info: `${commaNumber(numGenes)} ${pluralize(variablesLabel, numGenes)}`,
      theme,
      isScroll: true,
      closeButtonVisible,
      downloadButtonVisible,
      removeGridComponent,
      isReady,
      urls,
      options: /* @__PURE__ */ jsxRuntimeExports.jsx(
        FeatureListOptions,
        {
          featureListSort,
          setFeatureListSort,
          featureListSortKey: featureListSortKey || initialSortKey,
          setFeatureListSortKey,
          showFeatureTable,
          setShowFeatureTable,
          hasFeatureLabels: Boolean(featureLabelsMap),
          primaryColumnName
        }
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        FeatureList,
        {
          hasColorEncoding: cellColorEncoding === "geneSelection",
          showFeatureTable,
          geneList,
          featureListSort,
          featureListSortKey: featureListSortKey || initialSortKey,
          featureLabelsMap,
          featureType,
          geneSelection,
          geneFilter,
          setGeneSelection: setGeneSelectionAndColorEncoding,
          setGeneFilter,
          setGeneHighlight,
          enableMultiSelect,
          hasFeatureLabels: Boolean(featureLabelsMap),
          primaryColumnName
        }
      )
    }
  );
}
export {
  FeatureList,
  FeatureListSubscriber
};
