import GL from '@luma.gl/constants';

export const TILE_SIZE = 2048;
export const MIN_ROW_AGG = 1;
export const MAX_ROW_AGG = 16;

export const COLOR_BAR_SIZE = 20;
export const AXIS_LABEL_TEXT_SIZE = 9;
export const AXIS_TITLE_TEXT_SIZE = 15;
export const AXIS_MIN_SIZE = 10;
export const AXIS_MAX_SIZE = 90;
export const AXIS_MARGIN = 3;
export const THEME_TO_TEXT_COLOR = {
  dark: [224, 224, 224],
  light: [64, 64, 64],
};
export const AXIS_FONT_FAMILY = "-apple-system, 'Helvetica Neue', Arial, sans-serif";

export const PIXELATED_TEXTURE_PARAMETERS = {
  // NEAREST for integer data to prevent interpolation.
  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
  // CLAMP_TO_EDGE to remove tile artifacts.
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
};
