/** @import { DataSourceParams } from '@vitessce/types' */
/** @import { ByteStringArray } from '@zarrita/typedarray' */
/** @import { TypedArray as ZarrTypedArray, Chunk } from '@zarrita/core' */
/**
 * A base AnnData loader which has all shared methods for more comlpex laoders,
 * like loading cell names and ids. It inherits from AbstractLoader.
 */
export default class AnnDataSource extends ZarrDataSource {
    /** @type {Map<string, Promise<(undefined | string[] | string[][])>>} */
    promises: Map<string, Promise<(undefined | string[] | string[][])>>;
    /**
     *
     * @param {string[]} paths Paths to multiple string-valued columns
     * within the obs dataframe.
     * @returns {Promise<(undefined | string[] | string[][])[]>} Returns
     * each column as an array of strings,
     * ordered the same as the paths.
     */
    loadObsColumns(paths: string[]): Promise<(undefined | string[] | string[][])[]>;
    /**
     *
     * @param {string[]} paths Paths to multiple string-valued columns
     * within the var dataframe.
     * @returns {Promise<(undefined | string[] | string[][])[]>} Returns
     * each column as an array of strings,
     * ordered the same as the paths.
     */
    loadVarColumns(paths: string[]): Promise<(undefined | string[] | string[][])[]>;
    /**
     * Class method for loading obs variables.
     * Takes the location as an argument because this is shared across objects,
     * which have different ways of specifying location.
     * @param {string[] | string[][]} paths An array of strings like
     * "obs/leiden" or "obs/bulk_labels."
     * @returns {Promise<(undefined | string[] | string[][])[]>} A promise
     * for an array of ids with one per cell.
     */
    _loadColumns(paths: string[] | string[][]): Promise<(undefined | string[] | string[][])[]>;
    /**
     *
     * @param {string} path
     * @returns
     */
    _loadColumn(path: string): Promise<string[]>;
    /**
     * Class method for loading general numeric arrays.
     * @param {string} path A string like obsm.X_pca.
     * @returns {Promise<Chunk<any>>} A promise for a zarr array containing the data.
     */
    loadNumeric(path: string): Promise<Chunk<any>>;
    /**
     * Class method for loading specific columns of numeric arrays.
     * @param {string} path A string like obsm.X_pca.
     * @param {[number, number]} dims The column indices to load.
     * @returns {Promise<{
     *  data: [ZarrTypedArray<any>, ZarrTypedArray<any>],
     *  shape: [number, number],
     * }>} A promise for a zarr array containing the data.
     */
    loadNumericForDims(path: string, dims: [number, number]): Promise<{
        data: [any[] | Int8Array | Int16Array | Int32Array | BigInt64Array | Uint8Array | Uint16Array | Uint32Array | BigUint64Array | Float32Array | Float64Array | import("@zarrita/typedarray").BoolArray | import("@zarrita/typedarray").UnicodeStringArray | ByteStringArray, any[] | Int8Array | Int16Array | Int32Array | BigInt64Array | Uint8Array | Uint16Array | Uint32Array | BigUint64Array | Float32Array | Float64Array | import("@zarrita/typedarray").BoolArray | import("@zarrita/typedarray").UnicodeStringArray | ByteStringArray];
        shape: [number, number];
    }>;
    /**
     * A common method for loading flattened data
     * i.e that which has shape [n] where n is a natural number.
     * @param {string} path A path to a flat array location, like obs/_index
     * @returns {Promise<string[]>} The data from the zarr array.
     */
    getFlatArrDecompressed(path: string): Promise<string[]>;
    /**
     * Class method for loading the obs index.
     * @param {string|undefined} path Used by subclasses.
     * @returns {Promise<string[]>} An promise for a zarr array
     * containing the indices.
     */
    loadObsIndex(path?: string | undefined): Promise<string[]>;
    obsIndex: Promise<string[]> | undefined;
    /**
     * Class method for loading the var index.
     * @param {string|undefined} path Used by subclasses.
     * @returns {Promise<string[]>} An promise for a zarr array containing the indices.
     */
    loadVarIndex(path?: string | undefined): Promise<string[]>;
    varIndex: Promise<string[]> | undefined;
    /**
     * Class method for loading the var alias.
     * @param {string} varPath
     * @param {string|undefined} matrixPath
     * @returns {Promise<string[]>} An promise for a zarr array containing the aliased names.
     */
    loadVarAlias(varPath: string, matrixPath?: string | undefined): Promise<string[]>;
    varAlias: any;
    /**
     *
     * @param {string} path
     * @returns {Promise<object>}
     */
    _loadAttrs(path: string): Promise<object>;
    /**
     *
     * @param {string} path
     * @returns {Promise<string>}
     */
    _loadString(path: string): Promise<string>;
    /**
     *
     * @param {string} path
     * @returns {Promise<string[]>}
     */
    _loadStringArray(path: string): Promise<string[]>;
    /**
     *
     * @param {string} path
     * @returns
     */
    _loadElement(path: string): Promise<string | string[] | null>;
    /**
     *
     * @param {string} path
     * @param {string[]} keys
     * @returns
     */
    _loadDict(path: string, keys: string[]): Promise<{
        [k: string]: string | string[] | null;
    }>;
}
import ZarrDataSource from './ZarrDataSource.js';
import type { Chunk } from '@zarrita/core';
import type { ByteStringArray } from '@zarrita/typedarray';
//# sourceMappingURL=AnnDataSource.d.ts.map