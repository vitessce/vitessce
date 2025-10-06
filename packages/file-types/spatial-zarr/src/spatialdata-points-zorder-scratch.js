
/**
 * Convert Morton intervals to row ranges in a Morton-sorted column.
 * For each Z-interval [zlo, zhi], binary-search in the sorted Morton column
 * and return row index half-open ranges [i, j) to scan.
 * 
 * @param {number[]} mortonSorted - Morton-sorted array
 * @param {Array<[number, number]>} intervals - Morton code intervals
 * @param {boolean} merge - Whether to merge adjacent ranges
 * @returns {[Array<[number, number]>, number[]]} Tuple of [ranges, recordedKeys]
 */
function zqueryRowsAux(mortonSorted, intervals, merge = true) {
  // Keep track of which keys were looked at during the binary searches.
  // This is used for analysis / debugging, for instance, to enable
  // evaluating how many HTTP requests would be needed in network-based case
  // (which will also depend on Arrow row group size).
  const recordedKeys = [];
  const recordKeyCheck = (k) => {
    recordedKeys.push(k);
    return k;
  };

  const ranges = [];
  // TODO: can these multiple binary searches be optimized?
  // Since we are doing many searches in the same array, and in each search we learn where more elements are located.
  for (const [zlo, zhi] of intervals) {
    const i = bisectLeft(mortonSorted, zlo, recordKeyCheck);
    // TODO: use lo=i in bisect_right to limit the search range?
    // TODO: can the second binary search be further optimized since we just did a binary search via bisect_left?
    const j = bisectRight(mortonSorted, zhi, recordKeyCheck);
    if (i < j) {
      ranges.push([i, j]);
    }
  }

  const result = merge ? mergeAdjacent(ranges) : ranges;
  return [result, recordedKeys];
}

/**
 * Convert Morton intervals to row ranges in a Morton-sorted column.
 * For each Z-interval [zlo, zhi], binary-search in the sorted Morton column
 * and return row index half-open ranges [i, j) to scan.
 * 
 * @param {number[]} mortonSorted - Morton-sorted array
 * @param {Array<[number, number]>} intervals - Morton code intervals
 * @param {boolean} merge - Whether to merge adjacent ranges
 * @returns {Array<[number, number]>} Row index ranges
 */
function zqueryRows(mortonSorted, intervals, merge = true) {
  return zqueryRowsAux(mortonSorted, intervals, merge)[0];
}

/**
 * Query a Morton-sorted array for points within a rectangle.
 * @param {number[]} mortonSorted - Morton-sorted array
 * @param {Object} boundingBox - Bounding box with x_min, x_max, y_min, y_max
 * @param {Array<number[]>} origRect - Rectangle coordinates [[x0, y0], [x1, y1]]
 * @returns {Array<[number, number]>} Matching row ranges
 */
function sdataMortonQueryRect(mortonSorted, boundingBox, origRect) {
  const mortonIntervals = sdataMortonQueryRectAux(boundingBox, origRect);

  // morton_sorted is the morton code column as a list of integers

  // Get a list of row ranges that match the morton intervals.
  // (This uses binary searches internally to find the matching row indices).
  // [ [row_start, row_end], ... ]
  const matchingRowRanges = zqueryRows(mortonSorted, mortonIntervals, true);

  return matchingRowRanges;
}

/**
 * Query a Morton-sorted array for points within a rectangle (debug version).
 * This is the same as sdataMortonQueryRect, but also returns the list of
 * row indices that were checked during the binary searches.
 * @param {number[]} mortonSorted - Morton-sorted array
 * @param {Object} boundingBox - Bounding box with x_min, x_max, y_min, y_max
 * @param {Array<number[]>} origRect - Rectangle coordinates [[x0, y0], [x1, y1]]
 * @returns {[Array<[number, number]>, number[]]} Tuple of [matchingRowRanges, rowsChecked]
 */
function sdataMortonQueryRectDebug(mortonSorted, boundingBox, origRect) {
  const mortonIntervals = sdataMortonQueryRectAux(boundingBox, origRect);
  // morton_sorted is the morton code column as a list of integers
  const [matchingRowRanges, rowsChecked] = zqueryRowsAux(mortonSorted, mortonIntervals, true);
  return [matchingRowRanges, rowsChecked];
}




// TODO: implement binary searching to be parquet-row-group-aware
// and cache the min/max Morton codes per row group,
// so that we can skip entire row groups during binary search
// once we have encountered at least one row in the group.


/**
 * Binary search to find the leftmost position where value could be inserted.
 * Equivalent to Python's bisect_left.
 * @param {number[]} arr - Sorted array to search
 * @param {number} value - Value to search for
 * @param {function(number): number} [keyFn] - Optional key function
 * @returns {number} Index where value should be inserted
 */
function bisectLeft(arr, value, keyFn = null) {
  let lo = 0;
  let hi = arr.length;
  
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const midVal = keyFn ? keyFn(arr[mid]) : arr[mid];
    if (midVal < value) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/**
 * Binary search to find the rightmost position where value could be inserted.
 * Equivalent to Python's bisect_right.
 * @param {number[]} arr - Sorted array to search
 * @param {number} value - Value to search for
 * @param {function(number): number} [keyFn] - Optional key function
 * @returns {number} Index where value should be inserted
 */
function bisectRight(arr, value, keyFn = null) {
  let lo = 0;
  let hi = arr.length;
  
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const midVal = keyFn ? keyFn(arr[mid]) : arr[mid];
    if (value < midVal) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}