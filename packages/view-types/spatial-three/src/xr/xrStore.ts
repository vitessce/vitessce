import { createXRStore } from '@react-three/xr';
import type { XRStore } from '@react-three/xr';

export const xrStore: XRStore = createXRStore({
  handTracking: true,
  emulate: false,
});
