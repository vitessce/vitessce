import React, { useState } from 'react';
import { getChannelStats, DTYPE_VALUES, MAX_SLIDERS_AND_CHANNELS } from '@hms-dbmi/viv';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ChannelController from './ChannelController';
import LayerOptions from './LayerOptions';

import { useExpansionPanelStyles, useExpansionPanelSummaryStyles } from './styles';
import { GLOBAL_SLIDER_DIMENSION_FIELDS } from '../spatial/constants';


// Set the domain of the sliders based on either a full range or min/max.
async function getDomainsAndSliders(loader, loaderSelection, domainType) {
  let domains;
  const stats = await getChannelStats({ loader, loaderSelection });
  const sliders = stats.map(stat => stat.autoSliders);
  if (domainType === 'Min/Max') {
    domains = stats.map(stat => stat.domain);
  } if (domainType === 'Full') {
    domains = loaderSelection.map(() => [0, DTYPE_VALUES[loader.dtype].max]);
  }
  return { domains, sliders };
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
export default function RasterLayerController(props) {
  const {
    layer, name, loader, theme, rasterType,
    handleLayerRemove, handleLayerChange,
  } = props;

  const { colormap, opacity, channels } = layer;
  const firstSelection = channels[0]?.selection || {};

  const { dimensions } = loader;
  const [domainType, setDomainType] = useState(layer.domainType);
  const [globalDimensionValues, setGlobalDimensionValues] = useState(
    GLOBAL_SLIDER_DIMENSION_FIELDS
      .filter(field => typeof firstSelection[field] === 'number')
      .reduce((o, key) => ({ ...o, [key]: firstSelection[key] }), {}),
  );
  console.log(globalDimensionValues, firstSelection); // eslint-disable-line

  function setColormap(v) {
    handleLayerChange({ ...layer, colormap: v });
  }

  function setOpacity(v) {
    handleLayerChange({ ...layer, opacity: v });
  }

  function setChannels(v) {
    handleLayerChange({ ...layer, channels: v });
  }

  function setChannelsAndDomainType(newChannels, newDomainType) {
    handleLayerChange({
      ...layer,
      channels: newChannels,
      domainType: newDomainType,
    });
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
  const handleChannelAdd = async () => {
    const selection = {};
    dimensions.forEach((dimension) => {
      // Set new image to default selection for non-global selections (0)
      // and use current global selection otherwise.
      selection[dimension.field] = GLOBAL_SLIDER_DIMENSION_FIELDS.includes(dimension.field)
        ? (globalDimensionValues[dimension.field] || 0)
        : 0;
    });
    const { domains, sliders } = await getDomainsAndSliders(loader, [selection], domainType);
    const domain = domains[0];
    const slider = sliders[0] || domain;
    const color = [255, 255, 255];
    const visible = true;
    addChannel({
      selection, slider, visible, color,
    });
  };

  const handleDomainChange = async (value) => {
    setDomainType(value);
    const loaderSelection = channels.map(
      channel => channel.selection,
    );
    let sliders = channels.map(
      channel => channel.slider,
    );
    const { domains } = await getDomainsAndSliders(
      loader,
      loaderSelection,
      value,
    );

    // If it's the right-most slider, we take the minimum of that and the new value.
    // Otherwise, we use the maximum of the left-hand side and the new value.
    sliders = sliders.map(
      (slider, i) => {
        const [left, right] = slider;
        return [
          Math.max(left, domains[i][0]),
          Math.min(right, domains[i][1]),
        ];
      },
    );

    const newChannels = channels.map((c, i) => ({ ...c, slider: sliders[i] }));
    setChannelsAndDomainType(newChannels, value);
  };

  // This call updates all channel selections with new global selection from the UI.
  const handleGlobalChannelsSelectionChange = async ({ selection, event }) => {
    const loaderSelection = channels.map(channel => ({
      ...channel.selection,
      ...selection,
    }));
    const mouseUp = event.type === 'mouseup';
    // Only update domains on a mouseup event for the same reason as above.
    const { sliders } = mouseUp
      ? await getDomainsAndSliders(loader, loaderSelection, domainType)
      : { domains: [], sliders: [] };
    if (mouseUp) {
      const newChannels = channels.map((c, i) => ({
        ...c,
        slider: sliders[i],
        selection: { ...c.selection, ...selection },
      }));
      setChannels(newChannels);
    }
    setGlobalDimensionValues(prev => ({ ...prev, ...selection }));
  };

  let channelControllers = [];
  if (dimensions.length > 0) {
    const channelDimensions = rasterType === 'ome-tiff' || rasterType === 'ome-zarr' ? dimensions.find(c => c.field === 'channel') : dimensions[0];
    const { values: channelOptions, field: dimName } = channelDimensions;
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
          if (property === 'selection') {
            update.selection = { ...globalDimensionValues, ...update.selection };
            const loaderSelection = [
              { ...channels[channelId][property], ...value },
            ];
            const { sliders } = await getDomainsAndSliders(
              loader, loaderSelection, domainType,
            );
            [update.slider] = sliders;
          }
          setChannel({ ...c, ...update }, channelId);
        };
        const handleChannelRemove = () => {
          removeChannel(channelId);
        };
        const handleIQRUpdate = async () => {
          const stats = await getChannelStats(
            { loader, loaderSelection: [channels[channelId].selection] },
          );
          const { q1, q3 } = stats[0];
          setChannel({ ...c, slider: [q1, q3] }, channelId);
        };
        return (
          <Grid
            // eslint-disable-next-line react/no-array-index-key
            key={`channel-controller-${channelId}`}
            item
            style={{ width: '100%' }}
          >
            <ChannelController
              dimName={dimName}
              visibility={c.visible}
              selectionIndex={c.selection[dimName]}
              slider={c.slider}
              color={c.color}
              channels={channels}
              channelId={channelId}
              domainType={domainType}
              loader={loader}
              globalDimensionValues={globalDimensionValues}
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
  const summaryClasses = useExpansionPanelSummaryStyles();
  return (
    <ExpansionPanel defaultExpanded className={classes.root}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`layer-${name}-controls`}
        classes={{ ...summaryClasses }}
      >
        {name}
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
            globalDimensionValues={globalDimensionValues}
            handleOpacityChange={setOpacity}
            handleColormapChange={setColormap}
            handleGlobalChannelsSelectionChange={
              handleGlobalChannelsSelectionChange
            }
            isRgb={loader.isRgb}
            handleDomainChange={handleDomainChange}
          />
        </Grid>
        {!loader.isRgb ? channelControllers : null}
        {!loader.isRgb && (
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
        )}
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
