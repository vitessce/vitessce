// Utilities for constructing shaders that
// handle the coloring of Neuroglancer point annotation layers.
// References:
// - https://github.com/vitessce/vitessce/issues/2359#issuecomment-3572906947
// - https://chanzuckerberg.github.io/cryoet-data-portal/stable/neuroglancer_quickstart.html
import { PALETTE, getDefaultColor } from '@vitessce/utils';


/**
 * Normalize an RGB color array from [0, 255] to [0, 1].
 * @param {[number, number, number]} rgbColor
 * @returns {[number, number, number]}
 */
function normalizeColor(rgbColor) {
  return rgbColor.map(c => c / 255);
}

/**
 * GLSL call to set point marker border width.
 * Set to 0.0 to remove the outline.
 * @param {number} borderWidth
 * @returns {string}
 */
function borderWidthGlsl(borderWidth = 0.0) {
  return `setPointMarkerBorderWidth(${borderWidth});`;
}


/**
 * Format a normalized color as a GLSL vec3 literal.
 * @param {[number, number, number]} normalizedColor
 * @returns {string}
 */
function toVec3(normalizedColor) {
  return `vec3(${normalizedColor.join(', ')})`;
}

/**
 * Format a normalized color as a GLSL vec4 literal.
 * @param {[number, number, number]} normalizedColor
 * @param {number} alpha
 * @returns {string}
 */
function toVec4(normalizedColor, alpha) {
  return `vec4(${normalizedColor.join(', ')}, ${alpha})`;
}

// ============================================================
// Case 1: spatialLayerColor
// ============================================================

/**
 * Generate a shader for spatialLayerColor encoding with no feature selection.
 * All points get the static color.
 * @param {[number, number, number]} staticColor RGB (0-255).
 * @param {number} opacity Opacity (0-1).
 * @returns {string} A GLSL shader string.
 */
export function getSpatialLayerColorShader(staticColor, opacity, borderWidth = 0.0) {
  const norm = normalizeColor(staticColor);
  // lang: glsl
  return `
        void main() {
            ${borderWidthGlsl(borderWidth)}
            setColor(${toVec4(norm, opacity)});
        }
    `;
}


/**
 * Generate a shader for spatialLayerColor encoding with feature selection.
 * Selected features get the static color; unselected get the default color.
 * @param {[number, number, number]} staticColor RGB (0-255).
 * @param {number} opacity Opacity (0-1).
 * @param {number[]} featureIndices Numeric indices of selected features.
 * @param {[number, number, number]} defaultColor RGB (0-255) for unselected points.
 * @param {string} featureIndexProp The property name for the feature index in the shader.
 * @returns {string} A GLSL shader string.
 */
export function getSpatialLayerColorWithSelectionShader(
  staticColor, opacity, featureIndices, defaultColor, featureIndexProp, borderWidth = 0.0,
) {
  const normStatic = normalizeColor(staticColor);
  const normDefault = normalizeColor(defaultColor);
  const numFeatures = featureIndices.length;
  const indicesArr = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;

  // lang: glsl
  return `
        void main() {
            int geneIndex = prop_${featureIndexProp}();
            ${indicesArr}
            bool isSelected = false;
            for (int i = 0; i < ${numFeatures}; ++i) {
                if (geneIndex == selectedIndices[i]) {
                    isSelected = true;
                }
            }
            if (isSelected) {
                ${borderWidthGlsl(borderWidth)}
                setColor(${toVec4(normStatic, opacity)});
            } else {
                ${borderWidthGlsl(borderWidth)}
                setColor(${toVec4(normDefault, opacity)});
            }
        }
    `;
}


/**
 * Generate a shader for spatialLayerColor encoding with feature selection
 * and featureFilterMode='featureSelection' (hide unselected points).
 * @param {[number, number, number]} staticColor RGB (0-255).
 * @param {number} opacity Opacity (0-1).
 * @param {number[]} featureIndices Numeric indices of selected features.
 * @param {string} featureIndexProp The property name for the feature index in the shader.
 * @returns {string} A GLSL shader string.
 */
