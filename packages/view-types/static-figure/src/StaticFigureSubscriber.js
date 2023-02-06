import React, { useState } from 'react';
import {
  TitleInfo, useCoordination, useGridItemSize, registerPluginViewType,
} from '@vitessce/vit-s';
import { ViewType, COMPONENT_COORDINATION_TYPES } from '@vitessce/constants-internal';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import clsx from 'clsx';

const CAPTION_HEIGHT = 40;

const useStyles = makeStyles(() => ({
  container: {
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
  },
  button: {
    position: 'absolute',
    bottom: 0,
  },
  buttonLeft: {
    left: 0,
  },
  buttonRight: {
    right: 0,
  },
  caption: {
    height: `${CAPTION_HEIGHT}px`,
  },
}));

export function StaticFigure(props) {
  const {
    // TODO: get these from datasets[].files[] to enable {{ base_url }} placeholder support and downloading.
    imgSrc,
    imgAlt,
  } = props;

  const [index, setIndex] = useState(0);
  const [width, height, containerRef] = useGridItemSize();

  const isMulti = Array.isArray(imgSrc);

  function handleLeft() {
    setIndex(prev => Math.max(0, prev - 1));
  }
  function handleRight() {
    setIndex(prev => Math.min(isMulti ? imgSrc.length - 1 : 0, prev + 1));
  }

  const classes = useStyles();

  return (
    <div ref={containerRef} className={classes.container}>
      <Grid container spacing={1} direction="column" justifyContent="center" alignItems="center">
        <Grid item xs={12}>
          {isMulti && (!imgAlt || Array.isArray(imgAlt)) ? (
            <img src={imgSrc[index]} alt={imgAlt?.[index] || ''} title={imgAlt?.[index] || ''} className={classes.image} style={{ maxHeight: height - CAPTION_HEIGHT }} />
          ) : (
            <img src={imgSrc} alt={imgAlt} title={imgAlt} className={classes.image} style={{ maxHeight: height - CAPTION_HEIGHT }} />
          )}
        </Grid>
        <Grid item xs={12}>
          <p className={classes.caption}>
            {isMulti && (!imgAlt || Array.isArray(imgAlt)) ? (
              imgAlt?.[index] || ''
            ) : (
              imgAlt
            )}
          </p>
        </Grid>
      </Grid>
      {isMulti && index !== 0 ? (
        <IconButton className={clsx(classes.button, classes.buttonLeft)} onClick={handleLeft}><ChevronLeft /></IconButton>
      ) : null}
      {isMulti && index !== (imgSrc.length - 1) ? (
        <IconButton className={clsx(classes.button, classes.buttonRight)} onClick={handleRight}><ChevronRight /></IconButton>
      ) : null}
    </div>
  );
}

/**
 * A subscriber component for the status component,
 * which renders hovered cell/gene/molecule information
 * as well as schema validation and data loading errors.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export function StaticFigureSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Figure',
    imgSrc,
    imgAlt,
  } = props;

  // Get "props" from the coordination space.
  const [{
    dataset,
  }] = useCoordination(COMPONENT_COORDINATION_TYPES[ViewType.STATIC_FIGURE], coordinationScopes);

  return (
    <TitleInfo
      title={title}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady
    >
      <StaticFigure imgSrc={imgSrc} imgAlt={imgAlt} />
    </TitleInfo>
  );
}

export function register() {
  registerPluginViewType(
    ViewType.STATIC_FIGURE,
    StaticFigureSubscriber,
    COMPONENT_COORDINATION_TYPES[ViewType.STATIC_FIGURE],
  );
}
