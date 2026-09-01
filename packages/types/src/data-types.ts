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

// A Map-like lookup from observation ID to the set paths containing it. Loaders
// return a lazy implementation that only materializes the underlying Map on first
// lookup, so this is narrowed to the members consumers actually use rather than
// being typed as a full Map.
export type ObsSetsMembership = {
  get: (obsId: string) => string[][] | undefined;
  has: (obsId: string) => boolean;
  readonly size: number;
};

/**
 * Raw categorical columns backing a single-level obs sets hierarchy, positional
 * along `obsIndex`. Produced by loaders that can read codes directly (e.g.
 * AnnData categorical columns), so that views can build positional color
 * encodings without walking the sets tree. Consumers must confirm alignment by
 * comparing this `obsIndex` (by reference) with their own observation index.
 */
export type ObsSetsColumns = {
  obsIndex: string[];
  columns: {
    /** The hierarchy (level-zero node) name. */
    name: string;
    /** The hierarchy's path in the tree, e.g. ['Cell Type Annotations']. */
    path: string[];
    /** Category code per observation; negative means missing. */
    codes: ArrayLike<number>;
    /** Category names indexed by code. */
    categories: string[];
  }[];
};

export type ObsSetsData = {
  obsIndex: string[];
  obsSets: SetsTree;
  obsSetsMembership: ObsSetsMembership;
  obsSetsColumns?: ObsSetsColumns;
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
