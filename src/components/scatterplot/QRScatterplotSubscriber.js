/* eslint-disable */
import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { extent } from 'd3-array';
import isEqual from 'lodash/isEqual';
import TitleInfo from '../TitleInfo';
import { pluralize, capitalize } from '../../utils';
import {
  useDeckCanvasSize, useReady, useUrls, useExpressionValueGetter,
} from '../hooks';
import { setCellSelection, mergeCellSets } from '../utils';
import { getCellSetPolygons } from '../sets/cell-set-utils';
import {
  useCellsData,
  useCellSetsData,
  useGeneSelection,
  useExpressionAttrs,
} from '../data-hooks';
import { getCellColors } from '../interpolate-colors';
import QRScatterplot from './QRScatterplot';
import ScatterplotTooltipSubscriber from './ScatterplotTooltipSubscriber';
import ScatterplotOptions from './ScatterplotOptions';
import {
  useMultiDatasetCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
  useDatasetUids,
} from '../../app/state/hooks';
import {
  getPointSizeDevicePixels,
  getPointOpacity,
} from '../shared-spatial-scatterplot/dynamic-opacity';
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
 * @param {number} props.averageFillDensity Override the average fill density calculation
 * when using dynamic opacity mode.
 */
export default function QRScatterplotSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    removeGridComponent,
    theme,
    disableTooltip = false,
    observationsLabelOverride: observationsLabel = 'cell',
    observationsPluralLabelOverride: observationsPluralLabel = `${observationsLabel}s`,
    title: titleOverride,
    // Average fill density for dynamic opacity calculation.
    averageFillDensity,
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

  const datasetUids = useDatasetUids(coordinationScopes);
  const refScope = "QUERY";
  const qryScope = "REFERENCE"
  const refDataset = datasetUids[refScope];
  const qryDataset = datasetUids[qryScope];
  // Get "props" from the coordination space.
  const [cValues, cSetters] = useMultiDatasetCoordination(
    COMPONENT_COORDINATION_TYPES.queryReferenceScatterplot,
    coordinationScopes,
  );

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

  const title = titleOverride || `Query & Reference Scatterplot (${cValues[qryScope].embeddingType}, ${cValues[refScope].embeddingType})`;

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, qryDataset, refDataset]);

  // Get data from loaders using the data hooks.
  const [qryCells, qryCellsCount] = useCellsData(loaders, qryDataset, setItemIsReady, addUrl, true);
  const [refCells, refCellsCount] = useCellsData(loaders, refDataset, setItemIsReady, addUrl, true);

  const [qryCellSets] = useCellSetsData(
    loaders,
    qryDataset,
    setItemIsReady,
    addUrl,
    false,
    { setCellSetSelection: cSetters[qryScope].setCellSelection, setCellSetColor: cSetters[qryScope].setCellSetColor },
    { cellSetSelection: cValues[qryScope].cellSetSelection, cellSetColor: cValues[qryScope].cellSetColor },
  );
  const [refCellSets] = useCellSetsData(
    loaders,
    refDataset,
    setItemIsReady,
    addUrl,
    false,
    { setCellSetSelection: cSetters[refScope].setCellSelection, setCellSetColor: cSetters[refScope].setCellSetColor },
    { cellSetSelection: cValues[refScope].cellSetSelection, cellSetColor: cValues[refScope].cellSetColor },
  );

  const [qryExpressionData] = useGeneSelection(
    loaders, qryDataset, setItemIsReady, false, cValues[qryScope].geneSelection, setItemIsNotReady,
  );
  const [qryAttrs] = useExpressionAttrs(
    loaders, qryDataset, setItemIsReady, addUrl, false,
  );
  

  const [dynamicCellRadius, setDynamicCellRadius] = useState(cValues[qryScope].embeddingCellRadius);
  const [dynamicCellOpacity, setDynamicCellOpacity] = useState(cValues[qryScope].embeddingCellOpacity);

  // TODO: determine if query and reference should use same cell sets
  const mergedQryCellSets = useMemo(() => mergeCellSets(
    qryCellSets, cValues[qryScope].additionalCellSets,
  ), [qryCellSets, cValues[qryScope].additionalCellSets]);

  const mergedRefCellSets = useMemo(() => mergeCellSets(
    refCellSets, cValues[refScope].additionalCellSets,
  ), [refCellSets, cValues[refScope].additionalCellSets]);

  const setQryCellSelectionProp = useCallback((v) => {
    setCellSelection(
      v, cValues[qryScope].additionalCellSets, cValues[qryScope].cellSetColor,
      cSetters[qryScope].setCellSetSelection, cSetters[qryScope].setAdditionalCellSets, cSetters[qryScope].setCellSetColor,
      cSetters[qryScope].setCellColorEncoding,
    );
  }, [cValues[qryScope].additionalCellSets, cValues[qryScope].cellSetColor, cSetters[qryScope].setCellColorEncoding,
  cSetters[qryScope].setAdditionalCellSets, cSetters[qryScope].setCellSetColor, cSetters[qryScope].setCellSetSelection]);

  const qryCellColors = useMemo(() => getCellColors({
    cellColorEncoding: cValues[qryScope].cellColorEncoding,
    // expressionData: expressionData && expressionData[0],
    geneSelection: cValues[qryScope].geneSelection,
    cellSets: mergedQryCellSets,
    cellSetSelection: cValues[qryScope].cellSetSelection,
    cellSetColor: cValues[qryScope].cellSetColor,
    // expressionDataAttrs: attrs,
    theme,
  }), [cValues[qryScope].cellColorEncoding, cValues[qryScope].geneSelection, mergedQryCellSets, theme,
  cValues[qryScope].cellSetSelection, cValues[qryScope].cellSetColor/*, expressionData, attrs*/]);
  
  // cellSetPolygonCache is an array of tuples like [(key0, val0), (key1, val1), ...],
  // where the keys are cellSetSelection arrays.
  const [qryCellSetPolygonCache, setQryCellSetPolygonCache] = useState([]);
  const cacheHas = (cache, key) => cache.findIndex(el => isEqual(el[0], key)) !== -1;
  const cacheGet = (cache, key) => cache.find(el => isEqual(el[0], key))?.[1];
  const qryCellSetPolygons = useMemo(() => {
    if ((cValues[qryScope].embeddingCellSetLabelsVisible || cValues[qryScope].embeddingCellSetPolygonsVisible)
      && !cacheHas(qryCellSetPolygonCache, cValues[qryScope].cellSetSelection)
      && mergedQryCellSets?.tree?.length
      && Object.values(qryCells).length
      && cValues[qryScope].cellSetColor?.length) {
      const newCellSetPolygons = getCellSetPolygons({
        cells: qryCells,
        mapping: cValues[qryScope].embeddingType,
        cellSets: mergedQryCellSets,
        cellSetSelection: cValues[qryScope].cellSetSelection,
        cellSetColor: cValues[qryScope].cellSetColor,
        theme,
      });
      setQryCellSetPolygonCache(cache => [...cache, [cValues[qryScope].cellSetSelection, newCellSetPolygons]]);
      return newCellSetPolygons;
    }
    return cacheGet(qryCellSetPolygonCache, cValues[qryScope].cellSetSelection) || [];
  }, [cValues[qryScope].embeddingCellSetLabelsVisible, qryCellSetPolygonCache, cValues[qryScope].embeddingCellSetPolygonsVisible, theme,
    qryCells, cValues[qryScope].embeddingType, mergedQryCellSets, cValues[qryScope].cellSetSelection, cValues[qryScope].cellSetColor]);


  const qryCellSelection = useMemo(() => Array.from(qryCellColors.keys()), [qryCellColors]);

  const [xRange, yRange, xExtent, yExtent, numCells] = useMemo(() => {
    const cellValues = qryCells && Object.values(qryCells);
    if (cellValues?.length) {
      const cellCoordinates = Object.values(qryCells)
        .map(c => c.mappings[cValues[qryScope].embeddingType]);
      const xE = extent(cellCoordinates, c => c[0]*100); // TODO: fix upstream
      const yE = extent(cellCoordinates, c => c[1]*100); // TODO: fix upstream
      const xR = xE[1] - xE[0];
      const yR = yE[1] - yE[0];
      return [xR, yR, xE, yE, cellValues.length];
    }
    return [null, null, null, null, null];
  }, [qryCells, cValues[qryScope].embeddingType]);

  // After cells have loaded or changed,
  // compute the cell radius scale based on the
  // extents of the cell coordinates on the x/y axes.
  useEffect(() => {
    if (xRange && yRange) {
      const pointSizeDevicePixels = getPointSizeDevicePixels(
        window.devicePixelRatio, cValues[qryScope].embeddingZoom, xRange, yRange, width, height,
      );
      setDynamicCellRadius(pointSizeDevicePixels);

      const nextCellOpacityScale = getPointOpacity(
        cValues[qryScope].embeddingZoom, xRange, yRange, width, height, numCells, averageFillDensity,
      );
      setDynamicCellOpacity(nextCellOpacityScale);

      if (typeof targetX !== 'number' || typeof targetY !== 'number') {
        const newTargetX = xExtent[0] + xRange / 2;
        const newTargetY = yExtent[0] + yRange / 2;
        const newZoom = Math.log2(Math.min(width / xRange, height / yRange));
        cSetters[qryScope].setEmbeddingTargetX(newTargetX);
        // Graphics rendering has the y-axis going south so we need to multiply by negative one.
        cSetters[qryScope].setEmbeddingTargetY(-newTargetY);
        cSetters[qryScope].setEmbeddingZoom(newZoom);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xRange, yRange, xExtent, yExtent, numCells, qryCells, cValues[qryScope].embeddingType,
    width, height, averageFillDensity]);

  const getCellInfo = useCallback((cellId) => {
    const cellInfo = qryCells[cellId];
    return {
      [`${capitalize(observationsLabel)} ID`]: cellId,
      ...(cellInfo ? cellInfo.factors : {}),
    };
  }, [qryCells, observationsLabel]);

  const cellSelectionSet = useMemo(() => new Set(qryCellSelection), [qryCellSelection]);
  const getCellIsSelected = useCallback(cellEntry => (
    (cellSelectionSet || new Set([])).has(cellEntry[0]) ? 1.0 : 0.0), [cellSelectionSet]);

  const cellRadius = (cValues[qryScope].embeddingCellRadiusMode === 'manual' ? cValues[qryScope].embeddingCellRadius : dynamicCellRadius);
  const cellOpacity = (cValues[qryScope].embeddingCellOpacityMode === 'manual' ? cValues[qryScope].embeddingCellOpacity : dynamicCellOpacity);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getExpressionValue = useExpressionValueGetter({ attrs: qryAttrs, expressionData: qryExpressionData });

  return (
    <TitleInfo
      title={title}
      info={`${qryCellsCount} ${pluralize(observationsLabel, observationsPluralLabel, qryCellsCount)}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      /*
      options={(
        <ScatterplotOptions
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
      */
    >
      <QRScatterplot
        ref={deckRef}
        uuid={uuid}
        theme={theme}
        viewState={{
          zoom: cValues[qryScope].embeddingZoom,
          target: [
            cValues[qryScope].embeddingTargetX,
            cValues[qryScope].embeddingTargetY,
            cValues[qryScope].embeddingTargetZ
          ]
        }}
        setViewState={({ zoom: newZoom, target }) => {
          cSetters[qryScope].setEmbeddingZoom(newZoom);
          cSetters[qryScope].setEmbeddingTargetX(target[0]);
          cSetters[qryScope].setEmbeddingTargetY(target[1]);
          cSetters[qryScope].setEmbeddingTargetZ(target[2] || 0);
        }}
        cells={qryCells}
        mapping={cValues[qryScope].embeddingType}
        cellFilter={cValues[qryScope].cellFilter}
        cellSelection={qryCellSelection}
        cellHighlight={cValues[qryScope].cellHighlight}
        cellColors={qryCellColors}
        cellSetPolygons={qryCellSetPolygons}
        cellSetLabelSize={cValues[qryScope].embeddingCellSetLabelSize}
        cellSetLabelsVisible={cValues[qryScope].embeddingCellSetLabelsVisible}
        cellSetPolygonsVisible={cValues[qryScope].embeddingCellSetPolygonsVisible}
        setCellFilter={cSetters[qryScope].setCellFilter}
        setCellSelection={setQryCellSelectionProp}
        setCellHighlight={cSetters[qryScope].setCellHighlight}
        cellRadius={cellRadius}
        cellOpacity={cellOpacity}
        cellColorEncoding={cValues[qryScope].cellColorEncoding}
        geneExpressionColormap={cValues[qryScope].geneExpressionColormap}
        geneExpressionColormapRange={cValues[qryScope].geneExpressionColormapRange}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
        getExpressionValue={getExpressionValue}
        getCellIsSelected={getCellIsSelected}

      />
      {!disableTooltip && (
      <ScatterplotTooltipSubscriber
        parentUuid={uuid}
        cellHighlight={cValues[qryScope].cellHighlight}
        width={width}
        height={height}
        getCellInfo={getCellInfo}
      />
      )}
    </TitleInfo>
  );
}
