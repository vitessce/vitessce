/* eslint-disable indent */
/* eslint-disable camelcase */
import React, { useMemo, useEffect, useRef } from 'react';
import { scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { extent as d3_extent } from 'd3-array';
import { select } from 'd3-selection';
import { isEqual } from 'lodash-es';
import { capitalize } from '@vitessce/utils';
import { getColorScale } from './utils.js';

export default function VolcanoPlot(props) {
  const {
    theme,
    width,
    height,
    obsType,
    featureType,
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
    onFeatureClick,
    featurePointSignificanceThreshold,
    featurePointFoldChangeThreshold,
    featureLabelSignificanceThreshold,
    featureLabelFoldChangeThreshold,
  } = props;

  const svgRef = useRef();

  const computedData = useMemo(() => data.map(d => ({
        ...d,
        df: {
          ...d.df,
          minusLog10p: d.df.featureSignificance.map(v => -Math.log10(v)),
          logFoldChange: d.df.featureFoldChange.map(v => Math.log2(v)),
        },
      })), [data]);

  const [xExtent, yExtent] = useMemo(() => {
    if (!computedData) {
      return [null, null];
    }
    let xExtentResult = d3_extent(
      computedData.flatMap(d => d3_extent(d.df.logFoldChange)),
    );
    const xAbsMax = Math.max(Math.abs(xExtentResult[0]), Math.abs(xExtentResult[1]));
    xExtentResult = [-xAbsMax, xAbsMax];

    const yExtentResult = d3_extent(
      computedData.flatMap(d => d3_extent(d.df.minusLog10p.filter(v => Number.isFinite(v)))),
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
      .range([innerHeight, marginTop])
      .clamp(true);

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
      .text('-log10 p-value')
      .style('font-size', '12px')
      .style('fill', fgColor);

    // X-axis title
    titleG
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', marginLeft + innerWidth / 2)
      .attr('y', height - 10)
      .text('log2 fold-change')
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

    // Horizontal and vertical rules to indicate currently-selected thresholds
    // Vertical lines
    const ruleColor = 'silver';
    const ruleDash = '2,2';
    titleG.append('line')
      .attr('x1', xScale(featurePointFoldChangeThreshold))
      .attr('x2', xScale(featurePointFoldChangeThreshold))
      .attr('y1', yScale.range()[0])
      .attr('y2', yScale.range()[1])
      .style('stroke', ruleColor)
      .style('stroke-dasharray', ruleDash);
    titleG.append('line')
      .attr('x1', xScale(-featurePointFoldChangeThreshold))
      .attr('x2', xScale(-featurePointFoldChangeThreshold))
      .attr('y1', yScale.range()[0])
      .attr('y2', yScale.range()[1])
      .style('stroke', ruleColor)
      .style('stroke-dasharray', ruleDash);
    // Horizontal lines
    titleG.append('line')
      .attr('x1', xScale.range()[0])
      .attr('x2', xScale.range()[1])
      .attr('y1', yScale(-Math.log10(featurePointSignificanceThreshold)))
      .attr('y2', yScale(-Math.log10(featurePointSignificanceThreshold)))
      .style('stroke', ruleColor)
      .style('stroke-dasharray', ruleDash);


    // Upregulated/downregulated and sampleSet directional indicators.
    const lhsText = sampleSetSelection && sampleSetSelection.length === 2
      ? sampleSetSelection[0].at(-1)
      : '__rest__';

    // eslint-disable-next-line no-nested-ternary
    const rhsText = sampleSetSelection && sampleSetSelection.length === 2
      ? sampleSetSelection[1].at(-1)
      : (obsSetSelection && obsSetSelection.length === 1
        ? obsSetSelection?.[0]?.at(-1)
        : `${capitalize(obsType)} Set`
      );


    titleG
      .append('text')
      .attr('text-anchor', 'start')
      .attr('x', marginLeft)
      .attr('y', height - 10)
      .text(`\u2190 ${lhsText}`)
      .style('font-size', '12px')
      .style('fill', fgColor);

    titleG
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', marginLeft + innerWidth)
      .attr('y', height - 10)
      .text(`${rhsText} \u2192`)
      .style('font-size', '12px')
      .style('fill', fgColor);


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
      // TODO: move this swapping into the computedData useMemo?
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

      const filteredDf = df.featureId.map((featureId, i) => ({
          featureId,
          logFoldChange: df.logFoldChange[i] * (shouldSwapFoldChangeDirection ? -1 : 1),
          featureSignificance: df.featureSignificance[i],
          minusLog10p: df.minusLog10p[i],
        })).filter(d => (
        (Math.abs(d.logFoldChange) >= (featurePointFoldChangeThreshold ?? 1.0))
        && (d.featureSignificance <= (featurePointSignificanceThreshold ?? 0.05))
      ));

      const color = obsSetColorScale(obsSetPath);

      obsSetG.append('g')
        .selectAll('circle')
        .data(filteredDf)
        .join('circle')
          .attr('cx', d => xScale(d.logFoldChange))
          .attr('cy', d => yScale(d.minusLog10p))
          .attr('r', 3)
          .attr('opacity', 0.5)
          .attr('fill', color)
          .on('click', (event, d) => {
            onFeatureClick(d.featureId);
          });

      const textElements = obsSetG.append('g')
        .selectAll('text')
        .data(filteredDf)
        .join('text')
          .text(d => d.featureId)
          .attr('text-anchor', d => (d.logFoldChange < 0 ? 'end' : 'start'))
          .attr('x', d => xScale(d.logFoldChange))
          .attr('y', d => yScale(d.minusLog10p))
          .style('display', d => ((
            Math.abs(d.logFoldChange) < (featureLabelFoldChangeThreshold ?? 5.0)
            || (d.featureSignificance >= (featureLabelSignificanceThreshold ?? 0.01))
          ) ? 'none' : undefined))
          .attr('fill', color)
          .on('click', (event, d) => {
            onFeatureClick(d.featureId);
          });

      textElements.append('title')
        .text(d => `${featureType}: ${d.featureId}\nin ${obsSetPath?.at(-1)}\nlog2 fold-change: ${d.logFoldChange}\np-value: ${d.featureSignificance}`);
    });
  }, [width, height, theme, sampleSetColor, sampleSetSelection,
    obsSetSelection, obsSetColor, featureType, computedData,
    xExtent, yExtent, obsType,
    marginLeft, marginBottom, marginTop, marginRight,
    obsSetColorScale, sampleSetColorScale, onFeatureClick,
    featurePointSignificanceThreshold, featurePointFoldChangeThreshold,
    featureLabelSignificanceThreshold, featureLabelFoldChangeThreshold,
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
