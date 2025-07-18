// @ts-check
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
import { tableFromIPC } from 'apache-arrow';
import WKB from 'ol/format/WKB.js';
import { AnnDataSource, basename } from '@vitessce/zarr';

/** @import { DataSourceParams } from '@vitessce/types' */
/** @import { TypedArray as ZarrTypedArray, Chunk } from 'zarrita' */

async function getReadParquet() {
  // Reference: https://observablehq.com/@kylebarron/geoparquet-on-the-web
  // TODO: host somewhere we control, like cdn.vitessce.io?
  // @ts-ignore
  const module = await import(/* webpackIgnore: true */ 'https://unpkg.com/parquet-wasm@0.6.1/esm/parquet_wasm.js');
  await module.default();
  // We cannot use regulary dynamic import here because it breaks NextJS builds
  // due to pointing to a remote URL.
  // I could not figure out a NextJS webpack configuration to resolve it.
  // The following becomes inlined by Vite in library mode
  // eliminating the benefit of dynamic import.
  // Reference: https://github.com/vitejs/vite/issues/4454
  // const responsePromise = await fetch(
  //   new URL('parquet-wasm/esm/parquet_wasm_bg.wasm', import.meta.url).href
  // );
  // const responsePromise = await fetch('https://unpkg.com/parquet-wasm@0.6.1/esm/parquet_wasm_bg.wasm');
  // const wasmBuffer = await responsePromise.arrayBuffer();
  // module.initSync(wasmBuffer);
  // Another issue is that when we import parquet-wasm JS from node_modules,
  // running module.default there is a MIME type issue because the Vite dev
  // server does not serve the .wasm with a MIME type of application/wasm.
  // I can't seem to get a custom Vite plugin that sets the MIME type in
  // request headers to work.
  return module.readParquet;
}

// If the array path starts with table/something/rest
// capture table/something.

const elementRegex = /^shapes\/([^/]*)$/;
const subElementRegex = /^shapes\/([^/]*)\/(.*)$/;

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
function getShapesPrefix(arrPath) {
  if (arrPath) {
    const matches = arrPath.match(subElementRegex);
    if (matches && matches.length === 3) {
      return `shapes/${matches[1]}/`;
    }
    const elementMatches = arrPath.match(elementRegex);
    if (elementMatches && elementMatches.length === 2) {
      return `shapes/${elementMatches[1]}/`;
    }
  }
  return '';
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
export function getIndexPath(arrPath) {
  return `${getShapesPrefix(arrPath)}Index`;
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
export function getVarPath(arrPath) {
  return `${getShapesPrefix(arrPath)}var`;
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
export function getParquetPath(arrPath) {
  return `${getShapesPrefix(arrPath)}shapes.parquet`;
}

/**
 *
 * @param {string|undefined} arrPath
 * @returns
 */
export function getAttrsPath(arrPath) {
  return `${getShapesPrefix(arrPath)}.zattrs`;
}


export default class SpatialDataShapesSource extends AnnDataSource {
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
    return this._loadDict(`${tablePath}/uns/spatialdata_attrs`, ['instance_key', 'region', 'region_key']);
  }

  /**
   *
   * @param {string} path A path to within shapes.
   * @returns {Promise<"0.1"|"0.2">} The format version.
   */
  async getFormatVersion(path) {
    const zattrs = await this.getJson(getAttrsPath(path));
    const formatVersion = zattrs.spatialdata_attrs.version;
    if (!(formatVersion === '0.1' || formatVersion === '0.2')) {
      throw new Error(
        `Unexpected version for shapes spatialdata_attrs: ${formatVersion}`,
      );
    }
    return formatVersion;
  }

  /**
   *
   * @param {string} path A path to an array within shapes.
   * @returns
   */
  async loadParquetTable(path) {
    if (this.parquetTable) {
      // Return cached table if present.
      return this.parquetTable;
    }
    const readParquet = await getReadParquet();
    const parquetPath = getParquetPath(path);
    let parquetBytes = await this.storeRoot.store.get(`/${parquetPath}`);
    if (!parquetBytes) {
      throw new Error('Failed to load parquet data from store.');
    }
    if (!ArrayBuffer.isView(parquetBytes)) {
      // This is required because in vitessce-python the
      // experimental.invoke store wrapper can return an ArrayBuffer,
      // but readParquet expects a Uint8Array.
      parquetBytes = new Uint8Array(parquetBytes);
    }
    const wasmTable = readParquet(parquetBytes);
    // TODO: use streaming?
    const arrowTable = tableFromIPC(wasmTable.intoIPCStream());
    this.parquetTable = arrowTable;
    return this.parquetTable;
  }

  /**
   * Class method for loading the obs index.
   * @param {string|undefined} path
   * @param {string|undefined} tablePath
   * @returns {Promise<string[]>} An promise for a zarr array containing the indices.
   */
  async loadObsIndex(path = undefined, tablePath = undefined) {
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
      } = await this.loadSpatialDataAttrs(tablePath);

      indexPath = `${obsPath}/${instanceKey}`;
    }
    if (indexPath in this.obsIndices) {
      return this.obsIndices[indexPath];
    }
    // TODO: support loading from parquet if no tablePath was provided.
    this.obsIndices[indexPath] = this._loadColumn(indexPath);
    return this.obsIndices[indexPath];
  }

  /**
   * Class method for loading general numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @returns {Promise<Chunk<any>>} A promise for a zarr array containing the data.
   */
  async loadNumeric(path) {
    const formatVersion = await this.getFormatVersion(path);
    if (formatVersion === '0.1') {
      return super.loadNumeric(path);
    }
    const arrowTable = await this.loadParquetTable(path);
    const columnArr = arrowTable.getChild(basename(path))?.toArray();
    return {
      shape: [columnArr.length],
      // TODO: support other kinds of TypedArrays via @vitessce/arrow-utils.
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
    const arrowTable = await this.loadParquetTable(path);
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
    const arrowTable = await this.loadParquetTable(path);
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
    throw new Error('Unexpected encoding type for points, currently only WKB is supported');
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
