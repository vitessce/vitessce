/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { isEqual } from 'lodash-es';

/** @import AnnDataSource from '../AnnDataSource.js' */

/**
 * Do two pairs of paths contain the same two elements,
 * potentially swapped in their order?
 * @param {[string[], string[]]} pathPairA A pair of paths like
 * [["Disease", "Healthy"], ["Disease", "CKD"]]
 * @param {[string[], string[]]} pathPairB A pair of paths like
 * [["Disease", "CKD"], ["Disease", "Healthy"]]
 * @returns {boolean} Whether the two pairs contain the same two paths.
 */
export function isEqualPathPair(pathPairA, pathPairB) {
  return (
    (isEqual(pathPairA[0], pathPairB[0]) && isEqual(pathPairA[1], pathPairB[1]))
    || (isEqual(pathPairA[0], pathPairB[1]) && isEqual(pathPairA[1], pathPairB[0]))
  );
}

/**
 * Does the sampleSetFilter of a comparison result match the
 * currently-selected sample sets?
 * - No sample sets selected (comparing across all samples):
 *   only results without a sampleSetFilter match.
 * - One sample set selected (comparing within the samples of one group):
 *   only results filtered to exactly that sample set match.
 * - Two sample sets selected (comparing two groups):
 *   only results filtered to exactly that pair match, in either order.
 * @param {string[][]|null|undefined} sampleSetSelection The selected
 * sample set paths (using the "raw" column names), or null.
 * @param {string[][]|null|undefined} sampleSetFilter The sampleSetFilter
 * from the comparison result's coordination_values.
 * @returns {boolean} Whether the result matches the selection.
 */
export function isMatchingSampleSetFilter(sampleSetSelection, sampleSetFilter) {
  const numSelected = Array.isArray(sampleSetSelection) ? sampleSetSelection.length : 0;
  const numFiltered = Array.isArray(sampleSetFilter) ? sampleSetFilter.length : 0;
  if (numSelected !== numFiltered) {
    return false;
  }
  if (numSelected === 0) {
    return true;
  }
  if (numSelected === 1) {
    return isEqual(sampleSetSelection[0], sampleSetFilter[0]);
  }
  if (numSelected === 2) {
    return isEqualPathPair(sampleSetSelection, sampleSetFilter);
  }
  return false;
}

/**
 * @param {AnnDataSource} dataSource
 * @param {string} metadataPath
 * @returns {Promise<any>}
 */
export async function loadComparisonMetadata(dataSource, metadataPath) {
  // eslint-disable-next-line no-underscore-dangle
  const metadata = JSON.parse(await dataSource._loadString(metadataPath));
  if (!(metadata.schema_version === '0.0.1' || metadata.schema_version === '0.0.2')) {
    throw new Error('Unsupported comparison_metadata schema version.');
  }
  return metadata;
}
