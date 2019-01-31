import React from 'react';
import PubSub from 'pubsub-js';
import { CELLS_ADD } from '../../events';
import Tsne from './Tsne';

export class TsneSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
  }

  componentWillMount() {
    this.moleculesToken = PubSub.subscribe(CELLS_ADD, this.cellsAddSubscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.moleculesToken);
  }

  cellsAddSubscriber(msg, cells) {
    this.setState({cells: cells});
  }

  render() {
    return (
      <Tsne cells={this.state.cells}></Tsne>
    );
  }
}
