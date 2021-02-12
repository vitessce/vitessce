import React from 'react';
import clamp from 'lodash/clamp';
import { VegaPlot, VEGA_THEMES } from '../vega';

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
    data,
    theme,
    width,
    height,
    marginRight = 90,
    marginBottom = 50,
  } = props;

  const xTitle = geneSelection && geneSelection.length >= 1
    ? 'Normalized Expression Value'
    : 'Total Normalized Transcript Count';

  const spec = {
    mark: { type: 'bar' },
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
        title: 'Number of Cells',
      },
      color: { value: 'gray' },
    },
    width: clamp(width - marginRight, 10, Infinity),
    height: clamp(height - marginBottom, 10, Infinity),
    config: VEGA_THEMES[theme],
  };

  return (
    <VegaPlot
      data={data}
      spec={spec}
    />
  );
}
