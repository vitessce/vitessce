import React, { useRef } from 'react';
import IconButton from '@material-ui/core/IconButton';
import MenuList from '@material-ui/core/MenuList';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { StyledPopper, spanStyles, StyledPaper } from './styles';


function MuiPopper(props) {
  const {
    anchorEl,
    open,
    placement = 'bottom-start',
    children,
  } = props;
  return (
    <StyledPopper
      open={open}
      anchorEl={anchorEl.current}
      placement={placement}
    >
      {children}
    </StyledPopper>
  );
}

function MuiPaper(props) {
  const { children } = props;
  return (
    <StyledPaper
      style={{ maxHeight: 200, overflow: 'auto', zIndex: 1500 }}
    >
      {children}
    </StyledPaper>
  );
}

export function MuiSpan(props) {
  const { children } = props;
  const classes = spanStyles();
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
        open={open}
        anchorEl={anchorRef}
        placement={placement}
      >
        <MuiPaper
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
