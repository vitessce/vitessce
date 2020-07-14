import React, { useRef, useReducer } from 'react';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Link from '@material-ui/core/Link';

import { SCROLL_CARD, BLACK_CARD, SECONDARY_CARD } from './classNames';
import ClosePaneButton from './ClosePaneButton';
import { useOptionStyles } from './layer-controller/styles';

export default function TitleInfo(props) {
  const {
    title, info, children, isScroll, isSpatial, removeGridComponent, urls,
  } = props;
  const [open, toggle] = useReducer(v => !v, false);
  const anchorRef = useRef(null);
  // eslint-disable-next-line no-nested-ternary
  const childClassName = isScroll ? SCROLL_CARD : (isSpatial ? BLACK_CARD : SECONDARY_CARD);
  const classes = useOptionStyles();
  return (
    // d-flex without wrapping div is not always full height; I don't understand the root cause.
    <>
      <div className="title d-flex justify-content-between align-items-baseline">
        <div className="justify-content-between d-flex align-items-end">
          <span>{title}</span>
          {urls ? (
            <>
              <Button
                onClick={toggle}
                size="small"
                ref={anchorRef}
              >
                <CloudDownloadIcon />
              </Button>
              <Popper
                className={classes.popper}
                open={open}
                anchorEl={anchorRef.current}
                placement="bottom-end"
              >
                <Paper
                  className={classes.paper}
                  style={{ maxHeight: 200, overflow: 'auto', zIndex: 1500 }}
                >
                  <ClickAwayListener onClickAway={toggle}>
                    <MenuList id="image-layer-options">
                      {urls.map(({ url, name }) => (
                        <MenuItem
                          dense
                          key={url}
                        >
                          <Link color="primary" underline="none" href={url}>{name}</Link>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Popper>
            </>
          ) : null}
        </div>
        <span className="details pl-2 align-items-end">
          <span className="d-flex justify-content-between">
            {info}
            <ClosePaneButton removeGridComponent={removeGridComponent} />
          </span>
        </span>
      </div>
      <div className={childClassName}>{children}</div>
    </>
    // "pl-2" only matters when the window is very narrow.
  );
}
