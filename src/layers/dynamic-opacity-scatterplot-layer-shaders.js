import glsl from 'glslify';

/**
 *
 * Reference: https://github.com/visgl/deck.gl/blob/8.4-release/modules/layers/src/scatterplot-layer/scatterplot-layer-vertex.glsl.js
 * Reference: https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
 * Reference: https://github.com/flekschas/regl-scatterplot/blob/5e3b03e/src/point.vs
 */
export const vertexShader = glsl`
#define SHADER_NAME dynamic-opacity-scatterplot-layer-vertex-shader

attribute vec3 positions;

attribute vec3 instancePositions;
attribute vec3 instancePositions64Low;
attribute float instanceRadius;
attribute float instanceLineWidths;
attribute vec4 instanceFillColors;
attribute vec4 instanceLineColors;
attribute vec3 instancePickingColors;
// Custom attributes for Vitessce:
attribute float instanceExpressionValue;
attribute float instanceSelectionState;


uniform float opacity;
uniform float radiusScale;
uniform float radiusMinPixels;
uniform float radiusMaxPixels;
uniform float lineWidthScale;
uniform float lineWidthMinPixels;
uniform float lineWidthMaxPixels;
uniform bool filled;
// Custom uniforms for Vitessce:
uniform bool uIsExpressionMode;
uniform bool uIsAbsoluteRadiusMode;

varying vec4 vFillColor;
varying vec4 vLineColor;
varying vec2 unitPosition;
varying float innerUnitRadius;
varying float outerRadiusPixels;
// Custom varyings for Vitessce:
varying float vOpacity;
varying float vExpressionValue;
varying float vSelectionState;

void main(void) {
  geometry.worldPosition = instancePositions;

  // Multiply out radius and clamp to limits
  outerRadiusPixels = clamp(
    project_size_to_pixel(radiusScale * instanceRadius),
    radiusMinPixels, radiusMaxPixels
  );

  if(instanceSelectionState == 1.0) {
    // For selected points, do not vary size by zoom level.
    outerRadiusPixels = radiusMaxPixels / 4.0;
  }
  
  // Multiply out line width and clamp to limits
  float lineWidthPixels = clamp(
    project_size_to_pixel(lineWidthScale * instanceLineWidths),
    lineWidthMinPixels, lineWidthMaxPixels
  );


  // position on the containing square in [-1, 1] space
  unitPosition = positions.xy;
  geometry.uv = unitPosition;
  geometry.pickingColor = instancePickingColors;

  innerUnitRadius = lineWidthPixels / outerRadiusPixels;
  
  vec3 offset = positions * project_pixel_size(outerRadiusPixels);
  DECKGL_FILTER_SIZE(offset, geometry);
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vOpacity = opacity;

  // Apply opacity to instance color, or return instance picking color
  vFillColor = vec4(instanceFillColors.rgb, opacity);
  DECKGL_FILTER_COLOR(vFillColor, geometry);
  vLineColor = vec4(instanceLineColors.rgb, opacity);
  DECKGL_FILTER_COLOR(vLineColor, geometry);

  vExpressionValue = instanceExpressionValue / 255.0;
  vSelectionState = instanceSelectionState;
}
`;

/**
 * Fragment shader adapted to perform aggregation and
 * take color scale functions + sliders into account.
 * Reference: https://github.com/visgl/deck.gl/blob/8.4-release/modules/layers/src/scatterplot-layer/scatterplot-layer-fragment.glsl.js
 * Reference: https://observablehq.com/@rreusser/selecting-the-right-opacity-for-2d-point-clouds
 * Reference: https://github.com/flekschas/regl-scatterplot/blob/master/src/point.fs
 * Reference: https://github.com/hubmapconsortium/vitessce-image-viewer/blob/06231ae02cac1ff57ba458c71e9bc59ed2fc4f8b/src/layers/XRLayer/xr-layer-fragment-colormap.webgl1.glsl
 */
export const fragmentShader = glsl`
#define SHADER_NAME dynamic-opacity-scatterplot-layer-fragment-shader

precision highp float;

#pragma glslify: rdbu = require("glsl-colormap/rdbu")
#pragma glslify: jet = require("glsl-colormap/jet")
#pragma glslify: viridis = require("glsl-colormap/viridis")
#pragma glslify: inferno = require("glsl-colormap/inferno")
#pragma glslify: magma = require("glsl-colormap/magma")
#pragma glslify: plasma = require("glsl-colormap/plasma")

// Custom uniforms for Vitessce:
uniform vec2 uColorScaleRange;
uniform bool uIsExpressionMode;

varying vec2 unitPosition;
varying float innerUnitRadius;
varying float outerRadiusPixels;
varying vec4 vFillColor;
// Custom varyings for Vitessce:
varying float vOpacity;
varying float vExpressionValue;
varying float vSelectionState;

void main(void) {
  geometry.uv = unitPosition;
  float distToCenter = length(unitPosition) * outerRadiusPixels;
  float inInnerCircle = smoothedge(distToCenter, outerRadiusPixels);

  float inOuterCircle = smoothedge(distToCenter, outerRadiusPixels);
  if (inOuterCircle == 0.0) {
    discard;
  }

  float intensityMean = vExpressionValue;
  float scaledIntensityMean = (intensityMean - uColorScaleRange[0]) / max(0.005, (uColorScaleRange[1] - uColorScaleRange[0]));
  if(uIsExpressionMode) {
    gl_FragColor = __colormap(clamp(scaledIntensityMean, 0.0, 1.0));
  } else {
    gl_FragColor = vFillColor;
  }
  gl_FragColor.a = vOpacity;

  if (vSelectionState == 1.0 && inOuterCircle == 1.0 && inInnerCircle == 0.0) {
    gl_FragColor.a = 0.0;
  } else if(vSelectionState == 1.0) {
    gl_FragColor.a = 1.0;
  }

  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
