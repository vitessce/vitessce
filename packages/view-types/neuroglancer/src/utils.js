// For now deckGl uses degrees, but if changes to radian can change here
// const VIT_UNITS = 'degrees';

export const EPSILON_KEYS_MAPPING_NG = {
  projectionScale: 100,
  projectionOrientation: 2e-2,
  position: 1,
};

// allow smaller pos deltas to pass when zoom changed
export const SOFT_POS_FACTOR = 0.15;
// To rotate the y-axis up in NG
export const Q_Y_UP = [1, 0, 0, 0]; // [x,y,z,w] for 180° about X

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
// function isValidState(viewerState) {
//   const { projectionScale, projectionOrientation, position, dimensions } = viewerState || {};
//   console.log ("valid", projectionScale, projectionOrientation, position, dimensions)
//   return (
//     dimensions !== undefined
//       && typeof projectionScale === 'number'
//       && Array.isArray(projectionOrientation)
//       && projectionOrientation.length === 4
//       && Array.isArray(position)
//       && position.length === 3
//   );
// }

/**
 * Returns true if the difference is greater than the epsilon for that key.
 * @param {array | number} a Previous viewerState key, i.e., position.
 * @param {array | number } b Next viewerState key, i.e., position.
 * @returns
 */

export function valueGreaterThanEpsilon(a, b, epsilon) {
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    return a.some((val, i) => Math.abs(val - b[i]) > epsilon);
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) > epsilon;
  }
  return undefined;
}

export const nearEq = (a, b, epsilon) => (
  Number.isFinite(a) && Number.isFinite(b) ? Math.abs(a - b) <= epsilon : a === b
);

/**
 * Returns true if the two states are equal, or false if not.
 * @param {object} prevState Previous viewer state.
 * @param {object} nextState Next viewer state.
 * @returns {Boolean} True if any key has changed
 */

export function didCameraStateChange(prevState, nextState) {
  // if (!isValidState(nextState)) return false;
  return Object.entries(EPSILON_KEYS_MAPPING_NG)
    .some(([key, eps]) => valueGreaterThanEpsilon(
      prevState?.[key],
      nextState?.[key],
      eps,
    ));
}

// To see if any and which cameraState has changed
// adjust for coupled zoom+position changes
export function diffCameraState(prev, next) {
  // if (!isValidState(next)) return { changed: false, scale: false, pos: false, rot: false };

  const eps = EPSILON_KEYS_MAPPING_NG;
  const scale = valueGreaterThanEpsilon(prev?.projectionScale,
    next?.projectionScale, eps.projectionScale);
  const posHard = valueGreaterThanEpsilon(prev?.position, next?.position, eps.position);
  const rot = valueGreaterThanEpsilon(prev?.projectionOrientation,
    next?.projectionOrientation, eps.projectionOrientation);

  // If zoom changed, allow a softer position threshold so zoom+pos travel together.
  const posSoft = !posHard && scale
  && valueGreaterThanEpsilon(prev?.position, next?.position, SOFT_POS_FACTOR);
  const pos = posHard || posSoft;

  return { changed: scale || pos || rot, scale, pos, rot };
}


const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

//  Convert WebGL's Quaternion rotation to DeckGL's Euler.
//  Mirrors three.js Euler.setFromQuaternion(q, 'YXZ') exactly, but without
//  pulling three into the bundle (deck.gl uses Y=yaw, X=pitch, Z=roll).
export function quaternionToEuler([x, y, z, w]) {
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const yy = y * y2;
  const zz = z * z2;
  const xz = x * z2;
  const yz = y * z2;
  const wx = w * x2;
  const wy = w * y2;
  const m11 = 1 - (yy + zz);
  const m13 = xz + wy;
  const m23 = yz - wx;
  const m31 = xz - wy;
  const m33 = 1 - (xx + yy);
  const pitch = Math.asin(-clamp(m23, -1, 1)); // X-axis rotation
  const yaw = Math.abs(m23) < 0.9999999 // Y-axis rotation
    ? Math.atan2(m13, m33)
    : Math.atan2(-m31, m11);
  return [pitch, yaw];
}


//  Convert DeckGL's rotation in Euler to WebGL's Quaternion.
//  Mirrors three.js Quaternion.setFromEuler(new Euler(pitch, yaw, roll, 'YXZ')).
export function eulerToQuaternion(pitch, yaw, roll = 0) {
  const c1 = Math.cos(pitch / 2);
  const c2 = Math.cos(yaw / 2);
  const c3 = Math.cos(roll / 2);
  const s1 = Math.sin(pitch / 2);
  const s2 = Math.sin(yaw / 2);
  const s3 = Math.sin(roll / 2);
  return [
    s1 * c2 * c3 + c1 * s2 * s3,
    c1 * s2 * c3 - s1 * c2 * s3,
    c1 * c2 * s3 - s1 * s2 * c3,
    c1 * c2 * c3 + s1 * s2 * s3,
  ];
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
