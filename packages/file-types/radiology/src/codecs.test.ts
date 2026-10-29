import {
  describe, it, expect, vi, beforeAll, afterAll,
} from 'vitest';
import charlsWasm from '@cornerstonejs/codec-charls/decodewasm?inline';
import openjpegWasm from '@cornerstonejs/codec-openjpeg/decodewasm?inline';
import openjphWasm from '@cornerstonejs/codec-openjph/wasm?inline';
import { decodeFrame, WASM_URLS } from './codecs.js';
import { CODEC_FIXTURES, CODEC_FIXTURE_SHAPE } from './codecs.test.fixtures.js';

const EXPECTED = Array.from({ length: 35 }, (_, i) => (i * 97) % 4096);

// Serve the codec .wasm files from node_modules (as data URLs) instead of the CDN.
const LOCAL_WASM: Record<string, string> = {
  [WASM_URLS.charls]: charlsWasm,
  [WASM_URLS.openjpeg]: openjpegWasm,
  [WASM_URLS.openjph]: openjphWasm,
};

function fromBase64(base64: string) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

describe('decodeFrame', () => {
  beforeAll(() => {
    const realFetch = globalThis.fetch;
    vi.stubGlobal('fetch', (url: string) => realFetch(LOCAL_WASM[url]));
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it.each(Object.entries(CODEC_FIXTURES))('decodes %s', async (_, { transferSyntax, base64 }) => {
    const decoded = await decodeFrame(transferSyntax, fromBase64(base64), CODEC_FIXTURE_SHAPE);
    expect(Array.from(new Uint16Array(decoded))).toEqual(EXPECTED);
  });

  it('passes uncompressed frames through', async () => {
    const pixels = new Uint16Array(EXPECTED);
    const decoded = await decodeFrame('1.2.840.10008.1.2.1', new Uint8Array(pixels.buffer), CODEC_FIXTURE_SHAPE);
    expect(Array.from(new Uint16Array(decoded))).toEqual(EXPECTED);
  });

  it('rejects unsupported transfer syntaxes', async () => {
    // JPEG Baseline
    await expect(decodeFrame('1.2.840.10008.1.2.4.50', new Uint8Array(4), CODEC_FIXTURE_SHAPE))
      .rejects.toThrow('1.2.840.10008.1.2.4.50 is not supported');
  });
});
