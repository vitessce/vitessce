import React from 'react';
import PubSub from 'pubsub-js';

import TitleInfo from '../TitleInfo';
import {
  CELLS_ADD, CELLS_SELECTION, CELLS_COLOR, CELLS_HOVER, STATUS_INFO,
} from '../../events';
import Scatterplot from './Scatterplot';


export default class ScatterplotSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cells: {}, selectedCellIds: {}, cellColors: null, hoveredCellId: null,
    };
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
    this.cellsHoverToken = PubSub.subscribe(
      CELLS_HOVER, this.cellsHoverSubscriber.bind(this),
    );
  }

  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellsColorToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
    PubSub.unsubscribe(this.cellsHoverToken);
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({ selectedCellIds: cellIds });
  }

  cellsHoverSubscriber(msg, cellId) {
    this.setState({ hoveredCellId: cellId });
  }

  cellsColorSubscriber(msg, cellColors) {
    this.setState({ cellColors });
  }

  cellsAddSubscriber(msg, cells) {
    this.setState({ cells });
  }

  render() {
    const {
      cells, selectedCellIds, hoveredCellId, cellColors,
    } = this.state;
    const { mapping } = this.props;
    const cellsCount = Object.keys(cells).length;
    return (
      <TitleInfo
        title={`Scatterplot (${mapping})`}
        info={`${cellsCount} cells`}
      >
        <Scatterplot
          cells={cells}
          mapping={mapping}
          selectedCellIds={selectedCellIds}
          hoveredCellId={hoveredCellId}
          cellColors={cellColors}
          updateStatus={message => PubSub.publish(STATUS_INFO, message)}
          updateCellsSelection={selectedIds => PubSub.publish(CELLS_SELECTION, selectedIds)}
          updateCellsHover={hoveredId => PubSub.publish(CELLS_HOVER, hoveredId)}
        />
      </TitleInfo>
    );
  }
}
