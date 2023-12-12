import { Link, MenuItem } from '@mui/material';
import {
  CloudDownload as CloudDownloadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import clsx from 'clsx';
import { useState } from 'react';

import { TOOLTIP_ANCESTOR } from './classNames.js';
import LoadingIndicator from './LoadingIndicator.js';
import { PopperMenu } from './shared-mui/components.js';
import { useTitleStyles } from './title-styles.js';

// const useStyles = makeStyles(theme => ({
//   iconButton: {
//     border: 'none',
//     marginLeft: 0,
//     background: 'none',
//     color: theme.palette.primaryForeground,
//     paddingLeft: '0.25em',
//     paddingRight: '0.25em',
//     borderRadius: '2px',
//     '&:hover': {
//       backgroundColor: theme.palette.primaryBackgroundLight,
//     },
//     '&:first-child': {
//       marginLeft: '0.25em',
//     },
//     '&:last-child': {
//       marginRight: '0.25em',
//     },
//     '& svg': {
//       width: '0.7em',
//       height: '0.7em',
//       verticalAlign: 'middle',
//       overflow: 'visible',
//     },
//   },
//   downloadLink: {
//     color: theme.palette.primaryForeground,
//     textDecoration: 'none',
//   },
// }));

function SettingsIconWithArrow() {
  return (
    <>
      <SettingsIcon />
    </>
  );
}

function PlotOptions(props) {
  const { options } = props;
  const [open, setOpen] = useState(false);

  return (options ? (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<SettingsIconWithArrow open={open} />}
      placement="bottom-end"
      aria-label="Open plot options menu"
    >
      {options}
    </PopperMenu>
  ) : null);
}

function CloudDownloadIconWithArrow() {
  return (
    <>
      <CloudDownloadIcon />
    </>
  );
}

function DownloadOptions(props) {
  const { urls } = props;
  const [open, setOpen] = useState(false);
  return (urls && urls.length ? (
    <PopperMenu
      open={open}
      setOpen={setOpen}
      buttonIcon={<CloudDownloadIconWithArrow open={open} />}
      placement="bottom-end"
      aria-label="Open download options menu"
    >
      {urls.map(({ url, name }) => (
        <MenuItem dense key={`${url}_${name}`} getArialLabel={() => `Click to download ${name}`}>
          <Link underline="always" href={url} target="_blank" rel="noopener">
            Download {name}
          </Link>
        </MenuItem>
      ))}
    </PopperMenu>
  ) : null);
}


export function TitleInfo(props) {
  const {
    title, info, children, isScroll, isSpatial, urls,
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
