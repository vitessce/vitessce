import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Grid from '@material-ui/core/Grid';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { PopperMenu } from '@vitessce/vit-s';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import Button from '@material-ui/core/Button';
import ColorLens from '@material-ui/icons/ColorLens';
import ImageIcon from '@material-ui/icons/Image';
import SvgIcon from '@material-ui/core/SvgIcon';

import { TwitterPicker } from 'react-color-with-lodash';
import { colorArrayToString } from '@vitessce/sets-utils';
import { PATHOLOGY_PALETTE, LARGE_PATHOLOGY_PALETTE } from '@vitessce/utils';

import { useControllerSectionStyles } from './styles';

const useStyles = makeStyles(() => ({
  menuButton: {
    backgroundColor: 'transparent',
  },
  colors: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
    paddingLeft: '2px',
    paddingRight: '2px',
  },
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
}));

function VectorIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 700 700">
      <path d="m105 35h350v52.5h35v-70c0-4.6406-1.8438-9.0938-5.125-12.375s-7.7344-5.125-12.375-5.125h-385c-4.6406 0-9.0938 1.8438-12.375 5.125s-5.125 7.7344-5.125 12.375v385c0 4.6406 1.8438 9.0938 5.125 12.375s7.7344 5.125 12.375 5.125h70v-35h-52.5z"/>
      <path d="m420 140c-55.695 0-109.11 22.125-148.49 61.508-39.383 39.383-61.508 92.797-61.508 148.49s22.125 109.11 61.508 148.49c39.383 39.383 92.797 61.508 148.49 61.508s109.11-22.125 148.49-61.508c39.383-39.383 61.508-92.797 61.508-148.49s-22.125-109.11-61.508-148.49c-39.383-39.383-92.797-61.508-148.49-61.508zm0 385c-46.414 0-90.926-18.438-123.74-51.258-32.82-32.816-51.258-77.328-51.258-123.74s18.438-90.926 51.258-123.74c32.816-32.82 77.328-51.258 123.74-51.258s90.926 18.438 123.74 51.258c32.82 32.816 51.258 77.328 51.258 123.74 0 30.719-8.0859 60.898-23.445 87.5-15.359 26.602-37.453 48.695-64.055 64.055-26.602 15.359-56.781 23.445-87.5 23.445z"/>
    </SvgIcon>
  );
}

/**
 * Dropdown for options for a channel on the three dots button.
 * @prop {function} handlePropertyChange Callback for changing property (color, IQR of sliders).
 * @prop {function} handleChannelRemove Callback for channel removal.
 * @prop {function} handleIQRUpdate Callback for IQR slider update.
 */
function ColorPickerMenu(props) {
  const {
    color,
    setColor,
    palette = null,
  } = props;

  const defaultPalette = palette
    ? palette.map(colorArrayToString)
    : LARGE_PATHOLOGY_PALETTE.map(colorArrayToString);

  const [open, setOpen] = useState(false);

  function handleColorChange({ rgb }) {
    if (rgb && setColor) {
      setColor([rgb.r, rgb.g, rgb.b]);
    }
  }

  const classes = useStyles();

  const currentColor = colorArrayToString(color);

  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={
        <div className={classes.colorIcon} style={{ backgroundColor: currentColor }} />
      }
      buttonClassName={classes.menuButton}
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

export default function SplitVectorLayerController(props) {
  const {
    label,
    opacity,
    setOpacity,
    visible,
    setVisible,
    color,
    setColor,
    palette = null,
    filled,
    setFilled,
  } = props;

  const visibleSetting = typeof visible === 'boolean' ? visible : true;
  const Visibility = visibleSetting ? VisibilityIcon : VisibilityOffIcon;


  const classes = useControllerSectionStyles();
  return (
    <Grid item style={{ marginTop: '10px' }}>
      <Paper className={classes.root}>
        <Grid container direction="row" justifyContent="space-between">
          <Grid item xs={1}>
            <Button
              onClick={(e) => {
                // Needed to prevent affecting the expansion panel from changing
                e.stopPropagation();
                const nextVisible = typeof visible === 'boolean' ? !visible : false;
                setVisible(nextVisible);
              }}
              style={{
                marginRight: 8,
                marginBottom: 2,
                marginLeft: 8,
                marginTop: 8,
                padding: 0,
                minWidth: 0,
              }}
            >
              <Visibility />
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Typography
              style={{
                padding: 0,
                marginBottom: 0,
                marginLeft: '4px',
                marginTop: '10px',
              }}
            >
              {label}
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <ColorPickerMenu
              color={color}
              setColor={setColor}
              palette={palette}
            />
          </Grid>
          <Grid item xs={1}>
            <Checkbox color="primary" checked={filled} onChange={(e, v) => setFilled(v)} />
          </Grid>
          <Grid item xs={4} style={{ paddingRight: '8px' }}>
            <Slider
              value={opacity}
              min={0}
              max={1}
              step={0.001}
              onChange={(e, v) => setOpacity(v)}
              style={{ marginTop: '7px' }}
              orientation="horizontal"
            />
          </Grid>
          <Grid item xs={1}>
            <VectorIcon style={{ marginTop: '10px', marginLeft: '8px' }} />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}
