// TODO: REMOVE THESE CLASSES
export class AbstractLoaderError {
    constructor(message) {
        this.message = message;
        this.name = 'AbstractLoaderError';
    }
}
export class LoaderValidationError extends AbstractLoaderError {
    constructor(message) {
        this.message = message;
        this.name = 'LoaderValidationError';
    }
}
export class DataSourceFetchError extends AbstractLoaderError {
    constructor(message) {
        this.message = message;
        this.name = 'DataSourceFetchError';
    }
}
// END TODO: REMOVE THESE CLASSES



export class VitessceError extends Error {
  constructor(message) {
    super(message);
    this.name = "VitessceError";
  }
}

export class LoaderNotFoundError extends VitessceError {
  constructor(message) {
    super(message);
    this.name = "LoaderNotFoundError";
  }
}

export class DataLoaderError extends VitessceError {
  constructor(message) {
    super(message);
    this.name = "DataLoaderError";
  }
}

export class JsonLoaderValidationError extends DataLoaderError {
  constructor(message) {
    super(message);
    this.name = "JsonLoaderValidationError";
  }
}

export class UnknownSpatialDataFormatError extends DataLoaderError {
  constructor(message) {
    super(message);
    this.name = "UnknownSpatialDataFormatError";
  }
}

export class DataFetchError extends DataLoaderError {
  constructor(message) {
    super(message);
    this.name = "DataFetchError";
  }
}
