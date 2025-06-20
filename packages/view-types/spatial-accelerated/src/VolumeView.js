/* eslint-disable max-len */
/**
 * VolumeView.js
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { WebGLMultipleRenderTargets } from 'three';

import { VolumeDataManager } from './VolumeDataManager.js';
import { VolumeRenderManager } from './VolumeRenderManager.js';

import gaussianVertexShader from '../shaders/GaussianVertexShader.glsl?raw';
import gaussianFragmentShader from '../shaders/GaussianFragmentShader.glsl?raw';

function framebufferFor(renderer, rt) {
  const p = renderer.properties?.get(rt);
  return p?.framebuffer || p?.__webglFramebuffer || rt.__webglFramebuffer;
}

function log(msg) {
  // console.warn(`V ${msg}`);
}

export function VolumeView(props) {
  const { gl, scene, camera } = useThree();
  const invalidate = useThree(state => state.invalidate);

  const orbitRef = useRef(null);
  const meshRef = useRef(null);
  const bufRequest = useRef(null);
  const bufUsage = useRef(null);
  const [processingRT, setRT] = useState(null);

  const [managers, setManagers] = useState(null);
  const [renderState, setRenderState] = useState({ uniforms: null,
    shader: null,
    meshScale: [1, 1, 1],
    geometrySize: [1, 1, 1] });
  const [lastRes, setLastRes] = useState(null);
  const [lastChannels, setLastChannels] = useState([]);
  const [is3D, setIs3D] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add new refs for screen quad setup
  const screenSceneRef = useRef(null);
  const screenCameraRef = useRef(null);
  const screenQuadRef = useRef(null);

  const [isInteracting, setIsInteracting] = useState(false);

  // new refs from step 2
  const [renderSpeed, setRenderSpeed] = useState(managers?.dataManager.PT.lowestDataRes);
  const stillRef = useRef(false); // skip geometry pass when true
  const frameRef = useRef(0); // frame counter
  const lastSampleRef = useRef(0);
  const lastFrameCountRef = useRef(0); // For more stable FPS calculation

  const interactionTimeoutRef = useRef(null); // Added for interaction logic
  const mainOrbitControlsRef = useRef(null); // Added for main view OrbitControls

  const sameArray = (a, b) => a && b && a.length === b.length && a.every((v, i) => v === b[i]);

  useEffect(() => {
    log('useEffect INIT');
    (async () => {
      const dm = new VolumeDataManager(
        // 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/zarr_test/gloria/',
        // 'http://127.0.0.1:8080/kingsnake/kingsnake_1c_32_z.zarr',
        'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/zarr_test/kingsnake_1c_32_z.zarr/',
        // 'http://127.0.0.1:8080/gloria_conversion/v2',
        // 'http://127.0.0.1:8080/kingsnake/kingsnake_b2r2.zarr/0',

        // example 1:
        // 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/f8ii/',
        // example 2:
        // 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/lightsheet_colon/',
        // example 350 GB
        // 'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/sorger/melanoma_zarr_32/',
        gl.getContext?.() || gl,
        gl,
      );
      const rm = new VolumeRenderManager();
      await dm.init(); // device limits, zarr meta

      console.log('dm.physicalScale', dm.physicalScale);

      rm.setZarrUniforms(dm.zarrStore, dm.PT);

      console.log('rm.uniforms', rm.uniforms);

      setManagers({ dataManager: dm, renderManager: rm });
      if (props.onInitComplete) {
        props.onInitComplete({ zarrStoreInfo: dm.zarrStore, deviceLimits: dm.deviceLimits });
      }
    })();

    return () => {
      managers?.dataManager.clearCache();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  useEffect(() => {
    log('useEffect GL');
    gl.autoClear = false;
  }, [gl]);

  const extractSettings = useCallback(() => {
    log('callback extractSettings');
    if (!managers) return null;
    const ok = managers.renderManager.updateFromProps(props);
    return ok ? managers.renderManager.extractRenderingSettingsFromProps(props) : null;
  }, [props, managers]);

  const loadIfNeeded = useCallback(async (settings) => {
    log('callback loadIfNeeded');
    if (!settings || !managers) return;

    const resolutionChanged = settings.resolution !== lastRes;
    const channelsChanged = !sameArray(settings.channelTargetC, lastChannels);

    stillRef.current = false;

    if (!resolutionChanged && !channelsChanged) {
      const s = managers.renderManager.updateRendering(managers.dataManager);
      if (s) setRenderState(s);
      return;
    }

    setLoading(true);

    const s = managers.renderManager.updateRendering(managers.dataManager);
    if (s) setRenderState(s);

    setLastRes(settings.resolution);
    setLastChannels([...settings.channelTargetC]);

    setLoading(false);
  }, [managers, lastRes, lastChannels]);

  useEffect(() => {
    log('useEffect 3D or prop changes');
    const on3D = props.spatialRenderingMode === '3D';
    setIs3D(on3D);
    if (on3D) loadIfNeeded(extractSettings());
  }, [props, extractSettings, loadIfNeeded]);

  useEffect(() => {
    if (!screenQuadRef.current) {
      return;
    }
    if (!stillRef.current) {
      screenQuadRef.current.material.uniforms.gaussian.value = 0;
    } else {
      screenQuadRef.current.material.uniforms.gaussian.value = 7;
    }
  }, [stillRef]);

  useEffect(() => {
    log('useEffect MRT target matching canvas');

    const { width, height } = gl.domElement;
    const mrt = new WebGLMultipleRenderTargets(width, height, 3);
    mrt.texture.forEach((tex) => {
      tex.format = THREE.RGBAFormat;
      tex.type = THREE.UnsignedByteType;
      // tex.encoding = THREE.LinearEncoding;
      tex.minFilter = tex.magFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
    });

    // Create screen quad setup
    const screenScene = new THREE.Scene();
    const screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    screenCamera.position.z = 1;

    const screenMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: mrt.texture[0] },
        resolution: { value: new THREE.Vector2(width, height) },
        gaussian: { value: 7 },
      },
      vertexShader: gaussianVertexShader,
      fragmentShader: gaussianFragmentShader,
      transparent: true,
    });
    const screenQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      screenMaterial,
    );

    screenScene.add(screenQuad);

    screenSceneRef.current = screenScene;
    screenCameraRef.current = screenCamera;
    screenQuadRef.current = screenQuad;

    bufRequest.current = new Uint8Array(width * height * 4);
    bufUsage.current = new Uint8Array(width * height * 4);
    setRT(mrt);

    return () => {
      mrt.dispose();
      screenMaterial.dispose();
      screenQuad.geometry.dispose();
    };
  }, [gl]);

  function performGeometryPass(_gl, _camera, _scene) {
    // log('performGeometryPass');
    _gl.setRenderTarget(processingRT);
    _gl.clear(true, true, true);
    _gl.render(_scene, _camera);
  }

  function performBlitPass(_gl) {
    // log('performBlitPass');
    _gl.setRenderTarget(null);
    _gl.clear(true, true, true);
    _gl.render(screenSceneRef.current, screenCameraRef.current);
  }

  function handleRequests(_gl) {
    // log('handleRequests');
    // console.log('handleRequests', frameRef.current);
    const ctx = _gl.getContext();
    const f = frameRef.current;

    if (managers?.dataManager.noNewRequests === true && f % 100 === 0 && f < 500) {
      managers.dataManager.noNewRequests = false;
    }
    if (managers?.dataManager.triggerRequest === true
        && managers?.dataManager.noNewRequests === false) {
      ctx.bindFramebuffer(ctx.READ_FRAMEBUFFER, framebufferFor(_gl, processingRT));
      ctx.readBuffer(ctx.COLOR_ATTACHMENT1);
      ctx.readPixels(0, 0, processingRT.width, processingRT.height,
        ctx.RGBA, ctx.UNSIGNED_BYTE, bufRequest.current);
      managers?.dataManager.processRequestData(bufRequest.current);
    } else if (managers?.dataManager.triggerUsage === true
      && managers?.dataManager.noNewRequests === false) {
      ctx.bindFramebuffer(ctx.READ_FRAMEBUFFER, framebufferFor(_gl, processingRT));
      ctx.readBuffer(ctx.COLOR_ATTACHMENT2);
      ctx.readPixels(0, 0, processingRT.width, processingRT.height,
        ctx.RGBA, ctx.UNSIGNED_BYTE, bufUsage.current);
      managers?.dataManager.processUsageData(bufUsage.current);
    }
  }

  function handleAdaptiveQuality(clock) {
    if (isInteracting) {
      managers.dataManager.noNewRequests = false;
      managers.dataManager.triggerUsage = true;
      return;
    }
    if (props.spatialRenderingModeChanging) return;

    if (managers?.dataManager.noNewRequests) {
      if (renderSpeed !== 0) {
        setRenderSpeed(0);
        console.log('Adaptive Quality: No new requests. Setting renderSpeed to 0 (best quality).');
        stillRef.current = false;
        invalidate();
      } else if (!stillRef.current) {
        console.log('Adaptive Quality: No new requests and already at best quality. Setting stillRef to true.');
        stillRef.current = true;
      }
      return;
    }

    if (stillRef.current) {
      stillRef.current = false;
      invalidate();
    }

    const t = clock.getElapsedTime();
    if (t - lastSampleRef.current < 1) {
      return;
    }

    const timeElapsedDuringSample = t - lastSampleRef.current;
    const framesRenderedDuringSample = frameRef.current - lastFrameCountRef.current;
    let fps = 0;
    if (timeElapsedDuringSample > 0) {
      fps = framesRenderedDuringSample / timeElapsedDuringSample;
    }

    lastSampleRef.current = t;
    lastFrameCountRef.current = frameRef.current;

    const upscale = fps > 100 && renderSpeed > 0; // Can't go below 0
    const downscale = fps < 30 && renderSpeed < managers?.dataManager.PT.lowestDataRes; // Can't go above

    if (upscale || downscale) {
      const newSpeed = renderSpeed + (downscale ? 1 : -1);
      setRenderSpeed(newSpeed);
      invalidate(); // Ensure the change takes effect
    }
  }

  useFrame((state) => {
    if (!processingRT || !managers) return;

    const {
      gl: frameGl,
      camera: frameCamera,
      scene: frameScene } = state;

    if (!stillRef.current) {
      performGeometryPass(frameGl, frameCamera, frameScene);
    }

    performBlitPass(frameGl);

    handleRequests(frameGl);

    handleAdaptiveQuality(state.clock);

    frameRef.current += 1;
  }, 1);

  useEffect(() => {
    log('useEffect setProcessingTargets');
    managers?.renderManager.setProcessingTargets(processingRT);
  }, [managers, processingRT]);

  useEffect(() => {
    const u = meshRef.current?.material?.uniforms;
    if (!u) return;
    u.renderRes.value = renderSpeed;
  }, [renderSpeed]);

  useEffect(() => {
    if (isInteracting) {
      setRenderSpeed(managers?.dataManager.PT.lowestDataRes);
      stillRef.current = false;
      invalidate();
    }
  }, [invalidate, isInteracting]);

  useEffect(() => {
    const controlsInstance = mainOrbitControlsRef.current; // Renamed to avoid conflict with controls in event handlers
    if (!controlsInstance) {
      return;
    }

    const handleStart = () => setIsInteracting(true);

    const handleEnd = () => {
      clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 300);
    };

    const handleWheel = () => {
      setIsInteracting(true);
      clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 300);
    };

    controlsInstance.addEventListener('start', handleStart);
    controlsInstance.addEventListener('end', handleEnd);

    const { domElement } = controlsInstance;
    // Ensure domElement is available
    if (domElement) {
      domElement.addEventListener('wheel', handleWheel, { passive: true });
    }

    return () => {
      if (controlsInstance) {
        controlsInstance.removeEventListener('start', handleStart);
        controlsInstance.removeEventListener('end', handleEnd);
        if (domElement) {
          domElement.removeEventListener('wheel', handleWheel);
        }
      }
      clearTimeout(interactionTimeoutRef.current);
    };
  }, [mainOrbitControlsRef.current, setIsInteracting]);


  if (!is3D || !managers) return null;

  if (loading || !renderState.shader) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#444" wireframe />
        </mesh>
        <OrbitControls ref={orbitRef} />
      </group>
    );
  }

  return (
    <group>
      <OrbitControls
        ref={mainOrbitControlsRef}
        enableDamping={false}
      />
      <mesh ref={meshRef} scale={renderState.meshScale}>
        <boxGeometry args={renderState.geometrySize} />
        <shaderMaterial
          uniforms={renderState.uniforms}
          vertexShader={renderState.shader.vertexShader}
          fragmentShader={renderState.shader.fragmentShader}
          side={THREE.BackSide}
          transparent={false}
          glslVersion={THREE.GLSL3}
        />
      </mesh>
    </group>
  );
}
