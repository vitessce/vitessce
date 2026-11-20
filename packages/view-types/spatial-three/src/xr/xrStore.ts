import type { XRStore } from '@react-three/xr';
import { getXRModule } from './xrModule.js';

let store: XRStore | null = null;

// Created on first use rather than at module scope, so that evaluating this
// module before loadXRModule() resolves is harmless. See xrModule.ts.
export function getXrStore(): XRStore {
  if (!store) {
    store = getXRModule().createXRStore({
      handTracking: true,
      emulate: false,
    });
  }
  return store;
}
