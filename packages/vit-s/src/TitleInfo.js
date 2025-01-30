import React, { useState, useMemo } from 'react';
import { makeStyles, MenuItem, IconButton, Link } from '@mui/material';
import {
  CloudDownload as CloudDownloadIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

import { TOOLTIP_ANCESTOR, DRAG_HANDLE } from './classNames.js';
import LoadingIndicator from './LoadingIndicator.js';
import { PopperMenu } from './shared-mui/components.js';
import { NoScrollCard, ScrollCard, SpatialCard, TitleButtons, TitleContainer, TitleLeft } from './title-styles.js';

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
  const classes = useStyles();

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
  const classes = useStyles();
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
  const classes = useStyles();
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

const selectCardComponent = (isScroll, isSpatial) => {
  if (isScroll) {
    return ScrollCard;
  }
  if (isSpatial) {
    return SpatialCard;
  }
  return NoScrollCard;
};

export function TitleInfo(props) {
  const {
    title, info, children, isScroll, isSpatial, removeGridComponent, urls,
    isReady, options, closeButtonVisible = true, downloadButtonVisible = true,
    helpText,
  } = props;

  const CardComponent = selectCardComponent(isScroll, isSpatial);

  return (
    // d-flex without wrapping div is not always full height; I don't understand the root cause.
    // "pl-2" only matters when the window is very narrow.
    (
      <>
        <TitleContainer role="banner" className={DRAG_HANDLE}>
          <TitleLeft role="heading" aria-level="1">
            {title}
          </TitleLeft>
          <TitleInfo title={info} role="note">
            {info}
          </TitleInfo>
          <TitleButtons role="toolbar" aria-label="Plot options and controls">
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
          </TitleButtons>
        </TitleContainer>
        <CardComponent
          className={TOOLTIP_ANCESTOR}
          aria-busy={!isReady}
          role="main"
        >
          { !isReady ? <LoadingIndicator /> : null }
          {children}
        </CardComponent>
      </>
    )
  );
}
