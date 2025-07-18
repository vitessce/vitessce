// @ts-check
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
import { tableFromIPC } from 'apache-arrow';
import { AnnDataSource } from '@vitessce/zarr';

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
   * TODO: change implementation so that subsets of columns can be loaded if the whole table is not needed.
   * Will first need to load the table schema.
   * @param {string} parquetPath A path to a parquet file (or directory).
   * @returns
   */
  async loadParquetTable(parquetPath) {
    if (this.parquetTables[parquetPath]) {
      // Return cached table if present.
      return this.parquetTables[parquetPath];
    }
    const readParquet = await getReadParquet();
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
    const wasmTable = readParquet(parquetBytes);
    // TODO: use streaming?
    const arrowTable = tableFromIPC(wasmTable.intoIPCStream());
    this.parquetTables[parquetPath] = arrowTable;
    return this.parquetTables[parquetPath];
  }
}
