import React, { useState, useReducer, useEffect } from 'react';
import PubSub from 'pubsub-js';
import { createZarrLoader } from '@hubmap/vitessce-image-viewer';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { Slider } from 'antd';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ChannelController from './ChannelController';
import LayerOptions from './LayerOptions';

import { LAYER_ADD, LAYER_CHANGE } from '../../events';
import reducer from './reducer';


async function initLoader(imageData) {
  const { type, url, metadata } = imageData;
  const { dimensions, is_pyramid: isPyramid, transform } = metadata;
  const { scale = 0, translate = { x: 0, y: 0 } } = transform;

  switch (type) {
    // TODO: Add tiff loader
    case ('zarr'): {
      const loader = await createZarrLoader({
        url, dimensions, isPyramid, scale, translate,
      });
      return loader;
    }
    default: {
      throw Error(`Image type (${type}) is not supported`);
    }
  }
}


const MAX_CHANNELS = 6;
const DEFAULT_LAYER_PROPS = {
  colormap: '',
  opacity: 1,
  colors: [],
  sliders: [],
  visibilities: [],
  selections: [],
};

export default function LayerController({ imageData, layerId, handleLayerRemove }) {
  const [colormap, setColormap] = useState(DEFAULT_LAYER_PROPS.colormap);
  const [opacity, setOpacity] = useState(DEFAULT_LAYER_PROPS.opacity);
  const [channels, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    initLoader(imageData).then((loader) => {
      PubSub.publish(LAYER_ADD, {
        layerId,
        loader,
        layerProps: DEFAULT_LAYER_PROPS,
      });
    });
  }, [layerId, imageData]);

  const { metadata: { dimensions } } = imageData;
  /*
  * TODO: UI selectors for channels just assume the first dimension (so we only support
  * simple 2D images, with one additonal dimension (i.e. mz, time, channel, z).
  * We will need to come up with more than just a single drop down for selecting image panes
  * from multi-dimensional images.
  */
  const { values: channelOptions, field: dimName } = dimensions[0];

  const handleChannelAdd = () => {
    // By default choose first option when adding channel
    const selection = { [dimName]: 0 };
    dispatch({ type: 'ADD_CHANNEL', layerId, payload: { selection } });
  };

  const handleOpacityChange = (sliderValue) => {
    setOpacity(sliderValue);
    PubSub.publish(LAYER_CHANGE, { layerId, layerProps: { opacity: sliderValue } });
  };

  const handleColormapChange = (colormapName) => {
    setColormap(colormapName);
    PubSub.publish(LAYER_CHANGE, { layerId, layerProps: { colormap: colormapName } });
  };

  const channelControllers = Object
    .entries(channels)
    .map(([channelId, c]) => {
      const handleChannelPropertyChange = (property, value) => {
        dispatch({ type: 'CHANGE_PROPERTY', layerId, payload: { channelId, property, value } });
      };
      const handleChannelRemove = () => {
        dispatch({ type: 'REMOVE_CHANNEL', layerId, payload: { channelId } });
      };
      return (
        <Grid key={`channel-controller-${channelId}`} item style={{ width: '100%' }}>
          <ChannelController
            dimName={dimName}
            selectionIndex={c.selection[0]}
            visibility={c.visibility}
            slider={c.slider}
            color={c.color}
            channelOptions={channelOptions}
            colormapOn={Boolean(colormap)}
            handlePropertyChange={handleChannelPropertyChange}
            handleChannelRemove={handleChannelRemove}
          />
        </Grid>
      );
    });

  return (
    <ExpansionPanel style={{ width: '100%' }}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`layer-${imageData.name}-controls`}
      >
        {imageData.name}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
        <Grid item>
          <LayerOptions
            opacity={opacity}
            colormap={colormap}
            handleOpacityChange={handleOpacityChange}
            handleColormapChange={handleColormapChange}
          />
        </Grid>
        <Grid item>
          <Slider />
        </Grid>
        {channelControllers}
        <Grid item>
          <Button
            disabled={Object.values(channels).length === MAX_CHANNELS}
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
        <Grid item>
          <Button
            onClick={handleLayerRemove}
            fullWidth
            variant="outlined"
            style={{ borderStyle: 'dashed', marginTop: '10px' }}
            size="small"
          >
              Remove Image Layer
          </Button>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>

  );
}
