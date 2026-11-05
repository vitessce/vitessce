/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/**
 * VolumeView.js
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { isEqual } from 'lodash-es';
import { log, atLeastLogLevel, LogLevel } from '@vitessce/globals';
import { useEventCallback } from '@vitessce/styles';
import { CoordinationType } from '@vitessce/constants-internal';

import {
  VolumeDataManager,
  INIT_STATUS,
  DEFAULT_SIGMA_NORMALIZED,
  _hasBrickRequests,
} from './VolumeDataManager.js';
import { VolumeRenderManager, getScreenLodFactor, windowToClim } from './VolumeRenderManager.js';
import {
  viewStateToCamera,
  cameraToViewState,
  isVolumeViewState,
  DEFAULT_VOLUME_VIEW_STATE,
} from './camera-utils.js';

import { gaussianVertexShader } from './shaders/GaussianVertexShader.js';
import { gaussianFragmentShader } from './shaders/GaussianFragmentShader.js';

function framebufferFor(renderer, rt) {
  const p = renderer.properties?.get(rt);
  return p?.framebuffer || p?.__webglFramebuffer || rt.__webglFramebuffer;
}

function logWithColor(msg) {
  if (atLeastLogLevel(LogLevel.DEBUG)) {
    console.warn(
      `%cV: ${msg}`,
      'background: deeppink; color: white; padding: 2px; border-radius: 3px;',
    );
  }
}

// Functions called with useFrame
function performGeometryPass(_gl, _camera, _scene, { mrtRef }) {
  // logWithColor('performGeometryPass', 'blue');
  _gl.setRenderTarget(mrtRef.current);
  _gl.clear(true, true, true);
  _gl.render(_scene, _camera);
}

function performBlitPass(_gl, { screenSceneRef, screenCameraRef }) {
  // logWithColor('performBlitPass', 'red');
  _gl.setRenderTarget(null);
  _gl.clear(true, true, true);
  _gl.render(screenSceneRef.current, screenCameraRef.current);
}

function handleRequests(_gl, {
  frameRef, dataManager, mrtRef, bufRequest, bufUsage, geometryPassRef, requestReadPassRef,
}) {
  // logWithColor('handleRequests');
  // log.debug('handleRequests', frameRef.current);
  const ctx = _gl.getContext();
  const f = frameRef.current;

  // Only allow automatic restart if not manually stopped by user
  if (dataManager.noNewRequests === true && !dataManager.manuallyStopped && f % 100 === 0 && f < 500) {
    // Every 100th frame of the first 500 frames.
    // eslint-disable-next-line no-param-reassign
    dataManager.noNewRequests = false;
  }
  // Only read the buffers back when the data manager can take new requests.
  // Reading stalls the GPU, and while a batch is loading the result would be dropped.
  // Each batch sets triggerUsage when it completes, so the reads resume on the next frame.
  if (dataManager.isBusy) {
    return;
  }
  const readRequestBuffer = () => {
    ctx.bindFramebuffer(ctx.READ_FRAMEBUFFER, framebufferFor(_gl, mrtRef.current));
    ctx.readBuffer(ctx.COLOR_ATTACHMENT1);
    ctx.readPixels(0, 0, mrtRef.current.width, mrtRef.current.height,
      ctx.RGBA, ctx.UNSIGNED_BYTE, bufRequest.current);
    // eslint-disable-next-line no-param-reassign
    requestReadPassRef.current = geometryPassRef.current;
  };
  if (dataManager.triggerRequest === true && dataManager.noNewRequests === false) {
    // Read the pixels of the request buffer into the width*height*RGBA bufRequest.current array.
    readRequestBuffer();
    // Based on the request buffer contents, process the requests
    // (e.g., start loading the brick data and upload to the brick cache).
    // Pass width/height so the data manager can compute Gaussian weighting.
    dataManager.processRequestData(bufRequest.current, {
      // If width/height are not yet available,
      // processRequestData will proceed without weighting.
      width: mrtRef?.current?.width,
      height: mrtRef?.current?.height,
      // Default sigmaNormalized = 0.25; can be tuned
      sigmaNormalized: DEFAULT_SIGMA_NORMALIZED,
    });
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
    dataManager.processUsageData(bufUsage.current, {
      width: mrtRef?.current?.width,
    });
  } else if (dataManager.noNewRequests === true && !dataManager.manuallyStopped
    && geometryPassRef.current !== requestReadPassRef.current) {
    // Loading stopped after a read found no requests. Frames drawn since, e.g. the
    // one at best quality before the view goes still, can still ask for bricks:
    // read each once, and resume loading if it does. Resuming on a timer instead
    // would blur the still view (the interactive Gaussian) every time.
    readRequestBuffer();
    if (_hasBrickRequests(bufRequest.current, mrtRef.current.width)) {
      // eslint-disable-next-line no-param-reassign
      dataManager.noNewRequests = false;
      // eslint-disable-next-line no-param-reassign
      dataManager.triggerUsage = true;
    }
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
  if (screenQuadRef.current) {
    if (!stillRef.current) {
      // log.debug('stillRef is false');
      screenQuadRef.current.material.uniforms.gaussian.value = 7;
    } else {
      // log.debug('stillRef is true');
      screenQuadRef.current.material.uniforms.gaussian.value = 0;
    }
  }
  // End moved out of useEffect

  if (isInteracting) {
    // While the user is interacting, we want to ensure that the next frame's handleRequests call
    // will trigger the processUsageData call, and subsequently the processRequestData call
    // (since processUsageData will set triggerRequest to true its conclusion).
    // But only if not manually stopped by the user
    if (!dataManager.manuallyStopped) {
      dataManager.noNewRequests = false;
      dataManager.triggerUsage = true;
      // A batch in flight was requested for the previous view: stop it early,
      // so that the buffers are read again for the current one.
      if (dataManager.isBusy) {
        dataManager.needsBailout = true;
      }
    }
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
      log.debug('Adaptive Quality: No new requests. Setting renderSpeed to 0 (best quality).');
      stillRef.current = false;
      screenQuadRef.current.material.uniforms.gaussian.value = 7;
      invalidate();
    } else if (!stillRef.current) {
      log.debug('Adaptive Quality: No new requests and already at best quality. Setting stillRef to true.');
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

// How long after the last interaction the view stays in interactive (fast) mode
// before stepping up to high quality.
const INTERACTION_SETTLE_MS = 600;

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
    onVolumeLoadingUpdate,
    onDataManagerReady,
    volumeZReduction = 'auto',
    viewState,
    setViewState,
    isOrthographic = false,
    isColoredByResolution = false,
  } = props;
  const {
    gl,
    // scene,
    camera,
  } = useThree();

  // Request a new render.
  const invalidate = useThree(state => state.invalidate);

  const orbitRef = useRef(null);
  // OrbitControls of the volume, once rendered. State rather than a ref, so the
  // camera from the coordination space is applied as soon as they mount.
  const [volumeOrbitControls, setVolumeOrbitControls] = useState(null);
  // The viewState last written to the coordination space, to tell it apart
  // from changes made elsewhere (the view config, linked views).
  const lastViewStateRef = useRef(null);
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
  const is3D = spatialRenderingMode === '3D';
  const [dmInitComplete, setDmInitComplete] = useState(false);
  // const [loading, setLoading] = useState(false);

  // Add new refs for screen quad setup
  const screenSceneRef = useRef(null);
  const screenCameraRef = useRef(null);
  const screenQuadRef = useRef(null);

  // Whether the user is interacting (orbiting, or editing channels or layer settings).
  // A ref rather than React state, so that the very next frame sees the change:
  // with state, useFrame ran with a stale `false` and switched back to best quality.
  // Updates should be done via `startInteraction` and `endInteraction`.
  const isInteractingRef = useRef(false);
  const interactionTimeoutRef = useRef(null);


  // Track interaction-triggering props
  // const prevInteractionChannels = useRef();

  // new refs from step 2
  // const [renderSpeed, setRenderSpeed] = useState(dataManager.PT.lowestDataRes);
  const stillRef = useRef(false); // skip geometry pass when true
  const frameRef = useRef(0); // frame counter
  // Geometry passes drawn, and the one whose request buffer was last read.
  const geometryPassRef = useRef(0);
  const requestReadPassRef = useRef(0);
  const lastSampleRef = useRef(0);
  const lastFrameCountRef = useRef(0); // For more stable FPS calculation

  // const mainOrbitControlsRef = useRef(null); // Added for main view OrbitControls

  // const sameArray = (a, b) => a && b && a.length === b.length && a.every((v, i) => v === b[i]);

  // INITIALIZATION (GL-DEPENDENT ONLY)

  const dataManager = useMemo(() => new VolumeDataManager(gl), [gl]);

  const renderManager = useMemo(() => new VolumeRenderManager(), []);

  // The shader's debug style 4 colors each sample by the level it was read
  // from (res_color in VolumeFragmentShader), instead of the channel colors.
  useEffect(() => {
    renderManager.uniforms.u_renderstyle.value = isColoredByResolution ? 4 : 2;
  }, [renderManager, isColoredByResolution]);

  useEffect(() => {
    renderManager.uniforms.u_orthographic.value = isOrthographic;
  }, [renderManager, isOrthographic]);

  useEffect(() => {
    logWithColor('useEffect MRT target matching canvas');

    const { width, height } = gl.domElement;
    // We use three render targets:
    // layout(location = 0) out vec4 gColor: Final rendered color (sRGB)
    // layout(location = 1) out vec4 gRequest: Brick loading requests (packed coordinates)
    // layout(location = 2) out vec4 gUsage: Brick usage tracking (for cache management)
    // Render to three color attachments (gColor, gRequest, gUsage) via three's
    // WebGLRenderTarget `count` option. This replaced WebGLMultipleRenderTargets,
    // which three removed in r172. Requires three >=0.162 (when `count` was added);
    // the attachments are then exposed as the `.textures` array.
    const mrt = new THREE.WebGLRenderTarget(width, height, { count: 3 });
    const mrtTextures = mrt.textures;
    mrtTextures.forEach((tex) => {
      // eslint-disable-next-line no-param-reassign
      tex.format = THREE.RGBAFormat;
      // eslint-disable-next-line no-param-reassign
      tex.type = THREE.UnsignedByteType;
      // eslint-disable-next-line no-param-reassign
      // tex.encoding = THREE.LinearEncoding;
      // eslint-disable-next-line no-param-reassign
      tex.minFilter = THREE.NearestFilter;
      // eslint-disable-next-line no-param-reassign
      tex.magFilter = THREE.NearestFilter;
      // eslint-disable-next-line no-param-reassign
      tex.generateMipmaps = false;
    });

    // Create screen quad setup
    const screenScene = new THREE.Scene();
    const screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    screenCamera.position.z = 1;

    const screenMaterial = new THREE.ShaderMaterial({
      uniforms: {
        // Bind the first render target texture as the input of the gaussian blur shader.
        tDiffuse: { value: mrtTextures[0] },
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

  // In 3D, the layer controller seeds a missing channel window from quartile
  // stats that come out as NaN (getSingleSelectionStats3D in spatial-utils).
  // Replace non-finite bounds with 0 so the controls and the shader contrast stay valid.
  useEffect(() => {
    const setters = imageChannelCoordination?.[1]?.[firstImageLayerScope];
    Object.entries(firstImageLayerChannelCoordination || {}).forEach(([channelScope, values]) => {
      const window = values?.[CoordinationType.SPATIAL_CHANNEL_WINDOW];
      if (Array.isArray(window) && window.some(bound => !Number.isFinite(bound))) {
        setters?.[channelScope]?.setSpatialChannelWindow?.(
          window.map(bound => (Number.isFinite(bound) ? bound : 0)),
        );
      }
    });
  }, [imageChannelCoordination, firstImageLayerScope, firstImageLayerChannelCoordination]);


  useEffect(() => {
    logWithColor('useEffect INIT');
    let hasRerun = false;

    if (!dataManager || !renderManager) {
      log.debug('dataManager or renderManager not initialized yet');
      return;
    }

    if (!firstImage) {
      log.debug('no first image layer yet');
      return;
    }

    if (!firstImageLayerChannelCoordination) {
      log.debug('no firstImageLayerChannelCoordination yet');
      return;
    }

    const initializeDataManager = async () => {
      if (dataManager.initStatus === INIT_STATUS.COMPLETE) {
        log.debug('dataManager already initialized, skipping');
        setDmInitComplete(true);
        return;
      }
      // TODO(mark): separate the initialization which depends on gl, from the initialization which depends on images, from the dm.init(firstImageLayer)
      dataManager.initImages(images, imageLayerScopes);
      // TODO: generalize to more than one image layer.
      // volumeZReduction only applies on the first init; changing it requires a remount.
      await dataManager.init( // device limits, zarr meta
        firstImageLayerChannelCoordination,
        { zReduction: volumeZReduction },
      );
      if (hasRerun) {
        log.debug('Initialization useEffect has rerun, aborting remaining initialization');
        return;
      }
      log.debug('dataManager initialized');

      // log.debug('dm.physicalScale', dataManager.physicalScale);

      renderManager.setZarrUniforms(dataManager.zarrStore, dataManager.PT);
      renderManager.setChannelMapping(dataManager.channels.colorMappings);

      log.debug('rm.uniforms', renderManager.uniforms);

      // setManagers({ dataManager: dm, renderManager: rm });
      // if (onInitComplete) {
      //   onInitComplete({ zarrStoreInfo: dm.zarrStore, deviceLimits: dm.deviceLimits });
      // }

      setDmInitComplete(true);
      invalidate();
    };
    initializeDataManager();

    // avoid setting state on unmounted component
    // eslint-disable-next-line consistent-return
    return () => {
      hasRerun = true;
    };

    // The data manager does not have a clearCache method, should it?
    // return () => {
    //   log.debug('VolumeView useEffect cleanup: running dataManager.clearCache()');
    //   dataManager?.clearCache?.();
    // };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataManager, renderManager, images, imageLayerScopes]);

  /*
  useEffect(() => {
    logWithColor('useEffect GL');
    gl.autoClear = false;
  }, [gl]);
  */

  /*
  const extractSettings = useCallback(() => {
    logWithColor('callback extractSettings');
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

  /**
   * Switch to interactive (fast) rendering immediately.
   * Cancels a pending end, so a new interaction is never cut short by an earlier one.
   */
  const startInteraction = useEventCallback(() => {
    logWithColor('startInteraction callback');
    clearTimeout(interactionTimeoutRef.current);
    isInteractingRef.current = true;
    const meshRefUniforms = meshRef.current?.material?.uniforms;
    if (meshRefUniforms) {
      meshRefUniforms.renderRes.value = dataManager.PT.lowestDataRes;
    }
    stillRef.current = false;
    invalidate();
  });

  /**
   * Leave interactive rendering once no new interaction starts within INTERACTION_SETTLE_MS.
   */
  const endInteraction = useEventCallback(() => {
    clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, INTERACTION_SETTLE_MS);
  });

  useEffect(() => () => clearTimeout(interactionTimeoutRef.current), []);

  // TODO(mark): convert to a useMemo?
  useEffect(() => {
    const on3D = spatialRenderingMode === '3D';

    if (on3D && dataManager && renderManager && dmInitComplete) {
      logWithColor('useEffect spatialRenderingMode');
      // Direct call, no callbacks needed
      const propsForRenderManager = {
        images,
        imageLayerScopes,
        imageLayerCoordination,
        imageChannelScopesByLayer,
        imageChannelCoordination,
        spatialRenderingMode,
      };
      const previousImageSettings = renderManager.getImageSettings();
      if (renderManager.updateFromProps(propsForRenderManager)) {
        const { zarrInit } = renderManager;
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
        const nextRenderState = renderManager.updateRendering({
          zarrStoreShapes: dataManager.zarrStore.shapes,
          originalScaleXYZ: dataManager.getOriginalScaleXYZ(),
          physicalDimensionsXYZ: dataManager.getPhysicalDimensionsXYZ(),
          maxResolutionXYZ: dataManager.getMaxResolutionXYZ(),
          boxDimensionsXYZ: dataManager.getBoxDimensionsXYZ(),
          normalizedScaleXYZ: dataManager.getNormalizedScaleXYZ(),
          bcTHREE: dataManager.bcTHREE,
          ptTHREE: dataManager.ptTHREE,
        });
        if (nextRenderState) {
          setRenderState(nextRenderState);
        }
        // Layer edits (e.g., clipping planes) count as interaction, so the view redraws
        // in fast mode and requests the bricks it now needs. Only actual edits:
        // this effect also runs whenever the parent re-renders, since the coordination
        // props are new arrays each time (e.g., every second for the loading progress).
        if (!isEqual(previousImageSettings, renderManager.getImageSettings())) {
          startInteraction();
          endInteraction();
        }
      }
    }
  }, [dataManager, renderManager, images, imageLayerScopes, imageLayerCoordination, imageChannelScopesByLayer, imageChannelCoordination, spatialRenderingMode, dmInitComplete, startInteraction, endInteraction]);


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
    if (!mrtRef.current || !dataManager || !renderManager) {
      return;
    }

    // Don't render to MRT if shader is not ready - this prevents WebGL warnings
    // about missing fragment shader outputs for multiple render targets
    if (!renderState.shader) {
      return;
    }

    // Receive the same state as the useThree hook.
    const {
      gl: frameGl,
      camera: frameCamera,
      scene: frameScene,
      clock,
    } = state;

    // Pixels per voxel change with the view size and field of view.
    // Measured in screen (CSS) pixels: on high-DPI displays, device pixels
    // would ask for a level finer than the eye can tell apart.
    const uniforms = meshRef.current?.material?.uniforms;
    if (uniforms?.lodFactor && dataManager.zarrStore?.shapes?.length) {
      uniforms.lodFactor.value = getScreenLodFactor(
        renderManager.lodFactor, frameCamera.fov, mrtRef.current.height / frameGl.getPixelRatio(),
        dataManager.zarrStore.shapes[0],
      );
    }

    // Contrast windows are in data values; the brick cache stores each channel's
    // storage range as 0-1. A range set by a channel's first brick is only
    // known once that brick loads, so this follows it every frame.
    if (uniforms && dataManager.zarrStore) {
      const storageRanges = dataManager.getStorageRanges();
      renderManager.contrastLimits.forEach((window, id) => {
        const storageRange = storageRanges[id];
        if (window && storageRange && uniforms[`clim${id}`]) {
          uniforms[`clim${id}`].value.set(...windowToClim(window, storageRange));
        }
      });
    }

    if (!stillRef.current) {
      performGeometryPass(frameGl, frameCamera, frameScene, { mrtRef });
      geometryPassRef.current += 1;
    }

    performBlitPass(frameGl, { screenSceneRef, screenCameraRef });
    handleRequests(frameGl, {
      frameRef, dataManager, mrtRef, bufRequest, bufUsage, geometryPassRef, requestReadPassRef,
    });
    handleAdaptiveQuality(clock, {
      invalidate,
      isInteracting: isInteractingRef.current,
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
    logWithColor('useEffect setProcessingTargets');
    renderManager.setProcessingTargets(mrtRef.current);
  }, [renderManager, mrtRef]);
  */

  /*
  useEffect(() => {
    logWithColor('useEffect renderState');
    const u = meshRef.current?.material?.uniforms;
    if (!u) return;
    u.renderRes.value = renderSpeed;
  }, [renderSpeed]);
  */

  /*
  useEffect(() => {
    logWithColor('useEffect mainOrbitControlsRef');
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


  const onOrbitControlsStart = useEventCallback((e) => {
    startInteraction();
  });

  // Write the camera to the coordination space when an orbit, pan or zoom ends
  // (OrbitControls also sends start and end for each wheel event), rather than
  // on every frame, which would re-render the view while dragging.
  const onOrbitControlsEnd = useEventCallback((e) => {
    endInteraction();
    if (!volumeOrbitControls || !setViewState) return;
    const nextViewState = cameraToViewState(camera.position, volumeOrbitControls.target);
    lastViewStateRef.current = nextViewState;
    setViewState(nextViewState);
  });

  // The viewState object is new on every render of the parent, so the effect
  // below depends on its values.
  const {
    zoom: viewZoom, rotationX: viewRotationX, rotationOrbit: viewRotationOrbit, target: viewTarget,
  } = viewState ?? {};
  const [viewTargetX, viewTargetY, viewTargetZ] = viewTarget ?? [];

  // Apply the camera from the coordination space: the view config, a linked view.
  useEffect(() => {
    if (!volumeOrbitControls || !viewState) return;
    if (isEqual(viewState, lastViewStateRef.current)) return;
    const boxExtent = renderState.geometrySize.map((size, axis) => size * renderState.meshScale[axis]);
    const isShowable = isVolumeViewState(viewState, boxExtent);
    const nextViewState = isShowable ? viewState : DEFAULT_VOLUME_VIEW_STATE;
    logWithColor(`apply viewState ${JSON.stringify(viewState)}${isShowable ? '' : ' (out of view, reset)'}`);

    const { position, target } = viewStateToCamera(nextViewState);
    camera.position.set(...position);
    volumeOrbitControls.target.set(...target);
    volumeOrbitControls.update();
    if (!isShowable && setViewState) {
      // Replace values in other units, so the coordination space holds this camera.
      lastViewStateRef.current = DEFAULT_VOLUME_VIEW_STATE;
      setViewState(DEFAULT_VOLUME_VIEW_STATE);
    }
    // Redraw and request the bricks for the new view, also when settled.
    startInteraction();
    endInteraction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumeOrbitControls, viewZoom, viewRotationX, viewRotationOrbit,
    viewTargetX, viewTargetY, viewTargetZ]);

  // Interact while the user is sliding the channel slider
  // for smooth updates.
  useEffect(() => {
    if (!dmInitComplete) return;
    logWithColor('useEffect firstImageLayerChannelCoordination');
    startInteraction();
    log.debug('something about channels changed');

    dataManager.updateChannels(firstImageLayerChannelCoordination);
    renderManager.setChannelMapping(dataManager.channels.colorMappings);

    endInteraction();
  }, [dataManager, firstImageLayerChannelCoordination, renderManager, startInteraction, endInteraction, dmInitComplete]);

  const getLoadingProgress = useEventCallback(() => {
    if (dataManager) {
      return dataManager.getLoadingProgress();
    }
    return null;
  });

  // stopLoading and restartLoading notify right away, so the buttons
  // update on click rather than at the next poll. notifyLoadingUpdate passes
  // them to the parent in turn, so one of the two must refer ahead.
  const stopLoading = useEventCallback(() => {
    if (dataManager) {
      dataManager.stopLoading();
      // eslint-disable-next-line no-use-before-define
      notifyLoadingUpdate();
    }
  });

  const restartLoading = useEventCallback(() => {
    if (dataManager) {
      dataManager.restartLoading();
      // eslint-disable-next-line no-use-before-define
      notifyLoadingUpdate();
    }
  });

  const notifyLoadingUpdate = useEventCallback(() => {
    if (!onVolumeLoadingUpdate) return;
    onVolumeLoadingUpdate({
      loadingProgress: getLoadingProgress(),
      stillRef,
      onStopLoading: stopLoading,
      onRestartLoading: restartLoading,
    });
  });

  // The info panel, outside the Canvas, reads the dataset description and queue.
  useEffect(() => {
    if (dmInitComplete && onDataManagerReady) {
      onDataManagerReady(dataManager);
    }
  }, [dmInitComplete, dataManager, onDataManagerReady]);

  // Notify parent component about loading updates
  useEffect(() => {
    if (!onVolumeLoadingUpdate) return undefined;

    const intervalId = setInterval(notifyLoadingUpdate, 1000); // Update every 1000ms (1s)

    return () => clearInterval(intervalId);
    // `useEventCallback` ensures stable references
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onVolumeLoadingUpdate, stillRef]);

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
        ref={setVolumeOrbitControls}
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
