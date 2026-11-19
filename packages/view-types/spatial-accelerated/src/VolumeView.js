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
  getVolumeSceneFrame,
  snapshotToVolumeCamera,
  volumeCameraToSnapshot,
  DEFAULT_VOLUME_CAMERA,
  CAMERA_FAR,
} from './camera-snapshot.js';

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

// Loading counts as slow once a batch of bricks has taken this long (e.g. large
// one-plane chunks): the view then holds an image at best quality while it waits.
const SLOW_LOADING_MS = 1000;
// While loading slowly, a held image is drawn again for bricks that arrived
// since, at most this often, so that they show before the batch ends without
// keeping the GPU busy. Only the batch end reads the buffers back.
const SLOW_LOADING_REDRAW_MS = 1000;
// After an interaction, the view gets one ray step level finer this often,
// until it renders at best quality.
const RAMP_STEP_MS = 200;
// While loading quickly (frames drawn continuously), the level gets coarser
// once frames drop below this rate.
const MIN_FPS = 30;
// While interacting, frames should keep up with the display (browsers draw at
// most once per refresh, so 60 fps on most displays): the level gets coarser
// once they drop below INTERACTIVE_MIN_FPS (two frames dropped in a 200 ms
// check at 60 Hz), the coarsest below INTERACTIVE_COARSEST_FPS, and finer only
// at INTERACTIVE_FINER_FPS (no frame dropped).
const INTERACTIVE_MIN_FPS = 50;
const INTERACTIVE_COARSEST_FPS = 30;
const INTERACTIVE_FINER_FPS = 58;
// While interacting, a buffer read cycle (usage, then requests on the next frame)
// starts at most this often: each read waits for the GPU to finish the frame,
// which would otherwise make every frame of a drag uneven. Each batch started
// then ends on the next frame anyway, so mid-drag reads mostly cancel bricks of
// views already left; the view loads in earnest once the interaction ends.
const INTERACTIVE_READ_MS = 1000;

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

// Whether the GPU has run the commands before a fence (none: done). Reading
// buffers back before then blocks until it has, e.g. for a best-quality frame.
function isFenceDone(_gl, fenceRef) {
  if (!fenceRef.current) return true;
  const ctx = _gl.getContext();
  if (ctx.getSyncParameter(fenceRef.current, ctx.SYNC_STATUS) !== ctx.SIGNALED) return false;
  ctx.deleteSync(fenceRef.current);
  // eslint-disable-next-line no-param-reassign
  fenceRef.current = null;
  return true;
}

