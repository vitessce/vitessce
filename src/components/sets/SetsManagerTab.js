/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { Tree } from 'antd';
import TreeNode from './TreeNode';
import 'antd/es/tree/style/index.css';
import 'antd/es/popover/style/index.css';

export default class SetsManagerTab extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedKeys: [],
      autoExpandParent: true,
    };

    this.onCheck = this.onCheck.bind(this);
    this.onExpand = this.onExpand.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  onExpand(expandedKeys) {
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  onCheck(checkedKeys) {
    const { setsTree } = this.props;
    setsTree.setCheckedKeys(checkedKeys);
  }

  onDrop(info) {
    const {
      setsTree,
      tabRoot,
    } = this.props;
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    const { dropToGap } = info;
    const insertBottom = (
      (info.node.props.children || []).length > 0 // Has children
        && info.node.props.expanded // Is expanded
        && dropPosition === 1 // On the bottom gap
    );
    setsTree.dragRearrange(tabRoot,
      dropKey, dragKey, dropPosition, dropToGap, insertBottom);
  }


  renderTreeNodes(nodes) {
    const {
      setsTree,
    } = this.props;
    return nodes.map((item) => {
      if (item.children) {
        return (
          <TreeNode tree={setsTree} {...item.getRenderProps()}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode tree={setsTree} {...item.getRenderProps()} />
      );
    });
  }

  render() {
    const {
      setsTree,
      tabRoot,
    } = this.props;

    const {
      expandedKeys,
      autoExpandParent,
    } = this.state;

    return (
      <div className="sets-manager-tab">
        <Tree
          draggable
          checkable
          blockNode
          onExpand={this.onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onCheck={this.onCheck}
          checkedKeys={setsTree.checkedKeys}
          onDragEnter={() => { }}
          onDrop={this.onDrop}
        >
          {this.renderTreeNodes(tabRoot.children)}
        </Tree>
      </div>
    );
  }
}
