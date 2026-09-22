// Observation IDs are packed into one string so that a single TextEncoder call can
// produce a transferable buffer. Sending the set tree itself would mean structured-
// cloning millions of small arrays on the calling thread, which costs more than
// building the membership encoding there in the first place.
export const OBS_ID_SEPARATOR = '\n';

/**
 * Pack an array of strings into a transferable buffer.
 * @param {string[]} strings The strings to pack.
 * @returns {Uint8Array} The packed, separator-delimited, UTF-8 encoded bytes.
 */
export function packStrings(strings) {
  return new TextEncoder().encode(strings.join(OBS_ID_SEPARATOR));
}

/**
 * Unpack a buffer produced by packStrings.
 * @param {ArrayBuffer|Uint8Array} buffer The packed bytes.
 * @returns {string[]} The unpacked strings.
 */
export function unpackStrings(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (bytes.byteLength === 0) {
    return [];
  }
  return new TextDecoder().decode(bytes).split(OBS_ID_SEPARATOR);
}

/**
 * Build a CSR-style encoding of which sets each observation belongs to.
 *
 * The result is positional with respect to obsIndex, so it is made entirely of
 * typed arrays and can be transferred back to the main thread without a copy.
 *
 * @param {string[]} obsIndex The observation index to align the result to.
 * @param {string[]} setObsIds The observation IDs of every leaf set, concatenated
 * in set order.
 * @param {Uint32Array|number[]} setSizes The number of observation IDs belonging to
 * each leaf set, in the same order.
 * @returns {{ offsets: Uint32Array, setIds: Uint32Array }} `offsets` has one entry
 * per observation plus a trailing total; the set IDs for observation `i` are
 * `setIds[offsets[i]]` through `setIds[offsets[i + 1] - 1]`, where each set ID
 * indexes into the caller's leaf set list.
 */
export function buildMembershipCsr(obsIndex, setObsIds, setSizes) {
  const numObs = obsIndex.length;
  const obsIndexMap = new Map();
  for (let i = 0; i < numObs; i += 1) {
    obsIndexMap.set(obsIndex[i], i);
  }
  // First pass: count memberships per observation, so the exact output size is
  // known before allocating.
  const offsets = new Uint32Array(numObs + 1);
  for (let i = 0; i < setObsIds.length; i += 1) {
    const obsI = obsIndexMap.get(setObsIds[i]);
    if (obsI !== undefined) {
      offsets[obsI + 1] += 1;
    }
  }
  for (let i = 0; i < numObs; i += 1) {
    offsets[i + 1] += offsets[i];
  }
  // Second pass: place each membership, walking the concatenated IDs set by set.
  const setIds = new Uint32Array(offsets[numObs]);
  const cursor = new Uint32Array(numObs);
  let flatI = 0;
  for (let setI = 0; setI < setSizes.length; setI += 1) {
    const end = flatI + setSizes[setI];
    for (; flatI < end; flatI += 1) {
      const obsI = obsIndexMap.get(setObsIds[flatI]);
      if (obsI !== undefined) {
        setIds[offsets[obsI] + cursor[obsI]] = setI;
        cursor[obsI] += 1;
      }
    }
  }
  return { offsets, setIds };
}

/**
 * Build the membership encoding from packed buffers.
 * @param {object} params
 * @param {ArrayBuffer} params.obsIndexBuffer Packed observation index.
 * @param {ArrayBuffer} params.setObsIdsBuffer Packed concatenated leaf set members.
 * @param {Uint32Array} params.setSizes Size of each leaf set.
 * @returns {{ offsets: Uint32Array, setIds: Uint32Array }} The membership encoding.
 */
export function buildMembershipFromBuffers({ obsIndexBuffer, setObsIdsBuffer, setSizes }) {
  const obsIndex = unpackStrings(obsIndexBuffer);
  const setObsIds = unpackStrings(setObsIdsBuffer);
  let expectedMembers = 0;
  for (let i = 0; i < setSizes.length; i += 1) {
    expectedMembers += setSizes[i];
  }
  if (setObsIds.length !== expectedMembers) {
    // An observation ID containing the separator would silently misalign every
    // membership after it, so refuse rather than return a wrong answer.
    throw new Error(
      `Packed observation IDs did not round-trip: expected ${expectedMembers}, got ${setObsIds.length}.`,
    );
  }
  return buildMembershipCsr(obsIndex, setObsIds, setSizes);
}
