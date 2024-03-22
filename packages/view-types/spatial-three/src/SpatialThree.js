/* eslint-disable no-unused-vars */
import React, {useRef, useState, forwardRef, useEffect, useCallback} from 'react';
import {Canvas, extend, useFrame, useThree} from '@react-three/fiber'
import {
    OrbitControls,
    useTexture,
    shaderMaterial,
    PerspectiveCamera,
    TorusKnot,
    Bvh,
    Center,
    Line,
    Text
} from '@react-three/drei'
import {useXR, RayGrab, Interactive, VRButton, ARButton, XR, Controllers, Hands, Ray} from '@react-three/xr'
import {EnhancedRayGrab} from "./TwoHandScale.js";
import {isEqual} from 'lodash-es';
import {filterSelection} from '@vitessce/spatial-utils';
import {CoordinationType} from '@vitessce/constants-internal';
import {getLayerLoaderTuple} from './utils.js';
import {Volume} from "../jsm/misc/Volume.js";
import {getImageSize} from '@hms-dbmi/viv';
import * as THREE from "three";
import {HandBbox} from "./xr/HandBbox.js"
import {MeasureLine} from "./MeasureLine.js"
import cmViridisTextureUrl from "../textures/cm_viridis.png";
import cmGrayTextureUrl from "../textures/cm_gray.png";
import {VolumeRenderShaderPerspective} from "../jsm/shaders/VolumeShaderPerspective.js";
import {VolumeShaderNew} from "../jsm/shaders/VolumeShaderNew.js";
import {VolumeShaderFirstPass} from "../jsm/shaders/VolumeShaderFirstPass.js";
import {VolumeShaderGeom} from "../jsm/shaders/VolumeShaderGeom.js";
import {useGLTF} from '@react-three/drei'
import {setObsSelection} from '@vitessce/sets-utils';
import {setPowerset} from "mathjs";

export const WS_EVENT = "click:event";

