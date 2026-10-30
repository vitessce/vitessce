declare module '@vitessce/radiology-workers' {
  export const DecodeWorker: new () => Worker;
}

declare module '@vitessce/radiology-workers/decoders' {
  export const UNCOMPRESSED_TRANSFER_SYNTAXES: string[];
  export const WASM_URLS: Record<'charls' | 'openjpeg' | 'openjph', string>;
  export function isSupportedTransferSyntax(transferSyntax: string): boolean;
  export function decodeFrame(
    transferSyntax: string,
    bytes: Uint8Array,
    shape: { rows: number; columns: number; bitsAllocated: number },
  ): Promise<ArrayBuffer>;
}

// Tests import codec .wasm files as data URLs.
declare module '*wasm?inline' {
  const dataUrl: string;
  export default dataUrl;
}
