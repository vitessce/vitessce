// @ts-ignore
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable import/no-unresolved */
import { tableFromIPC } from 'apache-arrow';
import { AnnDataSource } from '@vitessce/zarr';
import { log } from '@vitessce/globals';
import {
  getParquetModule,
  _loadParquetMetadataByPart,
  _loadParquetRowGroupByGroupIndex,
  _rectToRowGroupIndices,
} from './parquet-query-utils.js';

/** @import { DataSourceParams } from '@vitessce/types' */
/** @import { QueryClient } from '@tanstack/react-query' */

// Note: This file also serves as the parent for
// SpatialDataPointsSource and SpatialDataShapesSource,
// because when a table annotates points and shapes, it can be helpful to
// have all of the required functionality to load the
// table data and the parquet data.


/**
 * Get the name of the index column from an Apache Arrow table.
 * In the future, this may not be needed if more metadata is included in the Zarr Attributes.
 * Reference: https://github.com/scverse/spatialdata/issues/958
 * @param {import('apache-arrow').Table} arrowTable
 * @returns {string|null}
 */
function tableToIndexColumnName(arrowTable) {
  const pandasMetadata = arrowTable.schema.metadata.get('pandas');
  if (pandasMetadata) {
    const pandasMetadataJson = JSON.parse(pandasMetadata);
    if (
      Array.isArray(pandasMetadataJson.index_columns)
      && pandasMetadataJson.index_columns.length === 1
    ) {
      const result = pandasMetadataJson.index_columns?.[0];
      if (typeof result === 'string') {
        return result;
      }
      if (result?.kind === 'range') {
        // TODO: handle range indices downstream.
        return null;
      }
      throw new Error('Unexpected type in the pandas metadata index_columns array.');
    }
    throw new Error('Expected a single index column in the pandas metadata.');
  }
  return null;
}


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

/**
 * This class is a parent class for tables, shapes, and points.
 * This is because these share functionality, for example:
 * - both shapes (the latest version) and points use parquet-based formats.
 * - both shapes (a previous version) and tables use zarr-based formats.
 * - logic for manipulating spatialdata element paths is shared across all elements.
 */
export default class SpatialDataTableSource extends AnnDataSource {
  /**
   *
   * @param {DataSourceParams & { queryClient: QueryClient }} params
   */
  constructor(params) {
    super(params);

    const { queryClient } = params;
    this.queryClient = queryClient;

    // Non-table-specific properties
    this.parquetModulePromise = getParquetModule();

    this.rootAttrs = null;
    /**
     * This is a map of element paths to their attributes.
     * @type {{ [k: string]: any }}
     */
    this.elementAttrs = {};

    // TODO: change to column-specific storage?
    /** @type {{ [k: string]: Uint8Array }} */
    this.parquetTableBytes = {};
    /** @type {{ [k: string]: boolean }} */
    this.parquetTableIsDirectory = {};


    // Table-specific properties
    /** @type {{ [k: string]: Promise<string[]> }} */
    this.obsIndices = {};
    /** @type {{ [k: string]: Promise<string[]> }} */
    this.varIndices = {};
    /** @type {{ [k: string]: string[] }} */
    this.varAliases = {};
  }

  // NON-TABLE-SPECIFIC METHODS

  // TODO: implement a method to load the root zmetadata?
  // This could help to determine which table annotates which elements,
  // without the need to provide the tablePath in the options.

  /**
   * This function loads the attrs for the root spatialdata object.
   * This is not the same as the attrs for a specific element.
   * @returns
   */
  async loadSpatialDataObjectAttrs() {
    if (this.rootAttrs) {
      return this.rootAttrs;
    }
    // Load the root attrs.
    const rootAttrs = await this.getJson('.zattrs');
    const { spatialdata_attrs } = rootAttrs;
    const {
      spatialdata_software_version: softwareVersion,
      version: formatVersion,
    } = spatialdata_attrs;
    this.rootAttrs = { softwareVersion, formatVersion };
    return this.rootAttrs;
  }

