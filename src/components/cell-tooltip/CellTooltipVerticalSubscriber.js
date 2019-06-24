import React from 'react';
import PubSub from 'pubsub-js';
import fromEntries from 'fromentries';

import { CELLS_HOVER, CLUSTERS_ADD } from '../../events';
import CellTooltipVertical from './CellTooltipVertical';

export default class CellTooltipVerticalSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.clusterColMap = null;
    this.state = {
      hoveredCellInfo: null,
    };
  }

  componentWillMount() {
    this.cellsHoverToken = PubSub.subscribe(
      CELLS_HOVER, this.cellsHoverSubscriber.bind(this),
    );
    this.clustersAddToken = PubSub.subscribe(
      CLUSTERS_ADD, this.clustersAddSubscriber.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsHoverToken);
    PubSub.unsubscribe(this.clustersAddToken);
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
  }

  render() {
    const {
      uuid,
    } = this.props;
    const {
      hoveredCellInfo,
    } = this.state;
    // It is possible that hoveredCellInfo is null if the mouse leaves a cell.
    if (!hoveredCellInfo || !this.clusterColMap) {
      return null;
    }
    const cellIndex = this.clusterColMap[hoveredCellInfo.cellId];
    const numCells = Object.keys(this.clusterColMap).length;
    return (
      <CellTooltipVertical
        hoveredCellInfo={hoveredCellInfo}
        cellIndex={cellIndex}
        numCells={numCells}
        uuid={uuid}
      />
    );
  }
}