export function getSpatialLayerColorFilteredShader(
  staticColor, opacity, featureIndices, featureIndexProp, borderWidth = 0.0,
) {
  const normStatic = normalizeColor(staticColor);
  const numFeatures = featureIndices.length;
  const indicesArr = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;

  // lang: glsl
  return `
        void main() {
            int geneIndex = prop_${featureIndexProp}();
            ${indicesArr}
            bool isSelected = false;
            for (int i = 0; i < ${numFeatures}; ++i) {
                if (geneIndex == selectedIndices[i]) {
                    isSelected = true;
                }
            }
            if (!isSelected) {
                discard;
            }
            ${borderWidthGlsl(borderWidth)}
            setColor(${toVec4(normStatic, opacity)});
        }
    `;
}

// ============================================================
// Case 2: geneSelection
// ============================================================

/**
 * Generate a shader for geneSelection encoding with no feature selection.
 * All points get the static color (since no features are selected to
 * determine per-feature colors).
 * @param {[number, number, number]} staticColor RGB (0-255).
 * @param {number} opacity Opacity (0-1).
 * @returns {string} A GLSL shader string.
 */
export function getGeneSelectionNoSelectionShader(staticColor, opacity, borderWidth = 0.0,) {
  const norm = normalizeColor(staticColor);
  // lang: glsl
  return `
        void main() {
            ${borderWidthGlsl(borderWidth)}
            setColor(${toVec4(norm, opacity)});
        }
    `;
}

/**
 * Generate a shader for geneSelection encoding with feature selection.
 * Each selected feature gets its color from featureColor; unselected
 * points get the default color.
 * @param {number[]} featureIndices Numeric indices of selected features.
 * @param {[number, number, number][]} featureColors RGB (0-255) for each
 *   selected feature, in the same order as featureIndices.
 * @param {[number, number, number]} staticColor Fallback RGB (0-255)
 *   for selected features without a specified color.
 * @param {[number, number, number]} defaultColor RGB (0-255) for
 *   unselected points.
 * @param {number} opacity Opacity (0-1).
 * @param {string} featureIndexProp The property name for the feature index in the shader.
 * @returns {string} A GLSL shader string.
 */
export function getGeneSelectionWithSelectionShader(
  featureIndices, featureColors, staticColor, defaultColor, opacity, featureIndexProp, borderWidth=0.0,
) {
  const numFeatures = featureIndices.length;
  const normDefault = normalizeColor(defaultColor);
  const normColors = featureColors.map(c => normalizeColor(c));
  const normStatic = normalizeColor(staticColor);

  const colorArr = normColors.map(
    c => (c ? toVec3(c) : toVec3(normStatic)),
  );

  const indicesDecl = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;
  const colorsDecl = `vec3 featureColors[${numFeatures}] = vec3[${numFeatures}](${colorArr.join(', ')});`;
  // lang: glsl
  return `
        void main() {
            int geneIndex = prop_${featureIndexProp}();
            ${indicesDecl}
            ${colorsDecl}
            vec4 color = ${toVec4(normDefault, opacity)};
            for (int i = 0; i < ${numFeatures}; ++i) {
                if (geneIndex == selectedIndices[i]) {
                    color = vec4(featureColors[i], ${opacity});
                }
            }
            ${borderWidthGlsl(borderWidth)}
            setColor(color);
        }
    `;
}

/**
 * Generate a shader for geneSelection encoding with feature selection
 * and featureFilterMode='featureSelection' (hide unselected points).
 * @param {number[]} featureIndices Numeric indices of selected features.
 * @param {[number, number, number][]} featureColors RGB (0-255) for each
 *   selected feature.
 * @param {[number, number, number]} staticColor Fallback RGB (0-255).
 * @param {number} opacity Opacity (0-1).
 * @param {string} featureIndexProp The property name for the feature index in the shader.
 * @returns {string} A GLSL shader string.
 */
