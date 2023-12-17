import {
  CloudDownload as CloudDownloadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Link, MenuItem, Stack, Typography } from '@mui/material';
import clsx from 'clsx';
import { useState } from 'react';

import LoadingIndicator from './LoadingIndicator.js';
import { TOOLTIP_ANCESTOR } from './classNames.js';
import { PopperMenu } from './shared-mui/components.js';
import { COLOR_GRAY } from './shared-mui/styles.js';
import { useTitleStyles } from './title-styles.js';

function SettingsIconWithArrow() {
  return (
    <>
      <SettingsIcon sx={{ width: '22px' }} />
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
      <CloudDownloadIcon sx={{ width: '22px' }} />
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
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div style={{ height: '50px' }}>
          <Typography variant="h3" sx={{ pt: info ? 0 : 2 }}>{title}</Typography>
          {info && <Typography variant="body1" sx={{ lineHeight: '22px' }}>{info}</Typography>}
        </div>
        <Stack direction="row" alignItems="center">
          <PlotOptions
            options={options}
          />
          <DownloadOptions
            urls={urls}
          />
        </Stack>
      </Stack>
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
        style={{ background: COLOR_GRAY }}
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
