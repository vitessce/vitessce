import React, { useCallback, useMemo } from 'react';
import { clamp, isEqual } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { VegaPlot, VEGA_THEMES } from '@vitessce/vega';
import { capitalize } from '@vitessce/utils';
import { getColorScale } from './utils.js';

/**
 * Cell set sizes displayed as a bar chart,
 * implemented with the VegaPlot component.
 * @param {object} props
 * @param {object[]} props.data The set size data, an array
 * of objects with properties `name`, `key`, `color`, and `size`.
 * @param {string} props.theme The name of the current Vitessce theme.
 * @param {number} props.width The container width.
 * @param {number} props.height The container height.
 * @param {number} props.marginRight The size of the margin
 * on the right side of the plot, to account for the vega menu button.
 * By default, 90.
 * @param {number} props.marginBottom The size of the margin
 * on the bottom of the plot, to account for long x-axis labels.
 * By default, 120.
 * @param {number} props.keyLength The length of the `key` property of
 * each data point. Assumes all key strings have the same length.
 * By default, 36.
 */
export default function FeatureSetEnrichmentBarPlot(props) {
  const {
    data,
    theme,
    width,
    height,
    marginRight = 200,
    marginBottom = 120,
    keyLength = 36,
    obsType,
    featureType,
    onBarSelect,
    obsSetsColumnNameMappingReversed,
    sampleSetsColumnNameMappingReversed,
    sampleSetSelection,
    obsSetSelection,
    obsSetColor,
    sampleSetColor,
    pValueThreshold,
  } = props;

  const [obsSetColorScale, sampleSetColorScale] = useMemo(() => [
    getColorScale(obsSetSelection, obsSetColor, theme),
    getColorScale(sampleSetSelection, sampleSetColor, theme),
  ], [obsSetSelection, sampleSetSelection, sampleSetColor, obsSetColor, theme]);

  const computedData = useMemo(() => {
    if (Array.isArray(data)) {
      let result = [];
      data.forEach((comparisonObject) => {
        const { df, metadata } = comparisonObject;
        const coordinationValues = metadata?.coordination_values;
        // const obsSetPath = coordinationValues.obsSetSelection;

        df.featureSetName.forEach((featureSetName, i) => {
          const key = uuidv4();
          result.push({
            key,
            name: featureSetName,
            keyName: `${key}${featureSetName}`,
            featureSetSignificance: df.featureSetSignificance[i],
            minusLog10p: -Math.log10(df.featureSetSignificance[i]),
            // Color based on obsSet
          });
        });
      });
      result = result
        .map(d => ({
          ...d,
          minusLog10p: Math.min(50, d.minusLog10p), // Clamp infinite values at 50
        }))
        .toSorted((a, b) => a.featureSetSignificance - b.featureSetSignificance)
        .reduce((a, h) => {
          // Only add the pathway once if it appears for multiple cell types?
          if (a.find(d => d.name === h.name)) {
            return a;
          }
          return [...a, h];
        }, []);

      const MAX_ROWS = 25;
      result = result.slice(0, MAX_ROWS);
      return result;
    }
    return null;
  }, [data, sampleSetSelection, obsSetsColumnNameMappingReversed,
    sampleSetsColumnNameMappingReversed, obsSetSelection,
    obsSetColorScale, sampleSetColorScale, pValueThreshold,
  ]);
  console.log(computedData);

  // Get an array of keys for sorting purposes.
  const keys = computedData.map(d => d.keyName);

  const colorScale = {
    // Manually set the color scale so that Vega-Lite does
    // not choose the colors automatically.
    domain: computedData.map(d => d.key),
    range: computedData.map(d => d.color),
  };
  const captializedObsType = capitalize(obsType);

  const spec = {
    mark: { type: 'bar', stroke: 'black', cursor: 'pointer' },
    params: [
      {
        name: 'bar_select',
        select: {
          type: 'point',
          on: 'click[event.shiftKey === false]',
          fields: ['name'],
          empty: 'none',
        },
      },
      {
        name: 'shift_bar_select',
        select: {
          type: 'point',
          on: 'click[event.shiftKey]',
          fields: ['name'],
          empty: 'none',
        },
      },
    ],
    encoding: {
      y: {
        field: 'keyName',
        type: 'nominal',
        axis: { labelExpr: `substring(datum.label, ${keyLength})` },
        title: `${capitalize(featureType)} Set`,
        sort: keys,
      },
      x: {
        field: 'minusLog10p',
        type: 'quantitative',
        title: '- log10 p-value',
      },
      /*
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
      },
      */
      tooltip: {
        field: 'featureSetSignificance',
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
    'p-value': item.datum.featureSetSignificance,
    // TODO: add more entries
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
