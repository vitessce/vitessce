import React, { useRef, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { capitalize, getDefaultColor } from '@vitessce/utils';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { getXlinkHref } from './legend-utils.js';


const useStyles = makeStyles(() => ({
  legend: {
    top: '2px',
    right: '2px',
    zIndex: '100',
    fontSize: '10px !important',
    flexDirection: 'column',
    backgroundColor: 'rgba(215, 215, 215, 0.7)',
    borderRadius: '4px',
    padding: '2px',
    lineHeight: '10px !important',
    '& svg': {
      top: 0,
      left: 0,
      position: 'relative',
    },
  },
  legendAbsolute: {
    position: 'absolute',
    display: 'inline-block',
  },
  legendRelative: {
    position: 'relative',
    marginBottom: '2px',
    display: 'block',
  },
  legendHighContrast: {
    backgroundColor: 'rgba(215, 215, 215, 0.7)',
  },
  legendLowContrast: {
    backgroundColor: 'rgba(215, 215, 215, 0.2)',
  },
  legendInvisible: {
    display: 'none',
  },
}));

const titleHeight = 10;
const rectHeight = 8;

export default function Legend(props) {
  const {
    visible: visibleProp,
    positionRelative = false,
    highContrast = false,
    obsType,
    featureValueType,
    considerSelections = true,
    obsColorEncoding,
    featureSelection,
    featureLabelsMap,
    featureValueColormap,
    featureValueColormapRange,
    spatialChannelColor,
    spatialLayerColor,
    extent,
    width = 100,
    height = 36,
    theme,
    showObsLabel = false,
  } = props;

  const svgRef = useRef();
  const classes = useStyles();

  const isDarkTheme = theme === 'dark';
  const isStaticColor = obsColorEncoding === 'spatialChannelColor' || obsColorEncoding === 'spatialLayerColor';
  const layerColor = Array.isArray(spatialLayerColor) && spatialLayerColor.length === 3
    ? spatialLayerColor
    : getDefaultColor(theme);
  const channelColor = Array.isArray(spatialChannelColor) && spatialChannelColor.length === 3
    ? spatialChannelColor
    : getDefaultColor(theme);
  const staticColor = obsColorEncoding === 'spatialChannelColor' ? channelColor : layerColor;

  const visible = (visibleProp && (
    (
      !considerSelections || (
        obsColorEncoding === 'geneSelection'
        && featureSelection
        && Array.isArray(featureSelection)
        && featureSelection.length === 1
      )
    )
    || isStaticColor
  ));

  useEffect(() => {
    const domElement = svgRef.current;

    // eslint-disable-next-line no-nested-ternary
    const foregroundColor = highContrast ? 'black' : (
      isDarkTheme ? 'white' : 'black'
    );

    const svg = select(domElement);
    svg.selectAll('g').remove();
    svg
      .attr('width', width)
      .attr('height', height);

    const g = svg
      .append('g')
      .attr('width', width)
      .attr('height', height);


    if (!considerSelections || obsColorEncoding === 'geneSelection') {
      if (featureValueColormap) {
        const xlinkHref = getXlinkHref(featureValueColormap);
        g.append('image')
          .attr('x', 0)
          .attr('y', titleHeight)
          .attr('width', width)
          .attr('height', rectHeight)
          .attr('preserveAspectRatio', 'none')
          .attr('href', xlinkHref);
      }

      const [xMin, xMax] = extent || [0, 1];
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
    if (isStaticColor) {
      g.append('rect')
        .attr('x', 0)
        .attr('y', titleHeight)
        .attr('width', width)
        .attr('height', rectHeight)
        .attr('fill', `rgb(${staticColor[0]},${staticColor[1]},${staticColor[2]})`);
    }

    const featureSelectionLabel = (
      featureSelection
      && featureSelection.length >= 1
      && !isStaticColor
    )
      ? (featureLabelsMap?.get(featureSelection[0]) || featureSelection[0])
      : null;

    // Include obsType in the label text (perhaps only when multi-obsType).
    const obsLabel = capitalize(obsType);

    // If the parent component wants to consider selections, then
    // use the selected feature for the label. Otherwise,
    // show the feature type.
    const featureLabel = considerSelections
      ? (featureSelectionLabel || capitalize(featureValueType))
      : capitalize(featureValueType);

    const mainLabel = showObsLabel ? obsLabel : featureLabel;
    const subLabel = showObsLabel ? featureLabel : null;
    const hasSubLabel = subLabel !== null;

    g
      .append('text')
      .attr('text-anchor', hasSubLabel ? 'start' : 'end')
      .attr('dominant-baseline', 'hanging')
      .attr('x', hasSubLabel ? 0 : width)
      .attr('y', 0)
      .text(mainLabel)
      .style('font-size', '10px')
      .style('fill', foregroundColor);

    if (hasSubLabel) {
      g
        .append('text')
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'hanging')
        .attr('x', width)
        .attr('y', titleHeight)
        .text(subLabel)
        .style('font-size', '9px')
        .style('fill', foregroundColor);
    }
  }, [width, height, featureValueColormap, featureValueColormapRange, considerSelections,
    obsType, obsColorEncoding, featureSelection, isDarkTheme, featureValueType, extent,
    featureLabelsMap, spatialChannelColor,
  ]);

  return (
    <div
      className={clsx(classes.legend, {
        [classes.legendRelative]: positionRelative,
        [classes.legendAbsolute]: !positionRelative,
        [classes.legendHighContrast]: highContrast,
        [classes.legendLowContrast]: !highContrast,
        [classes.legendInvisible]: !visible,
      })}
    >
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
