const TILE_SIZE = 256;

function getBoundingBox(viewport) {
  const corners = [
    ...viewport.unproject([0, 0]),
    ...viewport.unproject([viewport.width, viewport.height])
  ];
  return corners
}

function pixelsToTileIndex(a) {
  return a[0] / (TILE_SIZE * Math.pow(2, -1 * a[1]));
}

/**
 * Returns all tile indices in the current viewport. If the current zoom level is smaller
 * than minZoom, return an empty array. If the current zoom level is greater than maxZoom,
 * return tiles that are on maxZoom.
 */
export function getTileIndices(viewport, maxZoom, minZoom) {
  const z = Math.min(0, Math.ceil(viewport.zoom));
  if(z <= minZoom) {
    return [{x:0, y:0, z:minZoom}]
  }
  const bbox = getBoundingBox(viewport);
  let [minX, minY] = [[bbox[0], z], [bbox[1], z]].map(pixelsToTileIndex);
  let [maxX, maxY] = [[bbox[2], z], [bbox[3], z]].map(pixelsToTileIndex);
  /*
      |  TILE  |  TILE  |  TILE  |
        |(minPixel)           |(maxPixel)
      |(minIndex)                |(maxIndex)
   */
  minX = Math.max(0, Math.floor(minX));
  maxX = Math.max(0, Math.ceil(maxX));
  minY = Math.max(0, Math.floor(minY));
  maxY = Math.max(0, Math.ceil(maxY));
  const indices = [];
  for (let x = minX; x < maxX; x++) {
    for (let y = minY; y < maxY; y++) {
      indices.push({x, y, z});
    }
  }
  return indices;
}
