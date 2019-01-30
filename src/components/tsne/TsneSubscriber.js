import React from 'react';
import PubSub from 'pubsub-js';
import { CELLS } from '../../events';
import Tsne from './Tsne';

export class TsneSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
  }

  componentWillMount() {
    this.token = PubSub.subscribe(CELLS, this.subscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  subscriber(msg, data) {
    this.setState({value: `${Object.keys(data).length} cells`});
  }

  render() {
    return (
      <Tsne value={this.state.value}></Tsne>
    );
  }
}
