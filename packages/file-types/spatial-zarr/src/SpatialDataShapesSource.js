// @ts-check
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
import WKB from 'ol/format/WKB.js';
import { basename } from '@vitessce/zarr';
import AbstractSpatialDataSource from './AbstractSpatialDataSource.js';

/** @import { DataSourceParams } from '@vitessce/types' */
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

export default class SpatialDataShapesSource extends AbstractSpatialDataSource {
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
    if (encodingType !== "ngff:shapes" || !(
      formatVersion === '0.1' && (geos.name === 'POINT' && geos.type === 0)
      || formatVersion === '0.2'
    )) {
      throw new Error(
        `Unexpected encoding type or version for shapes spatialdata_attrs: ${encodingType} ${formatVersion}`,
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
    const formatVersion = await this.getShapesFormatVersion(path);
    if (formatVersion === '0.1') {
      // Shapes v0.1 did not use Parquet, so we use the parent Zarr-based column loading function.
      return super.loadNumeric(path);
    }
    const parquetPath = getParquetPath(path);
    const arrowTable = await this.loadParquetTable(parquetPath);
    const columnArr = arrowTable.getChild(basename(path))?.toArray();
    return {
      shape: [columnArr.length],
      // TODO: support other kinds of TypedArrays via @vitessce/arrow-utils.
      // TODO: support BigInt64Array.
      data: new Float32Array(columnArr),
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
    const arrowTable = await this.loadParquetTable(parquetPath);
    const geometryColumn = this._getGeometryColumn(arrowTable, columnName);
    if (this._isWkbColumn(arrowTable, columnName)) {
      // If the geometry column is WKB encoded, decode it.
      const points = this._decodeWkbColumnFlat(geometryColumn);
      // Return flat coordinates as a 2D array.
      return {
        shape: [2, points.length],
        data: [
          new Float32Array(points.map((/** @type {[number, number]} */ p) => p[0])),
          new Float32Array(points.map((/** @type {[number, number]} */ p) => p[1])),
        ],
      };
    }
    throw new Error('Unexpected encoding type for circles, currently only WKB is supported');
  }
}
