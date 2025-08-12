import {
  Quaternion,
  Euler,
} from 'three';

export const EPSILON_KEYS_MAPPING = {
  projectionScale: 1e-1,
  projectionOrientation: 1e-1,
  position: 1e-3,
};

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

/**
 * Returns true if the difference is greater than the epsilon for that key.
 * @param {array | number} a Previous viewerState key, i.e., position.
 * @param {array | number } b Next viewerState key, i.e., position.
 * @returns
 */

export function valueGreaterThanEpsilon(a, b, epsilon) {
  // console.log(a, b, epsilon, (Array.isArray(a) && Array.isArray(b) && a.length === b.length))
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    return a.some((val, i) => Math.abs(val - b[i]) > epsilon);
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) > epsilon;
  }
  return undefined;
}


// export function compareProjectionOrientation(a, b, epsilon) {
//     // console.log(a, b, epsilon, (Array.isArray(a) && Array.isArray(b)
//&& a.length === b.length))
//     if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
//       return a.every((val, i) => Math.abs(val - b[i]) < epsilon);
//     }
//     return undefined;
//   }

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
    Object.keys(EPSILON_KEYS_MAPPING).forEach((key) => {
      const epsilon = EPSILON_KEYS_MAPPING[key];
      const prevVal = prevState[key];
      const nextVal = nextState[key];
      const isKeyEqual = valueGreaterThanEpsilon(prevVal, nextVal, epsilon);
      if (!isKeyEqual) {
        allKeysEqualCheck = false;
      }
    });
  }
  return allKeysEqualCheck;
}

export function quaternionsAreClose(q1, q2, epsilon = 1e-3) {
  if (!Array.isArray(q1) || !Array.isArray(q2) || q1.length !== 4 || q2.length !== 4) return false;
  const mag1 = Math.sqrt(q1.reduce((s, v) => s + v * v, 0));
  const mag2 = Math.sqrt(q2.reduce((s, v) => s + v * v, 0));
  const q1n = q1.map(v => v / mag1);
  const q2n = q2.map(v => v / mag2);
  const dot = q1n.reduce((s, v, i) => s + v * q2n[i], 0);
  return Math.abs(dot) > 1 - epsilon;
}

/* Deck.gl zoom → Neuroglancer projectionScale
  */
export function deckZoomToProjectionScale(zoom, baseScaleUm) {
  return baseScaleUm * (2 ** -zoom);
}

/**
  * Neuroglancer projectionScale → Deck.gl zoom
  */
export function projectionScaleToDeckZoom(projectionScale, baseScaleUm) {
  return Math.log2(baseScaleUm / (projectionScale));
}

// function quaternionsAreClose(q1, q2, epsilon = 1e-4) {
//     for (let i = 0; i < 4; i++) {
//       if (Math.abs(q1[i] - q2[i]) > epsilon) return false;
//     }
//     return true;
//   }
//   if (!quaternionsAreClose(projectionOrientationNew, projectionOrientationOld)) {
//     setRotationX(vitessceEulerMapping[0]);
//   }


export function quaternionToEuler([x, y, z, w]) {
  const quaternion = new Quaternion(x, y, z, w);
  const euler = new Euler().setFromQuaternion(quaternion, 'YXZ'); // deck.gl uses Y (yaw), X (pitch), Z (roll)

  const pitch = euler.x; // X-axis rotation
  const yaw = euler.y; // Y-axis rotation
  //   const pitch = MathUtils.radToDeg(euler.x); // X-axis rotation
  //   const yaw = MathUtils.radToDeg(euler.y); // Y-axis rotation

  return [pitch, yaw];
}


export function eulerToQuaternion(pitch, yaw, roll = 0) {
  const euler = new Euler(pitch, yaw, roll, 'YXZ'); // rotation order
  const quaternion = new Quaternion().setFromEuler(euler);
  return [quaternion.x, quaternion.y, quaternion.z, quaternion.w];
}

//   /**
//    *
//    * @param {} dimensions
//    * @returns
// */
//   export function getProjectionScaleInMicrons(dimensions, projectionScale) {
//     const unitConversion = {
//       m: 1e6,
//       mm: 1e3,
//       µm: 1,
//       um: 1,
//       nm: 1e-3,
//       pm: 1e-6,
//     };

//     // Use any axis — assume uniform voxel scale
//     const [scale, unit] = Object.values(dimensions)[0] || [null, null];
//     const toMicrons = unitConversion[unit];

//     if (!projectionScale || !toMicrons || !scale) return 1;
//     console.log("dim", projectionScale , toMicrons)
//     // scale = physical size per voxel (e.g. 1e-9 m), so:
//     return projectionScale * toMicrons * scale; // = microns per voxel unit
//   }
