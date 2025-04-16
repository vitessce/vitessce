/** @import { LoaderParams } from '@vitessce/types' */
/**
 * @template DataSourceType
 */
export default class AbstractTwoStepLoader<DataSourceType> extends AbstractLoader {
    /**
     *
     * @param {DataSourceType} dataSource
     * @param {LoaderParams} params
     */
    constructor(dataSource: DataSourceType, params: LoaderParams);
    dataSource: DataSourceType;
}
import AbstractLoader from './AbstractLoader.js';
import type { LoaderParams } from '@vitessce/types';
//# sourceMappingURL=AbstractTwoStepLoader.d.ts.map