import React from 'react';
import PubSub from 'pubsub-js';
import Genes from './Genes';

import { GENES_ADD } from '../../events';

export default class GenesSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { genes: {} };
    this.setSelectedGene = this.setSelectedGene.bind(this);
  }

  componentWillMount() {
    this.genesAddToken = PubSub.subscribe(GENES_ADD, this.genesAddSubscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.genesAddToken);
  }

  genesAddSubscriber(msg, genes) {
    const genesObject = {};
    genes.forEach((gene) => { genesObject[gene] = false; });
    this.setState({ genes: genesObject });
  }

  setSelectedGene(geneId) {
    this.setState((state) => {
      const newState = { genes: {} };
      Object.keys(state.genes).forEach((k) => { newState.genes[k] = geneId === k; });
      return newState;
    });
  }

  render() {
    const { genes } = this.state;
    return (
      <Genes
        genesState={genes}
        setSelectedGene={this.setSelectedGene}
      />
    );
  }
}
