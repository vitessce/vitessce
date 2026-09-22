// A deck.gl View that accepts a raw viewMatrix with no angle math of its
// own. Every built-in View (OrbitView, MapView, ...) unconditionally
// recomputes its own viewMatrix and overrides whatever is passed in. The
// base Viewport class, however, already accepts viewMatrix directly
// (viewports/viewport.ts _initMatrices) with no interpretation -- this
// View is the thinnest possible wrapper exposing that pass-through
// behavior. controller={false} is required by the caller; ControllerType
// is only present to satisfy View's abstract contract and is never
// actually instantiated.
//
// Ported from the camera-comparison reference app's RawView.ts, where this
// approach (Route B) was verified to solve both the OrbitView roll/gimbal-
// lock limitation and a persistent zoom mismatch -- both symptoms of the
// same root cause: OrbitView's 2-angle + log2-zoom parameterization cannot
// exactly reproduce a real camera (position + quaternion + fovy), which is
// what NG actually uses.
import { View, Viewport, OrbitController } from '@deck.gl/core';

export class RawView extends View {
  static displayName = 'RawView';
  // eslint-disable-next-line class-methods-use-this
  get ViewportType() {
    return Viewport;
  }
  // eslint-disable-next-line class-methods-use-this
  get ControllerType() {
    return OrbitController;
  }
}