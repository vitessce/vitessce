import React from 'react';
import clamp from 'lodash/clamp';
import { VegaPlot, createVegaLiteApi, VEGA_THEMES } from '../vega';

const vl = createVegaLiteApi();

/**
 * Gene expression histogram displayed as a bar chart,
 * implemented with the VegaPlot component.
 * @param {object} props
 * @param {object[]} props.data The set size data, an array
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
    data,
    theme,
    width,
    height,
    marginRight = 90,
    marginBottom = 50,
  } = props;

  const spec = vl
    .markBar()
    .encode(
      vl.x().fieldQ('value').bin({ })
        .title('Normalized Expression Value'),
      vl.y().count()
        .title('Number of Cells'),
      vl.color().value('gray'),
    )
    .width(clamp(width - marginRight, 10, Infinity))
    .height(clamp(height - marginBottom, 10, Infinity))
    .config(VEGA_THEMES[theme])
    .toJSON();

  return (
    <VegaPlot
      data={data}
      spec={spec}
    />
  );
}
