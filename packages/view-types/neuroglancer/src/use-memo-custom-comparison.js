/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import { useRef } from 'react';

/**
 * A variant of useMemo that accepts a custom equality function
 * to determine whether the dependencies have changed.
 * @template T
 * @param {() => T} factory - Function that computes the memoized value.
 * @param {any} dependencies - The useMemo dependencies.
 * @param {(prevDeps: any, nextDeps: any) => boolean} customIsEqual - Custom equality function,
 * which receives the previous and next dependencies and returns true if they are considered equal.
 * @returns {T} The memoized value.
 */
export function useMemoCustomComparison(factory, dependencies, customIsEqual) {
  const ref = useRef(/** @type {{ deps: any; value: T } | undefined} */ (undefined));

  if (ref.current === undefined || !customIsEqual(ref.current.deps, dependencies)) {
    ref.current = { deps: dependencies, value: factory() };
  }

  return ref.current.value;
}


// Comparison utilties inspired by componentDidUpdate in spatial-beta/Spatial.js:
const shallowDiff = (prevDeps, nextDeps, depName) => prevDeps[depName] !== nextDeps[depName];
const shallowDiffByLayer = (prevDeps, nextDeps, depName, scopeName) => (
  prevDeps?.[depName]?.[scopeName] !== nextDeps?.[depName]?.[scopeName]
);
// Rather than checking equality of the entire object,
// here, we only shallowly compare the specific properties that are relevant.
const shallowDiffByLayerWithKeys = (prevDeps, nextDeps, depName, scopeName, keys) => keys.some(
  k => (prevDeps?.[depName]?.[scopeName]?.[k] !== nextDeps?.[depName]?.[scopeName]?.[k]),
);
const shallowDiffByChannel = (prevDeps, nextDeps, depName, firstName, secondName) => (
  prevDeps?.[depName]?.[firstName]?.[secondName]
    !== nextDeps?.[depName]?.[firstName]?.[secondName]
);
const shallowDiffByChannelWithKeys = (prevDeps, nextDeps, depName, firstName, secondName, keys) => keys.some(
  k => (
    prevDeps?.[depName]?.[firstName]?.[secondName]?.[k]
        !== nextDeps?.[depName]?.[firstName]?.[secondName]?.[k]
  ),
);
const shallowDiffByLayerCoordination = (prevDeps, nextDeps, depName, layerScope) => (
  prevDeps?.[depName]?.[0]?.[layerScope]
    !== nextDeps?.[depName]?.[0]?.[layerScope]
);
const shallowDiffByLayerCoordinationWithKeys = (prevDeps, nextDeps, depName, layerScope, keys) => keys.some(
  k => prevDeps?.[depName]?.[0]?.[layerScope]?.[k]
        !== nextDeps?.[depName]?.[0]?.[layerScope]?.[k],
);
const shallowDiffByChannelCoordination = (prevDeps, nextDeps, depName, layerScope, channelScope) => (
  prevDeps?.[depName]?.[0]?.[layerScope]?.[channelScope]
    !== nextDeps?.[depName]?.[0]?.[layerScope]?.[channelScope]
);
const shallowDiffByChannelCoordinationWithKeys = (prevDeps, nextDeps, depName, layerScope, channelScope, keys) => keys.some(
  k => prevDeps?.[depName]?.[0]?.[layerScope]?.[channelScope]?.[k]
        !== nextDeps?.[depName]?.[0]?.[layerScope]?.[channelScope]?.[k],
);

// We need a custom equality function, to handle the nested nature of the dependencies.
// We only want to trigger a re-render if the list of layers/channels themselves changed,
// or if the nested properties (but only those that the colors rely on) for any of them changed.
// Note: if additional properties become relevant for determining cell colors,
// this function will need to be updated to stay in sync with that logic.
export function customIsEqualForCellColors(prevDeps, nextDeps) {
  let forceUpdate = false;

  // We create curried variants so we don't have to constantly pass prevDeps and nextDeps.
  const curriedShallowDiff = depName => shallowDiff(prevDeps, nextDeps, depName);
  const curriedShallowDiffByLayer = (depName, scopeName) => shallowDiffByLayer(prevDeps, nextDeps, depName, scopeName);
  const curriedShallowDiffByChannel = (depName, firstName, secondName) => shallowDiffByChannel(prevDeps, nextDeps, depName, firstName, secondName);
  const curriedShallowDiffByChannelWithKeys = (depName, firstName, secondName, keys) => shallowDiffByChannelWithKeys(prevDeps, nextDeps, depName, firstName, secondName, keys);
  const curriedShallowDiffByLayerCoordination = (depName, layerScope) => shallowDiffByLayerCoordination(prevDeps, nextDeps, depName, layerScope);
  const curriedShallowDiffByLayerCoordinationWithKeys = (depName, layerScope, keys) => shallowDiffByLayerCoordinationWithKeys(prevDeps, nextDeps, depName, layerScope, keys);
  const curriedShallowDiffByChannelCoordination = (depName, layerScope, channelScope) => shallowDiffByChannelCoordination(prevDeps, nextDeps, depName, layerScope, channelScope);
  const curriedShallowDiffByChannelCoordinationWithKeys = (depName, layerScope, channelScope, keys) => shallowDiffByChannelCoordinationWithKeys(prevDeps, nextDeps, depName, layerScope, channelScope, keys);

  // Check if the theme changed, which could change the cell colors even if the underlying data didn't change.
  if (curriedShallowDiff('theme')) {
    forceUpdate = true;
  }

  // Segmentation sets data.
  if (['segmentationLayerScopes', 'segmentationChannelScopesByLayer'].some(curriedShallowDiff)) {
    // Force update for all layers since the layerScopes array changed.
    forceUpdate = true;
  } else {
    // Iterate over layers and channels.
    nextDeps.segmentationLayerScopes?.forEach((layerScope) => {
      nextDeps.segmentationChannelScopesByLayer?.[layerScope]?.forEach((channelScope) => {
        if (
          curriedShallowDiffByChannelWithKeys('obsSegmentationsSetsData', layerScope, channelScope, [
            'obsSets', 'obsIndex',
          ])
            || curriedShallowDiffByChannelCoordinationWithKeys('segmentationChannelCoordination', layerScope, channelScope, [
              'obsSetColor',
              'obsColorEncoding',
              'obsSetSelection',
              'additionalObsSets',
              'spatialChannelColor',
              'spatialChannelOpacity',
              'featureValueColormap',
              'featureValueColormapRange',
              'featureSelection',
            ])
            || curriedShallowDiffByChannel('segmentationMultiIndicesData', layerScope, channelScope)
            || curriedShallowDiffByChannel('segmentationMultiExpressionNormData', layerScope, channelScope)
        ) {
          forceUpdate = true;
        }
      });
    });
  }

  // Return "isEqual" value.
  // (If forceUpdate is true, then isEqual should be false to trigger a re-render.)
  return !forceUpdate;
}

