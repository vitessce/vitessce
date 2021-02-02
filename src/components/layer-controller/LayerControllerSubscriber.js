/* eslint-disable dot-notation */
import React, { useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import TitleInfo from '../TitleInfo';
import RasterLayerController from './RasterLayerController';
import VectorLayerController from './VectorLayerController';
import ImageAddButton from './ImageAddButton';
import { useReady } from '../hooks';
import { useRasterData } from '../data-hooks';
import { useCoordination, useLoaders } from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import { initializeLayerChannels } from '../spatial/utils';
import { DEFAULT_RASTER_LAYER_PROPS } from '../spatial/constants';

const LAYER_CONTROLLER_DATA_TYPES = ['raster'];

function LayerControllerSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
  } = props;

  const loaders = useLoaders();

  // Get "props" from the coordination space.
  const [{
    dataset,
    spatialLayers: layers,
  }, {
    setSpatialLayers: setLayers,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES.layerController, coordinationScopes);

  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    LAYER_CONTROLLER_DATA_TYPES,
  );

  // Reset loader progress when the dataset has changed.
  useEffect(() => {
    resetReadyItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  // Get data from loaders using the data hooks.
  // eslint-disable-next-line no-unused-vars
  const [raster, imageLayerLoaders, imageLayerMeta] = useRasterData(
    loaders, dataset, setItemIsReady, () => {}, false,
  );

  const handleImageAdd = async (index) => {
    const loader = imageLayerLoaders[index];
    const newChannels = await initializeLayerChannels(loader);
    const newLayer = {
      type: 'raster',
      index,
      modelMatrix: imageLayerMeta[index]?.metadata?.transform?.matrix,
      ...DEFAULT_RASTER_LAYER_PROPS,
      channels: newChannels,
    };
    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
  };

  function handleLayerChange(newLayer, i) {
    const newLayers = [...layers];
    newLayers[i] = newLayer;
    setLayers(newLayers);
  }

  function handleLayerRemove(i) {
    const newLayers = [...layers];
    newLayers.splice(i, 1);
    setLayers(newLayers);
  }

  return (
    <TitleInfo
      title="Spatial Layers"
      isScroll
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
    >
      <div className="layer-controller-container">
        {layers && layers.map((layer, i) => {
          if (layer.type === 'cells') {
            return (
              <VectorLayerController
                key={`${dataset}-cells`}
                label="Cell Segmentations"
                layer={layer}
                handleLayerChange={v => handleLayerChange(v, i)}
              />
            );
          } if (layer.type === 'molecules') {
            return (
              <VectorLayerController
                key={`${dataset}-molecules`}
                label="Molecules"
                layer={layer}
                handleLayerChange={v => handleLayerChange(v, i)}
              />
            );
          } if (layer.type === 'raster') {
            const { index } = layer;
            const loader = imageLayerLoaders[index];
            const layerMeta = imageLayerMeta[index];
            return (loader && layerMeta ? (
              // eslint-disable-next-line react/no-array-index-key
              <Grid key={`${dataset}-raster-${index}-${i}`} item style={{ marginTop: '10px' }}>
                <RasterLayerController
                  name={layerMeta.name}
                  layer={layer}
                  loader={loader}
                  theme={theme}
                  handleLayerChange={v => handleLayerChange(v, i)}
                  handleLayerRemove={() => handleLayerRemove(i)}
                />
              </Grid>
            ) : null);
          }
          return null;
        })}
        <Grid item>
          <ImageAddButton
            imageOptions={imageLayerMeta}
            handleImageAdd={handleImageAdd}
          />
        </Grid>
      </div>
    </TitleInfo>
  );
}

export default LayerControllerSubscriber;
