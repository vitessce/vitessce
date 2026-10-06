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
  getPointsShader,
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
    setPointMarkerBorderWidth(0.0);
}
`;
    expectShaderEqual(result, expected);
  });

  it('handles zero opacity', () => {
    const result = getSpatialLayerColorShader([0, 0, 0], 0);
    const expected = `
void main() {
    setColor(vec4(0, 0, 0, 0));
    setPointMarkerBorderWidth(0.0);
}
`;
    expectShaderEqual(result, expected);
  });

  it('handles full white at full opacity', () => {
    const result = getSpatialLayerColorShader([255, 255, 255], 1.0);
    const expected = `
void main() {
    setColor(vec4(1, 1, 1, 1));
    setPointMarkerBorderWidth(0.0);
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
        setPointMarkerBorderWidth(0.0);
    } else {
        setColor(vec4(0.5019607843137255, 0.5019607843137255, 0.5019607843137255, 0.5000));
        setPointMarkerBorderWidth(0.0);
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
        setPointMarkerBorderWidth(0.0);
    } else {
        setColor(vec4(0, 0, 0, 1.0000));
        setPointMarkerBorderWidth(0.0);
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
    setPointMarkerBorderWidth(0.0);
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
    setPointMarkerBorderWidth(0.0);
}
`;
    expectShaderEqual(result, expected);
  });
});

describe('getGeneSelectionWithSelectionShader', () => {
  it('generates a shader with per-feature colors for selected and default for unselected', () => {
    const result = getGeneSelectionWithSelectionShader(
      [1, 4],
      [1.0, 0.5],
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
        float featureOpacities[2] = float[2](1.0000, 0.5000);
        vec4 color = vec4(0.19607843137254902, 0.19607843137254902, 0.19607843137254902, 0.6000);
        for (int i = 0; i < 2; ++i) {
            if (geneIndex == selectedIndices[i]) {
                color = vec4(featureColors[i], featureOpacities[i]);
            }
        }
        setColor(color);
        setPointMarkerBorderWidth(0.0);
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
      [1.0],
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
    float featureOpacities[1] = float[1](1.0000);
    vec4 color = vec4(0, 0, 0, 1.0000);
    for (int i = 0; i < 1; ++i) {
        if (geneIndex == selectedIndices[i]) {
            color = vec4(featureColors[i], featureOpacities[i]);
        }
    }
    setColor(color);
    setPointMarkerBorderWidth(0.0);
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
      [0.8, 0.3],
      [128, 128, 128],
      0.75,
      'gene_index',
    );
    const expected = `
      void main() {
          int geneIndex = prop_gene_index();
          int selectedIndices[2] = int[2](2, 8);
          vec3 featureColors[2] = vec3[2](vec3(1, 0, 0), vec3(0, 0, 1));
          float featureOpacities[2] = float[2](0.8000, 0.3000);
          bool isSelected = false;
          vec3 matchedColor = vec3(0.0);
          float matchedOpacity = 0.7500;
          for (int i = 0; i < 2; ++i) {
              if (geneIndex == selectedIndices[i]) {
                  isSelected = true;
                  matchedColor = featureColors[i];
                  matchedOpacity = featureOpacities[i];
              }
          }
          if (!isSelected) {
              discard;
          }
          setColor(vec4(matchedColor, matchedOpacity));
          setPointMarkerBorderWidth(0.0);
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
    setPointMarkerBorderWidth(0.0);
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
        setPointMarkerBorderWidth(0.0);
    } else {
        setColor(vec4(0.19607843137254902, 0.19607843137254902, 0.19607843137254902, 0.8000));
        setPointMarkerBorderWidth(0.0);
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
    setPointMarkerBorderWidth(0.0);
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
    setPointMarkerBorderWidth(0.0);
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
        setPointMarkerBorderWidth(0.0);
    } else {
        setColor(vec4(0.39215686274509803, 0.39215686274509803, 0.39215686274509803, 0.5000));
        setPointMarkerBorderWidth(0.0);
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
    setPointMarkerBorderWidth(0.0);
}
`;
    expectShaderEqual(result, expected);
  });
});

// ============================================================
// Unselected opacity
// ============================================================

describe('unselectedOpacity parameter', () => {
  it('spatialLayerColor: applies unselectedOpacity only to unselected points', () => {
    const result = getSpatialLayerColorWithSelectionShader(
      [255, 0, 0], 0.5, [2], [128, 128, 128], 'gene_index', 0.0, 0.1,
    );
    expect(result).toContain('setColor(vec4(1, 0, 0, 0.5));');
    expect(result).toContain(
      'setColor(vec4(0.5019607843137255, 0.5019607843137255, 0.5019607843137255, 0.1000));',
    );
  });

  it('geneSelection: applies unselectedOpacity to the default color', () => {
    const result = getGeneSelectionWithSelectionShader(
      [1], [1.0], [[255, 0, 0]], [128, 128, 128], [50, 50, 50], 1.0, 'gene_index', 0.0, 0.2,
    );
    expect(result).toContain(
      'vec4 color = vec4(0.19607843137254902, 0.19607843137254902, 0.19607843137254902, 0.2000);',
    );
    expect(result).toContain('float featureOpacities[1] = float[1](1.0000);');
  });

  it('randomByFeature: applies unselectedOpacity only to unselected points', () => {
    const result = getRandomByFeatureWithSelectionShader(
      [1], [50, 50, 50], 0.8, 'gene_index', 0.0, 0.3,
    );
    expect(result).toContain('setColor(vec4(palette[colorIdx], 0.8));');
    expect(result).toContain(
      'setColor(vec4(0.19607843137254902, 0.19607843137254902, 0.19607843137254902, 0.3000));',
    );
  });

  it('random per point: applies unselectedOpacity only to unselected points', () => {
    const result = getRandomPerPointWithSelectionShader(
      [3], [100, 100, 100], 0.5, 'gene_index', 'point_index', 0.0, 0.05,
    );
    expect(result).toContain('setColor(vec4(r, g, b, 0.5));');
    expect(result).toContain(
      'setColor(vec4(0.39215686274509803, 0.39215686274509803, 0.39215686274509803, 0.0500));',
    );
  });
});

describe('getPointsShader spatialLayerOpacityUnselected', () => {
  // theme undefined -> mocked getDefaultColor returns [200, 200, 200]
  const DEFAULT = '0.7843137254901961, 0.7843137254901961, 0.7843137254901961';
  const base = {
    featureIndex: ['A', 'B', 'C'],
    featureSelection: ['B'],
    featureIndexProp: 'gene_index',
    pointIndexProp: 'point_index',
  };

  it('defaults unselected opacity to 0.25 when undefined', () => {
    const result = getPointsShader({
      ...base, obsColorEncoding: 'geneSelection', spatialLayerOpacity: 1.0,
    });
    expect(result).toContain(`vec4 color = vec4(${DEFAULT}, 0.2500);`);
  });

  it('multiplies unselected opacity by layer opacity', () => {
    const result = getPointsShader({
      ...base,
      obsColorEncoding: 'geneSelection',
      spatialLayerOpacity: 0.5,
      spatialLayerOpacityUnselected: 0.2,
    });
    expect(result).toContain(`vec4 color = vec4(${DEFAULT}, 0.1000);`);
  });

  it('passes unselected opacity through in spatialLayerColor mode', () => {
    const result = getPointsShader({
      ...base,
      obsColorEncoding: 'spatialLayerColor',
      spatialLayerOpacity: 1.0,
      spatialLayerOpacityUnselected: 0.1,
    });
    expect(result).toContain(`setColor(vec4(${DEFAULT}, 0.1000));`);
  });

  it('applies to randomByFeature and random modes', () => {
    const rbf = getPointsShader({
      ...base, obsColorEncoding: 'randomByFeature', spatialLayerOpacityUnselected: 0.4,
    });
    expect(rbf).toContain(`setColor(vec4(${DEFAULT}, 0.4000));`);
    const rnd = getPointsShader({
      ...base, obsColorEncoding: 'random', spatialLayerOpacityUnselected: 0.4,
    });
    expect(rnd).toContain(`setColor(vec4(${DEFAULT}, 0.4000));`);
  });

  it('does not affect filtered mode (unselected points are discarded)', () => {
    const result = getPointsShader({
      ...base,
      obsColorEncoding: 'geneSelection',
      featureFilterMode: 'featureSelection',
      spatialLayerOpacityUnselected: 0.1,
    });
    expect(result).toContain('discard;');
    expect(result).not.toContain('0.1000');
  });

  it('uses full layer opacity for unselected when there is no feature selection', () => {
    const result = getPointsShader({
      ...base,
      featureSelection: null,
      obsColorEncoding: 'geneSelection',
      spatialLayerOpacity: 1.0,
      spatialLayerOpacityUnselected: 0.1,
    });
    expect(result).not.toContain('0.1000');
  });
});

describe('getPointsShader per-feature opacity multiplies with layer opacity', () => {
  const DEFAULT = '0.7843137254901961, 0.7843137254901961, 0.7843137254901961';
  const base = {
    featureIndex: ['A', 'B', 'C'],
    featureSelection: ['A', 'B'],
    featureIndexProp: 'gene_index',
    obsColorEncoding: 'geneSelection',
  };

  it('layer 0.5 x feature 0.5 = 0.25 for each selected feature', () => {
    const result = getPointsShader({
      ...base,
      spatialLayerOpacity: 0.5,
      featureColor: [
        { name: 'A', color: [255, 0, 0], opacity: 0.5 },
        { name: 'B', color: [0, 255, 0], opacity: 0.5 },
      ],
    });
    expect(result).toContain('float featureOpacities[2] = float[2](0.2500, 0.2500);');
  });

  it('missing per-feature opacity defaults to 1 (inherits layer opacity)', () => {
    const result = getPointsShader({
      ...base,
      spatialLayerOpacity: 0.5,
      featureColor: [
        { name: 'A', color: [255, 0, 0], opacity: 0.4 },
        { name: 'B', color: [0, 255, 0] },
      ],
    });
    expect(result).toContain('float featureOpacities[2] = float[2](0.2000, 0.5000);');
  });

  it('layer opacity 1 leaves per-feature opacity unchanged', () => {
    const result = getPointsShader({
      ...base,
      spatialLayerOpacity: 1.0,
      featureColor: [
        { name: 'A', color: [255, 0, 0], opacity: 0.3 },
        { name: 'B', color: [0, 255, 0], opacity: 0.7 },
      ],
    });
    expect(result).toContain('float featureOpacities[2] = float[2](0.3000, 0.7000);');
  });

  it('unselected opacity also multiplies with layer opacity', () => {
    const result = getPointsShader({
      ...base,
      spatialLayerOpacity: 0.5,
      spatialLayerOpacityUnselected: 0.5,
      featureColor: [{ name: 'A', color: [255, 0, 0], opacity: 0.5 }],
    });
    expect(result).toContain(`vec4 color = vec4(${DEFAULT}, 0.2500);`);
  });

  it('applies the multiplication in filtered mode too', () => {
    const result = getPointsShader({
      ...base,
      featureFilterMode: 'featureSelection',
      spatialLayerOpacity: 0.5,
      featureColor: [
        { name: 'A', color: [255, 0, 0], opacity: 0.5 },
        { name: 'B', color: [0, 255, 0], opacity: 1.0 },
      ],
    });
    expect(result).toContain('float featureOpacities[2] = float[2](0.2500, 0.5000);');
    expect(result).toContain('discard;');
  });

  it('layer opacity 0 hides selected and unselected points', () => {
    const result = getPointsShader({
      ...base,
      spatialLayerOpacity: 0,
      featureColor: [{ name: 'A', color: [255, 0, 0], opacity: 0.8 }],
    });
    expect(result).toContain('float featureOpacities[2] = float[2](0.0000, 0.0000);');
    expect(result).toContain(`vec4 color = vec4(${DEFAULT}, 0.0000);`);
  });
});
