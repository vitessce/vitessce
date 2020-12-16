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
  downloadButton: {
    paddingBottom: 0,
    paddingTop: 0,
    marginLeft: '8px !important',
    backgroundColor: 'transparent',
    outline: 0,
  },
}));

function DownloadIcon({ open }) {
  return (
    <>
      <CloudDownloadIcon />
      {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
    </>
  );
}

function DownloadOptions(props) {
  const [open, toggle] = useReducer(v => !v, false);
  const { urls, buttonClassName } = props;
  return (
    <PopperMenu
      open={open}
      toggle={toggle}
      buttonIcon={<DownloadIcon open={open} />}
      buttonClassName={buttonClassName}
    >
      {urls.map(({ url, name }) => (
        <MenuItem dense key={url}>
          <Link underline="none" href={url} target="_blank" rel="noopener">
            {name}
          </Link>
        </MenuItem>
      ))}
    </PopperMenu>
  );
}

function ClosePaneButton(props) {
  const { removeGridComponent, buttonClassName } = props;
  return (
    <IconButton
      onClick={removeGridComponent}
      size="small"
      className={buttonClassName}
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
  const [optionsPaneOpen, toggleOptionsPaneOpen] = useReducer(v => !v, false);
  const classes = useStyles();
  return (
    // d-flex without wrapping div is not always full height; I don't understand the root cause.
    <>
      <div className="title d-flex justify-content-between align-items-baseline">
        <div className="justify-content-between d-flex align-items-end">
          <span>{title}</span>
          {urls && urls.length > 0 ? (
            <DownloadOptions
              urls={urls}
              buttonClassName={classes.downloadButton}
            />
          ) : null}
        </div>
        <span className="details pl-2 align-items-end">
          <span className="d-flex justify-content-between">
            {info}
            { options && (
              <PopperMenu
                open={optionsPaneOpen}
                toggle={toggleOptionsPaneOpen}
                buttonIcon={<SettingsIcon />}
                buttonClassName={classes.iconButton}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {options}
              </PopperMenu>
            ) }
            <ClosePaneButton
              removeGridComponent={removeGridComponent}
              buttonClassName={classes.iconButton}
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
