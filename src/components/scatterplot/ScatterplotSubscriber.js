/* eslint-disable */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PubSub from 'pubsub-js';
import { extent } from 'd3-array';
import clamp from 'lodash/clamp';
import TitleInfo from '../TitleInfo';
import { VIEW_INFO } from '../../events';
import { pluralize, capitalize } from '../../utils';
import { useDeckCanvasSize, useReady, useUrls, getCellColors } from '../utils';
import Scatterplot from './Scatterplot';
import ScatterplotTooltipSubscriber from './ScatterplotTooltipSubscriber';
import { useCoordination } from '../../app/state/hooks';
import { componentCoordinationTypes } from '../../app/state/coordination';


export default function ScatterplotSubscriber(props) {
  const {
    uid,
    loaders,
    coordinationScopes,
    removeGridComponent,
    theme,
    disableTooltip = false,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
  } = props;

  const [{
    dataset,
    embeddingZoom: zoom,
    embeddingTargetX: targetX,
    embeddingTargetY: targetY,
    embeddingTargetZ: targetZ,
    embeddingType: mapping,
    cellFilter,
    cellSelection,
    cellHighlight,
    geneSelection,
  }, {
    setEmbeddingZoom: setZoom,
    setEmbeddingTargetX: setTargetX,
    setEmbeddingTargetY: setTargetY,
    setEmbeddingTargetZ: setTargetZ,
    setCellFilter,
    setCellSelection,
    setCellHighlight,
  }] = useCoordination(componentCoordinationTypes.scatterplot, coordinationScopes);

  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    ['cells', 'expression-matrix'],
  );
  const [urls, addUrl, resetUrls] = useUrls();
  const [width, height, deckRef] = useDeckCanvasSize();

  const [cells, setCells] = useState({});
  const [cellRadiusScale, setCellRadiusScale] = useState(0.2);
  const [expressionMatrix, setExpressionMatrix] = useState();

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
      // If no cells loader is available, set cells to null.
      setCells({});
      // But do not set cells to ready,
      // since cells are not optional for scatterplot.
      console.warn('Scatterplot component requires cells data type.');
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
      // If no expression matrix loader was provided,
      // just clear the expression matrix state.
      setExpressionMatrix(null);
      // Expression matrix is optional for scatterplot.
      setItemIsReady('expression-matrix')
    }
  }, [mapping, loaders, dataset]);

  const cellColors = useMemo(() => {
    return getCellColors({
      expressionMatrix,
      geneSelection,
      cellColorEncoding: 'geneSelection',
      // TODO: cell sets
    })
  }, [geneSelection]);

  // After cells have loaded or changed,
  // compute the cell radius scale based on the
  // extents of the cell coordinates on the x/y axes.
  useEffect(() => {
    if (cells) {
      const cellCoordinates = Object.values(cells)
        .map(c => c.mappings[mapping]);
      const xExtent = extent(cellCoordinates, c => c[0]);
      const yExtent = extent(cellCoordinates, c => c[1]);
      const xRange = xExtent[1] - xExtent[0];
      const yRange = yExtent[1] - yExtent[0];
      const diagonalLength = Math.sqrt((xRange ** 2) + (yRange ** 2));
      // The 300 value here is a heuristic.
      const newScale = clamp(diagonalLength / 300, 0, 0.2);
      if (newScale) {
        setCellRadiusScale(newScale);
      }
    }
  }, [cells, mapping]);

  const getCellInfo = useCallback((cellId) => {
    const cellInfo = cells[cellId];
    return {
      [`${capitalize(observationsLabel)} ID`]: cellId,
      ...(cellInfo ? cellInfo.factors : {}),
    };
  }, [cells, observationsLabel]);

  const cellsCount = Object.keys(cells).length;
  return (
    <TitleInfo
      title={`Scatterplot (${mapping})`}
      info={`${cellsCount} ${pluralize(observationsLabel, observationsPluralLabel, cellsCount)}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
    >
      <Scatterplot
        ref={deckRef}
        uuid={uid}
        theme={theme}
        viewState={{ zoom, target: [targetX, targetY, targetZ] }}
        setViewState={({ zoom, target }) => {
          setZoom(zoom);
          setTargetX(target[0]);
          setTargetY(target[1]);
          setTargetZ(target[2]);
        }}
        cells={cells}
        mapping={mapping}
        cellFilter={cellFilter}
        cellSelection={cellSelection}
        cellHighlight={cellHighlight}
        cellColors={cellColors}

        setCellFilter={setCellFilter}
        setCellSelection={setCellSelection}
        setCellHighlight={setCellHighlight}

        cellRadiusScale={cellRadiusScale}
        
        updateViewInfo={viewInfo => PubSub.publish(VIEW_INFO, viewInfo)}
      />
      {!disableTooltip && (
      <ScatterplotTooltipSubscriber
        uuid={uid}
        width={width}
        height={height}
        getCellInfo={getCellInfo}
        coordinationScopes={coordinationScopes}
      />
      )}
    </TitleInfo>
  );
}
