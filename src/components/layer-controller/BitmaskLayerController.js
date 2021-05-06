import React, { useState } from 'react';
import { MAX_SLIDERS_AND_CHANNELS } from '@hms-dbmi/viv';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import Slider from '@material-ui/core/Slider';
import InputLabel from '@material-ui/core/InputLabel';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import BitmaskChannelController from './BitmaskChannelController';

import {
  useExpansionPanelStyles,
  useExpansionPanelSummaryStyles,
  useSmallInputLabelStyles,
} from './styles';
import { GLOBAL_LABELS } from '../spatial/constants';

const buttonStyles = { borderStyle: 'dashed', marginTop: '10px', fontWeight: 400 };


const OpacitySlider = ({
  styleClasses, name, opacity, setOpacity,
}) => (
  <Grid
    container
    direction="row"
    alignItems="center"
    justify="center"
  >
    <Grid item xs={6}>
      <InputLabel
        htmlFor={`layer-${name}-opacity-closed`}
        classes={styleClasses}
      >
        Opacity:
      </InputLabel>
    </Grid>
    <Grid item xs={6}>
      <Slider
        id={`layer-${name}-opacity-closed`}
        value={opacity}
        onChange={(e, v) => setOpacity(v)}
        valueLabelDisplay="auto"
        getAriaLabel={() => 'opacity slider'}
        min={0}
        max={1}
        step={0.01}
        orientation="horizontal"
      />
    </Grid>
  </Grid>
);

/**
 * Controller for the various imaging options (color, opactiy, sliders etc.)
 * @prop {object} imageData Image config object, one of the `images` in the raster schema.
 * @prop {object} layerId Randomly generated id for the image layer that this controller handles.
 * @prop {function} handleLayerRemove Callback for handling the removal of a layer.
 * @prop {object} loader Loader object for the current imaging layer.
 * @prop {function} handleLayerChange Callback for handling the changing of layer properties.
 */
export default function BitmaskLayerController(props) {
  const {
    layer, name, loader, theme,
    handleLayerRemove, handleLayerChange,
  } = props;

  const {
    colormap,
    opacity,
    channels,
  } = layer;
  const firstSelection = channels[0]?.selection || {};

  const { data, channels: channelOptions } = loader;
  const { labels } = Array.isArray(data) ? data[data.length - 1] : data;
  const [isExpanded, setIsExpanded] = useState(true);
  const [globalLabelValues, setGlobalLabelValues] = useState(
    GLOBAL_LABELS
      .filter(field => typeof firstSelection[field] === 'number')
      .reduce((o, key) => ({ ...o, [key]: firstSelection[key] }), {}),
  );

  function setChannels(v) {
    handleLayerChange({ ...layer, channels: v });
  }

  function setOpacity(v) {
    handleLayerChange({ ...layer, opacity: v });
  }

  function setChannel(v, i) {
    const newChannels = [...channels];
    newChannels[i] = v;
    handleLayerChange({ ...layer, channels: newChannels });
  }

  function addChannel(v) {
    const newChannels = [...channels, v];
    handleLayerChange({ ...layer, channels: newChannels });
  }

  function removeChannel(i) {
    const newChannels = [...channels];
    newChannels.splice(i, 1);
    handleLayerChange({ ...layer, channels: newChannels });
  }

  // Handles adding a channel, creating a default selection
  // for the current global settings and domain type.
  const handleChannelAdd = () => {
    const selection = {};
    labels.forEach((label) => {
      // Set new image to default selection for non-global selections (0)
      // and use current global selection otherwise.
      selection[label] = GLOBAL_LABELS.includes(label)
        ? (globalLabelValues[label] || 0)
        : 0;
    });
    const visible = true;
    addChannel({
      selection, visible, color: [0, 0, 0], slider: [0, 0],
    });
  };

  // This call updates all channel selections with new global selection from the UI.
  // eslint-disable-next-line no-unused-vars
  const handleGlobalChannelsSelectionChange = ({ selection, event }) => {
    const mouseUp = event.type === 'mouseup';
    if (mouseUp) {
      const newChannels = channels.map(c => ({
        ...c,
        selection: { ...c.selection, ...selection },
      }));
      setChannels(newChannels);
    }
    setGlobalLabelValues(prev => ({ ...prev, ...selection }));
  };

  let channelControllers = [];
  if (labels.length > 0) {
    const channelLabel = labels.find(c => c === 'channel' || c === 'c') || labels[0];
    // Create the channel controllers for each channel.
    channelControllers = channels.map(
      // c is an object like { color, selection, slider, visible }.
      (c, channelId) => {
        // Change one property of a channel (for now - soon
        // nested structures allowing for multiple z/t selecitons at once, for example).
        const handleChannelPropertyChange = async (property, value) => {
          // property is something like "selection" or "slider."
          // value is the actual change, like { channel: "DAPI" }.
          const update = { [property]: value };
          setChannel({ ...c, ...update }, channelId);
        };
        const handleChannelRemove = () => {
          removeChannel(channelId);
        };
        return (
          <Grid
            // eslint-disable-next-line react/no-array-index-key
            key={`channel-controller-${channelId}`}
            item
            style={{ width: '100%' }}
          >
            <BitmaskChannelController
              dimName={channelLabel}
              visibility={c.visible}
              selectionIndex={c.selection[channelLabel]}
              slider={c.slider}
              color={c.color}
              channels={channels}
              channelId={channelId}
              loader={loader}
              globalLabelValues={globalLabelValues}
              theme={theme}
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
  const summaryClasses = useExpansionPanelSummaryStyles();
  const closedOpacityLabelClasses = useSmallInputLabelStyles();

  return (
    <ExpansionPanel
      className={classes.root}
      onChange={(e, expanded) => setIsExpanded(
        expanded && e?.target?.attributes?.role?.value === 'presentation',
      )
      }
      TransitionProps={{ enter: false }}
      expanded={isExpanded}
    >
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`layer-${name}-controls`}
        classes={{ ...summaryClasses }}
      >
        <Grid container direction="column" m={1} justify="center">
          <Grid item>{name}</Grid>
          {!isExpanded
            && (
            <OpacitySlider
              styleClasses={closedOpacityLabelClasses}
              name={name}
              opacity={opacity}
              setOpacity={setOpacity}
            />
            )
          }
        </Grid>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.root}>
        {<OpacitySlider name={name} opacity={opacity} setOpacity={setOpacity} />}
        {channelControllers}
        <Grid item>
          <Button
            disabled={channels.length === MAX_SLIDERS_AND_CHANNELS}
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
