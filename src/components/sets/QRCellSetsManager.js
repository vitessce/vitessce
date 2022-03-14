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

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ArrowRight from '@material-ui/icons/ArrowRight';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import MoreVert from '@material-ui/icons/MoreVert';

const useStyles = makeStyles((theme) => ({
  arrowButtonRoot: {
    padding: '0px',
  },
}));



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

  const classes = useStyles();

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
      <div className="qrCellSetsTableContainer">
        <div className="qrCellSetsTableLeft">
          <div className="qrCellSetsTableRow">
            <div className="qrCellSetsTableArrow colArrow"></div>
            <div className="qrCellSetsTableHead colName"></div>
            <div className="qrCellSetsTableHead colPrediction">Prediction</div>
            <div className="qrCellSetsTableHead colSimilarity">Similarity</div>
            <div className="qrCellSetsTableHead colEdit"></div>
          </div>
          {qryTopGenesLists ? Object.entries(qryTopGenesLists).map(([clusterIndex, clusterResults]) => (
            <div className="qrCellSetsTableRow" key={clusterIndex}>
              <div className="qrCellSetsTableArrow colArrow">
                <IconButton component="span" classes={{ root: classes.arrowButtonRoot }}>
                  <ArrowRight />
                </IconButton>
              </div>
              <div className="qrCellSetsTableHead colName">
                Cluster {clusterIndex}
              </div>
              <div className="qrCellSetsTableHead colPrediction"></div>
              <div className="qrCellSetsTableHead colSimilarity"></div>
              <div className="qrCellSetsTableHead colEdit">
                <IconButton component="span" classes={{ root: classes.arrowButtonRoot }}>
                  <MoreVert />
                </IconButton>
              </div>
            </div>
          )) : null}
          
        </div>
        <div className="qrCellSetsTableRight">
          <div className="qrCellSetsTableRightInner">
            <div className="qrCellSetsTableRow">
              <div className="qrCellSetsTableHead colTopGenes">Top genes</div>
            </div>
            {qryTopGenesLists ? Object.entries(qryTopGenesLists).map(([clusterIndex, clusterResults]) => (
              <div className="qrCellSetsTableRow" key={clusterIndex}>
                {clusterResults.names.map(geneName => (
                  <div className="qrCellSetsTableHead colGeneResult" key={geneName}>
                    {geneName}
                  </div>
                ))}
              </div>
            )) : null}
          </div>
        </div>
      </div>

      
     
      
    </div>
  );
}
