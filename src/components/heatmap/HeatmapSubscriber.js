/* eslint-disable */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PubSub from 'pubsub-js';

import TitleInfo from '../TitleInfo';
import {
  CELLS_COLOR, CLUSTERS_ADD, CELLS_ADD, CELLS_SELECTION,
  CLEAR_PLEASE_WAIT, CELLS_HOVER, STATUS_INFO, CELL_SETS_VIEW,
} from '../../events';
import { useGridItemSize } from '../utils';
import Heatmap from './Heatmap';

export default function HeatmapSubscriber(props) {
  const { children, uuid, removeGridComponent, onReady } = props;

  const [cells, setCells] = useState({});
  const [clusters, setClusters] = useState(null);
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [cellColors, setCellColors] = useState(null);

  const onReadyCallback = useCallback(onReady, []);
  
  const [width, height, containerRef] = useGridItemSize("#deckgl-wrapper");

  useEffect(() => {

    const clustersAddToken = PubSub.subscribe(
      CLUSTERS_ADD, (msg, clusters) => {
        const [attrs, arr] = clusters;
    
        arr.get([null, null]).then(X => {
          setClusters({
            cols: attrs.var,
            rows: attrs.obs,
            matrix: X
          });
        });
      },
    );
    const cellsAddToken = PubSub.subscribe(
      CELLS_ADD, (msg, cells) => {
        setCells(cells);
      },
    );
    const cellsColorToken = PubSub.subscribe(
      CELLS_COLOR, (msg, cellColors) => {
        setCellColors(cellColors);
      },
    );
    const cellsSelectionToken = PubSub.subscribe(
      CELLS_SELECTION, (msg, cellIds) => {
        setSelectedCellIds(cellIds);
      },
    );
    const cellSetsViewToken = PubSub.subscribe(
      CELL_SETS_VIEW, (msg, cellIds) => {
        setSelectedCellIds(cellIds);
      },
    );
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(clustersAddToken);
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(cellsColorToken);
      PubSub.unsubscribe(cellsSelectionToken);
      PubSub.unsubscribe(cellSetsViewToken);
    }
  }, [onReadyCallback]);

  console.log(clusters);

  const cellsCount = clusters && clusters.rows ? clusters.rows.length : 0;
  const genesCount = clusters && clusters.cols ? clusters.cols.length : 0;
  const selectedCount = selectedCellIds ? selectedCellIds.size : 0;
  return (
    <TitleInfo
      title="Heatmap"
      info={`${cellsCount} cells × ${genesCount} genes,
              with ${selectedCount} cells selected`}
      removeGridComponent={removeGridComponent}
    >
      {children}
      <div ref={containerRef}>
        <Heatmap
          height={height}
          width={width}
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
      </div>
    </TitleInfo>
  );
}
