import { project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { XRLayer } from '@hms-dbmi/viv';
import { fs, vs } from './bitmask-layer-shaders.js';
import {
  GLSL_COLORMAPS,
  GLSL_COLORMAP_DEFAULT,
  COLORMAP_SHADER_PLACEHOLDER,
} from './constants.js';
import { PIXELATED_TEXTURE_PARAMETERS } from './heatmap-constants.js';

function padWithDefault(arr, defaultValue, padWidth) {
  const newArr = [...arr];
  for (let i = 0; i < padWidth; i += 1) {
    newArr.push(defaultValue);
  }
  return newArr;
}

const defaultProps = {
  hoveredCell: { type: 'number', value: null, compare: true },
  // We do not want to deep-compare cellColorData,
  // as it is potentially a TypedArray with millions of elements.
  // For `compare`: "if a number is supplied, indicates the maximum depth to deep-compare,
  // where 0 is shallow comparison and -1 is infinite depth. true is equivalent to 1."
  // Reference: https://deck.gl/docs/developer-guide/custom-layers/prop-types#array
  cellColorData: { type: 'object', value: null, compare: 0 },
  colormap: { type: 'string', value: GLSL_COLORMAP_DEFAULT, compare: true },
  // Same as with cellColorData, we do not want to deep-compare expressionData.
  expressionData: { type: 'object', value: null, compare: 0 },
};

/**
 * A BitmapLayer that performs aggregation in the fragment shader,
 * and renders its texture from a Uint8Array rather than an ImageData.
 */
export default class BitmaskLayer extends XRLayer {
  // eslint-disable-next-line class-methods-use-this
  getShaders() {
    const { colormap } = this.props;
    return {
      fs,
      vs,
      modules: [project32, picking],
      defines: {
        [COLORMAP_SHADER_PLACEHOLDER]: GLSL_COLORMAPS.includes(colormap)
          ? colormap
          : GLSL_COLORMAP_DEFAULT,
      },
    };
  }

  /**
   * Override the parent loadChannelTextures to enable
   * up to eight channels (rather than six).
   * Reference: https://github.com/hms-dbmi/viv/blob/v0.13.3/packages/layers/src/xr-layer/xr-layer.js#L316
  */
  loadChannelTextures(channelData) {
    const textures = {
      channel0: null,
      channel1: null,
      channel2: null,
      channel3: null,
      channel4: null,
      channel5: null,
    };
    if (this.state.textures) {
      Object.values(this.state.textures).forEach(tex => tex && tex.delete());
    }
    if (channelData
      && Object.keys(channelData).length > 0
      && channelData.data
    ) {
      channelData.data.forEach((d, i) => {
        textures[`channel${i}`] = this.dataToTexture(
          d,
          channelData.width,
          channelData.height,
        );
      }, this);
      Object.keys(textures).forEach((key) => {
        if (!textures[key]) {
          textures[key] = this.dataToTexture(
            [],
            0,
            0,
          );
        }
      });
      this.setState({ textures });
    }
  }

  updateState({ props, oldProps, changeFlags }) {
    super.updateState({ props, oldProps, changeFlags });
    // Check the cellColorData to determine whether
    // to update the texture.
    if (props.cellColorData !== oldProps.cellColorData) {
      this.setColorTexture();
    }
    // Check the expressionData to determine whether
    // to update the texture.
    if (props.expressionData !== oldProps.expressionData) {
      const { expressionData, cellTexHeight, cellTexWidth } = this.props;
      const expressionTex = this.dataToTexture(
        expressionData,
        cellTexWidth,
        cellTexHeight,
      );
      this.setState({ expressionTex });
    }
    if (props.colormap !== oldProps.colormap) {
      const { device } = this.context;
      if (this.state.model) {
        this.state.model.destroy();
      }
      // eslint-disable-next-line no-underscore-dangle
      this.setState({ model: this._getModel(device) });

      this.getAttributeManager().invalidateAll();
    }
  }

  setColorTexture() {
    const {
      cellColorData: data,
      cellTexHeight: height,
      cellTexWidth: width,
    } = this.props;
    const colorTex = this.context.device.createTexture({
      width,
      height,
      dimension: '2d',
      // Only use Float32 so we don't have to write two shaders
      data,
      // we don't want or need mimaps
      mipmaps: false,
      sampler: PIXELATED_TEXTURE_PARAMETERS,
      format: 'rgba8unorm',
    });
    this.setState({ colorTex });
  }

  // eslint-disable-next-line no-unused-vars
  draw(opts) {
    const {
      channelsVisible,
      hoveredCell,
      colorScaleLo,
      colorScaleHi,
      isExpressionMode,
    } = this.props;
    const {
      textures, model, colorTex, expressionTex,
    } = this.state;
    // Render the image
    if (textures && model && colorTex) {
      model.setUniforms({
        hovered: hoveredCell || 0,
        colorTexHeight: colorTex.height,
        colorTexWidth: colorTex.width,
        channelsVisible: padWithDefault(
          channelsVisible,
          false,
          // There are six texture entries on the shaders
          6 - channelsVisible.length,
        ),
        uColorScaleRange: [colorScaleLo, colorScaleHi],
        uIsExpressionMode: isExpressionMode,
      });
      model.setBindings({
        colorTex,
        expressionTex,
        ...textures,
      });
      model.draw(this.context.renderPass);
    }
  }

  /**
   * This function creates textures from the data
   */
  dataToTexture(data, width, height) {
    return this.context.device.createTexture({
      width,
      height,
      dimension: '2d',
      // Only use Float32 so we don't have to write two shaders
      data: new Float32Array(data),
      // we don't want or need mimaps
      mipmaps: false,
      sampler: {
        // NEAREST for integer data
        minFilter: 'nearest',
        magFilter: 'nearest',
        // CLAMP_TO_EDGE to remove tile artifacts
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
      },
      format: 'r32float',
    });
  }
}
BitmaskLayer.layerName = 'BitmaskLayer';
BitmaskLayer.defaultProps = defaultProps;
