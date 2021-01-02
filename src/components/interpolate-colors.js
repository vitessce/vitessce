/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
import { treeToCellColorsBySetNames } from './sets/cell-set-utils';

// The functions defined here have been adapted from d3-interpolate,
// d3-color, and d3-scale-chromatic.
// Color string "rgb(r,g,b)" representations are replaced by color array [r, g, b]
// representations, to allow them to work nicely with deck.gl,
// without the need to converting back and forth between string and array formats.

// Reference: https://github.com/d3/d3-scale-chromatic/blob/431d21da776f97c632f53a855bd822edfbbcd56e/src/diverging/RdBu.js
// eslint-disable-next-line max-len
const schemeRdBu = [[103, 0, 31], [178, 24, 43], [214, 96, 77], [244, 165, 130], [253, 219, 199], [247, 247, 247], [209, 229, 240], [146, 197, 222], [67, 147, 195], [33, 102, 172], [5, 48, 97]];
// eslint-disable-next-line max-len
const schemePlasma = [[13, 8, 135], [16, 7, 136], [19, 7, 137], [22, 7, 138], [25, 6, 140], [27, 6, 141], [29, 6, 142], [32, 6, 143], [34, 6, 144], [36, 6, 145], [38, 5, 145], [40, 5, 146], [42, 5, 147], [44, 5, 148], [46, 5, 149], [47, 5, 150], [49, 5, 151], [51, 5, 151], [53, 4, 152], [55, 4, 153], [56, 4, 154], [58, 4, 154], [60, 4, 155], [62, 4, 156], [63, 4, 156], [65, 4, 157], [67, 3, 158], [68, 3, 158], [70, 3, 159], [72, 3, 159], [73, 3, 160], [75, 3, 161], [76, 2, 161], [78, 2, 162], [80, 2, 162], [81, 2, 163], [83, 2, 163], [85, 2, 164], [86, 1, 164], [88, 1, 164], [89, 1, 165], [91, 1, 165], [92, 1, 166], [94, 1, 166], [96, 1, 166], [97, 0, 167], [99, 0, 167], [100, 0, 167], [102, 0, 167], [103, 0, 168], [105, 0, 168], [106, 0, 168], [108, 0, 168], [110, 0, 168], [111, 0, 168], [113, 0, 168], [114, 1, 168], [116, 1, 168], [117, 1, 168], [119, 1, 168], [120, 1, 168], [122, 2, 168], [123, 2, 168], [125, 3, 168], [126, 3, 168], [128, 4, 168], [129, 4, 167], [131, 5, 167], [132, 5, 167], [134, 6, 166], [135, 7, 166], [136, 8, 166], [138, 9, 165], [139, 10, 165], [141, 11, 165], [142, 12, 164], [143, 13, 164], [145, 14, 163], [146, 15, 163], [148, 16, 162], [149, 17, 161], [150, 19, 161], [152, 20, 160], [153, 21, 159], [154, 22, 159], [156, 23, 158], [157, 24, 157], [158, 25, 157], [160, 26, 156], [161, 27, 155], [162, 29, 154], [163, 30, 154], [165, 31, 153], [166, 32, 152], [167, 33, 151], [168, 34, 150], [170, 35, 149], [171, 36, 148], [172, 38, 148], [173, 39, 147], [174, 40, 146], [176, 41, 145], [177, 42, 144], [178, 43, 143], [179, 44, 142], [180, 46, 141], [181, 47, 140], [182, 48, 139], [183, 49, 138], [184, 50, 137], [186, 51, 136], [187, 52, 136], [188, 53, 135], [189, 55, 134], [190, 56, 133], [191, 57, 132], [192, 58, 131], [193, 59, 130], [194, 60, 129], [195, 61, 128], [196, 62, 127], [197, 64, 126], [198, 65, 125], [199, 66, 124], [200, 67, 123], [201, 68, 122], [202, 69, 122], [203, 70, 121], [204, 71, 120], [204, 73, 119], [205, 74, 118], [206, 75, 117], [207, 76, 116], [208, 77, 115], [209, 78, 114], [210, 79, 113], [211, 81, 113], [212, 82, 112], [213, 83, 111], [213, 84, 110], [214, 85, 109], [215, 86, 108], [216, 87, 107], [217, 88, 106], [218, 90, 106], [218, 91, 105], [219, 92, 104], [220, 93, 103], [221, 94, 102], [222, 95, 101], [222, 97, 100], [223, 98, 99], [224, 99, 99], [225, 100, 98], [226, 101, 97], [226, 102, 96], [227, 104, 95], [228, 105, 94], [229, 106, 93], [229, 107, 93], [230, 108, 92], [231, 110, 91], [231, 111, 90], [232, 112, 89], [233, 113, 88], [233, 114, 87], [234, 116, 87], [235, 117, 86], [235, 118, 85], [236, 119, 84], [237, 121, 83], [237, 122, 82], [238, 123, 81], [239, 124, 81], [239, 126, 80], [240, 127, 79], [240, 128, 78], [241, 129, 77], [241, 131, 76], [242, 132, 75], [243, 133, 75], [243, 135, 74], [244, 136, 73], [244, 137, 72], [245, 139, 71], [245, 140, 70], [246, 141, 69], [246, 143, 68], [247, 144, 68], [247, 145, 67], [247, 147, 66], [248, 148, 65], [248, 149, 64], [249, 151, 63], [249, 152, 62], [249, 154, 62], [250, 155, 61], [250, 156, 60], [250, 158, 59], [251, 159, 58], [251, 161, 57], [251, 162, 56], [252, 163, 56], [252, 165, 55], [252, 166, 54], [252, 168, 53], [252, 169, 52], [253, 171, 51], [253, 172, 51], [253, 174, 50], [253, 175, 49], [253, 177, 48], [253, 178, 47], [253, 180, 47], [253, 181, 46], [254, 183, 45], [254, 184, 44], [254, 186, 44], [254, 187, 43], [254, 189, 42], [254, 190, 42], [254, 192, 41], [253, 194, 41], [253, 195, 40], [253, 197, 39], [253, 198, 39], [253, 200, 39], [253, 202, 38], [253, 203, 38], [252, 205, 37], [252, 206, 37], [252, 208, 37], [252, 210, 37], [251, 211, 36], [251, 213, 36], [251, 215, 36], [250, 216, 36], [250, 218, 36], [249, 220, 36], [249, 221, 37], [248, 223, 37], [248, 225, 37], [247, 226, 37], [247, 228, 37], [246, 230, 38], [246, 232, 38], [245, 233, 38], [245, 235, 39], [244, 237, 39], [243, 238, 39], [243, 240, 39], [242, 242, 39], [241, 244, 38], [241, 245, 37], [240, 247, 36], [240, 249, 33]];

