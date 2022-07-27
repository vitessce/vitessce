import React, { useMemo } from 'react';
import ScatterplotSubscriber, {
  SCATTERPLOT_DATA_TYPES,
} from '../scatterplot/ScatterplotSubscriber';
import {
  useLoaders,
  useCoordination,
} from '../../app/state/hooks';
import { useReady, useUrls } from '../hooks';
import { useCellsData } from '../data-hooks';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import EmbeddingScatterplotOptions from './EmbeddingScatterplotOptions';
import { Component } from '../../app/constants';

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
   * @param {boolean} props.enableEmbeddingTypeSelection Should
   * the dropdown to select an embedding type be displayed? By default, false.
   */
export default function EmbeddingScatterplotSubscriber(props) {
  const {
    coordinationScopes,
    title: titleOverride,
    enableEmbeddingTypeSelection = false,
  } = props;

  // Get "props" from the coordination space.
  const [
    { dataset, embeddingType },
    { setEmbeddingType },
  ] = useCoordination(
    COMPONENT_COORDINATION_TYPES[Component.SCATTERPLOT],
    coordinationScopes,
  );

  // Get data from loaders using the data hooks.
  const [urls, addUrl, resetUrls] = useUrls();
  const loaders = useLoaders();
  const [isReady, setItemIsReady, setItemIsNotReady, resetReadyItems] = useReady(
    SCATTERPLOT_DATA_TYPES,
  );
  const cellsData = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);

  const availableEmbeddingTypes = useMemo(() => {
    const cellObjs = Object.values(cellsData?.[0] || {});
    if (cellObjs.length !== 0) {
      return Object.keys(cellObjs[0].mappings);
    }
    return null;
  }, [cellsData]);

  const customOptions = (
    <EmbeddingScatterplotOptions
      mappingSelectEnabled={enableEmbeddingTypeSelection}
      mappings={availableEmbeddingTypes}
      selectedMapping={embeddingType}
      setSelectedMapping={setEmbeddingType}
    />
  );

  const defaultTitle = embeddingType ? `Scatterplot (${embeddingType})` : 'Scatterplot';
  const title = titleOverride || defaultTitle;

  return (
    <ScatterplotSubscriber
      {...props}
      loaders={loaders}
      cellsData={cellsData}
      useReadyData={[isReady, setItemIsReady, setItemIsNotReady, resetReadyItems]}
      urlsData={[urls, addUrl, resetUrls]}
      title={title}
      mapping={embeddingType}
      customOptions={customOptions}
      hideTools={!embeddingType}
      cellsEmptyMessage="Select an embedding type in the plot settings."
    />
  );
}
