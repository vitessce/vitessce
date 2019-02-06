import React from 'react';
import PubSub from 'pubsub-js';
import Status from './Status'

import { STATUS_WARN, STATUS_INFO } from '../../events';

export class StatusSubscriber extends React.Component {
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
      <Status warn={this.state.warn} message={this.state.message}/>
    );
  }
}