  /**
   * Get the attrs for a specific element
   * (e.g., "shapes/{element_name}" or "tables/{element_name}").
   * @param {string} elementPath
   * @returns
   */
  async loadSpatialDataElementAttrs(elementPath) {
    if (this.elementAttrs[elementPath]) {
      return this.elementAttrs[elementPath];
    }
    // TODO: normalize the elementPath to always end without a slash?
    // TODO: ensure that elementPath is a valid spatial element path?
    const v0_4_0_attrs = await this.getJson(`${elementPath}/.zattrs`);

    let result = v0_4_0_attrs;
    if (v0_4_0_attrs['encoding-type'] === 'anndata') {
      const attrsKeys = Object.keys(v0_4_0_attrs);
      if (
        ['instance_key', 'region', 'region_key']
          .every(k => attrsKeys.includes(k))
      ) {
        // TODO: assert things about "spatialdata-encoding-type" and "version" values?
        // TODO: first check the "spatialdata_software_version" metadata in
        // the root of the spatialdata object? (i.e., sdata.zarr/.zattrs)
        result = v0_4_0_attrs;
      } else {
        // Prior to v0.4.0 of the spatialdata package, the spatialdata_attrs
        // lived within their own dictionary within "uns".
        const pre_v0_4_0_attrs = await this._loadDict(
          `${elementPath}/uns/spatialdata_attrs`,
          ['instance_key', 'region', 'region_key'],
        );
        result = pre_v0_4_0_attrs;
      }
    }
    this.elementAttrs[elementPath] = result;
    return this.elementAttrs[elementPath];
  }

  /**
   *
   * @param {string} parquetPath The path to the parquet file or directory,
   * relative to the store root.
   * @returns {Promise<Uint8Array|undefined>} The parquet file bytes.
   */
  async loadParquetBytes(
    parquetPath,
    offset = undefined,
    length = undefined,
    partIndex = undefined,
  ) {
    const { store } = this.storeRoot;

    let getter = path => store.get(path);
    if (offset !== undefined && length !== undefined && store.getRange) {
      getter = path => store.getRange(path, {
        offset,
        length,
      });
    }

    let parquetBytes = await getter(`/${parquetPath}`);
    if (!parquetBytes) {
      // We have not yet determined if this is a directory or a single file.

      // This may be a directory with multiple parts.
      const part0Path = `${parquetPath}/part.${partIndex ?? 0}.parquet`;
      parquetBytes = await getter(`/${part0Path}`);
    }

    return parquetBytes;
  }

  /**
   * Try to load only the schema bytes of a parquet file.
   * This is useful for getting the index column name without
   * loading the full table.
   * This will only work if the store supports getRange,
   * for example FetchStore.
   * Reference: https://github.com/manzt/zarrita.js/blob/c0dd684dc4da79a6f42ab2a591246947bde8d143/packages/%40zarrita-storage/src/fetch.ts#L87
   * In the future, this may not be needed if more metadata is
   * included in the Zarr Attributes.
   * Reference: https://github.com/scverse/spatialdata/issues/958
   * @param {string} parquetPath The path to the parquet file or directory,
   * relative to the store root.
   * @returns {Promise<Uint8Array|null>} The parquet file bytes,
   * or null if the store does not support getRange.
   */
  async loadParquetSchemaBytes(parquetPath, partIndex = undefined) {
    const { store } = this.storeRoot;

    if (store.getRange) {
      // Step 1: Fetch last 8 bytes to get footer length and magic number
      const TAIL_LENGTH = 8;
      let partZeroPath = parquetPath;
      // Case 1: Parquet file (or still unknown if file vs. directory).
      let tailBytes = await store.getRange(`/${partZeroPath}`, {
        suffixLength: TAIL_LENGTH,
      });
      // We already know this is a directory, so we skip the single-file path altogether.
      // Case 2: Rather than a single file, this may be a directory with multiple parts.
      partZeroPath = `${parquetPath}/part.${partIndex ?? 0}.parquet`;
      tailBytes = await store.getRange(`/${partZeroPath}`, {
        suffixLength: TAIL_LENGTH,
      });

      if (!tailBytes || tailBytes.length < TAIL_LENGTH) {
        // TODO: throw custom error type to indicate no part was found to caller?
        throw new Error(`Failed to load parquet footerLength for ${parquetPath}`);
      }
      // Step 2: Extract footer length and magic number
      // little-endian
      const footerLength = new DataView(
        tailBytes.buffer,
        // It is possible that tailBytes is a subarray,
        // e.g., if the ArrayBuffer was created inside
        // FlatFileSystemStore.getRange.
        tailBytes.byteOffset,
        tailBytes.byteLength,
      ).getInt32(0, true);
      const magic = new TextDecoder().decode(tailBytes.slice(4, 8));

      if (magic !== 'PAR1') {
        throw new Error('Invalid Parquet file: missing PAR1 magic number');
      }

      // Step 3. Fetch the full footer bytes
      const footerBytes = await store.getRange(`/${partZeroPath}`, {
        suffixLength: footerLength + TAIL_LENGTH,
      });
      if (!footerBytes || footerBytes.length !== footerLength + TAIL_LENGTH) {
        throw new Error(`Failed to load parquet footer bytes for ${parquetPath}`);
      }

      // Step 4: Return the footer bytes
      return footerBytes;
    }
    // Store does not support getRange.
    return null;
  }

