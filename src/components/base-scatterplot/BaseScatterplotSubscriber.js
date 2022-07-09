import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { extent } from 'd3-array';
import isEqual from 'lodash/isEqual';
import TitleInfo from '../TitleInfo';
import { pluralize, capitalize } from '../../utils';
import { useDeckCanvasSize, useExpressionValueGetter } from '../hooks';
import { setCellSelection, mergeCellSets } from '../utils';
import { getCellSetPolygons } from '../sets/cell-set-utils';
import {
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
  useSetComponentHover,
  useSetComponentViewInfo,
} from '../../app/state/hooks';
import {
  getPointSizeDevicePixels,
  getPointOpacity,
} from '../shared-spatial-scatterplot/dynamic-opacity';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

export const BASE_SCATTERPLOT_DATA_TYPES = ['cells', 'expression-matrix', 'cell-sets'];

/**
   * A subscriber component for a base scatterplot to be used by other subscriber components.
   * @param {object} props
   * @param {number} props.uuid The unique identifier for this component.
   * @param {string} props.theme The current theme name.
   * @param {object} props.coordinationScopes The mapping from coordination types to coordination
   * scopes.
   * @param {object} props.loaders The return values from loaders to keep the hooks from the parent
   * subscriber component and this subscriber in sync.
   * @param {object} props.useReadyData The return values from useReadyData to keep the hooks from
   * the parent subscriber component and this subscriber in sync.
   * @param {object} props.urlsData The return values from useUrls to keep the hooks from the parent
   * subscriber component and this subscriber in sync.
   * @param {object} props.cellsData [cells, cellsCount] either from useCellsData or another source.
   * @param {string} props.mapping The name of the mapping to plot from the cells data.
   * @param {object} props.customOptions Custom options to be rendered in the component's options.
   * @param {object} props.hideTools Should the DeckGL tools be hidden?
   * @param {object} props.cellsEmptyMessage Message to display if no cells are present.
   * @param {object} props.getCellInfoOverride Function to override the getCellInfo callback
   * for the scatterplot info tooltip.
   * @param {object} props.cellSetsPolygonCacheId An identifier for cell sets polygon cache.
   * Change this when something modifies the values of the cell mappings (e.g. log transform)
   * or for any other case that warrants a new cellSetsPolygonCache.
   * @param {boolean} props.disableTooltip Should the tooltip be disabled?
   * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
   * to call when the component has been removed from the grid.
   * @param {string} props.title The component title.
   * @param {number} props.averageFillDensity Override the average fill density calculation
   * when using dynamic opacity mode.
   */
