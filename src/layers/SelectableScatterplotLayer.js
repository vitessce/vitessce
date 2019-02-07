import {ScatterplotLayer} from 'deck.gl';

export default class SelectablePolygonLayer extends ScatterplotLayer {
  renderLayers() {
    var {id, getColor, data, isSelected, ...rest} = this.props;
    const selectedOverlayProps = {
      id: `selected-${id}`,
      getColor: [64,64,64],
      data: data.filter(isSelected),
      ...rest
    };

    const overlay = new ScatterplotLayer(selectedOverlayProps)
    return [...super.renderLayers(), overlay];
  }
}

SelectablePolygonLayer.layerName = 'SelectablePolygonLayer';