const SpatialThree = (props) => {
    // console.log(props)
    const materialRef = useRef(null);
    const orbitRef = useRef(null);
    const controllerRef = useRef(null);
    const [initialStartup, setInitialStartup] = useState(false);
    const [dataReady, setDataReady] = useState(false);
    const [segmentationGroup, setSegmentationGroup] = useState(null);
    const [segmentationSceneScale, setSegmentationSceneScale] = useState([1.0, 1.0, 1.0])
    const [renderingSettings, setRenderingSettings] = useState({
        uniforms: null, shader: null, meshScale: null,
        geometrySize: null, boxSize: null
    });
    const [volumeData, setVolumeData] = useState({
        volumes: new Map(),
        textures: new Map(),
        volumeMinMax: new Map(),
        scale: null,
        resolution: null,
        originalScale: null
    });
    const [volumeSettings, setVolumeSettings] = useState({
        channelsVisible: [],
        allChannels: [],
        channelTargetC: [],
        resolution: null,
        data: null,
        colors: [],
        contrastLimits: [],
        is3dMode: false,
        renderingMode: null,
        layerTransparency: 1.0,
    });
    const [segmentationSettings, setSegmentationSettings] = useState({
        visible: true,
        color: [1, 1, 1],
        opacity: 1,
        multiVisible: "",
        multiOpacity: "",
        multiColor: "",
        data: null,
        obsSets: [],
    })


    const {
        images,
        layerScope,
        imageLayerScopes,
        imageLayerCoordination,
        imageChannelScopesByLayer,
        imageChannelCoordination,
        channelsVisible,
        allChannels,
        channelTargetC,
        resolution,
        data,
        colors,
        contrastLimits,
        is3dMode,
        renderingMode,
        layerTransparency,
        xSlice,
        ySlice,
        zSlice
    } = getVolumeSettings(props, volumeSettings, setVolumeSettings, dataReady, setDataReady)

    //Segmentation: //TODO get the Loader to get the URL
    const {
        obsSegmentations,
        obsSegmentationsSets,
        featureValueColormap,
        featureValueColormapRange,
        onGlomSelected,
        delegateHover
    } = props;
    let segmentationLayerCoordination, segmentationChannelCoordination;
    segmentationLayerCoordination = props.segmentationLayerCoordination;
    segmentationChannelCoordination = props.segmentationChannelCoordination;
    let setObsHighlightFct = (id) => {
    };
    let setsSave = [];
    if (segmentationChannelCoordination[0][layerScope] !== undefined) {
        let segmentationOBSSetLayerProps = segmentationChannelCoordination[0][layerScope][layerScope];
        //console.log(segmentationOBSSetLayerProps)
        const {setObsHighlight} = segmentationChannelCoordination[1][layerScope][layerScope];
        setObsHighlightFct = setObsHighlight;
        let sets = segmentationChannelCoordination[0][layerScope][layerScope].additionalObsSets;
        if (sets !== null) {
            for (let index in segmentationOBSSetLayerProps.obsSetSelection) {
                let info = {name: "", id: "", color: []}

                let selectedElement = segmentationOBSSetLayerProps.obsSetSelection[index][1];
                info.name = selectedElement
                for (let subIndex in sets.tree[0].children) {
                    let child = sets.tree[0].children[subIndex]
                    if (child.name === selectedElement) {
                        info.id = child.set[0][0];
                        break;
                    }
                }
                for (let subIndex in segmentationOBSSetLayerProps.obsSetColor) {
                    let color = segmentationOBSSetLayerProps.obsSetColor[subIndex]
                    if (color.path[1] === selectedElement) {
                        info.color = color.color;
                        break;
                    }
                }
                setsSave.push(info);
            }
        }
        if (segmentationOBSSetLayerProps.obsHighlight !== null) {
            setsSave.push({name: "", id: segmentationOBSSetLayerProps.obsHighlight, color: [160, 32, 240]});
        }
    }
    if (obsSegmentations[layerScope] !== undefined && segmentationGroup == null) {
        let shader = VolumeShaderFirstPass;
        let uniformsShader = THREE.UniformsUtils.clone(shader.uniforms);
        let firstPassVolume = new THREE.ShaderMaterial({
            uniforms: uniformsShader,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.FrontSide,
        });


        let scene = obsSegmentations[layerScope].scene;
        if (scene !== null && scene !== undefined) {
            //console.log(scene.children)
            let newScene = new THREE.Scene();
            let firstPass = new THREE.Group();
            firstPass.userData.name = "firstPass";
            let finalPass = new THREE.Group();
            finalPass.userData.name = "finalPass";
            for (let child in scene.children) {
                let childElement = scene.children[child]
                if (childElement.material === undefined) {
                    childElement = scene.children[child].children[0];
                    let name = scene.children[child].name.replace("glb", "").replace("_dec", "").replace("_1", "")
                        .replace("_Decobj", "").replace("obj", "").replace("_DEc", "").replace(".", "").replace("_Dec", "");
                    childElement.name = name;
                    childElement.userData.name = name;
                }
                if (childElement.material instanceof THREE.MeshPhysicalMaterial) {
                    childElement.material = new THREE.MeshStandardMaterial();
                }
                childElement.material.transparent = false
                childElement.material.writeDepthTexture = true
                childElement.material.depthTest = true
                childElement.material.depthWrite = true
                childElement.material.needsUpdate = true;
                // console.log(segmentationLayerCoordination[0][layerScope])
                childElement.material.side =
                    segmentationLayerCoordination[0][layerScope].spatialMaterialBackside ?
                        THREE.BackSide : THREE.FrontSide;

                let simplified = childElement.clone();
                simplified.geometry = childElement.geometry.clone();
                simplified.material = firstPassVolume;
                simplified.geometry.translate(segmentationLayerCoordination[0][layerScope].spatialTargetX ?? 0,
                    segmentationLayerCoordination[0][layerScope].spatialTargetY ?? 0,
                    segmentationLayerCoordination[0][layerScope].spatialTargetZ ?? 0);
                simplified.geometry.scale(
                    segmentationLayerCoordination[0][layerScope].spatialScaleX ?? 1.0,
                    segmentationLayerCoordination[0][layerScope].spatialScaleY ?? 1.0,
                    segmentationLayerCoordination[0][layerScope].spatialScaleZ ?? 1.0)
                simplified.geometry.rotateX(segmentationLayerCoordination[0][layerScope].spatialRotationX ?? 0)
                simplified.geometry.rotateY(segmentationLayerCoordination[0][layerScope].spatialRotationY ?? 0)
                simplified.geometry.rotateZ(segmentationLayerCoordination[0][layerScope].spatialRotationZ ?? 0)

                let finalPassChild = childElement.clone()
                finalPassChild.material = childElement.material.clone();
                finalPassChild.geometry = simplified.geometry.clone();
                firstPass.add(simplified)
                finalPass.add(finalPassChild)
            }
            // newScene.add(firstPass);
            newScene.add(finalPass);
            newScene.scale.set(
                segmentationLayerCoordination[0][layerScope].spatialSceneScaleX ?? 1.0,
                segmentationLayerCoordination[0][layerScope].spatialSceneScaleY ?? 1.0,
                segmentationLayerCoordination[0][layerScope].spatialSceneScaleZ ?? 1.0);
            let sceneScale = [segmentationLayerCoordination[0][layerScope].spatialSceneScaleX ?? 1.0,
                segmentationLayerCoordination[0][layerScope].spatialSceneScaleY ?? 1.0,
                segmentationLayerCoordination[0][layerScope].spatialSceneScaleZ ?? 1.0]
            setSegmentationSceneScale(sceneScale);
            newScene.rotateX(segmentationLayerCoordination[0][layerScope].spatialSceneRotationX ?? 0.0)
            newScene.rotateY(segmentationLayerCoordination[0][layerScope].spatialSceneRotationY ?? 0.0)
            newScene.rotateZ(segmentationLayerCoordination[0][layerScope].spatialSceneRotationZ ?? 0.0)
            setSegmentationGroup(newScene);
        }
    }
    if (segmentationChannelCoordination[0] !== undefined && segmentationChannelCoordination[0][layerScope] !== undefined) {
        let segmentationLayerProps = segmentationChannelCoordination[0][layerScope][layerScope]
        let setsSaveString = ""
        for (let child in setsSave) {
            setsSaveString += setsSave[child].id + ";" + setsSave[child].color.toString() + ";" + setsSave[child].name;
        }
        let settingsSaveString = ""
        for (let child in segmentationSettings.obsSets) {
            settingsSaveString += segmentationSettings.obsSets[child].id + ";"
                + segmentationSettings.obsSets[child].color.toString() + ";"
                + segmentationSettings.obsSets[child].name;
        }

        // Check the MultiChannel Setting - combine all channels and see if something changed
        if (props.segmentationChannelScopesByLayer[layerScope].length > 1) {
            let color = "";
            let opacity = "";
            let visible = "";
            let visibleCombined = false;
            let opacityCombined = 0.0;
            for (let scope in props.segmentationChannelScopesByLayer[layerScope]) {
                let channelScope = props.segmentationChannelScopesByLayer[layerScope][scope];
                let channelSet = segmentationChannelCoordination[0][layerScope][channelScope];
                color += channelSet.spatialChannelColor.toString() + ";"
                opacity += channelSet.spatialChannelOpacity + ";"
                visible += channelSet.spatialChannelVisible + ";"
                visibleCombined |= channelSet.spatialChannelVisible;
                opacityCombined += channelSet.spatialChannelOpacity;
            }
            //console.log(color, opacity, visible)
            if (color !== segmentationSettings.multiColor ||
                opacity !== segmentationSettings.multiOpacity ||
                visible !== segmentationSettings.multiVisible) {
                setSegmentationSettings({
                    color: segmentationLayerProps.spatialChannelColor,
                    opacity: opacityCombined,
                    visible: visibleCombined,
                    multiColor: color,
                    multiVisible: visible,
                    multiOpacity: opacity,
                    data: obsSegmentations,
                    obsSets: setsSave,
                });
            }
        } else {
            if (segmentationLayerProps.spatialChannelColor.toString() !== segmentationSettings.color.toString() ||
                segmentationLayerProps.spatialChannelVisible !== segmentationSettings.visible ||
                segmentationLayerProps.spatialChannelOpacity !== segmentationSettings.opacity ||
                setsSaveString !== settingsSaveString
            ) {
                setSegmentationSettings({
                    color: segmentationLayerProps.spatialChannelColor,
                    opacity: segmentationLayerProps.spatialChannelOpacity,
                    visible: segmentationLayerProps.spatialChannelVisible,
                    multiColor: "",
                    multiVisible: "",
                    multiOpacity: "",
                    data: obsSegmentations,
                    obsSets: setsSave,
                })
            }
        }
    }

    useEffect(() => {
        // console.log("Update in SegmentationGroup")
        if (segmentationGroup !== null) {
            let firstGroup = 0;
            let finalGroup = 0;
            for (let group in segmentationGroup.children) {
                if (segmentationGroup.children[group].userData.name == "finalPass") {
                    finalGroup = group;
                } else {
                    firstGroup = group;
                }
            }

            for (let child in segmentationGroup.children[finalGroup].children) {
                let color = segmentationSettings.color;
                let id = segmentationGroup.children[finalGroup].children[child].userData.name

                // SET SELECTION
                for (let index in segmentationSettings.obsSets) {
                    if (segmentationSettings.obsSets[index].id === id) {
                        color = segmentationSettings.obsSets[index].color
                    }
                }
                // console.log(id)
                // CHECK IF Multiple Scopes:
                if (props.segmentationChannelScopesByLayer[layerScope].length > 1) {
                    for (let scope in props.segmentationChannelScopesByLayer[layerScope]) {
                        let channelScope = props.segmentationChannelScopesByLayer[layerScope][scope];
                        let channelSet = segmentationChannelCoordination[0][layerScope][channelScope];
                        // console.log(channelSet)
                        if (channelSet.obsType == id) {
                            //console.log(id)
                            segmentationGroup.children[finalGroup].children[child].material.color.r = channelSet.spatialChannelColor[0] / 255;
                            segmentationGroup.children[finalGroup].children[child].material.color.g = channelSet.spatialChannelColor[1] / 255;
                            segmentationGroup.children[finalGroup].children[child].material.color.b = channelSet.spatialChannelColor[2] / 255;
                            segmentationGroup.children[finalGroup].children[child].material.opacity = channelSet.spatialChannelOpacity;
                            segmentationGroup.children[finalGroup].children[child].visible = channelSet.spatialChannelVisible;
                            segmentationGroup.children[firstGroup].children[child].visible = channelSet.spatialChannelVisible;
                            segmentationGroup.children[finalGroup].children[child].material.needsUpdate = true;
                            segmentationGroup.children[firstGroup].children[child].material.needsUpdate = true;
                        }
                    }
                } else {
                    for (let child in segmentationGroup.children[finalGroup].children) {
                        let color = segmentationSettings.color;
                        let id = segmentationGroup.children[finalGroup].children[child].userData.name
                        //console.log(id)
                        for (let index in segmentationSettings.obsSets) {
                            if (segmentationSettings.obsSets[index].id === id) {
                                color = segmentationSettings.obsSets[index].color
                            }
                        }
                        //TODO check if in a Set selection
                        //adapt the color
                        segmentationGroup.children[finalGroup].children[child].material.color.r = color[0] / 255
                        segmentationGroup.children[finalGroup].children[child].material.color.g = color[1] / 255
                        segmentationGroup.children[finalGroup].children[child].material.color.b = color[2] / 255
                        //Select the FinalPass Group
                        segmentationGroup.children[finalGroup].children[child].material.opacity = segmentationSettings.opacity
                        segmentationGroup.children[finalGroup].children[child].material.needsUpdate = true;
                    }
                    // segmentationGroup.children[finalGroup].children[child].material.color.r = color[0] / 255;
                    // segmentationGroup.children[finalGroup].children[child].material.color.g = color[1] / 255;
                    // segmentationGroup.children[finalGroup].children[child].material.color.b = color[2] / 255;
                    // segmentationGroup.children[finalGroup].children[child].material.opacity = segmentationSettings.opacity;
                    // segmentationGroup.children[finalGroup].children[child].material.needsUpdate = true;
                }
            }
        }
    }, [segmentationSettings, segmentationGroup])


    // 1st Rendering Pass Load the Data in the given resolution OR Resolution Changed
    let dataToCheck = images[layerScope]?.image?.instance?.getData();
    if (dataToCheck !== undefined && !dataReady && !initialStartup &&
        contrastLimits !== null && contrastLimits[0][1] !== 255 && is3dMode) {

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
                    scale: loadingResult[3] !== null ? loadingResult[3] : volumeData.scale,
                    originalScale: loadingResult[4]
                });
                if (renderingSettings.uniforms === undefined || renderingSettings.uniforms === null ||
                    renderingSettings.shader === undefined || renderingSettings.shader === null) {
                    // JUST FOR THE INITIAL RENDERING
                    const rendering = create3DRendering(loadingResult[0], channelTargetC, channelsVisible, colors,
                        loadingResult[1], contrastLimits, loadingResult[2], loadingResult[3], renderingMode,
                        layerTransparency, xSlice, ySlice, zSlice, loadingResult[4])
                    if (rendering !== null) {
                        setRenderingSettings({
                            uniforms: rendering[0], shader: rendering[1], meshScale: rendering[2],
                            geometrySize: rendering[3], boxSize: rendering[4]
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
                        is3dMode,
                        renderingMode,
                        layerTransparency,
                        xSlice,
                        ySlice,
                        zSlice
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
                volumeSettings.contrastLimits, volumeData.volumeMinMax, volumeData.scale, volumeSettings.renderingMode,
                volumeSettings.layerTransparency, volumeSettings.xSlice, volumeSettings.ySlice, volumeSettings.zSlice,
                volumeData.originalScale)
            if (rendering !== null) {
                let volumeCount = 0;
                for (let elem in volumeSettings.channelsVisible) {
                    if (volumeSettings.channelsVisible[elem]) volumeCount++;
                }
                setDataReady(false);
                if (materialRef !== undefined && materialRef.current !== null) {
                    //Set the material uniforms
                    materialRef.current.material.uniforms.u_clim.value = rendering[0]["u_clim"].value;
                    materialRef.current.material.uniforms.u_clim2.value = rendering[0]["u_clim2"].value;
                    materialRef.current.material.uniforms.u_clim3.value = rendering[0]["u_clim3"].value;
                    materialRef.current.material.uniforms.u_clim4.value = rendering[0]["u_clim4"].value;
                    materialRef.current.material.uniforms.u_clim5.value = rendering[0]["u_clim5"].value;
                    materialRef.current.material.uniforms.u_clim6.value = rendering[0]["u_clim6"].value;

                    materialRef.current.material.uniforms.u_xClip.value = rendering[0]["u_xClip"].value;
                    materialRef.current.material.uniforms.u_yClip.value = rendering[0]["u_yClip"].value;
                    materialRef.current.material.uniforms.u_zClip.value = rendering[0]["u_zClip"].value;

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
                    materialRef.current.material.uniforms.u_renderstyle.value = volumeSettings.renderingMode;
                    materialRef.current.material.uniforms.dtScale.value = volumeSettings.layerTransparency;
                }
            } else {
                materialRef.current.material.uniforms.volumeCount.value = 0;
                materialRef.current.material.uniforms.volumeTex.value = null;
            }
        }
    }, [volumeSettings]);

    // -----------------------------------------------------------------
    // -----------------------------------------------------------------
    if (!volumeSettings.is3dMode) {
        return (
            <group>
                <ambientLight/>
                <pointLight position={[10, 10, 10]}/>
                <Box position={[0, 0, 0]} color={"blue"} moving={false}/>
            </group>
        );
    }

    if (volumeSettings.is3dMode &&
        (renderingSettings.uniforms === undefined || renderingSettings.uniforms === null ||
            renderingSettings.shader === undefined || renderingSettings.shader === null)
    ) {
        return (
            <group>
                <ambientLight/>
                <pointLight position={[10, 10, 10]}/>
                <Box position={[0, 0, 0]} color={"green"} moving={true}/>
            </group>);
    }

    const geometryAndMeshProps = {
        segmentationGroup: segmentationGroup,
        segmentationSettings: segmentationSettings,
        segmentationSceneScale: segmentationSceneScale,
        renderingSettings: renderingSettings,
        materialRef: materialRef,
        highlightGlom: onGlomSelected,
        setObsHighlight: setObsHighlightFct,
    }
    // console.log(volumeSettings)

    return (
        <group>
            <Controllers/>
            <Hands/>
            <HandBbox/>
            <HandDecorate/>
            <GeometryAndMesh {...geometryAndMeshProps} ></GeometryAndMesh>
            <OrbitControls ref={orbitRef} enableDamping={false} dampingFactor={0.0}
                           zoomDampingFactor={0.0} smoothZoom={false}/>
        </group>
    );
}

