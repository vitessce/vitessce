import React from 'react';
import clamp from 'lodash/clamp';
import { VegaPlot, VEGA_THEMES } from '../vega';

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
export default function BarPlot(props) {
  const {
    data: [],
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
  //const data = rawData.map(d => ({
  //  ...d,
 //   keyName: d.key + d.name,
  //  colorString: colorArrayToString(d.color),
  //}));

  // Manually set the color scale so that Vega-Lite does
  // not choose the colors automatically.
  //const colors = {
  //  domain: data.map(d => d.key),
  //  range: data.map(d => d.colorString),
 // };

  // Get an array of keys for sorting purposes.
  //const keys = data.map(d => d.keyName);

  const spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "A simple bar chart with embedded data.",
    "data": {
      "values": [
        {"a": "A", "b": 28}, {"a": "B", "b": 55}, {"a": "C", "b": 43},
        {"a": "D", "b": 91}, {"a": "E", "b": 81}, {"a": "F", "b": 53},
        {"a": "G", "b": 19}, {"a": "H", "b": 87}, {"a": "I", "b": 52}
      ]
    },
    "mark": "bar",
    "encoding": {
      "x": {"field": "a", "type": "nominal", "axis": {"labelAngle": 0}},
      "y": {"field": "b", "type": "quantitative"}
    }
  ,
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
