import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles, MenuItem, IconButton, Link } from '@material-ui/core';
import {
  CloudDownload as CloudDownloadIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
} from '@material-ui/icons';

import { TOOLTIP_ANCESTOR } from './classNames.js';
import LoadingIndicator from './LoadingIndicator.js';
import { PopperMenu } from './shared-mui/components.js';
import { useTitleStyles } from './title-styles.js';

const useStyles = makeStyles(theme => ({
  iconButton: {
    border: 'none',
    marginLeft: 0,
    background: 'none',
    color: theme.palette.primaryForeground,
    paddingLeft: '0.25em',
    paddingRight: '0.25em',
    borderRadius: '2px',
    '&:hover': {
      backgroundColor: theme.palette.primaryBackgroundLight,
    },
    '&:first-child': {
      marginLeft: '0.25em',
    },
    '&:last-child': {
      marginRight: '0.25em',
    },
    '& svg': {
      width: '0.7em',
      height: '0.7em',
      verticalAlign: 'middle',
      overflow: 'visible',
    },
  },
  downloadLink: {
    color: theme.palette.primaryForeground,
  },
}));

function SettingsIconWithArrow({ open }) {
  return (
    <>
      <SettingsIcon />
      {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
    </>
  );
}

function PlotOptions(props) {
  const { options } = props;
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  return (options ? (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<SettingsIconWithArrow open={open} />}
      buttonClassName={classes.iconButton}
      placement="bottom-end"
      aria-label="Open plot options menu"
    >
      {options}
    </PopperMenu>
  ) : null);
}

function CloudDownloadIconWithArrow({ open }) {
  return (
    <>
      <CloudDownloadIcon />
      {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
    </>
  );
}

function DownloadOptions(props) {
  const { urls } = props;
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  return (urls && urls.length ? (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<CloudDownloadIconWithArrow open={open} />}
      buttonClassName={classes.iconButton}
      placement="bottom-end"
      aria-label="Open download options menu"
    >
      {urls.map(({ url, name }) => (
        <MenuItem dense key={`${url}_${name}`} getArialLabel={() => `Click to download ${name}`}>
          <Link underline="always" href={url} target="_blank" rel="noopener" className={classes.downloadLink}>
            Download {name}
          </Link>
        </MenuItem>
      ))}
    </PopperMenu>
  ) : null);
}

function ClosePaneButton(props) {
  const { removeGridComponent } = props;
  const classes = useStyles();
  return (
    <IconButton
      onClick={removeGridComponent}
      size="small"
      className={classes.iconButton}
      title="close"
      aria-label="Close panel button"
    >
      <CloseIcon />
    </IconButton>
  );
}

export function TitleInfo(props) {
  const {
    title, info, children, isScroll, isSpatial, removeGridComponent, urls,
    isReady, options,
  } = props;

  const classes = useTitleStyles();

  return (
    // d-flex without wrapping div is not always full height; I don't understand the root cause.
    <>
      <div className={classes.title} role="banner">
        <div className={classes.titleLeft} role="heading" aria-level="1">
          {title}
        </div>
        <div className={classes.titleInfo} title={info} role="note">
          {info}
        </div>
        <div className={classes.titleButtons} role="toolbar" aria-label="Plot options and controls">
          <PlotOptions
            options={options}
          />
          <DownloadOptions
            urls={urls}
          />
          <ClosePaneButton
            removeGridComponent={removeGridComponent}
          />
        </div>
      </div>
      <div
        className={clsx(
          TOOLTIP_ANCESTOR,
          classes.card,
          {
            [classes.scrollCard]: isScroll,
            [classes.spatialCard]: isSpatial,
            [classes.noScrollCard]: !isScroll && !isSpatial,
          },
        )}
        aria-busy={!isReady}
        role="main"
      >
        { !isReady && <LoadingIndicator /> }
        {children}
      </div>
    </>
    // "pl-2" only matters when the window is very narrow.
  );
}
