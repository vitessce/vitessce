import type { ImageWrapper } from '@vitessce/image-utils';

export type SetPath = string[];
export type ObsSetColorEntry = { path: SetPath; color: number[] };
export type FeatureAggregationStrategy = 'first' | 'last' | 'sum' | 'mean' | number | null;
export type ObsColorEncoding = 'geneSelection' | 'cellSetSelection' | 'spatialChannelColor'
  | 'spatialLayerColor' | string;

export interface PointLayerCoordinationValues {
  spatialLayerVisible: boolean;
  obsColorEncoding: ObsColorEncoding;
  obsType: string;
  featureType: string;
  featureValueType: string;
  featureSelection: string[];
  featureValueColormap: string;
  featureValueColormapRange: [number, number];
  spatialLayerColor: number[];
  legendVisible: boolean;
}

export interface PointLayerSetters {
  setFeatureValueColormapRange?: (range: [number, number]) => void;
}

export interface SpotLayerCoordinationValues extends PointLayerCoordinationValues {
  featureAggregationStrategy: FeatureAggregationStrategy;
  obsSetSelection: SetPath[];
  obsSetColor: ObsSetColorEntry[];
}

export type SpotLayerSetters = PointLayerSetters;

export interface SegmentationLayerCoordinationValues {
  spatialLayerVisible: boolean;
}

export interface SegmentationChannelCoordinationValues {
  spatialChannelVisible: boolean;
  spatialChannelColor: number[];
  obsColorEncoding: ObsColorEncoding;
  featureValueColormap: string;
  featureValueColormapRange: [number, number];
  obsType: string;
  featureType: string;
  featureValueType: string;
  featureSelection: string[];
  featureAggregationStrategy: FeatureAggregationStrategy;
  legendVisible: boolean;
  obsSetSelection: SetPath[];
  obsSetColor: ObsSetColorEntry[];
}

export interface SegmentationChannelSetters {
  setFeatureValueColormapRange?: (range: [number, number]) => void;
}

export interface FeatureLabelsData {
  featureLabelsMap?: Map<string, string>;
}

export type ThemeType = 'light' | 'dark' | 'light2';

export type Extent = [number, number] | [number, number][] | null;


export interface ImageLayerData {
  image?: {
    instance?: ImageWrapper;
  };
}

export interface ImageLayerCoordinationValues {
  spatialLayerVisible: boolean;
  photometricInterpretation: string;
  spatialChannelLabelsVisible: boolean;
  spatialChannelLabelsOrientation: 'horizontal' | 'vertical';
  spatialChannelLabelSize: number;
  spatialLayerColormap: string | null;
}

export interface ImageChannelCoordinationValues {
  spatialTargetC: number | string;
  spatialChannelVisible: boolean;
  spatialChannelColor: number[];
}
