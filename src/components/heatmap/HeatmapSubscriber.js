import React, { useEffect, useState, useCallback } from 'react';
import PubSub from 'pubsub-js';
import uuidv4 from 'uuid/v4';

import TitleInfo from '../TitleInfo';
import {
  CELLS_COLOR, CELLS_ADD, CELLS_SELECTION,
  CLEAR_PLEASE_WAIT, CELLS_HOVER, STATUS_INFO, CELL_SETS_VIEW,
  RESET, EXPRESSION_MATRIX_ADD, VIEW_INFO, GENES_HOVER,
} from '../../events';
import { useDeckCanvasSize, pluralize, capitalize } from '../utils';
import Heatmap from './Heatmap';
import HeatmapTooltipSubscriber from './HeatmapTooltipSubscriber';

export default function HeatmapSubscriber(props) {
  const {
    removeGridComponent, onReady, theme, transpose,
    observationsLabelOverride: observationsLabel = 'cell',
    variablesLabelOverride: variablesLabel = 'gene',
    disableTooltip = false,
  } = props;

  const observationsTitle = capitalize(pluralize(observationsLabel));
  const variablesTitle = capitalize(pluralize(variablesLabel));


  // Create a UUID so that hover events
  // know from which element they were generated.
  const uuid = uuidv4();

  const [cells, setCells] = useState();
  const [expressionMatrix, setExpressionMatrix] = useState();
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [cellColors, setCellColors] = useState(null);
  const [urls, setUrls] = useState([]);

  const onReadyCallback = useCallback(onReady, []);

  const [width, height, deckRef] = useDeckCanvasSize();

  useEffect(() => {
    const expressionMatrixAddToken = PubSub.subscribe(
      EXPRESSION_MATRIX_ADD, (msg, { data }) => {
        const [attrs, arr] = data;

        // Get the full zarr array (all chunks & flat).
        arr.getRaw([null, null]).then((X) => {
          setExpressionMatrix({
            cols: attrs.cols,
            rows: attrs.rows,
            matrix: X.data,
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
      CELLS_COLOR, (msg, newCellColors) => {
        setCellColors(newCellColors);
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
    const resetToken = PubSub.subscribe(RESET, () => {
      setUrls([]);
      setCells(null);
      setExpressionMatrix(null);
      setCellColors(null);
      setSelectedCellIds(new Set());
    });
    onReadyCallback();
    return () => {
      PubSub.unsubscribe(expressionMatrixAddToken);
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(cellsColorToken);
      PubSub.unsubscribe(cellsSelectionToken);
      PubSub.unsubscribe(cellSetsViewToken);
      PubSub.unsubscribe(resetToken);
    };
  }, [onReadyCallback]);

  const getCellInfo = useCallback((cellId) => {
    if (cellId) {
      const cellInfo = cells[cellId];
      return {
        [`${capitalize(observationsLabel)} ID`]: cellId,
        ...(cellInfo ? cellInfo.factors : {}),
      };
    }
    return null;
  }, [cells, observationsLabel]);
  const getGeneInfo = useCallback((geneId) => {
    if (geneId) {
      return { [`${capitalize(variablesLabel)} ID`]: geneId };
    }
    return null;
  }, [variablesLabel]);

  const cellsCount = expressionMatrix && expressionMatrix.rows
    ? expressionMatrix.rows.length : 0;
  const genesCount = expressionMatrix && expressionMatrix.cols
    ? expressionMatrix.cols.length : 0;
  const selectedCount = selectedCellIds ? selectedCellIds.size : 0;
  return (
    <TitleInfo
      title="Heatmap"
      info={`${cellsCount} ${pluralize(observationsLabel, cellsCount)} × ${genesCount} ${pluralize(variablesLabel, genesCount)},
              with ${selectedCount} ${pluralize(observationsLabel, selectedCount)} selected`}
      urls={urls}
      theme={theme}
      removeGridComponent={removeGridComponent}
    >
      <Heatmap
        ref={deckRef}
        transpose={transpose}
        height={height}
        width={width}
        theme={theme}
        uuid={uuid}
        expressionMatrix={expressionMatrix}
        cellColors={cellColors}
        updateCellsHover={hoverInfo => PubSub.publish(CELLS_HOVER, hoverInfo)}
        updateGenesHover={hoverInfo => PubSub.publish(GENES_HOVER, hoverInfo)}
        updateStatus={message => PubSub.publish(STATUS_INFO, message)}
        updateViewInfo={viewInfo => PubSub.publish(VIEW_INFO, viewInfo)}
        clearPleaseWait={
          layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
        }
        observationsTitle={observationsTitle}
        variablesTitle={variablesTitle}
      />
      {!disableTooltip && (
      <HeatmapTooltipSubscriber
        uuid={uuid}
        width={width}
        height={height}
        transpose={transpose}
        getCellInfo={getCellInfo}
        getGeneInfo={getGeneInfo}
      />
      )}
    </TitleInfo>
  );
}
