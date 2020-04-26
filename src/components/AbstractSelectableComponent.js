import React from 'react';

import DeckGL, { OrthographicView, COORDINATE_SYSTEM } from 'deck.gl';
import SelectionLayer from '../layers/SelectionLayer';
import ToolMenu from './ToolMenu';

/**
 Abstract React component: Provides drag-to-select functionality to subclasses.
 @param {Object} props React props
 */
export default class AbstractSelectableComponent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.renderSelectionLayers = this.renderSelectionLayers.bind(this);
    this.deckRef = React.createRef();
    this.getCellCoords = this.getCellCoords.bind(this);
    this.onViewStateChange = this.onViewStateChange.bind(this);
    this.initializeViewInfo = this.initializeViewInfo.bind(this);
    this.onWebGLInitialized = this.onWebGLInitialized.bind(this);
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
      gl: null,
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
    const editHandlePointRadius = 5 / (zoom + 16);

    return [new SelectionLayer({
      id: 'selection',
      getCellCoords: this.getCellCoords,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
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

  renderLayersMenu() { // eslint-disable-line class-methods-use-this
    // No-op
  }

  initializeViewInfo(viewProps) {
    const {
      width, height, viewport,
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

  onWebGLInitialized(gl) {
    // gl needs to be initialized for us to use it in Texture creation
    this.setState({ gl });
  }

  render() {
    const { tool, gl } = this.state;
    const toolProps = {
      setActiveTool: (toolUpdate) => { this.setState({ tool: toolUpdate }); },
      /* eslint-disable react/destructuring-assignment */
      isActiveTool: toolCheck => (toolCheck === this.state.tool),
      /* esline-enable */
      onViewStateChange: this.onViewStateChange,
    };

    let deckProps = {
      views: [new OrthographicView({ id: 'ortho' })], // id is a fix for https://github.com/uber/deck.gl/issues/3259
      // gl needs to be initialized for us to use it in Texture creation
      layers: gl ? this.renderLayers().concat(this.renderSelectionLayers()) : [],
      initialViewState: this.getInitialViewState(),
    };
    if (tool) {
      deckProps = {
        controller: { dragPan: false },
        getCursor: () => 'crosshair',
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
      <>
        <div className="d-flex">
          <ToolMenu {...toolProps} />
          {this.renderLayersMenu()}
        </div>
        <DeckGL
          glOptions={{ webgl2: true }}
          ref={this.deckRef}
          onWebGLInitialized={this.onWebGLInitialized}
          {...deckProps}
        >
          {this.initializeViewInfo}
        </DeckGL>
      </>
    );
  }
}
