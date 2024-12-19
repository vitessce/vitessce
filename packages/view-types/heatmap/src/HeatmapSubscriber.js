import React, {
  useState, useCallback, useMemo,
} from 'react';
import {
  TitleInfo,
  useDeckCanvasSize,
  useGetObsMembership,
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
  useExpandedFeatureLabelsMap,
} from '@vitessce/vit-s';
import { pluralize as plur, capitalize, commaNumber, cleanFeatureId } from '@vitessce/utils';
import { mergeObsSets, findLongestCommonPath, getCellColors } from '@vitessce/sets-utils';
import { COMPONENT_COORDINATION_TYPES, ViewType, ViewHelpMapping } from '@vitessce/constants-internal';
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
 */
export function HeatmapSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    transpose,
    observationsLabelOverride,
    variablesLabelOverride,
    title = 'Heatmap',
    helpText = ViewHelpMapping.HEATMAP,
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
  // We need to know whether the user is currently hovering over the expression part
  // of the heatmap vs. the color bar part, which will affect whether we call
  // setObsColorEncoding with 'geneSelection' or 'cellSetSelection' upon a click.
  const [hoveredColorEncoding, setHoveredColorEncoding] = useState('geneSelection');

  const [width, height, deckRef] = useDeckCanvasSize();

  // Get data from loaders using the data hooks.
  const [obsLabelsTypes, obsLabelsData] = useMultiObsLabels(
    coordinationScopes, obsType, loaders, dataset,
  );
  // TODO: support multiple feature labels using featureLabelsType coordination values.
  // eslint-disable-next-line max-len
  const [{ featureLabelsMap: featureLabelsMapOrig }, featureLabelsStatus, featureLabelsUrls] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
  );
  const [featureLabelsMap, expandedFeatureLabelsStatus] = useExpandedFeatureLabelsMap(
    featureType, featureLabelsMapOrig, { stripCuriePrefixes: true },
  );

  const [
    { obsIndex, featureIndex, obsFeatureMatrix }, matrixStatus, matrixUrls,
  ] = useObsFeatureMatrixData(
    loaders, dataset, true, {}, {},
    { obsType, featureType, featureValueType },
  );
  const [{ obsSets: cellSets, obsSetsMembership }, obsSetsStatus, obsSetsUrls] = useObsSetsData(
    loaders, dataset, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );
  const isReady = useReady([
    featureLabelsStatus,
    expandedFeatureLabelsStatus,
    matrixStatus,
    obsSetsStatus,
  ]);
  const urls = useUrls([
    featureLabelsUrls,
    matrixUrls,
    obsSetsUrls,
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

  const getObsMembership = useGetObsMembership(obsSetsMembership);

  const getFeatureInfo = useCallback((featureId) => {
    if (featureId) {
      const featureLabel = (
        featureLabelsMap?.get(featureId)
        || featureLabelsMap?.get(cleanFeatureId(featureId))
        || featureId
      );
      return { [`${capitalize(variablesLabel)} ID`]: featureLabel };
    }
    return null;
  }, [variablesLabel, featureLabelsMap]);

  const cellsCount = obsIndex ? obsIndex.length : 0;
  const genesCount = featureIndex ? featureIndex.length : 0;

  const setTrackHighlight = useCallback(() => {
    // No-op, since the default handler
    // logs in the console on every hover event.
  }, []);

  const onHeatmapClick = () => {
    if (hoveredColorEncoding === 'geneSelection' && geneHighlight) {
      setGeneSelection([geneHighlight]);
      setCellColorEncoding('geneSelection');
    } else if (hoveredColorEncoding === 'cellSelection' && cellSetSelection) {
      const selectionFullPath = getObsMembership(cellHighlight);
      if (selectionFullPath?.length > 0) {
        const selectionToHighlight = findLongestCommonPath(selectionFullPath, cellSetSelection);
        if (selectionToHighlight) {
          setCellSetSelection([selectionToHighlight]);
          setCellColorEncoding('cellSelection');
        }
      }
    }
  };

  const cellColorLabels = useMemo(() => ([
    `${capitalize(observationsLabel)} Set`,
  ]), [observationsLabel]);

  const selectedCount = cellColors.size;
  return (
    <TitleInfo
      title={title}
      helpText={helpText}
      info={`${commaNumber(cellsCount)} ${plur(observationsLabel, cellsCount)} × ${commaNumber(genesCount)} ${plur(variablesLabel, genesCount)},
             with ${commaNumber(selectedCount)} ${plur(observationsLabel, selectedCount)} selected`}
      urls={urls}
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
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
        uint8ObsFeatureMatrix={uint8ObsFeatureMatrix?.data}
        cellColors={cellColors}
        colormap={geneExpressionColormap}
        setIsRendering={setIsRendering}
        setCellHighlight={setCellHighlight}
        setGeneHighlight={setGeneHighlight}
        featureLabelsMap={featureLabelsMap}
        obsIndex={obsIndex}
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
        setColorEncoding={setHoveredColorEncoding}
      />
      {tooltipsVisible && (
      <HeatmapTooltipSubscriber
        parentUuid={uuid}
        width={width}
        height={height}
        transpose={transpose}
        getObsInfo={getObsInfo}
        getFeatureInfo={getFeatureInfo}
        obsHighlight={cellHighlight}
        featureHighlight={geneHighlight}
        featureType={featureType}
        featureLabelsMap={featureLabelsMap}
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
        obsSetSelection={cellSetSelection}
        featureValueColormap={geneExpressionColormap}
        featureValueColormapRange={geneExpressionColormapRange}
        extent={obsFeatureMatrixExtent}
      />
    </TitleInfo>
  );
}
