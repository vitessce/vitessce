import {ScatterplotLayer, CompositeLayer} from 'deck.gl';

export default class SelectableScatterplotLayer extends CompositeLayer {
  renderLayers() {
    var {id, getColor, data, isSelected, ...rest} = this.props;
    const overlayProps = {
      id: `selected-${id}`,
      getColor: [64,64,64],
      data: data.filter(isSelected),
      ...rest
    };
    const baseProps = {
      id: `base-${id}`,
      getColor: getColor,
      data: data,
      ...rest
    };

    const base = new ScatterplotLayer(baseProps)
    const overlay = new ScatterplotLayer(overlayProps)
    return [base, overlay];
  }
}

SelectableScatterplotLayer.layerName = 'SelectableScatterplotLayer';
