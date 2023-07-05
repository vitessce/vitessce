/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
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
  useMultiObsSegmentations,
  useMultiImages,
  useMultiFeatureSelection,
  useMultiObsFeatureMatrixIndices,
  useUint8FeatureSelection,
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
//import { Legend } from '@vitessce/legend';
import Spatial from './Spatial.js';
import SpatialOptions from './SpatialOptions.js';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber.js';
import { makeSpatialSubtitle, getInitialSpatialTargets } from './utils.js';
//import MultiLegend from './MultiLegend.js';

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
    useFullResolutionImage = {},
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
    segmentationLayer: cellsLayer,
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
    setSegmentationLayer: setCellsLayer,
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
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL_BETA], coordinationScopes);

  const observationsLabel = observationsLabelOverride || obsType;

  const [segmentationLayerScopes, segmentationChannelScopesByLayer] = useMultiCoordinationScopesSecondary(
    CoordinationType.SEGMENTATION_CHANNEL,
    CoordinationType.SEGMENTATION_LAYER,
    coordinationScopes,
    coordinationScopesBy,
  );

  const [imageLayerScopes, imageChannelScopesByLayer] = useMultiCoordinationScopesSecondary(
    CoordinationType.IMAGE_CHANNEL,
    CoordinationType.IMAGE_LAYER,
    coordinationScopes,
    coordinationScopesBy,
  );

  // Object keys are coordination scope names for spatialSegmentationLayer.
  const segmentationLayerCoordination = useComplexCoordination(
    [
      CoordinationType.IMAGE,
      CoordinationType.SEGMENTATION_CHANNEL,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
  );

  // Object keys are coordination scope names for spatialSegmentationChannel.
  const segmentationChannelCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_TARGET_C,
      CoordinationType.SPATIAL_CHANNEL_VISIBLE,
      CoordinationType.SPATIAL_CHANNEL_OPACITY,
      CoordinationType.SPATIAL_CHANNEL_COLOR,
      CoordinationType.SPATIAL_CHANNEL_WINDOW,
      CoordinationType.SPATIAL_SEGMENTATION_FILLED,
      CoordinationType.SPATIAL_SEGMENTATION_STROKE_WIDTH,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
    ],
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
  );

  const imageLayerCoordination = useComplexCoordination(
    [
      CoordinationType.IMAGE,
      CoordinationType.IMAGE_CHANNEL,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.SPATIAL_LAYER_COLORMAP,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.IMAGE_LAYER,
  );

  // Object keys are coordination scope names for spatialImageChannel.
  const imageChannelCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.SPATIAL_TARGET_C,
      CoordinationType.SPATIAL_CHANNEL_VISIBLE,
      CoordinationType.SPATIAL_CHANNEL_COLOR,
    ],
    coordinationScopesBy,
    CoordinationType.IMAGE_LAYER,
    CoordinationType.IMAGE_CHANNEL,
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

  const [width, height, deckRef] = useDeckCanvasSize();

  const [obsLabelsTypes, obsLabelsData] = useMultiObsLabels(
    coordinationScopes, obsType, loaders, dataset,
  );

  const [obsSegmentationsData, obsSegmentationsDataStatus] = useMultiObsSegmentations(
    coordinationScopes, coordinationScopesBy, loaders, dataset, () => {},
  );
  const [imageData, imageDataStatus] = useMultiImages(
    coordinationScopes, coordinationScopesBy, loaders, dataset, () => {},
  );

  const [multiExpressionData, multiLoadedFeatureSelection, multiFeatureSelectionStatus] = useMultiFeatureSelection(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  // TODO: update the useMultiObsFeatureMatrixIndices hook to reflect change from layer -> channel paradigm
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
    {},
    {},
    {}, // TODO: which properties to match on. Revisit after #830.
  );
  const { loaders: imageLayerLoaders = [], meta = [] } = image || {};
  const [neighborhoods, neighborhoodsStatus, neighborhoodsUrls] = useNeighborhoodsData(
    loaders, dataset, false,
    { setSpatialNeighborhoodLayer: setNeighborhoodsLayer },
    { spatialNeighborhoodLayer: neighborhoodsLayer },
  );
  const [{ featureLabelsMap }, featureLabelsStatus, featureLabelsUrls] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
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

  const [originalViewState, setOriginalViewState] = useState(
    { target: [targetX, targetY, targetZ], zoom },
  );

  // Compute initial viewState values to use if targetX and targetY are not
  // defined in the initial configuration.
  const {
    initialTargetX, initialTargetY, initialTargetZ, initialZoom,
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
  // Deliberate dependency omissions: width/height - technically then
  // these initial values will be "wrong" after resizing, but it shouldn't be far enough
  // off to be noticeable.
  // Deliberate dependency omissions: imageLayerLoaders and meta - using `image` as
  // an indirect dependency instead.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [image, use3d, hasImageData, obsCentroids, obsSegmentations, obsSegmentationsType]);

  useEffect(() => {
    // If it has not already been set, set the initial view state using
    // the auto-computed values from the useMemo above.
    if (
      (typeof targetX !== 'number' || typeof targetY !== 'number')
    ) {
      setTargetX(initialTargetX);
      setTargetY(initialTargetY);
      setTargetZ(initialTargetZ);
      setZoom(initialZoom);
      // Save these values to originalViewState so that we can reset to them later.
      setOriginalViewState(
        { target: [initialTargetX, initialTargetY, initialTargetZ], zoom: initialZoom },
      );
    }
    // Deliberate dependency omissions: targetX, targetY
    // since we do not this to re-run on every single zoom/pan interaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTargetX, initialTargetY, initialTargetZ, initialZoom]);

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

  const [uint8ExpressionData, expressionExtents] = useUint8FeatureSelection(expressionData);

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
          spatialLayerVisible,
        } = segmentationLayerCoordination[0][layerScope];

        const channelScopes = segmentationChannelScopesByLayer[layerScope];
        const channelCoordination = segmentationChannelCoordination[0][layerScope];
        channelScopes.forEach((channelScope) => {
          const {
            spatialChannelVisible,
            obsType: layerObsType,
            spatialTargetC,
          } = channelCoordination[channelScope];
          if (spatialLayerVisible && spatialChannelVisible && channelData[spatialTargetC] > 0) {
            hasObsInfo = true;
            result[`${layerObsType} ID`] = channelData[spatialTargetC];
            if (multiExpressionData?.[layerScope]?.[channelScope] && multiLoadedFeatureSelection?.[layerScope]?.[channelScope]) {
              const channelFeature = multiLoadedFeatureSelection?.[layerScope]?.[channelScope]?.[0];
              const channelFeatureData = multiExpressionData?.[layerScope]?.[channelScope];
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
      });
      return hasObsInfo ? result : null;
    }
    return null;
  }, [segmentationLayerScopes, segmentationLayerCoordination,
    segmentationChannelScopesByLayer, segmentationChannelCoordination,
    multiExpressionData, multiLoadedFeatureSelection, multiIndicesData,
  ]);

  const setMultiObsHighlight = useCallback(debounce((a, b) => {
    setHoverData(a);
    setHoverCoord(b);
  }, 10, { trailing: true }), [setHoverData, setHoverCoord]);

  // Without useMemo, this would propagate a change every time the component
  // re - renders as opposed to when it has to.
  const resolutionFilteredImageLayerLoaders = useMemo(() => {
    // eslint-disable-next-line max-len
    const shouldUseFullData = (ll, index) => Array.isArray(useFullResolutionImage) && useFullResolutionImage.includes(meta[index].name) && Array.isArray(ll.data);
    // eslint-disable-next-line max-len
    return imageLayerLoaders.map((ll, index) => (shouldUseFullData(ll, index) ? { ...ll, data: ll.data[0] } : ll));
  }, [imageLayerLoaders, useFullResolutionImage, meta]);

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
        originalViewState={originalViewState}
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

        segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
        segmentationChannelCoordination={segmentationChannelCoordination}

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
        imageLayerLoaders={resolutionFilteredImageLayerLoaders}
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
        useFullResolutionImage={useFullResolutionImage}
        hideTools
      />
      {/*<MultiLegend
        segmentationLayerScopes={segmentationLayerScopes}
        segmentationLayerCoordination={segmentationLayerCoordination}

        segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
        segmentationChannelCoordination={segmentationChannelCoordination}

        multiExpressionData={multiExpressionData}
      />*/}
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
      {/*<Legend
        visible
        // Fix to dark theme due to black background of spatial plot.
        theme="dark"
        featureType={featureType}
        featureValueType={featureValueType}
        obsColorEncoding={cellColorEncoding}
        featureSelection={geneSelection}
        featureLabelsMap={featureLabelsMap}
        featureValueColormap={geneExpressionColormap}
        featureValueColormapRange={geneExpressionColormapRange}
        extent={expressionExtents?.[0]}
      />*/}
    </TitleInfo>
  );
}
