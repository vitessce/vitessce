import {lngLatToWorld} from 'viewport-mercator-project';

const TILE_SIZE = 512;

function getBoundingBox(viewport, isGeographic) {
  const corners = [
    viewport.unproject([0, 0]),
    viewport.unproject([viewport.width, 0]),
    viewport.unproject([0, viewport.height]),
    viewport.unproject([viewport.width, viewport.height])
  ];

  return isGeographic ? [
    corners.reduce((minLng, p) => (minLng < p[0] ? minLng : p[0]), 180),
    corners.reduce((minLat, p) => (minLat < p[1] ? minLat : p[1]), 90),
    corners.reduce((maxLng, p) => (maxLng > p[0] ? maxLng : p[0]), -180),
    corners.reduce((maxLat, p) => (maxLat > p[1] ? maxLat : p[1]), -90)
  ] : [
    Math.min(...(corners.map(p => p[0]))),
    Math.min(...(corners.map(p => p[1]))),
    Math.max(...(corners.map(p => p[0]))),
    Math.max(...(corners.map(p => p[1]))),
  ];
}

function pixelsToTileIndex(a) {
  return Math.floor(a / TILE_SIZE);
}

/**
 * Returns all tile indices in the current viewport. If the current zoom level is smaller
 * than minZoom, return an empty array. If the current zoom level is greater than maxZoom,
 * return tiles that are on maxZoom.
 */
export function getTileIndices(viewport, maxZoom, minZoom, maxIdentityCoordinate) {
  const z = Math.floor(viewport.zoom);
  if (minZoom && z < minZoom) {
    return [];
  }

  viewport = new viewport.constructor(
    Object.assign({}, viewport, {
      zoom: z
    })
  );

  const bbox = getBoundingBox(viewport, !maxIdentityCoordinate);

  const [minX, minY] = maxIdentityCoordinate ?
    [bbox[0], bbox[1]]
    : lngLatToWorld([bbox[0], bbox[3]], viewport.scale).map(pixelsToTileIndex);
  const [maxX, maxY] = maxIdentityCoordinate ?
    [bbox[2], bbox[3]]
    : lngLatToWorld([bbox[2], bbox[1]], viewport.scale).map(pixelsToTileIndex);

  const indices = [];

  // console.log('minX, minY, maxX, maxY', minX, minY, maxX, maxY);

  const tilesZ = z + 8; // TODO: pass as config?
  const tilesSize = maxIdentityCoordinate / 2 ** tilesZ;
  const tilesMinX = Math.floor(minX / tilesSize);
  const tilesMinY = Math.floor(minY / tilesSize);
  const tilesMaxX = Math.ceil(maxX / tilesSize);
  const tilesMaxY = Math.ceil(maxY / tilesSize);

  // console.log('tilesMinX, tilesMinY, tilesMaxX, tilesMaxY', tilesMinX, tilesMinY, tilesMaxX, tilesMaxY);

  for (let x = tilesMinX; x <= tilesMaxX; x++) {
    for (let y = tilesMinY; y <= tilesMaxY; y++) {
      // if (maxZoom && z > maxZoom) {
      //   indices.push(getAdjustedTileIndex({x, y, z}, maxZoom));
      // } else {
      indices.push({x, y, z: tilesZ});
    }
  }

  // console.log('indices', indices);

  // TODO: Reenable, when identity coordinate is sorted out.
  // for (let x = minX; x <= maxX; x++) {
  //   for (let y = minY; y <= maxY; y++) {
  //     if (maxZoom && z > maxZoom) {
  //       indices.push(getAdjustedTileIndex({x, y, z}, maxZoom));
  //     } else {
  //       indices.push({x, y, z});
  //     }
  //   }
  // }
  return indices;
}

/**
 * Calculates and returns a new tile index {x, y, z}, with z being the given adjustedZ.
 */
function getAdjustedTileIndex({x, y, z}, adjustedZ) {
  const m = Math.pow(2, z - adjustedZ);
  return {
    x: Math.floor(x / m),
    y: Math.floor(y / m),
    z: adjustedZ
  };
}
