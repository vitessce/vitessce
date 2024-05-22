import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import { extent } from 'd3-array';
import { isEqual } from 'lodash-es';
import {
  pluralize as plur,
  capitalize, commaNumber,
  getValueTransformFunction, VALUE_TRANSFORM_OPTIONS,
} from '@vitessce/utils';
import {
  TitleInfo,
  useDeckCanvasSize, useReady, useUrls,
  useUint8FeatureSelection,
  useExpressionValueGetter,
  useObsSetsData,
  useFeatureStatsData,
  useFeatureSelection,
  useObsFeatureMatrixIndices,
  useCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
} from '@vitessce/vit-s';
import {
  mergeObsSets, setObsSelection, getCellColors,
} from '@vitessce/sets-utils';
import {
  FeatureScatterplot,
  ScatterplotTooltipSubscriber,
  ScatterplotOptions,
  getPointSizeDevicePixels,
  getPointOpacity,
} from '@vitessce/scatterplot';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import VolcanoPlotOptions from './VolcanoPlotOptions.js';

/**
   * A subscriber component for the gating scatterplot.
   * @param {object} props
   * @param {number} props.uuid The unique identifier for this component.
   * @param {string} props.theme The current theme name.
   * @param {object} props.coordinationScopes The mapping from coordination types to coordination
   * scopes.
   * @param {boolean} props.disableTooltip Should the tooltip be disabled?
   * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
   * to call when the component has been removed from the grid.
   * @param {number} props.averageFillDensity Override the average fill density calculation
   * when using dynamic opacity mode.
   */
