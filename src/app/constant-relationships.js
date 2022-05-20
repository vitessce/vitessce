import { FileType, DataType, EntityTypes } from './constants';

// Which file types are supported by each data type?
export const FILE_TYPE_DATA_TYPE_MAPPING = {
  [FileType.CELLS_JSON]: DataType.OBS,
  [FileType.CELL_SETS_JSON]: DataType.OBS_SETS,
  [FileType.EXPRESSION_MATRIX_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.GENOMIC_PROFILES_ZARR]: DataType.GENOMIC_PROFILES,
  [FileType.MOLECULES_JSON]: DataType.OBS,
  [FileType.NEIGHBORHOODS_JSON]: DataType.NEIGHBORHOODS,
  [FileType.RASTER_JSON]: DataType.RASTER,
  [FileType.RASTER_OME_ZARR]: DataType.RASTER,
  [FileType.CLUSTERS_JSON]: DataType.OBS_FEATURE_MATRIX,
  [FileType.GENES_JSON]: DataType.OBS_FEATURE_MATRIX,
  [FileType.ANNDATA_CELL_SETS_ZARR]: DataType.OBS_SETS,
  [FileType.ANNDATA_CELLS_ZARR]: DataType.OBS,
  [FileType.ANNDATA_EXPRESSION_MATRIX_ZARR]: DataType.OBS_FEATURE_MATRIX,
  // FOM file types
  [FileType.ANNDATA_OBS_ZARR]: DataType.OBS,
  [FileType.ANNDATA_OBS_SETS_ZARR]: DataType.OBS_SETS,
  [FileType.ANNDATA_OBS_FEATURE_MATRIX_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.ANNDATA_FEATURES_ZARR]: DataType.FEATURES,
};

// Which entity types are used for each data type?
export const DATA_TYPE_ENTITY_TYPES_MAPPING = {
  [DataType.OBS]: [EntityTypes.OBS_TYPE],
  [DataType.OBS_SETS]: [EntityTypes.OBS_TYPE],
  [DataType.OBS_FEATURE_MATRIX]: [
    EntityTypes.OBS_TYPE,
    EntityTypes.FEATURE_TYPE,
    EntityTypes.FEATURE_VALUE_TYPE,
  ],
  [DataType.FEATURES]: [EntityTypes.FEATURE_TYPE],
  [DataType.NEIGHBORHOODS]: [],
  [DataType.RASTER]: [],
  [DataType.GENOMIC_PROFILES]: [],
};
