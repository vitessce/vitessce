/* eslint-disable no-unused-vars */
import React, {forwardRef} from 'react';
import {isEqual} from 'lodash-es';
import {viv} from '@vitessce/gl';
import {filterSelection} from '@vitessce/spatial-utils';
import {AbstractSpatialOrScatterplot} from '@vitessce/scatterplot';
import {CoordinationType} from '@vitessce/constants-internal';
import {getLayerLoaderTuple} from './utils.js';

const IMAGE_LAYER_PREFIX = 'image-layer-';
const VOLUME_LAYER_PREFIX = 'volume-layer-';
const VIV_RENDERING_MODES = {
    maximumIntensityProjection: 'Maximum Intensity Projection',
    minimumIntensityProjection: 'Minimum Intensity Projection',
    additive: 'Additive',
};

function getVivLayerExtensions(use3d, colormap, renderingMode) {
    if (use3d) {
        // Is 3d
        if (colormap) {
            // Colormap: use AdditiveColormap extensions
            if (renderingMode === 'minimumIntensityProjection') {
                return [new viv.AdditiveColormap3DExtensions.MinimumIntensityProjectionExtension()];
            }
            if (renderingMode === 'maximumIntensityProjection') {
                return [new viv.AdditiveColormap3DExtensions.MaximumIntensityProjectionExtension()];
            }
            return [new viv.AdditiveColormap3DExtensions.AdditiveBlendExtension()];
        }
        // No colormap: use ColorPalette extensions
        if (renderingMode === 'minimumIntensityProjection') {
            return [new viv.ColorPalette3DExtensions.MinimumIntensityProjectionExtension()];
        }
        if (renderingMode === 'maximumIntensityProjection') {
            return [new viv.ColorPalette3DExtensions.MaximumIntensityProjectionExtension()];
        }
        return [new viv.ColorPalette3DExtensions.AdditiveBlendExtension()];
    }
    // Not 3d
    if (colormap) {
        return [new viv.AdditiveColormapExtension()];
    }
    return [new viv.ColorPaletteExtension()];
}

class SpatialThree extends AbstractSpatialOrScatterplot {
    constructor(props) {
        super(props);
        this.imageLayerLoaderSelections = {};
        this.onUpdateImages();
    }

    use3d() {
        const {
            spatialRenderingMode,
        } = this.props;
        return spatialRenderingMode === '3D';
    }

