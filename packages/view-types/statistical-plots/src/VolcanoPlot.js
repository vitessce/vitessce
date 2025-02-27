/* eslint-disable indent */
/* eslint-disable camelcase */
import React, { useMemo, useEffect, useRef } from 'react';
import { scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { extent as d3_extent } from 'd3-array';
import { select } from 'd3-selection';
import { capitalize } from '@vitessce/utils';
import { getColorScale } from './utils.js';

export default function VolcanoPlot(props) {
  const {
    theme,
    width,
    height,
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
  } = props;

  const svgRef = useRef();

  const computedData = useMemo(() => {
    return data.map(d => {
      return {
        ...d,
        df: {
          ...d.df,
          minusLog10p: d.df.featureSignificance.map(v => -Math.log10(v)),
          logFoldChange: d.df.featureFoldChange.map(v => Math.log2(v)),
        }
      }
    });
  }, [data]);

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

    if (!computedData) {
      return;
    }

    // Render scatterplot here

    const innerWidth = width - marginLeft;
    const innerHeight = height - marginBottom;

    // TODO: compute these extents in a useMemo above
    let xExtent = d3_extent(
      computedData.flatMap(d => d3_extent(d.df.logFoldChange))
    );
    const xAbsMax = Math.max(Math.abs(xExtent[0]), Math.abs(xExtent[1]));
    xExtent = [-xAbsMax, xAbsMax];

    const yExtent = d3_extent(
      computedData.flatMap(d => d3_extent(d.df.minusLog10p.filter(v => Number.isFinite(v))))
    );


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
    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(axisBottom(xScale));

    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(axisLeft(yScale));
    
    const g = svg.append("g");

    const obsSetsColumnNameMappingReversed = Object.fromEntries(
      Object
        .entries(obsSetsColumnNameMapping)
        .map(([key, value]) => ([value, key])),
    );

    // Append a circle for each data point.
    computedData.forEach((comparisonObject) => {

      const obsSetG = g.append("g");

      const { df, metadata } = comparisonObject;
      const filteredDf = df.featureId.map((featureId, i) => {
        return {
          featureId,
          logFoldChange: df.logFoldChange[i],
          featureSignificance: df.featureSignificance[i],
          minusLog10p: df.minusLog10p[i],
        };
      }).filter(d => (Math.abs(d.logFoldChange) >= 1.0 && d.featureSignificance <= 0.05));

      const coordinationValues = metadata.coordination_values;
      const rawObsSetPath = coordinationValues.obsSetFilter
        ? coordinationValues.obsSetFilter[0]
        : coordinationValues.obsSetSelection[0];

      const obsSetPath = [...rawObsSetPath];
      obsSetPath[0] = obsSetsColumnNameMappingReversed[rawObsSetPath[0]];
      
      const color = obsSetColorScale(obsSetPath);
      console.log(obsSetColorScale, obsSetPath, color);

      obsSetG.append("g")
        .selectAll("circle")
        .data(filteredDf)
        .join("circle")
          .attr("cx", (d) => xScale(d.logFoldChange))
          .attr("cy", (d) => yScale(d.minusLog10p))
          .attr("r", 3)
          .attr("opacity", 0.5)
          .attr("fill", color);
      
      obsSetG.append("g")
        .selectAll("text")
        .data(filteredDf)
        .join("text")
          .text(d => d.featureId)
          .attr("x", (d) => xScale(d.logFoldChange))
          .attr("y", (d) => yScale(d.minusLog10p))
          .attr("fill", color);
    
      
    });
    
  }, [width, height, theme, sampleSetColor, sampleSetSelection,
    obsSetSelection, obsSetColor, featureType, computedData,
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
