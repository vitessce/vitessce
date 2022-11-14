// References:
// - https://github.com/gosling-lang/gosling.js/blob/master/scripts/setup-vitest.js
// - https://github.com/vitest-dev/vitest/issues/1377#issuecomment-1141411249
import { afterAll, vi, beforeAll } from 'vitest';
import { randomFillSync } from 'crypto';

// global needs to be set before import jest-canvas-mock
global.jest = vi;
import getCanvasWindow from 'jest-canvas-mock/lib/window';

import 'jsdom-worker';

const apis = [
    'Path2D',
    'CanvasGradient',
    'CanvasPattern',
    'CanvasRenderingContext2D',
    'DOMMatrix',
    'ImageData',
    'TextMetrics',
    'ImageBitmap',
    'createImageBitmap'
];

const canvasWindow = getCanvasWindow({ document: window.document });

apis.forEach(api => {
    global[api] = canvasWindow[api];
    global.window[api] = canvasWindow[api];
});

beforeAll(() => {
    // jsdom doesn't come with a WebCrypto implementation (required for uuid)
    global.crypto = {
        getRandomValues: function (buffer) {
            return randomFillSync(buffer);
        }
    };
    // jsdom doesn't come with a `URL.createObjectURL` implementation
    global.URL.createObjectURL = () => { return ''; };
});

afterAll(() => {
    delete global.jest;
    delete global.window.jest;
});
