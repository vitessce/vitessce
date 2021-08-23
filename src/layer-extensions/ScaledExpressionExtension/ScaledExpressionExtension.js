/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
import { LayerExtension } from '@deck.gl/core';
import { GLSL_COLORMAPS, GLSL_COLORMAP_DEFAULT, COLORMAP_SHADER_PLACEHOLDER } from './constants';
import module from './shader-module';

const defaultProps = {
  /* Custom props for DynamicOpacityScatterplotLayer */
  colormap: { type: 'string', value: GLSL_COLORMAP_DEFAULT, compare: true },
  colorScaleLo: { type: 'number', value: 0.0, compare: true },
  colorScaleHi: { type: 'number', value: 1.0, compare: true },
  isExpressionMode: false,
  getExpressionValue: { type: 'accessor', value: 0 },
  getSelectionState: { type: 'accessor', value: 0.0 },
};

export default class ScaledExpressionExtension extends LayerExtension {
  // eslint-disable-next-line class-methods-use-this
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

  /**
   * Invalidate the shaders if the colormap has changed, since the new
   * shader needs string replacement.
   * Reference: https://github.com/visgl/deck.gl/blob/f3b2aab/modules/layers/src/scatterplot-layer/scatterplot-layer.js#L102
   * Reference: https://github.com/hms-dbmi/viv/blob/7e113ab2a8551fd7b2807318e1df1788aab3dad4/src/layers/XRLayer/XRLayer.js#L145
   * @param {object} param0
   */
  updateState({ props, oldProps }) {
    if (props.colormap !== oldProps.colormap) {
      const { gl } = this.context;
      if (this.state.model) {
        // eslint-disable-next-line no-unused-expressions
        this.state.model?.delete();
        this.state.model = this._getModel(gl);
      } else if (this.state.models) {
        // eslint-disable-next-line no-unused-expressions
        this.state.models?.forEach(model => model?.delete());
        this.setState(this._getModels(this.context.gl));
      }
      const attributeManager = this.getAttributeManager();
      if (attributeManager) {
        this.getAttributeManager().invalidateAll();
      }
    }
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.addInstanced({
        instanceExpressionValue: {
          size: 1,
          transition: true,
          accessor: 'getExpressionValue',
          defaultValue: 1,
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

    // eslint-disable-next-line no-unused-expressions
    model?.setUniforms({
      uColorScaleRange: [colorScaleLo, colorScaleHi],
      uIsExpressionMode: isExpressionMode,
    });
    // eslint-disable-next-line no-unused-expressions
    models?.forEach(m => m.setUniforms({
      uColorScaleRange: [colorScaleLo, colorScaleHi],
      uIsExpressionMode: isExpressionMode,
    }));
    // eslint-disable-next-line no-unused-expressions
    topModel?.setUniforms({
      uColorScaleRange: [colorScaleLo, colorScaleHi],
      uIsExpressionMode: isExpressionMode,
    });
    // eslint-disable-next-line no-unused-expressions
    sideModel?.setUniforms({
      uColorScaleRange: [colorScaleLo, colorScaleHi],
      uIsExpressionMode: isExpressionMode,
    });
  }
}

ScaledExpressionExtension.extensionName = 'ScaledExpressionExtension';
ScaledExpressionExtension.defaultProps = defaultProps;
