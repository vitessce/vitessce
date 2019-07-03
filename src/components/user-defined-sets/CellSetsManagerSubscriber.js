import React from 'react';
import PubSub from 'pubsub-js';
import { CELL_SETS } from '../../events';
import SetsManager from './SetsManager';
import TitleInfo from '../TitleInfo';

export default class CellSetsManagerSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { cellSets: null };
  }

  componentWillMount() {
    this.cellSetsToken = PubSub.subscribe(
      CELL_SETS, this.cellSetsSubscriber.bind(this),
    );
  }

  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellSetsToken);
  }

  cellSetsSubscriber(msg, cellSets) {
    this.setState({ cellSets });
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
        />
      </TitleInfo>
    );
  }
}
