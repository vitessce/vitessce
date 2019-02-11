import React from 'react';
import DeckGL, {ScatterplotLayer, COORDINATE_SYSTEM, OrthographicView}
  from 'deck.gl';
import {SelectablePolygonLayer} from '../../layers/'
import {cellLayerDefaultProps, PALETTE} from '../utils'
import PropTypes from 'prop-types';


function square(x, y) {
  return [[x, y+100], [x+100, y], [x, y-100], [x-100, y]]
}

const INITIAL_VIEW_STATE = {
  zoom: -5,
  offset: [460, 640] // Required: https://github.com/uber/deck.gl/issues/2580
};

// function viewState(props) {
//   const {
//     molecules = undefined
//   } = props;
//
//   if (!molecules) {
//     // TODO: also sniff cells
//     console.log('abort');
//     return INITIAL_VIEW_STATE;
//   }
//
//   var {...state} = INITIAL_VIEW_STATE;
//   var [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];
//   if (molecules) {
//     for (const coords of Object.values(molecules)) {
//       for (const coord of coords) {
//         if (coord[0] < minX) { minX = coord[0] }
//         if (coord[0] > maxX) { maxX = coord[0] }
//         if (coord[1] < minY) { minY = coord[1] }
//         if (coord[1] > maxY) { maxY = coord[1] }
//       }
//     }
//     const x = (maxX + minX) / 2;
//     const y = (maxY + minY) / 2;
//     state.offset = [x, y];
//   }
//
//   console.log(state);
//   return state;
// }



export default class Spatial extends React.Component {
  constructor(props) {
    super(props);
  }

  renderLayers() {
    const {
      // baseImg = undefined,
      molecules = undefined,
      cells = undefined,
      selectedCellIds = {},
      updateStatus = (message) => {
        console.warn(`Spatial updateStatus: ${message}`)
      },
      updateCellsSelection = (cellsSelection) => {
        console.warn(`Spatial updateCellsSelection: ${cellsSelection}`);
      }
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
        new SelectablePolygonLayer({
          id: 'polygon-layer',
          isSelected: cellEntry => selectedCellIds[cellEntry[0]],
          wireframe: true,
          lineWidthMinPixels: 1,
          getPolygon: function(cellEntry) {
            const cell = cellEntry[1]
            return cell.poly ? cell.poly : square(cell.xy[0], cell.xy[1]);
          },
          getFillColor: cellEntry => clusterColors[cellEntry[1].cluster],
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

    if (molecules) {
      var scatterplotData = [];
      var index = 0;
      for (const [molecule, coords] of Object.entries(molecules)) {
        scatterplotData = scatterplotData.concat(
          coords.map(([x,y]) => [x,y,index,molecule]) // eslint-disable-line no-loop-func
          // TODO: Using an object would be more clear, but is there a performance penalty,
          // either in time or memory?
        );
        index++;
      }
      layers.push(
        new ScatterplotLayer({
          id: 'scatter-plot',
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
          data: scatterplotData,
          pickable: true,
          autoHighlight: true,
          // TODO: How do the other radius attributes work?
          // If it were possible to have dots that remained the same size,
          // regardless of zoom, would we prefer that?
          getRadius: 10,
          getPosition: d => [d[0], d[1], 0],
          getColor: d => PALETTE[d[2] % PALETTE.length],
          onHover: info => {
            if (info.object) { updateStatus(`Gene: ${info.object[3]}`) }
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
        getCursor={
          (interactionState) => {
            if (this.props.isRectangleSelection) {
              return 'crosshair';
            } else {
              return interactionState.isDragging ? 'grabbing' : 'default'
            }
          }
        }
        //onViewStateChange={({viewState}) => {console.log(viewState)}}
      />
    );
  }
}


Spatial.propTypes = {
  viewState: PropTypes.object,
  controller: PropTypes.bool,
  molecules: PropTypes.object,
  cells: PropTypes.object,
  selectedCellIds: PropTypes.object,
  updateStatus: PropTypes.func,
  updateCellsSelection: PropTypes.func,
  isRectangleSelection: PropTypes.bool
}
