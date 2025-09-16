// References:
// - https://github.com/gosling-lang/gosling.js/blob/master/scripts/setup-vitest.js
// - https://github.com/vitest-dev/vitest/issues/1377#issuecomment-1141411249
import { afterAll, vi, beforeAll } from 'vitest';
import { randomFillSync } from 'crypto';
import intersection from 'set.prototype.intersection';

import 'vitest-canvas-mock';
import 'jsdom-worker';
import '@testing-library/jest-dom/vitest';


beforeAll(() => {
    // jsdom doesn't come with a WebCrypto implementation (required for uuid)
    global.crypto = {
        getRandomValues: function (buffer) {
            return randomFillSync(buffer);
        }
    };
    // jsdom doesn't come with a `URL.createObjectURL` implementation
    global.URL.createObjectURL = () => { return ''; };

    // Set.prototype.intersection is only available as of NodeJS 22 and later.
    intersection.shim();

    /*
    class WebGLRenderingContextShim {}
    Object.assign(WebGLRenderingContextShim, {
        VERTEX_SHADER: 0x8B31,
        FRAGMENT_SHADER: 0x8B30,
    });

    class WebGL2RenderingContextShim extends WebGLRenderingContextShim {}
    global.WebGLRenderingContext ??= WebGLRenderingContextShim;
    global.WebGL2RenderingContext ??= WebGL2RenderingContextShim;


    global.HTMLCanvasElement ??= class {};
    global.OffscreenCanvas ??= class {};
    global.createImageBitmap ??= async () => ({});

    // Mock neuroglancer so import side-effects don’t run in Node
    vi.mock('@janelia-flyem/neuroglancer', () => ({
        setupDefaultViewer: () => ({}),
    }));
    */
});
