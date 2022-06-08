import { FileType, DataType } from './constants';

/**
 * Mapping from file types to data types. Each file type
 * should correspond to one data type. Multiple file types
 * can map onto the same data type.
 */
export const FILE_TYPE_DATA_TYPE_MAPPING = {
  // New mappings
  [FileType.OBS_INDEX_CELLS_JSON]: DataType.OBS_INDEX,
  [FileType.OBS_EMBEDDING_CELLS_JSON]: DataType.OBS_EMBEDDING,
  [FileType.OBS_SETS_CELL_SETS_JSON]: DataType.OBS_SETS,
  // Existing mappings
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