export function getGeneSelectionFilteredShader(
  featureIndices, featureColors, staticColor, opacity, featureIndexProp, borderWidth = 0.0,
) {
  const numFeatures = featureIndices.length;
  const normColors = featureColors.map(c => normalizeColor(c));
  const normStatic = normalizeColor(staticColor);

  const colorArr = normColors.map(
    c => (c ? toVec3(c) : toVec3(normStatic)),
  );

  const indicesDecl = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;
  const colorsDecl = `vec3 featureColors[${numFeatures}] = vec3[${numFeatures}](${colorArr.join(', ')});`;

  // lang: glsl
  return `
        void main() {
            int geneIndex = prop_${featureIndexProp}();
            ${indicesDecl}
            ${colorsDecl}
            bool isSelected = false;
            vec3 matchedColor = vec3(0.0);
            for (int i = 0; i < ${numFeatures}; ++i) {
                if (geneIndex == selectedIndices[i]) {
                    isSelected = true;
                    matchedColor = featureColors[i];
                }
            }
            if (!isSelected) {
                discard;
            }
            ${borderWidthGlsl(borderWidth)}
            setColor(vec4(matchedColor, ${opacity}));
        }
    `;
}

// ============================================================
// Case 3: randomByFeature
// ============================================================

/**
 * Generate a shader for randomByFeature encoding with no feature selection.
 * Each feature gets a deterministic color from PALETTE based on its index.
 * @param {number} opacity Opacity (0-1).
 * @param {string} featureIndexProp The property name for the feature index in the shader.
 * @returns {string} A GLSL shader string.
 */
export function getRandomByFeatureShader(opacity, featureIndexProp, borderWidth = 0.0) {
  const paletteSize = PALETTE.length;
  const normPalette = PALETTE.map(c => normalizeColor(c));
  const paletteDecl = `vec3 palette[${paletteSize}] = vec3[${paletteSize}](${normPalette.map(c => toVec3(c)).join(', ')});`;

  // lang: glsl
  return `
        void main() {
            int geneIndex = prop_${featureIndexProp}();
            ${paletteDecl}
            int colorIdx = geneIndex - (geneIndex / ${paletteSize}) * ${paletteSize};
            if (colorIdx < 0) { colorIdx = -colorIdx; }
            vec3 color = palette[colorIdx];
            ${borderWidthGlsl(borderWidth)}
            setColor(vec4(color, ${opacity}));
        }
    `;
}

/**
 * Generate a shader for randomByFeature encoding with feature selection.
 * Selected features get their deterministic palette color; unselected
 * points get the default color.
 * @param {number[]} featureIndices Numeric indices of selected features.
 * @param {[number, number, number]} defaultColor RGB (0-255) for unselected.
 * @param {number} opacity Opacity (0-1).
 * @param {string} featureIndexProp The property name for the feature index in the shader.
 * @returns {string} A GLSL shader string.
 */
export function getRandomByFeatureWithSelectionShader(
  featureIndices, defaultColor, opacity, featureIndexProp, borderWidth = 0.0,
) {
  const paletteSize = PALETTE.length;
  const normPalette = PALETTE.map(c => normalizeColor(c));
  const normDefault = normalizeColor(defaultColor);
  const numFeatures = featureIndices.length;

  const paletteDecl = `vec3 palette[${paletteSize}] = vec3[${paletteSize}](${normPalette.map(c => toVec3(c)).join(', ')});`;
  const indicesDecl = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;

  // lang: glsl
  return `
        void main() {
            int geneIndex = prop_${featureIndexProp}();
            ${paletteDecl}
            ${indicesDecl}
            bool isSelected = false;
            for (int i = 0; i < ${numFeatures}; ++i) {
                if (geneIndex == selectedIndices[i]) {
                    isSelected = true;
                }
            }
            if (isSelected) {
                int colorIdx = geneIndex - (geneIndex / ${paletteSize}) * ${paletteSize};
                if (colorIdx < 0) { colorIdx = -colorIdx; }
                ${borderWidthGlsl(borderWidth)}
                setColor(vec4(palette[colorIdx], ${opacity}));
            } else {
                ${borderWidthGlsl(borderWidth)}
                setColor(${toVec4(normDefault, opacity)});
            }
        }
    `;
}

/**
 * Generate a shader for randomByFeature encoding with feature selection
 * and featureFilterMode='featureSelection' (hide unselected points).
 * @param {number[]} featureIndices Numeric indices of selected features.
 * @param {number} opacity Opacity (0-1).
 * @param {string} featureIndexProp The property name for the feature index in the shader.
 * @returns {string} A GLSL shader string.
 */
