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
import type { Extent, FeatureAggregationStrategy, ObsColorEncoding, SetPath, ObsSetColorEntry } from './types.js';


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
    left: '2px', // Account for parent padding
    width: 'calc(100% - 4px)', // Account for left and right padding
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
      backgroundColor: 'rgb(0, 0, 0)',
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
    top: '2px',
    height: '6px', // rectHeight
    pointerEvents: 'none',
  },
  grayTrack: {
    position: 'absolute',
    top: '2px',
    height: '6px', // rectHeight
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
    pointerEvents: 'none',
  },
}));

const titleHeight = 10;
const rectHeight = 8;
const rectMarginY = 2;
const rectMarginX = 2;


function combineExtents(
  extents: Extent,
  featureAggregationStrategy: FeatureAggregationStrategy,
): [number, number] | null {
  if (Array.isArray(extents)) {
    if (Array.isArray(extents?.[0])) {
      // Extents is an array of [min, max] tuples.
      const extentsArray = extents as [number, number][];
      if (featureAggregationStrategy === 'first') {
        return extentsArray[0];
      } if (featureAggregationStrategy === 'last') {
        return extentsArray.at(-1) || null;
      } if (typeof featureAggregationStrategy === 'number') {
        const i = featureAggregationStrategy;
        return extentsArray[i];
      } if (featureAggregationStrategy === 'sum') {
        return extentsArray.reduce((a, h) => [a[0] + h[0], a[1] + h[1]]);
      } if (featureAggregationStrategy === 'mean') {
        const sum = extentsArray.reduce((a, h) => [a[0] + h[0], a[1] + h[1]]);
        return [sum[0] / extentsArray.length, sum[1] / extentsArray.length];
      }
    } else {
      // Extents is a single [min, max] tuple.
      return extents as [number, number];
    }
  }
  return null;
}

