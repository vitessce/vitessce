/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import debounce from 'lodash/debounce';
import {
  TitleInfo,
  useDeckCanvasSize, useReady, useUrls,
  useObsLocationsData,
  useObsSegmentationsData,
  useObsSetsData,
  useFeatureSelection,
  useImageData,
  useObsFeatureMatrixIndices,
  useNeighborhoodsData,
  useObsLabelsData,
  useMultiObsLabels,
  useMultiObsSegmentations,
  useMultiImages,
  useMultiFeatureSelection,
  useMultiObsFeatureMatrixIndices,
  useExpressionValueGetter,
  useCoordination,
  useLoaders,
  useSetComponentHover,
  useSetComponentViewInfo,
  useAuxiliaryCoordination,
  useHasLoader,
  useComplexCoordination,
  useMultiCoordinationScopes,
  useMultiCoordinationScopesSecondary,
  useComplexCoordinationSecondary,
  useCoordinationScopes,
  useCoordinationScopesBy,
} from '@vitessce/vit-s';
import { canLoadResolution, commaNumber, getCellColors } from '@vitessce/utils';
import { COMPONENT_COORDINATION_TYPES, ViewType, DataType, CoordinationType } from '@vitessce/constants-internal';
import { setObsSelection, mergeObsSets } from '@vitessce/sets-utils';
import { Legend } from '@vitessce/legend';
import Spatial from './Spatial';
import SpatialOptions from './SpatialOptions';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber';
import { makeSpatialSubtitle, getInitialSpatialTargets } from './utils';
import MultiLegend from './MultiLegend';

