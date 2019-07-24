import React from 'react';
import { Tabs, Icon } from 'antd';
import SetsManagerTab from './SetsManagerTab';
import 'antd/es/tabs/style/index.css';
import SetUnionSVG from '../../assets/set_union.svg';
import SetIntersectionSVG from '../../assets/set_intersection.svg';
import SetComplementSVG from '../../assets/set_complement.svg';

const { TabPane } = Tabs;

export default function SetsManager(props) {
  const { setsTree } = props;
  return (
    <div className="sets-manager">
      <Tabs type="card">
        {setsTree.tabRoots.map(tabRoot => (
          <TabPane tab={tabRoot.name} key={tabRoot.name}>
            <SetsManagerTab setsTree={setsTree} tabRoot={tabRoot} />
          </TabPane>
        ))}
      </Tabs>

      <div className="sets-manager-icon-bar">
        <Icon
          component={SetUnionSVG}
          title="New set from union of checked sets"
          onClick={() => {
            const checkedUnion = setsTree.getUnion(setsTree.checkedKeys);
            setsTree.setCurrentSet(checkedUnion, true);
            setsTree.emitVisibilityUpdate();
          }}
        />
        <Icon
          component={SetIntersectionSVG}
          title="New set from intersection of checked sets"
          onClick={() => {
            const checkedIntersection = setsTree.getIntersection(setsTree.checkedKeys);
            setsTree.setCurrentSet(checkedIntersection, true);
            setsTree.emitVisibilityUpdate();
          }}
        />
        <Icon
          component={SetComplementSVG}
          title="New set from complement of checked sets"
          onClick={() => {
            const checkedComplement = setsTree.getComplement(setsTree.checkedKeys);
            setsTree.setCurrentSet(checkedComplement, true);
            setsTree.emitVisibilityUpdate();
          }}
        />
      </div>
    </div>
  );
}
