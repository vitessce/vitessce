// Selection Layers
export { getSelectionLayers } from './selection-utils';

// Heatmap Layers
export { default as HeatmapBitmapLayer } from './HeatmapBitmapLayer';
export { default as PixelatedBitmapLayer } from './PixelatedBitmapLayer';
export { default as HeatmapCompositeTextLayer } from './HeatmapCompositeTextLayer';

export { GLSL_COLORMAPS, GLSL_COLORMAP_DEFAULT, DEFAULT_GL_OPTIONS, SELECTION_TYPE } from './constants';

// Layer extensions
export { default as ScaledExpressionExtension } from './ScaledExpressionExtension';
export { default as SelectionExtension } from './SelectionExtension';
