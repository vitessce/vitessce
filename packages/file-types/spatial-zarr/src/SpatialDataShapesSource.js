// @ts-check
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import WKB from 'ol/format/WKB.js';
import { basename } from '@vitessce/zarr';
import SpatialDataTableSource from './SpatialDataTableSource.js';

/** @import { TypedArray as ZarrTypedArray, Chunk } from 'zarrita' */


// If the array path starts with table/something/rest
// capture table/something.

const shapesElementRegex = /^shapes\/([^/]*)$/;
const shapesSubElementRegex = /^shapes\/([^/]*)\/(.*)$/;

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getShapesElementPath(arrPath) {
  if (arrPath) {
    const matches = arrPath.match(shapesSubElementRegex);
    if (matches && matches.length === 3) {
      return `shapes/${matches[1]}`;
    }
    const elementMatches = arrPath.match(shapesElementRegex);
    if (elementMatches && elementMatches.length === 2) {
      return `shapes/${elementMatches[1]}`;
    }
  }
  return ''; // TODO: throw an error?
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getIndexPath(arrPath) {
  return `${getShapesElementPath(arrPath)}/Index`;
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getParquetPath(arrPath) {
  const elementPrefix = getShapesElementPath(arrPath);
  if (elementPrefix.startsWith('shapes/')) {
    return `${elementPrefix}/shapes.parquet`;
  }
  throw new Error(`Cannot determine parquet path for shapes array path: ${arrPath}`);
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

export default class SpatialDataShapesSource extends SpatialDataTableSource {
  /**
   *
   * @param {string} path A path to within shapes.
   * @returns {Promise<"0.1"|"0.2">} The format version.
   */
  async getShapesFormatVersion(path) {
    const zattrs = await this.loadSpatialDataElementAttrs(path);
    const formatVersion = zattrs.spatialdata_attrs.version;
    const geos = zattrs.spatialdata_attrs.geos || {}; // Used only by v0.1
    const encodingType = zattrs['encoding-type'];
    if (encodingType !== 'ngff:shapes' || !(
      (formatVersion === '0.1' && (geos.name === 'POINT' && geos.type === 0))
      || formatVersion === '0.2'
    )) {
      throw new Error(
        `Unexpected encoding type or version for shapes spatialdata_attrs: ${encodingType} ${formatVersion}`,
      );
    }
    return formatVersion;
  }

  /**
   * Class method for loading general numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @returns {Promise<Chunk<any>>} A promise for a zarr array containing the data.
   */
  async loadNumeric(path) {
    const elementPath = getShapesElementPath(path);
    const formatVersion = await this.getShapesFormatVersion(elementPath);
    if (formatVersion === '0.1') {
      // Shapes v0.1 did not use Parquet, so we use the parent Zarr-based column loading function.
      const zarrArr = await super.loadNumeric(path);
      // TODO: move BigInt conversion into superclass
      return {
        stride: zarrArr.stride,
        shape: zarrArr.shape,
        data: toFloat32Array(/** @type {number[]} */ (zarrArr.data)),
      };
    }
    const parquetPath = getParquetPath(path);
    const columnName = basename(path);
    const columns = [columnName];
    const arrowTable = await this.loadParquetTable(parquetPath, columns);
    const columnArr = arrowTable.getChild(columnName)?.toArray();
    return {
      shape: [columnArr.length],
      // TODO: support other kinds of TypedArrays via @vitessce/arrow-utils.
      data: toFloat32Array(columnArr),
      stride: [1],
    };
  }

  /**
   * Helper to get geometry column from Arrow table and check type.
   * @param {import('apache-arrow').Table} arrowTable
   * @param {string} columnName
   * @returns {import('apache-arrow').Vector}
   */
  // eslint-disable-next-line class-methods-use-this
  _getGeometryColumn(arrowTable, columnName) {
    const geometryColumn = arrowTable.getChild(columnName);
    if (!geometryColumn) {
      throw new Error(`Column ${columnName} not found in parquet table`);
    }
    if (geometryColumn.type.toString() !== 'Binary') {
      throw new Error(`Expected geometry column to have Binary type but got ${geometryColumn.type.toString()}`);
    }
    return geometryColumn;
  }

  /**
   * Helper to check if geometry column is WKB encoded.
   * @param {import('apache-arrow').Table} arrowTable
   * @param {string} columnName
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  _isWkbColumn(arrowTable, columnName) {
    // From GeoPandas.to_parquet docs:
    // "By default, all geometry columns present are serialized to WKB format in the file"
    // Reference: https://geopandas.org/en/stable/docs/reference/api/geopandas.GeoDataFrame.to_parquet.html
    // TODO: support geoarrow serialization schemes in addition to WKB.

    // Check if the column has metadata indicating it is WKB encoded.
    // Reference: https://github.com/geopandas/geopandas/blob/6ab5a7145fa788d049a805f114bc46c6d0ed4507/geopandas/io/arrow.py#L172
    return arrowTable.schema.fields
      .find(field => field.name === columnName)
      ?.metadata?.get('ARROW:extension:name') === 'geoarrow.wkb';
  }

  /**
   * Helper to decode WKB geometry column as flat coordinates (for points).
   * @param {import('apache-arrow').Vector} geometryColumn
   * @returns {[number, number][]} Array of [x, y] coordinates.
   */
  // eslint-disable-next-line class-methods-use-this
  _decodeWkbColumnFlat(geometryColumn) {
    const wkb = new WKB();
    const arr = geometryColumn.toArray();
    return arr.map(
      (/** @type {ArrayBuffer} */ geom) => /** @type {[number, number]} */ (
        (/** @type {any} */ (wkb.readGeometry(geom))).getFlatCoordinates()
      ),
    );
  }

  /**
   * Helper to decode WKB geometry column as nested coordinates (for polygons).
   * @param {import('apache-arrow').Vector} geometryColumn
   * @returns {[number, number][][]} Array of polygons, each as array of [x, y] pairs.
   */
  // eslint-disable-next-line class-methods-use-this
  _decodeWkbColumnNested(geometryColumn) {
    const wkb = new WKB();
    const arr = geometryColumn.toArray();
    // For polygons: getCoordinates returns nested arrays

    // TODO: alternatively, use positionFormat: 'XY' and return flat coordinates again.
    // However this may complicate applying transformations, at least in the current way.
    // Reference: https://deck.gl/docs/api-reference/layers/polygon-layer#data-accessors
    return arr.map(
      (/** @type {ArrayBuffer} */ geom) => {
        const coords = /** @type {Array<Array<Array<number>>>} */ (
          (/** @type {any} */ (wkb.readGeometry(geom))).getCoordinates()
        );
        // Take first polygon (if multipolygon)
        return coords[0];
      },
    );
  }

  /**
   *
   * @param {string} elementPath
   * @returns {Promise<Array<any>|null>}
   */
  async loadShapesIndex(elementPath) {
    const formatVersion = await this.getShapesFormatVersion(elementPath);
    if (formatVersion === '0.1') {
      // Shapes v0.1 did not use Parquet, so we use the parent Zarr-based column loading function.
      return this._loadColumn(getIndexPath(elementPath));
    }

    const parquetPath = getParquetPath(elementPath);
    const indexColumn = await this.loadParquetTableIndex(parquetPath);
    if (indexColumn) {
      return indexColumn.toArray();
    }
    return null;
  }

  /**
   *
   * @param {string} path
   * @returns {Promise<{
   *  data: [number, number][][],
   *  shape: [number, null],
   * }>} A promise for a zarr array containing the data.
   */
  async loadPolygonShapes(path) {
    const columnName = basename(path);
    const parquetPath = getParquetPath(path);
    const arrowTable = await this.loadParquetTable(parquetPath);
    const geometryColumn = this._getGeometryColumn(arrowTable, columnName);
    if (this._isWkbColumn(arrowTable, columnName)) {
      // If the geometry column is WKB encoded, decode it.
      const polygons = this._decodeWkbColumnNested(geometryColumn);
      // Return polygons as a ragged array.
      return {
        shape: [polygons.length, null], // Ragged array
        data: polygons,
      };
    }
    throw new Error('Unexpected encoding type for polygons, currently only WKB is supported');
  }

  /**
   *
   * @param {string} path
   * @returns {Promise<{
   *  data: [ZarrTypedArray<any>, ZarrTypedArray<any>],
   *  shape: [number, number],
   * }>} A promise for a zarr array containing the data.
   */
  async loadCircleShapes(path) {
    const columnName = basename(path);
    const parquetPath = getParquetPath(path);

    // TODO: specify columns here. TODO: also include the radius column if needed.
    // TODO: refactor to not load the table twice when radius is needed.

    const arrowTable = await this.loadParquetTable(parquetPath);
    const geometryColumn = this._getGeometryColumn(arrowTable, columnName);
    if (this._isWkbColumn(arrowTable, columnName)) {
      // If the geometry column is WKB encoded, decode it.
      const points = this._decodeWkbColumnFlat(geometryColumn);
      // Return flat coordinates as a 2D array.
      return {
        shape: [2, points.length],
        data: [
          toFloat32Array(points.map((/** @type {[number, number]} */ p) => p[0])),
          toFloat32Array(points.map((/** @type {[number, number]} */ p) => p[1])),
        ],
      };
    }
    throw new Error('Unexpected encoding type for circles, currently only WKB is supported');
  }
}
