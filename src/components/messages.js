import React from 'react';
import PubSub from 'pubsub-js';
import PropTypes from 'prop-types';

import { STATUS_WARN, STATUS_INFO } from '../events';

export class MessagesSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {message: undefined};
  }

  componentWillMount() {
    this.warnToken = PubSub.subscribe(STATUS_WARN, this.warnSubscriber.bind(this));
    this.infoToken = PubSub.subscribe(STATUS_INFO, this.infoSubscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.warnToken);
    PubSub.unsubscribe(this.infoToken);
  }

  warnSubscriber(msg, data) {
    this.setState({warn: true, message: data});
  }

  infoSubscriber(msg, data) {
    this.setState({warn: false, message: data});
  }

  render() {
    return (
      <Message warn={this.state.warn} message={this.state.message}></Message>
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
