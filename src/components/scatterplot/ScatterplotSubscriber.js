/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import PubSub from 'pubsub-js';
import { extent } from 'd3-array';
import clamp from 'lodash/clamp';

import TitleInfo from '../TitleInfo';
import {
  CELLS_ADD, CELLS_COLOR, CELLS_HOVER, STATUS_INFO, VIEW_INFO, CELLS_SELECTION,
  CELL_SETS_VIEW, CLEAR_PLEASE_WAIT, RESET,
} from '../../events';
import { pluralize, capitalize } from '../../utils';
import { useDeckCanvasSize } from '../utils';
import Scatterplot from './Scatterplot';
import ScatterplotTooltipSubscriber from './ScatterplotTooltipSubscriber';

import { useCoordination } from '../../app/state/hooks';
import { componentCoordinationTypes } from '../../app/state/coordination';


export default function ScatterplotSubscriber(props) {
  const {
    uid,
    loaders,
    coordinationScopes,
    onReady,
    removeGridComponent,
    theme,
    disableTooltip = false,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
  } = props;

  const [{
    dataset,
    embeddingZoom: zoom,
    embeddingTarget: target,
    embeddingType: mapping,
  }, {
    setEmbeddingZoom: setZoom,
    setEmbeddingTarget: setTarget,
  }] = useCoordination(componentCoordinationTypes.scatterplot, coordinationScopes);

  const [isReady, setIsReady] = useState(false);
  const [cells, setCells] = useState({});
  const [selectedCellIds, setSelectedCellIds] = useState(new Set());
  const [cellColors, setCellColors] = useState(null);
  const [cellRadiusScale, setCellRadiusScale] = useState(0.2);
  const [urls, setUrls] = useState([]);

  const [width, height, deckRef] = useDeckCanvasSize();

  const onReadyCallback = useCallback(onReady, []);

  useEffect(() => {
    loaders[dataset]?.loaders['cells'].load().then((d) => {
      setCells(d);
      setIsReady(true);
    });
    
    onReadyCallback();
  }, [onReadyCallback, mapping, loaders, dataset]);

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
        zoom={zoom}
        target={target}
        setZoom={setZoom}
        setTarget={setTarget}
        cells={cells}
        mapping={mapping}
        selectedCellIds={selectedCellIds}
        cellColors={cellColors}
        cellRadiusScale={cellRadiusScale}
        updateStatus={message => PubSub.publish(STATUS_INFO, message)}
        updateCellsSelection={selectedIds => PubSub.publish(CELLS_SELECTION, selectedIds)}
        updateCellsHover={hoverInfo => PubSub.publish(CELLS_HOVER, hoverInfo)}
        updateViewInfo={viewInfo => PubSub.publish(VIEW_INFO, viewInfo)}
        clearPleaseWait={
          layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
        }
      />
      {!disableTooltip && (
      <ScatterplotTooltipSubscriber
        uuid={uid}
        width={width}
        height={height}
        getCellInfo={getCellInfo}
      />
      )}
    </TitleInfo>
  );
}
