/* eslint-disable no-unused-vars */
import React, {forwardRef} from 'react';
import {isEqual} from 'lodash-es';
import {filterSelection} from '@vitessce/spatial-utils';
import {CoordinationType} from '@vitessce/constants-internal';
import {getLayerLoaderTuple} from './utils.js';

import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, MeshTransmissionMaterial, Environment, Lightformer } from '@react-three/drei'
import { CuboidCollider, BallCollider, Physics, RigidBody } from '@react-three/rapier'
import { EffectComposer, N8AO } from '@react-three/postprocessing'
import { easing } from 'maath'

const IMAGE_LAYER_PREFIX = 'image-layer-';
const VOLUME_LAYER_PREFIX = 'volume-layer-';

class SpatialThree extends React.PureComponent {
    constructor(props) {
        super(props);
        this.imageLayerLoaderSelections = {};
        this.textures = [];
        this.volumes = [];

        this.onUpdateImages();
    }

    // New createImageLayer function.
    create3DRendering(
        layerScope, layerCoordination, channelScopes, channelCoordination, image,
    ) {
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
        if (!is3dMode) {
            this.container = document.getElementById("ThreeJs");
            this.container.innerHTML = "Only for 3D view";
            return;
        } else {
            this.container = document.getElementById("ThreeJs");
            this.container.innerHTML = "";
            console.log()
            let offset = parseInt(getComputedStyle(this.container.parentElement).padding);
            this.container.style.height = (this.container.parentElement.clientHeight -offset) + "px";
            this.container.style.width = (this.container.parentElement.clientWidth-2*offset) + "px";
        }
        const isRgb = layerCoordination[CoordinationType.PHOTOMETRIC_INTERPRETATION] === 'RGB';
        const [Layer, layerLoader] = getLayerLoaderTuple(data, is3dMode);
        const colormap = isRgb ? null : layerCoordination[CoordinationType.SPATIAL_LAYER_COLORMAP];
        const renderingMode = layerCoordination[CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM];
        const visible = layerCoordination[CoordinationType.SPATIAL_LAYER_VISIBLE];
        const transparentColor = layerCoordination[CoordinationType.SPATIAL_LAYER_TRANSPARENT_COLOR];
        const useTransparentColor = Array.isArray(transparentColor) && transparentColor.length === 3;
        const rgbInterleavedProps = {};
        if (imageWrapperInstance.isInterleaved()) {
            rgbInterleavedProps.visible = visible;
        }
        const layerDefModelMatrix = image?.image?.instance?.getModelMatrix() || {};
        let selections;
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
        console.log(layerLoader)

        console.log(autoTargetResolution, targetResolution)
        // Instead of this now create the MESH Instance in ThreeJS
        //Check if already there if YES => update the UNIFORMS
        // if there is a change in size of the volume or channels being added or removed change


        // return new Layer({
        //     loader: layerLoader,
        //     id: `${is3dMode ? VOLUME_LAYER_PREFIX : IMAGE_LAYER_PREFIX}${layerScope}`,
        //     colors,
        //     contrastLimits,
        //     selections,
        //     channelsVisible,
        //     opacity: layerCoordination[CoordinationType.SPATIAL_LAYER_OPACITY],
        //     colormap,
        //     modelMatrix: layerDefModelMatrix,
        //     transparentColor,
        //     useTransparentColor,
        //     resolution: targetResolution === null ? autoTargetResolution : targetResolution,
        //     // renderingMode: VIV_RENDERING_MODES[renderingMode],
        //     xSlice: layerCoordination[CoordinationType.SPATIAL_SLICE_X],
        //     ySlice: layerCoordination[CoordinationType.SPATIAL_SLICE_Y],
        //     zSlice: layerCoordination[CoordinationType.SPATIAL_SLICE_Z],
        //     onViewportLoad: () => {
        //     }, // layerProps.callback, // TODO: figure out callback implementation
        //     excludeBackground: useTransparentColor,
        //     // extensions,
        //     pickable: true,
        //     onHover: info => delegateHover(info, 'image', layerScope),
        //     ...rgbInterleavedProps,
        // });
    }

    onUpdateImages() {
        const {
            images = {},
            imageLayerScopes,
            imageLayerCoordination,
            imageChannelScopesByLayer,
            imageChannelCoordination,
        } = this.props;
        // ERIC: Ask Mark what the Layer Scope is doing in 3D?
        imageLayerScopes.map(layerScope => this.create3DRendering(
            layerScope,
            imageLayerCoordination[0][layerScope],
            imageChannelScopesByLayer[layerScope],
            imageChannelCoordination[0][layerScope],
            images[layerScope],
        ));
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
        // this.viewInfoDidUpdate();
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
            this.onUpdateImages();
            forceUpdate = true;
        }
        if (forceUpdate) {
            this.forceUpdate();
        }
    }

    // viewInfoDidUpdate() {
    //     const {updateViewInfo, uuid} = this.props;
    //     const {viewport} = this;
    //     if (updateViewInfo && viewport) {
    //         updateViewInfo({
    //             uuid,
    //             project: viewport.project,
    //             projectFromId: (obsId) => {
    //                 try {
    //                     if (obsIndex && obsLocations) {
    //                         const getObsCoords = makeGetObsCoords(obsLocations);
    //                         const obsIdx = obsIndex.indexOf(obsId);
    //                         const obsCoord = getObsCoords(obsIdx);
    //                         return viewport.project(obsCoord);
    //                     }
    //                     return [null, null];
    //                 } catch (e) {
    //                     return [null, null];
    //                 }
    //             },
    //         });
    //     }
    // }

    render() {
        return (
            <div id="ThreeJs"></div>
        );
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
