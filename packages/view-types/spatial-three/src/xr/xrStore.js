import { createXRStore } from '@react-three/xr';

export const xrStore = createXRStore({
  handTracking: true,
  emulate: false,
});
