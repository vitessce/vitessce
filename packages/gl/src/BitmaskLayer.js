import GL from '@luma.gl/constants'; // eslint-disable-line import/no-extraneous-dependencies
import { project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { Texture2D, isWebGL2 } from '@luma.gl/core';
import { XRLayer } from '@hms-dbmi/viv';
import { fs, vs } from './bitmask-layer-shaders';
import {
  GLSL_COLORMAPS,
  GLSL_COLORMAP_DEFAULT,
  COLORMAP_SHADER_PLACEHOLDER,
} from './constants';

const MAX_CHANNELS = 8;

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
  channelsFilled: { type: 'array', value: null, compare: true },
  channelOpacities: { type: 'array', value: null, compare: true },
  channelColors: { type: 'array', value: null, compare: true },
  hoveredCell: { type: 'number', value: null, compare: true },
  cellColorData: { type: 'object', value: null, compare: true },
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

  updateState({ props, oldProps, changeFlags }) {
    super.updateState({ props, oldProps, changeFlags });
    if (props.cellColorData !== oldProps.cellColorData) {
      this.setColorTexture();
    }
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
      const { gl } = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      // eslint-disable-next-line no-underscore-dangle
      this.setState({ model: this._getModel(gl) });

      this.getAttributeManager().invalidateAll();
    }
  }

  setColorTexture() {
    const {
      cellColorData: data,
      cellTexHeight: height,
      cellTexWidth: width,
    } = this.props;
    const colorTex = new Texture2D(this.context.gl, {
      width,
      height,
      // Only use Float32 so we don't have to write two shaders
      data,
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
      format: GL.RGB,
      dataFormat: GL.RGB,
      type: GL.UNSIGNED_BYTE,
    });
    this.setState({ colorTex });
  }

  draw(opts) {
    const { uniforms } = opts;
    const {
      channelsFilled,
      channelOpacities,
      channelColors,
      channelsVisible,
      hoveredCell,
      colorScaleLo,
      colorScaleHi,
      isExpressionMode,
      zoom,
      minZoom,
      maxZoom,
      zoomOffset, // TODO: figure out if this needs to be used or not
    } = this.props;
    const {
      textures, model, colorTex, expressionTex,
    } = this.state;
    // Render the image
    if (textures && model && colorTex) {
      const scaleFactor = 1 / (2 ** (maxZoom - zoom));
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            color0: getColor(channelColors[0]),
            color1: getColor(channelColors[1]),
            color2: getColor(channelColors[2]),
            color3: getColor(channelColors[3]),
            color4: getColor(channelColors[4]),
            color5: getColor(channelColors[5]),
            color6: getColor(channelColors[6]),
            color7: getColor(channelColors[7]),
            // TODO: up to 8 colors
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
            // TODO: colors 1-5
            hovered: hoveredCell || 0,
            colorTex,
            expressionTex,
            colorTexHeight: colorTex.height,
            colorTexWidth: colorTex.width,
            channelsVisible: padWithDefault(
              channelsVisible,
              false,
              // There are six texture entries on the shaders
              MAX_CHANNELS - channelsVisible.length,
            ),
            uColorScaleRange: [colorScaleLo, colorScaleHi],
            uIsExpressionMode: isExpressionMode,
            uIsColorMode: true,
            uIsOutlined: false,
            scaleFactor,
            ...textures,
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
