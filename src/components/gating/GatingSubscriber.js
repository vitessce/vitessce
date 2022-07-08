import React, {
  useMemo, useEffect,
} from 'react';
import TextField from '@material-ui/core/TextField';
import BaseScatterplotSubscriber, {
  BASE_SCATTERPLOT_DATA_TYPES,
} from '../base-scatterplot/BaseScatterplotSubscriber';
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
   * A subscriber component for the scatterplot.
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
  } = props;

  const [urls, addUrl, resetUrls] = useUrls();
  const loaders = useLoaders();
  const [isReady, setItemIsReady, setItemIsNotReady, resetReadyItems] = useReady(
    BASE_SCATTERPLOT_DATA_TYPES,
  );

  // Get "props" from the coordination space.
  const [{ dataset }] = useCoordination(
    COMPONENT_COORDINATION_TYPES.scatterplot,
    coordinationScopes,
  );

  // Reset file URLs and loader progress when the dataset has changed.
  useEffect(() => {
    resetUrls();
    resetReadyItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaders, dataset]);

  const [selectedGenes, setSelectedGenes] = React.useState([]);
  const TRANSFORM_OPTIONS = ['None', 'Log', 'ArcSinh'];
  const [transformType, setTransformType] = React.useState('');
  const [transformCoefficient, setTransformCoefficient] = React.useState('');

  const [cells, cellsCount] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);
  const [expressionMatrix] = useExpressionMatrixData(
    loaders, dataset, setItemIsReady, addUrl, true,
  );

  const geneSelectOptions = expressionMatrix && expressionMatrix.cols ? expressionMatrix.cols : [];

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
          {TRANSFORM_OPTIONS.map(name => (
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

  const cellsWithGenes = useMemo(
    () => {
      if (selectedGenes.length < 2) {
        return [];
      }

      let coefficient = 1;
      const parsedTransformCoefficient = Number(transformCoefficient);
      if (!Number.isNaN(parsedTransformCoefficient) && parsedTransformCoefficient > 0) {
        coefficient = parsedTransformCoefficient;
      }

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

      const selectedGeneCols = [
        expressionMatrix.cols.indexOf(selectedGenes[0]),
        expressionMatrix.cols.indexOf(selectedGenes[1]),
      ];
      const updatedCells = {};
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

  const title = useMemo(
    () => {
      if (selectedGenes.length < 2) {
        return 'Gating';
      }
      return `Gating (${selectedGenes[0]} vs ${selectedGenes[1]})`;
    }, [selectedGenes],
  );

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
    />
  );
}
