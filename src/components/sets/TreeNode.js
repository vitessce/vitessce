/* eslint-disable jsx-a11y/no-autofocus */
import React, { useState } from 'react';
import { Icon } from 'antd';
import { TreeNode as RcTreeNode } from 'rc-tree';
import { getDataAndAria } from 'rc-tree/es/util';
import classNames from 'classnames';
import PopoverMenu from './PopoverMenu';
import { callbackOnKeyPress, range, levelNameFromIndex } from './utils';


function CurrentSetNode(props) {
  const {
    title,
    setKey,
    prefixCls,
    tree,
  } = props;
  return (
    <input
      autoFocus
      value={title}
      type="text"
      className={`${prefixCls}-current-set-input`}
      onChange={(e) => { tree.changeNodeName(setKey, e.target.value); }}
    />
  );
}

function makeNamedSetNodeMenuConfig(props) {
  const {
    tree,
    setKey,
    level,
  } = props;

  return [
    {
      name: 'View',
      handler: () => tree.viewSet(setKey),
      handlerKey: 'v',
    },
    ...range(level).map(i => (
      {
        name: `View ${levelNameFromIndex(i)}`,
        handler: () => tree.viewSetDescendants(setKey, i),
        handlerKey: `${i}`,
      }
    )),
    {
      name: 'Open in new tab',
      handler: () => tree.newTab(setKey),
      handlerKey: 't',
    },
    {
      name: 'Rename',
      handler: () => tree.startEditing(setKey),
      handlerKey: 'r',
    },
    {
      name: 'Delete',
      handler: () => tree.deleteNode(setKey),
      handlerKey: 'd',
    },
  ];
}

function NamedSetNodeStatic(props) {
  const {
    title,
    prefixCls,
    tree,
    setKey,
  } = props;
  return (
    <React.Fragment>
      <button
        type="button"
        onClick={() => { tree.viewSet(setKey); }}
        onKeyPress={e => callbackOnKeyPress(e, 'v', () => tree.viewSet(setKey))}
        className={`${prefixCls}-title`}
        title={`View ${title}`}
      >
        {title}
      </button>
      <PopoverMenu
        menuConfig={makeNamedSetNodeMenuConfig(props)}
      >
        <Icon type="ellipsis" className="named-set-node-menu-trigger" title="More options" />
      </PopoverMenu>
    </React.Fragment>
  );
}

function NamedSetNodeEditing(props) {
  const {
    title,
    prefixCls,
    tree,
    setKey,
    wasPreviousCurrentSet,
  } = props;
  const [currentTitle, setCurrentTitle] = useState(title);
  return (
    <React.Fragment>
      <input
        autoFocus
        className={`${prefixCls}-title-input`}
        type="text"
        value={currentTitle}
        onChange={(e) => { setCurrentTitle(e.target.value); }}
        onKeyPress={e => callbackOnKeyPress(e, 'Enter', () => tree.changeNodeName(setKey, currentTitle, true))}
      />
      <button
        type="button"
        className={`${prefixCls}-title-save-button`}
        onClick={() => tree.changeNodeName(setKey, currentTitle, true)}
      >
        {wasPreviousCurrentSet ? 'Save' : 'Rename'}
      </button>
    </React.Fragment>
  );
}


function NamedSetNode(props) {
  const {
    isEditing,
  } = props;
  return (
    isEditing
      ? (<NamedSetNodeEditing {...props} />)
      : (<NamedSetNodeStatic {...props} />)
  );
}

export default class TreeNode extends RcTreeNode {
  renderSelector = () => {
    const {
      title,
      size,
      isCurrentSet,
      isSelected,
      isEditing,
    } = this.props;
    const {
      rcTree: {
        prefixCls,
        draggable,
      },
    } = this.context;

    const wrapClass = `${prefixCls}-node-content-wrapper`;
    const isDraggable = (!isCurrentSet && !isEditing && draggable);
    return (
      <span
        ref={this.setSelectHandle}
        title={title}
        className={classNames(
          wrapClass,
          `${wrapClass}-${this.getNodeState() || 'normal'}`,
          isSelected && `${prefixCls}-node-selected`,
          isDraggable && 'draggable',
        )}
        draggable={isDraggable}
        aria-grabbed={isDraggable}
        onDragStart={isDraggable ? this.onDragStart : undefined}
      >
        {isCurrentSet ? (
          <CurrentSetNode {...this.props} prefixCls={prefixCls} />
        ) : (
          <NamedSetNode {...this.props} prefixCls={prefixCls} />
        )}
        <span className={`${prefixCls}-set-size`}>{size}</span>
      </span>
    );
  };

  render() {
    const { loading } = this.props;
    const {
      className, style,
      dragOver, dragOverGapTop, dragOverGapBottom,
      isLeaf,
      expanded, selected, checked, halfChecked,
      ...otherProps
    } = this.props;
    const {
      rcTree: {
        prefixCls,
        filterTreeNode,
        draggable,
      },
    } = this.context;
    const disabled = this.isDisabled();
    const dataOrAriaAttributeProps = getDataAndAria(otherProps);
    return (
      <li
        className={classNames(className, {
          [`${prefixCls}-treenode-disabled`]: disabled,
          [`${prefixCls}-treenode-switcher-${expanded ? 'open' : 'close'}`]: !isLeaf,
          [`${prefixCls}-treenode-checkbox-checked`]: checked,
          [`${prefixCls}-treenode-checkbox-indeterminate`]: halfChecked,
          [`${prefixCls}-treenode-selected`]: selected,
          [`${prefixCls}-treenode-loading`]: loading,

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
        {...dataOrAriaAttributeProps}
      >
        {this.renderSwitcher()}
        {this.renderCheckbox()}
        {this.renderSelector()}
        {this.renderChildren()}
      </li>
    );
  }
}
