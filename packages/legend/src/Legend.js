import React, { useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { capitalize } from '@vitessce/utils';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { getXlinkHref } from './legend-utils';

export const useStyles = makeStyles(() => ({
  legend: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    zIndex: '100',
    fontSize: '10px !important',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(215, 215, 215, 0.2)',
    borderRadius: '4px',
    padding: '2px',
    lineHeight: '10px !important',
    '& svg': {
      top: 0,
      left: 0,
      position: 'relative',
    },
  },
}));


const titleHeight = 10;
const rectHeight = 10;

export default function Legend(props) {
  const {
    visible: visibleProp,
    obsType,
    featureValueType,
    considerSelections = true,
    obsColorEncoding,
    featureSelection,
    featureValueColormap,
    featureValueColormapRange,
    width = 100,
    height = 40,
    theme,
  } = props;

  const svgRef = useRef();
  const classes = useStyles();

  const isDarkTheme = theme === 'dark';

  const visible = (visibleProp && (
    !considerSelections || (
      obsColorEncoding === 'geneSelection'
      && featureSelection
      && Array.isArray(featureSelection)
      && featureSelection.length === 1
    )
  ));

  useEffect(() => {
    const domElement = svgRef.current;

    const foregroundColor = isDarkTheme ? 'white' : 'black';

    const svg = select(domElement);
    svg.selectAll('g').remove();
    svg
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('width', width)
      .attr('height', height);

    const xlinkHref = getXlinkHref(featureValueColormap);

    if (!considerSelections || obsColorEncoding === 'geneSelection') {
      g.append('image')
        .attr('x', 0)
        .attr('y', titleHeight)
        .attr('width', width)
        .attr('height', rectHeight)
        .attr('preserveAspectRatio', 'none')
        .attr('href', xlinkHref);

      const dataExtent = [0, 1]; // TODO: update once not normalizing expression data
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
      const axisTicks = g.append('g')
        .attr('transform', `translate(0,${titleHeight + rectHeight})`)
        .style('font-size', '10px')
        .call(axisBottom(x).tickValues(scaledDataExtent));
      axisTicks.selectAll('line,path')
        .style('stroke', foregroundColor);
      axisTicks.selectAll('text')
        .style('fill', foregroundColor);
      axisTicks.selectAll('text')
        .attr('text-anchor', (d, i) => (i === 0 ? 'start' : 'end'));
    }

    // If the parent component wants to consider selections, then
    // use the selected feature for the label. Otherwise,
    // show the feature type.
    const legendLabel = considerSelections
      ? (featureSelection?.[0] || capitalize(featureValueType))
      : capitalize(featureValueType);

    g
      .append('text')
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'hanging')
      .attr('x', width)
      .attr('y', 0)
      .text(legendLabel)
      .style('font-size', '10px')
      .style('fill', foregroundColor);
  }, [width, height, featureValueColormap, featureValueColormapRange, considerSelections,
    obsType, obsColorEncoding, featureSelection, isDarkTheme, featureValueType,
  ]);

  return (
    <div className={classes.legend} style={{ display: visible ? 'inline-block' : 'none' }}>
      <svg
        ref={svgRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    </div>
  );
}
