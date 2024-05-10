import { colormaps } from './glsl/index.js';

/**
 * No change to the vertex shader from the base BitmapLayer.
 * Reference: https://github.com/visgl/deck.gl/blob/8.2-release/modules/layers/src/bitmap-layer/bitmap-layer-vertex.js
 */
export const vertexShader = `
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
export const fragmentShader = `
#define SHADER_NAME heatmap-bitmap-layer-fragment-shader

#ifdef GL_ES
precision mediump float;
#endif

${colormaps}

// The texture (GL.LUMINANCE & Uint8Array).
uniform sampler2D uBitmapTexture;

// height x width of the data matrix (i.e x and y are flipped compared to the graphics convention)
uniform vec2 uOrigDataSize;
uniform vec2 uReshapedDataSize;

uniform vec2 tileIJ;
uniform vec2 dataIJ;
uniform vec2 numTiles;

// What are the dimensions of the texture (width, height)?
uniform vec2 uTextureSize;

// How many consecutive pixels should be aggregated together along each axis?
uniform vec2 uAggSize;

// What are the values of the color scale sliders?
uniform vec2 uColorScaleRange;

// The texture coordinate, varying (interpolated between values set by the vertex shader).
varying vec2 vTexCoord;

vec2 offsetvTexcoord(vec2 coord) {
  float xTileToDataRatio = uTextureSize.x / uOrigDataSize.y;
  float yTileToDataRatio = uTextureSize.y / uOrigDataSize.x;
  vec2 vTexCoordOffset = vec2(
    (tileIJ.y * xTileToDataRatio) + (coord.x * xTileToDataRatio),
    (tileIJ.x * yTileToDataRatio) + ((1. - coord.y) * yTileToDataRatio)
  );
  return vTexCoordOffset;
}

vec2 dataCoordinateFromvTexCoordOffset(vec2 vTexCoordOffset) {
  
  // True pixel coordinate on scale of uOrigDataSize
  vec2 viewCoord = vec2(floor(vTexCoordOffset.x * uOrigDataSize.y), floor(vTexCoordOffset.y * uOrigDataSize.x));
  return viewCoord;
}

float getIndexFromViewCoord(vec2 viewCoord) {
  return viewCoord.y * uOrigDataSize.y + viewCoord.x;
}

vec2 transformDataCoordinate(float index) {
  float textureX = (floor( index / uReshapedDataSize.x )) / uReshapedDataSize.x;
  float textureY = (index - (floor( index / uReshapedDataSize.x ) * uReshapedDataSize.x)) / uReshapedDataSize.y;
  vec2 texturedCoord = vec2(textureY, textureX);
  return texturedCoord;
}

void main(void) {
  // Compute 1 pixel in texture coordinates
  vec2 onePixel = vec2(1.0, 1.0) / uTextureSize;
  vec2 vTexCoordOffset = offsetvTexcoord(vTexCoord);
  vec2 viewCoordTransformed = dataCoordinateFromvTexCoordOffset(vTexCoordOffset);
  // Compute (x % aggSizeX, y % aggSizeY).
  // These values will be the number of values to the left / above the current position to consider.
  vec2 modAggSize = vec2(-1.0 * mod(viewCoordTransformed.x, uAggSize.x), -1.0 * mod(viewCoordTransformed.y, uAggSize.y));
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

    offsetPixels = vec2(offsetPixels.x, (modAggSize.y + float(i)));

    for(int j = 0; j < 16; j++) {
      // Check to break inner loop early.
      // Uniforms cannot be used as conditions in GLSL for loops.
      if(float(j) >= uAggSize.x) {
        // Done in the x direction.
        break;
      }
      offsetPixels = vec2((modAggSize.x + float(j)), offsetPixels.y);
      float indexFull = getIndexFromViewCoord(viewCoordTransformed + offsetPixels);
      float index = indexFull - (floor(indexFull / (uReshapedDataSize.x * uReshapedDataSize.y)) * (uReshapedDataSize.x * uReshapedDataSize.y));
      vec2 vTexCoordTransformed = transformDataCoordinate(index);
      intensitySum += texture2D(uBitmapTexture, vTexCoordTransformed).r;
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
