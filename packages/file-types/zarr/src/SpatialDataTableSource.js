import AnnDataSource from './AnnDataSource.js';

// If the array path starts with table/something/rest
// capture table/something.
const regex = /^table\/([^/]*)\/(.*)$/;

function getTablePrefix(arrPath) {
  if (arrPath) {
    const matches = arrPath.match(regex);
    if (matches && matches.length === 3) {
      return `table/${matches[1]}/`;
    }
  }
  return '';
}
export function getObsPath(arrPath) {
  return `${getTablePrefix(arrPath)}obs`;
}

export function getVarPath(arrPath) {
  return `${getTablePrefix(arrPath)}var`;
}

export default class SpatialDataTableSource extends AnnDataSource {
  async loadSpatialDataAttrs(tablePath) {
    return this._loadDict(`${tablePath}uns/spatialdata_attrs`, ['instance_key', 'region', 'region_key']);
  }

  /**
   * Class method for loading the obs index.
   * @returns {Promise} An promise for a zarr array containing the indices.
   */
  async loadObsIndex(path = null) {
    if (!this.obsIndex) {
      this.obsIndex = {};
    }
    const obsPath = getObsPath(path);
    const { _index } = await this.getJson(`${obsPath}/.zattrs`);
    let indexPath = `${obsPath}/${_index}`;

    const {
      instance_key: instanceKey,
      // TODO: filter table index by region and element type.
      // region_key: regionKey,
      // region,
    } = await this.loadSpatialDataAttrs(getTablePrefix(path));

    indexPath = `${obsPath}/${instanceKey}`;

    if (this.obsIndex[indexPath]) {
      return this.obsIndex[indexPath];
    }
    this.obsIndex[indexPath] = this._loadColumn(indexPath);
    return this.obsIndex[indexPath];
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
    this.varAlias[varPath] = this.varAlias[varPath].map(
      (val, ind) => (val ? val.concat(` (${index[ind]})`) : index[ind]),
    );
    return this.varAlias[varPath];
  }
}
