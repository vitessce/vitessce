import React, { useState, useEffect, useCallback } from 'react';

import PubSub from 'pubsub-js';
import Grid from '@material-ui/core/Grid';
import {
  ThemeProvider, StylesProvider,
  createGenerateClassName,
} from '@material-ui/core/styles';

import TitleInfo from '../TitleInfo';
import LayerController from './LayerController';
import ImageAddButton from './ImageAddButton';
import { RASTER_ADD, LAYER_REMOVE, CLEAR_PLEASE_WAIT } from '../../events';
import { darkTheme } from './styles';


const generateClassName = createGenerateClassName({
  disableGlobal: true,
});

function LayerControllerSubscriber({ onReady, removeGridComponent }) {
  const [imageOptions, setImageOptions] = useState(null);
  const [layers, setLayers] = useState([]);
  const memoizedOnReady = useCallback(onReady, []);

  useEffect(() => {
    function handleRasterAdd(msg, raster) {
      setImageOptions(raster.images);
      PubSub.publish(CLEAR_PLEASE_WAIT, 'raster');
    }
    memoizedOnReady();
    const token = PubSub.subscribe(RASTER_ADD, handleRasterAdd);
    return () => PubSub.unsubscribe(token);
  }, [memoizedOnReady]);

  const handleImageAdd = (imageData) => {
    const layerId = String(Math.random());
    setLayers([...layers, { layerId, imageData }]);
  };

  const handleLayerRemove = (layerId) => {
    const nextLayers = layers.filter(d => d.layerId !== layerId);
    setLayers(nextLayers);
    PubSub.publish(LAYER_REMOVE, layerId);
    PubSub.publish(METADATA_REMOVE, layerId);
  };

  const layerControllers = layers.map(({ layerId, imageData }) => (
    <Grid key={layerId} item style={{ marginTop: '10px' }}>
      <LayerController
        layerId={layerId}
        imageData={imageData}
        handleLayerRemove={() => handleLayerRemove(layerId)}
      />
    </Grid>
  ));

  return (
    <TitleInfo title="Layer Controller" isScroll removeGridComponent={removeGridComponent}>
      <StylesProvider generateClassName={generateClassName}>
        <ThemeProvider theme={darkTheme}>
          {layerControllers}
          <Grid item>
            <ImageAddButton imageOptions={imageOptions} handleImageAdd={handleImageAdd} />
          </Grid>
        </ThemeProvider>
      </StylesProvider>
    </TitleInfo>
  );
}

export default LayerControllerSubscriber;
