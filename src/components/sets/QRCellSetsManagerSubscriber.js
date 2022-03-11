/* eslint-disable */
import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';
import {
  useMutation,
} from 'react-query';
import isEqual from 'lodash/isEqual';
import {
  useMultiDatasetCoordination,
  useLoaders,
  useSetWarning,
  useDatasetUids,
} from '../../app/state/hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import QRCellSetsManager from './QRCellSetsManager';
import TitleInfo from '../TitleInfo';
import { useUrls, useReady } from '../hooks';
import {
  useCellsData, useCellSetsData, useGeneSelection, useExpressionAttrs,
  useAnnDataStatic, useAnnDataDynamic
} from '../data-hooks';
import { Component } from '../../app/constants';

const CELL_SETS_DATA_TYPES = ['cells', 'cell-sets', 'expression-matrix'];

const QRY_PREDICTION_KEY = 'Prediction';
const QRY_LABEL_KEY = 'Label';
const REF_CELL_TYPE_KEY = 'Cell Type';

const iteration = 1;

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

  // Reference: https://react-query.tanstack.com/guides/mutations
  const mutation = useMutation(newTodo => {
    
    // return axios.post('/todos', newTodo);

  });

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
  ] = useReady([]);

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
    /*setCellSetExpansion([]);*/
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, qryDataset, refDataset]);

  const qryLoader = loaders[qryDataset].loaders.cells;
  const refLoader = loaders[refDataset].loaders.cells;

  const qryOptions = qryLoader?.options;
  const refOptions = refLoader?.options;
  
  // Cell IDs
  const [qryCellsIndex] = useAnnDataStatic(loaders, qryDataset, qryOptions?.observations?.path, 'columnString', setItemIsReady, true);
  const [refCellsIndex] = useAnnDataStatic(loaders, refDataset, refOptions?.observations?.path, 'columnString', setItemIsReady, true);

  // Cell sets
  const [refCellType] = useAnnDataStatic(loaders, refDataset, refOptions?.features?.cellType?.path, 'columnString', setItemIsReady, false);
  const [qryPrediction, qryPredictionStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.prediction?.path, 'columnString', iteration, setItemIsReady, false);
  const [qryLabel, qryLabelStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.label?.path, 'columnString', iteration, setItemIsReady, false);

  // Anchor cluster
  const [qryAnchorCluster, qryAnchorClusterStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.anchorCluster?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [refAnchorCluster, refAnchorClusterStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.features?.anchorCluster?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [qryAnchorDist, qryAnchorDistStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.anchorDist?.path, 'columnNumeric', iteration, setItemIsReady, false);

  // Differential expression
  const [qryDiffGeneNames, qryDiffGeneNamesStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.differentialGenes?.names?.path, 'columnString', iteration, setItemIsReady, false);
  const [qryDiffGeneScores, qryDiffGeneScoresStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.differentialGenes?.scores?.path, 'columnNumeric', iteration, setItemIsReady, false);

  console.log(qryDiffGeneNames);

  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
    >
      {/*<QRCellSetsManager
        qryPredictionSets={qryPredictionSets}
        qryLabelSets={qryLabelSets}
        refCellTypeSets={refCellTypeSets}
      />*/}
    </TitleInfo>
  );
}
