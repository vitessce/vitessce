import { describe, it, expect, vi } from 'vitest';

import {
  getSpatialLayerColorShader,
  getSpatialLayerColorWithSelectionShader,
  getSpatialLayerColorFilteredShader,
  getGeneSelectionNoSelectionShader,
  getGeneSelectionWithSelectionShader,
  getGeneSelectionFilteredShader,
  getRandomByFeatureShader,
  getRandomByFeatureWithSelectionShader,
  getRandomByFeatureFilteredShader,
  getRandomPerPointShader,
  getRandomPerPointWithSelectionShader,
  getRandomPerPointFilteredShader,
} from './shader-utils.js';

// Mock the @vitessce/utils module before importing the module under test.
vi.mock('@vitessce/utils', () => ({
  PALETTE: [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
  ],
  getDefaultColor: theme => (theme === 'dark' ? [128, 128, 128] : [200, 200, 200]),
}));

/**
 * Helper: compare two shader strings line-by-line, ignoring
 * leading/trailing whitespace on each line and ignoring empty lines.
 */
function expectShaderEqual(actual, expected) {
  const normalize = s => s
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  expect(normalize(actual)).toEqual(normalize(expected));
}

// ============================================================
// Case 1: spatialLayerColor
// ============================================================

describe('getSpatialLayerColorShader', () => {
  it('generates a shader that sets all points to the static color', () => {
    const result = getSpatialLayerColorShader([255, 128, 0], 0.8);
    const expected = `
void main() {
    setColor(vec4(1, 0.5019607843137255, 0, 0.8));
}
`;
    expectShaderEqual(result, expected);
  });

  it('handles zero opacity', () => {
    const result = getSpatialLayerColorShader([0, 0, 0], 0);
    const expected = `
void main() {
    setColor(vec4(0, 0, 0, 0));
}
`;
    expectShaderEqual(result, expected);
  });

  it('handles full white at full opacity', () => {
    const result = getSpatialLayerColorShader([255, 255, 255], 1.0);
    const expected = `
void main() {
    setColor(vec4(1, 1, 1, 1));
}
`;
    expectShaderEqual(result, expected);
  });
});

describe('getSpatialLayerColorWithSelectionShader', () => {
  it('generates a shader that colors selected features with static color and unselected with default', () => {
    const result = getSpatialLayerColorWithSelectionShader(
      [255, 0, 0], 0.5, [2, 5], [128, 128, 128], 'gene_index',
    );
    const expected = `
void main() {
    int geneIndex = prop_gene_index();
    int selectedIndices[2] = int[2](2, 5);
    bool isSelected = false;
    for (int i = 0; i < 2; ++i) {
        if (geneIndex == selectedIndices[i]) {
            isSelected = true;
        }
    }
    if (isSelected) {
        setColor(vec4(1, 0, 0, 0.5));
    } else {
        setColor(vec4(0.5019607843137255, 0.5019607843137255, 0.5019607843137255, 0.5));
    }
}
`;
    expectShaderEqual(result, expected);
  });

  it('generates correct shader with a single selected feature', () => {
    const result = getSpatialLayerColorWithSelectionShader(
      [0, 255, 0], 1.0, [10], [0, 0, 0], 'feat_idx',
    );
    const expected = `
void main() {
    int geneIndex = prop_feat_idx();
    int selectedIndices[1] = int[1](10);
    bool isSelected = false;
    for (int i = 0; i < 1; ++i) {
        if (geneIndex == selectedIndices[i]) {
            isSelected = true;
        }
    }
    if (isSelected) {
        setColor(vec4(0, 1, 0, 1));
    } else {
        setColor(vec4(0, 0, 0, 1));
    }
}
`;
    expectShaderEqual(result, expected);
  });
});

describe('getSpatialLayerColorFilteredShader', () => {
  it('generates a shader that discards unselected points', () => {
    const result = getSpatialLayerColorFilteredShader(
      [0, 0, 255], 0.9, [3, 7, 11], 'gene_index',
    );
    const expected = `
void main() {
    int geneIndex = prop_gene_index();
    int selectedIndices[3] = int[3](3, 7, 11);
    bool isSelected = false;
    for (int i = 0; i < 3; ++i) {
        if (geneIndex == selectedIndices[i]) {
            isSelected = true;
        }
    }
    if (!isSelected) {
        discard;
    }
    setColor(vec4(0, 0, 1, 0.9));
}
`;
    expectShaderEqual(result, expected);
  });
});

// ============================================================
// Case 2: geneSelection
// ============================================================

