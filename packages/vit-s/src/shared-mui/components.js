import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import IconButton from '@material-ui/core/IconButton';
import MenuList from '@material-ui/core/MenuList';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Fade from '@material-ui/core/Fade';
import { useVitessceContainer } from '../hooks';

const useStyles = makeStyles(() => ({
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
    <div ref={anchorRef} className={classes.container}>
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
              {withPaper ? (
                <Paper elevation={4} className={classes.paper}>
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
