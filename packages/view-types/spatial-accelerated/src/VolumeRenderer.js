// setup THREE
// query data from volume data manager
// store render constants from view layer coordination
// reference shaders from here
// manage uniforms?

// take in input from volumeDataManager: chache, mapping

// manage the parameters for the shader (uniforms, cameradata etc.)


/* VolumeRenderer.js
 *
 * Minimal React Three Fiber component that:
 * 1) Manages volume rendering state (channels, resolution, etc.).
 * 2) Loads data via your three-utils and sets shader uniforms.
 * 3) Returns a single box-geometry mesh with your volume-shader material.
 * 4) Adds OrbitControls for navigation.
 *
 */

import React, {
  useRef, useState, useEffect,
} from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Imports from your code.
import {
  useVolumeSettings, // Extracts channel, resolution, etc. from props
  create3DRendering, // Creates uniforms/shader for the volume
  initialDataLoading, // Loads volume data from your source
} from './three-utils.js';

// Example: If your data sources pass in segmentation or other props, ignore them here.
export function VolumeRenderer(props) {
  // Grab the gl context, scene, camera from R3F.
  const { gl } = useThree();

  // Local references to update the volume's material.
  const materialRef = useRef(null);
  const orbitRef = useRef(null);

  // Local state for volume data (caches, textures, minMax).
  const [volumeData, setVolumeData] = useState({
    volumes: new Map(),
    textures: new Map(),
    volumeMinMax: new Map(),
    scale: null,
    resolution: null,
    originalScale: null,
  });

  // Storing the final rendering settings (uniforms, shader, geometry sizes, etc.).
  const [renderingSettings, setRenderingSettings] = useState({
    uniforms: null,
    shader: null,
    meshScale: null,
    geometrySize: null,
    boxSize: null,
  });

  // Storing volume settings from the prop-based hooks (ex: channels, resolution, etc.).
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
    xSlice: null,
    ySlice: null,
    zSlice: null,
  });

  // Flag controlling when to trigger data loads vs. updating existing textures.
  const [dataReady, setDataReady] = useState(false);
  const [initialStartup, setInitialStartup] = useState(false);

  // 1 Use hook to parse out volume-related props from the parent (like channels, resolution, etc.).
  // This populates or updates the local volumeSettings if something changes.
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

  // 2) On first mount or whenever new data is discovered, set dataReady to true.
  //    In the original code you waited for contrastLimits to become non-default as well.
  useEffect(() => {
    const dataToCheck = images[layerScope]?.image?.instance?.getData();
    if (
      dataToCheck
      && !dataReady
      && !initialStartup
      && contrastLimits?.[0]?.[1] !== 255
      && is3dMode
    ) {
      setDataReady(true);
      setInitialStartup(true);
    }
  }, [
    images, layerScope, dataReady, initialStartup, contrastLimits, is3dMode,
  ]);

  // 3) If dataReady is set (meaning new resolution or new channels),
  //    fetch or build the 3D textures, then store them in volumeData.
  useEffect(() => {
    const fetchRendering = async () => {
      // initialDataLoading loads volumes, textures, etc. for the given channels+resolution
      const loadingResult = await initialDataLoading(
        channelTargetC,
        resolution,
        data,
        volumeData.volumes,
        volumeData.textures,
        volumeData.volumeMinMax,
        volumeData.resolution,
      );
        // [volumes, textures, volumeMinMax, scale, originalScale]
      if (loadingResult[0] !== null) {
        setVolumeData({
          resolution,
          volumes: loadingResult[0],
          textures: loadingResult[1],
          volumeMinMax: loadingResult[2],
          scale: loadingResult[3] ?? volumeData.scale,
          originalScale: loadingResult[4],
        });
        // If we have no existing uniforms/shader, create them now:
        if (!renderingSettings.uniforms || !renderingSettings.shader) {
          const rendering = create3DRendering(
            loadingResult[0], // volumes
            channelTargetC, // which channels
            channelsVisible,
            colors,
            loadingResult[1], // textures
            contrastLimits,
            loadingResult[2], // volumeMinMax
            loadingResult[3], // scale
            renderingMode,
            layerTransparency,
            xSlice, ySlice, zSlice,
            loadingResult[4], // originalScale
          );
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
          // We already have a shader, so just let the next effect update its uniforms:
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
      // In your old code, you set volumeTex to null if resolution changed:
      if (resolution !== volumeSettings.resolution && materialRef.current) {
        materialRef.current.material.uniforms.volumeCount.value = 0;
        materialRef.current.material.uniforms.volumeTex.value = null;
      }
      fetchRendering();
      setDataReady(false);
    }
  }, [
    dataReady, resolution, volumeSettings.resolution,
    channelTargetC, volumeData, renderingSettings,
    channelsVisible, colors, contrastLimits,
    renderingMode, layerTransparency,
    xSlice, ySlice, zSlice, data, allChannels, is3dMode,
  ]);

  // 4) After we have renderingSettings set up, whenever volumeSettings changes
  //    (same resolution, but maybe new contrast or channel toggles), update uniforms.
  useEffect(() => {
    if (renderingSettings.uniforms && renderingSettings.shader) {
      const rendering = create3DRendering(
        volumeData.volumes,
        volumeSettings.channelTargetC,
        volumeSettings.channelsVisible,
        volumeSettings.colors,
        volumeData.textures,
        volumeSettings.contrastLimits,
        volumeData.volumeMinMax,
        volumeData.scale,
        volumeSettings.renderingMode,
        volumeSettings.layerTransparency,
        volumeSettings.xSlice,
        volumeSettings.ySlice,
        volumeSettings.zSlice,
        volumeData.originalScale,
      );

      if (rendering !== null && materialRef?.current?.material?.uniforms) {
        // Copy the newly computed uniform values to the existing material
        const matUniforms = materialRef.current.material.uniforms;
        matUniforms.u_clim.value = rendering[0].u_clim.value;
        matUniforms.u_clim2.value = rendering[0].u_clim2.value;
        matUniforms.u_clim3.value = rendering[0].u_clim3.value;
        matUniforms.u_clim4.value = rendering[0].u_clim4.value;
        matUniforms.u_clim5.value = rendering[0].u_clim5.value;
        matUniforms.u_clim6.value = rendering[0].u_clim6.value;

        matUniforms.u_xClip.value = rendering[0].u_xClip.value;
        matUniforms.u_yClip.value = rendering[0].u_yClip.value;
        matUniforms.u_zClip.value = rendering[0].u_zClip.value;

        matUniforms.u_color.value = rendering[0].u_color.value;
        matUniforms.u_color2.value = rendering[0].u_color2.value;
        matUniforms.u_color3.value = rendering[0].u_color3.value;
        matUniforms.u_color4.value = rendering[0].u_color4.value;
        matUniforms.u_color5.value = rendering[0].u_color5.value;
        matUniforms.u_color6.value = rendering[0].u_color6.value;

        matUniforms.volumeTex.value = rendering[0].volumeTex.value;
        matUniforms.volumeTex2.value = rendering[0].volumeTex2.value;
        matUniforms.volumeTex3.value = rendering[0].volumeTex3.value;
        matUniforms.volumeTex4.value = rendering[0].volumeTex4.value;
        matUniforms.volumeTex5.value = rendering[0].volumeTex5.value;
        matUniforms.volumeTex6.value = rendering[0].volumeTex6.value;

        matUniforms.volumeCount.value = rendering[0].volumeCount.value;
        matUniforms.u_renderstyle.value = volumeSettings.renderingMode;
        matUniforms.dtScale.value = volumeSettings.layerTransparency;
      } else if (materialRef?.current?.material?.uniforms) {
        // If no rendering or channels are empty
        materialRef.current.material.uniforms.volumeCount.value = 0;
        materialRef.current.material.uniforms.volumeTex.value = null;
      }
    }
  }, [volumeSettings, renderingSettings, volumeData]);

  // 5) Return the final group with a single box mesh + orbit controls.
  //    This is the "no XR" version: just the volume box you want.
  if (!volumeSettings.is3dMode) {
    return null; // If the user switched to 2D mode, hide it or remove it
  }

  if (!renderingSettings.uniforms || !renderingSettings.shader) {
    // Show a simple fallback while loading
    return (
      <group>
        <mesh>
          <OrbitControls />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <OrbitControls ref={orbitRef} />
      <mesh
        ref={materialRef}
        scale={renderingSettings.meshScale ?? [1, 1, 1]}
      >
        <boxGeometry args={renderingSettings.geometrySize ?? [1, 1, 1]} />
        <shaderMaterial
          customProgramCacheKey={() => 'volumeRenderer'}
          side={THREE.BackSide}
          uniforms={renderingSettings.uniforms}
          needsUpdate
          transparent
          vertexShader={renderingSettings.shader.vertexShader}
          fragmentShader={renderingSettings.shader.fragmentShader}
        />
      </mesh>
    </group>
  );
}
