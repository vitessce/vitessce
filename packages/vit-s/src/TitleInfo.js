import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import SettingsIcon from '@material-ui/icons/Settings';
import CloseIcon from '@material-ui/icons/Close';

import { TOOLTIP_ANCESTOR } from './classNames';
import LoadingIndicator from './LoadingIndicator';
import { PopperMenu } from './shared-mui/components';

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
    >
      {urls.map(({ url, name }) => (
        <MenuItem dense key={`${url}_${name}`}>
          <Link underline="none" href={url} target="_blank" rel="noopener" className={classes.downloadLink}>
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
    >
      <CloseIcon />
    </IconButton>
  );
}

export const useTitleStyles = makeStyles(theme => ({
  title: {
    color: theme.palette.primaryForeground,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    flexShrink: '0',
  },
  titleLeft: {
    flexShrink: '1',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  titleInfo: {
    width: '100%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: '80% !important',
    opacity: '.8',
    padding: '0 4px',
    justifyContent: 'center',
    lineHeight: '25px !important',
    flexShrink: '1',
    textAlign: 'right !important',
  },
  titleButtons: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    flexShrink: '0',
    justifyContent: 'right',
    '& div': {
      display: 'inline-block',
    },
  },
  card: {
    border: `1px solid ${theme.palette.cardBorder}`,
    flex: '1 1 auto',
    minHeight: '1px',
    padding: '12px',
    marginTop: '8px',
    marginBottom: '8px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '0',
    wordWrap: 'break-word',
    backgroundClip: 'border-box',
    borderRadius: '4px',
  },
  noScrollCard: {
    backgroundColor: theme.palette.secondaryBackground,
    color: theme.palette.secondaryForeground,
  },
  scrollCard: {
    backgroundColor: theme.palette.primaryBackground,
    color: theme.palette.primaryForeground,
    '& a': {
      color: theme.palette.primaryForegroundActive,
    },
    overflowY: 'auto',
  },
  spatialCard: {
    backgroundColor: theme.palette.black,
    color: theme.palette.white,
    '& a': {
      color: theme.palette.white,
    },
  },
}));


export function TitleInfo(props) {
  const {
    title, info, children, isScroll, isSpatial, removeGridComponent, urls,
    isReady, options,
  } = props;

  const classes = useTitleStyles();

  return (
    // d-flex without wrapping div is not always full height; I don't understand the root cause.
    <>
      <div className={classes.title}>
        <div className={classes.titleLeft}>
          {title}
        </div>
        <div className={classes.titleInfo} title={info}>
          {info}
        </div>
        <div className={classes.titleButtons}>
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
      >
        { !isReady && <LoadingIndicator /> }
        {children}
      </div>
    </>
    // "pl-2" only matters when the window is very narrow.
  );
}
