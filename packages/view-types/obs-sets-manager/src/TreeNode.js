/* eslint-disable max-len */
/* eslint-disable react-refresh/only-export-components */
import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import RcTreeNode from 'rc-tree/es/TreeNode.js';
import { getDataAndAria } from 'rc-tree/es/util.js';
import { range, isEqual } from 'lodash-es';
import { callbackOnKeyPress, colorArrayToString, getLevelTooltipText } from '@vitessce/sets-utils';
import { MenuSVG } from '@vitessce/icons';
import { getDefaultColor } from '@vitessce/utils';
import HelpTooltip from './HelpTooltip.js';
import PopoverMenu from './PopoverMenu.js';
import { useStyles } from './styles.js';

/**
 * Construct a `menuConfig` array for the PopoverMenu component.
 * @param {object} props The props for the TreeNode component.
 * @returns {object[]} An array of menu items to pass to PopoverMenu.
 */
function makeNodeViewMenuConfig(props) {
  const {
    path,
    level,
    height,
    onCheckNode,
    onFilterNode,
    onFilterToOnlyNode,
    onFilterToOthersInSiblings,
    onFilterToOthersInGroup,
    onSelectComplement,
    onNodeRemove,
    onNodeSetIsEditing,
    onExportLevelZeroNodeJSON,
    onExportLevelZeroNodeTabular,
    onExportSetJSON,
    checkable,
    editable,
    exportable,
    checked,
    isFilterIncluded = true,
  } = props;

  return [
    ...(onFilterNode ? [
      {
        title: (isFilterIncluded ? 'Exclude from filter' : 'Include in filter'),
        handler: () => { onFilterNode(path, !isFilterIncluded); },
        handlerKey: 'f',
      },
    ] : []),
    ...(onFilterToOnlyNode ? [
      {
        title: 'Filter to only this',
        subtitle: (level === 0 ? '(hierarchy)' : '(set)'),
        handler: () => { onFilterToOnlyNode(path); },
        handlerKey: 'o',
      },
    ] : []),
    // "All others" is only meaningful relative to a scope. A level-one node's
    // immediate siblings are its whole group of sets, so the two scopes
    // coincide there and only the sibling-scoped option is offered.
    ...(onFilterToOthersInSiblings && level > 0 ? [
      {
        title: 'Filter to all others',
        subtitle: '(within immediate siblings)',
        handler: () => { onFilterToOthersInSiblings(path); },
        handlerKey: 'a',
      },
    ] : []),
    ...(onFilterToOthersInGroup && level > 1 ? [
      {
        title: 'Filter to all others',
        subtitle: '(within this group of sets)',
        handler: () => { onFilterToOthersInGroup(path); },
        handlerKey: 'g',
      },
    ] : []),
    ...(onSelectComplement && level > 0 ? [
      {
        title: 'Select complement',
        subtitle: '(within filter-included sets)',
        handler: () => { onSelectComplement(path); },
        handlerKey: 'c',
      },
    ] : []),
    ...(editable ? [
      {
        title: 'Rename',
        handler: () => { onNodeSetIsEditing(path, true); },
        handlerKey: 'r',
      },
      {
        title: 'Delete',
        confirm: true,
        handler: () => { onNodeRemove(path); },
        handlerKey: 'd',
      },
    ] : []),
    ...(level === 0 && exportable ? [
      {
        title: 'Export hierarchy',
        subtitle: '(to JSON file)',
        handler: () => { onExportLevelZeroNodeJSON(path); },
        handlerKey: 'j',
      },
      ...(height <= 1 ? [
        {
          title: 'Export hierarchy',
          subtitle: '(to CSV file)',
          handler: () => { onExportLevelZeroNodeTabular(path); },
          handlerKey: 't',
        },
      ] : []),
    ] : []),
    ...(level > 0 ? [
      // A set which does not meet the filtering criteria cannot be checked,
      // but a set which is already checked can always be un-checked.
      ...(checkable && (checked || isFilterIncluded) ? [
        {
          title: (checked ? 'Uncheck' : 'Check'),
          handler: () => { onCheckNode(path, !checked); },
          handlerKey: 's',
        },
      ] : []),
      ...(exportable ? [
        {
          title: 'Export set',
          subtitle: '(to JSON file)',
          handler: () => { onExportSetJSON(path); },
          handlerKey: 'e',
        },
      ] : []),
    ] : []),
  ];
}

/**
 * The checkbox which controls whether a set meets the current
 * filtering criteria. Distinct from the (square) checkbox which controls
 * whether a set is selected.
 * @param {object} props The props for the TreeNode component.
 */
