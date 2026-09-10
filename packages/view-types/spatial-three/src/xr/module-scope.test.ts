import { describe, it, expect } from 'vitest';
// These imports are the assertion: if any of these modules calls getXRModule()
// at module scope, importing this file throws and the test fails. A consumer
// bundler can merge these into an eagerly-evaluated chunk, so they must be
// importable before loadXRModule() has resolved.
import { getXrStore } from './xrStore.js';
import XRWrapper from './XRWrapper.js';
import XREnterButton from './XREnterButton.js';
import { HandDecorate } from './HandDecorate.js';
import { HandBbox } from './HandBbox.js';
import GeometryAndMeshXR from '../GeometryAndMeshXR.js';

describe('XR modules', () => {
  it('import without @react-three/xr being loaded', () => {
    expect([
      getXrStore, XRWrapper, XREnterButton, HandDecorate, HandBbox, GeometryAndMeshXR,
    ].every(x => typeof x === 'function')).toBe(true);
  });
});
