import React from 'react';
import PubSub from 'pubsub-js';
import { CELLS_ADD, CELLS_SELECTION } from '../../events';
import Heatmap from './Heatmap';

export default class HeatmapSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedCellIds: {}, cells: {} };
  }

  componentWillMount() {
    this.cellsAddToken = PubSub.subscribe(
      CELLS_ADD, this.cellsAddSubscriber.bind(this),
    );
    this.cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
  }

  cellsAddSubscriber(msg, data) {
    this.setState({ cells: data });
  }

  cellsSelectionSubscriber(msg, data) {
    this.setState({ selectedCellIds: data });
  }

  render() {
    const { cells, selectedCellIds } = this.state;
    const cellCount = Object.keys(cells).length;
    const selectionCount = Object.keys(selectedCellIds).length;
    return (
      <Heatmap
        value={`Cells: ${cellCount}; Selected: ${selectionCount}`}
      />
    );
  }
}
