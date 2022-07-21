import React, { useMemo } from 'react';
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
import { COMPONENT_COORDINATION_TYPES } from '../../app/state/coordination';
import GatingScatterplotOptions from './GatingScatterplotOptions';

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


  // eslint-disable-next-line no-console
  console.log([gatingFeatureSelectionX, gatingFeatureSelectionY].filter(v => v));

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

  const customOptions = (
    <GatingScatterplotOptions
      gatingFeatureSelectionX={gatingFeatureSelectionX}
      setGatingFeatureSelectionX={setGatingFeatureSelectionX}
      gatingFeatureSelectionY={gatingFeatureSelectionY}
      setGatingFeatureSelectionY={setGatingFeatureSelectionY}
      gatingFeatureValueTransform={gatingFeatureValueTransform}
      setGatingFeatureValueTransform={setGatingFeatureValueTransform}
      gatingFeatureValueTransformCoefficient={gatingFeatureValueTransformCoefficient}
      setGatingFeatureValueTransformCoefficient={setGatingFeatureValueTransformCoefficient}
      geneSelectOptions={geneSelectOptions}
      transformOptions={transformOptions}
    />
  );

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
