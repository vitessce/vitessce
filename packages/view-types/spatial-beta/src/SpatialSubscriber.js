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
  useInitialCoordination,
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
import { commaNumber, getCellColors } from '@vitessce/utils';
import { canLoadResolution } from '@vitessce/spatial-utils';
import { COMPONENT_COORDINATION_TYPES, ViewType, DataType, CoordinationType } from '@vitessce/constants-internal';
import { setObsSelection, mergeObsSets } from '@vitessce/sets-utils';
import { MultiLegend } from '@vitessce/legend';
import Spatial from './Spatial.js';
import SpatialOptions from './SpatialOptions.js';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber.js';
import { makeSpatialSubtitle, getInitialSpatialTargets } from './utils.js';


// Reference: https://deck.gl/docs/api-reference/core/orbit-view#view-state
const DEFAULT_VIEW_STATE = {
  zoom: 0,
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
};
const SET_VIEW_STATE_NOOP = () => {};


const tempLayer = [{
  index: 0,
  colormap: null,
  domainType: 'Min/Max',
  modelMatrix: undefined,
  opacity: 1,
  renderingMode: 'Additive',
  transparentColor: null,
  type: 'bitmask',
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
    spatialTargetT: targetT,
    spatialRenderingMode,
    spatialRotationX: rotationX,
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

  const {
    spatialZoom: initialZoom,
    spatialTargetX: initialTargetX,
    spatialTargetY: initialTargetY,
    spatialTargetZ: initialTargetZ,
  } = useInitialCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.SPATIAL_BETA], coordinationScopes,
  );

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
      CoordinationType.SPATIAL_SEGMENTATION_FILLED,
      CoordinationType.SPATIAL_SEGMENTATION_STROKE_WIDTH,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
    ],
    coordinationScopes,
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
      CoordinationType.SPATIAL_LAYER_TRANSPARENT_COLOR,
      CoordinationType.SPATIAL_LAYER_MODEL_MATRIX,
      CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM,
      CoordinationType.SPATIAL_TARGET_RESOLUTION,
      CoordinationType.SPATIAL_SLICE_X,
      CoordinationType.SPATIAL_SLICE_Y,
      CoordinationType.SPATIAL_SLICE_Z,
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
      CoordinationType.SPATIAL_CHANNEL_WINDOW,
    ],
    coordinationScopes,
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

  const is3dMode = spatialRenderingMode === '3D';
  const imageLayers = []; // TODO: remove

  const [width, height, deckRef] = useDeckCanvasSize();

  const [obsLabelsTypes, obsLabelsData] = useMultiObsLabels(
    coordinationScopes, obsType, loaders, dataset,
  );

  const [obsSegmentationsData, obsSegmentationsDataStatus] = useMultiObsSegmentations(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );
  const [imageData, imageDataStatus] = useMultiImages(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [
    multiExpressionData, multiLoadedFeatureSelection,
    // eslint-disable-next-line no-unused-vars
    multiExpressionExtents, multiExpressionNormData,
    multiFeatureSelectionStatus,
  ] = useMultiFeatureSelection(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [multiIndicesData, multiIndicesDataStatus] = useMultiObsFeatureMatrixIndices(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
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
  // console.log('multiImage', imageData, 'singleImage', image);


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
    multiFeatureSelectionStatus,
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
    imageLayerLoaders: Object.values(imageData || {})
      .map(layerData => layerData?.image?.instance.getData())
      .filter(Boolean),
    useRaster: Boolean(hasImageData),
    use3d: is3dMode,
    modelMatrices: Object.values(imageData || {})
      .map(layerData => layerData?.image?.instance.getModelMatrix())
      .filter(Boolean),
  }),
  // Deliberate dependency omissions: imageLayerLoaders and meta - using `image` as
  // an indirect dependency instead.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [imageData, imageLayerScopes, is3dMode, hasImageData,
    obsCentroids, obsSegmentations, obsSegmentationsType,
    width, height,
  ]);

  useEffect(() => {
    // If it has not already been set, set the initial view state using
    // the auto-computed values from the useMemo above.
    if (width && height) {
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
    if (is3dMode) {
      if (target[2] !== undefined) {
        setTargetZ(target[2]);
      }
      setRotationX(newRotationX);
      setRotationOrbit(newRotationOrbit);
      setOrbitAxis(newOrbitAxis);
    }
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
  const canLoad3DLayers = Object.values(imageData || {})
    .some(layerData => layerData?.image?.instance.hasZStack());
  // Only show 3D options if we can theoretically load the data and it is allowed to be loaded.
  const canShow3DOptions = canLoad3DLayers && !globalDisable3d;

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
          use3d={is3dMode}
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
    setGeneExpressionColormapRange, setSpatialAxisFixed, spatialAxisFixed, is3dMode,
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

  // Should hover position be used for tooltips?
  // If there are centroids for each observation, then we can use those
  // to position tooltips. However if there are not centroids,
  // the other option is to use the mouse location.
  const useHoverInfoForTooltip = !obsCentroids;

  const getObsInfo = useCallback((hoveredChannelData) => {
    if (hoveredChannelData) {
      const result = {};
      let hasObsInfo = false;
      hoveredChannelData.forEach((channelEl) => {
        const { obsId, obsI, channelScope, layerScope } = channelEl;
        const {
          spatialLayerVisible,
        } = segmentationLayerCoordination[0][layerScope];
        const channelCoordination = segmentationChannelCoordination[0][layerScope];
        const {
          spatialChannelVisible,
          obsType: layerObsType,
        } = channelCoordination[channelScope];
        if (spatialLayerVisible && spatialChannelVisible) {
          hasObsInfo = true;
          result[`${layerObsType} ID`] = obsId;
          if (multiExpressionData?.[layerScope]?.[channelScope] && multiLoadedFeatureSelection?.[layerScope]?.[channelScope]) {
            const channelFeature = multiLoadedFeatureSelection?.[layerScope]?.[channelScope]?.[0];
            const channelFeatureData = multiExpressionData?.[layerScope]?.[channelScope];
            if (channelFeatureData && channelFeatureData[0]) {
              // TODO: use multiIndicesData to obtain an index into the obsFeatureMatrix data
              // using the bitmask channel value.
              // For the sake of time, here I am assuming the off-by-one alignment.
              const channelFeatureValue = channelFeatureData[0][obsI];
              result[`${layerObsType} ${channelFeature}`] = commaNumber(channelFeatureValue);
            }
          }
        }
      });
      return hasObsInfo ? result : null;
    }
    return null;
  }, [segmentationLayerScopes, segmentationLayerCoordination,
    segmentationChannelScopesByLayer, segmentationChannelCoordination,
    multiExpressionData, multiLoadedFeatureSelection, multiIndicesData,
  ]);

  const setHoverInfo = useCallback(debounce((data, coord) => {
    setHoverData(data);
    setHoverCoord(coord);
  }, 10, { trailing: true }), [setHoverData, setHoverCoord, useHoverInfoForTooltip]);

  const segmentationLayerScopeChannelScopeTuples = useMemo(() => {
    const result = [];
    segmentationLayerScopes.forEach((layerScope) => {
      segmentationChannelScopesByLayer[layerScope].forEach((channelScope) => {
        result.push([layerScope, channelScope]);
      });
    });
    return result;
  }, [segmentationLayerScopes, segmentationChannelScopesByLayer]);

  const getObsIdFromHoverData = useCallback((data) => {
    if (useHoverInfoForTooltip) {
      // Get the obsId associated with the hovered observation index
      // for each segmentation channel.
      const perChannelObsInfo = data?.map((v, i) => ([i, (v - 1)]))
        .filter(([targetC, obsI]) => obsI > 0)
        .map(([targetC, obsI]) => {
          const [layerScope, channelScope] = segmentationLayerScopeChannelScopeTuples[targetC];
          if (multiIndicesData && layerScope && channelScope) {
            const { obsIndex, featureIndex } = multiIndicesData[layerScope][channelScope];
            if (obsIndex) {
              return {
                layerScope,
                channelScope,
                obsI,
                obsId: obsIndex?.[obsI],
              };
            }
          }
          return null;
        })
        .filter(Boolean);
      return perChannelObsInfo;
    }
    return null;
  }, [useHoverInfoForTooltip, multiIndicesData, segmentationLayerScopeChannelScopeTuples]);

  // Without useMemo, this would propagate a change every time the component
  // re - renders as opposed to when it has to.
  const resolutionFilteredImageLayerLoaders = useMemo(() => {
    // eslint-disable-next-line max-len
    const shouldUseFullData = (ll, index) => Array.isArray(useFullResolutionImage) && useFullResolutionImage.includes(meta[index].name) && Array.isArray(ll.data);
    // eslint-disable-next-line max-len
    return imageLayerLoaders.map((ll, index) => (shouldUseFullData(ll, index) ? { ...ll, data: ll.data[0] } : ll));
  }, [imageLayerLoaders, useFullResolutionImage, meta]);

  // Passing an invalid viewState (e.g., with null values) will cause DeckGL
  // to throw a mercator projection assertion error (in 3D mode / when using OrbitView).
  const isValidViewState = is3dMode
    ? (
      zoom !== null && targetX !== null && targetY !== null && targetZ !== null
      && rotationX !== null && rotationOrbit !== null && orbitAxis !== null
    )
    : zoom !== null && targetX !== null && targetY !== null;

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
        viewState={isValidViewState ? ({
          zoom,
          target: [targetX, targetY, targetZ],
          rotationX,
          rotationOrbit,
        }) : DEFAULT_VIEW_STATE}
        orbigAxis={orbitAxis}
        setViewState={isValidViewState ? setViewState : SET_VIEW_STATE_NOOP}
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
        targetT={targetT}
        targetZ={targetZ}
        spatialRenderingMode={spatialRenderingMode}

        imageChannelScopesByLayer={imageChannelScopesByLayer}
        imageChannelCoordination={imageChannelCoordination}

        obsSegmentations={obsSegmentationsData}
        obsSegmentationsType="bitmask"
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
        hideTools
      />
      {!disableTooltip && (
        <SpatialTooltipSubscriber
          parentUuid={uuid}
          obsHighlight={cellHighlight}
          width={width}
          height={height}
          getObsInfo={getObsInfo}
          useHoverInfoForTooltip={useHoverInfoForTooltip}
          hoverData={hoverData}
          hoverCoord={hoverCoord}
          getObsIdFromHoverData={getObsIdFromHoverData}
        />
      )}
      <MultiLegend
        // Fix to dark theme due to black background of spatial plot.
        theme="dark"
        segmentationLayerScopes={segmentationLayerScopes}
        segmentationLayerCoordination={segmentationLayerCoordination}

        segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
        segmentationChannelCoordination={segmentationChannelCoordination}

        multiExpressionExtents={multiExpressionExtents}
      />
    </TitleInfo>
  );
}
