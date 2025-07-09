/* eslint-disable max-len */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
import React, { useRef } from 'react';
import {
  TitleInfo,
  useReady,
  useClosestVitessceContainerSize,
  useWindowDimensions,
  useCoordination,
  useLoaders,
  useAuxiliaryCoordination,
  useComponentLayout,
  useMultiObsSpots,
  useMultiObsPoints,
  useMultiObsSegmentations,
  useMultiImages,
  useMergeCoordination,
  useComplexCoordination,
  useMultiCoordinationScopesNonNull,
  useMultiCoordinationScopesSecondaryNonNull,
  useComplexCoordinationSecondary,
  useCoordinationScopes,
  useCoordinationScopesBy,
} from '@vitessce/vit-s';
import {
  ViewType,
  CoordinationType,
  COMPONENT_COORDINATION_TYPES,
} from '@vitessce/constants-internal';
import LayerController from './LayerController.js';

/**
 * A subscriber component for the spatial layer controller.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function LayerControllerSubscriber(props) {
  const {
    coordinationScopes: coordinationScopesRaw,
    coordinationScopesBy: coordinationScopesByRaw,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Spatial Layers',
    uuid,
  } = props;

  const loaders = useLoaders();
  const mergeCoordination = useMergeCoordination();

  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);
  const coordinationScopesBy = useCoordinationScopesBy(coordinationScopes, coordinationScopesByRaw);

  // Get "props" from the coordination space.
  const [
    {
      dataset,
      spatialTargetT: targetT,
      spatialTargetZ: targetZ,
      spatialRenderingMode,
    },
    {
      setSpatialTargetX: setTargetX,
      setSpatialTargetY: setTargetY,
      setSpatialTargetZ: setTargetZ,
      setSpatialTargetT: setTargetT,
      setSpatialRotationX: setRotationX,
      setSpatialRotationOrbit: setRotationOrbit,
      setSpatialZoom: setZoom,
      setSpatialRenderingMode,
    },
  ] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.LAYER_CONTROLLER_BETA],
    coordinationScopes,
  );

  // Normalize arrays and non-arrays to always be arrays.
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
      CoordinationType.PHOTOMETRIC_INTERPRETATION,
      CoordinationType.VOLUMETRIC_RENDERING_ALGORITHM,
      CoordinationType.SPATIAL_TARGET_RESOLUTION,
      CoordinationType.SPATIAL_SLICE_X,
      CoordinationType.SPATIAL_SLICE_Y,
      CoordinationType.SPATIAL_SLICE_Z,
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
      CoordinationType.SPATIAL_LAYER_COLOR,
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
      CoordinationType.SPATIAL_SPOT_RADIUS,
      CoordinationType.OBS_COLOR_ENCODING,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.FEATURE_VALUE_COLORMAP,
      CoordinationType.FEATURE_VALUE_COLORMAP_RANGE,
      CoordinationType.SPATIAL_LAYER_COLOR,
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
      areLoadingImageChannels,
      segmentationLayerCallbacks,
      areLoadingSegmentationChannels,
    },
    {
      setImageLayerCallbacks,
      setAreLoadingImageChannels,
      setSegmentationLayerCallbacks,
      setAreLoadingSegmentationChannels,
    },
  ] = useAuxiliaryCoordination(
    COMPONENT_COORDINATION_TYPES.layerController,
    coordinationScopes,
  );
  */
  // Spatial layout + window size is needed for the "re-center" button to work properly.
  // Dimensions of the Spatial component can be inferred and used for resetting view state to
  // a nice, centered view.
  const [spatialLayout] = useComponentLayout('spatial', ['spatialImageLayer'], coordinationScopes);
  const layerControllerRef = useRef();
  const [componentWidth, componentHeight] = useClosestVitessceContainerSize(layerControllerRef);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const [obsSegmentationsData, obsSegmentationsDataStatus] = useMultiObsSegmentations(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );
  const [imageData, imageDataStatus] = useMultiImages(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );
  const [obsSpotsData, obsSpotsDataStatus] = useMultiObsSpots(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );
  const [obsPointsData, obsPointsDataStatus] = useMultiObsPoints(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
    mergeCoordination, uuid,
  );

  const isReady = useReady([
    obsSpotsDataStatus,
    obsPointsDataStatus,
    obsSegmentationsDataStatus,
    imageDataStatus,
  ]);

  return (
    <TitleInfo
      title={title}
      isScroll
      closeButtonVisible={closeButtonVisible}
      downloadButtonVisible={downloadButtonVisible}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
    >
      <LayerController
        theme={theme}
        coordinationScopesRaw={coordinationScopesRaw}

        segmentationLayerScopes={segmentationLayerScopes}
        segmentationLayerCoordination={segmentationLayerCoordination}

        segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
        segmentationChannelCoordination={segmentationChannelCoordination}

        images={imageData}
        imageLayerScopes={imageLayerScopes}
        imageLayerCoordination={imageLayerCoordination}
        targetT={targetT}
        targetZ={targetZ}
        setTargetT={setTargetT}
        setTargetZ={setTargetZ}
        spatialRenderingMode={spatialRenderingMode}
        setSpatialRenderingMode={setSpatialRenderingMode}

        imageChannelScopesByLayer={imageChannelScopesByLayer}
        imageChannelCoordination={imageChannelCoordination}

        spotLayerScopes={spotLayerScopes}
        spotLayerCoordination={spotLayerCoordination}

        pointLayerScopes={pointLayerScopes}
        pointLayerCoordination={pointLayerCoordination}
      />
    </TitleInfo>
  );
}
