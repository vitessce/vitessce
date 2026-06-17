/* eslint-disable max-len */
/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { makeStyles, ScopedGlobalStyles } from '@vitessce/styles';

export const useStyles = makeStyles()(theme => ({
  higlassTitleWrapper: {
    height: 'calc(100% - 20px)',
    '& > div:nth-of-type(2)': {
      width: 'inherit',
      height: 'inherit',
      padding: '5px',
      backgroundColor: theme.palette.secondaryBackground, // map-get($theme-colors, "secondary-background");
    },
  },
  higlassLazyWrapper: {
    width: 'inherit',
    height: 'inherit',
  },
  higlassWrapperParent: {
    display: 'block',
    position: 'relative',
    boxSizing: 'border-box',
    fontSize: '12px',
    color: '#333',
    overflow: 'hidden',
  },
  higlassWrapper: {
    width: 'inherit',
    height: 'inherit',
    position: 'relative',
    display: 'block',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
}));

const higlassGlobalStyles = {
  '.higlass': {
    width: '100%',
    height: '100%',
  },
  '.higlass .react-grid-layout': {
    backgroundColor: 'transparent !important',
  },
  '.higlass nav': {
    display: 'flex',
  },
  '.higlass input': {
    fontSize: '12px',
  },
  '.higlass .btn': {
    color: '#999',
    fontSize: '12px',
  },
};

export function HiglassGlobalStyles(props) {
  const { classes } = props;
  return (
    <ScopedGlobalStyles
      parentClassName={classes.higlassWrapper}
      styles={higlassGlobalStyles}
    />
  );
}

/*
.vitessce-container .higlass-wrapper {
  // https://sass-lang.com/documentation/at-rules/import#nesting
  // https://sass-lang.com/documentation/at-rules/import#importing-css
  @import "../../node_modules/higlass/dist/hglib";
}
*/
