/* eslint-disable */
import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';
import isEqual from 'lodash/isEqual';
import packageJson from '../../../package.json';
import {
  useMultiDatasetCoordination,
  useLoaders,
  useSetWarning,
  useDatasetUids,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import QRCellSetsManager from './QRCellSetsManager';
import TitleInfo from '../TitleInfo';
import {
  treeExportLevelZeroNode,
  treeExportSet,
  treeToExpectedCheckedLevel,
  nodeToLevelDescendantNamePaths,
  treeToIntersection,
  treeToUnion,
  treeToComplement,
  treeFindNodeByNamePath,
  treesConflict,
  nodeTransform,
  nodeAppendChild,
  nodePrependChild,
  nodeInsertChild,
  filterNode,
  treeInitialize,
  initializeCellSetColor,
} from './cell-set-utils';
import {
  isEqualOrPrefix,
  tryRenamePath,
  PATH_SEP,
} from './utils';
import {
  downloadForUser,
  handleExportJSON,
  handleExportTabular,
  tryUpgradeTreeToLatestSchema,
} from './io';
import {
  FILE_EXTENSION_JSON,
  FILE_EXTENSION_TABULAR,
  SETS_DATATYPE_CELL,
} from './constants';
import { useUrls, useReady } from '../hooks';
import {
  setCellSelection,
  mergeCellSets,
  getNextNumberedNodeName,
} from '../utils';
import { useCellsData, useCellSetsData, useGeneSelection, useExpressionAttrs } from '../data-hooks';
import { Component } from '../../app/constants';

const CELL_SETS_DATA_TYPES = ['cells', 'cell-sets', 'expression-matrix'];

const QRY_PREDICTION_KEY = 'Prediction';
const QRY_LABEL_KEY = 'Label';
const REF_CELL_TYPE_KEY = 'Cell Type';

/**
 * A subscriber wrapper around the SetsManager component
 * for the 'cell' datatype.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export default function QRCellSetsManagerSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Cell Sets',
  } = props;

  const loaders = useLoaders();
  const setWarning = useSetWarning();

  // Use multi-dataset coordination.
  const datasetUids = useDatasetUids(coordinationScopes);
  const refScope = "REFERENCE";
  const qryScope = "QUERY"
  const refDataset = datasetUids[refScope];
  const qryDataset = datasetUids[qryScope];
  // Get "props" from the coordination space.
  const [cValues, cSetters] = useMultiDatasetCoordination(
    COMPONENT_COORDINATION_TYPES[Component.QR_CELL_SETS],
    coordinationScopes,
  );
  const [qryValues, qrySetters] = [cValues[qryScope], cSetters[qryScope]];
  const [refValues, refSetters] = [cValues[refScope], cSetters[refScope]];

  const [urls, addUrl, resetUrls] = useUrls();
  const [
    isReady,
    setItemIsReady,
    setItemIsNotReady, // eslint-disable-line no-unused-vars
    resetReadyItems,
  ] = useReady(
    CELL_SETS_DATA_TYPES,
  );

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
    /*setCellSetExpansion([]);*/
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, qryDataset, refDataset]);

  
  // Get data from loaders using the data hooks.
  const [qryCells] = useCellsData(loaders, qryDataset, setItemIsReady, addUrl, true);
  const [refCells] = useCellsData(loaders, refDataset, setItemIsReady, addUrl, true);
  const [qryCellSets] = useCellSetsData(
    loaders, qryDataset, setItemIsReady, addUrl, true,
    { setCellSetSelection: qrySetters.setCellSetSelection, setCellSetColor: qrySetters.setCellSetColor },
    { cellSetSelection: qryValues.cellSetSelection, cellSetColor: qryValues.cellSetColor },
  );
  const [refCellSets] = useCellSetsData(
    loaders, refDataset, setItemIsReady, addUrl, true,
    { setCellSetSelection: refSetters.setCellSetSelection, setCellSetColor: refSetters.setCellSetColor },
    { cellSetSelection: refValues.cellSetSelection, cellSetColor: refValues.cellSetColor },
  );

  const [qryExpressionData] = useGeneSelection(
    loaders, qryDataset, setItemIsReady, false, qryValues.geneSelection, setItemIsNotReady,
  );
  const [qryAttrs] = useExpressionAttrs(
    loaders, qryDataset, setItemIsReady, addUrl, false,
  );
  
  const [refExpressionData] = useGeneSelection(
    loaders, refDataset, setItemIsReady, false, refValues.geneSelection, setItemIsNotReady,
  );
  const [refAttrs] = useExpressionAttrs(
    loaders, refDataset, setItemIsReady, addUrl, false,
  );

  console.log("query", qryCellSets);
  console.log("reference", refCellSets);

  const qryPredictionSets = qryCellSets?.tree?.find(n => n.name === QRY_PREDICTION_KEY)?.children || [];
  const qryLabelSets = qryCellSets?.tree?.find(n => n.name === QRY_LABEL_KEY)?.children || [];
  const refCellTypeSets = refCellSets?.tree?.find(n => n.name === REF_CELL_TYPE_KEY)?.children || [];

  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
    >
      <QRCellSetsManager
        qryPredictionSets={qryPredictionSets}
        qryLabelSets={qryLabelSets}
        refCellTypeSets={refCellTypeSets}
      />
    </TitleInfo>
  );
}
