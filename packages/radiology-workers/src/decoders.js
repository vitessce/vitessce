/* eslint-disable no-plusplus, no-bitwise */
// ESLint's import resolver does not support package exports, such as '.../decodewasmjs'.
/* eslint-disable import/no-unresolved */

/**
 * @typedef {{
 *   rows: number,
 *   columns: number,
 *   bitsAllocated: number,
 *   samplesPerPixel?: number,
 *   planarConfiguration?: number,
 *   photometricInterpretation?: string,
 * }} FrameShape
 */

const EXPLICIT_VR_BIG_ENDIAN = '1.2.840.10008.1.2.2';

export const UNCOMPRESSED_TRANSFER_SYNTAXES = [
  '1.2.840.10008.1.2', // Implicit VR Little Endian
  '1.2.840.10008.1.2.1', // Explicit VR Little Endian
  EXPLICIT_VR_BIG_ENDIAN, // Retired, but found in older archives
];

// The codec .wasm files are fetched at runtime rather than bundled,
// like parquet-wasm, since bundlers handle .wasm inconsistently.
// Versions must match the pnpm-workspace.yaml catalog.
// TODO: host these on cdn.vitessce.io by adding the packages to scripts/sync-cdn.mjs.
export const WASM_URLS = {
  charls: 'https://cdn.jsdelivr.net/npm/@cornerstonejs/codec-charls@1.2.7/dist/charlswasm_decode.wasm',
  libjpegturbo: 'https://cdn.jsdelivr.net/npm/@cornerstonejs/codec-libjpeg-turbo-8bit@1.2.8/dist/libjpegturbowasm_decode.wasm',
  openjpeg: 'https://cdn.jsdelivr.net/npm/@cornerstonejs/codec-openjpeg@1.3.6/dist/openjpegwasm_decode.wasm',
  openjph: 'https://cdn.jsdelivr.net/npm/@cornerstonejs/codec-openjph@2.4.11/dist/openjphjs.wasm',
};

const wasmModules = new Map();

/**
 * Load an Emscripten codec module, fetching its .wasm file on first use.
 * @param {keyof typeof WASM_URLS} name
 * @param {() => Promise<{ default: Function }>} importFactory
 */
function loadWasmModule(name, importFactory) {
  let wasmModule = wasmModules.get(name);
  if (!wasmModule) {
    const wasmBinary = fetch(WASM_URLS[name]).then((res) => {
      if (!res.ok) {
        throw new Error(`Image codec failed to load: ${res.status} from ${res.url}`);
      }
      return res.arrayBuffer();
    });
    wasmModule = Promise.all([importFactory(), wasmBinary])
      .then(([{ default: factory }, binary]) => factory({ wasmBinary: binary }));
    // Allow a failed load to be retried.
    wasmModule.catch(() => wasmModules.delete(name));
    wasmModules.set(name, wasmModule);
  }
  return wasmModule;
}

async function decodeWithWasm(wasmModule, className, bytes) {
  const decoder = new (await wasmModule)[className]();
  try {
    decoder.getEncodedBuffer(bytes.length).set(bytes);
    decoder.decode();
    return {
      // Copy out of WASM memory before the decoder frees it.
      buffer: decoder.getDecodedBuffer().slice().buffer,
      // Color samples are interleaved, except in JPEG-LS frames without interleaving (mode 0).
      isPlanar: decoder.getInterleaveMode?.() === 0,
    };
  } finally {
    decoder.delete();
  }
}

/**
 * Decode DICOM RLE Lossless (PS3.5 Annex G). Each byte of each sample is stored in
 * its own PackBits-compressed segment, most significant byte first.
 * Returns a plane per sample, with little-endian values.
 * @param {Uint8Array} bytes
 * @param {FrameShape} shape
 * @returns {ArrayBuffer}
 */
export function decodeRle(bytes, {
  rows, columns, bitsAllocated, samplesPerPixel = 1,
}) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const bytesPerSample = bitsAllocated / 8;
  const numSegments = view.getUint32(0, true);
  if (numSegments !== bytesPerSample * samplesPerPixel) {
    throw new Error(`RLE frames with ${numSegments} segments are not supported.`);
  }
  const planeLength = rows * columns * bytesPerSample;
  const out = new Uint8Array(planeLength * samplesPerPixel);
  for (let segment = 0; segment < numSegments; segment++) {
    const start = view.getUint32(4 + 4 * segment, true);
    const end = segment + 1 < numSegments ? view.getUint32(8 + 4 * segment, true) : bytes.length;
    // Values are little-endian, so the first segment of a sample fills its last byte.
    const plane = Math.floor(segment / bytesPerSample);
    let outIndex = plane * planeLength + bytesPerSample - 1 - (segment % bytesPerSample);
    const planeEnd = (plane + 1) * planeLength;
    let i = start;
    while (i < end && outIndex < planeEnd) {
      const header = (bytes[i++] << 24) >> 24;
      if (header >= 0) {
        // Copy the next header + 1 bytes literally.
        for (let k = 0; k <= header; k++, outIndex += bytesPerSample) {
          out[outIndex] = bytes[i++];
        }
      } else if (header > -128) {
        // Repeat the next byte 1 - header times.
        const value = bytes[i++];
        for (let k = 0; k < 1 - header; k++, outIndex += bytesPerSample) {
          out[outIndex] = value;
        }
      }
    }
  }
  return out.buffer;
}

