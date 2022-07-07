import React, { useEffect } from 'react';
import BaseScatterplotSubscriber, {
  BASE_SCATTERPLOT_DATA_TYPES,
} from '../base-scatterplot/BaseScatterplotSubscriber';
import {
  useLoaders,
  useCoordination,
} from '../../app/state/hooks';
import { useReady, useUrls } from '../hooks';
import { useCellsData } from '../data-hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';

export default function ScatterplotSubscriber(props) {
  const {
    coordinationScopes,
    title: titleOverride,
  } = props;

  const [urls, addUrl, resetUrls] = useUrls();
  const loaders = useLoaders();
  const [isReady, setItemIsReady, setItemIsNotReady, resetReadyItems] = useReady(
    BASE_SCATTERPLOT_DATA_TYPES,
  );

  // Get "props" from the coordination space.
  const [{ dataset, embeddingType: mapping }] = useCoordination(
    COMPONENT_COORDINATION_TYPES.scatterplot,
    coordinationScopes,
  );

  const title = titleOverride || `Scatterplot (${mapping})`;

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  const [cells, cellsCount] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);

  return (
    <BaseScatterplotSubscriber
      {...props}
      loaders={loaders}
      cellsData={[cells, cellsCount]}
      useReadyData={[isReady, setItemIsReady, setItemIsNotReady, resetReadyItems]}
      urlsData={[urls, addUrl, resetUrls]}
      title={title}
      mapping={mapping}
    />
  );
}
