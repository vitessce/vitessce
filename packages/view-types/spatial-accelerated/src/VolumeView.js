/**
 * VolumeView.js
 *
 * React Three Fiber component that renders a 3D volume using the
 * VolumeDataManager to load data and VolumeRenderManager to handle rendering.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import { VolumeDataManager } from './VolumeDataManager.js';
import { VolumeRenderManager } from './VolumeRenderManager.js';

export function VolumeView(props) {
  // Get access to the Three.js renderer
  const { gl } = useThree();

  // References to objects in the scene
  const materialRef = useRef(null);
  const orbitRef = useRef(null);
  const meshRef = useRef(null);
  const boxDimensionsRef = useRef([1, 1, 1]);

  // State for data and render managers
  const [managers, setManagers] = useState(null);
  const [rendering, setRendering] = useState({
    uniforms: null,
    shader: null,
    meshScale: [1, 1, 1],
    geometrySize: [1, 1, 1],
    boxSize: [1, 1, 1],
  });

  // State for zarr store info and device limits
  const [zarrStoreInfo, setZarrStoreInfo] = useState(null);
  const [deviceLimits, setDeviceLimits] = useState(null);

  // State for loading status
  const [isLoading, setIsLoading] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);

  // Track the last processed resolution to avoid infinite loops
  const [lastResolution, setLastResolution] = useState(null);
  const [lastChannelTargets, setLastChannelTargets] = useState([]);

  // Helper function to compare channel arrays
  function areChannelsEqual(channels1, channels2) {
    if (!channels1 || !channels2) return false;
    if (channels1.length !== channels2.length) return false;

    return channels1.every((channel, index) => channel === channels2[index]);
  }

  // Initialize managers on first render
  useEffect(() => {
    // Try to get the WebGL context safely
    let glContext;
    try {
      if (gl.getContext) {
        glContext = gl.getContext();
      } else if (gl.domElement) {
        glContext = gl.domElement.getContext('webgl2') || gl.domElement.getContext('webgl');
      } else if (gl.context) {
        glContext = gl.context;
      } else {
        // Last resort - use gl directly
        glContext = gl;
      }
    } catch (error) {
      glContext = null;
    }

    // Create the data and render managers
    const dataManager = new VolumeDataManager(
      'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/zarr_test/kingsnake_1c_32_z.zarr/',
      glContext,
    );
    const renderManager = new VolumeRenderManager();

    // Initialize the data manager and get zarr store details and device limits
    dataManager.init().then((initResult) => {
      if (initResult.success) {
        setZarrStoreInfo(initResult.zarrStore);
        setDeviceLimits(initResult.deviceLimits);

        // Set permanent box dimensions
        const scale = dataManager.getOriginalScaleXYZ();
        boxDimensionsRef.current = dataManager.getBoxDimensionsXYZ();
        boxDimensionsRef.current[0] *= scale[0] * 200.0;
        boxDimensionsRef.current[1] *= scale[1] * 200.0;
        boxDimensionsRef.current[2] *= scale[2] * 200.0;

        if (props.onInitComplete) {
          props.onInitComplete({
            zarrStoreInfo: initResult.zarrStore,
            deviceLimits: initResult.deviceLimits,
          });
        }
      } else {
        console.error('Failed to initialize VolumeDataManager:', initResult.error);
      }
    });

    // Initialize the Zarr store for rendering
    dataManager.initStore().then(() => {
      setManagers({
        dataManager,
        renderManager,
      });
    });

    // Clean up on unmount
    return () => {
      if (dataManager) {
        dataManager.clearCache();
      }
    };
  }, [gl]);

  // Extract settings from props - memoized to avoid recalculation
  const extractSettings = useCallback(() => {
    if (!managers) return null;
    const { renderManager } = managers;

    // Extract rendering settings from props
    const settingsValid = renderManager.updateFromProps(props);
    if (!settingsValid) return null;

    // Get the extracted settings
    return renderManager.extractRenderingSettingsFromProps(props);
  }, [props, managers]);

  // Load data when necessary
  const loadVolumeData = useCallback(async (settings) => {
    if (!managers || !settings) return;
    const { dataManager, renderManager } = managers;

    // Check if we need to load new data
    const resolutionChanged = settings.resolution !== lastResolution;
    const channelsChanged = !areChannelsEqual(settings.channelTargetC, lastChannelTargets);

    if (!resolutionChanged && !channelsChanged) {
      // If neither resolution nor channels changed, just update rendering
      const renderingSettings = renderManager.updateRendering(dataManager);
      if (renderingSettings) {
        setRendering(renderingSettings);
      }
      return;
    }

    setIsLoading(true);

    try {
      // Load the volume data only when resolution or channels changed
      await dataManager.loadVolumeData(
        settings.channelTargetC,
        settings.resolution,
      );

      // Update rendering based on loaded data
      const renderingSettings = renderManager.updateRendering(dataManager);

      if (renderingSettings) {
        setRendering(renderingSettings);
      }

      // Update state to track what we just loaded
      setLastResolution(settings.resolution);
      setLastChannelTargets([...settings.channelTargetC]);
    } finally {
      setIsLoading(false);
    }
  }, [managers, lastResolution, lastChannelTargets]);

  // Update when 3D mode or managers change
  useEffect(() => {
    if (!managers) return;

    const { spatialRenderingMode } = props;

    // Check if we're in 3D mode
    const newIs3DMode = spatialRenderingMode === '3D';
    setIs3DMode(newIs3DMode);

    if (!newIs3DMode) return;

    // Extract settings and load data if needed
    const settings = extractSettings();
    if (settings) {
      loadVolumeData(settings);
    }
  }, [props, managers, extractSettings, loadVolumeData]);

  // Forward zarr store info and device limits through the ref if available
  useEffect(() => {
    if (props.forwardRef && typeof props.forwardRef === 'object') {
      props.forwardRef.current = {
        zarrStoreInfo,
        deviceLimits,
      };
    }
  }, [props.forwardRef, zarrStoreInfo, deviceLimits]);

  // Update material when rendering changes
  useEffect(() => {
    if (!meshRef.current || !managers || isLoading
      || !rendering.uniforms || !rendering.shader) return;

    // Create new shader material
    const material = new THREE.ShaderMaterial({
      uniforms: rendering.uniforms,
      vertexShader: rendering.shader.vertexShader,
      fragmentShader: rendering.shader.fragmentShader,
      side: THREE.BackSide,
      transparent: true,
    });

    // Replace the existing material
    if (meshRef.current.material) {
      meshRef.current.material.dispose();
    }
    meshRef.current.material = material;
    materialRef.current = material;

    // Apply the render manager updates
    if (managers.renderManager) {
      managers.renderManager.applyToMaterial(material);
    }
  }, [rendering, isLoading, managers]);

  // Don't render anything if not in 3D mode or managers aren't initialized
  if (!is3DMode || !managers) {
    return null;
  }

  // Render loading state while waiting for data
  if (isLoading || !rendering.uniforms || !rendering.shader) {
    return (
      <group>
        <mesh>
          <boxGeometry args={boxDimensionsRef.current} />
          <meshBasicMaterial color="#444444" wireframe />
        </mesh>
        <OrbitControls
          enableDamping={false}
          dampingFactor={0.0}
          zoomDampingFactor={0.0}
          smoothZoom={false}
        />
      </group>
    );
  }

  // Render the volume with our setup
  return (
    <group>
      <OrbitControls
        ref={orbitRef}
        enableDamping={false}
        dampingFactor={0.0}
        zoomDampingFactor={0.0}
        smoothZoom={false}
      />
      <mesh
        ref={meshRef}
        scale={rendering.meshScale}
      >
        <boxGeometry args={rendering.geometrySize} />
      </mesh>
    </group>
  );
}
