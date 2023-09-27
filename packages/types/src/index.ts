// This is a type-only sub-package.
type MatrixResult = {
  data: number[] | Float32Array[];
  shape: number[];
};

export type ObsFeatureMatrixData = {
  obsIndex: string[];
  featureIndex: string[];
  obsFeatureMatrix: MatrixResult;
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

export type ObsSpotsDatat = {
  obsIndex: string[];
  obsSpots: MatrixResult;
};

export type ObsSegmentationsPolygons = {
  obsSegmentations: { data: number[][][], shape: number[] };
  obsSegmentationsType: 'polygon';
};

// TODO: bitmask
export type ObsSegmentationsData = ObsSegmentationsPolygons;

export type FeatureLabelsData = {
  featureIndex: string[];
  featureLabels: string[];
};

export type ObsLabelsData = {
  obsIndex: string[];
  obsLabels: string[];
};

export type SetsTreeNodeLeaf = {
  name: string;
  color?: number[];
  set: Array<[string, number | null]>;
}

export type SetsTreeNodeNonLeaf = {
  name: string;
  color?: number[];
  children: Array<SetsTreeNodeNonLeaf | SetsTreeNodeLeaf>;
};

export type SetsTree = {
  version: '0.1.3';
  tree: SetsTreeNodeNonLeaf[];
};

export type ObsSetsData = {
  obsIndex: string[];
  obsSets: SetsTree;
  obsSetsMembership: Map<string, string[][]>;
};
  
export {};