export function getRandomByFeatureFilteredShader(featureIndices, opacity, featureIndexProp, borderWidth = 0.0,) {
  const paletteSize = PALETTE.length;
  const normPalette = PALETTE.map(c => normalizeColor(c));
  const numFeatures = featureIndices.length;

  const paletteDecl = `vec3 palette[${paletteSize}] = vec3[${paletteSize}](${normPalette.map(c => toVec3(c)).join(', ')});`;
  const indicesDecl = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;

  // lang: glsl
  return `
        void main() {
            int geneIndex = prop_${featureIndexProp}();
            ${paletteDecl}
            ${indicesDecl}
            bool isSelected = false;
            for (int i = 0; i < ${numFeatures}; ++i) {
                if (geneIndex == selectedIndices[i]) {
                    isSelected = true;
                }
            }
            if (!isSelected) {
                discard;
            }
            int colorIdx = geneIndex - (geneIndex / ${paletteSize}) * ${paletteSize};
            if (colorIdx < 0) { colorIdx = -colorIdx; }
            ${borderWidthGlsl(borderWidth)}
            setColor(vec4(palette[colorIdx], ${opacity}));
        }
    `;
}

// ============================================================
// Case 4: random (per point)
// ============================================================

/**
 * GLSL helper function that produces a pseudo-random float in [0, 1]
 * from an integer value and a seed. Shared across random-per-point shaders.
 * @returns {string} GLSL function source.
 */
function hashToFloatGlsl() {
  return `
        float hashToFloat(int v, int seed) {
            int h = v ^ (seed * 16777619);
            h = h * 747796405 + 2891336453;
            h = ((h >> 16) ^ h) * 2654435769;
            h = ((h >> 16) ^ h);
            return float(h & 0x7FFFFFFF) / float(0x7FFFFFFF);
        }
    `;
}

/**
 * Generate a shader for random-per-point encoding with no feature selection.
 * Each point gets a pseudo-random color based on its index.
 * @param {number} opacity Opacity (0-1).
 * @param {string} featureIndexProp The property name for the feature index in the shader.
 * @param {string} pointIndexProp The property name for the point index in the shader.
 * @returns {string} A GLSL shader string.
 */
export function getRandomPerPointShader(opacity, featureIndexProp, pointIndexProp, borderWidth = 0.0) {
  // lang: glsl
  return `
        ${hashToFloatGlsl()}
        void main() {
            int geneIndex = prop_${featureIndexProp}();
            int pointIndex = prop_${pointIndexProp}();
            float r = hashToFloat(pointIndex, 0);
            float g = hashToFloat(pointIndex, 1);
            float b = hashToFloat(pointIndex, 2);
            ${borderWidthGlsl(borderWidth)}
            setColor(vec4(r, g, b, ${opacity}));
        }
    `;
}

/**
 * Generate a shader for random-per-point encoding with feature selection.
 * Selected points get a pseudo-random color; unselected get the default color.
 * @param {number[]} featureIndices Numeric indices of selected features.
 * @param {[number, number, number]} defaultColor RGB (0-255) for unselected.
 * @param {number} opacity Opacity (0-1).
 * @param {string} featureIndexProp The property name for the feature index in the shader.
 * @param {string} pointIndexProp The property name for the point index in the shader.
 * @returns {string} A GLSL shader string.
 */
export function getRandomPerPointWithSelectionShader(
  featureIndices, defaultColor, opacity, featureIndexProp, pointIndexProp, borderWidth = 0.0,
) {
  const normDefault = normalizeColor(defaultColor);
  const numFeatures = featureIndices.length;
  const indicesDecl = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;

  // lang: glsl
  return `
        ${hashToFloatGlsl()}
        void main() {
            int geneIndex = prop_${featureIndexProp}();
            int pointIndex = prop_${pointIndexProp}();
            ${indicesDecl}
            bool isSelected = false;
            for (int i = 0; i < ${numFeatures}; ++i) {
                if (geneIndex == selectedIndices[i]) {
                    isSelected = true;
                }
            }
            if (isSelected) {
                float r = hashToFloat(pointIndex, 0);
                float g = hashToFloat(pointIndex, 1);
                float b = hashToFloat(pointIndex, 2);
                ${borderWidthGlsl(borderWidth)}
                setColor(vec4(r, g, b, ${opacity}));
            } else {
                ${borderWidthGlsl(borderWidth)}
                setColor(${toVec4(normDefault, opacity)});
            }
        }
    `;
}

