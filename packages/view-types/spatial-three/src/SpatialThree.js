/* eslint-disable no-unused-vars */
import React, {useRef, useState, forwardRef, useEffect} from 'react';
import {Canvas, useFrame} from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import {isEqual} from 'lodash-es';
import {filterSelection} from '@vitessce/spatial-utils';
import {CoordinationType} from '@vitessce/constants-internal';
import {getLayerLoaderTuple} from './utils.js';
import {re} from "mathjs";
import {asyncIteratorReturn} from "jsdom/lib/jsdom/living/generated/utils.js";

const SpatialThree = (props) => {
    const prevProps = useRef({ props }).current;
    const {
        images = {},
        imageLayerScopes,
        imageLayerCoordination,
        imageChannelScopesByLayer,
        imageChannelCoordination,
    } = props;
    let layerScope = imageLayerScopes[0];
    let layerCoordination = imageLayerCoordination[0][layerScope];
    let channelScopes = imageChannelScopesByLayer[layerScope];
    let channelCoordination = imageChannelCoordination[0][layerScope];
    const isRgb = layerCoordination[CoordinationType.PHOTOMETRIC_INTERPRETATION] === 'RGB';
    const colors = isRgb ? ([
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
    ]) : channelScopes.map(cScope => (
        channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_COLOR]
    ));
    console.log(colors);


    // // ERIC: Ask Mark what the Layer Scope is doing in 3D?
    // imageLayerScopes.map(layerScope => create3DRendering(
    //     layerScope,
    //     imageLayerCoordination[0][layerScope],
    //     imageChannelScopesByLayer[layerScope],
    //     imageChannelCoordination[0][layerScope],
    //     images[layerScope],
    //     props
    // ));
    // useEffect(() => {
    //     console.log("props updated")
    // }, [props]);

    return (
        <div id="ThreeJs" style={{width: "100%",height:"100%"}}>
            <Canvas>
                <ambientLight/>
                <pointLight position={[10, 10, 10]}/>
                <Box position={[-1.2, 0, 0]} color={rgbToHex(colors[0])}/>
                <Box position={[1.2, 0, 0]} color={rgbToHex(colors[1])}/>
                <OrbitControls/>
            </Canvas>
        </div>
    );
}

function rgbToHex(rgb) {
    let r = rgb[0], g = rgb[1], b = rgb[2];
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function create3DRendering(layerScope, layerCoordination, channelScopes, channelCoordination, image, props) {
    console.log("return the mesh component");

    const {
        delegateHover,
        targetT,
        targetZ,
        spatialRenderingMode,
    } = props;
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
    // const prevLoaderSelection = this.imageLayerLoaderSelections[layerScope];
    // if (isEqual(prevLoaderSelection, nextLoaderSelection)) {
    //     selections = prevLoaderSelection;
    // } else {
    //     selections = nextLoaderSelection;
        // this.imageLayerLoaderSelections[layerScope] = nextLoaderSelection;
    // }

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
    console.log(layerLoader);
    // Instead of this now create the MESH Instance in ThreeJS
    //Check if already there if YES => update the UNIFORMS
    // if there is a change in size of the volume or channels being added or removed change
    return null;
}

function Box(props) {
    // This reference gives us direct access to the THREE.Mesh object
    const ref = useRef()
    // Hold state for hovered and clicked events
    const [hovered, hover] = useState(false)
    const [clicked, click] = useState(false)
    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => (ref.current.rotation.x += delta))
    // Return the view, these are regular Threejs elements expressed in JSX
    return (
        <mesh
            {...props}
            ref={ref}
            scale={clicked ? 1.5 : 1}
            onClick={(event) => click(!clicked)}
            onPointerOver={(event) => (event.stopPropagation(), hover(true))}
            onPointerOut={(event) => hover(false)}>
            <boxGeometry args={[1, 1, 1]}/>
            <meshStandardMaterial color={props.color}/>
        </mesh>
    )
}

//
// /**
//  * Need this wrapper function here,
//  * since we want to pass a forwardRef
//  * so that outer components can
//  * access the grandchild DeckGL ref,
//  * but we are using a class component.
//  */
const SpatialWrapper = forwardRef((props, deckRef) => (
    <SpatialThree {...props} deckRef={deckRef}/>
));
export default SpatialWrapper;

//
//     // return new Layer({
//     //     loader: layerLoader,
//     //     id: `${is3dMode ? VOLUME_LAYER_PREFIX : IMAGE_LAYER_PREFIX}${layerScope}`,
//     //     colors,
//     //     contrastLimits,
//     //     selections,
//     //     channelsVisible,
//     //     opacity: layerCoordination[CoordinationType.SPATIAL_LAYER_OPACITY],
//     //     colormap,
//     //     modelMatrix: layerDefModelMatrix,
//     //     transparentColor,
//     //     useTransparentColor,
//     //     resolution: targetResolution === null ? autoTargetResolution : targetResolution,
//     //     // renderingMode: VIV_RENDERING_MODES[renderingMode],
//     //     xSlice: layerCoordination[CoordinationType.SPATIAL_SLICE_X],
//     //     ySlice: layerCoordination[CoordinationType.SPATIAL_SLICE_Y],
//     //     zSlice: layerCoordination[CoordinationType.SPATIAL_SLICE_Z],
//     //     onViewportLoad: () => {
//     //     }, // layerProps.callback, // TODO: figure out callback implementation
//     //     excludeBackground: useTransparentColor,
//     //     // extensions,
//     //     pickable: true,
//     //     onHover: info => delegateHover(info, 'image', layerScope),
//     //     ...rgbInterleavedProps,
//     // });
// }
//
// function onUpdateImages()
// {
//     const {
//         images = {},
//         imageLayerScopes,
//         imageLayerCoordination,
//         imageChannelScopesByLayer,
//         imageChannelCoordination,
//     } = this.props;
//     // ERIC: Ask Mark what the Layer Scope is doing in 3D?
//     imageLayerScopes.map(layerScope => this.create3DRendering(
//         layerScope,
//         imageLayerCoordination[0][layerScope],
//         imageChannelScopesByLayer[layerScope],
//         imageChannelCoordination[0][layerScope],
//         images[layerScope],
//     ));
// }
//
// function recenter()
// {
//     const {originalViewState, setViewState} = this.props;
//     if (Array.isArray(originalViewState?.target) && typeof originalViewState?.zoom === 'number') {
//         setViewState(originalViewState);
//     }
// }
//
// /**
//  * Here, asynchronously check whether props have
//  * updated which require re-computing memoized variables,
//  * followed by a re-render.
//  * This function does not follow React conventions or paradigms,
//  * it is only implemented this way to try to squeeze out
//  * performance.
//  * @param {object} prevProps The previous props to diff against.
//  */
// function componentDidUpdate(prevProps)
// {
//     // this.viewInfoDidUpdate();
//     const shallowDiff = propName => prevProps[propName] !== this.props[propName];
//     let forceUpdate = false;
//     if (
//         [ //TODO Eric: Differentiate between loading a new Volume level and "just" changing settings
//             'images',
//             'imageLayerScopes',
//             'imageLayerCoordination',
//             'imageChannelScopesByLayer',
//             'imageChannelCoordination',
//         ].some(shallowDiff)
//     ) {
//         this.onUpdateImages();
//         forceUpdate = true;
//     }
//     //
//     if (forceUpdate) { //TODO Only force a full update if fundamental things get changed
//         this.forceUpdate(); // Is it needed here?
//     }
// }




