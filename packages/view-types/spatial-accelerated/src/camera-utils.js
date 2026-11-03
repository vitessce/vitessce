/**
 * Conversion between the Deck.gl OrbitView-style viewState, which the spatial
 * view keeps in the coordination space (spatialZoom, spatialTargetX/Y/Z,
 * spatialRotationX, spatialRotationOrbit), and the Three.js camera and
 * OrbitControls of the volume view.
 *
 * Deck.gl OrbitView viewState: { zoom, target: [x,y,z], rotationX, rotationOrbit }
 *   - zoom: log2 scale (higher = closer)
 *   - target: point the camera orbits around
 *   - rotationX: pitch in degrees (0 = level, negative = looking down)
 *   - rotationOrbit: yaw/orbit in degrees
 *
 * Three.js OrbitControls: camera position (Vector3), controls target (Vector3),
 *   implicitly defining distance, polar angle (phi), and azimuthal angle (theta).
 *
 * The values are in the units of the volume view's scene (the volume box is
 * about 1 wide), not the world units of the Deck.gl views.
 */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

// Camera distance at zoom = 0: the initial camera position of SpatialWrapper.
const DEFAULT_BASE_DISTANCE = 4;
// Far plane of the SpatialWrapper camera. Beyond it, nothing is drawn.
const CAMERA_FAR = 15;

export const DEFAULT_VOLUME_VIEW_STATE = {
  zoom: 0,
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
};

/**
 * Convert a Deck.gl-style viewState to Three.js camera position and target.
 * @param {object} viewState - { zoom, target: [x,y,z], rotationX, rotationOrbit }
 * @param {number} [baseDistance] - Camera distance at zoom=0.
 * @returns {{ position: [number, number, number], target: [number, number, number] }}
 */
export function viewStateToCamera(viewState, baseDistance = DEFAULT_BASE_DISTANCE) {
  const {
    zoom = 0,
    target = [0, 0, 0],
    rotationX = 0,
    rotationOrbit = 0,
  } = viewState || {};

  const distance = baseDistance * (2 ** (-zoom));

  // phi: polar angle from Y+ axis. rotationX=0 -> equator (PI/2),
  // rotationX=-90 -> top-down (PI).
  const phi = (90 - rotationX) * DEG2RAD;
  // theta: azimuthal angle in XZ plane. Negated so positive rotationOrbit
  // rotates clockwise when viewed from above, matching Deck.gl convention.
  const theta = -rotationOrbit * DEG2RAD;

  const sinPhi = Math.sin(phi);
  const position = [
    target[0] + distance * sinPhi * Math.sin(theta),
    target[1] + distance * Math.cos(phi),
    target[2] + distance * sinPhi * Math.cos(theta),
  ];

  return { position, target: [...target] };
}

/**
 * Convert Three.js camera position and OrbitControls target back to
 * a Deck.gl-style viewState.
 * @param {{ x: number, y: number, z: number }} cameraPosition
 * @param {{ x: number, y: number, z: number }} controlsTarget
 * @param {number} [baseDistance] - Camera distance at zoom=0.
 * @returns {{
 *   zoom: number, target: [number, number, number], rotationX: number, rotationOrbit: number,
 * }}
 */
export function cameraToViewState(
  cameraPosition, controlsTarget, baseDistance = DEFAULT_BASE_DISTANCE,
) {
  const dx = cameraPosition.x - controlsTarget.x;
  const dy = cameraPosition.y - controlsTarget.y;
  const dz = cameraPosition.z - controlsTarget.z;

  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const zoom = distance > 0 ? -Math.log2(distance / baseDistance) : 0;

  const phi = distance > 0 ? Math.acos(Math.max(-1, Math.min(1, dy / distance))) : Math.PI / 2;
  const rotationX = 90 - phi * RAD2DEG;

  const theta = Math.atan2(dx, dz);
  const rotationOrbit = -theta * RAD2DEG;

  return {
    zoom,
    target: [controlsTarget.x, controlsTarget.y, controlsTarget.z],
    rotationX,
    rotationOrbit,
  };
}

/**
 * Whether a viewState can be shown by the volume view: the camera is closer
 * than the far plane and the target is near the volume box. The spatial view
 * fills in the coordination values in Deck.gl world units (centered on the
 * image, zoomed out) when the config has none, and when switching from 2D to
 * 3D. With those, the volume would be out of view.
 * @param {object} viewState - { zoom, target: [x,y,z], rotationX, rotationOrbit }
 * @param {number[]} boxExtent - Size (XYZ) of the volume box in scene units.
 * @param {number} [baseDistance] - Camera distance at zoom=0.
 * @returns {boolean}
 */
export function isVolumeViewState(viewState, boxExtent, baseDistance = DEFAULT_BASE_DISTANCE) {
  const {
    zoom, target, rotationX, rotationOrbit,
  } = viewState || {};
  if (!Array.isArray(target) || target.length !== 3) {
    return false;
  }
  if (![zoom, rotationX, rotationOrbit, ...target].every(Number.isFinite)) {
    return false;
  }
  const distance = baseDistance * (2 ** (-zoom));
  // The box is centered on the origin, so a target within one box size of
  // the origin is at most half a box outside of it.
  return distance < CAMERA_FAR
    && target.every((value, axis) => Math.abs(value) <= boxExtent[axis]);
}

/**
 * The viewState rounded for reading and for pasting into a view config.
 * @param {object} viewState - { zoom, target: [x,y,z], rotationX, rotationOrbit }
 * @returns {object} The same keys, rounded to 3 decimals.
 */
export function roundViewState(viewState) {
  // Adding 0 turns -0 into 0.
  const round = value => Math.round(value * 1000) / 1000 + 0;
  return {
    zoom: round(viewState.zoom),
    target: viewState.target.map(round),
    rotationX: round(viewState.rotationX),
    rotationOrbit: round(viewState.rotationOrbit),
  };
}
