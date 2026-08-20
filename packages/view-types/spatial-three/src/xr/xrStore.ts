import type { XRStore } from '@react-three/xr';
import { getXRModule } from './xrModule.js';

export const xrStore: XRStore = getXRModule().createXRStore({
  handTracking: true,
  emulate: false,
});
