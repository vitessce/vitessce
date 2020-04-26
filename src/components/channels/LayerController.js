import React, { useState, useReducer, useEffect } from 'react';
import PubSub from 'pubsub-js';
import { createZarrLoader } from '@hubmap/vitessce-image-viewer';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import AddIcon from '@material-ui/icons/Add';

import ChannelController from './ChannelController';
import ColormapSelect from './ColormapSelect';

import { LAYER_ADD, LAYER_OPACITY_CHANGE, LAYER_COLOMAP_CHANGE } from '../../events';
import reducer from './reducer';


async function initLoader(imageData) {
  const { type, url, metadata } = imageData;
  const { dimensions, is_pyramid: isPyramid, transform } = metadata;

  switch (type) {
    // TODO: Add tiff loader
    case ('zarr'): {
      const loader = await createZarrLoader({
        url, dimensions, isPyramid, ...transform,
      });
      return loader;
    }
    default: {
      throw Error(`Image type (${type}) is not supported`);
    }
  }
}


const MAX_CHANNELS = 6;
const INITIAL_LAYER = {
  colormap: '',
  opacity: 1,
  colors: [],
  sliders: [],
  visibilities: [],
  selections: [],
};

export default function LayerController({ imageData, layerId }) {
  const [colormap, setColormap] = useState('');
  const [opacity, setOpacity] = useState(1);
  const [layer, dispatch] = useReducer(reducer, INITIAL_LAYER);
  const [loader, setLoader] = useState(null);

  useEffect(() => {
    initLoader(imageData).then((layerLoader) => {
      PubSub.publish(LAYER_ADD, { layerId, loader: layerLoader, ...INITIAL_LAYER });
      setLoader(layerLoader);
    });
  }, [layerId, imageData]);
  const { metadata: { dimensions } } = imageData;
  const { values: channelOptions, field: dimName } = dimensions[0];

  const handleControllerChange = (index, actionType, value = null) => {
    if (actionType === 'CHANGE_SELECTION') {
      // eslint-disable-next-line no-param-reassign
      [value] = loader.serializeSelection({ [dimName]: value });
    }
    dispatch({ type: actionType, layerId, payload: { index, value } });
  };

  const handleChannelAdd = () => {
    // By default choose first option when adding channel
    const [selection] = loader.serializeSelection({ [dimName]: 0 });
    dispatch({
      type: 'ADD_CHANNEL',
      layerId,
      payload: {
        selection,
        name: channelOptions[0],
      },
    });
  };

  const handleOpacityChange = (sliderValue) => {
    setOpacity(sliderValue);
    PubSub.publish(LAYER_OPACITY_CHANGE(layerId), sliderValue);
  };

  const handleColormapChange = (colormapName) => {
    setColormap(colormapName);
    PubSub.publish(LAYER_COLOMAP_CHANGE(layerId), colormapName);
  };

  const {
    colors, sliders, selections, visibilities,
  } = layer;
  const channelControllers = colors.map((color, idx) => (
    // eslint-disable-next-line react/no-array-index-key
    <Grid key={`channel-controller-${idx}`} item style={{ width: '100%' }}>
      <ChannelController
        name={selections[idx][0]}
        channelOptions={channelOptions}
        isOn={visibilities[idx]}
        sliderValue={sliders[idx]}
        colorValue={color}
        handleChange={(actionType, value) => handleControllerChange(idx, actionType, value)}
        colormapOn={colormap !== ''}
      />
    </Grid>
  ));

  return (
    <>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
      >
        <Grid item style={{ width: '100%' }}>
          <ColormapSelect value={colormap} handleChange={handleColormapChange} />
        </Grid>
        <Grid item style={{ width: '100%' }}>
          <Slider
            value={opacity}
            onChange={(e, v) => handleOpacityChange(v)}
            valueLabelDisplay="auto"
            getAriaLabel={() => 'opacity slider'}
            min={0}
            max={1}
            step={0.01}
            orientation="horizontal"
          />
        </Grid>
        {channelControllers}
      </Grid>
      <Grid item>
        <Button
          disabled={!loader || colors.length === MAX_CHANNELS}
          onClick={handleChannelAdd}
          fullWidth
          variant="outlined"
          style={{ borderStyle: 'dashed', marginTop: '10px' }}
          startIcon={<AddIcon />}
          size="small"
        >
              Add Channel
        </Button>
      </Grid>
    </>
  );
}
