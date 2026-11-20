// OME-TIFF support for the brick reader in volume-zarr.js. A TIFF pyramid level
// is read through viv's TiffPixelSource, one tile of one plane at a time.
// Level descriptors (with each level's own tile as its chunk) come from
// ImageWrapper.getResolutionLevels.

/**
 * Region reader for OME-TIFF levels ({ shape, chunks, data }), whose data is a
 * viv TiffPixelSource, with the same
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
  async function readRegion(source, region, { signal } = {}) {
    const {
      t, c, z: [z0, z1], y: [y0, y1], x: [x0, x1],
    } = region;
    const { data: pixelSource, shape, chunks } = arrays[source];
    const tileHeight = chunks[yIndex];
    const tileWidth = chunks[xIndex];
    const height = y1 - y0;
    const width = x1 - x0;
    const tiles = regionTiles(source, region);
    const loaded = await Promise.all(tiles.map(({ z, tileY, tileX, key }) => cache.load(
      key,
      async (sharedSignal) => {
        const selection = Object.fromEntries(planeLabels.map(
          axis => [axis, { t, c, z }[axis] ?? 0],
        ));
        // eslint-disable-next-line no-underscore-dangle
        const image = await pixelSource._indexer(selection);
        sharedSignal?.throwIfAborted();
        // Edge tiles are clipped to the image.
        const tileEndY = Math.min(tileY + tileHeight, shape[yIndex]);
        const tileEndX = Math.min(tileX + tileWidth, shape[xIndex]);
        // geotiff aborts the tile's byte-range requests with the signal.
        // viv then throws its SIGNAL_ABORTED string, not an Error.
        // eslint-disable-next-line no-underscore-dangle
        return pixelSource._readRasters(image, {
          window: [tileX, tileY, tileEndX, tileEndY],
          width: tileEndX - tileX,
          height: tileEndY - tileY,
          signal: sharedSignal,
        });
      },
      { signal },
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
