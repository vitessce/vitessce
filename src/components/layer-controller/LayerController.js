import React, {
  useState, useReducer, useEffect,
} from 'react';
import { getChannelStats, DTYPE_VALUES, MAX_SLIDERS_AND_CHANNELS } from '@hubmap/vitessce-image-viewer';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ChannelController from './ChannelController';
import LayerOptions from './LayerOptions';

import reducer from './reducer';
import { useExpansionPanelStyles } from './styles';
import {
  GLOBAL_SLIDER_DIMENSION_FIELDS, DEFAULT_LAYER_PROPS,
} from './constants';

// Return the midpoint of the global dimensions.
function getDefaultGlobalSelection(imageDims) {
  const globalIndices = imageDims.filter(dim => GLOBAL_SLIDER_DIMENSION_FIELDS.includes(dim.field));
  const selection = {};
  globalIndices.forEach((dim) => {
    selection[dim.field] = Math.floor((dim.values.length || 0) / 2);
  });
  return selection;
}

// Create a default selection using the midpoint of the available global dimensions,
// and then the first four available selections from the first selectable channel.
function buildDefaultSelection(imageDims) {
  const selection = [];
  const globalSelection = getDefaultGlobalSelection(imageDims);
  // First non-global dimension with some sort of selectable values
  const firstNonGlobalDimension = imageDims.filter(
    dim => !GLOBAL_SLIDER_DIMENSION_FIELDS.includes(dim.field) && dim.values,
  )[0];
  for (let i = 0; i < Math.min(4, firstNonGlobalDimension.values.length); i += 1) {
    selection.push(
      {
        [firstNonGlobalDimension.field]: i,
        ...globalSelection,
      },
    );
  }
  return selection;
}

// Set the domain of the sliders based on either a full range or min/max.
async function getDomain(loader, loaderSelection, domainType) {
  let domain;
  if (domainType === 'Min/Max') {
    const stats = await getChannelStats({ loader, loaderSelection });
    domain = stats.map(stat => stat.domain);
  } if (domainType === 'Full') {
    domain = loaderSelection.map(() => [0, DTYPE_VALUES[loader.dtype].max]);
  }
  return domain;
}

const buttonStyles = { borderStyle: 'dashed', marginTop: '10px', fontWeight: 400 };

/**
 * Controller for the various imaging options (color, opactiy, sliders etc.)
 * @prop {object} imageData Image config object, one of the `images` in the raster schema.
 * @prop {object} layerId Randomly generated id for the image layer that this controller handles.
 * @prop {function} handleLayerRemove Callback for handling the removal of a layer.
 * @prop {object} loader Loader object for the current imaging layer.
 * @prop {function} handleLayerChange Callback for handling the changing of layer properties.
 */