function HandDecorate() {
    const {controllers} = useXR();
    useFrame(() => {
        if (controllers && controllers[0] && controllers[1]) {
            if (controllers[0].hand) {
                if (controllers[0].hand.children[25]) {
                    if (controllers[0].hand.children[25].children[0]) {
                        if (controllers[0].hand.children[25].children[0].children[0]) {
                            controllers[0].hand.children[25].children[0].children[0].material.transparent = true;
                            controllers[0].hand.children[25].children[0].children[0].material.opacity = 0.5;
                        }
                    }
                }
            }
            if (controllers[1].hand) {
                if (controllers[1].hand.children[25]) {
                    if (controllers[1].hand.children[25].children[0]) {
                        if (controllers[1].hand.children[25].children[0].children[0]) {
                            controllers[1].hand.children[25].children[0].children[0].material.transparent = true;
                            controllers[1].hand.children[25].children[0].children[0].material.opacity = 0.5;
                        }
                    }
                }
            }
        }
    });
}

function getVolumeSettings(props, volumeSettings, setVolumeSettings, dataReady, setDataReady) {
    //Everything that is props based should be useEffect with props as dependent so we can sideload the props
    const {
        images = {},
        imageLayerScopes,
        imageLayerCoordination,
        imageChannelScopesByLayer,
        imageChannelCoordination,
    } = props;
    //console.log(props)
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
        is3dMode,
        renderingMode,
        layerTransparency,
        xSlice,
        ySlice,
        zSlice
    } = extractInformationFromProps(layerScope, layerCoordination, channelScopes,
        channelCoordination, images[layerScope], props, imageLayerLoaderSelections.current)
    // TODO: Find a better and more efficient way to compare the Strings here
    if (channelTargetC !== null) {
        if (volumeSettings.channelTargetC.length !== 0 &&
            (volumeSettings.channelTargetC.toString() !== channelTargetC.toString() ||
                volumeSettings.resolution.toString() !== resolution.toString())) {
            if (!dataReady) setDataReady(true);
        } else if (
            (volumeSettings.channelsVisible.toString() !== channelsVisible.toString() ||
                volumeSettings.colors.toString() !== colors.toString() ||
                volumeSettings.is3dMode !== is3dMode ||
                volumeSettings.contrastLimits.toString() !== contrastLimits.toString() ||
                volumeSettings.renderingMode.toString() !== renderingMode.toString() ||
                volumeSettings.layerTransparency.toString() !== layerTransparency.toString() ||
                volumeSettings.xSlice.toString() !== xSlice.toString() ||
                volumeSettings.ySlice.toString() !== ySlice.toString() ||
                volumeSettings.zSlice.toString() !== zSlice.toString()
            )) {
            setVolumeSettings({
                channelsVisible,
                allChannels,
                channelTargetC,
                resolution,
                data,
                colors,
                contrastLimits,
                is3dMode,
                renderingMode,
                layerTransparency,
                xSlice,
                ySlice,
                zSlice
            });
            setDataReady(false);
        }
    }
    return {
        images,
        layerScope,
        imageLayerScopes,
        imageLayerCoordination,
        imageChannelScopesByLayer,
        imageChannelCoordination,
        channelsVisible,
        allChannels,
        channelTargetC,
        resolution,
        data,
        colors,
        contrastLimits,
        is3dMode,
        renderingMode,
        layerTransparency,
        xSlice,
        ySlice,
        zSlice
    };
}

