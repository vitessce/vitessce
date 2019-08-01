import React, { useRef } from 'react';
import classnames from 'classnames';
import { Tabs } from 'antd';
import SetsManagerTab from './SetsManagerTab';
import SetsManagerActionBar from './SetsManagerActionBar';
import 'antd/es/tabs/style/index.css';
import './sets-manager.scss';

const { TabPane } = Tabs;

const narrowWidthCutoff = 260;

export default function SetsManager(props) {
  const { setsTree } = props;

  const ref = useRef();
  const { current: el } = ref;
  const { width } = (el ? el.getBoundingClientRect() : {});

  return (
    <div ref={ref} className={classnames('sets-manager', { 'sets-manager-narrow': (width && width <= narrowWidthCutoff) })}>
      <Tabs type="card">
        {setsTree.tabRoots.map(tabRoot => (
          <TabPane tab={tabRoot.name} key={tabRoot.setKey}>
            <SetsManagerTab setsTree={setsTree} tabRoot={tabRoot} />
          </TabPane>
        ))}
      </Tabs>

      <SetsManagerActionBar {...props} />
    </div>
  );
}
