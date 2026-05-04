/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
import { getDefaultColor } from '@vitessce/utils';
import { treeToCellColorsBySetNames } from './cell-set-utils.js';

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
// eslint-disable-next-line max-len
const schemeViridis = [[68,1,84],[68,2,86],[69,4,87],[69,5,89],[70,7,90],[70,8,92],[70,10,93],[70,11,94],[71,13,96],[71,14,97],[71,16,99],[71,17,100],[71,19,101],[72,20,103],[72,22,104],[72,23,105],[72,24,106],[72,26,108],[72,27,109],[72,28,110],[72,30,111],[72,31,112],[72,32,113],[72,34,115],[72,35,116],[72,36,117],[72,38,118],[72,39,119],[72,40,120],[72,42,121],[72,43,122],[72,44,123],[72,46,124],[72,47,125],[72,48,126],[72,50,127],[72,51,128],[72,52,129],[72,53,130],[72,55,131],[72,56,132],[72,57,133],[72,59,134],[72,60,135],[72,61,136],[72,63,137],[72,64,137],[72,65,138],[72,67,139],[72,68,140],[72,69,141],[72,71,142],[72,72,143],[72,73,144],[72,75,145],[72,76,146],[72,77,147],[72,79,148],[72,80,149],[72,82,150],[72,83,150],[72,84,151],[72,86,152],[72,87,153],[72,88,154],[72,90,155],[71,91,156],[71,92,157],[71,94,158],[71,95,158],[71,97,159],[71,98,160],[71,99,161],[71,101,162],[71,102,163],[71,103,164],[71,105,164],[71,106,165],[71,108,166],[71,109,167],[71,110,168],[71,112,169],[71,113,169],[71,114,170],[71,116,171],[71,117,172],[70,119,173],[70,120,174],[70,121,174],[70,123,175],[70,124,176],[70,125,177],[70,127,178],[70,128,178],[70,130,179],[70,131,180],[70,132,181],[70,134,182],[70,135,182],[70,136,183],[70,138,184],[70,139,185],[70,141,186],[70,142,186],[70,143,187],[70,145,188],[70,146,189],[70,148,189],[70,149,190],[70,150,191],[70,152,192],[70,153,192],[70,155,193],[70,156,194],[70,157,195],[70,159,195],[70,160,196],[70,162,197],[70,163,198],[70,164,198],[70,166,199],[70,167,200],[71,169,200],[71,170,201],[71,171,202],[71,173,203],[71,174,203],[71,176,204],[71,177,205],[71,178,205],[72,180,206],[72,181,207],[72,183,207],[72,184,208],[73,185,209],[73,187,209],[73,188,210],[74,190,211],[74,191,211],[74,192,212],[75,194,213],[75,195,213],[76,197,214],[76,198,214],[77,199,215],[77,201,216],[78,202,216],[78,204,217],[79,205,217],[79,207,218],[80,208,218],[81,209,219],[81,211,220],[82,212,220],[83,214,221],[83,215,221],[84,216,222],[85,218,222],[85,219,223],[86,221,223],[87,222,224],[88,224,224],[88,225,225],[89,226,225],[90,228,226],[91,229,226],[92,231,227],[92,232,227],[93,234,228],[94,235,228],[95,236,229],[96,238,229],[97,239,230],[97,241,230],[98,242,231],[99,244,231],[100,245,232],[101,246,232],[102,248,233],[103,249,233],[104,251,234],[105,252,234]];

const schemeJet = Array.from({length: 256}, (_, i) => {
  const t = i / 255;
  let r, g, b;
  if (t < 0.125) { r = 0; g = 0; b = 0.5 + t * 4; }
  else if (t < 0.375) { r = 0; g = (t - 0.125) * 4; b = 1; }
  else if (t < 0.625) { r = (t - 0.375) * 4; g = 1; b = 1 - (t - 0.375) * 4; }
  else if (t < 0.875) { r = 1; g = 1 - (t - 0.625) * 4; b = 0; }
  else { r = 1 - (t - 0.875) * 4; g = 0; b = 0; }
  return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
});

