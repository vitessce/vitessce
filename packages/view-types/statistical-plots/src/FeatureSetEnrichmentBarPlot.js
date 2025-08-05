import React, { useCallback, useMemo } from 'react';
import { clamp } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { VegaPlot, VEGA_THEMES } from '@vitessce/vega';
import { capitalize } from '@vitessce/utils';
import { getColorScale } from './utils.js';

/**
 * Feature set enrichment test results displayed using a bar chart.
 */
export default function FeatureSetEnrichmentBarPlot(props) {
  const {
    data,
    theme,
    width,
    height,
    marginRight = 300,
    marginBottom = 120,
    keyLength = 36,
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

        const rawObsSetPath = coordinationValues.obsSetFilter
          ? coordinationValues.obsSetFilter[0]
          : coordinationValues.obsSetSelection[0];
        const obsSetPath = [...rawObsSetPath];
        obsSetPath[0] = obsSetsColumnNameMappingReversed[rawObsSetPath[0]];

        const color = obsSetColorScale(obsSetPath);

        df.featureSetName.forEach((featureSetName, i) => {
          const key = uuidv4();
          result.push({
            key,
            name: featureSetName,
            term: df.featureSetTerm[i],
            color,
            obsSetPath,
            obsSetPaths: [obsSetPath],
            obsSetNameToPval: { [obsSetPath.at(-1)]: df.featureSetSignificance[i] },
            keyName: `${key}${featureSetName}`,
            featureSetSignificance: df.featureSetSignificance[i],
            minusLog10p: -Math.log10(df.featureSetSignificance[i]),
            // Color based on obsSet
          });
        });
      });

      // TODO: instead of filtering, perhaps use virtual scrolling
      // (would require custom renderer / not using Vega-Lite).
      result = result
        .map(d => ({
          ...d,
          minusLog10p: Math.min(50, d.minusLog10p), // Clamp infinite values at 50
        }))
        .filter(d => d.featureSetSignificance <= pValueThreshold)
        .toSorted((a, b) => a.featureSetSignificance - b.featureSetSignificance)
        .reduce((a, h) => {
          // Only add the pathway once if it appears for multiple cell types?
          const match = a.find(d => d.name === h.name);
          if (match) {
            match.obsSetPaths.push(h.obsSetPath);
            match.obsSetNameToPval[h.obsSetPath.at(-1)] = h.featureSetSignificance;
            return a;
          }
          return [...a, h];
        }, []);

      const MAX_ROWS = 50;
      result = result.slice(0, MAX_ROWS);
      return result;
    }
    return null;
  }, [data, sampleSetSelection, obsSetsColumnNameMappingReversed,
    sampleSetsColumnNameMappingReversed, obsSetSelection,
    obsSetColorScale, sampleSetColorScale, pValueThreshold,
  ]);

  // Get an array of keys for sorting purposes.
  const keys = computedData.map(d => d.keyName);

  const colorScale = {
    // Manually set the color scale so that Vega-Lite does
    // not choose the colors automatically.
    domain: computedData.map(d => d.key),
    range: computedData.map(d => d.color),
  };
  const captializedFeatureType = capitalize(featureType);

  const spec = {
    mark: { type: 'bar', stroke: 'black', cursor: 'pointer' },
    params: [
      {
        name: 'bar_select',
        select: {
          type: 'point',
          on: 'click[event.shiftKey === false]',
          fields: ['name', 'term'],
          empty: 'none',
        },
      },
      {
        name: 'shift_bar_select',
        select: {
          type: 'point',
          on: 'click[event.shiftKey]',
          fields: ['name', 'term'],
          empty: 'none',
        },
      },
    ],
    encoding: {
      y: {
        field: 'keyName',
        type: 'nominal',
        axis: { labelExpr: `substring(datum.label, ${keyLength})` },
        title: `${captializedFeatureType} Set`,
        sort: keys,
      },
      x: {
        field: 'minusLog10p',
        type: 'quantitative',
        title: '-log10 p-value',
      },
      color: {
        field: 'key',
        type: 'nominal',
        scale: colorScale,
        legend: null,
      },
      /*
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
      onBarSelect(value.name?.[0], value.term?.[0]);
    } else if (name === 'shift_bar_select') {
      // Name and term may be arrays
      onBarSelect(value.name, value.term, true);
    }
  };

  const signalListeners = { bar_select: handleSignal, shift_bar_select: handleSignal };
  const getTooltipText = useCallback(item => ({
    [`${captializedFeatureType} Set`]: item.datum.name,
    'Ontology Term': item.datum.term,
    ...Object.fromEntries(
      Object.entries(item.datum.obsSetNameToPval).map(([cellSetName, pVal]) => ([
        `p-value for ${cellSetName}`,
        pVal,
      ])),
    ),
  }
  ), [captializedFeatureType]);

  return (
    <VegaPlot
      data={computedData}
      spec={spec}
      signalListeners={signalListeners}
      getTooltipText={getTooltipText}
    />
  );
}
