import React, {
  useState, useEffect, useCallback, useMemo, useDeferredValue,
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
  useCoordinationScopes,
} from '@vitessce/vit-s';
import {
  setObsSelection, mergeObsSets, getCellSetPolygons, treeToColorIndicesArray,
  colorIndicesFromCodes, getObsIndexMap, stratifyArrays,
} from '@vitessce/sets-utils';
import { pluralize as plur, commaNumber, aggregateFeatureArrays } from '@vitessce/utils';
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
    coordinationScopes: coordinationScopesRaw,
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
    // Circle scale factor:
    circleScaleFactor = 0.8,
  } = props;

  const loaders = useLoaders();
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);
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

  const [
    // eslint-disable-next-line no-unused-vars
    obsLabelsTypes, obsLabelsData, obsLabelsStatus, obsLabelsUrls, obsLabelsErrors,
  ] = useMultiObsLabels(
    coordinationScopes, obsType, loaders, dataset,
  );

  // Get data from loaders using the data hooks.
  const [
    { obsIndex: obsEmbeddingIndex, obsEmbedding },
    obsEmbeddingStatus,
    obsEmbeddingUrls,
    obsEmbeddingError,
  ] = useObsEmbeddingData(
    loaders, dataset, true, {}, {},
    { obsType, embeddingType: mapping },
  );
  const cellsCount = obsEmbeddingIndex?.length || 0;
  const [
    { obsSets: cellSets, obsSetsMembership, obsSetsColumns },
    obsSetsStatus, obsSetsUrls, obsSetsError,
  ] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );
  const [
    // eslint-disable-next-line no-unused-vars
    expressionData, loadedFeatureSelection, featureSelectionStatus, featureSelectionErrors,
  ] = useFeatureSelection(
    loaders, dataset, false, geneSelection,
    { obsType, featureType, featureValueType },
  );
  const [
    { obsIndex: matrixObsIndex }, matrixIndicesStatus, matrixIndicesUrls, matrixIndicesError,
  ] = useObsFeatureMatrixIndices(
    loaders, dataset, false,
    { obsType, featureType, featureValueType },
  );
  const [
    { featureLabelsMap: featureLabelsMapOrig },
    featureLabelsStatus,
    featureLabelsUrls,
    featureLabelsError,
  ] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
  );
  const [featureLabelsMap, expandedFeatureLabelsStatus] = useExpandedFeatureLabelsMap(
    featureType, featureLabelsMapOrig, { stripCuriePrefixes: true },
  );

  const [{ sampleSets }, sampleSetsStatus, sampleSetsUrl, sampleSetsError] = useSampleSetsData(
    loaders, dataset, false, {}, {},
    { sampleType },
  );

  const [{ sampleEdges }, sampleEdgesStatus, sampleEdgesUrl, sampleEdgesError] = useSampleEdgesData(
    loaders, dataset, false, {}, {},
    { obsType, sampleType },
  );

  const errors = [
    ...obsLabelsErrors,
    obsEmbeddingError,
    obsSetsError,
    ...featureSelectionErrors,
    matrixIndicesError,
    featureLabelsError,
    sampleSetsError,
    sampleEdgesError,
  ];

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
  const [isSelectionPending, setIsSelectionPending] = useState(false);
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

  // A set selection or color change re-encodes every observation in the memos
  // below, which at atlas scale takes longer than a frame. Deferring these values
  // lets React commit the urgent update first — the sets manager checkbox that
  // initiated the change paints immediately — and re-render this view afterwards.
  // The urgent render sees the previous values, so the memos below keep their
  // cached results and cost nothing in that first commit.
  const deferredCellSetSelection = useDeferredValue(cellSetSelection);
  const deferredCellSetColor = useDeferredValue(cellSetColor);
  const deferredSampleSetSelection = useDeferredValue(sampleSetSelection);

  // Positional rather than keyed by observation ID: at atlas scale an ID-keyed color
  // Map costs one string hash lookup per point per render, plus a per-observation
  // color array whenever the selected sets carry confidence scores.
  const obsColorIndices = useMemo(() => (
    // When the loader provides raw categorical codes over this same observation
    // axis (checked by reference), the encoding is one typed-array pass with no
    // tree walk. colorIndicesFromCodes returns null for selections it cannot
    // resolve (e.g. user-defined lasso selections), falling back to the tree.
    (obsSetsColumns && obsSetsColumns.obsIndex === obsEmbeddingIndex
      && colorIndicesFromCodes({
        columns: obsSetsColumns.columns,
        obsIndex: obsEmbeddingIndex,
        selectedNamePaths: deferredCellSetSelection,
        cellSetColor: deferredCellSetColor,
        theme,
      }))
    || treeToColorIndicesArray(
      mergedCellSets, deferredCellSetSelection, deferredCellSetColor,
      obsEmbeddingIndex, theme,
    )
  ), [mergedCellSets, deferredCellSetSelection, deferredCellSetColor,
    obsEmbeddingIndex, theme, obsSetsColumns]);

  // cellSetPolygonCache is an array of tuples like [(key0, val0), (key1, val1), ...],
  // where the keys are cellSetSelection arrays.
  const [cellSetPolygonCache, setCellSetPolygonCache] = useState([]);
  const cacheHas = (cache, key) => cache.findIndex(el => isEqual(el[0], key)) !== -1;
  const cacheGet = (cache, key) => cache.find(el => isEqual(el[0], key))?.[1];
  const cellSetPolygons = useMemo(() => {
    if ((cellSetLabelsVisible || cellSetPolygonsVisible)
      && !cacheHas(cellSetPolygonCache, deferredCellSetSelection)
      && mergedCellSets?.tree?.length
      && obsEmbedding
      && obsEmbeddingIndex
      && deferredCellSetColor?.length) {
      const newCellSetPolygons = getCellSetPolygons({
        obsIndex: obsEmbeddingIndex,
        obsEmbedding,
        cellSets: mergedCellSets,
        cellSetSelection: deferredCellSetSelection,
        cellSetColor: deferredCellSetColor,
        theme,
      });
      setCellSetPolygonCache(
        cache => [...cache, [deferredCellSetSelection, newCellSetPolygons]],
      );
      return newCellSetPolygons;
    }
    return cacheGet(cellSetPolygonCache, deferredCellSetSelection) || [];
  }, [cellSetPolygonsVisible, cellSetPolygonCache, cellSetLabelsVisible, theme,
    obsEmbeddingIndex, obsEmbedding, mergedCellSets, deferredCellSetSelection,
    deferredCellSetColor]);


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
        window.devicePixelRatio, zoom, xRange, yRange, width, height, numCells,
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

  // With no set selection every observation counts as selected, matching the
  // behavior of the ID-keyed color map this replaced. Uses the deferred selection
  // so that it stays consistent with obsColorIndices within each commit.
  const allCellsSelected = !(deferredCellSetSelection && mergedCellSets);
  const getCellIsSelected = useCallback((object, { index }) => (
    (allCellsSelected || obsColorIndices.colorIndices[index] !== 0) ? 1.0 : 0.0
  ), [allCellsSelected, obsColorIndices]);

  const cellRadius = (cellRadiusMode === 'manual' ? cellRadiusFixed : dynamicCellRadius);
  const cellOpacity = (cellOpacityMode === 'manual' ? cellOpacityFixed : dynamicCellOpacity);

  // Compute aggregated expression data if featureAggregationStrategyToUse is not null
  // and we have multiple features to aggregate.
  const aggregatedExpressionData = useMemo(() => {
    if (featureAggregationStrategyToUse != null && expressionData && expressionData.length > 1) {
      const aggregated = aggregateFeatureArrays(expressionData, featureAggregationStrategyToUse);
      // Return as array with single element to match expressionData structure
      return [aggregated];
    }
    return expressionData;
  }, [expressionData, featureAggregationStrategyToUse]);

  const {
    normData: uint8ExpressionData,
    extents: expressionExtents,
    missing: expressionMissing,
  } = useUint8FeatureSelection(aggregatedExpressionData);

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
    if (!originalViewState || !width || !height || !xRange || !yRange) {
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
    const size = Math.max(xRange, yRange);
    // TODO: figure out a better solution than
    // scaling the radius by the arbitrary 0.8?
    const radius = ((size * Math.sqrt(2)) / 2) * circleScaleFactor;
    const numPoints = 96;
    const options = { steps: numPoints, units: 'degrees' };
    const circlePolygon = circle(center, radius, options);
    return {
      center,
      radius,
      polygon: circlePolygon,
      steps: numPoints,
    };
  }, [originalViewState, width, height, xRange, yRange, circleScaleFactor]);

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
    if (obsEmbedding?.data && obsEmbeddingIndex && matrixObsIndex
      && obsEmbeddingIndex !== matrixObsIndex) {
      // (The same index array, as when both come from one data source,
      // is already aligned and skips this copy.)
      const matrixIndexMap = getObsIndexMap(matrixObsIndex);
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

  // Stratify multiple arrays: per-cellSet and per-sampleSet.
  // The strata feed only the contour layers and, when the points are hidden, the
  // observation count shown in the title — so with contours off and points on,
  // this per-observation pass is skipped entirely rather than recomputed on
  // every selection change.
  const isStratifiedDataNeeded = embeddingContoursVisible || !embeddingPointsVisible;
  const [stratifiedData, stratifiedDataCount] = useMemo(() => {
    if (isStratifiedDataNeeded && alignedEmbeddingData?.data) {
      const [result, cellCountResult] = stratifyArrays(
        sampleEdges,
        sampleSets, deferredSampleSetSelection,
        alignedEmbeddingIndex, mergedCellSets, deferredCellSetSelection, {
          obsEmbeddingX: alignedEmbeddingData.data[0],
          obsEmbeddingY: alignedEmbeddingData.data[1],
          ...(uint8ExpressionData?.[0] ? { featureValue: uint8ExpressionData } : {}),
        }, featureAggregationStrategyToUse,
        // Raw codes let the strata come from typed arrays when the indices match.
        { obsSetsColumns },
      );
      return [result, cellCountResult];
    }
    return [null, null];
  }, [isStratifiedDataNeeded, alignedEmbeddingIndex, alignedEmbeddingData,
    uint8ExpressionData, sampleEdges, sampleSets, deferredSampleSetSelection,
    deferredCellSetSelection, mergedCellSets, featureAggregationStrategyToUse,
    obsSetsColumns,
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
      isReady={isReady && !isSelectionPending}
      helpText={helpText}
      errors={errors}
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
        onSelectionBusy={setIsSelectionPending}
        theme={theme}
        viewState={{ zoom, target: [targetX, targetY, targetZ] }}
        setViewState={setViewState}
        originalViewState={originalViewState}
        obsEmbeddingIndex={obsEmbeddingIndex}
        obsEmbedding={obsEmbedding}
        cellFilter={cellFilter}
        cellHighlight={cellHighlight}
        obsColorIndices={obsColorIndices}
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

        obsSetSelection={deferredCellSetSelection}
        sampleSetSelection={deferredSampleSetSelection}
        // InternMap data structures where keys are
        // obsSet -> sampleSet -> arrayKey -> [].
        stratifiedData={stratifiedData}
        obsSetColor={deferredCellSetColor}
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
        setFeatureValueColormapRange={setGeneExpressionColormapRange}
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
