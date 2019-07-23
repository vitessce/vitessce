/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import { TreeNode as RcTreeNode } from 'rc-tree';
import { Popover, Icon } from 'antd';

import { getDataAndAria } from 'rc-tree/es/util';
import classNames from 'classnames';

function range(stop) {
  return Array.from(Array(stop), (x, i) => i);
}

function levelNameFromIndex(i) {
  if (i === 0) {
    return 'children';
  } if (i === 1) {
    return 'grandchildren';
  }
  return `level ${i} descendants`;
}

function CurrentSetNode(props) {
  const {
    title,
    setKey,
    prefixCls,
    tree,
  } = props;
  return (
    <input
      value={title}
      type="text"
      className={`${prefixCls}-current-set-input`}
      onChange={(e) => { tree.changeNodeName(setKey, e.target.value); }}
    />
  );
}

function NamedSetNodeMenu(props) {
  const {
    tree,
    setKey,
    level,
  } = props;
  return (
    <ul className="named-set-node-menu">
      <li onClick={() => { tree.viewSet(setKey); }}>View</li>
      {range(level).map(i => (
        <li key={i} onClick={() => { tree.viewSetDescendants(setKey, i); }}>
            View {levelNameFromIndex(i)}
        </li>
      ))}
      <li onClick={() => { tree.startEditing(setKey); }}>Rename</li>
      <li onClick={() => { tree.deleteNode(setKey); }}>Delete</li>
    </ul>
  );
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
      <span onClick={() => { tree.viewSet(setKey); }} className={`${prefixCls}-title`}>{title}</span>
      <Popover
        content={<NamedSetNodeMenu {...props} />}
        trigger="click"
      >
        <Icon type="ellipsis" className="named-set-node-menu-trigger" />
      </Popover>
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
      />
      <button
        type="button"
        className={`${prefixCls}-title-button`}
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
        onDrop={draggable ? this.onDrop : undefined}
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
