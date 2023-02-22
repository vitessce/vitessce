import React, { useEffect, useRef, useState } from 'react';
import { scaleLinear, scaleOrdinal, scaleThreshold } from "d3-scale";
import { scale as vega_scale } from "vega-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { extent, bin, min, max, rollup as d3_rollup, mean as d3_mean, deviation as d3_deviation } from 'd3-array';
import { area as d3_area, curveCatmullRom, curveBasis } from 'd3-shape';
import { select, create } from "d3-selection";

const scaleBand = vega_scale("band");

// Return filtered array with outliers removed.
function chauvenet(x, keepZeros) {
  var dMax = 3;
  var mean = d3_mean(x, d => d.value);
  var stdv = d3_deviation(x, d => d.value);
  return x.filter(d => (keepZeros || d.value > 0) && dMax > (Math.abs(d.value - mean)) / stdv);
}

export default function StratifiedFeaturePlot(props) {
  const {
    data,
    theme,
    width,
    height,
    marginLeft = 60,
    marginBottom = 60,
    keyLength = 36,
    obsType,
    featureName,
  } = props;

  const svgRef = useRef();


  useEffect(() => {
    const domElement = svgRef.current;

    const svg = select(domElement);
      svg.selectAll("g").remove();
      svg
          .attr("width", width)
          .attr("height", height);
        
    const g = svg
      .append("g")
      .attr("width", width)
      .attr("height", height);
    
    // Remove outliers on a per-group basis.
    const trimmedData = Array.from(
      d3_rollup(data, groupData => chauvenet(groupData, featureName !== 'PTC Aspect Ratio'), d => d['group']),
      ([key, value]) => (value),
    ).flat();

    const innerWidth = width - marginLeft;
    const innerHeight = height - marginBottom;

    const xGroup = scaleBand()
      .range([marginLeft, width])
      .domain(["Total cortex", "Cortical IFTA", "Cortical non-IFTA"])
      .padding(0.1);

    const y = scaleLinear()
      .domain([0, max(trimmedData, d => d['value'])])
      .range([innerHeight, 0]);

    const histogram = bin()
      .thresholds(y.ticks(16))
      .value(d => d['value'])
      .domain(y.domain());

    const groupBins = Array.from(
      d3_rollup(trimmedData, group => histogram(group), d => d['group']),
      ([key, value]) => ({ key, value }),
    );
    const groupBinsMax = max(groupBins.flatMap(d => d.value.map(v => v.length)));

    const x = scaleLinear()
      .domain([-groupBinsMax, groupBinsMax])
      .range([0, xGroup.bandwidth()]);
      
    const area = d3_area()
      .x0(d => x(-d.length))
      .x1(d => x(d.length))
      .y(d => y(d.x0))
      .curve(curveBasis);
    
    // Violin areas
    g
      .selectAll("violin")
      .data(groupBins)
      .enter()
        .append("g")
          .attr("transform", d => `translate(${xGroup(d.key)},0)`)
        .append("path")
          .datum(d => d.value)
          .style("stroke", "none")
          .style("fill","#808080")
          .attr("d", d => area(d));
    
    // Y-axis ticks
    g
      .append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .style("font-size", "14px")
      .call( axisLeft(y) );
    // X-axis ticks
    g
      .append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .style("font-size", "14px")
      .call( axisBottom(xGroup) );
    
    // Y-axis title
    g
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", -innerHeight/2)
      .attr("y", 15)
      .attr("transform", "rotate(-90)")
      .text(featureName)
      .style("font-size", "14px")
      .style("fill", "white");

    // X-axis title
    g
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", marginLeft + innerWidth/2)
      .attr("y", height - 10)
      .text("Group")
      .style("font-size", "14px")
      .style("fill", "white");


  }, [width, height, data, featureName]);

  return (
    <svg
      ref={svgRef}
      style={{
        top: 0,
        left: 0,
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
      }}
    />
  );
}
