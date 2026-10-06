// Minimal vendored subsets of three and three-stdlib,
// so that @vitessce/scatterplot does not need to depend on them.
export { PerspectiveCamera } from './three/cameras/PerspectiveCamera.js';
// eslint-disable-next-line import/no-unresolved
export { OrbitControls } from './three-stdlib/controls/OrbitControls.js';
