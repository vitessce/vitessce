/* eslint-disable no-underscore-dangle */
import React, { useMemo } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SvgIcon from '@material-ui/core/SvgIcon';
import isEqual from 'lodash/isEqual';
import { nodeToRenderProps, pathToKey } from '@vitessce/sets-utils';
import { getDefaultColor } from '@vitessce/utils';
import { useStyles } from './styles';
import { DropIcon, DropOutlineIcon } from './DropIcon';

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

function ProportionBar(props) {
  const {
    proportions,
  } = props;

  const parts = useMemo(() => {
    const result = [];
    let x = 0;
    proportions.proportions.forEach((p) => {
      const width = p.proportion * 100;
      result.push((
        <rect
          x={x}
          y="0"
          width={width}
          height="14"
          fill={`rgb(${p.color[0]},${p.color[1]},${p.color[2]})`}
        >
          <title>{p.path.at(-1)}: {Math.round(width)}%</title>
        </rect>
      ));
      x += width;
    });
    return result;
  }, [proportions]);

  const classes = useStyles();

  return (
    <svg className={classes.proportionSvg} height="14" viewBox="0 0 100 10">
      {parts}
    </svg>
  );
}

function ChildManager(props) {
  const {
    title: name,
    isChecked,
    path,
    onCheckNode,
    size,
    color,
    parentIsColored,
    groupProportions,
  } = props;

  const matchingProportions = !parentIsColored && groupProportions
    && groupProportions.find(d => isEqual(d.path, path));

  // console.log("ChildManager", props);

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
          control={(
            <Checkbox
              classes={{ root: classes.checkboxRoot }}
              checked={isChecked}
              onChange={handleChange}
              name={`child-checkbox-${name}`}
              color="default"
              disableRipple
            />
          )}
          label={name}
        />
      </Grid>
      <Grid item spacing={0} xs={3} direction="row" justifyContent="flex-start">
        {matchingProportions ? (
          <ProportionBar proportions={matchingProportions} />
        ) : null}
      </Grid>
      <Grid container item spacing={0} xs={2} direction="row" justifyContent="flex-end">
        <span className={classes.sizeLabel}>{size}</span>
        {parentIsColored ? (
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
    currPath,
    setColor,
    coloredLevelPath,
    expandedKeys,
    checkedKeys,
    onColorGroup,
    onCheckGroup,
    onCheckNode,
    onExpand,
    partialCheckedLevelPath,
    fullyCheckedLevelPath,
    groupProportions,
  } = props;

  const isColored = isEqual(currPath, coloredLevelPath);
  const isFullyChecked = isEqual(currPath, fullyCheckedLevelPath);
  const isPartiallyChecked = isEqual(currPath, partialCheckedLevelPath);
  const isExpanded = expandedKeys.includes(nodeKey);

  // console.log("GroupManager", props);

  function handleCheck(event) {
    onCheckGroup(nodeKey, event.target.checked);
  }
  function handleExpand(event) {
    onExpand(nodeKey, event.target.checked);
  }
  function handleColor(event) {
    onColorGroup(nodeKey, event.target.checked);
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
            control={(
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
            )}
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
                parentIsColored={isColored}
                onCheckNode={onCheckNode}
                groupProportions={groupProportions}
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
 * A flat set manager component.
 * @prop {object} tree An object representing set hierarchies.
 * @prop {function} onCheckNode Function to call when a single node has been checked or un-checked.
 * @prop {function} onExpandNode Function to call when a node has been expanded.
 * @prop {function} onCheckLevel Function to call when an entire hierarchy level has been selected,
 * via the "Color by cluster" and "Color by subcluster" buttons below collapsed level zero nodes.
 * @prop {string} theme "light" or "dark" for the vitessce theme
 */
export default function FlatSetsManager(props) {
  const {
    theme,
    sets,
    additionalSets,
    setColor,
    coloredLevel,
    levelSelection: checkedLevel,
    fullyCheckedLevels,
    partialCheckedLevels,
    setFilter,
    setExpansion,
    groupProportions,
    hasColorEncoding,
    onCheckGroup,
    onCheckNode,
    onExpandNode,
    onColorGroup,
  } = props;

  // console.log(partialCheckedLevels);
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

  const allSetFilterKeys = (setFilter || []).map(pathToKey);
  const allSetExpansionKeys = (setExpansion || []).map(pathToKey);

  const setFilterKeys = allSetFilterKeys.filter(k => !additionalSetKeys.includes(k));
  const setExpansionKeys = allSetExpansionKeys.filter(k => !additionalSetKeys.includes(k));

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

            coloredLevelPath={coloredLevel ? coloredLevel.levelZeroPath : null}
            checkedLevelPath={checkedLevel ? checkedLevel.levelZeroPath : null}
            partialCheckedLevelPath={partialCheckedLevel ? partialCheckedLevel.levelZeroPath : null}
            fullyCheckedLevelPath={fullyCheckedLevel ? fullyCheckedLevel.levelZeroPath : null}

            checkedKeys={setFilterKeys}
            expandedKeys={setExpansionKeys}
            autoExpandParent={autoExpandParent}

            groupProportions={groupProportions}

            onColorGroup={onColorGroup}
            onCheckGroup={onCheckGroup}
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
