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

export default class Spatial extends React.Component {
  constructor(props) {
    super(props);
    // this.onDrag = this.onDrag.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragStart(event) {
    if (this.props.isRectangleSelection) {
      this.dragStartCoordinate = event.coordinate
      console.warn('TODO: dragStart:', event);
    }
  }
  // onDrag(event) {
  //   if (this.props.isRectangleSelection) {
  //     //  TODO: Draw marquee?
  //   }
  // }
  onDragEnd(event) {
    if (this.props.isRectangleSelection) {
      const dragEndCoordinate = event.coordinate;
      const xMin = Math.min(this.dragStartCoordinate[0], dragEndCoordinate[0]);
      const yMin = Math.min(this.dragStartCoordinate[1], dragEndCoordinate[1]);
      const xMax = Math.max(this.dragStartCoordinate[0], dragEndCoordinate[0]);
      const yMax = Math.max(this.dragStartCoordinate[1], dragEndCoordinate[1]);
      // The built-in pickObjects is limited in the size of the region that can be selected.
      // https://github.com/uber/deck.gl/issues/2658#issuecomment-463293063

      // TODO: Implement quadtree? But it's probably fast enough.
      // TODO: I don't trust xy from raw data... but clean it up, and then use it, instead.
      const selectedCellIds = Object.entries(this.props.cells).filter(
        ([id, cell]) =>
          cell.poly[0][0] > xMin
          && cell.poly[0][0] < xMax
          && cell.poly[0][1] > yMin
          && cell.poly[0][1] < yMax
      ).map(([id, cell]) => id);
      var selectedCellIdsSet = {};
      for (const id of selectedCellIds) {
        selectedCellIdsSet[id] = true;
      }
      this.props.updateCellsSelection(selectedCellIdsSet);
    }
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
    var props = {
      views: [new OrthographicView()],
      layers: this.renderLayers(),
      initialViewState: INITIAL_VIEW_STATE
    }
    if (this.props.isRectangleSelection) {
      props = {
        controller: {dragPan: false},
        getCursor: interactionState => 'crosshair',
        onDrag: this.onDrag,
        onDragStart: this.onDragStart,
        onDragEnd: this.onDragEnd,
        ...props
      }
    } else {
      props = {
        controller: true,
        getCursor: interactionState => interactionState.isDragging ? 'grabbing' : 'default',
        ...props
      }
    }
    return <DeckGL {...props}/>;
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