function handleRequests(_gl, {
  frameRef, dataManager, mrtRef, bufRequest, bufUsage, geometryPassRef, requestReadPassRef,
  canRead, canStartReadCycle, readCycleRef,
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
  // Nor while the last frame drawn is still rendering, or is missing bricks (canRead).
  if (dataManager.isBusy || !canRead) {
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
  } else if (dataManager.triggerUsage === true && dataManager.noNewRequests === false
    && canStartReadCycle) {
    // eslint-disable-next-line no-param-reassign
    readCycleRef.current = performance.now();
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

// Whether the last frame drawn, held while loading slowly, predates bricks of
// the last batch, so that its request buffer would ask for them again.
function isHeldFrameBehindBatch(slowLoading, drawn) {
  return slowLoading.isSlow && (drawn.uploads ?? -1) < slowLoading.uploadsAtBatchEnd;
}

// Blur of the screen pass for frames drawn at a ray step level: none at best
// quality, more the coarser the steps.
function blurForLevel(level) {
  return level === 0 ? 0 : Math.min(7, 1 + 2 * level);
}

/**
 * Track whether loading is slow: a batch has taken longer than SLOW_LOADING_MS.
 * It stays slow until a batch ends sooner, or the user interacts.
 */
function trackSlowLoading(now, { isInteracting, dataManager, slowLoadingRef }) {
  const slowLoading = slowLoadingRef.current;
  if (isInteracting) {
    Object.assign(slowLoading, { busySince: null, isSlow: false });
    return;
  }
  if (dataManager.isBusy) {
    if (slowLoading.busySince === null) slowLoading.busySince = now;
    if (now - slowLoading.busySince > SLOW_LOADING_MS) slowLoading.isSlow = true;
    return;
  }
  if (slowLoading.busySince === null) return;
  slowLoading.isSlow = now - slowLoading.busySince > SLOW_LOADING_MS;
  slowLoading.busySince = null;
  // The next request read needs a frame with the bricks of this batch. Bricks
  // that arrive later, from batches that bailed out, do not hold it back.
  slowLoading.uploadsAtBatchEnd = dataManager.uploadCount;
}

/**
 * Render quality (the shader's renderRes: ray step level, 0 the best) and
 * whether to draw the next frame (stillRef: hold the last one instead).
 * While interacting: the finest level whose frames keep up with the display
 * (INTERACTIVE_MIN_FPS), going finer while no frame drops, starting one level
 * coarser than where the last interaction left it (the coarsest at first). Afterwards, one
 * level finer every RAMP_STEP_MS down to the best quality, with less blur each
 * step. While loading is done or slow, frames are only drawn for those steps
 * and for bricks that arrived since, and held otherwise. While loading quickly,
 * frames are drawn continuously: the steps then stop at the finest level that
 * keeps MIN_FPS.
 */
function handleAdaptiveQuality(params) {
  const {
    isInteracting,
    dataManager,
    spatialRenderingModeChanging,
    meshRef,
    stillRef,
    screenQuadRef,
    frameRef,
    slowLoadingRef,
    rampRef,
    drawnRef,
    now,
  } = params;
  const ramp = rampRef.current;

  if (isInteracting) {
    // Checked every RAMP_STEP_MS; the ramp starts once the interaction has ended.
    const uniforms = meshRef.current?.material?.uniforms;
    if (uniforms?.renderRes && dataManager.PT && screenQuadRef.current
      && now - ramp.lastStep >= RAMP_STEP_MS) {
      const lowest = dataManager.PT.lowestDataRes;
      const level = Math.min(uniforms.renderRes.value, lowest);
      const fps = ((frameRef.current - ramp.lastStepFrame) * 1000) / (now - ramp.lastStep);
      let nextLevel = level;
      if (fps < INTERACTIVE_COARSEST_FPS) {
        // Far too slow, e.g. zoomed in on many more bricks: the coarsest right away.
        nextLevel = lowest;
      } else if (fps < INTERACTIVE_MIN_FPS) {
        nextLevel = Math.min(lowest, level + 1);
      } else if (fps >= INTERACTIVE_FINER_FPS && level > ramp.floor) {
        nextLevel = level - 1;
      }
      // Not finer again within this interaction, so that it does not alternate.
      if (nextLevel > level) ramp.floor = nextLevel;
      uniforms.renderRes.value = nextLevel;
      screenQuadRef.current.material.uniforms.gaussian.value = blurForLevel(nextLevel);
      ramp.interactiveLevel = nextLevel;
      ramp.lastStep = now;
      ramp.lastStepFrame = frameRef.current;
    }
    // While the user is interacting, we want to ensure that the next frame's handleRequests call
    // will trigger the processUsageData call, and subsequently the processRequestData call
    // (since processUsageData will set triggerRequest to true its conclusion).
    // But only if not manually stopped by the user
    if (!dataManager.manuallyStopped) {
      dataManager.noNewRequests = false;
      dataManager.triggerUsage = true;
      // Newly visible regions need their coarse levels first.
      dataManager.resetProgressiveLevel();
      // A batch in flight was requested for the previous view: stop it early,
      // so that the buffers are read again for the current one. Its bricks still
      // loading are aborted once the current view no longer requests them.
      if (dataManager.isBusy) {
        dataManager.requestBailout();
      }
    }
    return;
  }
  const uniforms = meshRef.current?.material?.uniforms;
  if (spatialRenderingModeChanging || !uniforms?.renderRes || !dataManager.PT
    || !screenQuadRef.current) {
    return;
  }

  const lowest = dataManager.PT.lowestDataRes;
  const level = Math.min(uniforms.renderRes.value, lowest);
  const isStepDue = now - ramp.lastStep >= RAMP_STEP_MS;
  const slowLoading = slowLoadingRef.current;
  let nextLevel = level;
  if (dataManager.noNewRequests || slowLoading.isSlow) {
    // Loading is done or slow: draw a frame only for a ramp step, or for bricks
    // that arrived since the last one, and hold it otherwise.
    const drawn = drawnRef.current;
    let isDrawDue = false;
    if (level > 0 && isStepDue) {
      nextLevel = level - 1;
      ramp.lastStep = now;
      isDrawDue = true;
    } else if (drawn.uploads !== dataManager.uploadCount) {
      // The next request read needs the last batch's bricks right away; other
      // bricks are drawn at most every SLOW_LOADING_REDRAW_MS.
      const isReadDue = !dataManager.isBusy && !dataManager.noNewRequests
        && (dataManager.triggerUsage || dataManager.triggerRequest);
      isDrawDue = (isReadDue && isHeldFrameBehindBatch(slowLoading, drawn))
        || now - drawn.at > SLOW_LOADING_REDRAW_MS;
    }
    stillRef.current = !isDrawDue;
  } else {
    // Loading quickly: frames are drawn continuously. Step finer while they
    // keep MIN_FPS; once they do not, step back and stay there.
    stillRef.current = false;
    if (isStepDue) {
      const fps = ((frameRef.current - ramp.lastStepFrame) * 1000) / (now - ramp.lastStep);
      if (fps < MIN_FPS && level < lowest) {
        nextLevel = level + 1;
        ramp.floor = nextLevel;
      } else if (level > ramp.floor) {
        nextLevel = level - 1;
      }
      ramp.lastStep = now;
      ramp.lastStepFrame = frameRef.current;
    }
  }
  if (!stillRef.current) {
    uniforms.renderRes.value = nextLevel;
    screenQuadRef.current.material.uniforms.gaussian.value = blurForLevel(nextLevel);
  }
}

// END Functions called with useFrame

// How long after the last interaction the view stays in interactive (fast) mode
// before stepping up to high quality (one RAMP_STEP_MS, as each later step).
const INTERACTION_SETTLE_MS = RAMP_STEP_MS;

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
    // Shared with the other 3D views (spatialBeta, Neuroglancer), in world units.
    spatialCameraSnapshot,
    setSpatialCameraSnapshot,
    isOrthographic = false,
    isColoredByResolution = false,
    // Bricks fetched at once: a positive integer, or Infinity for no limit.
    // Unset uses DEFAULT_MAX_CONCURRENT_BRICK_REQUESTS. Can change at any time.
    volumeMaxConcurrentBrickRequests,
    // Load missing coarser levels before the requested one. Can change at any time.
    volumeProgressiveLoading = false,
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
  // The camera snapshot last written to the coordination space or applied to
  // the camera, to tell it apart from changes made elsewhere (the view config,
  // linked views).
  const lastCameraSnapshotRef = useRef(null);
  // True while a snapshot is applied, so that the OrbitControls change it
  // causes is not written back.
  const isApplyingSnapshotRef = useRef(false);
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
  // Placed after a frame that is then held; buffers are read back once it is done.
  const fenceRef = useRef(null);
  // When the last buffer read cycle started (see INTERACTIVE_READ_MS).
  const readCycleRef = useRef(0);
  // Slow loading (see trackSlowLoading): since when the current batch has run,
  // and the brick uploads when the last batch ended.
  const slowLoadingRef = useRef({ busySince: null, isSlow: false, uploadsAtBatchEnd: 0 });
  // Render quality steps (see handleAdaptiveQuality): when the last step was
  // taken, the frame count then, the finest level that keeps up (within an
  // interaction, or while loading quickly), and the level interaction left off at.
  const rampRef = useRef({
    lastStep: 0, lastStepFrame: 0, floor: 0, interactiveLevel: null,
  });
  // The last frame drawn: the brick uploads it shows, and when it was drawn.
  const drawnRef = useRef({ uploads: null, at: 0 });

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

  // Applies to brick fetches not yet started.
  useEffect(() => {
    dataManager.setMaxConcurrentBrickRequests(volumeMaxConcurrentBrickRequests);
  }, [dataManager, volumeMaxConcurrentBrickRequests]);

  // Applies from the next request read.
  useEffect(() => {
    dataManager.setProgressiveLoading(volumeProgressiveLoading);
  }, [dataManager, volumeProgressiveLoading]);

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
    const ramp = rampRef.current;
    const meshRefUniforms = meshRef.current?.material?.uniforms;
    if (meshRefUniforms && dataManager.PT) {
      // One level coarser than where the last interaction left off, which kept
      // up with this view, so that the first frames have room to spare.
      const lowest = dataManager.PT.lowestDataRes;
      const level = Math.min((ramp.interactiveLevel ?? lowest) + 1, lowest);
      meshRefUniforms.renderRes.value = level;
      if (screenQuadRef.current) {
        screenQuadRef.current.material.uniforms.gaussian.value = blurForLevel(level);
      }
    }
    // Levels may get as fine as frames keep up with again, measured from now.
    ramp.floor = 0;
    ramp.lastStep = performance.now();
    ramp.lastStepFrame = frameRef.current;
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

    // Progressive loading: no brick finer than this level is requested.
    if (uniforms?.minRequestRes) {
      uniforms.minRequestRes.value = dataManager.getMinRequestLevel();
    }

    const now = performance.now();
    const slowLoading = slowLoadingRef.current;
    if (!stillRef.current) {
      performGeometryPass(frameGl, frameCamera, frameScene, { mrtRef });
      geometryPassRef.current += 1;
      drawnRef.current = { uploads: dataManager.uploadCount, at: now };
      // A frame that is then held (loading done or slow) may be at best quality,
      // which can take long: its buffers are read once it is done. Not frames
      // drawn continuously, which would each push the reads back.
      if (slowLoading.isSlow || dataManager.noNewRequests) {
        const ctx = frameGl.getContext();
        if (fenceRef.current) ctx.deleteSync(fenceRef.current);
        fenceRef.current = ctx.fenceSync(ctx.SYNC_GPU_COMMANDS_COMPLETE, 0);
      }
    }

    performBlitPass(frameGl, { screenSceneRef, screenCameraRef });
    handleRequests(frameGl, {
      frameRef,
      dataManager,
      mrtRef,
      bufRequest,
      bufUsage,
      geometryPassRef,
      requestReadPassRef,
      // A held image without the last batch's bricks is drawn again first.
      canRead: !isHeldFrameBehindBatch(slowLoading, drawnRef.current)
        && isFenceDone(frameGl, fenceRef),
      canStartReadCycle: !isInteractingRef.current
        || now - readCycleRef.current >= INTERACTIVE_READ_MS,
      readCycleRef,
    });
    trackSlowLoading(now, { isInteracting: isInteractingRef.current, dataManager, slowLoadingRef });
    handleAdaptiveQuality({
      isInteracting: isInteractingRef.current,
      dataManager,
      spatialRenderingModeChanging,
      meshRef,
      stillRef,
      screenQuadRef,
      frameRef,
      slowLoadingRef,
      rampRef,
      drawnRef,
      now,
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

  // How world units (of spatialCameraSnapshot) relate to the units of the
  // scene, in which the volume box is about 1 wide and centered on the origin.
  const firstImageWrapper = firstImage?.image?.instance;
  const { geometrySize, meshScale, shader: renderShader } = renderState;
  const sceneFrame = useMemo(() => {
    const physicalSizeZYX = dmInitComplete ? dataManager.zarrStore?.physicalSizeTotal : null;
    if (!physicalSizeZYX || !renderShader) return null;
    // Column-major: the translation is in elements 12 to 14.
    const modelMatrix = firstImageWrapper?.getModelMatrix?.();
    return getVolumeSceneFrame({
      physicalSize: [...physicalSizeZYX].reverse(),
      boxExtent: geometrySize.map((size, axis) => size * meshScale[axis]),
      origin: modelMatrix ? [modelMatrix[12], modelMatrix[13], modelMatrix[14]] : undefined,
      metersPerUnit: firstImageWrapper?.getSceneMetersPerUnit?.() ?? null,
    });
  }, [dmInitComplete, dataManager, renderShader, firstImageWrapper, geometrySize, meshScale]);

  // Write the camera to the coordination space on every change, so that
  // linked 3D views follow. Each write re-renders this view and the linked
  // views, so a camera equal to the last one written or applied is skipped.
  const onOrbitControlsChange = useEventCallback((e) => {
    if (isApplyingSnapshotRef.current) return;
    if (!volumeOrbitControls || !sceneFrame || !setSpatialCameraSnapshot) return;
    const snapshot = volumeCameraToSnapshot({
      position: camera.position.toArray(),
      target: volumeOrbitControls.target.toArray(),
      quaternion: camera.quaternion.toArray(),
      fovDegrees: camera.fov,
    }, sceneFrame);
    if (isEqual(snapshot, lastCameraSnapshotRef.current)) return;
    lastCameraSnapshotRef.current = snapshot;
    setSpatialCameraSnapshot(snapshot);
  });

  // OrbitControls also sends start and end for each wheel event.
  const onOrbitControlsEnd = useEventCallback((e) => {
    endInteraction();
  });

  // Apply the camera from the coordination space: the view config, a linked view.
  useEffect(() => {
    if (!volumeOrbitControls || !sceneFrame) return;
    // Our own write coming back, or a linked view writing the same camera
    // (possibly as a new object): the camera is already there.
    if (isEqual(spatialCameraSnapshot, lastCameraSnapshotRef.current)) return;
    // No snapshot (e.g. cleared to recenter): the initial camera.
    const nextCamera = spatialCameraSnapshot
      ? snapshotToVolumeCamera(spatialCameraSnapshot, sceneFrame, camera.fov)
      : { ...DEFAULT_VOLUME_CAMERA, distance: DEFAULT_VOLUME_CAMERA.position[2] };
    if (!nextCamera) {
      log.warn('Ignoring a spatialCameraSnapshot that is not usable', spatialCameraSnapshot);
      return;
    }
    lastCameraSnapshotRef.current = spatialCameraSnapshot;
    logWithColor(`apply spatialCameraSnapshot ${JSON.stringify(spatialCameraSnapshot)}`);

    const {
      position, target, up, distance,
    } = nextCamera;
    // OrbitControls.update() calls camera.lookAt(target), which builds the
    // orientation from camera.up, so setting it keeps the roll of the snapshot.
    // OrbitControls keep orbiting around the axis that was up when they were
    // created (Y), as in the spatialBeta Deck.gl view.
    camera.up.set(...up);
    camera.position.set(...position);
    // Keep the volume within the far plane when the camera is further away.
    camera.far = Math.max(CAMERA_FAR, distance + 2 * Math.max(...sceneFrame.boxExtent));
    camera.updateProjectionMatrix();
    volumeOrbitControls.target.set(...target);
    isApplyingSnapshotRef.current = true;
    volumeOrbitControls.update();
    isApplyingSnapshotRef.current = false;
    // Redraw and request the bricks for the new view, also when settled.
    startInteraction();
    endInteraction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumeOrbitControls, sceneFrame, spatialCameraSnapshot]);

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
        onChange={onOrbitControlsChange}
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
