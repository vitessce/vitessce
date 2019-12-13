/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

function tile2boundingBox(x, y, z, maxHeight, maxWidth, tileSize) {
  return {
    west: (x * tileSize) * (2 ** (-1 * z)),
    north: (y * tileSize) * (2 ** (-1 * z)),
    east: Math.min(maxWidth, ((x + 1) * tileSize) * (2 ** (-1 * z))),
    south: Math.min(maxHeight, ((y + 1) * tileSize) * (2 ** (-1 * z))),
  };
}

export default class IdentityCoordinatesTile {
  constructor({
    getTileData, x, y, z, onTileLoad, onTileError, maxHeight, maxWidth, tileSize,
  }) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.bbox = tile2boundingBox(x, y, z, maxHeight, maxWidth, tileSize);
    this.isVisible = true;
    this.getTileData = getTileData;
    this._data = null;
    this._isLoaded = false;
    this._loader = this._loadData();
    this.onTileLoad = onTileLoad;
    this.onTileError = onTileError;
  }

  get data() {
    return this._data || this._loader;
  }

  get isLoaded() {
    return this._isLoaded;
  }

  _loadData() {
    const {
      x, y, z, bbox,
    } = this;
    if (!this.getTileData) {
      return null;
    }

    return this.getTileData({ x, y, z })
      .then((buffers) => {
        this._data = buffers;
        this._isLoaded = true;
        this.onTileLoad(this);
        return buffers;
      })
      .catch((err) => {
        this._isLoaded = true;
        this.onTileError(err);
      });
  }

  isOverlapped(tile) {
    const { x, y, z } = this;
    const m = 2 ** (tile.z - z);
    return Math.floor(tile.x / m) === x && Math.floor(tile.y / m) === y;
  }
}
IdentityCoordinatesTile.layerName = 'IdentityCoordinatesTile';
