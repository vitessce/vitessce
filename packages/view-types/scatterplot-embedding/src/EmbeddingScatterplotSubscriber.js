import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { extent } from 'd3-array';
import { isEqual } from 'lodash-es';
import {
  TitleInfo,
  useReady, useUrls,
  useDeckCanvasSize,
  useUint8FeatureSelection,
  useExpressionValueGetter,
  useGetObsInfo,
  useObsEmbeddingData,
  useObsSetsData,
  useFeatureSelection,
  useObsFeatureMatrixIndices,
  useFeatureLabelsData,
  useMultiObsLabels,
  useSampleSetsData,
  useSampleEdgesData,
  useCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
  useInitialCoordination,
} from '@vitessce/vit-s';
import {
  setObsSelection, mergeObsSets, getCellSetPolygons, getCellColors,
  stratifyExpressionData, aggregateStratifiedExpressionData,
} from '@vitessce/sets-utils';
import { pluralize as plur, commaNumber } from '@vitessce/utils';
import {
  Scatterplot, ScatterplotTooltipSubscriber, ScatterplotOptions,
  getPointSizeDevicePixels,
  getPointOpacity,
} from '@vitessce/scatterplot';
import { Legend } from '@vitessce/legend';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';


/**
 * Get expression data for the cells
 * in the selected cell sets.
 * @param {object} expressionMatrix
 * @param {string[]} expressionMatrix.rows Cell IDs.
 * @param {string[]} expressionMatrix.cols Gene names.
 * @param {Uint8Array} expressionMatrix.matrix The
 * flattened expression matrix as a typed array.
 * @param {object} cellSets The cell sets from the dataset.
 * @param {object} additionalCellSets The user-defined cell sets
 * from the coordination space.
 * @param {array} geneSelection Array of selected genes.
 * @param {array} cellSetSelection Array of selected cell set paths.
 * @param {object[]} cellSetColor Array of objects with properties
 * @param {string|null} featureValueTransform The name of the
 * feature value transform function.
 * @param {number} featureValueTransformCoefficient A coefficient
 * to be used in the transform function.
 * @param {string} theme "light" or "dark" for the vitessce theme
 * `path` and `color`.
 */
export function useExpressionSummaries(
  sampleEdges, sampleSets, sampleSetSelection,
  expressionData, obsIndex, mergedCellSets,
  geneSelection, cellSetSelection, cellSetColor,
  featureValueTransform, featureValueTransformCoefficient,
  featureLabelsMap,
) {
  // TODO: stratify both expression data and embedding coordinates.

  // From the expression matrix and the list of selected genes / cell sets,
  // generate the array of data points for the plot.
  const [resultArr, meanExpressionMax] = useMemo(() => {
    const [stratifiedData, exprMax] = stratifyExpressionData(
      sampleEdges, sampleSets, sampleSetSelection,
      expressionData, obsIndex, mergedCellSets,
      geneSelection, cellSetSelection, cellSetColor,
      featureValueTransform, featureValueTransformCoefficient,
      'light',
    );
    if(stratifiedData) {
      console.log(stratifiedData)
      return [null, null];
    }
    return [null, null];
  }, [expressionData, obsIndex, geneSelection,
    mergedCellSets, cellSetSelection,
    featureValueTransform, featureValueTransformCoefficient,
    featureLabelsMap,
    sampleEdges, sampleSets, sampleSetSelection,
  ]);

  return [resultArr, meanExpressionMax];
}


/**
 * A subscriber component for the scatterplot.
 * @param {object} props
 * @param {number} props.uuid The unique identifier for this component.
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title An override value for the component title.
 * @param {number} props.averageFillDensity Override the average fill density calculation
 * when using dynamic opacity mode.
 */
