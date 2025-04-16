export const FILE_EXTENSION_JSON: "json";
export const MIME_TYPE_JSON: "application/json";
export const FILE_EXTENSION_TABULAR: "csv";
export const MIME_TYPE_TABULAR: "text/csv";
export const SEPARATOR_TABULAR: ",";
export const NA_VALUE_TABULAR: "NA";
export const SETS_DATATYPE_OBS: "obs";
export namespace HIERARCHICAL_SCHEMAS {
    export let latestVersion: string;
    export { obsSetsSchema as schema };
}
export namespace TABULAR_SCHEMAS {
    export { obsSetsTabularSchema as schema };
}
import { obsSetsSchema } from '@vitessce/schemas';
import { obsSetsTabularSchema } from '@vitessce/schemas';
//# sourceMappingURL=constants.d.ts.map