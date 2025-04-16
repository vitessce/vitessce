/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsFeatureColumnsAnndataLoader extends AbstractTwoStepLoader<any> {
    constructor(dataSource: any, params: import("@vitessce/types").LoaderParams);
    /**
     * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
     * @returns {Promise} A promise for an array of columns.
     */
    loadObsFeatureColumns(): Promise<any>;
    obsFeatureColumns: Promise<null> | {
        obsIndex: any;
        featureIndex: any;
        obsFeatureMatrix: {
            data: Float32Array;
        };
    } | undefined;
    load(): Promise<LoaderResult<{
        obsIndex: any;
        obsFeatureMatrix: any;
        featureIndex: any;
    }>>;
}
import { AbstractTwoStepLoader } from '@vitessce/vit-s';
import { LoaderResult } from '@vitessce/vit-s';
//# sourceMappingURL=ObsFeatureColumnsAnndataLoader.d.ts.map