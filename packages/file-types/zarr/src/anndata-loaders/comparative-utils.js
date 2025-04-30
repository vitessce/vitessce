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
