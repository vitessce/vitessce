import React, {
  useRef, useEffect, useMemo, useState, useCallback,
} from 'react';
import clsx from 'clsx';
import { makeStyles, Slider } from '@vitessce/styles';
import { capitalize, getDefaultColor, cleanFeatureId } from '@vitessce/utils';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { format } from 'd3-format';
import { isEqual, debounce } from 'lodash-es';
import { getXlinkHref } from './legend-utils.js';


const useStyles = makeStyles()(() => ({
  legend: {
    position: 'relative', // Needed for absolute positioning of slider overlay
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
  sliderContainer: {
    position: 'absolute',
    // Position at the colormap location: top offset = titleHeight
    top: '10px', // titleHeight
    left: 0,
    width: '100%',
    height: '8px', // rectHeight
    '&:hover $sliderThumb': {
      opacity: 1,
    },
  },
  sliderRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '8px', // rectHeight
    padding: 0,
    '& .MuiSlider-rail': {
      display: 'none',
    },
    '& .MuiSlider-track': {
      display: 'none',
    },
    '& .MuiSlider-valueLabel': {
      fontSize: '9px',
      padding: '2px 4px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '2px',
    },
  },
  sliderThumb: {
    width: '4px',
    height: '12px',
    borderRadius: '2px',
    backgroundColor: 'white',
    border: '1px solid black',
    opacity: 0,
    transition: 'opacity 0.15s ease-in-out',
    marginTop: '-2px', // Center vertically on the colormap
    '&:hover, &.Mui-focusVisible': {
      boxShadow: '0 0 0 4px rgba(0, 0, 0, 0.16)',
      opacity: 1,
    },
    '&.Mui-active': {
      boxShadow: '0 0 0 6px rgba(0, 0, 0, 0.16)',
      opacity: 1,
    },
  },
  colormapImage: {
    position: 'absolute',
    top: 0,
    height: '8px', // rectHeight
    pointerEvents: 'none',
  },
  grayTrack: {
    position: 'absolute',
    top: 0,
    height: '8px', // rectHeight
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
    pointerEvents: 'none',
  },
}));

const titleHeight = 10;
const rectHeight = 8;
const rectMarginY = 2;
const rectMarginX = 2;

