/* eslint-disable */
import React from 'react';
import SetsManagerTab from './SetsManagerTab';
import SetsManagerActionBar from './SetsManagerActionBar';
import 'antd/es/tabs/style/index.css';


export default function SetsManager(props) {
  const { setsTree, clearPleaseWait } = props;

  if (clearPleaseWait && setsTree) {
    clearPleaseWait('cell_sets');
  }

  return (
    <div className="sets-manager">
      <SetsManagerTab setsTree={setsTree} />
    </div>
  );
}