const schemeGreys = Array.from({length: 256}, (_, i) => [i, i, i]);

// Reference: https://github.com/d3/d3-interpolate/blob/96d54051d1c2fec55f240edd0ec5401715b10390/src/rgb.js
function rgbSpline(spline/* : (values: number[]) => ((t: number) => number) */) {
  return (colors/* : number[][] */) => {
    const n = colors.length;
    const r/* : number[] */ = new Array(n);
    const g/* : number[] */ = new Array(n);
    const b/* : number[] */ = new Array(n);
    let i; let
      color;
    // eslint-disable-next-line no-plusplus
    for (i = 0; i < n; ++i) {
      color = [colors[i][0], colors[i][1], colors[i][2]];
      r[i] = color[0] || 0;
      g[i] = color[1] || 0;
      b[i] = color[2] || 0;
    }
    const rFunc/* : (t: number) => number */ = spline(r);
    const gFunc/* : (t: number) => number */ = spline(g);
    const bFunc/* : (t: number) => number */ = spline(b);
    return (t/* : number */) => [rFunc(t), gFunc(t), bFunc(t)];
  };
}

// Reference: https://github.com/d3/d3-interpolate/blob/594a32af1fe1118812b439012c2cb742e907c0c0/src/basis.js
function basis(values/* : number[] */) {
  function innerBasis(
    t1/* : number */, v0/* : number */, v1/* : number */, v2/* : number */, v3/* : number */,
  ) {
    const t2 = t1 * t1; const
      t3 = t2 * t1;
    return ((1 - 3 * t1 + 3 * t2 - t3) * v0
          + (4 - 6 * t2 + 3 * t3) * v1
          + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
          + t3 * v3) / 6;
  }

  const n = values.length - 1;
  return (t/* : number */) => {
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

function interpolateSequentialMulti(range/* : number[][] */) {
  const n = range.length;
  return (t/* : number */) => range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
}

export const interpolateRdBu = interpolateRgbBasis(schemeRdBu);
export const interpolatePlasma = interpolateSequentialMulti(schemePlasma);
export const interpolateViridis = interpolateSequentialMulti(schemeViridis);
export const interpolateJet = interpolateSequentialMulti(schemeJet);
export const interpolateGreys = interpolateSequentialMulti(schemeGreys);

/* type GetCellColorsParams = {
  cellSetSelection: string[][] | null;
  cellSetColor: { path: string[]; color: [number, number, number] }[] | null;
  cellSets: object; // TODO(ts): more strict typing here
  obsIndex: string[] | null;
  theme: 'light' | 'dark' | null;
} */

/**
 * Get a mapping of cell IDs to cell colors based on
 * gene / cell set selection coordination state.
 * @param {object} params
 * @param {array[]} params.cellSetSelection Selected cell sets.
 * @param {object[]} params.cellSetColor Array of cell set color
 * objects, each containing a path and color [r, g, b].
 * @param {string[]} params.obsIndex Array of cell IDs,
 * in order to initialize all cells to the default color.
 * @param {string} params.theme The current theme,
 * in order to get the theme-based default color.
 * @returns {Map} Mapping from cell IDs to [r, g, b] color arrays.
 */
export function getCellColors(params/* : GetCellColorsParams */)/* : Map<string, number[]> */ {
  const {
    cellSets,
    cellSetSelection,
    cellSetColor,
    obsIndex,
    theme,
  } = params;
  if (cellSetSelection && cellSets) {
    // TODO(ts): fix typing here once better typing in sets-utils.
    return treeToCellColorsBySetNames(
      cellSets, cellSetSelection, cellSetColor/* as object[] */, theme/* as string */,
    );
  }
  if (obsIndex && theme) {
    return new Map(obsIndex.map(o => ([o, getDefaultColor(theme)])));
  }
  return new Map();
}
