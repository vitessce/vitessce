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

// LayerController is memoized to prevent updates from prop changes that
// are caused by view state updates i.e zooming and panning within
// the actual Spatial component.  Re-rendering this component is very
// expensive so we have to be careful with props in this file in general.
const LayerControllerMemoized = React.memo(
  forwardRef((props, ref) => {
    const {
      title,
      removeGridComponent,
      theme,
      isReady,
      dataset,
      obsType: obsTypeProp,
      moleculesLayer,
      setMoleculesLayer,
      cellsLayer, // May be one polygon layer object or an array of bitmask layers.
      setCellsLayer,

      rasterLayers,
      imageLayerLoaders,
      imageLayerMeta,
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
    const shouldShowImageLayerButton = Boolean(
      enableLayerButtonsWithOneLayer || imageLayerLoaders?.length > 1,
    );
    return (
      <TitleInfo
        title={title}
        isScroll
        removeGridComponent={removeGridComponent}
        theme={theme}
        isReady={isReady}
      >
        <div className="layer-controller-container" ref={ref}>
          {moleculesLayer && (
            <VectorLayerController
              key={`${dataset}-molecules`}
              label="Molecules"
              layerType="molecules"
              layer={moleculesLayer}
              handleLayerChange={setMoleculesLayer}
            />
          )}
          {cellsLayer && obsSegmentationsType === 'polygon' && (
            <VectorLayerController
              key={`${dataset}-cells`}
              label={`${capitalize(obsTypeProp)} Segmentations`}
              layerType="cells"
              layer={cellsLayer}
              handleLayerChange={setCellsLayer}
            />
          )}
          {/* Segmentation bitmask layers: */}
          {segmentationLayerScopes && segmentationLayerValues
            && segmentationLayerScopes.map((layerScope) => {
              const { obsType, spatialLayerVisible: visible, spatialLayerOpacity: opacity, spatialChannelColor: color, spatialLayerFilled: filled, spatialLayerStrokeWidth: strokeWidth } = segmentationLayerCoordination[0][layerScope];
              const { setSpatialLayerVisible: setVisible, setSpatialLayerOpacity: setOpacity, setSpatialChannelColor: setColor, setSpatialLayerFilled: setFilled, setSpatialLayerStrokeWidth: setStrokeWidth } = segmentationLayerCoordination[1][layerScope];

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
                />
              );
            })}
          {/* Image layers: */}
          {imageLayerScopes && imageLayerScopes.map(layerScope => (
            <SplitImageLayerController
              key={layerScope}
              layerScope={layerScope}
              layerCoordination={imageLayerCoordination[0][layerScope]}
              channelScopes={imageChannelScopesByLayer[layerScope]}
              channelCoordination={imageChannelCoordination[0][layerScope]}
              image={images[layerScope]}
              /* TODO: setters */
              use3d={false} /* TODO */
            />
          ))}
          {/*false && rasterLayers
            && rasterLayers.map((layer, i) => {
              const { index } = layer;
              const loader = imageLayerLoaders?.[index];
              const layerMeta = imageLayerMeta?.[index];
              // Bitmasks are handled above.
              const isRaster = true;
              // Set up the call back mechanism so that each layer manages
              // callbacks/loading state for itself and its channels.
              const setImageLayerCallback = (cb) => {
                const newRasterLayersCallbacks = [
                  ...(imageLayerCallbacks || []),
                ];
                newRasterLayersCallbacks[i] = cb;
                setImageLayerCallbacks(newRasterLayersCallbacks);
              };
              const areLayerChannelsLoading = (areLoadingImageChannels || [])[i] || [];
              const setAreLayerChannelsLoading = (v) => {
                const newAreLoadingImageChannels = [
                  ...(areLoadingImageChannels || []),
                ];
                newAreLoadingImageChannels[i] = v;
                setAreLoadingImageChannels(newAreLoadingImageChannels);
              };
              return loader && layerMeta ? (
                <Grid
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${dataset}-raster-${index}-${i}`}
                  item
                  style={{ marginTop: '10px' }}
                >
                  <LayerController
                    name={layerMeta.name}
                    layer={layer}
                    loader={loader}
                    theme={theme}
                    handleLayerChange={v => handleRasterLayerChange(v, i)}
                    handleLayerRemove={() => handleRasterLayerRemove(i)}
                    ChannelController={RasterChannelController}
                    shouldShowTransparentColor={isRaster}
                    shouldShowDomain={isRaster}
                    shouldShowColormap={isRaster}
                    // Disable 3D if given explicit instructions to do so
                    // or if another layer is using 3D mode.
                    disable3d={
                      globalDisable3d
                      || (disable3d || []).indexOf(layerMeta.name) >= 0
                      || (typeof layerIs3DIndex === 'number'
                        && layerIs3DIndex !== -1
                        && layerIs3DIndex !== i)
                    }
                    disabled={
                      typeof layerIs3DIndex === 'number'
                      && layerIs3DIndex !== -1
                      && layerIs3DIndex !== i
                    }
                    disableChannelsIfRgbDetected={disableChannelsIfRgbDetected}
                    imageLayerCallbacks={imageLayerCallbacks}
                    setImageLayerCallback={setImageLayerCallback}
                    setViewState={({
                      zoom: newZoom,
                      target,
                      rotationX: newRotationX,
                      rotationOrbit: newRotationOrbit,
                    }) => {
                      setZoom(newZoom);
                      setTargetX(target[0]);
                      setTargetY(target[1]);
                      setTargetZ(target[2]);
                      setRotationX(newRotationX);
                      setRotationOrbit(newRotationOrbit);
                    }}
                    setAreLayerChannelsLoading={setAreLayerChannelsLoading}
                    areLayerChannelsLoading={areLayerChannelsLoading}
                    spatialHeight={(componentHeight * (spatialLayout ? spatialLayout.h : 1)) / 12}
                    spatialWidth={(componentWidth * (spatialLayout ? spatialLayout.w : 1)) / 12}
                    shouldShowRemoveLayerButton={shouldShowImageLayerButton}
                  />
                </Grid>
              ) : null;
            })*/}
          {shouldShowImageLayerButton
            ? (
              <Grid item>
                <ImageAddButton
                  imageOptions={imageLayerMeta}
                  handleImageAdd={handleImageAdd}
                />
              </Grid>
            ) : null}
        </div>
      </TitleInfo>
    );
  }),
);

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
      spatialImageLayer: rasterLayers,
      spatialSegmentationLayer: cellsLayer,
      spatialPointLayer: moleculesLayer,
    },
    {
      setSpatialImageLayer: setRasterLayers,
      setSpatialSegmentationLayer: setCellsLayer,
      setSpatialPointLayer: setMoleculesLayer,
      setSpatialTargetX: setTargetX,
      setSpatialTargetY: setTargetY,
      setSpatialTargetZ: setTargetZ,
      setSpatialRotationX: setRotationX,
      setSpatialRotationOrbit: setRotationOrbit,
      setSpatialZoom: setZoom,
    },
  ] = useCoordination(
    COMPONENT_COORDINATION_TYPES[ViewType.LAYER_CONTROLLER],
    coordinationScopes,
  );

  // Normalize arrays and non-arrays to always be arrays.
  const segmentationLayerValues = useMultiCoordinationValues(
    CoordinationType.SPATIAL_SEGMENTATION_LAYER,
    coordinationScopes,
  );
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

  console.log(imageLayerScopes, imageChannelScopesByLayer);

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

  console.log(imageLayerCoordination, imageChannelCoordination);

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

  const [obsTypes, obsSegmentationsData, obsSegmentationsDataStatus] = useMultiObsSegmentations(
    coordinationScopes, coordinationScopesBy, loaders, dataset, () => {}, obsSegmentationsMatchOn,
  );
  const [imageData, imageDataStatus] = useMultiImages(
    coordinationScopes, coordinationScopesBy, loaders, dataset, () => {},
  );
  console.log(imageData, imageDataStatus);

  // Get data from loaders using the data hooks.
  // eslint-disable-next-line no-unused-vars
  const [obsLocationsData, obsLocationsStatus] = useObsLocationsData(
    loaders, dataset, () => {}, false,
    { setSpatialPointLayer: setMoleculesLayer },
    { spatialPointLayer: moleculesLayer },
    {}, // TODO: use obsType once #1240 is merged.
  );
  const [obsSegmentations, obsSegmentationsType, obsSegmentationsStatus] = useMemo(
    () => ([null, null, STATUS.ERROR]), [],
  );
  const [{ image }, imageStatus] = useImageData(
    loaders, dataset, () => {}, false,
    { setSpatialImageLayer: setRasterLayers },
    { spatialImageLayer: rasterLayers },
    {}, // TODO: which values to match on
  );
  const { loaders: imageLayerLoaders, meta: imageLayerMeta } = image || {};
  const isReady = useReady([
    obsLocationsStatus,
    obsSegmentationsDataStatus,
    imageStatus,
  ]);

  const segmentationLayerLoaders = obsSegmentations && obsSegmentationsType === 'bitmask' ? obsSegmentations.loaders : null;
  const segmentationLayerMeta = obsSegmentations && obsSegmentationsType === 'bitmask' ? obsSegmentations.meta : null;

  // useCallback prevents new functions from propogating
  // changes to the underlying component.
  const handleImageAdd = useCallback(async (index) => {
    const loader = imageLayerLoaders[index];
    const newChannels = await initializeLayerChannels(
      loader,
      (rasterLayers[index] || {}).use3d,
    );
    const newLayer = {
      index,
      modelMatrix: imageLayerMeta[index]?.metadata?.transform?.matrix,
      ...DEFAULT_RASTER_LAYER_PROPS,
      channels: newChannels,
      type: imageLayerMeta[index]?.metadata?.isBitmask ? 'bitmask' : 'raster',
    };
    const newLayers = [...rasterLayers, newLayer];
    setRasterLayers(newLayers);
  }, [imageLayerLoaders, imageLayerMeta, rasterLayers, setRasterLayers]);

  const handleRasterLayerChange = useCallback((newLayer, i) => {
    const newLayers = [...rasterLayers];
    newLayers[i] = newLayer;
    setRasterLayers(newLayers);
  }, [rasterLayers, setRasterLayers]);

  const handleRasterLayerRemove = useCallback((i) => {
    const newLayers = [...rasterLayers];
    newLayers.splice(i, 1);
    setRasterLayers(newLayers);
  }, [rasterLayers, setRasterLayers]);

  const handleSegmentationLayerChange = useCallback((newLayer, i) => {
    // Currently only used when obsSegmentationsType is 'bitmask'
    const newLayers = [...cellsLayer];
    newLayers[i] = newLayer;
    setCellsLayer(newLayers);
  }, [cellsLayer, setCellsLayer]);

  const handleSegmentationLayerRemove = useCallback((i) => {
    // Currently only used when obsSegmentationsType is 'bitmask'
    const newLayers = [...cellsLayer];
    newLayers.splice(i, 1);
    setCellsLayer(newLayers);
  }, [cellsLayer, setCellsLayer]);

  const layerIs3DIndex = rasterLayers?.findIndex && rasterLayers.findIndex(layer => layer.use3d);
  return (
    <LayerControllerMemoized
      ref={layerControllerRef}
      title={title}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
      moleculesLayer={moleculesLayer}
      dataset={dataset}
      obsType={obsType}
      setMoleculesLayer={setMoleculesLayer}
      cellsLayer={cellsLayer}
      setCellsLayer={setCellsLayer}

      rasterLayers={rasterLayers}
      imageLayerLoaders={imageLayerLoaders}
      imageLayerMeta={imageLayerMeta}
      imageLayerCallbacks={imageLayerCallbacks}
      setImageLayerCallbacks={setImageLayerCallbacks}
      areLoadingImageChannels={areLoadingImageChannels}
      setAreLoadingImageChannels={setAreLoadingImageChannels}
      handleRasterLayerChange={handleRasterLayerChange}
      handleRasterLayerRemove={handleRasterLayerRemove}

      segmentationLayerScopes={segmentationLayerScopes}
      segmentationLayerValues={segmentationLayerValues}
      segmentationLayerCoordination={segmentationLayerCoordination}

      images={imageData}
      imageLayerScopes={imageLayerScopes}
      imageLayerCoordination={imageLayerCoordination}

      imageChannelScopesByLayer={imageChannelScopesByLayer}
      imageChannelCoordination={imageChannelCoordination}

      obsTypes={obsTypes}
      obsSegmentationsStatus={obsSegmentationsDataStatus}
      obsSegmentationsData={obsSegmentationsData}
      obsSegmentationsType={obsSegmentationsType}
      segmentationLayerLoaders={segmentationLayerLoaders}
      segmentationLayerMeta={segmentationLayerMeta}
      segmentationLayerCallbacks={segmentationLayerCallbacks}
      setSegmentationLayerCallbacks={setSegmentationLayerCallbacks}
      areLoadingSegmentationChannels={areLoadingSegmentationChannels}
      setAreLoadingSegmentationChannels={setAreLoadingSegmentationChannels}
      handleSegmentationLayerChange={handleSegmentationLayerChange}
      handleSegmentationLayerRemove={handleSegmentationLayerRemove}

      disable3d={disable3d}
      globalDisable3d={globalDisable3d}
      layerIs3DIndex={layerIs3DIndex}
      disableChannelsIfRgbDetected={disableChannelsIfRgbDetected}
      enableLayerButtonsWithOneLayer={enableLayerButtonsWithOneLayer}
      setZoom={setZoom}
      setTargetX={setTargetX}
      setTargetY={setTargetY}
      setTargetZ={setTargetZ}
      setRotationX={setRotationX}
      setRotationOrbit={setRotationOrbit}
      // Fall back to window for height and width.
      componentHeight={componentHeight || windowHeight}
      componentWidth={componentWidth || windowWidth}
      spatialLayout={spatialLayout}
      handleImageAdd={handleImageAdd}
    />
  );
}

export function register() {
  registerPluginViewType(
    ViewType.LAYER_CONTROLLER,
    LayerControllerSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.LAYER_CONTROLLER],
  );
}
