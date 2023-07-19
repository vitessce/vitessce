import React, { useState } from 'react';
import {
  makeStyles,
  Checkbox,
  Select,
} from '@material-ui/core';
import { toRgbUIString } from '@vitessce/spatial-utils';
import { useSelectStyles } from './styles.js';
import { PopperMenu } from '@vitessce/vit-s';
import { TwitterPicker } from 'react-color-with-lodash';
import { colorArrayToString } from '@vitessce/sets-utils';
import { PATHOLOGY_PALETTE } from '@vitessce/utils';


const useStyles = makeStyles(() => ({
  colorIcon: {
    width: '18px !important',
    height: '18px !important',
    cursor: 'pointer',
    position: 'relative',
    outline: 'none',
    float: 'left',
    borderRadius: '4px',
    margin: '8px',
  },
  colorPicker: {
    boxShadow: 'none !important',
    margin: '0 auto',
    /* Sets margins around color picker and centers */
    '& > div:nth-child(3)': {
      padding: '6px !important',
      transform: 'translate(2px, 0)',
    },
    '& > div > div:nth-of-type(1)': {
      fontSize: '12px',
      width: '20px !important',
    },
    '& input': {
      width: '60px !important',
      fontSize: '12px',
    },
    /* Sets smaller color squares */
    '& > div > span > div': {
      width: '18px !important',
      height: '18px !important',
    },
  },
  popperContainer: {
    display: 'flex',
    marginTop: '5px',
    justifyContent: 'space-around',
  },
  oneLineChannelSelect: {
    width: '90%',
    marginLeft: '5%',
    fontSize: '12px',
  },
}));

/**
 * Dropdown for selecting a channel.
 * @prop {function} handleChange Callback for each new selection.
 * @prop {array} channelOptions List of available selections, like ['DAPI', 'FITC', ...].
 * @prop {boolean} disabled Whether or not the component is disabled.
 * @prop {number} selectionIndex Current numeric index of a selection.
 */
export function ChannelSelectionDropdown({
  featureIndex,
  targetC,
  setTargetC,
  disabled,
}) {
  const classes = useStyles();
  const selectClasses = useSelectStyles();
  return (Array.isArray(featureIndex) ? (
    <Select
      classes={{ root: selectClasses.selectRoot }}
      className={classes.oneLineChannelSelect}
      native
      value={targetC === null ? '' : targetC}
      onChange={e => setTargetC(e.target.value === '' ? null : Number(e.target.value))}
    >
      {featureIndex.map((channelName, channelIndex) => (
        <option disabled={disabled} key={channelName} value={channelIndex}>
          {channelName}
        </option>
      ))}
    </Select>
  ) : null);
}

/**
 * Checkbox for toggling on/off of a channel.
 * @prop {string} color Current color for this channel.
 * @prop {boolean} checked Whether or not this channel is "on".
 * @prop {boolean} disabled Whether or not the component is disabled.
 * @prop {function} toggle Callback for toggling on/off.
 */
export function ChannelVisibilityCheckbox({
  color, setColor, visible, setVisible, disabled,
  theme, colormapOn,
}) {
  const rgbColor = toRgbUIString(colormapOn, color, theme);
  return (
    <Checkbox
      onChange={(e, v) => setVisible(v)}
      checked={visible}
      disabled={disabled}
      style={{ color: rgbColor, '&$checked': { color: rgbColor }, padding: '8px' }}
    />
  );
}


/**
 * Dropdown for options for a channel on the three dots button.
 * @prop {function} handlePropertyChange Callback for changing property (color, IQR of sliders).
 * @prop {function} handleChannelRemove Callback for channel removal.
 * @prop {function} handleIQRUpdate Callback for IQR slider update.
 */
export function ChannelColorPickerMenu(props) {
  const {
    color,
    setColor,
    palette = null,
    isStaticColor,
    colormapOn,
    visible,
  } = props;

  const defaultPalette = palette
    ? palette.map(colorArrayToString)
    : PATHOLOGY_PALETTE.map(colorArrayToString);

  const [open, setOpen] = useState(false);

  function handleColorChange({ rgb }) {
    if (rgb && setColor) {
      setColor([rgb.r, rgb.g, rgb.b]);
      // TODO: set obsColorEncoding when user changes color also
    }
  }

  const classes = useStyles();

  const currentColor = color
    ? colorArrayToString(color)
    : colorArrayToString([0, 0, 0]);

  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={
        (isStaticColor || !colormapOn) && visible ? (
          <div className={classes.colorIcon} style={{ backgroundColor: currentColor }} />
        ) : (
          // TODO: show quantitative colormap in color box when (visible && !isStaticColor)
          <div className={classes.colorIcon} />
        )
      }
      buttonClassName={classes.segmentationChannelMenuButton}
      withPaper={false}
    >
      <TwitterPicker
        className={classes.colorPicker}
        disableAlpha
        width={108}
        triangle="hide"
        colors={defaultPalette}
        color={currentColor}
        onChangeComplete={handleColorChange}
      />
    </PopperMenu>
  );
}
