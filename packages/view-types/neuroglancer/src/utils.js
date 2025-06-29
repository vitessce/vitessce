import { isEqualWith, pick } from 'lodash-es';
// TODO: Do we want to use the same epsilon value
// for every viewstate property being compared?
const EPSILON = 1e-3;

const VIEWSTATE_KEYS = ['projectionScale', 'projectionOrientation', 'position'];

/**
 * Is this a valid viewerState object?
 * @param {object} viewerState
 * @returns {boolean}
 */
function isValidState(viewerState) {
    const { projectionScale, projectionOrientation, position, dimensions } = viewerState || {};
    return (
      dimensions !== undefined
      && typeof projectionScale === 'number'
      && Array.isArray(projectionOrientation)
      && projectionOrientation.length === 4
      && Array.isArray(position)
      && position.length === 3
    );
  }

// Custom numeric comparison function
// for isEqualWith, to be able to set a custom epsilon.
function customizer(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    // Returns true if the values are equivalent, else false.
    // console.log("compare", a, b, Math.abs(a - b), Math.abs(a - b) < EPSILON)
    return Math.abs(a - b) < EPSILON;
  }
  // Return undefined to fallback to the default
  // comparison function.
  return undefined;
}

/**
 * Returns true if the two states are equal, or false if not.
 * @param {object} prevState Previous viewer state.
 * @param {object} nextState Next viewer state.
 * @returns
 */
export function compareViewerState(prevState, nextState) {
  if (isValidState(nextState)) {
    // Subset the viewerState objects to only the keys
    // that we want to use for comparison.
    const prevSubset = pick(prevState, VIEWSTATE_KEYS);
    const nextSubset = pick(nextState, VIEWSTATE_KEYS);
    return isEqualWith(prevSubset, nextSubset, customizer);
  }
  return true;
}
