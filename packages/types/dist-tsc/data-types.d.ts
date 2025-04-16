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
export type ObsSegmentationsPolygons = {
    obsSegmentations: {
        data: number[][][];
        shape: number[];
    };
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
        scene: any;
    };
    obsSegmentationsType: 'mesh';
};
export type ObsSegmentationsData = (ObsSegmentationsPolygons | ObsSegmentationsBitmask | ObsSegmentationsMesh);
export type ImageData = {
    image: {
        instance: AbstractImageWrapper;
        image?: any;
        metadata?: any;
    };
    featureIndex: string[];
};
export type LoaderParams = {
    type: string;
    fileType: string;
    url?: string;
    requestInit?: RequestInit;
    options?: any;
    coordinationValues?: {
        [key: string]: any;
    };
};
//# sourceMappingURL=data-types.d.ts.map