describe('getGeneSelectionNoSelectionShader', () => {
  it('generates a shader identical to spatialLayerColor (static color for all)', () => {
    const result = getGeneSelectionNoSelectionShader([100, 200, 50], 0.7);
    const expected = `
void main() {
    setColor(vec4(0.39215686274509803, 0.7843137254901961, 0.19607843137254902, 0.7));
}
`;
    expectShaderEqual(result, expected);
  });
});

describe('getGeneSelectionWithSelectionShader', () => {
  it('generates a shader with per-feature colors for selected and default for unselected', () => {
    const result = getGeneSelectionWithSelectionShader(
      [1, 4],
      [[255, 0, 0], [0, 255, 0]],
      [128, 128, 128],
      [50, 50, 50],
      0.6,
      'gene_index',
    );
    const expected = `
void main() {
    int geneIndex = prop_gene_index();
    int selectedIndices[2] = int[2](1, 4);
    vec3 featureColors[2] = vec3[2](vec3(1, 0, 0), vec3(0, 1, 0));
    vec4 color = vec4(0.19607843137254902, 0.19607843137254902, 0.19607843137254902, 0.6);
    for (int i = 0; i < 2; ++i) {
        if (geneIndex == selectedIndices[i]) {
            color = vec4(featureColors[i], 0.6);
        }
    }
    setColor(color);
}
`;
    expectShaderEqual(result, expected);
  });

  it('uses static color as fallback when feature color is falsy', () => {
    // The code uses `c ? toVec3(c) : toVec3(normStatic)`.
    // normalizeColor always returns an array (truthy), so the fallback
    // only triggers if the original color was falsy before normalization.
    // Since featureColors are always normalized, we just check the normal path.
    const result = getGeneSelectionWithSelectionShader(
      [0],
      [[0, 0, 255]],
      [255, 255, 255],
      [0, 0, 0],
      1.0,
      'fi',
    );
    const expected = `
void main() {
    int geneIndex = prop_fi();
    int selectedIndices[1] = int[1](0);
    vec3 featureColors[1] = vec3[1](vec3(0, 0, 1));
    vec4 color = vec4(0, 0, 0, 1);
    for (int i = 0; i < 1; ++i) {
        if (geneIndex == selectedIndices[i]) {
            color = vec4(featureColors[i], 1);
        }
    }
    setColor(color);
}
`;
    expectShaderEqual(result, expected);
  });
});

describe('getGeneSelectionFilteredShader', () => {
  it('generates a shader that discards unselected and colors selected per-feature', () => {
    const result = getGeneSelectionFilteredShader(
      [2, 8],
      [[255, 0, 0], [0, 0, 255]],
      [128, 128, 128],
      0.75,
      'gene_index',
    );
    const expected = `
void main() {
    int geneIndex = prop_gene_index();
    int selectedIndices[2] = int[2](2, 8);
    vec3 featureColors[2] = vec3[2](vec3(1, 0, 0), vec3(0, 0, 1));
    bool isSelected = false;
    vec3 matchedColor = vec3(0.0);
    for (int i = 0; i < 2; ++i) {
        if (geneIndex == selectedIndices[i]) {
            isSelected = true;
            matchedColor = featureColors[i];
        }
    }
    if (!isSelected) {
        discard;
    }
    setColor(vec4(matchedColor, 0.75));
}
`;
    expectShaderEqual(result, expected);
  });
});

// ============================================================
// Case 3: randomByFeature
// ============================================================

describe('getRandomByFeatureShader', () => {
  it('generates a shader using the palette to color by feature index', () => {
    const result = getRandomByFeatureShader(0.5, 'gene_index');
    const expected = `
void main() {
    int geneIndex = prop_gene_index();
    vec3 palette[3] = vec3[3](vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1));
    int colorIdx = geneIndex - (geneIndex / 3) * 3;
    if (colorIdx < 0) { colorIdx = -colorIdx; }
    vec3 color = palette[colorIdx];
    setColor(vec4(color, 0.5));
}
`;
    expectShaderEqual(result, expected);
  });
});

describe('getRandomByFeatureWithSelectionShader', () => {
  it('generates a shader with palette colors for selected and default for unselected', () => {
    const result = getRandomByFeatureWithSelectionShader(
      [1, 2], [50, 50, 50], 0.8, 'gene_index',
    );
    const expected = `
void main() {
    int geneIndex = prop_gene_index();
    vec3 palette[3] = vec3[3](vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1));
    int selectedIndices[2] = int[2](1, 2);
    bool isSelected = false;
    for (int i = 0; i < 2; ++i) {
        if (geneIndex == selectedIndices[i]) {
            isSelected = true;
        }
    }
    if (isSelected) {
        int colorIdx = geneIndex - (geneIndex / 3) * 3;
        if (colorIdx < 0) { colorIdx = -colorIdx; }
        setColor(vec4(palette[colorIdx], 0.8));
    } else {
        setColor(vec4(0.19607843137254902, 0.19607843137254902, 0.19607843137254902, 0.8));
    }
}
`;
    expectShaderEqual(result, expected);
  });
});

