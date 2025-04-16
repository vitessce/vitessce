import AnnDataSource from './AnnDataSource.js';
// If the array path starts with mod/something/rest
// capture mod/something.
const regex = /^mod\/([^/]*)\/(.*)$/;
function getModPrefix(arrPath) {
    if (arrPath) {
        const matches = arrPath.match(regex);
        if (matches && matches.length === 3) {
            return `mod/${matches[1]}/`;
        }
    }
    return '';
}
export function getObsPath(arrPath) {
    return `${getModPrefix(arrPath)}obs`;
}
export function getVarPath(arrPath) {
    return `${getModPrefix(arrPath)}var`;
}
export default class MuDataSource extends AnnDataSource {
    /**
     * Class method for loading the obs index.
     * @returns {Promise} An promise for a zarr array containing the indices.
     */
    loadObsIndex(path = null) {
        if (!this.obsIndex) {
            this.obsIndex = {};
        }
        const obsPath = getObsPath(path);
        if (this.obsIndex[obsPath]) {
            return this.obsIndex[obsPath];
        }
        this.obsIndex[obsPath] = this.getJson(`${obsPath}/.zattrs`)
            .then(({ _index }) => this.getFlatArrDecompressed(`${obsPath}/${_index}`));
        return this.obsIndex[obsPath];
    }
    /**
     * Class method for loading the var index.
     * @returns {Promise} An promise for a zarr array containing the indices.
     */
    loadVarIndex(path = null) {
        if (!this.varIndex) {
            this.varIndex = {};
        }
        const varPath = getVarPath(path);
        if (this.varIndex[varPath]) {
            return this.varIndex[varPath];
        }
        this.varIndex[varPath] = this.getJson(`${varPath}/.zattrs`)
            .then(({ _index }) => this.getFlatArrDecompressed(`${varPath}/${_index}`));
        return this.varIndex[varPath];
    }
    /**
     * Class method for loading the var alias.
     * @returns {Promise} An promise for a zarr array containing the aliased names.
     */
    async loadVarAlias(varPath, matrixPath) {
        if (!this.varAlias) {
            this.varAlias = {};
        }
        if (this.varAlias[varPath]) {
            return this.varAlias[varPath];
        }
        const [varAliasData] = await this.loadVarColumns([varPath]);
        this.varAlias[varPath] = varAliasData;
        const index = await this.loadVarIndex(matrixPath);
        this.varAlias[varPath] = this.varAlias[varPath].map((val, ind) => (val ? val.concat(` (${index[ind]})`) : index[ind]));
        return this.varAlias[varPath];
    }
}