function combineMissings(
  missings: number[] | null,
  featureAggregationStrategy: FeatureAggregationStrategy,
): number | null {
  if (Array.isArray(missings)) {
    if (featureAggregationStrategy === 'first') {
      return missings[0];
    } if (featureAggregationStrategy === 'last') {
      return missings.at(-1) || null;
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

interface LegendProps {
  /** Whether the legend is visible. */
  visible: boolean;
  /** Whether the legend should be positioned relative to its parent. */
  positionRelative?: boolean;
  /** Whether to use high contrast styling. */
  highContrast?: boolean;
  /** The observation type (e.g., 'cell', 'spot'). */
  obsType?: string;
  /** The feature type (e.g., 'gene'). */
  featureType?: string;
  /** The feature value type (e.g., 'expression'). */
  featureValueType?: string;
  /** Whether to consider selections for display. */
  considerSelections?: boolean;
  /** The current color encoding mode. */
  obsColorEncoding?: ObsColorEncoding;
  /** The selected features. */
  featureSelection?: string[];
  /** A map from feature IDs to labels. */
  featureLabelsMap?: Map<string, string>;
  /** The colormap name. */
  featureValueColormap?: string;
  /** The colormap range [min, max] as normalized values [0, 1]. */
  featureValueColormapRange?: [number, number];
  /** Setter for the colormap range. */
  setFeatureValueColormapRange?: (range: [number, number]) => void;
  /** The channel color as RGB array. */
  spatialChannelColor?: number[];
  /** The layer color as RGB array. */
  spatialLayerColor?: number[];
  /** The selected observation sets. */
  obsSetSelection?: SetPath[];
  /** The observation set colors. */
  obsSetColor?: ObsSetColorEntry[];
  /** The feature aggregation strategy. */
  featureAggregationStrategy?: FeatureAggregationStrategy;
  /** The extent of the data in tuple [min, max] or array of tuples. */
  extent?: Extent | null;
  /** The fraction of missing values. */
  missing?: number[] | null;
  /** The width of the legend. */
  width?: number;
  /** The height of the legend. */
  height?: number;
  /** The maximum height of the legend. */
  maxHeight?: number | null;
  /** The theme ('light' or 'dark'). */
  theme?: 'light' | 'dark' | 'light2';
  /** Whether to show the observation label. */
  showObsLabel?: boolean;
  /** Whether points are visible. */
  pointsVisible?: boolean;
  /** Whether contours are visible. */
  contoursVisible?: boolean;
  /** Whether contours are filled. */
  contoursFilled?: boolean;
  /** The contour percentiles. */
  contourPercentiles?: number[];
  /** The contour thresholds. */
  contourThresholds?: number[];
}

/**
 * A component for displaying a legend.
 */
export default function Legend(props: LegendProps) {
  const {
    visible: visibleProp,
    positionRelative = false,
    highContrast = false,
    obsType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    featureType: _featureType = undefined, // Unused but accepted for API compatibility
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

  const svgRef = useRef<SVGSVGElement>(null);
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
      ? debounce((value: [number, number]) => {
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
  const handleSliderChange = useCallback((
    _event: Event,
    newValue: number | number[],
  ) => {
    const rangeValue = newValue as [number, number];
    setLocalRange(rangeValue);
    if (debouncedSetRange) {
      debouncedSetRange(rangeValue);
    }
  }, [debouncedSetRange]);

  const isDarkTheme = theme === 'dark';
  const isStaticColor = obsColorEncoding === 'spatialChannelColor'
    || obsColorEncoding === 'spatialLayerColor';
  const isSetColor = obsColorEncoding === 'cellSetSelection';
  const layerColor = Array.isArray(spatialLayerColor) && spatialLayerColor.length === 3
    ? spatialLayerColor
    : getDefaultColor(theme ?? 'light');
  const channelColor = Array.isArray(spatialChannelColor) && spatialChannelColor.length === 3
    ? spatialChannelColor
    : getDefaultColor(theme ?? 'light');
  const staticColor = obsColorEncoding === 'spatialChannelColor' ? channelColor : layerColor;

  const visible = (visibleProp && (
    (
      !considerSelections || (
        ['geneSelection', 'geneExpression'].includes(obsColorEncoding ?? '')
        && featureSelection
        && Array.isArray(featureSelection)
        && featureSelection.length >= 1
      )
    )
    || (
      isSetColor
      && (obsSetSelection?.length ?? 0) > 0
      && (obsSetColor?.length ?? 0) > 0
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
    ? levelZeroNames.length * titleHeight
      + (obsSetSelection?.length ?? 0) * (rectHeight + rectMarginY)
    : (height + (!pointsVisible && contoursVisible ? 25 : 0));

  // Note: availHeight does not account for multiple stacked legends.
  // The needsScroll determination is made based on only
  // the height of this legend and the height of the parent view.
  const availHeight = maxHeight !== null ? Math.max(0, maxHeight - 4) : Infinity;
  const needsScroll = Number.isFinite(availHeight) && (dynamicHeight > availHeight + 1);

  useEffect(() => {
    const domElement = svgRef.current;
    if (!domElement) return;

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
      && ['geneSelection', 'geneExpression'].includes(obsColorEncoding ?? '')
      && pointsVisible
      && featureValueColormap
    );

    if (!considerSelections || ['geneSelection', 'geneExpression'].includes(obsColorEncoding ?? '')) {
      const combinedExtent = combineExtents(
        extent ?? null,
        featureAggregationStrategy ?? null,
      ) || [0, 1];
      const [xMin, xMax] = combinedExtent;

      if (featureValueColormap && pointsVisible) {
        const xlinkHref = getXlinkHref(featureValueColormap);
        // Use localRange for positioning when slider is interactive
        const currentRange = showInteractiveSlider
          ? localRange
          : featureValueColormapRange;
        const [rMin, rMax] = currentRange || [0, 1];

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
        const scaledDataExtent: [number, number] = [
          xMin + (xMax - xMin) * rMin,
          xMax - (xMax - xMin) * (1 - rMax),
        ];

        let x;
        if (setFeatureValueColormapRange || showInteractiveSlider) {
          x = scaleLinear()
            .domain(scaledDataExtent)
            .range([rMin * width, rMax * width]);
        } else {
          x = scaleLinear()
            .domain(scaledDataExtent)
            .range([0, width]);
        }

        if (showInteractiveSlider) {
          // When interactive slider is active, always show global min/max at edges
          // Create a scale spanning the full width for global extent labels
          const xGlobal = scaleLinear()
            .domain([xMin, xMax])
            .range([0, width - 4]);

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
            .attr('text-anchor', (_d: unknown, i: number) => (i === 0 ? 'start' : 'end'));
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
            .attr('text-anchor', (_d: unknown, i: number) => (i === 0 ? 'start' : 'end'));
        }
      } else if (contoursVisible && contourPercentiles) {
        const tSize = 12;
        const xPercentile = scaleLinear()
          .domain([0, 1])
          .range([(tSize / 2), width - (tSize / 2) - 2]);

        const axisTicks = g.append('g')
          .attr('transform', `translate(0,${titleHeight + rectHeight + 15})`)
          .style('font-size', '9px')
          .call(
            axisBottom(xPercentile)
              .tickValues(contourPercentiles)
              .tickFormat((d: number | { valueOf(): number }) => format('.0%')(d as number))
              .tickSizeOuter(0),
          );
        axisTicks.selectAll('line,path')
          .style('stroke', foregroundColor);
        axisTicks.selectAll('text')
          .style('fill', foregroundColor);

        // Number of percentage points between ticks that are considered
        // far enough apart such that all 3 tick texts can be displayed
        // on the same line. If the difference is less than this threshold,
        // then we shift the middle tick text down to a second line.
        const NEIGHBOR_THRESHOLD = 18;

        const contourPercentages = contourPercentiles.map(p => p * 100);
        if (
          (contourPercentages?.[1] - contourPercentages?.[0] <= NEIGHBOR_THRESHOLD)
          || (contourPercentages?.[2] - contourPercentages?.[1] <= NEIGHBOR_THRESHOLD)
        ) {
          // If the first and last (third) percentile tick texts are too close
          // to the middle tick text, then shift down the middle tick text
          // element vertically so the texts do not overlap/collide.
          axisTicks.selectAll('text')
            .attr('transform', (
              _d: unknown,
              i: number,
            ) => `translate(0,${(i === 0 || i === contourPercentiles.length - 1 ? 0 : 10)})`);
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
          const contourThreshold = xMin
            + (xMax - xMin) * ((contourThresholds?.[i] ?? 0) / 255);

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
        .attr('width', width - 4)
        .attr('height', rectHeight)
        .attr('fill', `rgb(${staticColor[0]},${staticColor[1]},${staticColor[2]})`);
    }
    if (isSetColor && obsSetSelection && obsSetColor) {
      const obsSetSelectionByLevelZero: Record<string, SetPath[]> = {};
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
            ?.color || getDefaultColor(theme ?? 'light');

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
            .text(setPath.at(-1) ?? '')
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
    let featureSelectionLabelRawStr: string | undefined = '';
    if (featureAggregationStrategy === 'first') {
      featureSelectionLabelRawStr = featureSelectionLabelRaw?.[0];
    } else if (featureAggregationStrategy === 'last') {
      featureSelectionLabelRawStr = featureSelectionLabelRaw?.at(-1);
    } else if (typeof featureAggregationStrategy === 'number') {
      const i = featureAggregationStrategy;
      featureSelectionLabelRawStr = featureSelectionLabelRaw?.[i];
    } else if (featureAggregationStrategy === 'sum') {
      if (Array.isArray(featureSelection) && featureSelection.length === 1) {
        featureSelectionLabelRawStr = featureSelectionLabelRaw?.[0];
      } else {
        featureSelectionLabelRawStr = 'Sum of features';
      }
    } else if (featureAggregationStrategy === 'mean') {
      if (Array.isArray(featureSelection) && featureSelection.length === 1) {
        featureSelectionLabelRawStr = featureSelectionLabelRaw?.[0];
      } else {
        featureSelectionLabelRawStr = 'Mean of features';
      }
    } else {
      // Default to the first feature.
      // featureAggregationStrategy was null.
      featureSelectionLabelRawStr = featureSelectionLabelRaw?.[0];
    }
    const combinedMissing = combineMissings(missing ?? null, featureAggregationStrategy ?? null);
    const featureSelectionLabel = combinedMissing
      ? `${featureSelectionLabelRawStr} (${Math.round(combinedMissing * 100)}% NaN)`
      : featureSelectionLabelRawStr;

    // Include obsType in the label text (perhaps only when multi-obsType).
    const obsLabel = capitalize(obsType ?? null);

    // If the parent component wants to consider selections, then
    // use the selected feature for the label. Otherwise,
    // show the feature type.
    const featureLabel = considerSelections
      ? (featureSelectionLabel || capitalize(featureValueType ?? null))
      : capitalize(featureValueType ?? null);

    const mainLabel = showObsLabel ? obsLabel : featureLabel;
    const subLabel = showObsLabel ? featureLabel : null;
    const hasSubLabel = subLabel !== null;

    if (!isSetColor) {
      g
        .append('text')
        .attr('text-anchor', hasSubLabel ? 'start' : 'end')
        .attr('dominant-baseline', 'hanging')
        .attr('x', hasSubLabel ? 0 : width - 4)
        .attr('y', 0)
        .text(mainLabel ?? '')
        .style('font-size', '10px')
        .style('fill', foregroundColor);

      if (hasSubLabel) {
        g
          .append('text')
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'hanging')
          .attr('x', width - 5)
          .attr('y', titleHeight + rectHeight)
          .text(subLabel ?? '')
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
    // We don't accept `geneExpression` from the conf, but the HeatmapSubscriber uses it as a prop
    && ['geneSelection', 'geneExpression'].includes(obsColorEncoding ?? '')
    && pointsVisible
    && featureValueColormap
  );

  // Compute global extent for slider value labels
  const globalExtent = useMemo(() => {
    const combined = combineExtents(extent ?? null, featureAggregationStrategy ?? null);
    return combined || [0, 1] as [number, number];
  }, [extent, featureAggregationStrategy]);

  // Format slider value as actual data value
  const formatSliderValue = useCallback((value: number) => {
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
  const currentLocalRange = localRange || [0, 1];

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
        >
          {/* Gray track on left side (outside colormap range) */}
          {currentLocalRange[0] > 0 && (
            <div
              className={classes.grayTrack}
              style={{
                left: 0,
                width: `${currentLocalRange[0] * 100}%`,
              }}
            />
          )}
          {/* Gray track on right side (outside colormap range) */}
          {currentLocalRange[1] < 1 && (
            <div
              className={classes.grayTrack}
              style={{
                left: `${currentLocalRange[1] * 100}%`,
                width: `${(1 - currentLocalRange[1]) * 100}%`,
              }}
            />
          )}
          {/* Colormap image positioned between slider thumbs */}
          <img
            src={xlinkHref}
            alt="Colormap gradient"
            className={classes.colormapImage}
            style={{
              left: `${currentLocalRange[0] * 100}%`,
              width: `${(currentLocalRange[1] - currentLocalRange[0]) * 100}%`,
            }}
          />
          {/* Interactive range slider */}
          <Slider
            className={classes.sliderRoot}
            value={currentLocalRange}
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
