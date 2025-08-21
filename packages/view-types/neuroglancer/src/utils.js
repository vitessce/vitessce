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
export const mulQuat = (a, b) => {
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

const YAW_OFFSET = -Math.PI / 2;// try +π/2; if it's mirrored, use -π/2 or add π
export function deckYawToNgYaw(yawDeckRad) {
  return -(yawDeckRad ?? 0) + YAW_OFFSET;
}

// Calibrate once from an initial deck zoom and NG projectionScale
export function makeDeckNgCalibrator(initialNgProjectionScale, initialDeckZoom = 0) {
  const base = (initialNgProjectionScale / (2 ** -initialDeckZoom));
  return {
    base,
    deckToNg(z) {
      return (base) * (2 ** -z);
    },
    ngToDeck(sNg) {
      return Math.log2(base / (sNg));
    },
  };
}


// // Calibrate once from a zoom/scale pair you trust (first load)
// export function computeBaseScaleCss(initialNgProjectionScale, initialDeckZoom) {
//   // baseScale measured in CSS px per world unit (deck’s space)
//   return (initialNgProjectionScale * DPR) / (2 ** -initialDeckZoom);
// }

// // deck -> Neuroglancer
// export function deckZoomToNgProjectionScale(z, baseScaleCss) {
//   return (baseScaleCss / DPR) * (2 ** -z);
// }

// // Neuroglancer -> deck
// export function ngProjectionScaleToDeckZoom(sNg, baseScaleCss) {
//   return Math.log2(baseScaleCss / (sNg * DPR));
// }


// /* Deck.gl zoom → Neuroglancer projectionScale
//   */
// export function deckZoomToProjectionScale(zoom, baseScale) {
//   // return baseScale * (2 ** -zoom);
//   return (baseScale / DPR) * (2 ** -zoom);
// }

/**
  * Neuroglancer projectionScale → Deck.gl zoom
//   */
// export function projectionScaleToDeckZoom(projectionScale, baseScale) {
//   return Math.log2(baseScale / (projectionScale) * (1 / DPR));
// }

// function quaternionsAreClose(q1, q2, epsilon = 1e-4) {
//     for (let i = 0; i < 4; i++) {
//       if (Math.abs(q1[i] - q2[i]) > epsilon) return false;
//     }
//     return true;
//   }
//   if (!quaternionsAreClose(projectionOrientationNew, projectionOrientationOld)) {
//     setRotationX(vitessceEulerMapping[0]);
//   }




// export function snapTopDownQuat(yawDeckRad) {
//   const yawNg = deckYawToNgYaw(yawDeckRad ?? 0);
//   return eulerToQuaternion(0, yawNg, 0);  // pitch=0, roll=0
// }

// export function quatFromAxisAngle(ax, ay, az, angle) {
//   const s = Math.sin(angle / 2);
//   return [ax * s, ay * s, az * s, Math.cos(angle / 2)];
// }
// export function quatMul([ax, ay, az, aw], [bx, by, bz, bw]) {
//   return [
//     aw*bx + ax*bw + ay*bz - az*by,
//     aw*by - ax*bz + ay*bw + az*bx,
//     aw*bz + ax*by - ay*bx + az*bw,
//     aw*bw - ax*bx - ay*by - az*bz,
//   ];
// }

// export function quatToYawZ([x, y, z, w]) {
//   // yaw around Z for in-plane rotation
//   // Equivalent analytic form: atan2(2*(w*z + x*y), 1 - 2*(y*y + z*z))
//   const t0 = 2 * (w * z + x * y);
//   const t1 = 1 - 2 * (y * y + z * z);
//   return Math.atan2(t0, t1);
// }

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
