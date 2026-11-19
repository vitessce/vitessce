/**
 * Conversion between the spatialCameraSnapshot coordination value, which
 * Neuroglancer and the spatialBeta (Deck.gl) 3D views share, and the
 * Three.js camera and OrbitControls of the volume view.
 *
 * spatialCameraSnapshot: {
 *   position: [x, y, z],        // Orbit target / pivot point, in world units.
 *   quaternion: [x, y, z, w],   // Camera orientation (Three.js convention:
 *                               // looks along its local -Z, local +Y is up).
 *   projectionScale: number,    // Height of the visible region at the pivot.
 *   fovDegrees: number,
 *   metersPerUnit?: number,     // Physical size of one world unit, if known.
 * }
 *
 * World units are the physical units of the image (e.g. µm): voxel (x, y, z)
 * of the full-resolution level is at origin + (x, y, z) * voxelSize.
 *
 * The volume view's scene instead holds the volume box centered on the origin
 * and about 1 wide (see VolumeRenderManager.updateRendering). Both frames have
 * the same axes, so they differ by a translation and a uniform scale, and the
 * camera orientation is the same in both.
 */

const DEG2RAD = Math.PI / 180;

// The camera of the volume view when there is no snapshot: in front of the
// volume (on +Z), looking at its center, with +Y up.
export const DEFAULT_VOLUME_CAMERA = {
  position: [0, 0, 4],
  target: [0, 0, 0],
  up: [0, 1, 0],
};

// Far plane of the volume view camera, unless the camera is further away.
export const CAMERA_FAR = 15;

/**
 * Rotate a vector by a unit quaternion.
 * @param {number[]} quaternion [x, y, z, w]
 * @param {number[]} vector [x, y, z]
 * @returns {number[]} The rotated vector.
 */
function rotateByQuaternion([qx, qy, qz, qw], [vx, vy, vz]) {
  // t = 2 * cross(q.xyz, v); v' = v + w * t + cross(q.xyz, t)
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);
  return [
    vx + qw * tx + (qy * tz - qz * ty),
    vy + qw * ty + (qz * tx - qx * tz),
    vz + qw * tz + (qx * ty - qy * tx),
  ];
}

function isFiniteArray(value, length) {
  return Array.isArray(value) && value.length === length && value.every(Number.isFinite);
}

/**
 * The relation between the volume view's scene and world units.
 * @param {object} params
 * @param {number[]} params.physicalSize Size (XYZ) of the volume in world units.
 * @param {number[]} params.boxExtent Size (XYZ) of the volume box in scene units.
 * @param {number[]} [params.origin] World position (XYZ) of the volume's corner.
 * @param {number|null} [params.metersPerUnit] Physical size of one world unit.
 * @returns {{
 *   worldPerScene: number, boxExtent: number[], origin: number[], metersPerUnit: number|null,
 * }|null} Null when the sizes are not usable.
 */
export function getVolumeSceneFrame({
  physicalSize, boxExtent, origin = [0, 0, 0], metersPerUnit = null,
}) {
  if (!isFiniteArray(physicalSize, 3) || !isFiniteArray(boxExtent, 3)) {
    return null;
  }
  // The box keeps the aspect ratio of the volume, so one axis gives the scale.
  const worldPerScene = physicalSize[0] / boxExtent[0];
  if (!(worldPerScene > 0) || !Number.isFinite(worldPerScene)) {
    return null;
  }
  return {
    worldPerScene,
    boxExtent,
    origin: isFiniteArray(origin, 3) ? origin : [0, 0, 0],
    metersPerUnit: metersPerUnit > 0 ? metersPerUnit : null,
  };
}

function worldToScene(point, { worldPerScene, boxExtent, origin }) {
  return point.map((value, axis) => (
    (value - origin[axis]) / worldPerScene - boxExtent[axis] / 2
  ));
}

function sceneToWorld(point, { worldPerScene, boxExtent, origin }) {
  return point.map((value, axis) => (
    origin[axis] + (value + boxExtent[axis] / 2) * worldPerScene
  ));
}

/**
 * Convert a camera snapshot to the volume view's camera.
 * @param {object} snapshot A spatialCameraSnapshot coordination value.
 * @param {object} frame The result of getVolumeSceneFrame.
 * @param {number} fovDegrees Vertical field of view of the volume view camera.
 * The distance to the pivot is chosen so that the visible height at the pivot
 * matches the snapshot, also when its field of view differs.
 * @returns {{
 *   position: number[], target: number[], up: number[], distance: number,
 * }|null} In scene units. Null when the snapshot is not usable.
 */
export function snapshotToVolumeCamera(snapshot, frame, fovDegrees) {
  if (!snapshot || !frame) return null;
  const { position, quaternion, projectionScale, metersPerUnit } = snapshot;
  if (!isFiniteArray(position, 3) || !isFiniteArray(quaternion, 4)) return null;
  if (!(projectionScale > 0) || !Number.isFinite(projectionScale)) return null;
  const quaternionLength = Math.hypot(...quaternion);
  if (!(quaternionLength > 0)) return null;
  const unitQuaternion = quaternion.map(value => value / quaternionLength);

  // Snapshots from views in other units (e.g. Neuroglancer in nm).
  // Taken as world units when either side's unit is unknown.
  const unitFactor = (metersPerUnit > 0 && frame.metersPerUnit)
    ? metersPerUnit / frame.metersPerUnit
    : 1;

  const target = worldToScene(position.map(value => value * unitFactor), frame);
  const visibleHeight = (projectionScale * unitFactor) / frame.worldPerScene;
  const distance = visibleHeight / (2 * Math.tan((fovDegrees * DEG2RAD) / 2));
  const offset = rotateByQuaternion(unitQuaternion, [0, 0, distance]);
  return {
    position: target.map((value, axis) => value + offset[axis]),
    target,
    up: rotateByQuaternion(unitQuaternion, [0, 1, 0]),
    distance,
  };
}

/**
 * Convert the volume view's camera to a camera snapshot.
 * @param {object} camera In scene units.
 * @param {number[]} camera.position Camera position.
 * @param {number[]} camera.target OrbitControls target.
 * @param {number[]} camera.quaternion Camera orientation [x, y, z, w].
 * @param {number} camera.fovDegrees Vertical field of view.
 * @param {object} frame The result of getVolumeSceneFrame.
 * @returns {object} A spatialCameraSnapshot coordination value.
 */
export function volumeCameraToSnapshot({
  position, target, quaternion, fovDegrees,
}, frame) {
  const distance = Math.hypot(...position.map((value, axis) => value - target[axis]));
  const visibleHeight = distance * 2 * Math.tan((fovDegrees * DEG2RAD) / 2);
  return {
    position: sceneToWorld(target, frame),
    quaternion: [...quaternion],
    projectionScale: visibleHeight * frame.worldPerScene,
    fovDegrees,
    ...(frame.metersPerUnit ? { metersPerUnit: frame.metersPerUnit } : {}),
  };
}

/**
 * The snapshot rounded for reading and for pasting into a view config.
 * @param {object} snapshot A spatialCameraSnapshot coordination value.
 * @returns {object} The same keys, rounded.
 */
export function roundCameraSnapshot(snapshot) {
  // Adding 0 turns -0 into 0.
  const round = (value, digits) => Math.round(value * (10 ** digits)) / (10 ** digits) + 0;
  return {
    ...snapshot,
    position: snapshot.position.map(value => round(value, 3)),
    quaternion: snapshot.quaternion.map(value => round(value, 6)),
    projectionScale: round(snapshot.projectionScale, 3),
    fovDegrees: round(snapshot.fovDegrees, 3),
  };
}
