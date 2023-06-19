/* eslint-disable max-len */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
import React, {
  useCallback, useRef, forwardRef, useMemo,
} from 'react';
import { Grid } from '@material-ui/core';
import {
  TitleInfo,
  useReady,
  useClosestVitessceContainerSize, useWindowDimensions,
  useImageData,
  useObsLocationsData,
  useObsSegmentationsData,
  useCoordination,
  useLoaders,
  useAuxiliaryCoordination,
  useComponentLayout,
  useMultiObsSegmentations,
  useMultiImages,
  useComplexCoordination,
  useMultiCoordinationValues,
  useMultiCoordinationScopes,
  useMultiCoordinationScopesSecondary,
  useComplexCoordinationSecondary,
  useCoordinationScopes,
  useCoordinationScopesBy,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES, STATUS, CoordinationType } from '@vitessce/constants-internal';
import { capitalize, pluralize } from '@vitessce/utils';
import { initializeLayerChannels, DEFAULT_RASTER_LAYER_PROPS } from '@vitessce/spatial-utils';
import RasterChannelController from './RasterChannelController.js';
import BitmaskChannelController from './BitmaskChannelController.js';
import VectorLayerController from './VectorLayerController.js';
import LayerController from './LayerController.js';
import ImageAddButton from './ImageAddButton.js';
import SplitLayerController from './SplitLayerController.js';

/**
 * A subscriber component for the spatial layer controller.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 * @param {Object} props.disable3d Which layers should have 3D disabled (from `raster.json` names).
 * @param {boolean} props.globalDisable3d Disable 3D for all layers. Overrides the `disable3d` prop.
 * @param {boolean} props.disableChannelsIfRgbDetected Disable channel controls if an
 * RGB image is detected i.e 3 channel 8 bit.
 * @param {boolean} props.enableLayerButtonsWithOneLayer If there is only one layer,
 * show the the layer add/remove buttons.
 */
export function LayerControllerSubscriber(props) {
  const {
    coordinationScopes: coordinationScopesRaw,
    coordinationScopesBy: coordinationScopesByRaw,
    removeGridComponent,
    theme,
    title = 'Spatial Layers',
    disable3d,
    globalDisable3d,
    disableChannelsIfRgbDetected,
    enableLayerButtonsWithOneLayer,
    obsSegmentationsMatchOn = 'image', // use obsType if split across multiple files or using polygons
  } = props;

  const loaders = useLoaders();

  const coordinationScopes = useCoordinationScopes(coordinationScopesRaw);
  const coordinationScopesBy = useCoordinationScopesBy(coordinationScopes, coordinationScopesByRaw);

  // Get "props" from the coordination space.
  const [
    {
      dataset,
      obsType,
      imageLayer: rasterLayers,
      segmentationLayer: cellsLayer,
      spatialPointLayer: moleculesLayer,
    },
    {
      setImageLayer: setRasterLayers,
      setSegmentationLayer: setCellsLayer,
      setSpatialPointLayer: setMoleculesLayer,
      setSpatialTargetX: setTargetX,
      setSpatialTargetY: setTargetY,
      setSpatialTargetZ: setTargetZ,
      setSpatialRotationX: setRotationX,
      setSpatialRotationOrbit: setRotationOrbit,
      setSpatialZoom: setZoom,
    },
  ] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.LAYER_CONTROLLER_BETA],
    coordinationScopes,
  );

  // Normalize arrays and non-arrays to always be arrays.
  const segmentationLayerValues = useMultiCoordinationValues(
    CoordinationType.SEGMENTATION_LAYER,
    coordinationScopes,
  );

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

  // console.log(imageLayerScopes, imageChannelScopesByLayer);

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
  console.log(imageLayerCoordination)

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

  // console.log(imageLayerCoordination, imageChannelCoordination);

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
    coordinationScopes, coordinationScopesBy, loaders, dataset, () => {},
  );
  const [imageData, imageDataStatus] = useMultiImages(
    coordinationScopes, coordinationScopesBy, loaders, dataset, () => {},
  );
  // console.log(imageData, imageDataStatus);

  // Get data from loaders using the data hooks.
  // eslint-disable-next-line no-unused-vars
  const [obsLocationsData, obsLocationsStatus] = useObsLocationsData(
    loaders, dataset, () => {}, false,
    { setSpatialPointLayer: setMoleculesLayer },
    { spatialPointLayer: moleculesLayer },
    {}, // TODO: use obsType once #1240 is merged.
  );
  const isReady = useReady([
    obsLocationsStatus,
    obsSegmentationsDataStatus,
    imageDataStatus,
  ]);

  return (
    <TitleInfo
      title={title}
      isScroll
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
    >
      <SplitLayerController
        segmentationLayerScopes={segmentationLayerScopes}
        segmentationLayerValues={segmentationLayerValues}
        segmentationLayerCoordination={segmentationLayerCoordination}

        segmentationChannelScopesByLayer={segmentationChannelScopesByLayer}
        segmentationChannelCoordination={segmentationChannelCoordination}

        images={imageData}
        imageLayerScopes={imageLayerScopes}
        imageLayerCoordination={imageLayerCoordination}

        imageChannelScopesByLayer={imageChannelScopesByLayer}
        imageChannelCoordination={imageChannelCoordination}
      />
    </TitleInfo>
  );
}