    // New createImageLayer function.
    createImageLayer(
        layerScope, layerCoordination, channelScopes, channelCoordination, image,
    ) {
        // console.log("Creating Image Layer")
        const {
            delegateHover,
            targetT,
            targetZ,
            spatialRenderingMode,
        } = this.props;
        const data = image?.image?.instance?.getData();
        if (!data) {
            return null;
        }
        const imageWrapperInstance = image.image.instance;
        const is3dMode = spatialRenderingMode === '3D';
        const isRgb = layerCoordination[CoordinationType.PHOTOMETRIC_INTERPRETATION] === 'RGB';
        const [Layer, layerLoader] = getLayerLoaderTuple(data, is3dMode);
        const colormap = isRgb ? null : layerCoordination[CoordinationType.SPATIAL_LAYER_COLORMAP];
        const renderingMode = layerCoordination[CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM];
        const visible = layerCoordination[CoordinationType.SPATIAL_LAYER_VISIBLE];
        const transparentColor = layerCoordination[CoordinationType.SPATIAL_LAYER_TRANSPARENT_COLOR];
        const useTransparentColor = Array.isArray(transparentColor) && transparentColor.length === 3;

        const extensions = getVivLayerExtensions(
            is3dMode, colormap, renderingMode,
        );

        // Safer to only use this prop when we have an interleaved image i.e not multiple channels.
        const rgbInterleavedProps = {};
        if (imageWrapperInstance.isInterleaved()) {
            rgbInterleavedProps.visible = visible;
        }

        // TODO: support model matrix from coordination space also.
        const layerDefModelMatrix = image?.image?.instance?.getModelMatrix() || {};

        // We need to keep the same selections array reference,
        // otherwise the Viv layer will not be re-used as we want it to,
        // since selections is one of its `updateTriggers`.
        // Reference: https://github.com/hms-dbmi/viv/blob/ad86d0f/src/layers/MultiscaleImageLayer/MultiscaleImageLayer.js#L127
        let selections;
        // If RGB, we ignore the channelScopes and use RGB channels (R=0, G=1, B=2).
        const nextLoaderSelection = isRgb ? ([0, 1, 2])
            .map(targetC => filterSelection(data, {
                z: targetZ,
                t: targetT,
                c: targetC,
            })) : channelScopes
            .map(cScope => filterSelection(data, {
                z: targetZ,
                t: targetT,
                c: channelCoordination[cScope][CoordinationType.SPATIAL_TARGET_C],
            }));
        const prevLoaderSelection = this.imageLayerLoaderSelections[layerScope];
        if (isEqual(prevLoaderSelection, nextLoaderSelection)) {
            selections = prevLoaderSelection;
        } else {
            selections = nextLoaderSelection;
            this.imageLayerLoaderSelections[layerScope] = nextLoaderSelection;
        }

        const colors = isRgb ? ([
            [255, 0, 0],
            [0, 255, 0],
            [0, 0, 255],
        ]) : channelScopes.map(cScope => (
            channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_COLOR]
        ));
        // TODO: figure out how to initialize the channel windows in the loader.
        // TODO: is [0, 255] the right fallback?
        const contrastLimits = isRgb ? ([
            [0, 255],
            [0, 255],
            [0, 255],
        ]) : channelScopes.map(cScope => (
            channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_WINDOW]
            || ([0, 255])
        ));

        const channelsVisible = isRgb ? ([
            // Layer visible AND channel visible
            visible && true,
            visible && true,
            visible && true,
        ]) : channelScopes.map(cScope => (
            // Layer visible AND channel visible
            visible && channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_VISIBLE]
        ));

        const autoTargetResolution = imageWrapperInstance.getAutoTargetResolution();
        const targetResolution = layerCoordination[CoordinationType.SPATIAL_TARGET_RESOLUTION];


        console.log(colors, contrastLimits, channelsVisible, layerCoordination[CoordinationType.SPATIAL_LAYER_OPACITY], renderingMode, (targetResolution === null ? autoTargetResolution : targetResolution));

        return new Layer({
            loader: layerLoader,
            id: `${is3dMode ? VOLUME_LAYER_PREFIX : IMAGE_LAYER_PREFIX}${layerScope}`,
            colors,
            contrastLimits,
            selections,
            channelsVisible,
            opacity: layerCoordination[CoordinationType.SPATIAL_LAYER_OPACITY],
            colormap,
            modelMatrix: layerDefModelMatrix,
            transparentColor,
            useTransparentColor,
            resolution: targetResolution === null ? autoTargetResolution : targetResolution,
            renderingMode: VIV_RENDERING_MODES[renderingMode],
            xSlice: layerCoordination[CoordinationType.SPATIAL_SLICE_X],
            ySlice: layerCoordination[CoordinationType.SPATIAL_SLICE_Y],
            zSlice: layerCoordination[CoordinationType.SPATIAL_SLICE_Z],
            onViewportLoad: () => {
            }, // layerProps.callback, // TODO: figure out callback implementation
            excludeBackground: useTransparentColor,
            extensions,
            pickable: true,
            onHover: info => delegateHover(info, 'image', layerScope),
            ...rgbInterleavedProps,
        });
    }

    createImageLayers() {
        const {
            images = {},
            imageLayerScopes,
            imageLayerCoordination,
            imageChannelScopesByLayer,
            imageChannelCoordination,
        } = this.props;
        // console.log("Creating Image Layers");
        return imageLayerScopes.map(layerScope => this.createImageLayer(
            layerScope,
            imageLayerCoordination[0][layerScope],
            imageChannelScopesByLayer[layerScope],
            imageChannelCoordination[0][layerScope],
            images[layerScope],
        ));
    }

    getLayers() {
        const {
            imageLayers,
        } = this;
        return [
            ...imageLayers,
        ];
    }

    onUpdateImages() {
        // console.log("On Update Images")
        this.imageLayers = this.createImageLayers();
    }

    recenter() {
        const {originalViewState, setViewState} = this.props;
        if (Array.isArray(originalViewState?.target) && typeof originalViewState?.zoom === 'number') {
            setViewState(originalViewState);
        }
    }

    /**
     * Here, asynchronously check whether props have
     * updated which require re-computing memoized variables,
     * followed by a re-render.
     * This function does not follow React conventions or paradigms,
     * it is only implemented this way to try to squeeze out
     * performance.
     * @param {object} prevProps The previous props to diff against.
     */
    componentDidUpdate(prevProps) {
        this.viewInfoDidUpdate();
        const shallowDiff = propName => prevProps[propName] !== this.props[propName];
        let forceUpdate = false;
        if (
            [
                'images',
                'imageLayerScopes',
                'imageLayerCoordination',
                'imageChannelScopesByLayer',
                'imageChannelCoordination',
            ].some(shallowDiff)
        ) {
            // console.log("Image Layers Shallow Update")
            // Image layers changed.
            this.onUpdateImages();
            forceUpdate = true;
        }
        if (forceUpdate) {
            this.forceUpdate();
        }
    }
}

/**
 * Need this wrapper function here,
 * since we want to pass a forwardRef
 * so that outer components can
 * access the grandchild DeckGL ref,
 * but we are using a class component.
 */
const SpatialWrapper = forwardRef((props, deckRef) => (
    <SpatialThree {...props} deckRef={deckRef}/>
));
export default SpatialWrapper;
