import React from 'react';
import PubSub from 'pubsub-js';
import {
  FACTORS_ADD, CELL_SETS_MODIFY, CELL_SETS_VIEW, CELLS_SELECTION, CELLS_ADD,
} from '../../events';
import SetsManager from './SetsManager';
import TitleInfo from '../TitleInfo';
import SetsTree, { SetsTreeNode } from './sets';

export default class CellSetsManagerSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cellSets: new SetsTree(
        (obj) => {
          PubSub.publish(CELL_SETS_MODIFY, obj);
        },
        (cellIds) => {
          PubSub.publish(CELL_SETS_VIEW, cellIds);
        },
      ),
    };
  }

  componentWillMount() {
    this.cellsAddToken = PubSub.subscribe(
      CELLS_ADD, this.cellsAddSubscriber.bind(this),
    );
    this.cellSetsToken = PubSub.subscribe(
      CELL_SETS_MODIFY, this.cellSetsSubscriber.bind(this),
    );
    this.cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this),
    );
    this.factorsAddToken = PubSub.subscribe(
      FACTORS_ADD, this.factorsAddSubscriber.bind(this),
    );
  }

  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellSetsToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
    PubSub.unsubscribe(this.factorsAddToken);
  }

  cellsAddSubscriber(msg, cells) {
    const { cellSets } = this.state;
    cellSets.setItems(Object.keys(cells));
  }

  cellSetsSubscriber(msg, cellSets) {
    this.setState({ cellSets });
  }

  cellsSelectionSubscriber(msg, cellIds) {
    const { cellSets } = this.state;
    cellSets.setCurrentSet(cellIds, true);
  }

  /**
   * TODO: remove this function when the concept of factors is
   * removed in favor of the hierarchical cell set representation.
   */
  factorsAddSubscriber(msg, factors) {
    const { cellSets } = this.state;
    const clusters = factors.cluster.map.map((clusterKey, clusterIndex) => new SetsTreeNode({
      setKey: `all.${clusterKey}`,
      name: clusterKey,
      set: Object.entries(factors.cluster.cells).filter(c => c[1] === clusterIndex).map(c => c[0]),
    }));

    cellSets.appendChild(new SetsTreeNode({
      setKey: 'all.factors',
      name: 'Factors',
      children: clusters,
    }));

    this.setState({ cellSets });
  }

  render() {
    const { cellSets } = this.state;
    return (
      <TitleInfo
        title="Cell Sets"
        isScroll
      >
        <SetsManager
          setsTree={cellSets}
        />
      </TitleInfo>
    );
  }
}
