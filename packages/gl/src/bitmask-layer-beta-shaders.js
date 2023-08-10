import { colormaps } from './glsl/index.js';

export const vs = `
#define SHADER_NAME bitmask-layer-vertex-shader

attribute vec2 texCoords;
attribute vec3 positions;
attribute vec3 positions64Low;
attribute vec3 instancePickingColors;

varying vec2 vTexCoord;

void main(void) {
  geometry.worldPosition = positions;
  geometry.uv = texCoords;
  geometry.pickingColor = instancePickingColors;
  gl_Position = project_position_to_clipspace(positions, positions64Low, vec3(0.0), geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vTexCoord = texCoords;
  vec4 color = vec4(0.0);
  DECKGL_FILTER_COLOR(color, geometry);
}
`;

export const fs = `
#define SHADER_NAME bitmask-layer-fragment-shader
precision highp float;

${colormaps}

// Note: can have a maximum of 16 textures in most browsers
// Reference: https://webglreport.com/

// Data (mask) texture
uniform sampler2D channel0;
uniform sampler2D channel1;
uniform sampler2D channel2;
uniform sampler2D channel3;
uniform sampler2D channel4;
uniform sampler2D channel5;
uniform sampler2D channel6;

// Color texture
// uniform float colorTexHeight;
// uniform float colorTexWidth;
uniform float hovered;

// Channel-specific properties
uniform bool channelsVisible[7];
uniform float channelOpacities[7];
uniform bool channelIsStaticColorMode[7];

// TODO: can array of tuples/vec2 be used?
uniform float channelColormapRangeStarts[7];
uniform float channelColormapRangeEnds[7];

// Use one expressionTex for all channels,
// using an offset mechanism.
uniform sampler2D expressionTex;
uniform float offsets[7];
uniform float multiFeatureTexSize;
uniform float texHeight;

// Static colors
// TODO: For some reason I cannot use uniform vec3 colors[7]; and i cannot figure out why.
uniform vec3 color0;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
uniform vec3 color5;
uniform vec3 color6;

// Info for edge-only mode
uniform float scaleFactor;
uniform bool channelsFilled[7];
uniform float channelStrokeWidths[7];

// opacity
uniform float opacity;

varying vec2 vTexCoord;

vec4 sampleAndGetColor(sampler2D dataTex, vec2 coord, bool isOn, vec3 channelColor, float channelOpacity, bool isFilled, bool isStaticColorMode, float strokeWidth, float featureOffset, float rangeStart, float rangeEnd) {
  float sampledData = texture(dataTex, coord).r;
  float clampedSampledData = max(0., min(sampledData, 1.));

  bool isEdge = true;

  if(!isFilled) {
    vec2 uTextureSize = vec2(2048.0, 2048.0);
    vec2 onePixel = vec2(1.0, 1.0) / uTextureSize;

    // Vary the edgeSize based on user-defined stroke width.
    float edgeSize = 150.0 * strokeWidth * scaleFactor;

    float pixN = texture(dataTex, coord + vec2(0.0, onePixel.y * edgeSize)).r;
    float pixS = texture(dataTex, coord - vec2(0.0, onePixel.y * edgeSize)).r;
    float pixW = texture(dataTex, coord + vec2(onePixel.x * edgeSize, 0.0)).r;
    float pixE = texture(dataTex, coord - vec2(onePixel.x * edgeSize, 0.0)).r;

    float pixNW = texture(dataTex, coord + vec2(onePixel.y * edgeSize, onePixel.y * edgeSize)).r;
    float pixNE = texture(dataTex, coord + vec2(-1.0 * onePixel.x * edgeSize, onePixel.y * edgeSize)).r;
    float pixSW = texture(dataTex, coord - vec2(onePixel.x * edgeSize, onePixel.y * edgeSize)).r;
    float pixSE = texture(dataTex, coord - vec2(-1.0 * onePixel.x * edgeSize, onePixel.y * edgeSize)).r;

    isEdge = (pixN != sampledData || pixS != sampledData || pixW != sampledData || pixE != sampledData || pixNW != sampledData || pixNE != sampledData || pixSW != sampledData || pixSE != sampledData);
  }

  vec4 hoveredColor = float(sampledData == hovered && sampledData > 0. && hovered > 0.) * vec4(0., 0., 1., 1.);
  
  // Colors are laid out corresponding to ids in row-major order in the texture.  So if width of the texture is 10, and you want ID 25,
  // you need coordinate (1, 4) (i.e 2 rows down, and 5 columns over indexed from 0 for a total of 25 units covered in row major order).
  float offsetSampledData = sampledData + featureOffset - 1.0;
  vec2 colorTexCoord = vec2(mod(offsetSampledData, multiFeatureTexSize) / multiFeatureTexSize, floor(offsetSampledData / multiFeatureTexSize) / (texHeight - 1.));
  
  float expressionValue = texture(expressionTex, colorTexCoord).r / 255.;
  float scaledExpressionValue = (expressionValue - rangeStart) / max(0.005, (rangeEnd - rangeStart));
  vec4 sampledColor = (1. - float(isStaticColorMode)) * vec4(COLORMAP_FUNC(clamp(scaledExpressionValue, 0.0, 1.0)).rgb, channelOpacity) + float(isStaticColorMode) * vec4(channelColor.rgb, channelOpacity);
  // Only return a color if the data is non-zero.
  
  vec4 result = clampedSampledData * float(isEdge) * float(isOn) * sampledColor;
  if(!isEdge && isOn && clampedSampledData != 0.) {
    // Flag to indicate there was data, but we are in non-filled mode, in order to determine whether or not to discard for picking/tooltips.
    result.a = 0.001;
  }
  return result;
}

void main() {

  // Get the color and alpha value for each channel.
  vec4 val0 = sampleAndGetColor(channel0, vTexCoord, channelsVisible[0], color0, channelOpacities[0], channelsFilled[0], channelIsStaticColorMode[0], channelStrokeWidths[0], offsets[0], channelColormapRangeStarts[0], channelColormapRangeEnds[0]);
  vec4 val1 = sampleAndGetColor(channel1, vTexCoord, channelsVisible[1], color1, channelOpacities[1], channelsFilled[1], channelIsStaticColorMode[1],  channelStrokeWidths[1], offsets[1], channelColormapRangeStarts[1], channelColormapRangeEnds[1]);
  vec4 val2 = sampleAndGetColor(channel2, vTexCoord, channelsVisible[2], color2, channelOpacities[2], channelsFilled[2], channelIsStaticColorMode[2],  channelStrokeWidths[2], offsets[2], channelColormapRangeStarts[2], channelColormapRangeEnds[2]);
  vec4 val3 = sampleAndGetColor(channel3, vTexCoord, channelsVisible[3], color3, channelOpacities[3], channelsFilled[3], channelIsStaticColorMode[3],  channelStrokeWidths[3], offsets[3], channelColormapRangeStarts[3], channelColormapRangeEnds[3]);
  vec4 val4 = sampleAndGetColor(channel4, vTexCoord, channelsVisible[4], color4, channelOpacities[4], channelsFilled[4], channelIsStaticColorMode[4],  channelStrokeWidths[4], offsets[4], channelColormapRangeStarts[4], channelColormapRangeEnds[4]);
  vec4 val5 = sampleAndGetColor(channel5, vTexCoord, channelsVisible[5], color5, channelOpacities[5], channelsFilled[5], channelIsStaticColorMode[5],  channelStrokeWidths[5], offsets[5], channelColormapRangeStarts[5], channelColormapRangeEnds[5]);
  vec4 val6 = sampleAndGetColor(channel6, vTexCoord, channelsVisible[6], color6, channelOpacities[6], channelsFilled[6], channelIsStaticColorMode[6],  channelStrokeWidths[6], offsets[6], channelColormapRangeStarts[6], channelColormapRangeEnds[6]);

  vec4 emptyPixel = vec4(0.);
  vec4 nonEmptyInnerPixel = vec4(0., 0., 0., 0.001);
  if(val0 == emptyPixel && val0 != nonEmptyInnerPixel && val1 == emptyPixel && val1 != nonEmptyInnerPixel) {
    discard;
  } else {
    if(val0 == nonEmptyInnerPixel) {
      val0.a = 0.;
    }
    if(val1 == nonEmptyInnerPixel) {
      val1.a = 0.;
    }
  }
  // If the next channel color and the currently stored color (gl_FragColor) are identical,
  // or the next channel color is transparent black,
  // just use the currently stored color. Repeat this for all channels.

  // Mix colors where necessary, using the alpha value of the next channel as the weight.
  // Use the maximum alpha value as the resulting alpha value.
  gl_FragColor = val0;
  gl_FragColor = (val1 == gl_FragColor || val1 == vec4(0.)) ? gl_FragColor : vec4(mix(gl_FragColor, val1, val1.a).rgb, max(gl_FragColor.a, val1.a));
  gl_FragColor = (val2 == gl_FragColor || val2 == vec4(0.)) ? gl_FragColor : vec4(mix(gl_FragColor, val2, val2.a).rgb, max(gl_FragColor.a, val2.a));
  gl_FragColor = (val3 == gl_FragColor || val3 == vec4(0.)) ? gl_FragColor : vec4(mix(gl_FragColor, val3, val3.a).rgb, max(gl_FragColor.a, val3.a));
  gl_FragColor = (val4 == gl_FragColor || val4 == vec4(0.)) ? gl_FragColor : vec4(mix(gl_FragColor, val4, val4.a).rgb, max(gl_FragColor.a, val4.a));
  gl_FragColor = (val5 == gl_FragColor || val5 == vec4(0.)) ? gl_FragColor : vec4(mix(gl_FragColor, val5, val5.a).rgb, max(gl_FragColor.a, val5.a));
  gl_FragColor = (val6 == gl_FragColor || val6 == vec4(0.)) ? gl_FragColor : vec4(mix(gl_FragColor, val6, val6.a).rgb, max(gl_FragColor.a, val6.a));

  

  // TODO: multiply the resulting channel-level opacity value by the layer-level opacity value.

  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
