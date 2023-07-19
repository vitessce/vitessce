/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  makeStyles,
  Grid,
  Checkbox,
  Paper,
  Typography,
  Slider,
  MenuItem,
  Button,
  SvgIcon,
} from '@material-ui/core';
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@material-ui/icons';
import { PopperMenu } from '@vitessce/vit-s';
import { useControllerSectionStyles } from './styles.js';
import ChannelColorPickerMenu from './ChannelColorPickerMenu.js';


const useStyles = makeStyles(() => ({
  segmentationChannelMenuButton: {
    backgroundColor: 'transparent',
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
  popperContainer: {
    display: 'flex',
    marginTop: '5px',
    justifyContent: 'space-around',
  },
}));

function VectorIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 700 700">
      <path d="m105 35h350v52.5h35v-70c0-4.6406-1.8438-9.0938-5.125-12.375s-7.7344-5.125-12.375-5.125h-385c-4.6406 0-9.0938 1.8438-12.375 5.125s-5.125 7.7344-5.125 12.375v385c0 4.6406 1.8438 9.0938 5.125 12.375s7.7344 5.125 12.375 5.125h70v-35h-52.5z" />
      <path d="m420 140c-55.695 0-109.11 22.125-148.49 61.508-39.383 39.383-61.508 92.797-61.508 148.49s22.125 109.11 61.508 148.49c39.383 39.383 92.797 61.508 148.49 61.508s109.11-22.125 148.49-61.508c39.383-39.383 61.508-92.797 61.508-148.49s-22.125-109.11-61.508-148.49c-39.383-39.383-92.797-61.508-148.49-61.508zm0 385c-46.414 0-90.926-18.438-123.74-51.258-32.82-32.816-51.258-77.328-51.258-123.74s18.438-90.926 51.258-123.74c32.816-32.82 77.328-51.258 123.74-51.258s90.926 18.438 123.74 51.258c32.82 32.816 51.258 77.328 51.258 123.74 0 30.719-8.0859 60.898-23.445 87.5-15.359 26.602-37.453 48.695-64.055 64.055-26.602 15.359-56.781 23.445-87.5 23.445z" />
    </SvgIcon>
  );
}


function EllipsisMenu(props) {
  const {
    strokeWidth,
    setStrokeWidth,
    filled,
    setFilled,
    obsColorEncoding,
    setObsColorEncoding,
    featureValueColormapRange,
    setFeatureValueColormapRange,
  } = props;
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<MoreVertIcon />}
      buttonClassName={classes.segmentationChannelMenuButton}
      containerClassName={classes.popperContainer}
      withPaper
    >
      <MenuItem dense disableGutters>
        <span style={{ margin: '0 5px' }}>Filled: </span>
        <Checkbox
          color="primary"
          checked={filled}
          onChange={(e, v) => setFilled(v)}
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <span style={{ margin: '0 5px' }}>Stroke width: </span>
        <Slider
          disabled={filled}
          value={strokeWidth}
          min={0.5}
          max={5.0}
          step={0.1}
          onChange={(e, v) => setStrokeWidth(v)}
          style={{ marginTop: '7px', width: '100px' }}
          orientation="horizontal"
        />
      </MenuItem>
      <MenuItem dense disableGutters>
        <span style={{ margin: '0 5px' }}>Quantitative Colormap: </span>
        <Checkbox color="primary" checked={obsColorEncoding === 'geneSelection'} onChange={(e, v) => setObsColorEncoding(v ? 'geneSelection' : 'spatialChannelColor')} />
      </MenuItem>
      <MenuItem dense disableGutters>
        <span style={{ margin: '0 5px' }}>Colormap Range: </span>
        <Slider
          disabled={obsColorEncoding !== 'geneSelection'}
          value={featureValueColormapRange}
          min={0.0}
          max={1.0}
          step={0.01}
          onChange={(e, v) => setFeatureValueColormapRange(v)}
          style={{ marginTop: '7px', width: '100px' }}
          orientation="horizontal"
        />
      </MenuItem>
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
    strokeWidth,
    setStrokeWidth,

    obsColorEncoding,
    featureValueColormap,
    featureValueColormapRange,
    setObsColorEncoding,
    setFeatureValueColormap,
    setFeatureValueColormapRange,
  } = props;

  const visibleSetting = typeof visible === 'boolean' ? visible : true;
  const Visibility = visibleSetting ? VisibilityIcon : VisibilityOffIcon;

  const isStaticColor = obsColorEncoding === 'spatialChannelColor';

  const classes = useControllerSectionStyles();
  return (
    <Grid item style={{ marginTop: '10px' }}>
      <Paper className={classes.layerControllerRoot}>
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
          <Grid item xs={1}>
            <ChannelColorPickerMenu
              color={color}
              setColor={setColor}
              palette={palette}
              isStaticColor={isStaticColor}
              visible={visible}
            />
          </Grid>
          <Grid item xs={6}>
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
          <Grid item xs={2}>
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
            <EllipsisMenu
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              filled={filled}
              setFilled={setFilled}
              obsColorEncoding={obsColorEncoding}
              setObsColorEncoding={setObsColorEncoding}
              featureValueColormapRange={featureValueColormapRange}
              setFeatureValueColormapRange={setFeatureValueColormapRange}
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
