// Originally in src/components/utils.js
export const DEFAULT_DARK_COLOR = [50, 50, 50];
export const DEFAULT_LIGHT_COLOR = [200, 200, 200];

export function getDefaultColor(theme) {
  return theme === 'dark' ? DEFAULT_DARK_COLOR : DEFAULT_LIGHT_COLOR;
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

export function createDefaultUpdateStatus(componentName) {
  return message => console.warn(`${componentName} updateStatus: ${message}`);
}

export function createDefaultUpdateCellsSelection(componentName) {
  return cellsSelection => console.warn(`${componentName} updateCellsSelection: ${cellsSelection}`);
}

export function createDefaultUpdateCellsHover(componentName) {
  return hoverInfo => console.warn(`${componentName} updateCellsHover: ${hoverInfo.cellId}`);
}

export function createDefaultUpdateGenesHover(componentName) {
  return hoverInfo => console.warn(`${componentName} updateGenesHover: ${hoverInfo.geneId}`);
}

export function createDefaultUpdateTracksHover(componentName) {
  return hoverInfo => console.warn(`${componentName} updateTracksHover: ${hoverInfo}`);
}

export function createDefaultUpdateViewInfo(componentName) {
  return viewInfo => console.warn(`${componentName} updateViewInfo: ${viewInfo}`);
}

export function createDefaultClearPleaseWait() {
  return () => {};
}


/**
 * Copy a typed array into a new array buffer.
 * @param {Uint8Array} arr The typed array to be copied.
 * @returns {Uint8Array} The copied array.
 */
export function copyUint8Array(arr) {
  const newBuffer = new ArrayBuffer(arr.buffer.byteLength);
  const newArr = new Uint8Array(newBuffer);
  newArr.set(arr);
  return newArr;
}

export function asEsModule(component) {
  return {
    __esModule: true,
    default: component,
  };
}


export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // eslint-disable-next-line no-restricted-properties
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const getStatsForResolution = (loader, resolution) => {
  const { shape, labels } = loader[resolution];
  const height = shape[labels.indexOf('y')];
  const width = shape[labels.indexOf('x')];
  const depth = shape[labels.indexOf('z')];
  // eslint-disable-next-line no-bitwise
  const depthDownsampled = Math.max(1, depth >> resolution);
  // Check memory allocation limits for Float32Array (used in XR3DLayer for rendering)
  const totalBytes = 4 * height * width * depthDownsampled;
  return {
    height, width, depthDownsampled, totalBytes,
  };
};

export const canLoadResolution = (loader, resolution) => {
  const {
    totalBytes, height, width, depthDownsampled,
  } = getStatsForResolution(
    loader,
    resolution,
  );
  const maxHeapSize = window.performance?.memory
    && window.performance?.memory?.jsHeapSizeLimit / 2;
  const maxSize = maxHeapSize || (2 ** 31) - 1;
  // 2048 is a normal texture size limit although some browsers go larger.
  return (
    totalBytes < maxSize
    && height <= 2048
    && depthDownsampled <= 2048
    && width <= 2048
    && depthDownsampled > 1
  );
};