function FilterCheckbox(props) {
  const {
    path,
    datatype,
    isSetFilterActive,
    isFilterIncluded,
    isFilterPartiallyIncluded,
    onFilterNode,
    disableTooltip,
  } = props;
  const inputRef = useRef();
  // The "partially included" state has no declarative equivalent,
  // so it must be set on the DOM node imperatively.
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(isFilterPartiallyIncluded);
    }
  }, [isFilterPartiallyIncluded]);

  let tooltipText;
  if (!isSetFilterActive) {
    tooltipText = `Set-level filtering is inactive, since individual ${datatype} items are currently being filtered. Click to filter by set instead.`;
  } else if (isFilterIncluded) {
    tooltipText = 'Exclude this set from the filtering criteria';
  } else if (isFilterPartiallyIncluded) {
    tooltipText = 'Some sets below this one are excluded from the filtering criteria. Click to include all of them.';
  } else {
    tooltipText = 'Include this set in the filtering criteria';
  }
  const tooltipProps = (disableTooltip ? { visible: false } : {});

  const { classes } = useStyles();
  return (
    <HelpTooltip title={tooltipText} {...tooltipProps}>
      <span className={classes.filterCheckboxWrapper}>
        <input
          ref={inputRef}
          className={clsx(classes.filterCheckbox, {
            [classes.filterCheckboxInactive]: !isSetFilterActive,
          })}
          type="checkbox"
          aria-label={tooltipText}
          checked={Boolean(isFilterIncluded)}
          onChange={e => onFilterNode(path, e.target.checked)}
        />
      </span>
    </HelpTooltip>
  );
}

/**
 * The "static" node component to render when the user is not renaming.
 * @param {object} props The props for the TreeNode component.
 */
function NamedSetNodeStatic(props) {
  const {
    title,
    path,
    nodeKey,
    level,
    height,
    color,
    checkbox,
    isChecking,
    isLeaf,
    onNodeSetColor,
    onNodeView,
    expanded,
    onCheckLevel,
    checkedLevelPath,
    checkedLevelIndex,
    disableTooltip,
    size,
    datatype,
    editable,
    theme,
    onFilterNode,
    isFilterIncluded = true,
    isFilterPartiallyIncluded = false,
  } = props;
  // A set is fully excluded when neither it nor any of its
  // descendants meet the current filtering criteria.
  const isFilterExcluded = !isFilterIncluded && !isFilterPartiallyIncluded;
  const shouldCheckNextLevel = (level === 0 && !expanded);
  const nextLevelToCheck = (
    (checkedLevelIndex && isEqual(path, checkedLevelPath) && checkedLevelIndex < height)
      ? checkedLevelIndex + 1
      : 1
  );
  const numberFormatter = new Intl.NumberFormat('en-US');
  const niceSize = numberFormatter.format(size);
  let tooltipText;
  if (isFilterExcluded) {
    // Filtered-out sets cannot be selected, so explain that rather than
    // describing the coloring behavior that is unavailable.
    tooltipText = 'Excluded by the current filtering criteria, so it cannot be selected. Use the round checkbox to include it again.';
  } else if (shouldCheckNextLevel) {
    tooltipText = getLevelTooltipText(nextLevelToCheck);
  } else if (isLeaf || !expanded) {
    tooltipText = `Color individual set (${niceSize} ${datatype}${(size === 1 ? '' : 's')})`;
  } else {
    tooltipText = 'Color by expanded descendants';
  }
  // If this is a level zero node and is _not_ expanded, then upon click,
  // the behavior should be to color by the first or next cluster level.
  // If this is a level zero node and _is_ expanded, or if any other node,
  // click should trigger onNodeView.
  const onClick = (level === 0 && !expanded
    ? () => onCheckLevel(nodeKey, nextLevelToCheck)
    : () => onNodeView(path)
  );
  const tooltipProps = (disableTooltip ? { visible: false } : {});
  const popoverMenuConfig = makeNodeViewMenuConfig(props);

  const { classes } = useStyles();
  return (
    <span>
      <HelpTooltip title={tooltipText} {...tooltipProps}>
        <button
          type="button"
          onClick={onClick}
          onKeyPress={e => callbackOnKeyPress(e, 'v', () => onNodeView(path))}
          className={clsx(classes.titleButton, {
            [classes.titleButtonFilterExcluded]: isFilterExcluded,
          })}
          disabled={isFilterExcluded}
        >
          {title}
        </button>
      </HelpTooltip>
      {popoverMenuConfig.length > 0 ? (
        <PopoverMenu
          menuConfig={makeNodeViewMenuConfig(props)}
          color={level > 0 && editable ? (color || getDefaultColor(theme)) : null}
          setColor={c => onNodeSetColor(path, c)}
        >
          <span>
            <MenuSVG className={classes.nodeMenuIcon} aria-label="Open Node View Menu" />
          </span>
        </PopoverMenu>
      ) : null}
      {onFilterNode ? (<FilterCheckbox {...props} />) : null}
      {level > 0 && isChecking ? checkbox : null}
      {level > 0 && (
        <span
          className={clsx(classes.nodeSizeLabel, {
            [classes.nodeSizeLabelFilterExcluded]: isFilterExcluded,
          })}
        >
          {niceSize}
        </span>
      )}
    </span>
  );
}

