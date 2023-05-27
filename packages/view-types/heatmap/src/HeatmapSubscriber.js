import React, {
  useState, useCallback, useMemo,
} from 'react';
import plur from 'plur';
import {
  TitleInfo,
  useDeckCanvasSize,
  useGetObsInfo,
  useReady,
  useUrls,
  useObsSetsData,
  useObsFeatureMatrixData,
  useUint8ObsFeatureMatrix,
  useMultiObsLabels,
  useFeatureLabelsData,
  useCoordination, useLoaders,
  useSetComponentHover, useSetComponentViewInfo,
} from '@vitessce/vit-s';
import { capitalize, commaNumber, getCellColors } from '@vitessce/utils';
import { mergeObsSets } from '@vitessce/sets-utils';
import { COMPONENT_COORDINATION_TYPES, ViewType } from '@vitessce/constants-internal';
import { Legend } from '@vitessce/legend';
import Heatmap from './Heatmap.js';
import HeatmapTooltipSubscriber from './HeatmapTooltipSubscriber.js';
import HeatmapOptions from './HeatmapOptions.js';


/**
 * @param {object} props
 * @param {number} props.uuid The unique identifier for this component.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 * @param {boolean} props.transpose Whether to
 * render as cell-by-gene or gene-by-cell.
 * @param {boolean} props.disableTooltip Whether to disable the
 * tooltip on mouse hover.
 */