export function EmbeddingScatterplotSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    observationsLabelOverride,
    title: titleOverride,
    // Average fill density for dynamic opacity calculation.
    averageFillDensity,
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

  // Get "props" from the coordination space.
  const [{
    dataset,
    obsType,
    featureType,
    featureValueType,
    sampleType,
    embeddingZoom: zoom,
    embeddingTargetX: targetX,
    embeddingTargetY: targetY,
    embeddingTargetZ: targetZ,
    embeddingType: mapping,
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
    tooltipsVisible,
    sampleSetSelection,
    featureValueTransform,
    featureValueTransformCoefficient,
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
    setTooltipsVisible,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SCATTERPLOT], coordinationScopes);

  const {
    embeddingZoom: initialZoom,
    embeddingTargetX: initialTargetX,
    embeddingTargetY: initialTargetY,
  } = useInitialCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SCATTERPLOT], coordinationScopes,
  );

  const observationsLabel = observationsLabelOverride || obsType;

  const [width, height, deckRef] = useDeckCanvasSize();

  const title = titleOverride || `Scatterplot (${mapping})`;

  const [obsLabelsTypes, obsLabelsData] = useMultiObsLabels(
    coordinationScopes, obsType, loaders, dataset,
  );

  // Get data from loaders using the data hooks.
  const [
    { obsIndex: obsEmbeddingIndex, obsEmbedding }, obsEmbeddingStatus, obsEmbeddingUrls,
  ] = useObsEmbeddingData(
    loaders, dataset, true, {}, {},
    { obsType, embeddingType: mapping },
  );
  const cellsCount = obsEmbeddingIndex?.length || 0;
  const [{ obsSets: cellSets, obsSetsMembership }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );
  // eslint-disable-next-line no-unused-vars
  const [expressionData, loadedFeatureSelection, featureSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, geneSelection,
    { obsType, featureType, featureValueType },
  );
  const [
    { obsIndex: matrixObsIndex }, matrixIndicesStatus, matrixIndicesUrls,
  ] = useObsFeatureMatrixIndices(
    loaders, dataset, false,
    { obsType, featureType, featureValueType },
  );
  const [{ featureLabelsMap }, featureLabelsStatus, featureLabelsUrls] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
  );

  const [{ sampleSets }, sampleSetsStatus, sampleSetsUrl] = useSampleSetsData(
    loaders, dataset, false, {}, {},
    { sampleType },
  );

  const [{ sampleEdges }, sampleEdgesStatus, sampleEdgesUrl] = useSampleEdgesData(
    loaders, dataset, false, {}, {},
    { obsType, sampleType },
  );

  const isReady = useReady([
    obsEmbeddingStatus,
    obsSetsStatus,
    featureSelectionStatus,
    featureLabelsStatus,
    matrixIndicesStatus,
    sampleSetsStatus,
    sampleEdgesStatus,
  ]);
  const urls = useUrls([
    obsEmbeddingUrls,
    obsSetsUrls,
    matrixIndicesUrls,
    featureLabelsUrls,
    sampleSetsUrl,
    sampleEdgesUrl,
  ]);

  const [dynamicCellRadius, setDynamicCellRadius] = useState(cellRadiusFixed);
  const [dynamicCellOpacity, setDynamicCellOpacity] = useState(cellOpacityFixed);

  const [originalViewState, setOriginalViewState] = useState(null);

  const mergedCellSets = useMemo(() => mergeObsSets(
    cellSets, additionalCellSets,
  ), [cellSets, additionalCellSets]);

  const setCellSelectionProp = useCallback((v) => {
    setObsSelection(
      v, additionalCellSets, cellSetColor,
      setCellSetSelection, setAdditionalCellSets, setCellSetColor,
      setCellColorEncoding,
    );
  }, [additionalCellSets, cellSetColor, setCellColorEncoding,
    setAdditionalCellSets, setCellSetColor, setCellSetSelection]);

  const cellColors = useMemo(() => getCellColors({
    cellSets: mergedCellSets,
    cellSetSelection,
    cellSetColor,
    obsIndex: matrixObsIndex,
    theme,
  }), [mergedCellSets, theme,
    cellSetSelection, cellSetColor, matrixObsIndex]);

  const [resultArr, meanExpressionMax] = useExpressionSummaries(
    sampleEdges, sampleSets, sampleSetSelection,
    expressionData, matrixObsIndex, mergedCellSets,
    geneSelection, cellSetSelection, cellSetColor,
    featureValueTransform, featureValueTransformCoefficient,
    featureLabelsMap,

  );

  // cellSetPolygonCache is an array of tuples like [(key0, val0), (key1, val1), ...],
  // where the keys are cellSetSelection arrays.
  const [cellSetPolygonCache, setCellSetPolygonCache] = useState([]);
  const cacheHas = (cache, key) => cache.findIndex(el => isEqual(el[0], key)) !== -1;
  const cacheGet = (cache, key) => cache.find(el => isEqual(el[0], key))?.[1];
  const cellSetPolygons = useMemo(() => {
    if ((cellSetLabelsVisible || cellSetPolygonsVisible)
      && !cacheHas(cellSetPolygonCache, cellSetSelection)
      && mergedCellSets?.tree?.length
      && obsEmbedding
      && obsEmbeddingIndex
      && cellSetColor?.length) {
      const newCellSetPolygons = getCellSetPolygons({
        obsIndex: obsEmbeddingIndex,
        obsEmbedding,
        cellSets: mergedCellSets,
        cellSetSelection,
        cellSetColor,
        theme,
      });
      setCellSetPolygonCache(cache => [...cache, [cellSetSelection, newCellSetPolygons]]);
      return newCellSetPolygons;
    }
    return cacheGet(cellSetPolygonCache, cellSetSelection) || [];
  }, [cellSetPolygonsVisible, cellSetPolygonCache, cellSetLabelsVisible, theme,
    obsEmbeddingIndex, obsEmbedding, mergedCellSets, cellSetSelection, cellSetColor]);


  const cellSelection = useMemo(() => Array.from(cellColors.keys()), [cellColors]);

  const [xRange, yRange, xExtent, yExtent, numCells] = useMemo(() => {
    if (obsEmbedding && obsEmbedding.data && obsEmbedding.shape) {
      const cellCount = obsEmbedding.shape[1];
      const xE = extent(obsEmbedding.data[0]);
      const yE = extent(obsEmbedding.data[1]);
      const xR = xE[1] - xE[0];
      const yR = yE[1] - yE[0];
      return [xR, yR, xE, yE, cellCount];
    }
    return [null, null, null, null, null];
  }, [obsEmbedding]);

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

      if (typeof initialTargetX !== 'number' || typeof initialTargetY !== 'number') {
        // The view config did not define an initial viewState so
        // we calculate one based on the data and set it.
        const newTargetX = xExtent[0] + xRange / 2;
        const newTargetY = yExtent[0] + yRange / 2;
        const newZoom = Math.log2(Math.min(width / xRange, height / yRange));
        const notYetInitialized = (typeof targetX !== 'number' || typeof targetY !== 'number');
        const stillDefaultInitialized = (targetX === newTargetX && targetY === -newTargetY);
        if (notYetInitialized || stillDefaultInitialized) {
          setTargetX(newTargetX);
          // Graphics rendering has the y-axis going south so we need to multiply by negative one.
          setTargetY(-newTargetY);
          setZoom(newZoom);
        }
        setOriginalViewState({ target: [newTargetX, -newTargetY, 0], zoom: newZoom });
      } else if (!originalViewState) {
        // originalViewState has not yet been set and
        // the view config defined an initial viewState.
        setOriginalViewState({ target: [initialTargetX, initialTargetY, 0], zoom: initialZoom });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xRange, yRange, xExtent, yExtent, numCells,
    width, height, initialZoom, zoom, initialTargetX, initialTargetY, averageFillDensity]);

  const getObsInfo = useGetObsInfo(
    observationsLabel, obsLabelsTypes, obsLabelsData, obsSetsMembership,
  );

  const cellSelectionSet = useMemo(() => new Set(cellSelection), [cellSelection]);
  const getCellIsSelected = useCallback((object, { index }) => (
    (cellSelectionSet || new Set([])).has(obsEmbeddingIndex[index]) ? 1.0 : 0.0
  ), [cellSelectionSet, obsEmbeddingIndex]);

  const cellRadius = (cellRadiusMode === 'manual' ? cellRadiusFixed : dynamicCellRadius);
  const cellOpacity = (cellOpacityMode === 'manual' ? cellOpacityFixed : dynamicCellOpacity);

  const [uint8ExpressionData, expressionExtents] = useUint8FeatureSelection(expressionData);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getExpressionValue = useExpressionValueGetter({
    instanceObsIndex: obsEmbeddingIndex,
    matrixObsIndex,
    expressionData: uint8ExpressionData,
  });

  const [stratifiedObsIndex, stratifiedObsEmbedding, stratifiedGetExpressionValue] = useMemo(() => {
    // TODO: call stratifyExpressionData and aggregateStratifiedExpressionData here.
    return [null, null, null];
  }, [obsEmbeddingIndex, matrixObsIndex, uint8ExpressionData,
    sampleEdges, sampleSets, sampleSetSelection,
    cellSetSelection, mergedCellSets,
  ]);

  const setViewState = ({ zoom: newZoom, target }) => {
    setZoom(newZoom);
    setTargetX(target[0]);
    setTargetY(target[1]);
    setTargetZ(target[2] || 0);
  };

  return (
    <TitleInfo
      title={title}
      info={`${commaNumber(cellsCount)} ${plur(observationsLabel, cellsCount)}`}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
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
          tooltipsVisible={tooltipsVisible}
          setTooltipsVisible={setTooltipsVisible}
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
      <Scatterplot
        ref={deckRef}
        uuid={uuid}
        theme={theme}
        viewState={{ zoom, target: [targetX, targetY, targetZ] }}
        setViewState={setViewState}
        originalViewState={originalViewState}
        obsEmbeddingIndex={obsEmbeddingIndex}
        obsEmbedding={obsEmbedding}
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

        obsSetSelection={cellSetSelection}
        sampleSetSelection={sampleSetSelection}
        // InternMap data structures where keys are either
        // sampleSet -> value,
        // obsSet -> value, or
        // sampleSet -> obsSet -> value.
        stratifiedObsIndex={stratifiedObsIndex}
        stratifiedObsEmbedding={stratifiedObsEmbedding}
        stratifiedGetExpressionValue={stratifiedGetExpressionValue}
      />
      {tooltipsVisible && (
      <ScatterplotTooltipSubscriber
        parentUuid={uuid}
        obsHighlight={cellHighlight}
        width={width}
        height={height}
        getObsInfo={getObsInfo}
      />
      )}
      <Legend
        visible
        theme={theme}
        featureType={featureType}
        featureValueType={featureValueType}
        obsColorEncoding={cellColorEncoding}
        featureSelection={geneSelection}
        featureLabelsMap={featureLabelsMap}
        featureValueColormap={geneExpressionColormap}
        featureValueColormapRange={geneExpressionColormapRange}
        extent={expressionExtents?.[0]}
      />
    </TitleInfo>
  );
}
