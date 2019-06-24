import React from 'react';

import DeckGL, { OrthographicView, PolygonLayer, COORDINATE_SYSTEM } from 'deck.gl';
import { SELECTION_TYPE } from 'nebula.gl';
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
      pickingInfos: undefined,
    };
  }

  renderSelectionLayers() {
    const { tool } = this.state;
    const { updateCellsSelection } = this.props;
    if (!tool) {
      return [];
    }
    return [new SelectionLayer({
      id: 'selection',
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      selectionType: tool,
      onSelect: ({ pickingInfos }) => {
        console.log(pickingInfos);
        const cellObjIds = pickingInfos.map(cellObj => cellObj.object[0]);
        const selectedCellIdsSet = {};
        cellObjIds.forEach((cellObjId) => {
          selectedCellIdsSet[cellObjId] = true;
        });
        updateCellsSelection(selectedCellIdsSet);
      },
      layerIds: ['base-scatterplot'],
      getTentativeFillColor: () => [255, 255, 255, 95],
      getTentativeLineColor: () => [143, 143, 143, 255],
      getTentativeLineDashArray: () => [7, 4],
      lineWidthMinPixels: 2,
      lineWidthMaxPixels: 2,
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
      views: [new OrthographicView({ id: 'ortho' })],
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
