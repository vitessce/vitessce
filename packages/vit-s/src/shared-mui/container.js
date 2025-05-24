/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { makeStyles, ScopedGlobalStyles } from '@vitessce/styles';

export const useVitessceContainerStyles = makeStyles()(theme => ({
  vitessceContainer: {
    position: 'relative',
    margin: '0',
    textAlign: 'left',
    backgroundColor: theme.palette.gridLayoutBackground,
    '& div': {
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
      textAlign: 'left',
    },
    '& p': {
      marginTop: '0',
      marginBottom: '16px',
    },
    '& *, ::after, ::before': {
      boxSizing: 'border-box',
    },
  },
}));

const gridLayoutStyles = {
  // Manually converted styles from 'react-grid-layout/css/styles.css',
  // using https://cssinjs.org/jss-plugin-global/?v=v10.9.2
  // so that no CSS or SCSS import is required.
  '.react-grid-layout': {
    transition: 'height 200ms ease',
    // Custom
    height: 'auto',
    position: 'absolute',
    width: '100%',
  },
  '.react-grid-item': {
    transition: 'all 200ms ease',
    transitionProperty: 'left, top',
    // Custom
    flexDirection: 'column!important',
    display: 'flex!important',
    /* So the resize handle position looks correct: */
    paddingRight: '10px',
  },
  '.react-grid-item img': {
    pointerEvents: 'none',
    userSelect: 'none',
  },
  '.react-grid-item.cssTransforms': {
    transitionProperty: 'transform',
  },
  '.react-grid-item.resizing': {
    zIndex: '1',
    willChange: 'width, height',
  },
  '.react-grid-item.react-draggable-dragging': {
    transition: 'none',
    zIndex: '3',
    willChange: 'transform',
  },
  '.react-grid-item.dropping': {
    visibility: 'hidden',
  },
  '.react-grid-item.react-grid-placeholder': {
    background: 'red',
    opacity: '0.2',
    transitionDuration: '100ms',
    zIndex: '2',
    userSelect: 'none',
  },
  '.react-grid-item > .react-resizable-handle': {
    position: 'absolute',
    width: '20px',
    height: '20px',
  },
  '.react-grid-item > .react-resizable-handle::after': {
    content: '""',
    position: 'absolute',
    right: '3px',
    bottom: '3px',
    width: '5px',
    height: '5px',
    borderRight: '2px solid rgba(0, 0, 0, 0.4)',
    borderBottom: '2px solid rgba(0, 0, 0, 0.4)',
  },
  '.react-resizable-hide > .react-resizable-handle': {
    display: 'none',
  },
  '.react-grid-item > .react-resizable-handle.react-resizable-handle-sw': {
    bottom: '0',
    left: '0',
    cursor: 'sw-resize',
    transform: 'rotate(90deg)',
  },
  '.react-grid-item > .react-resizable-handle.react-resizable-handle-se': {
    bottom: '0',
    right: '0',
    cursor: 'se-resize',
  },
  '.react-grid-item > .react-resizable-handle.react-resizable-handle-nw': {
    top: '0',
    left: '0',
    cursor: 'nw-resize',
    transform: 'rotate(180deg)',
  },
  '.react-grid-item > .react-resizable-handle.react-resizable-handle-ne': {
    top: '0',
    right: '0',
    cursor: 'ne-resize',
    transform: 'rotate(270deg)',
  },
  '.react-grid-item > .react-resizable-handle.react-resizable-handle-w': {
    top: '50%',
    marginTop: '-10px',
    cursor: 'ew-resize',
    left: '0',
    transform: 'rotate(135deg)',
  },
  '.react-grid-item > .react-resizable-handle.react-resizable-handle-e': {
    top: '50%',
    marginTop: '-10px',
    cursor: 'ew-resize',
    right: '0',
    transform: 'rotate(315deg)',
  },
  '.react-grid-item > .react-resizable-handle.react-resizable-handle-n': {
    left: '50%',
    marginLeft: '-10px',
    cursor: 'ns-resize',
    top: '0',
    transform: 'rotate(225deg)',
  },
  '.react-grid-item > .react-resizable-handle.react-resizable-handle-s': {
    left: '50%',
    marginLeft: '-10px',
    cursor: 'ns-resize',
    bottom: '0',
    transform: 'rotate(45deg)',
  },
  // Manually converted styles from 'react-resizable/css/styles.css',
  '.react-resizable': {
    position: 'relative',
  },
  '.react-resizable-handle': {
    position: 'absolute',
    width: '20px',
    height: '20px',
    backgroundRepeat: 'no-repeat',
    backgroundOrigin: 'content-box',
    boxSizing: 'border-box',
    backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+')",
    backgroundPosition: 'bottom right',
    padding: '0 3px 3px 0',
  },
  '.react-resizable-handle-sw': {
    bottom: '0',
    left: '0',
    cursor: 'sw-resize',
    transform: 'rotate(90deg)',
  },
  '.react-resizable-handle-se': {
    bottom: '0',
    right: '0',
    cursor: 'se-resize',
  },
  '.react-resizable-handle-nw': {
    top: '0',
    left: '0',
    cursor: 'nw-resize',
    transform: 'rotate(180deg)',
  },
  '.react-resizable-handle-ne': {
    top: '0',
    right: '0',
    cursor: 'ne-resize',
    transform: 'rotate(270deg)',
  },
  '.react-resizable-handle-w': {
    top: '50%',
    marginTop: '-10px',
    cursor: 'ew-resize',
    left: '0',
    transform: 'rotate(135deg)',
  },
  '.react-resizable-handle-e': {
    top: '50%',
    marginTop: '-10px',
    cursor: 'ew-resize',
    right: '0',
    transform: 'rotate(315deg)',
  },
  '.react-resizable-handle-n': {
    left: '50%',
    marginLeft: '-10px',
    cursor: 'ns-resize',
    top: '0',
    transform: 'rotate(225deg)',
  },
  '.react-resizable-handle-s': {
    left: '50%',
    marginLeft: '-10px',
    cursor: 'ns-resize',
    bottom: '0',
    transform: 'rotate(45deg)',
  },
  // Custom
  '.react-draggable-transparent-selection .react-grid-item': {
    /* These styles prevent text selection during resize drag interactions.
      The react-draggable-transparent-selection class is added to the body
      element during resizing and removed after resizing has finished.
      Not part of mixin because acts outside of .vitessce-container. */
    userSelect: 'none !important',
  },
};

export function GridLayoutGlobalStyles(props) {
  const { classes } = props;

  return (
    <ScopedGlobalStyles
      parentClassName={classes.vitessceContainer}
      styles={gridLayoutStyles}
    />
  );
}
