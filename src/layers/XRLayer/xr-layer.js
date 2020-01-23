import GL from '@luma.gl/constants';
import { Layer, project32 } from '@deck.gl/core';
import { Model, Geometry } from '@luma.gl/core';
import vs from './xr-layer-vertex';
import fs from './xr-layer-fragment';

const defaultProps = {
  rgbTexture: null,
};

/*
 * @class
 * @param {object} props
 * @param {number} props.transparentColor - color to interpret transparency to
 * @param {number} props.tintColor - color bias
 */
export default class XRLayer extends Layer {
  getShaders() {
    return super.getShaders({ vs, fs, modules: [project32] });
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();

    attributeManager.add({
      positions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        update: this.calculatePositions,
        noAlloc: true,
      },
    });

    this.setState({
      numInstances: 1,
      positions: new Float64Array(12),
    });

    attributeManager.remove('instancePickingColors');
  }

  finalizeState() {
    super.finalizeState();

    if (this.state.rgbTextures) {
      Object.values(this.state.rgbTextures).forEach(tex => tex.delete());
    }
  }

  updateState({ props, oldProps, changeFlags }) {
    // setup model first
    if (changeFlags.extensionsChanged) {
      const { gl } = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      // eslint-disable-next-line  no-underscore-dangle
      this.setState({ model: this._getModel(gl) });
      this.getAttributeManager().invalidateAll();
    }
    if (changeFlags.dataChanged) {
      this.loadTexture(props.rgbTextures);
    }

    const attributeManager = this.getAttributeManager();

    if (props.bounds !== oldProps.bounds) {
      attributeManager.invalidate('positions');
    }
  }

  // eslint-disable-next-line  no-underscore-dangle
  _getModel(gl) {
    if (!gl) {
      return null;
    }

    /*
       0,0 --- 1,0
        |       |
       0,1 --- 1,1
     */
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          vertexCount: 4,
          attributes: {
            texCoords: new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]),
          },
        }),
        isInstanced: false,
      }),
    );
  }

  calculatePositions(attributes) {
    const { positions } = this.state;
    const { bounds } = this.props;
    // bounds as [minX, minY, maxX, maxY]
    /*
      (minX0, maxY3) ---- (maxX2, maxY3)
             |                  |
             |                  |
             |                  |
      (minX0, minY1) ---- (maxX2, minY1)
   */
    /* eslint-disable prefer-destructuring */
    positions[0] = bounds[0];
    positions[1] = bounds[1];
    positions[2] = 0;

    positions[3] = bounds[0];
    positions[4] = bounds[3];
    positions[5] = 0;

    positions[6] = bounds[2];
    positions[7] = bounds[3];
    positions[8] = 0;

    positions[9] = bounds[2];
    positions[10] = bounds[1];
    positions[11] = 0;
    /* eslint-disable prefer-destructuring */

    // eslint-disable-next-line no-param-reassign
    attributes.value = positions;
  }

  draw({ uniforms }) {
    const { rgbTextures, model } = this.state;
    if (rgbTextures && model) {
      model
        .setUniforms(
          Object.assign({}, uniforms, {
            ...this.props.sliderValues,
            ...rgbTextures,
          }),
        )
        .draw();
    }
  }

  loadTexture(textures) {
    if (textures instanceof Promise) {
      textures.then((textureList) => {
        this.setState({ rgbTextures: Object.assign({}, ...textureList) });
      });
    } else if (textures instanceof Object) {
      this.setState({ rgbTextures: Object.assign({}, ...textures) });
    }
  }
}

XRLayer.layerName = 'XRLayer';
XRLayer.defaultProps = defaultProps;
