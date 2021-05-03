export const vs = `
#define SHADER_NAME xr-layer-vertex-shader

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
#define SHADER_NAME xr-layer-fragment-shader
precision highp float;

// Data (mask) texture
uniform sampler2D channel0;
uniform sampler2D channel1;
uniform sampler2D channel2;
uniform sampler2D channel3;
uniform sampler2D channel4;
uniform sampler2D channel5;

// Color texture
uniform sampler2D colorTex;
uniform float colorTexHeight;
uniform float colorTexWidth;
uniform float hovered;
// range
uniform bool channelIsOn[6];

// opacity
uniform float opacity;

varying vec2 vTexCoord;

vec4 sampleAndGetColor(sampler2D dataTex, vec2 coord, bool isOn){
  float sampledData = texture(dataTex, coord).r;
  vec4 hoveredColor = float(sampledData == hovered && sampledData > 0.) * vec4(0., 1., 0., 1.);
  vec4 sampledColor = vec4(texture(colorTex, vec2(mod(sampledData, colorTexWidth) / colorTexWidth, ceil(sampledData / colorTexHeight) / colorTexHeight)).rgb, 1.);
  return float(isOn) * sampledColor;
}

void main() {

  gl_FragColor += sampleAndGetColor(channel0, vTexCoord, channelIsOn[0]);
  gl_FragColor += sampleAndGetColor(channel1, vTexCoord, channelIsOn[1]);
  gl_FragColor += sampleAndGetColor(channel2, vTexCoord, channelIsOn[2]);
  gl_FragColor += sampleAndGetColor(channel3, vTexCoord, channelIsOn[3]);
  gl_FragColor += sampleAndGetColor(channel4, vTexCoord, channelIsOn[4]);
  gl_FragColor += sampleAndGetColor(channel5, vTexCoord, channelIsOn[5]);
  gl_FragColor = vec4(gl_FragColor.rgb, opacity);
  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
