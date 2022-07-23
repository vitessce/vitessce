/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
import React, {
  useEffect, useCallback, useRef, forwardRef,
} from 'react';
import Grid from '@material-ui/core/Grid';
import TitleInfo from '../TitleInfo';
import RasterChannelController from './RasterChannelController';
import BitmaskChannelController from './BitmaskChannelController';
import VectorLayerController from './VectorLayerController';
import LayerController from './LayerController';
import ImageAddButton from './ImageAddButton';
import { useReady, useClosestVitessceContainerSize, useWindowDimensions } from '../hooks';
import {
  useImageData,
  useObsLocationsData,
  useObsSegmentationsData,
} from '../data-hooks';
import {
  useCoordination,
  useLoaders,
  useAuxiliaryCoordination,
  useComponentLayout,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { initializeLayerChannels } from '../spatial/utils';
import { DEFAULT_RASTER_LAYER_PROPS } from '../spatial/constants';
import { DataType } from '../../app/constants';

const LAYER_CONTROLLER_DATA_TYPES = [
  DataType.IMAGE,
  DataType.OBS_LOCATIONS,
  DataType.OBS_SEGMENTATIONS,
];

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
              label="Cell Segmentations"
              layerType="cells"
              layer={cellsLayer}
              handleLayerChange={setCellsLayer}
            />
          )}
          {/* Segmentation bitmask layers: */}
          {cellsLayer && obsSegmentationsType === 'bitmask'
            && cellsLayer.map((layer, i) => {
              const { index } = layer;
              const loader = segmentationLayerLoaders[index];
              const layerMeta = segmentationLayerMeta[index];
              const isRaster = false;
              // Set up the call back mechanism so that each layer manages
              // callbacks/loading state for itself and its channels.
              const setSegmentationLayerCallback = (cb) => {
                const newRasterLayersCallbacks = [
                  ...(imageLayerCallbacks || []),
                ];
                newRasterLayersCallbacks[i] = cb;
                setSegmentationLayerCallbacks(newRasterLayersCallbacks);
              };
              const areLayerChannelsLoading = (areLoadingSegmentationChannels || [])[i] || [];
              const setAreLayerChannelsLoading = (v) => {
                const newAreLoadingImageChannels = [
                  ...(areLoadingSegmentationChannels || []),
                ];
                newAreLoadingImageChannels[i] = v;
                setAreLoadingSegmentationChannels(newAreLoadingImageChannels);
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
                    handleLayerChange={v => handleSegmentationLayerChange(v, i)}
                    handleLayerRemove={() => handleSegmentationLayerRemove(i)}
                    ChannelController={BitmaskChannelController}
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
                    setImageLayerCallback={setSegmentationLayerCallback}
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
            })}
          {/* Image layers: */}
          {rasterLayers
            && rasterLayers.map((layer, i) => {
              const { index } = layer;
              const loader = imageLayerLoaders[index];
              const layerMeta = imageLayerMeta[index];
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
            })}
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
function LayerControllerSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Spatial Layers',
    disable3d,
    globalDisable3d,
    disableChannelsIfRgbDetected,
    enableLayerButtonsWithOneLayer,
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [
    {
      dataset,
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
    COMPONENT_COORDINATION_TYPES.layerController,
    coordinationScopes,
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

  const [
    isReady,
    setItemIsReady,
    setItemIsNotReady, // eslint-disable-line no-unused-vars
    resetReadyItems,
  ] = useReady(
    LAYER_CONTROLLER_DATA_TYPES,
  );

  // Reset loader progress when the dataset has changed.
  useEffect(() => {
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  useObsLocationsData(
    loaders, dataset, setItemIsReady, () => {}, false,
    { setSpatialPointLayer: setMoleculesLayer },
    { spatialPointLayer: moleculesLayer },
    {}, // TODO: use obsType once #1240 is merged.
  );
  const { obsSegmentations, obsSegmentationsType } = useObsSegmentationsData(
    loaders, dataset, setItemIsReady, () => {}, false,
    { setSpatialSegmentationLayer: setCellsLayer },
    { spatialSegmentationLayer: cellsLayer },
    {}, // TODO: use obsType once #1240 is merged.
  );
  const { image } = useImageData(
    loaders, dataset, setItemIsReady, () => {}, false,
    { setSpatialImageLayer: setRasterLayers },
    { spatialImageLayer: rasterLayers },
    {}, // TODO: which values to match on
  );
  const { loaders: imageLayerLoaders = [], meta: imageLayerMeta = [] } = image || {};

  const segmentationLayerLoaders = obsSegmentations && obsSegmentationsType === 'bitmask' ? obsSegmentations.loaders : [];
  const segmentationLayerMeta = obsSegmentations && obsSegmentationsType === 'bitmask' ? obsSegmentations.meta : [];

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

export default LayerControllerSubscriber;
