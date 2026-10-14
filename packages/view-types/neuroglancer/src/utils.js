import {
  interpolatePlasma,
  interpolateViridis,
  interpolateJet,
  interpolateGreys,
} from '@vitessce/sets-utils';
import { PALETTE } from '@vitessce/utils';

// For now deckGl uses degrees, but if changes to radian can change here
// const VIT_UNITS = 'degrees';

// Used by NG source code for decoding annotation chunks
export const ANNOTATION_HEADER_OFFSET = 8;

// TODO: Grey color used by Vitessce - maybe set globally
export const GREY_HEX = '#323232';

export const EPSILON_KEYS_MAPPING_NG = {
  projectionScale: 5,
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


const isFiniteNumberArray = (value, length) => Array.isArray(value)
  && value.length === length
  && value.every(Number.isFinite);

/** NG position: [x, y, z] in viewer units. */
export function isValidNgPosition(position) {
  return isFiniteNumberArray(position, 3);
}

/** NG projectionOrientation: unit-ish quaternion [x, y, z, w] (must not be all zeros). */
export function isValidNgOrientation(orientation) {
  return isFiniteNumberArray(orientation, 4)
    && orientation.some(v => v !== 0);
}

/** NG projectionScale / crossSectionScale: finite positive number. */
export function isValidNgScale(scale) {
  return Number.isFinite(scale) && scale > 0;
}

export const NG_CAMERA_VALIDATORS = {
  position: isValidNgPosition,
  projectionOrientation: isValidNgOrientation,
  projectionScale: isValidNgScale,
  crossSectionScale: isValidNgScale,
};

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

//  Returns an [r, g, b] color array (0–255) for a normalized value t in [0, 1]
// using the named colormap.
export function applyColormap(colormap, t) {
  const tClamped = Math.max(0, Math.min(1, t));
  const interpolators = {
    plasma: interpolatePlasma,
    viridis: interpolateViridis,
    jet: interpolateJet,
    greys: interpolateGreys,
  };
  const fn = interpolators[colormap] ?? interpolateViridis;
  return fn(tClamped);
}

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

/**
 * Apply a quaternion rotation to a 3D vector.
 * @param {number[]} q Quaternion [x, y, z, w]
 * @param {number[]} v Vector [x, y, z]
 * @returns {number[]} Rotated vector [x, y, z]
 */
export function applyQuat(q, v) {
  const [qx, qy, qz, qw] = q;
  const [vx, vy, vz] = v;
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);
  return [
    vx + qw * tx + qy * tz - qz * ty,
    vy + qw * ty + qz * tx - qx * tz,
    vz + qw * tz + qx * ty - qy * tx,
  ];
}

/**
 * Resolve annotation property layout from the annotation `info` JSON.
 * NG's AnnotationPropertySerializer.deserialize fills `properties[i]` in the
 * same order as `info.properties`, so names map to indices by position in that list.
 * @param {object} info Annotation info JSON.
 * @param {object} [opts]
 * @param {string} [opts.segmentIdProp] Property holding the mesh segment ID.
 *   Defaults to 'id' when the info declares it.
 * @returns {{ propertyIds: string[], segmentIdProp: string|null, segmentIdIndex: number }}
 */
export function getAnnotationPropertyIndices(info, { segmentIdProp } = {}) {
  const propertyIds = (info?.properties ?? []).map(p => p.id);
  const resolvedSegmentIdProp = segmentIdProp ?? (propertyIds.includes('id') ? 'id' : null);
  return {
    propertyIds,
    segmentIdProp: resolvedSegmentIdProp,
    segmentIdIndex: resolvedSegmentIdProp ? propertyIds.indexOf(resolvedSegmentIdProp) : -1,
  };
}

/** Zip deserialized values with their info property names. */
function toNamedProperties(propertyIds, values) {
  const named = {};
  propertyIds.forEach((name, k) => { named[name] = values[k]; });
  return named;
}

/**
 * Parse annotations from a chunk: position, the segment ID, and every property
 * declared in the info (by name). Mimics NG's parseAnnotations().
 * Chunk layout: [uint64 count][property data, group-major][uint64 ids * count].
 * Group 0 starts with the geometry (POINT: 3 x float32), stride propertyGroupBytes[0].
 * @param {ArrayBuffer} buffer
 * @param {object} serializer NG AnnotationPropertySerializer for POINT.
 * @param {object} layout From getAnnotationPropertyIndices().
 * @returns {Array<{ id: string, x: number, y: number, z: number, properties: object }>}
 */
