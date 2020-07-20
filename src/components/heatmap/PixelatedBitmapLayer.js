/* eslint-disable */
// BitmapLayer with different DEFAULT_TEXTURE_PARAMETERS

import GL from '@luma.gl/constants';
import { BitmapLayer } from '@deck.gl/layers';
import { Texture2D } from '@luma.gl/core';


const DEFAULT_TEXTURE_PARAMETERS = {
  // NEAREST for integer data
  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
  // CLAMP_TO_EDGE to remove tile artifacts
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

const defaultProps = {
  image: {type: 'object', value: null, async: true},
  bounds: {type: 'array', value: [1, 0, 0, 1], compare: true},

  desaturate: {type: 'number', min: 0, max: 1, value: 0},
  // More context: because of the blending mode we're using for ground imagery,
  // alpha is not effective when blending the bitmap layers with the base map.
  // Instead we need to manually dim/blend rgb values with a background color.
  transparentColor: {type: 'color', value: [0, 0, 0, 0]},
  tintColor: {type: 'color', value: [255, 255, 255]}
};

/*
 * @class
 * @param {object} props
 * @param {number} props.transparentColor - color to interpret transparency to
 * @param {number} props.tintColor - color bias
 */
export default class PixelatedBitmapLayer extends BitmapLayer {

  draw(opts) {
    const {uniforms} = opts;
    const {bitmapTexture, model} = this.state;
    const {image, desaturate, transparentColor, tintColor} = this.props;

    // Update video frame
    if (
      bitmapTexture &&
      image instanceof HTMLVideoElement &&
      image.readyState > HTMLVideoElement.HAVE_METADATA
    ) {
      const sizeChanged =
        bitmapTexture.width !== image.videoWidth || bitmapTexture.height !== image.videoHeight;
      if (sizeChanged) {
        // note clears image and mipmaps when resizing
        bitmapTexture.resize({width: image.videoWidth, height: image.videoHeight, mipmaps: true});
        bitmapTexture.setSubImageData({
          data: image,
          paramters: DEFAULT_TEXTURE_PARAMETERS
        });
      } else {
        bitmapTexture.setSubImageData({
          data: image
        });
      }

      bitmapTexture.generateMipmap();
    }

    // // TODO fix zFighting
    // Render the image
    if (bitmapTexture && model) {
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            bitmapTexture,
            desaturate,
            transparentColor: transparentColor.map(x => x / 255),
            tintColor: tintColor.slice(0, 3).map(x => x / 255)
          })
        )
        .draw();
    }
  }

  loadTexture(image) {
    const {gl} = this.context;

    if (this.state.bitmapTexture) {
      this.state.bitmapTexture.delete();
    }

    if (image instanceof Texture2D) {
      this.setState({bitmapTexture: image});
    } else if (image instanceof HTMLVideoElement) {
      // Initialize an empty texture while we wait for the video to load
      this.setState({
        bitmapTexture: new Texture2D(gl, {
          width: 1,
          height: 1,
          parameters: DEFAULT_TEXTURE_PARAMETERS,
          mipmaps: false
        })
      });
    } else if (image) {
      // Browser object: Image, ImageData, HTMLCanvasElement, ImageBitmap
      this.setState({
        bitmapTexture: new Texture2D(gl, {
          data: image,
          parameters: DEFAULT_TEXTURE_PARAMETERS
        })
      });
    }
  }
}

PixelatedBitmapLayer.layerName = 'PixelatedBitmapLayer';
PixelatedBitmapLayer.defaultProps = defaultProps;
