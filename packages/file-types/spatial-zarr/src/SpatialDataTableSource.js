// @ts-ignore
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable import/no-unresolved */
import { tableFromIPC } from 'apache-arrow';
import { AnnDataSource } from '@vitessce/zarr';
import { log } from '@vitessce/globals';

/** @import { DataSourceParams } from '@vitessce/types' */


// Note: This file also serves as the parent for
// SpatialDataPointsSource and SpatialDataShapesSource,
// because when a table annotates points and shapes, it can be helpful to
// have all of the required functionality to load the
// table data and the parquet data.


async function getParquetModule() {
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
  return {
    readParquet: module.readParquet,
    readSchema: module.readSchema,
    // TODO: implement a readMetadata function in parquet-wasm to obtain the rowgroup size?
    readParquetStream: module.readParquetStream, // TODO: implement a sync version
  };
}

/**
 * 
 * @param {Uint8Array} footerBytes 
 * @returns {{ totalNumRows: number, rowGroupSize: number }}
 */
function parquetFooterBytesToMetadata(footerBytes) {
  console.log('Footer bytes length:', footerBytes.length);
  console.log('First 20 bytes:', Array.from(footerBytes.slice(0, 20)));
  console.log('Last 20 bytes:', Array.from(footerBytes.slice(-20)));
  
  // The Parquet file footer contains Thrift-encoded metadata.
  // We need to parse it to extract row group info.
  // This is a simplified parser that extracts the total num_rows and the num_rows field from the first RowGroup.
  
  // Extract footer length from last 8 bytes (4 bytes footer length + 4 bytes 'PAR1')
  const footerLength = new DataView(footerBytes.buffer, footerBytes.byteOffset + footerBytes.length - 8, 4).getInt32(0, true);
  console.log('Footer length from file:', footerLength);
  
  // The footer metadata starts at: (total length - 8 - footerLength)
  // Because the layout is: [metadata][4-byte footer length][4-byte 'PAR1']
  const metadataStart = footerBytes.length - 8 - footerLength;
  const metadataEnd = footerBytes.length - 8;
  
  console.log('Metadata start:', metadataStart, 'Metadata end:', metadataEnd);
  console.log('Metadata bytes:', Array.from(footerBytes.slice(metadataStart, Math.min(metadataStart + 50, metadataEnd))));
  
  // Thrift compact protocol parsing (simplified for num_rows extraction)
  let offset = metadataStart;
  let totalNumRows = 0;
  let rowGroupSize = 0;
  
  // Helper function to read zigzag varint
  const readZigzagVarint = () => {
    let value = 0;
    let shift = 0;
    let byte;
    do {
      if (offset >= metadataEnd) {
        throw new Error('Unexpected end of footer data while reading varint');
      }
      byte = footerBytes[offset++];
      value |= (byte & 0x7F) << shift;
      shift += 7;
    } while (byte & 0x80);
    const result = (value >>> 1) ^ -(value & 1);
    console.log('  Read zigzag varint:', result);
    return result;
  };
  
  // Helper function to read unsigned varint (for i64)
  const readVarint = () => {
    let value = 0n;
    let shift = 0;
    let byte;
    const startOffset = offset;
    do {
      if (offset >= metadataEnd) {
        throw new Error('Unexpected end of footer data while reading varint');
      }
      byte = footerBytes[offset++];
      value |= BigInt(byte & 0x7F) << BigInt(shift);
      shift += 7;
    } while (byte & 0x80);
    
    // Apply zigzag decoding for i64
    const zigzagDecoded = (value >> 1n) ^ -(value & 1n);
    const result = Number(zigzagDecoded);
    console.log(`  Read varint at offset ${startOffset}: ${result}, consumed ${offset - startOffset} bytes`);
    return result;
  };
  
  // Helper function to read plain varint (unsigned, no zigzag)
  const readPlainVarint = () => {
    let value = 0;
    let shift = 0;
    let byte;
    do {
      if (offset >= metadataEnd) {
        throw new Error('Unexpected end of footer data while reading varint');
      }
      byte = footerBytes[offset++];
      value |= (byte & 0x7F) << shift;
      shift += 7;
    } while (byte & 0x80);
    return value;
  };

  // Helper to skip a field based on its type
  const skipField = (fieldType) => {
    console.log(`  Skipping field type ${fieldType} at offset ${offset}`);
    switch (fieldType) {
      case 2: // BOOL (TRUE)
      case 1: // BOOL (FALSE)
        // Boolean, no additional bytes
        break;
      case 3: // BYTE
        offset += 1;
        break;
      case 4: // I16
        readZigzagVarint();
        break;
      case 5: // I32
        readZigzagVarint();
        break;
      case 6: // I64
        readVarint();
        break;
      case 7: // DOUBLE
        offset += 8;
        break;
      case 8: // BINARY
      case 11: // STRING
        {
          const length = readPlainVarint(); // Use plain varint for length
          offset += length;
        }
        break;
      case 9: // LIST
      case 10: // SET
        {
          const collectionHeader = footerBytes[offset++];
          const elementType = collectionHeader & 0x0F;
          let size = (collectionHeader & 0xF0) >> 4;
          if (size === 0x0F) {
            size = readPlainVarint(); // Use plain varint for size
          }
          for (let i = 0; i < size; i++) {
            skipField(elementType);
          }
        }
        break;
      case 12: // STRUCT
        {
          let nestedFieldId = 0;
          while (offset < metadataEnd) {
            const nestedHeader = footerBytes[offset++];
            if (nestedHeader === 0) break;
            const nestedType = nestedHeader & 0x0F;
            const nestedDelta = (nestedHeader & 0xF0) >> 4;
            if (nestedDelta === 0) {
              nestedFieldId = readZigzagVarint();
            } else {
              nestedFieldId += nestedDelta;
            }
            skipField(nestedType);
          }
        }
        break;
      case 13: // MAP
        {
          const mapHeader = footerBytes[offset++];
          let size = 0;
          if (mapHeader !== 0) {
            size = readPlainVarint(); // Use plain varint for size
            const keyType = (mapHeader & 0xF0) >> 4;
            const valueType = mapHeader & 0x0F;
            for (let i = 0; i < size; i++) {
              skipField(keyType);
              skipField(valueType);
            }
          }
        }
        break;
      default:
        console.warn(`Unknown field type: ${fieldType} at offset ${offset}`);
    }
  };
  
  // Parse FileMetaData fields
  let currentFieldId = 0;
  let fieldCount = 0;
  while (offset < metadataEnd) {
    const fieldHeader = footerBytes[offset++];
    
    console.log(`\nField ${fieldCount++}: header byte = ${fieldHeader.toString(16)} at offset ${offset - 1}`);
    
    if (fieldHeader === 0) {
      console.log('End of struct (stop byte)');
      break;
    }
    
    const fieldType = fieldHeader & 0x0F;
    const fieldDelta = (fieldHeader & 0xF0) >> 4;
    
    if (fieldDelta !== 0) {
      currentFieldId += fieldDelta;
    } else {
      currentFieldId = readZigzagVarint();
    }
    
    console.log(`Field ID: ${currentFieldId}, Type: ${fieldType}, Delta: ${fieldDelta}`);
    
    // Field 1 is version (i32)
    if (currentFieldId === 1 && fieldType === 5) {
      const version = readZigzagVarint();
      console.log(`Found Parquet version: ${version}`);
    }
    // Field 3 is num_rows (i64) - total rows in the file
    else if (currentFieldId === 3 && fieldType === 6) {
      totalNumRows = readVarint();
      console.log(`✓ Found totalNumRows: ${totalNumRows}`);
    }
    // Field 4 is row_groups (LIST)
    else if (currentFieldId === 4 && fieldType === 9) {
      console.log('Found row_groups field');
      console.log('Found row_groups field');
      // Read list element type and size
      const elementHeader = footerBytes[offset++];
      const elementType = elementHeader & 0x0F;
      let listSize = (elementHeader & 0xF0) >> 4;
      
      if (listSize === 0x0F) {
        listSize = readVarint();
      }
      
      console.log(`Row groups list size: ${listSize}, element type: ${elementType}`);
      
     // Parse first RowGroup to get num_rows
      if (listSize > 0 && elementType === 12) { // 12 = STRUCT
        let rgCurrentFieldId = 0;
        while (offset < metadataEnd) {
          const rgFieldHeader = footerBytes[offset++];
          
          if (rgFieldHeader === 0) break; // End of struct
          
          const rgFieldType = rgFieldHeader & 0x0F;
          const rgFieldDelta = (rgFieldHeader & 0xF0) >> 4;
          
          if (rgFieldDelta !== 0) {
            rgCurrentFieldId += rgFieldDelta;
          } else {
            rgCurrentFieldId = readZigzagVarint();
          }
          
          console.log(`  RowGroup Field ID: ${rgCurrentFieldId}, Type: ${rgFieldType}, Delta: ${rgFieldDelta}`);
          
          // Field 3 is num_rows (i64) in RowGroup
          if (rgCurrentFieldId === 3) {
            if (rgFieldType === 6) {
              rowGroupSize = readVarint();
              console.log(`  ✓ Found rowGroupSize (I64): ${rowGroupSize}`);
            } else {
              skipField(rgFieldType);
            }
          } else {
            // Skip other fields
            skipField(rgFieldType);
          }
        }
      }
      break; // We've processed row_groups
    } else {
      // Skip fields we don't care about
      skipField(fieldType);
    }
  }
    
  console.log(`\nFinal result - totalNumRows: ${totalNumRows}, rowGroupSize: ${rowGroupSize}`);
  return { totalNumRows, rowGroupSize };
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
  async loadParquetBytes(parquetPath) {
    if (this.parquetTableBytes[parquetPath]) {
      // Return the cached bytes.
      return this.parquetTableBytes[parquetPath];
    }
    let parquetBytes = await this.storeRoot.store.get(`/${parquetPath}`);
    if (!parquetBytes) {
      // This may be a directory with multiple parts.
      const part0Path = `${parquetPath}/part.0.parquet`;
      parquetBytes = await this.storeRoot.store.get(`/${part0Path}`);

      // TODO: support loading multiple parts.
    }
    if (parquetBytes) {
      // Cache the parquet bytes.
      this.parquetTableBytes[parquetPath] = parquetBytes;
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
  async loadParquetSchemaBytes(parquetPath) {
    const { store } = this.storeRoot;
    if (store.getRange) {
      // Step 1: Fetch last 8 bytes to get footer length and magic number
      const TAIL_LENGTH = 8;
      // Case 1: Parquet file.
      let partZeroPath = parquetPath;
      let tailBytes = await store.getRange(`/${partZeroPath}`, {
        suffixLength: TAIL_LENGTH,
      });
      if (!tailBytes) {
        // Case 2: Rather than a single file, this may be a directory with multiple parts.
        partZeroPath = `${parquetPath}/part.0.parquet`;
        tailBytes = await store.getRange(`/${partZeroPath}`, {
          suffixLength: TAIL_LENGTH,
        });
      }
      if (!tailBytes || tailBytes.length < TAIL_LENGTH) {
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

      // Step 4: Parse Thrift-encoded FileMetaData to identify the total number of rows and the row group size,
      // since this is not directly exposed by the table schema returned by readSchema.
      const { totalNumRows, rowGroupSize } = parquetFooterBytesToMetadata(footerBytes);
      console.log(`Parquet file ${parquetPath} has ${totalNumRows} total rows and row group size ${rowGroupSize}.`);

      // Step 5: Return the footer bytes
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
  
  /*
  async loadParquetRowGroup(parquetPath, rowIndex, columns = undefined) {
    // Load a single row group which contains the row with the specified index.
    const { readParquet, readParquetStream } = await this.parquetModulePromise;

    // TODO: read first row group to determine row group size.
    // TODO: need to implement a read_metadata sync function in parquet-wasm?
    // Reference: https://github.com/kylebarron/parquet-wasm/blob/c54250bd54a3cbf6e4ef94a7e180e802a929073b/src/reader_async.rs#L440
    const stream = await readParquetStream(url);
    const firstRowGroup = readParquet()

    // TODO: cache the row group size.

    // TODO: cache the extent (values of first/last rows of group) of the morton_code_2d column values associated with this row group.



  }
  */

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
    const { readParquet, readSchema } = await this.parquetModulePromise;


    // TODO: cache the schema associated with this path.


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

        console.log('arrowTableForSchema', arrowTableForSchema);
        // TODO: ensure that this contains the morton_code_2d column. cache whether or not it does.
        const hasMortonCode2dColumn = arrowTableForSchema.schema.fields.find(f => f.name === 'morton_code_2d');
        if (!hasMortonCode2dColumn) {
          throw new Error('Parquet table does not contain a morton_code_2d column, which is required for rectangle queries of subsets of points.');
        }
      }
    } catch (/** @type {any} */ e) {
      // If we fail to load the schema bytes, we can proceed to try to load the full table bytes,
      // for instance if range requests are not supported but the full table can be loaded.
      log.warn(`Failed to load parquet schema bytes for ${parquetPath}: ${e.message}`);
    }

    // TODO: implement morton code rect querying functionality here.
    // Port the python logic. Binary search over row groups. Cache morton code min/max of each row group to reduce search space.
    

  }
}
