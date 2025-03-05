/* eslint-disable indent */
/* eslint-disable camelcase */
import React, { useMemo, useEffect, useRef } from 'react';
import { scaleLinear } from 'd3-scale';
import { scale as vega_scale } from 'vega-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { extent as d3_extent } from 'd3-array';
import { select } from 'd3-selection';
import { isEqual } from 'lodash-es';
import { capitalize } from '@vitessce/utils';
import { getColorScale } from './utils.js';

const scaleBand = vega_scale('band');

export default function CellSetCompositionBarPlot(props) {
  const {
    theme,
    width,
    height,
    obsType,
    obsSetsColumnNameMapping,
    sampleSetsColumnNameMapping,
    sampleSetSelection,
    obsSetSelection,
    obsSetColor,
    sampleSetColor,
    data,
    marginTop = 5,
    marginRight = 5,
    marginLeft = 50,
    marginBottom = 50,
  } = props;

  const svgRef = useRef();

  const computedData = useMemo(() => data.map(d => ({
    ...d,
    df: {
      ...d.df,
      logFoldChange: d.df.obsSetFoldChange.map(v => Math.log2(v)),
      // TODO: add intercept + effect?
    },
  })), [data]);

  const [xExtent, yExtent] = useMemo(() => {
    if (!computedData) {
      return [null, null];
    }
    const xExtentResult = d3_extent(
      computedData.flatMap(d => d3_extent(d.df.obsSetFoldChange)),
    );

    const yExtentResult = d3_extent(
      computedData.flatMap(d => d3_extent(d.df.effectExpectedSample)),
    );
    return [xExtentResult, yExtentResult];
  }, [computedData]);

  const [obsSetColorScale, sampleSetColorScale] = useMemo(() => [
    getColorScale(obsSetSelection, obsSetColor, theme),
    getColorScale(sampleSetSelection, sampleSetColor, theme),
  ], [obsSetSelection, sampleSetSelection, sampleSetColor, obsSetColor, theme]);

  useEffect(() => {
    const domElement = svgRef.current;

    const svg = select(domElement);
    svg.selectAll('g').remove();
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'font: 10px sans-serif');

    if (!computedData || !xExtent || !yExtent) {
      return;
    }

    // Render scatterplot
    const innerWidth = width - marginLeft;
    const innerHeight = height - marginBottom;

    const xScale = scaleLinear()
      .range([marginLeft, width - marginRight])
      .domain(xExtent);
    
    // For the y domain, use the yMin prop
    // to support a use case such as 'Aspect Ratio',
    // where the domain minimum should be 1 rather than 0.
    const yScale = scaleLinear()
      .domain(yExtent)
      .range([innerHeight, marginTop]);

    // Add the axes.
    svg.append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(axisBottom(xScale));

    svg.append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(axisLeft(yScale));

    // Axis titles
    const titleG = svg.append('g');
    const fgColor = 'black'; // TODO: use theme to determine this

    // Y-axis title
    titleG
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', -innerHeight / 2)
      .attr('y', 15)
      .attr('transform', 'rotate(-90)')
      .text('Effect')
      .style('font-size', '12px')
      .style('fill', fgColor);

    // X-axis title
    titleG
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', marginLeft + innerWidth / 2)
      .attr('y', height - 10)
      .text(`${capitalize(obsType)} Set`)
      .style('font-size', '12px')
      .style('fill', fgColor);

    // Get a mapping from column name to group name.
    const obsSetsColumnNameMappingReversed = Object.fromEntries(
      Object
        .entries(obsSetsColumnNameMapping)
        .map(([key, value]) => ([value, key])),
    );

    const sampleSetsColumnNameMappingReversed = Object.fromEntries(
      Object
        .entries(sampleSetsColumnNameMapping)
        .map(([key, value]) => ([value, key])),
    );


    const g = svg.append('g');

    // Append a circle for each data point.
    computedData.forEach((comparisonObject) => {
      const obsSetG = g.append('g');

      const { df, metadata } = comparisonObject;
      const coordinationValues = metadata.coordination_values;

      const rawObsSetPath = coordinationValues.obsSetFilter
        ? coordinationValues.obsSetFilter[0]
        : coordinationValues.obsSetSelection[0];
      const obsSetPath = [...rawObsSetPath];
      obsSetPath[0] = obsSetsColumnNameMappingReversed[rawObsSetPath[0]];

      // Swap the foldchange direction if backwards with
      // respect to the current sampleSetSelection pair.
      // 
      let shouldSwapFoldChangeDirection = false;
      if (
        coordinationValues.sampleSetFilter
        && coordinationValues.sampleSetFilter.length === 2
      ) {
        const rawSampleSetPathA = coordinationValues.sampleSetFilter[0];
        const sampleSetPathA = [...rawSampleSetPathA];
        sampleSetPathA[0] = sampleSetsColumnNameMappingReversed[rawSampleSetPathA[0]];

        const rawSampleSetPathB = coordinationValues.sampleSetFilter[1];
        const sampleSetPathB = [...rawSampleSetPathB];
        sampleSetPathB[0] = sampleSetsColumnNameMappingReversed[rawSampleSetPathB[0]];

        if (
          isEqual(sampleSetPathA, sampleSetSelection[1])
          && isEqual(sampleSetPathB, sampleSetSelection[0])
        ) {
          shouldSwapFoldChangeDirection = true;
        }
      }

      const filteredDf = df.obsSetId.map((obsSetId, i) => ({
        obsSetId,
        logFoldChange: df.logFoldChange[i] * (shouldSwapFoldChangeDirection ? -1 : 1),
        effectExpectedSample: df.effectExpectedSample[i],
        interceptExpectedSample: df.interceptExpectedSample[i],
        isCredibleEffect: df.isCredibleEffect[i],
      }));

      const color = obsSetColorScale(obsSetPath);

      
    });
  }, [width, height, theme, sampleSetColor, sampleSetSelection,
    obsSetSelection, obsSetColor, computedData,
    xExtent, yExtent, obsType,
    marginLeft, marginBottom, marginTop, marginRight,
    obsSetColorScale, sampleSetColorScale, 
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
