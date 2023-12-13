/* eslint-disable max-len */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
import React, { useRef } from 'react';
import {
  useRawViewMapping,
  useViewMapping,
  _useCoordination,
  _useCoordinationL1,
  _useCoordinationL2,
  _useCoordinationScopesL1,
  _useCoordinationScopesL2,
} from 'mm-cmv';
import {
  TitleInfo,
  useReady,
  useClosestVitessceContainerSize,
  useWindowDimensions,
  useLoaders,
  useAuxiliaryCoordination,
  useComponentLayout,
  useMultiObsSpots,
  useMultiObsPoints,
  useMultiObsSegmentations,
  useMultiImages,
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
    uuid,
    closeButtonVisible,
    downloadButtonVisible,
    removeGridComponent,
    theme,
    title = 'Spatial Layers',
  } = props;

  const loaders = useLoaders();

  const [coordinationScopesRaw] = useRawViewMapping(uuid);
  const [coordinationScopes, coordinationScopesBy] = useViewMapping(uuid);

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
  ] = _useCoordination(
    coordinationScopes,
    COMPONENT_COORDINATION_TYPES[ViewType.LAYER_CONTROLLER_BETA],
  );

  // Normalize arrays and non-arrays to always be arrays.
  const [segmentationLayerScopes, segmentationChannelScopesByLayer] = _useCoordinationScopesL2(
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
  );

  const [imageLayerScopes, imageChannelScopesByLayer] = _useCoordinationScopesL2(
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.IMAGE_LAYER,
    CoordinationType.IMAGE_CHANNEL,
  );

  const spotLayerScopes = _useCoordinationScopesL1(
    coordinationScopes,
    CoordinationType.SPOT_LAYER,
  );

  const pointLayerScopes = _useCoordinationScopesL1(
    coordinationScopes,
    CoordinationType.POINT_LAYER,
  );

  // Object keys are coordination scope names for spatialSegmentationLayer.
  const segmentationLayerCoordination = _useCoordinationL1(
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    [
      CoordinationType.FILE_UID,
      CoordinationType.SEGMENTATION_CHANNEL,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
    ],
  );

  // Object keys are coordination scope names for spatialSegmentationChannel.
  const segmentationChannelCoordination = _useCoordinationL2(
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SEGMENTATION_LAYER,
    CoordinationType.SEGMENTATION_CHANNEL,
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
  );

  const imageLayerCoordination = _useCoordinationL1(
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.IMAGE_LAYER,
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
  );

  // Object keys are coordination scope names for spatialImageChannel.
  const imageChannelCoordination = _useCoordinationL2(
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.IMAGE_LAYER,
    CoordinationType.IMAGE_CHANNEL,
    [
      CoordinationType.SPATIAL_TARGET_C,
      CoordinationType.SPATIAL_CHANNEL_VISIBLE,
      CoordinationType.SPATIAL_CHANNEL_COLOR,
      CoordinationType.SPATIAL_CHANNEL_WINDOW,
    ],
  );

  // Spot layer
  const spotLayerCoordination = _useCoordinationL1(
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPOT_LAYER,
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
  );

  // Point layer
  const pointLayerCoordination = _useCoordinationL1(
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.POINT_LAYER,
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
  );

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
  // Spatial layout + window size is needed for the "re-center" button to work properly.
  // Dimensions of the Spatial component can be inferred and used for resetting view state to
  // a nice, centered view.
  const [spatialLayout] = useComponentLayout('spatial', ['spatialImageLayer'], coordinationScopes);
  const layerControllerRef = useRef();
  const [componentWidth, componentHeight] = useClosestVitessceContainerSize(layerControllerRef);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const [obsSegmentationsData, obsSegmentationsDataStatus] = useMultiObsSegmentations(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );
  const [imageData, imageDataStatus] = useMultiImages(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );
  const [obsSpotsData, obsSpotsDataStatus] = useMultiObsSpots(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
  );
  const [obsPointsData, obsPointsDataStatus] = useMultiObsPoints(
    coordinationScopes, coordinationScopesBy, loaders, dataset,
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
