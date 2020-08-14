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
import { useDeckCanvasSize, useReady, useUrls, copyUint8Array } from '../utils';
import Heatmap from './Heatmap';
import HeatmapTooltipSubscriber from './HeatmapTooltipSubscriber';

import { useCoordination } from '../../app/state/hooks';
import { componentCoordinationTypes } from '../../app/state/coordination';

export default function HeatmapSubscriber(props) {
  const {
    uid,
    loaders,
    coordinationScopes,
    removeGridComponent, theme, transpose,
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

  const [isRendering, setIsRendering] = useState(false);
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    ['cells', 'cell-sets', 'expression-matrix'],
    Object.keys(loaders[dataset]?.loaders || {})
  );
  const [urls, addUrl, resetUrls] = useUrls();
  const [width, height, deckRef] = useDeckCanvasSize();


  const [cells, setCells] = useState();
  const [cellSets, setCellSets] = useState();
  const [expressionMatrix, setExpressionMatrix] = useState();
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [cellColors, setCellColors] = useState(null);

  useEffect(() => {
    resetUrls();
    resetReadyItems();

    loaders[dataset]?.loaders['cells']?.load().then(({ data, url }) => {
      setCells(data);
      addUrl(url, 'Cells');
      setItemIsReady('cells');
    });

    loaders[dataset]?.loaders['cell-sets']?.load().then(({ data, url }) => {
      setCellSets(data);
      addUrl(url, 'Cell Sets');
      setItemIsReady('cell-sets');
    });

    loaders[dataset]?.loaders['expression-matrix']?.load().then(({ data, url }) => {
      const [attrs, arr] = data;
      setExpressionMatrix({
        cols: attrs.cols,
        rows: attrs.rows,
        matrix: copyUint8Array(arr.data),
      });
      addUrl(url, 'Expression Matrix');
      setItemIsReady('expression-matrix');
    });

  }, [loaders, dataset]);

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
      isReady={isReady && !isRendering}
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
        setIsRendering={setIsRendering}
        updateCellsHover={hoverInfo => PubSub.publish(CELLS_HOVER, hoverInfo)}
        updateGenesHover={hoverInfo => PubSub.publish(GENES_HOVER, hoverInfo)}
        updateStatus={message => PubSub.publish(STATUS_INFO, message)}
        updateViewInfo={viewInfo => PubSub.publish(VIEW_INFO, viewInfo)}
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