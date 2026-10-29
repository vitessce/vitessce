// The Cornerstone codec packages are Emscripten modules without type declarations.
// Matches their JS entry points, such as '@cornerstonejs/codec-charls/decodewasmjs'.
declare module '@cornerstonejs/codec-*js' {
  const factory: (options: { wasmBinary: ArrayBuffer }) => Promise<
    Record<string, new () => {
      getEncodedBuffer(length: number): Uint8Array;
      decode(): void;
      getDecodedBuffer(): Uint8Array;
      delete(): void;
    }>
  >;
  export default factory;
}

// jpeg-lossless-decoder-js 2.1.2 points "types" at a file it does not publish.
declare module 'jpeg-lossless-decoder-js' {
  export class Decoder {
    decode(
      buffer: ArrayBuffer, offset: number, length: number, numBytes: number,
    ): Uint8Array | Uint16Array;
  }
}

// Tests import codec .wasm files as data URLs.
declare module '*wasm?inline' {
  const dataUrl: string;
  export default dataUrl;
}
