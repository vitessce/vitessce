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
  } = props;
  
  const classes = useStyles();
  const treeItemClasses = { label: classes.treeItemLabel, iconContainer: classes.treeItemIconContainer };
  
  return (
    <div className={classes.sidebarContainer}>
      {enableLogo ? (
        <ActionPopover icon={<SidebarLogoSVG title="Visualization" />} title="Visualization" />
      ) : null}
      {enableUndo ? (
        <ActionPopover icon={<UndoIcon />} title="Undo" />
      ) : null}
      {enableRedo ? (
        <ActionPopover icon={<RedoIcon />} title="Redo" />
      ) : null}
      {enableAddComponent ? (
        <div className={classes.actionContainer}>
          <AddToPhotosIcon />
          <TreeView
            className={classes.treeRoot}
            defaultCollapseIcon={<ArrowDropDownIcon />}
            defaultExpandIcon={<ArrowRightIcon />}
            disableSelection
          >
            <TreeItem nodeId="1" label="Add component" classes={treeItemClasses}>
              {Object.entries(componentsToAdd).map(([componentKey, componentName], i) => (
                <TreeItem
                  key={componentKey}
                  nodeId={`${i+2}`}
                  label={componentName}
                  classes={treeItemClasses}
                  onLabelClick={() => onAddComponent({
                    component: componentKey,
                    tab: "values",
                    x: 0, y: 0, w: 1, h: 1,
                  })}
                />
              ))}
            </TreeItem>
          </TreeView>
        </div>
      ) : null}
      {enableShareViaLink ? (
        <ActionPopover icon={<LinkIcon />} title="Share via link" onClick={onShareViaLink} />
      ) : null}
      {enableThemeToggle ? (
        <ActionPopover icon={<InvertColorsIcon />} title="Toggle theme" onClick={onToggleTheme} />
      ) : null}
      {enableEditViewConfig ? (
        <ActionPopover icon={<CodeIcon />} title="Edit view config" onClick={onEditViewConfig} />
      ) : null}
      {enableClearViewConfig ? (
        <ActionPopover icon={<NewIcon />} title="Clear view config" onClick={onClearViewConfig} />
      ) : null}
    </div>
  );
}