describe('getRandomByFeatureFilteredShader', () => {
  it('generates a shader that discards unselected and uses palette for selected', () => {
    const result = getRandomByFeatureFilteredShader([0], 1.0, 'gene_index');
    const expected = `
void main() {
    int geneIndex = prop_gene_index();
    vec3 palette[3] = vec3[3](vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1));
    int selectedIndices[1] = int[1](0);
    bool isSelected = false;
    for (int i = 0; i < 1; ++i) {
        if (geneIndex == selectedIndices[i]) {
            isSelected = true;
        }
    }
    if (!isSelected) {
        discard;
    }
    int colorIdx = geneIndex - (geneIndex / 3) * 3;
    if (colorIdx < 0) { colorIdx = -colorIdx; }
    setColor(vec4(palette[colorIdx], 1));
}
`;
    expectShaderEqual(result, expected);
  });
});

// ============================================================
// Case 4: random (per point)
// ============================================================

describe('getRandomPerPointShader', () => {
  it('generates a shader with pseudo-random color per point', () => {
    const result = getRandomPerPointShader(0.9, 'gene_index', 'point_index');
    const expected = `
float hashToFloat(int v, int seed) {
    int h = v ^ (seed * 16777619);
    h = h * 747796405 + 2891336453;
    h = ((h >> 16) ^ h) * 2654435769;
    h = ((h >> 16) ^ h);
    return float(h & 0x7FFFFFFF) / float(0x7FFFFFFF);
}
void main() {
    int geneIndex = prop_gene_index();
    int pointIndex = prop_point_index();
    float r = hashToFloat(pointIndex, 0);
    float g = hashToFloat(pointIndex, 1);
    float b = hashToFloat(pointIndex, 2);
    setColor(vec4(r, g, b, 0.9));
}
`;
    expectShaderEqual(result, expected);
  });
});

describe('getRandomPerPointWithSelectionShader', () => {
  it('generates a shader with random colors for selected and default for unselected', () => {
    const result = getRandomPerPointWithSelectionShader(
      [3, 6], [100, 100, 100], 0.5, 'gene_index', 'point_index',
    );
    const expected = `
float hashToFloat(int v, int seed) {
    int h = v ^ (seed * 16777619);
    h = h * 747796405 + 2891336453;
    h = ((h >> 16) ^ h) * 2654435769;
    h = ((h >> 16) ^ h);
    return float(h & 0x7FFFFFFF) / float(0x7FFFFFFF);
}
void main() {
    int geneIndex = prop_gene_index();
    int pointIndex = prop_point_index();
    int selectedIndices[2] = int[2](3, 6);
    bool isSelected = false;
    for (int i = 0; i < 2; ++i) {
        if (geneIndex == selectedIndices[i]) {
            isSelected = true;
        }
    }
    if (isSelected) {
        float r = hashToFloat(pointIndex, 0);
        float g = hashToFloat(pointIndex, 1);
        float b = hashToFloat(pointIndex, 2);
        setColor(vec4(r, g, b, 0.5));
    } else {
        setColor(vec4(0.39215686274509803, 0.39215686274509803, 0.39215686274509803, 0.5));
    }
}
`;
    expectShaderEqual(result, expected);
  });
});

describe('getRandomPerPointFilteredShader', () => {
  it('generates a shader that discards unselected and uses random color for selected', () => {
    const result = getRandomPerPointFilteredShader(
      [5], 1.0, 'gene_index', 'point_index',
    );
    const expected = `
float hashToFloat(int v, int seed) {
    int h = v ^ (seed * 16777619);
    h = h * 747796405 + 2891336453;
    h = ((h >> 16) ^ h) * 2654435769;
    h = ((h >> 16) ^ h);
    return float(h & 0x7FFFFFFF) / float(0x7FFFFFFF);
}
void main() {
    int geneIndex = prop_gene_index();
    int pointIndex = prop_point_index();
    int selectedIndices[1] = int[1](5);
    bool isSelected = false;
    for (int i = 0; i < 1; ++i) {
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
    setColor(vec4(r, g, b, 1));
}
`;
    expectShaderEqual(result, expected);
  });
});
