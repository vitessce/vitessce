/* eslint-disable no-unused-vars */
import React, {useRef, useState, forwardRef, useEffect} from 'react';
import {Canvas, extend, useFrame} from '@react-three/fiber'
import {OrbitControls, useTexture, shaderMaterial, PerspectiveCamera} from '@react-three/drei'
import {VRButton, ARButton, XR, Controllers, Hands} from '@react-three/xr'
import {isEqual} from 'lodash-es';
import {filterSelection} from '@vitessce/spatial-utils';
import {CoordinationType} from '@vitessce/constants-internal';
import {getLayerLoaderTuple} from './utils.js';
import {Volume} from "../jsm/misc/Volume.js";
import {getImageSize} from '@hms-dbmi/viv';
import * as THREE from "three";
import cmViridisTextureUrl from "../textures/cm_viridis.png";
import cmGrayTextureUrl from "../textures/cm_gray.png";
import {VolumeRenderShaderPerspective} from "../jsm/shaders/VolumeShaderPerspective.js";
import {asciiWhitespaceRe} from "jsdom/lib/jsdom/living/helpers/strings.js";
import reorder from "lodash-es/_reorder.js";
// import DVRMaterial from "./DVRMaterial.js";

const SpatialThree = (props) => {
    const materialRef = useRef(null);
    const [initialStartup, setInitialStartup] = useState(false);
    const [dataReady, setDataReady] = useState(false);
    const [renderingSettings, setRenderingSettings] = useState({
        uniforms: null, shader: null, meshScale: null,
        geometrySize: null
    });
    const [volumeData, setVolumeData] = useState({
        volumes: new Map(),
        textures: new Map(),
        volumeMinMax: new Map(),
        scale: null,
        resolution: null,
    });
    const [volumeSettings, setVolumeSettings] = useState({
        channelsVisible: [],
        allChannels: [],
        channelTargetC: [],
        resolution: null,
        data: null,
        colors: [],
        contrastLimits: [],
        is3dMode: false
    });
    const {
        images = {},
        imageLayerScopes,
        imageLayerCoordination,
        imageChannelScopesByLayer,
        imageChannelCoordination,
    } = props;
    const imageLayerLoaderSelections = useRef({});
    let layerScope = imageLayerScopes[0];
    let channelScopes = imageChannelScopesByLayer[layerScope];
    let layerCoordination = imageLayerCoordination[0][layerScope];
    let channelCoordination = imageChannelCoordination[0][layerScope];
    // Get the relevant information out of the Props
    const {
        channelsVisible,
        allChannels,
        channelTargetC,
        resolution,
        data,
        colors,
        contrastLimits,
        is3dMode
    } = extractInformationFromProps(layerScope, layerCoordination, channelScopes,
        channelCoordination, images[layerScope], props, imageLayerLoaderSelections.current)
    // TODO: Find a better and more efficient way to compare the Strings here
    if (channelTargetC !== null) {
        if (volumeSettings.channelTargetC.length !== 0 &&
            (volumeSettings.channelTargetC.toString() !== channelTargetC.toString() ||
                volumeSettings.resolution.toString() !== resolution.toString())) {
            console.log("Reloading the data due to channel or resolution change " + dataReady)
            if (!dataReady) setDataReady(true);
        } else if (
            (volumeSettings.channelsVisible.toString() !== channelsVisible.toString() ||
            volumeSettings.colors.toString() !== colors.toString() ||
            volumeSettings.is3dMode !== is3dMode ||
            volumeSettings.contrastLimits.toString() !== contrastLimits.toString())) {
            setVolumeSettings({
                channelsVisible,
                allChannels,
                channelTargetC,
                resolution,
                data,
                colors,
                contrastLimits,
                is3dMode
            });
            setDataReady(false);
        }
    }


    // 1st Rendering Pass Load the Data in the given resolution OR Resolution Changed
    let dataToCheck = images[layerScope]?.image?.instance?.getData();
    if (dataToCheck !== undefined && !dataReady && !initialStartup &&
        contrastLimits !== null && contrastLimits[0][1] !== 255 && is3dMode) {
        console.log("Loading Data")
        setDataReady(true);
        setInitialStartup(true);
    }

    // Only reload the mesh if the imageLayer changes (new data / new resolution, ...)
    useEffect(() => {
        let fetchRendering = async () => {
            const loadingResult = await initialDataLoading(channelTargetC, resolution, data,
                volumeData.volumes, volumeData.textures, volumeData.volumeMinMax, volumeData.resolution);
            if (loadingResult[0] !== null) { // New Data has been loaded
                setVolumeData({
                    resolution: resolution,
                    volumes: loadingResult[0],
                    textures: loadingResult[1],
                    volumeMinMax: loadingResult[2],
                    scale: loadingResult[3] !== null ? loadingResult[3] : volumeData.scale
                });
                if (renderingSettings.uniforms === undefined || renderingSettings.uniforms === null ||
                    renderingSettings.shader === undefined || renderingSettings.shader === null) {
                    // JUST FOR THE INITIAL RENDERING
                    const rendering = create3DRendering(loadingResult[0], channelTargetC, channelsVisible, colors,
                        loadingResult[1], contrastLimits, loadingResult[2], loadingResult[3])
                    if (rendering !== null) {
                        setRenderingSettings({
                            uniforms: rendering[0], shader: rendering[1], meshScale: rendering[2],
                            geometrySize: rendering[3]
                        });
                    }
                } else {
                    setVolumeSettings({
                        channelsVisible,
                        allChannels,
                        channelTargetC,
                        resolution,
                        data,
                        colors,
                        contrastLimits,
                        is3dMode
                    });
                }
            }
        }
        if (dataReady) {
            if (resolution !== volumeSettings.resolution) {
                materialRef.current.material.uniforms.volumeCount.value = 0;
                materialRef.current.material.uniforms.volumeTex.value = null;
            }
            fetchRendering();
            setDataReady(false);
        }
    }, [dataReady]);


// 2nd Rendering Pass Check if the Props Changed (except the resolution)
    useEffect(() => {
        if (((renderingSettings.uniforms !== undefined && renderingSettings.uniforms !== null &&
            renderingSettings.shader !== undefined && renderingSettings.shader !== null))) {
            const rendering = create3DRendering(volumeData.volumes, volumeSettings.channelTargetC,
                volumeSettings.channelsVisible, volumeSettings.colors, volumeData.textures,
                volumeSettings.contrastLimits, volumeData.volumeMinMax, volumeData.scale)
            if (rendering !== null) {
                let volumeCount = 0;
                for (let elem in volumeSettings.channelsVisible) {
                    if (volumeSettings.channelsVisible[elem]) volumeCount++;
                }
                setDataReady(false);
                //Set the material uniforms
                materialRef.current.material.uniforms.u_clim.value = rendering[0]["u_clim"].value;
                materialRef.current.material.uniforms.u_clim2.value = rendering[0]["u_clim2"].value;
                materialRef.current.material.uniforms.u_clim3.value = rendering[0]["u_clim3"].value;
                materialRef.current.material.uniforms.u_clim4.value = rendering[0]["u_clim4"].value;
                materialRef.current.material.uniforms.u_clim5.value = rendering[0]["u_clim5"].value;
                materialRef.current.material.uniforms.u_clim6.value = rendering[0]["u_clim6"].value;
                materialRef.current.material.uniforms.u_color.value = rendering[0]["u_color"].value;
                materialRef.current.material.uniforms.u_color2.value = rendering[0]["u_color2"].value;
                materialRef.current.material.uniforms.u_color3.value = rendering[0]["u_color3"].value;
                materialRef.current.material.uniforms.u_color4.value = rendering[0]["u_color4"].value;
                materialRef.current.material.uniforms.u_color5.value = rendering[0]["u_color5"].value;
                materialRef.current.material.uniforms.u_color6.value = rendering[0]["u_color6"].value;
                materialRef.current.material.uniforms.volumeTex.value = rendering[0]["volumeTex"].value;
                materialRef.current.material.uniforms.volumeTex2.value = rendering[0]["volumeTex2"].value;
                materialRef.current.material.uniforms.volumeTex3.value = rendering[0]["volumeTex3"].value;
                materialRef.current.material.uniforms.volumeTex4.value = rendering[0]["volumeTex4"].value;
                materialRef.current.material.uniforms.volumeTex5.value = rendering[0]["volumeTex5"].value;
                materialRef.current.material.uniforms.volumeTex6.value = rendering[0]["volumeTex6"].value;
                materialRef.current.material.uniforms.volumeCount.value = volumeCount;
            } else {
                materialRef.current.material.uniforms.volumeCount.value = 0;
                materialRef.current.material.uniforms.volumeTex.value = null;
            }
        }
    }, [volumeSettings]);


    if (!volumeSettings.is3dMode) {
        return (
            <div id="ThreeJs" style={{width: "100%", height: "100%"}}>
                <div>Only in 3D Mode</div>
            </div>);
    }

    if (volumeSettings.is3dMode &&
        (renderingSettings.uniforms === undefined || renderingSettings.uniforms === null ||
            renderingSettings.shader === undefined || renderingSettings.shader === null)
    ) {
        return (
            <div id="ThreeJs" style={{width: "100%", height: "100%"}}>
                <div>Loading</div>
            </div>);
    }

    return (
        <div id="ThreeJs" style={{width: "100%", height: "100%"}}>
            <ARButton/>
            <Canvas camera={{fov: 45, up: [0, 1, 0], position: [0, 0, -500], near: 0.01, far: 10000}}>
                <XR>
                    {(renderingSettings.uniforms !== undefined && renderingSettings.uniforms !== null &&
                            renderingSettings.shader !== undefined && renderingSettings.shader !== null) &&

                        <mesh scale={renderingSettings.meshScale} ref={materialRef}>
                            <boxGeometry args={renderingSettings.geometrySize}/>
                            <shaderMaterial
                                customProgramCacheKey={() => {
                                    return '1'
                                }}
                                side={THREE.BackSide}
                                uniforms={renderingSettings.uniforms}
                                needsUpdate={true}
                                vertexShader={renderingSettings.shader.vertexShader}
                                fragmentShader={renderingSettings.shader.fragmentShader}
                            />
                        </mesh>
                    }
                    <OrbitControls/>
                </XR>
            </Canvas>
        </div>
    );
}

