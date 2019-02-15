import React from 'react';
import DeckGL, {OrthographicView} from 'deck.gl';
import PropTypes from 'prop-types';


export default class AbstractSelectableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragEnd = this.onDrag.bind(this);
  }

  getDragRectangle(end) {
    const start = this.dragStartCoordinate
    return {
      xMin: Math.min(start[0], end[0]),
      yMin: Math.min(start[1], end[1]),
      xMax: Math.max(start[0], end[0]),
      yMax: Math.max(start[1], end[1])
    }
  }

  onDragStart(event) {
    if (this.props.isRectangleSelection) {
      this.dragStartCoordinate = event.coordinate;
    }
  }

  onDrag(event) {
    // If we have dragged outside of the viewport, there are still events,
    // and screen x and y are present, but there are no projected coordinates.
    if (this.props.isRectangleSelection && event.coordinate) {
      const {xMin, yMin, xMax, yMax} = this.getDragRectangle(event.coordinate);
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

AbstractSelectableComponent.propTypes = {
  viewState: PropTypes.object,
  controller: PropTypes.bool,
  molecules: PropTypes.object,
  cells: PropTypes.object,
  selectedCellIds: PropTypes.object,
  updateStatus: PropTypes.func,
  updateCellsSelection: PropTypes.func,
  isRectangleSelection: PropTypes.bool
}
