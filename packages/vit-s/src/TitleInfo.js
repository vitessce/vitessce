import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { makeStyles, MenuItem, IconButton, Link,
  CloudDownload as CloudDownloadIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Help as HelpIcon,
} from '@vitessce/styles';

import { TOOLTIP_ANCESTOR } from './classNames.js';
import LoadingIndicator from './LoadingIndicator.js';
import { PopperMenu } from './shared-mui/components.js';
import { useTitleStyles } from './title-styles.js';

const useStyles = makeStyles()(theme => ({
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
    '&:first-of-type': {
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
  helpTextSpan: {
    maxWidth: '400px',
    padding: '5px 10px',
    display: 'inline-block',
    textAlign: 'justify',
    fontSize: '14px',
    backgroundColor: theme.palette.gridLayoutBackground,
    color: theme.palette.tooltipText,
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
    border: '10px solid grey',
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
  const { classes } = useStyles();

  const buttonIcon = useMemo(() => (<SettingsIconWithArrow open={open} />), [open]);
  return (options ? (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={buttonIcon}
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
  const { classes } = useStyles();
  const buttonIcon = useMemo(() => (<CloudDownloadIconWithArrow open={open} />), [open]);
  return (urls && urls.length ? (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={buttonIcon}
      buttonClassName={classes.iconButton}
      placement="bottom-end"
      aria-label="Open download options menu"
    >
      {urls.map(({ url, name }) => (
        <MenuItem dense key={`${url}_${name}`} aria-label={`Click to download ${name}`}>
          <Link underline="always" href={url} target="_blank" rel="noopener" className={classes.downloadLink}>
            Download {name}
          </Link>
        </MenuItem>
      ))}
    </PopperMenu>
  ) : null);
}

function HelpButton(props) {
  const { helpText } = props;
  const [open, setOpen] = useState(false);
  const { classes } = useStyles();
  return (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<HelpIcon />}
      buttonClassName={classes.iconButton}
      placement="bottom-end"
      aria-label="Open help info"
      withPaper={false}
    >
      <span className={classes.helpTextSpan}>{helpText}</span>
    </PopperMenu>
  );
}


function ClosePaneButton(props) {
  const { removeGridComponent } = props;
  const { classes } = useStyles();
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
    isReady, options, closeButtonVisible = true, downloadButtonVisible = true,
    helpText, withPadding = true,
  } = props;

  const { classes } = useTitleStyles();

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
          {downloadButtonVisible ? (
            <DownloadOptions
              urls={urls}
            />
          ) : null}
          {helpText ? (
            <HelpButton
              helpText={helpText}
            />
          ) : null}
          {closeButtonVisible && removeGridComponent ? (
            <ClosePaneButton
              removeGridComponent={removeGridComponent}
            />
          ) : null}
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
            [classes.noPaddingCard]: !withPadding,
            [classes.paddingCard]: withPadding,
          },
        )}
        aria-busy={!isReady}
        role="main"
      >
        { !isReady ? <LoadingIndicator /> : null }
        {children}
      </div>
    </>
    // "pl-2" only matters when the window is very narrow.
  );
}
