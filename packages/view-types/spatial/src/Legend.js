import React, { useMemo, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { capitalize } from '@vitessce/utils';
import { select } from 'd3-selection';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { getXlinkHref } from './legend-utils';

export const useStyles = makeStyles(() => ({
  
}));

const titleHeight = 10;
const rectHeight = 10;
const tickHeight = 20;


export default function Legend(props) {
  const {
    obsType,
    featureType,
    featureValueType,
    obsColorEncoding,
    featureSelection,
    featureValueColormap,
    featureValueColormapRange,
    spatialChannelColor,
    width = 100,
    expressionData,
  } = props;

  const svgRef = useRef();
  const classes = useStyles();

  const isStaticColor = obsColorEncoding === 'spatialChannelColor';

  const height = isStaticColor ? 20 : 40;

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
    
    const xlinkHref = getXlinkHref(featureValueColormap);
    
    if (obsColorEncoding === 'spatialChannelColor') {
      g.append("rect")
        .attr("x", 0)
        .attr("y", titleHeight)
        .attr("width", width)
        .attr("height", rectHeight)
        .attr("fill", `rgb(${spatialChannelColor[0]},${spatialChannelColor[1]},${spatialChannelColor[2]})`);
    } else {
      g.append("image")
        .attr("x", 0)
        .attr("y", titleHeight)
        .attr("width", width)
        .attr("height", rectHeight)
        .attr("preserveAspectRatio", "none")
        .attr("href", xlinkHref);
      
      if (expressionData && expressionData.length === 1) {
        const dataExtent = extent(expressionData[0]);
        const [xMin, xMax] = dataExtent;
        const [rMin, rMax] = featureValueColormapRange;
        // Use colormap range sliders to determine the range
        // to use in the legend ticks.
        const scaledDataExtent = [
          xMin + (xMax - xMin) * rMin,
          xMax - (xMax - xMin) * (1 - rMax),
        ];
        const x = scaleLinear()
          .domain(scaledDataExtent)
          .range([0, width - 0.5]);
        
        // X-axis ticks
        const axisTicks = g.append("g")
          .attr("transform", `translate(0,${titleHeight + rectHeight})`)
          .style("font-size", "10px")
        .call(axisBottom(x).tickValues(scaledDataExtent));
        axisTicks.selectAll("line,path")
          .style("stroke", "black");
        axisTicks.selectAll("text")
          .style("fill", "black")
        axisTicks.selectAll("text")
          .attr("text-anchor", (d, i) => (i === 0 ? "start" : "end"));
        
        g
          .append("text")
          .attr("text-anchor", "end")
          .attr("x", width)
          .attr("y", titleHeight + rectHeight)
          .text(featureSelection?.[0])
          .style("font-size", "10px")
          .style("fill", "black");
      }
    }
    
    g
      .append("text")
      .attr("text-anchor", "start")
      .attr("x", 0)
      .attr("y", titleHeight)
      .text(capitalize(obsType))
      .style("font-size", "10px")
      .style("fill", "black");
  }, [width, height, featureValueColormap, featureValueColormapRange, obsType,
    obsColorEncoding, spatialChannelColor, expressionData,
  ]);

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
