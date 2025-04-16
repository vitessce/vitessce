/* eslint-disable no-plusplus */
import { Matrix4 } from 'math.gl';
import { viv, BitmaskLayerBeta as BitmaskLayer } from '@vitessce/gl';
import { extent } from 'd3-array';
export function getInitialSpatialTargets({ width, height, obsPoints, obsSpots, obsSegmentations, obsSegmentationsLocations, segmentationChannelScopesByLayer, images, is3dMode: use3d, isReady, }) {
    let globalXMin = null;
    let globalXMax = null;
    let globalYMin = null;
    let globalYMax = null;
    let globalZMin = null;
    let globalZMax = null;
    // Some backoff from completely filling the screen.
    const zoomBackoff = use3d ? 1.5 : 0.1;
    Object.values(images || {}).forEach((layerData) => {
        const imageLayerLoader = layerData?.image?.instance.getData();
        const modelMatrix = layerData?.image?.instance.getModelMatrix();
        if (imageLayerLoader) {
            const viewSize = { height, width };
            const { target, zoom: newViewStateZoom } = viv.getDefaultInitialViewState(imageLayerLoader, viewSize, zoomBackoff, use3d, new Matrix4(modelMatrix));
            const maxExtent = Math.max(width / (2 ** newViewStateZoom), height / (2 ** newViewStateZoom));
            const xMin = target[0] - maxExtent / 2;
            const xMax = target[0] + maxExtent / 2;
            const yMin = target[1] - maxExtent / 2;
            const yMax = target[1] + maxExtent / 2;
            const zMin = target[2];
            const zMax = target[2];
            globalXMin = globalXMin === null ? xMin : Math.min(globalXMin, xMin);
            globalXMax = globalXMax === null ? xMax : Math.max(globalXMax, xMax);
            globalYMin = globalYMin === null ? yMin : Math.min(globalYMin, yMin);
            globalYMax = globalYMax === null ? yMax : Math.max(globalYMax, yMax);
            globalZMin = globalZMin === null ? zMin : Math.min(globalZMin, zMin);
            globalZMax = globalZMax === null ? zMax : Math.max(globalZMax, zMax);
        }
    });
    // Segmentations
    Object.entries(obsSegmentations || {}).forEach(([layerScope, layerData]) => {
        if (layerData?.obsSegmentations && layerData?.obsSegmentationsType) {
            const { obsSegmentationsType } = layerData;
            if (obsSegmentationsType === 'polygon') {
                // Use obsLocations if available.
                const firstChannel = segmentationChannelScopesByLayer?.[layerScope]?.[0];
                const { obsLocations } = obsSegmentationsLocations?.[layerScope]?.[firstChannel] || {};
                const hasObsLocations = Boolean(obsLocations);
                if (hasObsLocations) {
                    const [xMin, xMax] = extent(obsLocations.data[0]);
                    const [yMin, yMax] = extent(obsLocations.data[1]);
                    // TODO: support Z axis for obsLocations?
                    globalXMin = globalXMin === null ? xMin : Math.min(globalXMin, xMin);
                    globalXMax = globalXMax === null ? xMax : Math.max(globalXMax, xMax);
                    globalYMin = globalYMin === null ? yMin : Math.min(globalYMin, yMin);
                    globalYMax = globalYMax === null ? yMax : Math.max(globalYMax, yMax);
                }
                else {
                    // The fall back is the cells' polygon coordinates, if the original range
                    // is 0 i.e the centroids are all on the same axis.
                    const [xMin, xMax] = extent(layerData.obsSegmentations.data, poly => poly[0][0]);
                    // The fall back is the first cells' polygon coordinates, if the original range
                    // is 0 i.e the centroids are all on the same axis.
                    const [yMin, yMax] = extent(layerData.obsSegmentations.data, poly => poly[0][1]);
                    // TODO: support Z axis for polygon segmentations?
                    globalXMin = globalXMin === null ? xMin : Math.min(globalXMin, xMin);
                    globalXMax = globalXMax === null ? xMax : Math.max(globalXMax, xMax);
                    globalYMin = globalYMin === null ? yMin : Math.min(globalYMin, yMin);
                    globalYMax = globalYMax === null ? yMax : Math.max(globalYMax, yMax);
                }
            }
            else if (obsSegmentationsType === 'bitmask') {
                const hasObsLocations = false;
                if (hasObsLocations) {
                    // TODO: use obsLocations if available.
                }
                else {
                    const imageLayerLoader = layerData?.obsSegmentations?.instance.getData();
                    const modelMatrix = layerData?.obsSegmentations?.instance.getModelMatrix();
                    if (imageLayerLoader) {
                        const viewSize = { height, width };
                        const { target, zoom: newViewStateZoom } = viv.getDefaultInitialViewState(imageLayerLoader, viewSize, zoomBackoff, use3d, new Matrix4(modelMatrix));
                        const maxExtent = Math.max(width / (2 ** newViewStateZoom), height / (2 ** newViewStateZoom));
                        const xMin = target[0] - maxExtent / 2;
                        const xMax = target[0] + maxExtent / 2;
                        const yMin = target[1] - maxExtent / 2;
                        const yMax = target[1] + maxExtent / 2;
                        const zMin = target[2];
                        const zMax = target[2];
                        globalXMin = globalXMin === null ? xMin : Math.min(globalXMin, xMin);
                        globalXMax = globalXMax === null ? xMax : Math.max(globalXMax, xMax);
                        globalYMin = globalYMin === null ? yMin : Math.min(globalYMin, yMin);
                        globalYMax = globalYMax === null ? yMax : Math.max(globalYMax, yMax);
                        globalZMin = globalZMin === null ? zMin : Math.min(globalZMin, zMin);
                        globalZMax = globalZMax === null ? zMax : Math.max(globalZMax, zMax);
                    }
                }
            }
        }
    });
    // Points
    Object.values(obsPoints || {}).forEach((layerData) => {
        if (layerData?.obsPoints) {
            const [xMin, xMax] = extent(layerData.obsPoints.data[0]);
            const [yMin, yMax] = extent(layerData.obsPoints.data[1]);
            // TODO: support Z axis for points?
            globalXMin = globalXMin === null ? xMin : Math.min(globalXMin, xMin);
            globalXMax = globalXMax === null ? xMax : Math.max(globalXMax, xMax);
            globalYMin = globalYMin === null ? yMin : Math.min(globalYMin, yMin);
            globalYMax = globalYMax === null ? yMax : Math.max(globalYMax, yMax);
        }
    });
    // Spots
    Object.values(obsSpots || {}).forEach((layerData) => {
        if (layerData?.obsSpots) {
            const [xMin, xMax] = extent(layerData.obsSpots.data[0]);
            const [yMin, yMax] = extent(layerData.obsSpots.data[1]);
            // TODO: support Z axis for spots?
            globalXMin = globalXMin === null ? xMin : Math.min(globalXMin, xMin);
            globalXMax = globalXMax === null ? xMax : Math.max(globalXMax, xMax);
            globalYMin = globalYMin === null ? yMin : Math.min(globalYMin, yMin);
            globalYMax = globalYMax === null ? yMax : Math.max(globalYMax, yMax);
        }
    });
    if (!isReady
        || globalXMin === null
        || globalXMax === null
        || globalYMin === null
        || globalYMax === null) {
        return {
            initialTargetX: null,
            initialTargetY: null,
            initialTargetZ: null,
            initialZoom: null,
        };
    }
    const xRange = globalXMax - globalXMin;
    const yRange = globalYMax - globalYMin;
    const zRange = globalZMax - globalZMin;
    const initialTargetX = globalXMin + xRange / 2;
    const initialTargetY = globalYMin + yRange / 2;
    const initialTargetZ = (globalZMin === null || globalZMax === null)
        ? null
        : (globalZMin + zRange / 2);
    const initialZoom = Math.log2(Math.min(width / xRange, height / yRange)) - zoomBackoff;
    return {
        initialTargetX, initialTargetY, initialZoom, initialTargetZ,
    };
}
/**
 * Make a subtitle for the spatial component.
 * @param {object} data PixelSource | PixelSource[]
 * @returns {Array} [Layer, PixelSource | PixelSource[]] tuple.
 */