// Only cares about rendering the gemoetry and the mesh together in one scene
function GeometryAndMesh(props) {
    const {
        segmentationGroup, segmentationSettings, segmentationSceneScale,
        renderingSettings, materialRef, highlightGlom, setObsHighlight
    } = props;
    let model = useRef();
    let distanceRef = useRef();
    let rayGrabGroup = useRef();
    const glThree = useThree();

    let shader = VolumeShaderFirstPass;
    let uniformsShader = THREE.UniformsUtils.clone(shader.uniforms);
    let firstPassVolume = new THREE.ShaderMaterial({
        uniforms: uniformsShader,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        side: THREE.FrontSide,
    });

    // -----------------------------------------------------------------
    //                          XR
    // -----------------------------------------------------------------
    const {isPresenting, player} = useXR()
    useEffect(() => {
        if (isPresenting && model !== undefined && model.current !== null) {
            console.log("Entering the XR")
            if (materialRef !== null) {
                materialRef.current.material.uniforms.u_physical_Pixel.value = 0.02
                console.log(materialRef.current.material.uniforms)
            }
        } else if (!isPresenting) {
            if (materialRef !== null) {
                materialRef.current.material.uniforms.u_physical_Pixel.value = 2.0
                console.log(materialRef.current.material.uniforms)
            }
            //TODO fix to get the view back
            if (model !== undefined && model.current !== undefined) {
                model.current.scale.set(segmentationSceneScale[0], segmentationSceneScale[1], segmentationSceneScale[2])
                model.current.position.set(0, 0, 0)
            }
            if (materialRef !== undefined && materialRef.current !== undefined) {
                materialRef.current.position.set(0, 0, 0)
                materialRef.current.scale.set(renderingSettings.meshScale[0], renderingSettings.meshScale[1], renderingSettings.meshScale[2])
            }
        }
    }, [isPresenting])

    const {scene} = useThree();
    const {controllers} = useXR();
    const [measureState, setMeasureState] = useState(false);
    const [highlighted, setHighlighted] = useState(false);
    let [showLine, setShowLine] = useState(false);
    let [currentLine, setCurrentLine] = useState({
        startPoint: new THREE.Vector3(),
        midPoint: new THREE.Vector3(),
        endPoint: new THREE.Vector3(),
        setStartPoint: false,
        setEndPoint: false
    })
    let [lines, setLines] = useState([])
    let [debounce, setDebounce] = useState(0)

    useFrame(() => {
        if (isPresenting) {
            // Could first Intersect with Bounding Box of the Model to make the calculation faster
            let rightTipBbox = scene.getObjectByName("rightTipBbox");
            let leftTipBbox = scene.getObjectByName("leftTipBbox");
            let leftTipBB = new THREE.Box3().setFromObject(leftTipBbox);
            let rightTipBB = new THREE.Box3().setFromObject(rightTipBbox);
            let intersected = false;
            const volumeBox = null;
            setDebounce(debounce - 1.0)
            if (materialRef !== null && materialRef.current !== undefined) {
                const volumeBox = new THREE.Box3().setFromObject(materialRef.current)
            }

            if (leftTipBB.intersectsBox(rightTipBB) && leftTipBB.max.x !== -rightTipBB.min.x) {
                setMeasureState(true)
                setShowLine(true);
                setCurrentLine({
                    startPoint: new THREE.Vector3(),
                    midPoint: new THREE.Vector3(),
                    endPoint: new THREE.Vector3(),
                    setStartPoint: false,
                    setEndPoint: false
                })
            }
            if (measureState) {
                let leftFingerPosition = controllers[1].hand.joints["index-finger-tip"].position.clone();
                let rightFingerPosition = controllers[0].hand.joints["index-finger-tip"].position.clone();
                leftFingerPosition = leftFingerPosition.applyMatrix4(rayGrabGroup.current.matrixWorld.clone().invert());
                rightFingerPosition = rightFingerPosition.applyMatrix4(rayGrabGroup.current.matrixWorld.clone().invert());
                let currentStart = leftFingerPosition.clone();
                let currentEnd = rightFingerPosition.clone();
                if (currentLine.setStartPoint) {
                    currentStart = currentLine.startPoint
                }
                if (currentLine.setEndPoint) {
                    currentEnd = currentLine.endPoint
                }
                setCurrentLine({
                    startPoint: currentStart,
                    midPoint: new THREE.Vector3().addVectors(currentStart, currentEnd).multiplyScalar(0.5),
                    endPoint: currentEnd,
                    setStartPoint: currentLine.setStartPoint,
                    setEndPoint: currentLine.setEndPoint
                })
                if (controllers[0].hand.inputState.pinching === true) {
                    // right hand set mesaure point
                    console.log("Right Hand Set Measure Point")
                    setCurrentLine({
                        startPoint: currentLine.startPoint,
                        midPoint: currentLine.midPoint,
                        endPoint: currentLine.endPoint,
                        setStartPoint: currentLine.setStartPoint,
                        setEndPoint: true
                    })
                }
                if (controllers[1].hand.inputState.pinching === true) {
                    // left hand set measure point
                    console.log("Left Hand Set Measure Point")
                    setCurrentLine({
                        startPoint: currentLine.startPoint,
                        midPoint: currentLine.midPoint,
                        endPoint: currentLine.endPoint,
                        setStartPoint: true,
                        setEndPoint: currentLine.setEndPoint
                    })
                }
                if (currentLine.setStartPoint && currentLine.setEndPoint) {
                    lines.push(currentLine)
                    setLines(lines)
                    setShowLine(false); //Transition over to the collection
                    setMeasureState(false)
                    setDebounce(8)
                }
            }

            // else if (debounce <= 0 && model.current !== null && undefined !== model.current && isPresenting) {
            //     for (let childID in model.current.children[0].children) {
            //         let child = model.current.children[0].children[childID];
            //         let currentObjectBB = new THREE.Box3().setFromObject(child);
            //         let intersectsLeftTip = leftTipBB.intersectsBox(currentObjectBB);
            //         let intersectsRightTip = rightTipBB.intersectsBox(currentObjectBB);
            //         if (intersectsLeftTip || intersectsRightTip) {
            //             intersected = true;
            //             // Highlighting Glom
            //             setObsHighlight(child.name)
            //             setHighlighted(true)
            //             if (controllers[1] !== undefined && intersectsLeftTip && controllers[1].hand.inputState.pinching == true) {
            //                 setDebounce(10)
            //                 intersected = false;
            //                 highlightGlom(child.name);
            //                 controllers[1].hand.inputState.pinching = false;
            //             }
            //             if (controllers[0] !== undefined && intersectsRightTip && controllers[0].hand.inputState.pinching == true) {
            //                 setDebounce(10)
            //                 intersected = false;
            //                 highlightGlom(child.name)
            //                 controllers[0].hand.inputState.pinching = false;
            //             }
            //         }
            //     }
            //     if (!intersected && highlighted) {
            //         setObsHighlight(null);
            //         setHighlighted(false);
            //     }
            // }
        }
    }, [measureState, highlighted, currentLine, lines, showLine, debounce, isPresenting])

    // TODO: IF we want to have a ZoomGrab than it needs to adapt the 0.002 value
    // TODO: The measurement from time to time intersects with the rayGrab (maybe "tell it" that we are in measurement mode)
    return (
        <group>
            {useXR().isPresenting ?
                <RayGrab>
                    <group ref={rayGrabGroup}>
                        {segmentationGroup !== null &&
                            <group>
                                <hemisphereLight skyColor={0x808080} groundColor={0x606060}/>
                                <directionalLight color={0xFFFFFF} position={[0, -800, 0]}/>
                                <primitive ref={model} object={segmentationGroup}
                                           position={[-0.18, 1.13, -1]}
                                           scale={[0.002 * segmentationSceneScale[0],
                                               0.002 * segmentationSceneScale[1],
                                               0.002 * segmentationSceneScale[2]]}
                                />
                            </group>
                        }
                        {(renderingSettings.uniforms !== undefined && renderingSettings.uniforms !== null &&
                                renderingSettings.shader !== undefined && renderingSettings.shader !== null) &&
                            <group>
                                <mesh name="cube" position={[-0.18, 1.13, -1]} rotation={[0, 0, 0]}
                                      scale={[0.002 * renderingSettings.meshScale[0],
                                          0.002 * renderingSettings.meshScale[1],
                                          0.002 * renderingSettings.meshScale[2]]}
                                      ref={materialRef}>
                                    <boxGeometry args={renderingSettings.geometrySize}/>
                                    <shaderMaterial
                                        customProgramCacheKey={() => {
                                            return '1'
                                        }}
                                        side={THREE.FrontSide}
                                        uniforms={renderingSettings.uniforms}
                                        needsUpdate={true}
                                        transparent={true}
                                        vertexShader={renderingSettings.shader.vertexShader}
                                        fragmentShader={renderingSettings.shader.fragmentShader}
                                    />
                                </mesh>
                            </group>
                        }
                    </group>
                    <group name="currentLine" ref={distanceRef}>
                        {showLine && (
                            <MeasureLine currentLine={currentLine} scale={(1 / 0.002) * 0.4}></MeasureLine>
                        )}
                    </group>
                    <group name="lines">
                        {lines.map((object, i) => <MeasureLine currentLine={object} scale={(1 / 0.002) * 0.4}/>)}
                    </group>
                </RayGrab>
                :
                <group>
                    <group>
                        {segmentationGroup !== null &&
                            <group>
                                <hemisphereLight skyColor={0x808080} groundColor={0x606060}/>
                                <directionalLight color={0xFFFFFF} position={[0, -800, 0]}/>
                                {/*<Bvh firstHitOnly>*/}
                                    <primitive ref={model} object={segmentationGroup} position={[0, 0, 0]}
                                               // onClick={(e) => {
                                               //     if (e.object.parent.userData.name == "finalPass") {
                                               //         highlightGlom(e.object.name);
                                               //     }
                                               // }}
                                               // onPointerOver={e => {
                                               //     setObsHighlight(e.object.name)
                                               // }}
                                               // onPointerOut={e => setObsHighlight(null)}
                                    />
                                {/*</Bvh>*/}
                            </group>
                        }
                        {(renderingSettings.uniforms !== undefined && renderingSettings.uniforms !== null &&
                                renderingSettings.shader !== undefined && renderingSettings.shader !== null) &&
                            <group>
                                <mesh scale={renderingSettings.meshScale} ref={materialRef}>
                                    <boxGeometry args={renderingSettings.geometrySize}/>
                                    <shaderMaterial
                                        customProgramCacheKey={() => {
                                            return '1'
                                        }}
                                        side={THREE.FrontSide}
                                        uniforms={renderingSettings.uniforms}
                                        needsUpdate={true}
                                        transparent={true}
                                        vertexShader={renderingSettings.shader.vertexShader}
                                        fragmentShader={renderingSettings.shader.fragmentShader}
                                    />
                                </mesh>
                            </group>
                        }
                    </group>
                    <group name="lines">
                        {lines.map((object, i) => <MeasureLine currentLine={object} scale={1}/>)}
                    </group>
                </group>
            }
        </group>
    );
}

