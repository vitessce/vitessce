/* eslint-disable no-underscore-dangle */
import { _mergeShaders, project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { BitmapLayer } from '@deck.gl/layers'; // eslint-disable-line import/no-extraneous-dependencies
import { PIXELATED_TEXTURE_PARAMETERS, TILE_SIZE } from './heatmap-constants.js';
import {
  GLSL_COLORMAPS,
  GLSL_COLORMAP_DEFAULT,
  COLORMAP_SHADER_PLACEHOLDER,
} from './constants.js';
import { vertexShader, fragmentShader } from './heatmap-bitmap-layer-shaders.js';


const uniformBlock = `\
uniform uBlockUniforms {
  // What are the dimensions of the texture (width, height)?
  vec2 uTextureSize;

  // How many consecutive pixels should be aggregated together along each axis?
  vec2 uAggSize;

  // What are the values of the color scale sliders?
  vec2 uColorScaleRange;
} uBlock;
`;

export const bitmapUniforms = {
  name: 'uBlock',
  vs: uniformBlock,
  fs: uniformBlock,
  uniformTypes: {
    uTextureSize: 'vec2<f32>',
    uAggSize: 'vec2<f32>',
    uColorScaleRange: 'vec2<f32>',
  },
};


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
    // TODO: Update to not use param-reassign.
    // eslint-disable-next-line no-param-reassign
    shaders = _mergeShaders(shaders, {
      disableWarnings: true,
      modules: this.context.defaultShaderModules,
    });
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
    const fragmentShaderWithColormap = GLSL_COLORMAPS.includes(colormap)
      ? fragmentShader.replace(COLORMAP_SHADER_PLACEHOLDER, colormap)
      : fragmentShader.replace(
        COLORMAP_SHADER_PLACEHOLDER,
        GLSL_COLORMAP_DEFAULT,
      );
    // eslint-disable-next-line no-underscore-dangle
    return this._getShaders({
      vs: vertexShader,
      fs: fragmentShaderWithColormap,
      modules: [project32, picking, bitmapUniforms],
    });
  }

  updateState(args) {
    const { props, oldProps } = args;
    if (props.colormap !== oldProps.colormap) {
      // Reference: https://github.com/visgl/deck.gl/blob/87883cdaae08c6eeddf112382da9b572d1503674/modules/layers/src/bitmap-layer/bitmap-layer.ts#L169
      const attributeManager = this.getAttributeManager();
      this.state.model?.destroy();
      this.state.model = this._getModel();
      attributeManager.invalidateAll();
    }
    // For some reason, super.updateState must come after the above colormap check.
    super.updateState(args);
    this.loadTexture(this.props.image);
  }

  /**
   * Need to override to provide additional uniform values.
   * Simplified by removing video-related code.
   * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/layers/src/bitmap-layer/bitmap-layer.js#L173
   * @param {*} opts
   */
  // eslint-disable-next-line no-unused-vars
  draw(opts) {
    const { bitmapTexture, model } = this.state;
    const {
      aggSizeX, aggSizeY, colorScaleLo, colorScaleHi,
    } = this.props;

    // Render the image
    if (bitmapTexture && model) {
      const bitmapProps = {
        uBitmapTexture: bitmapTexture,
        uTextureSize: [TILE_SIZE, TILE_SIZE],
        uAggSize: [aggSizeX, aggSizeY],
        uColorScaleRange: [colorScaleLo, colorScaleHi],
      };
      model.shaderInputs.setProps({ uBlock: bitmapProps });
      model.draw(this.context.renderPass);
    }
  }

  /**
   * Need to override to provide the custom DEFAULT_TEXTURE_PARAMETERS
   * object.
   * Simplified by removing video-related code.
   * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/layers/src/bitmap-layer/bitmap-layer.js#L218
   * @param {Uint8Array} image
   */
  loadTexture(image) {
    const { device } = this.context;

    if (this.state.bitmapTexture) {
      this.state.bitmapTexture.delete();
    }

    if (image && image.device) {
      this.setState({
        bitmapTexture: image,
      });
    } else if (image) {
      this.setState({
        bitmapTexture: device.createTexture({
          data: image,
          dimension: '2d',
          mipmaps: false,
          sampler: PIXELATED_TEXTURE_PARAMETERS,
          // Each color contains a single luminance value.
          // When sampled, rgb are all set to this luminance, alpha is 1.0.
          // Reference: https://luma.gl/docs/api-reference/webgl/texture#texture-formats
          format: 'r8unorm',
          width: TILE_SIZE,
          height: TILE_SIZE,
        }),
      });
    }
  }
}
HeatmapBitmapLayer.layerName = 'HeatmapBitmapLayer';
HeatmapBitmapLayer.defaultProps = defaultProps;
