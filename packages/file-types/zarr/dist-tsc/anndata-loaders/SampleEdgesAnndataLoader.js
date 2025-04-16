import { LoaderResult, AbstractTwoStepLoader, AbstractLoaderError, } from '@vitessce/vit-s';
/**
   * Loader for string arrays located in anndata.zarr stores.
   */
export default class SampleEdgesAnndataLoader extends AbstractTwoStepLoader {
    /**
       * Class method for loading observation string labels.
       * @returns {Promise} A promise for the array.
       */
    loadLabels() {
        const { path } = this.options;
        if (this.labels) {
            return this.labels;
        }
        if (!this.labels) {
            // eslint-disable-next-line no-underscore-dangle
            this.labels = this.dataSource._loadColumn(path);
            return this.labels;
        }
        this.labels = Promise.resolve(null);
        return this.labels;
    }
    async load() {
        const { path } = this.options;
        const superResult = await super.load().catch(reason => Promise.resolve(reason));
        if (superResult instanceof AbstractLoaderError) {
            return Promise.reject(superResult);
        }
        return Promise.all([
            this.dataSource.loadObsIndex(path),
            this.loadLabels(),
        ]).then(([obsIndex, sampleIds]) => Promise.resolve(new LoaderResult({ obsIndex, sampleIds }, null)));
    }
}
