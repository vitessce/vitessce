/**
 * Bidirectional conversion between Deck.gl OrbitView-style viewState
 * and Three.js OrbitControls camera parameters.
 *
 * Deck.gl OrbitView viewState: { zoom, target: [x,y,z], rotationX, rotationOrbit }
 *   - zoom: log2 scale (higher = closer)
 *   - target: point the camera orbits around
 *   - rotationX: pitch in degrees (0 = level, negative = looking down)
 *   - rotationOrbit: yaw/orbit in degrees
 *
 * Three.js OrbitControls: camera position (Vector3), controls target (Vector3),
 *   implicitly defining distance, polar angle (phi), and azimuthal angle (theta).
 */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

const DEFAULT_BASE_DISTANCE = 4;

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
 * @returns {{ zoom: number, target: [number, number, number], rotationX: number, rotationOrbit: number }}
 */
export function cameraToViewState(cameraPosition, controlsTarget, baseDistance = DEFAULT_BASE_DISTANCE) {
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
