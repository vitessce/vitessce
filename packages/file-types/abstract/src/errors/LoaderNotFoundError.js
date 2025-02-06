import { log, getDebugMode, saveError } from '@vitessce/globals';
import AbstractLoaderError from './AbstractLoaderError.js';

export default class LoaderNotFoundError extends AbstractLoaderError {
  constructor(loaders, dataset, fileType, viewCoordinationValues) {
    super(`Error: unable to find matching ${fileType} file in dataset ${dataset}.`);
    this.name = 'LoaderNotFoundError';

    this.loaders = loaders;
    this.dataset = dataset;
    this.fileType = fileType;
    this.viewCoordinationValues = viewCoordinationValues;
    this.debugMode = getDebugMode();
    this.message = `Expected to match on { ${
      Object.entries(viewCoordinationValues || {})
        .map(([k, v]) => `${k}: ${v ?? 'null'}`)
        .join(', ')
    } }`;

    if (this.debugMode) {
      saveError({
        message: this.message,
        fileType: this.fileType,
        dataset: this.dataset,
        name: this.name,
      });
    }
  }

  warnInConsole() {
    const { loaders, message } = this;
    log.warn(message, loaders);
  }
}
