import AbstractLoaderError from './AbstractLoaderError';

export default class LoaderNotFoundError extends AbstractLoaderError {
  constructor(datasetType, datasetFileType, datasetUrl) {
    super(`Error finding loader for ${datasetType}.`);
    this.name = 'LoaderNotFoundError';

    this.datasetType = datasetType;
    this.datasetFileType = datasetFileType;
    this.datasetUrl = datasetUrl;
  }

  warnInConsole() {
    const {
      datasetType, datasetFileType, datasetUrl,
    } = this;
    if (datasetFileType && datasetUrl) {
      console.warn(
        `${datasetType} from ${datasetUrl}: unable to find loader for fileType ${datasetFileType}`,
      );
    } else {
      console.warn(
        `${datasetType}: unable to find loader`,
      );
    }
  }
}
