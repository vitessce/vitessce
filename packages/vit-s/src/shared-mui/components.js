import React, { useRef } from 'react';
import {
  makeStyles,
  Paper,
  Popper,
  IconButton,
  MenuList,
  ClickAwayListener,
  Fade,
} from '@vitessce/styles';
import clsx from 'clsx';
import { useVitessceContainer } from '../hooks.js';

const useStyles = makeStyles()(() => ({
  paper: {
    maxHeight: 200,
    overflow: 'auto',
  },
  container: {
    position: 'relative',
    left: 0,
    top: 0,
  },
}));

export function PopperMenu(props) {
  const {
    buttonIcon,
    open,
    setOpen,
    children,
    buttonClassName,
    placement = 'bottom-end',
    withPaper = true,
    containerClassName,
    paperClassName,
    'aria-label': ariaLabel,
  } = props;
  const { classes } = useStyles();

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
    <div ref={anchorRef} className={clsx(classes.container, containerClassName)}>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        onTouchEnd={handleClick}
        size="small"
        className={buttonClassName}
        aria-label={ariaLabel}
      >
        {buttonIcon}
      </IconButton>
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
              <div>
                {withPaper ? (
                  <Paper elevation={16} className={clsx(classes.paper, paperClassName)}>
                    <MenuList>{children}</MenuList>
                  </Paper>
                ) : children}
              </div>
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
    </div>
  );
}
