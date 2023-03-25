import log from 'loglevel';
import AbstractLoaderError from './AbstractLoaderError';

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
      log.warn(
        `Unable to find dataset for ${datasetUid}`,
      );
    } else {
      log.warn('No dataset uid specified.');
    }
  }
}
