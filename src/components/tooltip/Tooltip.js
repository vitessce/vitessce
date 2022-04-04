import React, { useEffect, useRef, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { useVitessceContainer } from '../hooks';
import { styles } from './styles';

export default function Tooltip(props) {
  const {
    x,
    y,
    parentWidth,
    parentHeight,
    children,
  } = props;
  const ref = useRef();
  const classes = styles();
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
          container={getTooltipContainer}
          transition
          placement={`${placementY}-${placementX}`}
        >
          <Paper elevation={4} className={classes.tooltipContent}>
            {children}
          </Paper>
        </Popper>
      ) : null}
    </div>
  );
}
