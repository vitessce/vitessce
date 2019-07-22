/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { Tabs } from 'antd';
import SetsManagerTab from './SetsManagerTab';
import 'antd/es/tabs/style/index.css';

const { TabPane } = Tabs;

export default class SetsManager extends React.Component {
  render() {
    const {
      setsTree,
    } = this.props;

    return (
      <div className="sets-manager">
        <Tabs onChange={() => {}} type="card">
          {setsTree.tabRoots.map(tabRoot => (
            <TabPane tab={tabRoot.name} key={tabRoot.name}>
              <SetsManagerTab setsTree={setsTree} tabRoot={tabRoot} />
            </TabPane>
          ))}
        </Tabs>
      </div>
    );
  }
}
