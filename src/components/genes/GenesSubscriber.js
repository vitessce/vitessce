import React from 'react';
import PubSub from 'pubsub-js';
import Genes from './Genes';

import { GENES_ADD } from '../../events';

const SHOW_ALL = 'Show all';

export default class GenesSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { genes: {}, selectedId: SHOW_ALL };
    this.setSelectedGene = this.setSelectedGene.bind(this);
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

  setSelectedGene(geneId) {
    this.setState({ selectedId: geneId });
  }

  render() {
    const { genes, selectedId } = this.state;
    const genesSelected = {
      SHOW_ALL: selectedId === SHOW_ALL,
    };
    Object.keys(genes).forEach((geneId) => {
      genesSelected[geneId] = geneId === selectedId;
    });
    return (
      <Genes
        genesSelected={genesSelected}
        setSelectedGene={this.setSelectedGene}
      />
    );
  }
}
