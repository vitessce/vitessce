/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  TitleInfo,
  useDeckCanvasSize,
  useReady,
  useUrls,
  useMultiObsSpots,
  useMultiObsPoints,
  useSpotMultiObsSets,
  useMultiObsSegmentations,
  useMultiImages,
  usePointMultiObsLabels,
  useSpotMultiFeatureSelection,
  useSpotMultiObsFeatureMatrixIndices,
  useSegmentationMultiFeatureSelection,
  useSegmentationMultiObsFeatureMatrixIndices,
  useSegmentationMultiObsLocations,
  useSegmentationMultiObsSets,
  useInitialCoordination,
  useCoordination,
  useLoaders,
  useMergeCoordination,
  useSetComponentHover,
  useSetComponentViewInfo,
  useComplexCoordination,
  useMultiCoordinationScopesNonNull,
  useMultiCoordinationScopesSecondaryNonNull,
  useComplexCoordinationSecondary,
  useCoordinationScopes,
  useCoordinationScopesBy,
  useSpotMultiFeatureLabels,
  useGridItemSize,
} from '@vitessce/vit-s';
import { COMPONENT_COORDINATION_TYPES, ViewType, CoordinationType } from '@vitessce/constants-internal';
import { commaNumber, pluralize } from '@vitessce/utils';
import { setObsSelection } from '@vitessce/sets-utils';
import { MultiLegend, ChannelNamesLegend } from '@vitessce/legend';
import Spatial from './Spatial.js';
import SpatialTooltipSubscriber from './SpatialTooltipSubscriber.js';
import { getInitialSpatialTargets } from './utils.js';
import { SpatialThreeAdapter } from './SpatialThreeAdapter.js';


// Reference: https://deck.gl/docs/api-reference/core/orbit-view#view-state
const DEFAULT_VIEW_STATE = {
  zoom: 0,
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
};
const SET_VIEW_STATE_NOOP = () => {};

