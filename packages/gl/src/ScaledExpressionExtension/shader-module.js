import { colormaps } from '../glsl/index.js';

/**
 *
 * Reference: https://github.com/visgl/deck.gl/blob/8.4-release/modules/layers/src/scatterplot-layer/scatterplot-layer-vertex.glsl.js
 * Reference: https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
 * Reference: https://github.com/flekschas/regl-scatterplot/blob/5e3b03e/src/point.vs
 */
// lang: glsl
const vs = `
${colormaps}

// Custom attributes for Vitessce:
in float expressionValue;

// Custom uniforms for Vitessce:
uniform vec2 uColorScaleRange;
uniform bool uIsExpressionMode;

`;

const inject = {
  // lang: glsl
  'vs:DECKGL_FILTER_COLOR': `
    if(uIsExpressionMode) {
      float normalizedExpressionValue = expressionValue / 255.0;
      float scaledExpressionValue = (normalizedExpressionValue - uColorScaleRange[0]) / max(0.005, (uColorScaleRange[1] - uColorScaleRange[0]));
      color.rgb = COLORMAP_FUNC(clamp(scaledExpressionValue, 0.0, 1.0)).rgb;
    }
  `,
};

export default {
  name: 'scaled-expression',
  vs,
  inject,
};
