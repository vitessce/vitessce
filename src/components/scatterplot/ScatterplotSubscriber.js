import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { extent } from 'd3-array';
import clamp from 'lodash/clamp';
import isEqual from 'lodash/isEqual';
import TitleInfo from '../TitleInfo';
import { pluralize, capitalize } from '../../utils';
import { useDeckCanvasSize, useReady, useUrls } from '../hooks';
import { setCellSelection, mergeCellSets } from '../utils';
import { getCellSetPolygons } from '../sets/cell-set-utils';
import {
  useCellsData,
  useCellSetsData,
  useGeneSelection,
  useExpressionAttrs,
} from '../data-hooks';
import { getCellColors } from '../interpolate-colors';
import Scatterplot from './Scatterplot';
import ScatterplotTooltipSubscriber from './ScatterplotTooltipSubscriber';
import ScatterplotOptions from './ScatterplotOptions';
import {
  useCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

const SCATTERPLOT_DATA_TYPES = ['cells', 'expression-matrix', 'cell-sets'];

/**
 * A subscriber component for the scatterplot.
 * @param {object} props
 * @param {number} props.uuid The unique identifier for this component.
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {boolean} props.disableTooltip Should the tooltip be disabled?
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title An override value for the component title.
 */
export default function ScatterplotSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    removeGridComponent,
    theme,
    disableTooltip = false,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
    title: titleOverride,
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

  // Get "props" from the coordination space.
  const [{
    dataset,
    embeddingZoom: zoom,
    embeddingTargetX: targetX,
    embeddingTargetY: targetY,
    embeddingTargetZ: targetZ,
    embeddingType: mapping,
    cellFilter,
    cellHighlight,
    geneSelection,
    cellSetSelection,
    cellSetColor,
    cellColorEncoding,
    additionalCellSets,
    embeddingCellSetPolygonsVisible: cellSetPolygonsVisible,
    embeddingCellSetLabelsVisible: cellSetLabelsVisible,
    embeddingCellSetLabelSize: cellSetLabelSize,
    embeddingCellRadius: cellRadius,
  }, {
    setEmbeddingZoom: setZoom,
    setEmbeddingTargetX: setTargetX,
    setEmbeddingTargetY: setTargetY,
    setEmbeddingTargetZ: setTargetZ,
    setCellFilter,
    setCellSetSelection,
    setCellHighlight,
    setCellSetColor,
    setCellColorEncoding,
    setAdditionalCellSets,
    setEmbeddingCellSetPolygonsVisible: setCellSetPolygonsVisible,
    setEmbeddingCellSetLabelsVisible: setCellSetLabelsVisible,
    setEmbeddingCellSetLabelSize: setCellSetLabelSize,
    setEmbeddingCellRadius: setCellRadius,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.scatterplot, coordinationScopes);

  const [urls, addUrl, resetUrls] = useUrls();
  const [width, height, deckRef] = useDeckCanvasSize();
  const [
    isReady,
    setItemIsReady,
    setItemIsNotReady, // eslint-disable-line no-unused-vars
    resetReadyItems,
  ] = useReady(
    SCATTERPLOT_DATA_TYPES,
  );

  const title = titleOverride || `Scatterplot (${mapping})`;

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  const [cells, cellsCount] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);
  const [cellSets] = useCellSetsData(
    loaders,
    dataset,
    setItemIsReady,
    addUrl,
    false,
    { setCellSetSelection, setCellSetColor },
    { cellSetSelection, cellSetColor },
  );
  const [expressionData] = useGeneSelection(
    loaders, dataset, setItemIsReady, false, geneSelection, setItemIsNotReady,
  );
  const [attrs] = useExpressionAttrs(
    loaders, dataset, setItemIsReady, addUrl, false,
  );
  const [cellRadiusScale, setCellRadiusScale] = useState(0.2);

  const mergedCellSets = useMemo(() => mergeCellSets(
    cellSets, additionalCellSets,
  ), [cellSets, additionalCellSets]);

  const setCellSelectionProp = useCallback((v) => {
    setCellSelection(
      v, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
    );
  }, [additionalCellSets, cellSetColor, setCellColorEncoding,
    setAdditionalCellSets, setCellSetColor, setCellSetSelection]);

  const cellColors = useMemo(() => getCellColors({
    cellColorEncoding,
    expressionData: expressionData && expressionData[0],
    geneSelection,
    cellSets: mergedCellSets,
    cellSetSelection,
    cellSetColor,
    expressionDataAttrs: attrs,
  }), [cellColorEncoding, geneSelection, mergedCellSets,
    cellSetSelection, cellSetColor, expressionData, attrs]);

  // cellSetPolygonCache is an array of tuples like [(key0, val0), (key1, val1), ...],
  // where the keys are cellSetSelection arrays.
  const [cellSetPolygonCache, setCellSetPolygonCache] = useState([]);
  const cacheHas = (cache, key) => cache.findIndex(el => isEqual(el[0], key)) !== -1;
  const cacheGet = (cache, key) => cache.find(el => isEqual(el[0], key))?.[1];
  const cellSetPolygons = useMemo(() => {
    if ((cellSetLabelsVisible || cellSetPolygonsVisible)
      && !cacheHas(cellSetPolygonCache, cellSetSelection)
      && mergedCellSets?.tree?.length
      && Object.values(cells).length
      && cellSetColor?.length) {
      const newCellSetPolygons = getCellSetPolygons({
        cells,
        mapping,
        cellSets: mergedCellSets,
        cellSetSelection,
        cellSetColor,
      });
      setCellSetPolygonCache(cache => [...cache, [cellSetSelection, newCellSetPolygons]]);
      return newCellSetPolygons;
    }
    return cacheGet(cellSetPolygonCache, cellSetSelection) || [];
  }, [cellSetPolygonsVisible, cellSetPolygonCache, cellSetLabelsVisible,
    cells, mapping, mergedCellSets, cellSetSelection, cellSetColor]);


  const cellSelection = useMemo(() => Array.from(cellColors.keys()), [cellColors]);

  // After cells have loaded or changed,
  // compute the cell radius scale based on the
  // extents of the cell coordinates on the x/y axes.
  useEffect(() => {
    const cellValues = cells && Object.values(cells);
    if (cellValues?.length) {
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
      } if (typeof targetX !== 'number' || typeof targetY !== 'number') {
        const newTargetX = xExtent[0] + xRange / 2;
        const newTargetY = yExtent[0] + yRange / 2;
        const newZoom = Math.log2(Math.min(width / xRange, height / yRange));
        setTargetX(newTargetX);
        // Graphics rendering has the y-axis going south so we need to multiply by negative one.
        setTargetY(-newTargetY);
        setZoom(newZoom);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cells, mapping]);

  const getCellInfo = useCallback((cellId) => {
    const cellInfo = cells[cellId];
    return {
      [`${capitalize(observationsLabel)} ID`]: cellId,
      ...(cellInfo ? cellInfo.factors : {}),
    };
  }, [cells, observationsLabel]);

  return (
    <TitleInfo
      title={title}
      info={`${cellsCount} ${pluralize(observationsLabel, observationsPluralLabel, cellsCount)}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      options={(
        <ScatterplotOptions
          observationsLabel={observationsLabel}
          cellRadius={cellRadius}
          setCellRadius={setCellRadius}
          cellSetLabelsVisible={cellSetLabelsVisible}
          setCellSetLabelsVisible={setCellSetLabelsVisible}
          cellSetLabelSize={cellSetLabelSize}
          setCellSetLabelSize={setCellSetLabelSize}
          cellSetPolygonsVisible={cellSetPolygonsVisible}
          setCellSetPolygonsVisible={setCellSetPolygonsVisible}
          cellColorEncoding={cellColorEncoding}
          setCellColorEncoding={setCellColorEncoding}
        />
      )}
    >
      <Scatterplot
        ref={deckRef}
        uuid={uuid}
        theme={theme}
        viewState={{ zoom, target: [targetX, targetY, targetZ] }}
        setViewState={({ zoom: newZoom, target }) => {
          setZoom(newZoom);
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
        cellSetPolygons={cellSetPolygons}

        cellSetLabelSize={cellSetLabelSize}
        cellSetLabelsVisible={cellSetLabelsVisible}
        cellSetPolygonsVisible={cellSetPolygonsVisible}

        setCellFilter={setCellFilter}
        setCellSelection={setCellSelectionProp}
        setCellHighlight={setCellHighlight}
        cellRadiusScale={cellRadiusScale * cellRadius}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
      />
      {!disableTooltip && (
      <ScatterplotTooltipSubscriber
        parentUuid={uuid}
        cellHighlight={cellHighlight}
        width={width}
        height={height}
        getCellInfo={getCellInfo}
      />
      )}
    </TitleInfo>
  );
}
