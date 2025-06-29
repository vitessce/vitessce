import { isEqualWith, pick } from 'lodash-es';
// TODO: Do we want to use the same epsilon value
// for every viewstate property being compared?
const EPSILON = 1e-1;

const EPSILON_KEYS_MAPPING = {
    projectionScale: 1e-1,
    projectionOrientation: 1e-1,
    position: 1e-3,
  };
  

// const VIEWSTATE_KEYS = ['projectionScale', 'projectionOrientation', 'position'];

/**
 * Is this a valid viewerState object?
 * @param {object} viewerState
 * @returns {boolean}
 */
function isValidState(viewerState) {
    const { projectionScale, projectionOrientation, position, dimensions } = viewerState || {};
    // console.log(typeof projectionScale === 'number',    dimensions !== undefined, projectionOrientation.length === 4,  Array.isArray(position), position.length === 3 )
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
function compareWithEpsilon(a, b, epsilon) {
    // console.log(a, b, epsilon, (Array.isArray(a) && Array.isArray(b) && a.length === b.length))
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
      return a.every((val, i) => Math.abs(val.toFixed(2) - b[i]).toFixed(2) > epsilon);
    } 
    if (typeof a === 'number' && typeof b === 'number') {
      return Math.abs(a.toFixed(1) - b.toFixed(1)) > epsilon;
    }
  }
  

/**
 * Returns true if the two states are equal, or false if not.
 * @param {object} prevState Previous viewer state.
 * @param {object} nextState Next viewer state.
 * @returns
 */
export function compareViewerState(prevState, nextState) {
    // console.log("Cmpre", nextState.projectionOrientation, prevState.projectionOrientation);
    let allKeysEqualCheck = true;
    if (isValidState(nextState)) {
    // Subset the viewerState objects to only the keys
    // that we want to use for comparison.

        for (const key in EPSILON_KEYS_MAPPING) {
            const epsilon = EPSILON_KEYS_MAPPING[key];
            const prevVal = prevState[key];
            const nextVal = nextState[key];
        
            const isKeyEqual = compareWithEpsilon(prevVal, nextVal, epsilon);
            // console.log(`Comparing ${key}:`, isKeyEqual ? '✓ equal' : '✗ changed', prevVal, nextVal);
        
            if (!isKeyEqual) {
                allKeysEqualCheck = false;
            }
        }
    }
    return allKeysEqualCheck;
  }

function customizer(a, b) {
    // console.log(a, b)
    if (typeof a === 'number' && typeof b === 'number') {
      // Returns true if the values are equivalent, else false.
      // console.log("compare", a, b, Math.abs(a - b), Math.abs(a - b) < EPSILON)
      return Math.abs(a - b) > EPSILON;
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
//   export function compareViewerState(prevState, nextState) {
//     if (isValidState(nextState)) {
//       // Subset the viewerState objects to only the keys
//       // that we want to use for comparison.
//       const prevSubset = pick(prevState, VIEWSTATE_KEYS);
//       const nextSubset = pick(nextState, VIEWSTATE_KEYS);
//       console.log(prevSubset, nextSubset)
//       return isEqualWith(prevSubset, nextSubset, customizer);
//     }
//     return true;
//   }
  