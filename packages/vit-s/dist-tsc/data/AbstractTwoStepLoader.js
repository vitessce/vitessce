// @ts-check
import AbstractLoader from './AbstractLoader.js';
/** @import { LoaderParams } from '@vitessce/types' */
/**
 * @template DataSourceType
 */
export default class AbstractTwoStepLoader extends AbstractLoader {
    /**
     *
     * @param {DataSourceType} dataSource
     * @param {LoaderParams} params
     */
    constructor(dataSource, params) {
        super(params);
        this.dataSource = dataSource;
    }
}
