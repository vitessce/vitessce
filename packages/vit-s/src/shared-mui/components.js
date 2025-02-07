import React, { useRef } from 'react';
import {
  Paper,
  Popper,
  IconButton,
  MenuList,
  ClickAwayListener,
  Fade,
} from '@mui/material';
import clsx from 'clsx';
import { css } from '@emotion/react';
import { useVitessceContainer } from '../hooks.js';

const paper = css({
  maxHeight: 200,
  overflow: 'auto',
});

const container = css({
  position: 'relative',
  left: 0,
  top: 0,
});


export function PopperMenu(props) {
  const {
    buttonIcon,
    open,
    setOpen,
    children,
    buttonComponent: ButtonComponent = IconButton,
    placement = 'bottom-end',
    withPaper = true,
    containerClassName,
    'aria-label': ariaLabel,
  } = props;

  const anchorRef = useRef();

  const handleClick = () => {
    setOpen(prev => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const id = open ? 'v-popover-menu' : undefined;

  const getTooltipContainer = useVitessceContainer(anchorRef);

  return (
    <div ref={anchorRef} className={clsx(container, containerClassName)}>
      <ButtonComponent
        aria-describedby={id}
        onClick={handleClick}
        onTouchEnd={handleClick}
        size="small"
        aria-label={ariaLabel}
      >
        {buttonIcon}
      </ButtonComponent>
      <Popper
        id={id}
        open={open}
        anchorEl={anchorRef && anchorRef.current}
        container={getTooltipContainer}
        onClose={handleClose}
        placement={placement}
        transition
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Fade {...TransitionProps} timeout={100}>
              {withPaper ? (
                <Paper elevation={4} className={paper}>
                  <MenuList>{children}</MenuList>
                </Paper>
              ) : children}
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
    </div>
  );
}
