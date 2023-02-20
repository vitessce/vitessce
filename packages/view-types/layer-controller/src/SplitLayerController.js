/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
import React, {
  useCallback, useRef, forwardRef, useMemo,
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
  useLoaders,
  useAuxiliaryCoordination,
  useComponentLayout,
  registerPluginViewType,
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
import RasterChannelController from './RasterChannelController';
import BitmaskChannelController from './BitmaskChannelController';
import VectorLayerController from './VectorLayerController';
import LayerController from './LayerController';
import ImageAddButton from './ImageAddButton';
import SplitVectorLayerController from './SplitVectorLayerController';
import SplitImageLayerController from './SplitImageLayerController';


export default function SplitLayerController(props) {
  const {
    dataset,
    obsType: obsTypeProp,
    moleculesLayer,
    setMoleculesLayer,
    cellsLayer, // May be one polygon layer object or an array of bitmask layers.
    setCellsLayer,

    rasterLayers,

    imageLayerCallbacks,
    setImageLayerCallbacks,
    areLoadingImageChannels,
    setAreLoadingImageChannels,
    handleRasterLayerChange,
    handleRasterLayerRemove,

    segmentationLayerScopes,
    segmentationLayerValues,
    segmentationLayerCoordination,

    images,
    imageLayerScopes,
    imageLayerCoordination,

    imageChannelScopesByLayer,
    imageChannelCoordination,
    
    obsTypes,
    obsSegmentationsStatus,
    obsSegmentationsData,
    obsSegmentationsType,
    segmentationLayerLoaders,
    segmentationLayerMeta,
    segmentationLayerCallbacks,
    setSegmentationLayerCallbacks,
    areLoadingSegmentationChannels,
    setAreLoadingSegmentationChannels,
    handleSegmentationLayerChange,
    handleSegmentationLayerRemove,

    disable3d,
    globalDisable3d,
    disableChannelsIfRgbDetected,
    layerIs3DIndex,
    setZoom,
    setTargetX,
    setTargetY,
    setTargetZ,
    setRotationX,
    setRotationOrbit,
    componentHeight,
    componentWidth,
    spatialLayout,
    handleImageAdd,
    enableLayerButtonsWithOneLayer,
  } = props;
  const { loaders: imageLayerLoaders, meta: imageLayerMeta } = {}; // TODO
  // TODO
  const shouldShowImageLayerButton = Boolean(
    enableLayerButtonsWithOneLayer || imageLayerLoaders?.length > 1,
  );
  return (
    <div className="layer-controller-container">
      {/*moleculesLayer && (
        <VectorLayerController
          key={`${dataset}-molecules`}
          label="Molecules"
          layerType="molecules"
          layer={moleculesLayer}
          handleLayerChange={setMoleculesLayer}
        />
      )*/}
      {/*cellsLayer && obsSegmentationsType === 'polygon' && (
        <VectorLayerController
          key={`${dataset}-cells`}
          label={`${capitalize(obsTypeProp)} Segmentations`}
          layerType="cells"
          layer={cellsLayer}
          handleLayerChange={setCellsLayer}
        />
      )*/}
      {/* Segmentation bitmask layers: */}
      {segmentationLayerScopes && segmentationLayerValues
        && segmentationLayerScopes.map((layerScope) => {
          const {
            obsType,
            spatialLayerVisible: visible,
            spatialLayerOpacity: opacity,
            spatialChannelColor: color,
            spatialLayerFilled: filled,
            spatialLayerStrokeWidth: strokeWidth,
            obsColorEncoding,
            featureValueColormap,
            featureValueColormapRange,
          } = segmentationLayerCoordination[0][layerScope];
          const {
            setSpatialLayerVisible: setVisible,
            setSpatialLayerOpacity: setOpacity,
            setSpatialChannelColor: setColor,
            setSpatialLayerFilled: setFilled,
            setSpatialLayerStrokeWidth: setStrokeWidth,
            setObsColorEncoding,
            setFeatureValueColormap,
            setFeatureValueColormapRange,
          } = segmentationLayerCoordination[1][layerScope];

          const obsTypeName = obsType;

          //const index = 0;
          //const loader = obsTypeData?.obsSegmentations?.loaders?.[index];
          //const layerMeta = obsTypeData?.obsSegmentations?.meta?.[index];
          //const loader = null;
          //const layerMeta = null;
          //const channelIndex = segmentationLayerCoordination[0][layerScope].spatialTargetC;

          return (
            <SplitVectorLayerController
              key={layerScope}
              layerScope={layerScope}
              label={obsTypeName}
              opacity={opacity}
              setOpacity={setOpacity}
              visible={visible}
              setVisible={setVisible}
              color={color}
              setColor={setColor}
              filled={filled}
              setFilled={setFilled}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}

              obsColorEncoding={obsColorEncoding}
              featureValueColormap={featureValueColormap}
              featureValueColormapRange={featureValueColormapRange}
              setObsColorEncoding={setObsColorEncoding}
              setFeatureValueColormap={setFeatureValueColormap}
              setFeatureValueColormapRange={setFeatureValueColormapRange}
            />
          );
        })}
      {/* Image layers: */}
      {imageLayerScopes && imageLayerScopes.map(layerScope => (
        <SplitImageLayerController
          key={layerScope}
          layerScope={layerScope}
          layerCoordination={imageLayerCoordination[0][layerScope]}
          setLayerCoordination={imageLayerCoordination[1][layerScope]}
          channelScopes={imageChannelScopesByLayer[layerScope]}
          channelCoordination={imageChannelCoordination[0][layerScope]}
          setChannelCoordination={imageChannelCoordination[1][layerScope]}
          image={images[layerScope]}
          use3d={false} /* TODO */
        />
      ))}
      {shouldShowImageLayerButton
        ? (/* TODO */
          <Grid item>
            <ImageAddButton
              imageOptions={imageLayerMeta}
              handleImageAdd={handleImageAdd}
            />
          </Grid>
        ) : null}
    </div>
  );
}
