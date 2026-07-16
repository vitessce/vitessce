import { PALETTE } from './components.js';

export type RgbColor = number[];

// Paul Tol qualitative schemes: https://personal.sron.nl/~pault/#sec:qualitative
// (pale/dark schemes omitted — designed for table-cell backgrounds and text,
// not for coloring points/regions.)
export const TOL_BRIGHT: RgbColor[] = [
  [68, 119, 170], [238, 102, 119], [34, 136, 51], [204, 187, 68],
  [102, 204, 238], [170, 51, 119], [187, 187, 187],
];
export const TOL_HIGH_CONTRAST: RgbColor[] = [
  [0, 68, 136], [221, 170, 51], [187, 85, 102],
];
export const TOL_VIBRANT: RgbColor[] = [
  [238, 119, 51], [0, 119, 187], [51, 187, 238], [238, 51, 119],
  [204, 51, 17], [0, 153, 136], [187, 187, 187],
];
export const TOL_MUTED: RgbColor[] = [
  [204, 102, 119], [51, 34, 136], [221, 204, 119], [17, 119, 51],
  [136, 204, 238], [136, 34, 85], [68, 170, 153], [153, 153, 51], [170, 68, 153],
];
export const TOL_MEDIUM_CONTRAST: RgbColor[] = [
  [102, 153, 204], [0, 68, 136], [238, 204, 102],
  [153, 68, 85], [153, 119, 0], [238, 153, 170],
];
export const TOL_LIGHT: RgbColor[] = [
  [119, 170, 221], [153, 221, 255], [68, 187, 153], [187, 204, 51], [170, 170, 0],
  [238, 221, 136], [238, 136, 102], [255, 170, 187], [221, 221, 221],
];

// Matplotlib / ColorBrewer qualitative colormaps:
// https://matplotlib.org/stable/users/explain/colors/colormaps.html#qualitative
export const MPL_TAB10: RgbColor[] = [
  [31, 119, 180], [255, 127, 14], [44, 160, 44], [214, 39, 40], [148, 103, 189],
  [140, 86, 75], [227, 119, 194], [127, 127, 127], [188, 189, 34], [23, 190, 207],
];
export const MPL_SET1: RgbColor[] = [
  [228, 26, 28], [55, 126, 184], [77, 175, 74], [152, 78, 163], [255, 127, 0],
  [255, 255, 51], [166, 86, 40], [247, 129, 191], [153, 153, 153],
];
export const MPL_SET2: RgbColor[] = [
  [102, 194, 165], [252, 141, 98], [141, 160, 203], [231, 138, 195],
  [166, 216, 84], [255, 217, 47], [229, 196, 148], [179, 179, 179],
];
export const MPL_SET3: RgbColor[] = [
  [141, 211, 199], [255, 255, 179], [190, 186, 218], [251, 128, 114], [128, 177, 211],
  [253, 180, 98], [179, 222, 105], [252, 205, 229], [217, 217, 217],
  [188, 128, 189], [204, 235, 197], [255, 237, 111],
];
export const MPL_DARK2: RgbColor[] = [
  [27, 158, 119], [217, 95, 2], [117, 112, 179], [231, 41, 138],
  [102, 166, 30], [230, 171, 2], [166, 118, 29], [102, 102, 102],
];
export const MPL_ACCENT: RgbColor[] = [
  [127, 201, 127], [190, 174, 212], [253, 192, 134], [255, 255, 153],
  [56, 108, 176], [240, 2, 127], [191, 91, 23], [102, 102, 102],
];
export const MPL_PASTEL1: RgbColor[] = [
  [251, 180, 174], [179, 205, 227], [204, 235, 197], [222, 203, 228], [254, 217, 166],
  [255, 255, 204], [229, 216, 189], [253, 218, 236], [242, 242, 242],
];
export const MPL_PASTEL2: RgbColor[] = [
  [179, 226, 205], [253, 205, 172], [203, 213, 232], [244, 202, 228],
  [230, 245, 201], [255, 242, 174], [241, 226, 204], [204, 204, 204],
];

export const QUALITATIVE_COLORMAPS: Record<string, RgbColor[]> = {
  default: PALETTE as RgbColor[], // Existing default
  tolBright: TOL_BRIGHT,
  tolHighContrast: TOL_HIGH_CONTRAST,
  tolVibrant: TOL_VIBRANT,
  tolMuted: TOL_MUTED,
  tolMediumContrast: TOL_MEDIUM_CONTRAST,
  tolLight: TOL_LIGHT,
  tab10: MPL_TAB10,
  set1: MPL_SET1,
  set2: MPL_SET2,
  set3: MPL_SET3,
  dark2: MPL_DARK2,
  accent: MPL_ACCENT,
  pastel1: MPL_PASTEL1,
  pastel2: MPL_PASTEL2,
};

/**
 * Get the color for a given tree-node index from a named qualitative colormap,
 * wrapping around if the index exceeds the colormap's length.
 */
export function getQualitativeColor(colormapName: string, index: number): RgbColor {
  const colors = QUALITATIVE_COLORMAPS[colormapName] || QUALITATIVE_COLORMAPS.default;
  return colors[index % colors.length];
}
