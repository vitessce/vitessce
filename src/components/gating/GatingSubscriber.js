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
import { getValueTransformFunction, VALUE_TRANSFORM_OPTIONS } from './utils';

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
    featureValueTransform,
    featureValueTransformCoefficient,
    gatingFeatureSelectionX,
    gatingFeatureSelectionY,
  }, {
    setFeatureValueTransform,
    setFeatureValueTransformCoefficient,
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

  const transformOptions = VALUE_TRANSFORM_OPTIONS;
  const geneSelectOptions = expressionMatrix && expressionMatrix.cols ? expressionMatrix.cols : [];

  const mapping = (gatingFeatureSelectionX && gatingFeatureSelectionY
    ? `MAPPING_${gatingFeatureSelectionX}_${gatingFeatureSelectionY}`
    : null
  );

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
      const parsedTransformCoefficient = Number(featureValueTransformCoefficient);
      if (!Number.isNaN(parsedTransformCoefficient) && parsedTransformCoefficient > 0) {
        coefficient = parsedTransformCoefficient;
      }

      // Set transform function
      const transformFunction = getValueTransformFunction(
        featureValueTransform,
        coefficient,
      );

      // Get the columns for the selected genes.
      const selectedGeneCols = [
        expressionMatrix.cols.indexOf(gatingFeatureSelectionX),
        expressionMatrix.cols.indexOf(gatingFeatureSelectionY),
      ];

      const updatedCells = {};
      // Iterate through cells and build new cells with added mapping.
      expressionMatrix.rows.forEach((cellId, index) => {
        // Need to use new cell object reference
        // to prevent other plots from seeing these
        // changes to the cells objects.
        const cellMatrixRowOffset = expressionMatrix.cols.length * index;
        updatedCells[cellId] = {
          ...cells[cellId],
          mappings: {
            ...cells[cellId].mappings,
            [mapping]: [
              transformFunction(expressionMatrix.matrix[cellMatrixRowOffset + selectedGeneCols[0]]),
              transformFunction(expressionMatrix.matrix[cellMatrixRowOffset + selectedGeneCols[1]]),
            ],
          },
        };
      });

      return updatedCells;
    },
    [gatingFeatureSelectionX, gatingFeatureSelectionY, featureValueTransformCoefficient,
      featureValueTransform, expressionMatrix, cells, mapping],
  );

  // Puts the mapping values in the cell info tooltip.
  const getCellInfoOverride = (cellId) => {
    const cell = cellsWithGenes[cellId];
    const selectedTransformName = transformOptions.find(
      o => o.value === featureValueTransform,
    )?.name;
    const genePrefix = featureValueTransform ? `${selectedTransformName} ` : '';

    const cellInfo = { [`${capitalize(observationsLabel)} ID`]: cellId };
    if (gatingFeatureSelectionX && gatingFeatureSelectionY) {
      const [firstMapping, secondMapping] = cell.mappings[mapping];
      cellInfo[genePrefix + gatingFeatureSelectionX] = firstMapping;
      cellInfo[genePrefix + gatingFeatureSelectionY] = secondMapping;
    }

    return cellInfo;
  };

  let polygonCacheId = '';
  if (featureValueTransform) polygonCacheId = `${featureValueTransform}_${featureValueTransformCoefficient}`;

  const customOptions = (
    <GatingScatterplotOptions
      gatingFeatureSelectionX={gatingFeatureSelectionX}
      setGatingFeatureSelectionX={setGatingFeatureSelectionX}
      gatingFeatureSelectionY={gatingFeatureSelectionY}
      setGatingFeatureSelectionY={setGatingFeatureSelectionY}
      gatingFeatureValueTransform={featureValueTransform}
      setGatingFeatureValueTransform={setFeatureValueTransform}
      gatingFeatureValueTransformCoefficient={featureValueTransformCoefficient}
      setGatingFeatureValueTransformCoefficient={setFeatureValueTransformCoefficient}
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
      cellsEmptyMessage="Select two genes in the plot settings."
      getCellInfoOverride={getCellInfoOverride}
      cellSetsPolygonCacheId={polygonCacheId}
    />
  );
}
