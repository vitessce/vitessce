import { dirname } from './utils';
import AnnDataSource from './AnnDataSource';

export default class MuDataSource extends AnnDataSource {
  /**
   * Class method for loading the obs index.
   * @returns {Promise} An promise for a zarr array containing the indices.
   */
  loadObsIndex(path = null) {
    if (!this.obsIndex) {
      this.obsIndex = {};
    }
    if (this.obsIndex[path]) {
      return this.obsIndex[path];
    }
    const obsPath = path ? `${dirname(path)}/obs` : 'obs';
    this.obsIndex[path] = this.getJson(`${obsPath}/.zattrs`)
      .then(({ _index }) => this.getFlatArrDecompressed(`${obsPath}/${_index}`));
    return this.obsIndex[path];
  }

  /**
   * Class method for loading the var index.
   * @returns {Promise} An promise for a zarr array containing the indices.
   */
  loadVarIndex(path = null) {
    if (!this.varIndex) {
      this.varIndex = {};
    }
    if (this.varIndex[path]) {
      return this.varIndex[path];
    }
    const varPath = `${dirname(path)}/var`;
    this.varIndex[path] = this.getJson(`${varPath}/.zattrs`)
      .then(({ _index }) => this.getFlatArrDecompressed(`${varPath}/${_index}`));
    return this.varIndex[path];
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
    this.varAlias[varPath] = this.varAlias[varPath].map(
      (val, ind) => (val ? val.concat(` (${index[ind]})`) : index[ind]),
    );
    return this.varAlias[varPath];
  }
}
