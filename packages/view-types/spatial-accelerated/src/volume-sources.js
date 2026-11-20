// The source resolution levels of an image, and the region reader for its format.
import { createZarrRegionReader } from './volume-zarr.js';
import { createTiffRegionReader } from './volume-tiff.js';

const REGION_READERS = {
  'ome-zarr': createZarrRegionReader,
  'ome-tiff': createTiffRegionReader,
};

/**
 * @param {object} imageWrapper ImageWrapper of an OME-Zarr or OME-TIFF image.
 * @returns {Promise<{ labels: string[], dtype: string, arrays: object[],
 *   createRegionReader: function }>} arrays are the source levels from
 * ImageWrapper.getResolutionLevels ({ shape, chunks, scale?, data }), finest
 * first; dtype is viv's, e.g. Uint16.
 */
export async function getVolumeSources(imageWrapper) {
  const createRegionReader = REGION_READERS[imageWrapper?.getType()];
  if (!createRegionReader) {
    throw new Error('Invalid imageWrapper or not an OME-Zarr or OME-TIFF image');
  }
  if (imageWrapper.isInterleaved()) {
    throw new Error('Interleaved (RGB) images are not supported in the 3D view');
  }
  const arrays = await imageWrapper.getResolutionLevels();
  const { labels, dtype } = arrays[0];
  return {
    labels, dtype, arrays, createRegionReader,
  };
}
