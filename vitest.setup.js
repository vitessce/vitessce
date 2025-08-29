// References:
// - https://github.com/gosling-lang/gosling.js/blob/master/scripts/setup-vitest.js
// - https://github.com/vitest-dev/vitest/issues/1377#issuecomment-1141411249
import { afterAll, vi, beforeAll } from 'vitest';
import { randomFillSync } from 'crypto';
import intersection from 'set.prototype.intersection';

import 'vitest-canvas-mock';
import '@testing-library/jest-dom/vitest';
import 'jsdom-worker';


beforeAll(() => {
  // jsdom doesn't come with a WebCrypto implementation (required for uuid)
  global.crypto = {
    getRandomValues(buffer) {
      return randomFillSync(buffer);
    },
  };

  // jsdom doesn't come with a URL.createObjectURL implementation
  global.URL.createObjectURL = () => '';

  // Set.prototype.intersection is only available as of Node 22+.
  intersection.shim();

  // ---- Minimal browser-ish/WebGL stubs ----
  globalThis.WebGLRenderingContext ||= class {};
  globalThis.WebGL2RenderingContext ||= class {};
  globalThis.HTMLCanvasElement ||= class {};
  globalThis.OffscreenCanvas ||= class {};
  globalThis.createImageBitmap ||= async () => ({});

  // ---- No-op Worker to prevent fetch("") from jsdom-worker ----
  class NoopWorker {
    onmessage = null;
    onerror = null;
    postMessage() {}
    terminate() {}
    addEventListener() {}
    removeEventListener() {}
  }
  globalThis.Worker ||= NoopWorker;
});

/* ---------- Mock the Neuroglancer modules so React components can import in Node ---------- */
vi.mock('@janelia-flyem/neuroglancer', () => {
  const changed = { add: () => () => {} }; // disposer
  const viewerStub = {
    projectionScale: { value: 1, changed },
    projectionOrientation: { orientation: [1, 0, 0, 0], changed },
    position: { value: [0, 0, 0], changed },
    state: {
      restoreState: (_patch) => {},
      toJSON: () => ({ layers: [] }),
    },
    layerManager: {
      layersChanged: { add: () => () => {} },
      managedLayers: [],
      customSignalHandlerRemovers: {},
    },
    inputEventBindings: {
      global: { bindings: new Map(), parents: [] },
      perspectiveView: { bindings: new Map(), parents: [] },
      sliceView: { bindings: new Map(), parents: [] },
      set: () => {},
    },
    selectionDetailsState: { changed: { add: () => () => {} }, value: null },
    expectingExternalUI: true,
    bindCallback: () => {},
  };
  return { setupDefaultViewer: () => viewerStub };
});

vi.mock(
  '@janelia-flyem/neuroglancer/dist/module/neuroglancer/segmentation_user_layer',
  () => ({ SegmentationUserLayer: class {} }),
);
vi.mock(
  '@janelia-flyem/neuroglancer/dist/module/neuroglancer/annotation/user_layer',
  () => ({ AnnotationUserLayer: class {} }),
);
vi.mock(
  '@janelia-flyem/neuroglancer/dist/module/neuroglancer/segmentation_display_state/frontend',
  () => ({ getObjectColor: () => [1, 1, 1, 1] }),
);
vi.mock(
  '@janelia-flyem/neuroglancer/dist/module/neuroglancer/util/color',
  () => ({ serializeColor: () => '#ffffff' }),
);
vi.mock(
  '@janelia-flyem/neuroglancer/dist/module/neuroglancer/util/uint64',
  () => ({ Uint64: class {} }),
);
