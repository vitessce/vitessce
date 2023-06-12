import React, { useRef } from 'react';
import {
  makeStyles,
  Paper,
  Popper,
  IconButton,
  MenuList,
  ClickAwayListener,
  Fade,
} from '@material-ui/core';
import { useVitessceContainer } from '../hooks.js';

const useStyles = makeStyles(() => ({
  popperPaper: {
    maxHeight: 200,
    overflow: 'auto',
  },
  popperContainer: {
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
  } = props;
  const classes = useStyles();

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
    <div ref={anchorRef} className={classes.popperContainer}>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        size="small"
        className={buttonClassName}
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
              <Paper elevation={4} className={classes.popperPaper}>
                <MenuList>{children}</MenuList>
              </Paper>
            </Fade>
          </ClickAwayListener>
        )}
      </Popper>
    </div>
  );
}
