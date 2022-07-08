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

/**
   * A subscriber component for the cell mapping scatterplot.
   * @param {object} props
   * @param {number} props.uuid The unique identifier for this component.
   * @param {string} props.theme The current theme name.
   * @param {object} props.coordinationScopes The mapping from coordination types to coordination
   * scopes.
   * @param {boolean} props.disableTooltip Should the tooltip be disabled?
   * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
   * to call when the component has been removed from the grid.
   * @param {string} props.title An override value for the component title.
   * @param {number} props.averageFillDensity Override the average fill density calculation
   * when using dynamic opacity mode.
   */
export default function ScatterplotSubscriber(props) {
  const {
    coordinationScopes,
    title: titleOverride,
  } = props;

  // Get "props" from the coordination space.
  const [{ dataset, embeddingType: mapping }] = useCoordination(
    COMPONENT_COORDINATION_TYPES.scatterplot,
    coordinationScopes,
  );

  const title = titleOverride || `Scatterplot (${mapping})`;

  // Get data from loaders using the data hooks.
  const [urls, addUrl, resetUrls] = useUrls();
  const loaders = useLoaders();
  const [isReady, setItemIsReady, setItemIsNotReady, resetReadyItems] = useReady(
    BASE_SCATTERPLOT_DATA_TYPES,
  );
  const [cells, cellsCount] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

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
