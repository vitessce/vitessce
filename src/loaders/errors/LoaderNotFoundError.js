import AbstractLoaderError from './AbstractLoaderError';

export default class LoaderNotFoundError extends AbstractLoaderError {
  constructor(datasetName, datasetType, datasetUrl) {
    super(`Error finding loader for ${datasetName}.`);
    this.name = 'LoaderNotFoundError';

    this.datasetName = datasetName;
    this.datasetType = datasetType;
    this.datasetUrl = datasetUrl;
  }

  warnInConsole() {
    const {
      datasetName, datasetType, datasetUrl,
    } = this;
    console.warn(
      `"${datasetName}" (${datasetType}) from ${datasetUrl}: loader matching failed`,
    );
  }
}
