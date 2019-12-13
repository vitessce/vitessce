/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */

import IdentityCoordinatesTile from './IdentityCoordinatesTile';
import { getTileIndices } from './viewport-util';
/**
 * Manages loading and purging of tiles data. This class caches recently visited tiles
 * and only create new tiles if they are present.
 */

export default class TileCache {
  /**
   * Takes in a function that returns tile data, a cache size, and a max and a min zoom level.
   * Cache size defaults to 5 * number of tiles in the current viewport
   */
  constructor({
    getTileData, maxSize, maxZoom, minZoom,
    maxHeight, maxWidth, tileSize, onTileLoad, onTileError,
  }) {
    // TODO: Instead of hardcode size, we should calculate how much memory left
    this._getTileData = getTileData;
    this._maxSize = maxSize;
    this.onTileError = onTileError;
    this.onTileLoad = onTileLoad;
    this.maxHeight = maxHeight;
    this.maxWidth = maxWidth;
    this.tileSize = tileSize;

    // Maps tile id in string {z}-{x}-{y} to a Tile object
    this._cache = new Map();
    this._tiles = [];

    if (Number.isFinite(maxZoom)) {
      this._maxZoom = Math.floor(maxZoom);
    }
    if (Number.isFinite(minZoom)) {
      this._minZoom = Math.ceil(minZoom);
    }
  }

  get tiles() {
    return this._tiles;
  }

  /**
   * Clear the current cache
   */
  finalize() {
    this._cache.clear();
  }

  /**
   * Update the cache with the given viewport and triggers callback onUpdate.
   * @param {*} viewport
   * @param {*} onUpdate
   */
  update(viewport) {
    const {
      _cache, _getTileData, _maxSize, _maxZoom, _minZoom,
    } = this;

    this._markOldTiles();
    let tileIndices = getTileIndices(viewport, _maxZoom, _minZoom, this.tileSize);
    if (tileIndices.length > 0) {
      const { maxY, maxX } = this._getMaxMinIndicies(tileIndices);
      if (tileIndices[0].z !== _minZoom) {
        tileIndices.push(...this._expandIndices(tileIndices).filter(e => (
          (e.z > _minZoom && e.y >= 0 && e.x >= 0) || (e.z <= _minZoom && e.x === 0 && e.y === 0)
        )));
      }
      tileIndices = tileIndices.filter(e => (e.x <= maxX && e.y <= maxY));
      if (!tileIndices || tileIndices.length === 0) {
        return;
      }
      _cache.forEach((cachedTile) => {
        if (tileIndices.some(tile => cachedTile.isOverlapped(tile))) {
          cachedTile.isVisible = true;
        }
      });
      let changed = false;

      Object.values(tileIndices).forEach((tileIndex) => {
        const { x, y, z } = tileIndex;
        let tile = this._getTile(x, y, z);
        if (!tile) {
          tile = new IdentityCoordinatesTile({
            getTileData: _getTileData,
            x,
            y,
            z,
            ...this,
          });
          tile.isVisible = true;
          changed = true;
        }
        const tileId = this._getTileId(x, y, z);
        _cache.set(tileId, tile);
      });

      if (changed) {
        // cache size is either the user defined maxSize or
        // 5 * number of current tiles in the viewport.
        const commonZoomRange = 5;
        this._resizeCache(_maxSize || commonZoomRange * tileIndices.length);
        this._tiles = Array.from(this._cache.values())
          // sort by zoom level so parents tiles don't show up when children tiles are rendered
          .sort((t1, t2) => t1.z - t2.z);
      }
    }
  }

  /**
   * Clear tiles that are not visible when the cache is full
   */
  _resizeCache(maxSize) {
    const { _cache } = this;
    if (_cache.size > maxSize) {
      const iterator = _cache[Symbol.iterator]();
      for (const cachedTile of iterator) { // eslint-disable-line no-restricted-syntax
        if (_cache.size <= maxSize) {
          break;
        }
        const tileId = cachedTile[0];
        const tile = cachedTile[1];
        if (!tile.isVisible) {
          _cache.delete(tileId);
        }
      }
    }
  }

  _markOldTiles() {
    this._cache.forEach((cachedTile) => {
      cachedTile.isVisible = false; // eslint-disable-line no-param-reassign
    });
  }

  _getTile(x, y, z) {
    const tileId = this._getTileId(x, y, z);
    return this._cache.get(tileId);
  }

  _getTileId(x, y, z) {
    return `${z}-${x}-${y}`;
  }
  
  _expandIndices(minX, minY, maxY, maxX, z) {
    const extraIndices = [];
    for (let i = minX; i <= maxX; i += 1) {
      extraIndices.push({ x: i, y: minY - 1, z });
      extraIndices.push({ x: i, y: maxY + 1, z });
      extraIndices.push({ x: i, y: minY, z });
      extraIndices.push({ x: i, y: maxY, z });
    }
    for (let i = minY; i <= maxY; i += 1) {
      extraIndices.push({ x: minX - 1, y: i, z });
      extraIndices.push({ x: maxX + 1, y: i, z });
      extraIndices.push({ x: minX, y: i, z });
      extraIndices.push({ x: maxX, y: i, z });
    }
    extraIndices.push({ x: minX - 1, y: minY - 1, z });
    extraIndices.push({ x: maxX + 1, y: minY - 1, z });
    extraIndices.push({ x: minX - 1, y: maxY + 1, z });
    extraIndices.push({ x: maxX + 1, y: maxY + 1, z });
    return extraIndices;
  }

  _cacheLayersUp(tileIndices, minZoom) {
    const extraIndices = [];
    let zoom = tileIndices[0].z;
    const [xIndices, yIndices] = [[], []];
    tileIndices.forEach(e => xIndices.push(e.x));
    tileIndices.forEach(e => yIndices.push(e.y));
    const {
      minX, minY, maxY, maxX,
    } = this._getMaxMinIndicies(tileIndices);
    const x = Math.floor((minX + maxX) / 2);
    const y = Math.floor((minY + maxY) / 2);
    while (zoom > minZoom) {
      zoom -= 1;
      const index = {
        x: Math.floor(x / (2 ** (-1 * zoom))),
        y: Math.floor(y / (2 ** (-1 * zoom))),
        z: zoom,
      };
      extraIndices.push(...this._expandIndices([index]));
      extraIndices.push(index);
    }
    return extraIndices;
  }

  _getMaxMinIndicies(tileIndices) {
    const scale = this.tileSize * (2 ** (-1 * tileIndices[0].z));
    const maxX = Math.min(
      Math.max(...tileIndices.map(tile => tile.x)), Math.floor(MAX_WIDTH / scale),
    );
    const maxY = Math.min(
      Math.max(...tileIndices.map(tile => tile.y)), Math.floor(MAX_HEIGHT / scale),
    );
    const minX = Math.min(...tileIndices.map(tile => tile.x));
    const minY = Math.min(...tileIndices.map(tile => tile.y));
    return {
      minX, minY, maxY, maxX,
    };
  }
}
