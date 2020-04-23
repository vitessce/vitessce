import React from 'react';
import PubSub from 'pubsub-js';
import {
  CELL_SETS_MODIFY, CELL_SETS_VIEW, CELLS_SELECTION,
  CELLS_ADD, STATUS_WARN, CELLS_COLOR, CELL_SETS_ADD,
  CLEAR_PLEASE_WAIT,
} from '../../events';
import SetsManager from './SetsManager';
import TitleInfo from '../TitleInfo';
import SetsTree from './sets';

const setsType = 'cell';

export default class CellSetsManagerSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cellSets: new SetsTree(
        (obj) => {
          PubSub.publish(CELL_SETS_MODIFY, obj);
        },
        (cellIds, cellColors) => {
          PubSub.publish(CELLS_COLOR, cellColors);
          PubSub.publish(CELL_SETS_VIEW, cellIds);
        },
      ),
    };
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.cellsAddToken = PubSub.subscribe(
      CELLS_ADD, this.cellsAddSubscriber.bind(this),
    );
    this.cellSetsAddToken = PubSub.subscribe(
      CELL_SETS_ADD, this.cellSetsAddSubscriber.bind(this),
    );
    this.cellSetsModifyToken = PubSub.subscribe(
      CELL_SETS_MODIFY, this.cellSetsModifySubscriber.bind(this),
    );
    this.cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this),
    );
  }

  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellSetsAddToken);
    PubSub.unsubscribe(this.cellSetsModifyToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
  }

  cellsAddSubscriber(msg, cells) {
    const { cellSets } = this.state;
    cellSets.setItems(Object.keys(cells));
  }

  cellSetsAddSubscriber(msg, cellSetsData) {
    const { cellSets } = this.state;
    cellSets.import(cellSetsData.tree, null, true);
  }

  cellSetsModifySubscriber(msg, cellSets) {
    this.setState({ cellSets });
  }

  cellsSelectionSubscriber(msg, cellIds) {
    const { cellSets } = this.state;
    cellSets.setCurrentSet(cellIds, true);
  }

  render() {
    const { cellSets, gridResizeEvent } = this.state;
    const { removeGridComponent } = this.props;
    return (
      <TitleInfo
        title="Cell Sets"
        isScroll
        removeGridComponent={removeGridComponent}
      >
        <SetsManager
          setsTree={cellSets}
          setsType={setsType}
          onError={err => PubSub.publish(STATUS_WARN, err)}
          gridResizeEvent={gridResizeEvent}
          clearPleaseWait={
            layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
          }
        />
      </TitleInfo>
    );
  }
}
