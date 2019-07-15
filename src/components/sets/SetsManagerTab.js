/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { Tree, TreeNode } from './Tree';
import 'antd/es/tree/style/index.css';

export default class SetsManagerTab extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
    };

    this.onCheck = this.onCheck.bind(this);
    this.onExpand = this.onExpand.bind(this);
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

  renderTreeNodes(data) {
    console.log(data);
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
      setsTree,
      tabRoot,
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
        >
          {this.renderTreeNodes(tabRoot.getRenderData(true))}
        </Tree>
      </div>
    );
  }
}
