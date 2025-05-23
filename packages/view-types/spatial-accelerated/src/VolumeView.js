/**
 * VolumeView.js ‑ single‑pass MRT renderer
 *
 *  ▸ One geometry pass per frame               (gl.draw* called once)
 *  ▸ Writes three colour‑attachments in that pass
 *  ▸ Blits attachment 0 to the default FB
 *  ▸ Optionally reads attachment 1 & 2 on an interval
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

function CameraInteraction({ onChange, ...props }) {
  const controlsRef = useRef();
  const timeoutRef = useRef(null);

  useEffect(() => {
    log('CameraInteraction useEffect');
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => onChange(true);

    const handleEnd = () => {
      // Use timeout to prevent flickering if user quickly starts another interaction
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => onChange(false), 300);
    };

    // Handle wheel events for zooming
    const handleWheel = () => {
      onChange(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => onChange(false), 300);
    };

    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);

    // Add wheel event to the DOM element
    const { domElement } = controls;
    domElement.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      log('CameraInteraction cleanup');
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
      domElement.removeEventListener('wheel', handleWheel);
      clearTimeout(timeoutRef.current);
    };
  }, [onChange]);

  return <OrbitControls ref={controlsRef} {...props} />;
}

export function VolumeView(props) {
  /* ---------- r3f handles ------------------------------------------------- */
  const { gl, scene, camera } = useThree();
  const invalidate = useThree(state => state.invalidate);

  /* ---------- refs / state ------------------------------------------------ */
  const orbitRef = useRef(null);
  const meshRef = useRef(null);
  const bufRequest = useRef(null);
  const bufUsage = useRef(null);
  const [processingRT, setRT] = useState(null);

  const [managers, setManagers] = useState(null); // {dataManager, renderManager}
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
  const [renderSpeed, setRenderSpeed] = useState(5); // 0 (coarsest) – 5 (finest)
  const stillRef = useRef(false); // skip geometry pass when true
  const frameRef = useRef(0); // frame counter
  const lastSampleRef = useRef(0);
  const lastFrameCountRef = useRef(0); // For more stable FPS calculation

  const sameArray = (a, b) => a && b && a.length === b.length && a.every((v, i) => v === b[i]);

  useEffect(() => {
    log('useEffect INIT');
    (async () => {
      const dm = new VolumeDataManager(
        'https://vitessce-data-v2.s3.us-east-1.amazonaws.com/data/zarr_test/kingsnake_1c_32_z.zarr/',
        gl.getContext?.() || gl,
        gl,
      );
      const rm = new VolumeRenderManager();
      await dm.init(); // device limits, zarr meta

      setManagers({ dataManager: dm, renderManager: rm });
      if (props.onInitComplete) {
        props.onInitComplete({ zarrStoreInfo: dm.zarrStore, deviceLimits: dm.deviceLimits });
      }
    })();

    return () => managers?.dataManager.clearCache();
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
    const ctx = _gl.getContext();
    const f = frameRef.current;

    if (managers?.dataManager.noNewRequests === true && f % 100 === 0) {
      managers.dataManager.noNewRequests = false;
    }
    if (managers?.dataManager.triggerRequest === true
        && managers?.dataManager.noNewRequests === false) {
      ctx.bindFramebuffer(ctx.READ_FRAMEBUFFER, framebufferFor(_gl, processingRT));
      ctx.readBuffer(ctx.COLOR_ATTACHMENT1);
      ctx.readPixels(0, 0, processingRT.width, processingRT.height,
        ctx.RGBA, ctx.UNSIGNED_BYTE, bufRequest.current);
      managers?.dataManager.processRequestData(bufRequest.current);
    }
    if (f % 1000 === 0) {
      ctx.bindFramebuffer(ctx.READ_FRAMEBUFFER, framebufferFor(_gl, processingRT));
      ctx.readBuffer(ctx.COLOR_ATTACHMENT2);
      ctx.readPixels(0, 0, processingRT.width, processingRT.height,
        ctx.RGBA, ctx.UNSIGNED_BYTE, bufUsage.current);
      // managers?.dataManager.processUsageData(bufUsage.current); // As per user snippet
    }
  }

  function handleAdaptiveQuality(clock) {
    if (isInteracting) return;
    if (props.spatialRenderingModeChanging) return;

    if (managers?.dataManager.noNewRequests) {
      if (renderSpeed !== 0) {
        setRenderSpeed(0);
        console.log('Adaptive Quality: No new requests. Setting renderSpeed to 0 (best quality).');
        // log('Adaptive Quality: No new requests. Setting renderSpeed to 0 (best quality).');
        stillRef.current = false;
        invalidate();
      } else if (!stillRef.current) {
        console.log('Adaptive Quality: No new requests and already at best quality. Setting stillRef to true.');
        // log('Adaptive Quality: No new requests and already at best quality. Setting stillRef to true.');
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
    const downscale = fps < 30 && renderSpeed < 5; // Can't go above 5

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
      setRenderSpeed(5);
      log('setRenderSpeed to 5');
      stillRef.current = false;
      invalidate();
    }
  }, [invalidate, isInteracting]);

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
      <CameraInteraction
        onChange={setIsInteracting}
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
