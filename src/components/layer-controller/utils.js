import { getChannelStats } from '@hms-dbmi/viv';
import { Matrix4 } from 'math.gl';

export async function getSingleSelectionStats2D({ loader, selection }) {
  const data = Array.isArray(loader) ? loader[loader.length - 1] : loader;
  const raster = await data.getRaster({ selection });
  const selectionStats = getChannelStats(raster.data);
  const { domain, autoSliders: slider } = selectionStats;
  return { domain, slider };
}

export async function getSingleSelectionStats3D({ loader, selection }) {
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
    selection: { ...selection, z: sizeZ - 1 },
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
        stats0.autoSliders[0],
        statsMid.autoSliders[0],
        statsTop.autoSliders[0],
      ),
      Math.max(
        stats0.autoSliders[1],
        statsMid.autoSliders[1],
        statsTop.autoSliders[1],
      ),
    ],
  };
}

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
