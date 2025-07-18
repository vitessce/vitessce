// @ts-check
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
import { tableFromIPC } from 'apache-arrow';
import { AnnDataSource } from '@vitessce/zarr';

/** @import { DataSourceParams } from '@vitessce/types' */
/** @import { TypedArray as ZarrTypedArray, Chunk } from 'zarrita' */

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
  return { readParquet: module.readParquet, readSchema: module.readSchema };
}

/**
 * Get the name of the index column from an Apache Arrow table.
 * @param {import('apache-arrow').Table} arrowTable
 * @returns {string|null}
 */
function tableToIndexColumnName(arrowTable) {
  const pandasMetadata = arrowTable.schema.metadata.get('pandas');
  if (pandasMetadata) {
    const pandasMetadataJson = JSON.parse(pandasMetadata);
    if(Array.isArray(pandasMetadataJson.index_columns) && pandasMetadataJson.index_columns.length === 1) {
      return pandasMetadataJson.index_columns?.[0];
    } else {
      throw new Error('Expected a single index column in the pandas metadata.');
    }
  }
  return null;
}

/**
 * This class is a parent class for tables, shapes, and points.
 * This is because these share functionality, for example:
 * - both shapes (the latest version) and points use parquet-based formats.
 * - both shapes (a previous version) and tables use zarr-based formats.
 * - logic for manipulating spatialdata element paths is shared across all elements.
 */
export default class AbstractSpatialDataSource extends AnnDataSource {
  /**
   *
   * @param {DataSourceParams} params
   */
  constructor(params) {
    super(params);

    // TODO: change to column-specific storage.
    /** @type {{ [k: string]: import('apache-arrow').Table }} */
    this.parquetTables = {};

    this.parquetModulePromise = getParquetModule();
  }

  /**
   * This function loads the attrs for the root spatialdata object.
   * This is not the same as the attrs for a specific element.
   * @returns
   */
  async loadSpatialDataObjectAttrs() {
    const rootAttrs = await this.getJson(`.zattrs`);
    const { spatialdata_attrs } = rootAttrs;
    const { spatialdata_software_version: softwareVersion, version: formatVersion } = spatialdata_attrs;
    return { softwareVersion, formatVersion };
  }

  /**
   * Get the attrs for a specific element (e.g., "shapes/{element_name}" or "tables/{element_name}").
   * @param {string} elementPath
   * @returns
   */
  async loadSpatialDataElementAttrs(elementPath) {
    // TODO: normalize the elementPath to always end without a slash?
    // TODO: ensure that elementPath is a valid spatial element path?
    const v0_4_0_attrs = await this.getJson(`${elementPath}/.zattrs`);
    
    if (v0_4_0_attrs["encoding-type"] === "anndata") {
      const attrsKeys = Object.keys(v0_4_0_attrs);
      if (['instance_key', 'region', 'region_key'].every(k => attrsKeys.includes(k))) {
        // TODO: assert things about "spatialdata-encoding-type" and "version" values?
        // TODO: first check the "spatialdata_software_version" metadata in
        // the root of the spatialdata object? (i.e., sdata.zarr/.zattrs)
        return v0_4_0_attrs;
      }
      // Prior to v0.4.0 of the spatialdata package, the spatialdata_attrs
      // lived within their own dictionary within "uns".
      const pre_v0_4_0_attrs = await this._loadDict(`${elementPath}/uns/spatialdata_attrs`, ['instance_key', 'region', 'region_key']);
      return pre_v0_4_0_attrs;
    }
    return v0_4_0_attrs;
  }

  /**
   * 
   * @param {string} parquetPath The path to the parquet file or directory, relative to the store root.
   * @returns {Promise<Uint8Array|undefined>} The parquet file bytes.
   */
  async loadParquetBytes(parquetPath) {
    let parquetBytes = await this.storeRoot.store.get(`/${parquetPath}`);
    if (!parquetBytes) {
      // This may be a directory with multiple parts.
      const part0Path = `${parquetPath}/part.0.parquet`;
      parquetBytes = await this.storeRoot.store.get(`/${part0Path}`);

      // TODO: support loading multiple parts.
    }
    return parquetBytes;
  }

  /**
   * Try to load only the schema bytes of a parquet file.
   * This is useful for getting the index column name without loading the full table.
   * This will only work if the store supports getRange, for example FetchStore.
   * Reference: https://github.com/manzt/zarrita.js/blob/c0dd684dc4da79a6f42ab2a591246947bde8d143/packages/%40zarrita-storage/src/fetch.ts#L87
   * @param {string} parquetPath The path to the parquet file or directory, relative to the store root.
   * @returns {Promise<Uint8Array|null>} The parquet file bytes, or null if the store does not support getRange.
   */
  async loadParquetSchemaBytes(parquetPath) {
    const { store } = this.storeRoot;
    if (store.getRange) {
      // Step 1: Fetch last 8 bytes to get footer length and magic number
      const TAIL_LENGTH = 8;
      let partZeroPath = parquetPath;
      let tailBytes = await store.getRange(`/${partZeroPath}`, { suffixLength: TAIL_LENGTH });
      if(!tailBytes) {
        // This may be a directory with multiple parts.
        partZeroPath = `${parquetPath}/part.0.parquet`;
        tailBytes = await store.getRange(`/${partZeroPath}`, { suffixLength: TAIL_LENGTH });
      }
      if (!tailBytes || tailBytes.length < TAIL_LENGTH) {
        throw new Error(`Failed to load parquet footerLength for ${parquetPath}`);
      }
      // Step 2: Extract footer length and magic number
      const footerLength = new DataView(tailBytes.buffer).getInt32(0, true); // little-endian
      const magic = new TextDecoder().decode(tailBytes.slice(4, 8));

      if (magic !== 'PAR1') {
        throw new Error('Invalid Parquet file: missing PAR1 magic number');
      }
      
      // Step 3. Fetch the full footer bytes
      const footerBytes = await store.getRange(`/${partZeroPath}`, { suffixLength: footerLength + TAIL_LENGTH });
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
   * TODO: change implementation so that subsets of columns can be loaded if the whole table is not needed.
   * Will first need to load the table schema.
   * @param {string} parquetPath A path to a parquet file (or directory).
   * @param {string[]|undefined} columns An optional list of column names to load.
   * @returns
   */
  async loadParquetTable(parquetPath, columns = undefined) {
    if (this.parquetTables[parquetPath]) {
      // Return cached table if present.
      return this.parquetTables[parquetPath];
    }
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
      const schemaBytes = await this.loadParquetSchemaBytes(parquetPath);
      if (schemaBytes) {
        const wasmSchema = readSchema(schemaBytes);
        const arrowTableForSchema = tableFromIPC(wasmSchema.intoIPCStream());
        indexColumnName = tableToIndexColumnName(arrowTableForSchema);
      }
    }
    // Load the full table bytes.

    // TODO: can we avoid loading the full table bytes
    // if we only need a subset of columns?
    // For example, if the store supports
    // getRange like above to get the schema bytes.
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
      const arrowTableForSchema = tableFromIPC(wasmSchema.intoIPCStream());
      indexColumnName = tableToIndexColumnName(arrowTableForSchema);
    }

    if (options.columns && indexColumnName) {
      options.columns = [...options.columns, indexColumnName];
    }
    
    const wasmTable = readParquet(parquetBytes, options);
    const arrowTable = tableFromIPC(wasmTable.intoIPCStream());

    this.parquetTables[parquetPath] = arrowTable;
    return this.parquetTables[parquetPath];
  }
  
}
