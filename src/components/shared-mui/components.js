import React, { useRef } from 'react';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import IconButton from '@material-ui/core/IconButton';
import MenuList from '@material-ui/core/MenuList';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { styles } from './styles';

function MuiPopper(props) {
  const classes = styles();
  const {
    anchorEl,
    open,
    placement = 'bottom-start',
    children,
  } = props;
  return (
    <Popper
      className={classes.popper}
      open={open}
      anchorEl={anchorEl.current}
      placement={placement}
    >
      {children}
    </Popper>
  );
}

function MuiPaper(props) {
  const { children } = props;
  const classes = styles();
  return (
    <Paper className={classes.paper} elevation={4}>
      {children}
    </Paper>
  );
}

export function MuiSpan(props) {
  const { children } = props;
  const classes = styles();
  return <span className={classes.span}>{children}</span>;
}

export function PopperMenu(props) {
  const {
    buttonIcon,
    open,
    setOpen,
    children,
    placement,
    buttonClassName,
  } = props;
  const anchorRef = useRef(null);
  const classes = styles();

  const handleClick = () => {
    setOpen(prev => !prev);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box style={{ position: 'relative' }}>
        <IconButton
          onClick={handleClick}
          size="small"
          ref={anchorRef}
          className={buttonClassName}
        >
          {buttonIcon}
        </IconButton>
        <MuiPopper
          className={classes.popper}
          open={open}
          anchorEl={anchorRef}
          placement={placement}
        >
          <MuiPaper>
            <MenuList>{children}</MenuList>
          </MuiPaper>
        </MuiPopper>
      </Box>
    </ClickAwayListener>
  );
}
