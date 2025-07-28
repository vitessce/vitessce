/* eslint-disable max-len */
/**
 * VolumeView.js
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
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

// Functions called with useFrame
function performGeometryPass(_gl, _camera, _scene, { mrtRef }) {
  // log('performGeometryPass');
  _gl.setRenderTarget(mrtRef.current);
  _gl.clear(true, true, true);
  _gl.render(_scene, _camera);
}

function performBlitPass(_gl, { screenSceneRef, screenCameraRef }) {
  // log('performBlitPass');
  _gl.setRenderTarget(null);
  _gl.clear(true, true, true);
  _gl.render(screenSceneRef.current, screenCameraRef.current);
}

function handleRequests(_gl, { frameRef, dataManager, mrtRef, bufRequest, bufUsage }) {
  // log('handleRequests');
  // console.log('handleRequests', frameRef.current);
  const ctx = _gl.getContext();
  const f = frameRef.current;

  if (dataManager.noNewRequests === true && f % 100 === 0 && f < 500) {
    // Every 100th frame of the first 500 frames.
    dataManager.noNewRequests = false;
  }
  if (dataManager.triggerRequest === true && dataManager.noNewRequests === false) {
    // Read the pixels of the request buffer into the width*height*RGBA bufRequest.current array.
    ctx.bindFramebuffer(ctx.READ_FRAMEBUFFER, framebufferFor(_gl, mrtRef.current));
    ctx.readBuffer(ctx.COLOR_ATTACHMENT1);
    ctx.readPixels(0, 0, mrtRef.current.width, mrtRef.current.height,
      ctx.RGBA, ctx.UNSIGNED_BYTE, bufRequest.current);
    // Based on the request buffer contents, process the requests
    // (e.g., start loading the brick data and upload to the brick cache). 
    // Finally, it will set triggerUsage to true.
    dataManager.processRequestData(bufRequest.current);
  } else if (dataManager.triggerUsage === true && dataManager.noNewRequests === false) {
    // Read the pixels of the usage buffer into the width*height*RGBA bufUsage.current array.
    ctx.bindFramebuffer(ctx.READ_FRAMEBUFFER, framebufferFor(_gl, mrtRef.current));
    ctx.readBuffer(ctx.COLOR_ATTACHMENT2);
    ctx.readPixels(0, 0, mrtRef.current.width, mrtRef.current.height,
      ctx.RGBA, ctx.UNSIGNED_BYTE, bufUsage.current);
    // Based on the usage buffer contents, process the usage data.
    // This identifies used bricks and updates their timestamps.
    // Timestamps are used to determine which bricks are most/least recently used for cache eviction.
    // If the brick cache is full, it will create an LRU cache.
    // Finally, it will set triggerRequest to true.
    dataManager.processUsageData(bufUsage.current);
  }
}

function handleAdaptiveQuality(clock, params) {
  const {
    invalidate,
    isInteracting,
    dataManager,
    spatialRenderingModeChanging,
    meshRef,
    stillRef,
    screenQuadRef,
    lastSampleRef,
    frameRef,
    lastFrameCountRef,
  } = params;

  // Moved out of useEffect
  if(screenQuadRef.current) {
    if (!stillRef.current) {
      // console.log('stillRef is false');
      screenQuadRef.current.material.uniforms.gaussian.value = 7;
    } else {
      //console.log('stillRef is true');
      screenQuadRef.current.material.uniforms.gaussian.value = 0;
    }
  }
  // End moved out of useEffect

  if (isInteracting) {
    // While the user is interacting, we want to ensure that the next frame's handleRequests call
    // will trigger the processUsageData call, and subsequently the processRequestData call
    // (since processUsageData will set triggerRequest to true its conclusion).
    dataManager.noNewRequests = false;
    dataManager.triggerUsage = true;
    return;
  }
  if (spatialRenderingModeChanging) return;

  const meshRefUniforms = meshRef.current?.material?.uniforms;
  const renderSpeed = meshRefUniforms?.renderRes?.value ?? dataManager?.PT?.lowestDataRes;

  if (dataManager.noNewRequests) {
    // If there are no more new requests, we can render in higher resolution.
    if (renderSpeed !== 0) {
      if (meshRefUniforms) {
        meshRefUniforms.renderRes.value = 0; // Set to best quality
      }
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
  const downscale = fps < 30 && renderSpeed < dataManager.PT.lowestDataRes; // Can't go above

  if (upscale || downscale) {
    const newSpeed = renderSpeed + (downscale ? 1 : -1);
    if (meshRefUniforms) {
      meshRefUniforms.renderRes.value = newSpeed;
    }
    invalidate(); // Ensure the change takes effect
  }
}

// END Functions called with useFrame


export function VolumeView(props) {
  const {
    images,
    imageLayerScopes,
    imageLayerCoordination,
    imageChannelScopesByLayer,
    imageChannelCoordination,
    // onInitComplete,
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
  const mrtRef = useRef(null);

  // const [managers, setManagers] = useState(null);
  const [renderState, setRenderState] = useState({
    uniforms: null,
    shader: null,
    meshScale: [1, 1, 1],
    geometrySize: [1, 1, 1],
  });
  // const [lastRes, setLastRes] = useState(null);
  // const [lastChannels, setLastChannels] = useState([]);
  const [is3D, setIs3D] = useState(false);
  // const [loading, setLoading] = useState(false);

  // Add new refs for screen quad setup
  const screenSceneRef = useRef(null);
  const screenCameraRef = useRef(null);
  const screenQuadRef = useRef(null);

  const [isInteracting, setIsInteracting] = useState(false);
  const interactionTimeoutRef = useRef(null);
  
  // Track interaction-triggering props
  // const prevInteractionChannels = useRef();

  // new refs from step 2
  // const [renderSpeed, setRenderSpeed] = useState(dataManager.PT.lowestDataRes);
  const stillRef = useRef(false); // skip geometry pass when true
  const frameRef = useRef(0); // frame counter
  const lastSampleRef = useRef(0);
  const lastFrameCountRef = useRef(0); // For more stable FPS calculation

  // const mainOrbitControlsRef = useRef(null); // Added for main view OrbitControls
  
  // const sameArray = (a, b) => a && b && a.length === b.length && a.every((v, i) => v === b[i]);

  // INITIALIZATION (GL-DEPENDENT ONLY)

  const dataManager = useMemo(() => {
    return new VolumeDataManager(gl);
  }, [gl]);

  const renderManager = useMemo(() => {
    return new VolumeRenderManager();
  }, []);

  useEffect(() => {
    log('useEffect MRT target matching canvas');

    const { width, height } = gl.domElement;
    // We use three render targets:
    // layout(location = 0) out vec4 gColor: Final rendered color (sRGB)
    // layout(location = 1) out vec4 gRequest: Brick loading requests (packed coordinates)
    // layout(location = 2) out vec4 gUsage: Brick usage tracking (for cache management)
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
        // Bind the first render target texture as the input of the gaussian blur shader.
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
    mrtRef.current = mrt;

    return () => {
      mrt.dispose();
      screenMaterial.dispose();
      screenQuad.geometry.dispose();
    };
  }, [gl]);

  
  // INITIALIZATION (IMAGE-DEPENDENT)
  const firstImageLayerScope = imageLayerScopes?.[0];
  const firstImage = images?.[firstImageLayerScope];
  const firstImageChannelScope = imageChannelScopesByLayer?.[firstImageLayerScope];
  const firstImageLayerChannelCoordination = imageChannelCoordination?.[0]?.[firstImageLayerScope];

  useEffect(() => {
    log('useEffect INIT');

    if(!dataManager || !renderManager) {
      console.log('dataManager or renderManager not initialized yet');
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

    // TODO(mark): prevent dataManager.init from being called more than once.
    (async () => {
      // TODO(mark): separate the initialization which depends on gl, from the initialization which depends on images, from the dm.init(firstImageLayer)
      dataManager.initImages(images, imageLayerScopes)
      // TODO: generalize to more than one image layer.
      await dataManager.init(firstImageLayerChannelCoordination); // device limits, zarr meta

      console.log('dm.physicalScale', dataManager.physicalScale);

      renderManager.setZarrUniforms(dataManager.zarrStore, dataManager.PT);
      renderManager.setChannelMapping(dataManager.channels.colorMappings);

      console.log('rm.uniforms', renderManager.uniforms);

      // setManagers({ dataManager: dm, renderManager: rm });
      // if (onInitComplete) {
      //   onInitComplete({ zarrStoreInfo: dm.zarrStore, deviceLimits: dm.deviceLimits });
      // }
    })();
    
    // The data manager does not have a clearCache method, should it?
    // return () => {
    //   console.log('VolumeView useEffect cleanup: running dataManager.clearCache()');
    //   dataManager?.clearCache?.();
    // };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataManager, renderManager,
    images, imageLayerScopes,
  ]);

  /*
  useEffect(() => {
    log('useEffect GL');
    gl.autoClear = false;
  }, [gl]);
  */

  /*
  const extractSettings = useCallback(() => {
    log('callback extractSettings');
    if (!dataManager || !renderManager) return null;
    const ok = renderManager.updateFromProps(props);
    return ok ? renderManager.extractRenderingSettingsFromProps(props) : null;
  }, [props, dataManager, renderManager]);
  */

  /*
  const loadIfNeeded = useCallback(async (settings) => {
    if (!settings || !dataManager || !renderManager) return;

    const resolutionChanged = settings.resolution !== lastRes;
    const channelsChanged = !sameArray(settings.channelTargetC, lastChannels);

    // Always update rendering state
    const renderManagerState = renderManager.updateRendering(dataManager);
    if (renderManagerState) setRenderState(renderManagerState);

    // Update tracking state
    if (resolutionChanged) setLastRes(settings.resolution);
    if (channelsChanged) setLastChannels([...settings.channelTargetC]);

    stillRef.current = false;
  }, [dataManager, renderManager, lastRes, lastChannels]);
  */

  // TODO(mark): convert to a useMemo?
  useEffect(() => {
    log('useEffect spatialRenderingMode');
    const on3D = spatialRenderingMode === '3D';
    setIs3D(on3D);

    if (on3D && dataManager && renderManager) {
      // Direct call, no callbacks needed
      const propsForRenderManager = {
        images,
        imageLayerScopes,
        imageLayerCoordination,
        imageChannelScopesByLayer,
        imageChannelCoordination,
        spatialRenderingMode,
      };
      if (renderManager.updateFromProps(propsForRenderManager)) {
        const zarrInit = renderManager.zarrInit;
        if (!zarrInit) {
          // If textures have not yet been initialized, do so prior to calling .updateRendering,
          // as this internally calls renderManager.updateUniforms,
          // which (I anticipate) expects the textures to be initialized.
          
          // Initialize textures without warnings
          dataManager.ptTHREE.needsUpdate = false;
          dataManager.bcTHREE.needsUpdate = false;

          // Initialize textures if needed
          dataManager.renderer.initTexture(dataManager.bcTHREE);
          dataManager.renderer.initTexture(dataManager.ptTHREE);

          // Handle the first brick request.
          dataManager.initTexture();
        }
        // Render manager needs some things from the data manager.
        const renderState = renderManager.updateRendering({
          zarrStoreShapes: dataManager.zarrStore.shapes,
          originalScaleXYZ: dataManager.getOriginalScaleXYZ(),
          physicalDimensionsXYZ: dataManager.getPhysicalDimensionsXYZ(),
          maxResolutionXYZ: dataManager.getMaxResolutionXYZ(),
          boxDimensionsXYZ: dataManager.getBoxDimensionsXYZ(),
          normalizedScaleXYZ: dataManager.getNormalizedScaleXYZ(),
          bcTHREE: dataManager.bcTHREE,
          ptTHREE: dataManager.ptTHREE,
        });
        if (renderState) setRenderState(renderState);
      }
    }
  }, [dataManager, renderManager, images, imageLayerScopes, imageLayerCoordination,
    imageChannelScopesByLayer, imageChannelCoordination, spatialRenderingMode]);

  // TODO(mark): can this logic be moved into useFrame?
  /*
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
  */

  // TODO(mark): can this logic be moved into useFrame?
  // But currently, it only runs upon a change of isInteracting.
  useEffect(() => {
    log('useEffect isInteracting');
    if (isInteracting) {
      const meshRefUniforms = meshRef.current?.material?.uniforms;
      if (meshRefUniforms) {
        meshRefUniforms.renderRes.value = dataManager.PT.lowestDataRes;
      }
      // setRenderSpeed(dataManager.PT.lowestDataRes);
      stillRef.current = false;
      invalidate();
    }
  }, [invalidate, isInteracting]);

  // Execute code on every rendered frame.
  // A numerical renderPriority value will cause React Three Fiber
  // to disable automatic rendering altogether.
  // It will now be your responsibility to render
  // (by calling invalidate()).
  // Reference: https://r3f.docs.pmnd.rs/api/hooks#useframe
  const RENDER_PRIORITY = 1;
  useFrame((state, delta, xrFrame) => {
    // NOTE: Do not update React state inside useFrame.
    // Reference: https://r3f.docs.pmnd.rs/advanced/pitfalls#%E2%9D%8C-setstate-in-useframe-is-bad
    if (!mrtRef.current || !dataManager || !renderManager) return;

    // Receive the same state as the useThree hook.
    const {
      gl: frameGl,
      camera: frameCamera,
      scene: frameScene,
      clock,
    } = state;

    if (!stillRef.current) {
      performGeometryPass(frameGl, frameCamera, frameScene, { mrtRef });
    }
    performBlitPass(frameGl, { screenSceneRef, screenCameraRef });
    handleRequests(frameGl, { frameRef, dataManager, mrtRef, bufRequest, bufUsage });
    handleAdaptiveQuality(clock, {
      invalidate,
      isInteracting,
      dataManager,
      spatialRenderingModeChanging,
      meshRef,
      stillRef,
      screenQuadRef,
      lastSampleRef,
      frameRef,
      lastFrameCountRef,
    });

    frameRef.current += 1;
  }, RENDER_PRIORITY);

  /*
  useEffect(() => {
    log('useEffect setProcessingTargets');
    renderManager.setProcessingTargets(mrtRef.current);
  }, [renderManager, mrtRef]);
  */

  /*
  useEffect(() => {
    log('useEffect renderState');
    const u = meshRef.current?.material?.uniforms;
    if (!u) return;
    u.renderRes.value = renderSpeed;
  }, [renderSpeed]);
  */

  /*
  useEffect(() => {
    log('useEffect mainOrbitControlsRef');
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
  */

  const onOrbitControlsStart = useCallback((e) => {
    setIsInteracting(true);
  }, []);


  const onOrbitControlsEnd = useCallback((e) => {
    clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 300);
  }, []);

  // Set isInteracting while the user is sliding the channel slider
  // for smooth updates.
  useEffect(() => {
    log('useEffect firstImageLayerChannelCoordination');
    setIsInteracting(true);
    console.log('something about channels changed');

    dataManager.updateChannels(firstImageLayerChannelCoordination);
    renderManager.setChannelMapping(dataManager.channels.colorMappings);

    clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 300);
  }, [firstImageLayerChannelCoordination]);

  // Render nothing during initialization.
  if (!is3D || !dataManager || !renderManager) return null;

  if (!renderState.shader) {
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

  // Render the volume.
  return (
    <group>
      <OrbitControls
        //ref={mainOrbitControlsRef}
        enableDamping={false}
        onStart={onOrbitControlsStart}
        onEnd={onOrbitControlsEnd}
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
