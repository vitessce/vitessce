import React from 'react';
import DeckGL, {COORDINATE_SYSTEM, OrthographicView}
  from 'deck.gl';
import {SelectableScatterplotLayer} from '../../layers/'
import {cellLayerDefaultProps, PALETTE} from '../utils'


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
          getRadius: 0.5,
          getPosition: cellEntry => {
            const cell = cellEntry[1]
            return [cell.tsne[0], cell.tsne[1], 0];
          },
          getColor: cellEntry => clusterColors[cellEntry[1].cluster],
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
          },
          ...cellLayerDefaultProps(cells, updateStatus)
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
