import AbstractLoaderError from './AbstractLoaderError';

export default class LoaderFetchError extends AbstractLoaderError {
  constructor(datasetType, datasetFileType, datasetUrl, responseHeaders) {
    super(`Error HTTP status fetching ${datasetType}.`);
    this.name = 'LoaderFetchError';

    this.datasetType = datasetType;
    this.datasetFileType = datasetFileType;
    this.datasetUrl = datasetUrl;
    this.responseHeaders = responseHeaders;
  }

  warnInConsole() {
    const {
      datasetType, datasetUrl, responseHeaders,
    } = this;
    console.warn(
      `${datasetType} from ${datasetUrl}: fetch failed`,
      responseHeaders,
    );
  }
}
