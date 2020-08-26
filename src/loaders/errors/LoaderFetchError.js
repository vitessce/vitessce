import AbstractLoaderError from './AbstractLoaderError';

export default class LoaderFetchError extends AbstractLoaderError {
  constructor(datasetName, datasetType, datasetFileType, datasetUrl, responseHeaders) {
    super(`Error HTTP status fetching ${datasetType}.`);
    this.name = 'LoaderFetchError';

    this.datasetName = datasetName;
    this.datasetType = datasetType;
    this.datasetFileType = datasetFileType;
    this.datasetUrl = datasetUrl;
    this.responseHeaders = responseHeaders;
  }

  warnInConsole() {
    const {
      datasetName, datasetType, datasetUrl, responseHeaders,
    } = this;
    console.warn(
      `"${datasetName}" (${datasetType}) from ${datasetUrl}: fetch failed`,
      responseHeaders,
    );
  }
}
