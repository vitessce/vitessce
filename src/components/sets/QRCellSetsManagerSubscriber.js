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
  useAnnDataStatic, useAnnDataDynamic, useAnnDataIndices,
  useDiffGeneNames, useCellSetsTree,
} from '../data-hooks';
import { Component } from '../../app/constants';
import { setCellSelection, mergeCellSets, PALETTE } from '../utils';
import range from 'lodash/range';
import sumBy from 'lodash/sumBy';


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
    refDiffGeneScoreThreshold = 15,
    qryDiffGeneScoreThreshold = 15,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, qryDataset, refDataset]);

  // Get the cells data loader for the query and reference datasets.
  const qryLoader = loaders[qryDataset].loaders.cells;
  const refLoader = loaders[refDataset].loaders.cells;
  // Get the loader options (from the view config file definition).
  const qryOptions = qryLoader?.options;
  const refOptions = refLoader?.options;

  // Load the data.
  // Cell IDs
  const [qryCellsIndex, qryGenesIndex] = useAnnDataIndices(loaders, qryDataset, setItemIsReady, true);
  const [refCellsIndex, refGenesIndex] = useAnnDataIndices(loaders, refDataset, setItemIsReady, true);

  // Cell sets
  const [refCellType] = useAnnDataStatic(loaders, refDataset, refOptions?.features?.cellType?.path, 'columnString', setItemIsReady, false);
  const [qryPrediction, qryPredictionStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.prediction?.path, 'columnString', iteration, setItemIsReady, false);
  const [qryLabel, qryLabelStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.label?.path, 'columnString', iteration, setItemIsReady, false);

  const qryCellSets = useCellSetsTree(qryCellsIndex, [qryPrediction, qryLabel], ["Prediction", "Label"]);
  const refCellSets = useCellSetsTree(refCellsIndex, [refCellType], ["Cell Type"]);

  // Anchor matrix
  const [qryAnchorMatrix, qryAnchorMatrixStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.anchorMatrix?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [refAnchorMatrix, refAnchorMatrixStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.anchorMatrix?.path, 'columnNumeric', iteration, setItemIsReady, false);

  // Anchor cluster
  const [qryAnchorCluster, qryAnchorClusterStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.anchorCluster?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [refAnchorCluster, refAnchorClusterStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.features?.anchorCluster?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [qryAnchorDist, qryAnchorDistStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.anchorDist?.path, 'columnNumeric', iteration, setItemIsReady, false);

  // Differential expression
  const [qryDiffGeneNameIndices, qryDiffGeneNamesStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.differentialGenes?.names?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [qryDiffGeneScores, qryDiffGeneScoresStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.differentialGenes?.scores?.path, 'columnNumeric', iteration, setItemIsReady, false);

  const [refDiffGeneNameIndices, refDiffGeneNamesStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.names?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [refDiffGeneScores, refDiffGeneScoresStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.scores?.path, 'columnNumeric', iteration, setItemIsReady, false);

  const qryDiffGeneNames = useDiffGeneNames(qryGenesIndex, qryDiffGeneNameIndices);
  const refDiffGeneNames = useDiffGeneNames(refGenesIndex,refDiffGeneNameIndices);

  const mergedQryCellSets = useMemo(() => mergeCellSets(
    qryCellSets, qryValues.additionalCellSets,
  ), [qryCellSets, qryValues.additionalCellSets]);

  const mergedRefCellSets = useMemo(() => mergeCellSets(
    refCellSets, refValues.additionalCellSets,
  ), [refCellSets, refValues.additionalCellSets]);

  const qryTopGenesLists = useMemo(() => {
    if(qryDiffGeneNames && qryDiffGeneScores && qryDiffGeneScoreThreshold && qryPrediction && qryAnchorCluster && qryCellSets && qryValues.cellSetColor) {
      console.log(qryPrediction, qryAnchorCluster);
      const parentKey = "Prediction";
      const predictionNode = qryCellSets.tree.find(n => n.name === parentKey);
      const predictionPaths = predictionNode.children.map(n => ([parentKey, n.name]));

      const result = {};
      qryDiffGeneScores.data.forEach((clusterScores, clusterIndex) => {
        const maxIndex = clusterScores.findIndex(el => el < qryDiffGeneScoreThreshold);
        result[clusterIndex] = {
          names: qryDiffGeneNames[clusterIndex].slice(0, maxIndex),
          scores: clusterScores.slice(0, maxIndex),
          predictionProportions: predictionPaths.map(path => {
            const [prefix, setName] = path;
            const color = qryValues.cellSetColor.find(o => isEqual(path, o.path))?.color;
            let numCellsInCluster = 0.0;
            let numCellsInClusterAndSet = 0.0;
            qryAnchorCluster.data.forEach((v, i) => {
              numCellsInCluster += (v === clusterIndex ? 1 : 0);
              numCellsInClusterAndSet += (v === clusterIndex && qryPrediction[i] === setName ? 1 : 0);
            });
            const proportion = numCellsInClusterAndSet / numCellsInCluster;
            return {
              name: setName,
              color: color,
              proportion: proportion,
            };
          }),
        };
      });
      console.log(result)
      return result;
    }
    return null;
  }, [qryDiffGeneNames, qryDiffGeneScores, qryDiffGeneScoreThreshold, qryPrediction, qryAnchorCluster, qryCellSets, qryValues.cellSetColor]);


  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
      isScroll
    >
      <QRCellSetsManager
        qryCellSets={mergedQryCellSets}
        refCellSets={mergedRefCellSets}

        qryAnchorCluster={qryAnchorCluster}
        refAnchorCluster={refAnchorCluster}
        qryAnchorDist={qryAnchorDist}

        qryTopGenesLists={qryTopGenesLists}

        
      />
    </TitleInfo>
  );
}
