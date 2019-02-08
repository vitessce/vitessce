import {PolygonLayer} from 'deck.gl';

export default class SelectablePolygonLayer extends PolygonLayer {
  renderLayers() {
    var {id, getFillColor, data, isSelected, ...rest} = this.props;
    const selectedOverlayProps = {
      id: `selected-${id}`,
      getFillColor: [64,64,64],
      data: data.filter(isSelected),
      ...rest
    };

    const overlay = new PolygonLayer(selectedOverlayProps)
    return [...super.renderLayers(), overlay];
  }
}

SelectablePolygonLayer.layerName = 'SelectablePolygonLayer';
