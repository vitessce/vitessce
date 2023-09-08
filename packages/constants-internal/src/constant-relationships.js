import { FileType, DataType, CoordinationType } from './constants.js';

/**
 * Mapping from file types to data types. Each file type
 * should correspond to one data type. Multiple file types
 * can map onto the same data type.
 */
export const FILE_TYPE_DATA_TYPE_MAPPING = {
  // For new file types
  [FileType.OBS_EMBEDDING_CSV]: DataType.OBS_EMBEDDING,
  [FileType.OBS_LOCATIONS_CSV]: DataType.OBS_LOCATIONS,
  [FileType.OBS_LABELS_CSV]: DataType.OBS_LABELS,
  [FileType.FEATURE_LABELS_CSV]: DataType.FEATURE_LABELS,
  [FileType.OBS_FEATURE_MATRIX_CSV]: DataType.OBS_FEATURE_MATRIX,
  [FileType.OBS_SEGMENTATIONS_JSON]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_SETS_CSV]: DataType.OBS_SETS,
  [FileType.OBS_SETS_JSON]: DataType.OBS_SETS,
  [FileType.IMAGE_OME_ZARR]: DataType.IMAGE,
  [FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.OBS_SETS_ANNDATA_ZARR]: DataType.OBS_SETS,
  [FileType.OBS_EMBEDDING_ANNDATA_ZARR]: DataType.OBS_EMBEDDING,
  [FileType.OBS_LOCATIONS_ANNDATA_ZARR]: DataType.OBS_LOCATIONS,
  [FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_LABELS_ANNDATA_ZARR]: DataType.OBS_LABELS,
  [FileType.FEATURE_LABELS_ANNDATA_ZARR]: DataType.FEATURE_LABELS,
  [FileType.IMAGE_OME_TIFF]: DataType.IMAGE,
  [FileType.OBS_SEGMENTATIONS_OME_TIFF]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_FEATURE_MATRIX_MUDATA_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.OBS_SETS_MUDATA_ZARR]: DataType.OBS_SETS,
  [FileType.OBS_EMBEDDING_MUDATA_ZARR]: DataType.OBS_EMBEDDING,
  [FileType.OBS_LOCATIONS_MUDATA_ZARR]: DataType.OBS_LOCATIONS,
  [FileType.OBS_SEGMENTATIONS_MUDATA_ZARR]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_LABELS_MUDATA_ZARR]: DataType.OBS_LABELS,
  [FileType.FEATURE_LABELS_MUDATA_ZARR]: DataType.FEATURE_LABELS,

  [FileType.IMAGE_SPATIALDATA_ZARR]: DataType.IMAGE,
  [FileType.OBS_SEGMENTATIONS_SPATIALDATA_ZARR]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_LOCATIONS_SPATIALDATA_ZARR]: DataType.OBS_LOCATIONS,
  [FileType.OBS_FEATURE_MATRIX_SPATIALDATA_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.OBS_SETS_SPATIALDATA_ZARR]: DataType.OBS_SETS,

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
    CoordinationType.OBS_TYPE,
  ],
  [DataType.OBS_EMBEDDING]: [
    CoordinationType.OBS_TYPE,
    CoordinationType.EMBEDDING_TYPE,
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
  [DataType.IMAGE]: [],
  [DataType.NEIGHBORHOODS]: [],
};
