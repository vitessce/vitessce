import React from 'react';

import DeckGL, { OrthographicView, PolygonLayer, COORDINATE_SYSTEM } from 'deck.gl';
import ToolMenu from './ToolMenu';
import { POINTER, SELECT_RECTANGLE } from './tools';

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
    this.onViewStateChange = this.onViewStateChange.bind(this);
    this.renderSelectionRectangleLayers = this.renderSelectionRectangleLayers.bind(this);
    this.deckRef = React.createRef();
    const { uuid = null } = props || {};
    // Store view and viewport information in a mutable object.
    this.viewInfo = {
      viewport: null,
      width: null,
      height: null,
      uuid,
    };
    this.state = {
      selectionRectangle: undefined,
      tool: POINTER,
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
    const { tool } = this.state;
    if (tool === SELECT_RECTANGLE) {
      this.dragStartCoordinate = event.coordinate;
    }
  }

  onDrag(event) {
    const { tool } = this.state;
    if (tool === SELECT_RECTANGLE && event.coordinate) {
      this.setState({ selectionRectangle: this.getDragRectangle(event) });
      // If you want to update selection during drag, un-comment this:
      //   this.onUpdateSelection(event);
      // See: https://github.com/hms-dbmi/vitessce/issues/111
    }
  }

  onDragEnd(event) {
    const { tool } = this.state;
    if (tool === SELECT_RECTANGLE) {
      this.setState({ selectionRectangle: undefined });
      this.onUpdateSelection(event);
    }
  }

  onUpdateSelection(event) {
    const { tool } = this.state;
    const { updateCellsSelection } = this.props;
    if (tool === SELECT_RECTANGLE && event.coordinate && updateCellsSelection) {
      const {
        xMin, yMin, xMax, yMax,
      } = this.getDragRectangle(event);
      // The built-in pickObjects is limited in the size of the region that can be selected.
      // https://github.com/uber/deck.gl/issues/2658#issuecomment-463293063
      // (and it would also be limited in resolution of features it can pick.)

      // I've had other problems as well: Either not working at all,
      // or only picking objects with positive coordinates.

      const selectedCellIdsSet = {};

      const { viewport } = this.viewInfo;

      const nwCoords = viewport.project([xMin, yMin]);
      const seCoords = viewport.project([xMax, yMax]);
      const proWidth = seCoords[0] - nwCoords[0];
      const proHeight = seCoords[1] - nwCoords[1];
      const projectedProps = {
        x: nwCoords[0],
        y: nwCoords[1],
        width: proWidth,
        height: proHeight,
      };
      const pickedObjects = this.deckRef.current.pickObjects(projectedProps);

      const cellObjIds = pickedObjects.map(cellObj => cellObj.object[0]);
      cellObjIds.forEach((cellObjId) => {
        selectedCellIdsSet[cellObjId] = true;
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
    // Capture the viewport, width, and height values from DeckGL instantiation to be used later.
    this.viewInfo.viewport = viewport;
    this.viewInfo.width = width;
    this.viewInfo.height = height;
    const {
      updateViewInfo = () => {
        console.warn('AbstractSelectableComponent updateViewInfo from renderImagesFromView');
      },
    } = this.props;
    updateViewInfo(this.viewInfo);
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

  onViewStateChange({ viewState }) {
    const {
      updateViewInfo = () => {
        console.warn('AbstractSelectableComponent updateViewInfo from onViewStateChange');
      },
    } = this.props;
    // Update the viewport field of the `viewInfo` object
    // to satisfy components (e.g. CellTooltip) that depend on an
    // up-to-date viewport instance (to perform projections).
    this.viewInfo.viewport = (new OrthographicView()).makeViewport({
      viewState,
      width: this.width,
      height: this.height,
    });
    updateViewInfo(this.viewInfo);
  }

  renderLayersMenu() { // eslint-disable-line class-methods-use-this
    // No-op
  }

  render() {
    const { tool } = this.state;

    const toolProps = {
      setActiveTool: (toolUpdate) => { this.setState({ tool: toolUpdate }); },
      /* eslint-disable react/destructuring-assignment */
      isActiveTool: toolCheck => (toolCheck === this.state.tool),
      /* esline-enable */
    };

    let deckProps = {
      views: [new OrthographicView({ id: 'ortho' })], // id is a fix for https://github.com/uber/deck.gl/issues/3259
      layers: this.renderLayers().concat(this.renderSelectionRectangleLayers()),
      initialViewState: this.getInitialViewState(),
      onViewStateChange: this.onViewStateChange,
    };
    if (tool === SELECT_RECTANGLE) {
      deckProps = {
        controller: { dragPan: false },
        getCursor: () => 'crosshair',
        onDragStart: this.onDragStart,
        onDrag: this.onDrag,
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
        <DeckGL ref={this.deckRef} {...deckProps}>
          {this.renderImagesFromView}
        </DeckGL>
      </React.Fragment>
    );
  }
}
