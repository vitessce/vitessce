import React from 'react';
import DeckGL, {OrthographicView}
  from 'deck.gl';
import {SelectableScatterplotLayer} from '../../layers/'
import {cellLayerDefaultProps, PALETTE} from '../utils'
import PropTypes from 'prop-types';


export default class Tsne extends React.Component {
  constructor(props) {
    super(props);
    // this.onDrag = this.onDrag.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  getInitialViewState() {
    return {
      zoom: 2,
      offset: [0, 0] // Required: https://github.com/uber/deck.gl/issues/2580
    };
  }

  onDragStart(event) {
    if (this.props.isRectangleSelection) {
      this.dragStartCoordinate = event.coordinate;
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
          cell.tsne[0] > xMin
          && cell.tsne[0] < xMax
          && cell.tsne[1] > yMin
          && cell.tsne[1] < yMax
      ).map(([id, cell]) => id);
      var selectedCellIdsSet = {};
      for (const id of selectedCellIds) {
        selectedCellIdsSet[id] = true;
      }
      this.props.updateCellsSelection(selectedCellIdsSet);
    }
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
    var props = {
      views: [new OrthographicView()],
      layers: this.renderLayers(),
      initialViewState: this.getInitialViewState()
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
    // return (
    //   <DeckGL
    //     views={[new OrthographicView()]}
    //     layers={this.renderLayers()}
    //     initialViewState={INITIAL_VIEW_STATE}
    //     controller={true}
    //     //onViewStateChange={({viewState}) => {console.log(viewState)}}
    //   />
    // );
  }
}

Tsne.propTypes = {
  viewState: PropTypes.object,
  controller: PropTypes.bool,
  isRectangleSelection: PropTypes.bool,
  cells: PropTypes.object,
  selectedCellIds: PropTypes.object,
  updateStatus: PropTypes.func,
  updateCellsSelection: PropTypes.func
}
