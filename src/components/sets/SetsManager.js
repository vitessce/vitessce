/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { Tabs, Popover } from 'antd';
import Icon from 'antd/es/tree/../icon';
import SetsManagerTab from './SetsManagerTab';
import 'antd/es/tabs/style/index.css';


const { TabPane } = Tabs;


function callback(key) {
  console.log(key);
}


function SetsManagerMenu(props) {
  return (
    <ul className="sets-manager-menu">
      <li>Import</li>
      <li>Export</li>
    </ul>
  );
}

export default class SetsManager extends React.Component {
  render() {
    const {
      setsTree,
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

        <Popover
          content={<SetsManagerMenu />}
          title={undefined}
          trigger="click"
          placement="bottom"
        >
          <Icon
            type="more"
            style={{
              cursor: 'pointer', right: '10px', position: 'absolute', top: '10px',
            }}
          />
        </Popover>
      </div>
    );
  }
}
