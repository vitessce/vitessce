import React, { useRef } from 'react';
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import MenuList from '@material-ui/core/MenuList';
import { styles } from './styles';


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
    buttonClassName,
  } = props;
  const anchorRef = useRef();

  const handleClick = () => {
    setOpen(prev => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const id = open ? 'v-popover-menu' : undefined;

  return (
    <Box style={{ position: 'relative' }}>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        size="small"
        ref={anchorRef}
        className={buttonClassName}
      >
        {buttonIcon}
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorRef && anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transitionDuration={0}
        elevation={4}
      >
        <MenuList>{children}</MenuList>
      </Popover>
    </Box>
  );
}
