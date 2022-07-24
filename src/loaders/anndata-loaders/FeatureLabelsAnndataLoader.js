import LoaderResult from '../LoaderResult';
import AbstractTwoStepLoader from '../AbstractTwoStepLoader';
import { AbstractLoaderError } from '../errors';

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
  async loadLabels() {
    const { path } = this.options;
    if (this.labels) {
      return this.labels;
    }
    if (!this.labels) {
      // eslint-disable-next-line no-underscore-dangle
      this.labels = await this.dataSource._loadColumn(path);
      return this.labels;
    }
    this.labels = Promise.resolve(null);
    return this.labels;
  }

  async load() {
    const superResult = await super.load().catch(reason => Promise.resolve(reason));
    if (superResult instanceof AbstractLoaderError) {
      return Promise.reject(superResult);
    }
    return Promise.all([
      this.dataSource.loadVarIndex(),
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
