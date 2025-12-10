import React from 'react';
import { makeStyles } from '@vitessce/styles';
import { InfoPlacementTypes } from '@vitessce/utils';


const useStyles = makeStyles()((theme) => {
  // Get colors based on theme mode
  const isDarkMode = theme.palette.mode === 'dark';
  const backgroundColor = isDarkMode
    ? 'rgba(0, 0, 0, 0.5)'
    : 'rgba(255, 255, 255, 0.5)';
  const textColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.9)'
    : 'rgba(0, 0, 0, 0.9)';

  return {
    overlay: {
      position: 'absolute',
      color: textColor,
      backgroundColor,
      padding: theme.spacing(0.25, 0.5),
      borderRadius: theme.shape.borderRadius,
      fontSize: '9px',
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 1,
    },
    // Position styles based on placement
    [InfoPlacementTypes.TOP_START]: {
      top: theme.spacing(0.5),
      left: theme.spacing(0.5),
    },
    [InfoPlacementTypes.TOP]: {
      top: theme.spacing(0.5),
      left: '50%',
      transform: 'translateX(-50%)',
    },
    [InfoPlacementTypes.TOP_END]: {
      top: theme.spacing(0.5),
      right: theme.spacing(0.5),
    },
    [InfoPlacementTypes.RIGHT_START]: {
      top: theme.spacing(0.5),
      right: theme.spacing(0.5),
    },
    [InfoPlacementTypes.RIGHT]: {
      right: theme.spacing(0.5),
      top: '50%',
      transform: 'translateY(-50%)',
    },
    [InfoPlacementTypes.RIGHT_END]: {
      bottom: theme.spacing(0.5),
      right: theme.spacing(0.5),
    },
    [InfoPlacementTypes.BOTTOM_START]: {
      bottom: theme.spacing(0.5),
      left: theme.spacing(0.5),
    },
    [InfoPlacementTypes.BOTTOM]: {
      bottom: theme.spacing(0.5),
      left: '50%',
      transform: 'translateX(-50%)',
    },
    [InfoPlacementTypes.BOTTOM_END]: {
      bottom: theme.spacing(0.5),
      right: theme.spacing(0.5),
    },
    [InfoPlacementTypes.LEFT_START]: {
      top: theme.spacing(0.5),
      left: theme.spacing(0.5),
    },
    [InfoPlacementTypes.LEFT]: {
      left: theme.spacing(0.5),
      top: '50%',
      transform: 'translateY(-50%)',
    },
    [InfoPlacementTypes.LEFT_END]: {
      bottom: theme.spacing(0.5),
      left: theme.spacing(0.5),
    },
  };
});


/**
 * An informational overlay component used to display info text inside a view.
 * @param {string} props.info  - The info text to display.
 * @param {string} props.placement - The placement of the overlay within its container.
 * @returns A JSX element representing the info overlay.
 */
export default function InfoOverlay({ info, placement = InfoPlacementTypes.BOTTOM_END }) {
  const { classes, cx } = useStyles();

  if (!info) {
    return null;
  }

  const placementClass = classes[placement];

  return (
    <div
      className={cx(classes.overlay, placementClass)}
      data-testid="view-info"
      title={info}
      role="note"
    >
      {info}
    </div>
  );
}
