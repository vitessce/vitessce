import type { AbstractImageWrapper } from './imaging.js';
import type { SetsTree } from './sets.js';

export type MatrixResult = {
  data: number[] | Float32Array[];
  shape: number[];
};

export type ObsFeatureMatrixData = {
  obsIndex: string[];
  featureIndex: string[];
  obsFeatureMatrix: MatrixResult;
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
  featureLabelsMap: Map<string, string>;
};

export type ComparisonMetadata = {
  comparisonMetadata: object; // TODO: update?
};

export type FeatureStatsData = {
  featureId: string[]; // (Not "featureIndex" since feature values may repeat)
  featureSignificance: number[];
  featureFoldChange: number[];
  // Used when faceting by sample
  sampleId: string[] | null; // Null if not per-sample stats
  // Used when faceting by obsSet
  obsSetId: string[] | null; // Null if not obsSet-vs-rest stats
};

export type ObsLabelsData = {
  obsIndex: string[];
  obsLabels: string[];
  obsLabelsMap: Map<string, string>;
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

export type ObsSegmentationsMesh = {
  obsSegmentations: {
    scene: any; // TODO: add type
  };
  obsSegmentationsType: 'mesh';
};

export type ObsSegmentationsData = (
  ObsSegmentationsPolygons
  | ObsSegmentationsBitmask
  | ObsSegmentationsMesh
);

export type ImageData = {
  image: {
    instance: AbstractImageWrapper;
    image?: any;
    metadata?: any;
  };
  featureIndex: string[];
};

/*
export interface LoaderResult<DataType> {
  data: DataType;
  url?: string | { url: string, name: string}[];
  coordinationValues?: { [key: string]: any };
}
*/

export type LoaderParams = {
  type: string,
  fileType: string,
  url?: string,
  requestInit?: RequestInit,
  options?: any,
  coordinationValues?: { [key: string]: any },
};

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
