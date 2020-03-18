import React from 'react';
import PubSub from 'pubsub-js';
import Status from './Status';

import { STATUS_WARN, STATUS_INFO } from '../../events';

export default class StatusSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { warn: null, info: null };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.warnToken = PubSub.subscribe(STATUS_WARN, this.warnSubscriber.bind(this));
    this.infoToken = PubSub.subscribe(STATUS_INFO, this.infoSubscriber.bind(this));
  }

  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.warnToken);
    PubSub.unsubscribe(this.infoToken);
  }

  warnSubscriber(msg, data) {
    this.setState(prevState => ({ warn: data, info: prevState.info }));
  }

  infoSubscriber(msg, data) {
    this.setState(prevState => ({ info: data, warn: prevState.warn }));
  }

  render() {
    const { warn, info } = this.state;
    const { removeGridComponent } = this.props;
    return (
      <Status warn={warn} info={info} removeGridComponent={removeGridComponent} />
    );
  }
}