function extractInformationFromProps(layerScope, layerCoordination, channelScopes, channelCoordination, image, props, imageLayerLoaderSelection) {
    // Getting all the information out of the provided props
    const {
        targetT,
        targetZ,
        spatialRenderingMode,
    } = props;
    const data = image?.image?.instance?.getData();
    if (!data) {
        return {
            channelsVisible: null,
            resolution: null,
            data: null,
            colors: null,
            contrastLimits: null,
            allChannels: null,
            channelTargetC: null
        };
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
    const prevLoaderSelection = imageLayerLoaderSelection[layerScope];
    if (isEqual(prevLoaderSelection, nextLoaderSelection)) {
        selections = prevLoaderSelection;
    } else {
        selections = nextLoaderSelection;
        imageLayerLoaderSelection[layerScope] = nextLoaderSelection;
    }

    // COLORS TO BE USED
    const colors = isRgb ? ([
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
    ]) : channelScopes.map(cScope => (
        channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_COLOR]
    ));

    // CONTRAST LIMITS
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

    // CHANNEL VISIBILITY
    const channelsVisible = isRgb ? ([
        // Layer visible AND channel visible
        visible && true,
        visible && true,
        visible && true,
    ]) : channelScopes.map(cScope => (
        // Layer visible AND channel visible
        visible && channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_VISIBLE]
    ));

    // CHANNEL VISIBILITY
    const channelTargetC = isRgb ? ([
        // Layer visible AND channel visible
        visible && true,
        visible && true,
        visible && true,
    ]) : channelScopes.map(cScope => (
        // Layer visible AND channel visible
        visible && channelCoordination[cScope][CoordinationType.SPATIAL_TARGET_C]
    ));
    const autoTargetResolution = imageWrapperInstance.getAutoTargetResolution();
    const targetResolution = layerCoordination[CoordinationType.SPATIAL_TARGET_RESOLUTION];
    let resolution = (targetResolution === null || isNaN(targetResolution)) ? autoTargetResolution : targetResolution;
    let allChannels = image.image.loaders[0].channels;
    return {channelsVisible, allChannels, channelTargetC, resolution, data, colors, contrastLimits, is3dMode};
}

