/* eslint-disable no-restricted-globals */
import { decodeFrame } from './decoders.js';

/**
 * Decode one frame per message: { transferSyntax, bytes, shape }.
 * Replies with { buffer } (transferred) or { error }.
 */
if (typeof self !== 'undefined') {
  self.addEventListener('message', async (event) => {
    const { transferSyntax, bytes, shape } = event.data;
    try {
      const buffer = await decodeFrame(transferSyntax, bytes, shape);
      self.postMessage({ buffer }, [buffer]);
    } catch (e) {
      self.postMessage({ error: e.message });
    }
  });
}
