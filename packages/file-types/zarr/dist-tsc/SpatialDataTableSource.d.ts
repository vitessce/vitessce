/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
export function getObsPath(arrPath: string | undefined): string;
/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
export function getVarPath(arrPath: string | undefined): string;
export default class SpatialDataTableSource extends AnnDataSource {
    /** @type {{ [k: string]: Promise<string[]> }} */
    obsIndices: {
        [k: string]: Promise<string[]>;
    };
    /** @type {{ [k: string]: Promise<string[]> }} */
    varIndices: {
        [k: string]: Promise<string[]>;
    };
    /** @type {{ [k: string]: string[] }} */
    varAliases: {
        [k: string]: string[];
    };
    /**
     *
     * @param {string} tablePath
     * @returns
     */
    loadSpatialDataAttrs(tablePath: string): Promise<{
        [k: string]: string | string[] | null;
    }>;
    /**
     * Class method for loading the var alias.
     * @param {string} varPath
     * @param {string} matrixPath
     * @returns {Promise<string[]>} An promise for a zarr array containing the aliased names.
     */
    loadVarAlias(varPath: string, matrixPath: string): Promise<string[]>;
}
import AnnDataSource from './AnnDataSource.js';
//# sourceMappingURL=SpatialDataTableSource.d.ts.map