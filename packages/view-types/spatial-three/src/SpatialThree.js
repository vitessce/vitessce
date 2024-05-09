/* eslint-disable max-len */
/* eslint-disable no-bitwise */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
import React, { useRef, useState, useEffect } from 'react';
import { OrbitControls, Text } from '@react-three/drei';
import { Controllers, Hands } from '@react-three/xr';
import {
  Scene,
  Group,
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  MeshStandardMaterial,
  BackSide,
  FrontSide,
} from 'three';
import { HandBbox } from './xr/HandBbox.js';
import { GeometryAndMesh } from './GeometryAndMesh.js';
import { HandDecorate } from './xr/HandDecorate.js';
import {
  useVolumeSettings,
  create3DRendering,
  initialDataLoading,
} from './three-utils.js';


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
export function SpatialThree(props) {
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
    onEntitySelected,
    segmentationLayerCoordination,
    segmentationChannelCoordination,
    segmentationChannelScopesByLayer,
  } = props;
  let setObsHighlightFct = () => {}; // no-op
  // TODO: use a more descriptive name.
  const setsSave = [];
  if (segmentationChannelCoordination[0][layerScope] !== undefined) {
    const segmentationObsSetLayerProps = segmentationChannelCoordination[0][layerScope][layerScope];
    const { setObsHighlight } = segmentationChannelCoordination[1][layerScope][layerScope];
    setObsHighlightFct = setObsHighlight;
    const sets = segmentationChannelCoordination[0][layerScope][layerScope].additionalObsSets;
    if (sets !== null) {
      segmentationObsSetLayerProps.obsSetSelection.forEach((obsSetPath) => {
        // TODO: this is not considering the full obsSetPath.
        const selectedElement = obsSetPath[1];
        // TODO: this is only considering the first set grouping in the tree.
        // TODO: use sets-utils to traverse sets tree
        sets.tree[0].children.forEach((child) => {
          if (child.name === selectedElement) {
            child.set.forEach(([obsId]) => {
              const info = { name: '', id: '', color: [255, 255, 255] };
              info.name = selectedElement;
              info.id = obsId;
              segmentationObsSetLayerProps.obsSetColor.forEach((color) => {
                if (color.path[1] === selectedElement) {
                  info.color = color.color;
                }
              });
              setsSave.push(info);
            });
          }
        });
      });
    }
    if (segmentationObsSetLayerProps.obsHighlight !== null) {
      setsSave.push({ name: '', id: segmentationObsSetLayerProps.obsHighlight, color: [255, 34, 0] });
    }
  }
  if (obsSegmentations?.[layerScope]?.obsSegmentations && segmentationGroup == null) {
    const { scene, sceneOptions } = obsSegmentations[layerScope].obsSegmentations;
    if (scene?.children) {
      // TODO: can all of this scene modification all be moved to the loader?
      const newScene = new Scene();
      const finalPass = new Group();
      finalPass.userData.name = 'finalPass';
      scene.children.forEach((child) => {
        let childElement = child;
        if (childElement.material === undefined) {
          // eslint-disable-next-line prefer-destructuring
          childElement = child.children[0];
        }
        if (
          childElement.material instanceof MeshPhysicalMaterial
          || childElement.material instanceof MeshBasicMaterial
        ) {
          childElement.material = new MeshStandardMaterial();
        }
        let name = childElement.name.replace('mesh_', '').replace('mesh', '').replace('glb', '').replace('_dec', '')
          .replace('_Decobj', '')
          .replace('obj', '')
          .replace('_DEc', '')
          .replace('.', '')
          .replace('_Dec', '');
        if (name.includes('_')) {
          // eslint-disable-next-line prefer-destructuring
          name = name.split('_')[0];
        }
        childElement.name = name;
        childElement.userData.name = name;
        childElement.userData.layerScope = layerScope;
        childElement.material.transparent = true;
        childElement.material.writeDepthTexture = true;
        childElement.material.depthTest = true;
        childElement.material.depthWrite = true;
        childElement.material.needsUpdate = true;
        childElement.material.side = sceneOptions?.materialSide === 'back'
          ? BackSide : FrontSide;

        const simplified = childElement.clone();
        simplified.geometry = childElement.geometry.clone();
        simplified.geometry.translate(
          sceneOptions?.targetX ?? 0,
          sceneOptions?.targetY ?? 0,
          sceneOptions?.targetZ ?? 0,
        );
        simplified.geometry.scale(
          sceneOptions?.scaleX ?? 1.0,
          sceneOptions?.scaleY ?? 1.0,
          sceneOptions?.scaleZ ?? 1.0,
        );
        simplified.geometry.rotateX(sceneOptions?.rotationX ?? 0);
        simplified.geometry.rotateY(sceneOptions?.rotationY ?? 0);
        simplified.geometry.rotateZ(sceneOptions?.rotationZ ?? 0);

        const finalPassChild = childElement.clone();
        finalPassChild.material = childElement.material.clone();
        finalPassChild.geometry = simplified.geometry.clone();
        finalPass.add(finalPassChild);
      });
      newScene.add(finalPass);
      newScene.scale.set(
        sceneOptions?.sceneScaleX ?? 1.0,
        sceneOptions?.sceneScaleY ?? 1.0,
        sceneOptions?.sceneScaleZ ?? 1.0,
      );
      const sceneScale = [
        sceneOptions?.sceneScaleX ?? 1.0,
        sceneOptions?.sceneScaleY ?? 1.0,
        sceneOptions?.sceneScaleZ ?? 1.0,
      ];
      setSegmentationSceneScale(sceneScale);
      newScene.rotateX(sceneOptions?.sceneRotationX ?? 0.0);
      newScene.rotateY(sceneOptions?.sceneRotationY ?? 0.0);
      newScene.rotateZ(sceneOptions?.sceneRotationZ ?? 0.0);
      setSegmentationGroup(newScene);
    }
  }
  if (segmentationChannelCoordination[0] !== undefined && segmentationChannelCoordination[0][layerScope] !== undefined) {
    const segmentationLayerProps = segmentationChannelCoordination[0][layerScope][layerScope];
    // TODO: stop using string equality for comparisons.
    let setsSaveString = '';
    setsSave.forEach((child) => {
      setsSaveString += `${child.id};${child.color.toString()};${child.name}`;
    });
    // TODO: stop using string equality for comparisons.
    let settingsSaveString = '';
    segmentationSettings.obsSets.forEach((child) => {
      settingsSaveString += `${child.id};${child.color.toString()};${child.name}`;
    });

    // Check the MultiChannel Setting - combine all channels and see if something changed
    if (segmentationChannelScopesByLayer[layerScope].length > 1) {
      let color = '';
      let opacity = '';
      let visible = '';
      let visibleCombined = false;
      let opacityCombined = 0.0;

      segmentationChannelScopesByLayer[layerScope].forEach((channelScope) => {
        const channelSet = segmentationChannelCoordination[0][layerScope][channelScope];
        // TODO: stop using string equality for comparisons.
        color += `${channelSet.spatialChannelColor.toString()};`;
        opacity += `${channelSet.spatialChannelOpacity};`;
        visible += `${channelSet.spatialChannelVisible};`;
        visibleCombined |= channelSet.spatialChannelVisible;
        opacityCombined += channelSet.spatialChannelOpacity;
      });
      if (
        color !== segmentationSettings.multiColor
        || opacity !== segmentationSettings.multiOpacity
        || visible !== segmentationSettings.multiVisible
      ) {
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
      // TODO: stop using string equality for comparisons.
    } else if (
      segmentationLayerProps.spatialChannelColor.toString() !== segmentationSettings.color.toString()
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
      let firstGroupIndex = 0;
      let finalGroupIndex = 0;
      for (let i = 0; i < segmentationGroup.children.length; i++) {
        if (segmentationGroup.children[i].userData.name === 'finalPass') {
          finalGroupIndex = i;
        } else {
          firstGroupIndex = i;
        }
      }

      // TODO: Adapt so it can also work with union sets
      segmentationGroup.children[finalGroupIndex].children.forEach((child, childIndex) => {
        let { color } = segmentationSettings;
        const id = child.userData.name;

        // SET SELECTION
        segmentationSettings.obsSets.forEach((obsSet) => {
          if (obsSet.id === id) {
            // eslint-disable-next-line prefer-destructuring
            color = obsSet.color;
          }
        });
        // CHECK IF Multiple Scopes:
        if (segmentationChannelScopesByLayer[layerScope].length > 1) {
          segmentationChannelScopesByLayer[layerScope].forEach((channelScope) => {
            const channelSet = segmentationChannelCoordination[0][layerScope][channelScope];
            if (channelSet.spatialTargetC === id) {
              // eslint-disable-next-line no-param-reassign
              child.material.color.r = channelSet.spatialChannelColor[0] / 255;
              // eslint-disable-next-line no-param-reassign
              child.material.color.g = channelSet.spatialChannelColor[1] / 255;
              // eslint-disable-next-line no-param-reassign
              child.material.color.b = channelSet.spatialChannelColor[2] / 255;
              // eslint-disable-next-line no-param-reassign
              child.material.opacity = channelSet.spatialChannelOpacity;
              // eslint-disable-next-line no-param-reassign
              child.visible = channelSet.spatialChannelVisible;
              // eslint-disable-next-line no-param-reassign
              child.material.needsUpdate = true;
              // eslint-disable-next-line no-param-reassign
              child.userData.layerScope = layerScope;
              // eslint-disable-next-line no-param-reassign
              child.userData.channelScope = channelScope;
              segmentationGroup.children[firstGroupIndex].children[childIndex].material.needsUpdate = true;
            }
          });
        } else {
          // TODO: is this else clause needed anymore?
          // adapt the color
          // eslint-disable-next-line no-param-reassign
          child.material.color.r = color[0] / 255;
          // eslint-disable-next-line no-param-reassign
          child.material.color.g = color[1] / 255;
          // eslint-disable-next-line no-param-reassign
          child.material.color.b = color[2] / 255;
          // Select the FinalPass Group
          // eslint-disable-next-line no-param-reassign
          child.material.opacity = segmentationSettings.opacity;
          // eslint-disable-next-line no-param-reassign
          child.material.visible = segmentationSettings.visible;
          // eslint-disable-next-line no-param-reassign
          child.material.needsUpdate = true;
          // eslint-disable-next-line no-param-reassign
          child.userData.layerScope = layerScope;
          const firstChannelScope = Object.keys(segmentationChannelCoordination[0][layerScope])?.[0];
          // eslint-disable-next-line no-param-reassign
          child.userData.channelScope = firstChannelScope;
        }
      });
    }
  }, [segmentationSettings, segmentationGroup]);


  // 1st Rendering Pass Load the Data in the given resolution OR Resolution Changed
  const dataToCheck = images[layerScope]?.image?.instance?.getData();
  if (
    dataToCheck !== undefined && !dataReady && !initialStartup
    && contrastLimits !== null && contrastLimits[0][1] !== 255 && is3dMode
  ) {
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
        if (!renderingSettings.uniforms || !renderingSettings.shader) {
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
      if (resolution !== volumeSettings.resolution && materialRef.current) {
        materialRef.current.material.uniforms.volumeCount.value = 0;
        materialRef.current.material.uniforms.volumeTex.value = null;
      }
      fetchRendering();
      setDataReady(false);
    }
  }, [dataReady]);


  // 2nd Rendering Pass Check if the Props Changed (except the resolution)
  useEffect(() => {
    if (renderingSettings.uniforms && renderingSettings.shader) {
      const rendering = create3DRendering(volumeData.volumes, volumeSettings.channelTargetC,
        volumeSettings.channelsVisible, volumeSettings.colors, volumeData.textures,
        volumeSettings.contrastLimits, volumeData.volumeMinMax, volumeData.scale, volumeSettings.renderingMode,
        volumeSettings.layerTransparency, volumeSettings.xSlice, volumeSettings.ySlice, volumeSettings.zSlice,
        volumeData.originalScale);
      if (rendering !== null) {
        let volumeCount = 0;
        // TODO: change to reducer?
        volumeSettings.channelsVisible.forEach((channelVisible) => {
          if (channelVisible) volumeCount++;
        });
        setDataReady(false);
        if (materialRef?.current?.material?.uniforms) {
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
      } else if (materialRef?.current?.material?.uniforms) {
        materialRef.current.material.uniforms.volumeCount.value = 0;
        materialRef.current.material.uniforms.volumeTex.value = null;
      }
    }
  }, [volumeSettings]);

  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  if (!volumeSettings.is3dMode) {
    return null;
  }

  if (volumeSettings.is3dMode && (!renderingSettings.uniforms || !renderingSettings.shader)) {
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
    highlightEntity: onEntitySelected,
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
}
