// List of the GLSL colormaps available,
// to validate against before string replacing.
export const GLSL_COLORMAPS = [
  // NOTE: the ordering of these is important,
  // as the shader code in bitmask-layer-beta-shaders hardcodes their indices.
  'plasma',
  'viridis',
  'jet',
  'greys',
];
export const GLSL_COLORMAP_DEFAULT = 'plasma';
export const COLORMAP_SHADER_PLACEHOLDER = 'COLORMAP_FUNC';

export const DEFAULT_GL_OPTIONS = { webgl2: true };

export { SELECTION_TYPE } from 'nebula.gl';
