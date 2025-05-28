import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { debounce } from 'lodash-es';
import {
  TitleInfo,
  useDeckCanvasSize, useReady, useUrls,
  useObsLocationsData,
  useObsSegmentationsData,
  useObsSetsData,
  useFeatureSelection,
  useImageData,
  useObsFeatureMatrixIndices,
  useFeatureLabelsData,
  useNeighborhoodsData,
  useObsLabelsData,
  useMultiObsLabels,
  useUint8FeatureSelection,
  useExpressionValueGetter,
  useGetObsInfo,
  useInitialCoordination,
  useCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
  useAuxiliaryCoordination,
  useHasLoader,
  useExpandedFeatureLabelsMap,
} from '@vitessce/vit-s';
import {
  setObsSelection,
  mergeObsSets,
  colorArrayToString,
  getCellColors,
} from '@vitessce/sets-utils';
import { canLoadResolution } from '@vitessce/spatial-utils';
import { Legend } from '@vitessce/legend';
import { log } from '@vitessce/globals';
import { COMPONENT_COORDINATION_TYPES, ViewType, DataType, STATUS, ViewHelpMapping } from '@vitessce/constants-internal';
import { Typography } from '@vitessce/styles';
import Spatial from './Spatial.js';
import SpatialOptions from './SpatialOptions.js';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber.js';
import { makeSpatialSubtitle, getInitialSpatialTargets, HOVER_MODE } from './utils.js';

