import React from 'react';
import PubSub from 'pubsub-js';
import { CELL_SETS_MODIFY, CELLS_SELECTION } from '../../events';
import SetsManager from './SetsManager';
import TitleInfo from '../TitleInfo';
import * as Sets from './sets';

const cellSetTypeKey = 'cells';

export default class CellSetsManagerSubscriber extends React.Component {
  constructor(props) {
    super(props);
    const { datasetId } = props;
    this.state = {
      cellSets: Sets.restore(cellSetTypeKey, datasetId),
    };
  }

  componentWillMount() {
    this.cellSetsToken = PubSub.subscribe(
      CELL_SETS_MODIFY, this.cellSetsSubscriber.bind(this),
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
    PubSub.unsubscribe(this.cellSetsToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
  }

  cellSetsSubscriber(msg, cellSets) {
    this.setState({ cellSets });
    PubSub.publish(CELLS_SELECTION, new Set(cellSets.currentSet));
  }

  cellsSelectionSubscriber(msg, cellIds) {
    const { cellSets } = this.state;
    this.setState({
      cellSets: Sets.setCurrentSet(cellSets, cellIds),
    });
  }

  render() {
    const { cellSets } = this.state;
    const { datasetId } = this.props;
    return (
      <TitleInfo
        title="Cell Sets"
        info={`${cellSets.namedSets.size} set${cellSets.namedSets.size !== 1 ? 's' : ''}`}
        isScroll
      >
        <SetsManager
          sets={cellSets}
          onUpdateSets={(sets) => {
            PubSub.publish(CELL_SETS_MODIFY, sets);
            Sets.persist(sets, cellSetTypeKey, datasetId);
          }}
        />
      </TitleInfo>
    );
  }
}
