import React from 'react';
import { VegaPlot, createVegaLiteApi, VEGA_THEMES } from '../vega';
import { colorArrayToString } from './utils';

const vl = createVegaLiteApi();

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

  const spec = vl
    .markBar()
    .encode(
      vl.x().fieldN('keyName')
        .axis({ labelExpr: `substring(datum.label, ${keyLength})` })
        .title('Name')
        .sort(keys),
      vl.y().fieldQ('size')
        .title('Size'),
      vl.color().fieldN('key')
        .scale(colors)
        .legend(null),
      vl.tooltip().fieldQ('size'),
    )
    .width(width - marginRight)
    .height(height - marginBottom)
    .config(VEGA_THEMES[theme])
    .toJSON();

  return (
    <VegaPlot
      data={data}
      spec={spec}
    />
  );
}