// Reference: https://github.com/d3/d3-interpolate/blob/96d54051d1c2fec55f240edd0ec5401715b10390/src/rgb.js
function rgbSpline(spline) {
  return (colors) => {
    const n = colors.length;
    let r = new Array(n);
    let g = new Array(n);
    let b = new Array(n);
    let i; let
      color;
    // eslint-disable-next-line no-plusplus
    for (i = 0; i < n; ++i) {
      color = [colors[i][0], colors[i][1], colors[i][2]];
      r[i] = color[0] || 0;
      g[i] = color[1] || 0;
      b[i] = color[2] || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    return t => [r(t), g(t), b(t)];
  };
}

// Reference: https://github.com/d3/d3-interpolate/blob/594a32af1fe1118812b439012c2cb742e907c0c0/src/basis.js
function basis(values) {
  function innerBasis(t1, v0, v1, v2, v3) {
    const t2 = t1 * t1; const
      t3 = t2 * t1;
    return ((1 - 3 * t1 + 3 * t2 - t3) * v0
          + (4 - 6 * t2 + 3 * t3) * v1
          + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
          + t3 * v3) / 6;
  }

  const n = values.length - 1;
  return (t) => {
    const i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n);
    const v1 = values[i];
    const v2 = values[i + 1];
    const v0 = i > 0 ? values[i - 1] : 2 * v1 - v2;
    const v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return innerBasis((t - i / n) * n, v0, v1, v2, v3);
  };
}


// Reference: https://github.com/d3/d3-scale-chromatic/blob/ade54c13e8dfdb9807801a794eaec1a37f926b8a/src/ramp.js
const interpolateRgbBasis = rgbSpline(basis);

function interpolateSequentialMulti(range) {
  const n = range.length;
  return t => range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
}

export const interpolateRdBu = interpolateRgbBasis(schemeRdBu);
export const interpolatePlasma = interpolateSequentialMulti(schemePlasma);


/**
 * Get a mapping of cell IDs to cell colors based on
 * gene / cell set selection coordination state.
 * @param {object} params
 * @param {object} params.expressionMatrix { rows, cols, matrix }
 * @param {array} params.geneSelection Array of selected gene IDs.
 * @param {object} params.cellSets The cell sets tree.
 * @param {object} params.cellSetSelection Selected cell sets.
 * @param {string} params.cellColorEncoding Which to use for
 * coloring: gene expression or cell sets?
 * @returns {Map} Mapping from cell IDs to [r, g, b] color arrays.
 */
export function getCellColors(params) {
  const {
    cellColorEncoding,
    expressionMatrix, geneSelection,
    cellSets, cellSetSelection,
    cellSetColor,
  } = params;
  if (cellColorEncoding === 'geneSelection' && geneSelection && geneSelection.length >= 1 && expressionMatrix) {
    const firstGeneSelected = geneSelection[0];
    // TODO: allow other color maps.
    const geneExpColormap = interpolatePlasma;
    const geneIndex = expressionMatrix.cols.indexOf(firstGeneSelected);
    if (geneIndex !== -1) {
      const numGenes = expressionMatrix.cols.length;
      // Create new cellColors map based on the selected gene.
      return new Map(expressionMatrix.rows.map((cellId, cellIndex) => {
        const value = expressionMatrix.matrix[cellIndex * numGenes + geneIndex];
        const cellColor = geneExpColormap(value / 255);
        return [cellId, cellColor];
      }));
    }
  } else if (cellColorEncoding === 'cellSetSelection' && cellSetSelection && cellSets) {
    // Cell sets can potentially lack set colors since the color property
    // is not a required part of the schema.
    // The `initializeSets` function fills in any empty colors
    // with defaults and returns the processed tree object.
    return treeToCellColorsBySetNames(cellSets, cellSetSelection, cellSetColor);
  }
  return new Map();
}
