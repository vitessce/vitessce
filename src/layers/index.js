import {PolygonLayer, ScatterplotLayer, CompositeLayer} from 'deck.gl';

function overlayBaseProps(props) {
  const {id, getColor, data, isSelected, ...rest} = props;
  return {
    overlay: {
      id: `selected-${id}`,
      getFillColor: getColor,
      getLineColor: getColor,
      data: data.filter(isSelected),
      ...rest
    },
    base: {
      id: `base-${id}`,
      getLineColor: getColor,
      getFillColor: [255,255,255],
      data: data,
      ...rest
    }
  }
}

export class SelectablePolygonLayer extends PolygonLayer {
  renderLayers() {
    const props = overlayBaseProps(this.props);
    const base = new PolygonLayer(props.base)
    const overlay = new PolygonLayer(props.overlay)
    return [base, overlay];
  }
}

SelectablePolygonLayer.layerName = 'SelectablePolygonLayer';

export class SelectableScatterplotLayer extends CompositeLayer {
  renderLayers() {
    const props = overlayBaseProps(this.props);
    const base = new ScatterplotLayer(props.base)
    const overlay = new ScatterplotLayer(props.overlay)
    return [base, overlay];
  }
}

SelectableScatterplotLayer.layerName = 'SelectableScatterplotLayer';
