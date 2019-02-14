import {PolygonLayer, ScatterplotLayer, CompositeLayer} from 'deck.gl';

function fade(x) {
  return 255-(255-x)/4
}

function fadeFunction(colorFunction) {
  return (cell) => {
    var rgb = colorFunction(cell);
    return [fade(rgb[0]), fade(rgb[1]), fade(rgb[2])]
  }
}

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
      getLineColor: fadeFunction(getColor),
      getFillColor: fadeFunction(getColor),
      // Alternatively: contrast outlines with solids:
      // getLineColor: getColor,
      // getFillColor: [255,255,255],
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
