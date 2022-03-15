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

  const iteration = qryValues.apiIteration;

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

  const [anchors, anchorsStatus] = useAnchors(qryLoader, iteration, setItemIsReady);

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
  const [refDiffGeneNameIndices, refDiffGeneNamesStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.names?.path, 'columnNumeric', iteration, setItemIsReady, false);
  const [refDiffGeneScores, refDiffGeneScoresStatus] = useAnnDataDynamic(loaders, refDataset, refOptions?.differentialGenes?.scores?.path, 'columnNumeric', iteration, setItemIsReady, false);

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

  const qryTopGenesLists = useMemo(() => {
    if(refDiffGeneNames && refDiffGeneScores && qryPrediction && qryCellSets && qryValues.cellSetColor) {
      const parentKey = "Prediction";
      const predictionNode = qryCellSets.tree.find(n => n.name === parentKey);
      const predictionPaths = predictionNode.children.map(n => ([parentKey, n.name]));

      const NUM_GENES = 20;

      const result = {};
      Object.keys(anchors).forEach(anchorType => {
        result[anchorType] = {};
        anchors[anchorType].forEach((anchorObj, clusterIndex) => {
          const refClusterTopGeneNames = refDiffGeneNames[anchorObj.anchor_ref_id].slice(0, NUM_GENES);
          const refClusterAllGeneNames = refDiffGeneNames[anchorObj.anchor_ref_id];
          const refClusterAllGeneScores = refDiffGeneScores.data[anchorObj.anchor_ref_id];
          
          let qryClusterAllGeneNames = [];
          let qryClusterAllGeneScores = [];
          if(!Array.isArray(anchorObj.rank_genes_groups)) {
            qryClusterAllGeneNames = anchorObj.rank_genes_groups.name_indice;
            qryClusterAllGeneScores = anchorObj.rank_genes_groups.score;
          } else {
            qryClusterAllGeneNames = anchorObj.rank_genes_groups.map(v => v.name_indice);
            qryClusterAllGeneScores = anchorObj.rank_genes_groups.map(v => v.score);
          }
          const qryClusterTopGeneNames = qryClusterAllGeneNames.slice(0, NUM_GENES);
  
          const topGeneNames = Array.from(new Set([...qryClusterTopGeneNames, ...refClusterTopGeneNames]));
  
          result[anchorType][anchorObj.id] = {
            id: anchorObj.id,
            names: topGeneNames,
            scores: topGeneNames.map(name => ({
              qry: qryClusterAllGeneScores[qryClusterAllGeneNames.indexOf(name)],
              ref: refClusterAllGeneScores[refClusterAllGeneNames.indexOf(name)],
            })),
            significances: topGeneNames.map(name => ({
              qry: qryClusterTopGeneNames.includes(name),
              ref: refClusterTopGeneNames.includes(name),
            })),
            latentDist: anchorObj.anchor_dist_median,
            predictionProportions: predictionPaths.map(path => {
              const [prefix, setName] = path;
              const color = qryValues.cellSetColor.find(o => isEqual(path, o.path))?.color;
              const numCellsInCluster = anchorObj.cells.length;
              const numCellsInClusterAndSet = anchorObj.cells.filter(cellObj => setName === qryPrediction[qryCellsIndex.indexOf(cellObj.cell_id)]).length;
              const proportion = numCellsInClusterAndSet / numCellsInCluster;
              return {
                name: setName,
                color: color,
                proportion: proportion,
              };
            }),
          };
        });
      });
      return result;
    }
    return null;
  }, [refDiffGeneNames, refDiffGeneScores, qryDiffGeneScoreThreshold, qryPrediction, qryCellsIndex, anchors, qryCellSets, qryValues.cellSetColor]);


  const onDeleteAnchors = useCallback((anchorId) => {
    qryLoader.anchorDelete(anchorId).then(result => {
      console.log(result);
      qrySetters.setApiIteration(qryValues.apiIteration+1);
    });
  }, [qryValues.apiIteration]);

  const onConfirmAnchors = useCallback((anchorId) => {
    qryLoader.anchorConfirm(anchorId).then(result => {
      console.log(result);
      qrySetters.setApiIteration(qryValues.apiIteration+1);
    });
  }, [qryValues.apiIteration]);

  const onEditAnchors = (anchorId) => {
    qrySetters.setAnchorEditMode({ mode: 'lasso', anchorId: anchorId });
  };

  function resetCellSets() {
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
    console.log(qryValues.additionalCellSets);
    if(qryValues.anchorEditMode?.mode === 'lasso' && qryValues.additionalCellSets?.tree?.[0]?.children?.length === 1) {
      const anchorId = qryValues.anchorEditMode.anchorId;
      const cellIds = qryValues.additionalCellSets.tree[0].children[0].set.map(c => ({ cell_id: c[0] }));
      qryLoader.anchorRefine(anchorId, cellIds).then(result => {
        console.log(result);
        qrySetters.setApiIteration(qryValues.apiIteration+1);
        resetCellSets();
      });
    } else if(qryValues.anchorEditMode === null && qryValues.additionalCellSets?.tree?.[0]?.children?.length === 1) {
      const cellIds = qryValues.additionalCellSets.tree[0].children[0].set.map(c => ({ cell_id: c[0] }));
      const anchorId = `user-${qryValues.apiIteration}`;
      qryLoader.anchorAdd(anchorId, cellIds).then(result => {
        console.log(result);
        qrySetters.setApiIteration(qryValues.apiIteration+1);
        resetCellSets();
      });
    }
  }, [qryValues.anchorEditMode, qryValues.additionalCellSets]);

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
