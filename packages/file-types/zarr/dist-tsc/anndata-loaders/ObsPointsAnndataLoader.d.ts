/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsPointsAnndataLoader extends AbstractTwoStepLoader<any> {
    constructor(dataSource: any, params: import("@vitessce/types").LoaderParams);
    /**
     * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
     * @returns {Promise} A promise for an array of columns.
     */
    loadPoints(): Promise<any>;
    locations: any;
    load(): Promise<LoaderResult<{
        obsIndex: any;
        obsPoints: any;
    }>>;
}
import { AbstractTwoStepLoader } from '@vitessce/vit-s';
import { LoaderResult } from '@vitessce/vit-s';
//# sourceMappingURL=ObsPointsAnndataLoader.d.ts.map