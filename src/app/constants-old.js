/**
 * Old constant values with deprecation log messages.
 * Values should be tuples like [oldValue, deprecationMessage].
 */
export const Component = {};

export const DataType = {};

export const FileType = {};

function makeChangeMessage(newTypeName, newVersion) {
  return `This coordination type was changed to ${newTypeName} in view config schema version ${newVersion}`;
}

export const CoordinationType = {
  SPATIAL_LAYERS: [
    'spatialLayers',
    'This coordination type was split into multiple coordination types in view config schema version 1.0.1',
  ],
  // Spatial layers
  SPATIAL_RASTER_LAYERS: [
    'spatialRasterLayers',
    makeChangeMessage('spatialRasterLayer', '1.0.11'),
  ],
  SPATIAL_CELLS_LAYER: [
    'spatialCellsLayer',
    makeChangeMessage('spatialSegmentationLayer', '1.0.11'),
  ],
  SPATIAL_MOLECULES_LAYER: [
    'spatialMoleculesLayer',
    makeChangeMessage('spatialPointLayer', '1.0.11'),
  ],
  SPATIAL_NEIGHBORHOODS_LAYER: [
    'spatialNeighborhoodsLayer',
    makeChangeMessage('spatialNeighborhoodLayer', '1.0.11'),
  ],
  // Cell -> Obs
  EMBEDDING_CELL_SET_POLYGONS_VISIBLE: [
    'embeddingCellSetPolygonsVisible',
    makeChangeMessage('embeddingObsSetPolygonsVisible', '1.0.11'),
  ],
  EMBEDDING_CELL_SET_LABELS_VISIBLE: [
    'embeddingCellSetLabelsVisible',
    makeChangeMessage('embeddingObsSetLabelsVisible', '1.0.11'),
  ],
  EMBEDDING_CELL_SET_LABEL_SIZE: [
    'embeddingCellSetLabelSize',
    makeChangeMessage('embeddingObsSetLabelSize', '1.0.11'),
  ],
  EMBEDDING_CELL_RADIUS: [
    'embeddingCellRadius',
    makeChangeMessage('embeddingObsRadius', '1.0.11'),
  ],
  EMBEDDING_CELL_RADIUS_MODE: [
    'embeddingCellRadiusMode',
    makeChangeMessage('embeddingObsRadiusMode', '1.0.11'),
  ],
  EMBEDDING_CELL_OPACITY: [
    'embeddingCellOpacity',
    makeChangeMessage('embeddingObsOpacity', '1.0.11'),
  ],
  EMBEDDING_CELL_OPACITY_MODE: [
    'embeddingCellOpacityMode',
    makeChangeMessage('embeddingObsOpacityMode', '1.0.11'),
  ],
  CELL_FILTER: [
    'cellFilter',
    makeChangeMessage('obsFilter', '1.0.11'),
  ],
  CELL_HIGHLIGHT: [
    'cellHighlight',
    makeChangeMessage('obsHighlight', '1.0.11'),
  ],
  CELL_SET_SELECTION: [
    'cellSetSelection',
    makeChangeMessage('obsSetSelection', '1.0.11'),
  ],
  CELL_SET_HIGHLIGHT: [
    'cellSetHighlight',
    makeChangeMessage('obsSetHighlight', '1.0.11'),
  ],
  CELL_SET_COLOR: [
    'cellSetColor',
    makeChangeMessage('obsSetColor', '1.0.11'),
  ],
  CELL_COLOR_ENCODING: [
    'cellColorEncoding',
    makeChangeMessage('obsColorEncoding', '1.0.11'),
  ],
  ADDITIONAL_CELL_SETS: [
    'additionalCellSets',
    makeChangeMessage('additionalObsSets', '1.0.11'),
  ],
  // Gene -> Feature
  GENE_FILTER: [
    'geneFilter',
    makeChangeMessage('featureFilter', '1.0.11'),
  ],
  GENE_HIGHLIGHT: [
    'geneHighlight',
    makeChangeMessage('featureHighlight', '1.0.11'),
  ],
  GENE_SELECTION: [
    'geneSelection',
    makeChangeMessage('featureSelection', '1.0.11'),
  ],
  GENE_EXPRESSION_COLORMAP: [
    'geneExpressionColormap',
    makeChangeMessage('featureValueColormap', '1.0.11'),
  ],
  GENE_EXPRESSION_TRANSFORM: [
    'geneExpressionTransform',
    makeChangeMessage('featureValueTransform', '1.0.11'),
  ],
  GENE_EXPRESSION_COLORMAP_RANGE: [
    'geneExpressionColormapRange',
    makeChangeMessage('featureValueColormapRange', '1.0.11'),
  ],
};
