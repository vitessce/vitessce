/* eslint-disable */
import React, { useState } from 'react';
import { TreeNode as RcTreeNode } from 'rc-tree';
import { getDataAndAria } from 'rc-tree/es/util';
import classNames from 'classnames';
import PopoverMenu from './PopoverMenu';
import PopoverColor from './PopoverColor';
import { callbackOnKeyPress, range, levelNameFromIndex } from './utils';

import { ReactComponent as MenuSVG } from '../../assets/menu.svg';

function makeNodeViewMenuConfig(props) {
  const {
    tree,
    nodeKey,
    level,
  } = props;

  return [
    {
      name: 'View',
      handler: () => tree.viewSet(nodeKey),
      handlerKey: 'v',
    },
    // Show view buttons for viewing descendants at each level.
    ...range(level).map(i => (
      {
        name: `View ${levelNameFromIndex(i)}`,
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
  const { height } = props;
  return (
    <div className="level-buttons-container">
      {range(height).map(i => (
        <div className="level-buttons">
          {i === 0 ? (<div className="level-line-zero"></div>) : null}
          <div className="level-line"></div>
          <input className="level-radio-button" type="checkbox"/>
        </div>
    ))}
    </div>
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
    const { level, height, expanded } = this.props;
    if(level !== 0 || expanded) {
      return null;
    }
    return (
      <LevelsButtons
        height={height}
      />
    );
  }

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
