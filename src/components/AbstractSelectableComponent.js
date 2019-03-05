import React from 'react';
import DeckGL, { OrthographicView, PolygonLayer, COORDINATE_SYSTEM } from 'deck.gl';
import QuadTree from 'simple-quadtree';

/**
 Abstract React component: Provides drag-to-select functionality to subclasses.
 @param {Object} props React props
 @param {Boolean} props.isRectangleSelection True if we are in rectangle selection mode.
 */
export default class AbstractSelectableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.renderBackgroundFromView = this.renderBackgroundFromView.bind(this);
    this.renderBackground = this.renderBackground.bind(this);
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

    if (!this.cellQuadTree) {
      const { cells } = this.props;
      this.cellQuadTree = QuadTree(-1500, -1500, 3000, 3000);
      // Centers of cells should fit 2000 x 2000, but give a margin to be safe.
      // TODO: This is also used for tSNE, and there these dimensions are excessive.
      Object.entries(cells).forEach(([id, cell]) => {
        const coords = this.getCellCoords(cell);
        this.cellQuadTree.put({
          x: coords[0], y: coords[1], w: 0, h: 0, id,
        });
      });
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
    const { isRectangleSelection, updateCellsSelection } = this.props;
    if (isRectangleSelection && event.coordinate) {
      const {
        xMin, yMin, xMax, yMax,
      } = this.getDragRectangle(event);
      // The built-in pickObjects is limited in the size of the region that can be selected.
      // https://github.com/uber/deck.gl/issues/2658#issuecomment-463293063
      // (and it would also be limited in resolution of features it can pick.)

      // I've had other problems as well: Either not working at all,
      // or only picking objects with positive coordinates.

      const selectedCellIdsSet = {};
      const qtBounds = {
        x: xMin, y: yMin, w: xMax - xMin, h: yMax - yMin,
      };
      const cellObjs = this.cellQuadTree.get(qtBounds);
      cellObjs.forEach((obj) => {
        selectedCellIdsSet[obj.id] = true;
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

  renderBackground() { // eslint-disable-line class-methods-use-this
    // No-op
  }

  renderBackgroundFromView(viewProps) { // eslint-disable-line class-methods-use-this
    const {
      x, y, width, height, viewport,
    } = viewProps;
    const nwCoords = viewport.unproject([x, y]);
    const seCoords = viewport.unproject([x + width, y + height]);
    const unproWidth = seCoords[0] - nwCoords[0];
    const unproHeight = seCoords[1] - nwCoords[1];
    const unprojectedProps = {
      x: nwCoords[0],
      y: nwCoords[1],
      width: unproWidth,
      height: unproHeight,
    };
    return this.renderBackground(unprojectedProps);
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
    return (
      <DeckGL {...deckProps}>
        {this.renderBackgroundFromView}
      </DeckGL>
    );
  }
}