const ARRAY_TYPES = { 1: Uint8Array, 2: Uint16Array, 4: Uint32Array };

/**
 * Split interleaved samples (RGBRGB...) into a plane per sample (RR...GG...BB...).
 * @param {ArrayBuffer} buffer
 * @param {number} samplesPerPixel
 * @param {number} bytesPerSample
 * @returns {ArrayBuffer}
 */
function toPlanes(buffer, samplesPerPixel, bytesPerSample) {
  const ArrayType = ARRAY_TYPES[bytesPerSample];
  const interleaved = new ArrayType(buffer);
  const planes = new ArrayType(interleaved.length);
  const numPixels = interleaved.length / samplesPerPixel;
  for (let i = 0; i < numPixels; i++) {
    for (let sample = 0; sample < samplesPerPixel; sample++) {
      planes[sample * numPixels + i] = interleaved[i * samplesPerPixel + sample];
    }
  }
  return planes.buffer;
}

/**
 * Convert 8-bit YBR_FULL planes (Y, Cb, Cr) to RGB planes in place,
 * as defined in DICOM PS3.3 C.7.6.3.1.2.
 * @param {ArrayBuffer} buffer
 */
function ybrToRgb(buffer) {
  // A clamped array rounds and clamps assigned values to 0 to 255.
  const planes = new Uint8ClampedArray(buffer);
  const numPixels = planes.length / 3;
  for (let i = 0; i < numPixels; i++) {
    const y = planes[i];
    const cb = planes[numPixels + i] - 128;
    const cr = planes[2 * numPixels + i] - 128;
    planes[i] = y + 1.402 * cr;
    planes[numPixels + i] = y - 0.344136 * cb - 0.714136 * cr;
    planes[2 * numPixels + i] = y + 1.772 * cb;
  }
}

/**
 * Reverse the bytes of each value, in place.
 * @param {ArrayBuffer} buffer
 * @param {number} bytesPerValue
 */
function swapBytes(buffer, bytesPerValue) {
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += bytesPerValue) {
    for (let a = i, b = i + bytesPerValue - 1; a < b; a++, b--) {
      const byte = bytes[a];
      bytes[a] = bytes[b];
      bytes[b] = byte;
    }
  }
}

// APP14 "Adobe" marker segment: version 100, no flags, color transform 0 (none).
const ADOBE_NO_TRANSFORM = [
  0xFF, 0xEE, 0, 14, 0x41, 0x64, 0x6F, 0x62, 0x65, 0, 100, 0, 0, 0, 0, 0,
];

/**
 * libjpeg-turbo decodes 3-component JPEG without a JFIF (APP0) or Adobe (APP14) marker
 * as YCbCr. For images that DICOM says are RGB, insert an Adobe marker without a color
 * transform, so that the samples are kept as stored.
 * @param {Uint8Array} bytes
 * @returns {Uint8Array}
 */
function withRgbMarker(bytes) {
  // After the start-of-image marker, each segment has a marker and a 2-byte length.
  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xFF && bytes[offset + 1] !== 0xDA) {
    if (bytes[offset + 1] === 0xE0 || bytes[offset + 1] === 0xEE) {
      return bytes;
    }
    offset += 2 + bytes[offset + 2] * 256 + bytes[offset + 3];
  }
  const out = new Uint8Array(bytes.length + ADOBE_NO_TRANSFORM.length);
  out.set(bytes.subarray(0, 2));
  out.set(ADOBE_NO_TRANSFORM, 2);
  out.set(bytes.subarray(2), 2 + ADOBE_NO_TRANSFORM.length);
  return out;
}

