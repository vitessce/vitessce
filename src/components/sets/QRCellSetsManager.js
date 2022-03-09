/* eslint-disable */
/* eslint-disable no-underscore-dangle */
import React, { useState, useMemo } from 'react';
import isEqual from 'lodash/isEqual';
import Tree from './Tree';
import TreeNode from './TreeNode';
import { PlusButton, SetOperationButtons } from './SetsManagerButtons';
import { nodeToRenderProps } from './cell-set-utils';
import { getDefaultColor } from '../utils';
import { pathToKey } from './utils';



/**
 * A query+reference cell set manager component.
 */
export default function QRCellSetsManager(props) {
  const {
    qryPredictionSets,
    qryLabelSets,
    refCellTypeSets,
  } = props;

  return (
    <div className="qrCellSets">
      <p>TODO(scXAI): src/components/sets/QRCellSetsManagerSubscriber.js</p>
      {qryPredictionSets.map(node => (
        <div>{node.name}</div>
      ))}
    </div>
  );
}
