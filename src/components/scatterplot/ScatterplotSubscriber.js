import React from 'react';
import BaseScatterplotSubscriber, {
  BASE_SCATTERPLOT_DATA_TYPES,
} from '../base-scatterplot/BaseScatterplotSubscriber';
import {
  useLoaders,
  useCoordination,
} from '../../app/state/hooks';
import { useReady, useUrls } from '../hooks';
import { useCellsData } from '../data-hooks';
import OptionSelect from '../shared-plot-options/OptionSelect';
import { useStyles } from '../shared-plot-options/styles';
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

  // Get data from loaders using the data hooks.
  const [urls, addUrl, resetUrls] = useUrls();
  const loaders = useLoaders();
  const [isReady, setItemIsReady, setItemIsNotReady, resetReadyItems] = useReady(
    BASE_SCATTERPLOT_DATA_TYPES,
  );
  const [cells, cellsCount] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);


  const [selectedMapping, setSelectedMapping] = React.useState('');

  const handleSelectedMappingChange = (event) => {
    setSelectedMapping(event.target.value);
  };

  // Custom options for the scatterplot settings.
  const classes = useStyles();
  const customOptions = [];

  // If no mapping is set, allow the user to pick which mapping is displayed
  const cellIds = Object.keys(cells);
  if (!mapping && cellIds.length !== 0) {
    const { mappings } = cells[cellIds[0]];
    const mappingSelectOptions = ['', ...Object.keys(mappings)];
    customOptions.push(
      {
        label: 'Mapping',
        input: (
          <OptionSelect
            key="scatterplot-mapping-select"
            className={classes.select}
            value={selectedMapping}
            onChange={handleSelectedMappingChange}
            inputProps={{
              id: 'scatterplot-mapping-select',
            }}
          >
            {mappingSelectOptions.map(name => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </OptionSelect>
        ),
      },
    );
  }

  const plotMapping = mapping || selectedMapping;
  // Set cells to empty if no mapping is provided so that nothing is plotted.
  const plotCells = plotMapping ? cells : {};

  const defaultTitle = plotMapping ? `Scatterplot (${plotMapping})` : 'Scatterplot';
  const title = titleOverride || defaultTitle;

  return (
    <BaseScatterplotSubscriber
      {...props}
      loaders={loaders}
      cellsData={[plotCells, cellsCount]}
      useReadyData={[isReady, setItemIsReady, setItemIsNotReady, resetReadyItems]}
      urlsData={[urls, addUrl, resetUrls]}
      title={title}
      mapping={plotMapping}
      customOptions={customOptions}
      hideTools={!mapping}
      cellsEmptyMessage="Select a cell mapping in the settings."
    />
  );
}
