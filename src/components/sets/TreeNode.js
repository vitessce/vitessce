import React from 'react';
import RcTree, { TreeNode as RcTreeNode } from 'rc-tree';
import { Popover } from 'antd';

import {
  getDataAndAria,
} from 'rc-tree/es/util';
import classNames from 'classnames';
import Icon from 'antd/es/tree/../icon';
import { ConfigConsumer } from 'antd/es/tree/../config-provider';
import { collapseMotion } from 'antd/es/tree/../_util/motion';

export default class TreeNode extends RcTreeNode {
  renderSelector = () => {
    const {
      title,
      size,
    } = this.props;
    const {
      rcTree: {
        prefixCls,
      },
    } = this.context;

    const wrapClass = `${prefixCls}-node-content-wrapper`;

    return (
      <span
        ref={this.setSelectHandle}
        title={typeof title === 'string' ? title : ''}
        className={classNames(
          `${wrapClass}`,
          `${wrapClass}-${this.getNodeState() || 'normal'}`,
        )}
      >
        <Popover
          content={<p>Content</p>}
          title={undefined}
          trigger="click"
        >
          <span className={`${prefixCls}-title`}>{title}</span>
        </Popover>
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