/**
 * A subscriber component for the spatial plot.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function SpatialSubscriber(props) {
  const {
    uuid,
    coordinationScopes,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    observationsLabelOverride,
    subobservationsLabelOverride: subobservationsLabel = 'molecule',
    theme,
    title = 'Spatial',
    disable3d,
    globalDisable3d,
    useFullResolutionImage = {},
    channelNamesVisible = false,
    helpText = ViewHelpMapping.SPATIAL,
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
    spatialZoom: zoom,
    spatialTargetX: targetX,
    spatialTargetY: targetY,
    spatialTargetZ: targetZ,
    spatialRotationX: rotationX,
    spatialRotationY: rotationY,
    spatialRotationZ: rotationZ,
    spatialRotationOrbit: rotationOrbit,
    spatialOrbitAxis: orbitAxis,
    spatialImageLayer: imageLayers,
    spatialSegmentationLayer: cellsLayer,
    spatialPointLayer: moleculesLayer,
    spatialNeighborhoodLayer: neighborhoodsLayer,
    obsFilter: cellFilter,
    obsHighlight: cellHighlight,
    moleculeHighlight,
    featureSelection: geneSelection,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    obsColorEncoding: cellColorEncoding,
    additionalObsSets: additionalCellSets,
    spatialAxisFixed,
    featureValueColormap: geneExpressionColormap,
    featureValueColormapRange: geneExpressionColormapRange,
    tooltipsVisible,
    photometricInterpretation: photometricInterpretationFromCoordination,
  }, {
    setSpatialZoom: setZoom,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialTargetZ: setTargetZ,
    setSpatialRotationX: setRotationX,
    setSpatialRotationOrbit: setRotationOrbit,
    setSpatialOrbitAxis: setOrbitAxis,
    setSpatialImageLayer: setRasterLayers,
    setSpatialSegmentationLayer: setCellsLayer,
    setSpatialPointLayer: setMoleculesLayer,
    setSpatialNeighborhoodLayer: setNeighborhoodsLayer,
    setObsFilter: setCellFilter,
    setObsSetSelection: setCellSetSelection,
    setObsHighlight: setCellHighlight,
    setObsSetColor: setCellSetColor,
    setObsColorEncoding: setCellColorEncoding,
    setAdditionalObsSets: setAdditionalCellSets,
    setMoleculeHighlight,
    setSpatialAxisFixed,
    setFeatureValueColormap: setGeneExpressionColormap,
    setFeatureValueColormapRange: setGeneExpressionColormapRange,
    setTooltipsVisible,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL], coordinationScopes);

  const {
    spatialZoom: initialZoom,
    spatialTargetX: initialTargetX,
    spatialTargetY: initialTargetY,
    spatialTargetZ: initialTargetZ,
  } = useInitialCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL], coordinationScopes,
  );

  const observationsLabel = observationsLabelOverride || obsType;

  const [
    {
      imageLayerCallbacks,
      segmentationLayerCallbacks,
    },
  ] = useAuxiliaryCoordination(
    COMPONENT_COORDINATION_TYPES.layerController,
    coordinationScopes,
  );

  const use3d = imageLayers?.some(l => l.use3d);

  const [width, height, deckRef] = useDeckCanvasSize();

  const [obsLabelsTypes, obsLabelsData] = useMultiObsLabels(
    coordinationScopes, obsType, loaders, dataset,
  );

  const hasExpressionData = useHasLoader(
    loaders, dataset, DataType.OBS_FEATURE_MATRIX,
    { obsType, featureType, featureValueType },
    // TODO: get per-spatialLayerType expression data once #1240 is merged.
  );
  const hasSegmentationsLoader = useHasLoader(
    loaders, dataset, DataType.OBS_SEGMENTATIONS,
    { obsType }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  const hasLocationsData = useHasLoader(
    loaders, dataset, DataType.OBS_LOCATIONS,
    { obsType }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  const hasImageData = useHasLoader(
    loaders, dataset, DataType.IMAGE,
    {}, // TODO: which properties to match on. Revisit after #830.
  );
  // Get data from loaders using the data hooks.
  const [{
    obsIndex: obsLocationsIndex,
    obsLocations,
  }, obsLocationsStatus, obsLocationsUrls] = useObsLocationsData(
    loaders, dataset, false,
    { setSpatialPointLayer: setMoleculesLayer },
    { spatialPointLayer: moleculesLayer },
    { obsType: 'molecule' }, // TODO: use dynamic obsType in matchOn once #1240 is merged.
  );
  const [{
    obsLabels: obsLocationsLabels,
  }, obsLabelsStatus, obsLabelsUrls] = useObsLabelsData(
    loaders, dataset, false, {}, {},
    { obsType: 'molecule' }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  const [{
    obsIndex: obsCentroidsIndex,
    obsLocations: obsCentroids,
  }, obsCentroidsStatus, obsCentroidsUrls] = useObsLocationsData(
    loaders, dataset, false, {}, {},
    { obsType }, // TODO: use dynamic obsType in matchOn once #1240 is merged.
  );
  const [{
    obsIndex: obsSegmentationsIndex,
    obsSegmentations,
    obsSegmentationsType,
  }, obsSegmentationsStatus, obsSegmentationsUrls] = useObsSegmentationsData(
    loaders, dataset, false,
    { setSpatialSegmentationLayer: setCellsLayer },
    { spatialSegmentationLayer: cellsLayer },
    { obsType }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  // In the case of obsSegmentations.raster.json files that have been
  // auto-upgraded from raster.json in older config versions,
  // it is possible to have an obsSegmentations file type in the dataset,
  // but one that returns `null` if all of the raster layers end up being
  // images rather than segmentation bitmasks.
  const hasSegmentationsData = hasSegmentationsLoader && !(
    obsSegmentationsStatus === STATUS.SUCCESS
    && !(obsSegmentations || obsSegmentationsType)
  );
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
  const [{ image }, imageStatus, imageUrls] = useImageData(
    loaders, dataset, false,
    { setSpatialImageLayer: setRasterLayers },
    { spatialImageLayer: imageLayers },
    {}, // TODO: which properties to match on. Revisit after #830.
  );
  const { loaders: imageLayerLoaders = [], meta = [], instance } = image || {};
  const [neighborhoods, neighborhoodsStatus, neighborhoodsUrls] = useNeighborhoodsData(
    loaders, dataset, false,
    { setSpatialNeighborhoodLayer: setNeighborhoodsLayer },
    { spatialNeighborhoodLayer: neighborhoodsLayer },
  );
  // eslint-disable-next-line max-len
  const [{ featureLabelsMap: featureLabelsMapOrig }, featureLabelsStatus, featureLabelsUrls] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
  );
  const [featureLabelsMap, expandedFeatureLabelsStatus] = useExpandedFeatureLabelsMap(
    featureType, featureLabelsMapOrig, { stripCuriePrefixes: true },
  );

  const photometricInterpretation = (
    photometricInterpretationFromCoordination
    ?? instance?.getPhotometricInterpretation()
  );


  const isReady = useReady([
    obsLocationsStatus,
    obsLabelsStatus,
    obsCentroidsStatus,
    obsSegmentationsStatus,
    obsSetsStatus,
    featureSelectionStatus,
    matrixIndicesStatus,
    imageStatus,
    neighborhoodsStatus,
    featureLabelsStatus,
    expandedFeatureLabelsStatus,
  ]);
  const urls = useUrls([
    obsLocationsUrls,
    obsLabelsUrls,
    obsCentroidsUrls,
    obsSegmentationsUrls,
    obsSetsUrls,
    matrixIndicesUrls,
    imageUrls,
    neighborhoodsUrls,
    featureLabelsUrls,
  ]);

  const obsLocationsFeatureIndex = useMemo(() => {
    if (obsLocationsLabels) {
      return Array.from(new Set(obsLocationsLabels));
    }
    return null;
  }, [obsLocationsLabels]);
  const moleculesCount = obsLocationsFeatureIndex?.length || 0;
  const locationsCount = obsLocationsIndex?.length || 0;

  const [originalViewState, setOriginalViewState] = useState(null);

  // Compute initial viewState values to use if targetX and targetY are not
  // defined in the initial configuration.
  const {
    initialTargetX: defaultTargetX, initialTargetY: defaultTargetY,
    initialTargetZ: defaultTargetZ, initialZoom: defaultZoom,
  } = useMemo(() => getInitialSpatialTargets({
    width,
    height,
    obsCentroids,
    obsSegmentations,
    obsSegmentationsType,
    // TODO: use obsLocations (molecules) here too.
    imageLayerLoaders,
    useRaster: Boolean(hasImageData),
    use3d,
    modelMatrices: meta.map(({ metadata }) => metadata?.transform?.matrix),
  }),
  // Deliberate dependency omissions: imageLayerLoaders and meta - using `image` as
  // an indirect dependency instead.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [image, use3d, hasImageData, obsCentroids, obsSegmentations, obsSegmentationsType,
    width, height,
  ]);

  useEffect(() => {
    // If it has not already been set, set the initial view state using
    // the auto-computed values from the useMemo above.
    if (typeof initialTargetX !== 'number' || typeof initialTargetY !== 'number') {
      const notYetInitialized = (typeof targetX !== 'number' || typeof targetY !== 'number');
      const stillDefaultInitialized = (targetX === defaultTargetX && targetY === defaultTargetY);
      if (notYetInitialized || stillDefaultInitialized) {
        setTargetX(defaultTargetX);
        setTargetY(defaultTargetY);
        setTargetZ(defaultTargetZ);
        setZoom(defaultZoom);
      }
      setOriginalViewState(
        { target: [defaultTargetX, defaultTargetY, defaultTargetZ], zoom: defaultZoom },
      );
    } else if (!originalViewState) {
      // originalViewState has not yet been set and
      // the view config defined an initial viewState.
      setOriginalViewState({
        target: [initialTargetX, initialTargetY, initialTargetZ], zoom: initialZoom,
      });
    }
    // Deliberate dependency omissions: targetX, targetY
    // since we do not this to re-run on every single zoom/pan interaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTargetX, defaultTargetY, defaultTargetZ, defaultZoom,
    initialTargetX, initialTargetY, initialTargetZ, initialZoom,
  ]);

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
    cellSetColor, cellSetSelection, matrixObsIndex]);

  const cellSelection = useMemo(() => Array.from(cellColors.keys()), [cellColors]);

  const getObsInfo = useGetObsInfo(
    observationsLabel, obsLabelsTypes, obsLabelsData, obsSetsMembership,
  );

  const getTooltipObsInfo = useCallback((tooltipObsId, tooltipObsType) => {
    if (tooltipObsType === HOVER_MODE.MOLECULE_LAYER) {
      // TODO: Augment getObsInfo to work with molecule obsTypes and obsLocationsLabels.
      return {
        'Molecule ID': tooltipObsId,
        'Molecule Name': obsLocationsLabels[tooltipObsId],
      };
    }
    return getObsInfo(tooltipObsId);
  }, [getObsInfo, obsLocationsLabels]);

  const [hoverData, setHoverData] = useState(null);
  const [hoverCoord, setHoverCoord] = useState(null);
  const [hoverMode, setHoverMode] = useState(null);

  // Should hover position be used for tooltips?
  // If there are centroids for each observation, then we can use those
  // to position tooltips. However if there are not centroids,
  // the other option is to use the mouse location.
  const useHoverInfoForTooltip = !obsCentroids;

  const setHoverInfo = useCallback(debounce((data, coord, hoveredMode) => {
    setHoverData(data);
    setHoverCoord(coord);
    setHoverMode(hoveredMode);
  }, 10, { trailing: true }),
  [setHoverData, setHoverCoord, setHoverMode]);

  const getObsIdFromHoverData = useCallback((data) => {
    if (data) {
      // TODO: When there is support for multiple segmentation channels that may
      // contain different obsTypes, then do not hard-code the zeroth channel.
      const spatialTargetC = 0;
      const obsId = data?.[spatialTargetC];
      return obsId;
    }
    return null;
  }, [useHoverInfoForTooltip]);

  const setViewState = ({
    zoom: newZoom,
    target,
    rotationX: newRotationX,
    rotationOrbit: newRotationOrbit,
    orbitAxis: newOrbitAxis,
  }) => {
    setZoom(newZoom);
    setTargetX(target[0]);
    setTargetY(target[1]);
    setTargetZ(target[2] || null);
    setRotationX(newRotationX);
    setRotationOrbit(newRotationOrbit);
    setOrbitAxis(newOrbitAxis || null);
  };

  const subtitle = makeSpatialSubtitle({
    observationsCount: obsSegmentationsIndex?.length || matrixObsIndex?.length,
    observationsLabel,
    subobservationsCount: moleculesCount,
    subobservationsLabel,
    locationsCount,
  });

  const {
    normData: uint8ExpressionData,
    extents: expressionExtents,
  } = useUint8FeatureSelection(expressionData);

  // The bitmask layer needs access to a array (i.e a texture) lookup of cell -> expression value
  // where each cell id indexes into the array.
  // Cell ids in `attrs.rows` do not necessaryily correspond to indices in that array, though,
  // so we create a "shifted" array where this is the case.
  const shiftedExpressionDataForBitmask = useMemo(() => {
    if (matrixObsIndex && uint8ExpressionData && obsSegmentationsType === 'bitmask') {
      const maxId = matrixObsIndex.reduce((max, curr) => Math.max(max, Number(curr)));
      const result = new Uint8Array(maxId + 1);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < matrixObsIndex.length; i++) {
        const id = matrixObsIndex[i];
        result.set(uint8ExpressionData[0].slice(i, i + 1), Number(id));
      }
      return [result];
    } return [new Uint8Array()];
  }, [matrixObsIndex, uint8ExpressionData, obsSegmentationsType]);

  // Set up a getter function for gene expression values, to be used
  // by the DeckGL layer to obtain values for instanced attributes.
  const getExpressionValue = useExpressionValueGetter({
    // eslint-disable-next-line no-unneeded-ternary
    instanceObsIndex: (obsSegmentationsIndex
      // When there are polygon cell segmentations.
      ? obsSegmentationsIndex
      // When there are not polygon cell segmentations, and we need to make fake diamonds.
      : obsCentroidsIndex
    ),
    matrixObsIndex,
    expressionData: uint8ExpressionData,
  });
  const canLoad3DLayers = imageLayerLoaders.some(loader => Boolean(
    Array.from({
      length: loader.data.length,
    }).filter((_, res) => canLoadResolution(loader.data, res)).length,
  ));
  // Only show 3D options if we can theoretically load the data and it is allowed to be loaded.
  const canShow3DOptions = canLoad3DLayers
    && !(disable3d?.length === imageLayerLoaders.length) && !globalDisable3d;

  const options = useMemo(() => {
    // Only show button if there is expression or 3D data because only cells data
    // does not have any options (i.e for color encoding, you need to switch to expression data)
    if (canShow3DOptions || hasExpressionData) {
      return (
        <SpatialOptions
          observationsLabel={observationsLabel}
          cellColorEncoding={cellColorEncoding}
          setCellColorEncoding={setCellColorEncoding}
          setSpatialAxisFixed={setSpatialAxisFixed}
          spatialAxisFixed={spatialAxisFixed}
          use3d={use3d}
          tooltipsVisible={tooltipsVisible}
          setTooltipsVisible={setTooltipsVisible}
          geneExpressionColormap={geneExpressionColormap}
          setGeneExpressionColormap={setGeneExpressionColormap}
          geneExpressionColormapRange={geneExpressionColormapRange}
          setGeneExpressionColormapRange={setGeneExpressionColormapRange}
          canShowExpressionOptions={hasExpressionData}
          canShowColorEncodingOption={
            (hasLocationsData || hasSegmentationsData) && hasExpressionData
          }
          canShow3DOptions={canShow3DOptions}
        />
      );
    }
    return null;
  }, [canShow3DOptions, cellColorEncoding, geneExpressionColormap,
    geneExpressionColormapRange, setGeneExpressionColormap,
    hasLocationsData, hasSegmentationsData, hasExpressionData,
    observationsLabel, setCellColorEncoding,
    setGeneExpressionColormapRange, setSpatialAxisFixed, spatialAxisFixed, use3d,
    tooltipsVisible, setTooltipsVisible,
  ]);

  useEffect(() => {
    // For backwards compatibility (diamond case).
    // Log to the console to alert the user that the auto-generated diamonds are being used.
    if (!hasSegmentationsData
      && cellsLayer && !obsSegmentations && !obsSegmentationsIndex
      && obsCentroids && obsCentroidsIndex
    ) {
      log.warn('Rendering cell segmentation diamonds for backwards compatibility.');
    }
  }, [hasSegmentationsData, cellsLayer, obsSegmentations, obsSegmentationsIndex,
    obsCentroids, obsCentroidsIndex,
  ]);

  // Without useMemo, this would propagate a change every time the component
  // re - renders as opposed to when it has to.
  const resolutionFilteredImageLayerLoaders = useMemo(() => {
    // eslint-disable-next-line max-len
    const shouldUseFullData = (ll, index) => Array.isArray(useFullResolutionImage) && useFullResolutionImage.includes(meta[index].name) && Array.isArray(ll.data);
    // eslint-disable-next-line max-len
    return imageLayerLoaders.map((ll, index) => (shouldUseFullData(ll, index) ? { ...ll, data: ll.data[0] } : ll));
  }, [imageLayerLoaders, useFullResolutionImage, meta]);

  const [channelNames, channelColors] = useMemo(() => {
    let names = [];
    let colors = [];

    if (
      imageLayers && imageLayers.length > 0
      && imageLayerLoaders && imageLayerLoaders.length > 0
    ) {
      const firstImageLayer = imageLayers[0];
      const firstImageLayerLoader = imageLayerLoaders?.[firstImageLayer?.index];
      if (
        firstImageLayer && !firstImageLayer.colormap && firstImageLayer.channels
        && firstImageLayerLoader
      ) {
        const allChannels = firstImageLayerLoader.channels;
        // Bioformats-Zarr uses selection.channel but OME-TIFF and OME-Zarr use selection.c
        names = firstImageLayer.channels
          .map(c => allChannels[
            c.selection.channel === undefined ? c.selection.c : c.selection.channel
          ]);
        colors = firstImageLayer
          .channels.map(c => c.color);
      }
    }

    return [names, colors];
  }, [imageLayers, imageLayerLoaders]);

  return (
    <TitleInfo
      title={title}
      info={subtitle}
      isSpatial
      urls={urls}
      theme={theme}
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
      options={options}
      helpText={helpText}
    >
      <div style={{
        position: 'absolute',
        bottom: '5px',
        left: '5px',
        zIndex: 6,
      }}
      >
        {channelNamesVisible && channelNames ? channelNames.map((name, i) => (
          <Typography
            variant="h6"
            key={`${name}-${colorArrayToString(channelColors[i])}`}
            style={{
              color: colorArrayToString(channelColors[i]),
              fontSize: '14px',
            }}
          >
            {name}
          </Typography>
        )) : null}
      </div>
      <Spatial
        ref={deckRef}
        uuid={uuid}
        width={width}
        height={height}
        viewState={{
          zoom,
          target: [targetX, targetY, targetZ],
          rotationX,
          rotationY,
          rotationZ,
          rotationOrbit,
          orbitAxis,
        }}
        setViewState={setViewState}
        originalViewState={originalViewState}
        imageLayerDefs={imageLayers}
        obsSegmentationsLayerDefs={cellsLayer}
        obsLocationsLayerDefs={moleculesLayer}
        neighborhoodLayerDefs={neighborhoodsLayer}
        obsLocationsIndex={obsLocationsIndex}
        obsSegmentationsIndex={obsSegmentationsIndex}
        obsLocations={obsLocations}
        obsLocationsLabels={obsLocationsLabels}
        obsLocationsFeatureIndex={obsLocationsFeatureIndex}
        hasSegmentations={hasSegmentationsData}
        obsSegmentations={obsSegmentations}
        obsSegmentationsType={obsSegmentationsType}
        obsCentroids={obsCentroids}
        obsCentroidsIndex={obsCentroidsIndex}
        cellFilter={cellFilter}
        cellSelection={cellSelection}
        cellHighlight={cellHighlight}
        cellColors={cellColors}
        neighborhoods={neighborhoods}
        imageLayerLoaders={resolutionFilteredImageLayerLoaders}
        setCellFilter={setCellFilter}
        setCellSelection={setCellSelectionProp}
        setCellHighlight={setCellHighlight}
        setHoverInfo={setHoverInfo}
        setMoleculeHighlight={setMoleculeHighlight}
        setComponentHover={() => {
          setComponentHover(uuid);
        }}
        updateViewInfo={setComponentViewInfo}
        imageLayerCallbacks={imageLayerCallbacks}
        segmentationLayerCallbacks={segmentationLayerCallbacks}
        spatialAxisFixed={spatialAxisFixed}
        geneExpressionColormap={geneExpressionColormap}
        geneExpressionColormapRange={geneExpressionColormapRange}
        expressionData={shiftedExpressionDataForBitmask}
        cellColorEncoding={cellColorEncoding}
        getExpressionValue={getExpressionValue}
        theme={theme}
        useFullResolutionImage={useFullResolutionImage}
        photometricInterpretation={photometricInterpretation}
      />
      {tooltipsVisible && (
        <SpatialTooltipSubscriber
          parentUuid={uuid}
          obsHighlight={cellHighlight || moleculeHighlight}
          width={width}
          height={height}
          getObsInfo={getTooltipObsInfo}
          useHoverInfoForTooltip={useHoverInfoForTooltip}
          hoverData={hoverData}
          hoverCoord={hoverCoord}
          hoverMode={hoverMode}
          getObsIdFromHoverData={getObsIdFromHoverData}
          featureType={featureType}
          featureLabelsMap={featureLabelsMap}
        />
      )}
      <Legend
        visible
        // Fix to dark theme due to black background of spatial plot.
        theme="dark"
        featureType={featureType}
        featureValueType={featureValueType}
        obsColorEncoding={cellColorEncoding}
        obsSetSelection={cellSetSelection}
        featureSelection={geneSelection}
        featureLabelsMap={featureLabelsMap}
        featureValueColormap={geneExpressionColormap}
        featureValueColormapRange={geneExpressionColormapRange}
        extent={expressionExtents?.[0]}
      />
    </TitleInfo>
  );
}
