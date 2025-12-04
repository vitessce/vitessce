import React from 'react';
import { makeStyles } from '@vitessce/styles';


const useStyles = makeStyles()((theme) => {
  // Get colors based on theme mode
  const isDarkMode = theme.palette.mode === 'dark';
  const backgroundColor = isDarkMode
    ? 'rgba(0, 0, 0, 0.75)'
    : 'rgba(255, 255, 255, 0.9)';
  const textColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.9)'
    : 'rgba(0, 0, 0, 0.87)';

  return {
    overlay: {
      position: 'absolute',
      color: textColor,
      backgroundColor,
      padding: theme.spacing(0.25, 0.5),
      borderRadius: theme.shape.borderRadius,
      fontSize: theme.typography.caption.fontSize,
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 1,
      boxShadow: theme.shadows[2],
    },
    // Position styles based on placement
    'top-start': {
      top: theme.spacing(0.5),
      left: theme.spacing(0.5),
    },
    top: {
      top: theme.spacing(0.5),
      left: '50%',
      transform: 'translateX(-50%)',
    },
    'top-end': {
      top: theme.spacing(0.5),
      right: theme.spacing(0.5),
    },
    'right-start': {
      top: theme.spacing(0.5),
      right: theme.spacing(0.5),
    },
    right: {
      right: theme.spacing(0.5),
      top: '50%',
      transform: 'translateY(-50%)',
    },
    'right-end': {
      bottom: theme.spacing(0.5),
      right: theme.spacing(0.5),
    },
    'bottom-start': {
      bottom: theme.spacing(0.5),
      left: theme.spacing(0.5),
    },
    bottom: {
      bottom: theme.spacing(0.5),
      left: '50%',
      transform: 'translateX(-50%)',
    },
    'bottom-end': {
      bottom: theme.spacing(0.5),
      right: theme.spacing(0.5),
    },
    'left-start': {
      top: theme.spacing(0.5),
      left: theme.spacing(0.5),
    },
    left: {
      left: theme.spacing(0.5),
      top: '50%',
      transform: 'translateY(-50%)',
    },
    'left-end': {
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
export default function InfoOverlay({ info, placement = 'bottom-end' }) {
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
