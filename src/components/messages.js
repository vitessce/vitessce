import React from 'react';
import PubSub from 'pubsub-js';
import PropTypes from 'prop-types';

import { STATUS } from '../events';

export class MessagesSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {message: ''};
  }

  componentWillMount() {
    this.token = PubSub.subscribe(STATUS, this.subscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.token);
  }

  subscriber(msg, data) {
    this.setState({message: data});
  }

  render() {
    return (
      <Message message={this.state.message}></Message>
    );
  }
}

export function Message(props) {
  return (
    <p>{props.message}</p>
  );
}

Message.propTypes = {
  message: PropTypes.string
}
