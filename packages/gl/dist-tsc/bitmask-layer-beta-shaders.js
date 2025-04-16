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
uniform float hovered;

// Channel-specific properties
uniform bool channelsVisible[7];
uniform float channelOpacities[7];
uniform bool channelIsStaticColorMode[7]; // TODO: should this be a single float?
uniform bool channelIsSetColorMode[7]; // TODO: should this be a single float?

// TODO: can array of tuples/vec2 be used?
uniform float channelColormapRangeStarts[7];
uniform float channelColormapRangeEnds[7];

uniform float multiFeatureTexSize;

// Use one expressionTex for all channels, using an offset mechanism.
uniform sampler2D valueTex;
uniform float valueTexOffsets[7];
uniform float valueTexHeight;

// Textures for set colors, using the same offset mechanism.
uniform sampler2D colorTex;
uniform float colorTexOffsets[7];
uniform float colorTexHeight;


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

vec3 sampleAndGetData(sampler2D dataTex, vec2 coord, bool isFilled, float strokeWidth, bool isOn) {
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
  // Return a tuple of (sampledData, isEdge)
  return vec3(clampedSampledData * float(isOn), sampledData, float(isEdge));
}

vec4 dataToColor(vec3 sampledDataAndIsEdge, bool isStaticColorMode, vec3 channelColor, float channelOpacity, float valueOffset, float rangeStart, float rangeEnd, bool isSetColorMode, float setColorOffset) {
  float clampedSampledDataAndIsOn = sampledDataAndIsEdge.x;
  float sampledData = sampledDataAndIsEdge.y;
  float isEdge = sampledDataAndIsEdge.z;
  

  vec4 hoveredColor = float(sampledData == hovered && sampledData > 0. && hovered > 0.) * vec4(0., 0., 1., 1.);
  
  // Colors are laid out corresponding to ids in row-major order in the texture.  So if width of the texture is 10, and you want ID 25,
  // you need coordinate (1, 4) (i.e 2 rows down, and 5 columns over indexed from 0 for a total of 25 units covered in row major order).
  float offsetSampledData = sampledData + valueOffset - 1.0;
  vec2 colorTexCoord = vec2(mod(offsetSampledData, multiFeatureTexSize) / multiFeatureTexSize, floor(offsetSampledData / multiFeatureTexSize) / (valueTexHeight - 1.));

  // Get expression value
  float expressionValue = texture(valueTex, colorTexCoord).r / 255.;
  float scaledExpressionValue = (expressionValue - rangeStart) / max(0.005, (rangeEnd - rangeStart));


  // Get set color index value
  vec2 setIndicesTexCoord = vec2(mod(offsetSampledData, multiFeatureTexSize) / multiFeatureTexSize, floor(offsetSampledData / multiFeatureTexSize) / (valueTexHeight - 1.));
  float setColorIndex = texture(valueTex, setIndicesTexCoord).r;

  // Initialize to the default "null" color.
  vec3 setColor = vec3(200. / 255., 200. / 255., 200. / 255.);
  if(setColorIndex != 0.) {
    // Subtract one from setColorIndex because we have already checked for the "null" value.
    setColorIndex = setColorIndex - 1.;

    float setColorOffsetR = (setColorIndex + setColorOffset) * 3.0 + 0.0;
    vec2 setColorTexCoordR = vec2(mod(setColorOffsetR, multiFeatureTexSize) / multiFeatureTexSize, floor(setColorOffsetR / multiFeatureTexSize) / (colorTexHeight - 1.));
    float setColorR = texture(colorTex, setColorTexCoordR).r / 255.;

    float setColorOffsetG = (setColorIndex + setColorOffset) * 3.0 + 1.0;
    vec2 setColorTexCoordG = vec2(mod(setColorOffsetG, multiFeatureTexSize) / multiFeatureTexSize, floor(setColorOffsetG / multiFeatureTexSize) / (colorTexHeight - 1.));
    float setColorG = texture(colorTex, setColorTexCoordG).r / 255.;

    float setColorOffsetB = (setColorIndex + setColorOffset) * 3.0 + 2.0;
    vec2 setColorTexCoordB = vec2(mod(setColorOffsetB, multiFeatureTexSize) / multiFeatureTexSize, floor(setColorOffsetB / multiFeatureTexSize) / (colorTexHeight - 1.));
    float setColorB = texture(colorTex, setColorTexCoordB).r / 255.;

    setColor = vec3(setColorR, setColorG, setColorB);
  }

  
  vec4 sampledColor = (1. - (float(isStaticColorMode) + float(isSetColorMode))) * vec4(COLORMAP_FUNC(clamp(scaledExpressionValue, 0.0, 1.0)).rgb, channelOpacity) + float(isStaticColorMode) * vec4(channelColor.rgb, channelOpacity) + float(isSetColorMode) * vec4(setColor, channelOpacity);
  // Only return a color if the data is non-zero.
  
  return clampedSampledDataAndIsOn * isEdge * sampledColor;
}

