import GL from '@luma.gl/constants'; // eslint-disable-line import/no-extraneous-dependencies
import { project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { Texture2D } from '@luma.gl/core';
import { XRLayer } from '@hms-dbmi/viv';
import { fs, vs } from './bitmask-layer-shaders';

function padWithDefault(arr, defaultValue, padWidth) {
  const newArr = [...arr];
  for (let i = 0; i < padWidth; i += 1) {
    newArr.push(defaultValue);
  }
  return newArr;
}

const defaultProps = {
  hoveredCell: { type: 'number', value: null, compare: true },
  cellColor: { type: 'object', value: null, compare: true },
};

/**
 * A BitmapLayer that performs aggregation in the fragment shader,
 * and renders its texture from a Uint8Array rather than an ImageData.
 */
export default class BitmaskLayer extends XRLayer {
  // eslint-disable-next-line class-methods-use-this
  getShaders() {
    return {
      fs,
      vs,
      modules: [project32, picking],
    };
  }

  updateState({ props, oldProps, changeFlags }) {
    super.updateState({ props, oldProps, changeFlags });
    if (props.cellColor !== oldProps.cellColor) {
      this.setColorTexture();
    }
  }

  setColorTexture() {
    const { height, width, data } = this.props.cellColor;
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
    const { channelIsOn, hoveredCell } = this.props;
    const { textures, model, colorTex } = this.state;
    // Render the image
    if (textures && model && colorTex) {
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            hovered: hoveredCell || 0,
            colorTex,
            colorTexHeight: colorTex.height,
            colorTexWidth: colorTex.width,
            channelIsOn: padWithDefault(
              channelIsOn,
              false,
              6 - channelIsOn.length,
            ),
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
      format: GL.R32F,
      dataFormat: GL.RED,
      type: GL.FLOAT,
    });
  }
}
BitmaskLayer.layerName = 'BitmaskLayer';
BitmaskLayer.defaultProps = defaultProps;