function getHoverData(hoverInfo, layerType) {
  const { coordinate, sourceLayer: layer, tile } = hoverInfo;
  if (layerType === 'segmentation-bitmask' || layerType === 'image') {
    if (coordinate && layer) {
      if (layer.id.startsWith('Tiled') && tile) {
        // Adapted from https://github.com/hms-dbmi/viv/blob/2b28cc1db6ad1dacb44e6b1cd145ae90c46a2ef3/packages/viewers/src/VivViewer.jsx#L209
        const {
          content,
          bbox,
          index: { z },
        } = tile;
        if (content) {
          const { data, width, height } = content;
          const {
            left, right, top, bottom,
          } = bbox;
          const bounds = [
            left,
            data.height < layer.tileSize ? height : bottom,
            data.width < layer.tileSize ? width : right,
            top,
          ];
          // Tiled layer needs a custom layerZoomScale.
          // The zoomed out layer needs to use the fixed zoom at which it is rendered.
          const layerZoomScale = Math.max(
            1,
            2 ** Math.round(-z),
          );
          const dataCoords = [
            Math.floor((coordinate[0] - bounds[0]) / layerZoomScale),
            Math.floor((coordinate[1] - bounds[3]) / layerZoomScale),
          ];
          const coords = dataCoords[1] * width + dataCoords[0];
          const hoverData = data.map(d => d[coords]);
          return hoverData;
        }
      }
    }
  }
  if (layerType === 'segmentation-polygon' || layerType === 'spot' || layerType === 'point') {
    if (hoverInfo.index) {
      if (layerType === 'segmentation-polygon') {
        // To match 'segmentation-bitmask', we return an array of one index per channel.
        // For 'segmentation-polygon', we assume one channel per layer.
        return [hoverInfo.index];
      }
      return hoverInfo.index;
    }
  }
  return null;
}

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
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    observationsLabelOverride,
    subobservationsLabelOverride: subobservationsLabel = 'molecule',
    theme,
    disableTooltip = false,
    title = 'Spatial',
    bitmaskValueIsIndex = false, // TODO: move to coordination type
    three: threeFor3d = false,
  } = props;

  const loaders = useLoaders();
  const setComponentHover = useSetComponentHover();
  const setComponentViewInfo = useSetComponentViewInfo(uuid);
  const mergeCoordination = useMergeCoordination();

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
    spatialRotationY: rotationY,
    spatialRotationZ: rotationZ,
    spatialRotationOrbit: rotationOrbit,
    spatialOrbitAxis: orbitAxis,
    spatialAxisFixed,

    // TODO: get obsSets per-layer or per-channel
    additionalObsSets,
    obsSetColor,
    obsColorEncoding,
    obsSetSelection,
  }, {
    setSpatialZoom: setZoom,
    setSpatialTargetX: setTargetX,
    setSpatialTargetY: setTargetY,
    setSpatialTargetZ: setTargetZ,
    setSpatialRotationX: setRotationX,
    setSpatialRotationY: setRotationY,
    setSpatialRotationZ: setRotationZ,
    setSpatialRotationOrbit: setRotationOrbit,

    // TODO: get obsSets per-layer or per-channel
    setAdditionalObsSets,
    setObsSetColor,
    setObsColorEncoding,
    setObsSetSelection,
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

  const [segmentationLayerScopes, segmentationChannelScopesByLayer] = useMultiCoordinationScopesSecondaryNonNull(
    CoordinationType.SEGMENTATION_CHANNEL,
    CoordinationType.SEGMENTATION_LAYER,
    coordinationScopes,
    coordinationScopesBy,
  );

  const [imageLayerScopes, imageChannelScopesByLayer] = useMultiCoordinationScopesSecondaryNonNull(
    CoordinationType.IMAGE_CHANNEL,
    CoordinationType.IMAGE_LAYER,
    coordinationScopes,
    coordinationScopesBy,
  );

  const spotLayerScopes = useMultiCoordinationScopesNonNull(
    CoordinationType.SPOT_LAYER,
    coordinationScopes,
  );

  const pointLayerScopes = useMultiCoordinationScopesNonNull(
    CoordinationType.POINT_LAYER,
    coordinationScopes,
  );

  // Object keys are coordination scope names for spatialSegmentationLayer.
  const segmentationLayerCoordination = useComplexCoordination(
    [
      CoordinationType.FILE_UID,
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
      CoordinationType.OBS_SET_COLOR,
      CoordinationType.OBS_SET_SELECTION,
      CoordinationType.ADDITIONAL_OBS_SETS,
      CoordinationType.OBS_HIGHLIGHT,
      CoordinationType.TOOLTIPS_VISIBLE,
      CoordinationType.TOOLTIP_CROSSHAIRS_VISIBLE,
      CoordinationType.LEGEND_VISIBLE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
  );

  const imageLayerCoordination = useComplexCoordination(
    [
      CoordinationType.FILE_UID,
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
      CoordinationType.PHOTOMETRIC_INTERPRETATION,
      CoordinationType.PIXEL_HIGHLIGHT,
      CoordinationType.TOOLTIPS_VISIBLE,
      CoordinationType.SPATIAL_CHANNEL_LABELS_VISIBLE,
      CoordinationType.SPATIAL_CHANNEL_LABELS_ORIENTATION,
      CoordinationType.SPATIAL_CHANNEL_LABEL_SIZE,
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

  // Spot layer
  const spotLayerCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.SPATIAL_SPOT_RADIUS,
      CoordinationType.SPATIAL_SPOT_FILLED,
      CoordinationType.SPATIAL_SPOT_STROKE_WIDTH,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
      CoordinationType.OBS_SET_COLOR,
      CoordinationType.OBS_SET_SELECTION,
      CoordinationType.ADDITIONAL_OBS_SETS,
      CoordinationType.SPATIAL_LAYER_COLOR,
      CoordinationType.OBS_HIGHLIGHT,
      CoordinationType.TOOLTIPS_VISIBLE,
      CoordinationType.TOOLTIP_CROSSHAIRS_VISIBLE,
      CoordinationType.LEGEND_VISIBLE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPOT_LAYER,
  );

  // Point layer
  const pointLayerCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
      CoordinationType.SPATIAL_LAYER_COLOR,
      CoordinationType.OBS_HIGHLIGHT,
      CoordinationType.TOOLTIPS_VISIBLE,
      CoordinationType.TOOLTIP_CROSSHAIRS_VISIBLE,
      CoordinationType.LEGEND_VISIBLE,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.POINT_LAYER,
  );

  /*
  const [
    {
      imageLayerCallbacks,
      segmentationLayerCallbacks,
    },
  ] = useAuxiliaryCoordination(
    COMPONENT_COORDINATION_TYPES.layerController,
    coordinationScopes,
  );
  */

  const is3dMode = spatialRenderingMode === '3D';
  const shouldUseThree = threeFor3d && is3dMode;

  const [deckWidth, deckHeight, deckRef] = useDeckCanvasSize();
  const [threeWidth, threeHeight, threeRef] = useGridItemSize();
  const width = threeFor3d && deckWidth === undefined
    ? threeWidth
    : deckWidth;
  const height = threeFor3d && deckHeight === undefined
    ? threeHeight
    : deckHeight;

  // Points data
  const [obsPointsData, obsPointsDataStatus, obsPointsUrls] = useMultiObsPoints(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );

  const [pointMultiObsLabelsData, pointMultiObsLabelsDataStatus] = usePointMultiObsLabels(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  // Spots data
  const [obsSpotsData, obsSpotsDataStatus, obsSpotsUrls] = useMultiObsSpots(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );

  const [obsSpotsSetsData, obsSpotsSetsDataStatus] = useSpotMultiObsSets(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [obsSpotsFeatureLabelsData, obsSpotsFeatureLabelsDataStatus] = useSpotMultiFeatureLabels(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [
    spotMultiExpressionData,
    spotMultiLoadedFeatureSelection,
    spotMultiExpressionExtents,
    spotMultiExpressionNormData,
    spotMultiFeatureSelectionStatus,
  ] = useSpotMultiFeatureSelection(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [spotMultiIndicesData, spotMultiIndicesDataStatus] = useSpotMultiObsFeatureMatrixIndices(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  // Segmentations data
  const [obsSegmentationsLocationsData, obsSegmentationsLocationsDataStatus] = useSegmentationMultiObsLocations(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [obsSegmentationsData, obsSegmentationsDataStatus, obsSegmentationsUrls] = useMultiObsSegmentations(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );

  const [obsSegmentationsSetsData, obsSegmentationsSetsDataStatus] = useSegmentationMultiObsSets(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [
    segmentationMultiExpressionData,
    segmentationMultiLoadedFeatureSelection,
    segmentationMultiExpressionExtents,
    segmentationMultiExpressionNormData,
    segmentationMultiFeatureSelectionStatus,
  ] = useSegmentationMultiFeatureSelection(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  const [segmentationMultiIndicesData, segmentationMultiIndicesDataStatus] = useSegmentationMultiObsFeatureMatrixIndices(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );

  // Image data
  const [imageData, imageDataStatus, imageUrls] = useMultiImages(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );


  /*
  const [neighborhoods, neighborhoodsStatus, neighborhoodsUrls] = useNeighborhoodsData(
    loaders, dataset, false,
    { setSpatialNeighborhoodLayer: setNeighborhoodsLayer },
    { spatialNeighborhoodLayer: neighborhoodsLayer },
  );
  */

  // TODO: per-layer featureLabels
  /*
  const [{ featureLabelsMap }, featureLabelsStatus, featureLabelsUrls] = useFeatureLabelsData(
    loaders, dataset, false, {}, {},
    { featureType },
  );
  */

  const isReadyToComputeInitialViewState = useReady([
    obsPointsDataStatus,
    obsSpotsDataStatus,
    obsSegmentationsDataStatus,
    imageDataStatus,
  ]);

  const isReady = useReady([
    // Spots
    obsSpotsDataStatus,
    obsSpotsSetsDataStatus,
    spotMultiFeatureSelectionStatus,
    spotMultiIndicesDataStatus,
    // Points
    obsPointsDataStatus,
    pointMultiObsLabelsDataStatus,
    // Segmentations
    obsSegmentationsDataStatus,
    obsSegmentationsSetsDataStatus,
    segmentationMultiFeatureSelectionStatus,
    segmentationMultiIndicesDataStatus,
    obsSegmentationsLocationsDataStatus,
    // Images
    imageDataStatus,
  ]);
  const urls = useUrls([
    Object.values(obsSpotsUrls || {}).flat(),
    Object.values(obsPointsUrls || {}).flat(),
    Object.values(obsSegmentationsUrls || {}).flat(),
    Object.values(imageUrls || {}).flat(),
    // TODO: more urls
    // TODO: a bit of memoization
  ]);

  const [originalViewState, setOriginalViewState] = useState(null);

  // Compute initial viewState values to use if targetX and targetY are not
  // defined in the initial configuration.
  const {
    initialTargetX: defaultTargetX, initialTargetY: defaultTargetY,
    initialTargetZ: defaultTargetZ, initialZoom: defaultZoom,
  } = useMemo(() => getInitialSpatialTargets({
    width,
    height,
    obsPoints: obsPointsData,
    obsSpots: obsSpotsData,
    obsSegmentations: obsSegmentationsData,
    obsSegmentationsLocations: obsSegmentationsLocationsData,
    segmentationChannelScopesByLayer,
    images: imageData,
    is3dMode,
    isReady: isReadyToComputeInitialViewState,
  }),
  // Deliberate dependency omissions: imageLayerLoaders and meta - using `image` as
  // an indirect dependency instead.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [imageData, is3dMode, obsSegmentationsData,
    width, height, obsSpotsData, isReadyToComputeInitialViewState,
    obsSegmentationsLocationsData, obsPointsData,
    segmentationChannelScopesByLayer,
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


  const setViewState = ({
    zoom: newZoom,
    target,
    rotationX: newRotationX,
    rotationOrbit: newRotationOrbit,
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
    }
  };

  // Make subtitle text based on the aggregate number of items in each type of spatial layer.
  const subtitle = useMemo(() => {
    const totalNumPoints = Object.values(obsPointsData || {})
      .reduce((a, h) => a + (h?.obsIndex?.length || 0), 0);
    const totalNumSpots = Object.values(obsSpotsData || {})
      .reduce((a, h) => a + (h?.obsIndex?.length || 0), 0);
    const totalNumSegmentations = segmentationLayerScopes
      .map(layerScope => segmentationChannelScopesByLayer[layerScope]
        .map(channelScope => ([layerScope, channelScope])))
      .flat(1)
      .map(([layerScope, channelScope]) => {
        let obsIndex = obsSegmentationsLocationsData?.[layerScope]?.[channelScope]?.obsIndex;
        if (!obsIndex) {
          obsIndex = obsSegmentationsSetsData?.[layerScope]?.[channelScope]?.obsIndex;
          if (!obsIndex) {
            obsIndex = segmentationMultiIndicesData?.[layerScope]?.[channelScope]?.obsIndex;
          }
        }
        return obsIndex;
      })
      .reduce((a, h) => a + (h?.length || 0), 0);
    const totalNumImages = imageLayerScopes?.length || 0;

    return [
      [totalNumPoints, 'point'],
      [totalNumSpots, 'spot'],
      [totalNumSegmentations, 'segmentation'],
      [totalNumImages, 'image'],
    ]
      .filter(([numItems]) => numItems > 0)
      .map(([numItems, layerType]) => `${commaNumber(numItems)} ${pluralize(layerType, numItems)}`)
      .join(', ');
  }, [
    obsPointsData,
    obsSpotsData,
    segmentationLayerScopes,
    segmentationChannelScopesByLayer,
    obsSegmentationsLocationsData,
    obsSegmentationsSetsData,
    segmentationMultiIndicesData,
    imageLayerScopes,
  ]);

  const [hoverCoord, setHoverCoord] = useState(null);

  // Without useMemo, this would propagate a change every time the component
  // re - renders as opposed to when it has to.
  /*
  const resolutionFilteredImageLayerLoaders = useMemo(() => {
    // eslint-disable-next-line max-len
    const shouldUseFullData = (ll, index) => Array.isArray(useFullResolutionImage) && useFullResolutionImage.includes(meta[index].name) && Array.isArray(ll.data);
    // eslint-disable-next-line max-len
    return imageLayerLoaders.map((ll, index) => (shouldUseFullData(ll, index) ? { ...ll, data: ll.data[0] } : ll));
  }, [imageLayerLoaders, useFullResolutionImage, meta]);
  */

  // Passing an invalid viewState (e.g., with null values) will cause DeckGL
  // to throw a mercator projection assertion error (in 3D mode / when using OrbitView).
  const isValidViewState = is3dMode
    ? (
      zoom !== null && targetX !== null && targetY !== null && targetZ !== null
      && rotationX !== null && rotationOrbit !== null && orbitAxis !== null
    )
    : zoom !== null && targetX !== null && targetY !== null;

  /**
   * @param {object} hoverInfo The hoverInfo object passed to the DeckGL layer's onHover callback.
   * @param {'spot'|'point'|'segmentation-polygon'|'segmentation-bitmask'|'image'} layerType
   * @param {string} layerScope
   */
  const delegateHover = useCallback((hoverInfo, layerType, layerScope) => {
    const { coordinate } = hoverInfo;
    let showAnyTooltip = false;

    const hoverData = getHoverData(hoverInfo, layerType);

    // We always iterate over everything because we want to clear
    // any highlights that are not the current hover.
    imageLayerScopes?.forEach((imageLayerScope) => {
      const { setPixelHighlight } = imageLayerCoordination?.[1]?.[imageLayerScope] || {};
      if (hoverData && layerType === 'image' && layerScope === imageLayerScope) {
        showAnyTooltip = true;
        setPixelHighlight(hoverData);
      } else {
        setPixelHighlight(null);
      }
    });

    segmentationLayerScopes?.forEach((segmentationLayerScope) => {
      const channelScopes = segmentationChannelScopesByLayer?.[segmentationLayerScope];
      channelScopes?.forEach((channelScope, channelI) => {
        const { setObsHighlight } = segmentationChannelCoordination[1][segmentationLayerScope][channelScope];
        if (hoverData && ['segmentation-bitmask', 'segmentation-polygon'].includes(layerType) && layerScope === segmentationLayerScope) {
          const channelValue = hoverData[channelI];
          let obsI = channelValue;
          if (channelValue > 0) {
            let obsId;
            if (layerType === 'segmentation-bitmask') {
              const { obsIndex } = segmentationMultiIndicesData?.[segmentationLayerScope]?.[channelScope] || {};
              if (obsIndex && bitmaskValueIsIndex) {
                obsI -= 1; // We subtract one because we use 0 to represent background.
                obsId = obsIndex?.[obsI];
              } else {
                // When there is not a corresponding obsIndex to use,
                // fall back to the observation index (based on the pixel value).
                obsId = String(obsI);
              }
            } else {
              const { obsIndex } = obsSegmentationsData?.[segmentationLayerScope] || {};
              obsId = obsIndex?.[obsI];
            }

            if (obsId) {
              showAnyTooltip = true;
              setObsHighlight(obsId);
            } else {
              setObsHighlight(null);
            }
          } else {
            setObsHighlight(null);
          }
        } else {
          setObsHighlight(null);
        }
      });
    });

    spotLayerScopes?.forEach((spotLayerScope) => {
      const { setObsHighlight } = spotLayerCoordination?.[1]?.[spotLayerScope] || {};
      if (hoverData && layerType === 'spot' && layerScope === spotLayerScope) {
        const obsI = hoverData;
        const { obsIndex } = obsSpotsData?.[spotLayerScope] || {};
        const obsId = obsIndex?.[obsI];
        if (obsIndex && obsId) {
          showAnyTooltip = true;
          setObsHighlight(obsId);
        } else {
          setObsHighlight(null);
        }
      } else {
        setObsHighlight(null);
      }
    });
    pointLayerScopes?.forEach((pointLayerScope) => {
      const { setObsHighlight } = pointLayerCoordination?.[1]?.[pointLayerScope] || {};
      if (hoverData && layerType === 'point' && layerScope === pointLayerScope) {
        const obsI = hoverData;
        const { obsIndex } = obsPointsData?.[pointLayerScope] || {};
        const obsId = obsIndex?.[obsI];
        if (obsIndex && obsId) {
          showAnyTooltip = true;
          setObsHighlight(obsId);
        } else {
          setObsHighlight(null);
        }
      } else {
        setObsHighlight(null);
      }
    });

    if (showAnyTooltip) {
      setHoverCoord(coordinate);
      setComponentHover(uuid);
    } else {
      setHoverCoord(null);
    }

    // "If this callback returns a truthy value,
    // the hover event is marked as handled and
    // will not bubble up to the onHover callback of the DeckGL canvas."
    // Reference: https://deck.gl/docs/api-reference/core/layer#interaction-properties
    return false;
  }, [obsSegmentationsData, obsSpotsData, obsPointsData, segmentationMultiIndicesData]);

  const isSelectable = (
    spotLayerScopes.length > 0
    || pointLayerScopes.length > 0
    || segmentationLayerScopes
      .flatMap(layerScope => segmentationChannelScopesByLayer[layerScope]
        .map(channelScope => obsSegmentationsLocationsData?.[layerScope]?.[channelScope])).length > 0
  );


  // For SpatialThree
  const onEntitySelected = (obsId, layerScope, channelScope) => {
    if (layerScope && channelScope) {
      const channelCoordinationValues = segmentationChannelCoordination[0][layerScope][channelScope];
      const channelCoordinationSetters = segmentationChannelCoordination[1][layerScope][channelScope];
      if (channelCoordinationValues && channelCoordinationSetters) {
        const {
          additionalObsSets: channelAdditionalObsSets,
          obsSetColor: channelObsSetColor,
        } = channelCoordinationValues;
        const {
          setObsSetColor: setChannelObsSetColor,
          setAdditionalObsSets: setChannelAdditionalObsSets,
          setObsColorEncoding: setChannelObsColorEncoding,
          setObsSetSelection: setChannelObsSetSelection,
        } = channelCoordinationSetters;
        const obsIdsToSelect = [obsId];
        setObsSelection(
          obsIdsToSelect, channelAdditionalObsSets, channelObsSetColor,
          setChannelObsSetSelection, setChannelAdditionalObsSets, setChannelObsSetColor,
          setChannelObsColorEncoding,
        );
      }
    }
  };

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
    >
      {shouldUseThree ? (
        <SpatialThreeAdapter
          ref={threeRef}
          uuid={uuid}
          width={width}
          height={height}
          theme={theme}
          hideTools={!isSelectable}

          rotation={[rotationX, rotationY, rotationZ]}
          setRotationX={setRotationX}
          setRotationY={setRotationY}
          setRotationZ={setRotationZ}

          // Global view state
          targetT={targetT}
          targetZ={targetZ}
          viewState={isValidViewState ? ({
            zoom,
            target: [targetX, targetY, targetZ],
            rotationX,
            rotationOrbit,
          }) : DEFAULT_VIEW_STATE}
          orbitAxis={orbitAxis}
          spatialAxisFixed={spatialAxisFixed}
          setViewState={isValidViewState ? setViewState : SET_VIEW_STATE_NOOP}
          originalViewState={originalViewState}
          spatialRenderingMode={spatialRenderingMode} // 2D vs. 3D
          updateViewInfo={setComponentViewInfo}

          delegateHover={delegateHover}
          onEntitySelected={onEntitySelected}

          // Points
          obsPoints={obsPointsData}
          pointLayerScopes={pointLayerScopes}
          pointLayerCoordination={pointLayerCoordination}

          pointMultiObsLabels={pointMultiObsLabelsData}

          // Spots
          obsSpots={obsSpotsData}
          spotLayerScopes={spotLayerScopes}
          spotLayerCoordination={spotLayerCoordination}
          obsSpotsSets={obsSpotsSetsData}

          spotMatrixIndices={spotMultiIndicesData}
          spotMultiExpressionData={spotMultiExpressionNormData}

          // Segmentations
          segmentationLayerScopes={segmentationLayerScopes}
          segmentationLayerCoordination={segmentationLayerCoordination}
          segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
          segmentationChannelCoordination={segmentationChannelCoordination}

          obsSegmentations={obsSegmentationsData}
          obsSegmentationsLocations={obsSegmentationsLocationsData}
          obsSegmentationsSets={obsSegmentationsSetsData}
          segmentationMatrixIndices={segmentationMultiIndicesData}
          segmentationMultiExpressionData={segmentationMultiExpressionNormData}

          bitmaskValueIsIndex={bitmaskValueIsIndex}

          // Images
          images={imageData}
          imageLayerScopes={imageLayerScopes}
          imageLayerCoordination={imageLayerCoordination}

          imageChannelScopesByLayer={imageChannelScopesByLayer}
          imageChannelCoordination={imageChannelCoordination}

          // TODO: useFullResolutionImage={useFullResolutionImage}
        />
      ) : (
        <Spatial
          ref={deckRef}
          uuid={uuid}
          width={width}
          height={height}
          theme={theme}
          hideTools={!isSelectable}
          // Global view state
          targetT={targetT}
          targetZ={targetZ}
          viewState={isValidViewState ? ({
            zoom,
            target: [targetX, targetY, targetZ],
            rotationX,
            rotationOrbit,
          }) : DEFAULT_VIEW_STATE}
          orbitAxis={orbitAxis}
          spatialAxisFixed={spatialAxisFixed}
          setViewState={isValidViewState ? setViewState : SET_VIEW_STATE_NOOP}
          originalViewState={originalViewState}
          spatialRenderingMode={spatialRenderingMode} // 2D vs. 3D
          updateViewInfo={setComponentViewInfo}

          delegateHover={delegateHover}

          // Points
          obsPoints={obsPointsData}
          pointLayerScopes={pointLayerScopes}
          pointLayerCoordination={pointLayerCoordination}

          pointMultiObsLabels={pointMultiObsLabelsData}

          // Spots
          obsSpots={obsSpotsData}
          spotLayerScopes={spotLayerScopes}
          spotLayerCoordination={spotLayerCoordination}
          obsSpotsSets={obsSpotsSetsData}

          spotMatrixIndices={spotMultiIndicesData}
          spotMultiExpressionData={spotMultiExpressionNormData}

          // Segmentations
          segmentationLayerScopes={segmentationLayerScopes}
          segmentationLayerCoordination={segmentationLayerCoordination}
          segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
          segmentationChannelCoordination={segmentationChannelCoordination}

          obsSegmentations={obsSegmentationsData}
          obsSegmentationsLocations={obsSegmentationsLocationsData}
          obsSegmentationsSets={obsSegmentationsSetsData}
          segmentationMatrixIndices={segmentationMultiIndicesData}
          segmentationMultiExpressionData={segmentationMultiExpressionNormData}

          bitmaskValueIsIndex={bitmaskValueIsIndex}

          // Images
          images={imageData}
          imageLayerScopes={imageLayerScopes}
          imageLayerCoordination={imageLayerCoordination}

          imageChannelScopesByLayer={imageChannelScopesByLayer}
          imageChannelCoordination={imageChannelCoordination}

          // TODO: useFullResolutionImage={useFullResolutionImage}
        />
      )}
      {!disableTooltip && (
        <SpatialTooltipSubscriber
          parentUuid={uuid}
          width={width}
          height={height}
          hoverCoord={hoverCoord}

          // Points
          obsPoints={obsPointsData}
          pointLayerScopes={pointLayerScopes}
          pointLayerCoordination={pointLayerCoordination}

          // Spots
          obsSpots={obsSpotsData}
          spotLayerScopes={spotLayerScopes}
          spotLayerCoordination={spotLayerCoordination}

          // Segmentations
          obsSegmentationsLocations={obsSegmentationsLocationsData}
          segmentationLayerScopes={segmentationLayerScopes}
          segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
          segmentationChannelCoordination={segmentationChannelCoordination}
          obsSegmentationsSetsData={obsSegmentationsSetsData}

          // Images
          imageLayerScopes={imageLayerScopes}
          imageLayerCoordination={imageLayerCoordination}
        />
      )}
      <MultiLegend
        // Fix to dark theme due to black background of spatial plot.
        theme="dark"

        // Segmentations
        segmentationLayerScopes={segmentationLayerScopes}
        segmentationLayerCoordination={segmentationLayerCoordination}
        segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
        segmentationChannelCoordination={segmentationChannelCoordination}
        segmentationMultiExpressionExtents={segmentationMultiExpressionExtents}

        // Spots
        spotLayerScopes={spotLayerScopes}
        spotLayerCoordination={spotLayerCoordination}
        spotMultiExpressionExtents={spotMultiExpressionExtents}
        spotMultiFeatureLabels={obsSpotsFeatureLabelsData}

        // Points
        pointLayerScopes={pointLayerScopes}
        pointLayerCoordination={pointLayerCoordination}
      />
      <ChannelNamesLegend
        // Images
        images={imageData}
        imageLayerScopes={imageLayerScopes}
        imageLayerCoordination={imageLayerCoordination}

        imageChannelScopesByLayer={imageChannelScopesByLayer}
        imageChannelCoordination={imageChannelCoordination}
      />
    </TitleInfo>
  );
}