/**
 * Generate a shader for random-per-point encoding with feature selection
 * and featureFilterMode='featureSelection' (hide unselected points).
 * @param {number[]} featureIndices Numeric indices of selected features.
 * @param {number} opacity Opacity (0-1).
 * @param {string} featureIndexProp The property name for the feature index in the shader.
 * @param {string} pointIndexProp The property name for the point index in the shader.
 * @returns {string} A GLSL shader string.
 */
export function getRandomPerPointFilteredShader(
  featureIndices, opacity, featureIndexProp, pointIndexProp, borderWidth = 0.0,
) {
  const numFeatures = featureIndices.length;
  const indicesDecl = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;

  // lang: glsl
  return `
        ${hashToFloatGlsl()}
        void main() {
            int geneIndex = prop_${featureIndexProp}();
            int pointIndex = prop_${pointIndexProp}();
            ${indicesDecl}
            bool isSelected = false;
            for (int i = 0; i < ${numFeatures}; ++i) {
                if (geneIndex == selectedIndices[i]) {
                    isSelected = true;
                }
            }
            if (!isSelected) {
                discard;
            }
            float r = hashToFloat(pointIndex, 0);
            float g = hashToFloat(pointIndex, 1);
            float b = hashToFloat(pointIndex, 2);
            ${borderWidthGlsl(borderWidth)}
            setColor(vec4(r, g, b, ${opacity}));
        }
    `;
}


