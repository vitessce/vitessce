/**
 * Aggregates multiple arrays of numbers into a single array using a specified strategy.
 *
 * This function aggregates element-wise across all input arrays.
 *
 * @param {Array<Array<number>>} arrays - List of arrays to aggregate (e.g., multiple gene expression arrays).
 * @param {string|number} strategy - Aggregation method:
 * - 'first', 'last', or number: Selects a specific array.
 * - 'sum', 'mean': Mathematical aggregation.
 * - 'difference': Subtracts the second array from the first (requires exactly 2 arrays).
 * @returns {Array<number>|null} - The aggregated array or null on error/empty input.
 */
export function aggregateFeatureArrays(
  arrays: Array<Array<number>>,
  strategy: string | number
) {
  if (!arrays || arrays.length === 0) return null;

  // Check these first to avoid any setup overhead for simple lookups.
  let targetArray: number[] | undefined;

  if (strategy === 'first' || (typeof strategy === 'number' && strategy === 0)) {
    targetArray = arrays[0];
  } else if (strategy === 'last') {
    targetArray = arrays[arrays.length - 1];
  } else if (typeof strategy === 'number') {
    targetArray = arrays[strategy] || arrays[0];
  }

  // If a selection strategy was matched, return the array immediately
  if (targetArray) {
    return targetArray;
  }

  const numArrays = arrays.length;
  const length = arrays[0].length;

  // Validate lengths match for element-wise operations
  if (arrays.some(arr => arr.length !== length)) {
    console.error('All arrays must have the same length for aggregation.');
    return null;
  }

  if (strategy === 'sum' || strategy === 'mean') {
    const resultArray = new Float64Array(length);

    for (let i = 0; i < numArrays; i++) {
      const arr = arrays[i];
      for (let j = 0; j < length; j++) {
        resultArray[j] += arr[j];
      }
    }

    if (strategy === 'mean') {
      for (let i = 0; i < length; i++) {
        resultArray[i] /= numArrays;
      }
    }

    return Array.from(resultArray);
  }

  else if (strategy === 'difference') {
    if (numArrays !== 2) {
      console.warn('Difference strategy requires exactly 2 arrays.');
      return arrays[0];
    }

    const arr0 = arrays[0];
    const arr1 = arrays[1];
    const resultArray = new Float64Array(length);

    for (let i = 0; i < length; i++) {
      resultArray[i] = arr0[i] - arr1[i];
    }

    return Array.from(resultArray);
  }

  console.error(`Unknown aggregation strategy: ${strategy}`);
  return null;
}
