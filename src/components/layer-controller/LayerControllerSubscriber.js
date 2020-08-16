import React, { useState, useEffect } from 'react';

import Grid from '@material-ui/core/Grid';
import TitleInfo from '../TitleInfo';
import RasterLayerController from './RasterLayerController';
import VectorLayerController from './VectorLayerController';
import ImageAddButton from './ImageAddButton';
import { useReady } from '../utils';
import { useCoordination } from '../../app/state/hooks';
import { componentCoordinationTypes } from '../../app/state/coordination';
import {
  initializeLayersAndChannels,
  initializeLayerChannels,
} from '../spatial/utils';

function LayerControllerSubscriber(props) {
  const {
    loaders,
    coordinationScopes,
    coordinationInitializationStrategy,
    removeGridComponent,
    theme,
  } = props;

  const [{
    dataset,
    spatialLayers: layers,
  }, {
    setSpatialLayers: setLayers,
  }] = useCoordination(componentCoordinationTypes.layerController, coordinationScopes);

  const [isReady, setItemIsReady, resetReadyItems] = useReady(
    ['raster'],
    Object.keys(loaders[dataset]?.loaders || {}),
  );

  // Since we want the image layer / channel definitions to come from the
  // coordination space stored as JSON in the view config,
  // we need to set up a separate state variable here to store the
  // non-JSON objects, such as layer loader instances.
  const [imageLayerMeta, setImageLayerMeta] = useState({});
  const [imageLayerLoaders, setImageLayerLoaders] = useState({});

  // Load the raster manifest, and then get the associated layer metadata and loaders.
  useEffect(() => {
    resetReadyItems();

    // eslint-disable-next-line no-unused-expressions
    loaders[dataset]?.loaders['raster']?.load().then(({ data }) => {
      const { layers: rasterLayers, renderLayers: rasterRenderLayers } = data;
      initializeLayersAndChannels(
        rasterLayers, rasterRenderLayers, layers,
        coordinationInitializationStrategy.spatialLayers,
      // eslint-disable-next-line no-unused-vars
      ).then(([nextLayers, nextImageLoaders, nextImageMeta]) => {
        setImageLayerLoaders(nextImageLoaders);
        setImageLayerMeta(nextImageMeta);
        setItemIsReady('raster');
      });
    });
  }, [loaders, dataset, coordinationInitializationStrategy,
    resetReadyItems, layers, setItemIsReady]);

  const handleImageAdd = async (index) => {
    const loader = imageLayerLoaders[index];
    const layerMeta = imageLayerMeta[index];
    const newChannels = await initializeLayerChannels(layerMeta, loader);
    const newLayer = {
      type: 'raster',
      index,
      opacity: 1,
      colormap: '',
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
                key="cells"
                label="Cell Segmentations"
                layer={layer}
                handleLayerChange={v => handleLayerChange(v, i)}
              />
            );
          } if (layer.type === 'molecules') {
            return (
              <VectorLayerController
                key="molecules"
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
              <Grid key={`raster-layer-${index}-${i}`} item style={{ marginTop: '10px' }}>
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
