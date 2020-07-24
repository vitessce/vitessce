/* eslint-disable */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PubSub from 'pubsub-js';

import TitleInfo from '../TitleInfo';
import {
  CELLS_COLOR, CELLS_ADD, CELLS_SELECTION,
  CLEAR_PLEASE_WAIT, CELLS_HOVER, STATUS_INFO, CELL_SETS_VIEW,
  RESET, EXPRESSION_MATRIX_ADD, VIEW_INFO, GENES_HOVER,
} from '../../events';
import { useGridItemSize } from '../utils';
import Heatmap from './Heatmap';
import HeatmapTooltipSubscriber from './HeatmapTooltipSubscriber';

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
      EXPRESSION_MATRIX_ADD, (msg, { data }) => {
        const [attrs, arr] = data;
        
        // Get the full zarr array (all chunks & flat).
        arr.getRaw([null, null]).then(X => {
          setClusters({
            cols: attrs.cols,
            rows: attrs.rows,
            matrix: X
          });
        });
      },
    );
    const cellsAddToken = PubSub.subscribe(
      CELLS_ADD, (msg, { data }) => {
        setCells(data);
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

  const getCellInfo = useCallback((cellId) => {
    const cellInfo = cells[cellId];
    return {
      'Cell ID': cellId,
      ...(cellInfo ? cellInfo.factors : {}),
    };
  }, [cells]);
  const getGeneInfo = useCallback((geneId) => {
    return {
      'Gene ID': geneId,
    };
  }, []);

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
          clusters={clusters}
          cellColors={cellColors}
          updateCellsHover={hoverInfo => PubSub.publish(CELLS_HOVER, hoverInfo)}
          updateGenesHover={hoverInfo => PubSub.publish(GENES_HOVER, hoverInfo)}
          updateStatus={message => PubSub.publish(STATUS_INFO, message)}
          updateViewInfo={viewInfo => PubSub.publish(VIEW_INFO, viewInfo)}
          clearPleaseWait={
            layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
          }
        />
        <HeatmapTooltipSubscriber
          uuid={uuid}
          width={width}
          height={height}
          transpose={transpose}
          getCellInfo={getCellInfo}
          getGeneInfo={getGeneInfo}
        />
      </div>
    </TitleInfo>
  );
}