function extractInformationFromProps(layerScope, layerCoordination, channelScopes, channelCoordination,
                                     image, props, imageLayerLoaderSelection) {
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
    let renderingMode = layerCoordination[CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM];
    renderingMode = renderingMode === "maximumIntensityProjection" ? 0 : renderingMode === "minimumIntensityProjection" ? 1 : 2;
    const visible = layerCoordination[CoordinationType.SPATIAL_LAYER_VISIBLE];
    const transparentColor = layerCoordination[CoordinationType.SPATIAL_LAYER_TRANSPARENT_COLOR];
    const useTransparentColor = Array.isArray(transparentColor) && transparentColor.length === 3;
    const layerTransparency = layerCoordination[CoordinationType.SPATIAL_LAYER_OPACITY];
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

    // Get the Clipping Planes
    let xSlice = layerCoordination[CoordinationType.SPATIAL_SLICE_X]
    let ySlice = layerCoordination[CoordinationType.SPATIAL_SLICE_Y]
    let zSlice = layerCoordination[CoordinationType.SPATIAL_SLICE_Z]

    xSlice = xSlice !== null ? xSlice : new THREE.Vector2(-1, 100000)
    ySlice = ySlice !== null ? ySlice : new THREE.Vector2(-1, 100000)
    zSlice = zSlice !== null ? zSlice : new THREE.Vector2(-1, 100000)

    return {
        channelsVisible,
        allChannels,
        channelTargetC,
        resolution,
        data,
        colors,
        contrastLimits,
        is3dMode,
        renderingMode,
        layerTransparency,
        xSlice,
        ySlice,
        zSlice
    };
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
function create3DRendering(volumes, channelTargetC, channelsVisible, colors, textures, contrastLimits, volumeMinMax, scale, renderstyle, layerTransparency,
                           xSlice, ySlice, zSlice, originalScale) {
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
        isothreshold: 0.15,
        opacity: 1.0,
        colormap: 'gray'
    };
    let cmtextures = {
        viridis: new THREE.TextureLoader().load(cmViridisTextureUrl),
        gray: new THREE.TextureLoader().load(cmGrayTextureUrl)
    };
    //var shader = VolumeShaderNew;
    var shader = VolumeRenderShaderPerspective;
    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    setUniformsTextures(uniforms, texturesList, volume, cmtextures, volconfig, renderstyle, contrastLimitsList, colorsSave, layerTransparency,
        xSlice, ySlice, zSlice, [scale[0].size, scale[1].size, scale[2].size], originalScale);
    return [uniforms, shader, [1, scale[1].size / scale[0].size, scale[2].size / scale[0].size], [volume.xLength, volume.yLength, volume.zLength],
        [1.0, volume.yLength / volume.xLength, volume.zLength / volume.xLength]];
}