/**
 *
 * @param volumes          ... from Store
 * @param channelTargetC   ... given by UI
 * @param channelsVisible  ... given by UI
 * @param colors           ... given by UI
 * @param textures         ... from Store
 * @param contrastLimits   ... given by UI
 * @param volumeMinMax     ... from Store
 * @param scale            ... from Store
 */
function create3DRendering(volumes, channelTargetC, channelsVisible, colors, textures, contrastLimits, volumeMinMax, scale) {
    let texturesList = [];
    let colorsSave = [];
    let contrastLimitsList = [];
    let volume = null;
    for (let channelStr in channelTargetC) {    // load on demand new channels or load all there are?? - Check VIV for it
        let id = parseInt(channelStr);
        let channel = channelTargetC[parseInt(channelStr)];
        if (channelsVisible[id]) {         // check if the channel has been loaded already or if there should be a new load
            volume = volumes.get(channel);
            // set textures, set volume, contrastLimits, colors
            texturesList.push(textures.get(channel)) //Could be done better but for now we try this
            colorsSave.push([colors[id][0] / 255, colors[id][1] / 255, colors[id][2] / 255]);
            if (contrastLimits[id][0] === 0 && contrastLimits[id][1] === 255) { //Initial State TODO change??
                contrastLimitsList.push([getMinMaxValue(volumeMinMax.get(channel)[0], volumeMinMax.get(channel)),
                    getMinMaxValue(volumeMinMax.get(channel)[1], volumeMinMax.get(channel))]);
            } else {
                contrastLimitsList.push([getMinMaxValue(contrastLimits[id][0], volumeMinMax.get(channel)),
                    getMinMaxValue(contrastLimits[id][1], volumeMinMax.get(channel))]);
            }
        }
    }
    if (volume === null) {
        return null;
    }
    let volconfig = {
        clim1: 0.01,
        clim2: 0.7,
        renderstyle: 'dvr',
        isothreshold: 0.15,
        opacity: 1.0,
        colormap: 'gray'
    };
    let cmtextures = {
        viridis: new THREE.TextureLoader().load(cmViridisTextureUrl),
        gray: new THREE.TextureLoader().load(cmGrayTextureUrl)
    };
    var shader = VolumeRenderShaderPerspective;
    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    setUniformsTextures(uniforms, texturesList, volume, cmtextures, volconfig);
    setUniformsTextureSettings(uniforms, contrastLimitsList, colorsSave);
    return [uniforms, shader, [1, scale[1].size / scale[0].size, scale[2].size / scale[0].size], [volume.xLength, volume.yLength, volume.zLength]];
}

