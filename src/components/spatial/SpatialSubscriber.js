import React from 'react';
import PubSub from 'pubsub-js';
import {
  IMAGES_ADD, MOLECULES_ADD, NEIGHBORHOODS_ADD, CELLS_ADD, CELLS_COLOR,
  STATUS_INFO, CELLS_SELECTION, CLEAR_PLEASE_WAIT,
} from '../../events';
import Spatial from './Spatial';

function clearPleaseWait(layerName) {
  PubSub.publish(CLEAR_PLEASE_WAIT, layerName);
}

export default class SpatialSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: undefined,
      cells: {},
      selectedCellIds: {},
      cellColors: null,
    };
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
    this.cellsColorToken = PubSub.subscribe(
      CELLS_COLOR, this.cellsColorSubscriber.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.imagesAddToken);
    PubSub.unsubscribe(this.moleculesAddToken);
    PubSub.unsubscribe(this.neighborhoodsAddToken);
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
    PubSub.unsubscribe(this.cellsColorToken);
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({ selectedCellIds: cellIds });
  }

  imagesAddSubscriber(msg, images) {
    this.setState({ images });
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
    return (
      /* eslint-disable react/destructuring-assignment */
      <Spatial
        images={this.state.images}
        molecules={this.state.molecules}
        neighborhoods={this.state.neighborhoods}
        cells={this.state.cells}
        selectedCellIds={this.state.selectedCellIds}
        cellColors={this.state.cellColors}
        updateStatus={message => PubSub.publish(STATUS_INFO, message)}
        updateCellsSelection={selectedCellIds => PubSub.publish(CELLS_SELECTION, selectedCellIds)}
        clearPleaseWait={clearPleaseWait}
      />
      /* eslint-enable */
    );
  }
}
