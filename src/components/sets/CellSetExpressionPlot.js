/* eslint-disable */
import React from 'react';
import clamp from 'lodash/clamp';
import { VegaPlot, VEGA_THEMES, DATASET_NAME } from '../vega';
import { colorArrayToString } from './utils';

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
export default function CellSetExpressionPlot(props) {
  const {
    colors: colorsRaw,
    data,
    theme,
    width,
    height,
    marginRight = 90,
    marginBottom = 50,
  } = props;

  // Manually set the color scale so that Vega-Lite does
  // not choose the colors automatically.
  const colors = {
    domain: colorsRaw.map(d => d.name),
    range: colorsRaw.map(d => colorArrayToString(d.color)),
  };

  const plotWidth = clamp(width - marginRight, 10, Infinity);
  const plotHeight = clamp(height - marginBottom, 10, Infinity);

  const numBands = colorsRaw.length;
  const bandHeight = plotHeight / numBands;

  const spec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "A violin plot showing distributions of expression levels for selected cell sets.",
    "width": clamp(width - marginRight, 10, Infinity),
    "height": clamp(height - marginBottom, 10, Infinity),
    "config": {
      ...VEGA_THEMES[theme],
      "axisBand": {
        "bandPosition": 1,
        "tickExtra": true,
        "tickOffset": 0
      },
    },
  
    "signals": [
      { "name": "plotWidth", "value": bandHeight },
      { "name": "height", "update": `(plotWidth) * ${numBands}`},
    ],
  
    "data": [
      {
        "name": "density",
        "source": DATASET_NAME,
        "transform": [
          {
            "type": "kde",
            "field": "value",
            "groupby": ["set"],
            "bandwidth": 0,
            "extent": [0, 100]
          }
        ]
      },
      {
        "name": "stats",
        "source": DATASET_NAME,
        "transform": [
          {
            "type": "aggregate",
            "groupby": ["set"],
            "fields": ["value", "value", "value"],
            "ops": ["q1", "median", "q3"],
            "as": ["q1", "median", "q3"]
          }
        ]
      }
    ],
  
    "scales": [
      {
        "name": "layout",
        "type": "band",
        "range": "height",
        "domain": {"data": DATASET_NAME, "field": "set"}
      },
      {
        "name": "xscale",
        "type": "linear",
        "range": "width", "round": true,
        "domain": {"data": DATASET_NAME, "field": "value"},
        "domainMin": 0,
        "domainMax": 100,
        "zero": false, "nice": true
      },
      {
        "name": "hscale",
        "type": "linear",
        "range": [0, {"signal": "plotWidth"}],
        "domain": {"data": "density", "field": "density"}
      },
      {
        "name": "color",
        "type": "ordinal",
        "domain": {"data": DATASET_NAME, "field": "set"},
        "range": "category"
      }
    ],
  
    "axes": [
      {"orient": "bottom", "scale": "xscale", "zindex": 1},
      {"orient": "left", "scale": "layout", "tickCount": 5, "zindex": 1}
    ],
  
    "marks": [
      {
        "type": "group",
        "from": {
          "facet": {
            "data": "density",
            "name": "violin",
            "groupby": "set"
          }
        },
  
        "encode": {
          "enter": {
            "yc": {"scale": "layout", "field": "set", "band": 0.5},
            "height": {"signal": "plotWidth"},
            "width": {"signal": "width"}
          }
        },
  
        "data": [
          {
            "name": "summary",
            "source": "stats",
            "transform": [
              {
                "type": "filter",
                "expr": "datum.set === parent.set"
              }
            ]
          }
        ],
  
        "marks": [
          {
            "type": "area",
            "from": {"data": "violin"},
            "encode": {
              "enter": {
                "fill": {"scale": "color", "field": {"parent": "set"}}
              },
              "update": {
                "x": {"scale": "xscale", "field": "value"},
                "yc": {"signal": "plotWidth / 2"},
                "height": {"scale": "hscale", "field": "density"}
              }
            }
          },
          {
            "type": "rect",
            "from": {"data": "summary"},
            "encode": {
              "enter": {
                "fill": {"value": "black"},
                "height": {"value": 2}
              },
              "update": {
                "x": {"scale": "xscale", "field": "q1"},
                "x2": {"scale": "xscale", "field": "q3"},
                "yc": {"signal": "plotWidth / 2"}
              }
            }
          },
          {
            "type": "rect",
            "from": {"data": "summary"},
            "encode": {
              "enter": {
                "fill": {"value": "black"},
                "width": {"value": 2},
                "height": {"value": 8}
              },
              "update": {
                "x": {"scale": "xscale", "field": "median"},
                "yc": {"signal": "plotWidth / 2"}
              }
            }
          }
        ]
      }
    ]
  };

  return (
    <VegaPlot
      data={data}
      spec={spec}
    />
  );
}
