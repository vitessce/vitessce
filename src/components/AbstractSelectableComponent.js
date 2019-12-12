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
      layers: this.renderLayers().concat(this.renderSelectionLayers()),
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
      <React.Fragment>
        <div className="d-flex">
          <ToolMenu {...toolProps} />
          {this.renderLayersMenu()}
        </div>
        <DeckGL ref={this.deckRef} {...deckProps} />
      </React.Fragment>
    );
  }
}
