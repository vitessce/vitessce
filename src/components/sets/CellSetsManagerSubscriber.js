import React from 'react';
import PubSub from 'pubsub-js';
import { CELL_SETS_MODIFY, CELLS_SELECTION } from '../../events';
import SetsManager from './SetsManager';
import TitleInfo from '../TitleInfo';
import HSets from './sets';

const cellSetTypeKey = 'cells';

export default class CellSetsManagerSubscriber extends React.Component {
  constructor(props) {
    super(props);
    const { datasetId } = props;
    this.state = {
      cellSets: new HSets(),
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
    /* PubSub.publish(CELLS_SELECTION, new Set(cellSets.currentSet)); */
  }

  cellsSelectionSubscriber(msg, cellIds) {
    const { cellSets } = this.state;
    /* this.setState({
      cellSets: Sets.setCurrentSet(cellSets, cellIds),
    }); */
  }

  render() {
    const { cellSets } = this.state;
    const { datasetId } = this.props;
    return (
      <TitleInfo
        title="Cell Sets"
        isScroll
      >
        <SetsManager
          setsTree={cellSets}
          onUpdateSets={(sets) => {
            PubSub.publish(CELL_SETS_MODIFY, sets);
          }}
        />
      </TitleInfo>
    );
  }
}