export default function BaseScatterplotSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    removeGridComponent,
    theme,
    disableTooltip = false,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
    title,
    // Average fill density for dynamic opacity calculation.
    averageFillDensity,
    loaders,
    useReadyData,
    urlsData,
    cellsData,
    mapping,
    customOptions,
    hideTools = false,
    cellsEmptyMessage,
    getCellInfoOverride,
    cellSetsPolygonCacheId = '',
  } = props;

  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

  // Get "props" from the coordination space.
  const [{
    dataset,
    embeddingZoom: zoom,
    embeddingTargetX: targetX,
    embeddingTargetY: targetY,
    embeddingTargetZ: targetZ,
    obsFilter: cellFilter,
    obsHighlight: cellHighlight,
    featureSelection: geneSelection,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    obsColorEncoding: cellColorEncoding,
    additionalObsSets: additionalCellSets,
    embeddingObsSetPolygonsVisible: cellSetPolygonsVisible,
    embeddingObsSetLabelsVisible: cellSetLabelsVisible,
    embeddingObsSetLabelSize: cellSetLabelSize,
    embeddingObsRadius: cellRadiusFixed,
    embeddingObsRadiusMode: cellRadiusMode,
    embeddingObsOpacity: cellOpacityFixed,
    embeddingObsOpacityMode: cellOpacityMode,
    featureValueColormap: geneExpressionColormap,
    featureValueColormapRange: geneExpressionColormapRange,
  }, {
    setEmbeddingZoom: setZoom,
    setEmbeddingTargetX: setTargetX,
    setEmbeddingTargetY: setTargetY,
    setEmbeddingTargetZ: setTargetZ,
    setObsFilter: setCellFilter,
    setObsSetSelection: setCellSetSelection,
    setObsHighlight: setCellHighlight,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setAdditionalObsSets: setAdditionalCellSets,
    setEmbeddingObsSetPolygonsVisible: setCellSetPolygonsVisible,
    setEmbeddingObsSetLabelsVisible: setCellSetLabelsVisible,
    setEmbeddingObsSetLabelSize: setCellSetLabelSize,
    setEmbeddingObsRadius: setCellRadiusFixed,
    setEmbeddingObsRadiusMode: setCellRadiusMode,
    setEmbeddingObsOpacity: setCellOpacityFixed,
    setEmbeddingObsOpacityMode: setCellOpacityMode,
    setFeatureValueColormap: setGeneExpressionColormap,
    setFeatureValueColormapRange: setGeneExpressionColormapRange,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.scatterplot, coordinationScopes);

  // Get data from parent loaders via the props.
  const [urls, addUrl, resetUrls] = urlsData;
  const [isReady, setItemIsReady, setItemIsNotReady, resetReadyItems] = useReadyData;
  const [cells, cellsCount] = cellsData;

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  const [width, height, deckRef] = useDeckCanvasSize();

  // Get data from loaders using the data hooks.
  const [cellSets] = useCellSetsData(
    loaders,
    dataset,
    setItemIsReady,
    addUrl,
    false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
  );
  const [expressionData] = useGeneSelection(
    loaders, dataset, setItemIsReady, false, geneSelection, setItemIsNotReady,
  );
  const [attrs] = useExpressionAttrs(
    loaders, dataset, setItemIsReady, addUrl, false,
  );

  const [dynamicCellRadius, setDynamicCellRadius] = useState(cellRadiusFixed);
  const [dynamicCellOpacity, setDynamicCellOpacity] = useState(cellOpacityFixed);

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
    theme,
  }), [cellColorEncoding, geneSelection, mergedCellSets, theme,
    cellSetSelection, cellSetColor, expressionData, attrs]);

  // cellSetPolygonCache is map of a namespace string to an array of tuples
  // like [(key0, val0), (key1, val1), ...] where the keys are cellSetSelection arrays.
  // We use different cache namespaces so that we don't return the same polygon when the
  // mapping changes or anything used to compose the cellSetsPolygonCacheId changes.
  const [cellSetPolygonCache, setCellSetPolygonCache] = useState({});
  const cacheHas = (cache, namespace, key) => cache[namespace]
    && cache[namespace].findIndex(el => isEqual(el[0], key)) !== -1;
  const cacheGet = (cache, namespace, key) => cache[namespace]
    && cache[namespace].find(el => isEqual(el[0], key))?.[1];
  const cellSetPolygons = useMemo(() => {
    const polygonCacheNamespace = `${mapping}${cellSetsPolygonCacheId}`;
    if ((cellSetLabelsVisible || cellSetPolygonsVisible)
        && !cacheHas(cellSetPolygonCache, polygonCacheNamespace, cellSetSelection)
        && mergedCellSets?.tree?.length
        && Object.values(cells).length
        && cellSetColor?.length) {
      const newCellSetPolygons = getCellSetPolygons({
        cells,
        mapping,
        cellSets: mergedCellSets,
        cellSetSelection,
        cellSetColor,
        theme,
      });
      setCellSetPolygonCache((cache) => {
        const modifyingCache = cache;
        modifyingCache[polygonCacheNamespace] = [cache, [cellSetSelection, newCellSetPolygons]];
        return modifyingCache;
      });
      return newCellSetPolygons;
    }
    return cacheGet(cellSetPolygonCache, polygonCacheNamespace, cellSetSelection) || [];
  }, [cellSetLabelsVisible, cellSetPolygonsVisible, cellSetPolygonCache,
    cellSetsPolygonCacheId, cellSetSelection, mergedCellSets, cells,
    cellSetColor, mapping, theme]);


  const cellSelection = useMemo(() => Array.from(cellColors.keys()), [cellColors]);

  const [xRange, yRange, xExtent, yExtent, numCells] = useMemo(() => {
    const cellValues = cells && Object.values(cells);
    if (cellValues?.length) {
      const cellCoordinates = Object.values(cells)
        .map(c => c.mappings[mapping]);
      const xE = extent(cellCoordinates, c => c[0]);
      const yE = extent(cellCoordinates, c => c[1]);
      const xR = xE[1] - xE[0];
      const yR = yE[1] - yE[0];
      return [xR, yR, xE, yE, cellValues.length];
    }
    return [null, null, null, null, null];
  }, [cells, mapping]);

  // Reset the zoom and recenter the view with the new extent and range.
  // Makes sense to do this if the data set or the mapping has changed
  // as the new zoom and center could be very different.
  useEffect(() => {
    if (xRange && yRange) {
      const newTargetX = xExtent[0] + xRange / 2;
      const newTargetY = yExtent[0] + yRange / 2;
      const newZoom = Math.log2(Math.min(width / xRange, height / yRange));
      setTargetX(newTargetX);
      // Graphics rendering has the y-axis going south so we need to multiply by negative one.
      setTargetY(-newTargetY);
      setZoom(newZoom);
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [cells, mapping]);

  // After cells have loaded or changed,
  // compute the cell radius scale based on the
  // extents of the cell coordinates on the x/y axes.
  useEffect(() => {
    if (xRange && yRange) {
      const pointSizeDevicePixels = getPointSizeDevicePixels(
        window.devicePixelRatio, zoom, xRange, yRange, width, height,
      );
      setDynamicCellRadius(pointSizeDevicePixels);

      const nextCellOpacityScale = getPointOpacity(
        zoom, xRange, yRange, width, height, numCells, averageFillDensity,
      );
      setDynamicCellOpacity(nextCellOpacityScale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xRange, yRange, xExtent, yExtent, numCells, cells, mapping,
    width, height, zoom, averageFillDensity]);

  const getCellInfo = useCallback((cellId) => {
    if (getCellInfoOverride) return getCellInfoOverride(cellId);
    const cellInfo = cells[cellId];
    return {
      [`${capitalize(observationsLabel)} ID`]: cellId,
      ...(cellInfo ? cellInfo.factors : {}),
    };
  }, [cells, getCellInfoOverride, observationsLabel]);

  const cellSelectionSet = useMemo(() => new Set(cellSelection), [cellSelection]);
  const getCellIsSelected = useCallback(cellEntry => (
    (cellSelectionSet || new Set([])).has(cellEntry[0]) ? 1.0 : 0.0), [cellSelectionSet]);

  const cellRadius = (cellRadiusMode === 'manual' ? cellRadiusFixed : dynamicCellRadius);
  const cellOpacity = (cellOpacityMode === 'manual' ? cellOpacityFixed : dynamicCellOpacity);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getExpressionValue = useExpressionValueGetter({ attrs, expressionData });

  let emptyMessage;
  if (Object.keys(cells).length === 0 && cellsEmptyMessage) {
    emptyMessage = (
      <div>{cellsEmptyMessage}</div>
    );
  }

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
          customOptions={customOptions}
          observationsLabel={observationsLabel}
          cellRadius={cellRadiusFixed}
          setCellRadius={setCellRadiusFixed}
          cellRadiusMode={cellRadiusMode}
          setCellRadiusMode={setCellRadiusMode}
          cellOpacity={cellOpacityFixed}
          setCellOpacity={setCellOpacityFixed}
          cellOpacityMode={cellOpacityMode}
          setCellOpacityMode={setCellOpacityMode}
          cellSetLabelsVisible={cellSetLabelsVisible}
          setCellSetLabelsVisible={setCellSetLabelsVisible}
          cellSetLabelSize={cellSetLabelSize}
          setCellSetLabelSize={setCellSetLabelSize}
          cellSetPolygonsVisible={cellSetPolygonsVisible}
          setCellSetPolygonsVisible={setCellSetPolygonsVisible}
          cellColorEncoding={cellColorEncoding}
          setCellColorEncoding={setCellColorEncoding}
          geneExpressionColormap={geneExpressionColormap}
          setGeneExpressionColormap={setGeneExpressionColormap}
          geneExpressionColormapRange={geneExpressionColormapRange}
          setGeneExpressionColormapRange={setGeneExpressionColormapRange}
        />
        )}
    >
      {emptyMessage}
      <Scatterplot
        ref={deckRef}
        uuid={uuid}
        theme={theme}
        viewState={{ zoom, target: [targetX, targetY, targetZ] }}
        setViewState={({ zoom: newZoom, target }) => {
          setZoom(newZoom);
          setTargetX(target[0]);
          setTargetY(target[1]);
          setTargetZ(target[2] || 0);
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
        cellRadius={cellRadius}
        cellOpacity={cellOpacity}
        cellColorEncoding={cellColorEncoding}
        geneExpressionColormap={geneExpressionColormap}
        geneExpressionColormapRange={geneExpressionColormapRange}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
        getExpressionValue={getExpressionValue}
        getCellIsSelected={getCellIsSelected}
        hideTools={hideTools}
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