export function customIsEqualForInitialViewerState(prevDeps, nextDeps) {
  let forceUpdate = false;

  // We create curried variants so we don't have to constantly pass prevDeps and nextDeps.
  const curriedShallowDiff = depName => shallowDiff(prevDeps, nextDeps, depName);
  const curriedShallowDiffByLayer = (depName, scopeName) => shallowDiffByLayer(prevDeps, nextDeps, depName, scopeName);
  const curriedShallowDiffByLayerWithKeys = (depName, scopeName, keys) => shallowDiffByLayerWithKeys(prevDeps, nextDeps, depName, scopeName, keys);
  const curriedShallowDiffByChannel = (depName, firstName, secondName) => shallowDiffByChannel(prevDeps, nextDeps, depName, firstName, secondName);
  const curriedShallowDiffByChannelWithKeys = (depName, firstName, secondName, keys) => shallowDiffByChannelWithKeys(prevDeps, nextDeps, depName, firstName, secondName, keys);
  const curriedShallowDiffByLayerCoordination = (depName, layerScope) => shallowDiffByLayerCoordination(prevDeps, nextDeps, depName, layerScope);
  const curriedShallowDiffByLayerCoordinationWithKeys = (depName, layerScope, keys) => shallowDiffByLayerCoordinationWithKeys(prevDeps, nextDeps, depName, layerScope, keys);
  const curriedShallowDiffByChannelCoordination = (depName, layerScope, channelScope) => shallowDiffByChannelCoordination(prevDeps, nextDeps, depName, layerScope, channelScope);
  const curriedShallowDiffByChannelCoordinationWithKeys = (depName, layerScope, channelScope, keys) => shallowDiffByChannelCoordinationWithKeys(prevDeps, nextDeps, depName, layerScope, channelScope, keys);

  if (['theme', 'showAxisLines'].some(curriedShallowDiff)) {
    forceUpdate = true;
  }

  // Segmentation layers/channels.
  if (['segmentationLayerScopes', 'segmentationChannelScopesByLayer'].some(curriedShallowDiff)) {
    // Force update for all layers since the layerScopes array changed.
    forceUpdate = true;
  } else {
    // Iterate over layers and channels.
    nextDeps.segmentationLayerScopes?.forEach((layerScope) => {
      if (
        curriedShallowDiffByLayer('obsSegmentationsData', layerScope)
          || curriedShallowDiffByLayerCoordinationWithKeys('segmentationLayerCoordination', layerScope, [
            'spatialLayerVisible',
          ])
      ) {
        forceUpdate = true;
      }
      nextDeps.segmentationChannelScopesByLayer?.[layerScope]?.forEach((channelScope) => {
        if (
          curriedShallowDiffByChannelCoordinationWithKeys('segmentationChannelCoordination', layerScope, channelScope, [
            'spatialChannelVisible',
          ])
        ) {
          forceUpdate = true;
        }
      });
    });
  }

  // Point layers.
  if (curriedShallowDiff('pointLayerScopes')) {
    // Force update for all layers since the layerScopes array changed.
    forceUpdate = true;
  } else {
    // Iterate over layers and channels.
    nextDeps.pointLayerScopes?.forEach((layerScope) => {
      if (
        curriedShallowDiffByLayer('obsPointsData', layerScope)
          || curriedShallowDiffByLayer('pointMultiIndicesData', layerScope)
          || curriedShallowDiffByLayerCoordinationWithKeys('pointLayerCoordination', layerScope, [
            'spatialLayerVisible',
            'obsColorEncoding',
            'spatialLayerColor',
            'featureSelection',
            'featureFilterMode',
            'featureColor',
            'spatialPointStrokeWidth',
            'featureValueColormap',
            'featureValueColormapRange',
            'featureSelection',
          ])
          // For opacity, use an epsilon comparison to avoid too many re-renders, as it affects performance.
          || (
            Math.abs(prevDeps?.pointLayerCoordination?.[0]?.[layerScope]?.spatialLayerOpacity - nextDeps?.pointLayerCoordination?.[0]?.[layerScope]?.spatialLayerOpacity)
            >= 0.05
          )
      ) {
        forceUpdate = true;
      }
    });
  }

  // Return "isEqual" value.
  // (If forceUpdate is true, then isEqual should be false to trigger a re-render.)
  return !forceUpdate;
}
