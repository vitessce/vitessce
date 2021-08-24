import glsl from 'glslify';

/**
 *
 * Reference: https://github.com/visgl/deck.gl/blob/8.4-release/modules/layers/src/scatterplot-layer/scatterplot-layer-vertex.glsl.js
 * Reference: https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
 * Reference: https://github.com/flekschas/regl-scatterplot/blob/5e3b03e/src/point.vs
 */
const vs = glsl`
#pragma glslify: plasma = require("glsl-colormap/plasma")
#pragma glslify: viridis = require("glsl-colormap/viridis")
#pragma glslify: greys = require("glsl-colormap/greys")
#pragma glslify: magma = require("glsl-colormap/magma")
#pragma glslify: jet = require("glsl-colormap/jet")
#pragma glslify: bone = require("glsl-colormap/bone")
#pragma glslify: copper = require("glsl-colormap/copper")
#pragma glslify: density = require("glsl-colormap/density")
#pragma glslify: inferno = require("glsl-colormap/inferno")
#pragma glslify: cool = require("glsl-colormap/cool")
#pragma glslify: hot = require("glsl-colormap/hot")
#pragma glslify: spring = require("glsl-colormap/spring")
#pragma glslify: summer = require("glsl-colormap/summer")
#pragma glslify: autumn = require("glsl-colormap/autumn")
#pragma glslify: winter = require("glsl-colormap/winter")

// Custom attributes for Vitessce:
attribute float expressionValue;

// Custom uniforms for Vitessce:
uniform vec2 uColorScaleRange;
uniform bool uIsExpressionMode;

`;

const inject = {
  'vs:DECKGL_FILTER_COLOR': `
    if(uIsExpressionMode) {
      float normalziedExpressionValue = expressionValue / 255.0;
      float scaledExpressionValue = (normalziedExpressionValue - uColorScaleRange[0]) / max(0.005, (uColorScaleRange[1] - uColorScaleRange[0]));
      color.rgb = COLORMAP_FUNC(clamp(scaledExpressionValue, 0.0, 1.0)).rgb;
    }
  `,
};

export default {
  name: 'scaled-expression',
  vs,
  inject,
};
