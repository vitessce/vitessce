import React from 'react';
import PubSub from 'pubsub-js';
import { CELL_SETS, CELLS_SELECTION } from '../../events';
import SetsManager from './SetsManager';
import TitleInfo from '../TitleInfo';
import Sets from './sets';

export default class CellSetsManagerSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cellSets: Sets.initialState,
    };
  }

  componentWillMount() {
    this.cellSetsToken = PubSub.subscribe(
      CELL_SETS, this.cellSetsSubscriber.bind(this),
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
  }

  cellsSelectionSubscriber(msg, cellIds) {
    const { cellSets } = this.state;
    this.setState({
      cellSets: Sets.setCurrentSet(cellSets, cellIds),
    });
  }

  render() {
    const { cellSets } = this.state;
    return (
      <TitleInfo
        title="Cell Sets"
        info={`${0} sets`}
        isScroll
      >
        <SetsManager
          sets={cellSets}
          onUpdateSets={sets => PubSub.publish(CELL_SETS, sets)}
        />
      </TitleInfo>
    );
  }
}
