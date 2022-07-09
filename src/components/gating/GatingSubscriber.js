import React, { useMemo } from 'react';
import TextField from '@material-ui/core/TextField';
import BaseScatterplotSubscriber, {
  BASE_SCATTERPLOT_DATA_TYPES,
} from '../base-scatterplot/BaseScatterplotSubscriber';
import { capitalize } from '../../utils';
import {
  useLoaders,
  useCoordination,
} from '../../app/state/hooks';
import {
  useReady, useUrls,
} from '../hooks';
import {
  useCellsData,
  useExpressionMatrixData,
} from '../data-hooks';
import OptionSelect from '../shared-plot-options/OptionSelect';
import { useStyles } from '../shared-plot-options/styles';
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';


/**
   * A subscriber component for the gating scatterplot.
   * @param {object} props
   * @param {number} props.uuid The unique identifier for this component.
   * @param {string} props.theme The current theme name.
   * @param {object} props.coordinationScopes The mapping from coordination types to coordination
   * scopes.
   * @param {boolean} props.disableTooltip Should the tooltip be disabled?
   * @param {function} props.removeGridComponent The callback function to pass to TitleInfo,
   * to call when the component has been removed from the grid.
   * @param {number} props.averageFillDensity Override the average fill density calculation
   * when using dynamic opacity mode.
   */
export default function GatingSubscriber(props) {
  const {
    coordinationScopes,
    observationsLabelOverride: observationsLabel = 'cell',
  } = props;

  // Get "props" from the coordination space.
  const [{ dataset }] = useCoordination(
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
  const [expressionMatrix] = useExpressionMatrixData(
    loaders, dataset, setItemIsReady, addUrl, true,
  );

  // State for the custom setting options.
  const [selectedGenes, setSelectedGenes] = React.useState([]);
  const [transformType, setTransformType] = React.useState('');
  const [transformCoefficient, setTransformCoefficient] = React.useState('');

  const transformOptions = ['None', 'Log', 'ArcSinh'];
  const geneSelectOptions = expressionMatrix && expressionMatrix.cols ? expressionMatrix.cols : [];

  // Handlers for custom option field changes.
  const handleGeneSelectChange = (event) => {
    const { options } = event.target;
    const newValues = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        newValues.push(options[i].value);
      }
    }
    if (newValues.length === 1 && selectedGenes.length === 1 && newValues[0] !== selectedGenes[0]) {
      newValues.unshift(selectedGenes[0]);
    }
    if (newValues.length <= 2) setSelectedGenes(newValues);
  };

  const handleTransformTypeChange = (event) => {
    setTransformType(event.target.value);
  };

  // Feels a little hacky, but I think this is the best way to handle
  // the limitations of the v4 material-ui number input.
  const handleTransformCoefficientChange = (event) => {
    const { value } = event.target;
    if (!value) {
      setTransformCoefficient(value);
    } else {
      const newCoefficient = Number(value);
      if (!Number.isNaN(newCoefficient) && newCoefficient >= 0) {
        setTransformCoefficient(value);
      }
    }
  };

  // Custom options for the scatterplot settings.
  const classes = useStyles();
  const customOptions = [
    {
      label: 'Genes',
      input: (
        <OptionSelect
          key="gating-gene-select"
          multiple
          className={classes.select}
          value={selectedGenes}
          onChange={handleGeneSelectChange}
          inputProps={{
            id: 'scatterplot-gene-select',
          }}
        >
          {geneSelectOptions.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </OptionSelect>
      ),
    },
    {
      label: 'Transform',
      input: (
        <OptionSelect
          key="gating-transform-select"
          className={classes.select}
          value={transformType}
          onChange={handleTransformTypeChange}
          inputProps={{
            id: 'scatterplot-transform-select',
          }}
        >
          {transformOptions.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </OptionSelect>
      ),
    },
    {
      label: 'Transform Coefficient',
      input: (
        <TextField
          label="Number"
          type="number"
          onChange={handleTransformCoefficientChange}
          value={transformCoefficient}
          InputLabelProps={{
            shrink: true,
          }}
        />
      ),
    },
  ];

  const mapping = `MAPPING_${selectedGenes[0]}_${selectedGenes[1]})`;

  const title = useMemo(
    () => {
      if (selectedGenes.length < 2) {
        return 'Gating';
      }
      return `Gating (${selectedGenes[0]} vs ${selectedGenes[1]})`;
    }, [selectedGenes],
  );

  // Generate a new cells object with a mapping added for the user selected genes.
  const cellsWithGenes = useMemo(
    () => {
      if (selectedGenes.length < 2) {
        return [];
      }

      // Get transform coefficient for log and arcsinh
      let coefficient = 1;
      const parsedTransformCoefficient = Number(transformCoefficient);
      if (!Number.isNaN(parsedTransformCoefficient) && parsedTransformCoefficient > 0) {
        coefficient = parsedTransformCoefficient;
      }

      // Set transform function
      let transformFunction;
      switch (transformType) {
        case 'Log':
          transformFunction = v => Math.log10(1 + v * coefficient);
          break;
        case 'ArcSinh':
          transformFunction = v => Math.asinh(v * coefficient);
          break;
        default:
          transformFunction = v => v;
      }

      // Get the columns for the selected genes.
      const selectedGeneCols = [
        expressionMatrix.cols.indexOf(selectedGenes[0]),
        expressionMatrix.cols.indexOf(selectedGenes[1]),
      ];

      const updatedCells = {};
      // Iterate through cells and build new cells with added mapping.
      expressionMatrix.rows.forEach((cellId, index) => {
        const curCell = cells[cellId];
        const cellMatrixRowOffset = expressionMatrix.cols.length * index;
        curCell.mappings[mapping] = [
          transformFunction(expressionMatrix.matrix[cellMatrixRowOffset + selectedGeneCols[0]]),
          transformFunction(expressionMatrix.matrix[cellMatrixRowOffset + selectedGeneCols[1]]),
        ];
        updatedCells[cellId] = curCell;
      });

      return updatedCells;
    },
    [selectedGenes, transformType, transformCoefficient, expressionMatrix, cells, mapping],
  );

  // Puts the mapping values in the cell info tooltip.
  const getCellInfoOverride = (cellId) => {
    const cell = cells[cellId];
    let genePrefix = '';
    if (transformType !== 'None') genePrefix = `${transformType} `;

    const cellInfo = { [`${capitalize(observationsLabel)} ID`]: cellId };
    if (selectedGenes && selectedGenes.length === 2) {
      const [firstGene, secondGene] = selectedGenes;
      const [firstMapping, secondMapping] = cell.mappings[mapping];
      cellInfo[genePrefix + firstGene] = firstMapping;
      cellInfo[genePrefix + secondGene] = secondMapping;
    }

    return cellInfo;
  };

  let polygonCacheId = '';
  if (transformType !== 'None') polygonCacheId = `${transformType}_${transformCoefficient}`;

  return (
    <BaseScatterplotSubscriber
      {...props}
      loaders={loaders}
      cellsData={[cellsWithGenes, cellsCount]}
      useReadyData={[isReady, setItemIsReady, setItemIsNotReady, resetReadyItems]}
      urlsData={[urls, addUrl, resetUrls]}
      mapping={mapping}
      title={title}
      customOptions={customOptions}
      hideTools={selectedGenes.length < 2}
      cellsEmptyMessage="Select two genes in the settings."
      getCellInfoOverride={getCellInfoOverride}
      cellSetsPolygonCacheId={polygonCacheId}
    />
  );
}
