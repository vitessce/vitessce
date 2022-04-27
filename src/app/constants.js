import {
  ViewType,
  DataType,
  FileType,
  EntityTypes,
  CoordinationType,
} from '../view-configs/api/v2/v2-constants';

// Which file types are supported by each data type?
const FILE_TYPE_DATA_TYPE_MAPPING = {
  [FileType.CELLS_JSON]: DataType.OBS,
  [FileType.CELL_SETS_JSON]: DataType.OBS_SETS,
  [FileType.EXPRESSION_MATRIX_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.GENOMIC_PROFILES_ZARR]: DataType.GENOMIC_PROFILES,
  [FileType.MOLECULES_JSON]: DataType.SUB_OBS,
  [FileType.NEIGHBORHOODS_JSON]: DataType.NEIGHBORHOODS,
  [FileType.RASTER_JSON]: DataType.RASTER,
  [FileType.RASTER_OME_ZARR]: DataType.RASTER,
  [FileType.EXPRESSION_MATRIX_JSON]: DataType.OBS_FEATURE_MATRIX,
  [FileType.GENES_JSON]: DataType.OBS_FEATURE_MATRIX,
  [FileType.ANNDATA_OBS_ZARR]: DataType.OBS,
  [FileType.ANNDATA_OBS_SETS_ZARR]: DataType.OBS_SETS,
  [FileType.ANNDATA_OBS_FEATURE_MATRIX_ZARR]: DataType.OBS_FEATURE_MATRIX,
  [FileType.SUB_OBS_MAPPING_JSON]: DataType.SUB_OBS_MAPPING,
  [FileType.SUB_FEATURE_MAPPING_JSON]: DataType.SUB_FEATURE_MAPPING,
};

// Which entity types are used for each data type?
const DATA_TYPE_ENTITY_TYPES_MAPPING = {
  [DataType.OBS]: [EntityTypes.OBS_TYPE],
  [DataType.OBS_SETS]: [EntityTypes.OBS_TYPE],
  [DataType.OBS_FEATURE_MATRIX]: [
    EntityTypes.OBS_TYPE,
    EntityTypes.FEATURE_TYPE,
    EntityTypes.FEATURE_VALUE_TYPE,
  ],
  [DataType.SUB_OBS]: [EntityTypes.SUB_OBS_TYPE],
  [DataType.SUB_OBS_SETS]: [EntityTypes.SUB_OBS_TYPE],
  [DataType.SUB_OBS_MAPPING]: [EntityTypes.SUB_OBS_TYPE, EntityTypes.OBS_TYPE],
  [DataType.SUB_OBS_SUB_FEATURE_MATRIX]: [
    EntityTypes.SUB_OBS_TYPE,
    EntityTypes.SUB_FEATURE_TYPE,
    EntityTypes.SUB_FEATURE_VALUE_TYPE,
  ],
  [DataType.NEIGHBORHOODS]: [],
  [DataType.RASTER]: [],
  [DataType.GENOMIC_PROFILES]: [],
  [DataType.SUB_FEATURE_MAPPING]: [EntityTypes.SUB_FEATURE_TYPE, EntityTypes.FEATURE_TYPE],
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
