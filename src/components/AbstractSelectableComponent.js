import React from 'react';
import DeckGL, { OrthographicView, PolygonLayer, COORDINATE_SYSTEM } from 'deck.gl';
import QuadTree from 'simple-quadtree';
import ToolMenu from './ToolMenu';

/**
 Abstract React component: Provides drag-to-select functionality to subclasses.
 @param {Object} props React props
 */
export default class AbstractSelectableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.renderImagesFromView = this.renderImagesFromView.bind(this);
    this.renderImages = this.renderImages.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onUpdateSelection = this.onUpdateSelection.bind(this);
    this.renderSelectionRectangleLayers = this.renderSelectionRectangleLayers.bind(this);
    this.state = {
      selectionRectangle: undefined,
      isSelecting: false,
    };
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
    const { isSelecting } = this.state;
    if (isSelecting) {
      this.dragStartCoordinate = event.coordinate;
    }

    if (!this.cellQuadTree) {
      const { cells } = this.props;
      this.cellQuadTree = QuadTree(-1500, -1500, 3000, 3000);
      Object.entries(cells).forEach(([id, cell]) => {
        const coords = this.getCellCoords(cell);
        if (coords) {
          this.cellQuadTree.put({
            x: coords[0], y: coords[1], w: 0, h: 0, id,
          });
        } else {
          console.warn('missing coords for object');
        }
      });
    }
  }

  onDrag(event) {
    const { isSelecting } = this.state;
    if (isSelecting && event.coordinate) {
      this.setState({ selectionRectangle: this.getDragRectangle(event) });
      // If you want to update selection during drag, un-comment this:
      //   this.onUpdateSelection(event);
      // See: https://github.com/hms-dbmi/vitessce/issues/111
    }
  }

  onDragEnd(event) {
    const { isSelecting } = this.state;
    if (isSelecting) {
      this.setState({ selectionRectangle: undefined });
      this.onUpdateSelection(event);
    }
  }

  onUpdateSelection(event) {
    const { isSelecting } = this.state;
    const { updateCellsSelection } = this.props;
    if (isSelecting && event.coordinate && updateCellsSelection) {
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
      getFillColor: [255, 255, 255],
      opacity: 0.05,
      lineWidthMaxPixels: 0,
      filled: true,
      getElevation: 0,
    })];
  }

  renderImages() { // eslint-disable-line class-methods-use-this
    // No-op
  }

  renderImagesFromView(viewProps) { // eslint-disable-line class-methods-use-this
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
    return this.renderImages(unprojectedProps);
  }

  renderLayersMenu() { // eslint-disable-line class-methods-use-this
    // No-op
  }

  renderCellEmphasis() { // eslint-disable-line class-methods-use-this
    // No-op
  }

  render() {
    const { isSelecting } = this.state;

    const toolProps = {
      setSelectingMode: () => { this.setState({ isSelecting: true }); },
      setPointingMode: () => { this.setState({ isSelecting: false }); },
      /* eslint-disable react/destructuring-assignment */
      isSelectingMode: () => this.state.isSelecting,
      isPointingMode: () => !this.state.isSelecting,
      /* esline-enable */
    };

    let deckProps = {
      views: [new OrthographicView()],
      layers: this.renderLayers().concat(this.renderSelectionRectangleLayers()),
      initialViewState: this.getInitialViewState(),
    };
    if (isSelecting) {
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
      <React.Fragment>
        <div className="d-flex">
          <ToolMenu {...toolProps} />
          {this.renderLayersMenu()}
        </div>
        <div className="d-flex">
          {this.renderCellEmphasis()}
        </div>
        <DeckGL {...deckProps}>
          {this.renderImagesFromView}
        </DeckGL>
      </React.Fragment>
    );
  }
}
