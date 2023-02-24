import React from 'react';
import clamp from 'lodash/clamp';
import { VegaPlot, VEGA_THEMES } from '@vitessce/vega';
import { colorArrayToString } from '@vitessce/sets-utils';
import { capitalize } from '@vitessce/utils';


export default function ObsAreaPlot(props) {
  const {
    data,
    theme,
    width,
    height,
    marginRight = 120,
    marginBottom = 120,
  } = props;

  const colors = {
    domain: ['Total Cortex', 'Cortical IFTA', 'Cortical non-IFTA'],
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
        field: 'area',
        type: 'quantitative',
        title: 'Area (microns squared)',
      },
      color: {
        field: 'group',
        type: 'nominal',
        title: 'Group',
        scale: colors,
        legend: null,
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