export function VolcanoPlotSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    disableTooltip = false,
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
    obsType = 'cell',
    sampleType,
    featureType,
    featureValueType,
    volcanoZoom: zoom,
    volcanoTargetX: targetX,
    volcanoTargetY: targetY,
    volcanoTargetZ: targetZ,
    obsFilter: cellFilter,
    obsHighlight: cellHighlight,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    obsColorEncoding: cellColorEncoding,
    additionalObsSets: additionalCellSets,
    volcanoFeatureLabelsVisible: cellSetLabelsVisible, // TODO: rename
    volcanoFeatureLabelSize: cellSetLabelSize, // TODO: rename
    volcanoFeatureRadius: cellRadiusFixed,
    volcanoFeatureRadiusMode: cellRadiusMode,
    volcanoFeatureOpacity: cellOpacityFixed,
    volcanoFeatureOpacityMode: cellOpacityMode,
    featureValueColormap: geneExpressionColormap,
    featureValueColormapRange: geneExpressionColormapRange,
    featureValueTransform,
    featureValueTransformCoefficient,
    gatingFeatureSelectionX,
    gatingFeatureSelectionY,
    featureSelection,
    sampleSetSelection,
  }, {
    setVolcanoZoom: setZoom,
    setVolcanoTargetX: setTargetX,
    setVolcanoTargetY: setTargetY,
    setVolcanoTargetZ: setTargetZ,
    setObsFilter: setCellFilter,
    setObsSetSelection: setCellSetSelection,
    setObsHighlight: setCellHighlight,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setAdditionalObsSets: setAdditionalCellSets,
    setVolcanoFeatureLabelsVisible: setCellSetLabelsVisible,
    setVolcanoFeatureLabelSize: setCellSetLabelSize,
    setVolcanoFeatureRadius: setCellRadiusFixed,
    setVolcanoFeatureRadiusMode: setCellRadiusMode,
    setVolcanoFeatureOpacity: setCellOpacityFixed,
    setVolcanoFeatureOpacityMode: setCellOpacityMode,
    setFeatureValueColormap: setGeneExpressionColormap,
    setFeatureValueColormapRange: setGeneExpressionColormapRange,
    setFeatureValueTransform,
    setFeatureValueTransformCoefficient,
    setGatingFeatureSelectionX,
    setGatingFeatureSelectionY,
    setFeatureSelection,
    setSampleSetSelection,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.VOLCANO_PLOT],
    coordinationScopes,
  );

  const [width, height, deckRef] = useDeckCanvasSize();

  const title = 'Volcano Plot';

  // Get data from loaders using the data hooks.
  const [{ obsSets: cellSets }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );
  const [featureStats, featureStatsStatus, featureStatsUrls] = useFeatureStatsData(
    loaders, dataset, false,
    { featureType, sampleType },
    // These volcanoOptions are passed to FeatureStatsAnndataLoader.loadMulti():
    { sampleSetSelection },
  );

  const obsIndex = featureStats?.featureId;
  const featureIndex = featureStats?.featureId;
  const expressionDataColor = null;
  const cellsCount = featureStats?.featureId?.length || 0;

  // TODO: load featureLabelsData here for conversion to human-readable gene symbols.

  const isReady = useReady([
    featureStatsStatus,
  ]);
  const urls = useUrls([]);

  // Generate a new cells object with a mapping added for the user selected genes.
  const obsXY = useMemo(() => {
    if (!featureStats.featureSignificance || !featureStats.featureFoldChange) {
      return null;
    }

    const obsX = new Float32Array(featureStats.featureFoldChange);
    const obsY = new Float32Array(featureStats.featureSignificance);
    return {
      data: [obsX, obsY],
      shape: [2, obsX.length],
    };
  }, [featureStats]);

  const [dynamicCellRadius, setDynamicCellRadius] = useState(cellRadiusFixed);
  const [dynamicCellOpacity, setDynamicCellOpacity] = useState(cellOpacityFixed);

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
    obsIndex,
    theme,
  }), [mergedCellSets, theme,
    cellSetSelection, cellSetColor, obsIndex]);


  const cellSelection = useMemo(() => Array.from(cellColors.keys()), [cellColors]);

  const [xRange, yRange, xExtent, yExtent, numCells] = useMemo(() => {
    if (obsXY && obsXY.data && obsXY.shape) {
      const cellCount = obsXY.shape[1];
      const xE = extent(obsXY.data[0]);
      const yE = extent(obsXY.data[1]);
      const xR = xE[1] - xE[0];
      const yR = yE[1] - yE[0];
      return [xR, yR, xE, yE, cellCount];
    }
    return [null, null, null, null, null];
  }, [obsXY]);

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

      if (typeof targetX !== 'number' || typeof targetY !== 'number') {
        const newTargetX = xExtent[0] + xRange / 2
        const newTargetY = yExtent[0] + yRange / 2;
        const newZoom = Math.log2(Math.min(width / xRange, height / yRange));

        setTargetX(newTargetX);
        // Graphics rendering has the y-axis going south so we need to multiply by negative one.
        setTargetY(-newTargetY);
        setZoom(newZoom);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xRange, yRange, xExtent, yExtent, numCells,
    width, height, zoom, averageFillDensity]);

  const cellSelectionSet = useMemo(() => new Set(cellSelection), [cellSelection]);
  const getCellIsSelected = useCallback((object, { index }) => (
    (cellSelectionSet || new Set([])).has(obsIndex[index]) ? 1.0 : 0.0
  ), [cellSelectionSet, obsIndex]);

  const cellRadius = (cellRadiusMode === 'manual' ? cellRadiusFixed : dynamicCellRadius);
  const cellOpacity = (cellOpacityMode === 'manual' ? cellOpacityFixed : dynamicCellOpacity);

  const [uint8ExpressionData] = useUint8FeatureSelection(expressionDataColor);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getExpressionValue = useExpressionValueGetter({
    instanceObsIndex: obsIndex,
    matrixObsIndex: obsIndex,
    expressionData: uint8ExpressionData,
  });

  // Puts the mapping values in the cell info tooltip.
  const getObsInfo = useCallback((obsId) => {
    const selectedTransformName = VALUE_TRANSFORM_OPTIONS.find(
      o => o.value === featureValueTransform,
    )?.name;
    const genePrefix = featureValueTransform ? `${selectedTransformName} ` : '';
    const obsIdx = obsIndex?.indexOf(obsId);
    const obsInfo = { [`${capitalize(obsType)} ID`]: obsId };
    if (gatingFeatureSelectionX && gatingFeatureSelectionY) {
      obsInfo[genePrefix + gatingFeatureSelectionX] = obsXY.data[0][obsIdx];
      obsInfo[genePrefix + gatingFeatureSelectionY] = obsXY.data[1][obsIdx];
    }
    return obsInfo;
  }, [obsXY, obsIndex, featureValueTransform,
    gatingFeatureSelectionX, gatingFeatureSelectionY, obsType,
  ]);



  return (
    <TitleInfo
      title={title}
      info={`${commaNumber(cellsCount)} ${plur(obsType, cellsCount)}`}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      urls={urls}
      theme={theme}
      isReady={isReady}
      options={(
        <ScatterplotOptions
          observationsLabel={obsType}
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
          cellColorEncoding={cellColorEncoding}
          setCellColorEncoding={setCellColorEncoding}
          geneExpressionColormap={geneExpressionColormap}
          setGeneExpressionColormap={setGeneExpressionColormap}
          geneExpressionColormapRange={geneExpressionColormapRange}
          setGeneExpressionColormapRange={setGeneExpressionColormapRange}
        >
          <VolcanoPlotOptions
            featureType={featureType}
            gatingFeatureSelectionX={gatingFeatureSelectionX}
            setGatingFeatureSelectionX={setGatingFeatureSelectionX}
            gatingFeatureSelectionY={gatingFeatureSelectionY}
            setGatingFeatureSelectionY={setGatingFeatureSelectionY}
            gatingFeatureValueTransform={featureValueTransform}
            setGatingFeatureValueTransform={(newValue) => {
              setFeatureValueTransform(newValue);
              setTargetX(null);
              setTargetY(null);
              setZoom(null);
            }}
            gatingFeatureValueTransformCoefficient={featureValueTransformCoefficient}
            setGatingFeatureValueTransformCoefficient={setFeatureValueTransformCoefficient}
            geneSelectOptions={featureIndex}
            transformOptions={VALUE_TRANSFORM_OPTIONS}
          />
        </ScatterplotOptions>
      )}
    >
      <FeatureScatterplot
        ref={deckRef}
        uuid={uuid}
        theme={theme}
        hideTools={!(gatingFeatureSelectionX && gatingFeatureSelectionY)}
        viewState={{ zoom, target: [targetX, targetY] }}
        setViewState={({ zoom: newZoom, target }) => {
          setZoom(newZoom);
          setTargetX(target[0]);
          setTargetY(target[1]);
        }}
        significanceThreshold={-Math.log10(0.05)}
        foldChangeThreshold={1.0}
        significantColor={[255, 255, 255]}
        insignificantColor={[80, 80, 80]}

        xExtent={xExtent}
        yExtent={yExtent}

        obsEmbeddingIndex={obsIndex}
        obsEmbedding={obsXY}
        cellFilter={cellFilter}
        cellSelection={cellSelection}
        cellHighlight={cellHighlight}
        cellColors={cellColors}
        cellSetLabelSize={cellSetLabelSize}
        cellSetLabelsVisible={cellSetLabelsVisible}
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

      />
      {!disableTooltip && (
      <ScatterplotTooltipSubscriber
        parentUuid={uuid}
        obsHighlight={cellHighlight}
        width={width}
        height={height}
        getObsInfo={getObsInfo}
      />
      )}
    </TitleInfo>
  );
}
