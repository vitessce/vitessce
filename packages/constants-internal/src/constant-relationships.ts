import { FileType, DataType, CoordinationType } from './constants.js';

/**
 * Mapping from file types to data types. Each file type
 * should correspond to one data type. Multiple file types
 * can map onto the same data type.
 */
export const FILE_TYPE_DATA_TYPE_MAPPING = {
  // For new file types
  [FileType.OBS_EMBEDDING_CSV]: DataType.OBS_EMBEDDING,
  [FileType.OBS_SPOTS_CSV]: DataType.OBS_SPOTS,
  [FileType.OBS_POINTS_CSV]: DataType.OBS_POINTS,
  [FileType.OBS_LOCATIONS_CSV]: DataType.OBS_LOCATIONS,
  [FileType.OBS_LABELS_CSV]: DataType.OBS_LABELS,
  [FileType.FEATURE_LABELS_CSV]: DataType.FEATURE_LABELS,
  [FileType.SAMPLE_SETS_CSV]: DataType.SAMPLE_SETS,
  [FileType.OBS_FEATURE_MATRIX_CSV]: DataType.OBS_FEATURE_MATRIX,
  [FileType.OBS_SEGMENTATIONS_JSON]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_SETS_CSV]: DataType.OBS_SETS,
  [FileType.OBS_SETS_JSON]: DataType.OBS_SETS,
  [FileType.IMAGE_OME_ZARR]: DataType.IMAGE,
  [FileType.OBS_SEGMENTATIONS_OME_ZARR]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.OBS_FEATURE_COLUMNS_ANNDATA_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.OBS_SETS_ANNDATA_ZARR]: DataType.OBS_SETS,
  [FileType.OBS_EMBEDDING_ANNDATA_ZARR]: DataType.OBS_EMBEDDING,
  [FileType.OBS_SPOTS_ANNDATA_ZARR]: DataType.OBS_SPOTS,
  [FileType.OBS_POINTS_ANNDATA_ZARR]: DataType.OBS_POINTS,
  [FileType.OBS_LOCATIONS_ANNDATA_ZARR]: DataType.OBS_LOCATIONS,
  [FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_LABELS_ANNDATA_ZARR]: DataType.OBS_LABELS,
  [FileType.FEATURE_LABELS_ANNDATA_ZARR]: DataType.FEATURE_LABELS,
  [FileType.SAMPLE_EDGES_ANNDATA_ZARR]: DataType.SAMPLE_EDGES,
  [FileType.SAMPLE_SETS_ANNDATA_ZARR]: DataType.SAMPLE_SETS,
  [FileType.COMPARISON_METADATA_ANNDATA_ZARR]: DataType.COMPARISON_METADATA,
  [FileType.COMPARATIVE_FEATURE_STATS_ANNDATA_ZARR]: DataType.FEATURE_STATS,
  [FileType.COMPARATIVE_FEATURE_SET_STATS_ANNDATA_ZARR]: DataType.FEATURE_SET_STATS,
  [FileType.COMPARATIVE_OBS_SET_STATS_ANNDATA_ZARR]: DataType.OBS_SET_STATS,
  [FileType.IMAGE_OME_TIFF]: DataType.IMAGE,
  [FileType.OBS_SEGMENTATIONS_OME_TIFF]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_FEATURE_MATRIX_MUDATA_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.OBS_SETS_MUDATA_ZARR]: DataType.OBS_SETS,
  [FileType.OBS_EMBEDDING_MUDATA_ZARR]: DataType.OBS_EMBEDDING,
  [FileType.OBS_SPOTS_MUDATA_ZARR]: DataType.OBS_SPOTS,
  [FileType.OBS_POINTS_MUDATA_ZARR]: DataType.OBS_POINTS,
  [FileType.OBS_LOCATIONS_MUDATA_ZARR]: DataType.OBS_LOCATIONS,
  [FileType.OBS_SEGMENTATIONS_MUDATA_ZARR]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_LABELS_MUDATA_ZARR]: DataType.OBS_LABELS,
  [FileType.FEATURE_LABELS_MUDATA_ZARR]: DataType.FEATURE_LABELS,
  [FileType.OBS_SEGMENTATIONS_GLB]: DataType.OBS_SEGMENTATIONS,

  [FileType.IMAGE_SPATIALDATA_ZARR]: DataType.IMAGE,
  [FileType.LABELS_SPATIALDATA_ZARR]: DataType.OBS_SEGMENTATIONS,
  [FileType.SHAPES_SPATIALDATA_ZARR]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_SPOTS_SPATIALDATA_ZARR]: DataType.OBS_SPOTS,
  [FileType.OBS_FEATURE_MATRIX_SPATIALDATA_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.OBS_SETS_SPATIALDATA_ZARR]: DataType.OBS_SETS,
  [FileType.FEATURE_LABELS_SPATIALDATA_ZARR]: DataType.FEATURE_LABELS,

  // For new file types to support old file types
  [FileType.OBS_EMBEDDING_CELLS_JSON]: DataType.OBS_EMBEDDING,
  [FileType.OBS_LOCATIONS_CELLS_JSON]: DataType.OBS_LOCATIONS,
  [FileType.OBS_SEGMENTATIONS_CELLS_JSON]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_LABELS_CELLS_JSON]: DataType.OBS_LABELS,
  [FileType.OBS_SETS_CELL_SETS_JSON]: DataType.OBS_SETS,
  [FileType.OBS_FEATURE_MATRIX_GENES_JSON]: DataType.OBS_FEATURE_MATRIX,
  [FileType.OBS_FEATURE_MATRIX_CLUSTERS_JSON]: DataType.OBS_FEATURE_MATRIX,
  [FileType.OBS_FEATURE_MATRIX_EXPRESSION_MATRIX_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.IMAGE_RASTER_JSON]: DataType.IMAGE,
  [FileType.OBS_SEGMENTATIONS_RASTER_JSON]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_LOCATIONS_MOLECULES_JSON]: DataType.OBS_LOCATIONS,
  [FileType.OBS_LABELS_MOLECULES_JSON]: DataType.OBS_LABELS,
  // For old file types
  [FileType.GENOMIC_PROFILES_ZARR]: DataType.GENOMIC_PROFILES,
  [FileType.NEIGHBORHOODS_JSON]: DataType.NEIGHBORHOODS,
};

