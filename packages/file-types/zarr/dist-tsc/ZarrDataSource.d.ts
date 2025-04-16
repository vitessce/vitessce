/** @import { Location as ZarrLocation } from '@zarrita/core' */
/** @import { Readable } from '@zarrita/storage' */
/** @import { DataSourceParams } from '@vitessce/types' */
/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class ZarrDataSource {
    /**
     * @param {DataSourceParams} params The parameters object.
     */
    constructor({ url, requestInit, store, fileType }: DataSourceParams);
    storeRoot: ZarrLocation<Readable>;
    /**
     *
     * @param {string} path
     * @returns {ZarrLocation<Readable>}
     */
    getStoreRoot(path: string): ZarrLocation<Readable>;
    /**
     * Method for accessing JSON attributes, relative to the store root.
     * @param {string} key A path to the item.
     * @param {ZarrLocation<Readable>|null} storeRootParam An optional location,
     * which if provided will override the default store root.
     * @returns {Promise<any>} This async function returns a promise
     * that resolves to the parsed JSON if successful.
     * @throws This may throw an error.
     */
    getJson(key: string, storeRootParam?: ZarrLocation<Readable> | null): Promise<any>;
}
import type { Readable } from '@zarrita/storage';
import type { Location as ZarrLocation } from '@zarrita/core';
import type { DataSourceParams } from '@vitessce/types';
//# sourceMappingURL=ZarrDataSource.d.ts.map