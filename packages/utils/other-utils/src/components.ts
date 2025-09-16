import { log } from '@vitessce/globals';

// Originally in src/components/utils.js
export const DEFAULT_DARK_COLOR = [50, 50, 50];
export const DEFAULT_LIGHT_COLOR = [200, 200, 200];
export const DEFAULT_LIGHT2_COLOR = [235, 235, 235];

export function getDefaultColor(theme: 'dark' | 'light' | 'light2') {
  // eslint-disable-next-line no-nested-ternary
  return theme === 'dark'
    ? DEFAULT_DARK_COLOR
    : (theme === 'light' ? DEFAULT_LIGHT_COLOR : DEFAULT_LIGHT2_COLOR);
}

export function getDefaultForegroundColor(theme: 'dark' | 'light' | 'light2') {
  return theme === 'dark'
    ? DEFAULT_LIGHT2_COLOR
    : DEFAULT_DARK_COLOR;
}

// From https://personal.sron.nl/~pault/#sec:qualitative
export const PALETTE = [
  [68, 119, 170],
  [136, 204, 238],
  [68, 170, 153],
  [17, 119, 51],
  [153, 153, 51],
  [221, 204, 119],
  [204, 102, 119],
  [136, 34, 85],
  [170, 68, 153],
];

export const VIEWER_PALETTE = [
  [0, 0, 255],
  [0, 255, 0],
  [255, 0, 255],
  [255, 255, 0],
  [0, 255, 255],
  [255, 255, 255],
  [255, 128, 0],
  [255, 0, 0],
];

export const PATHOLOGY_PALETTE = [
  [0, 0, 0],
  [228, 158, 37],
  [91, 181, 231],
  [22, 157, 116],
  [239, 226, 82],
  [16, 115, 176],
  [211, 94, 26],
  [202, 122, 166],
];

export const LARGE_PATHOLOGY_PALETTE = [
  [0, 0, 0],
  [0, 73, 73],
  [0, 146, 146],
  [255, 109, 182],
  [255, 182, 219],
  [73, 0, 146],
  [0, 109, 219],
  [182, 109, 255],
  [109, 182, 255],
  [182, 219, 255],
  [146, 0, 0],
  [146, 72, 0],
  [219, 109, 0],
  [36, 255, 36],
  [255, 255, 109],
  [255, 255, 255],
];

export const COLORMAP_OPTIONS = [
  'viridis',
  'greys',
  'magma',
  'jet',
  'hot',
  'bone',
  'copper',
  'summer',
  'density',
  'inferno',
];

export const DEFAULT_GL_OPTIONS = { webgl2: true };

export function createDefaultUpdateStatus(componentName: string) {
  return (message: string) => log.warn(`${componentName} updateStatus: ${message}`);
}

export function createDefaultUpdateCellsSelection(componentName: string) {
  return (cellsSelection: any) => log.warn(`${componentName} updateCellsSelection: ${cellsSelection}`);
}

export function createDefaultUpdateCellsHover(componentName: string) {
  return (hoverInfo: { cellId: string }) => log.warn(`${componentName} updateCellsHover: ${hoverInfo.cellId}`);
}

export function createDefaultUpdateGenesHover(componentName: string) {
  return (hoverInfo: { geneId: string }) => log.warn(`${componentName} updateGenesHover: ${hoverInfo.geneId}`);
}

export function createDefaultUpdateTracksHover(componentName: string) {
  return (hoverInfo: any) => log.warn(`${componentName} updateTracksHover: ${hoverInfo}`);
}

export function createDefaultUpdateViewInfo(componentName: string) {
  return (viewInfo: any) => log.warn(`${componentName} updateViewInfo: ${viewInfo}`);
}

export function createDefaultClearPleaseWait() {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return () => {};
}


/**
 * Copy a typed array into a new array buffer.
 * @param {Uint8Array} arr The typed array to be copied.
 * @returns {Uint8Array} The copied array.
 */
export function copyUint8Array(arr: Uint8Array) {
  const newBuffer = new ArrayBuffer(arr.buffer.byteLength);
  const newArr = new Uint8Array(newBuffer);
  newArr.set(arr);
  return newArr;
}

export function asEsModule(component: any) {
  return {
    __esModule: true,
    default: component,
  };
}


export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // eslint-disable-next-line no-restricted-properties
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
