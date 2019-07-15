import React from 'react';
import RcTree, { TreeNode as RcTreeNode } from 'rc-tree';

import {
  getDataAndAria,
} from 'rc-tree/es/util';
import classNames from 'classnames';
import Icon from 'antd/es/tree/../icon';
import { ConfigConsumer } from 'antd/es/tree/../config-provider';
import { collapseMotion } from 'antd/es/tree/../_util/motion';

export class TreeNode extends RcTreeNode {
  renderShowHide = () => {
    const { selected } = this.props;
    const { rcTree: { prefixCls } } = this.context;

    return (
      <span
        className={classNames(
          `${prefixCls}-showhide`,
          selected && `${prefixCls}-showhide-selected`,
        )}
        onClick={this.onSelectorClick}
      >
        <Icon type={(selected ? 'eye' : 'eye-invisible')} theme="filled" />
      </span>
    );
  }

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

    // Title
    const $title = <span className={`${prefixCls}-title`}>{title}</span>;

    return (
      <span
        ref={this.setSelectHandle}
        title={typeof title === 'string' ? title : ''}
        className={classNames(
          `${wrapClass}`,
          `${wrapClass}-${this.getNodeState() || 'normal'}`,
        )}
      >
        {$title}
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
        {this.renderShowHide()}
        {this.renderSelector()}
        {this.renderChildren()}
      </li>
    );
  }
}
export class Tree extends React.Component {
    static defaultProps = {
      checkable: false,
      showIcon: false,
      motion: {
        ...collapseMotion,
        motionAppear: false,
      },
      blockNode: false,
    };

    constructor(props) {
      super(props);
      this.renderTree = this.renderTree.bind(this);
      this.setTreeRef = this.setTreeRef.bind(this);
    }

    renderSwitcherIcon(
      prefixCls,
      switcherIcon,
      { isLeaf, expanded, loading },
    ) {
      const { showLine } = this.props;
      if (loading) {
        return <Icon type="loading" className={`${prefixCls}-switcher-loading-icon`} />;
      }
      if (showLine) {
        if (isLeaf) {
          return <Icon type="file" className={`${prefixCls}-switcher-line-icon`} />;
        }
        return (
          <Icon
            type={expanded ? 'minus-square' : 'plus-square'}
            className={`${prefixCls}-switcher-line-icon`}
            theme="outlined"
          />
        );
      }
      const switcherCls = `${prefixCls}-switcher-icon`;
      if (isLeaf) {
        return null;
      }
      if (switcherIcon) {
        const switcherOriginCls = switcherIcon.props.className || '';
        return React.cloneElement(switcherIcon, {
          className: classNames(switcherOriginCls, switcherCls),
        });
      }
      return <Icon type="caret-down" className={switcherCls} theme="filled" />;
    }

    setTreeRef(node) {
      this.tree = node;
    }

    renderTree({ getPrefixCls }) {
      const { props } = this;
      const {
        prefixCls: customizePrefixCls,
        className,
        showIcon = Tree.defaultProps.showIcon,
        switcherIcon,
        blockNode = Tree.defaultProps.blockNode,
        children,
      } = props;
      const { checkable = Tree.defaultProps.checkable } = props;
      const prefixCls = getPrefixCls('tree', customizePrefixCls);
      return (
        <RcTree
          ref={this.setTreeRef}
          {...props}
          prefixCls={prefixCls}
          className={classNames(className, {
            [`${prefixCls}-icon-hide`]: !showIcon,
            [`${prefixCls}-block-node`]: blockNode,
          })}
          checkable={checkable ? <span className={`${prefixCls}-checkbox-inner`} /> : checkable}
          switcherIcon={nodeProps => this.renderSwitcherIcon(prefixCls, switcherIcon, nodeProps)
        }
        >
          {children}
        </RcTree>
      );
    }

    render() {
      return <ConfigConsumer>{this.renderTree}</ConfigConsumer>;
    }
}
