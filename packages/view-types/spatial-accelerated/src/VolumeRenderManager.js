import {
  Vector2,
  UniformsUtils,
  Data3DTexture,
  RedFormat,
  FloatType,
  LinearFilter,
  WebGLRenderTarget,
  Scene,
  Camera,
  WebGLMultipleRenderTargets,
} from 'three';
import { CoordinationType } from '@vitessce/constants-internal';
import { VolumeShader } from './VolumeShader.js';
import { VolumeDataManager } from './VolumeDataManager.js';

// Map rendering mode strings to shader values
const RENDERING_MODES = {
  maximumIntensityProjection: 0,
  minimumIntensityProjection: 1,
  additive: 2,
};

function log(message) {
  // console.warn(`%cRM: ${message}`,
  //   'background: orange; color: white; padding: 2px; border-radius: 3px;');
}

/**
 * Manages the volume rendering state, shader setup, and uniform management
 * Serves as a replacement for many functions from three-utils.js
 */
export class VolumeRenderManager {
  constructor() {
    log('Initializing VolumeRenderManager');
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
    this.colors = [];
    this.contrastLimits = [];
    this.renderingMode = RENDERING_MODES.maximumIntensityProjection;
    this.layerTransparency = 1.0;
    this.xSlice = new Vector2(-1, 100000);
    this.ySlice = new Vector2(-1, 100000);
    this.zSlice = new Vector2(-1, 100000);
    this.originalScale = [1, 1, 1];
    this.physicalDimensions = [1, 1, 1]; // can be used later, currently our props scale by pixel
    this.maxResolution = [1, 1, 1];

    // Additional state
    this.mrt = null; // Single MRT reference

    // Initialize shader
    this.initializeShader();
  }

  /**
   * Initialize shader and uniform objects
   */
  initializeShader() {
    log('Initializing shader');
    this.shader = VolumeShader;
    this.uniforms = UniformsUtils.clone(this.shader.uniforms);
  }

  /**
   * Extract rendering settings from coordination props
   * @param {Object} props - Component props
   * @returns {Object} Extracted rendering settings
   */
  extractRenderingSettingsFromProps(props) {
    log('Extracting rendering settings from props');
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
      return {
        valid: false,
      };
    }

    const channelScopes = imageChannelScopesByLayer[layerScope];
    const layerCoordination = imageLayerCoordination[0][layerScope];
    const channelCoordination = imageChannelCoordination[0][layerScope];

    const data = images[layerScope]?.image?.instance?.getData();
    if (!data) {
      return {
        valid: false,
      };
    }

    const imageWrapperInstance = images[layerScope].image.instance;
    const is3dMode = spatialRenderingMode === '3D';
    const isRgb = layerCoordination[CoordinationType.PHOTOMETRIC_INTERPRETATION] === 'RGB';
    const renderingModeStr = layerCoordination[CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM];
    const renderingMode = RENDERING_MODES[renderingModeStr]
      || RENDERING_MODES.maximumIntensityProjection;
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

    // Get resolution
    const autoTargetResolution = imageWrapperInstance.getAutoTargetResolution();
    const targetResolution = layerCoordination[CoordinationType.SPATIAL_TARGET_RESOLUTION];
    const resolution = (targetResolution === null || Number.isNaN(targetResolution))
      ? autoTargetResolution
      : targetResolution;

    // Get slice planes
    let xSlice = layerCoordination[CoordinationType.SPATIAL_SLICE_X];
    let ySlice = layerCoordination[CoordinationType.SPATIAL_SLICE_Y];
    let zSlice = layerCoordination[CoordinationType.SPATIAL_SLICE_Z];

    xSlice = xSlice !== null ? xSlice : new Vector2(-1, 100000);
    ySlice = ySlice !== null ? ySlice : new Vector2(-1, 100000);
    zSlice = zSlice !== null ? zSlice : new Vector2(-1, 100000);

    const allChannels = images[layerScope].image.loaders[0].channels;

