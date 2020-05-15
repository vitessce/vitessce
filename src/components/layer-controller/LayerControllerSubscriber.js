/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';

import PubSub from 'pubsub-js';
import { StyledGrid } from './styles';
/* import { ThemeProvider } from '@material-ui/core/styles'; */


import TitleInfo from '../TitleInfo';
import LayerController from './LayerController';
import ImageAddButton from './ImageAddButton';
import { RASTER_ADD, LAYER_REMOVE, CLEAR_PLEASE_WAIT } from '../../events';
/* import { darkTheme } from './styles'; */

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
  };

  const layerControllers = layers.map(({ layerId, imageData }) => (
    <StyledGrid key={layerId} item style={{ marginTop: '10px' }}>
      <LayerController
        layerId={layerId}
        imageData={imageData}
        handleLayerRemove={() => handleLayerRemove(layerId)}
      />
    </StyledGrid>
  ));

  return (
    <TitleInfo title="Layer Controller" isScroll removeGridComponent={removeGridComponent}>
      {layerControllers}
      <StyledGrid item>
        <ImageAddButton imageOptions={imageOptions} handleImageAdd={handleImageAdd} />
      </StyledGrid>
    </TitleInfo>
  );
}

export default LayerControllerSubscriber;
