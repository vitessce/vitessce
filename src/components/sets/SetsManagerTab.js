/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { Tree, TreeNode } from './Tree';
import 'antd/es/tree/style/index.css';

const treeData = [
  {
    title: '0-0',
    key: '0-0',
    children: [
      {
        title: '0-0-0',
        key: '0-0-0',
        children: [
          { title: '0-0-0-0', key: '0-0-0-0' },
          { title: '0-0-0-1', key: '0-0-0-1' },
          { title: '0-0-0-2', key: '0-0-0-2' },
        ],
      },
      {
        title: '0-0-1',
        key: '0-0-1',
        children: [
          { title: '0-0-1-0', key: '0-0-1-0' },
          { title: '0-0-1-1', key: '0-0-1-1' },
          { title: '0-0-1-2', key: '0-0-1-2' },
        ],
      },
      {
        title: '0-0-2',
        key: '0-0-2',
      },
    ],
  },
  {
    title: '0-1',
    key: '0-1',
    children: [
      { title: '0-1-0-0', key: '0-1-0-0' },
      { title: '0-1-0-1', key: '0-1-0-1' },
      { title: '0-1-0-2', key: '0-1-0-2' },
    ],
  },
  {
    title: '0-2',
    key: '0-2',
  },
];

export default class SetsManagerTab extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedKeys: ['0-0-0', '0-0-1'],
      autoExpandParent: true,
      checkedKeys: ['0-0-0'],
      selectedKeys: [],
    };

    this.onCheck = this.onCheck.bind(this);
    this.onExpand = this.onExpand.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  onExpand(expandedKeys) {
    console.log('onExpand', expandedKeys);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  onCheck(checkedKeys) {
    console.log('onCheck', checkedKeys);
    this.setState({ checkedKeys });
  }

  onSelect(selectedKeys, info) {
    console.log('onSelect', info);
    this.setState({ selectedKeys });
  }

  renderTreeNodes(data) {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });
  }

  render() {
    const {
      sets,
      onUpdateSets = (msg) => {
        console.warn(`onUpdateSets from SetsManager ${msg}`);
      },
    } = this.props;

    return (
      <div className="sets-manager-tab">
        <Tree
          checkable
          onExpand={this.onExpand}
          expandedKeys={this.state.expandedKeys}
          autoExpandParent={this.state.autoExpandParent}
          onCheck={this.onCheck}
          checkedKeys={this.state.checkedKeys}
          onSelect={this.onSelect}
          selectedKeys={this.state.selectedKeys}
        >
          {this.renderTreeNodes(treeData)}
        </Tree>
      </div>
    );
  }
}
