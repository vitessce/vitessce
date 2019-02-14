import React from 'react';
import DeckGL, {OrthographicView} from 'deck.gl';
import PropTypes from 'prop-types';


export default class AbstractSelectableReactComponent extends React.Component {
  constructor(props) {
    super(props);
    // this.onDrag = this.onDrag.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragStart(event) {
    if (this.props.isRectangleSelection) {
      this.dragStartCoordinate = event.coordinate;
    }
  }

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
      const selectedCellIds = Object.entries(this.props.cells).filter(
        ([id, cell]) => {
          const coords = this.getCellCoords(cell);
          return coords[0] > xMin
            && coords[0] < xMax
            && coords[1] > yMin
            && coords[1] < yMax
        }
      ).map(([id, cell]) => id);
      var selectedCellIdsSet = {};
      for (const id of selectedCellIds) {
        selectedCellIdsSet[id] = true;
      }
      this.props.updateCellsSelection(selectedCellIdsSet);
    }
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
  }
}

AbstractSelectableReactComponent.propTypes = {
  viewState: PropTypes.object,
  controller: PropTypes.bool,
  molecules: PropTypes.object,
  cells: PropTypes.object,
  selectedCellIds: PropTypes.object,
  updateStatus: PropTypes.func,
  updateCellsSelection: PropTypes.func,
  isRectangleSelection: PropTypes.bool
}
