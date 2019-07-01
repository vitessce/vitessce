import React from 'react';
import PubSub from 'pubsub-js';
import fromEntries from 'fromentries';

import { CELLS_HOVER, CLUSTERS_ADD, GENES_HOVER } from '../../events';
import CellTooltip1DVertical from './CellTooltip1DVertical';

export default class CellTooltip1DVerticalSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.clusterColMap = null;
    this.clusterRowMap = null;
    this.state = {
      hoveredCellInfo: null,
      hoveredGeneInfo: null,
    };
  }

  componentWillMount() {
    this.cellsHoverToken = PubSub.subscribe(
      CELLS_HOVER, this.cellsHoverSubscriber.bind(this),
    );
    this.clustersAddToken = PubSub.subscribe(
      CLUSTERS_ADD, this.clustersAddSubscriber.bind(this),
    );
    this.genesHoverToken = PubSub.subscribe(
      GENES_HOVER, this.genesHoverSubscriber.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsHoverToken);
    PubSub.unsubscribe(this.clustersAddToken);
    PubSub.unsubscribe(this.genesHoverToken);
  }

  cellsHoverSubscriber(msg, hoverInfo) {
    const { hoveredCellInfo } = this.state;
    if (!hoveredCellInfo || !hoverInfo
        || (hoveredCellInfo && hoverInfo && hoveredCellInfo.cellId !== hoverInfo.cellId)) {
      this.setState({ hoveredCellInfo: hoverInfo });
    }
  }

  clustersAddSubscriber(msg, clusters) {
    this.clusterColMap = fromEntries(clusters.cols.map((cellId, i) => [cellId, i]));
    this.clusterRowMap = fromEntries(clusters.rows.map((geneId, i) => [geneId, i]));
  }

  genesHoverSubscriber(msg, hoverInfo) {
    const { hoveredGeneInfo } = this.state;
    if (!hoveredGeneInfo || !hoverInfo
        || (hoveredGeneInfo && hoverInfo && hoveredGeneInfo.geneId !== hoverInfo.geneId)) {
      this.setState({ hoveredGeneInfo: hoverInfo });
    }
  }

  render() {
    const { uuid } = this.props;
    const { hoveredCellInfo, hoveredGeneInfo } = this.state;
    // It is possible that hoveredCellInfo is null if the mouse leaves a cell.
    if (!hoveredCellInfo || !this.clusterColMap) {
      return null;
    }
    const cellIndex = this.clusterColMap[hoveredCellInfo.cellId];
    const geneIndex = (hoveredGeneInfo ? this.clusterRowMap[hoveredGeneInfo.geneId] : null);
    const numCells = Object.keys(this.clusterColMap).length;
    const numGenes = Object.keys(this.clusterRowMap).length;
    return (
      <CellTooltip1DVertical
        hoveredCellInfo={hoveredCellInfo}
        cellIndex={cellIndex}
        numCells={numCells}
        hoveredGeneInfo={hoveredGeneInfo}
        geneIndex={geneIndex}
        numGenes={numGenes}
        uuid={uuid}
      />
    );
  }
}