/**
 * The "editing" node component to render when the user is renaming,
 * containing a text input field and a save button.
 * @param {object} props The props for the TreeNode component.
 */
function NamedSetNodeEditing(props) {
  const {
    title,
    path,
    onNodeSetName,
    onNodeCheckNewName,
  } = props;
  const [currentTitle, setCurrentTitle] = useState(title);

  // Do not allow the user to save a potential name if it conflicts with
  // another name in the hierarchy.
  const hasConflicts = onNodeCheckNewName(path, currentTitle);
  function trySetName() {
    if (!hasConflicts) {
      onNodeSetName(path, currentTitle, true);
    }
  }
  const { classes } = useStyles();
  return (
    <span className={classes.titleButtonWithInput}>
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        className={classes.titleInput}
        type="text"
        value={currentTitle}
        onChange={(e) => { setCurrentTitle(e.target.value); }}
        onKeyPress={e => callbackOnKeyPress(
          e,
          'Enter',
          trySetName,
        )}
        onFocus={e => e.target.select()}
      />
      {!hasConflicts && (
        <button
          type="button"
          className={classes.titleSaveButton}
          onClick={trySetName}
        >
          Save
        </button>
      )}
    </span>
  );
}

/**
 * A "delegation" component, to decide whether to render
 * an "editing" vs. "static" node component.
 * @param {object} props The props for the TreeNode component.
 */
function NamedSetNode(props) {
  const {
    isEditing,
    isCurrentSet,
  } = props;
  return (
    (isEditing || isCurrentSet)
      ? (<NamedSetNodeEditing {...props} />)
      : (<NamedSetNodeStatic {...props} />)
  );
}

/**
 * Buttons for viewing each hierarchy level,
 * rendered below collapsed level zero nodes.
 * @param {object} props The props for the (level zero) TreeNode component.
 */
