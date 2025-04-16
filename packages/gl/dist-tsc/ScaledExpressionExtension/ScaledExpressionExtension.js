/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
import GL from '@luma.gl/constants';
import { LayerExtension } from '@deck.gl/core';
import { GLSL_COLORMAPS, GLSL_COLORMAP_DEFAULT, COLORMAP_SHADER_PLACEHOLDER } from '../constants.js';
import module from './shader-module.js';
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
            }
            else {
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
    initializeState() {
        const layer = this.getCurrentLayer();
        // No need to run this on layers that don't have a `draw` call.
        if (layer.isComposite) {
            return;
        }
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
                    // PolygonLayer fill needs not-intsanced attribute but
                    // ScatterplotLayer and the PolygonLayer stroke needs instanced.
                    // So use another attribute's divisor property as a proxy for this divisor.
                    divisor: Object.values(attributeManager.attributes)[0].settings.divisor,
                },
            });
        }
    }
    draw() {
        const { colorScaleLo, colorScaleHi, isExpressionMode, } = this.props;
        const { topModel, sideModel, models, model, } = this.state;
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
