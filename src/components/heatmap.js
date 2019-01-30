import React from 'react';
import PubSub from 'pubsub-js';
import PropTypes from 'prop-types';
import { CELLS } from '../events';

export class HeatmapSubscriber extends React.Component {
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
      <Heatmap value={this.state.value}></Heatmap>
    );
  }
}

export function Heatmap(props) {
  // The real business logic goes inside.
  return (
    <p>heatmap placeholder: {props.value}</p>
  );
}

Heatmap.propTypes = {
  value: PropTypes.string
}
