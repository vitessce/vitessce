import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { extent, quantileSorted } from 'd3-array';
import { isEqual } from 'lodash-es';
import { circle } from '@turf/circle';
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
  useExpandedFeatureLabelsMap,
} from '@vitessce/vit-s';
import {
  setObsSelection, mergeObsSets, getCellSetPolygons, getCellColors,
  stratifyArrays,
} from '@vitessce/sets-utils';
import { pluralize as plur, commaNumber } from '@vitessce/utils';
import {
  Scatterplot, ScatterplotTooltipSubscriber, ScatterplotOptions,
  getPointSizeDevicePixels,
  getPointOpacity,
} from '@vitessce/scatterplot';
import { Legend } from '@vitessce/legend';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import { DEFAULT_CONTOUR_PERCENTILES } from './constants.js';

const DEFAULT_FEATURE_AGGREGATION_STRATEGY = 'first';

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
    helpText = ViewHelpMapping.SCATTERPLOT,
    // Average fill density for dynamic opacity calculation.
    averageFillDensity,

    // For the dual scatterplot:
    sampleSetSelection: sampleSetSelectionFromProps,
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
    sampleSetSelection: sampleSetSelectionFromCoordination,
    sampleSetColor,
    embeddingPointsVisible,
    embeddingContoursVisible,
    embeddingContoursFilled,
    embeddingContourPercentiles: contourPercentiles,
    contourColorEncoding,
    contourColor,
    featureAggregationStrategy,
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
    setEmbeddingPointsVisible,
    setEmbeddingContoursVisible,
    setEmbeddingContoursFilled,
    setEmbeddingContourPercentiles: setContourPercentiles,
    setContourColorEncoding,
    setFeatureAggregationStrategy,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SCATTERPLOT], coordinationScopes);

  const {
    embeddingZoom: initialZoom,
    embeddingTargetX: initialTargetX,
    embeddingTargetY: initialTargetY,
  } = useInitialCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SCATTERPLOT], coordinationScopes,
  );

  const observationsLabel = observationsLabelOverride || obsType;
  const sampleSetSelection = (
    sampleSetSelectionFromProps
    || sampleSetSelectionFromCoordination
  );

  const featureAggregationStrategyToUse = featureAggregationStrategy
    ?? DEFAULT_FEATURE_AGGREGATION_STRATEGY;

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
  // eslint-disable-next-line max-len
  const [{ featureLabelsMap: featureLabelsMapOrig }, featureLabelsStatus, featureLabelsUrls] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
  );
  const [featureLabelsMap, expandedFeatureLabelsStatus] = useExpandedFeatureLabelsMap(
    featureType, featureLabelsMapOrig, { stripCuriePrefixes: true },
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
    expandedFeatureLabelsStatus,
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
    if (xRange && yRange && width && height) {
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

  const {
    normData: uint8ExpressionData,
    extents: expressionExtents,
    missing: expressionMissing,
  } = useUint8FeatureSelection(expressionData);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getExpressionValue = useExpressionValueGetter({
    instanceObsIndex: obsEmbeddingIndex,
    matrixObsIndex,
    expressionData: uint8ExpressionData,
  });

  // Sort the expression data array so that we can compute percentiles
  // using the d3 quantileSorted function for improved performance.
  const sortedWeights = useMemo(() => {
    if (uint8ExpressionData?.[0]) {
      const weights = uint8ExpressionData[0];
      return weights.toSorted();
    }
    return null;
  }, [uint8ExpressionData]);

  // Compute contour thresholds based on the entire expression data distribution
  // (not per-cellSet or per-sampleSet).
  const contourThresholds = useMemo(() => {
    if (sortedWeights) {
      const thresholds = (contourPercentiles || DEFAULT_CONTOUR_PERCENTILES)
        .map(p => quantileSorted(sortedWeights, p))
        .map(t => Math.max(t, 1.0));
      return thresholds;
    }
    return [1, 10, 100];
  }, [contourPercentiles, sortedWeights]);

  // Construct a circle polygon using Turf's circle function,
  // which surrounds all points in the scatterplot,
  // which we can use to position text labels along.
  const circleInfo = useMemo(() => {
    if (!originalViewState || !width || !height) {
      return null;
    }
    const center = [
      originalViewState.target[0],
      originalViewState.target[1],
    ];
    const scaleFactor = (2 ** originalViewState.zoom);
    if (!(typeof scaleFactor === 'number' && typeof center[0] === 'number' && typeof center[1] === 'number') || Number.isNaN(scaleFactor)) {
      return null;
    }
    const radius = Math.min(width, height) / 2 / scaleFactor;
    const numPoints = 96;
    const options = { steps: numPoints, units: 'degrees' };
    const circlePolygon = circle(center, radius, options);
    return {
      center,
      radius,
      polygon: circlePolygon,
      steps: numPoints,
    };
  }, [originalViewState, width, height]);

  // It is possible for the embedding index+data to be out of order
  // with respect to the matrix index+data. Here, we align the embedding
  // data so that the rows are ordered the same as the matrix rows.
  // TODO: refactor this as a hook that can be used elsewhere to align data
  // from different data types with the expression matrix data.
  // Need to fallback to the original ordering if no matrix data is present.
  // TODO: do this everywhere and remove the need for the
  // useExpressionValueGetter hook and getter function.
  const [alignedEmbeddingIndex, alignedEmbeddingData] = useMemo(() => {
    // Sort the embedding data according to the matrix obsIndex.
    if (obsEmbedding?.data && obsEmbeddingIndex && matrixObsIndex) {
      const matrixIndexMap = new Map(matrixObsIndex.map((key, i) => ([key, i])));
      const toMatrixIndex = obsEmbeddingIndex.map(key => matrixIndexMap.get(key));

      const newEmbeddingIndex = new Array(obsEmbeddingIndex.length);
      const newEmbeddingData = [
        new obsEmbedding.data[0].constructor(obsEmbedding.data[0].length),
        new obsEmbedding.data[1].constructor(obsEmbedding.data[1].length),
      ];
      for (let i = 0; i < obsEmbeddingIndex.length; i++) {
        const matrixRowIndex = toMatrixIndex[i];
        newEmbeddingData[0][matrixRowIndex] = obsEmbedding.data[0][i];
        newEmbeddingData[1][matrixRowIndex] = obsEmbedding.data[1][i];
        newEmbeddingIndex[matrixRowIndex] = obsEmbeddingIndex[i];
      }
      return [newEmbeddingIndex, { ...obsEmbedding, data: newEmbeddingData }];
    }
    // Fall back to original ordering if no matrix data is present to align with.
    return [obsEmbeddingIndex, obsEmbedding];
  }, [matrixObsIndex, obsEmbeddingIndex, obsEmbedding]);

  const sampleIdToObsIdsMap = useMemo(() => {
    // sampleEdges maps obsId -> sampleId.
    // However when we stratify we want to map sampleId -> [obsId1, obsId2, ...].
    // Here we create this reverse mapping.
    if (sampleEdges) {
      const result = new Map();
      Array.from(sampleEdges.entries()).forEach(([obsId, sampleId]) => {
        if (!result.has(sampleId)) {
          result.set(sampleId, [obsId]);
        } else {
          result.get(sampleId).push(obsId);
        }
      });
      return result;
    }
    return null;
  }, [sampleEdges]);

  // Stratify multiple arrays: per-cellSet and per-sampleSet.
  const [stratifiedData, stratifiedDataCount] = useMemo(() => {
    if (alignedEmbeddingData?.data) {
      const [result, cellCountResult] = stratifyArrays(
        sampleEdges, sampleIdToObsIdsMap,
        sampleSets, sampleSetSelection,
        alignedEmbeddingIndex, mergedCellSets, cellSetSelection, {
          obsEmbeddingX: alignedEmbeddingData.data[0],
          obsEmbeddingY: alignedEmbeddingData.data[1],
          ...(uint8ExpressionData?.[0] ? { featureValue: uint8ExpressionData } : {}),
        }, featureAggregationStrategyToUse,
      );
      return [result, cellCountResult];
    }
    return [null, null];
  }, [alignedEmbeddingIndex, alignedEmbeddingData, uint8ExpressionData,
    sampleEdges, sampleIdToObsIdsMap, sampleSets, sampleSetSelection,
    cellSetSelection, mergedCellSets, featureAggregationStrategyToUse,
  ]);

  const setViewState = ({ zoom: newZoom, target }) => {
    setZoom(newZoom);
    setTargetX(target[0]);
    setTargetY(target[1]);
    setTargetZ(target[2] || 0);
  };

  // TODO: Update this once the rendered points reflects the selection/filtering.
  const cellCountToUse = embeddingPointsVisible
    ? cellsCount
    : (stratifiedDataCount ?? cellsCount);

  return (
    <TitleInfo
      title={title}
      info={`${commaNumber(cellCountToUse)} ${plur(observationsLabel, cellCountToUse)}`}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      helpText={helpText}
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
          embeddingPointsVisible={embeddingPointsVisible}
          setEmbeddingPointsVisible={setEmbeddingPointsVisible}
          embeddingContoursVisible={embeddingContoursVisible}
          setEmbeddingContoursVisible={setEmbeddingContoursVisible}
          embeddingContoursFilled={embeddingContoursFilled}
          setEmbeddingContoursFilled={setEmbeddingContoursFilled}
          contourPercentiles={contourPercentiles}
          setContourPercentiles={setContourPercentiles}
          defaultContourPercentiles={DEFAULT_CONTOUR_PERCENTILES}
          contourColorEncoding={contourColorEncoding}
          setContourColorEncoding={setContourColorEncoding}
          featureAggregationStrategy={featureAggregationStrategy}
          setFeatureAggregationStrategy={setFeatureAggregationStrategy}
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
        // InternMap data structures where keys are
        // obsSet -> sampleSet -> arrayKey -> [].
        stratifiedData={stratifiedData}
        obsSetColor={cellSetColor}
        sampleSetColor={sampleSetColor}
        contourThresholds={contourThresholds}
        contourColorEncoding={contourColorEncoding}
        contourColor={contourColor}
        contoursFilled={embeddingContoursFilled}
        embeddingPointsVisible={embeddingPointsVisible}
        embeddingContoursVisible={embeddingContoursVisible}

        circleInfo={circleInfo}
        featureSelection={geneSelection}
      />
      {tooltipsVisible && width && height ? (
        <ScatterplotTooltipSubscriber
          parentUuid={uuid}
          obsHighlight={cellHighlight}
          width={width}
          height={height}
          getObsInfo={getObsInfo}
          featureType={featureType}
          featureLabelsMap={featureLabelsMap}
        />
      ) : null}
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
        obsSetSelection={cellSetSelection}
        extent={expressionExtents}
        missing={expressionMissing}
        // Contour percentile legend
        pointsVisible={embeddingPointsVisible}
        contoursVisible={embeddingContoursVisible}
        contoursFilled={embeddingContoursFilled}
        contourPercentiles={contourPercentiles || DEFAULT_CONTOUR_PERCENTILES}
        contourThresholds={contourThresholds}
        featureAggregationStrategy={featureAggregationStrategyToUse}
      />
    </TitleInfo>
  );
}
