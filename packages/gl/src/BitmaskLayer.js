import GL from '@luma.gl/constants'; // eslint-disable-line import/no-extraneous-dependencies
import { project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { Texture2D, isWebGL2 } from '@luma.gl/core';
import { XRLayer } from '@hms-dbmi/viv';
import { fromEntries } from '@vitessce/utils';
import range from 'lodash/range';
import { fs, vs } from './bitmask-layer-shaders';
import {
  GLSL_COLORMAPS,
  GLSL_COLORMAP_DEFAULT,
  COLORMAP_SHADER_PLACEHOLDER,
} from './constants';

const MAX_CHANNELS = 7;

function padWithDefault(arr, defaultValue, padWidth) {
  const newArr = [...arr];
  for (let i = 0; i < padWidth; i += 1) {
    newArr.push(defaultValue);
  }
  return newArr;
}

function getColor(arr) {
  return arr ? arr.map(v => v / 255) : [0, 0, 0];
}

const defaultProps = {
  channelStrokeWidths: { type: 'array', value: null, compare: true },
  channelsFilled: { type: 'array', value: null, compare: true },
  channelOpacities: { type: 'array', value: null, compare: true },
  channelColors: { type: 'array', value: null, compare: true },
  hoveredCell: { type: 'number', value: null, compare: true },
  colormap: { type: 'string', value: GLSL_COLORMAP_DEFAULT, compare: true },
  expressionData: { type: 'object', value: null, compare: true },
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
      channel6: null,
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
      this.setState({ textures });
    }
  }

  updateState({ props, oldProps, changeFlags }) {
    super.updateState({ props, oldProps, changeFlags });
    if (props.expressionData !== oldProps.expressionData) {
      const { expressionData, cellTexHeight, cellTexWidth } = this.props;
      // TODO: use one expressionTex for all channels,
      // using some kind of offset mechanism.
      const expressionTex = this.dataToTexture(
        expressionData,
        cellTexWidth,
        cellTexHeight,
      );
      this.setState({ expressionTex });
    }
    if (props.colormap !== oldProps.colormap) {
      const { gl } = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      // eslint-disable-next-line no-underscore-dangle
      this.setState({ model: this._getModel(gl) });

      this.getAttributeManager().invalidateAll();
    }
  }

  draw(opts) {
    const { uniforms } = opts;
    const {
      channelStrokeWidths,
      channelsFilled,
      channelOpacities,
      channelColors,
      channelsVisible,
      hoveredCell,
      colorScaleLo,
      colorScaleHi,
      isExpressionMode,
      cellTexHeight,
      cellTexWidth,
      zoom,
      minZoom,
      maxZoom,
      zoomOffset, // TODO: figure out if this needs to be used or not
    } = this.props;
    const {
      textures, model, expressionTex,
    } = this.state;
    // Render the image
    if (textures && model) {
      const scaleFactor = 1 / (2 ** (maxZoom - zoom));
      const colors = fromEntries(range(MAX_CHANNELS).map(i => ([`color${i}`, getColor(channelColors[i])])));
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            ...colors,
            ...textures,
            expressionTex,
            channelsFilled: padWithDefault(
              channelsFilled,
              true,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelsFilled.length,
            ),
            channelOpacities: padWithDefault(
              channelOpacities,
              0.0,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelOpacities.length,
            ),
            channelStrokeWidths: padWithDefault(
              channelStrokeWidths,
              1.0,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelStrokeWidths.length,
            ),
            hovered: hoveredCell || 0,
            colorTexHeight: cellTexHeight,
            colorTexWidth: cellTexWidth,
            channelsVisible: padWithDefault(
              channelsVisible,
              false,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelsVisible.length,
            ),
            uColorScaleRange: [colorScaleLo, colorScaleHi],
            uIsExpressionMode: isExpressionMode,
            uIsOutlined: false,
            scaleFactor,
          }),
        )
        .draw();
    }
  }

  /**
   * This function creates textures from the data
   */
  dataToTexture(data, width, height) {
    const isWebGL2On = isWebGL2(this.context.gl);
    return new Texture2D(this.context.gl, {
      width,
      height,
      // Only use Float32 so we don't have to write two shaders
      data: new Float32Array(data),
      // we don't want or need mimaps
      mipmaps: false,
      parameters: {
        // NEAREST for integer data
        [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
        [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
        // CLAMP_TO_EDGE to remove tile artifacts
        [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
      },
      format: isWebGL2On ? GL.R32F : GL.LUMINANCE,
      dataFormat: isWebGL2On ? GL.RED : GL.LUMINANCE,
      type: GL.FLOAT,
    });
  }
}
BitmaskLayer.layerName = 'BitmaskLayer';
BitmaskLayer.defaultProps = defaultProps;
