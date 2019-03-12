import React from 'react';
import PubSub from 'pubsub-js';
import Genes from './Genes';

import { GENES_ADD } from '../../events';

export default class GenesSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { genes: null };
  }

  componentWillMount() {
    this.genesAddToken = PubSub.subscribe(GENES_ADD, this.genesAddSubscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.genesAddToken);
  }

  genesAddSubscriber(msg, genes) {
    this.setState({ genes });
  }

  render() {
    const { genes } = this.state;
    return (
      <Genes genes={genes} />
    );
  }
}
