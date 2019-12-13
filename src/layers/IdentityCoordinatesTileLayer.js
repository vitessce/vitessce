import TileCache from './tile-layer-utils/TileCache';
import { TileLayer } from 'deck.gl';

export class IdentityCoordinatesTileLayer extends TileLayer {

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
        maxHeight,
        maxWidth,
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
}

IdentityCoordinatesTileLayer.layerName = 'IdentityCoordinatesTileLayer';
