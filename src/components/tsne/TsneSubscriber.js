import React from 'react';
import PubSub from 'pubsub-js';
import {
  CELLS_ADD, CELLS_SELECTION, STATUS_INFO, SELECTION_MODE_SET,
} from '../../events';
import Tsne from './Tsne';
import AbstractSelectionSubscriberComponent from '../AbstractSelectionSubscriberComponent';


export default class TsneSubscriber extends AbstractSelectionSubscriberComponent {
  constructor(props) {
    super(props);
    this.state = { cells: {}, selectedCellIds: {} };
  }

  componentWillMount() {
    this.cellsAddToken = PubSub.subscribe(CELLS_ADD, this.cellsAddSubscriber.bind(this));

    this.cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this),
    );
    this.selectionModeSetToken = PubSub.subscribe(
      SELECTION_MODE_SET, this.selectionModeSetSubscriber.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsAddToken);

    PubSub.unsubscribe(this.cellsSelectionToken);
    PubSub.unsubscribe(this.selectionModeSetToken);
  }

  cellsAddSubscriber(msg, cells) {
    this.setState({ cells });
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({ selectedCellIds: cellIds });
  }

  render() {
    return (
      <Tsne
        cells={this.state.cells}
        selectedCellIds={this.state.selectedCellIds}
        isRectangleSelection={this.state.isRectangleSelection}
        updateStatus={message => PubSub.publish(STATUS_INFO, message)}
        updateCellsSelection={selectedCellIds => PubSub.publish(CELLS_SELECTION, selectedCellIds)}
      />
    );
  }
}
