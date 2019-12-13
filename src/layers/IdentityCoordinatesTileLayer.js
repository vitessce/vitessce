/* eslint-disable no-underscore-dangle*/

import TileCache from './tile-layer-utils/TileCache';
import {TileLayer} from 'deck.gl'

export class IdentityCoordinatesTileLayer extends TileLayer {

  initializeState() {
    this.state = {
      tiles: [],
      isLoaded: false
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({props, context, changeFlags}) {

    let { tileCache } = this.state;
    if (
      !tileCache ||
      (changeFlags.updateTriggersChanged
        &&  (changeFlags.updateTriggersChanged.all
          || changeFlags.updateTriggersChanged.getTileData))
    ) {
      const { getTileData, maxZoom, minZoom, maxCacheSize, maxHeight, maxWidth } = props;
      if (tileCache) {
        tileCache.finalize();
      }
      tileCache = new TileCache({
        getTileData,
        maxSize: maxCacheSize,
        maxZoom,
        minZoom,
        maxHeight: 51669,
        maxWidth: 31728,
        onTileLoad: this._onTileLoad.bind(this),
        onTileError: this._onTileError.bind(this),
      });
      this.setState({ tileCache });
    } else if (changeFlags.updateTriggersChanged) {
      // if any updateTriggersChanged (other than getTileData), delete the layer
      this.state.tileCache.tiles.forEach((tile) => {
        tile.layer = null;
      });
    }

    const { viewport}  = context;
    if (changeFlags.viewportChanged && viewport.id !== 'DEFAULT-INITIAL-VIEWPORT') {
      const z = this.getLayerZoomLevel();
      tileCache.update(viewport);
      // The tiles that should be displayed at this zoom level
      const currTiles = tileCache.tiles.filter(tile => tile.z === z);
      this.setState({isLoaded: false, tiles: currTiles});
      this._onTileLoad();
    }
  }

  getLayerZoomLevel() {
    var z = Math.ceil(this.context.viewport.zoom);
    const { maxZoom, minZoom } = this.props;
    if (Number.isFinite(maxZoom) && z > maxZoom) {
      z = Math.floor(maxZoom);
    } else if (Number.isFinite(minZoom) && z < minZoom) {
      z = Math.ceil(minZoom);
    }
    return z;
  }

  _onTileLoad() {
    const {onViewportLoaded} = this.props;
    const currTiles = this.state.tiles;
    const allCurrTilesLoaded = currTiles.every(tile => tile.isLoaded);
    if (this.state.isLoaded !== allCurrTilesLoaded) {
      this.setState({isLoaded: allCurrTilesLoaded});
      if (allCurrTilesLoaded && onViewportLoaded) {
        onViewportLoaded(currTiles.filter(tile => tile._data).map(tile => tile._data));
      }
    }
  }

  _onTileError(error) {
    this.props.onTileError(error);
    // errorred tiles should not block rendering, are considered "loaded" with empty data
    this._onTileLoad();
  }

  getPickingInfo({info, sourceLayer}) {
    info.sourceLayer = sourceLayer;
    info.tile = sourceLayer.props.tile;
    return info;
  }

  renderLayers() {
    const {renderSubLayers, visible} = this.props;
    const z = this.getLayerZoomLevel();
    return this.state.tileCache.tiles.map(tile => {
      // For a tile to be visible:
      // - parent layer must be visible
      // - tile must be visible in the current viewport
      // - if all tiles are loaded, only display the tiles from the current z level
      const isVisible = visible && tile.isVisible && (!this.state.isLoaded || tile.z === z);
      // cache the rendered layer in the tile
      if (!tile.layer) {
        tile.layer = renderSubLayers(
          Object.assign({}, this.props, {
            id: `${this.id}-${tile.x}-${tile.y}-${tile.z}`,
            data: tile.data,
            visible: isVisible,
            tile
          })
        );
      } else if (tile.layer.props.visible !== isVisible) {
        tile.layer = tile.layer.clone({visible: isVisible});
      }
      return tile.layer;
    });
  }
}

IdentityCoordinatesTileLayer.layerName = 'IdentityCoordinatesTileLayer';
