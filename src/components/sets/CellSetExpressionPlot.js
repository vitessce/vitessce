import React from 'react';
import clamp from 'lodash/clamp';
import { VegaPlot, VEGA_THEMES, DATASET_NAME } from '../vega';
import { colorArrayToString } from './utils';

/**
 * Gene expression histogram displayed as a bar chart,
 * implemented with the VegaPlot component.
 * @param {object} props
 * @param {object[]} props.data The expression data, an array
 * of objects with properties `value`, `gene`, and `set`.
 * @param {number} props.domainMax The maximum gene expression value.
 * @param {object[]} props.colors An object for each
 * cell set, with properties `name` and `color`.
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
export default function CellSetExpressionPlot(props) {
  const {
    domainMax = 100,
    colors,
    data,
    theme,
    width,
    height,
    marginRight = 90,
    marginBottom = 120,
  } = props;

  // Manually set the color scale so that Vega-Lite does
  // not choose the colors automatically.
  const colorScale = {
    domain: colors.map(d => d.name),
    range: colors.map(d => colorArrayToString(d.color)),
  };

  const plotWidth = clamp(width - marginRight, 10, Infinity);
  const plotHeight = clamp(height - marginBottom, 10, Infinity);

  const numBands = colors.length;
  const bandWidth = plotWidth / numBands;

  const rectColor = (theme === 'dark' ? 'white' : 'black');

  const spec = {
    $schema: 'https://vega.github.io/schema/vega/v5.json',
    description: 'A violin plot showing distributions of expression levels for selected cell sets.',
    width: plotWidth,
    height: plotHeight,
    config: {
      ...VEGA_THEMES[theme],
      axisBand: {
        bandPosition: 1,
        tickExtra: true,
        tickOffset: 0,
      },
    },

    signals: [
      { name: 'bandWidth', value: bandWidth },
      { name: 'width', value: plotWidth },
      { name: 'height', value: plotHeight },
      { name: 'trim', value: true },
    ],

    data: [
      {
        name: 'density',
        source: DATASET_NAME,
        transform: [
          {
            type: 'kde',
            field: 'value',
            groupby: ['set'],
            bandwidth: 0,
            extent: [0, domainMax],
          },
        ],
      },
      {
        name: 'stats',
        source: DATASET_NAME,
        transform: [
          {
            type: 'aggregate',
            groupby: ['set'],
            fields: ['value', 'value', 'value'],
            ops: ['q1', 'median', 'q3'],
            as: ['q1', 'median', 'q3'],
          },
        ],
      },
    ],

    scales: [
      {
        name: 'layout',
        type: 'band',
        range: 'width',
        domain: { data: DATASET_NAME, field: 'set' },
      },
      {
        name: 'yscale',
        type: 'linear',
        range: 'height',
        domain: [0, domainMax],
      },
      {
        name: 'wscale',
        type: 'linear',
        range: [0, { signal: 'bandWidth' }],
        domain: { data: 'density', field: 'density' },
      },
      {
        name: 'wscaleReversed',
        type: 'linear',
        reverse: true,
        range: [0, { signal: 'bandWidth' }],
        domain: { data: 'density', field: 'density' },
      },
      {
        name: 'color',
        type: 'ordinal',
        ...colorScale,
      },
    ],

    axes: [
      {
        orient: 'left',
        scale: 'yscale',
        zindex: 1,
        title: 'Normalized Expression Value',
      },
      {
        orient: 'bottom',
        scale: 'layout',
        tickCount: 5,
        zindex: 1,
        title: 'Cell Set',
        labelAngle: -45,
        labelAlign: 'right',
      },
    ],

    marks: [
      {
        type: 'group',
        from: {
          facet: {
            data: 'density',
            name: 'violin',
            groupby: 'set',
          },
        },

        encode: {
          enter: {
            xc: { scale: 'layout', field: 'set', band: 0.5 },
            width: { signal: 'bandWidth' },
            height: { signal: 'height' },
          },
        },

        data: [
          {
            name: 'summary',
            source: 'stats',
            transform: [
              {
                type: 'filter',
                expr: 'datum.set === parent.set',
              },
            ],
          },
        ],

        marks: [
          {
            type: 'area',
            orient: 'vertical',
            from: { data: 'violin' },
            encode: {
              enter: {
                fill: { scale: 'color', field: { parent: 'set' } },
              },
              update: {
                width: { scale: 'wscale', field: 'density' },
                xc: { signal: 'bandWidth / 2' },
                y2: { scale: 'yscale', field: 'value' },
                y: { scale: 'yscale', value: 0 },
              },
            },
          },
          {
            type: 'area',
            orient: 'vertical',
            from: { data: 'violin' },
            encode: {
              enter: {
                fill: { scale: 'color', field: { parent: 'set' } },
              },
              update: {
                width: { scale: 'wscaleReversed', field: 'density' },
                xc: { signal: 'bandWidth' },
                y2: { scale: 'yscale', field: 'value' },
                y: { scale: 'yscale', value: 0 },
              },
            },
          },
          {
            type: 'rect',
            from: { data: 'summary' },
            encode: {
              enter: {
                fill: { value: rectColor },
                width: { value: 2 },
              },
              update: {
                y: { scale: 'yscale', field: 'q1' },
                y2: { scale: 'yscale', field: 'q3' },
                xc: { signal: 'bandWidth / 2' },
              },
            },
          },
          {
            type: 'rect',
            from: { data: 'summary' },
            encode: {
              enter: {
                fill: { value: rectColor },
                height: { value: 2 },
                width: { value: 8 },
              },
              update: {
                y: { scale: 'yscale', field: 'median' },
                xc: { signal: 'bandWidth / 2' },
              },
            },
          },
        ],
      },
    ],
  };

  return (
    <VegaPlot
      data={data}
      spec={spec}
    />
  );
}
