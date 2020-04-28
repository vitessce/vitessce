/* eslint-disable */
import React from 'react';
import { Tree as AntTree } from 'antd';
import TreeNode from './TreeNode';

export default class Tree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedKeys: [],
      autoExpandParent: true,
    };

    this.onCheckNode = this.onCheckNode.bind(this);
    this.onExpand = this.onExpand.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  onExpand(expandedKeys) {
    // We want autoExpandParent to be initially true so that we see the whole tree.
    // But, when autoExpandParent is set to true, a parent cannot be collapsed
    // if there are expanded children.
    // So upon an expansion interaction, we always want autoExpandParent to be false
    // to allow a parent with expanded children to collapse.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  onCheckNode(checkedKeys) {
    const { tree } = this.props;
    tree.setCheckedKeys(checkedKeys);
  }

  onDrop(info) {
    const {
      tree,
      tabRoot,
    } = this.props;

    const { eventKey: dropKey } = info.node.props;
    const { eventKey: dragKey } = info.dragNode.props;
    const { dropToGap, dropPosition } = info;

    // Update the tree based on the drag event.
    tree.dragRearrange(tabRoot, dropKey, dragKey, dropPosition, dropToGap);
  }

  renderTreeNodes(nodes) {
    if (!nodes) {
      return null;
    }
    const { tree } = this.props;
    return nodes.map(item => (
      <TreeNode key={item.key} tree={tree} {...item.getRenderProps()}>
        {this.renderTreeNodes(item.children)}
      </TreeNode>
    ));
  }

  render() {
    const {
      tree,
    } = this.props;

    const {
      expandedKeys,
      autoExpandParent,
    } = this.state;

    return (
        <AntTree
          draggable={false}
          checkable
          blockNode
          onExpand={this.onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onCheck={this.onCheckNode}
          checkedKeys={tree.checkedKeys}
          onDrop={this.onDrop}
          prefixCls="rc-tree"
      >
        {this.renderTreeNodes(tree.children)}
      </AntTree>
    );
  }
}
