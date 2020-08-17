/* eslint-disable */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PubSub from 'pubsub-js';

import TitleInfo from '../TitleInfo';
import {
  STATUS_INFO, VIEW_INFO,
} from '../../events';
import { pluralize, capitalize } from '../../utils';
import { useDeckCanvasSize, useReady, useUrls, warn } from '../utils';
import { getCellColors } from '../interpolate-colors';
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
    heatmapZoomX: zoomX,
    heatmapTargetX: targetX,
    heatmapTargetY: targetY,
    geneSelection,
  }, {
    setHeatmapZoomX: setZoomX,
    setHeatmapZoomY: setZoomY,
    setHeatmapTargetX: setTargetX,
    setHeatmapTargetY: setTargetY,
    setCellHighlight,
    setGeneHighlight,
  }] = useCoordination(componentCoordinationTypes.heatmap, coordinationScopes);

  const observationsTitle = capitalize(observationsPluralLabel);
  const variablesTitle = capitalize(variablesPluralLabel);


  // Create a UUID so that hover events
  // know from which element they were generated.
  const uuid = uid;

  const [isRendering, setIsRendering] = useState(false);
  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    ['cells', 'cell-sets', 'expression-matrix'],
  );
  const [urls, addUrl, resetUrls] = useUrls();
  const [width, height, deckRef] = useDeckCanvasSize();


  const [cells, setCells] = useState();
  const [cellSets, setCellSets] = useState();
  const [expressionMatrix, setExpressionMatrix] = useState();
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());

  useEffect(() => {
    resetUrls();
    resetReadyItems();

    if (!loaders[dataset]) {
      return;
    }

    if(loaders[dataset].loaders['cells']) {
      loaders[dataset].loaders['cells'].load().then(({ data, url }) => {
        setCells(data);
        addUrl(url, 'Cells');
        setItemIsReady('cells');
      });
    } else {
      setCells(null);
      console.warn("Heatmap component requires cells data type");
    }

    if(loaders[dataset].loaders['cell-sets']) {
      loaders[dataset].loaders['cell-sets'].load().catch(warn).then((payload) => {
        const { data, url } = payload || {};
        setCellSets(data);
        addUrl(url, 'Cell Sets');
        setItemIsReady('cell-sets');
      });
    } else {
      // Optional.
      setCellSets(null);
      setItemIsReady('cell-sets');
    }

    if(loaders[dataset].loaders['expression-matrix']) {
      loaders[dataset].loaders['expression-matrix'].load().then(({ data, url }) => {
        const [attrs, arr] = data;
        setExpressionMatrix({
          cols: attrs.cols,
          rows: attrs.rows,
          matrix: arr.data,
        });
        addUrl(url, 'Expression Matrix');
        setItemIsReady('expression-matrix');
      });
    } else {
      setExpressionMatrix(null);
      console.warn("Heatmap component requires expression-matrix data type");
    }

  }, [loaders, dataset]);

  const cellColors = useMemo(() => {
    return getCellColors({
      expressionMatrix,
      geneSelection,
      cellColorEncoding: 'geneSelection',
      // TODO: cell sets
    });
  }, [geneSelection]);

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
        viewState={{ zoom: zoomX, target: [targetX, targetY] }}
        setViewState={({ zoom, target }) => {
          setZoomX(zoom);
          setZoomY(zoom);
          setTargetX(target[0]);
          setTargetY(target[1]);
        }}
        height={height}
        width={width}
        theme={theme}
        uuid={uuid}
        expressionMatrix={expressionMatrix}
        cellColors={cellColors}
        setIsRendering={setIsRendering}
        setCellHighlight={setCellHighlight}
        setGeneHighlight={setGeneHighlight}
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
        coordinationScopes={coordinationScopes}
      />
      )}
    </TitleInfo>
  );
}