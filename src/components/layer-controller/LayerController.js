import React, {
  useState, useReducer, useEffect,
} from 'react';
import PubSub from 'pubsub-js';
import { createZarrLoader, createOMETiffLoader, getChannelStats } from '@hubmap/vitessce-image-viewer';

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

// For now these are the global channel selectors.
// We can expand this part of the application as new needs arise.
const GLOBAL_SLIDER_DIMENSION_FIELDS = ['z', 'time'];

const DTYPE_VALUES = {
  '<u1': {
    max: (2 ** 8) - 1,
  },
  '<u2': {
    max: (2 ** 16) - 1,
  },
  '<u4': {
    max: (2 ** 32) - 1,
  },
  '<f4': {
    max: (2 ** 31) - 1,
  },
};

function buildDefaultSelection(imageDims, defaultIndex = 0) {
  const selection = {};
  imageDims.forEach((dim) => {
    selection[dim.field] = defaultIndex;
  });
  return selection;
}

async function initLoader(imageData) {
  const {
    type, url, metadata, requestInit,
  } = imageData;
  switch (type) {
    case ('zarr'): {
      const { dimensions, is_pyramid: isPyramid, transform } = metadata;
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
  // eslint-disable-next-line
  const [loader, setLoader] = useState(null);
  const [colormap, setColormap] = useState(DEFAULT_LAYER_PROPS.colormap);
  const [opacity, setOpacity] = useState(DEFAULT_LAYER_PROPS.opacity);
  const [channels, dispatch] = useReducer(reducer, {});
  const [dimensions, setDimensions] = useState([]);
  const [domainType, setDomainType] = useState('Min/Max');


  useEffect(() => {
    initLoader(imageData).then((newLoader) => {
      setLoader(newLoader);
      const loaderDimensions = newLoader.dimensions;
      setDimensions(loaderDimensions);
      PubSub.publish(LAYER_ADD, {
        layerId,
        loader: newLoader,
        layerProps: DEFAULT_LAYER_PROPS,
      });
      if (newLoader.getMetadata) {
        PubSub.publish(METADATA_ADD, {
          layerId,
          layerName: imageData.name,
          layerMetadata: newLoader.getMetadata(),
        });
      }
      // Add channel on image add automatically as the first avaialable value for each dimension.
      const defaultSelection = buildDefaultSelection(newLoader.dimensions);
      getChannelStats({ loader: newLoader, loaderSelection: [defaultSelection] }).then((stats) => {
        const { domain } = stats[0];
        dispatch({
          type: 'ADD_CHANNEL',
          layerId,
          payload: { selection: defaultSelection, domain },
        });
      });
    });
  }, [layerId, imageData]);

  const dispatchDomain = ({ domain, type, channelId }) => {
    // Update the slider bounds.
    dispatch({
      type,
      layerId,
      payload: {
        property: 'domain',
        channelId,
        value: domain,
        publish: false,
      },
    });
    // Update the slider values.
    dispatch({
      type,
      layerId,
      payload: {
        property: 'slider',
        channelId,
        value: domain,
        publish: true,
      },
    });
  };

  const handleChannelAdd = async () => {
    const selection = Object.assign(
      {},
      ...dimensions.map(
        // Set new image to default selection for non-global selections (0)
        // and use current global selection otherwise.
        dimension => ({
          [dimension.field]: GLOBAL_SLIDER_DIMENSION_FIELDS.includes(dimension.field)
            ? Object.values(channels)[0].selection[dimension.field]
            : 0,
        }),
      ),
    );
    const stats = await getChannelStats({ loader, loaderSelection: [selection] });
    const { domain } = stats[0];
    dispatch({
      type: 'ADD_CHANNEL',
      layerId,
      payload: {
        selection,
        domain,
      },
    });
  };

  const handleOpacityChange = (sliderValue) => {
    setOpacity(sliderValue);
    PubSub.publish(LAYER_CHANGE, { layerId, layerProps: { opacity: sliderValue } });
  };

  const handleColormapChange = (colormapName) => {
    setColormap(colormapName);
    PubSub.publish(LAYER_CHANGE, { layerId, layerProps: { colormap: colormapName } });
  };
  const handleDomainChange = async (value) => {
    setDomainType(value);
    if (value === 'Min/Max') {
      const loaderSelection = Object.values(channels).map(
        channel => channel.selection,
      );
      const stats = await getChannelStats({ loader, loaderSelection });
      const domain = stats.map(stat => stat.domain);
      dispatchDomain({ domain, type: 'CHANGE_GLOBAL_CHANNELS_PROPERTY' });
    } if (value === 'Full') {
      const domain = Object.values(channels).map(() => [0, DTYPE_VALUES[loader.dtype].max]);
      dispatchDomain({ domain, type: 'CHANGE_GLOBAL_CHANNELS_PROPERTY' });
    }
  };
  const handleGlobalChannelsSelectionChange = async ({ selection, event }) => {
    // This call updates all channel selections with new global selection.
    dispatch({
      type: 'CHANGE_GLOBAL_CHANNELS_PROPERTY',
      layerId,
      payload: {
        // See https://github.com/hubmapconsortium/vitessce-image-viewer/issues/176 for why
        // we have to check mouseup.
        property: 'selection',
        value: selection,
        publish: event.type === 'mouseup',
      },
    });
    if (domainType === 'Min/Max') {
      const stats = await getChannelStats({
        loader,
        loaderSelection: Object.values(channels).map(
          channel => ({ ...channel.selection, selection }),
        ),
      });
      const domain = stats.map(stat => stat.domain);
      dispatchDomain({ domain, type: 'CHANGE_GLOBAL_CHANNELS_PROPERTY' });
    } if (domainType === 'Full') {
      const domain = Object.values(channels).map(() => [0, DTYPE_VALUES[loader.dtype].max]);
      dispatchDomain({ domain, type: 'CHANGE_GLOBAL_CHANNELS_PROPERTY' });
    }
  };
  let channelControllers = [];
  if (dimensions.length > 0) {
    const { values: channelOptions, field: dimName } = dimensions[0];
    channelControllers = Object.entries(channels).map(
      // c is an object like { color, selection, slider, visibility }.
      ([channelId, c]) => {
        // Change one property of a channel (for now - soon
        // nested structures allowing for multiple z/t selecitons at once, for example).
        const handleChannelPropertyChange = async (property, value) => {
          // property is something like "selection" or "slider."
          // value is the actual change, like { channel: "DAPI" }.
          dispatch({
            type: 'CHANGE_SINGLE_CHANNEL_PROPERTY',
            layerId,
            payload: {
              channelId,
              property,
              value,
            },
          });
          if (property === 'selection') {
            const stats = await getChannelStats({
              loader,
              loaderSelection: [{ ...channels[channelId][property], ...value }],
            });
            const { domain } = stats[0];
            dispatchDomain({ domain, type: 'CHANGE_SINGLE_CHANNEL_PROPERTY', channelId });
          }
        };
        const handleChannelRemove = () => {
          dispatch({ type: 'REMOVE_CHANNEL', layerId, payload: { channelId } });
        };
        return (
          <Grid
            key={`channel-controller-${channelId}`}
            item
            style={{ width: '100%' }}
          >
            <ChannelController
              dimName={dimName}
              visibility={c.visibility}
              selectionIndex={c.selection[dimName]}
              slider={c.slider}
              color={c.color}
              domain={c.domain}
              channelOptions={channelOptions}
              colormapOn={Boolean(colormap)}
              handlePropertyChange={handleChannelPropertyChange}
              handleChannelRemove={handleChannelRemove}
            />
          </Grid>
        );
      },
    );
  }

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
            channels={channels}
            dimensions={dimensions}
            opacity={opacity}
            colormap={colormap}
            domainType={domainType}
            // Only allow for global dimension controllers that
            // exist in the `dimensions` part of the loader.
            globalControlDimensions={
              dimensions.filter(
                dimension => GLOBAL_SLIDER_DIMENSION_FIELDS.includes(dimension.field),
              )
            }
            handleOpacityChange={handleOpacityChange}
            handleColormapChange={handleColormapChange}
            handleGlobalChannelsSelectionChange={
              handleGlobalChannelsSelectionChange
            }
            handleDomainChange={handleDomainChange}
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
