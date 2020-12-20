import React, { useReducer } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import SettingsIcon from '@material-ui/icons/Settings';
import CloseIcon from '@material-ui/icons/Close';

import { SCROLL_CARD, BLACK_CARD, SECONDARY_CARD } from './classNames';
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
      marginLeft: '0.75em',
    },
    '&:last-child': {
      marginRight: '0.25em',
    },
    '& svg': {
      width: '0.7em',
      height: '0.7em',
      verticalAlign: 'middle',
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
  const [open, toggle] = useReducer(v => !v, false);
  const classes = useStyles();
  return (
    <PopperMenu
      open={open}
      toggle={toggle}
      buttonIcon={<SettingsIconWithArrow open={open} />}
      buttonClassName={classes.iconButton}
      placement="bottom-end"
    >
      {options}
    </PopperMenu>
  );
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
  const [open, toggle] = useReducer(v => !v, false);
  const classes = useStyles();
  return (
    <PopperMenu
      open={open}
      toggle={toggle}
      buttonIcon={<CloudDownloadIconWithArrow open={open} />}
      buttonClassName={classes.iconButton}
      placement="bottom-end"
    >
      {urls.map(({ url, name }) => (
        <MenuItem dense key={url}>
          <Link underline="none" href={url} target="_blank" rel="noopener" className={classes.downloadLink}>
            Download {name}
          </Link>
        </MenuItem>
      ))}
    </PopperMenu>
  );
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

export default function TitleInfo(props) {
  const {
    title, info, children, isScroll, isSpatial, removeGridComponent, urls,
    isReady, options,
  } = props;
  // eslint-disable-next-line no-nested-ternary
  const childClassName = isScroll ? SCROLL_CARD : (isSpatial ? BLACK_CARD : SECONDARY_CARD);
  return (
    // d-flex without wrapping div is not always full height; I don't understand the root cause.
    <>
      <div className="title d-flex justify-content-between align-items-baseline">
        <div className="justify-content-between d-flex align-items-end">
          <span>{title}</span>
        </div>
        <span className="details pl-2 align-items-end">
          <span className="d-flex justify-content-between">
            {info}
            { options && (
              <PlotOptions
                options={options}
              />
            ) }
            {urls && urls.length > 0 && (
              <DownloadOptions
                urls={urls}
              />
            )}
            <ClosePaneButton
              removeGridComponent={removeGridComponent}
            />
          </span>
        </span>
      </div>
      <div className={childClassName}>
        { !isReady && <LoadingIndicator /> }
        {children}
      </div>
    </>
    // "pl-2" only matters when the window is very narrow.
  );
}
