import { CompositeLayer, PolygonLayer } from 'deck.gl';

import { overlayBaseProps } from './utils';

export class SelectablePolygonLayer extends CompositeLayer {
  renderLayers() {
    const props = overlayBaseProps(this.props);
    const base = new PolygonLayer(props.base);
    const overlay = new PolygonLayer(props.overlay);
    return [base, overlay];
  }
}

SelectablePolygonLayer.layerName = 'SelectablePolygonLayer';
