/* eslint-disable no-unused-vars */
import {
  UniformsUtils,
} from 'three';
import { CoordinationType } from '@vitessce/constants-internal';
import { log, atLeastLogLevel, LogLevel } from '@vitessce/globals';
import { VolumeShader } from './VolumeShader.js';

function logWithColor(message) {
  if (atLeastLogLevel(LogLevel.DEBUG)) {
    console.warn(
      `%cRM: ${message}`,
      'background: orange; color: white; padding: 2px; border-radius: 3px;',
    );
  }
}

/**
 * A color channel (0-255) of an sRGB color, as picked in the controls, in
 * linear RGB (0-1). The shader blends in linear RGB and converts its result to
 * sRGB, so a fully bright voxel shows the picked color.
 * @param {number} value 0-255.
 * @returns {number} 0-1.
 */
export function srgbToLinear(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * A contrast window in data values as the shader's contrast limits: fractions
 * of the value range its channel is stored over (as 0-1) in the brick cache.
 * @param {[number, number]} window [low, high] in data values.
 * @param {[number, number]} storageRange [min, max] stored as 0-1.
 * @returns {[number, number]}
 */
export function windowToClim([low, high], [min, max]) {
  const range = (max - min) || 1;
  return [(low - min) / range, (high - min) / range];
}

/**
 * The shader's LOD factor for a spatialLodFactor value, so that 1 targets about
 * one level-0 voxel per screen pixel, whatever the view size, field of view, or
 * volume shape. The shader scales its factor by voxelEdge / 256, and the volume
 * box is one unit wide in x.
 * @param {number} lodFactor The spatialLodFactor coordination value.
 * @param {number} fov The camera's vertical field of view, in degrees.
 * @param {number} heightPx Height of the rendered image, in screen (CSS) pixels.
 * @param {number[]} shape Level-0 shape, TCZYX.
 * @returns {number}
 */
export function getScreenLodFactor(lodFactor, fov, heightPx, shape) {
  const fovRadians = fov * Math.PI / 180;
  const shapeX = shape[4];
  const voxelEdge = Math.max(shape[2], shape[3], shape[4]);
  return lodFactor * 2 * Math.tan(fovRadians / 2) * shapeX * 256 / (heightPx * voxelEdge);
}

/**
 * The range of the layer controller's clipping sliders per axis, XYZ, as
 * ImageWrapper.getBoundingCube computes it: 0 to the level-0 extent, in
 * physical units when the image has physical sizes. Also accepts uppercase
 * axis names.
 * @param {number[]} shape Level-0 shape of the loader.
 * @param {string[]} labels Axis names of the loader.
 * @param {number[]} modelMatrix The image's model matrix (column-major 4x4).
 * @returns {number[][]} [[0, xMax], [0, yMax], [0, zMax]]
 */
export function getClippingBounds(shape, labels, modelMatrix) {
  const axisSize = (axis) => {
    const index = labels.indexOf(axis);
    return shape[index === -1 ? labels.indexOf(axis.toUpperCase()) : index];
  };
  return [
    [0, modelMatrix[0] * axisSize('x')],
    [0, modelMatrix[5] * axisSize('y')],
    [0, modelMatrix[10] * axisSize('z')],
  ];
}

/**
 * Map a clipping slider range to the shader's box coordinates (0 to boxSize),
 * as a fraction of the slider's range. This holds whatever the slider units
 * are, and whichever levels the volume renders from.
 * @param {number[]|null} slice The slider range, or null when not set.
 * @param {number[]} bounds The slider's [min, max].
 * @param {number} boxSize The box extent along this axis.
 * @returns {number[]} [min, max] in box coordinates, or the shader's inactive
 * value (-1, 100000) without a slice or valid bounds.
 */
export function sliceToClip(slice, bounds, boxSize) {
  const [min, max] = bounds;
  if (!Array.isArray(slice) || !(max > min)) return [-1, 100000];
  const toBox = value => ((value - min) / (max - min)) * boxSize;
  return [toBox(slice[0]), toBox(slice[1])];
}

/**
 * Manages the volume rendering state, shader setup, and uniform management
 * Serves as a replacement for many functions from three-utils.js
 */
export class VolumeRenderManager {
  constructor() {
    logWithColor('Initializing VolumeRenderManager');
    // Rendering settings
    this.uniforms = null;
    this.shader = null;
    this.meshScale = [1, 1, 1];
    this.geometrySize = [1, 1, 1];
    this.boxSize = [1, 1, 1];
    this.zarrInit = false;

    // Channel and texture state
    this.channelsVisible = [];
    this.channelTargetC = [];
    this.zarrStoreNumResolutions = null;
    this.channelMaxResolutionIndex = [];
    this.colors = [];
    this.contrastLimits = [];
    this.layerTransparency = 1.0;
    this.xSlice = null;
    this.ySlice = null;
    this.zSlice = null;
    this.clippingBounds = [[0, 1], [0, 1], [0, 1]]; // range of the clipping sliders, XYZ
    this.originalScale = [1, 1, 1];
    this.physicalDimensions = [1, 1, 1]; // can be used later, currently our props scale by pixel
    this.maxResolution = [1, 1, 1];
    this.finestRes = 0; // finest renderable level, set in setZarrUniforms
    this.lodFactor = 1.0; // spatialLodFactor; VolumeView sets the shader's factor from it

    // Additional state
    // this.mrt = null; // Single MRT reference

    // Initialize shader
    this.initializeShader();
  }

  /**
   * Initialize shader and uniform objects
   */
  initializeShader() {
    logWithColor('Initializing shader');
    this.shader = VolumeShader;
    this.uniforms = UniformsUtils.clone(this.shader.uniforms);
  }

  /**
   * Extract rendering settings from coordination props
   * @param {Object} props - Component props
   * @returns {Object} Extracted rendering settings
   */
  // eslint-disable-next-line class-methods-use-this
  extractRenderingSettingsFromProps(props) {
    const {
      images = {},
      imageLayerScopes = [],
      imageLayerCoordination = [{}],
      imageChannelScopesByLayer = {},
      imageChannelCoordination = [{}],
      spatialRenderingMode,
    } = props;

    const layerScope = imageLayerScopes[0];
    if (!layerScope) {
      logWithColor('Extracting rendering settings from props - no layer scope');
      return {
        valid: false,
      };
    }

    const channelScopes = imageChannelScopesByLayer[layerScope];
    const layerCoordination = imageLayerCoordination[0][layerScope];
    const channelCoordination = imageChannelCoordination[0][layerScope];

    const data = images[layerScope]?.image?.instance?.getData();
    if (!data) {
      logWithColor('Extracting rendering settings from props - no image data');
      return {
        valid: false,
      };
    }


    if (!channelCoordination[channelScopes?.[0]][CoordinationType.SPATIAL_CHANNEL_WINDOW]) {
      // We don't want to initialize with a null spatialChannelWindow,
      // since down below we use the default value of [0, 255], but we may have a Uint16 image.
      // This will cause the sliders to not affect the contrast limits until below 255,
      // but their range will be much larger (e.g., 0-65535).

      // TODO(mark): the defaults should be set based on the image dtype.
      logWithColor('Extracting rendering settings from props - no channel window set');
      return {
        valid: false,
      };
    }

    const imageWrapperInstance = images[layerScope].image.instance;
    const is3dMode = spatialRenderingMode === '3D';
    const isRgb = layerCoordination[CoordinationType.PHOTOMETRIC_INTERPRETATION] === 'RGB';
    const visible = layerCoordination[CoordinationType.SPATIAL_LAYER_VISIBLE];
    const layerTransparency = layerCoordination[CoordinationType.SPATIAL_LAYER_OPACITY];

    // Extract colors
    const colors = isRgb ? ([
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
    ]) : channelScopes.map(cScope => (
      channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_COLOR]
    ));

    // Extract contrast limits
    const contrastLimits = isRgb ? ([
      [0, 255],
      [0, 255],
      [0, 255],
    ]) : channelScopes.map(cScope => (
      channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_WINDOW]
         || ([0, 255])
    ));

    // Extract channel visibility
    const channelsVisible = isRgb ? ([
      visible && true,
      visible && true,
      visible && true,
    ]) : channelScopes.map(cScope => (
      visible && channelCoordination[cScope][CoordinationType.SPATIAL_CHANNEL_VISIBLE]
    ));

    // Extract channel target indices
    const channelTargetC = isRgb ? ([
      visible && true,
      visible && true,
      visible && true,
    ]) : channelScopes.map(cScope => (
      visible && imageWrapperInstance.getChannelIndex(
        channelCoordination[cScope][CoordinationType.SPATIAL_TARGET_C],
      )
    ));

    // Get max resolution index
    const channelMaxResolutionIndex = isRgb ? ([
      visible && null,
      visible && null,
      visible && null,
    ]) : channelScopes.map(cScope => (
      channelCoordination[cScope][CoordinationType.SPATIAL_MAX_RESOLUTION]
    ));


    // Get slice planes (null when not set)
    const xSlice = layerCoordination[CoordinationType.SPATIAL_SLICE_X] ?? null;
    const ySlice = layerCoordination[CoordinationType.SPATIAL_SLICE_Y] ?? null;
    const zSlice = layerCoordination[CoordinationType.SPATIAL_SLICE_Z] ?? null;
    const lodFactor = layerCoordination[CoordinationType.SPATIAL_LOD_FACTOR] ?? 1.0;

    const source = Array.isArray(data) ? data[0] : data;
    const clippingBounds = getClippingBounds(
      source.shape, source.labels, imageWrapperInstance.getModelMatrix(),
    );

    const allChannels = images[layerScope].image.loaders[0].channels;

    logWithColor('Extracting rendering settings from props - success');

    return {
      valid: true,
      channelsVisible,
      allChannels,
      channelTargetC,
      channelMaxResolutionIndex,
      data,
      colors,
      contrastLimits,
      is3dMode,
      layerTransparency,
      xSlice,
      ySlice,
      zSlice,
      clippingBounds,
      lodFactor,
    };
  }

  /**
   * Update the render settings from the given props
   * @param {Object} props - Component props
   * @returns {boolean} True if settings were successfully updated
   */
  updateFromProps(props) {
    const settings = this.extractRenderingSettingsFromProps(props);
    if (!settings.valid) {
      logWithColor('Updating from props - invalid settings');

      return false;
    }

    // Store the extracted settings
    this.channelsVisible = settings.channelsVisible;
    this.channelTargetC = settings.channelTargetC;
    this.channelMaxResolutionIndex = settings.channelMaxResolutionIndex;
    this.colors = settings.colors;
    this.contrastLimits = settings.contrastLimits;
    this.renderingMode = settings.renderingMode;
    this.layerTransparency = settings.layerTransparency;
    this.xSlice = settings.xSlice;
    this.ySlice = settings.ySlice;
    this.zSlice = settings.zSlice;
    this.clippingBounds = settings.clippingBounds;
    // Converted to the shader's factor every frame (getScreenLodFactor), since
    // that depends on the view size.
    this.lodFactor = settings.lodFactor;

    logWithColor(`lodFactor ${settings.lodFactor}`);

    logWithColor('Updating from props - success');
    return true;
  }

  /**
   * The settings from props that change the rendered image. updateFromProps
   * replaces rather than mutates them, so a snapshot can be compared later.
   * @returns {object}
   */
  getImageSettings() {
    return {
      channelsVisible: this.channelsVisible,
      channelTargetC: this.channelTargetC,
      channelMaxResolutionIndex: this.channelMaxResolutionIndex,
      colors: this.colors,
      contrastLimits: this.contrastLimits,
      layerTransparency: this.layerTransparency,
      xSlice: this.xSlice,
      ySlice: this.ySlice,
      zSlice: this.zSlice,
      lodFactor: this.lodFactor,
    };
  }

  /**
   * Update the rendering based on the current volume data from the data manager
   * @param {object} volumeDataManagerProps - Params derived from the volume data manager
   * @returns {Object|null} Updated rendering settings or null if rendering is not possible
   */
  updateRendering({
    zarrStoreShapes,
    originalScaleXYZ,
    physicalDimensionsXYZ,
    maxResolutionXYZ,
    boxDimensionsXYZ,
    normalizedScaleXYZ,
    bcTHREE,
    ptTHREE,
  }) {
    logWithColor('Updating rendering');

    // Check if we have at least one visible channel
    const visibleChannelIndex = this.channelTargetC.findIndex(
      (channel, idx) => this.channelsVisible[idx],
    );

    // if (visibleChannelIndex === -1) {
    //   return null;
    // }

    // Instead of getting dimensions from a volume, get from zarrStore
    if (!Array.isArray(zarrStoreShapes) || zarrStoreShapes.length === 0) {
      return null;
    }

    // Get dimensions from zarrStore
    const shape = zarrStoreShapes[0];
    // Use the highest resolution shape (shape at index 0)
    // Shape format is typically [t, c, z, y, x]
    const dimensions = {
      xLength: shape[4] || 1,
      yLength: shape[3] || 1,
      zLength: shape[2] || 1,
    };

    // Collect settings for active channels
    const texturesList = [];
    const colorsSave = [];

    // ', this);

    // log.debug('this.channelsVisible', this.channelsVisible);
    // log.debug('this.channelTargetC', this.channelTargetC);
    // log.debug('this.colors', this.colors);
    // log.debug('this.contrastLimits', this.contrastLimits);

    this.channelTargetC.forEach((channel, id) => {
      // log.debug('channel', channel);
      // log.debug('id', id);
      // log.debug('this.channelsVisible', this.channelsVisible);
      if (this.channelsVisible[id] || true) { // TODO: remove true
        // log.debug('this.colors[id]', this.colors[id]);
        // log.debug('this.channelsVisible[id]', this.channelsVisible[id]);

        colorsSave.push([
          srgbToLinear(this.colors[id][0]),
          srgbToLinear(this.colors[id][1]),
          srgbToLinear(this.colors[id][2]),
          this.channelsVisible[id] ? 1.0 : 0.0,
        ]);

        log.debug('colorsSave', colorsSave);
      }
    });

    if (!this.zarrInit) {
      // Initialize from zarrStore data
      this.originalScale = originalScaleXYZ;
      this.physicalDimensions = physicalDimensionsXYZ;
      this.maxResolution = maxResolutionXYZ;
      const scaledResolution = boxDimensionsXYZ;
      this.normalizedScale = normalizedScaleXYZ;

      this.meshScale = [
        this.originalScale[0] / this.originalScale[0],
        this.originalScale[1] / this.originalScale[0],
        this.originalScale[2] / this.originalScale[0],
      ];
      this.geometrySize = scaledResolution;
      this.boxSize = scaledResolution;

      log.debug('this.boxSize', this.boxSize);
      log.debug('this.geometrySize', this.geometrySize);
      log.debug('this.meshScale', this.meshScale);
      log.debug('this.originalScale', this.originalScale);
      log.debug('this.physicalDimensions', this.physicalDimensions);
      log.debug('this.maxResolution', this.maxResolution);
      log.debug('scaledResolution', scaledResolution);

      this.zarrInit = true;
    }

    // Update shader uniforms
    this.updateUniforms(
      texturesList,
      dimensions, // Pass dimensions object instead of volume
      this.renderingMode,
      colorsSave,
      this.layerTransparency,
      this.xSlice, this.ySlice, this.zSlice,
      bcTHREE,
      ptTHREE,
    );

    return {
      uniforms: this.uniforms,
      shader: this.shader,
      meshScale: this.meshScale,
      geometrySize: this.geometrySize,
      boxSize: this.boxSize,
    };
  }

  /**
   * Update shader uniforms with current rendering values
   * @param {Array} textures - List of 3D textures
   * @param {Object} dimensions - Dimensions object
   * @param {number} renderstyle - Rendering mode value
   * @param {Array} colors - List of colors for each channel
   * @param {number} layerTransparency - Overall transparency value
   * @param {number[]|null} xSlice - X clipping slider range
   * @param {number[]|null} ySlice - Y clipping slider range
   * @param {number[]|null} zSlice - Z clipping slider range
   */
  updateUniforms(
    textures, dimensions, renderstyle, colors, layerTransparency,
    xSlice, ySlice, zSlice,
    brickCacheTexture, pageTableTexture,
  ) {
    logWithColor('Updating uniforms');
    // Set base uniforms
    this.uniforms.boxSize.value.set(this.boxSize[0], this.boxSize[1], this.boxSize[2]);

    // Set texture uniforms
    this.uniforms.brickCacheTex.value = brickCacheTexture;
    this.uniforms.pageTableTex.value = pageTableTexture;

    // Set general rendering parameters
    this.uniforms.near.value = 0.1;
    this.uniforms.far.value = 3000; // TODO: check this
    this.uniforms.opacity.value = layerTransparency;
    this.uniforms.volumeCount.value = textures.length;

    // Set size and scale parameters using dimensions object
    this.uniforms.u_size.value.set(dimensions.xLength, dimensions.yLength, dimensions.zLength);
    this.uniforms.u_window_size.value.set(0, 0);
    this.uniforms.u_vol_scale.value.set(
      1.0 / dimensions.xLength,
      1.0 / dimensions.yLength,
      1.0 / dimensions.zLength * 2.0,
    );

    // Contrast limits (clim0-6) depend on the storage range of each channel,
    // known only once its first brick loads: VolumeView sets them every frame.

    // Set clipping planes. The slider values are in the units of the slider
    // range (physical when the image has physical sizes), not voxels.
    this.uniforms.xClip.value.set(...sliceToClip(xSlice, this.clippingBounds[0], this.boxSize[0]));
    this.uniforms.yClip.value.set(...sliceToClip(ySlice, this.clippingBounds[1], this.boxSize[1]));
    this.uniforms.zClip.value.set(...sliceToClip(zSlice, this.clippingBounds[2], this.boxSize[2]));

    // Set colors (up to 7 channels)
    this.uniforms.color0.value.set(
      colors.length > 0 ? colors[0][0] : null,
      colors.length > 0 ? colors[0][1] : null,
      colors.length > 0 ? colors[0][2] : null,
      colors.length > 0 ? colors[0][3] : null,
    );
    this.uniforms.color1.value.set(
      colors.length > 1 ? colors[1][0] : null,
      colors.length > 1 ? colors[1][1] : null,
      colors.length > 1 ? colors[1][2] : null,
      colors.length > 1 ? colors[1][3] : null,
    );
    this.uniforms.color2.value.set(
      colors.length > 2 ? colors[2][0] : null,
      colors.length > 2 ? colors[2][1] : null,
      colors.length > 2 ? colors[2][2] : null,
      colors.length > 2 ? colors[2][3] : null,
    );
    this.uniforms.color3.value.set(
      colors.length > 3 ? colors[3][0] : null,
      colors.length > 3 ? colors[3][1] : null,
      colors.length > 3 ? colors[3][2] : null,
      colors.length > 3 ? colors[3][3] : null,
    );
    this.uniforms.color4.value.set(
      colors.length > 4 ? colors[4][0] : null,
      colors.length > 4 ? colors[4][1] : null,
      colors.length > 4 ? colors[4][2] : null,
      colors.length > 4 ? colors[4][3] : null,
    );
    this.uniforms.color5.value.set(
      colors.length > 5 ? colors[5][0] : null,
      colors.length > 5 ? colors[5][1] : null,
      colors.length > 5 ? colors[5][2] : null,
      colors.length > 5 ? colors[5][3] : null,
    );
    this.uniforms.color6.value.set(
      colors.length > 6 ? colors[6][0] : null,
      colors.length > 6 ? colors[6][1] : null,
      colors.length > 6 ? colors[6][2] : null,
      colors.length > 6 ? colors[6][3] : null,
    );
    for (let i = 0; i < 7; i++) {
      if (typeof this.channelMaxResolutionIndex[i] === 'number') {
        // Never finer than finestRes.
        this.uniforms[`res${i}`].value.set(
          Math.max(this.finestRes, this.channelMaxResolutionIndex[i]),
          this.zarrStoreNumResolutions - 1,
        );
      }
    }
  }

  /**
   * Sets the processing render target
   * @param {import('three').WebGLRenderTarget} mrt - Render target with 3 attachments
   */
  /*
  setProcessingTargets(mrt) {
    logWithColor('setting processing targets');
    this.mrt = mrt;
  }
  */

  setChannelMapping(channelMapping) {
    logWithColor('setting channel mapping');
    log.debug('channelMapping', channelMapping);
    this.uniforms.channelMapping.value = channelMapping;
  }

  // Only called on initialization of the
  // VolumeDataManager and VolumeRenderManager for a particular image.
  setZarrUniforms(
    zarrStore, PT,
  ) {
    logWithColor('setting zarr uniforms');
    log.debug('zarrStore', zarrStore);
    log.debug('PT', PT);
    for (let i = 0; i <= 9; i++) {
      if (PT.anchors && PT.anchors[i]) {
        this.uniforms[`anchor${i}`].value.set(
          PT.anchors[i][0] || 0,
          PT.anchors[i][1] || 0,
          PT.anchors[i][2] || 0,
        );
      } else {
        // Set default values if anchor doesn't exist
        log.debug('anchor', i, 'does not exist');
        this.uniforms[`anchor${i}`].value.set(0, 0, 0);
      }
      if (zarrStore.scales && zarrStore.scales[i]) {
        this.uniforms[`scale${i}`].value.set(
          zarrStore.scales[i][0] || 1,
          zarrStore.scales[i][1] || 1,
          zarrStore.scales[i][2] || 1,
        );
      } else {
        log.debug('scale', i, 'does not exist');
      }
    }
    log.debug('zarrStore.brickLayout', zarrStore.brickLayout);
    this.zarrStoreNumResolutions = zarrStore.brickLayout.length;
    // The finest level rendered: level 0 (full resolution) unless restricted.
    this.finestRes = zarrStore.finestLevel ?? 0;
    for (let i = 0; i < 7; i++) {
      this.uniforms[`res${i}`].value.set(
        // TODO(mark) make this dependent on the per-channel maxResolution slider value.
        this.finestRes, zarrStore.brickLayout.length - 1,
      );
    }
    this.uniforms.resGlobal.value.set(
      this.finestRes, zarrStore.brickLayout.length - 1,
    );
    this.uniforms.voxelExtents.value.set(
      zarrStore.shapes[0][4],
      zarrStore.shapes[0][3],
      zarrStore.shapes[0][2],
    );
    this.uniforms.maxChannels.value = Math.min(zarrStore.channelCount, 7);
    log.debug('this.channelsVisible', this.channelsVisible);
    log.debug('zarrStore.shapes[0]', zarrStore.shapes[0]);
    log.debug('PT', PT);
    log.debug('uniforms', this.uniforms);
    // this.uniforms.physicalScale.value.set(physicalScale);
  }
}