async function initialDataLoading(channelTargetC, resolution, data, volumes, textures, volumeMinMax, oldResolution) {
    let volume = null;
    let scale = null;
    const {shape, labels} = data[0];
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
    return [volumes, textures, volumeMinMax, scale,
        [shape[labels.indexOf('x')], shape[labels.indexOf('y')], shape[labels.indexOf('z')]]];
}

function setUniformsTextures(uniforms, textures, volume, cmTextures, volConfig, renderstyle, contrastLimits, colors, layerTransparency,
                             xSlice, ySlice, zSlice, meshScale, originalScale) {
    console.log(originalScale)
    console.log(meshScale)
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
    uniforms["far"].value = 3000;
    uniforms["alphaScale"].value = 1.0;
    uniforms["dtScale"].value = layerTransparency;
    uniforms["finalGamma"].value = 4.5;
    uniforms["volumeCount"].value = textures.length;
    uniforms["u_size"].value.set(volume.xLength, volume.yLength, volume.zLength);
    uniforms["u_cmdata"].value = cmTextures[volConfig.colormap];
    uniforms["u_stop_geom"].value = null;
    uniforms["u_window_size"].value.set(0, 0);
    //Normalize by the largest side and then address the phsyical dimension TODO change
    uniforms["u_vol_scale"].value.set(1.0 / volume.xLength, 1.0 / volume.yLength, 1.0 / volume.zLength * 2.0);
    uniforms["u_renderstyle"].value = renderstyle;

    uniforms["u_clim"].value.set(contrastLimits.length > 0 ? contrastLimits[0][0] : null, contrastLimits.length > 0 ? contrastLimits[0][1] : null);
    uniforms["u_clim2"].value.set(contrastLimits.length > 1 ? contrastLimits[1][0] : null, contrastLimits.length > 1 ? contrastLimits[1][1] : null);
    uniforms["u_clim3"].value.set(contrastLimits.length > 2 ? contrastLimits[2][0] : null, contrastLimits.length > 2 ? contrastLimits[2][1] : null);
    uniforms["u_clim4"].value.set(contrastLimits.length > 3 ? contrastLimits[3][0] : null, contrastLimits.length > 3 ? contrastLimits[3][1] : null);
    uniforms["u_clim5"].value.set(contrastLimits.length > 4 ? contrastLimits[4][0] : null, contrastLimits.length > 4 ? contrastLimits[4][1] : null);
    uniforms["u_clim6"].value.set(contrastLimits.length > 5 ? contrastLimits[5][0] : null, contrastLimits.length > 5 ? contrastLimits[5][1] : null);

    // console.log(xSlice[0], xSlice[1])
    uniforms["u_xClip"].value.set(xSlice[0] * (1.0 / meshScale[0]) / originalScale[0] * volume.xLength,
        xSlice[1] * (1.0 / meshScale[0]) / originalScale[0] * volume.xLength);
    uniforms["u_yClip"].value.set(ySlice[0] * (1.0 / meshScale[1]) / originalScale[1] * volume.yLength,
        ySlice[1] * (1.0 / meshScale[1]) / originalScale[1] * volume.yLength);
    uniforms["u_zClip"].value.set(zSlice[0] * (1.0 / meshScale[2]) / originalScale[2] * volume.zLength,
        zSlice[1] * (1.0 / meshScale[1]) / originalScale[2] * volume.zLength);

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

// Used as Loading indicator
function Box(props) {
    const ref = useRef()
    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => {
        if (props.moving) {
            ref.current.rotation.x += delta;
            ref.current.rotation.y += delta;
        }
    })
    return (
        <mesh
            {...props}
            ref={ref}>
            <torusKnotGeometry args={[14, 6, 176, 16]}/>
            <meshPhongMaterial color={props.color}/>
        </mesh>
    );
}

const SpatialWrapper = forwardRef((props, deckRef) => {
    return <div id="ThreeJs" style={{width: "100%", height: "100%"}}>
        <ARButton sessionInit={{optionalFeatures: ["hand-tracking"]}}/>
        <Canvas camera={{fov: 45, up: [0, 1, 0], position: [0, 0, -800], near: 0.1, far: 3000}}
                gl={{antialias: true, logarithmicDepthBuffer: true}}>
            <XR>
                <SpatialThree {...props} deckRef={deckRef}/>
            </XR>
        </Canvas>
    </div>
});
export default SpatialWrapper;
