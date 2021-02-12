import React from 'react';
import clamp from 'lodash/clamp';
import { VegaPlot, VEGA_THEMES } from '../vega';
import { colorArrayToString } from './utils';

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
export default function CellSetSizesPlot(props) {
  const {
    data: rawData,
    theme,
    width,
    height,
    marginRight = 90,
    marginBottom = 120,
    keyLength = 36,
  } = props;

  // Add a property `keyName` which concatenates the key and the name,
  // which is both unique and can easily be converted
  // back to the name by taking a substring.
  // Add a property `colorString` which contains the `[r, g, b]` color
  // after converting to a color hex string.
  const data = rawData.map(d => ({
    ...d,
    keyName: d.key + d.name,
    colorString: colorArrayToString(d.color),
  }));

  // Manually set the color scale so that Vega-Lite does
  // not choose the colors automatically.
  const colors = {
    domain: data.map(d => d.key),
    range: data.map(d => d.colorString),
  };

  // Get an array of keys for sorting purposes.
  const keys = data.map(d => d.keyName);

  const spec = {
    mark: { type: 'bar' },
    encoding: {
      x: {
        field: 'keyName',
        type: 'nominal',
        axis: { labelExpr: `substring(datum.label, ${keyLength})` },
        title: 'Cell Set',
        sort: keys,
      },
      y: {
        field: 'size',
        type: 'quantitative',
        title: 'Cell Set Size',
      },
      color: {
        field: 'key',
        type: 'nominal',
        scale: colors,
        legend: null,
      },
      tooltip: {
        field: 'size',
        type: 'quantitative',
      },
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
