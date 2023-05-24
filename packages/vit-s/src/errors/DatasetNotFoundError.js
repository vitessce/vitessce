import AbstractLoaderError from './AbstractLoaderError.js';

export default class DatasetNotFoundError extends AbstractLoaderError {
  constructor(datasetUid) {
    super(`Error finding dataset for ${datasetUid}. Please check that at least one dataset exists in the view config.`);
    this.name = 'DatasetNotFoundError';

    this.datasetUid = datasetUid;
  }

  warnInConsole() {
    const {
      datasetUid,
    } = this;
    if (datasetUid) {
      console.warn(
        `Unable to find dataset for ${datasetUid}`,
      );
    } else {
      console.warn('No dataset uid specified.');
    }
  }
}
