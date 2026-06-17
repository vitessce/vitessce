export class VitessceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VitessceError';
  }
}

export class LoaderNotFoundError extends VitessceError {
  constructor(message) {
    super(message);
    this.name = 'LoaderNotFoundError';
  }
}

export class DataLoaderError extends VitessceError {
  constructor(message) {
    super(message);
    this.name = 'DataLoaderError';
  }
}

export class JsonLoaderValidationError extends DataLoaderError {
  constructor(message) {
    super(message);
    this.name = 'JsonLoaderValidationError';
  }
}

export class UnknownSpatialDataFormatError extends DataLoaderError {
  constructor(message) {
    super(message);
    this.name = 'UnknownSpatialDataFormatError';
  }
}

export class DataFetchError extends DataLoaderError {
  constructor(message) {
    super(message);
    this.name = 'DataFetchError';
  }
}

export class ZarrNodeNotFoundError extends DataLoaderError {
  constructor(message) {
    super(message);
    this.name = 'ZarrNodeNotFoundError';
  }
}
