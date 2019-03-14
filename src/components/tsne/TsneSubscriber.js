import React from 'react';
import PubSub from 'pubsub-js';
import {
  CELLS_ADD, CELLS_SELECTION, CELLS_COLOR, STATUS_INFO,
} from '../../events';
import Tsne from './Tsne';


export default class TsneSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { cells: {}, selectedCellIds: {}, cellColors: {} };
  }

  componentWillMount() {
    this.cellsAddToken = PubSub.subscribe(
      CELLS_ADD, this.cellsAddSubscriber.bind(this),
    );
    this.cellsColorToken = PubSub.subscribe(
      CELLS_COLOR, this.cellsColorSubscriber.bind(this),
    );
    this.cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellsColorToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({ selectedCellIds: cellIds });
  }

  cellsColorSubscriber(msg, cellColors) {
    this.setState({ cellColors });
  }

  cellsAddSubscriber(msg, cells) {
    this.setState({ cells });
  }

  render() {
    return (
      /* eslint-disable react/destructuring-assignment */
      <Tsne
        cells={this.state.cells}
        selectedCellIds={this.state.selectedCellIds}
        cellColors={this.state.cellColors}
        updateStatus={message => PubSub.publish(STATUS_INFO, message)}
        updateCellsSelection={selectedCellIds => PubSub.publish(CELLS_SELECTION, selectedCellIds)}
      />
      /* eslint-enable */
    );
  }
}
