import cellSetsSchema from '../../schemas/cell-sets.schema.json';
import cellSetsTabularSchema from '../../schemas/cell-sets-tabular.schema.json';

export const FILE_EXTENSION_JSON = 'json';
export const MIME_TYPE_JSON = 'application/json';

export const FILE_EXTENSION_TABULAR = 'csv';
export const MIME_TYPE_TABULAR = 'text/csv';
export const SEPARATOR_TABULAR = ',';
// The NA value below corresponds to the allowed string enum
// value "NA" in the cell-sets-tabular JSON schema.
export const NA_VALUE_TABULAR = 'NA';

export const SETS_DATATYPE_CELL = 'cell';
export const HIERARCHICAL_SCHEMAS = {
  cell: {
    latestVersion: '0.1.3',
    schema: cellSetsSchema,
  },
};

export const TABULAR_SCHEMAS = {
  cell: {
    schema: cellSetsTabularSchema,
  },
};
