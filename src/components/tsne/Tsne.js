import React from 'react';
import DeckGL, {COORDINATE_SYSTEM, OrthographicView}
  from 'deck.gl';
import {SelectableScatterplotLayer} from '../../layers/'

// TODO: Dynamic palette generation? Or set by user?
// from http://colorbrewer2.org/?type=qualitative&scheme=Paired&n=12#type=qualitative&scheme=Paired&n=12
const PALETTE = [
  [166,206,227],
  [31,120,180],
  [178,223,138],
  [51,160,44],
  [251,154,153],
  [227,26,28],
  [253,191,111],
  [255,127,0],
  [202,178,214],
  [106,61,154],
  [255,255,153],
  [177,89,40]
];

const INITIAL_VIEW_STATE = {
  zoom: 2,
  offset: [0, 0] // Required: https://github.com/uber/deck.gl/issues/2580
};

export default class Tsne extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selectedCellIds: {}};
  }

  renderLayers(props) {
    const {
      cells = undefined,
      updateStatus = (message) => { console.warn(`Tsne updateStatus: ${message}`) }
    } = this.props;

    var layers = [];

    if (cells) {
      var clusterColors = {};
      for (const cell of Object.values(cells)) {
        if (! clusterColors[cell.cluster]) {
          clusterColors[cell.cluster] = PALETTE[Object.keys(clusterColors).length % PALETTE.length]
        }
      }
      layers.push(
        new SelectableScatterplotLayer({
          id: 'tsne-scatter-plot',
          isSelected: cellEntry => {
            return this.state.selectedCellIds[cellEntry[0]]
          },
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
          data: Object.entries(cells),
          pickable: true,
          autoHighlight: true,
          getRadius: 0.5,
          getPosition: cellEntry => {
            const cell = cellEntry[1]
            return [cell.tsne[0], cell.tsne[1], 0];
          },
          getColor: cellEntry => clusterColors[cellEntry[1].cluster],
          onHover: info => {
            if (info.object) { updateStatus(`Cluster: ${info.object[1].cluster}`) }
          },
          onClick: info => {
            const cellId = info.object[0];
            if (this.state.selectedCellIds[cellId]) {
              this.setState((state) => {
                delete state.selectedCellIds[cellId];
                return {selectedCellIds: state.selectedCellIds}
              })
            } else {
              this.setState((state) => {
                state.selectedCellIds[cellId] = true;
                return {selectedCellIds: state.selectedCellIds}
              })
            }
          }
        })
      );
    }

    return layers;
  }

  render() {
    return (
      <DeckGL
        views={[new OrthographicView()]}
        layers={this.renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        //onViewStateChange={({viewState}) => {console.log(viewState)}}
      />
    );
  }
}
