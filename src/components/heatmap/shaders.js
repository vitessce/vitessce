/* eslint-disable */
import glsl from 'glslify';



/**
 * No change to the vertex shader.
 * Reference: https://github.com/visgl/deck.gl/blob/8.2-release/modules/layers/src/bitmap-layer/bitmap-layer-vertex.js
 */
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

/**
 * Fragment shader adapted to perform aggregation and take color scale functions + sliders into account.
 * Reference: https://github.com/visgl/deck.gl/blob/8.2-release/modules/layers/src/bitmap-layer/bitmap-layer-fragment.js
 * Reference: https://github.com/hubmapconsortium/vitessce-image-viewer/blob/06231ae02cac1ff57ba458c71e9bc59ed2fc4f8b/src/layers/XRLayer/xr-layer-fragment-colormap.webgl1.glsl
 */
export const fs = glsl`
#define SHADER_NAME heatmap-bitmap-layer-fragment-shader

#ifdef GL_ES
precision mediump float;
#endif

#pragma glslify: jet = require("glsl-colormap/jet")
#pragma glslify: plasma = require("glsl-colormap/plasma")

// The texture.
uniform sampler2D uBitmapTexture;

// What are the dimensions of the texture (width, height)?
uniform vec2 uTextureSize;

// How many consecutive pixels should be aggregated together, along each axis?
uniform vec2 uAggSize;

varying vec2 vTexCoord;

void main(void) {
  // compute 1 pixel in texture coordinates
  // 1 / size of texture
  vec2 onePixel = vec2(1.0, 1.0) / uTextureSize;
  
  vec2 viewCoord = vec2(floor(vTexCoord.x * uTextureSize.x), floor(vTexCoord.y * uTextureSize.y));

  vec2 modAggSize = vec2(mod(viewCoord.x, uAggSize.x), mod(viewCoord.y, uAggSize.y));
  
//   if(modAggSize.x == 1.0) {
//     vec4 bitmapColor = texture2D(uBitmapTexture, vTexCoord);
//     float intensity = bitmapColor.r / 255.0;

//     gl_FragColor = plasma(clamp(intensity, 0.0, 1.0));
//   } else {
//     gl_FragColor = vec4(255.0, 255.0, 255.0, 255.0);
//   }

    vec4 bitmapColor = texture2D(uBitmapTexture, vTexCoord);
    float intensityVal = float(bitmapColor.r) / 255.0;

    gl_FragColor = __colormap(bitmapColor.r);
    //gl_FragColor = vec4(bitmapColor.r, 0.0, 0.0, 255.0);

  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;