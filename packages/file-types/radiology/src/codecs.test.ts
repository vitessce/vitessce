import {
  describe, it, expect, vi, beforeAll, afterAll,
} from 'vitest';
import charlsWasm from '@cornerstonejs/codec-charls/decodewasm?inline';
import libjpegTurboWasm from '@cornerstonejs/codec-libjpeg-turbo-8bit/decodewasm?inline';
import openjpegWasm from '@cornerstonejs/codec-openjpeg/decodewasm?inline';
import openjphWasm from '@cornerstonejs/codec-openjph/wasm?inline';
import { WASM_URLS } from '@vitessce/radiology-workers/decoders';
import { decodeFrame } from './codecs.js';
import {
  CODEC_FIXTURES, CODEC_FIXTURE_SHAPE, JPEG_BASELINE_FIXTURES,
} from './codecs.test.fixtures.js';

const EXPECTED = Array.from({ length: 35 }, (_, i) => (i * 97) % 4096);

// Serve the codec .wasm files from node_modules (as data URLs) instead of the CDN.
const LOCAL_WASM: Record<string, string> = {
  [WASM_URLS.charls]: charlsWasm,
  [WASM_URLS.libjpegturbo]: libjpegTurboWasm,
  [WASM_URLS.openjpeg]: openjpegWasm,
  [WASM_URLS.openjph]: openjphWasm,
};

function fromBase64(base64: string) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

const COLOR_SHAPE = {
  rows: 1,
  columns: 2,
  bitsAllocated: 8,
  samplesPerPixel: 3,
  planarConfiguration: 0,
  photometricInterpretation: 'RGB',
};
const EXPLICIT_VR_LITTLE_ENDIAN = '1.2.840.10008.1.2.1';

async function decodeColor(transferSyntax: string, bytes: number[], shape = {}) {
  const decoded = await decodeFrame(
    transferSyntax, new Uint8Array(bytes), { ...COLOR_SHAPE, ...shape },
  );
  return Array.from(new Uint8Array(decoded));
}

describe('decodeFrame', () => {
  beforeAll(() => {
    // Decode on this thread: the jsdom-worker test polyfill cannot run inline workers.
    vi.stubGlobal('Worker', undefined);
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

  it('decodes 8-bit JPEG Baseline', async () => {
    const { base64, decoded } = JPEG_BASELINE_FIXTURES.gray;
    const shape = { ...CODEC_FIXTURE_SHAPE, bitsAllocated: 8 };
    const result = await decodeFrame('1.2.840.10008.1.2.4.50', fromBase64(base64), shape);
    expect(Array.from(new Uint8Array(result))).toEqual(decoded);
  });

  it('decodes color JPEG Baseline into RGB planes', async () => {
    const { base64, decoded } = JPEG_BASELINE_FIXTURES.color;
    // libjpeg-turbo converts YCbCr to RGB, so the colors are not converted again.
    const shape = {
      rows: 2, columns: 4, photometricInterpretation: 'YBR_FULL_422',
    };
    const result = await decodeColor(
      '1.2.840.10008.1.2.4.50', Array.from(fromBase64(base64)), shape,
    );
    const planes = [0, 1, 2].flatMap(c => decoded.filter((_, i) => i % 3 === c));
    expect(result).toEqual(planes);
  });

  it('keeps RGB samples of JPEG without a color transform marker', async () => {
    const { base64, decoded } = JPEG_BASELINE_FIXTURES.rgb;
    const shape = { rows: 2, columns: 4, photometricInterpretation: 'RGB' };
    const result = await decodeColor(
      '1.2.840.10008.1.2.4.50', Array.from(fromBase64(base64)), shape,
    );
    const planes = [0, 1, 2].flatMap(c => decoded.filter((_, i) => i % 3 === c));
    expect(result).toEqual(planes);
  });

  it('rejects 12-bit lossy JPEG', async () => {
    await expect(decodeFrame('1.2.840.10008.1.2.4.51', new Uint8Array(4), CODEC_FIXTURE_SHAPE))
      .rejects.toThrow('Only 8-bit lossy JPEG is supported');
  });

  it('splits interleaved RGB samples into planes', async () => {
    expect(await decodeColor(EXPLICIT_VR_LITTLE_ENDIAN, [1, 2, 3, 4, 5, 6]))
      .toEqual([1, 4, 2, 5, 3, 6]);
    const planar = { planarConfiguration: 1 };
    expect(await decodeColor(EXPLICIT_VR_LITTLE_ENDIAN, [1, 4, 2, 5, 3, 6], planar))
      .toEqual([1, 4, 2, 5, 3, 6]);
  });

  it('converts YBR_FULL to RGB', async () => {
    // Pure red, then mid gray, as Y, Cb, Cr.
    const ybr = [76, 85, 255, 128, 128, 128];
    expect(await decodeColor(EXPLICIT_VR_LITTLE_ENDIAN, ybr, { photometricInterpretation: 'YBR_FULL' }))
      .toEqual([254, 128, 0, 128, 0, 128]);
  });

  it('decodes color RLE with a segment per sample', async () => {
    const header = new DataView(new ArrayBuffer(64));
    header.setUint32(0, 3, true);
    [64, 67, 70].forEach((offset, i) => header.setUint32(4 + 4 * i, offset, true));
    // Each segment is a literal run (header 1) of two bytes.
    const segments = [1, 10, 20, 1, 30, 40, 1, 50, 60];
    expect(await decodeColor('1.2.840.10008.1.2.5', [...new Uint8Array(header.buffer), ...segments]))
      .toEqual([10, 20, 30, 40, 50, 60]);
  });

  it('rejects unsupported transfer syntaxes', async () => {
    // MPEG-4 AVC/H.264
    await expect(decodeFrame('1.2.840.10008.1.2.4.102', new Uint8Array(4), CODEC_FIXTURE_SHAPE))
      .rejects.toThrow('1.2.840.10008.1.2.4.102 is not supported');
  });
});
