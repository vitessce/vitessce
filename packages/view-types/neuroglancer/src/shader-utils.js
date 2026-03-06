// Utilities for constructing shaders that handle the coloring of Neuroglancer point annotation layers.
// References:
// - https://github.com/vitessce/vitessce/issues/2359#issuecomment-3572906947
// - https://chanzuckerberg.github.io/cryoet-data-portal/stable/neuroglancer_quickstart.html
import { PALETTE, getDefaultColor } from '@vitessce/utils';


/**
 *
 * @param {number[]} selectedGeneIndices List of gene indices that are selected for coloring.
 * @param {[number, number, number][]} selectedColors RGB color (0, 255) for each selected gene index, in the same order as selectedGeneIndices.
 * @returns
 */
export function getCategoricalShader(selectedGeneIndices, selectedColors) {
  if (selectedGeneIndices.length !== selectedColors.length) {
    throw new Error('selectedGeneIndices and selectedColors must have the same length');
  }

  // Convert 0-255 RGB values to 0-1 range for GLSL.
  const normalizedColors = selectedColors.map(color => color.map(c => c / 255));

  // Create a shader that maps gene indices to the corresponding colors.
  const numGenes = selectedGeneIndices.length;
  const defaultColor = [0.925, 0.925, 0.925, 0.0]; // Fully transparent by default.

  const colorMapVec = `vec3 colorMap[${numGenes}] = vec3[${numGenes}](${normalizedColors.map(c => `vec3(${c.join(', ')})`).join(', ')});`;
  const colorVec = `vec4 color = vec4(${defaultColor.join(', ')});`;
  const geneIndexMap = `int geneIndices[${numGenes}] = int[${numGenes}](${selectedGeneIndices.join(', ')});`;

  // lang: glsl
  const shader = `
        void main() {
            int geneIndex = prop_gene();
            /*
            // Example of what the shader would look like with 10 genes hardcoded:
            const vec3 tab10[10] = vec3[10](
                vec3(0.121, 0.466, 0.705), // blue
                vec3(1.000, 0.498, 0.054), // orange
                vec3(0.172, 0.627, 0.172), // green
                vec3(0.839, 0.153, 0.157), // red
                vec3(0.580, 0.404, 0.741), // purple
                vec3(0.549, 0.337, 0.294), // brown
                vec3(0.890, 0.467, 0.761), // pink
                vec3(0.498, 0.498, 0.498), // gray
                vec3(0.737, 0.741, 0.133), // olive
                vec3(0.090, 0.745, 0.811)  // cyan
            );
            
            vec4 color = vec4(0.925, 0.925, 0.925, 0.0); // Default: fully transparent
            const int gene_indices[10] = int[10](1, 2, 15, 32, 42, 33, 47, 49, 130, 200);
            */
            ${colorMapVec}
            ${colorVec}
            ${geneIndexMap}
            for (int i = 0; i < ${numGenes}; ++i) {
                if (geneIndex == geneIndices[i]) {
                    color = vec4(colorMap[i], 1.0);
                }
            }

            if (color.a < 0.01) {
                discard; // Don't render this fragment at all
            }

            setColor(color);
        }
    `;
  return shader;
}

/**
 * Normalize an RGB color array from [0, 255] to [0, 1].
 * @param {[number, number, number]} rgbColor
 * @returns {[number, number, number]}
 */
