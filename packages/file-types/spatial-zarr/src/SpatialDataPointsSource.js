// @ts-check
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
import { basename } from '@vitessce/zarr';
import AbstractSpatialDataSource from './AbstractSpatialDataSource.js';

/** @import { DataSourceParams } from '@vitessce/types' */
/** @import { TypedArray as ZarrTypedArray, Chunk } from 'zarrita' */


// If the array path starts with table/something/rest
// capture table/something.


const pointsElementRegex = /^points\/([^/]*)$/;
const pointsSubElementRegex = /^points\/([^/]*)\/(.*)$/;

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getPointsElementPath(arrPath) {
  if (arrPath) {
    const matches = arrPath.match(pointsSubElementRegex);
    if (matches && matches.length === 3) {
      return `points/${matches[1]}`;
    }
    const elementMatches = arrPath.match(pointsElementRegex);
    if (elementMatches && elementMatches.length === 2) {
      return `points/${elementMatches[1]}`;
    }
  }
  return ''; // TODO: throw an error?
}


/**
 * TODO: remove this function once loadObsIndex is correctly implemented.
 * @param {string|undefined} arrPath
 * @returns
 */
function getIndexPath(arrPath) {
  return `${getPointsElementPath(arrPath)}/Index`;
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getParquetPath(arrPath) {
  const elementPrefix = getPointsElementPath(arrPath);
  if (elementPrefix.startsWith('points/')) {
    return `${elementPrefix}/points.parquet`;
  }
  throw new Error(`Cannot determine parquet path for points array path: ${arrPath}`);
}

/**
 * Converts a BigInt64Array to a Float32Array if needed.
 * @param {any} input - The typed array to convert.
 * @returns {Float32Array} - The converted or original Float32Array.
 */
function toFloat32Array(input) {
  if (input instanceof BigInt64Array) {
    const floats = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) {
      floats[i] = Number(input[i]); // May lose precision for large BigInts
    }
    return floats;
  }

  return new Float32Array(input);
}


export default class SpatialDataPointsSource extends AbstractSpatialDataSource {

  /**
   *
   * @param {string} path A path to within shapes.
   * @returns {Promise<"0.1">} The format version.
   */
  async getPointsFormatVersion(path) {
    const zattrs = await this.loadSpatialDataElementAttrs(path);
    const formatVersion = zattrs.spatialdata_attrs.version;
    const encodingType = zattrs['encoding-type'];
    if (encodingType === "ngff:points" && !(formatVersion === '0.1')) {
      throw new Error(
        `Unexpected version for points spatialdata_attrs: ${formatVersion}`,
      );
    }
    return formatVersion;
  }

  /**
   * Class method for loading the obs index.
   * @param {string|undefined} path
   * @param {string|undefined} tablePath
   * @returns {Promise<string[]>} An promise for a zarr array containing the indices.
   */
  async loadObsIndex(path = undefined, tablePath = undefined) {

    // TODO: if a tablePath is provided, use it to load the obsIndex.
    // Otherwise use the index column from the parquet table.

    let indexPath = getIndexPath(path);
    if (tablePath) {

      // TODO: simplify by reusing SpatialDataTableSource.loadObsIndex?

      // TODO: given a path to the shapes,
      // is there a better way to know which table annotates it
      // (without the manually-specified table path)?
      // Reference: https://github.com/scverse/spatialdata/issues/298#issuecomment-1718161329
      const obsPath = `${tablePath}/obs`;
      const { _index } = await this.getJson(`${obsPath}/.zattrs`);
      indexPath = `${obsPath}/${_index}`;
      const {
        instance_key: instanceKey,
        // TODO: filter table index by region and element type.
        // region_key: regionKey,
        // region,
      } = await this.loadSpatialDataElementAttrs(tablePath);

      indexPath = `${obsPath}/${instanceKey}`;
    }
    // TODO: support loading from parquet if no tablePath was provided.
    return this._loadColumn(indexPath);
  }

  /**
   * Class method for loading general numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @returns {Promise<Chunk<any>>} A promise for a zarr array containing the data.
   */
  async loadNumeric(path) {
    const parquetPath = getParquetPath(path);
    const arrowTable = await this.loadParquetTable(parquetPath);
    const columnArr = arrowTable.getChild(basename(path))?.toArray();
    return {
      shape: [columnArr.length],
      // TODO: support other kinds of TypedArrays via @vitessce/arrow-utils.
      data: toFloat32Array(columnArr),
      stride: [1],
    };
  }

  /**
   *
   * @param {string} elementPath The path to the points element,
   * like "points/element_name".
   * @returns {Promise<{
   *  data: [ZarrTypedArray<any>, ZarrTypedArray<any>],
   *  shape: [number, number],
   * }>} A promise for a zarr array containing the data.
   */
  async loadPoints(elementPath) {
    const parquetPath = getParquetPath(elementPath);
    const arrowTable = await this.loadParquetTable(parquetPath);

    console.log(parquetPath, arrowTable);
    const xColumn = arrowTable.getChild('x');
    const yColumn = arrowTable.getChild('y');
    const zColumn = arrowTable.getChild('z');

    const xColumnArr = xColumn?.toArray();
    const yColumnArr = yColumn?.toArray();
    const zColumnArr = zColumn?.toArray();

    const xColumnF32Arr = toFloat32Array(xColumnArr);
    const yColumnF32Arr = toFloat32Array(yColumnArr);
    const zColumnF32Arr = toFloat32Array(zColumnArr);

    // TODO: use the z column
    
    return {
      shape: [2, arrowTable.numRows],
      data: [
        xColumnF32Arr,
        yColumnF32Arr,
      ],
    };
  }
}
