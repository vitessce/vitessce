/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { Tabs } from 'antd';
import 'antd/es/tabs/style/index.css';
import SetsManagerTab from './SetsManagerTab';

const { TabPane } = Tabs;


function callback(key) {
  console.log(key);
}

export default class SetsManager extends React.Component {
  render() {
    const {
      setsTree,
      onUpdateSets = (msg) => {
        console.warn(`onUpdateSets from SetsManager ${msg}`);
      },
    } = this.props;

    return (
      <div className="sets-manager">
        <Tabs onChange={callback} type="card">
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
