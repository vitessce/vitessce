import glsl from 'glslify';

/**
 * No change to the vertex shader from the base BitmapLayer.
 * Reference: https://github.com/visgl/deck.gl/blob/8.2-release/modules/layers/src/bitmap-layer/bitmap-layer-vertex.js
 */
export const vertexShader = glsl`
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
 * Fragment shader adapted to perform aggregation and
 * take color scale functions + sliders into account.
 * Reference: https://github.com/visgl/deck.gl/blob/8.2-release/modules/layers/src/bitmap-layer/bitmap-layer-fragment.js
 * Reference: https://github.com/hms-dbmi/viv/blob/06231ae02cac1ff57ba458c71e9bc59ed2fc4f8b/src/layers/XRLayer/xr-layer-fragment-colormap.webgl1.glsl
 */
export const fragmentShader = glsl`
#define SHADER_NAME heatmap-bitmap-layer-fragment-shader

#ifdef GL_ES
precision mediump float;
#endif

#pragma glslify: rdbu = require("glsl-colormap/rdbu")
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

// The texture (GL.LUMINANCE & Uint8Array).
uniform sampler2D uBitmapTexture;

// What are the dimensions of the data (width, height)?
uniform vec2 uDataSize;

// What are the dimensions of the textured representation
uniform vec2 uTextureSize;

// How many consecutive pixels should be aggregated together along each axis?
uniform vec2 uAggSize;

// What are the values of the color scale sliders?
uniform vec2 uColorScaleRange;

// Tile #
uniform float x;
uniform float y;

// True tile size
uniform float tileWidth;
uniform float tileHeight;

// The texture coordinate, varying (interpolated between values set by the vertex shader).
varying vec2 vTexCoord;

vec2 transformCoordinate(vec2 coord) {
  // True pixel coordinate on scale of uDataSize
  vec2 viewCoord = vec2(floor(coord.x * uDataSize.x), floor(coord.y * uDataSize.y));
  // Compute single value index into data array
  float index = viewCoord.y * uDataSize.x + viewCoord.x;
  float textureX = (floor( index / uTextureSize.x )) / uTextureSize.x;
  float textureY = (index - (floor( index / uTextureSize.x ) * uTextureSize.x)) / uTextureSize.y;
  vec2 texturedCoord = vec2(textureX, textureY);
  return texturedCoord;
}


void main(void) {

  // Compute offset for each texture call in 0-1 texture coordinates for the given tile
  float xOffset = (x * tileWidth) / uDataSize.x;
  float yOffset = (y * tileHeight) / uDataSize.y;
  // Compute the texCoord in "offset coordinates," only ranging from (x * tileWidth) / uDataSize.x to ((x + 1) * tileWidth) / uDataSize.x
  vec2 vTexCoordOffset = vec2(xOffset + (vTexCoord.x * tileWidth / uDataSize.x), yOffset + (vTexCoord.y * tileHeight / uDataSize.y));

  // Compute 1 pixel in texture coordinates
  vec2 onePixel = vec2(1.0, 1.0) / uDataSize;
  
  // True pixel coordinate on scale of uDataSize
  vec2 viewCoord = vec2(floor(vTexCoord.x * uDataSize.x), floor(vTexCoord.y * uDataSize.y));

  // Compute (x % aggSizeX, y % aggSizeY).
  // These values will be the number of values to the left / above the current position to consider.
  vec2 modAggSize = vec2(-1.0 * mod(viewCoord.x, uAggSize.x), -1.0 * mod(viewCoord.y, uAggSize.y));

  // Take the sum of values along each axis.
  float intensitySum = 0.0;
  vec2 offsetPixels = vec2(0.0, 0.0);

  for(int i = 0; i < 16; i++) {
    // Check to break outer loop early.
    // Uniforms cannot be used as conditions in GLSL for loops.
    if(float(i) >= uAggSize.y) {
      // Done in the y direction.
      break;
    }

    offsetPixels = vec2(offsetPixels.x, (modAggSize.y + float(i)) * onePixel.y);

    for(int j = 0; j < 16; j++) {
      // Check to break inner loop early.
      // Uniforms cannot be used as conditions in GLSL for loops.
      if(float(j) >= uAggSize.x) {
        // Done in the x direction.
        break;
      }

      offsetPixels = vec2((modAggSize.x + float(j)) * onePixel.x, offsetPixels.y);
      // intensitySum += texture2D(uBitmapTexture, vTexCoord + offsetPixels).r;
      // Want the transformed coordinate of the true coordinate
      intensitySum += texture2D(uBitmapTexture, transformCoordinate(vTexCoordOffset + offsetPixels)).r;
    }
  }
  
  // Compute the mean value.
  float intensityMean = intensitySum / (uAggSize.x * uAggSize.y);
  
  // Re-scale using the color scale slider values.
  float scaledIntensityMean = (intensityMean - uColorScaleRange[0]) / max(0.005, (uColorScaleRange[1] - uColorScaleRange[0]));

  gl_FragColor = COLORMAP_FUNC(clamp(scaledIntensityMean, 0.0, 1.0));

  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
