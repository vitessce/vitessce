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

import { gaussianVertexShader } from './shaders/GaussianVertexShader.js';
import { gaussianFragmentShader } from './shaders/GaussianFragmentShader.js';

function framebufferFor(renderer, rt) {
  const p = renderer.properties?.get(rt);
  return p?.framebuffer || p?.__webglFramebuffer || rt.__webglFramebuffer;
}

function log(msg) {
  console.warn(
    `%cV: ${msg}`,
    'background: deeppink; color: white; padding: 2px; border-radius: 3px;',
  );
}

export function VolumeView(props) {
  const {
    images,
    imageLayerScopes,
    imageLayerCoordination,
    imageChannelScopesByLayer,
    imageChannelCoordination,
    onInitComplete,
    spatialRenderingMode,
    spatialRenderingModeChanging,
  } = props;
  const {
    gl,
    // scene,
    // camera
  } = useThree();

  // Request a new render.
  const invalidate = useThree(state => state.invalidate);

  const orbitRef = useRef(null);
  const meshRef = useRef(null);
  const bufRequest = useRef(null);
  const bufUsage = useRef(null);
  const [processingRT, setRT] = useState(null);

  const [managers, setManagers] = useState(null);
  const [renderState, setRenderState] = useState({
    uniforms: null,
    shader: null,
    meshScale: [1, 1, 1],
    geometrySize: [1, 1, 1],
  });
  // const [lastRes, setLastRes] = useState(null);
  // const [lastChannels, setLastChannels] = useState([]);
  const [is3D, setIs3D] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add new refs for screen quad setup
  const screenSceneRef = useRef(null);
  const screenCameraRef = useRef(null);
  const screenQuadRef = useRef(null);

  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeoutRef = useRef(null);
  
  // Track interaction-triggering props
  // const prevInteractionChannels = useRef();

  // new refs from step 2
  const [renderSpeed, setRenderSpeed] = useState(managers?.dataManager.PT.lowestDataRes);
  const stillRef = useRef(false); // skip geometry pass when true
  const frameRef = useRef(0); // frame counter
  const lastSampleRef = useRef(0);
  const lastFrameCountRef = useRef(0); // For more stable FPS calculation

  const mainOrbitControlsRef = useRef(null); // Added for main view OrbitControls
  
  // const sameArray = (a, b) => a && b && a.length === b.length && a.every((v, i) => v === b[i]);

  const firstImageLayerScope = imageLayerScopes?.[0];
  const firstImage = images?.[firstImageLayerScope];
  const firstImageChannelScope = imageChannelScopesByLayer?.[firstImageLayerScope];
  const firstImageLayerChannelCoordination = imageChannelCoordination?.[0]?.[firstImageLayerScope];

  useEffect(() => {
    log('useEffect INIT');

    if (managers) {
      console.log('managers already initialized');
      return;
    }

    if (!firstImage) {
      console.log('no first image layer yet');
      return;
    }

    if(!firstImageLayerChannelCoordination) {
      console.log('no firstImageLayerChannelCoordination yet');
      return;
    }

    (async () => {
      const dm = new VolumeDataManager(
        gl.getContext?.() || gl,
        gl,
        images,
        imageLayerScopes,
      );
      const rm = new VolumeRenderManager();
      // TODO: generalize to more than one image layer.
      await dm.init(firstImageLayerChannelCoordination); // device limits, zarr meta

      console.log('dm.physicalScale', dm.physicalScale);

      rm.setZarrUniforms(dm.zarrStore, dm.PT);
      rm.setChannelMapping(dm.channels.colorMappings);

      console.log('rm.uniforms', rm.uniforms);

      setManagers({ dataManager: dm, renderManager: rm });
      if (onInitComplete) {
        onInitComplete({ zarrStoreInfo: dm.zarrStore, deviceLimits: dm.deviceLimits });
      }
    })();

    return () => {
      console.log('VolumeView useEffect cleanup: running dataManager.clearCache()');
      managers?.dataManager.clearCache();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, imageLayerScopes, firstImageLayerChannelCoordination]); // run when props.images changes

  /*
  useEffect(() => {
    log('useEffect GL');
    gl.autoClear = false;
  }, [gl]);
  */

  /*
  const extractSettings = useCallback(() => {
    log('callback extractSettings');
    if (!managers) return null;
    const ok = managers.renderManager.updateFromProps(props);
    return ok ? managers.renderManager.extractRenderingSettingsFromProps(props) : null;
  }, [props, managers]);
  */

  /*
  const loadIfNeeded = useCallback(async (settings) => {
    if (!settings || !managers) return;

    const resolutionChanged = settings.resolution !== lastRes;
    const channelsChanged = !sameArray(settings.channelTargetC, lastChannels);

    // Always update rendering state
    const renderManagerState = managers.renderManager.updateRendering(managers.dataManager);
    if (renderManagerState) setRenderState(renderManagerState);

    // Update tracking state
    if (resolutionChanged) setLastRes(settings.resolution);
    if (channelsChanged) setLastChannels([...settings.channelTargetC]);

    stillRef.current = false;
  }, [managers, lastRes, lastChannels]);
  */

  useEffect(() => {
    log('useEffect spatialRenderingMode');
    const on3D = spatialRenderingMode === '3D';
    setIs3D(on3D);

    if (on3D && managers) {
      // Direct call, no callbacks needed
      const propsForRenderManager = {
        images,
        imageLayerScopes,
        imageLayerCoordination,
        imageChannelScopesByLayer,
        imageChannelCoordination,
        spatialRenderingMode,
      };
      if (managers.renderManager.updateFromProps(propsForRenderManager)) {
        const zarrInit = managers.renderManager.zarrInit;
        if (!zarrInit) {
          // If textures have not yet been initialized, do so prior to calling .updateRendering,
          // as this internally calls renderManager.updateUniforms,
          // which (I anticipate) expects the textures to be initialized.
          
          // Initialize textures without warnings
          managers.dataManager.ptTHREE.needsUpdate = false;
          managers.dataManager.bcTHREE.needsUpdate = false;

          // Initialize textures if needed
          managers.dataManager.renderer.initTexture(managers.dataManager.bcTHREE);
          managers.dataManager.renderer.initTexture(managers.dataManager.ptTHREE);

          // Handle the first brick request.
          managers.dataManager.initTexture();
        }
        // Render manager needs some things from the data manager.
        const renderState = managers.renderManager.updateRendering({
          zarrStoreShapes: managers.dataManager.zarrStore.shapes,
          originalScaleXYZ: managers.dataManager.getOriginalScaleXYZ(),
          physicalDimensionsXYZ: managers.dataManager.getPhysicalDimensionsXYZ(),
          maxResolutionXYZ: managers.dataManager.getMaxResolutionXYZ(),
          boxDimensionsXYZ: managers.dataManager.getBoxDimensionsXYZ(),
          normalizedScaleXYZ: managers.dataManager.getNormalizedScaleXYZ(),
          bcTHREE: managers.dataManager.bcTHREE,
          ptTHREE: managers.dataManager.ptTHREE,
        });
        if (renderState) setRenderState(renderState);
      }
    }
  }, [managers, images, imageLayerScopes, imageLayerCoordination,
    imageChannelScopesByLayer, imageChannelCoordination, spatialRenderingMode]);

  useEffect(() => {
    log('useEffect stillRef');
    // console.log('useEffect stillRef');
    // console.log('stillRef', stillRef.current);
    if (!screenQuadRef.current) {
      console.log('no screen quad yet');
      return;
    }
    if (!stillRef.current) {
      // console.log('stillRef is false');
      screenQuadRef.current.material.uniforms.gaussian.value = 7;
    } else {
      //console.log('stillRef is true');
      screenQuadRef.current.material.uniforms.gaussian.value = 0;
    }
  }, [stillRef.current]);

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

  // TODO(mark): extract these functions outside of the component, or into a useCallback.
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
      // Every 100th frame of the first 500 frames.
      managers.dataManager.noNewRequests = false;
    }
    if (managers?.dataManager.triggerRequest === true && managers?.dataManager.noNewRequests === false) {
      // Read the pixels of the request buffer into the width*height*RGBA bufRequest.current array.
      ctx.bindFramebuffer(ctx.READ_FRAMEBUFFER, framebufferFor(_gl, processingRT));
      ctx.readBuffer(ctx.COLOR_ATTACHMENT1);
      ctx.readPixels(0, 0, processingRT.width, processingRT.height,
        ctx.RGBA, ctx.UNSIGNED_BYTE, bufRequest.current);
      // Based on the request buffer contents, process the requests
      // (e.g., start loading the brick data and upload to the brick cache). 
      // Finally, it will set triggerUsage to true.
      managers?.dataManager.processRequestData(bufRequest.current);
    } else if (managers?.dataManager.triggerUsage === true && managers?.dataManager.noNewRequests === false) {
      // Read the pixels of the usage buffer into the width*height*RGBA bufUsage.current array.
      ctx.bindFramebuffer(ctx.READ_FRAMEBUFFER, framebufferFor(_gl, processingRT));
      ctx.readBuffer(ctx.COLOR_ATTACHMENT2);
      ctx.readPixels(0, 0, processingRT.width, processingRT.height,
        ctx.RGBA, ctx.UNSIGNED_BYTE, bufUsage.current);
      // Based on the usage buffer contents, process the usage data.
      // This identifies used bricks and updates their timestamps.
      // Timestamps are used to determine which bricks are most/least recently used for cache eviction.
      // If the brick cache is full, it will create an LRU cache.
      // Finally, it will set triggerRequest to true.
      managers?.dataManager.processUsageData(bufUsage.current);
    }
  }

  function handleAdaptiveQuality(clock) {
    if (isInteracting) {
      // While the user is interacting, we want to ensure that the next frame's handleRequests call
      // will trigger the processUsageData call, and subsequently the processRequestData call
      // (since processUsageData will set triggerRequest to true its conclusion).
      managers.dataManager.noNewRequests = false;
      managers.dataManager.triggerUsage = true;
      return;
    }
    if (spatialRenderingModeChanging) return;

    if (managers?.dataManager.noNewRequests) {
      // If there are no more new requests, we can render in higher resolution.
      if (renderSpeed !== 0) {
        setRenderSpeed(0);
        console.log('Adaptive Quality: No new requests. Setting renderSpeed to 0 (best quality).');
        stillRef.current = false;
        screenQuadRef.current.material.uniforms.gaussian.value = 7;
        invalidate();
      } else if (!stillRef.current) {
        console.log('Adaptive Quality: No new requests and already at best quality. Setting stillRef to true.');
        stillRef.current = true;
        screenQuadRef.current.material.uniforms.gaussian.value = 0;
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

  // Execute code on every rendered frame.
  // A numerical renderPriority value will cause React Three Fiber
  // to disable automatic rendering altogether.
  // It will now be your responsibility to render
  // (by calling invalidate()).
  // Reference: https://r3f.docs.pmnd.rs/api/hooks#useframe
  const RENDER_PRIORITY = 1;
  useFrame((state, delta, xrFrame) => {
    if (!processingRT || !managers) return;

    // Receive the same state as the useThree hook.
    const {
      gl: frameGl,
      camera: frameCamera,
      scene: frameScene,
      clock,
    } = state;

    if (!stillRef.current) {
      performGeometryPass(frameGl, frameCamera, frameScene);
    }

    performBlitPass(frameGl);

    handleRequests(frameGl);

    handleAdaptiveQuality(clock);

    frameRef.current += 1;
  }, RENDER_PRIORITY);

  useEffect(() => {
    log('useEffect setProcessingTargets');
    managers?.renderManager.setProcessingTargets(processingRT);
  }, [managers, processingRT]);

  useEffect(() => {
    log('useEffect renderState');
    const u = meshRef.current?.material?.uniforms;
    if (!u) return;
    u.renderRes.value = renderSpeed;
  }, [renderSpeed]);

  useEffect(() => {
    log('useEffect isInteracting');
    if (isInteracting) {
      setRenderSpeed(managers?.dataManager.PT.lowestDataRes);
      stillRef.current = false;
      invalidate();
    }
  }, [invalidate, isInteracting]);

  useEffect(() => {
    log('useEffect mainOrbitControlsRef');
    const controlsInstance = mainOrbitControlsRef.current; // Renamed to avoid conflict with controls in event handlers
    if (!controlsInstance) {
      return;
    }

    const handleStart = () => setIsInteracting(true);

    const handleEnd = () => {
      clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 1000);
    };

    const handleWheel = () => {
      setIsInteracting(true);
      clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 1000);
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

  useEffect(() => {
    log('useEffect firstImageLayerChannelCoordination');
    setIsInteracting(true);
    console.log('something about channels changed');

    managers?.dataManager.updateChannels(firstImageLayerChannelCoordination);
    managers?.renderManager.setChannelMapping(managers?.dataManager.channels.colorMappings);

    clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 300);
  }, [firstImageLayerChannelCoordination]);

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
