
/**
 * Mapping of coordination object types
 * to objects with more information,
 * including a human-readable name (`name`),
 * and a default value (`defaultValue`).
 * If default value is undefined,
 * then this object must be defined for the consuming
 * components.
 * If default value is null, this represents "empty"
 */
export const coordinationTypes = {
  dataset: {
    name: 'Dataset',
  },
  embeddingType: {
    name: 'Embedding Type',
  },
  embeddingZoom: {
    name: 'Embedding Zoom',
  },
  embeddingTargetX: {
    name: 'Embedding Target X',
  },
  embeddingTargetY: {
    name: 'Embedding Target Y',
  },
  embeddingTargetZ: {
    name: 'Embedding Target Z',
  },
  spatialZoom: {
    name: 'Spatial Zoom',
  },
  spatialTargetX: {
    name: 'Spatial Target X',
  },
  spatialTargetY: {
    name: 'Spatial Target Y',
  },
  spatialTargetZ: {
    name: 'Spatial Target Z',
  },
  heatmapZoomX: {
    name: 'Heatmap Zoom X',
  },
  heatmapZoomY: {
    name: 'Heatmap Zoom Y',
  },
  heatmapTargetX: {
    name: 'Heatmap Target X',
  },
  heatmapTargetY: {
    name: 'Heatmap Target Y',
  },
  cellFilter: {
    name: 'Filtered Cells',
    defaultValue: null,
  },
  cellSelection: {
    name: 'Selected Cells',
    defaultValue: [],
  },
  cellHighlight: {
    name: 'Hovered Cell',
    defaultValue: null,
  },
  cellSetSelection: {
    name: 'Selected Cell Sets',
    defaultValue: [],
  },
  cellSetHighlight: {
    name: 'Hovered Cell Set',
    defaultValue: null,
  },
  geneFilter: {
    name: 'Filtered Genes',
    defaultValue: null,
  },
  geneSelection: {
    name: 'Selected Genes',
    defaultValue: [],
  },
  geneHighlight: {
    name: 'Hovered Gene',
    defaultValue: null,
  },
  geneExpressionColormap: {
    name: 'Gene Expression Colormap',
    defaultValue: 'plasma',
  },
  geneExpressionColormapRange: {
    name: 'Gene Expression Colormap Range',
    defaultValue: [0.0, 1.0],
  },
  cellColorEncoding: {
    name: 'Cell Color Encoding',
    defaultValue: 'cellSetSelection',
  },
  spatialLayers: {
    name: 'Spatial Layers',
  },
  genomicZoom: {
    name: 'Genomic Track Zoom',
    defaultValue: 0,
  },
  genomicTarget: {
    name: 'Genomic Track Pan',
    defaultValue: [0, 0],
  },
};


/**
 * Mapping from component type to
 * supported coordination object types.
 * This mapping can be used to determine
 * which pieces of state that a component will
 * need to get/set.
 * Keys here are the component registry keys.
 */
export const componentCoordinationTypes = {
  scatterplot: [
    'dataset',
    'embeddingType', 'embeddingZoom',
    'embeddingTargetX', 'embeddingTargetY', 'embeddingTargetZ',
    'cellFilter', 'cellHighlight', 'cellSelection',
    'cellSetSelection', 'cellSetHighlight',
    'geneHighlight', 'geneSelection',
    'geneExpressionColormap', 'geneExpressionColormapRange',
    'cellColorEncoding',
  ],
  spatial: [
    'dataset',
    'spatialZoom', 'spatialLayers',
    'spatialTargetX', 'spatialTargetY', 'spatialTargetZ',
    'cellFilter', 'cellHighlight', 'cellSelection',
    'cellSetSelection', 'cellSetHighlight',
    'geneHighlight', 'geneSelection',
    'geneExpressionColormap', 'geneExpressionColormapRange',
    'cellColorEncoding',
  ],
  heatmap: [
    'dataset',
    'heatmapZoomX', 'heatmapZoomY',
    'heatmapTargetX', 'heatmapTargetY',
    'cellFilter', 'cellHighlight', 'cellSelection',
    'cellSetSelection', 'cellSetHighlight',
    'geneFilter', 'geneHighlight', 'geneSelection',
    'geneExpressionColormap', 'geneExpressionColormapRange',
    'cellColorEncoding',
  ],
  cellSets: [
    'dataset',
    'cellSelection', 'cellFilter',
    'cellSetSelection', 'cellSetHighlight',
    'cellColorEncoding',
  ],
  cellSetSizes: [
    'dataset',
    'cellSetSelection', 'cellSetHighlight',
  ],
  status: [
    'dataset',
    'geneHighlight', 'cellHighlight',
  ],
  factors: [
    'dataset',
    'cellSetSelection',
  ],
  genes: [
    'dataset',
    'geneFilter', 'geneHighlight', 'geneSelection',
  ],
  layerController: [
    'dataset',
    'spatialLayers',
  ],
  higlass: [
    'dataset',
    'genomicZoom', 'genomicTarget',
    'geneFilter', 'geneHighlight', 'geneSelection',
    'cellSetSelection', 'cellSetHighlight',
  ],
};
