import React from 'react';

import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import IconButton from '@material-ui/core/IconButton';

import Grid from '@material-ui/core/Grid';

import { ChannelSelectionDropdown, ChannelVisibilityCheckbox } from './sharedComponents';

/**
 * Controller for the handling the colormapping sliders.
 * @prop {boolean} visibility Whether or not this channel is "on"
 * @prop {array} slider Current slider range.
 * @prop {array} color Current color for this channel.
 * @prop {array} domain Current max/min for this channel.
 * @prop {string} dimName Name of the dimensions this slider controls (usually "channel").
 * @prop {boolean} colormapOn Whether or not the colormap (viridis, magma etc.) is on.
 * @prop {object} channelOptions All available options for this dimension (i.e channel names).
 * @prop {function} handlePropertyChange Callback for when a property (color, slider etc.) changes.
 * @prop {function} handleChannelRemove When a channel is removed, this is called.
 * @prop {function} handleIQRUpdate When the IQR button is clicked, this is called.
 * @prop {number} selectionIndex The current numeric index of the selection.
 * @prop {boolean} disableOptions Whether or not channel options are be disabled (default: false).
 */
function BitmaskChannelController({
  visibility = false,
  dimName,
  channelOptions,
  handlePropertyChange,
  handleChannelRemove,
  selectionIndex,
  disableOptions = false,
}) {
  /* A valid selection is defined by an object where the keys are
  *  the name of a dimension of the data, and the values are the
  *  index of the image along that particular dimension.
  *
  *  Since we currently only support making a selection along one
  *  addtional dimension (i.e. the dropdown just has channels or mz)
  *  we have a helper function to create the selection.
  *
  *  e.g { channel: 2 } // channel dimension, third channel
  */
  const createSelection = index => ({ [dimName]: index });
  return (
    <Grid container direction="column" m={1} justify="center">
      <Grid container direction="row" justify="space-between">
        <Grid item xs={2}>
          <ChannelVisibilityCheckbox
            color={[220, 220, 220]}
            checked={visibility}
            toggle={() => handlePropertyChange('visible', !visibility)}
          />
        </Grid>
        <Grid item xs={9}>
          <ChannelSelectionDropdown
            handleChange={v => handlePropertyChange('selection', createSelection(v))}
            selectionIndex={selectionIndex}
            disableOptions={disableOptions}
            channelOptions={channelOptions}
          />
        </Grid>
        <Grid item xs={1}>
          <IconButton onClick={handleChannelRemove}>
            <RemoveCircleIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default BitmaskChannelController;
