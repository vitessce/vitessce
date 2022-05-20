import {
  ViewType,
  DataType,
  FileType,
  EntityTypes,
  CoordinationType,
} from '../view-configs/api/v2/v2-constants';

// Which file types are supported by each data type?
const FILE_TYPE_DATA_TYPE_MAPPING = {
  [FileType.CELLS_JSON]: DataType.OBS_INDEX,
  [FileType.CELL_SETS_JSON]: DataType.OBS_SETS,
  [FileType.EXPRESSION_MATRIX_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.GENOMIC_PROFILES_ZARR]: DataType.GENOMIC_PROFILES,
  [FileType.MOLECULES_JSON]: DataType.OBS_INDEX,
  [FileType.NEIGHBORHOODS_JSON]: DataType.NEIGHBORHOODS,
  [FileType.RASTER_JSON]: DataType.RASTER,
  [FileType.RASTER_OME_ZARR]: DataType.RASTER,
  [FileType.EXPRESSION_MATRIX_JSON]: DataType.OBS_FEATURE_MATRIX,
  [FileType.GENES_JSON]: DataType.OBS_FEATURE_MATRIX,
  [FileType.ANNDATA_OBS_ZARR]: DataType.OBS_INDEX,
  [FileType.ANNDATA_OBS_SETS_ZARR]: DataType.OBS_SETS,
  [FileType.ANNDATA_OBS_FEATURE_MATRIX_ZARR]: DataType.OBS_FEATURE_MATRIX,
};

// Which entity types are used for each data type?
const DATA_TYPE_ENTITY_TYPES_MAPPING = {
  [DataType.OBS_INDEX]: [
    EntityTypes.OBS_TYPE,
  ],
  [DataType.OBS_SETS]: [EntityTypes.OBS_TYPE],
  [DataType.OBS_FEATURE_MATRIX]: [
    EntityTypes.OBS_TYPE,
    EntityTypes.FEATURE_TYPE,
    EntityTypes.FEATURE_VALUE_TYPE,
  ],
  [DataType.FEATURE_INDEX]: [
    EntityTypes.FEATURE_TYPE,
    EntityTypes.FEATURE_VALUE_TYPE,
  ],
  [DataType.NEIGHBORHOODS]: [],
  [DataType.RASTER]: [
    EntityTypes.FEATURE_TYPE,
    EntityTypes.FEATURE_VALUE_TYPE,
  ],
  [DataType.GENOMIC_PROFILES]: [
    EntityTypes.OBS_TYPE,
    EntityTypes.FEATURE_TYPE,
    EntityTypes.FEATURE_VALUE_TYPE,
  ],
};

export {
  ViewType,
  DataType,
  FileType,
  EntityTypes,
  CoordinationType,
  FILE_TYPE_DATA_TYPE_MAPPING,
  DATA_TYPE_ENTITY_TYPES_MAPPING,
};
