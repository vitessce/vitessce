/* eslint-disable no-underscore-dangle */
import React, { useState, useMemo } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import OpacityIcon from '@material-ui/icons/Opacity';
import InvertColorsIcon from '@material-ui/icons/InvertColors';
import isEqual from 'lodash/isEqual';
import { nodeToRenderProps, pathToKey } from '@vitessce/sets-utils';
import { getDefaultColor } from '@vitessce/utils';
import Tree from './Tree';
import TreeNode from './TreeNode';
import { PlusButton, SetOperationButtons } from './SetsManagerButtons';
import { useStyles } from './styles';

function processNode(node, prevPath, setColor, theme) {
  const nodePath = [...prevPath, node.name];
  return {
    ...node,
    ...(node.children ? ({
      children: node.children
        .map(c => processNode(c, nodePath, setColor)),
    }) : {}),
    color: setColor?.find(d => isEqual(d.path, nodePath))?.color || getDefaultColor(theme),
  };
}

function processSets(sets, setColor, theme) {
  return {
    ...sets,
    tree: sets ? sets.tree.map(lzn => processNode(lzn, [], setColor, theme)) : [],
  };
}

function getAllKeys(node, path = []) {
  if (!node) {
    return null;
  }
  const newPath = [...path, node.name];
  if (node.children) {
    return [pathToKey(newPath), ...node.children.flatMap(v => getAllKeys(v, newPath))];
  }
  return pathToKey(newPath);
}

function ChildManager(props) {
  const {
    title: name,
    isChecked,
    nodeKey,
    path,
    onCheckNode,
  } = props;

  console.log("ChildManager", props);

  function handleChange(event) {
    onCheckNode(path, event.target.checked);
  }
  return (
    <Grid container item spacing={1} direction="row">
      <Grid item xs={2} />
      <FormControlLabel
        control={
          <Checkbox
            //className={classes.checkbox}
            checked={isChecked}
            onChange={handleChange}
            name={`child-checkbox-${name}`}
            color="default"
          />
        }
        label={
          <span>
            {name}
          </span>
        }
      />
      
    </Grid>
  );
}

function GroupManager(props) {
  const {
    title: name,
    items,
    nodeKey,
    path,
    currPath,
    setColor,
    checkedLevelPath,
    expandedKeys,
    checkedKeys,
    onCheckLevel,
    onCheckNode,
    onExpand,
  } = props;

  const isFullyChecked = isEqual(currPath, checkedLevelPath);
  const isExpanded = expandedKeys.includes(nodeKey);

  console.log("GroupManager", props);

  function handleCheck(event) {
    // TODO: fix un-check level behavior
    onCheckLevel(nodeKey, event.target.checked ? 1 : 0);
  }
  function handleExpand(event) {
    onExpand(nodeKey, event.target.checked);
  }
  return (
    <Grid container spacing={1} direction="column">
      <Grid container item spacing={1} direction="row" justifyContent="space-between">
        <Grid item direction="row">
          <Checkbox
            //className={classes.checkbox}
            checked={isFullyChecked}
            onChange={handleCheck}
            name={`group-checkbox-${name}`}
            color="default"
          />
          <FormControlLabel
            control={
              <Checkbox
                //className={classes.checkbox}
                checked={isExpanded}
                onChange={handleExpand}
                name={`group-expand-${name}`}
                color="default"
                icon={<ChevronRightIcon />}
                checkedIcon={<ExpandMoreIcon />}
              />
            }
            label={name}
            labelPlacement="start"
          />
        </Grid>
        <Checkbox icon={<OpacityIcon />} checkedIcon={<InvertColorsIcon />} name="checkedH" />
      </Grid>
      {isExpanded ? (
        <Grid container item spacing={1} direction="column">
          {items.map((node) => {
            const newPath = [...currPath, node.name];
            const childKey = pathToKey(newPath);
            return (
              <ChildManager
                key={childKey}
                isChecked={checkedKeys.includes(childKey)}
                onCheckNode={onCheckNode}
                {...nodeToRenderProps(node, newPath, setColor)}
              />
            );
          })}
        </Grid>
      ) : null}
    </Grid>
  );
}

