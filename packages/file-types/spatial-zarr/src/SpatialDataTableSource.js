// @ts-ignore
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable import/no-unresolved */
import { tableFromIPC } from 'apache-arrow';
import { AnnDataSource } from '@vitessce/zarr';
import { log } from '@vitessce/globals';
//import { parquetMetadata } from 'hyparquet'; // TODO: remove from package.json
//import { parseRecordBatch, parseSchema } from 'arrow-js-ffi'; // TODO: remove from package.json

/** @import { DataSourceParams } from '@vitessce/types' */


// Note: This file also serves as the parent for
// SpatialDataPointsSource and SpatialDataShapesSource,
// because when a table annotates points and shapes, it can be helpful to
// have all of the required functionality to load the
// table data and the parquet data.

function wrapRecordBatchInIPC(schemaBytes, recordBatchBytes) {
  const CONTINUATION_MARKER = 0xFFFFFFFF;
  
  function writeInt32LE(buffer, offset, value) {
    const view = new DataView(buffer);
    view.setInt32(offset, value, true);
    return offset + 4;
  }
  
  function readInt32LE(buffer, offset) {
    const view = new DataView(buffer);
    return view.getInt32(offset, true);
  }
  
  function padTo8(length) {
    return (length + 7) & ~7;
  }
  
  // Parse the record batch bytes
  // Arrow RecordBatch Flatbuffer starts with size prefix (4 bytes) in some formats
  // or the bytes might already be the Flatbuffer message
  
  let metadataSize;
  let metadataOffset = 0;
  let bufferOffset;
  
  // Check if it starts with continuation marker (already IPC format)
  const possibleMarker = readInt32LE(recordBatchBytes.buffer, 0);
  if (possibleMarker === CONTINUATION_MARKER) {
    metadataSize = readInt32LE(recordBatchBytes.buffer, 4);
    metadataOffset = 8;
    bufferOffset = 8 + padTo8(metadataSize);
  } else {
    // Assume first 4 bytes are metadata size
    metadataSize = readInt32LE(recordBatchBytes.buffer, 0);
    metadataOffset = 4;
    bufferOffset = 4 + padTo8(metadataSize);
  }
  
  const metadata = recordBatchBytes.slice(metadataOffset, metadataOffset + metadataSize);
  const buffers = recordBatchBytes.slice(bufferOffset);
  
  // Schema message
  const schemaPaddedSize = padTo8(schemaBytes.length);
  const schemaMessage = new Uint8Array(8 + schemaPaddedSize);
  writeInt32LE(schemaMessage.buffer, 0, CONTINUATION_MARKER);
  writeInt32LE(schemaMessage.buffer, 4, schemaBytes.length);
  schemaMessage.set(schemaBytes, 8);
  
  // RecordBatch message
  const metadataPaddedSize = padTo8(metadata.length);
  const recordBatchMessage = new Uint8Array(8 + metadataPaddedSize + buffers.length);
  writeInt32LE(recordBatchMessage.buffer, 0, CONTINUATION_MARKER);
  writeInt32LE(recordBatchMessage.buffer, 4, metadata.length);
  recordBatchMessage.set(metadata, 8);
  recordBatchMessage.set(buffers, 8 + metadataPaddedSize);
  
  // End-of-stream
  const eosMarker = new Uint8Array(8);
  writeInt32LE(eosMarker.buffer, 0, CONTINUATION_MARKER);
  writeInt32LE(eosMarker.buffer, 4, 0);
  
  // Concatenate
  const totalLength = schemaMessage.length + recordBatchMessage.length + eosMarker.length;
  const result = new Uint8Array(totalLength);
  
  let offset = 0;
  result.set(schemaMessage, offset);
  offset += schemaMessage.length;
  result.set(recordBatchMessage, offset);
  offset += recordBatchMessage.length;
  result.set(eosMarker, offset);
  
  return result;
}