async function initialDataLoading(channelTargetC, resolution, data, volumes, textures, volumeMinMax, oldResolution) {
    let volume = null;
    let scale = null;
    for (let channelStr in channelTargetC) {    // load on demand new channels or load all there are?? - Check VIV for it
        let channel = channelTargetC[parseInt(channelStr)];
        if (!volumes.has(channel) || resolution !== oldResolution) {
            let volumeOrigin = await getVolumeByChannel(channel, resolution, data);
            volume = getVolumeFromOrigin(volumeOrigin);
            let minMax = volume.computeMinMax();
            volume.data = minMaxVolume(volume);           // Have the data between 0 and 1
            volumes.set(channel, volume);
            textures.set(channel, getData3DTexture(volume))
            volumeMinMax.set(channel, minMax);
            scale = getPhysicalSizeScalingMatrix(data[resolution]);
        }
    }
    return [volumes, textures, volumeMinMax, scale];
}

function setUniformsTextures(uniforms, textures, volume, cmTextures, volConfig) {
    uniforms["boxSize"].value.set(volume.xLength, volume.yLength, volume.zLength);
    //can be done better
    uniforms["volumeTex"].value = textures.length > 0 ? textures[0] : null;
    uniforms["volumeTex2"].value = textures.length > 1 ? textures[1] : null;
    uniforms["volumeTex3"].value = textures.length > 2 ? textures[2] : null;
    uniforms["volumeTex4"].value = textures.length > 3 ? textures[3] : null;
    uniforms["volumeTex5"].value = textures.length > 4 ? textures[4] : null;
    uniforms["volumeTex6"].value = textures.length > 5 ? textures[5] : null;
    //
    uniforms["near"].value = 0.01;
    uniforms["far"].value = 100000;
    uniforms["alphaScale"].value = 1.0;
    uniforms["dtScale"].value = 1;
    uniforms["finalGamma"].value = 4.5;
    uniforms["useVolumeMirrorX"].value = false;
    uniforms["volumeCount"].value = textures.length;
    uniforms["u_size"].value.set(volume.xLength, volume.yLength, volume.zLength);
    uniforms["u_cmdata"].value = cmTextures[volConfig.colormap];
}

