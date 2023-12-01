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
// import DVRMaterial from "./DVRMaterial.js";

const SpatialThree = (props) => {
    const [dataReady, setDataReady] = useState(false);
    const [uniforms, setUniforms] = useState(null);
    const [shader, setShader] = useState(null);
    const [geometrySize, setGeometrySize] = useState(null);
    const [meshScale, setMeshScale] = useState(null);
    const prevProps = useRef({props}).current;
    const {
        images = {},
        imageLayerScopes,
        imageLayerCoordination,
        imageChannelScopesByLayer,
        imageChannelCoordination,
    } = props;
    const imageLayerLoaderSelections = useRef({});
    let layerScope = imageLayerScopes[0];
    const fetchRendering = async () => {
        console.log("Loading the data")
        const rendering = await create3DRendering(layerScope, imageLayerCoordination[0][layerScope], imageChannelScopesByLayer[layerScope],
            imageChannelCoordination[0][layerScope], images[layerScope], props, imageLayerLoaderSelections.current);
        if (rendering !== null) {
            setUniforms(rendering[0]);
            setShader(rendering[1]);
            setMeshScale(rendering[2]);
            setGeometrySize(rendering[3]);
            console.log(rendering);
        }
    }
    let data = images[layerScope]?.image?.instance?.getData();
    if (data && !dataReady) {
        setDataReady(true);
    }
    // Only reload the mesh if the imageLayer changes (new data / new resolution, ...)
    useEffect(() => {
        fetchRendering();
    }, [dataReady]);
    // Just adapt the mesh parameters if they change (imageChannelCoordination, ...)

    return (
        <div id="ThreeJs" style={{width: "100%", height: "100%"}}>
            <ARButton/>
            <Canvas>
                <XR>
                    <PerspectiveCamera fov={45} position={[0, 0, 0]} up={[0, 1, 0]} near={0.01} far={100000}/>
                    {(uniforms !== undefined && uniforms !== null && shader !== undefined && shader !== null) &&
                        <mesh scale={meshScale}>
                            <boxGeometry args={geometrySize}/>
                            <shaderMaterial
                                customProgramCacheKey={() => {
                                    return '1'
                                }}
                                side={THREE.BackSide}
                                uniforms={uniforms}
                                needsUpdate={true}
                                vertexShader={shader.vertexShader}
                                fragmentShader={shader.fragmentShader}
                            />
                        </mesh>
                    }
                    <OrbitControls/>
                </XR>
            </Canvas>
        </div>
    );
}

function rgbToHex(rgb) {
    let r = rgb[0], g = rgb[1], b = rgb[2];
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

async function create3DRendering(layerScope, layerCoordination, channelScopes, channelCoordination, image, props, imageLayerLoaderSelection) {
    // Getting all the information out of the provided props
    const {
        targetT,
        targetZ,
        spatialRenderingMode,
    } = props;
    const data = image?.image?.instance?.getData();
    if (!data) {
        console.log("Data is null")
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
    const autoTargetResolution = imageWrapperInstance.getAutoTargetResolution();
    const targetResolution = layerCoordination[CoordinationType.SPATIAL_TARGET_RESOLUTION];
    let resolution = (targetResolution === null || isNaN(targetResolution)) ? autoTargetResolution : targetResolution;


    /// -----------------------------------------------
    // SETTING UP THE THREE:
    let volume = null;
    let textures = [];
    let colorsSave = [];
    let contastLimits = [];
    let volumeLimits = [];
    for (let channelStr in channelsVisible) {
        let channel = parseInt(channelStr);
        if (channelsVisible[channel]) {
            let volumeOrigin = await getVolumeByChannel(channel, resolution, data);
            volume = getVolumeFromOrigin(volumeOrigin);
            let minMax = volume.computeMinMax();
            volume.data = minMaxVolume(volume);
            textures.push(getData3DTexture(volume));
            colorsSave.push([colors[channel][0] / 255, colors[channel][1] / 255, colors[channel][2] / 255]);
            contrastLimits.push([getMinMaxValue(contrastLimits[channel][0], minMax),
                getMinMaxValue(contrastLimits[channel][1], minMax)]);
            volumeLimits.push(minMax);
        }
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
    setUniformsInit(uniforms, textures, volume, cmtextures, volconfig);
    setUniformsThatUpdate(uniforms, contrastLimits, colors);
    let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        side: THREE.BackSide, // The volume shader uses the backface as its "reference point"
        // blending: THREE.NormalBlending,
        // transparent: true,
    });
    material.needsUpdate = true;
    material.customProgramCacheKey = function () {
        return '1';
    };
    let scale = getPhysicalSizeScalingMatrix(data[resolution]);
    return [uniforms, shader, [1, scale[1].size / scale[0].size, scale[2].size / scale[0].size], [volume.xLength, volume.yLength, volume.zLength]];
}

function setUniformsInit(uniforms, textures, volume, cmTextures, volConfig) {
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

function setUniformsThatUpdate(uniforms, contrastLimits, colors) {
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
            <meshStandardMaterial color={props.color}/>
        </mesh>
    )
}


const SpatialWrapper = forwardRef((props, deckRef) => (
    <SpatialThree {...props} deckRef={deckRef}/>
));
export default SpatialWrapper;
