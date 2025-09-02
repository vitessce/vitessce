import { describe, expect, it, vi, beforeAll } from 'vitest';


class WebGLRenderingContextShim {}
Object.assign(WebGLRenderingContextShim, {
  VERTEX_SHADER: 0x8B31,
  FRAGMENT_SHADER: 0x8B30,
});

class WebGL2RenderingContextShim extends WebGLRenderingContextShim {}
(globalThis as any).WebGLRenderingContext ??= WebGLRenderingContextShim;
(globalThis as any).WebGL2RenderingContext ??= WebGL2RenderingContextShim;


(globalThis as any).HTMLCanvasElement ??= class {};
(globalThis as any).OffscreenCanvas ??= class {};
(globalThis as any).createImageBitmap ??= async () => ({});

// Mock neuroglancer so import side-effects don’t run in Node
vi.mock('@janelia-flyem/neuroglancer', () => ({
  setupDefaultViewer: () => ({}),
}));

/* eslint-disable import/first */
import { CoordinationType } from '@vitessce/constants-internal';

// --- rest of your existing tests unchanged ---
describe('view config schema', () => {
  describe('coordination types', () => {
    it('defines schema for all valid coordination types', async () => {
      const { baseCoordinationTypes } = await import('./base-plugins.js');
      const coordinationTypeNamesFromConstants = Object.values(CoordinationType).sort();
      const coordinationTypeNamesFromBasePlugins = baseCoordinationTypes.map(ct => ct.name).sort();
      expect(coordinationTypeNamesFromConstants)
        .toEqual(expect.arrayContaining(coordinationTypeNamesFromBasePlugins));
    }, 30000);

    it('defines schema for only valid coordination types (does not have extra)', async () => {
      const { baseCoordinationTypes } = await import('./base-plugins.js');
      const coordinationTypeNamesFromConstants = Object.values(CoordinationType).sort();
      const coordinationTypeNamesFromBasePlugins = baseCoordinationTypes.map(ct => ct.name).sort();
      expect(coordinationTypeNamesFromBasePlugins)
        .toEqual(expect.arrayContaining(coordinationTypeNamesFromConstants));
    }, 30000);
  });
});
