import IdentityCoordinatesTile from './IdentityCoordinatesTile';
import {getTileIndices} from './viewport-util';
/**
 * Manages loading and purging of tiles data. This class caches recently visited tiles
 * and only create new tiles if they are present.
 */
var MAX_WIDTH = 31728;
var MAX_HEIGHT = 51669;

export default class TileCache {
  /**
   * Takes in a function that returns tile data, a cache size, and a max and a min zoom level.
   * Cache size defaults to 5 * number of tiles in the current viewport
   */
  constructor({getTileData, maxSize, maxZoom, minZoom, maxHeight, maxWidth, onTileLoad, onTileError}) {
    // TODO: Instead of hardcode size, we should calculate how much memory left
    this._getTileData = getTileData;
    this._maxSize = maxSize;
    this.onTileError = onTileError;
    this.onTileLoad = onTileLoad;
    this.maxHeight = maxHeight
    this.maxWidth = maxWidth

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
    const {_cache, _getTileData, _maxSize, _maxZoom, _minZoom} = this;
    this._markOldTiles();
    var tileIndices = getTileIndices(viewport, _maxZoom, _minZoom).filter(
      (e) =>{
        (e.z > _minZoom && e.y >= 0 && e.x >= 0) ||
        (e.z <= _minZoom && e.x == 0 && e.y == 0)
      }
    );
    if(tileIndices.length > 0) {
      if(tileIndices[0].z != _minZoom) {
        tileIndices.push(...this._expandIndices(tileIndices))
      }
      const  {maxY, maxX} = this._getMaxMinIndicies(tileIndices)
      tileIndices = tileIndices.filter((e) => (e.x <= maxX && e.y <= maxY))
      if (!tileIndices || tileIndices.length === 0) {
        return;
      }
      _cache.forEach(cachedTile => {
        if (tileIndices.some(tile => cachedTile.isOverlapped(tile))) {
          cachedTile.isVisible = true;
        }
      });
      let changed = false;

      Object.values(tileIndices).forEach((tileIndex) => {
        const {x, y, z} = tileIndex;
        let tile = this._getTile(x, y, z);
        if (!tile) {
          tile = new Tile({
            getTileData: _getTileData,
            x,
            y,
            z,
            onTileLoad: this.onTileLoad,
            onTileError: this.onTileError,
            maxHeight: this.maxHeight,
            maxWidth: this.maxWidth
          });
          tile.isVisible = true;
          changed = true;
        }
        const tileId = this._getTileId(x, y, z);
        _cache.set(tileId, tile);
      })

      if (changed) {
        // cache size is either the user defined maxSize or 5 * number of current tiles in the viewport.
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
    const {_cache} = this;
    if (_cache.size > maxSize) {
      const iterator = _cache[Symbol.iterator]();
      for (const cachedTile of iterator) {
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
    this._cache.forEach(cachedTile => {
      cachedTile.isVisible = false;
    });
  }

  _getTile(x, y, z) {
    const tileId = this._getTileId(x, y, z);
    return this._cache.get(tileId);
  }

  _getTileId(x, y, z) {
    return `${z}-${x}-${y}`;
  }

  _expandIndices(tileIndices){
    const  {minX, minY, maxY, maxX} = this._getMaxMinIndicies(tileIndices)
    var extraIndices = []
    for (var tileIndex in tileIndices) {
      var tile = tileIndices[tileIndex]
      if (tile.x == maxX)
        extraIndices.push({x: tile.x + 1, y: tile.y, z: tile.z})
        if (tile.y == maxY)
          extraIndices.push({x: tile.x + 1, y: tile.y + 1, z: tile.z})
        else if (tile.y == minY)
          extraIndices.push({x: tile.x + 1, y: tile.y - 1, z: tile.z})
      else if (tile.x == minX)
        extraIndices.push({x: tile.x - 1, y: tile.y, z: tile.z})
        if (tile.y == maxY)
          extraIndices.push({x: tile.x - 1, y: tile.y + 1, z: tile.z})
        else if (tile.y == minY)
          extraIndices.push({x: tile.x - 1, y: tile.y - 1, z: tile.z})
      else if (tile.y == maxY)
        extraIndices.push({x: tile.x, y: tile.y + 1, z: tile.z})
      else if (tile.y == minY)
        extraIndices.push({x: tile.x, y: tile.y - 1, z: tile.z})
    }
    return extraIndices
  }

  _cacheLayersUp(tileIndices, minZoom) {
    var extraIndices = [];
    var zoom = tileIndices[0].z
    var [xIndices, yIndices] = [[], []]
    tileIndices.forEach((e) => xIndices.push(e.x));
    tileIndices.forEach((e) => yIndices.push(e.y));
    const {minX, minY, maxY, maxX} = _getMaxMinIndicies(tileIndices);
    const x = Math.floor((minX + maxX) / 2)
    const y = Math.floor((minY + maxY) / 2)
    while(zoom > minZoom) {
      zoom = zoom - 1
      var index = {x: Math.floor(x / Math.pow(2, -1 * zoom)), y: Math.floor(y / Math.pow(2, -1 * zoom)), z: zoom};
      extraIndices.push(...this._expandIndices([index]));
      extraIndices.push(index);
    }
    return extraIndices
  }

  _getMaxMinIndicies(tileIndices){
    const scale = (256 * Math.pow(2, -1 * tileIndices[0].z))
    const maxX = Math.min(Math.max(...tileIndices.map(tile => tile.x)), Math.floor(MAX_HEIGHT / scale));
    const maxY = Math.min(Math.max(...tileIndices.map(tile => tile.y)), Math.floor(MAX_WIDTH / scale));
    const minX = Math.min(...tileIndices.map(tile => tile.x));
    const minY = Math.min(...tileIndices.map(tile => tile.y));
    return {minX, minY, maxY, maxX}
  }

}