export function getLayerLoaderTuple(data, use3d) {
    const loader = ((Array.isArray(data) && data.length > 1) || !Array.isArray(data))
        ? data : data[0];
    if (use3d) {
        return [viv.VolumeLayer, Array.isArray(loader) ? loader : [loader]];
    }
    const Layer = (Array.isArray(data) && data.length > 1)
        ? viv.MultiscaleImageLayer
        : viv.ImageLayer;
    return [Layer, loader];
}
export function renderSubBitmaskLayers(props) {
    const { bbox: { left, top, right, bottom, }, index: { x, y, z }, zoom, } = props.tile;
    const { data, id, loader, maxZoom, minZoom, zoomOffset, } = props;
    // Only render in positive coorinate system
    if ([left, bottom, right, top].some(v => v < 0) || !data) {
        return null;
    }
    const base = loader[0];
    const [height, width] = loader[0].shape.slice(-2);
    // Tiles are exactly fitted to have height and width such that their bounds
    // match that of the actual image (not some padded version).
    // Thus the right/bottom given by deck.gl are incorrect since
    // they assume tiles are of uniform sizes, which is not the case for us.
    const bounds = [
        left,
        data.height < base.tileSize ? height : bottom,
        data.width < base.tileSize ? width : right,
        top,
    ];
    return new BitmaskLayer(props, {
        channelData: data,
        // Uncomment to help debugging - shades the tile being hovered over.
        // autoHighlight: true,
        // highlightColor: [80, 80, 80, 50],
        // Shared props with BitmapLayer:
        bounds,
        id: `sub-layer-${bounds}-${id}`,
        tileId: { x, y, z },
        // The zoom/maxZoom values are used in the computation
        // of the scale factor for the stroke width.
        zoom,
        minZoom,
        maxZoom,
        zoomOffset, // TODO: figure out if this needs to be used or not
    });
}
