import { Pool } from '@vitessce/utils';
import {
  UNCOMPRESSED_TRANSFER_SYNTAXES,
  isSupportedTransferSyntax,
  decodeFrame as decodeOnThisThread,
} from '@vitessce/radiology-workers/decoders';

export { UNCOMPRESSED_TRANSFER_SYNTAXES, isSupportedTransferSyntax };

interface FrameShape {
  rows: number;
  columns: number;
  bitsAllocated: number;
}

let pool: Promise<Pool> | undefined;

// Each worker holds its own codec memory, so the pool is kept small.
const POOL_SIZE = 4;

// The worker bundle includes the codecs, so it is only loaded once compressed data appears.
function getPool() {
  pool ??= import('@vitessce/radiology-workers')
    .then(({ DecodeWorker }) => new Pool(() => new DecodeWorker(), POOL_SIZE));
  return pool;
}

/**
 * Decode one frame of pixel data into little-endian pixel values.
 * Compressed frames are decoded in a pool of web workers.
 */
export async function decodeFrame(transferSyntax: string, bytes: Uint8Array, shape: FrameShape) {
  if (UNCOMPRESSED_TRANSFER_SYNTAXES.includes(transferSyntax) || typeof Worker === 'undefined') {
    // Nothing to decode, or no workers (such as in tests).
    return decodeOnThisThread(transferSyntax, bytes, shape);
  }
  const workers = await getPool();
  const worker = await workers.waitForWorker() as Worker;
  // The bytes may be a view of a larger buffer, so transfer a copy.
  const copy = bytes.slice();
  try {
    return await new Promise<ArrayBuffer>((resolve, reject) => {
      // eslint-disable-next-line no-param-reassign
      worker.onmessage = ({ data }) => (
        data.error ? reject(new Error(data.error)) : resolve(data.buffer)
      );
      // eslint-disable-next-line no-param-reassign
      worker.onerror = event => reject(new Error(event.message));
      worker.postMessage({ transferSyntax, bytes: copy, shape }, [copy.buffer]);
    });
  } finally {
    workers.finishTask(worker);
  }
}
