/** @import AnnDataSource from '../AnnDataSource.js' */
/** @import { FeatureLabelsData } from '@vitessce/types' */
/**
 * Loader for string arrays located in anndata.zarr stores.
 * @template {AnnDataSource} DataSourceType
 * @extends {AbstractTwoStepLoader<DataSourceType>}
 */
export default class FeatureLabelsAnndataLoader<DataSourceType extends AnnDataSource> extends AbstractTwoStepLoader<DataSourceType> {
    constructor(dataSource: DataSourceType, params: import("@vitessce/types").LoaderParams);
    /**
     * Class method for loading feature string labels.
     * @returns {Promise<string[]>} A promise for the array.
     */
    loadLabels(): Promise<string[]>;
    labels: Promise<string[]> | undefined;
    /**
     *
     * @returns {Promise<LoaderResult<FeatureLabelsData>>}
     */
    load(): Promise<LoaderResult<FeatureLabelsData>>;
}
import type AnnDataSource from '../AnnDataSource.js';
import { AbstractTwoStepLoader } from '@vitessce/vit-s';
import { LoaderResult } from '@vitessce/vit-s';
import type { FeatureLabelsData } from '@vitessce/types';
//# sourceMappingURL=FeatureLabelsAnndataLoader.d.ts.map