// @ts-check
/* eslint-disable no-underscore-dangle */
import { AnnDataSource } from '@vitessce/zarr';

/** @import { DataSourceParams } from '@vitessce/types' */

// If the array path starts with table/something/rest
// capture table/something.
const pluralRegex = /^tables\/([^/]*)(\/?)(.*)$/;
const singularRegex = /^table\/([^/]*)(\/?)(.*)$/;

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getTablePrefix(arrPath) {
  if (arrPath) {
    // First try the plural "tables/{something}"
    const pluralMatches = arrPath.match(pluralRegex);
    if (pluralMatches && pluralMatches.length >= 3) {
      return `tables/${pluralMatches[1]}/`;
    }
    const singularMatches = arrPath.match(singularRegex);
    if (singularMatches && singularMatches.length >= 3) {
      return `table/${singularMatches[1]}/`;
    }
  }
  // TODO: what to do here when there are multiple tables?
  // ObsSetsAnndataLoader will need to pass a path to loadObsIndex().
  return 'table/table/';
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
export function getObsPath(arrPath) {
  return `${getTablePrefix(arrPath)}obs`;
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
export function getVarPath(arrPath) {
  return `${getTablePrefix(arrPath)}var`;
}

export default class SpatialDataTableSource extends AnnDataSource {
  /**
   *
   * @param {DataSourceParams} params
   */
  constructor(params) {
    super(params);
    /** @type {{ [k: string]: Promise<string[]> }} */
    this.obsIndices = {};
    /** @type {{ [k: string]: Promise<string[]> }} */
    this.varIndices = {};
    /** @type {{ [k: string]: string[] }} */
    this.varAliases = {};
  }

  /**
   *
   * @param {string} tablePath
   * @returns
   */
  async loadSpatialDataAttrs(tablePath) {
    return this._loadDict(`${tablePath}uns/spatialdata_attrs`, ['instance_key', 'region', 'region_key']);
  }

  /**
   * Class method for loading the obs index.
   * @param {string|undefined} path
   * @returns {Promise<string[]>} An promise for a zarr array containing the indices.
   */
  async loadObsIndex(path = undefined) {
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

    if (indexPath in this.obsIndices) {
      return this.obsIndices[indexPath];
    }
    this.obsIndices[indexPath] = this._loadColumn(indexPath);
    return this.obsIndices[indexPath];
  }

  /**
   * Class method for loading the var index.
   * @param {string|undefined} path
   * @returns {Promise<string[]>} An promise for a zarr array containing the indices.
   */
  loadVarIndex(path = undefined) {
    const varPath = getVarPath(path);
    if (varPath in this.varIndices) {
      return this.varIndices[varPath];
    }
    this.varIndices[varPath] = this.getJson(`${varPath}/.zattrs`)
      .then(({ _index }) => this.getFlatArrDecompressed(`${varPath}/${_index}`));
    return this.varIndices[varPath];
  }

  /**
   * Class method for loading the var alias.
   * @param {string} varPath
   * @param {string} matrixPath
   * @returns {Promise<string[]>} An promise for a zarr array containing the aliased names.
   */
  async loadVarAlias(varPath, matrixPath) {
    if (varPath in this.varAliases) {
      return this.varAliases[varPath];
    }
    const [varAliasData] = await this.loadVarColumns([varPath]);
    this.varAliases[varPath] = /** @type {string[]} */ (varAliasData);
    const index = await this.loadVarIndex(matrixPath);
    this.varAliases[varPath] = this.varAliases[varPath].map(
      (val, ind) => (val ? val.concat(` (${index[ind]})`) : index[ind]),
    );
    return this.varAliases[varPath];
  }
}
