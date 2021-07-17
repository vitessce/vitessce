/* eslint-disable no-underscore-dangle */
import { Layer, project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import GL from '@luma.gl/constants'; // eslint-disable-line import/no-extraneous-dependencies
import { Model, Geometry } from '@luma.gl/core';

import { vertexShader, fragmentShader } from './dynamic-opacity-scatterplot-layer-shaders';

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  colormap: { type: 'string', value: 'plasma', compare: true },

  radiusUnits: 'meters',
  radiusScale: { type: 'number', min: 0, value: 1 },
  radiusMinPixels: { type: 'number', min: 0, value: 0 }, //  min point radius in pixels
  radiusMaxPixels: { type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER }, // max point radius in pixels

  lineWidthUnits: 'meters',
  lineWidthScale: { type: 'number', min: 0, value: 1 },
  lineWidthMinPixels: { type: 'number', min: 0, value: 0 },
  lineWidthMaxPixels: { type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER },

  stroked: false,
  filled: true,

  getPosition: { type: 'accessor', value: x => x.position },
  getRadius: { type: 'accessor', value: 1 },
  getFillColor: { type: 'accessor', value: DEFAULT_COLOR },
  getLineColor: { type: 'accessor', value: DEFAULT_COLOR },
  getLineWidth: { type: 'accessor', value: 1 },

  // deprecated
  strokeWidth: { deprecatedFor: 'getLineWidth' },
  outline: { deprecatedFor: 'stroked' },
  getColor: { deprecatedFor: ['getFillColor', 'getLineColor'] },
};

export default class DynamicOpacityScatterplotLayer extends Layer {
  getShaders() {
    const { colormap } = this.props;
    return super.getShaders({
      vs: vertexShader,
      fs: fragmentShader.replace('__colormap', colormap),
      modules: [project32, picking],
    });
  }

  initializeState() {
    this.getAttributeManager().addInstanced({
      instancePositions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getPosition',
      },
      instanceRadius: {
        size: 1,
        transition: true,
        accessor: 'getRadius',
        defaultValue: 1,
      },
      instanceFillColors: {
        size: this.props.colorFormat.length,
        transition: true,
        normalized: true,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getFillColor',
        defaultValue: [0, 0, 0, 255],
      },
      instanceLineColors: {
        size: this.props.colorFormat.length,
        transition: true,
        normalized: true,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getLineColor',
        defaultValue: [0, 0, 0, 255],
      },
      instanceLineWidths: {
        size: 1,
        transition: true,
        accessor: 'getLineWidth',
        defaultValue: 1,
      },
    });
  }

  updateState({ props, oldProps, changeFlags }) {
    super.updateState({ props, oldProps, changeFlags });
    if (changeFlags.extensionsChanged) {
      const { gl } = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      this.setState({ model: this._getModel(gl) });
      this.getAttributeManager().invalidateAll();
    }
  }

  draw({ uniforms }) {
    const { viewport } = this.context;
    const {
      radiusUnits,
      radiusScale,
      radiusMinPixels,
      radiusMaxPixels,
      stroked,
      filled,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
    } = this.props;

    const pointRadiusMultiplier = radiusUnits === 'pixels' ? viewport.metersPerPixel : 1;
    const lineWidthMultiplier = lineWidthUnits === 'pixels' ? viewport.metersPerPixel : 1;

    this.state.model
      .setUniforms(uniforms)
      .setUniforms({
        stroked: stroked ? 1 : 0,
        filled,
        radiusScale: radiusScale * pointRadiusMultiplier,
        radiusMinPixels,
        radiusMaxPixels,
        lineWidthScale: lineWidthScale * lineWidthMultiplier,
        lineWidthMinPixels,
        lineWidthMaxPixels,
      })
      .draw();
  }

  _getModel(gl) {
    // a square that minimally cover the unit circle
    const positions = [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0];

    return new Model(
      gl,
      Object.assign(this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          vertexCount: 4,
          attributes: {
            positions: { size: 3, value: new Float32Array(positions) },
          },
        }),
        isInstanced: true,
      }),
    );
  }
}

DynamicOpacityScatterplotLayer.layerName = 'DynamicOpacityScatterplotLayer';
DynamicOpacityScatterplotLayer.defaultProps = defaultProps;
