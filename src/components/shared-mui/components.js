import React, { useRef } from 'react';
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
    <Paper
      className={classes.paper}
      style={{ maxHeight: 200, overflow: 'auto', zIndex: 1500 }}
    >
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
    toggle,
    children,
    placement,
    buttonStyles,
  } = props;
  const anchorRef = useRef(null);
  const classes = styles();
  return (
    <>
      <IconButton
        onClick={toggle}
        size="small"
        ref={anchorRef}
        style={buttonStyles}
      >
        {buttonIcon}
      </IconButton>
      <MuiPopper
        className={classes.popper}
        open={open}
        anchorEl={anchorRef}
        placement={placement}
      >
        <MuiPaper
          className={classes.paper}
          style={{ maxHeight: 200, overflow: 'auto', zIndex: 1500 }}
        >
          <ClickAwayListener onClickAway={toggle}>
            <MenuList>{children}</MenuList>
          </ClickAwayListener>
        </MuiPaper>
      </MuiPopper>
    </>
  );
}