/**
 * Store a mapping from data types to the coordination types used
 * for matching using the coordinationValues field of file definitions.
 * This enables inferring default values, simplifying view config writing.
 */
export const DATA_TYPE_COORDINATION_VALUE_USAGE = {
  [DataType.OBS_SEGMENTATIONS]: [
    CoordinationType.FILE_UID,
    CoordinationType.OBS_TYPE,
  ],
  [DataType.OBS_EMBEDDING]: [
    CoordinationType.OBS_TYPE,
    CoordinationType.EMBEDDING_TYPE,
  ],
  [DataType.OBS_SPOTS]: [
    CoordinationType.OBS_TYPE,
  ],
  [DataType.OBS_POINTS]: [
    CoordinationType.OBS_TYPE,
  ],
  [DataType.OBS_LOCATIONS]: [
    CoordinationType.OBS_TYPE,
  ],
  [DataType.OBS_LABELS]: [
    CoordinationType.OBS_TYPE,
    CoordinationType.OBS_LABELS_TYPE,
  ],
  [DataType.FEATURE_LABELS]: [
    CoordinationType.FEATURE_TYPE,
  ],
  [DataType.OBS_SETS]: [
    CoordinationType.OBS_TYPE,
  ],
  [DataType.OBS_FEATURE_MATRIX]: [
    CoordinationType.OBS_TYPE,
    CoordinationType.FEATURE_TYPE,
    CoordinationType.FEATURE_VALUE_TYPE,
  ],
  [DataType.GENOMIC_PROFILES]: [],
  [DataType.IMAGE]: [
    CoordinationType.FILE_UID,
  ],
  [DataType.NEIGHBORHOODS]: [],
  [DataType.SAMPLE_SETS]: [
    CoordinationType.SAMPLE_TYPE,
  ],
  [DataType.SAMPLE_EDGES]: [
    CoordinationType.OBS_TYPE,
    CoordinationType.SAMPLE_TYPE,
  ],
  [DataType.COMPARISON_METADATA]: [
    CoordinationType.OBS_TYPE,
    CoordinationType.SAMPLE_TYPE,
  ],
  [DataType.FEATURE_STATS]: [
    CoordinationType.FEATURE_TYPE,
    // TODO: should sampleType, obsSetSelection, and/or sampleSetSelection be used here?
  ],
  [DataType.FEATURE_SET_STATS]: [
    CoordinationType.FEATURE_TYPE,
    // TODO: should sampleType, obsSetSelection, and/or sampleSetSelection be used here?
  ],
  [DataType.OBS_SET_STATS]: [
    CoordinationType.OBS_TYPE,
    // TODO: should sampleType, obsSetSelection, and/or sampleSetSelection be used here?
  ],
};

