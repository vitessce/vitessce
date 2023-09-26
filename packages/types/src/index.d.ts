type MatrixResult = { data: number[] | Float32Array[]; shape: number[] };

export type ObsFeatureMatrixResult = {
    obsIndex: string[];
    featureIndex: string[];
    obsFeatureMatrix: MatrixResult;
};

export type ObsEmbeddingResult = {
    obsIndex: string[];
    obsEmbedding: MatrixResult;
};

export type ObsLocationsResult = {
    obsIndex: string[];
    obsLocations: MatrixResult;
};

export type ObsPointsResult = {
    obsIndex: string[];
    obsPoints: MatrixResult;
};

export type ObsSpotsResult = {
    obsIndex: string[];
    obsSpots: MatrixResult;
};

export interface AbstractImageWrapper {
    getType(): 'ome-tiff' | 'ome-zarr';
    
    hasPhysicalSize(): boolean;
    
    getData(): VivLoaderDataType<string[]>;
    
    getModelMatrix(): number[];
    
    getDefaultTargetT(): number;
    
    getDefaultTargetZ(): number;
    
    getName(): string;
    
    getNumChannels(): number;
    
    getChannelNames(): string[];
    
    getChannelObjects(): ChannelObject[];
    
    getDtype(): string | undefined;
    
    hasZStack(): boolean;
    
    hasTStack(): boolean;
    
    getNumZ(): number;
    
    getNumT(): number;
    
    isMultiResolution(): boolean;
    
    getMultiResolutionStats(): ResolutionObject[];
    
    getAutoTargetResolution(): number|null;
    
    getBoundingCube(): BoundingCube;
    
    isInterleaved(): boolean;
};

export type ObsSegmentationsBitmaskResult = {
    obsSegmentations: AbstractImageWrapper;
    obsSegmentationsType: 'bitmask';
};

export type ObsSegmentationsPolygonResult = {
    obsSegmentations: { data: number[][][], shape: number[] };
    obsSegmentationsType: 'polygon';
};

export type ObsSegmentationsResult = ObsSegmentationsBitmaskResult | ObsSegmentationsPolygonResult;