function LevelsButtons(props) {
  const {
    nodeKey,
    path,
    height,
    onCheckLevel,
    checkedLevelPath,
    checkedLevelIndex,
    hasColorEncoding,
  } = props;
  function onCheck(event) {
    if (event.target.checked) {
      const newLevel = parseInt(event.target.value, 10);
      onCheckLevel(nodeKey, newLevel);
    }
  }
  const { classes } = useStyles();
  return (
    <div className={classes.levelButtonsContainer}>
      {range(1, height + 1).map((i) => {
        const isChecked = isEqual(path, checkedLevelPath) && i === checkedLevelIndex;
        return (
          <div key={i}>
            <HelpTooltip title={getLevelTooltipText(i)}>
              <input
                className={clsx(classes.levelRadioButton, { [classes.levelRadioButtonChecked]: isChecked && !hasColorEncoding })}
                type="checkbox"
                value={i}
                checked={isChecked && hasColorEncoding}
                onChange={onCheck}
              />
            </HelpTooltip>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Render the "switcher" icon.
 * Arrow for collapsed/expanded non-leaf nodes,
 * or square for leaf nodes.
 * @param {object} props The props for the TreeNode component.
 */
function SwitcherIcon(props) {
  const {
    isLeaf, isOpen, color,
  } = props;
  const hexColor = (color ? colorArrayToString(color) : undefined);
  if (isLeaf) {
    return (
      <i
        className="anticon anticon-circle rc-tree-switcher-icon"
      >
        <svg
          viewBox="0 0 1024 1024"
          focusable="false"
          data-icon="caret-down"
          width="1em"
          height="1em"
          aria-hidden="true"
        >
          <rect fill={hexColor} x={600 / 2} y={600 / 2} width={1024 - 600} height={1024 - 600} />
        </svg>
      </i>
    );
  }
  return (
    <i
      className="anticon anticon-caret-down rc-tree-switcher-icon"
    >
      <svg
        viewBox="0 0 1024 1024"
        focusable="false"
        data-icon="caret-down"
        width="1em"
        height="1em"
        aria-hidden="true"
      >
        <path
          fill={(isOpen ? '#444' : hexColor)}
          d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"
        />
      </svg>
    </i>
  );
}

/**
 * A custom TreeNode component.
 * @extends {RcTreeNode} TreeNode from the rc-tree library.
 */
export default class TreeNode extends RcTreeNode {
  /**
   * Override the main node text elements.
   */
  renderSelector = () => {
    const {
      title,
      isCurrentSet,
      isSelected,
      isEditing,
      onDragStart: onDragStartProp,
    } = this.props;
    const {
      prefixCls: prefixClass,
      draggable,
    } = this.context;

    const onDragStart = (e) => {
      onDragStartProp();
      this.onDragStart(e);
    };

    const wrapClass = `${prefixClass}-node-content-wrapper`;
    const isDraggable = (!isCurrentSet && !isEditing && draggable);
    return (
      <span
        ref={this.setSelectHandle}
        title={title}
        className={clsx(
          wrapClass,
          `${wrapClass}-${this.getNodeState() || 'normal'}`,
          isSelected && `${prefixClass}-node-selected`,
          isDraggable && 'draggable',
        )}
        draggable={isDraggable}
        aria-grabbed={isDraggable}
        onDragStart={isDraggable ? onDragStart : undefined}
      >
        <NamedSetNode
          {...this.props}
          prefixClass={prefixClass}
          checkbox={this.renderCheckbox()}
        />
        {this.renderLevels()}
      </span>
    );
  };

  /**
   * Render the LevelsButtons component if this node
   * is a collapsed level zero node.
   */
  renderLevels = () => {
    const { level, expanded } = this.props;
    if (level !== 0 || expanded) {
      return null;
    }
    return (
      <LevelsButtons
        {...this.props}
      />
    );
  };

  /**
   * Override the switcher element.
   */
  renderSwitcher = () => {
    const { expanded, isLeaf, color } = this.props;
    const {
      prefixCls: prefixClass,
      onNodeExpand,
    } = this.context;

    const onNodeExpandWrapper = (e) => {
      // Do not call onNodeExpand if the node is a leaf node.
      if (!isLeaf) {
        onNodeExpand(e, this);
      }
    };

    const switcherClass = clsx(
      `${prefixClass}-switcher`,
      { [`${prefixClass}-switcher_${(expanded ? 'open' : 'close')}`]: !isLeaf },
    );
    return (
      <span
        className={switcherClass}
        onClick={onNodeExpandWrapper}
        onKeyPress={e => callbackOnKeyPress(e, 'd', onNodeExpandWrapper)}
        role="button"
        tabIndex="0"
      >
        <SwitcherIcon
          isLeaf={isLeaf}
          isOpen={expanded}
          color={color}
        />
      </span>
    );
  };

  /**
   * Override main render function,
   * to enable overriding the sub-render functions
   * for switcher, selector, etc.
   */
  render() {
    const {
      style, loading, level,
      dragOver, dragOverGapTop, dragOverGapBottom,
      isLeaf,
      expanded, selected, checked, halfChecked,
      onDragEnd: onDragEndProp,
      expandable,
      ...otherProps
    } = this.props;
    const {
      prefixCls: prefixClass,
      filterTreeNode,
      draggable,
    } = this.context;
    const disabled = this.isDisabled();
    const dataAndAriaAttributeProps = getDataAndAria(otherProps);

    const onDragEnd = (e) => {
      onDragEndProp();
      this.onDragEnd(e);
    };

    return (
      <li
        className={clsx('rc-tree-treenode', `level-${level}-treenode`, {
          [`${prefixClass}-treenode-disabled`]: disabled,
          [`${prefixClass}-treenode-switcher-${expanded ? 'open' : 'close'}`]: !isLeaf,
          [`${prefixClass}-treenode-checkbox-checked`]: checked,
          [`${prefixClass}-treenode-checkbox-indeterminate`]: halfChecked,
          [`${prefixClass}-treenode-selected`]: selected,
          [`${prefixClass}-treenode-loading`]: loading,

          'drag-over': !disabled && dragOver,
          'drag-over-gap-top': !disabled && dragOverGapTop,
          'drag-over-gap-bottom': !disabled && dragOverGapBottom,
          'filter-node': filterTreeNode && filterTreeNode(this),
        })}
        style={style}
        role="treeitem"
        aria-selected={selected}
        onDragEnter={draggable ? this.onDragEnter : undefined}
        onDragOver={draggable ? this.onDragOver : undefined}
        onDragLeave={draggable ? this.onDragLeave : undefined}
        onDrop={draggable ? this.onDrop.bind(this) : undefined}
        onDragEnd={draggable ? onDragEnd : undefined}
        {...dataAndAriaAttributeProps}
      >
        {expandable ? this.renderSwitcher() : null}
        {this.renderSelector()}
        {this.renderChildren()}
      </li>
    );
  }
}
