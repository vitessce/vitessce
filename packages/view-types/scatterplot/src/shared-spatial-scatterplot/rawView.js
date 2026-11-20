// A deck.gl View that accepts a raw viewMatrix with no angle math of its
// own. Every built-in View (OrbitView, MapView, ...) unconditionally
// recomputes its own viewMatrix and overrides whatever is passed in. The
// base Viewport class, however, already accepts viewMatrix directly
// (viewports/viewport.ts _initMatrices) with no interpretation -- this
// View is the thinnest possible wrapper exposing that pass-through
// behavior. controller={false} is required by the caller; ControllerType
// is only present to satisfy View's abstract contract and is never
// actually instantiated.

import { deck } from '@vitessce/gl';

const { View, Viewport, OrbitController } = deck;

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
