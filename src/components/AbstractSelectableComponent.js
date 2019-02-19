import React from 'react';
import DeckGL, { OrthographicView, PolygonLayer, COORDINATE_SYSTEM } from 'deck.gl';
import PropTypes from 'prop-types';


export default class AbstractSelectableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragOrEnd = this.onDragOrEnd.bind(this);
    this.renderSelectionRectangleLayers = this.renderSelectionRectangleLayers.bind(this);
    this.state = { selectionRectangle: undefined };
  }

  getDragRectangle(event) {
    const start = this.dragStartCoordinate;
    const end = event.coordinate;
    return {
      xMin: Math.min(start[0], end[0]),
      yMin: Math.min(start[1], end[1]),
      xMax: Math.max(start[0], end[0]),
      yMax: Math.max(start[1], end[1]),
    };
  }

  onDragStart(event) {
    if (this.props.isRectangleSelection) {
      this.dragStartCoordinate = event.coordinate;
    }
  }

  onDrag(event) {
    if (this.props.isRectangleSelection && event.coordinate) {
      this.setState({ selectionRectangle: this.getDragRectangle(event) });
      this.onDragOrEnd(event);
    }
  }

  onDragEnd(event) {
    if (this.props.isRectangleSelection) {
      this.setState({ selectionRectangle: undefined });
      this.onDragOrEnd(event);
    }
  }

  onDragOrEnd(event) {
    if (this.props.isRectangleSelection && event.coordinate) {
      const {
        xMin, yMin, xMax, yMax,
      } = this.getDragRectangle(event);
      // The built-in pickObjects is limited in the size of the region that can be selected.
      // https://github.com/uber/deck.gl/issues/2658#issuecomment-463293063

      // TODO: Implement quadtree? But it's probably fast enough.
      const selectedCellIds = Object.entries(this.props.cells).filter(
        ([id, cell]) => {
          const coords = this.getCellCoords(cell);
          return coords[0] > xMin
            && coords[0] < xMax
            && coords[1] > yMin
            && coords[1] < yMax;
        },
      ).map(([id, cell]) => id);
      const selectedCellIdsSet = {};
      for (const id of selectedCellIds) {
        selectedCellIdsSet[id] = true;
      }
      this.props.updateCellsSelection(selectedCellIdsSet);
    }
  }

  renderSelectionRectangleLayers() {
    if (!this.state.selectionRectangle || !this.dragStartCoordinate) {
      return [];
    }
    return [new PolygonLayer({
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      id: 'selection-rectangle',
      data: [this.state.selectionRectangle],
      getPolygon(bounds) {
        return [
          [bounds.xMin, bounds.yMin],
          [bounds.xMax, bounds.yMin],
          [bounds.xMax, bounds.yMax],
          [bounds.xMin, bounds.yMax],
        ];
      },
      getFillColor: [0, 0, 0],
      opacity: 0.05,
      lineWidthMaxPixels: 0,
      filled: true,
      getElevation: 0,
    })];
  }

  render() {
    let props = {
      views: [new OrthographicView()],
      layers: this.renderLayers().concat(this.renderSelectionRectangleLayers()),
      initialViewState: this.getInitialViewState(),
    };
    if (this.props.isRectangleSelection) {
      props = {
        controller: { dragPan: false },
        getCursor: interactionState => 'crosshair',
        onDrag: this.onDrag,
        onDragStart: this.onDragStart,
        onDragEnd: this.onDragEnd,
        ...props,
      };
    } else {
      props = {
        controller: true,
        getCursor: interactionState => (interactionState.isDragging ? 'grabbing' : 'default'),
        ...props,
      };
    }
    return <DeckGL {...props} />;
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
  isRectangleSelection: PropTypes.bool,
};
