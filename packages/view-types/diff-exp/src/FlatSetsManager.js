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
import { DropIcon, DropOutlineIcon } from './DropIcon';
import isEqual from 'lodash/isEqual';
import { nodeToRenderProps, pathToKey } from '@vitessce/sets-utils';
import { getDefaultColor } from '@vitessce/utils';
import { useStyles } from './styles';
import SvgIcon from '@material-ui/core/SvgIcon';

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
    size,
    color,
    parentIsFullyChecked,
  } = props;

  console.log("ChildManager", props);

  function handleChange(event) {
    onCheckNode(path, event.target.checked);
  }

  const classes = useStyles();
  return (
    <Grid container item spacing={0} direction="row" justifyContent="space-between" classes={{ root: classes.childRow }}>
      <Grid container item spacing={0} xs direction="row">
        <Grid item xs={2} />
        <FormControlLabel
          classes={{ label: classes.childLabel }}
          control={
            <Checkbox
              classes={{ root: classes.checkboxRoot }}
              checked={isChecked}
              onChange={handleChange}
              name={`child-checkbox-${name}`}
              color="default"
              disableRipple
            />
          }
          label={name}
        />
      </Grid>
      <Grid container item spacing={0} xs={3} direction="row" justifyContent="flex-end">
        <span className={classes.sizeLabel}>{size}</span>
        {parentIsFullyChecked ? (
          <SvgIcon width="14" height="14" viewBox="0 0 14 14">
            <rect x="3" y="3" width="8" height="8" rx="2" fill={`rgb(${color[0]},${color[1]},${color[2]})`} />
          </SvgIcon>
        ) : null}
      </Grid>
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
    onCheckNone,
    onCheckNode,
    onExpand,
    partialCheckedLevelPath,
    fullyCheckedLevelPath,
  } = props;

  const isColored = isEqual(currPath, checkedLevelPath);
  const isFullyChecked = isEqual(currPath, fullyCheckedLevelPath);
  const isPartiallyChecked = isEqual(currPath, partialCheckedLevelPath);
  const isExpanded = expandedKeys.includes(nodeKey);

  console.log("GroupManager", props);

  function handleCheck(event) {
    // TODO: switch from checking to "filtering"
    if (event.target.checked) {
      onCheckLevel(nodeKey, event.target.checked);
    } else {
      onCheckNone();
    }
  }
  function handleExpand(event) {
    onExpand(nodeKey, event.target.checked);
  }
  function handleColor(event) {
    if (event.target.checked) {
      onCheckLevel(nodeKey, event.target.checked);
    } else {
      onCheckNone();
    }
  }

  const classes = useStyles();

  return (
    <Grid container spacing={0} direction="column" classes={{ root: classes.groupRow }}>
      <Grid container item spacing={0} direction="row" justifyContent="space-between">
        <Grid item direction="row">
          <Checkbox
            classes={{ root: classes.checkboxRoot }}
            checked={isFullyChecked}
            indeterminate={!isFullyChecked && isPartiallyChecked}
            onChange={handleCheck}
            name={`group-checkbox-${name}`}
            color="default"
            disableRipple
          />
          <FormControlLabel
            classes={{ labelPlacementStart: classes.labelPlacementStart, label: classes.label }}
            control={
              <Checkbox
                classes={{ root: classes.checkboxRoot }}
                checked={isExpanded}
                onChange={handleExpand}
                name={`group-expand-${name}`}
                color="default"
                icon={<ChevronRightIcon />}
                checkedIcon={<ExpandMoreIcon />}
                disableRipple
              />
            }
            label={name}
            labelPlacement="start"
          />
        </Grid>
        <Checkbox
          classes={{ root: classes.checkboxRoot }}
          checked={isColored}
          onChange={handleColor}
          icon={<DropOutlineIcon />}
          checkedIcon={<DropIcon />}
          name={`group-color-${name}`}
          color="default"
          disableRipple
        />
      </Grid>
      {isExpanded ? (
        <Grid container item spacing={0} direction="column">
          {items.map((node) => {
            const newPath = [...currPath, node.name];
            const childKey = pathToKey(newPath);
            return (
              <ChildManager
                key={childKey}
                isChecked={checkedKeys.includes(childKey)}
                parentIsFullyChecked={isColored}
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
    fullyCheckedLevels,
    partialCheckedLevels,
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
    onCheckNone,
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

  console.log(partialCheckedLevels);
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
        const partialCheckedLevel = partialCheckedLevels
          .find(d => isEqual(d.levelZeroPath, newPath));
        const fullyCheckedLevel = fullyCheckedLevels
          .find(d => isEqual(d.levelZeroPath, newPath));
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

            partialCheckedLevelPath={partialCheckedLevel ? partialCheckedLevel.levelZeroPath : null}
            partialCheckedLevelIndex={partialCheckedLevel ? partialCheckedLevel.levelIndex : null}

            fullyCheckedLevelPath={fullyCheckedLevel ? fullyCheckedLevel.levelZeroPath : null}
            fullyCheckedLevelIndex={fullyCheckedLevel ? fullyCheckedLevel.levelIndex : null}

            checkedKeys={setSelectionKeys}
            expandedKeys={setExpansionKeys}
            autoExpandParent={autoExpandParent}

            onCheckLevel={onCheckLevel}
            onCheckNone={onCheckNone}
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
