// @ts-ignore
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import { basename } from '@vitessce/zarr';
import { normalizeAxes } from '@vitessce/spatial-utils';
import SpatialDataTableSource from './SpatialDataTableSource.js';
import { downcastIfBigIntArray } from './utils.js';

/** @import { TypedArray as ZarrTypedArray, Chunk } from 'zarrita' */

/*
 * Notes from https://spatialdata.scverse.org/en/stable/design_doc.html#points as of July 18, 2025:
 *
 * > This representation is still under discussion and it might change...
 * > Coordinates of points for single molecule data.
 * > Each observation is a point, and might have additional information
 * > (intensity etc.).
 * > Current implementation represent points as a Parquet file and a
 * > dask.dataframe.DataFrame in memory.
 * > The requirements are the following:
 * > - The table MUST contains axis name to represent the axes.
 * >     - If it’s 2D, the axes should be ["x","y"].
 * >     - If it’s 3D, the axes should be ["x","y","z"].
 * > - It MUST also contains coordinates transformations in
 * >   dask.dataframe.DataFrame().attrs["transform"].
 * > Additional information is stored in
 * > dask.dataframe.DataFrame().attrs["spatialdata_attrs"]
 * > - It MAY also contains "feature_key", that is, the column name of
 * >   the table that refers to the features.
 * >     - This Series MAY be of type pandas.Categorical.
 * > - It MAY contains additional information in
 * >   dask.dataframe.DataFrame().attrs["spatialdata_attrs"], specifically:
 * >     - "instance_key": the column name of the table where unique
 * >       instance ids that this point refers to are stored, if available.
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


export default class SpatialDataPointsSource extends SpatialDataTableSource {
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
   * Class method for loading general numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @returns {Promise<Chunk<any>>} A promise for a zarr array containing the data.
   */
  async loadNumeric(path) {
    const parquetPath = getParquetPath(path);
    const columnName = basename(path);
    const columns = [columnName];
    const arrowTable = await this.loadParquetTable(parquetPath, columns);
    const columnArr = arrowTable.getChild(columnName)?.toArray();
    return {
      shape: [columnArr.length],
      // TODO: support other kinds of TypedArrays via @vitessce/arrow-utils.
      data: columnArr,
      stride: [1],
    };
  }

  /**
   *
   * @param {string} elementPath
   * @returns {Promise<Array<any>|null>}
   */
  async loadPointsIndex(elementPath) {
    const parquetPath = getParquetPath(elementPath);
    const indexColumn = await this.loadParquetTableIndex(parquetPath);
    if (indexColumn) {
      return indexColumn.toArray();
    }
    return null;
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
  async loadPoints(elementPath, featureIndexColumnNameFromOptions) {
    const parquetPath = getParquetPath(elementPath);

    const zattrs = await this.loadSpatialDataElementAttrs(elementPath);
    const { axes, spatialdata_attrs: spatialDataAttrs } = zattrs;
    const normAxes = normalizeAxes(axes);
    const axisNames = normAxes.map((/** @type {{ name: string }} */ axis) => axis.name);

    const { feature_key: featureKey } = spatialDataAttrs;

    // eslint-disable-next-line no-unused-vars
    const featureIndexColumnName = (
      featureIndexColumnNameFromOptions
      // Reference: https://github.com/vitessce/vitessce-python/blob/adb066c088307b658a45ca9cf2ab2d63effaa5ef/src/vitessce/data_utils/spatialdata_points_zorder.py#L458C15-L458C35
        ?? `${featureKey}_codes`
    );

    const columnNames = [...axisNames, featureKey].filter(Boolean);
    const arrowTable = await this.loadParquetTable(parquetPath, columnNames);

    // TODO: this table will also contain the index column, and potentially the featureKey column.
    // Do something with these here, otherwise they will need to be loaded redundantly.

    const axisColumnArrs = axisNames.map((/** @type {string} */ name) => {
      const column = arrowTable.getChild(name);
      if (!column) {
        throw new Error(`Column "${name}" not found in the arrow table.`);
      }
      return downcastIfBigIntArray(column.toArray());
    });

    return {
      shape: [axisColumnArrs.length, arrowTable.numRows],
      data: axisColumnArrs,
    };
  }

  /**
   *
   * @param {string} elementPath
   * @param {{ left: number, top: number, right: number, bottom: number }} tileBbox
   * @returns {Promise<{
   *  data: [ZarrTypedArray<any>, ZarrTypedArray<any>],
   *  shape: [number, number],
   * }>} A promise for a zarr array containing the data.
   */
  async loadPointsInRect(
    elementPath, tileBbox, signal,
    featureIndexColumnNameFromOptions, mortonCodeColumn,
  ) {
    // Morton code rect querying functionality.
    // Reference: https://github.com/vitessce/vitessce-python/pull/476
    const parquetPath = getParquetPath(elementPath);
    const zattrs = await this.loadSpatialDataElementAttrs(elementPath);
    const {
      // axes,
      spatialdata_attrs: spatialDataAttrs,
      // The bounding box (extent) of all points.
      // Required for un-normalization from uints back to floats.
      // TODO: decide whether these will be stored here or somewhere else.
      // Reference: https://github.com/vitessce/vitessce-python/pull/476#issuecomment-3362656956
      bounding_box: allPointsBbox,
    } = zattrs;
    // const normAxes = normalizeAxes(axes);
    // const axisNames = normAxes.map((/** @type {{ name: string }} */ axis) => axis.name);
    // const { feature_key: featureKey } = spatialDataAttrs;
    // const columnNames = [...axisNames, featureKey].filter(Boolean);

    const { feature_key: featureKey } = spatialDataAttrs;

    // Reference: https://github.com/vitessce/vitessce-python/blob/adb066c088307b658a45ca9cf2ab2d63effaa5ef/src/vitessce/data_utils/spatialdata_points_zorder.py#L458C15-L458C35
    const featureIndexColumnName = (
      featureIndexColumnNameFromOptions
      ?? `${featureKey}_codes`
    );

    return this.loadParquetTableInRect(
      parquetPath, tileBbox, allPointsBbox, signal,
      featureIndexColumnName, mortonCodeColumn,
    );
  }

  async supportsLoadPointsInRect(elementPath, featureIndexColumnName, mortonCodeColumn) {
    const parquetPath = getParquetPath(elementPath);
    return this._supportsTiledPoints(parquetPath, featureIndexColumnName, mortonCodeColumn);
  }
}
