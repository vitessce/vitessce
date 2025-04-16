export function getInitialSpatialTargets({ width, height, obsPoints, obsSpots, obsSegmentations, obsSegmentationsLocations, segmentationChannelScopesByLayer, images, is3dMode: use3d, isReady, }: {
    width: any;
    height: any;
    obsPoints: any;
    obsSpots: any;
    obsSegmentations: any;
    obsSegmentationsLocations: any;
    segmentationChannelScopesByLayer: any;
    images: any;
    is3dMode: any;
    isReady: any;
}): {
    initialTargetX: null;
    initialTargetY: null;
    initialTargetZ: null;
    initialZoom: null;
} | {
    initialTargetX: number;
    initialTargetY: number;
    initialZoom: number;
    initialTargetZ: number | null;
};
/**
 * Make a subtitle for the spatial component.
 * @param {object} data PixelSource | PixelSource[]
 * @returns {Array} [Layer, PixelSource | PixelSource[]] tuple.
 */
export function getLayerLoaderTuple(data: object, use3d: any): any[];
export function renderSubBitmaskLayers(props: any): BitmaskLayer | null;
import { BitmaskLayerBeta as BitmaskLayer } from '@vitessce/gl';
//# sourceMappingURL=utils.d.ts.map