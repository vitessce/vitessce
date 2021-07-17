import { CompositeLayer } from 'deck.gl';
import DynamicOpacityScatterplotLayer from './DynamicOpacityScatterplotLayer';

import { overlayBaseProps } from './selection-utils';

export default class SelectableScatterplotLayer extends CompositeLayer {
  renderLayers() {
    const props = overlayBaseProps(this.props);
    const base = new DynamicOpacityScatterplotLayer(props.base);
    // const overlay = new ScatterplotLayer(props.overlay);
    return [base];
  }
}

SelectableScatterplotLayer.layerName = 'SelectableScatterplotLayer';
