import AbstractLoaderError from './AbstractLoaderError';

export default class UnsupportedEncodingError extends AbstractLoaderError {
  constructor(encodingType, encodingVersion) {
    super(`Unsupported encoding for encoding-type ${encodingType} and encoding-version ${encodingVersion}. A short-term solution to this issue may be to downgrade the version of the library that produced this file (e.g., anndata).`);
    this.name = 'UnsupportedEncodingError';

    this.encodingType = encodingType;
    this.encodingVersion = encodingVersion;
  }

  warnInConsole() {
    console.warn(this.message);
  }
}
