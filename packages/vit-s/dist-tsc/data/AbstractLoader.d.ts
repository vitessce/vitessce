/** @import { LoaderParams } from '@vitessce/types' */
/**
 * A loader ancestor class containing a default constructor
 * and a stub for the required load() method.
 */
export default class AbstractLoader {
    /**
     *
     * @param {LoaderParams} params
     */
    constructor({ type, fileType, url, requestInit, options, coordinationValues, }: LoaderParams);
    fileType: string;
    type: string;
    url: string | undefined;
    requestInit: RequestInit | undefined;
    options: any;
    coordinationValues: {
        [key: string]: any;
    } | undefined;
    /**
     *
     * @returns {Promise<LoaderResult<any>>}
     */
    load(): Promise<LoaderResult<any>>;
}
import LoaderResult from './LoaderResult.js';
import type { LoaderParams } from '@vitessce/types';
//# sourceMappingURL=AbstractLoader.d.ts.map