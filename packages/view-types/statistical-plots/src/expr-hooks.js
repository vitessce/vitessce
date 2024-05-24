/* eslint-disable camelcase */
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
import {
  treeToSelectedSetMap,
} from '@vitessce/sets-utils';
import { getValueTransformFunction } from '@vitessce/utils';


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
 * Input: selections and data.
 * Output: expression data in a hierarchy like
 * [
 *   {
 *     "selectedCellSet1": {
 *       "selectedSampleSet1": [],
 *     }
 *   },
 *   exprMax
 * ]
 * @param {*} sampleEdges
 * @param {*} sampleSets
 * @param {*} sampleSetSelection
 * @param {*} expressionData
 * @param {*} obsIndex
 * @param {*} mergedCellSets
 * @param {*} geneSelection
 * @param {*} cellSetSelection
 * @param {*} cellSetColor
 * @param {*} featureValueTransform
 * @param {*} featureValueTransformCoefficient
 * @param {*} theme
 * @returns
 */
export function stratifyExpressionData(
  sampleEdges, sampleSets, sampleSetSelection,
  expressionData, obsIndex, mergedCellSets,
  geneSelection, cellSetSelection, cellSetColor,
  featureValueTransform, featureValueTransformCoefficient,
  theme,
) {
  const result = new InternMap([], JSON.stringify);

  const hasSampleSetSelection = Array.isArray(sampleSetSelection) && sampleSetSelection.length > 0;
  const hasCellSetSelection = Array.isArray(cellSetSelection) && cellSetSelection.length > 0;
  const hasGeneSelection = Array.isArray(geneSelection) && geneSelection.length > 0;

  const sampleSetKeys = hasSampleSetSelection ? sampleSetSelection : [null];
  const cellSetKeys = hasCellSetSelection ? cellSetSelection : [null];
  const geneKeys = hasGeneSelection ? geneSelection : [null];

  // TODO: return a flat array with { cellSet, sampleSet, gene } objects.
  // Then, use d3.group to create nested InternMaps.


  // First level: cell set
  cellSetKeys.forEach((cellSetKey) => {
    result.set(cellSetKey, new InternMap([], JSON.stringify));
    // Second level: sample set
    sampleSetKeys.forEach((sampleSetKey) => {
      result.get(cellSetKey).set(sampleSetKey, new InternMap([], JSON.stringify));
      // Third level: gene
      geneKeys.forEach((geneKey) => {
        result.get(cellSetKey).get(sampleSetKey).set(geneKey, []);
      });
    });
  });


  if (mergedCellSets && cellSetSelection
      && geneSelection && geneSelection.length >= 1
      && expressionData
  ) {
    const sampleIdToSetMap = sampleSets && sampleSetSelection
      ? treeToSelectedSetMap(sampleSets, sampleSetSelection)
      : null;
    const cellIdToSetMap = treeToSelectedSetMap(mergedCellSets, cellSetSelection);

    let exprMax = -Infinity;

    for (let i = 0; i < obsIndex.length; i += 1) {
      const obsId = obsIndex[i];

      const cellSet = cellIdToSetMap?.get(obsId);
      const sampleId = sampleEdges?.get(obsId);
      const sampleSet = sampleId ? sampleIdToSetMap?.get(sampleId) : null;

      if (hasSampleSetSelection && !sampleSet) {
        // Skip this sample if it is not in the selected sample set.
        // eslint-disable-next-line no-continue
        continue;
      }

      geneKeys.forEach((geneKey, geneI) => {
        const value = expressionData[geneI][i];
        const transformFunction = getValueTransformFunction(
          featureValueTransform, featureValueTransformCoefficient,
        );
        const transformedValue = transformFunction(value);
        exprMax = Math.max(transformedValue, exprMax);

        result
          .get(cellSet)
          .get(sampleSet)
          .get(geneKey)
          .push(transformedValue);
      });
    }
    return [result, exprMax];
  }
  return [null, null];
}

/**
 * Supports three-level stratified input
 * (cell set, sample set, gene).
 * Returns two-level stratified output (cell set, sample set).
 * Aggregate stratified expression data so that there is
 * a single value for each (cell set, sample set) tuple.
 * I.e., aggregate along the gene axis.
 * @param {*} stratifiedResult
 * @param {*} geneSelection
 * @returns
 */
export function aggregateStratifiedExpressionData(
  stratifiedResult, geneSelection,
) {
  const result = new InternMap([], JSON.stringify);
  ([...stratifiedResult.keys()]).forEach((cellSetKey) => {
    result.set(cellSetKey, new InternMap([], JSON.stringify));
    ([...stratifiedResult.get(cellSetKey).keys()]).forEach((sampleSetKey) => {
      // For now, we just take the first gene.
      // TODO: support multiple genes via signature score method.
      const values = stratifiedResult.get(cellSetKey).get(sampleSetKey).get(geneSelection[0]);
      result.get(cellSetKey).set(sampleSetKey, values);
    });
  });

  return result;
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
  ([...stratifiedResult.keys()]).forEach((cellSetKey) => {
    result.set(cellSetKey, new InternMap([], JSON.stringify));
    ([...stratifiedResult.get(cellSetKey).keys()]).forEach((sampleSetKey) => {
      result.get(cellSetKey).set(sampleSetKey, new InternMap([], JSON.stringify));

      const allGenes = stratifiedResult.get(cellSetKey).get(sampleSetKey);

      ([...allGenes.keys()]).forEach((geneKey) => {
        const values = allGenes.get(geneKey);

        const exprMean = d3_mean(values);
        const numPos = values.reduce((acc, val) => (val > posThreshold ? acc + 1 : acc), 0);
        const fracPos = numPos / values.length;

        const dotSummary = {
          meanExpInGroup: exprMean,
          fracPosInGroup: fracPos,
        };

        result.get(cellSetKey).get(sampleSetKey).set(geneKey, dotSummary);
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

  ([...stratifiedResult.keys()]).forEach((cellSetKey) => {
    summarizedResult.set(cellSetKey, new InternMap([], JSON.stringify));
    ([...stratifiedResult.get(cellSetKey).keys()]).forEach((sampleSetKey) => {
      const values = stratifiedResult.get(cellSetKey).get(sampleSetKey);
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
  const groupSummaries = ([...summarizedResult.keys()]).map(cellSetKey => ({
    key: cellSetKey,
    value: ([...summarizedResult.get(cellSetKey).keys()]).map(sampleSetKey => ({
      key: sampleSetKey,
      value: summarizedResult.get(cellSetKey).get(sampleSetKey),
    })),
  }));

  const groupData = groupSummaries
    .map(({ key, value }) => ({
      key,
      value: value.map(({ key: subKey, value: subValue }) => (
        { key: subKey, value: subValue.nonOutliers }
      )),
    }));
  const trimmedData = groupData.map(kv => kv.value.map(subKv => subKv.value).flat()).flat();

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
  const groupBinsMax = max(groupBins
    .flatMap(d => d.value.flatMap(subKv => subKv.value.map(v => v.length))));

  return {
    groupSummaries, // Array of [{ key, value: [{ key, value: { quartiles, range, whiskers, chauvenetRange, nonOutliers } }] }]
    groupData, // Array of [{ key, value: [{ key, value: nonOutliers }] }]
    groupBins, // Array of [{ key, value: [{ key, value: histogram(nonOutliers) }] }]
    groupBinsMax, // Number
    y, // d3.scaleLinear without a range set
  };
}
