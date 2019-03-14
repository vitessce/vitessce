import React from 'react';
import PubSub from 'pubsub-js';
import {
  IMAGES_ADD, MOLECULES_ADD, CELLS_ADD, CELLS_COLOR,
  STATUS_INFO, CELLS_SELECTION, CLEAR_PLEASE_WAIT,
} from '../../events';
import Spatial from './Spatial';

function clearPleaseWait() {
  PubSub.publish(CLEAR_PLEASE_WAIT, true);
}

export default class SpatialSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      background: undefined,
      cells: {},
      selectedCellIds: {},
      cellColors: null,
    };
  }

  componentWillMount() {
    this.imageAddToken = PubSub.subscribe(
      IMAGES_ADD, this.imageAddSubscriber.bind(this),
    );
    this.moleculesAddToken = PubSub.subscribe(
      MOLECULES_ADD, this.moleculesAddSubscriber.bind(this),
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
    PubSub.unsubscribe(this.imageAddToken);
    PubSub.unsubscribe(this.moleculesAddToken);
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
    PubSub.unsubscribe(this.cellsColorToken);
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({ selectedCellIds: cellIds });
  }

  imageAddSubscriber(msg, background) {
    this.setState({ background });
  }

  moleculesAddSubscriber(msg, molecules) {
    this.setState({ molecules });
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
        background={this.state.background}
        molecules={this.state.molecules}
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
