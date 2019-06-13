import React from 'react';
import PubSub from 'pubsub-js';

import TitleInfo from '../TitleInfo';
import {
  CELLS_COLOR, CLUSTERS_ADD, CELLS_SELECTION, CLEAR_PLEASE_WAIT,
} from '../../events';
import Heatmap from './Heatmap';

export default class HeatmapSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clusters: null, selectedCellIds: {}, cellColors: null,
    };
  }

  componentWillMount() {
    this.clustersAddToken = PubSub.subscribe(
      CLUSTERS_ADD, this.clustersAddSubscriber.bind(this),
    );
    this.cellsColorToken = PubSub.subscribe(
      CELLS_COLOR, this.cellsColorSubscriber.bind(this),
    );
    this.cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, this.cellsSelectionSubscriber.bind(this),
    );
  }

  componentDidMount() {
    const { onReady } = this.props;
    onReady();
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.clustersAddToken);
    PubSub.unsubscribe(this.cellsColorToken);
    PubSub.unsubscribe(this.cellsSelectionToken);
  }

  clustersAddSubscriber(msg, clusters) {
    this.setState({ clusters });
  }

  cellsSelectionSubscriber(msg, cellIds) {
    this.setState({ selectedCellIds: cellIds });
  }

  cellsColorSubscriber(msg, cellColors) {
    this.setState({ cellColors });
  }

  render() {
    const {
      clusters, selectedCellIds, cellColors,
    } = this.state;
    const cellsCount = clusters ? clusters.cols.length : 0;
    const genesCount = clusters ? clusters.rows.length : 0;
    const selectedCount = selectedCellIds ? Object.keys(selectedCellIds).length : 0;
    return (
      <TitleInfo
        title="Heatmap"
        info={`${cellsCount} cells × ${genesCount} genes,
               with ${selectedCount} cells selected`}
      >
        <Heatmap
          clusters={clusters}
          selectedCellIds={selectedCellIds}
          cellColors={cellColors}
          clearPleaseWait={
            layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
          }
        />
      </TitleInfo>
    );
  }
}
