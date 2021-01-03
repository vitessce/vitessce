import { CompositeLayer } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';

import { overlayBaseProps } from './selection-utils';

export default class SelectableScatterplotLayer extends CompositeLayer {
  renderLayers() {
    const props = overlayBaseProps(this.props);
    const base = new ScatterplotLayer(props.base);
    const overlay = new ScatterplotLayer(props.overlay);
    return [base, overlay];
  }
}

SelectableScatterplotLayer.layerName = 'SelectableScatterplotLayer';
