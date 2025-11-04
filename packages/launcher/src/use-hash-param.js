/* eslint-disable no-param-reassign */
// Adapted from https://github.com/hejmsdz/use-hash-param/blob/3fd6818/src/index.js
import { useState, useEffect, useCallback } from 'react';

const getHashSearchParams = (location) => {
  const hash = location.hash.slice(1);
  const [prefix, query] = hash.split('?');

  return [prefix, new URLSearchParams(query)];
};

const getHashParam = (key, location = window.location) => {
  // eslint-disable-next-line no-unused-vars
  const [_, searchParams] = getHashSearchParams(location);
  return searchParams.get(key);
};

const getTypedHashParam = (key, varType) => {
  const val = getHashParam(key);
  let typedVal = val;
  if (varType === 'boolean') {
    try {
      typedVal = JSON.parse(val);
    } catch (e) {
      typedVal = false;
    }
  }
  return typedVal;
};

const setHashParam = (key, value, location = window.location) => {
  const [prefix, searchParams] = getHashSearchParams(location);

  if (typeof value === 'undefined' || value === '') {
    searchParams.delete(key);
  } else {
    searchParams.set(key, value);
  }

  const search = searchParams.toString();
  location.hash = search ? `${prefix}?${search}` : prefix;
};

// There is no "pushState" or "replaceState" event on the
// window, only a "popstate" event. We can add our own
// pushState and replaceState events by wrapping the
// methods of the window.history object and dispatching
// as custom events.
// Reference: https://stackoverflow.com/a/25673911
const wrapHistoryMethod = (methodName) => {
  const orig = window.history[methodName];
  window.history.wrapped = true;
  // eslint-disable-next-line func-names
  return function () {
    // eslint-disable-next-line prefer-rest-params
    const rv = orig.apply(this, arguments);
    const e = new Event(methodName);
    // eslint-disable-next-line prefer-rest-params
    e.arguments = arguments;
    window.dispatchEvent(e);
    return rv;
  };
};

export const useHashParam = (key, defaultValue, varType) => {
  const [innerValue, setInnerValue] = useState(getTypedHashParam(key, varType));

  useEffect(() => {
    let unmounted = false;

    if (window.history && !window.history.wrapped) {
      window.history.pushState = wrapHistoryMethod('pushState');
    }

    const handleHashChange = () => {
      if (unmounted) {
        return;
      }
      const nextValue = getTypedHashParam(key, varType);
      setInnerValue(nextValue);
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('pushState', handleHashChange);
    return () => {
      unmounted = true;
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('pushState', handleHashChange);
    };
  }, [key, varType]);

  const setValue = useCallback((value) => {
    if (typeof value === 'function') {
      setHashParam(key, value(getHashParam(key)));
    } else {
      setHashParam(key, value);
    }
  }, [key]);

  return [innerValue === undefined ? defaultValue : innerValue, setValue];
};

export const useSetHashParams = () => (values, location = window.location) => {
  const [prefix, searchParams] = getHashSearchParams(location);

  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === 'undefined' || value === '') {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
  });

  const search = searchParams.toString();
  location.hash = search ? `${prefix}?${search}` : prefix;
};