export default function LayerController({
  imageData, layerId, handleLayerRemove, loader, theme, handleLayerChange,
}) {
  const [colormap, setColormap] = useState(DEFAULT_LAYER_PROPS.colormap);
  const [opacity, setOpacity] = useState(DEFAULT_LAYER_PROPS.opacity);
  const [channels, dispatch] = useReducer(reducer, {});
  const [dimensions, setDimensions] = useState([]);
  const [domainType, setDomainType] = useState('Min/Max');


  useEffect(() => {
    const loaderDimensions = loader.dimensions;
    setDimensions(loaderDimensions);
    // Add channel on image add automatically as the first avaialable value for each dimension.
    const defaultSelection = buildDefaultSelection(loaderDimensions);
    // Get stats because initial value is Min/Max for domainType.
    getChannelStats({ loader, loaderSelection: defaultSelection }).then((stats) => {
      const domains = stats.map(stat => stat.domain);
      dispatch({
        type: 'ADD_CHANNELS',
        layerId,
        handleLayerChange,
        payload: {
          selections: defaultSelection,
          domains,
        },
      });
    });
  }, [layerId, imageData, loader, handleLayerChange]);

  // Handles adding a channel, creating a default selection
  // for the current global settings and domain type.
  const handleChannelAdd = async () => {
    const selection = {};
    dimensions.forEach((dimension) => {
      // Set new image to default selection for non-global selections (0)
      // and use current global selection otherwise.
      selection[dimension.field] = GLOBAL_SLIDER_DIMENSION_FIELDS.includes(dimension.field)
        ? Object.values(channels)[0].selection[dimension.field]
        : 0;
    });
    const [domain] = await getDomain(loader, [selection], domainType);
    dispatch({
      type: 'ADD_CHANNEL',
      layerId,
      handleLayerChange,
      payload: {
        selection,
        domain,
      },
    });
  };

  const handleOpacityChange = (sliderValue) => {
    setOpacity(sliderValue);
    handleLayerChange({ layerId, layerProps: { opacity: sliderValue } });
  };

  const handleColormapChange = (colormapName) => {
    setColormap(colormapName);
    handleLayerChange({ layerId, layerProps: { colormap: colormapName } });
  };

  const handleDomainChange = async (value) => {
    setDomainType(value);
    const loaderSelection = Object.values(channels).map(
      channel => channel.selection,
    );
    const domain = await getDomain(
      loader,
      loaderSelection,
      value,
    );
    const update = { domain, slider: domain };
    dispatch({
      type: 'CHANGE_GLOBAL_CHANNELS_PROPERTIES',
      layerId,
      handleLayerChange,
      payload: {
        update,
        publish: true,
      },
    });
  };

  // This call updates all channel selections with new global selection from the UI.
  const handleGlobalChannelsSelectionChange = async ({ selection, event }) => {
    const loaderSelection = Object.values(channels).map(channel => ({
      ...channel.selection,
      selection,
    }));
    // See https://github.com/hubmapconsortium/vitessce-image-viewer/issues/176 for why
    // we have to check mouseup.
    const mouseUp = event.type === 'mouseup';
    const update = { selection };
    // Only update domains on a mouseup event for the same reason as above.
    const domain = mouseUp
      ? await getDomain(loader, loaderSelection, domainType)
      : null;
    if (domain) {
      update.domain = domain;
      update.slider = domain;
    }
    dispatch({
      type: 'CHANGE_GLOBAL_CHANNELS_PROPERTIES',
      layerId,
      payload: {
        update,
        publish: mouseUp,
      },
    });
  };

  let channelControllers = [];
  if (dimensions.length > 0) {
    const { values: channelOptions, field: dimName } = dimensions[0];
    // Create the channel controllers for each channel.
    channelControllers = Object.entries(channels).map(
      // c is an object like { color, selection, slider, visibility }.
      ([channelId, c]) => {
        // Change one property of a channel (for now - soon
        // nested structures allowing for multiple z/t selecitons at once, for example).
        const handleChannelPropertyChange = async (property, value) => {
          // property is something like "selection" or "slider."
          // value is the actual change, like { channel: "DAPI" }.
          const update = { [property]: value };
          if (property === 'selection') {
            const loaderSelection = [{ ...channels[channelId][property], ...value }];
            const domain = await getDomain(loader, loaderSelection, domainType);
            [update.domain] = domain;
            [update.slider] = domain;
          }
          dispatch({
            type: 'CHANGE_SINGLE_CHANNEL_PROPERTIES',
            layerId,
            handleLayerChange,
            payload: {
              channelId,
              update,
            },
          });
        };
        const handleChannelRemove = () => {
          dispatch({
            type: 'REMOVE_CHANNEL',
            layerId,
            handleLayerChange,
            payload: { channelId },
          });
        };
        const handleIQRUpdate = async () => {
          const stats = await getChannelStats(
            { loader, loaderSelection: [channels[channelId].selection] },
          );
          const { q1, q3 } = stats[0];
          dispatch({
            type: 'CHANGE_SINGLE_CHANNEL_PROPERTIES',
            layerId,
            handleLayerChange,
            payload: {
              channelId,
              update: { slider: [q1, q3] },
            },
          });
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
              theme={theme}
              channelOptions={channelOptions}
              colormapOn={Boolean(colormap)}
              handlePropertyChange={handleChannelPropertyChange}
              handleChannelRemove={handleChannelRemove}
              handleIQRUpdate={handleIQRUpdate}
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
        style={{
          paddingLeft: '10px', paddingRight: '10px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
        }}
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
            disabled={Object.values(channels).length === MAX_SLIDERS_AND_CHANNELS}
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