// Each decoder returns the decoded buffer, and whether its color samples are in planes.
const DECODERS = {
  jpegBaseline: (bytes, { bitsAllocated, photometricInterpretation }) => {
    if (bitsAllocated !== 8) {
      throw new Error('Only 8-bit lossy JPEG is supported.');
    }
    return decodeWithWasm(
      loadWasmModule('libjpegturbo', () => import('@cornerstonejs/codec-libjpeg-turbo-8bit/decodewasmjs')),
      'JPEGDecoder',
      photometricInterpretation === 'RGB' ? withRgbMarker(bytes) : bytes,
    );
  },
  jpegLs: bytes => decodeWithWasm(
    loadWasmModule('charls', () => import('@cornerstonejs/codec-charls/decodewasmjs')),
    'JpegLSDecoder',
    bytes,
  ),
  jpeg2000: bytes => decodeWithWasm(
    loadWasmModule('openjpeg', () => import('@cornerstonejs/codec-openjpeg/decodewasmjs')),
    'J2KDecoder',
    bytes,
  ),
  htj2k: bytes => decodeWithWasm(
    loadWasmModule('openjph', () => import('@cornerstonejs/codec-openjph/wasmjs')),
    'HTJ2KDecoder',
    bytes,
  ),
  jpegLossless: async (bytes, { bitsAllocated }) => {
    const { Decoder } = await import('jpeg-lossless-decoder-js');
    const decoded = new Decoder()
      .decode(bytes.buffer, bytes.byteOffset, bytes.length, bitsAllocated / 8);
    return { buffer: decoded.buffer, isPlanar: false };
  },
  rle: async (bytes, shape) => ({ buffer: decodeRle(bytes, shape), isPlanar: true }),
};

// Compressed transfer syntaxes (DICOM PS3.5 Section 10) and their decoders.
const CODECS = {
  '1.2.840.10008.1.2.4.50': 'jpegBaseline', // JPEG Baseline (Process 1)
  '1.2.840.10008.1.2.4.51': 'jpegBaseline', // JPEG Extended (Process 2 & 4), 8-bit only
  '1.2.840.10008.1.2.4.57': 'jpegLossless', // JPEG Lossless, Non-Hierarchical (Process 14)
  '1.2.840.10008.1.2.4.70': 'jpegLossless', // JPEG Lossless, First-Order Prediction
  '1.2.840.10008.1.2.4.80': 'jpegLs', // JPEG-LS Lossless
  '1.2.840.10008.1.2.4.81': 'jpegLs', // JPEG-LS Near-Lossless
  '1.2.840.10008.1.2.4.90': 'jpeg2000', // JPEG 2000 Lossless
  '1.2.840.10008.1.2.4.91': 'jpeg2000', // JPEG 2000
  '1.2.840.10008.1.2.4.201': 'htj2k', // HTJ2K Lossless
  '1.2.840.10008.1.2.4.202': 'htj2k', // HTJ2K Lossless RPCL
  '1.2.840.10008.1.2.4.203': 'htj2k', // HTJ2K
  '1.2.840.10008.1.2.5': 'rle', // RLE Lossless
};

/**
 * @param {string} transferSyntax
 * @returns {boolean}
 */
export function isSupportedTransferSyntax(transferSyntax) {
  return UNCOMPRESSED_TRANSFER_SYNTAXES.includes(transferSyntax) || transferSyntax in CODECS;
}

/**
 * Decode one frame of pixel data into little-endian pixel values.
 * Color frames are returned as RGB, with a plane per sample.
 * Codecs are loaded on first use.
 * @param {string} transferSyntax
 * @param {Uint8Array} bytes
 * @param {FrameShape} shape
 * @returns {Promise<ArrayBuffer>}
 */
export async function decodeFrame(transferSyntax, bytes, shape) {
  const {
    rows, columns, bitsAllocated, samplesPerPixel = 1, planarConfiguration = 0,
    photometricInterpretation = '',
  } = shape;
  const bytesPerSample = bitsAllocated / 8;
  const frameLength = rows * columns * samplesPerPixel * bytesPerSample;
  const codec = CODECS[transferSyntax];
  if (!codec && !UNCOMPRESSED_TRANSFER_SYNTAXES.includes(transferSyntax)) {
    throw new Error(`DICOM transfer syntax ${transferSyntax} is not supported.`);
  }
  if (!codec && photometricInterpretation === 'YBR_FULL_422') {
    // Uncompressed YBR_FULL_422 stores two lumas per chroma pair.
    throw new Error('Uncompressed YBR_FULL_422 images are not supported.');
  }
  const { buffer, isPlanar } = codec
    ? await DECODERS[codec](bytes, shape)
    : { buffer: bytes.slice(0, frameLength).buffer, isPlanar: planarConfiguration === 1 };
  if (buffer.byteLength < frameLength) {
    throw new Error(`A ${transferSyntax} frame has ${buffer.byteLength} bytes; expected ${frameLength}.`);
  }
  let decoded = buffer.byteLength === frameLength ? buffer : buffer.slice(0, frameLength);
  if (transferSyntax === EXPLICIT_VR_BIG_ENDIAN) {
    swapBytes(decoded, bytesPerSample);
  }
  if (samplesPerPixel > 1 && !isPlanar) {
    decoded = toPlanes(decoded, samplesPerPixel, bytesPerSample);
  }
  // libjpeg-turbo converts YCbCr to RGB itself. The other decoders keep the stored colors.
  if (photometricInterpretation.startsWith('YBR_FULL') && codec !== 'jpegBaseline') {
    ybrToRgb(decoded);
  }
  return decoded;
}