function normalizeColor(rgbColor) {
  return rgbColor.map(c => c / 255);
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
export function getSpatialLayerColorShader(staticColor, opacity) {
  const norm = normalizeColor(staticColor);
  // lang: glsl
  return `
        void main() {
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
 * @returns {string} A GLSL shader string.
 */
export function getSpatialLayerColorWithSelectionShader(
  staticColor, opacity, featureIndices, defaultColor,
) {
  const normStatic = normalizeColor(staticColor);
  const normDefault = normalizeColor(defaultColor);
  const numFeatures = featureIndices.length;
  const indicesArr = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;

  // lang: glsl
  return `
        void main() {
            int geneIndex = prop_gene();
            ${indicesArr}
            bool isSelected = false;
            for (int i = 0; i < ${numFeatures}; ++i) {
                if (geneIndex == selectedIndices[i]) {
                    isSelected = true;
                }
            }
            if (isSelected) {
                setColor(${toVec4(normStatic, opacity)});
            } else {
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
 * @returns {string} A GLSL shader string.
 */
export function getSpatialLayerColorFilteredShader(
  staticColor, opacity, featureIndices,
) {
  const normStatic = normalizeColor(staticColor);
  const numFeatures = featureIndices.length;
  const indicesArr = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;

  // lang: glsl
  return `
        void main() {
            int geneIndex = prop_gene();
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
export function getGeneSelectionNoSelectionShader(staticColor, opacity) {
  const norm = normalizeColor(staticColor);
  // lang: glsl
  return `
        void main() {
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
 * @returns {string} A GLSL shader string.
 */
export function getGeneSelectionWithSelectionShader(
  featureIndices, featureColors, staticColor, defaultColor, opacity,
) {
  const numFeatures = featureIndices.length;
  const normDefault = normalizeColor(defaultColor);
  const normColors = featureColors.map(c => normalizeColor(c));
  const normStatic = normalizeColor(staticColor);

  // Build per-feature color array: use featureColor if provided,
  // otherwise fall back to staticColor.
  const colorArr = normColors.map(
    c => (c ? toVec3(c) : toVec3(normStatic)),
  );

  const indicesDecl = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;
  const colorsDecl = `vec3 featureColors[${numFeatures}] = vec3[${numFeatures}](${colorArr.join(', ')});`;
  // lang: glsl
  return `
        void main() {
            int geneIndex = prop_gene();
            ${indicesDecl}
            ${colorsDecl}
            vec4 color = ${toVec4(normDefault, opacity)};
            for (int i = 0; i < ${numFeatures}; ++i) {
                if (geneIndex == selectedIndices[i]) {
                    color = vec4(featureColors[i], ${opacity});
                }
            }
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
 * @returns {string} A GLSL shader string.
 */
export function getGeneSelectionFilteredShader(
  featureIndices, featureColors, staticColor, opacity,
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
            int geneIndex = prop_gene();
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
 * @returns {string} A GLSL shader string.
 */
export function getRandomByFeatureShader(opacity) {
  // Embed a subset of the PALETTE into the shader.
  const paletteSize = PALETTE.length;
  const normPalette = PALETTE.map(c => normalizeColor(c));
  const paletteDecl = `vec3 palette[${paletteSize}] = vec3[${paletteSize}](${normPalette.map(c => toVec3(c)).join(', ')});`;

  // lang: glsl
  return `
        void main() {
            int geneIndex = prop_gene();
            ${paletteDecl}
            int colorIdx = geneIndex - (geneIndex / ${paletteSize}) * ${paletteSize};
            if (colorIdx < 0) { colorIdx = -colorIdx; }
            vec3 color = palette[colorIdx];
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
 * @returns {string} A GLSL shader string.
 */
export function getRandomByFeatureWithSelectionShader(
  featureIndices, defaultColor, opacity,
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
            int geneIndex = prop_gene();
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
                setColor(vec4(palette[colorIdx], ${opacity}));
            } else {
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
 * @returns {string} A GLSL shader string.
 */
export function getRandomByFeatureFilteredShader(featureIndices, opacity) {
  const paletteSize = PALETTE.length;
  const normPalette = PALETTE.map(c => normalizeColor(c));
  const numFeatures = featureIndices.length;

  const paletteDecl = `vec3 palette[${paletteSize}] = vec3[${paletteSize}](${normPalette.map(c => toVec3(c)).join(', ')});`;
  const indicesDecl = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;

  // lang: glsl
  return `
        void main() {
            int geneIndex = prop_gene();
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
            setColor(vec4(palette[colorIdx], ${opacity}));
        }
    `;
}

// ============================================================
// Case 4: random (per point)
// ============================================================

/**
 * Generate a shader for random-per-point encoding with no feature selection.
 * Each point gets a pseudo-random color based on its index.
 * @param {number} opacity Opacity (0-1).
 * @returns {string} A GLSL shader string.
 */
export function getRandomPerPointShader(opacity) {
  // Use a simple hash function on gl_FragCoord or prop_gene() to
  // produce a pseudo-random color. Since Neuroglancer annotation shaders
  // don't have a point index, we use prop_gene() as a seed.
  // TODO: fix. also see comments in the ng-merfish config and the points loader.

  // lang: glsl
  return `
        float hashToFloat(int v, int seed) {
            int h = v * 374761393 + seed * 668265263;
            h = (h ^ (h >> 13)) * 1274126177;
            h = h ^ (h >> 16);
            return float(h & 0x7FFFFFFF) / float(0x7FFFFFFF);
        }
        void main() {
            int geneIndex = prop_gene();
            /* TODO: fix this */
            int pointIndex = prop___null_dask_index__();
            float r = hashToFloat(pointIndex, 0);
            float g = hashToFloat(pointIndex, 1);
            float b = hashToFloat(pointIndex, 2);
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
 * @returns {string} A GLSL shader string.
 */
export function getRandomPerPointWithSelectionShader(
  featureIndices, defaultColor, opacity,
) {
  const normDefault = normalizeColor(defaultColor);
  const numFeatures = featureIndices.length;
  const indicesDecl = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;

  // lang: glsl
  return `
        float hashToFloat(int v, int seed) {
            int h = v * 374761393 + seed * 668265263;
            h = (h ^ (h >> 13)) * 1274126177;
            h = h ^ (h >> 16);
            return float(h & 0x7FFFFFFF) / float(0x7FFFFFFF);
        }
        void main() {
            int geneIndex = prop_gene();
            ${indicesDecl}
            bool isSelected = false;
            for (int i = 0; i < ${numFeatures}; ++i) {
                if (geneIndex == selectedIndices[i]) {
                    isSelected = true;
                }
            }
            if (isSelected) {
                float r = hashToFloat(geneIndex, 0);
                float g = hashToFloat(geneIndex, 1);
                float b = hashToFloat(geneIndex, 2);
                setColor(vec4(r, g, b, ${opacity}));
            } else {
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
 * @returns {string} A GLSL shader string.
 */
export function getRandomPerPointFilteredShader(featureIndices, opacity) {
  const numFeatures = featureIndices.length;
  const indicesDecl = `int selectedIndices[${numFeatures}] = int[${numFeatures}](${featureIndices.join(', ')});`;

  // lang: glsl
  return `
        float hashToFloat(int v, int seed) {
            int h = v * 374761393 + seed * 668265263;
            h = (h ^ (h >> 13)) * 1274126177;
            h = h ^ (h >> 16);
            return float(h & 0x7FFFFFFF) / float(0x7FFFFFFF);
        }
        void main() {
            int geneIndex = prop_gene();
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
            float r = hashToFloat(geneIndex, 0);
            float g = hashToFloat(geneIndex, 1);
            float b = hashToFloat(geneIndex, 2);
            setColor(vec4(r, g, b, ${opacity}));
        }
    `;
}


// TODO: other types of shaders, e.g., for continuous color scales, or for coloring by a random color for every gene.
// For a comprehensive list of color encoding scenarios, see `createPointLayer` in spatial-beta/Spatial.js.

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

    featureIndexProp,
    pointIndexProp,
  } = layerCoordination;

  console.log('Generating shader with coordination:', layerCoordination);

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
      return getSpatialLayerColorShader(staticColor, opacity);
    }
    if (isFiltered) {
      return getSpatialLayerColorFilteredShader(
        staticColor, opacity, featureIndices,
      );
    }
    return getSpatialLayerColorWithSelectionShader(
      staticColor, opacity, featureIndices, defaultColor,
    );
  }

  // ---- geneSelection ----
  if (obsColorEncoding === 'geneSelection') {
    if(!featureIndexProp) {
      throw new Error('In order to use gene-based color encoding for Neuroglancer Points, options.featureIndexProp must be specified for the obsPoints.ng-annotations fileType in the Vitessce configuration.');
    }
    if (!hasFeatureSelection || !hasResolvedIndices) {
      return getGeneSelectionNoSelectionShader(staticColor, opacity);
    }
    if (isFiltered) {
      return getGeneSelectionFilteredShader(
        featureIndices, resolvedFeatureColors, staticColor, opacity,
      );
    }
    return getGeneSelectionWithSelectionShader(
      featureIndices, resolvedFeatureColors, staticColor, defaultColor, opacity,
    );
  }

  // ---- randomByFeature ----
  if (obsColorEncoding === 'randomByFeature') {
    if(!featureIndexProp) {
      throw new Error('In order to use gene-based color encoding for Neuroglancer Points, options.featureIndexProp must be specified for the obsPoints.ng-annotations fileType in the Vitessce configuration.');
    }
    if (!hasFeatureSelection || !hasResolvedIndices) {
      return getRandomByFeatureShader(opacity);
    }
    if (isFiltered) {
      return getRandomByFeatureFilteredShader(featureIndices, opacity);
    }
    return getRandomByFeatureWithSelectionShader(
      featureIndices, defaultColor, opacity,
    );
  }

  // ---- random (per point) ----
  if (obsColorEncoding === 'random') {
    if(!pointIndexProp) {
      throw new Error('In order to use per-point color encoding for Neuroglancer Points, options.pointIndexProp must be specified for the obsPoints.ng-annotations fileType in the Vitessce configuration.');
    }
    if (!hasFeatureSelection || !hasResolvedIndices) {
      return getRandomPerPointShader(opacity);
    }
    if (isFiltered) {
      return getRandomPerPointFilteredShader(featureIndices, opacity);
    }
    return getRandomPerPointWithSelectionShader(
      featureIndices, defaultColor, opacity,
    );
  }

  // Fallback: static color.
  return getStaticColorShader(staticColor, opacity);
}