export function HeatmapSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    removeGridComponent,
    theme,
    transpose,
    observationsLabelOverride,
    variablesLabelOverride,
    disableTooltip = false,
    title = 'Heatmap',
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
    heatmapZoomX: zoomX,
    heatmapTargetX: targetX,
    heatmapTargetY: targetY,
    featureSelection: geneSelection,
    obsHighlight: cellHighlight,
    featureHighlight: geneHighlight,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    additionalObsSets: additionalCellSets,
    featureValueColormap: geneExpressionColormap,
    featureValueColormapRange: geneExpressionColormapRange,
    tooltipsVisible,
  }, {
    setHeatmapZoomX: setZoomX,
    setHeatmapZoomY: setZoomY,
    setHeatmapTargetX: setTargetX,
    setHeatmapTargetY: setTargetY,
    setObsHighlight: setCellHighlight,
    setFeatureSelection: setGeneSelection,
    setObsColorEncoding: setCellColorEncoding,
    setFeatureHighlight: setGeneHighlight,
    setObsSetSelection: setCellSetSelection,
    setObsSetColor: setCellSetColor,
    setFeatureValueColormapRange: setGeneExpressionColormapRange,
    setFeatureValueColormap: setGeneExpressionColormap,
    setTooltipsVisible,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.HEATMAP], coordinationScopes);

  const observationsLabel = observationsLabelOverride || obsType;
  const observationsPluralLabel = plur(observationsLabel);
  const variablesLabel = variablesLabelOverride || featureType;
  const variablesPluralLabel = plur(variablesLabel);

  const observationsTitle = capitalize(observationsPluralLabel);
  const variablesTitle = capitalize(variablesPluralLabel);

  const [isRendering, setIsRendering] = useState(false);

  const [urls, addUrl] = useUrls(loaders, dataset);
  const [width, height, deckRef] = useDeckCanvasSize();

  // Get data from loaders using the data hooks.
  const [obsLabelsTypes, obsLabelsData] = useMultiObsLabels(
    coordinationScopes, obsType, loaders, dataset, addUrl,
  );
  // TODO: support multiple feature labels using featureLabelsType coordination values.
  const [{ featureLabelsMap }, featureLabelsStatus] = useFeatureLabelsData(
    loaders, dataset, addUrl, false, {}, {},
    { featureType },
  );
  const [{ obsIndex, featureIndex, obsFeatureMatrix }, matrixStatus] = useObsFeatureMatrixData(
    loaders, dataset, addUrl, true, {}, {},
    { obsType, featureType, featureValueType },
  );
  const [{ obsSets: cellSets, obsSetsMembership }, obsSetsStatus] = useObsSetsData(
    loaders, dataset, addUrl, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );
  const isReady = useReady([
    featureLabelsStatus,
    matrixStatus,
    obsSetsStatus,
  ]);

  const [uint8ObsFeatureMatrix, obsFeatureMatrixExtent] = useUint8ObsFeatureMatrix(
    { obsFeatureMatrix },
  );

  const mergedCellSets = useMemo(() => mergeObsSets(
    cellSets, additionalCellSets,
  ), [cellSets, additionalCellSets]);

  const cellColors = useMemo(() => getCellColors({
    cellSets: mergedCellSets,
    cellSetSelection,
    cellSetColor,
    obsIndex,
    theme,
  }), [mergedCellSets, theme,
    cellSetColor, cellSetSelection, obsIndex]);

  const getObsInfo = useGetObsInfo(
    observationsLabel, obsLabelsTypes, obsLabelsData, obsSetsMembership,
  );

  const getFeatureInfo = useCallback((featureId) => {
    if (featureId) {
      const featureLabel = featureLabelsMap?.get(featureId) || featureId;
      return { [`${capitalize(variablesLabel)} ID`]: featureLabel };
    }
    return null;
  }, [variablesLabel, featureLabelsMap]);

  const expressionMatrix = useMemo(() => {
    if (obsIndex && featureIndex && uint8ObsFeatureMatrix) {
      return {
        rows: obsIndex,
        cols: (featureLabelsMap
          ? featureIndex.map(key => featureLabelsMap.get(key) || key)
          : featureIndex
        ),
        matrix: uint8ObsFeatureMatrix.data,
      };
    }
    return null;
  }, [obsIndex, featureIndex, uint8ObsFeatureMatrix, featureLabelsMap]);

  const cellsCount = obsIndex ? obsIndex.length : 0;
  const genesCount = featureIndex ? featureIndex.length : 0;

  const setTrackHighlight = useCallback(() => {
    // No-op, since the default handler
    // logs in the console on every hover event.
  }, []);

  const onHeatmapClick = () => {
    setGeneSelection([geneHighlight]);
    setCellColorEncoding('geneSelection');
  };

  const cellColorLabels = useMemo(() => ([
    `${capitalize(observationsLabel)} Set`,
  ]), [observationsLabel]);

  const selectedCount = cellColors.size;
  return (
    <TitleInfo
      title={title}
      info={`${commaNumber(cellsCount)} ${plur(observationsLabel, cellsCount)} × ${commaNumber(genesCount)} ${plur(variablesLabel, genesCount)},
             with ${commaNumber(selectedCount)} ${plur(observationsLabel, selectedCount)} selected`}
      urls={urls}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady && !isRendering}
      options={(
        <HeatmapOptions
          geneExpressionColormap={geneExpressionColormap}
          setGeneExpressionColormap={setGeneExpressionColormap}
          geneExpressionColormapRange={geneExpressionColormapRange}
          setGeneExpressionColormapRange={setGeneExpressionColormapRange}
          tooltipsVisible={tooltipsVisible}
          setTooltipsVisible={setTooltipsVisible}
        />
      )}
    >
      <Heatmap
        ref={deckRef}
        transpose={transpose}
        viewState={{ zoom: zoomX, target: [targetX, targetY] }}
        setViewState={({ zoom, target }) => {
          setZoomX(zoom);
          setZoomY(zoom);
          setTargetX(target[0]);
          setTargetY(target[1]);
        }}
        colormapRange={geneExpressionColormapRange}
        setColormapRange={setGeneExpressionColormapRange}
        height={height}
        width={width}
        theme={theme}
        uuid={uuid}
        expressionMatrix={expressionMatrix}
        cellColors={cellColors}
        colormap={geneExpressionColormap}
        setIsRendering={setIsRendering}
        setCellHighlight={setCellHighlight}
        setGeneHighlight={setGeneHighlight}
        featureIndex={featureIndex}
        setTrackHighlight={setTrackHighlight}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
        observationsTitle={observationsTitle}
        variablesTitle={variablesTitle}
        variablesDashes={false}
        observationsDashes={false}
        cellColorLabels={cellColorLabels}
        useDevicePixels
        onHeatmapClick={onHeatmapClick}
      />
      {!disableTooltip && tooltipsVisible && (
      <HeatmapTooltipSubscriber
        parentUuid={uuid}
        width={width}
        height={height}
        transpose={transpose}
        getObsInfo={getObsInfo}
        getFeatureInfo={getFeatureInfo}
        obsHighlight={cellHighlight}
        featureHighlight={geneHighlight}
      />
      )}
      <Legend
        visible
        theme={theme}
        featureType={featureType}
        featureValueType={featureValueType}
        obsColorEncoding="geneExpression"
        considerSelections={false}
        featureSelection={geneSelection}
        featureValueColormap={geneExpressionColormap}
        featureValueColormapRange={geneExpressionColormapRange}
        extent={obsFeatureMatrixExtent}
      />
    </TitleInfo>
  );
}