export function getPointsShader(layerCoordination) {
  const {
    theme,
    featureIndex,
    spatialLayerOpacity,
    obsColorEncoding,
    spatialLayerColor,
    featureSelection,
    featureFilterMode,
    featureColor,
    pointMarkerBorderWidth = 0.0,
    featureIndexProp,
    pointIndexProp,
  } = layerCoordination;

  console.log('getPointsShader', obsColorEncoding, spatialLayerColor, spatialLayerOpacity);

  const defaultColor = getDefaultColor(theme);
  const opacity = spatialLayerOpacity ?? 1.0;
  const staticColor = (
    Array.isArray(spatialLayerColor) && spatialLayerColor.length === 3
      ? spatialLayerColor
      : defaultColor
  );

  const hasFeatureSelection = (
    Array.isArray(featureSelection) && featureSelection.length > 0
  );
  const isFiltered = featureFilterMode === 'featureSelection';

  // Resolve selected feature names to numeric indices.
  let featureIndices = [];
  if (hasFeatureSelection && Array.isArray(featureIndex)) {
    featureIndices = featureSelection
      .map(name => featureIndex.indexOf(name))
      .filter(i => i >= 0);
  }
  const hasResolvedIndices = featureIndices.length > 0;

  // Resolve per-feature colors (in the same order as featureIndices).
  const resolvedFeatureColors = hasResolvedIndices
    ? featureSelection
      .filter(name => featureIndex?.indexOf(name) >= 0)
      .map((name) => {
        const match = Array.isArray(featureColor)
          ? featureColor.find(fc => fc.name === name)?.color
          : null;
        return match || staticColor;
      })
    : [];

  // Points coloring cases:
  // (See `createPointLayer` in spatial-beta/Spatial.js for more background.)

  // Coloring cases:
  // - spatialLayerColor: one color for all points.
  //   consider all as selected when featureSelection is null.
  // - spatialLayerColor with featureSelection: one color for
  //   all selected points, default color for unselected points
  // - spatialLayerColor with featureSelection and
  //   featureFilterMode 'featureSelection': one color for selected points,
  //   do not show unselected points

  // - geneSelection: use colors from "featureColor".
  //   consider all as selected when featureSelection is null.
  // - geneSelection with featureSelection: use colors from
  //   "featureColor" (array of { name, color: [r, g, b] }) for
  //   selected features, default color for unselected points
  // - geneSelection with featureFilterMode 'featureSelection': use colors
  //   from "featureColor" for selected features,
  //   do not show unselected points

  // - randomByFeature: random color for each feature
  //   (deterministic based on feature index).
  //   consider all as selected when featureSelection is null.
  // - randomByFeature with preferFeatureColor: use colors from
  //   "featureColor" (array of { name, color: [r, g, b] }) where
  //   available, and random colors otherwise.
  // - randomByFeature with featureSelection: random color for
  //   selected features, default color for unselected points
  // - randomByFeature with featureSelection and
  //   featureFilterMode 'featureSelection': random color for
  //   selected features, do not show unselected points

  // - random: random color for each point
  //   (deterministic based on point index).
  //   consider all as selected when featureSelection is null.
  // - random with preferFeatureColor: use colors from "featureColor"
  //   (array of { name, color: [r, g, b] }) where available,
  //   and random colors otherwise.
  // - random with featureSelection: random color for selected points,
  //   default color for unselected points
  // - random with featureSelection and
  //   featureFilterMode 'featureSelection': random color for selected
  //   points, do not show unselected points


  // ---- spatialLayerColor ----
  if (obsColorEncoding === 'spatialLayerColor') {
    if (!hasFeatureSelection || !hasResolvedIndices) {
      return getSpatialLayerColorShader(staticColor, opacity, pointMarkerBorderWidth);
    }
    if (isFiltered) {
      return getSpatialLayerColorFilteredShader(
        staticColor, opacity, featureIndices, featureIndexProp, pointMarkerBorderWidth,
      );
    }
    return getSpatialLayerColorWithSelectionShader(
      staticColor, opacity, featureIndices, defaultColor, featureIndexProp, pointMarkerBorderWidth,
    );
  }

  // ---- geneSelection ----
  if (obsColorEncoding === 'geneSelection') {
    if (!featureIndexProp) {
      throw new Error('In order to use gene-based color encoding for Neuroglancer Points, options.featureIndexProp must be specified for the obsPoints.ng-annotations fileType in the Vitessce configuration.');
    }
    if (!hasFeatureSelection || !hasResolvedIndices) {
      return getGeneSelectionNoSelectionShader(staticColor, opacity, pointMarkerBorderWidth,);
    }
    if (isFiltered) {
      return getGeneSelectionFilteredShader(
        featureIndices, resolvedFeatureColors,
        staticColor, opacity, featureIndexProp, pointMarkerBorderWidth,
      );
    }
    return getGeneSelectionWithSelectionShader(
      featureIndices, resolvedFeatureColors,
      staticColor, defaultColor, opacity, featureIndexProp, pointMarkerBorderWidth,
    );
  }

  // ---- randomByFeature ----
  if (obsColorEncoding === 'randomByFeature') {
    if (!featureIndexProp) {
      throw new Error('In order to use gene-based color encoding for Neuroglancer Points, options.featureIndexProp must be specified for the obsPoints.ng-annotations fileType in the Vitessce configuration.');
    }
    if (!hasFeatureSelection || !hasResolvedIndices) {
      return getRandomByFeatureShader(opacity, featureIndexProp, pointMarkerBorderWidth);
    }
    if (isFiltered) {
      return getRandomByFeatureFilteredShader(
        featureIndices, opacity, featureIndexProp, pointMarkerBorderWidth,
      );
    }
    return getRandomByFeatureWithSelectionShader(
      featureIndices, defaultColor, opacity, featureIndexProp, pointMarkerBorderWidth,
    );
  }

  // ---- random (per point) ----
  if (obsColorEncoding === 'random') {
    if (!pointIndexProp) {
      throw new Error('In order to use per-point color encoding for Neuroglancer Points, options.pointIndexProp must be specified for the obsPoints.ng-annotations fileType in the Vitessce configuration.');
    }
    if (!hasFeatureSelection || !hasResolvedIndices) {
      return getRandomPerPointShader(opacity, featureIndexProp, pointIndexProp, pointMarkerBorderWidth,);
    }
    if (isFiltered) {
      return getRandomPerPointFilteredShader(
        featureIndices, opacity, featureIndexProp, pointIndexProp, pointMarkerBorderWidth,
      );
    }
    return getRandomPerPointWithSelectionShader(
      featureIndices, defaultColor, opacity, featureIndexProp, pointIndexProp, pointMarkerBorderWidth,
    );
  }

  // Fallback: static color.
  return getSpatialLayerColorShader(staticColor, opacity, pointMarkerBorderWidth);
}
