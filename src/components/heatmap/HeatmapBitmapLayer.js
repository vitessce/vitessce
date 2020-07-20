/* eslint-disable */
import GL from '@luma.gl/constants';
import { _mergeShaders, project32, picking } from '@deck.gl/core';
import { BitmapLayer} from '@deck.gl/layers';
import { Model, Geometry, Texture2D } from '@luma.gl/core';
import { vs, fs } from './shaders';

export const TILE_SIZE = 2048;

const DEFAULT_TEXTURE_PARAMETERS = {
  // NEAREST for integer data to prevent interpolation.
  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
  // CLAMP_TO_EDGE to remove tile artifacts.
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

const defaultProps = {
  image: { type: 'object', value: null, async: true },
  colormap: { type: 'string', value: 'plasma', compare: true },
  bounds: { type: 'array', value: [1, 0, 0, 1], compare: true },
  aggSizeX: { type: 'number', value: 8.0, compare: true },
  aggSizeY: { type: 'number', value: 8.0, compare: true },
};

export default class HeatmapBitmapLayer extends BitmapLayer {
  
  /**
   * Copy of getShaders from Layer (grandparent, parent of BitmapLayer).
   * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/core/src/lib/layer.js#L302
   * @param {object} shaders
   * @returns {object} Merged shaders.
   */
  _getShaders(shaders) {
    for (const extension of this.props.extensions) {
      shaders = _mergeShaders(shaders, extension.getShaders.call(this, extension));
    }
    return shaders;
  }

  /**
   * Need to override to provide custom shaders.
   */
  getShaders() {
    const { colormap } = this.props;
    return this._getShaders({
      vs,
      fs: fs.replace('__colormap', colormap),
      modules: [ project32, picking ]
    });
  }
  
  /*initializeState() {
    const attributeManager = this.getAttributeManager();

    attributeManager.remove(['instancePickingColors']);
    const noAlloc = true;

    attributeManager.add({
      indices: {
        size: 1,
        isIndexed: true,
        update: attribute => (attribute.value = this.state.mesh.indices),
        noAlloc
      },
      positions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        update: attribute => (attribute.value = this.state.mesh.positions),
        noAlloc
      },
      texCoords: {
        size: 2,
        update: attribute => (attribute.value = this.state.mesh.texCoords),
        noAlloc
      }
    });
  }*/

  /*updateState({ props, oldProps, changeFlags }) {
    // setup model first
    if (changeFlags.extensionsChanged) {
      const { gl } = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      this.setState({model: this._getModel(gl)});
      this.getAttributeManager().invalidateAll();
    }

    if (props.image !== oldProps.image) {
      this.loadTexture(props.image);
    }

    const attributeManager = this.getAttributeManager();

    if (props.bounds !== oldProps.bounds) {
      const oldMesh = this.state.mesh;
      const mesh = this._createMesh();
      this.state.model.setVertexCount(mesh.vertexCount);
      for (const key in mesh) {
        if (oldMesh && oldMesh[key] !== mesh[key]) {
          attributeManager.invalidate(key);
        }
      }
      this.setState({mesh});
    }
  }*/

  /*finalizeState() {
    super.finalizeState();

    if (this.state.bitmapTexture) {
      this.state.bitmapTexture.delete();
    }
  }*/

  /*_createMesh() {
    const { bounds } = this.props;

    let normalizedBounds = bounds;
    // bounds as [minX, minY, maxX, maxY]
    if (Number.isFinite(bounds[0])) {
      //
        (minX0, maxY3) ---- (maxX2, maxY3)
              |                  |
              |                  |
              |                  |
        (minX0, minY1) ---- (maxX2, minY1)
      //
      normalizedBounds = [
        [bounds[0], bounds[1]],
        [bounds[0], bounds[3]],
        [bounds[2], bounds[3]],
        [bounds[2], bounds[1]]
      ];
    }

    return createMesh(normalizedBounds, this.context.viewport.resolution);
  }*/

  /*_getModel(gl) {
    if (!gl) {
      return null;
    }

    //
      0,0 --- 1,0
      |       |
      0,1 --- 1,1
    //
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLES,
          vertexCount: 6
        }),
        isInstanced: false
      })
    );
  }*/

  /**
   * Need to override to provide additional uniform values.
   * Simplified by removing video-related code.
   * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/layers/src/bitmap-layer/bitmap-layer.js#L173
   * @param {*} opts 
   */
  draw(opts) {
    const { uniforms } = opts;
    const { bitmapTexture, model } = this.state;
    const { aggSizeX, aggSizeY } = this.props;
    console.log(aggSizeX, aggSizeY);

    // // TODO fix zFighting
    // Render the image
    if (bitmapTexture && model) {
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            uBitmapTexture: bitmapTexture,
            uTextureSize: [TILE_SIZE, TILE_SIZE],
            uAggSize: [aggSizeX, aggSizeY],
          })
        )
        .draw();
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
    const { gl } = this.context;
    
    if(this.state.bitmapTexture) {
      this.state.bitmapTexture.delete();
    }
    
    if(image instanceof Texture2D) {
      this.setState({
        bitmapTexture: image,
      });
    } else if(image) {
      this.setState({
        bitmapTexture: new Texture2D(gl, {
          data: image,
          parameters: DEFAULT_TEXTURE_PARAMETERS,
          // Each color contains a single luminance value.
          // When sampled, rgb are all set to this luminance, alpha is 1.0.
          // Reference: https://luma.gl/docs/api-reference/webgl/texture#texture-formats
          format: GL.LUMINANCE,
          dataFormat: GL.LUMINANCE,
          width: TILE_SIZE,
          height: TILE_SIZE,
        }),
      });
    }
  }
}
HeatmapBitmapLayer.layerName = 'HeatmapBitmapLayer';
HeatmapBitmapLayer.defaultProps = defaultProps;
