

export interface ViewTypeOld {
    GENES: [string, string],
    CELL_SETS: [string, string],
    CELL_SET_SIZES: [string, string],
    CELL_SET_EXPRESSION: [string, string]
    EXPRESSION_HISTOGRAM: [string, string],
  }

export interface DataTypeOld {
    CELLS: [string, string],
    CELL_SETS: [string, string],
    EXPRESSION_MATRIX: [string, string],
    MOLECULES: [string, string],
    RASTER: [string, string],
  }

export interface CoordinationTypeOld {
    SPATIAL_LAYERS: [string, string, string, string],
    SPATIAL_RASTER_LAYERS: [string, string, string, string],
    SPATIAL_CELLS_LAYER: [string, string, string, string],
    SPATIAL_MOLECULES_LAYER: [string, string, string, string],
    SPATIAL_NEIGHBORHOODS_LAYER: [string, string, string, string],
    // Cell -> Obs
    EMBEDDING_CELL_SET_POLYGONS_VISIBLE: [string, string, string, string],
    EMBEDDING_CELL_SET_LABELS_VISIBLE: [string, string, string, string],
    EMBEDDING_CELL_SET_LABEL_SIZE: [string, string, string, string],
    EMBEDDING_CELL_RADIUS: [string, string, string, string],
    EMBEDDING_CELL_RADIUS_MODE: [string, string, string, string],
    EMBEDDING_CELL_OPACITY: [string, string, string, string],
    EMBEDDING_CELL_OPACITY_MODE: [string, string, string, string],
    CELL_FILTER: [string, string, string, string],
    CELL_HIGHLIGHT: [string, string, string, string],
    CELL_SET_SELECTION: [string, string, string, string],
    CELL_SET_HIGHLIGHT: [string, string, string, string],
    CELL_SET_COLOR: [string, string, string, string],
    CELL_COLOR_ENCODING: [string, string, string, string],
    ADDITIONAL_CELL_SETS: [string, string, string, string],
    // Gene -> Feature
    GENE_FILTER: [string, string, string, string],
    GENE_HIGHLIGHT: [string, string, string, string],
    GENE_SELECTION:[string, string, string, string],
    GENE_EXPRESSION_COLORMAP:[string, string, string, string],
    GENE_EXPRESSION_TRANSFORM: [string, string, string, string],
    GENE_EXPRESSION_COLORMAP_RANGE: [string, string, string, string],
  }
