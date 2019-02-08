import React from 'react';
import PubSub from 'pubsub-js';
import { CELLS_ADD, CELLS_SELECTION, STATUS_INFO } from '../../events';
import Tsne from './Tsne';

export class TsneSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {cells: {}, selectedCellIds: {}};
  }

  componentWillMount() {
    this.cellsAddToken = PubSub.subscribe(CELLS_ADD, this.cellsAddSubscriber.bind(this));
    this.cellsSelectionToken = PubSub.subscribe(CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
  }

  cellsAddSubscriber(msg, cells) {
    this.setState({cells: cells});
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({selectedCellIds: cellIds});
  }

  render() {
    return (
      <Tsne
        cells={this.state.cells}
        selectedCellIds={this.state.selectedCellIds}
        updateStatus={(message) => PubSub.publish(STATUS_INFO, message)}
        updateCellsSelection={(selectedCellIds) => PubSub.publish(CELLS_SELECTION, selectedCellIds)}
      />
    );
  }
}
