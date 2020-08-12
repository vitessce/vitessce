/* eslint-disable */
import React, { useEffect, useState, useCallback } from 'react';
import PubSub from 'pubsub-js';

import TitleInfo from '../TitleInfo';
import {
  CELLS_COLOR, CELLS_ADD, CELLS_SELECTION,
  CLEAR_PLEASE_WAIT, CELLS_HOVER, STATUS_INFO, CELL_SETS_VIEW,
  RESET, EXPRESSION_MATRIX_ADD, VIEW_INFO, GENES_HOVER,
} from '../../events';
import { pluralize, capitalize } from '../../utils';
import { useDeckCanvasSize, copyUint8Array } from '../utils';
import Heatmap from './Heatmap';
import HeatmapTooltipSubscriber from './HeatmapTooltipSubscriber';

import { useCoordination } from '../../app/state/mappers';
import { componentCoordinationTypes } from '../../app/state/coordination';

export default function HeatmapSubscriber(props) {
  const {
    uid,
    loaders,
    coordinationScopes,
    removeGridComponent, onReady, theme, transpose,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
    variablesLabelOverride: variablesLabel = 'gene',
    variablesPluralLabelOverride: variablesPluralLabel = `${variablesLabel}s`,
    disableTooltip = false,
  } = props;

  const [{
    dataset,
    heatmapZoom: zoom,
    heatmapTarget: target,
  }, {
    setHeatmapZoom: setZoom,
    setHeatmapTarget: setTarget,
  }] = useCoordination(componentCoordinationTypes.heatmap, coordinationScopes);

  const observationsTitle = capitalize(observationsPluralLabel);
  const variablesTitle = capitalize(variablesPluralLabel);


  // Create a UUID so that hover events
  // know from which element they were generated.
  const uuid = uid;

  const [isReady, setIsReady] = useState(false);
  const [cells, setCells] = useState();
  const [cellSets, setCellSets] = useState();
  const [expressionMatrix, setExpressionMatrix] = useState();
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [cellColors, setCellColors] = useState(null);
  const [urls, setUrls] = useState([]);

  const onReadyCallback = useCallback(onReady, []);

  const [width, height, deckRef] = useDeckCanvasSize();

  useEffect(() => {

    loaders[dataset]?.loaders['cells'].load().then((data) => {
      setCells(data);
    });

    loaders[dataset]?.loaders['cell-sets'].load().then((data) => {
      setCellSets(data);
    });

    loaders[dataset]?.loaders['expression-matrix'].load().then((data) => {
      const [attrs, arr] = data;
      setExpressionMatrix({
        cols: attrs.cols,
        rows: attrs.rows,
        matrix: copyUint8Array(arr.data),
      });
      setIsReady(true);
    });

    onReadyCallback();
  }, [onReadyCallback, loaders, dataset]);

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
      info={`${cellsCount} ${pluralize(observationsLabel, observationsPluralLabel, cellsCount)} × ${genesCount} ${pluralize(variablesLabel, variablesPluralLabel, genesCount)},
             with ${selectedCount} ${pluralize(observationsLabel, observationsPluralLabel, selectedCount)} selected`}
      urls={urls}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
    >
      <Heatmap
        ref={deckRef}
        transpose={transpose}
        zoom={zoom}
        target={target}
        setZoom={setZoom}
        setTarget={setTarget}
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