  /**
   * Get the index column from a parquet table.
   * @param {string} parquetPath A path to a parquet file (or directory).
   * @returns {Promise<import('apache-arrow').Vector|null>} A promise for a column, or null.
   */
  async loadParquetTableIndex(parquetPath) {
    const columns = /** @type {string[]} */ ([]);
    const arrowTable = await this.loadParquetTable(parquetPath, columns);
    const indexColumnName = tableToIndexColumnName(arrowTable);
    if (!indexColumnName) {
      return null;
    }
    return arrowTable.getChild(indexColumnName);
  }

  /**
   * TODO: change implementation so that subsets of
   * columns can be loaded if the whole table is not needed.
   * Will first need to load the table schema.
   * @param {string} parquetPath A path to a parquet file (or directory).
   * @param {string[]|undefined} columns An optional list of column names to load.
   * @returns
   */
  async loadParquetTable(parquetPath, columns = undefined) {
    const { readParquet, readSchema } = await this.parquetModulePromise;

    const options = {
      columns,
    };

    let indexColumnName;

    if (columns) {
      // If columns are specified, we also want to ensure that the index column is included.
      // Otherwise, the user wants the full table anyway.

      // We first try to load the schema bytes to determine the index column name.
      // Perhaps in the future SpatialData can store the index column name
      // in the .zattrs so that we do not need to load the schema first,
      // since only certain stores such as FetchStores support getRange.
      // Reference: https://github.com/scverse/spatialdata/issues/958
      try {
        const schemaBytes = await this.loadParquetSchemaBytes(parquetPath);
        if (schemaBytes) {
          const wasmSchema = readSchema(schemaBytes);
          /** @type {import('apache-arrow').Table} */
          const arrowTableForSchema = tableFromIPC(wasmSchema.intoIPCStream());
          indexColumnName = tableToIndexColumnName(arrowTableForSchema);
        }
      } catch (/** @type {any} */ e) {
        // If we fail to load the schema bytes, we can proceed to try to load the full table bytes,
        // for instance if range requests are not supported but the full table can be loaded.
        log.warn(`Failed to load parquet schema bytes for ${parquetPath}: ${e.message}`);
      }
    }
    // Load the full table bytes.

    // TODO: can we avoid loading the full table bytes
    // if we only need a subset of columns?
    // For example, if the store supports
    // getRange like above to get the schema bytes.
    // See https://github.com/kylebarron/parquet-wasm/issues/758
    let parquetBytes = await this.loadParquetBytes(parquetPath);
    if (!parquetBytes) {
      throw new Error('Failed to load parquet data from store.');
    }
    if (!ArrayBuffer.isView(parquetBytes)) {
      // This is required because in vitessce-python the
      // experimental.invoke store wrapper can return an ArrayBuffer,
      // but readParquet expects a Uint8Array.
      parquetBytes = new Uint8Array(parquetBytes);
    }

    if (columns && !indexColumnName) {
      // The user requested specific columns, but we did not load the schema bytes
      // to successfully get the index column name.
      // Here we try again to get the index column name, but this
      // time from the full table bytes (rather than only the schema-bytes).
      const wasmSchema = readSchema(parquetBytes);
      /** @type {import('apache-arrow').Table} */
      const arrowTableForSchema = tableFromIPC(wasmSchema.intoIPCStream());
      indexColumnName = tableToIndexColumnName(arrowTableForSchema);
    }

    if (options.columns && indexColumnName) {
      options.columns = [...options.columns, indexColumnName];
    }

    const wasmTable = readParquet(parquetBytes, options);
    /** @type {import('apache-arrow').Table} */
    const arrowTable = tableFromIPC(wasmTable.intoIPCStream());
    return arrowTable;
  }

