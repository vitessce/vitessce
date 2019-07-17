import React from 'react';
import PubSub from 'pubsub-js';

import TitleInfo from '../TitleInfo';
import {
  CELLS_COLOR, CLUSTERS_ADD, CELLS_ADD, CELLS_SELECTION,
  CLEAR_PLEASE_WAIT, CELLS_HOVER, STATUS_INFO, CELL_SETS_VIEW,
} from '../../events';
import Heatmap from './Heatmap';

export default class HeatmapSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cells: {}, clusters: null, selectedCellIds: new Set(), cellColors: null,
    };
  }

  componentWillMount() {
    this.clustersAddToken = PubSub.subscribe(
      CLUSTERS_ADD, this.clustersAddSubscriber.bind(this),
    );
    this.cellsAddToken = PubSub.subscribe(
      CELLS_ADD, this.cellsAddSubscriber.bind(this),
    );
    this.cellsColorToken = PubSub.subscribe(
      CELLS_COLOR, this.cellsColorSubscriber.bind(this),
    );
    this.cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this),
    );
    this.cellSetsViewToken = PubSub.subscribe(
      CELL_SETS_VIEW, this.cellsSelectionSubscriber.bind(this),
    );
  }

  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.clustersAddToken);
    PubSub.unsubscribe(this.cellsAddToken);
    PubSub.unsubscribe(this.cellsColorToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
    PubSub.unsubscribe(this.cellSetsViewToken);
  }

  clustersAddSubscriber(msg, clusters) {
    this.setState({ clusters });
  }

  cellsAddSubscriber(msg, cells) {
    this.setState({ cells });
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({ selectedCellIds: cellIds });
  }

  cellsColorSubscriber(msg, cellColors) {
    this.setState({ cellColors });
  }

  render() {
    const {
      cells, clusters, selectedCellIds, cellColors,
    } = this.state;
    const cellsCount = clusters ? clusters.cols.length : 0;
    const genesCount = clusters ? clusters.rows.length : 0;
    const selectedCount = selectedCellIds ? selectedCellIds.size : 0;
    const { children, uuid } = this.props;
    return (
      <TitleInfo
        title="Heatmap"
        info={`${cellsCount} cells × ${genesCount} genes,
               with ${selectedCount} cells selected`}
      >
        {children}
        <Heatmap
          uuid={uuid}
          cells={cells}
          clusters={clusters}
          selectedCellIds={selectedCellIds}
          cellColors={cellColors}
          updateCellsHover={hoverInfo => PubSub.publish(CELLS_HOVER, hoverInfo)}
          updateStatus={message => PubSub.publish(STATUS_INFO, message)}
          clearPleaseWait={
            layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
          }
        />
      </TitleInfo>
    );
  }
}
