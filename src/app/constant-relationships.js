import { FileType, DataType } from './constants';

/**
 * Mapping from file types to data types. Each file type
 * should correspond to one data type. Multiple file types
 * can map onto the same data type.
 */
export const FILE_TYPE_DATA_TYPE_MAPPING = {
  // For new file types
  [FileType.OBS_SETS_JSON]: DataType.OBS_SETS,
  [FileType.IMAGE_OME_ZARR]: DataType.IMAGE,
  [FileType.OBS_FEATURE_MATRIX_ANNDATA_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.OBS_SETS_ANNDATA_ZARR]: DataType.OBS_SETS,
  [FileType.OBS_EMBEDDING_ANNDATA_ZARR]: DataType.OBS_EMBEDDING,
  [FileType.OBS_LOCATIONS_ANNDATA_ZARR]: DataType.OBS_LOCATIONS,
  [FileType.OBS_SEGMENTATIONS_ANNDATA_ZARR]: DataType.OBS_SEGMENTATIONS,
  [FileType.OBS_LABELS_ANNDATA_ZARR]: DataType.OBS_LABELS,
  [FileType.FEATURE_LABELS_ANNDATA_ZARR]: DataType.FEATURE_LABELS,
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
  // For old file types
  [FileType.CELLS_JSON]: DataType.CELLS,
  [FileType.CELL_SETS_JSON]: DataType.CELL_SETS,
  [FileType.EXPRESSION_MATRIX_ZARR]: DataType.EXPRESSION_MATRIX,
  [FileType.GENOMIC_PROFILES_ZARR]: DataType.GENOMIC_PROFILES,
  [FileType.MOLECULES_JSON]: DataType.MOLECULES,
  [FileType.NEIGHBORHOODS_JSON]: DataType.NEIGHBORHOODS,
  [FileType.RASTER_JSON]: DataType.RASTER,
  [FileType.RASTER_OME_ZARR]: DataType.RASTER,
  [FileType.CLUSTERS_JSON]: DataType.EXPRESSION_MATRIX,
  [FileType.GENES_JSON]: DataType.EXPRESSION_MATRIX,
  [FileType.ANNDATA_CELL_SETS_ZARR]: DataType.CELL_SETS,
  [FileType.ANNDATA_CELLS_ZARR]: DataType.CELLS,
  [FileType.ANNDATA_EXPRESSION_MATRIX_ZARR]: DataType.EXPRESSION_MATRIX,
};
