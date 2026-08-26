import { ObsSetsWorker, packStrings } from '@vitessce/workers';
import { treeToLeafSets, treeToMembershipMap, getObsIndexMap } from './cell-set-utils.js';

// Built membership encodings, keyed weakly by the set tree they came from, so that
// repeated loader invocations and multiple views over one tree share the result.
const membershipCache = new WeakMap();

/**
 * Run a task on a fresh obs sets worker.
 * @param {object} payload The message payload.
 * @param {Transferable[]} transfers Buffers to transfer rather than copy.
 * @returns {Promise<object>} The worker's reply.
 */
function runInWorker(payload, transfers) {
  return new Promise((resolve, reject) => {
    let worker;
    try {
      worker = new ObsSetsWorker();
    } catch (e) {
      // No worker support, or the bundle could not construct one.
      reject(e);
      return;
    }
    const settle = (fn, value) => {
      worker.terminate();
      fn(value);
    };
    worker.onmessage = (event) => {
      if (event.data?.error) {
        settle(reject, new Error(event.data.error));
      } else {
        settle(resolve, event.data);
      }
    };
    worker.onerror = e => settle(reject, e);
    worker.postMessage(['buildMembership', payload], transfers);
  });
}

/**
 * Run a callback when the main thread is next idle.
 * @param {Function} callback The callback to run.
 */
function whenIdle(callback) {
  if (typeof requestIdleCallback === 'function') {
    // The timeout bounds how long a busy page can defer this. The result is only
    // needed once a tooltip is shown, so it does not need to be prompt.
    requestIdleCallback(callback, { timeout: 5000 });
  } else {
    setTimeout(callback, 0);
  }
}

/**
 * Get an observation-ID-to-set-paths lookup that avoids blocking the main thread.
 *
 * The encoding is built in a worker and returned as transferable typed arrays, so
 * neither the set tree nor a per-observation Map is ever serialized across the
 * worker boundary. Packing and dispatch are deferred to idle time, and until the
 * worker replies, lookups fall back to building the map synchronously — so this is
 * never less correct than doing the work eagerly, only less costly.
 *
 * @param {object} currTree A tree object.
 * @param {string[]} [obsIndex] The observation index to align the encoding to. When
 * omitted, no worker is used and the map is built lazily on the main thread.
 * @returns {{ get: Function, has: Function, size: number }} A Map-like lookup
 * exposing the subset of the Map interface that consumers use.
 */
export function lazyTreeToMembershipMap(currTree, obsIndex = undefined) {
  let state = currTree ? membershipCache.get(currTree) : undefined;
  if (!state) {
    state = { csr: null, leafSets: null, syncMap: null, dispatched: false };
    if (currTree) {
      membershipCache.set(currTree, state);
    }
  }

  function getSyncMap() {
    if (!state.syncMap) {
      state.syncMap = treeToMembershipMap(currTree);
    }
    return state.syncMap;
  }

  function dispatchToWorker() {
    if (state.dispatched || state.csr || !currTree || !obsIndex?.length) {
      return;
    }
    state.dispatched = true;
    whenIdle(() => {
      if (state.csr || state.syncMap) {
        // Already answered synchronously, so the worker would be wasted effort.
        return;
      }
      let payload;
      let transfers;
      try {
        const leafSets = treeToLeafSets(currTree);
        const setSizes = new Uint32Array(leafSets.length);
        const setObsIds = [];
        leafSets.forEach(({ set }, i) => {
          setSizes[i] = set.length;
          set.forEach(([obsId]) => setObsIds.push(obsId));
        });
        const obsIndexBuffer = packStrings(obsIndex);
        const setObsIdsBuffer = packStrings(setObsIds);
        payload = { obsIndexBuffer, setObsIdsBuffer, setSizes };
        transfers = [obsIndexBuffer.buffer, setObsIdsBuffer.buffer];
        state.leafSets = leafSets;
      } catch (e) {
        // Fall back to the synchronous path on the next lookup.
        return;
      }
      runInWorker(payload, transfers).then(({ offsets, setIds }) => {
        // Observations that are in a set but missing from obsIndex cannot be
        // represented positionally. Rather than answer for them incorrectly, keep
        // using the synchronous map.
        let expected = 0;
        payload.setSizes.forEach((n) => { expected += n; });
        if (setIds.length === expected) {
          state.csr = { offsets, setIds };
        }
      }).catch(() => {
        // Worker unavailable or failed; the synchronous path still answers.
      });
    });
  }

  dispatchToWorker();

  function get(obsId) {
    const { csr, leafSets } = state;
    if (csr && leafSets) {
      const obsI = getObsIndexMap(obsIndex).get(obsId);
      if (obsI === undefined) {
        return undefined;
      }
      const start = csr.offsets[obsI];
      const end = csr.offsets[obsI + 1];
      if (start === end) {
        return undefined;
      }
      const paths = new Array(end - start);
      for (let i = start; i < end; i += 1) {
        paths[i - start] = leafSets[csr.setIds[i]].path;
      }
      return paths;
    }
    if (!currTree) {
      return undefined;
    }
    return getSyncMap().get(obsId);
  }

  return {
    get,
    has: obsId => get(obsId) !== undefined,
    get size() {
      const { csr } = state;
      if (csr) {
        let count = 0;
        for (let i = 0; i < csr.offsets.length - 1; i += 1) {
          if (csr.offsets[i + 1] > csr.offsets[i]) {
            count += 1;
          }
        }
        return count;
      }
      return currTree ? getSyncMap().size : 0;
    },
  };
}
