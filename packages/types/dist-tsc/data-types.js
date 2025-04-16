export {};
/*
export abstract class Loader<DataType> {
  fileType: string;

  type: string;

  url?: string;

  requestInit?: RequestInit;

  options?: any;

  coordinationValues?: { [key: string]: any };

  constructor({
    type, fileType,
    url, requestInit,
    options, coordinationValues,
  }: LoaderParams) {
    this.fileType = fileType;
    this.type = type;
    this.url = url;
    this.requestInit = requestInit;
    this.options = options;
    this.coordinationValues = coordinationValues;
  }

  abstract load(): Promise<LoaderResult<DataType>>;
}

export abstract class TwoStepLoader<DataType, DataSourceType> extends Loader<DataType> {
  dataSource: DataSourceType;

  constructor(dataSource: DataSourceType, params: LoaderParams) {
    super(params);
    this.dataSource = dataSource;
  }
}

export abstract class ObsFeatureMatrixLoader extends Loader<ObsFeatureMatrixData> {
  abstract loadAttrs?(): Promise<LoaderResult<ObsFeatureMatrixAttrs>>;
}
*/
