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

// const kBuf = new ArrayBuffer(8);
// const kBufAsF64 = new Float64Array(kBuf);
// const kBufAsI32 = new Int32Array(kBuf);

// function hashNumber(n) {
//   // Remove this `if` if you want 0 and -0 to hash to different values.
//   // eslint-disable-next-line no-bitwise
//   if (~~n === n) {
//     // eslint-disable-next-line no-bitwise
//     return ~~n;
//   }
//   kBufAsF64[0] = n;
//   // eslint-disable-next-line no-bitwise
//   return kBufAsI32[0] ^ kBufAsI32[1];
// }

const defaultProps = {
  hoveredCell: { type: 'number', value: null, compare: true },
  colorTexture: { type: 'object', value: null, compare: true },
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

  getDefaultColorTexture() {
    if (this.state.defaultColorTex) {
      return this.state.defaultColorTex;
    }
    const { height, width, data } = this.props.color;
    const defaultColorTex = new Texture2D(this.context.gl, {
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
    this.setState({ defaultColorTex });
    return defaultColorTex;
  }

  draw(opts) {
    const { uniforms } = opts;
    const { colorTexture, channelIsOn, hoveredCell } = this.props;
    const { textures, model } = this.state;
    // Render the image
    if (textures && model) {
      const colorTex = colorTexture || this.getDefaultColorTexture();
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            hovered: hoveredCell || 0,
            colorTex,
            colorTexHeight: colorTex.height,
            colorTexWidth: colorTex.width,
            channelIsOn: padWithDefault(channelIsOn, false, 6 - channelIsOn.length),
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
    const rand = new Float32Array(
      new Uint32Array((new Uint8Array(data.buffer)).filter((_, j) => j % 8 < 4).buffer),
    );
        console.log(new Uint8Array(data.buffer), data, rand); // eslint-disable-line

    return new Texture2D(this.context.gl, {
      width,
      height,
      // Only use Float32 so we don't have to write two shaders
      data: rand,
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
