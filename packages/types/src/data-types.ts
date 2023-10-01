import type { Readable } from '@zarrita/storage';
import type { AbstractImageWrapper } from './imaging.js';
import type { SetsTree } from './sets.js';

export type MatrixResult = {
  data: number[] | Float32Array[];
  shape: number[];
};

export type StridedMatrixResult = {
  data: Float32Array;
  shape: number[];
};

export type ObsFeatureMatrixData = {
  obsIndex: string[];
  featureIndex: string[];
  obsFeatureMatrix: StridedMatrixResult;
};

export type ObsFeatureMatrixAttrs = {
  obsIndex: string[];
  featureIndex: string[];
};

export type ObsEmbeddingData = {
  obsIndex: string[];
  obsEmbedding: MatrixResult;
};

export type ObsLocationsData = {
  obsIndex: string[];
  obsLocations: MatrixResult;
};

export type ObsPointsData = {
  obsIndex: string[];
  obsPoints: MatrixResult;
};

export type ObsSpotsData = {
  obsIndex: string[];
  obsSpots: MatrixResult;
};

export type FeatureLabelsData = {
  featureIndex: string[];
  featureLabels: string[];
};

export type ObsLabelsData = {
  obsIndex: string[];
  obsLabels: string[];
};

export type ObsSetsData = {
  obsIndex: string[];
  obsSets: SetsTree;
  obsSetsMembership: Map<string, string[][]>;
};

// Imaging
export type ObsSegmentationsPolygons = {
  obsSegmentations: { data: number[][][], shape: number[] };
  obsSegmentationsType: 'polygon';
};

export type ObsSegmentationsBitmask = {
  obsSegmentations: {
    instance: AbstractImageWrapper;
    image?: any;
    metadata?: any;
  };
  obsSegmentationsType: 'bitmask';
};

export type ObsSegmentationsData = ObsSegmentationsPolygons | ObsSegmentationsBitmask;

export type ImageData = {
  image: {
    instance: AbstractImageWrapper;
    image?: any;
    metadata?: any;
  };
  featureIndex: string[];
};

export interface LoaderResult<DataType> {
  data: DataType;
  url?: string | { url: string, name: string}[];
  coordinationValues?: { [key: string]: any };
}

type LoaderParams<OptionsType> = {
  type: string, fileType: string,
  url?: string, requestInit?: RequestInit,
  options?: OptionsType, coordinationValues?: { [key: string]: any },
};

export abstract class Loader<DataType, OptionsType> {
  fileType: string;

  type: string;

  url?: string;

  requestInit?: RequestInit;

  options?: OptionsType;

  coordinationValues?: { [key: string]: any };

  constructor({
    type, fileType,
    url, requestInit,
    options, coordinationValues,
  }: LoaderParams<OptionsType>) {
    this.fileType = fileType;
    this.type = type;
    this.url = url;
    this.requestInit = requestInit;
    this.options = options;
    this.coordinationValues = coordinationValues;
  }

  abstract load(): Promise<LoaderResult<DataType>>;
}

type DataSourceParams = {
  url?: string, requestInit?: RequestInit, store?: Readable,
};

export abstract class DataSource {
  url?: string;

  requestInit?: RequestInit;

  store?: Readable;

  constructor({ url, requestInit, store }: DataSourceParams) {
    this.url = url;
    this.requestInit = requestInit;
    this.store = store;
  }
}

export abstract class TwoStepLoader<
  DataType, DataSourceType extends DataSource, OptionsType
> extends Loader<DataType, OptionsType> {
  dataSource: DataSourceType;

  constructor(dataSource: DataSourceType, params: LoaderParams<OptionsType>) {
    super(params);
    this.dataSource = dataSource;
  }
}

export interface ObsFeatureMatrixAttrsLoader {
  loadAttrs?(): Promise<LoaderResult<ObsFeatureMatrixAttrs>>;
}
