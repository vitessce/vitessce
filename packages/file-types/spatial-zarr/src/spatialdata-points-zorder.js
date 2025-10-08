

const MORTON_CODE_NUM_BITS = 32; // Resulting morton codes will be stored as uint32.
const MORTON_CODE_VALUE_MIN = 0;
const MORTON_CODE_VALUE_MAX = 2**(MORTON_CODE_NUM_BITS/2) - 1;


/**
 * Convert a coordinate from the normalized [0, 65535] space to the original space.
 * @param {number[]} normCoord The normalized coordinate.
 * @param {number} origXMin The minimum original X coordinate.
 * @param {number} origXMax The maximum original X coordinate.
 * @param {number} origYMin The minimum original Y coordinate.
 * @param {number} origYMax The maximum original Y coordinate.
 * @returns {number[]} The coordinate in the original space.
 */
export function normCoordToOrigCoord(normCoord, origXMin, origXMax, origYMin, origYMax) {
  const [normX, normY] = normCoord;
  const origXRange = origXMax - origXMin;
  const origYRange = origYMax - origYMin;
  return [
    (origXMin + (normX / MORTON_CODE_VALUE_MAX) * origXRange),
    (origYMin + (normY / MORTON_CODE_VALUE_MAX) * origYRange),
  ];
}

/**
 * Convert a coordinate from the original space to the [0, 65535] normalized space.
 * @param {number[]} origCoord The original coordinate.
 * @param {number} origXMin The minimum original X coordinate.
 * @param {number} origXMax The maximum original X coordinate.
 * @param {number} origYMin The minimum original Y coordinate.
 * @param {number} origYMax The maximum original Y coordinate.
 * @returns {number[]} The coordinate in the normalized space.
 */
export function origCoordToNormCoord(origCoord, origXMin, origXMax, origYMin, origYMax) {
  const [origX, origY] = origCoord;
  const origXRange = origXMax - origXMin;
  const origYRange = origYMax - origYMin;
  return [
    // Clamp to zero at low end, since using unsigned ints.
    Math.max(Math.floor(((origX - origXMin) / origXRange) * MORTON_CODE_VALUE_MAX), 0),
    Math.max(Math.floor(((origY - origYMin) / origYRange) * MORTON_CODE_VALUE_MAX), 0),
  ];
}



/**
 * Axis-aligned box intersection (inclusive integer bounds).
 */
function intersects(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1) {
  return !(ax1 < bx0 || bx1 < ax0 || ay1 < by0 || by1 < ay0);
}

/**
 * Is inner box entirely inside outer box? (inclusive integer bounds)
 */
function contained(ix0, iy0, ix1, iy1, ox0, oy0, ox1, oy1) {
  return (ox0 <= ix0 && ix0 <= ix1 && ix1 <= ox1) && (oy0 <= iy0 && iy0 <= iy1 && iy1 <= oy1);
}

/**
 * Check if point is inside rectangle.
 */
function pointInside(x, y, rx0, ry0, rx1, ry1) {
  return (rx0 <= x && x <= rx1) && (ry0 <= y && y <= ry1);
}

/**
 * All Morton codes in a quadtree cell share the same prefix (2*level bits).
 * Fill the remaining lower bits with 0s (lo) or 1s (hi).
 * @returns {number[]} [lo, hi]
 */
function cellRange(prefix, level, bits) {
  // This is slightly modified compared to the python implementation,
  // since JS bitwise operators convert operands to signed 32-bit integers,
  // causing wraparound issues when shifting by 32 or more,
  // which occurs when bits is 16 and level is zero.
  const shift = 2 * (bits - level);
  const power = 2 ** shift;
  const lo = prefix * power;
  const hi = (prefix + 1) * power - 1;
  return [lo, hi];
}

/**
 * Merge overlapping or directly adjacent intervals.
 * @param {Array<[number, number]>} intervals 
 * @returns {Array<[number, number]>}
 */
export function mergeAdjacent(intervals) {
  if (intervals.length === 0) {
    return [];
  }
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const [lo, hi] = intervals[i];
    const [mlo, mhi] = merged[merged.length - 1];
    if (lo <= mhi + 1) {
      merged[merged.length - 1] = [mlo, Math.max(mhi, hi)];
    } else {
      merged.push([lo, hi]);
    }
  }
  return merged;
}

