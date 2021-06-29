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
  vec4 hoveredColor = float(sampledData == hovered && sampledData > 0. && hovered > 0.) * vec4(0., 0., 1., 1.);
  // Colors are laid out corresponding to ids in row-major order in the texture.  So if width of the texture is 10, and you want ID 25,
  // you need coordinate (2, 4) (i.e 2 rows down, and 5 columns over indexed from 0 for a total of 25 units covered in row major order).
  vec2 colorTexCoord = vec2(mod(sampledData, colorTexWidth) / colorTexWidth, floor(sampledData / colorTexWidth) / (colorTexHeight - 1.));
  vec4 sampledColor = vec4(texture(colorTex, colorTexCoord).rgb, 1.);
  // Only return a color if the data is non-zero.
  return max(0., min(sampledData, 1.)) * float(isOn) * (sampledColor + hoveredColor);
}

void main() {

  gl_FragColor = sampleAndGetColor(channel0, vTexCoord, channelIsOn[0]);

  // If the sampled color and the currently stored color (gl_FragColor) are identical, don't blend and use the sampled color,
  // otherwise just use the currently stored color.
  vec4 sampledColor = sampleAndGetColor(channel1, vTexCoord, channelIsOn[1]);
  gl_FragColor = (sampledColor == gl_FragColor || sampledColor == vec4(0.)) ? gl_FragColor : sampledColor;
  sampledColor = sampleAndGetColor(channel2, vTexCoord, channelIsOn[2]);
  gl_FragColor = (sampledColor == gl_FragColor || sampledColor == vec4(0.)) ? gl_FragColor : sampledColor;
  sampledColor = sampleAndGetColor(channel3, vTexCoord, channelIsOn[3]);
  gl_FragColor = (sampledColor == gl_FragColor || sampledColor == vec4(0.)) ? gl_FragColor : sampledColor;
  sampledColor = sampleAndGetColor(channel4, vTexCoord, channelIsOn[4]);
  gl_FragColor = (sampledColor == gl_FragColor || sampledColor == vec4(0.)) ? gl_FragColor : sampledColor;
  sampledColor = sampleAndGetColor(channel5, vTexCoord, channelIsOn[5]);
  gl_FragColor = (sampledColor == gl_FragColor || sampledColor == vec4(0.)) ? gl_FragColor : sampledColor;
  // Apply the opacity if there is pixel data, and if the pixel data is empty i.e no segmentation, use 0 opacity.
  gl_FragColor = vec4(gl_FragColor.rgb, (gl_FragColor.rgb == vec3(0., 0., 0.)) ? 0.0 : opacity);

  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
