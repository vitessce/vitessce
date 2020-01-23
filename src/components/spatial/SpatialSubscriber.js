import React from 'react';
import PubSub from 'pubsub-js';
import shortNumber from 'short-number';

import TitleInfo from '../TitleInfo';
import {
  IMAGES_ADD, MOLECULES_ADD, NEIGHBORHOODS_ADD, CELLS_ADD, CELLS_COLOR,
  STATUS_INFO, CELLS_SELECTION, CELLS_HOVER, CLEAR_PLEASE_WAIT, VIEW_INFO,
  CELL_SETS_VIEW, TIFF_ADD,
} from '../../events';
import Spatial from './Spatial';

export default class SpatialSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: undefined,
      cells: {},
      selectedCellIds: new Set(),
      cellColors: null,
      tiff: null,
    };
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  componentWillMount() {
    this.imagesAddToken = PubSub.subscribe(
      IMAGES_ADD, this.imagesAddSubscriber.bind(this),
    );
    this.moleculesAddToken = PubSub.subscribe(
      MOLECULES_ADD, this.moleculesAddSubscriber.bind(this),
    );
    this.neighborhoodsAddToken = PubSub.subscribe(
      NEIGHBORHOODS_ADD, this.neighborhoodsAddSubscriber.bind(this),
    );
    this.cellsAddToken = PubSub.subscribe(
      CELLS_ADD, this.cellsAddSubscriber.bind(this),
    );
    this.cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this),
    );
    this.cellSetsViewToken = PubSub.subscribe(
      CELL_SETS_VIEW, this.cellsSelectionSubscriber.bind(this),
    );
    this.cellsColorToken = PubSub.subscribe(
      CELLS_COLOR, this.cellsColorSubscriber.bind(this),
    );
    this.tiffAddToken = PubSub.subscribe(
      TIFF_ADD, this.tiffAddSubscriber.bind(this),
    );
  }

  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.imagesAddToken);
    PubSub.unsubscribe(this.moleculesAddToken);
    PubSub.unsubscribe(this.neighborhoodsAddToken);
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
    PubSub.unsubscribe(this.cellsColorToken);
    PubSub.unsubscribe(this.cellSetsViewToken);
    PubSub.unsubscribe(this.tiffAddToken);
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({ selectedCellIds: cellIds });
  }

  imagesAddSubscriber(msg, images) {
    this.setState({ images });
  }

  tiffAddSubscriber(msg, tiff) {
    this.setState({ tiff });
  }

  moleculesAddSubscriber(msg, molecules) {
    this.setState({ molecules });
  }

  neighborhoodsAddSubscriber(msg, neighborhoods) {
    this.setState({ neighborhoods });
  }

  cellsAddSubscriber(msg, cells) {
    this.setState({ cells });
  }

  cellsColorSubscriber(msg, cellColors) {
    this.setState({ cellColors });
  }

  render() {
    const { cells, molecules } = this.state;
    const { uuid = null, children } = this.props;
    const cellsCount = cells ? Object.keys(cells).length : 0;
    const moleculesCount = molecules ? Object.keys(molecules).length : 0;
    const locationsCount = molecules
      ? Object.values(molecules).map(l => l.length).reduce((a, b) => a + b, 0) : 0;
    return (
      /* eslint-disable react/destructuring-assignment */
      <TitleInfo
        title="Spatial"
        info={`${cellsCount} cells, ${moleculesCount} molecules
              at ${shortNumber(locationsCount)} locations`}
        componentWillUnmount={this.componentWillUnmount}
      >
        {children}
        <Spatial
          {... this.state}
          view={this.props.view}
          moleculeRadius={this.props.moleculeRadius}
          cellRadius={this.props.cellRadius}
          uuid={uuid}
          updateStatus={
            message => PubSub.publish(STATUS_INFO, message)
          }
          updateCellsSelection={
            selectedCellIds => PubSub.publish(CELLS_SELECTION, selectedCellIds)
          }
          updateCellsHover={
            hoverInfo => PubSub.publish(CELLS_HOVER, hoverInfo)
          }
          updateViewInfo={
            viewInfo => PubSub.publish(VIEW_INFO, viewInfo)
          }
          clearPleaseWait={
            layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
          }
        />
      </TitleInfo>
      /* eslint-enable */
    );
  }
}

SpatialSubscriber.defaultProps = {
  cellRadius: 50,
  moleculeRadius: 10,
};
