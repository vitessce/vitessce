import React, { useEffect, useRef, useState } from 'react';
import { Paper, Popper } from '@mui/material';
import { useVitessceContainer } from '@vitessce/vit-s';
import { TooltipAnchor, TooltipContent } from './styles.js';

export default function Tooltip(props) {
  const {
    x,
    y,
    parentWidth,
    parentHeight,
    children,
  } = props;
  const ref = useRef();
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
    <TooltipAnchor
      ref={ref}
    >
      {ref && ref.current ? (
        <Popper
          open
          anchorEl={ref.current}
          container={getTooltipContainer}
          transition
          placement={`${placementY}-${placementX}`}
        >
          <TooltipContent elevation={4}>
            {children}
          </TooltipContent>
        </Popper>
      ) : null}
    </TooltipAnchor>
  );
}
