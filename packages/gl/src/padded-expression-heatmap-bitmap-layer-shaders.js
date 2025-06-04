import { colormaps } from './glsl/index.js';

/**
 * No change to the vertex shader from the base BitmapLayer.
 * Reference: https://github.com/visgl/deck.gl/blob/8.2-release/modules/layers/src/bitmap-layer/bitmap-layer-vertex.js
 */
export const vertexShader = `\
#version 300 es
#define SHADER_NAME heatmap-bitmap-layer-vertex-shader

in vec2 texCoords;
in vec3 positions;
in vec3 positions64Low;

out vec2 vTexCoord;

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
export const fragmentShader = `\
#version 300 es
#define SHADER_NAME heatmap-bitmap-layer-fragment-shader

#ifdef GL_ES
precision mediump float;
#endif

${colormaps}

// The texture (GL.LUMINANCE & Uint8Array).
uniform sampler2D uBitmapTexture;

// The texture coordinate, varying (interpolated between values set by the vertex shader).
in vec2 vTexCoord;

out vec4 fragColor;

vec2 offsetvTexcoord(vec2 coord) {
  float xTileToDataRatio = uBlock.uTextureSize.x / uBlock.uOrigDataSize.y;
  float yTileToDataRatio = uBlock.uTextureSize.y / uBlock.uOrigDataSize.x;
  vec2 vTexCoordOffset = vec2(
    (uBlock.tileIJ.y * xTileToDataRatio) + (coord.x * xTileToDataRatio),
    (uBlock.tileIJ.x * yTileToDataRatio) + ((1. - coord.y) * yTileToDataRatio)
  );
  return vTexCoordOffset;
}

vec2 dataCoordinateFromvTexCoordOffset(vec2 vTexCoordOffset) {
  
  // True pixel coordinate on scale of uBlock.uOrigDataSize
  vec2 viewCoord = vec2(floor(vTexCoordOffset.x * uBlock.uOrigDataSize.y), floor(vTexCoordOffset.y * uBlock.uOrigDataSize.x));
  return viewCoord;
}

float getIndexFromViewCoord(vec2 viewCoord) {
  return viewCoord.y * uBlock.uOrigDataSize.y + viewCoord.x;
}

vec2 transformDataCoordinate(float index) {
  float textureX = (floor( index / uBlock.uReshapedDataSize.x )) / uBlock.uReshapedDataSize.x;
  float textureY = (index - (floor( index / uBlock.uReshapedDataSize.x ) * uBlock.uReshapedDataSize.x)) / uBlock.uReshapedDataSize.y;
  vec2 texturedCoord = vec2(textureY, textureX);
  return texturedCoord;
}

void main(void) {
  // Compute 1 pixel in texture coordinates
  vec2 onePixel = vec2(1.0, 1.0) / uBlock.uTextureSize;
  vec2 vTexCoordOffset = offsetvTexcoord(vTexCoord);
  vec2 viewCoordTransformed = dataCoordinateFromvTexCoordOffset(vTexCoordOffset);
  // Compute (x % aggSizeX, y % aggSizeY).
  // These values will be the number of values to the left / above the current position to consider.
  vec2 modAggSize = vec2(-1.0 * mod(viewCoordTransformed.x, uBlock.uAggSize.x), -1.0 * mod(viewCoordTransformed.y, uBlock.uAggSize.y));
  // Take the sum of values along each axis.
  float intensitySum = 0.0;
  vec2 offsetPixels = vec2(0.0, 0.0);
  for(int i = 0; i < 16; i++) {
    // Check to break outer loop early.
    // Uniforms cannot be used as conditions in GLSL for loops.
    if(float(i) >= uBlock.uAggSize.y) {
      // Done in the y direction.
      break;
    }

    offsetPixels = vec2(offsetPixels.x, (modAggSize.y + float(i)));

    for(int j = 0; j < 16; j++) {
      // Check to break inner loop early.
      // Uniforms cannot be used as conditions in GLSL for loops.
      if(float(j) >= uBlock.uAggSize.x) {
        // Done in the x direction.
        break;
      }
      offsetPixels = vec2((modAggSize.x + float(j)), offsetPixels.y);
      float indexFull = getIndexFromViewCoord(viewCoordTransformed + offsetPixels);
      float index = indexFull - (floor(indexFull / (uBlock.uReshapedDataSize.x * uBlock.uReshapedDataSize.y)) * (uBlock.uReshapedDataSize.x * uBlock.uReshapedDataSize.y));
      vec2 vTexCoordTransformed = transformDataCoordinate(index);
      intensitySum += texture(uBitmapTexture, vTexCoordTransformed).r;
    }
  }
  
  // Compute the mean value.
  float intensityMean = intensitySum / (uBlock.uAggSize.x * uBlock.uAggSize.y);
  // Re-scale using the color scale slider values.
  float scaledIntensityMean = (intensityMean - uBlock.uColorScaleRange[0]) / max(0.005, (uBlock.uColorScaleRange[1] - uBlock.uColorScaleRange[0]));

  fragColor = COLORMAP_FUNC(clamp(scaledIntensityMean, 0.0, 1.0));

  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