    return {
      valid: true,
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
    };
  }

  /**
   * Update the render settings from the given props
   * @param {Object} props - Component props
   * @returns {boolean} True if settings were successfully updated
   */
  updateFromProps(props) {
    log('Updating from props');
    const settings = this.extractRenderingSettingsFromProps(props);
    if (!settings.valid) {
      return false;
    }

    // Store the extracted settings
    this.channelsVisible = settings.channelsVisible;
    this.channelTargetC = settings.channelTargetC;
    this.colors = settings.colors;
    this.contrastLimits = settings.contrastLimits;
    this.renderingMode = settings.renderingMode;
    this.layerTransparency = settings.layerTransparency;
    this.xSlice = settings.xSlice;
    this.ySlice = settings.ySlice;
    this.zSlice = settings.zSlice;

    return true;
  }

  /**
   * Create a 3D texture from volume data
   * @param {Volume} volume - Volume object
   * @returns {Data3DTexture} Three.js 3D texture
   */
  createVolumeTexture(volume) {
    log('Creating volume texture');
    const texture = new Data3DTexture(volume.data, volume.xLength, volume.yLength, volume.zLength);
    texture.format = RedFormat;
    texture.type = FloatType;
    texture.generateMipmaps = false;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Normalize a value based on the volume's min/max range
   * @param {number} value - Value to normalize
   * @param {Array} minMax - [min, max] values of the volume
   * @returns {number} Normalized value
   */
  normalizeValue(value, minMax) {
    log('Normalizing value');
    const [min, max] = minMax;
    return (value - min) / Math.sqrt((max ** 2) - (min ** 2));
  }

  /**
   * Update the rendering based on the current volume data from the data manager
   * @param {VolumeDataManager} volumeDataManager - Reference to the volume data manager
   * @returns {Object|null} Updated rendering settings or null if rendering is not possible
   */
  updateRendering(volumeDataManager) {
    log('Updating rendering');
    // Check if we have at least one visible channel
    const visibleChannelIndex = this.channelTargetC.findIndex(
      (channel, idx) => this.channelsVisible[idx],
    );

    if (visibleChannelIndex === -1) {
      return null;
    }

    // Get reference to one volume to determine dimensions
    const referenceChannel = this.channelTargetC[visibleChannelIndex];
    const volume = volumeDataManager.getVolume(referenceChannel);
    if (!volume) {
      return null;
    }

    // Collect textures and settings for active channels
    const texturesList = [];
    const colorsSave = [];
    const contrastLimitsList = [];

    this.channelTargetC.forEach((channel, id) => {
      if (this.channelsVisible[id]) {
        const minMax = volumeDataManager.getMinMax(channel);

        colorsSave.push([
          this.colors[id][0] / 255,
          this.colors[id][1] / 255,
          this.colors[id][2] / 255,
        ]);

        if (this.contrastLimits[id][0] === 0 && this.contrastLimits[id][1] === 255) {
          contrastLimitsList.push([
            this.normalizeValue(minMax[0], minMax),
            this.normalizeValue(minMax[1], minMax),
          ]);
        } else {
          contrastLimitsList.push([
            this.normalizeValue(this.contrastLimits[id][0], minMax),
            this.normalizeValue(this.contrastLimits[id][1], minMax),
          ]);
        }
      }
    });

    if (!this.zarrInit) {
      this.originalScale = volumeDataManager.getOriginalScaleXYZ();
      this.physicalDimensions = volumeDataManager.getPhysicalDimensionsXYZ();
      this.maxResolution = volumeDataManager.getMaxResolutionXYZ();
      const scaledResolution = volumeDataManager.getBoxDimensionsXYZ();
      scaledResolution[0] *= 200.0;
      scaledResolution[1] *= 200.0;
      scaledResolution[2] *= 200.0;

      this.meshScale = this.originalScale;
      this.geometrySize = scaledResolution;
      this.boxSize = scaledResolution;

      this.brickCacheTexture = volumeDataManager.bcTHREE;
      this.pageTableTexture = volumeDataManager.ptTHREE;
      this.zarrInit = true;

      // Initialize textures without warnings
      volumeDataManager.ptTHREE.needsUpdate = false;
      volumeDataManager.bcTHREE.needsUpdate = false;
      
      const texPropsBC = volumeDataManager.renderer.properties.get(volumeDataManager.bcTHREE);
      const texPropsPT = volumeDataManager.renderer.properties.get(volumeDataManager.ptTHREE);
      
      // Initialize textures if needed
      volumeDataManager.renderer.initTexture(volumeDataManager.bcTHREE);
      volumeDataManager.renderer.initTexture(volumeDataManager.ptTHREE);

      // If the texture handle exists, populate data
      if (texPropsBC && texPropsBC.__webglTexture) {
        volumeDataManager.populatePT();
        volumeDataManager.populateBC();
      }
    }

    // Update shader uniforms
    this.updateUniforms(
      texturesList,
      volume,
      this.renderingMode,
      contrastLimitsList,
      colorsSave,
      this.layerTransparency,
      this.xSlice, this.ySlice, this.zSlice,
      this.brickCacheTexture,
      this.pageTableTexture,
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
   * @param {Volume} volume - Reference volume for dimensions
   * @param {number} renderstyle - Rendering mode value
   * @param {Array} contrastLimits - List of contrast limits for each channel
   * @param {Array} colors - List of colors for each channel
   * @param {number} layerTransparency - Overall transparency value
   * @param {Vector2} xSlice - X clipping plane
   * @param {Vector2} ySlice - Y clipping plane
   * @param {Vector2} zSlice - Z clipping plane
   */
  updateUniforms(
    textures, volume, renderstyle, contrastLimits, colors, layerTransparency,
    xSlice, ySlice, zSlice,
    brickCacheTexture, pageTableTexture,
  ) {
    log('Updating uniforms');
    // Set base uniforms
    this.uniforms.boxSize.value.set(this.boxSize[0], this.boxSize[1], this.boxSize[2]);

    // Set texture uniforms
    this.uniforms.brickCacheTex.value = brickCacheTexture;
    this.uniforms.pageTableTex.value = pageTableTexture;

    // Set general rendering parameters
    this.uniforms.near.value = 0.1;
    this.uniforms.far.value = 3000;
    this.uniforms.alphaScale.value = 1.0;
    this.uniforms.dtScale.value = layerTransparency;
    this.uniforms.finalGamma.value = 4.5;
    this.uniforms.volumeCount.value = textures.length;

    // Set size and scale parameters
    this.uniforms.u_size.value.set(volume.xLength, volume.yLength, volume.zLength);
    this.uniforms.u_window_size.value.set(0, 0);
    this.uniforms.u_vol_scale.value.set(
      1.0 / volume.xLength,
      1.0 / volume.yLength,
      1.0 / volume.zLength * 2.0,
    );

    // Set contrast limits (up to 6 channels)
    this.uniforms.u_clim.value.set(
      contrastLimits.length > 0 ? contrastLimits[0][0] : null,
      contrastLimits.length > 0 ? contrastLimits[0][1] : null,
    );
    this.uniforms.u_clim2.value.set(
      contrastLimits.length > 1 ? contrastLimits[1][0] : null,
      contrastLimits.length > 1 ? contrastLimits[1][1] : null,
    );
    this.uniforms.u_clim3.value.set(
      contrastLimits.length > 2 ? contrastLimits[2][0] : null,
      contrastLimits.length > 2 ? contrastLimits[2][1] : null,
    );
    this.uniforms.u_clim4.value.set(
      contrastLimits.length > 3 ? contrastLimits[3][0] : null,
      contrastLimits.length > 3 ? contrastLimits[3][1] : null,
    );
    this.uniforms.u_clim5.value.set(
      contrastLimits.length > 4 ? contrastLimits[4][0] : null,
      contrastLimits.length > 4 ? contrastLimits[4][1] : null,
    );
    this.uniforms.u_clim6.value.set(
      contrastLimits.length > 5 ? contrastLimits[5][0] : null,
      contrastLimits.length > 5 ? contrastLimits[5][1] : null,
    );

    // Set clipping planes
    this.uniforms.u_xClip.value.set(
      xSlice[0] * (1.0 / this.maxResolution[0]) * this.boxSize[0],
      xSlice[1] * (1.0 / this.maxResolution[0]) * this.boxSize[0],
    );
    this.uniforms.u_yClip.value.set(
      ySlice[0] * (1.0 / this.maxResolution[1]) * this.boxSize[1],
      ySlice[1] * (1.0 / this.maxResolution[1]) * this.boxSize[1],
    );
    this.uniforms.u_zClip.value.set(
      zSlice[0] * (1.0 / this.maxResolution[2]) * this.boxSize[2],
      zSlice[1] * (1.0 / this.maxResolution[2]) * this.boxSize[2],
    );

    // Set colors (up to 6 channels)
    this.uniforms.u_color.value.set(
      colors.length > 0 ? colors[0][0] : null,
      colors.length > 0 ? colors[0][1] : null,
      colors.length > 0 ? colors[0][2] : null,
    );
    this.uniforms.u_color2.value.set(
      colors.length > 1 ? colors[1][0] : null,
      colors.length > 1 ? colors[1][1] : null,
      colors.length > 1 ? colors[1][2] : null,
    );
    this.uniforms.u_color3.value.set(
      colors.length > 2 ? colors[2][0] : null,
      colors.length > 2 ? colors[2][1] : null,
      colors.length > 2 ? colors[2][2] : null,
    );
    this.uniforms.u_color4.value.set(
      colors.length > 3 ? colors[3][0] : null,
      colors.length > 3 ? colors[3][1] : null,
      colors.length > 3 ? colors[3][2] : null,
    );
    this.uniforms.u_color5.value.set(
      colors.length > 4 ? colors[4][0] : null,
      colors.length > 4 ? colors[4][1] : null,
      colors.length > 4 ? colors[4][2] : null,
    );
    this.uniforms.u_color6.value.set(
      colors.length > 5 ? colors[5][0] : null,
      colors.length > 5 ? colors[5][1] : null,
      colors.length > 5 ? colors[5][2] : null,
    );
  }

  /**
   * Update just the material uniforms without recreating the shader
   * @param {Object} material - Three.js shader material
   */
  applyToMaterial(material) {
    log('Applying uniforms to material');
    if (!material || !material.uniforms || !this.uniforms) {
      return;
    }

    // Copy uniform values to the material
    const matUniforms = material.uniforms;

    // Transfer all uniform values
    Object.keys(this.uniforms).forEach((key) => {
      if (matUniforms[key] && this.uniforms[key]) {
        matUniforms[key].value = this.uniforms[key].value;
      }
    });
  }

  /**
   * Sets the processing render target
   * @param {WebGLMultipleRenderTargets} mrt - Multiple render targets object with 3 attachments
   */
  setProcessingTargets(mrt) {
    this.mrt = mrt;
  }

  /**
   * Access to the current MRT
   * @returns {WebGLMultipleRenderTargets|null} The current multiple render targets
   */
  getProcessingTargets() {
    return this.mrt;
  }
}
