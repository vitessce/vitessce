import React, { useEffect, useRef, useState } from 'react';
import { Paper, Popper } from '@vitessce/styles';
import { useVitessceContainer } from '@vitessce/vit-s';
import { useStyles } from './styles.js';

export default function Tooltip(props) {
  const {
    x,
    y,
    parentWidth,
    parentHeight,
    children,
  } = props;
  const ref = useRef();
  const { classes } = useStyles();
  const [placementX, setPlacementX] = useState('start');
  const [placementY, setPlacementY] = useState('bottom');

  const getTooltipContainer = useVitessceContainer(ref);

  // Do collision detection based on the bounds of the tooltip ancestor element.
  useEffect(() => {
    if (ref && ref.current) {
      const flipX = (x > parentWidth / 2);
      const flipY = (y > parentHeight / 2);
      setPlacementX(flipX ? 'end' : 'start');
      setPlacementY(flipY ? 'top' : 'bottom');
      ref.current.style.left = `${x + (flipX ? -20 : 5)}px`;
      ref.current.style.top = `${y + (flipY ? -20 : 5)}px`;
    }
  }, [x, y, parentWidth, parentHeight]);
  
  return (
    <div
      ref={ref}
      className={classes.tooltipAnchor}
    >
      {ref && ref.current ? (
        <Popper
          open
          anchorEl={ref.current}
          disablePortal={false}
          container={getTooltipContainer}
          transition
          placement={`${placementY}-${placementX}`}
          popperOptions={{ strategy: 'absolute', placement: `${placementY}-${placementX}` }}
          //slotProps={{ root: { style: { position: 'absolute'} }}}
        >
          <Paper elevation={4} className={classes.tooltipContent}>
            {children}
          </Paper>
        </Popper>
      ) : null}
    </div>
  );
}
