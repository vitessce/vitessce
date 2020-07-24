import { BitmapLayer } from '@deck.gl/layers';
import { Texture2D } from '@luma.gl/core';
import { PIXELATED_TEXTURE_PARAMETERS } from './bitmap-utils';


// These are the same defaultProps as for BitmapLayer.
const defaultProps = {
  image: {type: 'object', value: null, async: true},
  bounds: {type: 'array', value: [1, 0, 0, 1], compare: true},
  desaturate: {type: 'number', min: 0, max: 1, value: 0},
  transparentColor: {type: 'color', value: [0, 0, 0, 0]},
  tintColor: {type: 'color', value: [255, 255, 255]}
};

/**
 * The BitmapLayer with overridden DEFAULT_TEXTURE_PARAMETERS
 */
export default class PixelatedBitmapLayer extends BitmapLayer {

  /**
   * Need to override to provide the custom DEFAULT_TEXTURE_PARAMETERS
   * object.
   * Simplified by removing video-related code.
   * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/layers/src/bitmap-layer/bitmap-layer.js#L218
   * @param {Uint8Array} image
   */
  loadTexture(image) {
    const {gl} = this.context;

    if (this.state.bitmapTexture) {
      this.state.bitmapTexture.delete();
    }

    if (image instanceof Texture2D) {
      this.setState({bitmapTexture: image});
    } else if (image) {
      // Browser object: Image, ImageData, HTMLCanvasElement, ImageBitmap
      this.setState({
        bitmapTexture: new Texture2D(gl, {
          data: image,
          parameters: PIXELATED_TEXTURE_PARAMETERS
        })
      });
    }
  }
}

PixelatedBitmapLayer.layerName = 'PixelatedBitmapLayer';
PixelatedBitmapLayer.defaultProps = defaultProps;