const tempLayer = [{
  index: 0,
  colormap: null,
  domainType: "Min/Max",
  modelMatrix: undefined,
  opacity: 1,
  renderingMode: "Additive",
  transparentColor: null,
  type: "bitmask",
  use3d: false,
  visible: true,
  channels: [
    {
      selection: { t: 0, z: 0, c: undefined }, // should fill in c.
      visible: true,
      slider: [0, 1],
      color: [255, 255, 255],
    },
  ],
}];

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
    coordinationScopes: coordinationScopesRaw,
    coordinationScopesBy: coordinationScopesByRaw,
    removeGridComponent,
    observationsLabelOverride,
    subobservationsLabelOverride: subobservationsLabel = 'molecule',
    theme,
    disableTooltip = false,
    title = 'Spatial',
    disable3d,
    globalDisable3d,
    obsSegmentationsMatchOn = 'image',
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);

  // Acccount for possible meta-coordination.
  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);
  const coordinationScopesBy = useCoordinationScopesBy(coordinationScopes, coordinationScopesByRaw);

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
    spatialSegmentationLayer: cellsLayer,
    spatialPointLayer: moleculesLayer,
    spatialNeighborhoodLayer: neighborhoodsLayer,
    obsFilter: cellFilter,
    obsHighlight: cellHighlight,
    featureSelection: geneSelection,
    obsSetSelection: cellSetSelection,
    obsSetColor: cellSetColor,
    obsColorEncoding: cellColorEncoding,
    additionalObsSets: additionalCellSets,
    spatialAxisFixed,
    featureValueColormap: geneExpressionColormap,
    featureValueColormapRange: geneExpressionColormapRange,
  }, {
    setSpatialZoom: setZoom,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialTargetZ: setTargetZ,
    setSpatialRotationX: setRotationX,
    setSpatialRotationOrbit: setRotationOrbit,
    setSpatialOrbitAxis: setOrbitAxis,
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
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL], coordinationScopes);

  const observationsLabel = observationsLabelOverride || obsType;

  // Normalize arrays and non-arrays to always be arrays.
  const segmentationLayerScopes = useMultiCoordinationScopes(
    CoordinationType.SPATIAL_SEGMENTATION_LAYER,
    coordinationScopes,
  );

  const [imageLayerScopes, imageChannelScopesByLayer] = useMultiCoordinationScopesSecondary(
    CoordinationType.SPATIAL_IMAGE_CHANNEL,
    CoordinationType.SPATIAL_IMAGE_LAYER,
    coordinationScopes,
    coordinationScopesBy,
  );

  // Object keys are coordination scope names for spatialSegmentationLayer.
  const segmentationLayerCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.IMAGE,
      CoordinationType.SPATIAL_TARGET_C,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.SPATIAL_CHANNEL_COLOR,
      CoordinationType.SPATIAL_LAYER_FILLED,
      CoordinationType.SPATIAL_LAYER_STROKE_WIDTH,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPATIAL_SEGMENTATION_LAYER,
  );

  const imageLayerCoordination = useComplexCoordination(
    [
      CoordinationType.IMAGE,
      CoordinationType.SPATIAL_IMAGE_CHANNEL,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPATIAL_IMAGE_LAYER,
  );

  // Object keys are coordination scope names for spatialImageChannel.
  const imageChannelCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.SPATIAL_TARGET_C,
      CoordinationType.SPATIAL_CHANNEL_VISIBLE,
      CoordinationType.SPATIAL_CHANNEL_COLOR,
    ],
    coordinationScopesBy,
    CoordinationType.SPATIAL_IMAGE_LAYER,
    CoordinationType.SPATIAL_IMAGE_CHANNEL,
  );

  const [
    {
      imageLayerCallbacks,
      segmentationLayerCallbacks,
    },
  ] = useAuxiliaryCoordination(
    COMPONENT_COORDINATION_TYPES.layerController,
    coordinationScopes,
  );
  
  const imageLayers = []; // TODO: remove
  const use3d = imageLayers?.some(l => l.use3d);

  const [urls, addUrl] = useUrls(loaders, dataset);
  const [width, height, deckRef] = useDeckCanvasSize();

  const [obsLabelsTypes, obsLabelsData] = useMultiObsLabels(
    coordinationScopes, obsType, loaders, dataset, addUrl,
  );

  const [obsTypes, obsSegmentationsData, obsSegmentationsDataStatus] = useMultiObsSegmentations(
    coordinationScopes, coordinationScopesBy, loaders, dataset, () => {}, obsSegmentationsMatchOn,
  );
  const [imageData, imageDataStatus] = useMultiImages(
    coordinationScopes, coordinationScopesBy, loaders, dataset, () => {},
  );

  const [multiExpressionData, multiLoadedFeatureSelection, multiFeatureSelectionStatus] = useMultiFeatureSelection(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [multiIndicesData, multiIndicesDataStatus] = useMultiObsFeatureMatrixIndices(
    coordinationScopes, coordinationScopesBy, loaders, dataset, () => {},
  );

  const hasExpressionData = useHasLoader(
    loaders, dataset, DataType.OBS_FEATURE_MATRIX,
    { obsType, featureType, featureValueType },
    // TODO: get per-spatialLayerType expression data once #1240 is merged.
  );
  const hasSegmentationsData = Object.entries(obsSegmentationsData).length > 0;
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
  }, obsLocationsStatus] = useObsLocationsData(
    loaders, dataset, addUrl, false,
    { setSpatialPointLayer: setMoleculesLayer },
    { spatialPointLayer: moleculesLayer },
    { obsType: 'molecule' }, // TODO: use dynamic obsType in matchOn once #1240 is merged.
  );
  const [{
    obsLabels: obsLocationsLabels,
  }, obsLabelsStatus] = useObsLabelsData(
    loaders, dataset, addUrl, false, {}, {},
    { obsType: 'molecule' }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  const [{
    obsIndex: obsCentroidsIndex,
    obsLocations: obsCentroids,
  }, obsCentroidsStatus] = useObsLocationsData(
    loaders, dataset, addUrl, false, {}, {},
    { obsType }, // TODO: use dynamic obsType in matchOn once #1240 is merged.
  );
  const [{
    obsIndex: obsSegmentationsIndex,
    obsSegmentations,
    obsSegmentationsType,
  }, obsSegmentationsStatus] = useObsSegmentationsData(
    loaders, dataset, addUrl, false,
    { setSpatialSegmentationLayer: setCellsLayer },
    { spatialSegmentationLayer: cellsLayer },
    { obsType }, // TODO: use obsType in matchOn once #1240 is merged.
  );
  const [{ obsSets: cellSets, obsSetsMembership }, obsSetsStatus] = useObsSetsData(
    loaders, dataset, addUrl, false,
    { setObsSetSelection: setCellSetSelection, setObsSetColor: setCellSetColor },
    { obsSetSelection: cellSetSelection, obsSetColor: cellSetColor },
    { obsType },
  );
  // eslint-disable-next-line no-unused-vars
  const [expressionData, loadedFeatureSelection, featureSelectionStatus] = useFeatureSelection(
    loaders, dataset, false, geneSelection,
    { obsType, featureType, featureValueType },
  );
  const [{ obsIndex: matrixObsIndex }, matrixIndicesStatus] = useObsFeatureMatrixIndices(
    loaders, dataset, addUrl, false,
    { obsType, featureType, featureValueType },
  );
  const [{ image }, imageStatus] = useImageData(
    loaders, dataset, addUrl, false,
    {},
    {},
    {}, // TODO: which properties to match on. Revisit after #830.
  );
  const { loaders: imageLayerLoaders = [] } = image || {};
  const [neighborhoods, neighborhoodsStatus] = useNeighborhoodsData(
    loaders, dataset, addUrl, false,
    { setSpatialNeighborhoodLayer: setNeighborhoodsLayer },
    { spatialNeighborhoodLayer: neighborhoodsLayer },
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
  ]);

  const obsLocationsFeatureIndex = useMemo(() => {
    if (obsLocationsLabels) {
      return Array.from(new Set(obsLocationsLabels));
    }
    return null;
  }, [obsLocationsLabels]);
  const moleculesCount = obsLocationsFeatureIndex?.length || 0;
  const locationsCount = obsLocationsIndex?.length || 0;

  useEffect(() => {
    if ((typeof targetX !== 'number' || typeof targetY !== 'number')) {
      const {
        initialTargetX, initialTargetY, initialTargetZ, initialZoom,
      } = getInitialSpatialTargets({
        width,
        height,
        obsCentroids,
        obsSegmentations,
        obsSegmentationsType,
        // TODO: use obsLocations (molecules) here too.
        imageLayerLoaders,
        useRaster: Boolean(hasImageData),
        use3d,
      });
      setTargetX(initialTargetX);
      setTargetY(initialTargetY);
      setTargetZ(initialTargetZ);
      setZoom(initialZoom);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageLayerLoaders, targetX, targetY, setTargetX, setTargetY,
    setZoom, use3d, hasImageData, obsCentroids, obsSegmentations, obsSegmentationsType]);

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
    cellColorEncoding,
    expressionData: expressionData && expressionData[0],
    geneSelection,
    cellSets: mergedCellSets,
    cellSetSelection,
    cellSetColor,
    obsIndex: matrixObsIndex,
    theme,
  }), [cellColorEncoding, geneSelection, mergedCellSets, theme,
    cellSetColor, cellSetSelection, expressionData, matrixObsIndex]);

  // The bitmask layer needs access to a array (i.e a texture) lookup of cell -> expression value
  // where each cell id indexes into the array.
  // Cell ids in `attrs.rows` do not necessaryily correspond to indices in that array, though,
  // so we create a "shifted" array where this is the case.
  const shiftedExpressionDataForBitmask = useMemo(() => {
    if (matrixObsIndex && expressionData && obsSegmentationsType === 'bitmask') {
      const maxId = matrixObsIndex.reduce((max, curr) => Math.max(max, Number(curr)));
      const result = new Uint8Array(maxId + 1);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < matrixObsIndex.length; i++) {
        const id = matrixObsIndex[i];
        result.set(expressionData[0].slice(i, i + 1), Number(id));
      }
      return [result];
    } return [new Uint8Array()];
  }, [matrixObsIndex, expressionData, obsSegmentationsType]);

  const cellSelection = useMemo(() => Array.from(cellColors.keys()), [cellColors]);

  /*const getObsInfo = useGetObsInfo(
    observationsLabel, obsLabelsTypes, obsLabelsData, obsSetsMembership,
  );*/

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
    expressionData,
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
    // TODO: show options if there are featureSelections (use results of useMultiFeatureSelection)
    if (canShow3DOptions || hasExpressionData) {
      return (
        <SpatialOptions
          observationsLabel={observationsLabel}
          cellColorEncoding={cellColorEncoding}
          setCellColorEncoding={setCellColorEncoding}
          setSpatialAxisFixed={setSpatialAxisFixed}
          spatialAxisFixed={spatialAxisFixed}
          use3d={use3d}
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
  ]);

  useEffect(() => {
    // For backwards compatibility (diamond case).
    // Log to the console to alert the user that the auto-generated diamonds are being used.
    if (!hasSegmentationsData
      && cellsLayer && !obsSegmentations && !obsSegmentationsIndex
      && obsCentroids && obsCentroidsIndex
    ) {
      console.warn('Rendering cell segmentation diamonds for backwards compatibility.');
    }
  }, [hasSegmentationsData, cellsLayer, obsSegmentations, obsSegmentationsIndex,
    obsCentroids, obsCentroidsIndex,
  ]);

  const [hoverData, setHoverData] = useState(null);
  const [hoverCoord, setHoverCoord] = useState(null);

  const getObsInfo = useCallback((channelData) => {
    if (channelData) {
      const result = {};
      let hasObsInfo = false;
      segmentationLayerScopes.forEach((layerScope) => {
        const {
          obsType: layerObsType,
          spatialTargetC,
          spatialLayerVisible,
        } = segmentationLayerCoordination[0][layerScope];
        if (spatialLayerVisible && channelData[spatialTargetC] > 0) {
          hasObsInfo = true;
          result[`${layerObsType} ID`] = channelData[spatialTargetC];
          if (multiExpressionData?.[layerScope] && multiLoadedFeatureSelection?.[layerScope]) {
            const channelFeature = multiLoadedFeatureSelection?.[layerScope]?.[0];
            const channelFeatureData = multiExpressionData?.[layerScope];
            const unitSuffix = channelFeature.endsWith('Area') ? ' microns squared' : (
              channelFeature.endsWith('Thickness') ? ' microns' : ''
            );

            // TODO: use multiIndicesData to obtain an index into the obsFeatureMatrix data
            // using the bitmask channel value.
            // For the sake of time, here I am assuming the off-by-one alignment.
            const channelFeatureValue = channelFeatureData[0][channelData[spatialTargetC] - 1];
            result[`${layerObsType} ${channelFeature}`] = commaNumber(channelFeatureValue) + unitSuffix;
          }
        }
      });
      return hasObsInfo ? result : null;
    }
    return null;
  }, [segmentationLayerScopes, segmentationLayerCoordination,
    multiExpressionData, multiLoadedFeatureSelection, multiIndicesData,
  ]);

  const setMultiObsHighlight = useCallback(debounce((a, b) => {
    setHoverData(a);
    setHoverCoord(b);
  }, 10, { trailing: true }), [setHoverData, setHoverCoord]);

  return (
    <TitleInfo
      title={title}
      info={subtitle}
      isSpatial
      urls={urls}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady={isReady}
      options={options}
    >
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
        imageLayerDefs={imageLayers}
        obsSegmentationsLayerDefs={tempLayer}
        obsLocationsLayerDefs={moleculesLayer}
        neighborhoodLayerDefs={neighborhoodsLayer}
        obsLocationsIndex={obsLocationsIndex}
        obsSegmentationsIndex={obsSegmentationsIndex}
        obsLocations={obsLocations}
        obsLocationsLabels={obsLocationsLabels}
        obsLocationsFeatureIndex={obsLocationsFeatureIndex}
        hasSegmentations={hasSegmentationsData}

        segmentationLayerScopes={segmentationLayerScopes}
        segmentationLayerCoordination={segmentationLayerCoordination}
        multiExpressionData={multiExpressionData}

        images={imageData}
        imageLayerScopes={imageLayerScopes}
        imageLayerCoordination={imageLayerCoordination}

        imageChannelScopesByLayer={imageChannelScopesByLayer}
        imageChannelCoordination={imageChannelCoordination}

        obsSegmentations={obsSegmentationsData}
        obsSegmentationsType={"bitmask"}
        obsCentroids={obsCentroids}
        obsCentroidsIndex={obsCentroidsIndex}
        cellFilter={cellFilter}
        cellSelection={cellSelection}
        cellHighlight={cellHighlight}
        cellColors={cellColors}
        neighborhoods={neighborhoods}
        imageLayerLoaders={imageLayerLoaders}
        setCellFilter={setCellFilter}
        setCellSelection={setCellSelectionProp}
        setCellHighlight={setCellHighlight}
        multiObsHighlight={hoverData}
        setMultiObsHighlight={setMultiObsHighlight}
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
        hideTools
      />
      <MultiLegend
        segmentationLayerScopes={segmentationLayerScopes}
        segmentationLayerCoordination={segmentationLayerCoordination}
        multiExpressionData={multiExpressionData}
      />
      {!disableTooltip && (
        <SpatialTooltipSubscriber
          parentUuid={uuid}
          obsHighlight={cellHighlight}
          width={width}
          height={height}
          getObsInfo={getObsInfo}
          hoverData={hoverData}
          hoverCoord={hoverCoord}
        />
      )}
      <Legend
        visible
        // Fix to dark theme due to black background of spatial plot.
        theme="dark"
        featureType={featureType}
        featureValueType={featureValueType}
        obsColorEncoding={cellColorEncoding}
        featureSelection={geneSelection}
        featureValueColormap={geneExpressionColormap}
        featureValueColormapRange={geneExpressionColormapRange}
      />
    </TitleInfo>
  );
}
