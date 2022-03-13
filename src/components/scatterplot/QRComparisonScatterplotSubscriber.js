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
import { setCellSelection, mergeCellSets, PALETTE } from '../utils';
import { getCellSetPolygons } from '../sets/cell-set-utils';
import {
  useCellsData,
  useCellSetsData,
  useGeneSelection,
  useExpressionAttrs,
  useAnnDataStatic,
  useAnnDataDynamic,
  useAnnDataIndices,
  useCellSetsTree,
  useDiffGeneNames,
  useInitialCellSetSelection,
} from '../data-hooks';
import { getCellColors } from '../interpolate-colors';
import QRComparisonScatterplot from './QRComparisonScatterplot';
import ScatterplotTooltipSubscriber from './ScatterplotTooltipSubscriber';
import ScatterplotOptions from './ScatterplotOptions';
import {
  useMultiDatasetCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
  useDatasetUids,
  useComponentViewInfo,
} from '../../app/state/hooks';
import {
  getPointSizeDevicePixels,
  getPointOpacity,
} from '../shared-spatial-scatterplot/dynamic-opacity';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { Component } from '../../app/constants';

const iteration = 1;

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
export default function QRComparisonScatterplotSubscriber(props) {
  const {
    uuid,
    qrySupportingUuid = null,
    refSupportingUuid = null,
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
  const qrySupportingViewInfo = useComponentViewInfo(qrySupportingUuid);
  const refSupportingViewInfo = useComponentViewInfo(refSupportingUuid);

  // Use multi-dataset coordination.
  const datasetUids = useDatasetUids(coordinationScopes);
  const refScope = "REFERENCE";
  const qryScope = "QUERY"
  const refDataset = datasetUids[refScope];
  const qryDataset = datasetUids[qryScope];
  // Get "props" from the coordination space.
  const [cValues, cSetters] = useMultiDatasetCoordination(
    COMPONENT_COORDINATION_TYPES[Component.QR_COMPARISON_SCATTERPLOT],
    coordinationScopes,
  );
  const [qryValues, qrySetters] = [cValues[qryScope], cSetters[qryScope]];
  const [refValues, refSetters] = [cValues[refScope], cSetters[refScope]];


  const [urls, addUrl, resetUrls] = useUrls();
  const [width, height, deckRef] = useDeckCanvasSize();
  const [
    isReady,
    setItemIsReady,
    setItemIsNotReady, // eslint-disable-line no-unused-vars
    resetReadyItems,
  ] = useReady([]); // TODO(scXAI): update to support query+reference anndata paths.

  const title = titleOverride || `Comparison View (${qryValues.embeddingType})`;

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, qryDataset, refDataset]);

  // Get the cells data loader for the query and reference datasets.
  const qryLoader = loaders[qryDataset].loaders.cells;
  const refLoader = loaders[refDataset].loaders.cells;
  // Get the loader options (from the view config file definition).
  const qryOptions = qryLoader?.options;
  const refOptions = refLoader?.options;

  // Load the data.
  // Cell IDs
  const [qryCellsIndex, qryGenesIndex] = useAnnDataIndices(loaders, qryDataset, setItemIsReady, true);
  const [refCellsIndex, refGenesIndex] = useAnnDataIndices(loaders, refDataset, setItemIsReady, true);

  // Cell sets
  const [refCellType] = useAnnDataStatic(loaders, refDataset, refOptions?.features?.cellType?.path, 'columnString', setItemIsReady, false);
  const [qryPrediction, qryPredictionStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.prediction?.path, 'columnString', iteration, setItemIsReady, false);
  const [qryLabel, qryLabelStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.label?.path, 'columnString', iteration, setItemIsReady, false);

  const qryCellSets = useCellSetsTree(qryCellsIndex, [qryPrediction, qryLabel], ["Prediction", "Label"]);
  const refCellSets = useCellSetsTree(refCellsIndex, [refCellType], ["Cell Type"]);

  // Anchor matrix
  const [qryAnchorMatrix, qryAnchorMatrixStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.anchorMatrix?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [refAnchorMatrix, refAnchorMatrixStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.anchorMatrix?.path, 'columnNumeric', iteration, setItemIsReady, false);

  // Anchor cluster
  const [qryAnchorCluster, qryAnchorClusterStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.anchorCluster?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [refAnchorCluster, refAnchorClusterStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.features?.anchorCluster?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [qryAnchorDist, qryAnchorDistStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.anchorDist?.path, 'columnNumeric', iteration, setItemIsReady, false);

  // Differential expression
  const [qryDiffGeneNameIndices, qryDiffGeneNamesStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.differentialGenes?.names?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [qryDiffGeneScores, qryDiffGeneScoresStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.differentialGenes?.scores?.path, 'columnNumeric', iteration, setItemIsReady, false);

  const [refDiffGeneNameIndices, refDiffGeneNamesStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.names?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [refDiffGeneScores, refDiffGeneScoresStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.scores?.path, 'columnNumeric', iteration, setItemIsReady, false);

  const qryDiffGeneNames = useDiffGeneNames(qryGenesIndex, qryDiffGeneNameIndices);
  const refDiffGeneNames = useDiffGeneNames(refGenesIndex,refDiffGeneNameIndices);

  // Embeddings
  const [qryEmbedding, qryEmbeddingStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.embeddings[qryValues.embeddingType]?.path, 'embeddingNumeric', iteration, setItemIsReady, false);
  const [refEmbedding, refEmbeddingStatus] = useAnnDataStatic(loaders, refDataset, refOptions?.embeddings[refValues.embeddingType]?.path, 'embeddingNumeric', setItemIsReady, false);

  const [qryExpressionData] = useGeneSelection(
    loaders, qryDataset, setItemIsReady, false, qryValues.geneSelection, setItemIsNotReady,
  );
  const [qryAttrs] = useExpressionAttrs(
    loaders, qryDataset, setItemIsReady, addUrl, false,
  );
  
  const [refExpressionData] = useGeneSelection(
    loaders, refDataset, setItemIsReady, false, refValues.geneSelection, setItemIsNotReady,
  );
  const [refAttrs] = useExpressionAttrs(
    loaders, refDataset, setItemIsReady, addUrl, false,
  );
  
  
  const [dynamicCellRadius, setDynamicCellRadius] = useState(qryValues.embeddingCellRadius);
  const [dynamicCellOpacity, setDynamicCellOpacity] = useState(qryValues.embeddingCellOpacity);

  // TODO(scXAI): determine if query and reference should use same cell sets tree
  const mergedQryCellSets = useMemo(() => mergeCellSets(
    qryCellSets, qryValues.additionalCellSets,
  ), [qryCellSets, qryValues.additionalCellSets]);

  const mergedRefCellSets = useMemo(() => mergeCellSets(
    refCellSets, refValues.additionalCellSets,
  ), [refCellSets, refValues.additionalCellSets]);
  

  // Initialize cell set colors and selections.
  useInitialCellSetSelection(mergedQryCellSets, qryValues, qrySetters, "Prediction");
  useInitialCellSetSelection(mergedRefCellSets, refValues, refSetters, "Cell Type");


  const setQryCellSelectionProp = useCallback((v) => {
    setCellSelection(
      v, qryValues.additionalCellSets, qryValues.cellSetColor,
      qrySetters.setCellSetSelection, qrySetters.setAdditionalCellSets, qrySetters.setCellSetColor,
      qrySetters.setCellColorEncoding,
    );
  }, [qryValues.additionalCellSets, qryValues.cellSetColor, qrySetters.setCellColorEncoding,
  qrySetters.setAdditionalCellSets, qrySetters.setCellSetColor, qrySetters.setCellSetSelection]);

  const setRefCellSelectionProp = useCallback((v) => {
    setCellSelection(
      v, refValues.additionalCellSets, refValues.cellSetColor,
      refSetters.setCellSetSelection, refSetters.setAdditionalCellSets, refSetters.setCellSetColor,
      refSetters.setCellColorEncoding,
    );
  }, [refValues.additionalCellSets, refValues.cellSetColor, refSetters.setCellColorEncoding,
  refSetters.setAdditionalCellSets, refSetters.setCellSetColor, refSetters.setCellSetSelection]);

  const qryCellColors = useMemo(() => getCellColors({
    cellColorEncoding: qryValues.cellColorEncoding,
    expressionData: qryExpressionData && qryExpressionData[0],
    geneSelection: qryValues.geneSelection,
    cellSets: mergedQryCellSets,
    cellSetSelection: qryValues.cellSetSelection,
    cellSetColor: qryValues.cellSetColor,
    expressionDataAttrs: qryAttrs,
    theme,
  }), [qryValues.cellColorEncoding, qryValues.geneSelection, mergedQryCellSets, theme,
  qryValues.cellSetSelection, qryValues.cellSetColor, qryExpressionData, qryAttrs]);


  // TODO(scXAI): do we need to visualize colors for the reference cells?
  // TODO(scXAI): do we need to visualize polygons for the reference cell sets?
  
  // cellSetPolygonCache is an array of tuples like [(key0, val0), (key1, val1), ...],
  // where the keys are cellSetSelection arrays.
  const [qryCellSetPolygonCache, setQryCellSetPolygonCache] = useState([]);
  const cacheHas = (cache, key) => cache.findIndex(el => isEqual(el[0], key)) !== -1;
  const cacheGet = (cache, key) => cache.find(el => isEqual(el[0], key))?.[1];
  const qryCellSetPolygons = useMemo(() => {
    if ((qryValues.embeddingCellSetLabelsVisible || qryValues.embeddingCellSetPolygonsVisible)
      && !cacheHas(qryCellSetPolygonCache, qryValues.cellSetSelection)
      && mergedQryCellSets?.tree?.length
      && qryEmbedding
      && qryCellsIndex
      && qryValues.cellSetColor?.length) {
      const newCellSetPolygons = getCellSetPolygons({
        cells: qryCellsIndex,
        embedding: qryEmbedding,
        cellSets: mergedQryCellSets,
        cellSetSelection: qryValues.cellSetSelection,
        cellSetColor: qryValues.cellSetColor,
        theme,
      });
      setQryCellSetPolygonCache(cache => [...cache, [qryValues.cellSetSelection, newCellSetPolygons]]);
      return newCellSetPolygons;
    }
    return cacheGet(qryCellSetPolygonCache, qryValues.cellSetSelection) || [];
  }, [qryValues.embeddingCellSetLabelsVisible, qryCellSetPolygonCache, qryValues.embeddingCellSetPolygonsVisible, theme,
    qryCellsIndex, qryEmbedding, mergedQryCellSets, qryValues.cellSetSelection, qryValues.cellSetColor]);


  const qryCellSelection = useMemo(() => Array.from(qryCellColors.keys()), [qryCellColors]);

  // TODO(scXAI): do the reference dataset embedding coordinates have the same ranges as in the query dataset?
  const [xRange, yRange, xExtent, yExtent, numCells] = useMemo(() => {
    const cellValues = qryEmbedding;
    if (cellValues?.length) {
      const xVals = qryEmbedding.data.map(d => d[0]);
      const yVals = qryEmbedding.data.map(d => d[1]);
      const xE = extent(xVals);
      const yE = extent(yVals);
      const xR = xE[1] - xE[0];
      const yR = yE[1] - yE[0];
      return [xR, yR, xE, yE, cellValues.shape[1]];
    }
    return [null, null, null, null, null];
  }, [qryCellsIndex, qryEmbedding, qryValues.embeddingType]);

  // After cells have loaded or changed,
  // compute the cell radius scale based on the
  // extents of the cell coordinates on the x/y axes.
  useEffect(() => {
    if (xRange && yRange) {
      const pointSizeDevicePixels = getPointSizeDevicePixels(
        window.devicePixelRatio, qryValues.embeddingZoom, xRange, yRange, width, height,
      );
      setDynamicCellRadius(pointSizeDevicePixels/4);

      const nextCellOpacityScale = getPointOpacity(
        qryValues.embeddingZoom, xRange, yRange, width, height, numCells, averageFillDensity,
      );
      setDynamicCellOpacity(nextCellOpacityScale);

      if (typeof targetX !== 'number' || typeof targetY !== 'number') {
        const newTargetX = xExtent[0] + xRange / 2;
        const newTargetY = yExtent[0] + yRange / 2;
        const newZoom = Math.log2(Math.min(width / xRange, height / yRange));
        qrySetters.setEmbeddingTargetX(newTargetX);
        // Graphics rendering has the y-axis going south so we need to multiply by negative one.
        qrySetters.setEmbeddingTargetY(-newTargetY);
        qrySetters.setEmbeddingZoom(newZoom);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xRange, yRange, xExtent, yExtent, numCells, qryValues.embeddingType,
    width, height, averageFillDensity]);

  const getQryCellInfo = useCallback((cellId) => {
    //const cellInfo = qryCells[cellId];
    const cellInfo = {};
    return {
      [`${capitalize(observationsLabel)} ID`]: cellId,
      ...(cellInfo ? cellInfo.factors : {}),
    };
  }, [observationsLabel]);

  const cellSelectionSet = useMemo(() => new Set(qryCellSelection), [qryCellSelection]);
  const getCellIsSelected = useCallback(cellEntry => (
    (cellSelectionSet || new Set([])).has(cellEntry[0]) ? 1.0 : 0.0), [cellSelectionSet]);

  const cellRadius = (qryValues.embeddingCellRadiusMode === 'manual' ? qryValues.embeddingCellRadius : dynamicCellRadius);
  const cellOpacity = (qryValues.embeddingCellOpacityMode === 'manual' ? qryValues.embeddingCellOpacity : dynamicCellOpacity);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getQryExpressionValue = useExpressionValueGetter({ attrs: qryAttrs, expressionData: qryExpressionData });

  // TODO(scXAI): do we need to get expression values for the reference dataset?

  const qryCellsCount = qryCellsIndex?.length;

  return (
    <TitleInfo
      title={title}
      info={`${qryCellsCount} ${pluralize(observationsLabel, observationsPluralLabel, qryCellsCount)}`}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      options={(
        <ScatterplotOptions
          observationsLabel={observationsLabel}
          cellRadius={qryValues.embeddingCellRadius}
          setCellRadius={qrySetters.setEmbeddingCellRadius}
          cellRadiusMode={qryValues.embeddingCellRadiusMode}
          setCellRadiusMode={qrySetters.setEmbeddingCellRadiusMode}
          cellOpacity={qryValues.embeddingCellOpacity}
          setCellOpacity={qrySetters.setEmbeddingCellOpacity}
          cellOpacityMode={qryValues.embeddingCellOpacityMode}
          setCellOpacityMode={qrySetters.setEmbeddingCellOpacityMode}
          cellSetLabelsVisible={qryValues.embeddingCellSetLabelsVisible}
          setCellSetLabelsVisible={qrySetters.setEmbeddingCellSetLabelsVisible}
          cellSetLabelSize={qryValues.embeddingCellSetLabelSize}
          setCellSetLabelSize={qrySetters.setEmbeddingCellSetLabelSize}
          cellSetPolygonsVisible={qryValues.embeddingCellSetPolygonsVisible}
          setCellSetPolygonsVisible={qrySetters.setEmbeddingCellSetPolygonsVisible}
          cellColorEncoding={qryValues.cellColorEncoding}
          setCellColorEncoding={qrySetters.setCellColorEncoding}
          geneExpressionColormap={qryValues.geneExpressionColormap}
          setGeneExpressionColormap={qrySetters.setGeneExpressionColormap}
          geneExpressionColormapRange={qryValues.geneExpressionColormapRange}
          setGeneExpressionColormapRange={qrySetters.setGeneExpressionColormapRange}
        />
      )}
    >
      <QRComparisonScatterplot
        ref={deckRef}
        uuid={uuid}
        theme={theme}
        viewState={{
          zoom: qryValues.embeddingZoom,
          target: [
            qryValues.embeddingTargetX,
            qryValues.embeddingTargetY,
            qryValues.embeddingTargetZ
          ]
        }}
        setViewState={({ zoom: newZoom, target }) => {
          qrySetters.setEmbeddingZoom(newZoom);
          qrySetters.setEmbeddingTargetX(target[0]);
          qrySetters.setEmbeddingTargetY(target[1]);
          qrySetters.setEmbeddingTargetZ(target[2] || 0);
        }}
        qrySupportingBounds={qrySupportingViewInfo?.bounds}
        refSupportingBounds={refSupportingViewInfo?.bounds}
        // qryCells={qryCells}
        // refCells={refCells}
        qryCellsIndex={qryCellsIndex}
        refCellsIndex={refCellsIndex}
        qryEmbedding={qryEmbedding}
        refEmbedding={refEmbedding}
        qryMapping={qryValues.embeddingType}
        refMapping={refValues.embeddingType}
        cellFilter={qryValues.cellFilter}
        cellSelection={qryCellSelection}
        cellHighlight={qryValues.cellHighlight}
        cellColors={qryCellColors}
        cellSetPolygons={qryCellSetPolygons}
        cellSetLabelSize={qryValues.embeddingCellSetLabelSize}
        cellSetLabelsVisible={qryValues.embeddingCellSetLabelsVisible}
        cellSetPolygonsVisible={qryValues.embeddingCellSetPolygonsVisible}
        setCellFilter={qrySetters.setCellFilter}
        setCellSelection={setQryCellSelectionProp}
        setCellHighlight={qrySetters.setCellHighlight}
        cellRadius={cellRadius}
        cellOpacity={cellOpacity}
        cellColorEncoding={qryValues.cellColorEncoding}
        geneExpressionColormap={qryValues.geneExpressionColormap}
        geneExpressionColormapRange={qryValues.geneExpressionColormapRange}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
        getExpressionValue={getQryExpressionValue}
        getCellIsSelected={getCellIsSelected}

      />
      {!disableTooltip && (
      <ScatterplotTooltipSubscriber
        parentUuid={uuid}
        cellHighlight={qryValues.cellHighlight}
        width={width}
        height={height}
        getCellInfo={getQryCellInfo}
      />
      )}
    </TitleInfo>
  );
}
