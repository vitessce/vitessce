/* eslint-disable no-underscore-dangle */
import GL from '@luma.gl/constants'; // eslint-disable-line import/no-extraneous-dependencies
import { _mergeShaders, project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { BitmapLayer } from '@deck.gl/layers'; // eslint-disable-line import/no-extraneous-dependencies
import { Texture2D } from '@luma.gl/core';
import { PIXELATED_TEXTURE_PARAMETERS, TILE_SIZE, DATA_TEXTURE_SIZE } from './heatmap-constants';
import { GLSL_COLORMAPS, GLSL_COLORMAP_DEFAULT, COLORMAP_SHADER_PLACEHOLDER } from './constants';
import { vertexShader, fragmentShader } from './heatmap-bitmap-layer-shaders';

const defaultProps = {
  image: { type: 'object', value: null, async: true },
  colormap: { type: 'string', value: GLSL_COLORMAP_DEFAULT, compare: true },
  bounds: { type: 'array', value: [1, 0, 0, 1], compare: true },
  aggSizeX: { type: 'number', value: 8.0, compare: true },
  aggSizeY: { type: 'number', value: 8.0, compare: true },
  colorScaleLo: { type: 'number', value: 0.0, compare: true },
  colorScaleHi: { type: 'number', value: 1.0, compare: true },
};

/**
 * A BitmapLayer that performs aggregation in the fragment shader,
 * and renders its texture from a Uint8Array rather than an ImageData.
 */
export default class HeatmapBitmapLayer extends BitmapLayer {
  /**
   * Copy of getShaders from Layer (grandparent, parent of BitmapLayer).
   * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/core/src/lib/layer.js#L302
   * @param {object} shaders
   * @returns {object} Merged shaders.
   */
  _getShaders(shaders) {
    this.props.extensions.forEach((extension) => {
      // eslint-disable-next-line no-param-reassign
      shaders = _mergeShaders(shaders, extension.getShaders.call(this, extension));
    });
    return shaders;
  }

  /**
   * Need to override to provide custom shaders.
   */
  getShaders() {
    const { colormap } = this.props;
    const fragmentShaderWithColormap = (GLSL_COLORMAPS.includes(colormap)
      ? fragmentShader.replace(COLORMAP_SHADER_PLACEHOLDER, colormap)
      : fragmentShader.replace(COLORMAP_SHADER_PLACEHOLDER, GLSL_COLORMAP_DEFAULT)
    );
    return this._getShaders({
      vs: vertexShader,
      fs: fragmentShaderWithColormap,
      modules: [project32, picking],
    });
  }

  updateState(args) {
    super.updateState(args);
    const { props, oldProps } = args;
    if (props.colormap !== oldProps.colormap) {
      const { gl } = this.context;
      // eslint-disable-next-line no-unused-expressions
      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      this.getAttributeManager().invalidateAll();
    }
    if (props.images !== oldProps.images) {
      this.loadTexture(this.props.images);
    }
  }

  /**
   * Need to override to provide additional uniform values.
   * Simplified by removing video-related code.
   * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/layers/src/bitmap-layer/bitmap-layer.js#L173
   * @param {*} opts
   */
  draw(opts) {
    const { uniforms } = opts;
    const { bitmapTextures, model } = this.state;
    const {
      aggSizeX,
      aggSizeY,
      colorScaleLo,
      colorScaleHi,
      origDataSize,
      tileI,
      tileJ,
      numXTiles,
      numYTiles,
    } = this.props;
    // Render the image
    if (bitmapTextures && model) {
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            uBitmapTexture0: bitmapTextures[0],
            uBitmapTexture1: bitmapTextures[1],
            uBitmapTexture2: bitmapTextures[2],
            uBitmapTexture3: bitmapTextures[3],
            uOrigDataSize: origDataSize,
            uReshapedDataSize: [DATA_TEXTURE_SIZE, DATA_TEXTURE_SIZE],
            uTextureSize: [TILE_SIZE, TILE_SIZE],
            uAggSize: [aggSizeX, aggSizeY],
            uColorScaleRange: [colorScaleLo, colorScaleHi],
            tileIJ: [tileI, tileJ],
            dataIJ: [0, 0],
            numTiles: [numXTiles, numYTiles],
            numData: [1, 1],
          }),
        )
        .draw();
    }
  }

  /**
   * Need to override to provide the custom DEFAULT_TEXTURE_PARAMETERS
   * object.
   * Simplified by removing video-related code.
   * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/layers/src/bitmap-layer/bitmap-layer.js#L218
   * @param {Array<Uint8Array>} images
   */
  loadTexture(images) {
    const { gl } = this.context;

    if (this.state.bitmapTextures) {
      this.state.bitmapTextures.forEach(tex => tex.delete());
    }

    if (images && images.every(image => image instanceof Texture2D)) {
      this.setState({
        bitmapTextures: images,
      });
    } else if (images) {
      this.setState({
        bitmapTextures: images.map(image => new Texture2D(gl, {
          data: image,
          mipmaps: false,
          parameters: PIXELATED_TEXTURE_PARAMETERS,
          // Each color contains a single luminance value.
          // When sampled, rgb are all set to this luminance, alpha is 1.0.
          // Reference: https://luma.gl/docs/api-reference/webgl/texture#texture-formats
          format: GL.LUMINANCE,
          dataFormat: GL.LUMINANCE,
          type: GL.UNSIGNED_BYTE,
          width: DATA_TEXTURE_SIZE,
          height: DATA_TEXTURE_SIZE,
        })),
      });
    }
  }
}
HeatmapBitmapLayer.layerName = 'HeatmapBitmapLayer';
HeatmapBitmapLayer.defaultProps = defaultProps;
