import React from 'react';
import PubSub from 'pubsub-js';
import { interpolateViridis } from 'd3-scale-chromatic';

import Genes from './Genes';

import { GENES_ADD, CELLS_COLOR } from '../../events';

const SHOW_ALL = 'Show all';

function rgb(hexString) {
  return [
    parseInt(hexString.slice(1, 3), 16),
    parseInt(hexString.slice(3, 5), 16),
    parseInt(hexString.slice(5, 7), 16),
  ];
}

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
    const logMax = Math.log(max);
    Object.entries(cells).forEach(
      ([cellId, value]) => {
        cellColors[cellId] = rgb((interpolateViridis(Math.log(value) / logMax)));
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
