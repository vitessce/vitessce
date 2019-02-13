import React from 'react';
import DeckGL, {OrthographicView}
  from 'deck.gl';
import {SelectableScatterplotLayer} from '../../layers/'
import {cellLayerDefaultProps, PALETTE} from '../utils'
import PropTypes from 'prop-types';


const INITIAL_VIEW_STATE = {
  zoom: 2,
  offset: [0, 0] // Required: https://github.com/uber/deck.gl/issues/2580
};

export default class Tsne extends React.Component {
  constructor(props) {
    super(props);
  }

  renderLayers(props) {
    const {
      cells = undefined,
      updateStatus = (message) => {
        console.warn(`Tsne updateStatus: ${message}`);
      },
      updateCellsSelection = (cellsSelection) => {
        console.warn(`Tsne updateCellsSelection: ${cellsSelection}`);
      },
      selectedCellIds = {}
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
          isSelected: cellEntry => selectedCellIds[cellEntry[0]],
          getRadius: 0.5,
          lineWidthMinPixels: 0.1,
          stroked: true,
          getPosition: cellEntry => {
            const cell = cellEntry[1]
            return [cell.tsne[0], cell.tsne[1], 0];
          },
          getColor: cellEntry => clusterColors[cellEntry[1].cluster],
          onClick: info => {
            const cellId = info.object[0];
            if (selectedCellIds[cellId]) {
              delete selectedCellIds[cellId];
              updateCellsSelection(selectedCellIds);
            } else {
              selectedCellIds[cellId] = true;
              updateCellsSelection(selectedCellIds);
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

Tsne.propTypes = {
  viewState: PropTypes.object,
  controller: PropTypes.bool,
  cells: PropTypes.object,
  selectedCellIds: PropTypes.object,
  updateStatus: PropTypes.func,
  updateCellsSelection: PropTypes.func
}