async function getParquetModule() {
  // Reference: https://observablehq.com/@kylebarron/geoparquet-on-the-web
  // TODO: host somewhere we control, like cdn.vitessce.io?
  // @ts-ignore
  const module = await import(/* webpackIgnore: true */ 'https://cdn.vitessce.io/parquet-wasm@2c23652/esm/parquet_wasm.js');
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
  return {
    readParquet: module.readParquet,
    readSchema: module.readSchema,
    readMetadata: module.readMetadata, // Added in fork
    readParquetRowGroup: module.readParquetRowGroup, // Added in fork
  };
}

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
      return pandasMetadataJson.index_columns?.[0];
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
   * @param {DataSourceParams} params
   */
  constructor(params) {
    super(params);

    // Non-table-specific properties
    this.parquetModulePromise = getParquetModule();

    this.rootAttrs = null;
    /**
     * This is a map of element paths to their attributes.
     * @type {{ [k: string]: any }}
     */
    this.elementAttrs = {};

    // TODO: change to column-specific storage.
    /** @type {{ [k: string]: Uint8Array }} */
    this.parquetTableBytes = {};


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
  async loadParquetBytes(parquetPath, offset = undefined, length = undefined, partIndex = undefined) {
    const { store } = this.storeRoot;
    const cacheKey = `${parquetPath}-${offset ?? 'null'}-${length ?? 'null'}-${partIndex ?? 'null'}`;

    if (this.parquetTableBytes[cacheKey]) {
      // Return the cached bytes.
      return this.parquetTableBytes[cacheKey];
    }

    let getter = (path) => store.get(path);
    if (offset !== undefined && length !== undefined && store.getRange) {
      getter = (path) => store.getRange(path, {
        offset,
        length
      });
    }

    let parquetBytes = await getter(`/${parquetPath}`);
    if (!parquetBytes) {
      // This may be a directory with multiple parts.
      const part0Path = `${parquetPath}/part.${partIndex ?? 0}.parquet`;
      parquetBytes = await getter(`/${part0Path}`);

      // TODO: support loading multiple parts.
    }
    if (parquetBytes) {
      // Cache the parquet bytes.
      this.parquetTableBytes[cacheKey] = parquetBytes;
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
      // Case 1: Parquet file.
      let partZeroPath = parquetPath;
      // TODO: cache this, to avoid redundantly checking the single-file case if subsequent parts need to be requested.
      let tailBytes = await store.getRange(`/${partZeroPath}`, {
        suffixLength: TAIL_LENGTH,
      });
      if (!tailBytes) {
        // Case 2: Rather than a single file, this may be a directory with multiple parts.
        partZeroPath = `${parquetPath}/part.${partIndex ?? 0}.parquet`;
        tailBytes = await store.getRange(`/${partZeroPath}`, {
          suffixLength: TAIL_LENGTH,
        });
      }
      if (!tailBytes || tailBytes.length < TAIL_LENGTH) {
        // TODO: throw custom error type to indicate no part was found to caller?
        throw new Error(`Failed to load parquet footerLength for ${parquetPath}`);
      }
      // Step 2: Extract footer length and magic number
      // little-endian
      const footerLength = new DataView(tailBytes.buffer).getInt32(0, true);
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
          const arrowTableForSchema = await tableFromIPC(wasmSchema.intoIPCStream());
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
      const arrowTableForSchema = await tableFromIPC(wasmSchema.intoIPCStream());
      indexColumnName = tableToIndexColumnName(arrowTableForSchema);
    }

    if (options.columns && indexColumnName) {
      options.columns = [...options.columns, indexColumnName];
    }

    const wasmTable = readParquet(parquetBytes, options);
    /** @type {import('apache-arrow').Table} */
    const arrowTable = await tableFromIPC(wasmTable.intoIPCStream());
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

  /**
   * Load the metadata for a parquet file, or for all parts of a parquet directory.
   * This function should handle determiniing how many parts there are.
   * @param {string} parquetPath 
   */
  async loadParquetMetadataByPart(parquetPath) {
    const { readSchema, readMetadata } = await this.parquetModulePromise;

    // TODO: cache the metadata.

    let partIndex = 0;
    let numParts = undefined;
    const allMetadata = [];
    do {
      try {
        // TODO: support multiple tries upon failure?
        const schemaBytes = await this.loadParquetSchemaBytes(parquetPath, partIndex);
        if (schemaBytes) {
          const wasmSchema = readSchema(schemaBytes);
          /** @type {import('apache-arrow').Table} */
          const arrowTableForSchema = await tableFromIPC(wasmSchema.intoIPCStream());
          const partMetadata = readMetadata(schemaBytes);
          const partInfo = {
            schema: arrowTableForSchema,
            schemaBytes,
            metadata: partMetadata
          };
          allMetadata.push(partInfo);
          partIndex += 1;
        }
      } catch (error) {
        if (error.message.includes('Failed to load parquet footerLength')) {
          // No more parts found.
          numParts = partIndex;
        }
      }
    } while(numParts === undefined);

    // Accumulate metadata across all parts.
    const metadata = {
      numRows: 0,
      numRowGroups: 0,
      numRowsPerGroup: 0,
      schema: null
    };
    if(allMetadata.length > 0) {
      const firstPart = allMetadata[0];
      metadata.numRows = allMetadata.reduce((sum, part) => sum + part.metadata.fileMetadata().numRows(), 0);
      metadata.numRowGroups = allMetadata.reduce((sum, part) => sum + part.metadata.numRowGroups(), 0);
      metadata.numRowsPerGroup = firstPart.metadata.rowGroup(0).numRows(); // TODO: try/catch in case no row groups?
      metadata.schema = firstPart.schema.schema;
    }

    return {
      ...metadata,
      // TODO: extract metadata per part and rowGroup into plain objects that match the hyparquet parquetMetadata() return value?
      // This will also make it easier to test.
      parts: allMetadata,
    };
  }

  // Utility functions for loading particular row groups, rows, row group extent, and binary searching based on a predicate function.

  /**
   * 
   * @param {string} parquetPath 
   * @param {number} rowGroupIndex Row group index, relative to whole table (not per part).
   * @param {string[]|undefined} columns 
   */
  async loadParquetRowGroupByGroupIndex(parquetPath, rowGroupIndex) {
    // Load a single row group which contains the row with the specified index.
    const { readParquetRowGroup } = await this.parquetModulePromise;

    const allMetadata = await this.loadParquetMetadataByPart(parquetPath);

    if(rowGroupIndex < 0 || rowGroupIndex >= allMetadata.numRowGroups) {
      throw new Error(`Row group index ${rowGroupIndex} is out of bounds for parquet table with ${allMetadata.numRowGroups} row groups.`);
    }

    // Find the part index that contains this row group.
    // TODO: extract logic into utility functions for easier testing.
    let partIndex = undefined;
    let cumulativeRowGroups = 0;
    for(let i = 0; i < allMetadata.parts.length; i++) {
      const part = allMetadata.parts[i];
      const numRowGroupsInPart = part.metadata.numRowGroups();
      if(rowGroupIndex < cumulativeRowGroups + numRowGroupsInPart) {
        partIndex = i;
        break;
      }
      cumulativeRowGroups += numRowGroupsInPart;
    }
    if(partIndex === undefined) {
      throw new Error(`Failed to find part containing row group index ${rowGroupIndex}.`);
    }
    const partMetadata = allMetadata.parts[partIndex].metadata;
    const schemaBytes = allMetadata.parts[partIndex].schemaBytes;
    
    const rowGroupIndexRelativeToPart = rowGroupIndex - cumulativeRowGroups;
    const rowGroupMetadata = partMetadata.rowGroup(rowGroupIndexRelativeToPart);
    const rowGroupFileOffset = rowGroupMetadata.fileOffset();
    const rowGroupCompressedSize = rowGroupMetadata.compressedSize();

    // TODO: store row group bytes/tables in an LRU cache.
    const rowGroupBytes = await this.loadParquetBytes(parquetPath, rowGroupFileOffset, rowGroupCompressedSize, partIndex);
    const rowGroupIPC = readParquetRowGroup(schemaBytes, rowGroupBytes, rowGroupIndexRelativeToPart).intoIPCStream();
    const rowGroupTable = await tableFromIPC(rowGroupIPC);
    return rowGroupTable;
  }

  async loadParquetRowGroupColumnExtent(parquetPath, columnName, rowGroupIndex) {
    // TODO: cache the results.
    // Load the min/max extent (via first/last row) for a specific column in a specific row group.    
    const rowGroupTable = await this.loadParquetRowGroupByGroupIndex(parquetPath, rowGroupIndex);
    const column = rowGroupTable.getChild(columnName);
    if(!column) {
      throw new Error(`Column ${columnName} not found in row group ${rowGroupIndex} of parquet table at ${parquetPath}.`);
    }
    if(column.length === 0) {
      return { min: null, max: null };
    }
    return { min: column.get(0), max: column.get(column.length - 1) };
  }

  async loadParquetRowByRowIndex(parquetPath, rowIndex) {
    // Load a single row which contains the specified index.
    const allMetadata = await this.loadParquetMetadataByPart(parquetPath);
    
    if(rowIndex < 0 || rowIndex >= allMetadata.numRows) {
      throw new Error(`Row index ${rowIndex} is out of bounds for parquet table with ${allMetadata.numRows} rows.`);
    }
    // Find the row group index that contains this row.
    const numRowsPerGroup = allMetadata.numRowsPerGroup;
    const rowGroupIndex = Math.floor(rowIndex / numRowsPerGroup);
    const rowGroupTable = await this.loadParquetRowGroupByGroupIndex(parquetPath, rowGroupIndex);
    const rowIndexInGroup = rowIndex % numRowsPerGroup;
    const row = rowGroupTable.get(rowIndexInGroup);
    return row;
  }
  
  async queryParquetRowValueLessThan(parquetPath, columnName, rowIndex, comparisonValue) {
    // TODO: Leverage cached row group extents, to avoid loading the row if possible.

    // For example, if the max value of the column in the row group is less than the comparison value,
    // then we can return true without loading the row.
    // If the min value of the column in the row group is greater than or equal to the comparison value,
    // then we can return false without loading the row.
    // Otherwise, we need to load the specific row to check its value.
    // This will require storing the cached extents in a way that can be looked up by row group index.
    const row = await this.loadParquetRowByRowIndex(parquetPath, rowIndex);
    if(!row) {
      throw new Error(`Row index ${rowIndex} not found in parquet table at ${parquetPath}.`);
    }
    const rowValue = row[columnName];
    if(rowValue === undefined) {
      throw new Error(`Column ${columnName} not found in row index ${rowIndex} of parquet table at ${parquetPath}.`);
    }
    return rowValue < comparisonValue;
  }

  async queryParquetRowValueGreaterThan(parquetPath, columnName, rowIndex, comparisonValue) {
    // TODO: Leverage cached row group extents, to avoid loading the row if possible.

    // For example, if the max value of the column in the row group is less than the comparison value,
    // then we can return true without loading the row.
    // If the min value of the column in the row group is greater than or equal to the comparison value,
    // then we can return false without loading the row.
    // Otherwise, we need to load the specific row to check its value.
    // This will require storing the cached extents in a way that can be looked up by row group index.
    const row = await this.loadParquetRowByRowIndex(parquetPath, rowIndex);
    if(!row) {
      throw new Error(`Row index ${rowIndex} not found in parquet table at ${parquetPath}.`);
    }
    const rowValue = row[columnName];
    if(rowValue === undefined) {
      throw new Error(`Column ${columnName} not found in row index ${rowIndex} of parquet table at ${parquetPath}.`);
    }
    return rowValue > comparisonValue;
  }

  /**
   * Binary search to find the leftmost position where value could be inserted.
   * Equivalent to Python's bisect_left.
   * @param {*} parquetPath 
   * @param {*} columnName 
   * @param {*} targetValue 
   * @returns {number} Index where value should be inserted
   */
  async parquetBisectLeft(parquetPath, columnName, targetValue) {
    const allMetadata = await this.loadParquetMetadataByPart(parquetPath);
    let low = 0;
    let high = allMetadata.numRows;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const isLessThan = await this.queryParquetRowValueLessThan(parquetPath, columnName, mid, targetValue);
      if (isLessThan) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  /**
   * Binary search to find the rightmost position where value could be inserted.
   * Equivalent to Python's bisect_right.
   * @param {*} parquetPath 
   * @param {*} columnName 
   * @param {*} targetValue 
   * @returns 
   */
  async parquetBisectRight(parquetPath, columnName, targetValue) {
    const allMetadata = await this.loadParquetMetadataByPart(parquetPath);
    let low = 0;
    let high = allMetadata.numRows;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const isGreaterThan = await this.queryParquetRowValueGreaterThan(parquetPath, columnName, mid, targetValue);
      if (isGreaterThan) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    return low;
  }


  /**
   * TODO: change implementation so that subsets of
   * columns can be loaded if the whole table is not needed.
   * Will first need to load the table schema.
   * @param {string} parquetPath A path to a parquet file (or directory).
   * @param {{ left: number, top: number, right: number, bottom: number }} tileBbox
   * @param {{ x_min: number, y_min: number, x_max: number, y_max: number }} allPointsBbox
   * @param {string[]|undefined} columns An optional list of column names to load.
   * @returns
   */
  async loadParquetTableInRect(parquetPath, tileBbox, allPointsBbox, columns = undefined) {
    const { readSchema, readMetadata, readParquetRowGroup } = await this.parquetModulePromise;


    // TODO: cache the schema associated with this path.
    const allMetadata = await this.loadParquetMetadataByPart(parquetPath);
    console.log('allMetadata', allMetadata);

    const mortonCodeExtent = await this.loadParquetRowGroupColumnExtent(parquetPath, 'morton_code_2d', 0);
    console.log('mortonCodeExtent', mortonCodeExtent);

    const queryResult = await this.parquetBisectLeft(parquetPath, 'morton_code_2d', 1_000_000);
    console.log('queryResult', queryResult);

    // We first try to load the schema bytes to determine the index column name.
    // Perhaps in the future SpatialData can store the index column name
    // in the .zattrs so that we do not need to load the schema first,
    // since only certain stores such as FetchStores support getRange.
    // Reference: https://github.com/scverse/spatialdata/issues/958
    try {
      console.log(parquetPath);
      const schemaBytes = await this.loadParquetSchemaBytes(parquetPath);
      if (schemaBytes) {
        const wasmSchema = readSchema(schemaBytes);
        /** @type {import('apache-arrow').Table} */
        const arrowTableForSchema = await tableFromIPC(wasmSchema.intoIPCStream());

        console.log('arrowTableForSchema', arrowTableForSchema);


        const part0Metadata = readMetadata(schemaBytes);

        // TODO: check for additional parts.

        const numRowsInPart = part0Metadata.fileMetadata().numRows();
        const numRowGroups = part0Metadata.numRowGroups();
        const firstRowGroup = part0Metadata.rowGroup(0);
        const firstRowGroupNumRows = firstRowGroup.numRows();
        const firstRowGroupFileOffset = firstRowGroup.fileOffset();
        const firstRowGroupCompressedSize = firstRowGroup.compressedSize();
        const firstRowGroupTotalByteSize = firstRowGroup.totalByteSize();

        const firstRowGroupBytes = await this.loadParquetBytes(parquetPath, firstRowGroupFileOffset, firstRowGroupCompressedSize, 0);
        const firstRowGroupIPC = readParquetRowGroup(schemaBytes, firstRowGroupBytes, 0).intoIPCStream();
        const firstRowGroupTable = await tableFromIPC(firstRowGroupIPC);
        console.log('firstRowGroupTable', firstRowGroupTable);

        // TODO: get first and last morton_code_2d values for each row group.



        // TODO: ensure that this contains the morton_code_2d column. cache whether or not it does.
        const hasMortonCode2dColumn = arrowTableForSchema.schema.fields.find(f => f.name === 'morton_code_2d');
        if (!hasMortonCode2dColumn) {
          throw new Error('Parquet table does not contain a morton_code_2d column, which is required for rectangle queries of subsets of points.');
        }


        // Step 4: Parse Thrift-encoded FileMetaData to identify the total number of rows and the row group size,
        // since this is not directly exposed by the table schema returned by readSchema.
        //const part0Metadata = parquetMetadata(schemaBytes.buffer);
        // NOTE: this is only the metadata for this part.0.parquet file.
        // We do not yet know how many parts there are, or the sum of their rows.
        const batch0 = await this.loadParquetBytes(parquetPath, 4, 2187392, 0);

        const batchIPC = wrapRecordBatchInIPC(schemaBytes, batch0);
        const batch0TableIPC = await tableFromIPC(batchIPC.buffer);
        console.log('batch0TableIPC', batch0TableIPC);
        /*

        console.log(batch0, schemaBytes);
        const wasm_memory = new Uint8Array(batch0.length + schemaBytes.length);
        wasm_memory.set(batch0, 0);
        wasm_memory.set(schemaBytes, batch0.length);

        console.log(parseRecordBatch(wasm_memory.buffer, 0, batch0.length));

        const batch0Table = readParquet(wasm_memory);
        console.log(batch0Table);
        */


      }
    } catch (/** @type {any} */ e) {
      console.log(e);
      // If we fail to load the schema bytes, we can proceed to try to load the full table bytes,
      // for instance if range requests are not supported but the full table can be loaded.
      log.warn(`Failed to load parquet schema bytes for ${parquetPath}: ${e.message}`);
    }

    // TODO: implement morton code rect querying functionality here.
    // Port the python logic. Binary search over row groups. Cache morton code min/max of each row group to reduce search space.
    

  }
}
