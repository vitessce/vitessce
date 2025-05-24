import React, { useRef, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@vitessce/styles';
import { capitalize, getDefaultColor, cleanFeatureId } from '@vitessce/utils';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { format } from 'd3-format';
import { isEqual } from 'lodash-es';
import { getXlinkHref } from './legend-utils.js';


const useStyles = makeStyles()(() => ({
  legend: {
    top: '2px',
    right: '2px',
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
const rectMarginY = 2;
const rectMarginX = 2;

function combineExtents(extents, featureAggregationStrategy) {
  if (Array.isArray(extents)) {
    if (featureAggregationStrategy === 'first') {
      return extents[0];
    } if (featureAggregationStrategy === 'last') {
      return extents.at(-1);
    } if (typeof featureAggregationStrategy === 'number') {
      const i = featureAggregationStrategy;
      return extents[i];
    } if (featureAggregationStrategy === 'sum') {
      return extents.reduce((a, h) => [a[0] + h[0], a[1] + h[1]]);
    } if (featureAggregationStrategy === 'mean') {
      return extents.reduce((a, h) => [a[0] + h[0], a[1] + h[1]]).map(v => v / extents.length);
    }
  }
  return null;
}

function combineMissings(missings, featureAggregationStrategy) {
  if (Array.isArray(missings)) {
    if (featureAggregationStrategy === 'first') {
      return missings[0];
    } if (featureAggregationStrategy === 'last') {
      return missings.at(-1);
    } if (typeof featureAggregationStrategy === 'number') {
      const i = featureAggregationStrategy;
      return missings[i];
    } if (featureAggregationStrategy === 'sum') {
      return missings.reduce((a, h) => a + h, 0);
    } if (featureAggregationStrategy === 'mean') {
      return missings.reduce((a, h) => a + (h / missings.length), 0);
    }
  }
  return null;
}

/**
 * A component for displaying a legend.
 *
 * @param {object} props The props for the Legend component.
 * @param {boolean} props.visible Whether the legend is visible.
 * @param {[number, number] | null} props.extent The extent of the
 * data in tuple [min, max].
 * @param {number | null} props.missing The fraction of missing values.
 * @returns {ReactElement}
 */
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
    obsSetSelection,
    obsSetColor,
    featureAggregationStrategy,
    extent,
    missing,
    width = 100,
    height = 36,
    theme,
    showObsLabel = false,
    pointsVisible = true,
    contoursVisible = false,
    contoursFilled,
    contourPercentiles,
    contourThresholds,
  } = props;

  const svgRef = useRef();
  const { classes } = useStyles();

  const isDarkTheme = theme === 'dark';
  const isStaticColor = obsColorEncoding === 'spatialChannelColor' || obsColorEncoding === 'spatialLayerColor';
  const isSetColor = obsColorEncoding === 'cellSetSelection';
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
        && featureSelection.length >= 1
      )
    )
    || (
      isSetColor
      && obsSetSelection?.length > 0
      && obsSetColor?.length > 0
    )
    || isStaticColor

  ));

  // Get the list of set group names which can be used to
  // compute the height of the legend in isSetColor mode.
  const levelZeroNames = useMemo(() => Array.from(
    new Set(obsSetSelection?.map(setPath => setPath[0]) || []),
  ), [obsSetSelection]);

  // Determine the height of the legend when in isSetColor mode.
  // TODO: for nested sets, account for the height of the intermediate nodes?
  const dynamicHeight = isSetColor && obsSetSelection
    ? levelZeroNames.length * titleHeight + obsSetSelection?.length * (rectHeight + rectMarginY)
    : (height + (!pointsVisible && contoursVisible ? 25 : 0));

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
      .attr('height', dynamicHeight);

    const g = svg
      .append('g')
      .attr('width', width)
      .attr('height', dynamicHeight);


    if (!considerSelections || obsColorEncoding === 'geneSelection') {
      const [xMin, xMax] = combineExtents(extent, featureAggregationStrategy) || [0, 1];

      if (featureValueColormap && pointsVisible) {
        const xlinkHref = getXlinkHref(featureValueColormap);
        g.append('image')
          .attr('x', 0)
          .attr('y', titleHeight)
          .attr('width', width)
          .attr('height', rectHeight)
          .attr('preserveAspectRatio', 'none')
          .attr('href', xlinkHref);

        const [rMin, rMax] = featureValueColormapRange;
        // Use colormap range sliders to determine the range
        // to use in the legend ticks.
        const scaledDataExtent = [
          xMin + (xMax - xMin) * rMin,
          xMax - (xMax - xMin) * (1 - rMax),
        ];
        const x = scaleLinear()
          .domain(scaledDataExtent)
          .range([0.5, width - 0.5]);

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
      } else if (contoursVisible) {
        const tSize = 12;
        const xPercentile = scaleLinear()
          .domain([0, 1])
          .range([(tSize / 2), width - (tSize / 2) - 2]);

        const axisTicks = g.append('g')
          .attr('transform', `translate(0,${titleHeight + rectHeight + 15})`)
          .style('font-size', '9px')
          .call(axisBottom(xPercentile).tickValues(contourPercentiles).tickFormat(format('.0%')).tickSizeOuter(0));
        axisTicks.selectAll('line,path')
          .style('stroke', foregroundColor);
        axisTicks.selectAll('text')
          .style('fill', foregroundColor);

        // Number of percentage points between ticks that are considered
        // far enough apart such that all 3 tick texts can be displayed
        // on the same line. If the difference is less than this threshold,
        // then we shift the middle tick text down to a second line.
        const NEIGHBOR_THRESHOLD = 18;

        const contourPercentages = contourPercentiles.map(x => x * 100);
        if (
          (contourPercentages?.[1] - contourPercentages?.[0] <= NEIGHBOR_THRESHOLD)
          || (contourPercentages?.[2] - contourPercentages?.[1] <= NEIGHBOR_THRESHOLD)
        ) {
          // If the first and last (third) percentile tick texts are too close
          // to the middle tick text, then shift down the middle tick text
          // element vertically so the texts do not overlap/collide.
          axisTicks.selectAll('text')
            .attr('transform', (d, i) => `translate(0,${(i === 0 || i === contourPercentiles.length - 1 ? 0 : 10)})`);
        }

        // Create triangles for each percentile to display opacity.
        const triangleGroupG = g.append('g')
          .attr('transform', `translate(0,${titleHeight + rectHeight + 4})`);

        contourPercentiles.forEach((p, i) => {
          const triangleG = triangleGroupG.append('g')
            .attr('transform', `translate(${xPercentile(p) - tSize / 2},0)`);

          triangleG.append('polygon')
            .attr('points', `0 0, ${tSize} 0, ${tSize / 2} ${tSize * 85 / 100}`)
            .style('opacity', (i + 0.5) / contourPercentiles.length);
        });

        // Display the gene expression value thresholds corresponding to each percentile.
        const thresholdGroupG = g.append('g')
          .attr('transform', `translate(0,${titleHeight + rectHeight})`);

        const thresholdFormatter = format('.0f');
        contourPercentiles.forEach((p, i) => {
          const contourThreshold = xMin + (xMax - xMin) * (contourThresholds?.[i] / 255);

          const thresholdG = thresholdGroupG.append('g')
            .attr('transform', `translate(${xPercentile(p)},0)`)
            .style('font-size', '7px');


          thresholdG.append('text')
            .text(thresholdFormatter(contourThreshold))
            .style('fill', foregroundColor)
            .attr('text-anchor', 'middle');
        });
      }
    }
    if (isStaticColor) {
      g.append('rect')
        .attr('x', 0)
        .attr('y', titleHeight)
        .attr('width', width)
        .attr('height', rectHeight)
        .attr('fill', `rgb(${staticColor[0]},${staticColor[1]},${staticColor[2]})`);
    }
    if (isSetColor && obsSetSelection && obsSetColor) {
      const obsSetSelectionByLevelZero = {};
      obsSetSelection.forEach((setPath) => {
        const levelZeroName = setPath[0];
        if (!obsSetSelectionByLevelZero[levelZeroName]) {
          obsSetSelectionByLevelZero[levelZeroName] = [];
        }
        obsSetSelectionByLevelZero[levelZeroName].push(setPath);
      });

      let y = 0;
      Object.entries(obsSetSelectionByLevelZero).forEach(([levelZeroName, setPaths]) => {
        g.append('text')
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'hanging')
          .attr('x', 0)
          .attr('y', y)
          .text(levelZeroName)
          .style('font-size', '9px')
          .style('fill', foregroundColor);
        y += titleHeight;

        setPaths.forEach((setPath) => {
          const setColor = obsSetColor
            ?.find(d => isEqual(d.path, setPath))
            ?.color || getDefaultColor(theme);

          // TODO: for nested sets, render the intermediate nodes in the legend?

          g.append('rect')
            .attr('x', 0)
            .attr('y', y)
            .attr('width', rectHeight)
            .attr('height', rectHeight)
            .attr('fill', `rgb(${setColor[0]},${setColor[1]},${setColor[2]})`);
          g.append('text')
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'hanging')
            .attr('x', rectHeight + rectMarginX)
            .attr('y', y)
            .text(setPath.at(-1))
            .style('font-size', '9px')
            .style('fill', foregroundColor);

          y += (rectHeight + rectMarginY);
        });
      });
    }

    const featureSelectionLabelRaw = (
      featureSelection
      && featureSelection.length >= 1
      && !isStaticColor
    )
      ? (
        featureSelection.map(geneName => featureLabelsMap?.get(geneName)
        || featureLabelsMap?.get(cleanFeatureId(geneName))
        || geneName)
      )
      : null;
    // if there are missing values, mention them in the label
    let featureSelectionLabelRawStr = '';
    if (featureAggregationStrategy === 'first') {
      featureSelectionLabelRawStr = featureSelectionLabelRaw?.[0];
    } else if (featureAggregationStrategy === 'last') {
      featureSelectionLabelRawStr = featureSelectionLabelRaw?.at(-1);
    } else if (featureAggregationStrategy === 'sum') {
      featureSelectionLabelRawStr = 'Sum of features';
    } else if (featureAggregationStrategy === 'mean') {
      featureSelectionLabelRawStr = 'Mean of features';
    }
    const combinedMissing = combineMissings(missing, featureAggregationStrategy);
    const featureSelectionLabel = combinedMissing ? `${featureSelectionLabelRawStr} (${Math.round(combinedMissing * 100)}% NaN)` : featureSelectionLabelRawStr;

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

    if (!isSetColor) {
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
    }
  }, [width, height, featureValueColormap, featureValueColormapRange,
    considerSelections, obsType, obsColorEncoding, featureSelection,
    isDarkTheme, featureValueType, extent, featureLabelsMap,
    spatialChannelColor, obsSetColor, obsSetSelection, isSetColor, theme,
    contourPercentiles, contourThresholds, contoursFilled, contoursVisible,
    pointsVisible, featureAggregationStrategy,
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
          height: `${dynamicHeight}px`,
        }}
      />
    </div>
  );
}
