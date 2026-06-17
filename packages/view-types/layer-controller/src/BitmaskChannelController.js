import React from 'react';
import { RemoveCircle as RemoveCircleIcon, IconButton, Grid } from '@vitessce/styles';
import { ChannelSelectionDropdown, ChannelVisibilityCheckbox } from './shared-channel-controls.js';

/**
 * Controller for the handling the bitmask channels.
 * @prop {boolean} visibility Whether or not this channel is "on"
 * @prop {string} dimName Name of the dimensions this slider controls (usually "channel").
 * @prop {object} channelOptions All available options for this dimension (i.e channel names).
 * @prop {function} handlePropertyChange Callback for when a property (color, slider etc.) changes.
 * @prop {function} handleChannelRemove When a channel is removed, this is called.
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
    <Grid container direction="row" justifyContent="space-between">
      <Grid size={2}>
        <ChannelVisibilityCheckbox
          color={[220, 220, 220]}
          checked={visibility}
          toggle={() => handlePropertyChange('visible', !visibility)}
        />
      </Grid>
      <Grid size={9}>
        <ChannelSelectionDropdown
          handleChange={v => handlePropertyChange('selection', createSelection(v))}
          selectionIndex={selectionIndex}
          disableOptions={disableOptions}
          channelOptions={channelOptions}
        />
      </Grid>
      <Grid size={1}>
        <IconButton
          onClick={handleChannelRemove}
          style={{ padding: '6px 6px 6px 0px' }}
          aria-label="Remove channel"
        >
          <RemoveCircleIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default BitmaskChannelController;
