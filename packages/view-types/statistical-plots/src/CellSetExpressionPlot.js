/* eslint-disable indent */
/* eslint-disable camelcase */
import React, { useMemo, useEffect, useRef } from 'react';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { scale as vega_scale } from 'vega-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import {
  bin,
  min,
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

const STRATIFICATION_KEY = 'sampleSet';
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
export default function CellSetExpressionPlot(props) {
  const {
    yMin: yMinProp,
    yUnits,
    jitter,
    sampleSetSelection,
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

  const isStratified = (Array.isArray(sampleSetSelection) && sampleSetSelection.length == 2);

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

    // TODO: cache all size-independent operations (data processing that does not depend on width/height).
    const filteredData = (isStratified ? data.filter(d => d[STRATIFICATION_KEY]) : data);

    // Manually set the color scale so that Vega-Lite does
    // not choose the colors automatically.
    const colorScale = {
      domain: colors.map(d => d.name),
      range: colors.map(d => colorArrayToString(d.color)),
    };

    const sampleSetNames = sampleSetSelection?.map(path => path.at(-1));
    

    let stratificationSide;
    let stratificationColor;
    if(isStratified) {
      stratificationSide = scaleOrdinal()
        .domain(sampleSetNames)
        .range(['left', 'right']);
      stratificationColor = scaleOrdinal()
        .domain(sampleSetNames)
        .range(['gray', 'orange']);
    };

    // Remove outliers on a per-group basis.
    const groupedSummaries = Array.from(
      d3_rollup(filteredData, groupData => summarize(groupData, true), d => d[GROUP_KEY], d => d[STRATIFICATION_KEY]),
      ([key, value]) => ({ key, value: Array.from(value, ([subKey, subValue]) => ({ key: subKey, value: subValue })) }),
    );
    const groupedData = groupedSummaries
      .map(({ key, value }) => ({
        key,
        value: value.map(({ key: subKey, value: subValue}) => ({ key: subKey, value: subValue.nonOutliers })),
      }));
    const trimmedData = groupedData.map(kv => kv.value.map(subKv => subKv.value).flat()).flat();

    const innerWidth = width - marginLeft;
    const innerHeight = height - autoMarginBottom;

    const xGroup = scaleBand()
      .range([marginLeft, width - marginRight])
      .domain(groupNames)
      .padding(0.1);

    const yMin = (yMinProp === null ? Math.min(0, min(trimmedData)) : yMinProp);

    // For the y domain, use the yMin prop
    // to support a use case such as 'Aspect Ratio',
    // where the domain minimum should be 1 rather than 0.
    const y = scaleLinear()
      .domain([yMin, max(trimmedData)])
      .range([innerHeight, marginTop]);

    const histogram = bin()
      .thresholds(y.ticks(16))
      .domain(y.domain());

    const groupBins = groupedData.map(kv => ({ key: kv.key, value: kv.value.map(subKv => ({ key: subKv.key, value: histogram(subKv.value) })) }));
    const groupBinsMax = max(groupBins.flatMap(d => d.value.flatMap(subKv => subKv.value.map(v => v.length))));

    const x = scaleLinear()
      .domain([-groupBinsMax, groupBinsMax])
      .range([0, xGroup.bandwidth()]);

    const area = d3_area()
      .x0(d => (jitter ? x(0) : x(-d.length)))
      .x1(d => x(d.length))
      .y(d => y(d.x0))
      .curve(curveBasis);
    
    const leftArea = d3_area()
      .x0(d => x(-d.length))
      .x1(d => x(0))
      .y(d => y(d.x0))
      .curve(curveBasis);
    
    const rightArea = d3_area()
      .x0(d => x(0))
      .x1(d => x(d.length))
      .y(d => y(d.x0))
      .curve(curveBasis);

    const sideToAreaFunc = {
      left: leftArea,
      right: rightArea,
    };
    
    // Violin areas
    if(isStratified) {
      const violinG = g
        .selectAll('violin')
        .data(groupBins)
        .enter()
          .append('g')
            .attr('transform', d => `translate(${xGroup(d.key)},0)`);
      violinG.append('path')
        .datum(d => d.value[0])
        .style('stroke', 'none')
        .style('fill', d => stratificationColor(d.key))
        .attr('d', d => sideToAreaFunc[stratificationSide(d.key)](d.value));
      violinG.append('path')
        .datum(d => d.value[1])
        .style('stroke', 'none')
        .style('fill', d => stratificationColor(d.key))
        .attr('d', d => sideToAreaFunc[stratificationSide(d.key)](d.value));
    } else {
      g
        .selectAll('violin')
        .data(groupBins)
        .enter()
          .append('g')
            .attr('transform', d => `translate(${xGroup(d.key)},0)`)
            .style('fill', d => colorScale.range[groupNames.indexOf(d.key)])
          .append('path')
            .datum(d => d.value[0])
            .style('stroke', 'none')
            .attr('d', d => area(d.value));
    }
    
    // Whiskers
    const whiskerGroups = g.selectAll('whiskers')
      .data(groupedSummaries)
      .enter()
        .append('g')
          .attr('transform', d => `translate(${xGroup(d.key)},0)`);
    
    if(isStratified) {
      // Vertical line
      whiskerGroups.append('line')
        .datum(d => d.value[0])
        .attr('stroke', rectColor)
        .attr('x1', d => xGroup.bandwidth() / 2 + (stratificationSide(d.key) == 'left' ? -1.5 : 1.5))
        .attr('x2', d => xGroup.bandwidth() / 2 + (stratificationSide(d.key) == 'left' ? -1.5 : 1.5))
        .attr('y1', d => y(d.value.quartiles[0]))
        .attr('y2', d => y(d.value.quartiles[2]))
        .attr('stroke-width', 2);
      
      whiskerGroups.append('line')
        .datum(d => d.value[1])
        .attr('stroke', rectColor)
        .attr('x1', d => xGroup.bandwidth() / 2 + (stratificationSide(d.key) == 'left' ? -1.5 : 1.5))
        .attr('x2', d => xGroup.bandwidth() / 2 + (stratificationSide(d.key) == 'left' ? -1.5 : 1.5))
        .attr('y1', d => y(d.value.quartiles[0]))
        .attr('y2', d => y(d.value.quartiles[2]))
        .attr('stroke-width', 2);
      
      // Horizontal line
      whiskerGroups.append('line')
        .datum(d => d.value[0])
        .attr('stroke', rectColor)
        .attr('x1', d => xGroup.bandwidth() / 2 + (stratificationSide(d.key) == 'left' ? -5.5 : 1.5))
        .attr('x2', d => xGroup.bandwidth() / 2 + (stratificationSide(d.key) == 'left' ? -1.5 : 5.5))
        .attr('y1', d => y(d.value.quartiles[1]))
        .attr('y2', d => y(d.value.quartiles[1]))
        .attr('stroke-width', 2);
      
      whiskerGroups.append('line')
        .datum(d => d.value[1])
        .attr('stroke', rectColor)
        .attr('x1', d => xGroup.bandwidth() / 2 + (stratificationSide(d.key) == 'left' ? -5.5 : 1.5))
        .attr('x2', d => xGroup.bandwidth() / 2 + (stratificationSide(d.key) == 'left' ? -1.5 : 5.5))
        .attr('y1', d => y(d.value.quartiles[1]))
        .attr('y2', d => y(d.value.quartiles[1]))
        .attr('stroke-width', 2);

    } else {
      // Vertical line
      whiskerGroups.append('line')
        .datum(d => d.value[0].value)
        .attr('stroke', rectColor)
        .attr('x1', xGroup.bandwidth() / 2)
        .attr('x2', xGroup.bandwidth() / 2)
        .attr('y1', d => y(d.quartiles[0]))
        .attr('y2', d => y(d.quartiles[2]))
        .attr('stroke-width', 2);
      
      // Horizontal line
      whiskerGroups.append('line')
        .datum(d => d.value[0].value)
        .attr('stroke', rectColor)
        .attr('x1', xGroup.bandwidth() / 2 - (jitter ? 0 : 4))
        .attr('x2', xGroup.bandwidth() / 2 + 4)
        .attr('y1', d => y(d.quartiles[1]))
        .attr('y2', d => y(d.quartiles[1]))
        .attr('stroke-width', 2);
    }
    
    // Jittered points
    if (jitter) {
      groupedData.forEach(({ key, value }) => {
        value.forEach(({ key: subKey, value: subValue }) => {
          if(isStratified) {
            // TODO
          } else {
            const groupG = g.append('g');
            groupG.selectAll('point')
              .data(subValue)
              .enter()
              .append('circle')
                .attr('transform', `translate(${xGroup(key)},0)`)
                .style('stroke', 'none')
                .style('fill', 'silver')
                .style('opacity', '0.1')
                .attr('cx', () => 5 + Math.random() * ((xGroup.bandwidth() / 2) - 10))
                .attr('cy', d => y(d))
                .attr('r', 2);
          }
        });
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
    
    // Legend
    if(isStratified) {
      const legendG = g
        .append('g')
          .attr('transform', `translate(${marginLeft + innerWidth - 150},${marginTop})`);
        legendG.append('rect')
          .attr('width', 150)
          .attr('height', 56)
          .attr('x', 0)
          .attr('y', 0)
          .style('fill', 'rgba(215, 215, 215, 0.2)')
          .attr('rx', 4);
        legendG.append('text')
          .text('Sample Group')
          .style('font-size', '11px')
          .style('line-height', 20)
          .attr('x', 4)
          .attr('y', 14)
          .style('fill', 'white');
        legendG.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('x', 5)
          .attr('y', 23)
          .style('fill', stratificationColor(sampleSetNames[0]));
        legendG.append('text')
          .text(sampleSetNames[0])
          .style('font-size', '11px')
          .attr('x', 20)
          .attr('y', 32)
          .style('fill', 'white');
        legendG.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('x', 5)
          .attr('y', 39)
          .style('fill', stratificationColor(sampleSetNames[1]));
        legendG.append('text')
          .text(sampleSetNames[1])
          .style('font-size', '11px')
          .attr('x', 20)
          .attr('y', 48)
          .style('fill', 'white');
    }
  }, [width, height, data, marginLeft, marginBottom, colors,
    jitter, theme, yMinProp, marginTop, marginRight, featureType,
    featureValueType, featureValueTransformName, yUnits, obsType,
    maxCharactersForLabel, sampleSetSelection,
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
