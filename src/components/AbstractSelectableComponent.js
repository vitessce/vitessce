import React from 'react';

import DeckGL, { OrthographicView, COORDINATE_SYSTEM } from 'deck.gl';
import SelectionLayer from '../layers/SelectionLayer';
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
    this.onViewStateChange = this.onViewStateChange.bind(this);
    this.renderSelectionLayers = this.renderSelectionLayers.bind(this);
    this.deckRef = React.createRef();
    this.getCellCoords = this.getCellCoords.bind(this);
    const { uuid = null } = props || {};
    // Store view and viewport information in a mutable object.
    this.viewInfo = {
      viewport: null,
      width: null,
      height: null,
      uuid,
    };
    this.state = {
      tool: null,
    };
  }

  getCellCoords() { // eslint-disable-line class-methods-use-this
    // No-op
  }

  getCellBaseLayerId() { // eslint-disable-line class-methods-use-this
    // No-op
  }

  renderSelectionLayers() {
    const { tool } = this.state;
    const { updateCellsSelection } = this.props;
    if (!tool) {
      return [];
    }

    const { zoom } = this.getInitialViewState();
    const editHandlePointRadius = 60 / (zoom + 16);

    return [new SelectionLayer({
      id: 'selection',
      getCellCoords: this.getCellCoords,
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      selectionType: tool,
      onSelect: ({ pickingInfos }) => {
        const cellIds = new Set(pickingInfos.map(cellObj => cellObj.object[0]));
        updateCellsSelection(cellIds);
      },
      layerIds: [this.getCellBaseLayerId()],
      getTentativeFillColor: () => [255, 255, 255, 95],
      getTentativeLineColor: () => [143, 143, 143, 255],
      getTentativeLineDashArray: () => [7, 4],
      lineWidthMinPixels: 2,
      lineWidthMaxPixels: 2,
      getEditHandlePointColor: () => [0xff, 0xff, 0xff, 0xff],
      getEditHandlePointRadius: () => editHandlePointRadius,
      editHandlePointRadiusScale: 1,
      editHandlePointRadiusMinPixels: editHandlePointRadius,
      editHandlePointRadiusMaxPixels: 2 * editHandlePointRadius,
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
    // to satisfy components (e.g. CellTooltip2D) that depend on an
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
    const toolProps = {
      setActiveTool: (toolUpdate) => { this.setState({ tool: toolUpdate }); },
      /* eslint-disable react/destructuring-assignment */
      isActiveTool: toolCheck => (toolCheck === this.state.tool),
      /* esline-enable */
    };

    const deckProps = {
      views: [new OrthographicView({ id: 'ortho' })], // id is a fix for https://github.com/uber/deck.gl/issues/3259
      layers: this.renderLayers().concat(this.renderSelectionLayers()),
      initialViewState: this.getInitialViewState(),
      onViewStateChange: this.onViewStateChange,
      controller: true,
      getCursor: interactionState => (interactionState.isDragging ? 'grabbing' : 'default'),
    };
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
