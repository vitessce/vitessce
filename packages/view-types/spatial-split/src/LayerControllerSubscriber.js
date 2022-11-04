import React, {
  useCallback, useRef, forwardRef,
} from 'react';
import Grid from '@material-ui/core/Grid';
import {
  TitleInfo,
  useReady,
  useClosestVitessceContainerSize, useWindowDimensions,
  useImageData,
  useObsLocationsData,
  useObsSegmentationsData,
  useCoordination,
  useComplexCoordination,
  useComplexCoordinationSecondary,
  useMultiCoordinationValues,
  useLoaders,
  useAuxiliaryCoordination,
  useComponentLayout,
  registerPluginViewType,
} from '@vitessce/vit-s';
import { CoordinationType, ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import { capitalize } from '@vitessce/utils';
import LayerController from './LayerController';

const coordinationTypes = [
  CoordinationType.DATASET,
  CoordinationType.OBS_TYPE,
  CoordinationType.FEATURE_TYPE,
  CoordinationType.FEATURE_VALUE_TYPE,
  CoordinationType.SPATIAL_IMAGE_LAYER,
  CoordinationType.SPATIAL_SEGMENTATION_LAYER,
  CoordinationType.SPATIAL_POINT_LAYER,
  CoordinationType.SPATIAL_NEIGHBORHOOD_LAYER,
  CoordinationType.SPATIAL_ZOOM,
  CoordinationType.SPATIAL_TARGET_X,
  CoordinationType.SPATIAL_TARGET_Y,
  CoordinationType.SPATIAL_TARGET_Z,
  CoordinationType.SPATIAL_TARGET_T,
  CoordinationType.SPATIAL_TARGET_C,
  CoordinationType.SPATIAL_ROTATION_X,
  CoordinationType.SPATIAL_ROTATION_Y,
  CoordinationType.SPATIAL_ROTATION_Z,
  CoordinationType.SPATIAL_ROTATION_ORBIT,
  CoordinationType.SPATIAL_ORBIT_AXIS,
  CoordinationType.FEATURE_SELECTION,
  // new coordination types
  CoordinationType.SPATIAL_LAYER_VISIBLE,
  CoordinationType.SPATIAL_LAYER_OPACITY,
  CoordinationType.SPATIAL_IMAGE_CHANNEL,
  CoordinationType.SPATIAL_IMAGE_CHANNEL_MODE,
  CoordinationType.SPATIAL_IMAGE_CHANNEL_VISIBLE,
  CoordinationType.SPATIAL_IMAGE_CHANNEL_COLOR,
  CoordinationType.SPATIAL_IMAGE_COLORMAP,
  CoordinationType.SPATIAL_IMAGE_CHANNEL_RANGE,
  CoordinationType.SPATIAL_IMAGE_CHANNEL_RANGE_EXTENT_MODE,
  CoordinationType.SPATIAL_RENDERING_MODE,
  CoordinationType.SPATIAL_IMAGE_VOLUME_RENDERING_MODE,
  CoordinationType.SPATIAL_MODEL_MATRIX,
  CoordinationType.SPATIAL_POINT_RADIUS,
];


export function LayerControllerSubscriber(props) {
  const {
    coordinationScopes,
    coordinationScopesBy,
    removeGridComponent,
    theme,
    title = 'Spatial Layers V2',
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [
    {
      dataset,
      spatialTargetT,
      spatialTargetZ,
      spatialRenderingMode,
      spatialPointLayer,
      spatialSegmentationLayer,
      spatialImageLayer,
    },
    {
      setSpatialTargetX: setTargetX,
      setSpatialTargetY: setTargetY,
      setSpatialTargetZ: setTargetZ,
      setSpatialTargetT: setTargetT,
      setSpatialZoom: setZoom,
      setSpatialRenderingMode,
      setSpatialPointLayer,
      setSpatialSegmentationLayer,
      setSpatialImageLayer,
    },
  ] = useCoordination(
    coordinationTypes, // TODO: use COMPONENT_COORDINATION_TYPES
    coordinationScopes,
  );

  console.log(coordinationScopes, coordinationScopesBy);

  // Normalize arrays and non-arrays to always be arrays.
  const imageLayerValues = useMultiCoordinationValues(
    CoordinationType.SPATIAL_IMAGE_LAYER,
    coordinationScopes,
  );

  console.log(imageLayerValues);

  // Object keys are coordination scope names for spatialPointLayer.
  const pointLayerCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.SPATIAL_POINT_RADIUS,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPATIAL_POINT_LAYER,
  );

  // Object keys are coordination scope names for spatialSegmentationLayer.
  const segmentationLayerCoordination = useComplexCoordination(
    [
      CoordinationType.OBS_TYPE,
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPATIAL_SEGMENTATION_LAYER,
  );


  // Object keys are coordination scope names for spatialImageLayer.
  const imageLayerCoordination = useComplexCoordination(
    [
      CoordinationType.SPATIAL_LAYER_VISIBLE,
      CoordinationType.SPATIAL_LAYER_OPACITY,
      CoordinationType.SPATIAL_IMAGE_COLORMAP,
      CoordinationType.SPATIAL_IMAGE_CHANNEL_MODE,
      CoordinationType.FEATURE_SELECTION,
      CoordinationType.SPATIAL_IMAGE_VOLUME_RENDERING_MODE,
      CoordinationType.SPATIAL_MODEL_MATRIX,
    ],
    coordinationScopes,
    coordinationScopesBy,
    CoordinationType.SPATIAL_IMAGE_LAYER,
  );

  // Object keys are coordination scope names for spatialImageChannel.
  const imageChannelCoordination = useComplexCoordinationSecondary(
    [
      CoordinationType.SPATIAL_TARGET_C,
      CoordinationType.SPATIAL_IMAGE_CHANNEL_VISIBLE,
      CoordinationType.SPATIAL_IMAGE_CHANNEL_COLOR,
      CoordinationType.SPATIAL_IMAGE_CHANNEL_RANGE,
      CoordinationType.SPATIAL_IMAGE_CHANNEL_RANGE_EXTENT_MODE,
    ],
    coordinationScopesBy,
    CoordinationType.SPATIAL_IMAGE_LAYER,
    CoordinationType.SPATIAL_IMAGE_CHANNEL,
  );
  
  console.log(pointLayerCoordination);
  console.log(segmentationLayerCoordination);
  console.log(imageLayerCoordination);
  console.log(imageChannelCoordination);

  // Spatial layout + window size is needed for the "re-center" button to work properly.
  // Dimensions of the Spatial component can be inferred and used for resetting view state to
  // a nice, centered view.
  const [spatialLayout] = useComponentLayout('spatial', ['spatialImageLayer'], coordinationScopes);
  const layerControllerRef = useRef();
  const [componentWidth, componentHeight] = useClosestVitessceContainerSize(layerControllerRef);
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  // Get data from loaders using the data hooks.
  // eslint-disable-next-line no-unused-vars
  const [obsLocationsData, obsLocationsStatus] = useObsLocationsData(
    loaders, dataset, () => {}, false,
    {  },
    {  },
    {}, // TODO: use obsType once #1240 is merged.
  );
  const [
    { obsSegmentations, obsSegmentationsType },
    obsSegmentationsStatus,
  ] = useObsSegmentationsData(
    loaders, dataset, () => {}, false,
    {  },
    {  },
    {}, // TODO: use obsType once #1240 is merged.
  );
  const [{ image }, imageStatus] = useImageData(
    loaders, dataset, () => {}, false,
    {  },
    {  },
    {}, // TODO: which values to match on
  );
  const { loaders: imageLayerLoaders, meta: imageLayerMeta } = image || {};
  const isReady = useReady([
    obsLocationsStatus,
    obsSegmentationsStatus,
    imageStatus,
  ]);

  // TODO: pass data to LayerController

  
  return (
    <TitleInfo
      title={title}
      isScroll
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
    >
      <LayerController
        spatialTargetT={spatialTargetT}
        setSpatialTargetT={setTargetT}
        possibleT={[30, 60, 90]}
        spatialTargetZ={spatialTargetZ}
        setSpatialTargetZ={setTargetZ}
        possibleZ={[0, 1, 2, 3, 4, 5, 6, 7]}
        pointLayerCoordination={pointLayerCoordination}
        segmentationLayerCoordination={segmentationLayerCoordination}
        imageLayerCoordination={imageLayerCoordination}
        imageChannelCoordination={imageChannelCoordination}
      />
    </TitleInfo>
  );
}

export function register() {
  registerPluginViewType(
    'layerControllerV2', // TODO: use constant
    LayerControllerSubscriber,
    coordinationTypes, // TODO: use COMPONENT_COORDINATION_TYPES
  );
}
