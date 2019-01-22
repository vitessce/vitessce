import React from 'react';
import PubSub from 'pubsub-js';

import { CELL } from '../events';

export class TsneSubscriber extends React.Component {
  // All the pubsub communication goes in the wrapper class.
  constructor(props) {
    super(props);
    this.state = {value: ''};
  }

  componentWillMount() {
    this.token = PubSub.subscribe(CELL, this.subscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  subscriber(msg, data) {
    console.warn('Spatial component received:', msg, data);
    this.setState({value: data});
  }

  render() {
    return (
      <Tsne value={this.state.value}></Tsne>
    );
  }
}

export function Tsne(props) {
  // The real business logic goes inside.
  return (
    <p>tsne: {props.value}</p>
  );
}
