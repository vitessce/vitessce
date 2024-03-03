import React, { useState, useEffect, useCallback } from 'react';
import { clamp, debounce } from 'lodash-es';
import { VegaPlot, VEGA_THEMES } from '@vitessce/vega';
import { capitalize, pluralize } from '@vitessce/utils';

/**
 * We use debounce, so that onSelect is called only after the user has finished the selection.
 * Due to vega-lite limitations, we cannot use the vega-lite signals to implement this.
 * See this issue: https://github.com/vega/vega-lite/issues/5728
 * See this for reference on what is supported: https://vega.github.io/vega-lite/docs/selection.html
 */

/**
 * Gene expression histogram displayed as a bar chart,
 * implemented with the VegaPlot component.
 * @param {object} props
 * @param {string[]} props.geneSelection The list of genes
 * currently selected.
 * @param {object[]} props.data The expression data, an array
 * of objects with properties `value` and `gene`.
 * @param {string} props.theme The name of the current Vitessce theme.
 * @param {number} props.width The container width.
 * @param {number} props.height The container height.
 * @param {number} props.marginRight The size of the margin
 * on the right side of the plot, to account for the vega menu button.
 * By default, 90.
 * @param {number} props.marginBottom The size of the margin
 * on the bottom of the plot, to account for long x-axis labels.
 * By default, 50.
 */
export default function ExpressionHistogram(props) {
  const {
    geneSelection,
    obsType,
    featureType,
    featureValueType,
    data,
    theme,
    width,
    height,
    marginRight = 90,
    marginBottom = 50,
    onSelect,
  } = props;

  const [selectedRanges, setSelectedRanges] = useState([]);

  const isExpression = (
    featureType === 'gene' && featureValueType === 'expression'
  );
  // eslint-disable-next-line no-nested-ternary
  const xTitle = geneSelection && geneSelection.length >= 1
    ? (isExpression ? `Expression Value (${geneSelection[0]})` : `${geneSelection[0]}`)
    : (isExpression ? 'Total Transcript Count' : 'Sum of Feature Values');

  const spec = {
    data: { values: data },
    mark: 'bar',
    encoding: {
      x: {
        field: 'value',
        type: 'quantitative',
        bin: { maxbins: 50 },
        title: xTitle,
      },
      y: {
        type: 'quantitative',
        aggregate: 'count',
        title: `Number of ${capitalize(pluralize(obsType, 2))}`,
      },
      color: { value: 'gray' },
      opacity: {
        condition: { selection: 'brush', value: 1 },
        value: 0.7,
      },
    },
    params: [
      {
        name: 'brush',
        select: { type: 'interval', encodings: ['x'] },
      },
    ],
    width: clamp(width - marginRight, 10, Infinity),
    height: clamp(height - marginBottom, 10, Infinity),
    config: VEGA_THEMES[theme],
  };


  const handleSignal = (name, value) => {
    if (name === 'brush') {
      setSelectedRanges(value.value);
    }
  };


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnSelect = useCallback(debounce((ranges, latestOnSelect) => {
    latestOnSelect(ranges);
    // We set a debounce timer of 1000ms: the assumption here is that the user has
    // finished the selection when there's been no mouse movement on the histogram for a second.
    // We do not pass any dependencies for the useCallback
    // since we only want to define the debounced function once (on the initial render).
  }, 1000), []);

  useEffect(() => {
    if (!selectedRanges || selectedRanges.length === 0) return () => {};

    // Call the debounced function instead of directly calling onSelect
    debouncedOnSelect(selectedRanges, onSelect);

    // Clean up the debounce timer when the component unmounts or the dependency changes
    return () => {
      debouncedOnSelect.cancel();
    };
  // We only want to call the debounced function when the selectedRanges changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRanges]);

  const signalListeners = { brush: handleSignal };

  return (
    <VegaPlot
      data={data}
      signalListeners={signalListeners}
      spec={spec}
    />
  );
}
