import React, { useState, useEffect, useCallback } from 'react';

import PubSub from 'pubsub-js';
import Grid from '@material-ui/core/Grid';
import { createZarrLoader, createOMETiffLoader } from '@hubmap/vitessce-image-viewer';
import TitleInfo from '../TitleInfo';
import RasterLayerController from './RasterLayerController';
import VectorLayerController from './VectorLayerController';
import ImageAddButton from './ImageAddButton';
import {
  RASTER_ADD,
  LAYER_REMOVE,
  CLEAR_PLEASE_WAIT,
  METADATA_REMOVE,
  LAYER_ADD,
  METADATA_ADD,
  CELLS_SET_OPACITY,
  CELLS_ADD,
  CELLS_TURN_ON,
  LAYER_CHANGE,
  MOLECULES_ADD,
  MOLECULES_SET_OPACITY,
  MOLECULES_TURN_ON,
} from '../../events';
import { DEFAULT_LAYER_PROPS } from './constants';

function genId() {
  return String(Math.random());
}

async function initLoader(imageData) {
  const {
    type, url, metadata, requestInit,
  } = imageData;
  switch (type) {
    case ('zarr'): {
      const { dimensions, isPyramid, transform } = metadata;
      const { scale = 0, translate = { x: 0, y: 0 } } = transform;
      const loader = await createZarrLoader({
        url, dimensions, isPyramid, scale, translate,
      });
      return loader;
    }
    case ('ome-tiff'): {
      // Fetch offsets for ome-tiff if needed.
      if ('omeTiffOffsetsUrl' in metadata) {
        const { omeTiffOffsetsUrl } = metadata;
        const res = await fetch(omeTiffOffsetsUrl, requestInit);
        if (res.ok) {
          const offsets = await res.json();
          const loader = await createOMETiffLoader({
            url,
            offsets,
            headers: requestInit,
          });
          return loader;
        }
        throw new Error('Offsets not found but provided.');
      }
      const loader = createOMETiffLoader({
        url,
        headers: requestInit,
      });
      return loader;
    }
    default: {
      throw Error(`Image type (${type}) is not supported`);
    }
  }
}

function publishLayer({ loader, imageData, layerId }) {
  PubSub.publish(LAYER_ADD, {
    layerId,
    loader,
    layerProps: DEFAULT_LAYER_PROPS,
  });
  if (loader.getMetadata) {
    PubSub.publish(METADATA_ADD, {
      layerId,
      layerName: imageData.name,
      layerMetadata: loader.getMetadata(),
    });
  }
}

function LayerControllerSubscriber({ onReady, removeGridComponent, theme }) {
  const [imageOptions, setImageOptions] = useState(null);
  const [areCellsPlotted, setAreCellsPlotted] = useState(false);
  const [areMoleculesPlotted, setAreMoleculesPlotted] = useState(false);
  const [layersAndLoaders, setLayersAndLoaders] = useState([]);
  const memoizedOnReady = useCallback(onReady, []);

  useEffect(() => {
    async function handleRasterAdd(msg, { data: raster }) {
      // render_layers provides the order for rendering initially.
      const { images, renderLayers } = raster;
      setImageOptions(images);
      if (!renderLayers) {
        const layerId = genId();
        // Midpoint of images list as default image to show.
        const imageData = images[Math.floor(images.length / 2)];
        const loader = await initLoader(imageData);
        publishLayer({ loader, imageData, layerId });
        setLayersAndLoaders([{ layerId, imageData, loader }]);
      } else {
        const newLayersAndLoaders = await Promise.all(renderLayers.map(async (imageName) => {
          const layerId = genId();
          const [imageData] = images.filter(image => image.name === imageName);
          const loader = await initLoader(imageData);
          return { layerId, imageData, loader };
        }));
        newLayersAndLoaders.forEach(({ imageData, loader, layerId: id }) => {
          publishLayer({ loader, imageData, layerId: id });
        });
        setLayersAndLoaders(newLayersAndLoaders);
      }
      PubSub.publish(CLEAR_PLEASE_WAIT, 'raster');
    }
    memoizedOnReady();
    const rasterAddtoken = PubSub.subscribe(RASTER_ADD, handleRasterAdd);
    const cellsAddToken = PubSub.subscribe(
      CELLS_ADD, () => setAreCellsPlotted(true),
    );
    const moleculesAddToken = PubSub.subscribe(
      MOLECULES_ADD, () => setAreMoleculesPlotted(true),
    );
    return () => {
      PubSub.unsubscribe(rasterAddtoken);
      PubSub.unsubscribe(cellsAddToken);
      PubSub.unsubscribe(moleculesAddToken);
    };
  }, [memoizedOnReady]);

  const handleImageAdd = async (imageData) => {
    const layerId = genId();
    const loader = await initLoader(imageData);
    publishLayer({ loader, imageData, layerId });
    setLayersAndLoaders(prevState => [...prevState, { layerId, imageData, loader }]);
  };

  const handleLayerRemove = (layerId, layerName) => {
    const nextLayersAndLoaders = layersAndLoaders.filter(d => d.layerId !== layerId);
    setLayersAndLoaders(nextLayersAndLoaders);
    PubSub.publish(LAYER_REMOVE, layerId);
    PubSub.publish(METADATA_REMOVE, { layerId, layerName });
  };
  const handleLayerChange = useCallback(
    message => PubSub.publish(LAYER_CHANGE, message),
    [],
  );
  const layerControllers = layersAndLoaders.map(({ layerId, imageData, loader }) => (
    <Grid key={layerId} item style={{ marginTop: '10px' }}>
      <RasterLayerController
        layerId={layerId}
        imageData={imageData}
        handleLayerRemove={() => handleLayerRemove(layerId, imageData.name)}
        loader={loader}
        theme={theme}
        handleLayerChange={handleLayerChange}
      />
    </Grid>
  ));

  return (
    <TitleInfo
      title="Layer Controller"
      isScroll
      removeGridComponent={removeGridComponent}
      theme={theme}
    >
      <div className="layer-controller-container">
        {areCellsPlotted ? (
          <VectorLayerController
            label="Cell Segmentations"
            handleOpacityChange={v => PubSub.publish(CELLS_SET_OPACITY, v)}
            handleToggleChange={v => PubSub.publish(CELLS_TURN_ON, v)}
          />
        ) : null}
        {areMoleculesPlotted ? (
          <VectorLayerController
            label="Molecules"
            handleOpacityChange={v => PubSub.publish(MOLECULES_SET_OPACITY, v)}
            handleToggleChange={v => PubSub.publish(MOLECULES_TURN_ON, v)}
          />
        ) : null}
        {layerControllers}
        <Grid item>
          <ImageAddButton
            imageOptions={imageOptions}
            handleImageAdd={handleImageAdd}
          />
        </Grid>
      </div>
    </TitleInfo>
  );
}

export default LayerControllerSubscriber;
