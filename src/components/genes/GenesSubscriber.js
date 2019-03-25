import React from 'react';
import PubSub from 'pubsub-js';

import Genes from './Genes';

import { SCROLL_CARD, TITLE_CARD } from '../classNames';
import { GENES_ADD, CELLS_COLOR } from '../../events';
import { interpolateColors } from '../utils';

export default class GenesSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { genes: {}, selectedId: null };
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
        cellColors[cellId] = interpolateColors(value / max);
      },
    );
    PubSub.publish(CELLS_COLOR, cellColors);
  }

  render() {
    const { genes, selectedId } = this.state;
    const genesSelected = {};
    const genesKeys = Object.keys(genes);
    genesKeys.forEach((geneId) => {
      genesSelected[geneId] = geneId === selectedId;
    });
    return (
      <React.Fragment>
        <div className={TITLE_CARD}>Genes ({genesKeys.length})</div>
        <div className={SCROLL_CARD}>
          <Genes
            genesSelected={genesSelected}
            setSelectedGene={this.setSelectedGene}
          />
        </div>
      </React.Fragment>
    );
  }
}
