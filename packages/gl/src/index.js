// Selection Layers
export { getSelectionLayer } from './selection-utils.js';

// Heatmap Layers
export { default as HeatmapBitmapLayer } from './HeatmapBitmapLayer.js';
export { default as PixelatedBitmapLayer } from './PixelatedBitmapLayer.js';
export { default as HeatmapCompositeTextLayer } from './HeatmapCompositeTextLayer.js';
export { default as PaddedExpressionHeatmapBitmapLayer } from './PaddedExpressionHeatmapBitmapLayer.js';

export {
  GLSL_COLORMAPS, GLSL_COLORMAP_DEFAULT, DEFAULT_GL_OPTIONS, SELECTION_TYPE,
} from './constants.js';

// Layer extensions
export { default as ScaledExpressionExtension } from './ScaledExpressionExtension/index.js';
export { default as SelectionExtension } from './SelectionExtension/index.js';
export { default as BitmaskLayer } from './BitmaskLayer.js';
export { default as BitmaskLayerBeta } from './BitmaskLayerBeta.js';
export { default as ContourLayerWithText } from './ContourLayerWithText.js';

export {
  TILE_SIZE, MAX_ROW_AGG, MIN_ROW_AGG,
  COLOR_BAR_SIZE,
  AXIS_MARGIN,
  DATA_TEXTURE_SIZE,
  PIXELATED_TEXTURE_PARAMETERS,
  AXIS_LABEL_TEXT_SIZE,
  AXIS_FONT_FAMILY,
  AXIS_PADDING,
  AXIS_MIN_SIZE,
  AXIS_MAX_SIZE,
} from './heatmap-constants.js';
// eslint-disable-next-line react-refresh/only-export-components
export * as viv from './viv.js';
// eslint-disable-next-line react-refresh/only-export-components
export * as luma from './luma.js';
// eslint-disable-next-line react-refresh/only-export-components
export * as deck from './deck.js';
// eslint-disable-next-line react-refresh/only-export-components
export * as math from './math.js';
