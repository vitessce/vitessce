/**
   * Loader for string arrays located in anndata.zarr stores.
   */
export default class SampleEdgesAnndataLoader extends AbstractTwoStepLoader<any> {
    constructor(dataSource: any, params: import("@vitessce/types").LoaderParams);
    /**
       * Class method for loading observation string labels.
       * @returns {Promise} A promise for the array.
       */
    loadLabels(): Promise<any>;
    labels: any;
    load(): Promise<LoaderResult<{
        obsIndex: any;
        sampleIds: any;
    }>>;
}
import { AbstractTwoStepLoader } from '@vitessce/vit-s';
import { LoaderResult } from '@vitessce/vit-s';
//# sourceMappingURL=SampleEdgesAnndataLoader.d.ts.map