import GL from '@luma.gl/constants'; // eslint-disable-line import/no-extraneous-dependencies
import { project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { Texture2D, isWebGL2 } from '@luma.gl/core';
import { XRLayer } from '@hms-dbmi/viv';
import { fs, vs } from './bitmask-layer-shaders.js';
import {
  GLSL_COLORMAPS,
  GLSL_COLORMAP_DEFAULT,
  COLORMAP_SHADER_PLACEHOLDER,
} from './constants.js';

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
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            hovered: hoveredCell || 0,
            colorTex,
            expressionTex,
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
