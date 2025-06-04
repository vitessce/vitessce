/* eslint-disable no-underscore-dangle */
import { GL } from '@luma.gl/constants'; // eslint-disable-line import/no-extraneous-dependencies
import { _mergeShaders, project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { BitmapLayer } from '@deck.gl/layers'; // eslint-disable-line import/no-extraneous-dependencies
import { Texture } from '@luma.gl/core';
import { PIXELATED_TEXTURE_PARAMETERS, TILE_SIZE, DATA_TEXTURE_SIZE } from './heatmap-constants.js';
import { GLSL_COLORMAPS, GLSL_COLORMAP_DEFAULT, COLORMAP_SHADER_PLACEHOLDER } from './constants.js';
import { vertexShader, fragmentShader } from './padded-expression-heatmap-bitmap-layer-shaders.js';

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
export default class PaddedExpressionHeatmapBitmapLayer extends BitmapLayer {
  /**
   * Copy of getShaders from Layer (grandparent, parent of BitmapLayer).
   * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/core/src/lib/layer.js#L302
   * @param {object} shaders
   * @returns {object} Merged shaders.
   */
  _getShaders(shaders) {
    this.props.extensions.forEach((extension) => {
      // eslint-disable-next-line no-param-reassign
      shaders = _mergeShaders(
        shaders,
        extension.getShaders.call(this, extension),
      );
    });
    return shaders;
  }

  /**
   * Need to override to provide custom shaders.
   */
  getShaders() {
    const { colormap } = this.props;
    const fragmentShaderWithColormap = GLSL_COLORMAPS.includes(colormap)
      ? fragmentShader.replace(COLORMAP_SHADER_PLACEHOLDER, colormap)
      : fragmentShader.replace(
        COLORMAP_SHADER_PLACEHOLDER,
        GLSL_COLORMAP_DEFAULT,
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
      const { device } = this.context;
      // eslint-disable-next-line no-unused-expressions
      this.state.model?.destroy();
      this.state.model = this._getModel(device);
      this.getAttributeManager().invalidateAll();
    }
    if (props.image !== oldProps.image) {
      this.loadTexture(this.props.image);
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
    const { bitmapTexture, model, coordinateConversion, bounds } = this.state;
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
      desaturate, transparentColor, tintColor,
    } = this.props;
    // Render the image
    if (bitmapTexture && model) {
      model.setUniforms(
        Object.assign({}, uniforms, {
          uBitmapTexture: bitmapTexture,
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
      );
      const bitmapProps = {
        bitmapTexture,
        bounds,
        coordinateConversion,
        desaturate,
        tintColor: tintColor.slice(0, 3).map(x => x / 255),
        transparentColor: transparentColor.map(x => x / 255),
      };
      model.shaderInputs.setProps({bitmap: bitmapProps});
      model.draw(this.context.renderPass);
    }
  }

  /**
   * Need to override to provide the custom DEFAULT_TEXTURE_PARAMETERS
   * object.
   * Simplified by removing video-related code.
   * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/layers/src/bitmap-layer/bitmap-layer.js#L218
   * @param {Array<Uint8Array>} images
   */
  loadTexture(image) {
    const { device } = this.context;

    if (this.state.bitmapTexture) {
      this.state.bitmapTexture.delete();
    }

    if (image && image.device) {
      // The image is already a texture.
      this.setState({
        bitmapTexture: image,
      });
    } else if (image) {
      console.log(image);
      this.setState({
        bitmapTexture: device.createTexture({
          data: image,
          dimension: '2d',
          mipmaps: false,
          sampler: PIXELATED_TEXTURE_PARAMETERS,
          // Each color contains a single luminance value.
          // When sampled, rgb are all set to this luminance, alpha is 1.0.
          // Reference: https://luma.gl/docs/api-reference/webgl/texture#texture-formats
          format: 'r8uint',
          width: DATA_TEXTURE_SIZE,
          height: DATA_TEXTURE_SIZE,
        }),
      });
    }
  }
}
PaddedExpressionHeatmapBitmapLayer.layerName = 'PaddedExpressionHeatmapBitmapLayer';
PaddedExpressionHeatmapBitmapLayer.defaultProps = defaultProps;
