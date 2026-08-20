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
export const shallowDiff = (prevDeps, nextDeps, depName) => prevDeps[depName] !== nextDeps[depName];
export const shallowDiffByLayer = (prevDeps, nextDeps, depName, scopeName) => (
  prevDeps?.[depName]?.[scopeName] !== nextDeps?.[depName]?.[scopeName]
);
// Rather than checking equality of the entire object,
// here, we only shallowly compare the specific properties that are relevant.
export const shallowDiffByLayerWithKeys = (prevDeps, nextDeps, depName, scopeName, keys) => keys.some(
  k => (prevDeps?.[depName]?.[scopeName]?.[k] !== nextDeps?.[depName]?.[scopeName]?.[k]),
);
export const shallowDiffByChannel = (prevDeps, nextDeps, depName, firstName, secondName) => (
  prevDeps?.[depName]?.[firstName]?.[secondName]
    !== nextDeps?.[depName]?.[firstName]?.[secondName]
);
export const shallowDiffByChannelWithKeys = (prevDeps, nextDeps, depName, firstName, secondName, keys) => keys.some(
  k => (
    prevDeps?.[depName]?.[firstName]?.[secondName]?.[k]
        !== nextDeps?.[depName]?.[firstName]?.[secondName]?.[k]
  ),
);
export const shallowDiffByLayerCoordination = (prevDeps, nextDeps, depName, layerScope) => (
  prevDeps?.[depName]?.[0]?.[layerScope]
    !== nextDeps?.[depName]?.[0]?.[layerScope]
);
export const shallowDiffByLayerCoordinationWithKeys = (prevDeps, nextDeps, depName, layerScope, keys) => keys.some(
  k => prevDeps?.[depName]?.[0]?.[layerScope]?.[k]
        !== nextDeps?.[depName]?.[0]?.[layerScope]?.[k],
);
export const shallowDiffByChannelCoordination = (prevDeps, nextDeps, depName, layerScope, channelScope) => (
  prevDeps?.[depName]?.[0]?.[layerScope]?.[channelScope]
    !== nextDeps?.[depName]?.[0]?.[layerScope]?.[channelScope]
);
export const shallowDiffByChannelCoordinationWithKeys = (prevDeps, nextDeps, depName, layerScope, channelScope, keys) => keys.some(
  k => prevDeps?.[depName]?.[0]?.[layerScope]?.[channelScope]?.[k]
        !== nextDeps?.[depName]?.[0]?.[layerScope]?.[channelScope]?.[k],
);