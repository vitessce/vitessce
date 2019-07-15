import React from 'react';
import RcTree, { TreeNode as RcTreeNode } from 'rc-tree';
import classNames from 'classnames';
import Icon from 'antd/es/tree/../icon';
import { ConfigConsumer, ConfigConsumerProps } from 'antd/es/tree/../config-provider';
import { collapseMotion } from 'antd/es/tree/../_util/motion';

export class TreeNode extends RcTreeNode {

}
export class Tree extends React.Component {
  constructor(props) {
    super(props);
    this.renderTree = this.renderTree.bind(this);
    this.setTreeRef = this.setTreeRef.bind(this);
  }

    static defaultProps = {
      checkable: false,
      showIcon: false,
      motion: {
        ...collapseMotion,
        motionAppear: false,
      },
      blockNode: false,
    };


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
      } if (switcherIcon) {
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
          {this.props.children}
        </RcTree>
      );
    }

    render() {
      return <ConfigConsumer>{this.renderTree}</ConfigConsumer>;
    }
}
