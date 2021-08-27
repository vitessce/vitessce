/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
import GL from '@luma.gl/constants';
import { LayerExtension } from '@deck.gl/core';
import { GLSL_COLORMAPS, GLSL_COLORMAP_DEFAULT, COLORMAP_SHADER_PLACEHOLDER } from '../../layers/constants';
import module from './shader-module';

const defaultProps = {
  colormap: { type: 'string', value: GLSL_COLORMAP_DEFAULT, compare: true },
  colorScaleLo: { type: 'number', value: 0.0, compare: true },
  colorScaleHi: { type: 'number', value: 1.0, compare: true },
  isExpressionMode: false,
  getExpressionValue: { type: 'accessor', value: 0 },
  getSelectionState: { type: 'accessor', value: 0.0 },
};

export default class ScaledExpressionExtension extends LayerExtension {
  getShaders() {
    const { colormap } = this.props;
    return {
      modules: [module],
      defines: {
        [COLORMAP_SHADER_PLACEHOLDER]: GLSL_COLORMAPS.includes(colormap)
          ? colormap
          : GLSL_COLORMAP_DEFAULT,
      },
    };
  }

  updateState({ props, oldProps }) {
    if (props.colormap !== oldProps.colormap) {
      const { gl } = this.context;
      // Normal single model layers, like ScatterplotLayer
      if (this.state.model) {
        // eslint-disable-next-line no-unused-expressions
        this.state.model?.delete();
        this.state.model = this._getModel(gl);
      } else {
        // Special handling for PolygonLayer sublayer models.
        if (this.state.models) {
          // eslint-disable-next-line no-unused-expressions
          this.state.models?.forEach(model => model?.delete());
        }
        if (this.state.topModel) {
           // eslint-disable-next-line no-unused-expressions
           this.state.topModel?.delete();
        }
        if (this.state.sideModel) {
           // eslint-disable-next-line no-unused-expressions
           this.state.sideModel?.delete();
        }
        if (this._getModels) {
          this.setState(this._getModels(this.context.gl));
        }
      }
      const attributeManager = this.getAttributeManager();
      if (attributeManager) {
        this.getAttributeManager().invalidateAll();
      }
    }
  }

  initializeState(context, extension) {
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      // This attributes is the array of expression data needed for
      // coloring cells against the colormap.
      attributeManager.add({
        expressionValue: {
          type: GL.FLOAT,
          size: 1,
          transition: true,
          accessor: 'getExpressionValue',
          defaultValue: 1,
          // PolygonLayer needs not-intsanced attribute but
          // ScatterplotLayer needs instanced.
          divisor: Number(extension.opts.instanced),
        },
      });
    }
  }

  draw() {
    const {
      colorScaleLo,
      colorScaleHi,
      isExpressionMode,
    } = this.props;
    const {
      topModel, sideModel, models, model,
    } = this.state;
    const uniforms = {
      uColorScaleRange: [colorScaleLo, colorScaleHi],
      uIsExpressionMode: isExpressionMode,
    };
    // ScatterplotLayer model
    // eslint-disable-next-line no-unused-expressions
    model?.setUniforms(uniforms);

    // PolygonLayer models from sublayers
    // eslint-disable-next-line no-unused-expressions
    models?.forEach(m => m.setUniforms(uniforms));
    // eslint-disable-next-line no-unused-expressions
    topModel?.setUniforms(uniforms);
    // eslint-disable-next-line no-unused-expressions
    sideModel?.setUniforms(uniforms);
  }
}

ScaledExpressionExtension.extensionName = 'ScaledExpressionExtension';
ScaledExpressionExtension.defaultProps = defaultProps;
