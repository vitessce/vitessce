/* eslint-disable no-underscore-dangle */
import { _mergeShaders, project32, picking } from '@deck.gl/core'; // eslint-disable-line import/no-extraneous-dependencies
import { ScatterplotLayer } from '@deck.gl/layers'; // eslint-disable-line import/no-extraneous-dependencies
import GL from '@luma.gl/constants'; // eslint-disable-line import/no-extraneous-dependencies
import { vertexShader, fragmentShader } from './dynamic-opacity-scatterplot-layer-shaders';

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  /* Custom props for DynamicOpacityScatterplotLayer */
  colormap: { type: 'string', value: 'plasma', compare: true },
  colorScaleLo: { type: 'number', value: 0.0, compare: true },
  colorScaleHi: { type: 'number', value: 1.0, compare: true },
  isExpressionMode: false,
  getExpressionValue: { type: 'accessor', value: 0 },
  getSelectionState: { type: 'accessor', value: 0.0 },

  /* Props copied from ScatterplotLayer */
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

export default class DynamicOpacityScatterplotLayer extends ScatterplotLayer {
  /**
   * Copy of getShaders from Layer (grandparent, parent of ScatterplotLayer).
   * Reference: https://github.com/visgl/deck.gl/blob/0afd4e99a6199aeec979989e0c361c97e6c17a16/modules/core/src/lib/layer.js#L302
   * @param {object} shaders
   * @returns {object} Merged shaders.
   */
  // eslint-disable-next-line no-underscore-dangle
  _getShaders(shaders) {
    this.props.extensions.forEach((extension) => {
      // eslint-disable-next-line no-param-reassign
      shaders = _mergeShaders(shaders, extension.getShaders.call(this, extension));
    });
    return shaders;
  }

  getShaders() {
    const { colormap } = this.props;
    return this._getShaders({
      vs: vertexShader,
      fs: fragmentShader.replace('__colormap', colormap),
      modules: [project32, picking],
    });
  }

  initializeState() {
    super.initializeState();
    this.getAttributeManager().addInstanced({
      instanceExpressionValue: {
        size: 1,
        transition: true,
        accessor: 'getExpressionValue',
        defaultValue: 1,
      },
      instanceSelectionState: {
        size: 1,
        transition: true,
        accessor: 'getSelectionState',
        type: GL.UNSIGNED_BYTE,
        defaultValue: 1,
      },
    });
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
      colorScaleLo,
      colorScaleHi,
      isExpressionMode,
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
        uColorScaleRange: [colorScaleLo, colorScaleHi],
        uIsExpressionMode: isExpressionMode,
      })
      .draw();
  }
}

DynamicOpacityScatterplotLayer.layerName = 'DynamicOpacityScatterplotLayer';
DynamicOpacityScatterplotLayer.defaultProps = defaultProps;
