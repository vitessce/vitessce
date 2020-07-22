/* eslint-disable */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PubSub from 'pubsub-js';

import TitleInfo from '../TitleInfo';
import {
  CELLS_COLOR, CELLS_ADD, CELLS_SELECTION,
  CLEAR_PLEASE_WAIT, CELLS_HOVER, STATUS_INFO, CELL_SETS_VIEW,
  RESET, EXPRESSION_MATRIX_ADD,
} from '../../events';
import { useGridItemSize } from '../utils';
import Heatmap from './Heatmap';

export default function HeatmapSubscriber(props) {
  const { children, uuid, removeGridComponent, onReady, theme, transpose } = props;

  const [cells, setCells] = useState({});
  const [clusters, setClusters] = useState(null);
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [cellColors, setCellColors] = useState(null);
  const [urls, setUrls] = useState([]);

  const onReadyCallback = useCallback(onReady, []);
  
  const [width, height, containerRef] = useGridItemSize("#deckgl-wrapper");

  useEffect(() => {
    const expressionMatrixAddToken = PubSub.subscribe(
      EXPRESSION_MATRIX_ADD, (msg, { data, url }) => {
        const [attrs, arr] = data;
        
        // Get the full zarr array (all chunks & flat).
        arr.getRaw([null, null]).then(X => {
          setClusters({
            cols: attrs.cols,
            rows: attrs.rows,
            matrix: X
          });
        });

        setUrls((prevUrls) => {
          const newUrls = [...prevUrls].concat({ url, name: 'Genes' });
          return newUrls;
        });
      },
    );
    const cellsAddToken = PubSub.subscribe(
      CELLS_ADD, (msg, { data, url }) => {
        setCells(data);
        setUrls((prevUrls) => {
          const newUrls = [...prevUrls].concat({ url, name: 'Cells' });
          return newUrls;
        });
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
    const resetToken = PubSub.subscribe(RESET, () => setUrls([]));
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(expressionMatrixAddToken);
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(cellsColorToken);
      PubSub.unsubscribe(cellsSelectionToken);
      PubSub.unsubscribe(cellSetsViewToken);
      PubSub.unsubscribe(resetToken);
    }
  }, [onReadyCallback]);

  const cellsCount = clusters && clusters.rows ? clusters.rows.length : 0;
  const genesCount = clusters && clusters.cols ? clusters.cols.length : 0;
  const selectedCount = selectedCellIds ? selectedCellIds.size : 0;
  return (
    <TitleInfo
      title="Heatmap"
      info={`${cellsCount} cells × ${genesCount} genes,
              with ${selectedCount} cells selected`}
        urls={urls}
        theme={theme}
      removeGridComponent={removeGridComponent}
    >
      {children}
      <div ref={containerRef}>
        <Heatmap
          transpose={transpose}
          height={height}
          width={width}
          theme={theme}
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
