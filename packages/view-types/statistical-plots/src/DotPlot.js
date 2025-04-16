import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { clamp } from 'lodash-es';
import { VegaPlot, VEGA_THEMES } from '@vitessce/vega';
import { capitalize, pluralize as plur } from '@vitessce/utils';
import { select } from 'd3-selection';
import { getColorScale } from './utils.js';

/**
 * Gene expression dot plot,
 * implemented with the VegaPlot component.
 * @param {object} props
 * @param {object[]} props.data The expression data, an array
 * of objects with properties `value`, `gene`, and `set`.
 * @param {string} props.theme The name of the current Vitessce theme.
 * @param {number} props.width The container width.
 * @param {number} props.height The container height.
 * @param {number} props.marginRight The size of the margin
 * on the right side of the plot, to account for the vega menu button.
 * By default, 90.
 * @param {number} props.marginBottom The size of the margin
 * on the bottom of the plot, to account for long x-axis labels.
 * Default is allowing the component to automatically determine the margin.
 * @param {string|null} props.featureValueTransformName A name
 * for the feature value transformation function.
 */
export default function DotPlot(props) {
  const {
    isStratified,
    transpose,
    data: rawData,
    theme,
    width,
    height,
    marginRight,
    marginBottom,
    obsType,
    sampleType,
    keyLength = 36,
    featureType,
    featureValueType,
    featureValueTransformName,
    // TODO: re-enable featureValueColormap coordination
    // featureValueColormap,
    obsSetSelection,
    obsSetColor,
  } = props;

  const vegaContainerRef = useRef();

  // Add a property `keyGroup` and `keyFeature` which concatenates the key and the name,
  // which is both unique and can easily be converted
  // back to the name by taking a substring.
  const data = rawData.map(d => ({
    ...d,
    keyGroup: d.groupKey + d.group,
    keyFeature: d.featureKey + d.feature,
    keyGroupSecondary: d.secondaryGroupKey + d.secondaryGroup,
  }));

  // Get the max characters in an axis label for autsizing the bottom margin.
  const maxCharactersForGroup = data.reduce((acc, val) => {
    // eslint-disable-next-line no-param-reassign
    acc = acc === undefined || val.group?.length > acc ? val.group?.length : acc;
    return acc;
  }, 0);
  const maxCharactersForFeature = data.reduce((acc, val) => {
    // eslint-disable-next-line no-param-reassign
    acc = acc === undefined || val.feature.length > acc ? val.feature.length : acc;
    return acc;
  }, 0);
  const maxCharactersForSampleSet = isStratified ? data.reduce((acc, val) => {
    // eslint-disable-next-line no-param-reassign
    acc = acc === undefined || val.secondaryGroup.length > acc ? val.secondaryGroup.length : acc;
    return acc;
  }, 0) : 0;


  // Use a square-root term because the angle of the labels is 45 degrees (see below)
  // so the perpendicular distance to the bottom of the labels is proportional to the
  // square root of the length of the labels along the imaginary hypotenuse.
  // 30 is an estimate of the pixel size of a given character and seems to work well.
  const autoMarginForFeature = marginBottom
    || 30 + Math.sqrt(maxCharactersForFeature / 2) * 30;
  const autoMarginForGroup = marginRight
    || 30 + Math.sqrt(maxCharactersForGroup / 2) * 30;
  const autoMarginForSampleSet = marginRight
    || 30 + Math.sqrt(maxCharactersForSampleSet / 2) * 30;

  const plotWidth = transpose
    ? clamp(width - autoMarginForFeature - 180, 10, Infinity) / (obsSetSelection?.length || 1)
    : clamp(width - autoMarginForGroup - autoMarginForSampleSet - 200, 10, Infinity);
  const plotHeight = transpose
    ? clamp((height - autoMarginForGroup - autoMarginForSampleSet - 50), 10, Infinity)
    : clamp((height - autoMarginForFeature - 80), 10, Infinity) / (obsSetSelection?.length || 1);

  // Get an array of keys for sorting purposes.
  const groupKeys = data.map(d => d.keyGroup);
  const featureKeys = data.map(d => d.keyFeature);
  const groupSecondaryKeys = data.map(d => d.keyGroupSecondary);

  const meanTransform = (featureValueTransformName && featureValueTransformName !== 'None')
    // Mean Log-Transformed Normalized Expression
    ? [`Mean ${featureValueTransformName}-transformed`, `normalized ${featureValueType}`, 'in set']
    // Mean Normalized Expression
    : ['Mean normalized', `${featureValueType} in set`];

  const spec = {
    mark: {
      type: 'circle',
      // The Vega-Lite default opacity is 0.7 for point, tick, circle,
      // or square marks.
      // Reference: https://vega.github.io/vega-lite/docs/mark.html
      opacity: 1.0,
    },
    encoding: {
      [(transpose ? 'y' : 'x')]: {
        field: 'keyFeature',
        type: 'nominal',
        axis: { labelExpr: `substring(datum.label, ${keyLength})` },
        title: capitalize(featureType),
        sort: featureKeys,
      },
      [(transpose ? 'column' : 'row')]: {
        field: 'keyGroup',
        type: 'nominal',
        header: transpose
          ? { labelExpr: `substring(datum.label, ${keyLength})`, labelAngle: -60, labelAlign: 'right', titleOrient: 'bottom', labelOrient: 'bottom' }
          : { labelExpr: `substring(datum.label, ${keyLength})`, labelAngle: 0, labelAlign: 'left' },
        title: `${capitalize(obsType)} Set`,
        sort: groupKeys,
        spacing: 0,
      },
      color: {
        field: 'meanExpInGroup',
        type: 'quantitative',
        title: meanTransform,
        scale: {
          // scheme: featureValueColormap,
          scheme: 'greys',
        },
        legend: {
          direction: 'horizontal',
          tickCount: 2,
        },
      },
      [(transpose ? 'x' : 'y')]: {
        field: 'keyGroupSecondary',
        type: 'nominal',
        axis: { labelExpr: `substring(datum.label, ${keyLength})` },
        title: null, // TODO: use sampleType
        sort: groupSecondaryKeys,
      },
      size: {
        field: 'pctPosInGroup',
        type: 'quantitative',
        title: [`Percentage of ${plur(obsType, 2)}`, 'in set'],
        legend: {
          symbolFillColor: 'white',
        },
        scale: { domain: [0, 100] },
      },
      tooltip: {
        field: 'pctPosInGroup',
        type: 'quantitative',
      },
    },
    width: plotWidth,
    height: plotHeight,
    config: {
      ...VEGA_THEMES[theme],
      ...(!isStratified ? {
        // Remove the row/column outlines when
        // not stratified by sample set.
        view: {
          stroke: 'transparent',
        },
      } : {}),
    },
  };

  const getTooltipText = useCallback(item => ({
    [`${capitalize(featureType)}`]: item.datum.feature,
    [`${capitalize(obsType)} Set`]: item.datum.group,
    ...(isStratified
      ? ({ [`${capitalize(sampleType)} Set`]: item.datum.secondaryGroup })
      : {}
    ),
    [`Percentage of ${plur(obsType, 2)} in set`]: item.datum.pctPosInGroup,
    [meanTransform.join(' ')]: item.datum.meanExpInGroup,
  }), [featureType, obsType, featureValueType, featureValueTransformName]);

  const obsSetColorScale = useMemo(() => getColorScale(
    obsSetSelection, obsSetColor, theme,
  ), [obsSetSelection, obsSetColor, theme]);

  const [vegaRenderIncrement, setVegaRenderIncrement] = useState(0);

  useEffect(() => {
    // If the dot plot is stratified by both obsSet and sampleSet,
    // then we want to add cell set colors.
    // TODO: do we also want to add these color bars
    // when only stratified by obsSet?
    const domElement = vegaContainerRef.current;

    // Here, we assume that the Vega SVG renderer is being used.
    const svg = select(domElement)
      .select('svg');
    // We use the following CSS selector to identify all of
    // the <line> elements that we are interested to modify.
    const tickEls = svg.selectAll('g.root g.column_footer g.role-axis g.role-axis-domain line');

    tickEls
      .attr('stroke-width', 5)
      .attr('dy', 2.5)
      .attr('stroke', (d, i) => {
        const obsSetPath = obsSetSelection?.[i];
        return obsSetColorScale(obsSetPath);
      });
  }, [vegaContainerRef, vegaRenderIncrement, obsSetSelection, obsSetColorScale]);


  // We want to increment the counter whenever we detect that VegaPlot
  // has re-rendered.
  const onNewView = useCallback(() => {
    setVegaRenderIncrement(prev => prev + 1);
  }, []);

  // This is kind of hacky, since it is possible that the useEffect runs prior
  // to the Vega rendering, but in practice it seems to work.
  useEffect(() => {
    setVegaRenderIncrement(prev => prev + 1);
  }, [rawData]);

  return (
    <div ref={vegaContainerRef}>
      <VegaPlot
        data={data}
        spec={spec}
        onNewView={onNewView}
        getTooltipText={getTooltipText}
        renderer="svg"
      />
    </div>
  );
}
