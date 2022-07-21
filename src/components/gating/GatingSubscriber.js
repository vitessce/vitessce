import React, { useMemo } from 'react';
import TextField from '@material-ui/core/TextField';
import { Component } from '../../app/constants';
import ScatterplotSubscriber, {
  SCATTERPLOT_DATA_TYPES,
} from '../scatterplot/ScatterplotSubscriber';
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
  const [{
    dataset,
    gatingFeatureValueTransform,
    gatingFeatureValueTransformCoefficient,
    gatingFeatureSelectionX,
    gatingFeatureSelectionY,
  }, {
    setGatingFeatureValueTransform,
    setGatingFeatureValueTransformCoefficient,
    setGatingFeatureSelectionX,
    setGatingFeatureSelectionY,

  }] = useCoordination(
    COMPONENT_COORDINATION_TYPES[Component.GATING],
    coordinationScopes,
  );

  // Get data from loaders using the data hooks.
  const [urls, addUrl, resetUrls] = useUrls();
  const loaders = useLoaders();
  const [isReady, setItemIsReady, setItemIsNotReady, resetReadyItems] = useReady(
    SCATTERPLOT_DATA_TYPES,
  );
  const [cells, cellsCount] = useCellsData(loaders, dataset, setItemIsReady, addUrl, true);
  const [expressionMatrix] = useExpressionMatrixData(
    loaders, dataset, setItemIsReady, addUrl, true,
  );

  const transformOptions = [
    { name: 'None', value: '' },
    { name: 'Log', value: 'log1p' },
    { name: 'ArcSinh', value: 'arcsinh' }];
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

    if (newValues.length === 1
      && gatingFeatureSelectionX
      && !gatingFeatureSelectionY
      && newValues[0] !== gatingFeatureSelectionX) {
      setGatingFeatureSelectionY(newValues[0]);
    } else if (newValues.length <= 2) {
      setGatingFeatureSelectionX(newValues[0]);
      setGatingFeatureSelectionY(newValues[1]);
    }
  };

  const handleTransformChange = (event) => {
    setGatingFeatureValueTransform(event.target.value);
  };

  // Feels a little hacky, but I think this is the best way to handle
  // the limitations of the v4 material-ui number input.
  const handleTransformCoefficientChange = (event) => {
    const { value } = event.target;
    if (!value) {
      setGatingFeatureValueTransformCoefficient(value);
    } else {
      const newCoefficient = Number(value);
      if (!Number.isNaN(newCoefficient) && newCoefficient >= 0) {
        setGatingFeatureValueTransformCoefficient(value);
      }
    }
  };

  // eslint-disable-next-line no-console
  console.log([gatingFeatureSelectionX, gatingFeatureSelectionY].filter(v => v));

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
          value={[gatingFeatureSelectionX, gatingFeatureSelectionY].filter(v => v)}
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
          value={gatingFeatureValueTransform || ''}
          onChange={handleTransformChange}
          inputProps={{
            id: 'scatterplot-transform-select',
          }}
        >
          {transformOptions.map(opt => (
            <option key={opt.name} value={opt.value}>
              {opt.name}
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
          value={gatingFeatureValueTransformCoefficient}
          InputLabelProps={{
            shrink: true,
          }}
        />
      ),
    },
  ];

  const mapping = `MAPPING_${gatingFeatureSelectionX}_${gatingFeatureSelectionY})`;

  const title = useMemo(
    () => {
      if (!(gatingFeatureSelectionX && gatingFeatureSelectionY)) {
        return 'Gating';
      }
      return `Gating (${gatingFeatureSelectionX} vs ${gatingFeatureSelectionY})`;
    }, [gatingFeatureSelectionX, gatingFeatureSelectionY],
  );

  // Generate a new cells object with a mapping added for the user selected genes.
  const cellsWithGenes = useMemo(
    () => {
      if (!(gatingFeatureSelectionX && gatingFeatureSelectionY)) {
        return [];
      }

      // Get transform coefficient for log and arcsinh
      let coefficient = 1;
      const parsedTransformCoefficient = Number(gatingFeatureValueTransformCoefficient);
      if (!Number.isNaN(parsedTransformCoefficient) && parsedTransformCoefficient > 0) {
        coefficient = parsedTransformCoefficient;
      }

      // Set transform function
      let transformFunction;
      switch (gatingFeatureValueTransform) {
        case 'log1p':
          transformFunction = v => Math.log(1 + v * coefficient);
          break;
        case 'arcsinh':
          transformFunction = v => Math.asinh(v * coefficient);
          break;
        default:
          transformFunction = v => v;
      }

      // Get the columns for the selected genes.
      const selectedGeneCols = [
        expressionMatrix.cols.indexOf(gatingFeatureSelectionX),
        expressionMatrix.cols.indexOf(gatingFeatureSelectionY),
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
    [gatingFeatureSelectionX, gatingFeatureSelectionY, gatingFeatureValueTransformCoefficient,
      gatingFeatureValueTransform, expressionMatrix, cells, mapping],
  );

  // Puts the mapping values in the cell info tooltip.
  const getCellInfoOverride = (cellId) => {
    const cell = cells[cellId];
    let genePrefix = '';
    const selectedTransformOption = transformOptions.filter(
      o => o.value === gatingFeatureValueTransform,
    );
    if (selectedTransformOption) genePrefix = `${selectedTransformOption.name} `;

    const cellInfo = { [`${capitalize(observationsLabel)} ID`]: cellId };
    if (gatingFeatureSelectionX && gatingFeatureSelectionY) {
      const [firstMapping, secondMapping] = cell.mappings[mapping];
      cellInfo[genePrefix + gatingFeatureSelectionX] = firstMapping;
      cellInfo[genePrefix + gatingFeatureSelectionY] = secondMapping;
    }

    return cellInfo;
  };

  let polygonCacheId = '';
  if (gatingFeatureValueTransform) polygonCacheId = `${gatingFeatureValueTransform}_${gatingFeatureValueTransformCoefficient}`;

  return (
    <ScatterplotSubscriber
      {...props}
      loaders={loaders}
      cellsData={[cellsWithGenes, cellsCount]}
      useReadyData={[isReady, setItemIsReady, setItemIsNotReady, resetReadyItems]}
      urlsData={[urls, addUrl, resetUrls]}
      mapping={mapping}
      title={title}
      customOptions={customOptions}
      hideTools={!(gatingFeatureSelectionX && gatingFeatureSelectionY)}
      cellsEmptyMessage="Select two genes in the settings."
      getCellInfoOverride={getCellInfoOverride}
      cellSetsPolygonCacheId={polygonCacheId}
    />
  );
}
