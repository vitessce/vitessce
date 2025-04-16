/**
 * Loader for embedding arrays located in anndata.zarr stores.
 */
export default class ObsSegmentationsAnndataLoader extends AbstractTwoStepLoader<any> {
    constructor(dataSource: any, params: import("@vitessce/types").LoaderParams);
    /**
     * Class method for loading embedding coordinates, such as those from UMAP or t-SNE.
     * @returns {Promise} A promise for an array of columns.
     */
    loadSegmentations(): Promise<any>;
    segmentations: any;
    load(): Promise<LoaderResult<{
        obsIndex: any;
        obsSegmentations: any;
        obsSegmentationsType: string;
    }>>;
}
import { AbstractTwoStepLoader } from '@vitessce/vit-s';
import { LoaderResult } from '@vitessce/vit-s';
//# sourceMappingURL=ObsSegmentationsAnndataLoader.d.ts.map