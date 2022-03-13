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
    qryCellSets,
    refCellSets,

    qryDiffGeneNames,
    qryDiffGeneScores,
    refDiffGeneNames,
    refDiffGeneScores,

    refDiffGeneScoreThreshold,
    qryDiffGeneScoreThreshold,
  } = props;

  const qryTopGenesLists = useMemo(() => {
    if(qryDiffGeneNames && qryDiffGeneScores && qryDiffGeneScoreThreshold) {
      const result = {};
      qryDiffGeneScores.data.forEach((clusterScores, clusterIndex) => {
        const maxIndex = clusterScores.findIndex(el => el < qryDiffGeneScoreThreshold);
        result[clusterIndex] = {
          names: qryDiffGeneNames[clusterIndex].slice(0, maxIndex),
          scores: clusterScores.slice(0, maxIndex),
        };
      });
      return result;
    }
    return null;
  }, [qryDiffGeneNames, qryDiffGeneScores, qryDiffGeneScoreThreshold]);

  return (
    <div className="qrCellSets">
      <h4>Top genes for each query cluster at score threshold {qryDiffGeneScoreThreshold}</h4>
      {qryTopGenesLists ? Object.entries(qryTopGenesLists).map(([clusterIndex, clusterResults]) => (
        <div key={clusterIndex}>
          <b>Cluster {clusterIndex}: </b>
          {clusterResults.names.map(geneName => (
            <span key={geneName}>{geneName}, &nbsp;</span>
          ))}
        </div>
      )) : null}
    </div>
  );
}
