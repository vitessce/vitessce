/* eslint-disable */
import React from 'react';
import Tree from './Tree';
import SetsManagerActionBar from './SetsManagerActionBar';
import 'antd/es/tabs/style/index.css';


export default function SetsManager(props) {
  const { setsTree, clearPleaseWait } = props;

  if (clearPleaseWait && setsTree) {
    clearPleaseWait('cell_sets');
  }

  return (
    <div className="sets-manager">
      <Tree setsTree={setsTree} />
    </div>
  );
}
