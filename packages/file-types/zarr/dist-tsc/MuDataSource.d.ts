export function getObsPath(arrPath: any): string;
export function getVarPath(arrPath: any): string;
export default class MuDataSource extends AnnDataSource {
    /**
     * Class method for loading the obs index.
     * @returns {Promise} An promise for a zarr array containing the indices.
     */
    loadObsIndex(path?: null): Promise<any>;
    /**
     * Class method for loading the var index.
     * @returns {Promise} An promise for a zarr array containing the indices.
     */
    loadVarIndex(path?: null): Promise<any>;
    /**
     * Class method for loading the var alias.
     * @returns {Promise} An promise for a zarr array containing the aliased names.
     */
    loadVarAlias(varPath: any, matrixPath: any): Promise<any>;
}
import AnnDataSource from './AnnDataSource.js';
//# sourceMappingURL=MuDataSource.d.ts.map