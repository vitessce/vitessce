import React from 'react';
import VegaPlot from './VegaPlot';
import { createVegaLiteApi, VEGA_THEMES } from './utils';

const marginRight = 90;
const marginBottom = 120;

const vl = createVegaLiteApi();

/**
 * Cell set sizes displayed as a bar chart,
 * implemented with the VegaPlot component.
 * @param {object} props
 * @param {object[]} props.data The set size data, an array
 * of objects with properties `name`, `key`, `color`, and `size`.
 * @param {number} props.width The container width.
 * @param {number} props.height The container height.
 * @param {string} props.theme The name of the current Vitessce theme.
 * @param {number} props.keyLength The length of the `key` property of
 * each data point.
 */
export default function CellSetSizePlot(props) {
  const {
    data: rawData,
    width,
    height,
    theme,
    keyLength = 36,
  } = props;

  // Add a property `keyName` which concatenates the key and the name,
  // which is both unique (for Vega-Lite) and can easily be converted
  // back to the name by taking a substring.
  const data = rawData.map(d => ({ ...d, keyName: d.key + d.name }));

  // Manually set the color scale so that Vega-Lite does
  // not choose the colors automatically.
  const colors = {
    domain: data.map(d => d.key),
    range: data.map(d => d.color),
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