/**
 * A generic hierarchical set manager component.
 * @prop {object} tree An object representing set hierarchies.
 * @prop {string} datatype The data type for sets (e.g. "cell")
 * @prop {function} clearPleaseWait A callback to signal that loading is complete.
 * @prop {boolean} draggable Whether tree nodes can be rearranged via drag-and-drop.
 * By default, true.
 * @prop {boolean} checkable Whether to show the "Check" menu button
 * and checkboxes for selecting multiple sets. By default, true.
 * @prop {boolean} editable Whether to show rename, delete, color, or create options.
 * By default, true.
 * @prop {boolean} expandable Whether to allow hierarchies to be expanded
 * to show the list or tree of sets contained. By default, true.
 * @prop {boolean} operatable Whether to enable union, intersection,
 * and complement operations on checked sets. By default, true.
 * @prop {boolean} exportable Whether to enable exporting hierarchies and sets to files.
 * By default, true.
 * @prop {boolean} importable Whether to enable importing hierarchies from files.
 * By default, true.
 * @prop {function} onError Function to call with error messages (failed import validation, etc).
 * @prop {function} onCheckNode Function to call when a single node has been checked or un-checked.
 * @prop {function} onExpandNode Function to call when a node has been expanded.
 * @prop {function} onDropNode Function to call when a node has been dragged-and-dropped.
 * @prop {function} onCheckLevel Function to call when an entire hierarchy level has been selected,
 * via the "Color by cluster" and "Color by subcluster" buttons below collapsed level zero nodes.
 * @prop {function} onNodeSetColor Function to call when a new node color has been selected.
 * @prop {function} onNodeSetName Function to call when a node has been renamed.
 * @prop {function} onNodeRemove Function to call when the user clicks the "Delete" menu button
 * to remove a node.
 * @prop {function} onNodeView Function to call when the user wants to view the set associated
 * with a particular node.
 * @prop {function} onImportTree Function to call when a tree has been imported
 * using the "plus" button.
 * @prop {function} onCreateLevelZeroNode Function to call when a user clicks the "Create hierarchy"
 * menu option using the "plus" button.
 * @prop {function} onExportLevelZeroNode Function to call when a user wants to
 * export an entire hierarchy via the "Export hierarchy" menu button for a
 * particular level zero node.
 * @prop {function} onExportSet Function to call when a user wants to export a set associated with
 * a particular node via the "Export set" menu button.
 * @prop {function} onUnion Function to call when a user wants to create a new set from the union
 * of the sets associated with the currently-checked nodes.
 * @prop {function} onIntersection Function to call when a user wants to create a new set from the
 * intersection of the sets associated with the currently-checked nodes.
 * @prop {function} onComplement Function to call when a user wants to create a new set from the
 * complement of the (union of the) sets associated with the currently-checked nodes.
 * @prop {function} onView Function to call when a user wants to view the sets
 * associated with the currently-checked nodes.
 * @prop {string} theme "light" or "dark" for the vitessce theme
 */
export default function FlatSetsManager(props) {
  const {
    theme,
    sets,
    additionalSets,
    setColor,
    levelSelection: checkedLevel,
    setSelection,
    setExpansion,
    hasColorEncoding,
    datatype,
    draggable = true,
    checkable = true,
    editable = true,
    expandable = true,
    operatable = true,
    exportable = true,
    importable = true,
    onError,
    onCheckNode,
    onExpandNode,
    onDropNode,
    onCheckLevel,
    onNodeSetColor,
    onNodeSetName,
    onNodeCheckNewName,
    onNodeRemove,
    onNodeView,
    onImportTree,
    onCreateLevelZeroNode,
    onExportLevelZeroNodeJSON,
    onExportLevelZeroNodeTabular,
    onExportSetJSON,
    onUnion,
    onIntersection,
    onComplement,
    hasCheckedSetsToUnion,
    hasCheckedSetsToIntersect,
    hasCheckedSetsToComplement,
  } = props;

  const isChecking = true;
  const autoExpandParent = true;

  const processedSets = useMemo(() => processSets(
    sets, setColor, theme,
  ), [sets, setColor, theme]);
  const processedAdditionalSets = useMemo(() => processSets(
    additionalSets, setColor, theme,
  ), [additionalSets, setColor, theme]);

  const additionalSetKeys = (processedAdditionalSets
    ? processedAdditionalSets.tree.flatMap(v => getAllKeys(v, []))
    : []
  );

  const allSetSelectionKeys = (setSelection || []).map(pathToKey);
  const allSetExpansionKeys = (setExpansion || []).map(pathToKey);

  const setSelectionKeys = allSetSelectionKeys.filter(k => !additionalSetKeys.includes(k));
  const setExpansionKeys = allSetExpansionKeys.filter(k => !additionalSetKeys.includes(k));

  const classes = useStyles();

  console.log(processedSets.tree);

  return (
    <div>
      {processedSets.tree.map((node) => {
        const newPath = [node.name];
        return (
          <GroupManager
            key={pathToKey(newPath)}
            currPath={newPath}
            items={node.children}
            {...nodeToRenderProps(node, newPath, setColor)}

            hasColorEncoding={hasColorEncoding}
            isChecking={isChecking}
            checkedLevelPath={checkedLevel ? checkedLevel.levelZeroPath : null}
            checkedLevelIndex={checkedLevel ? checkedLevel.levelIndex : null}

            checkedKeys={setSelectionKeys}
            expandedKeys={setExpansionKeys}
            autoExpandParent={autoExpandParent}

            onCheckLevel={onCheckLevel}
            onCheckNode={onCheckNode}
            onExpand={(nodeKey, expanded) => onExpandNode(
              setExpansionKeys,
              nodeKey,
              expanded,
            )}

            setColor={setColor}
          />
        );
      })}
    </div>
  );
}
