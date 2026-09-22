/* eslint-disable no-restricted-globals */
import { buildMembershipFromBuffers } from './obs-sets.js';

/**
 * Build the observation set membership encoding off the main thread.
 * @param {object} params
 * @param {ArrayBuffer} params.obsIndexBuffer Packed observation index.
 * @param {ArrayBuffer} params.setObsIdsBuffer Packed concatenated leaf set members.
 * @param {Uint32Array} params.setSizes Size of each leaf set.
 * @returns {array} [message, transfers]
 */
function buildMembership(params) {
  const { offsets, setIds } = buildMembershipFromBuffers(params);
  // Transfer rather than copy: these are the only large values crossing back.
  return [{ offsets, setIds }, [offsets.buffer, setIds.buffer]];
}

/**
 * Worker message passing logic.
 */
if (typeof self !== 'undefined') {
  const nameToFunction = {
    buildMembership,
  };

  self.addEventListener('message', (event) => {
    if (Array.isArray(event.data)) {
      const [name, args] = event.data;
      try {
        const [message, transfers] = nameToFunction[name](args);
        self.postMessage(message, transfers);
      } catch (e) {
        // The caller falls back to building on the main thread.
        self.postMessage({ error: e.message });
      }
    }
  });
}
