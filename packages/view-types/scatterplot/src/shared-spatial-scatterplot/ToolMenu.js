import React from 'react';
import clsx from 'clsx';
import { SELECTION_TYPE } from '@vitessce/gl';
import { PointerIconSVG, SelectRectangleIconSVG, SelectLassoIconSVG } from '@vitessce/icons';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  tool: {
    position: 'absolute',
    display: 'inline',
    zIndex: '1000',
    opacity: '.65',
    color: 'black',
    '&:hover': {
      opacity: '.90',
    },
  },
  iconButton: {
    // btn btn-outline-secondary mr-2 icon
    padding: '0',
    height: '2em',
    width: '2em',
    backgroundColor: 'white',

    display: 'inline-block',
    fontWeight: '400',
    textAlign: 'center',
    verticalAlign: 'middle',
    cursor: 'pointer',
    userSelect: 'none',
    border: '1px solid #6c757d',
    fontSize: '1rem',
    lineHeight: '1.5',
    borderRadius: '0.25rem',
    transition: 'color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    color: '#6c757d',

    marginRight: '0.5rem',

    '& > svg': {
      verticalAlign: 'middle',
    },
  },
  iconButtonActive: {
    // active
    color: '#fff',
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
    boxShadow: '0 0 0 0.2rem rgba(108, 117, 125, 0.5)',
  },
}));

export function IconButton(props) {
  const {
    alt, onClick, isActive, children,
  } = props;
  const classes = useStyles();
  return (
    <button
      className={clsx(classes.iconButton, { [classes.iconButtonActive]: isActive })}
      onClick={onClick}
      type="button"
      title={alt}
    >
      {children}
    </button>
  );
}

export default function ToolMenu(props) {
  const {
    setActiveTool,
    activeTool,
    visibleTools = { pan: true, selectRectangle: true, selectLasso: true },
  } = props;
  const classes = useStyles();
  return (
    <div className={classes.tool}>
      {visibleTools.pan && (
      <IconButton
        alt="pointer tool"
        onClick={() => setActiveTool(null)}
        isActive={activeTool === null}
      ><PointerIconSVG />
      </IconButton>
      )}
      {visibleTools.selectRectangle ? (
        <IconButton
          alt="select rectangle"
          onClick={() => setActiveTool(SELECTION_TYPE.RECTANGLE)}
          isActive={activeTool === SELECTION_TYPE.RECTANGLE}
        ><SelectRectangleIconSVG />
        </IconButton>
      ) : null}
      {visibleTools.selectLasso ? (
        <IconButton
          alt="select lasso"
          onClick={() => setActiveTool(SELECTION_TYPE.POLYGON)}
          isActive={activeTool === SELECTION_TYPE.POLYGON}
        ><SelectLassoIconSVG />
        </IconButton>
      ) : null}
    </div>
  );
}
