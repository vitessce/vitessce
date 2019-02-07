//import {CompositeLayer} from '@deck.gl/core';
import {PolygonLayer} from 'deck.gl';

export default class SelectablePolygonLayer extends PolygonLayer {
  renderLayers() {
    console.log('rendering!');
    return super.renderLayers();
  }
}

SelectablePolygonLayer.layerName = 'SelectablePolygonLayer';
