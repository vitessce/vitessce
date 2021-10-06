import { getChannelStats } from '@hms-dbmi/viv';
import { Matrix4 } from 'math.gl';

async function getSingleSelectionStats2D({ loader, selection }) {
  const data = Array.isArray(loader) ? loader[loader.length - 1] : loader;
  const raster = await data.getRaster({ selection });
  const selectionStats = getChannelStats(raster.data);
  const { domain, contrastLimits: slider } = selectionStats;
  return { domain, slider };
}

async function getSingleSelectionStats3D({ loader, selection }) {
  const lowResSource = loader[loader.length - 1];
  const { shape, labels } = lowResSource;
  // eslint-disable-next-line no-bitwise
  const sizeZ = shape[labels.indexOf('z')] >> (loader.length - 1);
  const raster0 = await lowResSource.getRaster({
    selection: { ...selection, z: 0 },
  });
  const rasterMid = await lowResSource.getRaster({
    selection: { ...selection, z: Math.floor(sizeZ / 2) },
  });
  const rasterTop = await lowResSource.getRaster({
    selection: { ...selection, z: Math.max(0, sizeZ - 1) },
  });
  const stats0 = getChannelStats(raster0.data);
  const statsMid = getChannelStats(rasterMid.data);
  const statsTop = getChannelStats(rasterTop.data);
  return {
    domain: [
      Math.min(stats0.domain[0], statsMid.domain[0], statsTop.domain[0]),
      Math.max(stats0.domain[1], statsMid.domain[1], statsTop.domain[1]),
    ],
    slider: [
      Math.min(
        stats0.contrastLimits[0],
        statsMid.contrastLimits[0],
        statsTop.contrastLimits[0],
      ),
      Math.max(
        stats0.contrastLimits[1],
        statsMid.contrastLimits[1],
        statsTop.contrastLimits[1],
      ),
    ],
  };
}

/**
 * Get bounding cube for a given loader i.e [[0, width], [0, height], [0, depth]]
 * @param {Object} loader PixelSource|PixelSource[]
 * @param {[]} selection Selection for stats.
 * @param {boolean} use3d Whether or not to get 3d stats.
 * @returns {Object} { domains, sliders }
 */
export const getSingleSelectionStats = async ({ loader, selection, use3d }) => {
  const getStats = use3d
    ? getSingleSelectionStats3D
    : getSingleSelectionStats2D;
  return getStats({ loader, selection });
};

export const getMultiSelectionStats = async ({ loader, selections, use3d }) => {
  const stats = await Promise.all(
    selections.map(selection => getSingleSelectionStats({ loader, selection, use3d })),
  );
  const domains = stats.map(stat => stat.domain);
  const sliders = stats.map(stat => stat.slider);
  return { domains, sliders };
};

/**
 * Get physical size scaling Matrix4
 * @param {Object} loader PixelSource
 * @returns {Object} matrix
 */
export function getPhysicalSizeScalingMatrix(loader) {
  const { x, y, z } = loader?.meta?.physicalSizes ?? {};
  if (x?.size && y?.size && z?.size) {
    const min = Math.min(z.size, x.size, y.size);
    const ratio = [x.size / min, y.size / min, z.size / min];
    return new Matrix4().scale(ratio);
  }
  return new Matrix4().identity();
}

/**
 * Get bounding cube for a given loader
 * @param {Object} loader PixelSource|PixelSource[]
 * @returns {Array} [0, width], [0, height], [0, depth]]
 */
export function getBoundingCube(loader) {
  const source = Array.isArray(loader) ? loader[0] : loader;
  const { shape, labels } = source;
  const physicalSizeScalingMatrix = getPhysicalSizeScalingMatrix(source);
  const xSlice = [0, physicalSizeScalingMatrix[0] * shape[labels.indexOf('x')]];
  const ySlice = [0, physicalSizeScalingMatrix[5] * shape[labels.indexOf('y')]];
  const zSlice = [
    0,
    physicalSizeScalingMatrix[10] * shape[labels.indexOf('z')],
  ];
  return [xSlice, ySlice, zSlice];
}

export function abbreviateNumber(value) {
  // Return an abbreviated representation of value, in 5 characters or less.

  const maxLength = 5;
  let maxNaiveDigits = maxLength;

  /* eslint-disable no-plusplus */
  if (!Number.isInteger(value)) {
    --maxNaiveDigits;
  } // Wasted on "."
  if (value < 1) {
    --maxNaiveDigits;
  } // Wasted on "0."
  /* eslint-disable no-plusplus */

  const naive = Intl.NumberFormat('en-US', {
    maximumSignificantDigits: maxNaiveDigits,
    useGrouping: false,
  }).format(value);
  if (naive.length <= maxLength) return naive;

  // "e+9" consumes 3 characters, so if we even had two significant digits,
  // it would take take us to six characters, including the decimal point.
  return value.toExponential(0);
}
