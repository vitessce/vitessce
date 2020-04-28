/* eslint-disable */
import React, { useState } from 'react';
import { TreeNode as RcTreeNode } from 'rc-tree';
import { getDataAndAria } from 'rc-tree/es/util';
import classNames from 'classnames';
import PopoverMenu from './PopoverMenu';
import tinycolor from 'tinycolor2';
import PopoverColor from './PopoverColor';
import { callbackOnKeyPress, range, levelNameFromIndex } from './utils';

function toHexString(rgbArray) {
  return tinycolor({ r: rgbArray[0], g: rgbArray[1], b: rgbArray[2] }).toHexString();
}

import { ReactComponent as MenuSVG } from '../../assets/menu.svg';

function makeNodeViewMenuConfig(props) {
  const {
    tree,
    nodeKey,
    level,
    height,
  } = props;

  return [
    {
      name: 'View',
      handler: () => tree.viewSet(nodeKey),
      handlerKey: 'v',
    },
    {
      name: 'Rename',
      handler: () => { /* TODO */ },
      handlerKey: 'r',
    },
    {
      name: 'Delete',
      handler: () => { /* TODO */ },
      handlerKey: 'd',
    },
    ...(level === 0 ? [
      {
        name: 'Export hierarchy',
        handler: () => { /* TODO */ },
        handlerKey: 'e',
      }
    ] : [
      {
        name: 'Select',
        handler: () => { /* TODO */ },
        handlerKey: 's',
      },
      {
        name: 'Export set',
        handler: () => { /* TODO */ },
        handlerKey: 'e',
      }
    ]),
    // Show view buttons for viewing descendants at each level.
    ...range(height - level).map(i => (
      {
        name: `View ${levelNameFromIndex(i+1)}`,
        handler: () => tree.viewSetDescendants(nodeKey, i),
        handlerKey: `${i}`,
      }
    )),
  ];
}

function NamedSetNodeStatic(props) {
  const {
    title,
    tree,
    nodeKey,
  } = props;
  return (
    <span>
      <button
        type="button"
        onClick={() => { tree.viewSet(nodeKey); }}
        onKeyPress={e => callbackOnKeyPress(e, 'v', () => tree.viewSet(nodeKey))}
        className="title-button"
        title={`View ${title}`}
      >
        {title}
      </button>
      <PopoverMenu
        menuConfig={makeNodeViewMenuConfig(props)}
        onClose={() => {}}
      >
        <MenuSVG className="node-menu-icon" />
      </PopoverMenu>
    </span>
  );
}

function NamedSetNodeEditing(props) {
  const {
    title,
    tree,
    nodeKey,
  } = props;
  const [currentTitle, setCurrentTitle] = useState(title);
  return (
    <>
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        className="title-input"
        type="text"
        value={currentTitle}
        onChange={(e) => { setCurrentTitle(e.target.value); }}
        onKeyPress={e => callbackOnKeyPress(e, 'Enter', () => tree.changeNodeName(nodeKey, currentTitle, true))}
        onFocus={e => e.target.select()}
      />
      <button
        type="button"
        className="title-save-button"
        onClick={() => tree.changeNodeName(nodeKey, currentTitle, true)}
      >
        Save
      </button>
    </>
  );
}


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

function LevelsButtons(props) {
  const {
    tree,
    nodeKey,
    height,
  } = props;
  const [checkedLevelKey, checkedLevelIndex] = tree.checkedLevel;
  function onCheck(event) {
    if(event.target.checked) {
      const newLevel = parseInt(event.target.value);
      tree.setCheckedLevel(nodeKey, newLevel);
      tree.viewSetDescendants(nodeKey, newLevel-1);
    }
  };
  return (
    <div className="level-buttons-container">
      {range(height).map(i => (
        <div className="level-buttons" key={i+1}>
          {i === 0 ? (<div className="level-line-zero"></div>) : null}
          <div className="level-line"></div>
          <input
            className="level-radio-button"
            type="checkbox"
            value={i+1}
            checked={nodeKey === checkedLevelKey && (i+1) === checkedLevelIndex}
            onChange={onCheck}
          />
        </div>
    ))}
    </div>
  );
}

