/* eslint-disable */
/* eslint-disable no-underscore-dangle */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import Tree from './Tree';
import TreeNode from './TreeNode';
import { PlusButton, SetOperationButtons } from './SetsManagerButtons';
import { nodeToRenderProps } from './cell-set-utils';
import { getDefaultColor } from '../utils';
import { pathToKey } from './utils';
import { useVitessceContainer } from '../hooks';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ArrowRight from '@material-ui/icons/ArrowRight';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import MoreVert from '@material-ui/icons/MoreVert';
import Popover from '@material-ui/core/Popover';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Portal from '@material-ui/core/Portal';


import { ReactComponent as SignifInQry } from '../../assets/qr/signif_in_qry.svg';
import { ReactComponent as SignifInRef } from '../../assets/qr/signif_in_ref.svg';
import { ReactComponent as SignifInBoth } from '../../assets/qr/signif_in_both.svg';

const useStyles = makeStyles((theme) => ({
  arrowButtonRoot: {
    padding: '0px',
  },
}));

function SignificanceIcon(props) {
  const { inRef, inQry, geneName } = props;

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const outerRef = useRef();
  const iconRef = useRef();
  const getTooltipContainer = useVitessceContainer(outerRef);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if(outerRef && outerRef.current) {
      const containerRect = outerRef.current.getBoundingClientRect();
      setX(containerRect.left);
      setY(containerRect.top);
    }
    if(iconRef && iconRef.current) {
      const handleMouseEnter = () => {
        setOpen(true);
        console.log(x, y);
      };
      const handleMouseLeave = () => {
        setOpen(false);
      };
      const container = iconRef.current;
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
    return () => {};
  }, [iconRef, outerRef, x, y]);

  return (<div ref={outerRef} style={{position: 'relative'}}>

    <span ref={iconRef}>{
      (inRef && inQry ? (
        <SignifInBoth className="signifInBoth" />
      ) : (inRef ? (
        <SignifInRef className="signifInRef" />
      ) : (inQry ? (
        <SignifInQry className="signifInQry" />
      ) : null)))}
    </span>
    {(outerRef && outerRef.current && open ? (
      <Portal
        container={getTooltipContainer}
      >
        <div className="signifIconTooltip" style={{ top: `${y - 40}px`, left: `${x}px` }}>{geneName}</div>
      </Portal>
    ) : null)}
  </div>);
}


const barWidth = 120;

function TableRowLeft(props) {
  const { clusterIndex, clusterResults } = props;

  const classes = useStyles();

  return (
    <div className="qrCellSetsTableRow" key={clusterIndex}>
      <div className="qrCellSetsTableArrow colArrow">
        <IconButton component="span" classes={{ root: classes.arrowButtonRoot }}>
          <ArrowRight />
        </IconButton>
      </div>
      <div className="qrCellSetsTableHead colName">
        Cluster {clusterIndex}
      </div>
      <div className="qrCellSetsTableHead colPrediction">
        {clusterResults.predictionProportions.map((predictionObj) => (
          <div className="predictionBar" key={predictionObj.name} style={{ height: '30px', width: `${barWidth*predictionObj.proportion}px`, backgroundColor: `rgb(${predictionObj.color[0]}, ${predictionObj.color[1]}, ${predictionObj.color[2]})`}}>

          </div>
        ))}
        
      </div>
      <div className="qrCellSetsTableHead colSimilarity"></div>
      <div className="qrCellSetsTableHead colEdit">
        <IconButton component="span" classes={{ root: classes.arrowButtonRoot }}>
          <MoreVert />
        </IconButton>
      </div>
    </div>
  );
}

function TableRowRight(props) {
  const {
    clusterIndex,
    clusterResults,
  } = props;

  const classes = useStyles();

  return (
    <div className="qrCellSetsTableRow" key={clusterIndex}>
      {clusterResults.names.map(geneName => (
        <div className="qrCellSetsTableHead colGeneResult" key={geneName}>
          <SignificanceIcon inRef={true} inQry={true} geneName={geneName} />
        </div>
      ))}
    </div>
  );
}



/**
 * A query+reference cell set manager component.
 */
export default function QRCellSetsManager(props) {
  const {
    qryCellSets,
    refCellSets,

    qryTopGenesLists,
  } = props;

  const classes = useStyles();


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
            <TableRowLeft key={clusterIndex} clusterIndex={clusterIndex} clusterResults={clusterResults} />
          )) : null}
        </div>
        <div className="qrCellSetsTableRight">
          <div className="qrCellSetsTableRightInner">
            <div className="qrCellSetsTableRow">
              <div className="qrCellSetsTableHead colTopGenes">Top genes</div>
            </div>
            {qryTopGenesLists ? Object.entries(qryTopGenesLists).map(([clusterIndex, clusterResults]) => (
              <TableRowRight key={clusterIndex} clusterIndex={clusterIndex} clusterResults={clusterResults} />
            )) : null}
          </div>
        </div>
      </div>

      
     
      
    </div>
  );
}
