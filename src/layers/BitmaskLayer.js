import GL from '@luma.gl/constants'; // eslint-disable-line import/no-extraneous-dependencies
import { project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { Texture2D, isWebGL2 } from '@luma.gl/core';
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
    const { channelIsOn, bounds } = this.props;
    const { textures, model, colorTex } = this.state;
    // Render the image
    if (textures && model && colorTex) {
      const { mousePosition } = this.context;
      const layerView = this.context.deck.viewManager.views.filter(
        view => view.id === 'ortho',
      )[0];
      const { viewState } = this.context.deck.viewManager;
      const { height, width } = this.context.deck;
      const viewport = layerView.makeViewport({
        height,
        width,
        viewState,
      });
      let hoveredCell;
      if (mousePosition && viewport.containsPixel(mousePosition)) {
        const coordinate = viewport.unproject(Object.values(mousePosition));
        // The zoomed out layer needs to use the fixed zoom at which it is rendered.
        // See: https://github.com/visgl/deck.gl/blob/2b15bc459c6534ea38ce1153f254ce0901f51d6f/modules/geo-layers/src/tile-layer/utils.js#L130.
        const { tileSize } = this.props.loader[0];
        const { z } = this.props.tileId;
        // The zoomed out layer needs to use the fixed zoom at which it is rendered.
        // See: https://github.com/visgl/deck.gl/blob/2b15bc459c6534ea38ce1153f254ce0901f51d6f/modules/geo-layers/src/tile-layer/utils.js#L130.
        const layerZoomScale = Math.max(
          1,
          2 ** Math.round(-z + Math.log2(512 / tileSize)),
        );
        const dataCoords = [
          Math.floor((coordinate[0] - bounds[0]) / layerZoomScale),
          Math.floor((coordinate[1] - bounds[3]) / layerZoomScale),
        ];
        if (dataCoords.every(i => i > 0)
          && coordinate[0] < bounds[2]
          && coordinate[1] < bounds[1]) {
          const coords = dataCoords[1] * this.props.channelData.width + dataCoords[0];
          const hoverData = this.props.channelData.data.map(d => d[coords]);
          hoveredCell = hoverData.find(i => i > 0);
          this.parent.parent.setState({ hoveredCell });
        }
      }
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            hovered: hoveredCell || this.parent.parent.state.hoveredCell || 0,
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
