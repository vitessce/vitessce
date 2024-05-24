/* eslint-disable indent */
/* eslint-disable camelcase */
import React, { useMemo, useEffect, useRef } from 'react';
import { scaleLinear } from 'd3-scale';
import { scale as vega_scale } from 'vega-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { ascending } from 'd3-array';
import { select } from 'd3-selection';
import { capitalize } from '@vitessce/utils';

const scaleBand = vega_scale('band');

const OBS_KEY = 'obsId';
const FEATURE_KEY = 'value';

function componentToHex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function rgbToHex(color) {
  return `#${componentToHex(color[0])}${componentToHex(color[1])}${componentToHex(color[2])}`;
}

export default function FeatureBarPlot(props) {
  const {
    yMin,
    yMax,
    yUnits,
    jitter,
    colors,
    data,
    theme,
    width,
    height,
    marginTop = 5,
    marginRight = 5,
    marginLeft = 80,
    marginBottom,
    obsType,
    cellHighlight,
    cellSetSelection,
    additionalCellSets,
    cellSetColor,
    featureType,
    featureValueType,
    featureName,
    onBarSelect,
    onBarHighlight,
  } = props;

  // TODO: use a more descriptive name than setsSave.
  const setsSave = useMemo(() => {
    const result = new Map();
    cellSetSelection?.forEach((obsSetPath) => {
      // TODO: this does not use the full set path for comparison.
      const selectedElement = obsSetPath[1];
      // TODO: this is only considering the first set grouping in the tree.
      // TODO: use sets-utils to traverse sets tree.
      additionalCellSets?.tree?.[0]?.children?.forEach((child) => {
        if (child.name === selectedElement) {
          child.set.forEach(([obsId]) => {
            const info = { name: '', id: '', color: [255, 255, 255] };
            info.name = selectedElement;
            info.id = obsId;
            cellSetColor.forEach((color) => {
              if (color.path[1] === selectedElement) {
                info.color = color.color;
              }
            });
            result.set(info.id, info);
          });
        }
      });
    });
    return result;
  }, [cellSetSelection, additionalCellSets, cellSetColor]);

  const svgRef = useRef();
  // Get the max characters in an axis label for autsizing the bottom margin.
  const maxCharactersForLabel = useMemo(() => data.reduce((acc, val) => {
    // eslint-disable-next-line no-param-reassign
    acc = acc === undefined || val[OBS_KEY].length > acc ? val[OBS_KEY].length : acc;
    return acc;
  }, 0), [data]);

  useEffect(() => {
    const domElement = svgRef.current;

    const unitSuffix = yUnits ? ` (${yUnits})` : '';
    const yTitle = `${capitalize(featureName)}${unitSuffix}`;

    const xTitle = `${capitalize(obsType)}`;

    // Use a square-root term because the angle of the labels is 45 degrees (see below)
    // so the perpendicular distance to the bottom of the labels is proportional to the
    // square root of the length of the labels along the imaginary hypotenuse.
    // 30 is an estimate of the pixel size of a given character and seems to work well.
    const autoMarginBottom = marginBottom
      || 30 + Math.sqrt(maxCharactersForLabel / 2) * 30;

    const foregroundColor = (theme === 'dark' ? 'lightgray' : 'black');

    data.sort((a, b) => ascending(a[FEATURE_KEY], b[FEATURE_KEY]));

    const svg = select(domElement);
    svg.selectAll('g').remove();
    svg
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('width', width)
      .attr('height', height);

    const innerWidth = width - marginLeft;
    const innerHeight = height - autoMarginBottom;

    const xScale = scaleBand()
      .range([marginLeft, width - marginRight])
      .domain(data.map(d => d[OBS_KEY]))
      .padding(0.1);

    // For the y domain, use the yMin prop
    // to support a use case such as 'Aspect Ratio',
    // where the domain minimum should be 1 rather than 0.
    const yScale = scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, marginTop]);

    // Bar areas
    g
      .selectAll('bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d[OBS_KEY]))
      .attr('y', d => yScale(d[FEATURE_KEY]))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d[FEATURE_KEY]))
      .style('fill', (d) => {
          if (d[OBS_KEY] === cellHighlight) return 'orange';
          if (setsSave.has(d[OBS_KEY])) {
              const { color } = setsSave.get(d[OBS_KEY]);
              return rgbToHex(color);
          }
          return foregroundColor;
      })
      .style('cursor', 'pointer')
      // eslint-disable-next-line no-unused-vars
      .on('click', (event, d) => {
          onBarSelect(d[OBS_KEY]);
      })
      // eslint-disable-next-line no-unused-vars
      .on('mouseover', (event, d) => {
          onBarHighlight(d[OBS_KEY]);
      })
      .on('mouseout', () => {
          onBarHighlight(null);
      });


    const axis = axisLeft(yScale);
    axis.tickFormat(d => `${Math.round(d * 10000000)} µm`);
    // Y-axis ticks
    g
      .append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(axis)
      .selectAll('text')
      .style('font-size', '11px');

    // X-axis ticks
    g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .style('font-size', '14px')
      .call(axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '11px')
      .attr('dx', '-6px')
      .attr('dy', '6px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Y-axis title
    g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', -innerHeight / 2)
      .attr('y', 15)
      .attr('transform', 'rotate(-90)')
      .text(yTitle)
      .style('font-size', '12px')
      .style('fill', foregroundColor);

    // X-axis title
    g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', marginLeft + innerWidth / 2)
      .attr('y', height - 10)
      .text(xTitle)
      .style('font-size', '12px')
      .style('fill', foregroundColor);
  }, [width, height, data, marginLeft, marginBottom, colors,
    jitter, theme, yMin, marginTop, marginRight, featureType,
    featureValueType, yUnits, obsType,
    maxCharactersForLabel, yMax, featureName, onBarSelect, onBarHighlight,
    cellHighlight, setsSave,
  ]);

  return (
    <svg
      ref={svgRef}
      style={{
        top: 0,
        left: 0,
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
      }}
    />
  );
}
