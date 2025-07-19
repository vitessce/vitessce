// @ts-check
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
import { basename } from '@vitessce/zarr';
import { normalizeAxes } from '@vitessce/spatial-utils';
import AbstractSpatialDataSource from './AbstractSpatialDataSource.js';

/** @import { DataSourceParams } from '@vitessce/types' */
/** @import { TypedArray as ZarrTypedArray, Chunk } from 'zarrita' */


/*
 * Notes from https://spatialdata.scverse.org/en/stable/design_doc.html#points as of July 18, 2025:
 *
 * > This representation is still under discussion and it might change...
 * > Coordinates of points for single molecule data.
 * > Each observation is a point, and might have additional information (intensity etc.).
 * > Current implementation represent points as a Parquet file and a dask.dataframe.DataFrame in memory.
 * > The requirements are the following:
 * > - The table MUST contains axis name to represent the axes.
 * >     - If it’s 2D, the axes should be ["x","y"].
 * >     - If it’s 3D, the axes should be ["x","y","z"].
 * > - It MUST also contains coordinates transformations in dask.dataframe.DataFrame().attrs["transform"].
 * > Additional information is stored in dask.dataframe.DataFrame().attrs["spatialdata_attrs"]
 * > - It MAY also contains "feature_key", that is, the column name of the table that refers to the features.
 * >     - This Series MAY be of type pandas.Categorical.
 * > - It MAY contains additional information in dask.dataframe.DataFrame().attrs["spatialdata_attrs"], specifically:
 * >     - "instance_key": the column name of the table where unique instance ids that this point refers to are stored, if available.
 */


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
 * Converts BigInt64Array or Float64Array to Float32Array if needed.
 * @param {Array<number>} input - The typed array to convert.
 * @returns {Float32Array} - The converted or original Float32Array.
 */
function toFloat32Array(input) {
  if (input instanceof Float32Array) {
    return input; // Already a Float32Array
  }

  if (input instanceof BigInt64Array) {
    const floats = new Float32Array(input.length);
    for (let i = 0; i < input.length; i++) {
      floats[i] = Number(input[i]); // May lose precision
    }
    return floats;
  }

  if (input instanceof Float64Array) {
    return new Float32Array(input); // Converts with reduced precision
  }

  throw new TypeError('Input must be Float32Array, Float64Array, or BigInt64Array');
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
    if (encodingType === 'ngff:points' && !(formatVersion === '0.1')) {
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

    const zattrs = await this.loadSpatialDataElementAttrs(elementPath);
    const { axes, spatialdata_attrs: spatialDataAttrs } = zattrs;
    const normAxes = normalizeAxes(axes);
    const axisNames = normAxes.map((/** @type {{ name: string }} */ axis) => axis.name);

    const { feature_key: featureKey } = spatialDataAttrs;

    const columnNames = [...axisNames, featureKey].filter(Boolean);
    const arrowTable = await this.loadParquetTable(parquetPath, columnNames);

    // TODO: this table will also contain the index column, and potentially the featureKey column.
    // Do something with these here, otherwise they will need to be loaded redundantly.

    const axisColumnArrs = axisNames.map((/** @type {string} */ name) => {
      const column = arrowTable.getChild(name);
      if (!column) {
        throw new Error(`Column "${name}" not found in the arrow table.`);
      }
      return toFloat32Array(column.toArray());
    });

    return {
      shape: [axisColumnArrs.length, arrowTable.numRows],
      data: axisColumnArrs,
    };
  }
}