function setUniformsTextureSettings(uniforms, contrastLimits, colors) {
    uniforms["u_clim"].value.set(contrastLimits.length > 0 ? contrastLimits[0][0] : null, contrastLimits.length > 0 ? contrastLimits[0][1] : null);
    uniforms["u_clim2"].value.set(contrastLimits.length > 1 ? contrastLimits[1][0] : null, contrastLimits.length > 1 ? contrastLimits[1][1] : null);
    uniforms["u_clim3"].value.set(contrastLimits.length > 2 ? contrastLimits[2][0] : null, contrastLimits.length > 2 ? contrastLimits[2][1] : null);
    uniforms["u_clim4"].value.set(contrastLimits.length > 3 ? contrastLimits[3][0] : null, contrastLimits.length > 3 ? contrastLimits[3][1] : null);
    uniforms["u_clim5"].value.set(contrastLimits.length > 4 ? contrastLimits[4][0] : null, contrastLimits.length > 4 ? contrastLimits[4][1] : null);
    uniforms["u_clim6"].value.set(contrastLimits.length > 5 ? contrastLimits[5][0] : null, contrastLimits.length > 5 ? contrastLimits[5][1] : null);
    uniforms["u_color"].value.set(colors.length > 0 ? colors[0][0] : null,
        colors.length > 0 ? colors[0][1] : null,
        colors.length > 0 ? colors[0][2] : null);
    uniforms["u_color2"].value.set(colors.length > 1 ? colors[1][0] : null,
        colors.length > 1 ? colors[1][1] : null,
        colors.length > 1 ? colors[1][2] : null);
    uniforms["u_color3"].value.set(colors.length > 2 ? colors[2][0] : null,
        colors.length > 2 ? colors[2][1] : null,
        colors.length > 2 ? colors[2][2] : null);
    uniforms["u_color4"].value.set(colors.length > 3 ? colors[3][0] : null,
        colors.length > 3 ? colors[3][1] : null,
        colors.length > 3 ? colors[3][2] : null);
    uniforms["u_color5"].value.set(colors.length > 4 ? colors[4][0] : null,
        colors.length > 4 ? colors[4][1] : null,
        colors.length > 4 ? colors[4][2] : null);
    uniforms["u_color6"].value.set(colors.length > 5 ? colors[5][0] : null,
        colors.length > 5 ? colors[5][1] : null,
        colors.length > 5 ? colors[5][2] : null);
}

