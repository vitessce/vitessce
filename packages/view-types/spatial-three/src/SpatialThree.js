/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import React, { useRef, useState, forwardRef, useEffect } from 'react';
import { Canvas, } from '@react-three/fiber';
import {
  OrbitControls,
  Bvh,
  Text,
} from '@react-three/drei';
import { XRButton, XR, Controllers, Hands } from '@react-three/xr';
import { isEqual } from 'lodash-es';
import { filterSelection } from '@vitessce/spatial-utils';
import { CoordinationType } from '@vitessce/constants-internal';
import { viv } from '@vitessce/gl';
import * as THREE from 'three';
import { getLayerLoaderTuple } from './utils.js';
import { Volume } from './Volume.js';
import { VolumeRenderShaderPerspective } from './VolumeShaderPerspective.js';
import { HandBbox } from './xr/HandBbox.js';
import { GeometryAndMesh } from './GeometryAndMesh.js';
import { HandDecorate } from './xr/HandDecorate.js';

/**
 * React component which expresses the spatial relationships between cells and molecules using ThreeJS
 * @param {object} props
 * @param {string} props.uuid A unique identifier for this component,
 * used to determine when to show tooltips vs. crosshairs.
 * @param {number} props.height Height of the canvas, used when
 * rendering the scale bar layer.
 * @param {number} props.width Width of the canvas, used when
 * rendering the scale bar layer.
 * @param {object} props.molecules Molecules data.
 * @param {object} props.cells Cells data.
 * @param {object} props.neighborhoods Neighborhoods data.
 * @param {number} props.lineWidthScale Width of cell border in view space (deck.gl).
 * @param {number} props.lineWidthMaxPixels Max width of the cell border in pixels (deck.gl).
 * @param {object} props.cellColors Map from cell IDs to colors [r, g, b].
 * @param {function} props.getCellCoords Getter function for cell coordinates
 * (used by the selection layer).
 * @param {function} props.getCellColor Getter function for cell color as [r, g, b] array.
 * @param {function} props.getCellPolygon Getter function for cell polygons.
 * @param {function} props.getCellIsSelected Getter function for cell layer isSelected.
 * @param {function} props.getMoleculeColor
 * @param {function} props.getMoleculePosition
 * @param {function} props.getNeighborhoodPolygon
 * @param {function} props.updateViewInfo Handler for viewport updates, used when rendering tooltips and crosshairs.
 * @param {function} props.onCellClick Getter function for cell layer onClick.
 * @param {string} props.theme "light" or "dark" for the vitessce theme
 */
