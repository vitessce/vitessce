/* eslint-disable */
import React from 'react';

import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

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
    
    onToggleTheme,
  } = props;
  
  const classes = useStyles();
  const treeItemClasses = { label: classes.treeItemLabel, iconContainer: classes.treeItemIconContainer };
  
  return (
    <div className={classes.sidebarContainer}>
      {enableLogo ? (
        <a href="http://vitessce.io" target="_blank" className={classes.topLink}>
          <SidebarLogoSVG title="Powered by Vitessce" />
        </a>
      ) : null}
      <ActionPopover icon={<UndoIcon />} title="Undo" />
      <ActionPopover icon={<RedoIcon />} title="Redo" />
      <div className={classes.actionContainer}>
        <AddToPhotosIcon />
        <TreeView
          className={classes.treeRoot}
          defaultCollapseIcon={<ArrowDropDownIcon />}
          defaultExpandIcon={<ArrowRightIcon />}
        >
          <TreeItem nodeId="1" label="Add component" classes={treeItemClasses}>
            <TreeItem nodeId="2" label="Scatterplot" classes={treeItemClasses} />
            <TreeItem nodeId="3" label="Spatial" classes={treeItemClasses} />
            <TreeItem nodeId="4" label="Heatmap" classes={treeItemClasses} />
          </TreeItem>
        </TreeView>
      </div>
      <ActionPopover icon={<LinkIcon />} title="Share via link" />
      {enableThemeToggle ? (
        <ActionPopover icon={<InvertColorsIcon />} title="Toggle theme" onClick={onToggleTheme} />
      ) : null}
    </div>
  );
}