// For Zarr-based file types, we keep a mapping to file types
// corresponding to alternative store implementations,
// to avoid having to rely on file extensions.
export const ALT_ZARR_STORE_TYPES = {
  // For AnnData:
  [FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR]: {
    zip: FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR_ZIP,
    h5ad: FileType.OBS_FEATURE_MATRIX_ANNDATA_H5AD,
  },
  [FileType.OBS_FEATURE_COLUMNS_ANNDATA_ZARR]: {
    zip: FileType.OBS_FEATURE_COLUMNS_ANNDATA_ZARR_ZIP,
    h5ad: FileType.OBS_FEATURE_COLUMNS_ANNDATA_H5AD,
  },
  [FileType.OBS_SETS_ANNDATA_ZARR]: {
    zip: FileType.OBS_SETS_ANNDATA_ZARR_ZIP,
    h5ad: FileType.OBS_SETS_ANNDATA_H5AD,
  },
  [FileType.OBS_EMBEDDING_ANNDATA_ZARR]: {
    zip: FileType.OBS_EMBEDDING_ANNDATA_ZARR_ZIP,
    h5ad: FileType.OBS_EMBEDDING_ANNDATA_H5AD,
  },
  [FileType.OBS_SPOTS_ANNDATA_ZARR]: {
    zip: FileType.OBS_SPOTS_ANNDATA_ZARR_ZIP,
    h5ad: FileType.OBS_SPOTS_ANNDATA_H5AD,
  },
  [FileType.OBS_POINTS_ANNDATA_ZARR]: {
    zip: FileType.OBS_POINTS_ANNDATA_ZARR_ZIP,
    h5ad: FileType.OBS_POINTS_ANNDATA_H5AD,
  },
  [FileType.OBS_LOCATIONS_ANNDATA_ZARR]: {
    zip: FileType.OBS_LOCATIONS_ANNDATA_ZARR_ZIP,
    h5ad: FileType.OBS_LOCATIONS_ANNDATA_H5AD,
  },
  [FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR]: {
    zip: FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR_ZIP,
    h5ad: FileType.OBS_SEGMENTATIONS_ANNDATA_H5AD,
  },
  [FileType.OBS_LABELS_ANNDATA_ZARR]: {
    zip: FileType.OBS_LABELS_ANNDATA_ZARR_ZIP,
    h5ad: FileType.OBS_LABELS_ANNDATA_H5AD,
  },
  [FileType.FEATURE_LABELS_ANNDATA_ZARR]: {
    zip: FileType.FEATURE_LABELS_ANNDATA_ZARR_ZIP,
    h5ad: FileType.FEATURE_LABELS_ANNDATA_H5AD,
  },
  [FileType.SAMPLE_EDGES_ANNDATA_ZARR]: {
    zip: FileType.SAMPLE_EDGES_ANNDATA_ZARR_ZIP,
    h5ad: FileType.SAMPLE_EDGES_ANNDATA_H5AD,
  },
  [FileType.SAMPLE_SETS_ANNDATA_ZARR]: {
    zip: FileType.SAMPLE_SETS_ANNDATA_ZARR_ZIP,
    h5ad: FileType.SAMPLE_SETS_ANNDATA_H5AD,
  },
  [FileType.COMPARISON_METADATA_ANNDATA_ZARR]: {
    zip: FileType.COMPARISON_METADATA_ANNDATA_ZARR_ZIP,
    h5ad: FileType.COMPARISON_METADATA_ANNDATA_H5AD,
  },
  [FileType.COMPARATIVE_FEATURE_STATS_ANNDATA_ZARR]: {
    zip: FileType.COMPARATIVE_FEATURE_STATS_ANNDATA_ZARR_ZIP,
    h5ad: FileType.COMPARATIVE_FEATURE_STATS_ANNDATA_H5AD,
  },
  [FileType.COMPARATIVE_FEATURE_SET_STATS_ANNDATA_ZARR]: {
    zip: FileType.COMPARATIVE_FEATURE_SET_STATS_ANNDATA_ZARR_ZIP,
    h5ad: FileType.COMPARATIVE_FEATURE_SET_STATS_ANNDATA_H5AD,
  },
  [FileType.COMPARATIVE_OBS_SET_STATS_ANNDATA_ZARR]: {
    zip: FileType.COMPARATIVE_OBS_SET_STATS_ANNDATA_ZARR_ZIP,
    h5ad: FileType.COMPARATIVE_OBS_SET_STATS_ANNDATA_H5AD,
  },

  // For OME-Zarr:
  [FileType.IMAGE_OME_ZARR]: {
    zip: FileType.IMAGE_OME_ZARR_ZIP,
  },
  [FileType.OBS_SEGMENTATIONS_OME_ZARR]: {
    zip: FileType.OBS_SEGMENTATIONS_OME_ZARR_ZIP,
  },
};
