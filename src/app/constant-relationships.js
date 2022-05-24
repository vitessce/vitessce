import {
  DataType,
  FileType,
  EntityTypes,
  CoordinationType,
} from './constants';

export const DEFAULT_ENTITY_TYPE_VALUES = {
  [EntityTypes.OBS_TYPE]: 'cell',
  [EntityTypes.FEATURE_TYPE]: 'gene',
  [EntityTypes.FEATURE_VALUE_TYPE]: 'expression',
};

export const ENTITY_COORDINATION_TYPES = [
  CoordinationType.OBS_TYPE,
  CoordinationType.FEATURE_TYPE,
  CoordinationType.FEATURE_VALUE_TYPE,
];

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
  [FileType.EXPRESSION_MATRIX_JSON]: DataType.OBS_FEATURE_MATRIX,
  [FileType.GENES_JSON]: DataType.OBS_FEATURE_MATRIX,
  [FileType.ANNDATA_CELLS_ZARR]: DataType.OBS,
  [FileType.ANNDATA_CELL_SETS_ZARR]: DataType.OBS_SETS,
  [FileType.ANNDATA_EXPRESSION_MATRIX_ZARR]: DataType.OBS_FEATURE_MATRIX,
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
  [DataType.NEIGHBORHOODS]: [],
  [DataType.RASTER]: [],
  [DataType.GENOMIC_PROFILES]: [],
};
