// @ts-check
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import AbstractSpatialDataSource from './AbstractSpatialDataSource.js';

/** @import { DataSourceParams } from '@vitessce/types' */

// If the array path starts with table/something/rest
// capture table/something.
const pluralSubElementRegex = /^tables\/([^/]*)\/(.*)$/;
const singularSubElementRegex = /^table\/([^/]*)\/(.*)$/;

const pluralRegex = /^tables\/([^/]*)$/;
const singularRegex = /^table\/([^/]*)$/;

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getTableElementPath(arrPath) {
  if (arrPath) {
    // First try the plural "tables/{something}/{arr}"
    const pluralMatches = arrPath.match(pluralSubElementRegex);
    if (pluralMatches && pluralMatches.length === 3) {
      return `tables/${pluralMatches[1]}`;
    }
    // Then try the plural "tables/{something}"
    const pluralElementMatches = arrPath.match(pluralRegex);
    if (pluralElementMatches && pluralElementMatches.length === 2) {
      return `tables/${pluralElementMatches[1]}`;
    }
    // Then try the singular "table/{something}/{arr}"
    const singularMatches = arrPath.match(singularSubElementRegex);
    if (singularMatches && singularMatches.length === 3) {
      return `table/${singularMatches[1]}`;
    }
    // Finally try the singular "table/{something}"
    const singularElementMatches = arrPath.match(singularRegex);
    if (singularElementMatches && singularElementMatches.length === 2) {
      return `table/${singularElementMatches[1]}`;
    }
  }
  return ''; // TODO: throw an error?
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getObsPath(arrPath) {
  return `${getTableElementPath(arrPath)}/obs`;
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getVarPath(arrPath) {
  return `${getTableElementPath(arrPath)}/var`;
}

export default class SpatialDataTableSource extends AbstractSpatialDataSource {
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
    } = await this.loadSpatialDataElementAttrs(getTableElementPath(path));

    if (instanceKey !== undefined && instanceKey !== null) {
      // Use a specific instanceKey column for the index if
      // defined according to spatialdata_attrs metadata.
      indexPath = `${obsPath}/${instanceKey}`;
    }

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