  // TABLE-SPECIFIC METHODS

  /**
   * Class method for loading the obs index.
   * @param {string|undefined} path
   * @returns {Promise<string[]>} An promise for a zarr array containing the indices.
   */
  async loadObsIndex(path = undefined) {
    const obsPath = getObsPath(path);
    const { _index } = await this.getJson(`${obsPath}/.zattrs`);
    let indexPath;
    if (_index) {
      indexPath = `${obsPath}/${_index}`;
    }

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

    if (indexPath && indexPath in this.obsIndices) {
      return this.obsIndices[indexPath];
    }
    if (!indexPath) {
      throw new Error(`No index path found for obs index at ${path}`);
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

  async _supportsTiledPoints(parquetPath, featureIndexColumnName, mortonCodeColumn) {
    const { queryClient } = this;
    const { store } = this.storeRoot;

    const allMetadata = await _loadParquetMetadataByPart({ queryClient, store }, parquetPath);

    // Now we can load the row groups and concatenate them into typed arrays.
    // We already know the size of the final arrays based on the number of rows in each row group.
    const { numRowsPerGroup } = allMetadata;
    const numRowsTotal = allMetadata.numRows;
    if (numRowsPerGroup >= 100_000) {
      // Heuristic: if there are more than 100,000 rows per row group,
      // then tiled loading is probably difficult.
      if (numRowsTotal > 5_000_000) {
        throw new Error(`The Parquet table at ${parquetPath} has ${numRowsTotal} total rows, which necessitates tiled loading, but it was not possible because the row group size is too large (${numRowsPerGroup}). See the Vitessce documentation at Data Troubleshooting -> Points for more details.`);
      }
      return false;
    }
    
    const mortonCodeColumnName = mortonCodeColumn ?? 'morton_code_2d';
    // Check if the required columns exist.
    const requiredColumns = ['x', 'y', featureIndexColumnName, mortonCodeColumnName];
    const hasColumns = allMetadata?.schema?.fields?.map(f => f.name);
    if (!hasColumns) {
      return false;
    }

    const hasRequiredColumns = requiredColumns.every(col => hasColumns.includes(col));
    if (!hasRequiredColumns && numRowsTotal > 5_000_000) {
      throw new Error(`The Parquet table at ${parquetPath} has ${numRowsTotal} total rows, which necessitates tiled loading, but it was not possible because the required columns are missing. Required columns: ${requiredColumns.join(', ')}. Found columns: ${hasColumns.join(', ')}. See the Vitessce documentation at Data Troubleshooting -> Points for more details.`);
    }

    return hasRequiredColumns;
  }

  /**
   * Load point data using a tiled approach.
   * @param {string} parquetPath A path to a parquet file (or directory).
   * @param {{ left: number, top: number, right: number, bottom: number }} tileBbox
   * @param {{ x_min: number, y_min: number, x_max: number, y_max: number }} allPointsBbox
   * @param {string[]|undefined} columns An optional list of column names to load.
   * @returns
   */
  async loadParquetTableInRect(
    parquetPath,
    tileBbox,
    allPointsBbox,
    // eslint-disable-next-line no-unused-vars
    signal,
    featureIndexColumnName,
    mortonCodeColumn,
  ) {
    const { queryClient } = this;
    const { store } = this.storeRoot;

    const mortonCodeColumnName = mortonCodeColumn ?? 'morton_code_2d';

    // TODO: load only the columns we need (x, y, feature_index) rather than the full table.

    // Subdivide tileBbox into rectangles of a fixed size.
    const TILE_SIZE = 256; // 512 x 512.

    // If tileBbox is larger than TILE_SIZE, we need to subdivide it.
    let tileBboxes = [];
    if (
      tileBbox.right - tileBbox.left > TILE_SIZE
      || tileBbox.bottom - tileBbox.top > TILE_SIZE
    ) {
      const xSteps = Math.ceil((tileBbox.right - tileBbox.left) / TILE_SIZE);
      const ySteps = Math.ceil((tileBbox.bottom - tileBbox.top) / TILE_SIZE);
      const xStepSize = (tileBbox.right - tileBbox.left) / xSteps;
      const yStepSize = (tileBbox.bottom - tileBbox.top) / ySteps;
      for (let i = 0; i < xSteps; i++) {
        for (let j = 0; j < ySteps; j++) {
          const subTileBbox = {
            left: tileBbox.left + i * xStepSize,
            right: Math.min(tileBbox.left + (i + 1) * xStepSize, tileBbox.right),
            top: tileBbox.top + j * yStepSize,
            bottom: Math.min(tileBbox.top + (j + 1) * yStepSize, tileBbox.bottom),
          };
          tileBboxes.push(subTileBbox);
        }
      }
    } else {
      tileBboxes = [tileBbox];
    }

    // TODO: pass signal to react-query functions to allow aborting requests.

    const rowGroupIndicesPerTile = await Promise.all(
      tileBboxes
        .map(async subTileBbox => _rectToRowGroupIndices(
          { queryClient, store },
          parquetPath,
          subTileBbox,
          allPointsBbox,
          mortonCodeColumnName,
        )),
    );
    // Combine the row group indices from all tiles, and remove duplicates.
    const uniqueCoveredRowGroupIndices = Array.from(new Set(rowGroupIndicesPerTile.flat()))
      .toSorted((a, b) => a - b);

    const allMetadata = await _loadParquetMetadataByPart(
      { queryClient, store },
      parquetPath,
    );

    // Now we can load the row groups and concatenate them into typed arrays.
    // We already know the size of the final arrays based on the number of rows in each row group.
    const { numRowsPerGroup } = allMetadata;
    const numRowGroups = uniqueCoveredRowGroupIndices.length;
    const totalNumRows = numRowsPerGroup * numRowGroups;

    const xArr = new Float32Array(totalNumRows);
    const yArr = new Float32Array(totalNumRows);
    const featureIndexArr = new Uint32Array(totalNumRows);

    const rowGroupTables = await Promise.all(
      uniqueCoveredRowGroupIndices
        .map(async rowGroupIndex => _loadParquetRowGroupByGroupIndex(
          { queryClient, store },
          parquetPath,
          rowGroupIndex,
        )),
    );

    let rowOffset = 0;
    rowGroupTables.forEach((table) => {
      const xColumn = table.getChild('x');
      const yColumn = table.getChild('y');
      // TODO: get the feature index column name from the zattrs metadata
      const featureIndexColumn = table.getChild(featureIndexColumnName);
      if (!xColumn || !yColumn || !featureIndexColumn) {
        throw new Error(`Missing required column in parquet table at ${parquetPath}. Required columns: x, y, feature_index`);
      }
      // Set the values in the typed arrays.
      xArr.set(xColumn.toArray(), rowOffset);
      yArr.set(yColumn.toArray(), rowOffset);
      featureIndexArr.set(featureIndexColumn.toArray(), rowOffset);
      rowOffset += numRowsPerGroup;
    });

    return {
      data: {
        x: xArr,
        y: yArr,
        featureIndices: featureIndexArr,
      },
      shape: [3, totalNumRows],
    };
  }
}
