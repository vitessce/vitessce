/* eslint-disable no-plusplus, no-bitwise */

export const UNCOMPRESSED_TRANSFER_SYNTAXES = [
  '1.2.840.10008.1.2', // Implicit VR Little Endian
  '1.2.840.10008.1.2.1', // Explicit VR Little Endian
];

// The codec .wasm files are fetched at runtime rather than bundled,
// like parquet-wasm, since bundlers handle .wasm inconsistently.
// Versions must match the pnpm-workspace.yaml catalog.
// TODO: host these on cdn.vitessce.io by adding the packages to scripts/sync-cdn.mjs.
export const WASM_URLS = {
  charls: 'https://cdn.jsdelivr.net/npm/@cornerstonejs/codec-charls@1.2.7/dist/charlswasm_decode.wasm',
  openjpeg: 'https://cdn.jsdelivr.net/npm/@cornerstonejs/codec-openjpeg@1.3.6/dist/openjpegwasm_decode.wasm',
  openjph: 'https://cdn.jsdelivr.net/npm/@cornerstonejs/codec-openjph@2.4.11/dist/openjphjs.wasm',
};

interface FrameShape {
  rows: number;
  columns: number;
  bitsAllocated: number;
}

interface WasmDecoder {
  getEncodedBuffer(length: number): Uint8Array;
  decode(): void;
  getDecodedBuffer(): Uint8Array;
  delete(): void;
}

type WasmModule = Record<string, new () => WasmDecoder>;
type WasmFactory = (options: { wasmBinary: ArrayBuffer }) => Promise<WasmModule>;

const wasmModules = new Map<keyof typeof WASM_URLS, Promise<WasmModule>>();

function loadWasmModule(
  name: keyof typeof WASM_URLS,
  importFactory: () => Promise<{ default: WasmFactory }>,
) {
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

async function decodeWithWasm(
  wasmModule: Promise<WasmModule>,
  className: string,
  bytes: Uint8Array,
) {
  const decoder = new (await wasmModule)[className]();
  try {
    decoder.getEncodedBuffer(bytes.length).set(bytes);
    decoder.decode();
    // Copy out of WASM memory before the decoder frees it.
    return decoder.getDecodedBuffer().slice().buffer;
  } finally {
    decoder.delete();
  }
}

/**
 * Decode DICOM RLE Lossless (PS3.5 Annex G). Each byte of a pixel is stored in
 * its own PackBits-compressed segment, most significant byte first.
 */
export function decodeRle(bytes: Uint8Array, { rows, columns, bitsAllocated }: FrameShape) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const bytesPerPixel = bitsAllocated / 8;
  const numSegments = view.getUint32(0, true);
  if (numSegments !== bytesPerPixel) {
    throw new Error(`RLE frames with ${numSegments} segments are not supported.`);
  }
  const out = new Uint8Array(rows * columns * bytesPerPixel);
  for (let segment = 0; segment < numSegments; segment++) {
    const start = view.getUint32(4 + 4 * segment, true);
    const end = segment + 1 < numSegments ? view.getUint32(8 + 4 * segment, true) : bytes.length;
    // Output pixels are little-endian, so the first segment fills the last byte of each pixel.
    let outIndex = bytesPerPixel - 1 - segment;
    let i = start;
    while (i < end && outIndex < out.length) {
      const header = (bytes[i++] << 24) >> 24;
      if (header >= 0) {
        // Copy the next header + 1 bytes literally.
        for (let k = 0; k <= header; k++, outIndex += bytesPerPixel) {
          out[outIndex] = bytes[i++];
        }
      } else if (header > -128) {
        // Repeat the next byte 1 - header times.
        const value = bytes[i++];
        for (let k = 0; k < 1 - header; k++, outIndex += bytesPerPixel) {
          out[outIndex] = value;
        }
      }
    }
  }
  return out.buffer;
}

const DECODERS = {
  jpegLs: (bytes: Uint8Array) => decodeWithWasm(
    loadWasmModule('charls', () => import('@cornerstonejs/codec-charls/decodewasmjs')),
    'JpegLSDecoder',
    bytes,
  ),
  jpeg2000: (bytes: Uint8Array) => decodeWithWasm(
    loadWasmModule('openjpeg', () => import('@cornerstonejs/codec-openjpeg/decodewasmjs')),
    'J2KDecoder',
    bytes,
  ),
  htj2k: (bytes: Uint8Array) => decodeWithWasm(
    loadWasmModule('openjph', () => import('@cornerstonejs/codec-openjph/wasmjs')),
    'HTJ2KDecoder',
    bytes,
  ),
  jpegLossless: async (bytes: Uint8Array, { bitsAllocated }: FrameShape) => {
    const { Decoder } = await import('jpeg-lossless-decoder-js');
    const decoded = new Decoder().decode(
      bytes.buffer as ArrayBuffer, bytes.byteOffset, bytes.length, bitsAllocated / 8,
    );
    return decoded.buffer as ArrayBuffer;
  },
  rle: async (bytes: Uint8Array, shape: FrameShape) => decodeRle(bytes, shape),
};

// Compressed transfer syntaxes (DICOM PS3.5 Section 10) and their decoders.
const CODECS: Record<string, keyof typeof DECODERS> = {
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

export function isSupportedTransferSyntax(transferSyntax: string) {
  return UNCOMPRESSED_TRANSFER_SYNTAXES.includes(transferSyntax) || transferSyntax in CODECS;
}

/**
 * Decode one frame of pixel data into little-endian pixel values.
 * Codecs are loaded on first use.
 * ponytail: decodes on the main thread; move to a worker if 3D loading janks.
 */
export async function decodeFrame(transferSyntax: string, bytes: Uint8Array, shape: FrameShape) {
  const frameLength = shape.rows * shape.columns * (shape.bitsAllocated / 8);
  const codec = CODECS[transferSyntax];
  if (!codec && !UNCOMPRESSED_TRANSFER_SYNTAXES.includes(transferSyntax)) {
    throw new Error(`DICOM transfer syntax ${transferSyntax} is not supported.`);
  }
  const decoded = codec ? await DECODERS[codec](bytes, shape) : bytes.slice(0, frameLength).buffer;
  if (decoded.byteLength < frameLength) {
    throw new Error(`A ${transferSyntax} frame has ${decoded.byteLength} bytes; expected ${frameLength}.`);
  }
  return decoded.byteLength === frameLength ? decoded : decoded.slice(0, frameLength);
}
