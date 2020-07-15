import React, { useState, useEffect, useCallback } from 'react';
import PubSub from 'pubsub-js';

import TitleInfo from '../TitleInfo';
import {
  CELLS_COLOR, CLUSTERS_ADD, CELLS_ADD, CELLS_SELECTION,
  CLEAR_PLEASE_WAIT, CELLS_HOVER, STATUS_INFO, CELL_SETS_VIEW,
} from '../../events';
import Heatmap from './Heatmap';

export default function HeatmapSubscriber(props) {
  const {
    children,
    uuid,
    removeGridComponent,
    onReady,
    theme,
  } = props;
  const [cells, setCells] = useState({});
  const [clusters, setClusters] = useState({});
  const [cellColors, setCellColors] = useState({});
  const [selectedCellIds, setSelectedCellIds] = useState({});
  const [urls, setUrls] = useState([]);

  const onReadyCallback = useCallback(onReady, []);

  useEffect(() => {
    function clustersAddSubscriber(msg, { data, url }) {
      setClusters(data);
      setUrls((prevUrls) => {
        const newUrls = [...prevUrls].concat({ url, name: 'Clusters' });
        return newUrls;
      });
    }
    function cellsAddSubscriber(msg, { data, url }) {
      setCells(data);
      setUrls((prevUrls) => {
        const newUrls = [...prevUrls].concat({ url, name: 'Cells' });
        return newUrls;
      });
    }
    function cellsSelectionSubscriber(msg, cellIds) {
      setSelectedCellIds(cellIds);
    }
    function cellsColorSubscriber(msg, newCellColors) {
      setCellColors(newCellColors);
    }
    const clustersAddToken = PubSub.subscribe(
      CLUSTERS_ADD, clustersAddSubscriber,
    );
    const cellsAddToken = PubSub.subscribe(
      CELLS_ADD, cellsAddSubscriber,
    );
    const cellsColorToken = PubSub.subscribe(
      CELLS_COLOR, cellsColorSubscriber,
    );
    const cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, cellsSelectionSubscriber,
    );
    const cellSetsViewToken = PubSub.subscribe(
      CELL_SETS_VIEW, cellsSelectionSubscriber,
    );
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(clustersAddToken);
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(cellsColorToken);
      PubSub.unsubscribe(cellsSelectionToken);
      PubSub.unsubscribe(cellSetsViewToken);
    };
  }, [onReadyCallback]);
  // eslint-disable-next-line
  const cellsCount = clusters.cols ? clusters.cols.length : 0;
  const genesCount = clusters.rows ? clusters.rows.length : 0;
  const selectedCount = selectedCellIds ? selectedCellIds.size : 0;
  const allReady = cellsCount && genesCount && selectedCount;
  return (
    <TitleInfo
      title="Heatmap"
      info={`${cellsCount} cells × ${genesCount} genes,
              with ${selectedCount} cells selected`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
    >
      {children}
      {
        allReady
          ? (
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
          )
          : null
      }
    </TitleInfo>
  );
}
