import React, { useCallback, useMemo } from 'react';
import { clamp, isEqual } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { extent } from 'd3-array';
import { VegaPlot, VEGA_THEMES } from '@vitessce/vega';
import { capitalize } from '@vitessce/utils';
import { getColorScale } from './utils.js';

const MAX_BAR_SIZE = 40;

/**
 * Cell set composition results displayed using a bar chart.
 */
export default function CellSetCompositionBarPlot(props) {
  const {
    data,
    theme,
    width,
    height: heightProp,
    marginRight = 200,
    marginBottom = 60,
    keyLength = 36,
    obsType,
    onBarSelect,
    obsSetsColumnNameMappingReversed,
    sampleSetsColumnNameMappingReversed,
    sampleSetSelection,
    obsSetSelection,
    obsSetColor,
    sampleSetColor,
  } = props;

  const height = (
    Array.isArray(obsSetSelection)
      && ((heightProp - marginBottom) / obsSetSelection.length >= MAX_BAR_SIZE)
  )
    ? MAX_BAR_SIZE * obsSetSelection.length + marginBottom
    : heightProp;

  const [obsSetColorScale, sampleSetColorScale] = useMemo(() => [
    getColorScale(obsSetSelection, obsSetColor, theme),
    getColorScale(sampleSetSelection, sampleSetColor, theme),
  ], [obsSetSelection, sampleSetSelection, sampleSetColor, obsSetColor, theme]);

  const computedData = useMemo(() => {
    if (Array.isArray(data) && data.length === 1) {
      // We expect only one returned data frame.
      const { df, metadata } = data[0];
      // Return in array-of-objects form that Vega-Lite likes.

      const referenceCellType = metadata?.analysis_params?.reference_cell_type;
      const covariateValue = metadata?.analysis_params?.covariate_value;
      const coordinationValues = metadata?.coordination_values;
      const obsSetColumnName = coordinationValues?.obsSetSelection?.[0]?.[0];
      const obsSetGroupName = obsSetsColumnNameMappingReversed?.[obsSetColumnName];

      const sampleSetColumnName = coordinationValues?.sampleSetFilter?.[0]?.[0];
      const sampleSetGroupName = sampleSetsColumnNameMappingReversed?.[sampleSetColumnName];
      const covariateSetPath = [sampleSetGroupName, covariateValue];

      let shouldSwapFoldChangeDirection = false;
      if (isEqual(covariateSetPath, sampleSetSelection[0])) {
        shouldSwapFoldChangeDirection = true;
      }

      return df.obsSetId.map((obsSetId, i) => {
        const key = uuidv4();
        const isReferenceSet = (obsSetId === referenceCellType);
        const name = `${obsSetId}${(isReferenceSet ? ' (reference set)' : '')}`;
        const obsSetPath = [obsSetGroupName, obsSetId];
        const color = obsSetColorScale(obsSetPath);
        return {
          name,
          // Reconstruct set path array.
          obsSetPath,
          color,
          // Unique key per bar
          key,
          // Add a property `keyName` which concatenates the key and the name,
          // which is both unique and can easily be converted
          // back to the name by taking a substring.
          keyName: `${key}${name}`,
          // Swap direction of foldChange/logFC if necessary
          obsSetFoldChange: df.obsSetFoldChange[i] * (shouldSwapFoldChangeDirection ? -1 : 1),
          logFoldChange: (
            Math.log2(df.obsSetFoldChange[i]) * (shouldSwapFoldChangeDirection ? -1 : 1)
          ),
          interceptExpectedSample: df.interceptExpectedSample[i],
          effectExpectedSample: df.effectExpectedSample[i],
          isCredibleEffect: df.isCredibleEffect[i],
          // Boolean flag for wasReferenceObsSet (check metadata)
          isReferenceSet: (obsSetId === referenceCellType),
        };
      }).filter(d => obsSetSelection
        ?.find(setNamePath => isEqual(setNamePath, d.obsSetPath)));
    }
    return null;
  }, [data, sampleSetSelection, obsSetsColumnNameMappingReversed,
    sampleSetsColumnNameMappingReversed, obsSetSelection,
    obsSetColorScale, sampleSetColorScale,
  ]);

  // Get an array of keys for sorting purposes.
  const keys = computedData?.map(d => d.keyName);

  const colorScale = {
    // Manually set the color scale so that Vega-Lite does
    // not choose the colors automatically.
    domain: computedData?.map(d => d.key),
    range: computedData?.map(d => d.color),
  };
  const captializedObsType = capitalize(obsType);

  const opacityScale = {
    domain: [true, false],
    range: [1.0, 0.3],
  };
  const strokeWidthScale = {
    domain: [true, false],
    range: [2.0, 0.5],
  };

  const xExtent = useMemo(() => {
    if (computedData) {
      const [min, max] = extent(computedData.map(d => d.logFoldChange));
      const buffer = 1.05; // Ensure some extra space
      const minAbs = Math.abs(min) * buffer;
      const maxAbs = Math.abs(max) * buffer;
      if (minAbs > maxAbs) {
        return [-minAbs, minAbs];
      }
      return [-maxAbs, maxAbs];
    }
    return undefined;
  }, [computedData]);

  const xScale = {
    domain: xExtent,
  };

  const spec = {
    mark: { type: 'bar', stroke: 'black', cursor: 'pointer' },
    params: [
      {
        name: 'bar_select',
        select: {
          type: 'point',
          on: 'click[event.shiftKey === false]',
          fields: ['obsSetPath'],
          empty: 'none',
        },
      },
      {
        name: 'shift_bar_select',
        select: {
          type: 'point',
          on: 'click[event.shiftKey]',
          fields: ['obsSetPath'],
          empty: 'none',
        },
      },
    ],
    encoding: {
      y: {
        field: 'keyName',
        type: 'nominal',
        axis: { labelExpr: `substring(datum.label, ${keyLength})` },
        title: `${captializedObsType} Set`,
        sort: keys,
      },
      x: {
        // TODO: support using intercept+effect here based on user-selected options?
        field: 'logFoldChange',
        type: 'quantitative',
        title: 'Log fold-change',
        scale: xScale,
      },
      color: {
        field: 'key',
        type: 'nominal',
        scale: colorScale,
        legend: null,
      },
      fillOpacity: {
        field: 'isCredibleEffect',
        type: 'nominal',
        scale: opacityScale,
      },
      strokeWidth: {
        field: 'isReferenceSet',
        type: 'nominal',
        scale: strokeWidthScale,
        legend: null,
      },
      tooltip: {
        field: 'effectExpectedSample',
        type: 'quantitative',
      },
    },
    // TODO: for width, also subtract length of longest y-axis set name label.
    width: clamp(width - marginRight, 10, Infinity),
    height: clamp(height - marginBottom, 10, Infinity),
    config: VEGA_THEMES[theme],
  };

  const handleSignal = (name, value) => {
    if (name === 'bar_select') {
      onBarSelect(value.obsSetPath);
    } else if (name === 'shift_bar_select') {
      onBarSelect(value.obsSetPath, true);
    }
  };

  const signalListeners = { bar_select: handleSignal, shift_bar_select: handleSignal };
  const getTooltipText = useCallback(item => ({
    [`${captializedObsType} Set`]: item.datum.name,
    'Log fold-change': item.datum.logFoldChange,
    interceptExpectedSample: item.datum.interceptExpectedSample,
    effectExpectedSample: item.datum.effectExpectedSample,
  }
  ), [captializedObsType]);

  return (
    <VegaPlot
      data={computedData}
      spec={spec}
      signalListeners={signalListeners}
      getTooltipText={getTooltipText}
    />
  );
}
