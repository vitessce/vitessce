import React from 'react';
import PubSub from 'pubsub-js';
import PropTypes from 'prop-types';

import { STATUS } from '../events';

export class MessagesSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {message: undefined};
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
  return props.message
    ? <p>{props.message}</p>
    : <p>Sample data is available <a href='https://github.com/hms-dbmi/vitessce-data/tree/master/fake-files/output-expected'>here</a>.</p>;
}

Message.propTypes = {
  message: PropTypes.string
}