export function parseAnnotationChunkSegmentsWithPositions(buffer, serializer, layout) {
  const dv = new DataView(buffer);
  if (buffer.byteLength <= 8) return [];
  const { propertyIds = [], segmentIdIndex } = layout ?? {};
  if (!(segmentIdIndex >= 0)) return [];

  const count = dv.getUint32(0, true);
  // countHigh at bytes 4-7 should be 0
  if (count === 0 || dv.getUint32(4, true) !== 0) return [];
  const geometryStride = serializer.propertyGroupBytes?.[0] ?? serializer.serializedBytes;
  const values = new Array(propertyIds.length).fill(null);
  const results = [];

  for (let i = 0; i < count; i++) {
    serializer.deserialize(dv, ANNOTATION_HEADER_OFFSET, i, count, true, values);
    const segId = values[segmentIdIndex];
    if (segId > 0) {
      const propBase = ANNOTATION_HEADER_OFFSET + i * geometryStride;
      const x = dv.getFloat32(propBase + 0, true);
      const y = dv.getFloat32(propBase + 4, true);
      const z = dv.getFloat32(propBase + 8, true);
      if (x !== 0 || y !== 0 || z !== 0) {
        results.push({
          id: String(segId), // value of segmentIdProp: used for the NG segments array
          x,
          y,
          z,
          properties: toNamedProperties(propertyIds, values),
        });
      }
    }
  }
  return results;
}

/**
 * Decode a single-annotation `by_id/<id>` record (layout as NG's parseSingleAnnotation):
 * deserialize(dv, offset 0, index 0, count 1) -> properties in declaration order.
 * @returns {{ id: string, properties: object } | null}
 */
export function parseAnnotationById(buffer, serializer, layout) {
  const { propertyIds = [], segmentIdIndex } = layout ?? {};
  if (!(segmentIdIndex >= 0) || !buffer || !serializer
    || buffer.byteLength < serializer.serializedBytes) return null;
  const values = new Array(propertyIds.length).fill(null);
  serializer.deserialize(new DataView(buffer), 0, 0, 1, true, values);
  const segId = values[segmentIdIndex];
  if (!(segId > 0)) return null;
  return { id: String(segId), properties: toNamedProperties(propertyIds, values) };
}

export const remapCellColors = (ngCellColors, cellIdToMeshIdRef) => {
  const remapped = {};
  Object.entries(ngCellColors).forEach(([cellId, color]) => {
    const meshId = cellIdToMeshIdRef.current[cellId] ?? cellId;
    remapped[meshId] = color;
  });
  return remapped;
};

// Deterministic fallback coloring for segment IDs with no obsSet or
// segmentColors data. Neuroglancer's own random-hash per-segment coloring
// (the "rainbow" look we get in NG does not reliably carry over here due to our changes,
// so rather than leave these IDs uncolored  we hash the ID to a stable hue —
// same ID always gets the same color across re-renders, without needing to
// know the full ID list up front (unlike an index-based palette).

const autoColorCache = new Map();

function hashStringToIndex(str, mod) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) % (2 ** 32);
  }
  return hash % mod;
}

export function autoColorForId(id) {
  const key = String(id);
  let color = autoColorCache.get(key);
  if (!color) {
    color = PALETTE[hashStringToIndex(key, PALETTE.length)].map(c => c.toString(16).padStart(2, '0')).join('');
    color = `#${color}`;
    autoColorCache.set(key, color);
  }
  return color;
}


export function rgbToHex(rgb) {
  return (typeof rgb === 'string'
    ? rgb
    : `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`);
}

/**
 * Return the cached object if `next` has the same keys with identical (===) values;
 * otherwise cache and return `next`.
 */
export function reuseIfShallowEqual(cacheRef, next) {
  const prev = cacheRef.current;
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length === nextKeys.length && nextKeys.every(k => prev[k] === next[k])) {
    return prev;
  }
  // eslint-disable-next-line no-param-reassign
  cacheRef.current = next;
  return next;
}
