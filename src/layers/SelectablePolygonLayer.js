import { CompositeLayer } from '@deck.gl/core';
import { PolygonLayer } from '@deck.gl/layers';

import { overlayBaseProps } from './selection-utils';

export default class SelectablePolygonLayer extends CompositeLayer {
  renderLayers() {
    const props = overlayBaseProps(this.props);
    const base = new PolygonLayer(props.base);
    const overlay = new PolygonLayer(props.overlay);
    return [base, overlay];
  }
}

SelectablePolygonLayer.layerName = 'SelectablePolygonLayer';
