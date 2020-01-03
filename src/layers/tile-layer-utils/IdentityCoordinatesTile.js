/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

/*
------------------------------------------
THIS CODE IS FROM DECKGL MOSTLY
IT IS AWAITING A PR THERE AND WILL
THEN BE REMOVED IN FAVOR OF THAT
------------------------------------------
*/
import {Texture2D} from '@luma.gl/webgl'
import GL from '@luma.gl/constants';

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
        if(buffers.shape[0] !== 0 && buffers.shape[1] !== 0){
          let flattenedBuffer = buffers.flatten()
          const texture = new Texture2D(this.layer.context.gl, {
            width: buffers.shape[1],
            height: buffers.shape[0],
            format: GL.RGB,
            data: flattenedBuffer,
            pixelStore: {
              [GL.UNPACK_FLIP_Y_WEBGL]: true
            },
            mipmaps: true
          });
          this._data = texture;
          this._isLoaded = true;
          this.onTileLoad(this);
          return texture;
        }
        else{
          this._isLoaded = true;
        }
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
