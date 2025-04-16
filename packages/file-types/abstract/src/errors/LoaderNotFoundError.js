import { log } from '@vitessce/globals';
import AbstractLoaderError from './AbstractLoaderError.js';

export default class LoaderNotFoundError extends AbstractLoaderError {
  constructor(loaders, dataset, fileType, viewCoordinationValues) {
    super(`Error: unable to find matching ${fileType} file in dataset ${dataset}.`);
    this.name = 'LoaderNotFoundError';

    this.loaders = loaders;
    this.dataset = dataset;
    this.fileType = fileType;
    this.viewCoordinationValues = viewCoordinationValues;
    this.message = `Expected to match on { ${
      Object.entries(viewCoordinationValues || {})
        .map(([k, v]) => `${k}: ${v ?? 'null'}`)
        .join(', ')
    } }`;
  }

  warnInConsole() {
    const { loaders, message } = this;
    log.warn(message, loaders);
  }
}
