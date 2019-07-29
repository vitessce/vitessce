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
    prefixClass,
    tree,
  } = props;
  return (
    <input
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus
      value={title}
      type="text"
      className={`${prefixClass}-current-set-input`}
      onChange={(e) => { tree.changeNodeName(setKey, e.target.value); }}
      onFocus={e => e.target.select()}
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
    prefixClass,
    tree,
    setKey,
  } = props;
  return (
    <React.Fragment>
      <button
        type="button"
        onClick={() => { tree.viewSet(setKey); }}
        onKeyPress={e => callbackOnKeyPress(e, 'v', () => tree.viewSet(setKey))}
        className={`${prefixClass}-title`}
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
    prefixClass,
    tree,
    setKey,
    wasPreviousCurrentSet,
  } = props;
  const [currentTitle, setCurrentTitle] = useState(title);
  return (
    <React.Fragment>
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        className={`${prefixClass}-title-input`}
        type="text"
        value={currentTitle}
        onChange={(e) => { setCurrentTitle(e.target.value); }}
        onKeyPress={e => callbackOnKeyPress(e, 'Enter', () => tree.changeNodeName(setKey, currentTitle, true))}
      />
      <button
        type="button"
        className={`${prefixClass}-title-save-button`}
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
        {isCurrentSet ? (
          <CurrentSetNode {...this.props} prefixClass={prefixClass} />
        ) : (
          <NamedSetNode {...this.props} prefixClass={prefixClass} />
        )}
        <span className={`${prefixClass}-set-size`}>{size}</span>
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
        prefixCls: prefixClass,
        filterTreeNode,
        draggable,
      },
    } = this.context;
    const disabled = this.isDisabled();
    const dataAndAriaAttributeProps = getDataAndAria(otherProps);
    return (
      <li
        className={classNames(className, {
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
        onDrop={draggable ? this.onDrop : undefined}
        onDragEnd={draggable ? this.onDragEnd : undefined}
        {...dataAndAriaAttributeProps}
      >
        {this.renderSwitcher()}
        {this.renderCheckbox()}
        {this.renderSelector()}
        {this.renderChildren()}
      </li>
    );
  }
}