void main() {

  // Get the color and alpha value for each channel.
  vec3 dat0 = sampleAndGetData(channel0, vTexCoord, channelsFilled[0], channelStrokeWidths[0], channelsVisible[0]);
  vec3 dat1 = sampleAndGetData(channel1, vTexCoord, channelsFilled[1], channelStrokeWidths[1], channelsVisible[1]);
  vec3 dat2 = sampleAndGetData(channel2, vTexCoord, channelsFilled[2], channelStrokeWidths[2], channelsVisible[2]);
  vec3 dat3 = sampleAndGetData(channel3, vTexCoord, channelsFilled[3], channelStrokeWidths[3], channelsVisible[3]);
  vec3 dat4 = sampleAndGetData(channel4, vTexCoord, channelsFilled[4], channelStrokeWidths[4], channelsVisible[4]);
  vec3 dat5 = sampleAndGetData(channel5, vTexCoord, channelsFilled[5], channelStrokeWidths[5], channelsVisible[5]);
  vec3 dat6 = sampleAndGetData(channel6, vTexCoord, channelsFilled[6], channelStrokeWidths[6], channelsVisible[6]);
  
  vec4 val0 = dataToColor(dat0, channelIsStaticColorMode[0], color0, channelOpacities[0], valueTexOffsets[0], channelColormapRangeStarts[0], channelColormapRangeEnds[0], channelIsSetColorMode[0], colorTexOffsets[0]);
  vec4 val1 = dataToColor(dat1, channelIsStaticColorMode[1], color1, channelOpacities[1], valueTexOffsets[1], channelColormapRangeStarts[1], channelColormapRangeEnds[1], channelIsSetColorMode[1], colorTexOffsets[1]);
  vec4 val2 = dataToColor(dat2, channelIsStaticColorMode[2], color2, channelOpacities[2], valueTexOffsets[2], channelColormapRangeStarts[2], channelColormapRangeEnds[2], channelIsSetColorMode[2], colorTexOffsets[2]);
  vec4 val3 = dataToColor(dat3, channelIsStaticColorMode[3], color3, channelOpacities[3], valueTexOffsets[3], channelColormapRangeStarts[3], channelColormapRangeEnds[3], channelIsSetColorMode[3], colorTexOffsets[3]);
  vec4 val4 = dataToColor(dat4, channelIsStaticColorMode[4], color4, channelOpacities[4], valueTexOffsets[4], channelColormapRangeStarts[4], channelColormapRangeEnds[4], channelIsSetColorMode[4], colorTexOffsets[4]);
  vec4 val5 = dataToColor(dat5, channelIsStaticColorMode[5], color5, channelOpacities[5], valueTexOffsets[5], channelColormapRangeStarts[5], channelColormapRangeEnds[5], channelIsSetColorMode[5], colorTexOffsets[5]);
  vec4 val6 = dataToColor(dat6, channelIsStaticColorMode[6], color6, channelOpacities[6], valueTexOffsets[6], channelColormapRangeStarts[6], channelColormapRangeEnds[6], channelIsSetColorMode[6], colorTexOffsets[6]);
  
  // If all of the channels are "empty", then discard this pixel so that it is not considered during picking.
  float emptyDat = 0.;
  if(dat0.x == emptyDat && dat1.x == emptyDat && dat2.x == emptyDat && dat3.x == emptyDat && dat4.x == emptyDat && dat5.x == emptyDat && dat6.x == emptyDat) {
    discard;
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
