// References:
// - https://github.com/gosling-lang/gosling.js/blob/master/scripts/setup-vitest.js
// - https://github.com/vitest-dev/vitest/issues/1377#issuecomment-1141411249
import { afterAll, vi, beforeAll } from 'vitest';
import { randomFillSync } from 'crypto';

import 'vitest-canvas-mock';
import 'jsdom-worker';


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
