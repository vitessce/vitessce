// OME-TIFF support for the brick reader in volume-zarr.js. A TIFF pyramid level
// is read through viv's TiffPixelSource, one tile of one plane at a time.

// Selection of the first plane, for reading a level's TIFF directory.
function firstPlane(labels) {
  return Object.fromEntries(labels
    .filter(axis => axis !== 'y' && axis !== 'x')
    .map(axis => [axis, 0]));
}

/**
 * Array-like descriptors of OME-TIFF pyramid levels: { shape, chunks, dtype },
 * with the TIFF tile as the chunk, so that planVolumeLevels and
 * decodedBytesPerBrick treat tiles like Zarr chunks. The tile size comes from
 * each level's own TIFF directory: viv's tileSize is level 0's for every level,
 * but pyramid writers often shrink tiles at coarse levels (e.g. 1024, 928, 464).
 * @param {object[]} pixelSources viv TiffPixelSource per resolution level.
 * @returns {Promise<object[]>} One descriptor per level; pixelSource is kept for reading.
 */
export async function getTiffLevelArrays(pixelSources) {
  return Promise.all(pixelSources.map(async (pixelSource) => {
    const { shape, labels } = pixelSource;
    if (labels.length !== shape.length || labels.at(-2) !== 'y' || labels.at(-1) !== 'x') {
      throw new Error('Interleaved (RGB) OME-TIFF images are not supported in the 3D view');
    }
    // eslint-disable-next-line no-underscore-dangle
    const image = await pixelSource._indexer(firstPlane(labels));
    // Tiled images give the tile size, stripped ones the image width and RowsPerStrip.
    const tileShape = { y: image.getTileHeight(), x: image.getTileWidth() };
    return {
      shape,
      chunks: labels.map(axis => tileShape[axis] ?? 1),
      dtype: pixelSource.dtype,
      pixelSource,
    };
  }));
}

/**
 * Sample value range of an OME-TIFF, if its writer recorded one: the TIFF
 * SMinSampleValue / SMaxSampleValue tags, or the same keys in the OME-XML
 * original metadata (kept by Bio-Formats conversions). Neither is part of the
 * OME-XML model, and viv's parser drops annotations, so this reads the first IFD.
 * @param {object} pixelSource viv TiffPixelSource of level 0.
 * @returns {Promise<[number, number]|null>} [min, max], or null if not recorded.
 */
export async function getTiffSampleRange(pixelSource) {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const image = await pixelSource._indexer(firstPlane(pixelSource.labels));
    const directory = image?.fileDirectory ?? {};
    // Tags hold one value per sample; take the overall range.
    const fromTag = (value, reduce) => (value === undefined || typeof value === 'number'
      ? value : reduce(...Array.from(value)));
    let min = fromTag(directory.SMinSampleValue, Math.min);
    let max = fromTag(directory.SMaxSampleValue, Math.max);
    if (!(Number.isFinite(min) && Number.isFinite(max))
      && typeof directory.ImageDescription === 'string') {
      const fromXml = key => Number(directory.ImageDescription
        .match(new RegExp(`<Key>${key}</Key>\\s*<Value>([^<]*)</Value>`))?.[1]);
      min = fromXml('SMinSampleValue');
      max = fromXml('SMaxSampleValue');
    }
    return Number.isFinite(min) && Number.isFinite(max) && max > min ? [min, max] : null;
  } catch (error) {
    return null; // The range is optional metadata.
  }
}

/**
 * Region reader for OME-TIFF levels from getTiffLevelArrays, with the same
 * contract as createZarrRegionReader. Windows follow each level's own tile
 * grid (its chunks), so each window decodes exactly one TIFF tile. Decoded
 * tiles go through the shared chunk cache, since one tile serves many
 * neighboring bricks.
 */
export function createTiffRegionReader({ arrays, labels, cache }) {
  const planeLabels = labels.filter(axis => axis !== 'y' && axis !== 'x');
  const yIndex = labels.indexOf('y');
  const xIndex = labels.indexOf('x');
  // The tiles a region covers, each with its cache key.
  function regionTiles(source, {
    t, c, z: [z0, z1], y: [y0, y1], x: [x0, x1],
  }) {
    const { chunks } = arrays[source];
    const tileHeight = chunks[yIndex];
    const tileWidth = chunks[xIndex];
    const tiles = [];
    for (let z = z0; z < z1; z++) {
      for (let ty = Math.floor(y0 / tileHeight); ty * tileHeight < y1; ty++) {
        for (let tx = Math.floor(x0 / tileWidth); tx * tileWidth < x1; tx++) {
          const tileY = ty * tileHeight;
          const tileX = tx * tileWidth;
          tiles.push({
            z, tileY, tileX, key: `${source}:${t}:${c}:${z}:${tileY}:${tileX}`,
          });
        }
      }
    }
    return tiles;
  }
  async function readRegion(source, region) {
    const {
      t, c, z: [z0, z1], y: [y0, y1], x: [x0, x1],
    } = region;
    const { pixelSource, shape, chunks } = arrays[source];
    const tileHeight = chunks[yIndex];
    const tileWidth = chunks[xIndex];
    const height = y1 - y0;
    const width = x1 - x0;
    const tiles = regionTiles(source, region);
    const loaded = await Promise.all(tiles.map(({ z, tileY, tileX, key }) => cache.load(
      key,
      async () => {
        const selection = Object.fromEntries(planeLabels.map(
          axis => [axis, { t, c, z }[axis] ?? 0],
        ));
        // eslint-disable-next-line no-underscore-dangle
        const image = await pixelSource._indexer(selection);
        // Edge tiles are clipped to the image.
        const tileEndY = Math.min(tileY + tileHeight, shape[yIndex]);
        const tileEndX = Math.min(tileX + tileWidth, shape[xIndex]);
        // eslint-disable-next-line no-underscore-dangle
        return pixelSource._readRasters(image, {
          window: [tileX, tileY, tileEndX, tileEndY],
          width: tileEndX - tileX,
          height: tileEndY - tileY,
        });
      },
    )));
    const data = new loaded[0].data.constructor((z1 - z0) * height * width);
    loaded.forEach((tile, i) => {
      const { z, tileY, tileX } = tiles[i];
      const rowStart = Math.max(y0, tileY);
      const rowEnd = Math.min(y1, tileY + tile.height);
      const columnStart = Math.max(x0, tileX);
      const columnEnd = Math.min(x1, tileX + tile.width);
      for (let row = rowStart; row < rowEnd; row++) {
        const from = (row - tileY) * tile.width + (columnStart - tileX);
        data.set(
          tile.data.subarray(from, from + columnEnd - columnStart),
          ((z - z0) * height + (row - y0)) * width + (columnStart - x0),
        );
      }
    });
    return { data, stride: [height * width, width, 1] };
  }
  readRegion.chunkKeys = (source, region) => regionTiles(source, region).map(({ key }) => key);
  return readRegion;
}
