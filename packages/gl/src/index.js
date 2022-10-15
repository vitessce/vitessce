// Selection Layers
export { getSelectionLayers } from './selection-utils';

// Heatmap Layers
export { default as HeatmapBitmapLayer } from './HeatmapBitmapLayer';
export { default as PixelatedBitmapLayer } from './PixelatedBitmapLayer';
export { default as HeatmapCompositeTextLayer } from './HeatmapCompositeTextLayer';
export { default as PaddedExpressionHeatmapBitmapLayer } from './PaddedExpressionHeatmapBitmapLayer';

export {
  GLSL_COLORMAPS, GLSL_COLORMAP_DEFAULT, DEFAULT_GL_OPTIONS, SELECTION_TYPE,
} from './constants';

// Layer extensions
export { default as ScaledExpressionExtension } from './ScaledExpressionExtension';
export { default as SelectionExtension } from './SelectionExtension';
export { default as BitmaskLayer } from './BitmaskLayer';

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
} from './heatmap-constants';
export * as viv from './viv';
export * as luma from './luma';
export * as deck from './deck';

export {
  GLOBAL_LABELS,
  DEFAULT_CELLS_LAYER,
  DEFAULT_MOLECULES_LAYER,
  DEFAULT_NEIGHBORHOODS_LAYER,
  DEFAULT_RASTER_DOMAIN_TYPE,
  DEFAULT_RASTER_LAYER_PROPS,
  DEFAULT_LAYER_TYPE_ORDERING,
  square,
  initializeLayerChannels,
  initializeRasterLayersAndChannels,
  getSourceFromLoader,
  isRgb,
} from './spatial';
