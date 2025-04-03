/* eslint-disable camelcase */
/* eslint-disable max-len */
import { InternMap } from 'internmap';
import { scaleLinear } from 'd3-scale';
import {
  bin,
  min,
  max,
  mean as d3_mean,
  deviation as d3_deviation,
  ascending as d3_ascending,
  quantileSorted,
} from 'd3-array';

// Reference: https://github.com/d3/d3-array/issues/180#issuecomment-851378012
function summarize(iterable, keepZeros) {
  const values = iterable
    .filter(d => keepZeros || d !== 0.0)
    .sort(d3_ascending);
  const minVal = values[0];
  const maxVal = values[values.length - 1];
  const q1 = quantileSorted(values, 0.25);
  const q2 = quantileSorted(values, 0.5);
  const q3 = quantileSorted(values, 0.75);
  const iqr = q3 - q1; // interquartile range
  const r0 = Math.max(minVal, q1 - iqr * 1.5);
  const r1 = Math.min(maxVal, q3 + iqr * 1.5);
  let i = -1;
  while (values[++i] < r0);
  const w0 = values[i];
  while (values[++i] <= r1);
  const w1 = values[i - 1];

  // Chauvenet
  // Reference: https://en.wikipedia.org/wiki/Chauvenet%27s_criterion
  const mean = d3_mean(values);
  const stdv = d3_deviation(values);
  const c0 = mean - 3 * stdv;
  const c1 = mean + 3 * stdv;

  return {
    quartiles: [q1, q2, q3],
    range: [r0, r1],
    whiskers: [w0, w1],
    chauvenetRange: [c0, c1],
    nonOutliers: values.filter(v => c0 <= v && v <= c1),
  };
}

/**
 * Supports three-level stratified input
 * (cell set, sample set, gene).
 * @param {*} stratifiedResult
 * @param {*} posThreshold
 * @returns
 */
export function dotStratifiedExpressionData(
  stratifiedResult, posThreshold,
) {
  const result = new InternMap([], JSON.stringify);
  Array.from(stratifiedResult.entries()).forEach(([cellSetKey, firstLevelInternMap]) => {
    result.set(cellSetKey, new InternMap([], JSON.stringify));
    Array.from(firstLevelInternMap.entries()).forEach(([sampleSetKey, secondLevelInternMap]) => {
      result.get(cellSetKey).set(sampleSetKey, new InternMap([], JSON.stringify));
      Array.from(secondLevelInternMap.entries()).forEach(([geneKey, values]) => {
        if (values) {
          const exprMean = d3_mean(values);
          const numPos = values.reduce((acc, val) => (val > posThreshold ? acc + 1 : acc), 0);
          const fracPos = numPos / values.length;

          const dotSummary = {
            meanExpInGroup: exprMean,
            fracPosInGroup: fracPos,
          };

          result.get(cellSetKey).get(sampleSetKey).set(geneKey, dotSummary);
        }
      });
    });
  });
  return result;
}

/**
 * Supports two-level stratified input
 * (cell set, sample set).
 * @param {*} stratifiedResult
 * @param {*} keepZeros
 * @returns
 */
export function summarizeStratifiedExpressionData(
  stratifiedResult, keepZeros,
) {
  const summarizedResult = new InternMap([], JSON.stringify);
  Array.from(stratifiedResult.entries()).forEach(([cellSetKey, firstLevelInternMap]) => {
    summarizedResult.set(cellSetKey, new InternMap([], JSON.stringify));
    Array.from(firstLevelInternMap.entries()).forEach(([sampleSetKey, secondLevelInternMap]) => {
      const values = secondLevelInternMap;
      const summary = summarize(values, keepZeros);
      summarizedResult.get(cellSetKey).set(sampleSetKey, summary);
    });
  });

  return summarizedResult;
}

/**
 * Supports two-level summarized input
 * (cell set, sample set),
 * the output from summarizeStratifiedExpressionData.
 * @param {*} summarizedResult
 * @param {*} binCount
 * @param {*} yMinProp
 * @returns
 */
export function histogramStratifiedExpressionData(
  summarizedResult, binCount, yMinProp,
) {
  const groupSummaries = Array.from(summarizedResult.entries())
    .map(([cellSetKey, firstLevelInternMap]) => ({
      key: cellSetKey,
      value: Array.from(firstLevelInternMap.entries())
        .map(([sampleSetKey, secondLevelInternMap]) => ({
          key: sampleSetKey,
          value: secondLevelInternMap,
        })),
    }));

  const groupData = groupSummaries
    .map(({ key, value }) => ({
      key,
      value: value.map(({ key: subKey, value: subValue }) => (
        { key: subKey, value: subValue.nonOutliers }
      )),
    }));
  const trimmedData = groupData
    .map(kv => kv.value.map(subKv => subKv.value).flat())
    .flat();

  const yMin = (yMinProp === null ? Math.min(0, min(trimmedData)) : yMinProp);

  // For the y domain, use the yMin prop
  // to support a use case such as 'Aspect Ratio',
  // where the domain minimum should be 1 rather than 0.
  const y = scaleLinear()
    .domain([yMin, max(trimmedData)]);

  const histogram = bin()
    .thresholds(y.ticks(binCount))
    .domain(y.domain());

  const groupBins = groupData.map(kv => ({ key: kv.key,
    value: kv.value.map(subKv => (
      { key: subKv.key, value: histogram(subKv.value) }
    )) }));
  const groupBinsMax = max(
    groupBins
      .flatMap(d => d.value.flatMap(subKv => subKv.value.map(v => v.length))),
  );

  return {
    // Array of [{ key, value: [
    //   { key, value: {
    //      quartiles, range, whiskers, chauvenetRange, nonOutliers }
    //   }
    // ] }]
    groupSummaries,
    groupData, // Array of [{ key, value: [{ key, value: nonOutliers }] }]
    groupBins, // Array of [{ key, value: [{ key, value: histogram(nonOutliers) }] }]
    groupBinsMax, // Number
    y, // d3.scaleLinear without a range set
  };
}
