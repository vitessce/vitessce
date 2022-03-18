/* eslint-disable */
import React, {
  useEffect,
  useState,
  useCallback,
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
  useAnchors, useInitialCellSetSelection,
  useProcessedAnchorSets,
} from '../data-hooks';
import { Component } from '../../app/constants';
import { setCellSelection, mergeCellSets, PALETTE } from '../utils';
import range from 'lodash/range';
import sumBy from 'lodash/sumBy';


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
  
  const anchorApiState = qryValues.anchorApiState;
  const anchorIteration = anchorApiState.iteration;
  const anchorStatus = anchorApiState.status;
  const modelIteration = qryValues.modelApiState.iteration;
  const modelStatus = qryValues.modelApiState.status;

  const [urls, addUrl, resetUrls] = useUrls();
  const [
    isReady,
    setItemIsReady,
    setItemIsNotReady, // eslint-disable-line no-unused-vars
    resetReadyItems,
  ] = useReady([anchorStatus, modelStatus]);

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

  const [anchors, anchorsStatus] = useAnchors(qryLoader, anchorIteration, setItemIsReady);

  // Load the data.
  // Cell IDs
  const [qryCellsIndex, qryGenesIndex] = useAnnDataIndices(loaders, qryDataset, setItemIsReady, true);
  const [refCellsIndex, refGenesIndex] = useAnnDataIndices(loaders, refDataset, setItemIsReady, true);

  // Cell sets
  const [refCellType] = useAnnDataStatic(loaders, refDataset, refOptions?.features?.cellType?.path, 'columnString', setItemIsReady, false);
  const [qryPrediction, qryPredictionStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.prediction?.path, 'columnString', modelIteration, setItemIsReady, false);
  const [qryLabel, qryLabelStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.label?.path, 'columnString', modelIteration, setItemIsReady, false);

  const qryCellSets = useCellSetsTree(qryCellsIndex, [qryPrediction, qryLabel], ["Prediction", "Label"]);
  const refCellSets = useCellSetsTree(refCellsIndex, [refCellType], ["Cell Type"]);

  // Anchor matrix
  const [qryAnchorMatrix, qryAnchorMatrixStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.anchorMatrix?.path, 'columnNumeric', modelIteration, setItemIsReady, false);
  const [refAnchorMatrix, refAnchorMatrixStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.anchorMatrix?.path, 'columnNumeric', modelIteration, setItemIsReady, false);

  // Anchor cluster
  const [qryAnchorCluster, qryAnchorClusterStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.anchorCluster?.path, 'columnNumeric', modelIteration, setItemIsReady, false);
  const [refAnchorCluster, refAnchorClusterStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.features?.anchorCluster?.path, 'columnNumeric', modelIteration, setItemIsReady, false);
  const [qryAnchorDist, qryAnchorDistStatus] = useAnnDataDynamic(loaders, qryDataset, qryOptions?.features?.anchorDist?.path, 'columnNumeric', modelIteration, setItemIsReady, false);

  // Differential expression
  const [refDiffGeneNameIndices, refDiffGeneNamesStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.names?.path, 'columnNumeric', modelIteration, setItemIsReady, false);
  const [refDiffGeneScores, refDiffGeneScoresStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.scores?.path, 'columnNumeric', modelIteration, setItemIsReady, false);

  const refDiffGeneNames = useDiffGeneNames(refGenesIndex,refDiffGeneNameIndices);

  const mergedQryCellSets = useMemo(() => mergeCellSets(
    qryCellSets, qryValues.additionalCellSets,
  ), [qryCellSets, qryValues.additionalCellSets]);

  const mergedRefCellSets = useMemo(() => mergeCellSets(
    refCellSets, refValues.additionalCellSets,
  ), [refCellSets, refValues.additionalCellSets]);

  // Initialize cell set colors and selections.
  useInitialCellSetSelection(mergedQryCellSets, qryValues, qrySetters, "Prediction");
  useInitialCellSetSelection(mergedRefCellSets, refValues, refSetters, "Cell Type");

  const qryTopGenesLists = useProcessedAnchorSets(
    anchors, refDiffGeneNames, refDiffGeneScores, qryPrediction, qryCellsIndex, qryCellSets, qryValues.cellSetColor, "Prediction"
  );

  const onHighlightAnchors = useCallback((anchorId) => {
    qrySetters.setAnchorSetFocus(anchorId);
    
    // Highlight corresponding reference anchor set.
    const anchorGroup = Object.values(anchors).find(anchorSets => anchorSets.map(o => o.id).includes(anchorId));
    const anchorObj = anchorGroup.find(o => o.id === anchorId);
    refSetters.setAnchorSetFocus(anchorObj.anchor_ref_id);
  }, [anchors, qrySetters, refSetters]);


  const onDeleteAnchors = useCallback((anchorId) => {
    if(anchorApiState.status === 'success') {
      qrySetters.setAnchorApiState({ ...anchorApiState, status: 'loading' });
      qryLoader.anchorDelete(anchorId).then(() => {
        qrySetters.setAnchorApiState({ ...anchorApiState, iteration: anchorApiState.iteration+1, status: 'success' });
      });
    }
  }, [anchorApiState]);

  const onConfirmAnchors = useCallback((anchorId) => {
    if(anchorApiState.status === 'success') {
      qrySetters.setAnchorApiState({ ...anchorApiState, status: 'loading' });
      qryLoader.anchorConfirm(anchorId).then(result => {
        console.log(result);
        qrySetters.setAnchorApiState({ ...anchorApiState, iteration: anchorApiState.iteration+1, status: 'success' });
      });
    }
  }, [anchorApiState]);

  const onEditAnchors = useCallback((anchorId) => {
    onHighlightAnchors(anchorId);
    qrySetters.setAnchorEditMode({ mode: 'lasso', anchorId: anchorId });
    qrySetters.setAnchorEditTool('lasso');
  }, [onHighlightAnchors]);

  function resetCellSets(goodSelection) {
    if(goodSelection) {
      qrySetters.setAnchorEditMode(null);
      qrySetters.setAnchorEditTool(null);
    }
    qrySetters.setAdditionalCellSets(null);
    const parentKey = "Prediction";
    const node = mergedQryCellSets.tree.find(n => n.name === parentKey);
    if(node) {
      const newSelection = node.children.map(n => ([parentKey, n.name]));
      qrySetters.setCellSetSelection(newSelection);

      const newColors = newSelection.map((path, i) => ({
        color: PALETTE[i % PALETTE.length],
        path: path,
      }));
      qrySetters.setCellSetColor(newColors);
      qrySetters.setCellColorEncoding("cellSetSelection");
    }
  }

  useEffect(() => {
    if(anchorApiState.status !== 'success'){
      // Still in loading mode or had a previous error.
      return;
    }
    if(qryValues.additionalCellSets?.tree?.[0]?.children?.length !== 1 || qryValues.additionalCellSets.tree[0].children[0].set.length < 2) {
      // Selected set does not exist or it contains 0 or 1 cells.
      resetCellSets(false);
      return;
    }
    // Set exists, now just determine whether it is an addition or an edit.
    if(qryValues.anchorEditMode?.mode === 'lasso') {
      const anchorId = qryValues.anchorEditMode.anchorId;
      const cellIds = qryValues.additionalCellSets.tree[0].children[0].set.map(c => ({ cell_id: c[0] }));
      qrySetters.setAnchorApiState({ ...anchorApiState, status: 'loading' });
      qryLoader.anchorRefine(anchorId, cellIds).then(result => {
        console.log(result);
        qrySetters.setAnchorApiState({ ...anchorApiState, iteration: anchorApiState.iteration+1, status: 'success' });
        resetCellSets(true);

        const prevAnchorId = qryValues.anchorSetFocus;
        qrySetters.setAnchorSetFocus(null);
        setTimeout(() => {
          qrySetters.setAnchorSetFocus(prevAnchorId);
        }, 200);
      });
    } else if(qryValues.anchorEditMode === null) {
      const cellIds = qryValues.additionalCellSets.tree[0].children[0].set.map(c => ({ cell_id: c[0] }));
      const anchorId = `user-${anchorApiState.iteration}`; // TODO(scXAI)
      qrySetters.setAnchorApiState({ ...anchorApiState, status: 'loading' });
      qryLoader.anchorAdd(anchorId, cellIds).then(result => {
        console.log(result);
        qrySetters.setAnchorApiState({ ...anchorApiState, iteration: anchorApiState.iteration+1, status: 'success' });
        resetCellSets(true);
        qrySetters.setAnchorSetFocus(null);
      });
    }
  }, [qryValues.additionalCellSets]);

  const manager = useMemo(() => {
    return (
      <QRCellSetsManager
        qryCellSets={mergedQryCellSets}
        refCellSets={mergedRefCellSets}

        qryAnchorCluster={qryAnchorCluster}
        refAnchorCluster={refAnchorCluster}
        qryAnchorDist={qryAnchorDist}

        qryTopGenesLists={qryTopGenesLists}

        onDeleteAnchors={onDeleteAnchors}
        onConfirmAnchors={onConfirmAnchors}
        onEditAnchors={onEditAnchors}
        onHighlightAnchors={onHighlightAnchors}
      />
    );
  }, [qryTopGenesLists]); 

  return (
    <TitleInfo
      title={title}
      removeGridComponent={removeGridComponent}
      theme={theme}
      isReady={isReady}
      isScroll
    >
      {manager}
    </TitleInfo>
  );
}
