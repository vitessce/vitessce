import React, { useState } from 'react';
import { Icon } from 'antd';
import { TreeNode as RcTreeNode } from 'rc-tree';
import { getDataAndAria } from 'rc-tree/es/util';
import classNames from 'classnames';
import PopoverMenu from './PopoverMenu';
import PopoverColor from './PopoverColor';
import { callbackOnKeyPress, range, levelNameFromIndex } from './utils';

import { ReactComponent as EyeSVG } from '../../assets/tools/eye.svg';
import { ReactComponent as PenSVG } from '../../assets/tools/pen.svg';
import { ReactComponent as TrashSVG } from '../../assets/tools/trash.svg';

function makeNodeViewMenuConfig(props) {
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
    // Show view buttons for viewing descendants at each level.
    ...range(level).map(i => (
      {
        name: `View ${levelNameFromIndex(i)}`,
        handler: () => tree.viewSetDescendants(setKey, i),
        handlerKey: `${i}`,
      }
    )),
    // Show new tab button if not a leaf node.
    ...(level > 0 ? [{
      name: 'Open in new tab',
      handler: () => tree.newTab(setKey),
      handlerKey: 't',
    }] : []),
  ];
}

function NamedSetNodeStatic(props) {
  const {
    title,
    prefixClass,
    tree,
    setKey,
    isTrusted,
  } = props;
  const [iconsVisible, setIconsVisible] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => { tree.viewSet(setKey); }}
        onKeyPress={e => callbackOnKeyPress(e, 'v', () => tree.viewSet(setKey))}
        onMouseMove={() => setIconsVisible(true)}
        onMouseLeave={() => setIconsVisible(false)}
        className={`${prefixClass}-title`}
        title={`View ${title}`}
      >
        {title}
      </button>
      <span
        className={`${prefixClass}-node-menu-trigger-container`}
        style={{ opacity: (iconsVisible ? 1 : 0) }}
        onMouseMove={() => setIconsVisible(true)}
        onMouseLeave={() => setIconsVisible(false)}
      >
        <PopoverMenu
          menuConfig={makeNodeViewMenuConfig(props)}
          onClose={() => setIconsVisible(false)}
        >
          <Icon component={EyeSVG} className={`${prefixClass}-node-menu-trigger`} title="View options" />
        </PopoverMenu>
        {!isTrusted ? (
          <>
            <Icon component={PenSVG} className={`${prefixClass}-node-menu-trigger`} title="Rename" onClick={() => tree.startEditing(setKey)} />
            <PopoverMenu
              menuConfig={[{
                name: 'Delete',
                handler: () => tree.deleteNode(setKey),
                handlerKey: 'd',
              }, {
                name: 'Cancel',
                handler: () => {},
                handlerKey: 'x',
              }]}
              onClose={() => setIconsVisible(false)}
            >
              <Icon component={TrashSVG} className={`${prefixClass}-node-menu-trigger`} title="Delete" />
            </PopoverMenu>
          </>
        ) : null}
      </span>
    </>
  );
}

function NamedSetNodeEditing(props) {
  const {
    title,
    prefixClass,
    tree,
    setKey,
  } = props;
  const [currentTitle, setCurrentTitle] = useState(title);
  return (
    <>
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        className={`${prefixClass}-title-input`}
        type="text"
        value={currentTitle}
        onChange={(e) => { setCurrentTitle(e.target.value); }}
        onKeyPress={e => callbackOnKeyPress(e, 'Enter', () => tree.changeNodeName(setKey, currentTitle, true))}
        onFocus={e => e.target.select()}
      />
      <button
        type="button"
        className={`${prefixClass}-title-save-button`}
        onClick={() => tree.changeNodeName(setKey, currentTitle, true)}
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

export default class TreeNode extends RcTreeNode {
  renderSelector = () => {
    const {
      tree,
      setKey,
      title,
      size,
      color,
      isCurrentSet,
      isSelected,
      isEditing,
      isTrusted,
    } = this.props;
    const {
      rcTree: {
        prefixCls: prefixClass,
        draggable,
      },
    } = this.context;

    const wrapClass = `${prefixClass}-node-content-wrapper`;
    const isDraggable = (!isTrusted && !isCurrentSet && !isEditing && draggable);
    return (
      <span
        ref={this.setSelectHandle}
        title={title}
        className={classNames(
          wrapClass,
          `${wrapClass}-${this.getNodeState() || 'normal'}`,
          isSelected && `${prefixClass}-node-selected`,
          isDraggable && 'draggable',
          isTrusted && 'trusted',
        )}
        draggable={isDraggable}
        aria-grabbed={isDraggable}
        onDragStart={isDraggable ? this.onDragStart : undefined}
      >
        <NamedSetNode {...this.props} prefixClass={prefixClass} />
        <span className={`${prefixClass}-title-right`}>
          <span className={`${prefixClass}-set-size`}>{size || null}</span>
          <PopoverColor
            prefixClass={prefixClass}
            color={color}
            setColor={c => tree.changeNodeColor(setKey, c)}
          />
        </span>
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
        onDrop={draggable ? this.onDrop.bind(this) : undefined}
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
