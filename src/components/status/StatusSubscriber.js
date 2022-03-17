/* eslint-disable */
import React, { useCallback, useMemo } from 'react';
import {
  useMultiDatasetCoordination, useDatasetUids,
  useWarning, useLoaders,
} from '../../app/state/hooks';
import {
  useAnchors,
  useAnnDataIndices,
} from '../data-hooks';
import { useUrls, useReady } from '../hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import TitleInfo from '../TitleInfo';
import Status from './Status';
import { Component } from '../../app/constants';
import sum from 'lodash/sum';

/**
 * A subscriber component for the status component,
 * which renders hovered cell/gene/molecule information
 * as well as schema validation and data loading errors.
 * @param {object} props
 * @param {string} props.theme The current theme name.
 * @param {object} props.coordinationScopes The mapping from coordination types to coordination
 * scopes.
 * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
 * to call when the component has been removed from the grid.
 * @param {string} props.title The component title.
 */
export default function StatusSubscriber(props) {
  const {
    coordinationScopes,
    removeGridComponent,
    theme,
    title = 'Polyphony',
  } = props;

  const warn = useWarning();
  const loaders = useLoaders();

  // Use multi-dataset coordination.
  const datasetUids = useDatasetUids(coordinationScopes);
  const refScope = "REFERENCE";
  const qryScope = "QUERY"
  const refDataset = datasetUids[refScope];
  const qryDataset = datasetUids[qryScope];

  // Get "props" from the coordination space.
  const [cValues, cSetters] = useMultiDatasetCoordination(
    COMPONENT_COORDINATION_TYPES[Component.STATUS],
    coordinationScopes,
  );
  const [qryValues, qrySetters] = [cValues[qryScope], cSetters[qryScope]];
  const [refValues, refSetters] = [cValues[refScope], cSetters[refScope]];
  
  
  const modelApiState = qryValues.modelApiState;
  const anchorApiState = qryValues.anchorApiState;

  const anchorIteration = anchorApiState.iteration;
  const anchorStatus = anchorApiState.status;
  const modelIteration = qryValues.modelApiState.iteration;
  const modelStatus = qryValues.modelApiState.status;

  const [
    isReady,
    setItemIsReady,
    setItemIsNotReady, // eslint-disable-line no-unused-vars
    resetReadyItems,
  ] = useReady([anchorStatus, modelStatus]);

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

  const onUpdateModel = useCallback(() => {
    if(modelApiState.status === 'success') {
      qrySetters.setModelApiState({ ...modelApiState, status: 'loading' });
      qryLoader.modelGet(modelApiState.iteration+1).then(result => {
        console.log(result);
        qrySetters.setModelApiState({ ...modelApiState, iteration: modelApiState.iteration+1, status: 'success' });
      });
    }
  }, [modelApiState]);

  const [numAnchorSetsConfirmed, numAnchorSetsTotal, numQueryCellsConfirmed, numQueryCellsTotal] = useMemo(() => {
    if(anchors && qryCellsIndex) {
      const numSetsConfirmed = anchors.confirmed.length;
      const numSetsTotal = sum(Object.values(anchors).map(a => a.length));

      const numCellsConfirmed = sum(anchors.confirmed.map(o => o.cells.length));
      const numCellsTotal = qryCellsIndex.length;
      return [numSetsConfirmed, numSetsTotal, numCellsConfirmed, numCellsTotal];
    }
    return [null, null, null, null];
  }, [anchors, qryCellsIndex]);
  

  return (
    <TitleInfo
      title={title}
      theme={theme}
      removeGridComponent={removeGridComponent}
      isReady
    >
      <Status
        warn={warn}
        numAnchorSetsConfirmed={numAnchorSetsConfirmed}
        numAnchorSetsTotal={numAnchorSetsTotal}
        numQueryCellsConfirmed={numQueryCellsConfirmed}
        numQueryCellsTotal={numQueryCellsTotal}
        onUpdateModel={onUpdateModel}
        modelStatus={modelStatus}
      />
    </TitleInfo>
  );
}
