import {
  Quaternion,
  Euler,
} from 'three';


// For now deckGl uses degrees, but if changes to radian can change here
// const VIT_UNITS = 'degrees';

export const EPSILON_KEYS_MAPPING = {
  projectionScale: 1e-1,
  projectionOrientation: 1e-1,
  position: 1e-3,
};

// ---- Y-up correction: 180° around X so X stays right, Y flips up (Z flips sign, which is OK) ----
export const multiplyQuat = (a, b) => {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
};
export const conjQuat = q => ([-q[0], -q[1], -q[2], q[3]]); // inverse for unit quats

// Helper function to compute the cosine dot product of two quaternion
export const quatdotAbs = (a, b) => Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]);


export const rad2deg = r => r * 180 / Math.PI;
export const deg2rad = d => d * Math.PI / 180;

// export const toVitUnits = rad => VIT_UNITS === 'degrees' ? (rad * 180 / Math.PI) : rad;
// export const fromVitUnits = val => VIT_UNITS === 'degrees' ? (val * Math.PI / 180) : val;


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

/**
 * Returns true if the two states are equal, or false if not.
 * @param {object} prevState Previous viewer state.
 * @param {object} nextState Next viewer state.
 * @returns
 */

export function compareViewerState(prevState, nextState) {
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

// export function compareViewerState(prevState, nextState) {
//   if (!isValidState?.(nextState)) return false;
//     for (const key of Object.keys(EPSILON_KEYS_MAPPING)) {
//       const epsilon = EPSILON_KEYS_MAPPING[key];
//       const prevVal = prevState?.[key];
//       const nextVal = nextState?.[key];
//       if (valueGreaterThanEpsilon(prevVal, nextVal, epsilon)) {
//         return true;
//       }
//   }
//   return false;
//   }

export function quaternionToEuler([x, y, z, w]) {
  const quaternion = new Quaternion(x, y, z, w);
  // deck.gl uses Y (yaw), X (pitch), Z (roll)
  // TODO confirm the direction - YXZ
  const euler = new Euler().setFromQuaternion(quaternion, 'YXZ');
  const pitch = euler.x; // X-axis rotation
  const yaw = euler.y; // Y-axis rotation

  // return [pitch * RAD2DEG, yaw * RAD2DEG];
  return [pitch, yaw];
}


export function eulerToQuaternion(pitch, yaw, roll = 0) {
  const euler = new Euler(pitch, yaw, roll, 'YXZ'); // rotation order
  const quaternion = new Quaternion().setFromEuler(euler);
  return [quaternion.x, quaternion.y, quaternion.z, quaternion.w];
}


// Calibrate once from an initial deck zoom and NG projectionScale
export function makeVitNgZoomCalibrator(initialNgProjectionScale, initialDeckZoom = 0) {
  const base = (initialNgProjectionScale / (2 ** -initialDeckZoom));
  return {
    base,
    vitToNgZoom(z) {
      return (base) * (2 ** -z);
    },
    ngToVitZoom(sNg) {
      return Math.log2(base / (sNg));
    },
  };
}