/**
 * Compute a (near-)minimal set of Morton code ranges covering the rectangle
 * [rx0..rx1] x [ry0..ry1] on an integer grid [0..2^bits-1]^2.
 *
 * - If stopLevel is null: exact cover (descend to exact containment).
 * - If stopLevel is set (0..bits): stop descending at that level, adding
 *   partially-overlapping cells as whole ranges (superset cover).
 * 
 * @param {number} rx0 
 * @param {number} ry0 
 * @param {number} rx1 
 * @param {number} ry1 
 * @param {number} bits 
 * @param {number|null} stopLevel 
 * @param {boolean} merge 
 * @returns {Array<[number, number]>}
 */
export function zcoverRectangle(rx0, ry0, rx1, ry1, bits, stopLevel = null, merge = true) {
  const maxCoord = (1 << bits) - 1;

  // TODO: clamp to [0, maxCoord] here instead of throwing. Revert clamping in origCoordToNormCoord.

  if (!(0 <= rx0 && rx0 <= rx1 && rx1 <= maxCoord && 0 <= ry0 && ry0 <= ry1 && ry1 <= maxCoord)) {
    throw new Error("Rectangle out of bounds for given bits.");
  }

  const intervals = [];

  // stack entries: [prefix, level, xmin, ymin, xmax, ymax]
  const stack = [[0, 0, 0, 0, maxCoord, maxCoord]];

  while (stack.length > 0) {
    const [prefix, level, xmin, ymin, xmax, ymax] = stack.pop();

    if (!intersects(xmin, ymin, xmax, ymax, rx0, ry0, rx1, ry1)) {
      continue;
    }

    // If we stop at this level for a loose cover, add full cell range.
    if (stopLevel !== null && level === stopLevel) {
      intervals.push(cellRange(prefix, level, bits));
      continue;
    }

    // Fully contained: add full cell range.
    if (contained(xmin, ymin, xmax, ymax, rx0, ry0, rx1, ry1)) {
      intervals.push(cellRange(prefix, level, bits));
      continue;
    }

    // Leaf cell: single lattice point (only happens when level==bits)
    if (level === bits) {
      if (pointInside(xmin, ymin, rx0, ry0, rx1, ry1)) {
        intervals.push(cellRange(prefix, level, bits));
      }
      continue;
    }

    // Otherwise, split into 4 children (Morton order: 00,01,10,11)
    const midx = Math.floor((xmin + xmax) / 2);
    const midy = Math.floor((ymin + ymax) / 2);

    // q0: (x<=midx, y<=midy) -> child code 0b00
    stack.push([(prefix << 2) | 0, level + 1, xmin, ymin, midx, midy]);
    // q1: (x>midx, y<=midy)  -> child code 0b01
    stack.push([(prefix << 2) | 1, level + 1, midx + 1, ymin, xmax, midy]);
    // q2: (x<=midx, y>midy)  -> child code 0b10
    stack.push([(prefix << 2) | 2, level + 1, xmin, midy + 1, midx, ymax]);
    // q3: (x>midx, y>midy)   -> child code 0b11
    stack.push([(prefix << 2) | 3, level + 1, midx + 1, midy + 1, xmax, ymax]);
  }

  return merge ? mergeAdjacent(intervals) : intervals;
}


/**
 * Helper function to get Morton intervals for a rectangle query.
 * @param {Object} boundingBox - Bounding box with x_min, x_max, y_min, y_max
 * @param {Array<number[]>} origRect - Rectangle coordinates [[x0, y0], [x1, y1]]
 * @returns {Array<[number, number]>} Morton code intervals
 */
export function sdataMortonQueryRectAux(boundingBox, origRect) {
  const xMin = boundingBox.x_min;
  const xMax = boundingBox.x_max;
  const yMin = boundingBox.y_min;
  const yMax = boundingBox.y_max;

  const normRect = [
    origCoordToNormCoord(origRect[0], xMin, xMax, yMin, yMax),
    origCoordToNormCoord(origRect[1], xMin, xMax, yMin, yMax),
  ];

  //console.log('boundingBox', boundingBox);
  //console.log('origRect', origRect);
  //console.log('normRect', normRect);

  // Get a list of morton code intervals that cover this rectangle region
  // [ [morton_start, morton_end], ... ]
  const mortonIntervals = zcoverRectangle(
    normRect[0][0], normRect[0][1],
    normRect[1][0], normRect[1][1],
    16,
    null,
    true
  );

  return mortonIntervals;
}
