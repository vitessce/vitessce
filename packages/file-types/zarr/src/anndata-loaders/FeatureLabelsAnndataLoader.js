import { LoaderResult, AbstractTwoStepLoader, AbstractLoaderError } from '@vitessce/vit-s';
import { dirname } from '../utils';

const optionsSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://github.com/vitessce/vitessce/#cells',
  title: 'obsEmbedding.anndata.zarr options',
  type: 'object',
  additionalProperties: false,
  required: ['path'],
  properties: {
    path: { type: 'string' },
  },
};

/**
 * Loader for string arrays located in anndata.zarr stores.
 */
export default class FeatureLabelsAnndataLoader extends AbstractTwoStepLoader {
  constructor(dataSource, params) {
    super(dataSource, params);
    this.optionsSchema = optionsSchema;
  }

  /**
   * Class method for loading feature string labels.
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
      // Pass in the obsEmbedding path,
      // to handle the MuData case where the obsIndex is located at
      // `mod/rna/index` rather than `index`.
      this.dataSource.loadVarIndex(dirname(path)),
      this.loadLabels(),
    ]).then(([featureIndex, featureLabels]) => Promise.resolve(new LoaderResult(
      {
        featureIndex,
        featureLabels,
        featureLabelsMap: new Map(featureIndex.map((key, i) => ([key, featureLabels[i]]))),
      },
      null,
    )));
  }
}
