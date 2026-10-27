/* eslint-disable prefer-destructuring */
import { extent } from 'd3-array';

/**
 * featureAggregationStrategy values with special meaning.
 * Any other string value is interpreted as a feature name.
 */
export const RESERVED_FEATURE_AGGREGATION_STRATEGIES = [
  'first', 'last', 'sum', 'mean', 'difference',
];

/**
 * Convert a featureAggregationStrategy that refers to a feature by name
 * into the index of that feature within the featureSelection, so that
 * downstream code only needs to handle reserved strings and indices.
 * @param strategy The featureAggregationStrategy coordination value.
 * @param featureSelection The featureSelection coordination value.
 * @returns The strategy with feature names replaced by indices.
 * Falls back to 'first' when the named feature is not
 * (or is no longer) in the featureSelection, or when an
 * index is out of bounds.
 */
export function resolveFeatureAggregationStrategy(
  strategy: string | number | null | undefined,
  featureSelection: string[] | null | undefined,
): string | number | null {
  if (typeof strategy === 'string' && !RESERVED_FEATURE_AGGREGATION_STRATEGIES.includes(strategy)) {
    const featureIndex = featureSelection?.indexOf(strategy) ?? -1;
    return featureIndex >= 0 ? featureIndex : 'first';
  }
  if (
    typeof strategy === 'number'
    && Array.isArray(featureSelection)
    && (strategy < 0 || strategy >= featureSelection.length)
  ) {
    return 'first';
  }
  return strategy ?? null;
}

/**
 * Aggregates multiple arrays of numbers into a single array using a specified strategy.
 *
 * This function aggregates element-wise across all input arrays.
 *
 * @param {Array<Array<number>>} arrays - List of arrays to aggregate
 * (e.g., multiple gene expression arrays).
 * @param {string|number} strategy - Aggregation method:
 * - 'first', 'last', or number: Selects a specific array.
 * - 'sum', 'mean': Mathematical aggregation.
 * - 'difference': Subtracts the second array from the first (requires exactly 2 arrays).
 * @returns {number[]|null} - The aggregated array or null on error/empty input.
 */
export function aggregateFeatureArrays(
  arrays: Array<Array<number>>,
  strategy: string | number,
): number[] | null {
  if (!arrays || arrays.length === 0) return null;

  // Check these first to avoid any setup overhead for simple lookups.
  let targetArray: number[] | undefined;

  if (strategy === 'first' || (typeof strategy === 'number' && strategy === 0)) {
    targetArray = arrays[0];
  } else if (strategy === 'last') {
    targetArray = arrays[arrays.length - 1];
  } else if (typeof strategy === 'number') {
    if (strategy >= 0 && strategy < arrays.length) {
      targetArray = arrays[strategy];
    } else {
      throw new Error(`Array index out of bounds: ${strategy}`);
    }
  }

  // If a selection strategy was matched, return the array immediately
  if (targetArray) {
    return targetArray;
  }

  const numArrays = arrays.length;
  const firstArrayLength = arrays[0].length;

  // Validate lengths match for element-wise operations
  if (arrays.some(arr => arr.length !== firstArrayLength)) {
    throw new Error('All arrays must have the same length for aggregation.');
  }

  if (strategy === 'sum' || strategy === 'mean') {
    const resultArray = new Float64Array(firstArrayLength);

    for (let i = 0; i < numArrays; i++) {
      const arr = arrays[i];
      for (let j = 0; j < firstArrayLength; j++) {
        resultArray[j] += arr[j];
      }
    }

    if (strategy === 'mean') {
      for (let i = 0; i < firstArrayLength; i++) {
        resultArray[i] /= numArrays;
      }
    }

    return Array.from(resultArray);
  }

  if (strategy === 'difference') {
    if (numArrays !== 2) {
      console.warn('Difference strategy requires exactly 2 arrays.');
      return arrays[0];
    }

    const arr0 = arrays[0];
    const arr1 = arrays[1];
    const resultArray = new Float64Array(firstArrayLength);

    for (let i = 0; i < firstArrayLength; i++) {
      resultArray[i] = arr0[i] - arr1[i];
    }

    return Array.from(resultArray);
  }

  throw new Error(`Unknown aggregation strategy: ${strategy}`);
}

export function normalizeAggregatedFeatureArray(
  values: null | number[] | Float32Array | Float64Array,
) {
  if (!values || values.length === 0) {
    return null;
  }
  const [min, max] = extent(values);
  if (min == null || max == null) {
    return null;
  }
  const ratio = max > min ? (255 / (max - min)) : 1;
  const normData = new Uint8Array(values.length);
  for (let i = 0; i < values.length; i += 1) {
    const normalized = max > min ? Math.floor((values[i] - min) * ratio) : 0;
    normData[i] = Number.isFinite(normalized)
      ? Math.max(0, Math.min(255, normalized))
      : 0;
  }
  return { normData, extent: [min, max] };
}

export function filterValidExpressionArrays(
  arrays: null | Array<null | Array<number> | Float32Array | Float64Array>,
) {
  if (!arrays) {
    return [];
  }
  return arrays.filter(arr => (
    arr
    && (Array.isArray(arr) || ArrayBuffer.isView(arr))
    && arr.length > 0
  ));
}
