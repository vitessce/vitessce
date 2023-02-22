import React from 'react';
import clamp from 'lodash/clamp';
import { VegaPlot, VEGA_THEMES } from '@vitessce/vega';
import { colorArrayToString } from '@vitessce/sets-utils';
import { capitalize } from '@vitessce/utils';

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
export default function ObsDensityPlot(props) {
  const {
    data,
    theme,
    width,
    height,
    marginRight = 180,
    marginBottom = 180,
  } = props;

  const colors = {
    domain: ['in total cortex', 'in IFTA', 'in non-IFTA cortex'],
    range: ["rgb(212, 212, 212)", "#808080", "rgb(76, 76, 76)"],
  };

  const spec = {
    mark: { type: 'bar', tooltip: true },
    encoding: {
      x: {
        field: 'group',
        type: 'nominal',
        title: 'Group',
        sort: colors.domain,
        axis: { labelExpr: 'datum.label' },
      },
      y: {
        field: 'density',
        type: 'quantitative',
        title: 'Density',
      },
      color: {
        field: 'membership',
        type: 'nominal',
        title: 'PTC Membership',
        scale: colors,
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
