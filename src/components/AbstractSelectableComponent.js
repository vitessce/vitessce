import React from 'react';
import DeckGL, { OrthographicView, PolygonLayer, COORDINATE_SYSTEM } from 'deck.gl';

/**
 Abstract React component: Provides drag-to-select functionality to subclasses.
 @param {Object} props React props
 @param {Boolean} props.isRectangleSelection True if we are in rectangle selection mode.
 */
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
    const { isRectangleSelection } = this.props;
    if (isRectangleSelection) {
      this.dragStartCoordinate = event.coordinate;
    }
  }

  onDrag(event) {
    const { isRectangleSelection } = this.props;
    if (isRectangleSelection && event.coordinate) {
      this.setState({ selectionRectangle: this.getDragRectangle(event) });
      this.onDragOrEnd(event);
    }
  }

  onDragEnd(event) {
    const { isRectangleSelection } = this.props;
    if (isRectangleSelection) {
      this.setState({ selectionRectangle: undefined });
      this.onDragOrEnd(event);
    }
  }

  onDragOrEnd(event) {
    const { cells, isRectangleSelection, updateCellsSelection } = this.props;
    if (isRectangleSelection && event.coordinate) {
      const {
        xMin, yMin, xMax, yMax,
      } = this.getDragRectangle(event);
      // The built-in pickObjects is limited in the size of the region that can be selected.
      // https://github.com/uber/deck.gl/issues/2658#issuecomment-463293063

      // TODO: Implement quadtree? But it's probably fast enough.
      const selectedCellIds = Object.entries(cells).filter(
        ([id, cell]) => { // eslint-disable-line no-unused-vars
          const coords = this.getCellCoords(cell);
          return coords[0] > xMin
            && coords[0] < xMax
            && coords[1] > yMin
            && coords[1] < yMax;
        },
      ).map(([id, cell]) => id); // eslint-disable-line no-unused-vars
      const selectedCellIdsSet = {};
      selectedCellIds.forEach((id) => {
        selectedCellIdsSet[id] = true;
      });
      updateCellsSelection(selectedCellIdsSet);
    }
  }

  renderSelectionRectangleLayers() {
    const { selectionRectangle } = this.state;
    if (!selectionRectangle || !this.dragStartCoordinate) {
      return [];
    }
    return [new PolygonLayer({
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      id: 'selection-rectangle',
      data: [selectionRectangle],
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
    const { isRectangleSelection } = this.props;
    let deckProps = {
      views: [new OrthographicView()],
      layers: this.renderLayers().concat(this.renderSelectionRectangleLayers()),
      initialViewState: this.getInitialViewState(),
    };
    if (isRectangleSelection) {
      deckProps = {
        controller: { dragPan: false },
        getCursor: () => 'crosshair',
        onDrag: this.onDrag,
        onDragStart: this.onDragStart,
        onDragEnd: this.onDragEnd,
        ...deckProps,
      };
    } else {
      deckProps = {
        controller: true,
        getCursor: interactionState => (interactionState.isDragging ? 'grabbing' : 'default'),
        ...deckProps,
      };
    }
    return <DeckGL {...deckProps} />;
  }
}
