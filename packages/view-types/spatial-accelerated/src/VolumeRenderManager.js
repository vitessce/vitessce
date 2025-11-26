/* eslint-disable no-unused-vars */
import {
  Vector2,
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
 * Normalize a value based on the volume's min/max range
 * @param {number} value - Value to normalize
 * @param {Array} minMax - [min, max] values of the volume
 * @returns {number} Normalized value
 */
function normalizeValue(value, minMax) {
  return value / minMax[1];
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
    this.xSlice = new Vector2(-1, 100000);
    this.ySlice = new Vector2(-1, 100000);
    this.zSlice = new Vector2(-1, 100000);
    this.originalScale = [1, 1, 1];
    this.physicalDimensions = [1, 1, 1]; // can be used later, currently our props scale by pixel
    this.maxResolution = [1, 1, 1];

    this.maxRange = 255;
    this.maxRangeSet = false;

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
      // TODO(mark): wait for all channel IQR ranges to be computed before initializing,
      // as we do not want this.maxRange to be incorrect.
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

    if (!this.maxRangeSet) {
      this.maxRange = Math.max(...contrastLimits.map(limit => limit[1]));
      this.maxRangeSet = true;
    }

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


    // Get slice planes
    let xSlice = layerCoordination[CoordinationType.SPATIAL_SLICE_X];
    let ySlice = layerCoordination[CoordinationType.SPATIAL_SLICE_Y];
    let zSlice = layerCoordination[CoordinationType.SPATIAL_SLICE_Z];
    const lodFactor = layerCoordination[CoordinationType.SPATIAL_LOD_FACTOR] ?? 1.0;

    xSlice = xSlice !== null ? xSlice : new Vector2(-1, 100000);
    ySlice = ySlice !== null ? ySlice : new Vector2(-1, 100000);
    zSlice = zSlice !== null ? zSlice : new Vector2(-1, 100000);

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
    this.uniforms.lodFactor.value = settings.lodFactor;

    logWithColor(`lodFactor ${settings.lodFactor}`);

    this.shader.uniforms.lodFactor.value = settings.lodFactor;

    logWithColor('Updating from props - success');
    return true;
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
    const contrastLimitsList = [];

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
        // Since we don't have volume-based minMax, use fixed values
        // or get them from your brick cache metadata if available
        // big TODO
        const max = this.maxRange ? this.maxRange : 255;
        const minMax = [0, max]; // Default values

        // log.debug('this.colors[id]', this.colors[id]);
        // log.debug('this.channelsVisible[id]', this.channelsVisible[id]);

        colorsSave.push([
          this.colors[id][0] / 255,
          this.colors[id][1] / 255,
          this.colors[id][2] / 255,
          this.channelsVisible[id] ? 1.0 : 0.0,
        ]);

        log.debug('colorsSave', colorsSave);

        if (this.contrastLimits[id][0] === 0 && this.contrastLimits[id][1] === 255) {
          contrastLimitsList.push([
            normalizeValue(minMax[0], minMax),
            normalizeValue(minMax[1], minMax),
          ]);
        } else {
          contrastLimitsList.push([
            normalizeValue(this.contrastLimits[id][0], minMax),
            normalizeValue(this.contrastLimits[id][1], minMax),
          ]);
        }
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
      contrastLimitsList,
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
   * @param {Array} contrastLimits - List of contrast limits for each channel
   * @param {Array} colors - List of colors for each channel
   * @param {number} layerTransparency - Overall transparency value
   * @param {Vector2} xSlice - X clipping plane
   * @param {Vector2} ySlice - Y clipping plane
   * @param {Vector2} zSlice - Z clipping plane
   */
  updateUniforms(
    textures, dimensions, renderstyle, contrastLimits, colors, layerTransparency,
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

    // Set contrast limits (up to 6 channels)
    this.uniforms.clim0.value.set(
      contrastLimits.length > 0 ? contrastLimits[0][0] : null,
      contrastLimits.length > 0 ? contrastLimits[0][1] : null,
    );
    this.uniforms.clim1.value.set(
      contrastLimits.length > 1 ? contrastLimits[1][0] : null,
      contrastLimits.length > 1 ? contrastLimits[1][1] : null,
    );
    this.uniforms.clim2.value.set(
      contrastLimits.length > 2 ? contrastLimits[2][0] : null,
      contrastLimits.length > 2 ? contrastLimits[2][1] : null,
    );
    this.uniforms.clim3.value.set(
      contrastLimits.length > 3 ? contrastLimits[3][0] : null,
      contrastLimits.length > 3 ? contrastLimits[3][1] : null,
    );
    this.uniforms.clim4.value.set(
      contrastLimits.length > 4 ? contrastLimits[4][0] : null,
      contrastLimits.length > 4 ? contrastLimits[4][1] : null,
    );
    this.uniforms.clim5.value.set(
      contrastLimits.length > 5 ? contrastLimits[5][0] : null,
      contrastLimits.length > 5 ? contrastLimits[5][1] : null,
    );
    this.uniforms.clim6.value.set(
      contrastLimits.length > 6 ? contrastLimits[6][0] : null,
      contrastLimits.length > 6 ? contrastLimits[6][1] : null,
    );

    // Set clipping planes
    this.uniforms.xClip.value.set(
      xSlice[0] * (1.0 / this.maxResolution[0]) * this.boxSize[0],
      xSlice[1] * (1.0 / this.maxResolution[0]) * this.boxSize[0],
    );
    this.uniforms.yClip.value.set(
      ySlice[0] * (1.0 / this.maxResolution[1]) * this.boxSize[1],
      ySlice[1] * (1.0 / this.maxResolution[1]) * this.boxSize[1],
    );
    this.uniforms.zClip.value.set(
      zSlice[0] * (1.0 / this.maxResolution[2]) * this.boxSize[2],
      zSlice[1] * (1.0 / this.maxResolution[2]) * this.boxSize[2],
    );

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
        this.uniforms[`res${i}`].value.set(
          Math.max(1, this.channelMaxResolutionIndex[i]), this.zarrStoreNumResolutions - 1,
        );
      }
    }
  }

  /**
   * Sets the processing render target
   * @param {WebGLMultipleRenderTargets} mrt - Multiple render targets object with 3 attachments
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
    for (let i = 0; i < 7; i++) {
      this.uniforms[`res${i}`].value.set(
        // TODO(mark) make this dependent on the per-channel maxResolution slider value.
        1, zarrStore.brickLayout.length - 1,
      );
    }
    this.uniforms.resGlobal.value.set(
      1, zarrStore.brickLayout.length - 1,
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
