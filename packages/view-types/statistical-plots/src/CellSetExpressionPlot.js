/* eslint-disable indent */
/* eslint-disable camelcase */
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { scaleLinear, scaleOrdinal, scaleThreshold } from 'd3-scale';
import { scale as vega_scale } from 'vega-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { extent, bin, min, max, rollup as d3_rollup, mean as d3_mean, deviation as d3_deviation } from 'd3-array';
import { area as d3_area, curveBasis } from 'd3-shape';
import { select } from 'd3-selection';
import clamp from 'lodash/clamp';
import { colorArrayToString } from '@vitessce/sets-utils';
import { capitalize } from '@vitessce/utils';

const scaleBand = vega_scale('band');

const GROUP_KEY = 'set';
const FEATURE_KEY = 'gene';
const VALUE_KEY = 'value';

// Return filtered array with outliers removed.
function chauvenet(x, keepZeros) {
  const dMax = 3;
  const mean = d3_mean(x, d => d[VALUE_KEY]);
  const stdv = d3_deviation(x, d => d[VALUE_KEY]);
  return x.filter(d => (
    (keepZeros || d[VALUE_KEY] > 0)
    && dMax > (Math.abs(d[VALUE_KEY] - mean)) / stdv
  ));
}

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
 * Default is allowing the component to automatically determine the margin.
 * @param {string|null} props.featureValueTransformName A name
 * for the feature value transformation function.
 */
export default function CellSetExpressionPlot(props) {
  const {
    jitter,
    domainMax = 100,
    colors,
    data,
    theme,
    width,
    height,
    marginRight = 90,
    marginLeft = 60,
    marginBottom = 60,
    obsType,
    featureValueType,
    featureValueTransformName,
  } = props;

  const svgRef = useRef();

  // Get the max characters in an axis label for autsizing the bottom margin.
  const maxCharactersForLabel = useMemo(() => data.reduce((acc, val) => {
    // eslint-disable-next-line no-param-reassign
    acc = acc === undefined || val.set.length > acc ? val.set.length : acc;
    return acc;
  }, 0), [data]);

  // Use a square-root term because the angle of the labels is 45 degrees (see below)
  // so the perpendicular distance to the bottom of the labels is proportional to the
  // square root of the length of the labels along the imaginary hypotenuse.
  // 30 is an estimate of the pixel size of a given character and seems to work well.
  const autoMarginBottom = marginBottom
    || 30 + Math.sqrt(maxCharactersForLabel / 2) * 30;

  //const plotWidth = clamp(width - marginRight, 10, Infinity);
  //const plotHeight = clamp(height - autoMarginBottom, 10, Infinity);


  const rectColor = (theme === 'dark' ? 'white' : 'black');

  useEffect(() => {
    const domElement = svgRef.current;

    const featureName = 'Gene Expression';

    const svg = select(domElement);
    svg.selectAll('g').remove();
    svg
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('width', width)
      .attr('height', height);

    const groupNames = colors.map(d => d.name);

    // Manually set the color scale so that Vega-Lite does
    // not choose the colors automatically.
    const colorScale = {
      domain: colors.map(d => d.name),
      range: colors.map(d => colorArrayToString(d.color)),
    };

    // Remove outliers on a per-group basis.
    const groupedData = Array.from(
      d3_rollup(data, groupData => chauvenet(groupData, true), d => d[GROUP_KEY]),
      ([key, value]) => ({ key, value }),
    );
    const trimmedData = groupedData.map(kv => kv.value).flat();

    const innerWidth = width - marginLeft;
    const innerHeight = height - marginBottom;

    const xGroup = scaleBand()
      .range([marginLeft, width])
      .domain(groupNames)
      .padding(0.1);

    const y = scaleLinear()
      .domain([(featureName === 'Aspect Ratio' ? 1 : 0), max(trimmedData, d => d[VALUE_KEY])])
      .range([innerHeight, 0]);

    const histogram = bin()
      .thresholds(y.ticks(16))
      .value(d => d[VALUE_KEY])
      .domain(y.domain());

    const groupBins = groupedData.map(kv => ({ key: kv.key, value: histogram(kv.value) }));

    const groupBinsMax = max(groupBins.flatMap(d => d.value.map(v => v.length)));

    const x = scaleLinear()
      .domain([-groupBinsMax, groupBinsMax])
      .range([0, xGroup.bandwidth()]);

    const area = d3_area()
      .x0(d => (jitter ? x(0) : x(-d.length)))
      .x1(d => x(d.length))
      .y(d => y(d.x0))
      .curve(curveBasis);

    // Violin areas
    g
      .selectAll('violin')
      .data(groupBins)
      .enter()
        .append('g')
          .attr('transform', d => `translate(${xGroup(d.key)},0)`)
          .style('fill', d => colorScale.range[groupNames.indexOf(d.key)])
        .append('path')
          .datum(d => d.value)
          .style('stroke', 'none')
          .attr('d', d => area(d));

    // Jittered points

    if (jitter) {
      g
        .selectAll('point')
        .data(trimmedData)
        .enter()
          .append('circle')
            .attr('transform', d => `translate(${xGroup(d[GROUP_KEY])},0)`)
            .style('stroke', 'none')
            .style('fill', 'silver')
            .style('opacity', '0.1')
            .attr('cx', () => 5 + Math.random() * ((xGroup.bandwidth() / 2) - 10))
            .attr('cy', d => y(d[VALUE_KEY]))
            .attr('r', 2);
    }

    // Y-axis ticks
    g
      .append('g')
        .attr('transform', `translate(${marginLeft},0)`)
        .style('font-size', '14px')
      .call(axisLeft(y));
    // X-axis ticks
    g
      .append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .style('font-size', '14px')
      .call(axisBottom(xGroup));

    const unitSuffix = featureName.endsWith('Area') ? ' (microns squared)' : '';

    // Y-axis title
    g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', -innerHeight / 2)
      .attr('y', 15)
      .attr('transform', 'rotate(-90)')
      .text(featureName + unitSuffix)
      .style('font-size', '14px')
      .style('fill', 'white');

    // X-axis title
    g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', marginLeft + innerWidth / 2)
      .attr('y', height - 10)
      .text('Group')
      .style('font-size', '14px')
      .style('fill', 'white');
  }, [width, height, data, marginBottom, marginLeft, colors, jitter]);

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
