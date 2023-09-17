import AnnDataSource from './AnnDataSource.js';

// If the array path starts with table/something/rest
// capture table/something.
const regex = /^shapes\/([^/]*)\/(.*)$/;

function getShapesPrefix(arrPath) {
  if (arrPath) {
    const matches = arrPath.match(regex);
    if (matches && matches.length === 3) {
      return `shapes/${matches[1]}/`;
    }
  }
  return '';
}
export function getIndexPath(arrPath) {
  return `${getShapesPrefix(arrPath)}Index`;
}

export function getVarPath(arrPath) {
  return `${getShapesPrefix(arrPath)}var`;
}



export default class SpatialDataShapesSource extends AnnDataSource {

  async loadSpatialDataAttrs(tablePath) {
    return await this._loadDict(`${tablePath}/uns/spatialdata_attrs`, ['instance_key', 'region', 'region_key']);
  }

  /**
   * Class method for loading the obs index.
   * @returns {Promise} An promise for a zarr array containing the indices.
   */
  async loadObsIndex(path = null, tablePath = null) {
    if (!this.obsIndex) {
      this.obsIndex = {};
    }

    let indexPath = getIndexPath(path);
    if(tablePath) {
      // TODO: given a path to the shapes,
      // is there a better way to know which table annotates it
      // (without the manually-specified table path)?
      // Reference: https://github.com/scverse/spatialdata/issues/298#issuecomment-1718161329
      const obsPath = `${tablePath}/obs`;
      const { _index } = await this.getJson(`${obsPath}/.zattrs`);
      indexPath = `${obsPath}/${_index}`;

      const {
        instance_key: instanceKey,
        region_key: regionKey,
        region,
      } = await this.loadSpatialDataAttrs(tablePath);
      // TODO: filter table index by region and element type.

      indexPath = `${obsPath}/${instanceKey}`;
    }
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
