/* eslint-disable indent */
/* eslint-disable camelcase */
import React, { useMemo, useEffect, useRef } from 'react';
import { scaleLinear } from 'd3-scale';
import { scale as vega_scale } from 'vega-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import {
  bin,
  max,
  rollup as d3_rollup,
  mean as d3_mean,
  deviation as d3_deviation,
  ascending as d3_ascending,
  map as d3_map,
  quantileSorted,
} from 'd3-array';
import { area as d3_area, curveBasis } from 'd3-shape';
import { select } from 'd3-selection';
import { colorArrayToString } from '@vitessce/sets-utils';
import { capitalize } from '@vitessce/utils';

const scaleBand = vega_scale('band');

const GROUP_KEY = 'set';
const VALUE_KEY = 'value';

// Reference: https://github.com/d3/d3-array/issues/180#issuecomment-851378012
function summarize(iterable, keepZeros) {
  const values = d3_map(iterable, d => d[VALUE_KEY])
    .filter(d => keepZeros || d !== 0.0)
    .sort(d3_ascending);
  const minVal = values[0];
  const maxVal = values[values.length - 1];
  const q1 = quantileSorted(values, 0.25);
  const q2 = quantileSorted(values, 0.5);
  const q3 = quantileSorted(values, 0.75);
  const iqr = q3 - q1; // interquartile range
  const r0 = Math.max(minVal, q1 - iqr * 1.5);
  const r1 = Math.min(maxVal, q3 + iqr * 1.5);
  let i = -1;
  while (values[++i] < r0);
  const w0 = values[i];
  while (values[++i] <= r1);
  const w1 = values[i - 1];

  // Chauvenet
  // Reference: https://en.wikipedia.org/wiki/Chauvenet%27s_criterion
  const mean = d3_mean(values);
  const stdv = d3_deviation(values);
  const c0 = mean - 3 * stdv;
  const c1 = mean + 3 * stdv;

  return {
    quartiles: [q1, q2, q3],
    range: [r0, r1],
    whiskers: [w0, w1],
    chauvenetRange: [c0, c1],
    nonOutliers: values.filter(v => c0 <= v && v <= c1),
  };
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
export default function FeatureBarPlot(props) {
  const {
    yMin,
    yUnits,
    jitter,
    colors,
    data,
    theme,
    width,
    height,
    marginTop = 5,
    marginRight = 5,
    marginLeft = 50,
    marginBottom,
    obsType,
    featureType,
    featureValueType,
    featureValueTransformName,
  } = props;

  const svgRef = useRef();

  // Get the max characters in an axis label for autsizing the bottom margin.
  const maxCharactersForLabel = useMemo(() => data.reduce((acc, val) => {
    // eslint-disable-next-line no-param-reassign
    acc = acc === undefined || val[GROUP_KEY].length > acc ? val[GROUP_KEY].length : acc;
    return acc;
  }, 0), [data]);

  useEffect(() => {
    const domElement = svgRef.current;

    const transformPrefix = (featureValueTransformName && featureValueTransformName !== 'None')
      ? `${featureValueTransformName}-Transformed `
      : '';
    const unitSuffix = yUnits ? ` (${yUnits})` : '';
    const yTitle = `${transformPrefix}${capitalize(featureValueType)}${unitSuffix}`;

    const xTitle = `${capitalize(obsType)} Set`;

    // Use a square-root term because the angle of the labels is 45 degrees (see below)
    // so the perpendicular distance to the bottom of the labels is proportional to the
    // square root of the length of the labels along the imaginary hypotenuse.
    // 30 is an estimate of the pixel size of a given character and seems to work well.
    const autoMarginBottom = marginBottom
      || 30 + Math.sqrt(maxCharactersForLabel / 2) * 30;

    const rectColor = (theme === 'dark' ? 'white' : 'black');

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
    const groupedSummaries = Array.from(
      d3_rollup(data, groupData => summarize(groupData, true), d => d[GROUP_KEY]),
      ([key, value]) => ({ key, value }),
    );
    const groupedData = groupedSummaries
      .map(({ key, value }) => ({ key, value: value.nonOutliers }));
    const trimmedData = groupedData.map(kv => kv.value).flat();

    const innerWidth = width - marginLeft;
    const innerHeight = height - autoMarginBottom;

    const xGroup = scaleBand()
      .range([marginLeft, width - marginRight])
      .domain(groupNames)
      .padding(0.1);

    // For the y domain, use the yMin prop
    // to support a use case such as 'Aspect Ratio',
    // where the domain minimum should be 1 rather than 0.
    const y = scaleLinear()
      .domain([yMin, max(trimmedData)])
      .range([innerHeight, marginTop]);

    const histogram = bin()
      .thresholds(y.ticks(16))
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

    // Whiskers
    const whiskerGroups = g.selectAll('whiskers')
      .data(groupedSummaries)
      .enter()
        .append('g')
          .attr('transform', d => `translate(${xGroup(d.key)},0)`);
    whiskerGroups.append('line')
      .datum(d => d.value)
      .attr('stroke', rectColor)
      .attr('x1', xGroup.bandwidth() / 2)
      .attr('x2', xGroup.bandwidth() / 2)
      .attr('y1', d => y(d.quartiles[0]))
      .attr('y2', d => y(d.quartiles[2]))
      .attr('stroke-width', 2);
    whiskerGroups.append('line')
      .datum(d => d.value)
      .attr('stroke', rectColor)
      .attr('x1', xGroup.bandwidth() / 2 - (jitter ? 0 : 4))
      .attr('x2', xGroup.bandwidth() / 2 + 4)
      .attr('y1', d => y(d.quartiles[1]))
      .attr('y2', d => y(d.quartiles[1]))
      .attr('stroke-width', 2);

    // Jittered points
    if (jitter) {
      groupedData.forEach(({ key, value }) => {
        const groupG = g.append('g');
        groupG.selectAll('point')
          .data(value)
          .enter()
          .append('circle')
            .attr('transform', `translate(${xGroup(key)},0)`)
            .style('stroke', 'none')
            .style('fill', 'silver')
            .style('opacity', '0.1')
            .attr('cx', () => 5 + Math.random() * ((xGroup.bandwidth() / 2) - 10))
            .attr('cy', d => y(d))
            .attr('r', 2);
      });
    }

    // Y-axis ticks
    g
      .append('g')
        .attr('transform', `translate(${marginLeft},0)`)
      .call(axisLeft(y))
      .selectAll('text')
        .style('font-size', '11px');

    // X-axis ticks
    g
      .append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .style('font-size', '14px')
      .call(axisBottom(xGroup))
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
      .style('fill', 'white');

    // X-axis title
    g
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', marginLeft + innerWidth / 2)
      .attr('y', height - 10)
      .text(xTitle)
      .style('font-size', '12px')
      .style('fill', 'white');
  }, [width, height, data, marginLeft, marginBottom, colors,
    jitter, theme, yMin, marginTop, marginRight, featureType,
    featureValueType, featureValueTransformName, yUnits, obsType,
    maxCharactersForLabel,
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
