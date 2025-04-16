/**
 * Sort spatial layer definition array,
 * to keep the ordering in the layer controller
 * consistent.
 * Intended to be used with auto-initialized layer
 * definition arrays only, as a pre-defined layer array
 * should not be re-ordered.
 * @param {object[]} layers Array of layer definition objects.
 * Object must have a .type property.
 */
export function sortLayers(layers: object[]): object[];
/**
 * Make a subtitle for the spatial component.
 * @param {object} params
 * @param {number} params.observationsCount
 * @param {string} params.observationsLabel
 * @param {string} params.observationsPluralLabel
 * @param {number} params.subobservationsCount
 * @param {string} params.subobservationsLabel
 * @param {string} params.subobservationsPluralLabel
 * @param {number} params.locationsCount
 * @returns {string} The subtitle string,
 * with info about items with zero counts omitted.
 */
export function makeSpatialSubtitle({ observationsCount, observationsLabel, subobservationsCount, subobservationsLabel, locationsCount, }: {
    observationsCount: number;
    observationsLabel: string;
    observationsPluralLabel: string;
    subobservationsCount: number;
    subobservationsLabel: string;
    subobservationsPluralLabel: string;
    locationsCount: number;
}): string;
export function getInitialSpatialTargets({ width, height, obsCentroids, obsSegmentations, obsSegmentationsType, imageLayerLoaders, useRaster, use3d, modelMatrices, }: {
    width: any;
    height: any;
    obsCentroids: any;
    obsSegmentations: any;
    obsSegmentationsType: any;
    imageLayerLoaders: any;
    useRaster: any;
    use3d: any;
    modelMatrices: any;
}): {
    initialTargetX: null;
    initialTargetY: null;
    initialTargetZ: null;
    initialZoom: null;
} | {
    initialTargetX: number;
    initialTargetY: number;
    initialZoom: number;
    initialTargetZ: number;
};
/**
 * Make a subtitle for the spatial component.
 * @param {object} data PixelSource | PixelSource[]
 * @returns {Array} [Layer, PixelSource | PixelSource[]] tuple.
 */
export function getLayerLoaderTuple(data: object, use3d: any): any[];
export function renderSubBitmaskLayers(props: any): BitmaskLayer | null;
import { BitmaskLayer } from '@vitessce/gl';
//# sourceMappingURL=utils.d.ts.map