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
  useFeatureSelection,
  useObsFeatureMatrixIndices,
  useCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
} from '@vitessce/vit-s';
import {
  getCellSetPolygons, mergeObsSets, setObsSelection, getCellColors,
} from '@vitessce/sets-utils';
import {
  Scatterplot, ScatterplotTooltipSubscriber, ScatterplotOptions,
  getPointSizeDevicePixels,
  getPointOpacity,
  EmptyMessage,
} from '@vitessce/scatterplot';
import { ViewType, COMPONENT_COORDINATION_TYPES, ViewHelpMapping } from '@vitessce/constants-internal';
import GatingScatterplotOptions from './GatingScatterplotOptions.js';

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
export function GatingSubscriber(props) {
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
    helpText = ViewHelpMapping.GATING,
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
    embeddingZoom: zoom,
    embeddingTargetX: targetX,
    embeddingTargetY: targetY,
    embeddingTargetZ: targetZ,
    obsFilter: cellFilter,
    obsHighlight: cellHighlight,
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
    featureSelection: gatingFeatureSelectionColor,
    featureValueTransform,
    featureValueTransformCoefficient,
    gatingFeatureSelectionX,
    gatingFeatureSelectionY,
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
    setFeatureValueTransform,
    setFeatureValueTransformCoefficient,
    setGatingFeatureSelectionX,
    setGatingFeatureSelectionY,
  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.GATING],
    coordinationScopes,
  );

  const [width, height, deckRef] = useDeckCanvasSize();

  const title = useMemo(() => {
    if (titleOverride) {
      return titleOverride;
    }
    if (!(gatingFeatureSelectionX && gatingFeatureSelectionY)) {
      return 'Gating';
    }
    return `Gating (${gatingFeatureSelectionX} vs ${gatingFeatureSelectionY})`;
  }, [titleOverride, gatingFeatureSelectionX, gatingFeatureSelectionY]);

  const featureSelectionX = useMemo(() => (
    gatingFeatureSelectionX ? [gatingFeatureSelectionX] : null
  ), [gatingFeatureSelectionX]);
  const featureSelectionY = useMemo(() => (
    gatingFeatureSelectionY ? [gatingFeatureSelectionY] : null
  ), [gatingFeatureSelectionY]);

  // Get data from loaders using the data hooks.
  const [{ obsSets: cellSets }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );
  // eslint-disable-next-line no-unused-vars
  const [expressionDataColor, loadedColor, featureSelectionColorStatus] = useFeatureSelection(
    loaders, dataset, false, gatingFeatureSelectionColor,
    { obsType, featureType, featureValueType },
  );
  // eslint-disable-next-line no-unused-vars
  const [expressionDataX, loadedX, featureSelectionXStatus] = useFeatureSelection(
    loaders, dataset, false, featureSelectionX,
    { obsType, featureType, featureValueType },
  );
  // eslint-disable-next-line no-unused-vars
  const [expressionDataY, loadedY, featureSelectionYStatus] = useFeatureSelection(
    loaders, dataset, false, featureSelectionY,
    { obsType, featureType, featureValueType },
  );
  const [
    { obsIndex, featureIndex }, matrixIndicesStatus, matrixIndicesUrls,
  ] = useObsFeatureMatrixIndices(
    loaders, dataset, false,
    { obsType, featureType, featureValueType },
  );
  const cellsCount = obsIndex?.length || 0;

  const isReady = useReady([
    obsSetsStatus,
    featureSelectionColorStatus,
    featureSelectionXStatus,
    featureSelectionYStatus,
    matrixIndicesStatus,
  ]);
  const urls = useUrls([
    obsSetsUrls,
    matrixIndicesUrls,
  ]);

  // Generate a new cells object with a mapping added for the user selected genes.
  const obsXY = useMemo(() => {
    if (!(cellsCount && expressionDataX?.[0] && expressionDataY?.[0]
      && featureSelectionX && featureSelectionY
    )) {
      return null;
    }

    // Get transform coefficient for log and arcsinh
    let coefficient = 1;
    const parsedTransformCoefficient = Number(featureValueTransformCoefficient);
    if (!Number.isNaN(parsedTransformCoefficient) && parsedTransformCoefficient > 0) {
      coefficient = parsedTransformCoefficient;
    }

    // Set transform function
    const transformFunction = getValueTransformFunction(
      featureValueTransform,
      coefficient,
    );

    const obsX = new Float32Array(cellsCount);
    const obsY = new Float32Array(cellsCount);
    for (let i = 0; i < cellsCount; i += 1) {
      obsX[i] = transformFunction(expressionDataX[0][i]);
      obsY[i] = transformFunction(expressionDataY[0][i]);
    }
    return {
      data: [obsX, obsY],
      shape: [2, cellsCount],
    };
  }, [cellsCount, expressionDataX, expressionDataY,
    featureValueTransform, featureValueTransformCoefficient,
    featureSelectionX, featureSelectionY,
  ]);

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

  // cellSetPolygonCache is an array of tuples like [(key0, val0), (key1, val1), ...],
  // where the keys are cellSetSelection arrays.
  const [cellSetPolygonCache, setCellSetPolygonCache] = useState([]);
  const cacheHas = (cache, key) => cache.findIndex(el => isEqual(el[0], key)) !== -1;
  const cacheGet = (cache, key) => cache.find(el => isEqual(el[0], key))?.[1];
  const cellSetPolygons = useMemo(() => {
    if ((cellSetLabelsVisible || cellSetPolygonsVisible)
      && !cacheHas(cellSetPolygonCache, cellSetSelection)
      && mergedCellSets?.tree?.length
      && obsXY
      && obsIndex
      && cellSetColor?.length) {
      const newCellSetPolygons = getCellSetPolygons({
        obsIndex,
        obsEmbedding: obsXY,
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
    obsIndex, obsXY, mergedCellSets, cellSetSelection, cellSetColor]);


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
  }, [xRange, yRange, xExtent, yExtent, numCells,
    width, height, zoom, averageFillDensity]);

  const cellSelectionSet = useMemo(() => new Set(cellSelection), [cellSelection]);
  const getCellIsSelected = useCallback((object, { index }) => (
    (cellSelectionSet || new Set([])).has(obsIndex[index]) ? 1.0 : 0.0
  ), [cellSelectionSet, obsIndex]);

  const cellRadius = (cellRadiusMode === 'manual' ? cellRadiusFixed : dynamicCellRadius);
  const cellOpacity = (cellOpacityMode === 'manual' ? cellOpacityFixed : dynamicCellOpacity);

  const { normData: uint8ExpressionData } = useUint8FeatureSelection(expressionDataColor);

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
      helpText={helpText}
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
          cellSetPolygonsVisible={cellSetPolygonsVisible}
          setCellSetPolygonsVisible={setCellSetPolygonsVisible}
          cellColorEncoding={cellColorEncoding}
          setCellColorEncoding={setCellColorEncoding}
          geneExpressionColormap={geneExpressionColormap}
          setGeneExpressionColormap={setGeneExpressionColormap}
          geneExpressionColormapRange={geneExpressionColormapRange}
          setGeneExpressionColormapRange={setGeneExpressionColormapRange}
        >
          <GatingScatterplotOptions
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
      <EmptyMessage
        visible={!(gatingFeatureSelectionX && gatingFeatureSelectionY)}
        message={`Select two ${plur(featureType, 2)} in the plot settings.`}
      />
      <Scatterplot
        ref={deckRef}
        uuid={uuid}
        theme={theme}
        hideTools={!(gatingFeatureSelectionX && gatingFeatureSelectionY)}
        viewState={{ zoom, target: [targetX, targetY, targetZ] }}
        setViewState={({ zoom: newZoom, target }) => {
          setZoom(newZoom);
          setTargetX(target[0]);
          setTargetY(target[1]);
          setTargetZ(target[2] || 0);
        }}
        obsEmbeddingIndex={obsIndex}
        obsEmbedding={obsXY}
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
