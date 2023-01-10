import React from 'react';
import clamp from 'lodash/clamp';
import { VegaPlot, VEGA_THEMES, DATASET_NAME } from '@vitessce/vega';
import { capitalize } from '@vitessce/utils';
import plur from 'plur';

/**
 * Gene expression histogram displayed as a bar chart,
 * implemented with the VegaPlot component.
 * @param {object} props
 * @param {object[]} props.data The expression data, an array
 * of objects with properties `value`, `gene`, and `set`.
 * @param {number} props.domainMax The maximum gene expression value.
 * @param {object[]} props.colors An object for each
 * cell set, with properties `name` and `color`.
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
    domainMax = 100,
    data: rawData,
    theme,
    width,
    height,
    marginRight,
    marginBottom,
    obsType,
    keyLength = 36,
    featureType,
    featureValueType,
    featureValueTransformName,
  } = props;

  // Add a property `keyGroup` and `keyFeature` which concatenates the key and the name,
  // which is both unique and can easily be converted
  // back to the name by taking a substring.
  const data = rawData.map(d => ({
    ...d,
    keyGroup: d.groupKey + d.group,
    keyFeature: d.featureKey + d.feature,
  }));

  // Get the max characters in an axis label for autsizing the bottom margin.
  const maxCharactersForGroup = data.reduce((acc, val) => {
    // eslint-disable-next-line no-param-reassign
    acc = acc === undefined || val.group.length > acc ? val.group.length : acc;
    return acc;
  }, 0);
  const maxCharactersForFeature = data.reduce((acc, val) => {
    // eslint-disable-next-line no-param-reassign
    acc = acc === undefined || val.feature.length > acc ? val.feature.length : acc;
    return acc;
  }, 0);
  // Use a square-root term because the angle of the labels is 45 degrees (see below)
  // so the perpendicular distance to the bottom of the labels is proportional to the
  // square root of the length of the labels along the imaginary hypotenuse.
  // 30 is an estimate of the pixel size of a given character and seems to work well.
  const autoMarginVertical = marginBottom
    || 30 + Math.sqrt(maxCharactersForFeature / 2) * 30;
  const autoMarginHorizontal = marginRight
    || 30 + Math.sqrt(maxCharactersForGroup / 2) * 30;

  const plotWidth = clamp(width - autoMarginHorizontal - 120, 10, Infinity);
  const plotHeight = clamp(height - autoMarginVertical, 10, Infinity);

  // Get an array of keys for sorting purposes.
  const groupKeys = data.map(d => d.keyGroup);
  const featureKeys = data.map(d => d.keyFeature);

  const meanTransform = (featureValueTransformName && featureValueTransformName !== 'None')
    // Mean Log-Transformed Normalized Expression
    ? [`Mean ${featureValueTransformName}-transformed`, `normalized ${featureValueType}`, 'in set']
    // Mean Normalized Expression
    : ['Mean normalized', `${featureValueType} in set`];

  const spec = {
    mark: { type: 'circle' },
    encoding: {
      x: {
        field: 'keyFeature',
        type: 'nominal',
        axis: { labelExpr: `substring(datum.label, ${keyLength})` },
        title: capitalize(featureType),
        sort: featureKeys,
      },
      y: {
        field: 'keyGroup',
        type: 'nominal',
        axis: { labelExpr: `substring(datum.label, ${keyLength})` },
        title: `${capitalize(obsType)} Set`,
        sort: groupKeys,
      },
      color: {
        field: 'meanExpInGroup',
        type: 'quantitative',
        title: meanTransform,
        scale: {
          scheme: 'plasma',
        },
        legend: {
          direction: 'horizontal',
          tickCount: 2,
        },
      },
      size: {
        field: 'fracPosInGroup',
        type: 'quantitative',
        title: [`Fraction of ${plur(obsType, 2)}`, 'in set'],
        legend: {
          symbolFillColor: 'white',
        },
      },
    },
    width: plotWidth,
    height: plotHeight,
    config: VEGA_THEMES[theme],
  };

  return (
    <VegaPlot
      data={data}
      spec={spec}
    />
  );
}