function SpatialThree(props) {
  const materialRef = useRef(null);
  const orbitRef = useRef(null);
  const [initialStartup, setInitialStartup] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [segmentationGroup, setSegmentationGroup] = useState(null);
  const [segmentationSceneScale, setSegmentationSceneScale] = useState([1.0, 1.0, 1.0]);
  // Storing rendering settings
  const [renderingSettings, setRenderingSettings] = useState({
    uniforms: null,
    shader: null,
    meshScale: null,
    geometrySize: null,
    boxSize: null,
  });
    // Capturing the volumetric data to reuse when only settings are changing
  const [volumeData, setVolumeData] = useState({
    volumes: new Map(),
    textures: new Map(),
    volumeMinMax: new Map(),
    scale: null,
    resolution: null,
    originalScale: null,
  });
    // Storing Volume Settings to compare them to a settings state change
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
    // Storing Segmentation Settings to compare them to a settings state change
  const [segmentationSettings, setSegmentationSettings] = useState({
    visible: true,
    color: [1, 1, 1],
    opacity: 1,
    multiVisible: '',
    multiOpacity: '',
    multiColor: '',
    data: null,
    obsSets: [],
  });

  const {
    images,
    layerScope,
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
    zSlice,
  } = useVolumeSettings(props, volumeSettings, setVolumeSettings, dataReady, setDataReady);

  const {
    obsSegmentations,
    onGlomSelected,
  } = props;
  let segmentationLayerCoordination; let
    segmentationChannelCoordination;
  segmentationLayerCoordination = props.segmentationLayerCoordination;
  segmentationChannelCoordination = props.segmentationChannelCoordination;
  let setObsHighlightFct = (id) => {
  };
  const setsSave = [];
  if (segmentationChannelCoordination[0][layerScope] !== undefined) {
    const segmentationOBSSetLayerProps = segmentationChannelCoordination[0][layerScope][layerScope];
    const { setObsHighlight } = segmentationChannelCoordination[1][layerScope][layerScope];
    setObsHighlightFct = setObsHighlight;
    const sets = segmentationChannelCoordination[0][layerScope][layerScope].additionalObsSets;
    if (sets !== null) {
      for (const index in segmentationOBSSetLayerProps.obsSetSelection) {
        const selectedElement = segmentationOBSSetLayerProps.obsSetSelection[index][1];
        for (const subIndex in sets.tree[0].children) {
          const child = sets.tree[0].children[subIndex];
          if (child.name === selectedElement) {
            for (const elem in child.set) {
              const info = { name: '', id: '', color: [] };
              info.name = selectedElement;
              info.id = child.set[elem][0];
              for (const subIndexColor in segmentationOBSSetLayerProps.obsSetColor) {
                const color = segmentationOBSSetLayerProps.obsSetColor[subIndexColor];
                if (color.path[1] === selectedElement) {
                  info.color = color.color;
                }
              }
              setsSave.push(info);
            }
          }
        }
      }
    }
    if (segmentationOBSSetLayerProps.obsHighlight !== null) {
      setsSave.push({ name: '', id: segmentationOBSSetLayerProps.obsHighlight, color: [255, 34, 0] });
    }
  }
  if (obsSegmentations[layerScope] !== undefined && segmentationGroup == null) {
    const { scene } = obsSegmentations[layerScope].obsSegmentations;
    if (scene !== null && scene !== undefined) {
      const newScene = new THREE.Scene();
      const finalPass = new THREE.Group();
      finalPass.userData.name = 'finalPass';
      for (const child in scene.children) {
        let childElement = scene.children[child];
        if (childElement.material === undefined) {
          childElement = scene.children[child].children[0];
        }
        if (childElement.material instanceof THREE.MeshPhysicalMaterial
                    || childElement.material instanceof THREE.MeshBasicMaterial) {
          childElement.material = new THREE.MeshStandardMaterial();
        }
        let name = childElement.name.replace('mesh_', '').replace('mesh', '').replace('glb', '').replace('_dec', '')
          .replace('_Decobj', '')
          .replace('obj', '')
          .replace('_DEc', '')
          .replace('.', '')
          .replace('_Dec', '');
        if (name.includes('_')) {
          name = name.split('_')[0];
        }
        childElement.name = name;
        childElement.userData.name = name;
        childElement.material.transparent = true;
        childElement.material.writeDepthTexture = true;
        childElement.material.depthTest = true;
        childElement.material.depthWrite = true;
        childElement.material.needsUpdate = true;
        childElement.material.side = segmentationLayerCoordination[0][layerScope].spatialMaterialBackside
          ? THREE.BackSide : THREE.FrontSide;

        const simplified = childElement.clone();
        simplified.geometry = childElement.geometry.clone();
        simplified.geometry.translate(segmentationLayerCoordination[0][layerScope].spatialTargetX ?? 0,
          segmentationLayerCoordination[0][layerScope].spatialTargetY ?? 0,
          segmentationLayerCoordination[0][layerScope].spatialTargetZ ?? 0);
        simplified.geometry.scale(
          segmentationLayerCoordination[0][layerScope].spatialScaleX ?? 1.0,
          segmentationLayerCoordination[0][layerScope].spatialScaleY ?? 1.0,
          segmentationLayerCoordination[0][layerScope].spatialScaleZ ?? 1.0,
        );
        simplified.geometry.rotateX(segmentationLayerCoordination[0][layerScope].spatialRotationX ?? 0);
        simplified.geometry.rotateY(segmentationLayerCoordination[0][layerScope].spatialRotationY ?? 0);
        simplified.geometry.rotateZ(segmentationLayerCoordination[0][layerScope].spatialRotationZ ?? 0);

        const finalPassChild = childElement.clone();
        finalPassChild.material = childElement.material.clone();
        finalPassChild.geometry = simplified.geometry.clone();
        finalPass.add(finalPassChild);
      }
      newScene.add(finalPass);
      newScene.scale.set(
        segmentationLayerCoordination[0][layerScope].spatialSceneScaleX ?? 1.0,
        segmentationLayerCoordination[0][layerScope].spatialSceneScaleY ?? 1.0,
        segmentationLayerCoordination[0][layerScope].spatialSceneScaleZ ?? 1.0,
      );
      const sceneScale = [segmentationLayerCoordination[0][layerScope].spatialSceneScaleX ?? 1.0,
        segmentationLayerCoordination[0][layerScope].spatialSceneScaleY ?? 1.0,
        segmentationLayerCoordination[0][layerScope].spatialSceneScaleZ ?? 1.0];
      setSegmentationSceneScale(sceneScale);
      newScene.rotateX(segmentationLayerCoordination[0][layerScope].spatialSceneRotationX ?? 0.0);
      newScene.rotateY(segmentationLayerCoordination[0][layerScope].spatialSceneRotationY ?? 0.0);
      newScene.rotateZ(segmentationLayerCoordination[0][layerScope].spatialSceneRotationZ ?? 0.0);
      setSegmentationGroup(newScene);
    }
  }
  if (segmentationChannelCoordination[0] !== undefined && segmentationChannelCoordination[0][layerScope] !== undefined) {
    const segmentationLayerProps = segmentationChannelCoordination[0][layerScope][layerScope];
    let setsSaveString = '';
    for (const child in setsSave) {
      setsSaveString += `${setsSave[child].id};${setsSave[child].color.toString()};${setsSave[child].name}`;
    }
    let settingsSaveString = '';
    for (const child in segmentationSettings.obsSets) {
      settingsSaveString += `${segmentationSettings.obsSets[child].id};${
        segmentationSettings.obsSets[child].color.toString()};${
        segmentationSettings.obsSets[child].name}`;
    }

    // Check the MultiChannel Setting - combine all channels and see if something changed
    if (props.segmentationChannelScopesByLayer[layerScope].length > 1) {
      let color = '';
      let opacity = '';
      let visible = '';
      let visibleCombined = false;
      let opacityCombined = 0.0;
      for (const scope in props.segmentationChannelScopesByLayer[layerScope]) {
        const channelScope = props.segmentationChannelScopesByLayer[layerScope][scope];
        const channelSet = segmentationChannelCoordination[0][layerScope][channelScope];
        color += `${channelSet.spatialChannelColor.toString()};`;
        opacity += `${channelSet.spatialChannelOpacity};`;
        visible += `${channelSet.spatialChannelVisible};`;
        visibleCombined |= channelSet.spatialChannelVisible;
        opacityCombined += channelSet.spatialChannelOpacity;
      }
      if (color !== segmentationSettings.multiColor
                || opacity !== segmentationSettings.multiOpacity
                || visible !== segmentationSettings.multiVisible) {
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
    } else if (segmentationLayerProps.spatialChannelColor.toString() !== segmentationSettings.color.toString()
                || segmentationLayerProps.spatialChannelVisible !== segmentationSettings.visible
                || segmentationLayerProps.spatialChannelOpacity !== segmentationSettings.opacity
                || setsSaveString !== settingsSaveString
    ) {
      setSegmentationSettings({
        color: segmentationLayerProps.spatialChannelColor,
        opacity: segmentationLayerProps.spatialChannelOpacity,
        visible: segmentationLayerProps.spatialChannelVisible,
        multiColor: '',
        multiVisible: '',
        multiOpacity: '',
        data: obsSegmentations,
        obsSets: setsSave,
      });
    }
  }

  useEffect(() => {
    if (segmentationGroup !== null) {
      let firstGroup = 0;
      let finalGroup = 0;
      for (const group in segmentationGroup.children) {
        if (segmentationGroup.children[group].userData.name === 'finalPass') {
          finalGroup = group;
        } else {
          firstGroup = group;
        }
      }

      // TODO: Adapt so it can also work with union sets
      for (const child in segmentationGroup.children[finalGroup].children) {
        let { color } = segmentationSettings;
        const id = segmentationGroup.children[finalGroup].children[child].userData.name;

        // SET SELECTION
        for (const index in segmentationSettings.obsSets) {
          if (segmentationSettings.obsSets[index].id === id) {
            color = segmentationSettings.obsSets[index].color;
          }
        }
        // CHECK IF Multiple Scopes:
        if (props.segmentationChannelScopesByLayer[layerScope].length > 1) {
          for (const scope in props.segmentationChannelScopesByLayer[layerScope]) {
            const channelScope = props.segmentationChannelScopesByLayer[layerScope][scope];
            const channelSet = segmentationChannelCoordination[0][layerScope][channelScope];
            if (channelSet.obsType === id) {
              segmentationGroup.children[finalGroup].children[child].material.color.r = channelSet.spatialChannelColor[0] / 255;
              segmentationGroup.children[finalGroup].children[child].material.color.g = channelSet.spatialChannelColor[1] / 255;
              segmentationGroup.children[finalGroup].children[child].material.color.b = channelSet.spatialChannelColor[2] / 255;
              segmentationGroup.children[finalGroup].children[child].material.opacity = channelSet.spatialChannelOpacity;
              segmentationGroup.children[finalGroup].children[child].visible = channelSet.spatialChannelVisible;
              segmentationGroup.children[finalGroup].children[child].material.needsUpdate = true;
              segmentationGroup.children[firstGroup].children[child].material.needsUpdate = true;
            }
          }
        } else {
          for (const child in segmentationGroup.children[finalGroup].children) {
            let { color } = segmentationSettings;
            const id = segmentationGroup.children[finalGroup].children[child].userData.name;
            for (const index in segmentationSettings.obsSets) {
              if (segmentationSettings.obsSets[index].id === id) {
                color = segmentationSettings.obsSets[index].color;
              }
            }
            // adapt the color
            segmentationGroup.children[finalGroup].children[child].material.color.r = color[0] / 255;
            segmentationGroup.children[finalGroup].children[child].material.color.g = color[1] / 255;
            segmentationGroup.children[finalGroup].children[child].material.color.b = color[2] / 255;
            // Select the FinalPass Group
            segmentationGroup.children[finalGroup].children[child].material.opacity = segmentationSettings.opacity;
            segmentationGroup.children[finalGroup].children[child].material.visible = segmentationSettings.visible;
            segmentationGroup.children[finalGroup].children[child].material.needsUpdate = true;
          }
        }
      }
    }
  }, [segmentationSettings, segmentationGroup]);


  // 1st Rendering Pass Load the Data in the given resolution OR Resolution Changed
  const dataToCheck = images[layerScope]?.image?.instance?.getData();
  if (dataToCheck !== undefined && !dataReady && !initialStartup
        && contrastLimits !== null && contrastLimits[0][1] !== 255 && is3dMode) {
    setDataReady(true);
    setInitialStartup(true);
  }

  // Only reload the mesh if the imageLayer changes (new data / new resolution, ...)
  useEffect(() => {
    const fetchRendering = async () => {
      const loadingResult = await initialDataLoading(channelTargetC, resolution, data,
        volumeData.volumes, volumeData.textures, volumeData.volumeMinMax, volumeData.resolution);
      if (loadingResult[0] !== null) { // New Data has been loaded
        setVolumeData({
          resolution,
          volumes: loadingResult[0],
          textures: loadingResult[1],
          volumeMinMax: loadingResult[2],
          scale: loadingResult[3] !== null ? loadingResult[3] : volumeData.scale,
          originalScale: loadingResult[4],
        });
        if (renderingSettings.uniforms === undefined || renderingSettings.uniforms === null
                    || renderingSettings.shader === undefined || renderingSettings.shader === null) {
          // JUST FOR THE INITIAL RENDERING
          const rendering = create3DRendering(loadingResult[0], channelTargetC, channelsVisible, colors,
            loadingResult[1], contrastLimits, loadingResult[2], loadingResult[3], renderingMode,
            layerTransparency, xSlice, ySlice, zSlice, loadingResult[4]);
          if (rendering !== null) {
            setRenderingSettings({
              uniforms: rendering[0],
              shader: rendering[1],
              meshScale: rendering[2],
              geometrySize: rendering[3],
              boxSize: rendering[4],
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
            zSlice,
          });
        }
      }
    };
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
    if (((renderingSettings.uniforms !== undefined && renderingSettings.uniforms !== null
            && renderingSettings.shader !== undefined && renderingSettings.shader !== null))) {
      const rendering = create3DRendering(volumeData.volumes, volumeSettings.channelTargetC,
        volumeSettings.channelsVisible, volumeSettings.colors, volumeData.textures,
        volumeSettings.contrastLimits, volumeData.volumeMinMax, volumeData.scale, volumeSettings.renderingMode,
        volumeSettings.layerTransparency, volumeSettings.xSlice, volumeSettings.ySlice, volumeSettings.zSlice,
        volumeData.originalScale);
      if (rendering !== null) {
        let volumeCount = 0;
        for (const elem in volumeSettings.channelsVisible) {
          if (volumeSettings.channelsVisible[elem]) volumeCount++;
        }
        setDataReady(false);
        if (materialRef !== undefined && materialRef.current !== null) {
          // Set the material uniforms
          materialRef.current.material.uniforms.u_clim.value = rendering[0].u_clim.value;
          materialRef.current.material.uniforms.u_clim2.value = rendering[0].u_clim2.value;
          materialRef.current.material.uniforms.u_clim3.value = rendering[0].u_clim3.value;
          materialRef.current.material.uniforms.u_clim4.value = rendering[0].u_clim4.value;
          materialRef.current.material.uniforms.u_clim5.value = rendering[0].u_clim5.value;
          materialRef.current.material.uniforms.u_clim6.value = rendering[0].u_clim6.value;

          materialRef.current.material.uniforms.u_xClip.value = rendering[0].u_xClip.value;
          materialRef.current.material.uniforms.u_yClip.value = rendering[0].u_yClip.value;
          materialRef.current.material.uniforms.u_zClip.value = rendering[0].u_zClip.value;

          materialRef.current.material.uniforms.u_color.value = rendering[0].u_color.value;
          materialRef.current.material.uniforms.u_color2.value = rendering[0].u_color2.value;
          materialRef.current.material.uniforms.u_color3.value = rendering[0].u_color3.value;
          materialRef.current.material.uniforms.u_color4.value = rendering[0].u_color4.value;
          materialRef.current.material.uniforms.u_color5.value = rendering[0].u_color5.value;
          materialRef.current.material.uniforms.u_color6.value = rendering[0].u_color6.value;
          materialRef.current.material.uniforms.volumeTex.value = rendering[0].volumeTex.value;
          materialRef.current.material.uniforms.volumeTex2.value = rendering[0].volumeTex2.value;
          materialRef.current.material.uniforms.volumeTex3.value = rendering[0].volumeTex3.value;
          materialRef.current.material.uniforms.volumeTex4.value = rendering[0].volumeTex4.value;
          materialRef.current.material.uniforms.volumeTex5.value = rendering[0].volumeTex5.value;
          materialRef.current.material.uniforms.volumeTex6.value = rendering[0].volumeTex6.value;
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
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Text color="white" scale={20} fontWeight={1000}>Only in 3D Mode</Text>
      </group>
    );
  }

  if (volumeSettings.is3dMode
        && (renderingSettings.uniforms === undefined || renderingSettings.uniforms === null
            || renderingSettings.shader === undefined || renderingSettings.shader === null)
  ) {
    return (
      <group>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Text color="white" scale={20} fontWeight={1000}>Loading ...</Text>
      </group>
    );
  }

  const geometryAndMeshProps = {
    segmentationGroup,
    segmentationSettings,
    segmentationSceneScale,
    renderingSettings,
    materialRef,
    highlightGlom: onGlomSelected,
    setObsHighlight: setObsHighlightFct,
  };
  return (
    <group>
      <Controllers />
      <Hands />
      <HandBbox />
      <HandDecorate />
      <GeometryAndMesh {...geometryAndMeshProps} />
      <OrbitControls
        ref={orbitRef}
        enableDamping={false}
        dampingFactor={0.0}
        zoomDampingFactor={0.0}
        smoothZoom={false}
      />
    </group>
  );
};

/**
 * Retrieving the volumetric settings from the props, comparing them to the prior settings
 * @param props
 * @param volumeSettings
 * @param setVolumeSettings
 * @param dataReady
 * @param setDataReady
 * @returns {{images: {}, data: (null|*), imageChannelCoordination,
 * channelTargetC: (null|(*|boolean)[]|*),
 * ySlice: *, contrastLimits: (null|number[][]|*),
 * is3dMode: boolean, zSlice: *, resolution: (null|*), colors: (null|number[][]|*),
 * allChannels: (null|*), layerTransparency: *, renderingMode: *, xSlice: *, layerScope: *,
 * imageChannelScopesByLayer, imageLayerCoordination, imageLayerScopes, channelsVisible: (null|(*|boolean)[]|*)}}
 */
function useVolumeSettings(props, volumeSettings, setVolumeSettings, dataReady, setDataReady) {
  // Everything that is props based should be useEffect with props as dependent so we can sideload the props
  const {
    images = {},
    imageLayerScopes,
    imageLayerCoordination,
    imageChannelScopesByLayer,
    imageChannelCoordination,
  } = props;
  const imageLayerLoaderSelections = useRef({});
  const layerScope = imageLayerScopes[0];
  const channelScopes = imageChannelScopesByLayer[layerScope];
  const layerCoordination = imageLayerCoordination[0][layerScope];
  const channelCoordination = imageChannelCoordination[0][layerScope];

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
    zSlice,
  } = extractInformationFromProps(layerScope, layerCoordination, channelScopes,
    channelCoordination, images[layerScope], props, imageLayerLoaderSelections.current);
  // TODO: Find a better and more efficient way to compare the Strings here
  if (channelTargetC !== null) {
    if (volumeSettings.channelTargetC.length !== 0
            && (volumeSettings.channelTargetC.toString() !== channelTargetC.toString()
                || volumeSettings.resolution.toString() !== resolution.toString())) {
      if (!dataReady) setDataReady(true);
    } else if (
      (volumeSettings.channelsVisible.toString() !== channelsVisible.toString()
                || volumeSettings.colors.toString() !== colors.toString()
                || volumeSettings.is3dMode !== is3dMode
                || volumeSettings.contrastLimits.toString() !== contrastLimits.toString()
                || volumeSettings.renderingMode.toString() !== renderingMode.toString()
                || volumeSettings.layerTransparency.toString() !== layerTransparency.toString()
                || volumeSettings.xSlice.toString() !== xSlice.toString()
                || volumeSettings.ySlice.toString() !== ySlice.toString()
                || volumeSettings.zSlice.toString() !== zSlice.toString()
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
        zSlice,
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
    zSlice,
  };
}



/**
 * Extracting relevant information from the properties for creating the ThreeJS Volume Viewer
 * @param layerScope
 * @param layerCoordination
 * @param channelScopes
 * @param channelCoordination
 * @param image
 * @param props
 * @param imageLayerLoaderSelection
 * @returns {{data: *, channelTargetC: ((*|boolean)[]|*), ySlice: (*|Vector2), contrastLimits: (number[][]|*),
 * is3dMode: boolean, zSlice: (*|Vector2), resolution: *, colors: (number[][]|*), allChannels: *, layerTransparency: *,
 * renderingMode: (number), xSlice: (*|Vector2), channelsVisible: ((*|boolean)[]|*)}|{allChannels: null, data: null,
 * channelTargetC: null, contrastLimits: null, resolution: null, colors: null, channelsVisible: null}}
 */
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
      channelTargetC: null,
    };
  }
  const imageWrapperInstance = image.image.instance;
  const is3dMode = spatialRenderingMode === '3D';
  const isRgb = layerCoordination[CoordinationType.PHOTOMETRIC_INTERPRETATION] === 'RGB';
  const [Layer, layerLoader] = getLayerLoaderTuple(data, is3dMode);
  const colormap = isRgb ? null : layerCoordination[CoordinationType.SPATIAL_LAYER_COLORMAP];
  let renderingMode = layerCoordination[CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM];
  renderingMode = renderingMode === 'maximumIntensityProjection' ? 0 : renderingMode === 'minimumIntensityProjection' ? 1 : 2;
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
  const resolution = (targetResolution === null || isNaN(targetResolution)) ? autoTargetResolution : targetResolution;
  const allChannels = image.image.loaders[0].channels;

  // Get the Clipping Planes
  let xSlice = layerCoordination[CoordinationType.SPATIAL_SLICE_X];
  let ySlice = layerCoordination[CoordinationType.SPATIAL_SLICE_Y];
  let zSlice = layerCoordination[CoordinationType.SPATIAL_SLICE_Z];

  xSlice = xSlice !== null ? xSlice : new THREE.Vector2(-1, 100000);
  ySlice = ySlice !== null ? ySlice : new THREE.Vector2(-1, 100000);
  zSlice = zSlice !== null ? zSlice : new THREE.Vector2(-1, 100000);

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
    zSlice,
  };
}

/**
 * Creates the initial volume rendering settings based on the given data
 * @param volumes          ... from Store
 * @param channelTargetC   ... given by UI
 * @param channelsVisible  ... given by UI
 * @param colors           ... given by UI
 * @param textures         ... from Store
 * @param contrastLimits   ... given by UI
 * @param volumeMinMax     ... from Store
 * @param scale            ... from Store
 */
function create3DRendering(volumes, channelTargetC, channelsVisible, colors, textures,
  contrastLimits, volumeMinMax, scale, renderstyle, layerTransparency,
  xSlice, ySlice, zSlice, originalScale) {
  const texturesList = [];
  const colorsSave = [];
  const contrastLimitsList = [];
  let volume = null;
  channelTargetC.forEach((channel, id) => { // load on demand new channels or load all there are?? - Check VIV for it
    if (channelsVisible[id]) { // check if the channel has been loaded already or if there should be a new load
      volume = volumes.get(channel);
      // set textures, set volume, contrastLimits, colors
      texturesList.push(textures.get(channel)); // Could be done better but for now we try this
      colorsSave.push([colors[id][0] / 255, colors[id][1] / 255, colors[id][2] / 255]);
      if (contrastLimits[id][0] === 0 && contrastLimits[id][1] === 255) { // Initial State TODO change??
        contrastLimitsList.push([getMinMaxValue(volumeMinMax.get(channel)[0], volumeMinMax.get(channel)),
          getMinMaxValue(volumeMinMax.get(channel)[1], volumeMinMax.get(channel))]);
      } else {
        contrastLimitsList.push([getMinMaxValue(contrastLimits[id][0], volumeMinMax.get(channel)),
          getMinMaxValue(contrastLimits[id][1], volumeMinMax.get(channel))]);
      }
    }
  });
  if (volume === null) {
    return null;
  }
  const volconfig = {
    clim1: 0.01,
    clim2: 0.7,
    isothreshold: 0.15,
    opacity: 1.0,
    colormap: 'gray',
  };
  const shader = VolumeRenderShaderPerspective;
  const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
  setUniformsTextures(uniforms, texturesList, volume, volconfig, renderstyle, contrastLimitsList, colorsSave, layerTransparency,
    xSlice, ySlice, zSlice, [scale[0].size, scale[1].size, scale[2] ? scale[2].size : 1.0], originalScale);
  return [uniforms, shader, [1, scale[1].size / scale[0].size, scale[2] ? scale[2].size / scale[0].size : 1.0], [volume.xLength, volume.yLength, volume.zLength],
    [1.0, volume.yLength / volume.xLength, volume.zLength / volume.xLength]];
}

/**
 * Function to load the volumetric data from the given data source
 * @param channelTargetC
 * @param resolution
 * @param data
 * @param volumes
 * @param textures
 * @param volumeMinMax
 * @param oldResolution
 * @returns {Promise<(*|*[])[]>}
 */
async function initialDataLoading(channelTargetC, resolution, data, volumes, textures, volumeMinMax, oldResolution) {
  let volume = null;
  let scale = null;
  const { shape, labels } = data[0];
  for(const channel of channelTargetC) { // load on demand new channels or load all there are?? - Check VIV for it
    if (!volumes.has(channel) || resolution !== oldResolution) {
      const volumeOrigin = await getVolumeByChannel(channel, resolution, data);
      volume = getVolumeFromOrigin(volumeOrigin);
      const minMax = volume.computeMinMax();
      volume.data = minMaxVolume(volume); // Have the data between 0 and 1
      volumes.set(channel, volume);
      textures.set(channel, getData3DTexture(volume));
      volumeMinMax.set(channel, minMax);
      scale = getPhysicalSizeScalingMatrix(data[resolution]);
    }
  }
  return [volumes, textures, volumeMinMax, scale,
    [shape[labels.indexOf('x')], shape[labels.indexOf('y')], shape[labels.indexOf('z')]]];
}

/**
 * Setting the uniform data for the volumetric rendering
 * @param uniforms
 * @param textures
 * @param volume
 * @param volConfig
 * @param renderstyle
 * @param contrastLimits
 * @param colors
 * @param layerTransparency
 * @param xSlice
 * @param ySlice
 * @param zSlice
 * @param meshScale
 * @param originalScale
 */
function setUniformsTextures(uniforms, textures, volume, volConfig, renderstyle, contrastLimits, colors, layerTransparency,
  xSlice, ySlice, zSlice, meshScale, originalScale) {
  uniforms.boxSize.value.set(volume.xLength, volume.yLength, volume.zLength);
  // can be done better
  uniforms.volumeTex.value = textures.length > 0 ? textures[0] : null;
  uniforms.volumeTex2.value = textures.length > 1 ? textures[1] : null;
  uniforms.volumeTex3.value = textures.length > 2 ? textures[2] : null;
  uniforms.volumeTex4.value = textures.length > 3 ? textures[3] : null;
  uniforms.volumeTex5.value = textures.length > 4 ? textures[4] : null;
  uniforms.volumeTex6.value = textures.length > 5 ? textures[5] : null;
  //
  uniforms.near.value = 0.1;
  uniforms.far.value = 3000;
  uniforms.alphaScale.value = 1.0;
  uniforms.dtScale.value = layerTransparency;
  uniforms.finalGamma.value = 4.5;
  uniforms.volumeCount.value = textures.length;
  uniforms.u_size.value.set(volume.xLength, volume.yLength, volume.zLength);
  uniforms.u_stop_geom.value = null;
  uniforms.u_window_size.value.set(0, 0);
  // Normalize by the largest side and then address the phsyical dimension TODO change
  uniforms.u_vol_scale.value.set(1.0 / volume.xLength, 1.0 / volume.yLength, 1.0 / volume.zLength * 2.0);
  uniforms.u_renderstyle.value = renderstyle;

  uniforms.u_clim.value.set(contrastLimits.length > 0 ? contrastLimits[0][0] : null, contrastLimits.length > 0 ? contrastLimits[0][1] : null);
  uniforms.u_clim2.value.set(contrastLimits.length > 1 ? contrastLimits[1][0] : null, contrastLimits.length > 1 ? contrastLimits[1][1] : null);
  uniforms.u_clim3.value.set(contrastLimits.length > 2 ? contrastLimits[2][0] : null, contrastLimits.length > 2 ? contrastLimits[2][1] : null);
  uniforms.u_clim4.value.set(contrastLimits.length > 3 ? contrastLimits[3][0] : null, contrastLimits.length > 3 ? contrastLimits[3][1] : null);
  uniforms.u_clim5.value.set(contrastLimits.length > 4 ? contrastLimits[4][0] : null, contrastLimits.length > 4 ? contrastLimits[4][1] : null);
  uniforms.u_clim6.value.set(contrastLimits.length > 5 ? contrastLimits[5][0] : null, contrastLimits.length > 5 ? contrastLimits[5][1] : null);


  uniforms.u_xClip.value.set(xSlice[0] * (1.0 / meshScale[0]) / originalScale[0] * volume.xLength,
    xSlice[1] * (1.0 / meshScale[0]) / originalScale[0] * volume.xLength);
  uniforms.u_yClip.value.set(ySlice[0] * (1.0 / meshScale[1]) / originalScale[1] * volume.yLength,
    ySlice[1] * (1.0 / meshScale[1]) / originalScale[1] * volume.yLength);
  uniforms.u_zClip.value.set(zSlice[0] * (1.0 / meshScale[2]) / originalScale[2] * volume.zLength,
    zSlice[1] * (1.0 / meshScale[1]) / originalScale[2] * volume.zLength);

  uniforms.u_color.value.set(colors.length > 0 ? colors[0][0] : null,
    colors.length > 0 ? colors[0][1] : null,
    colors.length > 0 ? colors[0][2] : null);
  uniforms.u_color2.value.set(colors.length > 1 ? colors[1][0] : null,
    colors.length > 1 ? colors[1][1] : null,
    colors.length > 1 ? colors[1][2] : null);
  uniforms.u_color3.value.set(colors.length > 2 ? colors[2][0] : null,
    colors.length > 2 ? colors[2][1] : null,
    colors.length > 2 ? colors[2][2] : null);
  uniforms.u_color4.value.set(colors.length > 3 ? colors[3][0] : null,
    colors.length > 3 ? colors[3][1] : null,
    colors.length > 3 ? colors[3][2] : null);
  uniforms.u_color5.value.set(colors.length > 4 ? colors[4][0] : null,
    colors.length > 4 ? colors[4][1] : null,
    colors.length > 4 ? colors[4][2] : null);
  uniforms.u_color6.value.set(colors.length > 5 ? colors[5][0] : null,
    colors.length > 5 ? colors[5][1] : null,
    colors.length > 5 ? colors[5][2] : null);
}

/**
 * Get physical size scaling Matrix4
 * @param {Object} loader PixelSource
 */
function getPhysicalSizeScalingMatrix(loader) {
  const { x, y, z } = loader?.meta?.physicalSizes ?? {};
  return [x, y, z];
}

async function getVolumeByChannel(channel, resolution, loader) {
  return getVolumeIntern({
    source: loader[resolution],
    selection: { t: 0, c: channel }, // corresponds to the first channel of the first timepoint
    downsampleDepth: 2 ** resolution,
  });
}

function minMaxVolume(volume) {
  // get the min and max intensities
  const min_max = volume.computeMinMax();
  const min = min_max[0];
  const max = min_max[1];

  const dataASFloat32 = new Float32Array(volume.data.length);
  for (let i = 0; i < volume.data.length; i++) {
    dataASFloat32[i] = (volume.data[i] - min) / Math.sqrt(Math.pow(max, 2) - Math.pow(min, 2));
  }
  return dataASFloat32;
}

function getVolumeFromOrigin(volumeOrigin) {
  const volume = new Volume();
  volume.xLength = volumeOrigin.width;
  volume.yLength = volumeOrigin.height;
  volume.zLength = volumeOrigin.depth;
  volume.data = volumeOrigin.data;
  return volume;
}

function getMinMaxValue(value, minMax) {
  const min = minMax[0];
  const max = minMax[1];
  return (value - min) / Math.sqrt(Math.pow(max, 2) - Math.pow(min, 2));
}

function getData3DTexture(volume) {
  const texture = new THREE.Data3DTexture(volume.data, volume.xLength, volume.yLength, volume.zLength);
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
  signal,
}) {
  const { shape, labels, dtype } = source;
  const { height, width } = viv.getImageSize(source);
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
        z: z * downsampleDepth,
      };
      const { data: rasterData } = await source.getRaster({
        selection: depthSelection,
        signal,
      });
      let r = 0;
      onUpdate({ z, total: depthDownsampled, progress: 0.5 });
      // For now this process fills in each raster plane anti-diagonally transposed.
      // This is to ensure that the image looks right in three dimensional space.
      while (r < rasterSize) {
        const volIndex = z * rasterSize + (rasterSize - r - 1);
        const rasterIndex = ((width - r - 1) % width) + width * Math.floor(r / width);
        volumeData[volIndex] = rasterData[rasterIndex];
        r += 1;
      }
      onUpdate({ z, total: depthDownsampled, progress: 1 });
    }),
  );
  return {
    data: volumeData,
    height,
    width,
    depth: depthDownsampled,
  };
}

const SpatialWrapper = forwardRef((props, deckRef) => (
  <div id="ThreeJs" style={{ width: '100%', height: '100%' }}>
    <XRButton
      mode="AR"
      sessionInit={{ optionalFeatures: ['hand-tracking'] }}
      style={{
        border: 'none',
        background: 'rgba(0, 0, 0, 0.0)',
      }}
    >
      {(status) => {
        if (status === 'unsupported') {
          return '';
        }
        return (
          <div style={{
            border: '1px solid white',
            padding: '12px 24px',
            borderRadius: '4px',
            background: 'rgba(0, 0, 0, 0.1)',
            color: 'white',
            font: 'normal 0.8125rem sans-serif',
            outline: 'none',
            cursor: 'pointer',
          }}
          >{(status === 'entered' ? 'Exit AR' : 'Enter AR')}
          </div>
        );
      }
            }
    </XRButton>
    <Canvas
      camera={{ fov: 50, up: [0, 1, 0], position: [0, 0, 800], near: 0.1, far: 3000 }}
      gl={{ antialias: true, logarithmicDepthBuffer: false }}
    >
      <XR>
        <SpatialThree {...props} deckRef={deckRef} />
      </XR>
    </Canvas>
  </div>
));
export default SpatialWrapper;
