import React, {
  useState, useReducer, useEffect, useMemo,
} from 'react';
import PubSub from 'pubsub-js';
import { createZarrLoader } from '@hubmap/vitessce-image-viewer';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ChannelController from './ChannelController';
import LayerOptions from './LayerOptions';

import { LAYER_ADD, LAYER_CHANGE, METADATA_ADD } from '../../events';
import reducer from './reducer';
import { useExpansionPanelStyles } from './styles';

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
const buttonStyles = { borderStyle: 'dashed', marginTop: '10px', fontWeight: 400 };
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

  /*
  * TODO: UI selectors for channels just assume the first dimension (so we only support
  * simple 2D images, with one additonal dimension (i.e. mz, time, channel, z).
  * We will need to come up with more than just a single drop down for selecting image panes
  * from multi-dimensional images.
  */
  const [dimName, channelOptions, defaultSelection] = useMemo(() => {
    const { metadata: { dimensions } } = imageData;
    const { values, field } = dimensions[0];
    return [field, values, { [field]: 0 }];
  }, [imageData]);

  useEffect(() => {
    initLoader(imageData).then((loader) => {
      PubSub.publish(LAYER_ADD, {
        layerId,
        loader,
        layerProps: DEFAULT_LAYER_PROPS,
      });
      if (loader.getMetadata) {
        PubSub.publish(METADATA_ADD, {
          name: imageData.name,
          metadata: loader.getMetadata(),
        });
      }
      // Add channel on image add automatically
      dispatch({
        type: 'ADD_CHANNEL',
        layerId,
        payload: { selection: defaultSelection },
      });
    });
  }, [layerId, imageData, defaultSelection]);

  const handleChannelAdd = () => dispatch({
    type: 'ADD_CHANNEL',
    layerId,
    payload: { selection: defaultSelection },
  });

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

  const classes = useExpansionPanelStyles();
  return (
    <ExpansionPanel defaultExpanded className={classes.root}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`layer-${imageData.name}-controls`}
        style={{ paddingLeft: '10px', paddingRight: '10px' }}
      >
        {imageData.name}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.root}>
        <Grid item>
          <LayerOptions
            opacity={opacity}
            colormap={colormap}
            handleOpacityChange={handleOpacityChange}
            handleColormapChange={handleColormapChange}
          />
        </Grid>
        {channelControllers}
        <Grid item>
          <Button
            disabled={Object.values(channels).length === MAX_CHANNELS}
            onClick={handleChannelAdd}
            fullWidth
            variant="outlined"
            style={buttonStyles}
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
            style={buttonStyles}
            size="small"
          >
              Remove Image Layer
          </Button>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>

  );
}