function combineExtents(extents, featureAggregationStrategy) {
  if (Array.isArray(extents)) {
    if (Array.isArray(extents?.[0])) {
      // Extents is an array of [min, max] tuples.
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
    } else {
      // Extents is a single [min, max] tuple.
      return extents;
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
    setFeatureValueColormapRange,
    spatialChannelColor,
    spatialLayerColor,
    obsSetSelection,
    obsSetColor,
    featureAggregationStrategy,
    extent,
    missing,
    width = 100,
    height = 36,
    maxHeight = null,
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

  // Local state for slider to provide immediate feedback
  const [localRange, setLocalRange] = useState(featureValueColormapRange);

  // Update local state when prop changes (e.g., from coordination)
  useEffect(() => {
    setLocalRange(featureValueColormapRange);
  }, [featureValueColormapRange]);

  // Debounced setter for colormap range (5ms trailing)
  const debouncedSetRange = useMemo(
    () => (setFeatureValueColormapRange
      ? debounce((value) => {
        setFeatureValueColormapRange(value);
      }, 5, { leading: false, trailing: true })
      : null),
    [setFeatureValueColormapRange],
  );

  // Cleanup debounce on unmount
  useEffect(() => () => {
    if (debouncedSetRange) {
      debouncedSetRange.cancel();
    }
  }, [debouncedSetRange]);

  // Handle slider change
  const handleSliderChange = useCallback((event, newValue) => {
    setLocalRange(newValue);
    if (debouncedSetRange) {
      debouncedSetRange(newValue);
    }
  }, [debouncedSetRange]);

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

  // Note: availHeight does not account for multiple stacked legends.
  // The needsScroll determination is made based on only
  // the height of this legend and the height of the parent view.
  const availHeight = maxHeight !== null ? Math.max(0, maxHeight - 4) : Infinity;
  const needsScroll = Number.isFinite(availHeight) && (dynamicHeight > availHeight + 1);

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


    // Determine if interactive slider should be shown
    const showInteractiveSlider = (
      setFeatureValueColormapRange
      && obsColorEncoding === 'geneSelection'
      && pointsVisible
      && featureValueColormap
    );

    if (!considerSelections || obsColorEncoding === 'geneSelection') {
      const [xMin, xMax] = combineExtents(extent, featureAggregationStrategy) || [0, 1];

      if (featureValueColormap && pointsVisible) {
        const xlinkHref = getXlinkHref(featureValueColormap);
        // Use localRange for positioning when slider is interactive
        const [rMin, rMax] = showInteractiveSlider ? localRange : featureValueColormapRange;

        if (showInteractiveSlider) {
          // When slider is active, image is rendered as HTML overlay, skip SVG image
          // But we still need to reserve space and draw axis ticks
        } else if (setFeatureValueColormapRange) {
          g.append('image')
            .attr('x', rMin * width)
            .attr('y', titleHeight)
            .attr('width', (rMax - rMin) * width)
            .attr('height', rectHeight)
            .attr('preserveAspectRatio', 'none')
            .attr('href', xlinkHref);
        } else {
          g.append('image')
            .attr('x', 0)
            .attr('y', titleHeight)
            .attr('width', width)
            .attr('height', rectHeight)
            .attr('preserveAspectRatio', 'none')
            .attr('href', xlinkHref);
        }

        // Use colormap range sliders to determine the range
        // to use in the legend ticks.
        const scaledDataExtent = [
          xMin + (xMax - xMin) * rMin,
          xMax - (xMax - xMin) * (1 - rMax),
        ];

        let x;
        if (setFeatureValueColormapRange || showInteractiveSlider) {
          x = scaleLinear()
            .domain(scaledDataExtent)
            .range([rMin * width + 0.5, rMax * width - 0.5]);
        } else {
          x = scaleLinear()
            .domain(scaledDataExtent)
            .range([0.5, width - 0.5]);
        }

        if (showInteractiveSlider) {
          // When interactive slider is active, always show global min/max at edges
          // Create a scale spanning the full width for global extent labels
          const xGlobal = scaleLinear()
            .domain([xMin, xMax])
            .range([0.5, width - 0.5]);

          // X-axis ticks for global extent (always visible at edges)
          const axisTicks = g.append('g')
            .attr('transform', `translate(0,${titleHeight + rectHeight})`)
            .style('font-size', '10px')
            .call(axisBottom(xGlobal).tickValues([xMin, xMax]));
          axisTicks.selectAll('line,path')
            .style('stroke', foregroundColor);
          axisTicks.selectAll('text')
            .style('fill', foregroundColor);
          axisTicks.selectAll('text')
            .attr('text-anchor', (d, i) => (i === 0 ? 'start' : 'end'));
        } else {
          // X-axis ticks for non-interactive mode
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
    } else if (typeof featureAggregationStrategy === 'number') {
      const i = featureAggregationStrategy;
      featureSelectionLabelRawStr = featureSelectionLabelRaw?.[i];
    } else if (featureAggregationStrategy === 'sum') {
      featureSelectionLabelRawStr = 'Sum of features';
    } else if (featureAggregationStrategy === 'mean') {
      featureSelectionLabelRawStr = 'Mean of features';
    } else {
      // Default to the first feature.
      // featureAggregationStrategy was null.
      featureSelectionLabelRawStr = featureSelectionLabelRaw?.[0];
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
  }, [width, height, featureValueColormap, featureValueColormapRange, localRange,
    considerSelections, obsType, obsColorEncoding, featureSelection,
    isDarkTheme, featureValueType, extent, featureLabelsMap,
    spatialChannelColor, obsSetColor, obsSetSelection, isSetColor, theme,
    contourPercentiles, contourThresholds, contoursFilled, contoursVisible,
    pointsVisible, featureAggregationStrategy, setFeatureValueColormapRange,
    dynamicHeight, highContrast, isStaticColor, missing, showObsLabel, staticColor,
  ]);

  // Determine if interactive slider should be shown
  const showInteractiveSlider = (
    setFeatureValueColormapRange
    && obsColorEncoding === 'geneSelection'
    && pointsVisible
    && featureValueColormap
  );

  // Compute global extent for slider value labels
  const globalExtent = useMemo(() => {
    const combined = combineExtents(extent, featureAggregationStrategy);
    return combined || [0, 1];
  }, [extent, featureAggregationStrategy]);

  // Format slider value as actual data value
  const formatSliderValue = useCallback((value) => {
    const [xMin, xMax] = globalExtent;
    const dataValue = xMin + (xMax - xMin) * value;
    // Use appropriate precision based on range
    const range = xMax - xMin;
    if (range < 0.01) {
      return dataValue.toExponential(2);
    } if (range < 1) {
      return dataValue.toFixed(3);
    } if (range < 100) {
      return dataValue.toFixed(1);
    }
    return Math.round(dataValue).toString();
  }, [globalExtent]);

  const xlinkHref = featureValueColormap ? getXlinkHref(featureValueColormap) : null;

  return (
    <div
      className={clsx(classes.legend, {
        [classes.legendRelative]: positionRelative,
        [classes.legendAbsolute]: !positionRelative,
        [classes.legendHighContrast]: highContrast,
        [classes.legendLowContrast]: !highContrast,
        [classes.legendInvisible]: !visible,
      })}
      style={{
        ...(needsScroll
          ? { maxHeight: `${Math.floor(availHeight)}px`, overflowY: 'auto' }
          : { maxHeight: undefined, overflowY: 'visible' }),
        width: `${width}px`,
      }}
    >
      <svg
        ref={svgRef}
        style={{
          width: `${width}px`,
          height: `${dynamicHeight}px`,
        }}
      />
      {showInteractiveSlider && xlinkHref && (
        <div
          className={classes.sliderContainer}
          style={{ width: `${width}px` }}
        >
          {/* Gray track on left side (outside colormap range) */}
          {localRange[0] > 0 && (
            <div
              className={classes.grayTrack}
              style={{
                left: 0,
                width: `${localRange[0] * width}px`,
              }}
            />
          )}
          {/* Gray track on right side (outside colormap range) */}
          {localRange[1] < 1 && (
            <div
              className={classes.grayTrack}
              style={{
                left: `${localRange[1] * width}px`,
                width: `${(1 - localRange[1]) * width}px`,
              }}
            />
          )}
          {/* Colormap image positioned between slider thumbs */}
          <img
            src={xlinkHref}
            alt="Colormap gradient"
            className={classes.colormapImage}
            style={{
              left: `${localRange[0] * width}px`,
              width: `${(localRange[1] - localRange[0]) * width}px`,
            }}
          />
          {/* Interactive range slider */}
          <Slider
            className={classes.sliderRoot}
            value={localRange}
            onChange={handleSliderChange}
            min={0}
            max={1}
            step={0.01}
            disableSwap
            valueLabelDisplay="auto"
            valueLabelFormat={formatSliderValue}
            aria-label="Colormap range"
            getAriaLabel={index => (index === 0 ? 'Colormap minimum' : 'Colormap maximum')}
            getAriaValueText={value => formatSliderValue(value)}
            slotProps={{
              thumb: {
                className: classes.sliderThumb,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
