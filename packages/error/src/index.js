export class VitessceError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'VitessceError';
  }
}

export class LoaderNotFoundError extends VitessceError {
  constructor(message, options) {
    super(message, options);
    this.name = 'LoaderNotFoundError';
  }
}

export class DataLoaderError extends VitessceError {
  constructor(message, options) {
    super(message, options);
    this.name = 'DataLoaderError';
  }
}

export class JsonLoaderValidationError extends DataLoaderError {
  constructor(message, options) {
    super(message, options);
    this.name = 'JsonLoaderValidationError';
  }
}

export class UnknownSpatialDataFormatError extends DataLoaderError {
  constructor(message, options) {
    super(message, options);
    this.name = 'UnknownSpatialDataFormatError';
  }
}

export class DataFetchError extends DataLoaderError {
  constructor(message, options) {
    super(message, options);
    this.name = 'DataFetchError';
  }
}

export class ZarrNodeNotFoundError extends DataLoaderError {
  constructor(message, options) {
    super(message, options);
    this.name = 'ZarrNodeNotFoundError';
  }
}

/**
* A Zarr node exists and opened successfully, but its attrs don't satisfy an
* expected format convention (e.g. an AnnData obs dataframe missing
* `column-order`/`encoding-type`/`encoding-version`).
*/
export class ZarrConventionError extends DataLoaderError {
  constructor(message, options) {
    super(message, options);
    this.name = 'ZarrConventionError';
  }
}

/**
* A Zarr node exists but could not be opened (is unreadable ) -- e.g. an unsupported dtype or
* codec (such as a Scanpy `rank_genes_groups` recarray, which zarrita cannot
* parse).
*/
export class ZarrUnsupportedNodeError extends DataLoaderError {
  constructor(message, options) {
    super(message, options);
    this.name = 'ZarrUnsupportedNodeError';
  }
}
