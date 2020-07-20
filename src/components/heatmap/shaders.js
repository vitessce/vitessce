/* eslint-disable */
import glsl from 'glslify';

export const vs = glsl`
#define SHADER_NAME heatmap-bitmap-layer-vertex-shader

attribute vec2 texCoords;
attribute vec3 positions;
attribute vec3 positions64Low;

varying vec2 vTexCoord;

const vec3 pickingColor = vec3(1.0, 0.0, 0.0);

void main(void) {
  geometry.worldPosition = positions;
  geometry.uv = texCoords;
  geometry.pickingColor = pickingColor;

  gl_Position = project_position_to_clipspace(positions, positions64Low, vec3(0.0), geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vTexCoord = texCoords;

  vec4 color = vec4(0.0);
  DECKGL_FILTER_COLOR(color, geometry);
}
`;

export const fs = glsl`
#define SHADER_NAME heatmap-bitmap-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uBitmapTexture;
uniform vec2 uTextureSize;

varying vec2 vTexCoord;

void main(void) {
  // compute 1 pixel in texture coordinates
  // 1 / size of texture
  // vec2 onePixel = vec2(1.0, 1.0) / vec2(2048.0, 2048.0);
  
  vec2 viewCoord = vec2(floor(vTexCoord.x * 2048.0), floor(vTexCoord.y * 2048.0));

  if(mod(viewCoord.x, 2.0) == 1.0) {
    vec4 bitmapColor = texture2D(uBitmapTexture, vTexCoord);
    gl_FragColor = vec4(bitmapColor.r, 0.0, 0.0, 255);
  } else {
    gl_FragColor = vec4(255.0, 255.0, 255.0, 255.0);
  }

  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;