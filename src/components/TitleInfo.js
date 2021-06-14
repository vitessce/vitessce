/* eslint-disable */
import React, { useReducer, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import SettingsIcon from '@material-ui/icons/Settings';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import LeakAddIcon from '@material-ui/icons/LeakAdd';

import LoadingIndicator from './LoadingIndicator';
import { PopperMenu } from './shared-mui/components';

import { useStyles } from './title-info-styles';

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
  const classes = useStyles({ isScroll, isSpatial });
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <>
      <Box className={classes.titleBox}>
        <Tabs
          classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon tabs example"
        >
          <Tab label={title} aria-label={title} className={`${classes.tab} ${classes.labelTab}`} />
          <Tab icon={<EditIcon />} aria-label="values" className={`${classes.tab} ${classes.iconTab}`} />
          <Tab icon={<LeakAddIcon />} aria-label="scopes"  className={`${classes.tab} ${classes.iconTab}`}/>
        </Tabs>
      
        <span className="details pl-2 align-items-end">
          <span className="d-flex justify-content-between">
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
      </Box>
      <Card className={classes.card}>
        { !isReady && <LoadingIndicator /> }
        {children}
        {info}
      </Card>
    </>
  );
}
