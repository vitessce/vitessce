import React from 'react';
import clsx from 'clsx';
import { SELECTION_TYPE } from '@vitessce/gl';
import { PointerIconSVG, SelectLassoIconSVG } from '@vitessce/icons';
import { makeStyles } from '@material-ui/core';
import { CenterFocusStrong } from '@material-ui/icons';

const useStyles = makeStyles(() => ({
  toolButton: {
    display: 'inline-flex',
    '&:active': {
      opacity: '.65',
      extend: 'iconClicked',
    },
  },
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
  iconClicked: {
    // Styles for the clicked state
    boxShadow: 'none',
    transform: 'scale(0.98)', // make the button slightly smaller
  },
  toolIcon: {
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
    fontSize: '16px',
    lineHeight: '1.5',
    borderRadius: '4px',
    transition: 'color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    color: '#6c757d',

    marginRight: '8px',

    '& > svg': {
      verticalAlign: 'middle',
      color: 'black',
    },
    '&:active': {
      extend: 'iconClicked',
    },

  },
  toolActive: {
    // active
    color: '#fff',
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
    boxShadow: '0 0 0 3px rgba(108, 117, 125, 0.5)',
  },
}));

export function IconTool(props) {
  const {
    alt, onClick, isActive, children,
  } = props;
  const classes = useStyles();
  return (
    <button
      className={clsx(classes.toolIcon, { [classes.toolActive]: isActive })}
      onClick={onClick}
      type="button"
      title={alt}
    >
      {children}
    </button>
  );
}

export function IconButton(props) {
  const {
    alt, onClick, children,
  } = props;
  const classes = useStyles();
  return (
    <button
      className={clsx(classes.toolIcon, classes.toolButton)}
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
    visibleTools = { pan: true, selectLasso: true },
    recenterOnClick = () => {},
  } = props;
  const classes = useStyles();

  const onRecenterButtonCLick = () => {
    recenterOnClick();
  };

  return (
    <div className={classes.tool}>
      {visibleTools.pan && (
      <IconTool
        alt="pointer tool"
        onClick={() => setActiveTool(null)}
        isActive={activeTool === null}
      ><PointerIconSVG />
      </IconTool>
      )}
      {visibleTools.selectLasso ? (
        <IconTool
          alt="select lasso"
          onClick={() => setActiveTool(SELECTION_TYPE.POLYGON)}
          isActive={activeTool === SELECTION_TYPE.POLYGON}
        ><SelectLassoIconSVG />
        </IconTool>
      ) : null}
      <IconButton
        alt="click to recenter"
        onClick={() => onRecenterButtonCLick()}
        aria-label="Recenter scatterplot view"
      ><CenterFocusStrong />
      </IconButton>
    </div>
  );
}
