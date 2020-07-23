import GL from '@luma.gl/constants';

export const PIXELATED_TEXTURE_PARAMETERS = {
  // NEAREST for integer data to prevent interpolation.
  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
  // CLAMP_TO_EDGE to remove tile artifacts.
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};
