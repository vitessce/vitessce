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
import Scatterplot from './Scatterplot';
import ScatterplotTooltipSubscriber from './ScatterplotTooltipSubscriber';
import ScatterplotOptions from './ScatterplotOptions';
import {
  useMultiDatasetCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
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
    // Average fill density for dynamic opacity calculation.
    averageFillDensity,
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

  const { dataset: datasetScopes } = coordinationScopes;
  const [refDataset, qryDataset] = datasetScopes;

  // Get "props" from the coordination space.
  const [cValues, cSetters] = useMultiDatasetCoordination(
    COMPONENT_COORDINATION_TYPES.queryReferenceScatterplot,
    coordinationScopes,
  );

  console.log(cValues);

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

  const title = titleOverride || `Query & Reference Scatterplot (${cValues[qryDataset].embeddingType}, ${cValues[refDataset].embeddingType})`;

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
    { setCellSetSelection: cSetters[qryDataset].setCellSelection, setCellSetColor: cSetters[qryDataset].setCellSetColor },
    { cellSetSelection: cValues[qryDataset].cellSetSelection, cellSetColor: cValues[qryDataset].cellSetColor },
  );
  const [refCellSets] = useCellSetsData(
    loaders,
    refDataset,
    setItemIsReady,
    addUrl,
    false,
    { setCellSetSelection: cSetters[refDataset].setCellSelection, setCellSetColor: cSetters[refDataset].setCellSetColor },
    { cellSetSelection: cValues[refDataset].cellSetSelection, cellSetColor: cValues[refDataset].cellSetColor },
  );

  const [qryExpressionData] = useGeneSelection(
    loaders, qryDataset, setItemIsReady, false, cValues[qryDataset].geneSelection, setItemIsNotReady,
  );
  const [qryAttrs] = useExpressionAttrs(
    loaders, qryDataset, setItemIsReady, addUrl, false,
  );
  

  const [dynamicCellRadius, setDynamicCellRadius] = useState(cValues[qryDataset].embeddingCellRadius);
  const [dynamicCellOpacity, setDynamicCellOpacity] = useState(cValues[qryDataset].embeddingCellOpacity);

  // TODO: determine if query and reference should use same cell sets
  const mergedQryCellSets = useMemo(() => mergeCellSets(
    qryCellSets, cValues[qryDataset].additionalCellSets,
  ), [qryCellSets, cValues[qryDataset].additionalCellSets]);

  const mergedRefCellSets = useMemo(() => mergeCellSets(
    refCellSets, cValues[refDataset].additionalCellSets,
  ), [refCellSets, cValues[refDataset].additionalCellSets]);

  const setQryCellSelectionProp = useCallback((v) => {
    cSetters[qryDataset].setCellSelection(
      v, cValues[qryDataset].additionalCellSets, cValues[qryDataset].cellSetColor,
      cSetters[qryDataset].setCellSetSelection, cSetters[qryDataset].setAdditionalCellSets, cSetters[qryDataset].setCellSetColor,
      cSetters[qryDataset].setCellColorEncoding,
    );
  }, [cValues[qryDataset].additionalCellSets, cValues[qryDataset].cellSetColor, cSetters[qryDataset].setCellColorEncoding,
  cSetters[qryDataset].setAdditionalCellSets, cSetters[qryDataset].setCellSetColor, cSetters[qryDataset].setCellSetSelection]);

  const qryCellColors = useMemo(() => getCellColors({
    cellColorEncoding: cValues[qryDataset].cellColorEncoding,
    // expressionData: expressionData && expressionData[0],
    geneSelection: cValues[qryDataset].geneSelection,
    cellSets: mergedQryCellSets,
    cellSetSelection: cValues[qryDataset].cellSetSelection,
    cellSetColor: cValues[qryDataset].cellSetColor,
    // expressionDataAttrs: attrs,
    theme,
  }), [cValues[qryDataset].cellColorEncoding, cValues[qryDataset].geneSelection, mergedQryCellSets, theme,
  cValues[qryDataset].cellSetSelection, cValues[qryDataset].cellSetColor/*, expressionData, attrs*/]);
  
  // cellSetPolygonCache is an array of tuples like [(key0, val0), (key1, val1), ...],
  // where the keys are cellSetSelection arrays.
  const [qryCellSetPolygonCache, setQryCellSetPolygonCache] = useState([]);
  const cacheHas = (cache, key) => cache.findIndex(el => isEqual(el[0], key)) !== -1;
  const cacheGet = (cache, key) => cache.find(el => isEqual(el[0], key))?.[1];
  const qryCellSetPolygons = useMemo(() => {
    if ((cValues[qryDataset].embeddingCellSetLabelsVisible || cValues[qryDataset].embeddingCellSetPolygonsVisible)
      && !cacheHas(qryCellSetPolygonCache, cValues[qryDataset].cellSetSelection)
      && mergedQryCellSets?.tree?.length
      && Object.values(qryCells).length
      && cValues[qryDataset].cellSetColor?.length) {
      const newCellSetPolygons = getCellSetPolygons({
        cells: qryCells,
        mapping: cValues[qryDataset].embeddingType,
        cellSets: mergedQryCellSets,
        cellSetSelection: cValues[qryDataset].cellSetSelection,
        cellSetColor: cValues[qryDataset].cellSetColor,
        theme,
      });
      setQryCellSetPolygonCache(cache => [...cache, [cValues[qryDataset].cellSetSelection, newCellSetPolygons]]);
      return newCellSetPolygons;
    }
    return cacheGet(qryCellSetPolygonCache, cValues[qryDataset].cellSetSelection) || [];
  }, [cValues[qryDataset].embeddingCellSetLabelsVisible, qryCellSetPolygonCache, cValues[qryDataset].embeddingCellSetPolygonsVisible, theme,
    qryCells, cValues[qryDataset].embeddingType, mergedQryCellSets, cValues[qryDataset].cellSetSelection, cValues[qryDataset].cellSetColor]);


  const qryCellSelection = useMemo(() => Array.from(qryCellColors.keys()), [qryCellColors]);

  const [xRange, yRange, xExtent, yExtent, numCells] = useMemo(() => {
    const cellValues = qryCells && Object.values(qryCells);
    if (cellValues?.length) {
      const cellCoordinates = Object.values(qryCells)
        .map(c => c.mappings[cValues[qryDataset].embeddingType]);
      const xE = extent(cellCoordinates, c => c[0]);
      const yE = extent(cellCoordinates, c => c[1]);
      const xR = xE[1] - xE[0];
      const yR = yE[1] - yE[0];
      return [xR, yR, xE, yE, cellValues.length];
    }
    return [null, null, null, null, null];
  }, [qryCells, cValues[qryDataset].embeddingType]);

  // After cells have loaded or changed,
  // compute the cell radius scale based on the
  // extents of the cell coordinates on the x/y axes.
  useEffect(() => {
    if (xRange && yRange) {
      const pointSizeDevicePixels = getPointSizeDevicePixels(
        window.devicePixelRatio, cValues[qryDataset].embeddingZoom, xRange, yRange, width, height,
      );
      setDynamicCellRadius(pointSizeDevicePixels);

      const nextCellOpacityScale = getPointOpacity(
        cValues[qryDataset].embeddingZoom, xRange, yRange, width, height, numCells, averageFillDensity,
      );
      setDynamicCellOpacity(nextCellOpacityScale);

      if (typeof targetX !== 'number' || typeof targetY !== 'number') {
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
  }, [xRange, yRange, xExtent, yExtent, numCells, qryCells, cValues[qryDataset].embeddingType,
    width, height, cValues[qryDataset].embeddingZoom, averageFillDensity]);

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

  const cellRadius = (cValues[qryDataset].embeddingCellRadiusMode === 'manual' ? cValues[qryDataset].embeddingCellRadius : dynamicCellRadius);
  const cellOpacity = (cValues[qryDataset].embeddingCellOpacityMode === 'manual' ? cValues[qryDataset].embeddingCellOpacity : dynamicCellOpacity);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  //const getExpressionValue = useExpressionValueGetter({ attrs, expressionData });

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
      <Scatterplot
        ref={deckRef}
        uuid={uuid}
        theme={theme}
        viewState={{
          zoom: cValues[qryDataset].embeddingZoom,
          target: [
            cValues[qryDataset].embeddingTargetX,
            cValues[qryDataset].embeddingTargetY,
            cValues[qryDataset].embeddingTargetZ
          ]
        }}
        setViewState={({ zoom: newZoom, target }) => {
          cSetters[qryDataset].setEmbeddingZoom(newZoom);
          cSetters[qryDataset].setEmbeddingTargetX(target[0]);
          cSetters[qryDataset].setEmbeddingTargetY(target[1]);
          cSetters[qryDataset].setEmbeddingTargetZ(target[2] || 0);
        }}
        cells={qryCells}
        mapping={cValues[qryDataset].embeddingType}
        cellFilter={cValues[qryDataset].cellFilter}
        cellSelection={qryCellSelection}
        cellHighlight={cValues[qryDataset].cellHighlight}
        cellColors={qryCellColors}
        cellSetPolygons={qryCellSetPolygons}
        cellSetLabelSize={cValues[qryDataset].embeddingCellSetLabelSize}
        cellSetLabelsVisible={cValues[qryDataset].embeddingCellSetLabelsVisible}
        cellSetPolygonsVisible={cValues[qryDataset].embeddingCellSetPolygonsVisible}
        setCellFilter={cSetters[qryDataset].setCellFilter}
        setCellSelection={setQryCellSelectionProp}
        setCellHighlight={cSetters[qryDataset].setCellHighlight}
        cellRadius={cellRadius}
        cellOpacity={cellOpacity}
        cellColorEncoding={cValues[qryDataset].cellColorEncoding}
        geneExpressionColormap={cValues[qryDataset].geneExpressionColormap}
        geneExpressionColormapRange={cValues[qryDataset].geneExpressionColormapRange}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
        //getExpressionValue={getExpressionValue}
        getCellIsSelected={getCellIsSelected}

      />
      {!disableTooltip && (
      <ScatterplotTooltipSubscriber
        parentUuid={uuid}
        cellHighlight={cValues[qryDataset].cellHighlight}
        width={width}
        height={height}
        getCellInfo={getCellInfo}
      />
      )}
    </TitleInfo>
  );
}