function SwitcherIcon(props) {
  const { level, isLeaf, isOpen, color } = props;
  const hexColor = toHexString(color);
  if(isLeaf) {
    return (
      <i aria-label="icon: circle" class="anticon anticon-circle rc-tree-switcher-icon">
        <svg viewBox="0 0 1024 1024" focusable="false" class="" data-icon="caret-down" width="1em" height="1em" aria-hidden="true">
          <circle fill={hexColor} cx="512" cy="512" r="312"/>
        </svg>
      </i>
    );
  }
  return (
    <i aria-label="icon: caret" class="anticon anticon-caret-down rc-tree-switcher-icon">
      <svg viewBox="0 0 1024 1024" focusable="false" class="" data-icon="caret-down" width="1em" height="1em" aria-hidden="true">
        <path fill={(isOpen ? "#444" : hexColor)} d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
      </svg>
    </i>
  );
}

export default class TreeNode extends RcTreeNode {
  renderSelector = () => {
    const {
      tree,
      nodeKey,
      title,
      size,
      color,
      height,
      isCurrentSet,
      isSelected,
      isEditing,
    } = this.props;
    const {
      rcTree: {
        prefixCls: prefixClass,
        draggable,
      },
    } = this.context;

    const wrapClass = `${prefixClass}-node-content-wrapper`;
    const isDraggable = (!isCurrentSet && !isEditing && draggable);
    return (
      <span
        ref={this.setSelectHandle}
        title={title}
        className={classNames(
          wrapClass,
          `${wrapClass}-${this.getNodeState() || 'normal'}`,
          isSelected && `${prefixClass}-node-selected`,
          isDraggable && 'draggable',
        )}
        draggable={isDraggable}
        aria-grabbed={isDraggable}
        onDragStart={isDraggable ? this.onDragStart : undefined}
      >
        <NamedSetNode {...this.props} prefixClass={prefixClass} />
      </span>
    );
  };

  renderLevels = () => {
    const { nodeKey, level, height, expanded, tree } = this.props;
    if(level !== 0 || expanded) {
      return null;
    }
    return (
      <LevelsButtons
        nodeKey={nodeKey}
        height={height}
        tree={tree}
      />
    );
  }

  renderSwitcher = () => {
    const { expanded, isLeaf, color } = this.props;
    const {
      rcTree: {
        prefixCls: prefixClass,
        onNodeExpand,
      },
    } = this.context;

    const switcherClass = classNames(
      `${prefixClass}-switcher`,
      { [`${prefixClass}-switcher_${(expanded ? 'open' : 'close')}`]: !isLeaf }
    );
    return (
      <span
        className={switcherClass}
        onClick={e => onNodeExpand(e, this)}
      >
        <SwitcherIcon
          isLeaf={isLeaf}
          isOpen={expanded}
          color={color}
        />
      </span>
    );
  };

  render() {
    const {
      style, loading, level,
      dragOver, dragOverGapTop, dragOverGapBottom,
      isLeaf,
      expanded, selected, checked, halfChecked,
      ...otherProps
    } = this.props;
    const {
      rcTree: {
        prefixCls: prefixClass,
        filterTreeNode,
        draggable,
      },
    } = this.context;
    const disabled = this.isDisabled();
    const dataAndAriaAttributeProps = getDataAndAria(otherProps);
    return (
      <li
        className={classNames("rc-tree-treenode", `level-${level}-treenode`, {
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
        onDragEnter={draggable ? this.onDragEnter : undefined}
        onDragOver={draggable ? this.onDragOver : undefined}
        onDragLeave={draggable ? this.onDragLeave : undefined}
        onDrop={draggable ? this.onDrop.bind(this) : undefined}
        onDragEnd={draggable ? this.onDragEnd : undefined}
        {...dataAndAriaAttributeProps}
      >
        {this.renderSwitcher()}
        {this.renderSelector()}
        {this.renderCheckbox()}
        {this.renderChildren()}
        {this.renderLevels()}
      </li>
    );
  }
}
