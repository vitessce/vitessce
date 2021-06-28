/* eslint-disable */
import React, { useState } from 'react';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

import EditIcon from '@material-ui/icons/Edit';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import AddToPhotosIcon from '@material-ui/icons/AddToPhotos';
import LinkIcon from '@material-ui/icons/Link';
import InvertColorsIcon from '@material-ui/icons/InvertColors';
import CodeIcon from '@material-ui/icons/Code';
import NewIcon from '@material-ui/icons/FiberNew';

import { useStyles } from './styles';
import { ReactComponent as SidebarLogoSVG } from '../assets/sidebar-logo.svg';

function ActionPopover(props) {
  const {
    icon,
    title,
    onClick,
  } = props;
  
  const classes = useStyles();
  const treeItemClasses = { label: classes.treeItemLabel, iconContainer: classes.treeItemIconContainer };
  
  return (
    <div className={classes.actionContainer} onClick={onClick}>
      {icon}
      <TreeView
        className={classes.treeRoot}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        disableSelection
      >
        <TreeItem nodeId="1" label={title} classes={treeItemClasses} />
      </TreeView>
    </div>
  );
}

export default function VitessceSidebar(props) {
  const {
    enableLogo,
    enableUndo,
    enableRedo,
    enableAddComponent,
    enableShareViaLink,
    enableThemeToggle,
    enableEditViewConfig,
    enableClearViewConfig,
    
    componentsToAdd,
    onAddComponent,
    onToggleTheme,
    onShareViaLink,
    onEditViewConfig,
    onClearViewConfig,
    
    tab,
    setTab,
  } = props;
  
  const classes = useStyles();
  const treeItemClasses = { label: classes.treeItemLabel, iconContainer: classes.treeItemIconContainer };
  
  function handleTabChange(event, value) {
    setTab(value);
  }
  
  return (
    <div className={classes.sidebarContainer}>
      <div className={classes.sidebarTop}>
        {enableUndo ? (
          <ActionPopover icon={<UndoIcon />} title="Undo" />
        ) : null}
        {enableRedo ? (
          <ActionPopover icon={<RedoIcon />} title="Redo" />
        ) : null}
  
        {enableShareViaLink ? (
          <ActionPopover icon={<LinkIcon />} title="Share via link" onClick={onShareViaLink} />
        ) : null}
        {enableThemeToggle ? (
          <ActionPopover icon={<InvertColorsIcon />} title="Toggle theme" onClick={onToggleTheme} />
        ) : null}
      </div>
      <div className={classes.sidebarBottom}>
        <Tabs
          orientation="vertical"
          value={tab}
          onChange={handleTabChange}
          className={classes.tabs}
          aria-label="View or Edit"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<SidebarLogoSVG />} aria-label="view" classes={{ root: classes.tabRoot }} />
          <Tab icon={<EditIcon />} aria-label="edit" classes={{ root: classes.tabRoot }} />
        </Tabs>
      </div>
    </div>
  );
}