/**
 * Get physical size scaling Matrix4
 * @param {Object} loader PixelSource
 */
function getPhysicalSizeScalingMatrix(loader) {
    const {x, y, z} = loader?.meta?.physicalSizes ?? {};
    return [x, y, z];
}

async function getVolumeByChannel(channel, resolution, loader) {
    return getVolumeIntern({
        source: loader[resolution],
        selection: {t: 0, c: channel}, // corresponds to the first channel of the first timepoint
        downsampleDepth: 2 ** resolution,
    });
}

function minMaxVolume(volume) {
    // get the min and max intensities
    var min_max = volume.computeMinMax();
    var min = min_max[0];
    var max = min_max[1];

    var dataASFloat32 = new Float32Array(volume.data.length);
    for (var i = 0; i < volume.data.length; i++) {
        dataASFloat32 [i] = (volume.data[i] - min) / Math.sqrt(Math.pow(max, 2) - Math.pow(min, 2));
    }
    return dataASFloat32;
}

function getVolumeFromOrigin(volumeOrigin) {
    let volume = new Volume();
    volume.xLength = volumeOrigin.width;
    volume.yLength = volumeOrigin.height;
    volume.zLength = volumeOrigin.depth;
    volume.data = volumeOrigin.data;
    return volume;
}

function getMinMaxValue(value, minMax) {
    let min = minMax[0];
    let max = minMax[1];
    return (value - min) / Math.sqrt(Math.pow(max, 2) - Math.pow(min, 2));
}

function getData3DTexture(volume) {
    var texture = new THREE.Data3DTexture(volume.data, volume.xLength, volume.yLength, volume.zLength);
    texture.format = THREE.RedFormat;
    texture.type = THREE.FloatType;
    texture.generateMipmaps = false;
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    // texture.unpackAlignment = 1;
    texture.needsUpdate = true;
    return texture;
}

// TODO: Use the imported function from VIV: Ask Trevor how to get there
async function getVolumeIntern({
                                   source,
                                   selection,
                                   onUpdate = () => {
                                   },
                                   downsampleDepth = 1,
                                   signal
                               }) {
    const {shape, labels, dtype} = source;
    const {height, width} = getImageSize(source);
    const depth = shape[labels.indexOf('z')];
    const depthDownsampled = Math.max(1, Math.floor(depth / downsampleDepth));
    const rasterSize = height * width;
    const name = `${dtype}Array`;
    const TypedArray = globalThis[name];
    const volumeData = new TypedArray(rasterSize * depthDownsampled);
    await Promise.all(
        new Array(depthDownsampled).fill(0).map(async (_, z) => {
            const depthSelection = {
                ...selection,
                z: z * downsampleDepth
            };
            const {data: rasterData} = await source.getRaster({
                selection: depthSelection,
                signal
            });
            let r = 0;
            onUpdate({z, total: depthDownsampled, progress: 0.5});
            // For now this process fills in each raster plane anti-diagonally transposed.
            // This is to ensure that the image looks right in three dimensional space.
            while (r < rasterSize) {
                const volIndex = z * rasterSize + (rasterSize - r - 1);
                const rasterIndex =
                    ((width - r - 1) % width) + width * Math.floor(r / width);
                volumeData[volIndex] = rasterData[rasterIndex];
                r += 1;
            }
            onUpdate({z, total: depthDownsampled, progress: 1});
        })
    );
    return {
        data: volumeData,
        height,
        width,
        depth: depthDownsampled
    };
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
            <meshPhongMaterial color={"red"} opacity={0.5} transparent/>
        </mesh>
    )
}


const SpatialWrapper = forwardRef((props, deckRef) => (
    <SpatialThree {...props} deckRef={deckRef}/>
));
export default SpatialWrapper;
