import React from 'react';
import PubSub from 'pubsub-js';
import Genes from './Genes';

import { GENES_ADD, CELLS_COLOR } from '../../events';

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

  setSelectedGene(selectedId) {
    this.setState({ selectedId });
    const { genes } = this.state;
    const cellColors = {};

    const { cells, max } = genes[selectedId];
    Object.entries(cells).forEach(
      ([cellId, value]) => {
        const scaled = 255 * value / max;
        cellColors[cellId] = [scaled, scaled, scaled];
      },
    );
    PubSub.publish(CELLS_COLOR, cellColors);
  }

  render() {
    const { genes, selectedId } = this.state;
    const genesSelected = {
      [SHOW_ALL]: selectedId === SHOW_ALL,
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
