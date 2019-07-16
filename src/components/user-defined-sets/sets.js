import store from 'store';
// Functions for storing Set objects of string IDs (cell IDs, gene IDs, etc...).
// The collection of sets is stored as a map whose values are Set objects.
// Think of the static methods here as reducer action functions.
// Motivation for using reducer pattern:
// https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367

const SETS = 'sets';

export const initialState = {
  namedSets: new Map(),
  currentSet: [],
};

function toArray(set) {
  if (Array.isArray(set)) {
    return set;
  }
  return Array.from(set);
}

/**
 * Modifies the set entry for a named set.
 * @param {object} state The current state.
 * @param {string} name The set name.
 * @param {array} set The set value.
 * @returns {object} The new state.
 */
export function setNamedSet(state, name, set) {
  return {
    ...state,
    namedSets: new Map([...Array.from(state.namedSets.entries()), [name, toArray(set)]]),
  };
}

/**
     * Deletes the set entry for a named set.
     * @param {object} state The current state.
     * @param {string} name The set name.
     * @returns {object} The new state.
     */
export function deleteNamedSet(state, name) {
  if (state.namedSets.has(name)) {
    const newNamedSets = new Map(Array.from(state.namedSets.entries()));
    newNamedSets.delete(name);
    return {
      ...state,
      namedSets: newNamedSets,
    };
  }
  return state;
}

/**
     * Deletes set entries for all named sets.
     * @param {object} state The current state.
     * @returns {object} The new state.
     */
/* export function deleteAllNamedSets(state) {
  return {
    ...state,
    namedSets: {},
  };
} */

/**
     * Deletes the set mapping for the set specified using prevName,
     * then maps the set value to nextName.
     * @param {object} state The current state.
     * @param {string} prevName The previous name for the set.
     * @param {string} nextName The new name for the set.
     * @returns {object} The new state.
     */
export function renameNamedSet(state, prevName, nextName) {
  if (state.namedSets.has(prevName)) {
    const prevSet = state.namedSets.get(prevName);
    const deletedState = deleteNamedSet(state, prevName);
    return setNamedSet(deletedState, nextName, prevSet);
  }
  return state;
}

/**
     * Modifies the set value for the current set.
     * @param {object} state The current state.
     * @param {array} set The new current set value.
     * @returns {object} The new state.
     */
export function setCurrentSet(state, set) {
  return {
    ...state,
    currentSet: toArray(set),
  };
}

/**
     * Sets the current set value to an empty set.
     * @param {object} state The current state.
     * @returns {object} The new state.
     */
export function clearCurrentSet(state) {
  return setCurrentSet(state, []);
}

/**
     * Copies the current set to a named set entry.
     * @param {object} state The current state.
     * @param {string} name The name for the named set mapping.
     * @param {boolean} clear Whether to clear the current set after the copying. Default: false
     * @returns {object} The new state.
     */
export function nameCurrentSet(state, name, clear) {
  return {
    ...state,
    namedSets: new Map([...Array.from(state.namedSets.entries()), [name, state.currentSet]]),
    currentSet: (clear ? [] : state.currentSet),
  };
}

/**
 * @param {object} state A state object to persist to local storage.
 * @param {string} setTypeKey The type of object in the state, for example "cells" or "genes".
 * @param {string} datasetKey The dataset from which the sets come, for example "linnarson-2018".
 */
export function persist(state, setTypeKey, datasetKey) {
  const sets = store.get(SETS) || {};
  const stateToSave = { namedSets: Array.from(state.namedSets.entries()) };
  // eslint-disable-next-line no-prototype-builtins
  if (!sets.hasOwnProperty(setTypeKey)) {
    sets[setTypeKey] = {
      [datasetKey]: stateToSave,
    };
  } else {
    sets[setTypeKey][datasetKey] = stateToSave;
  }
  store.set(SETS, sets);
}

/**
 * @param {string} setTypeKey The type of object in the state, for example "cells" or "genes".
 * @param {string} datasetKey The dataset from which the sets come, for example "linnarson-2018".
 */
export function restore(setTypeKey, datasetKey) {
  const sets = store.get(SETS) || {};
  // eslint-disable-next-line no-prototype-builtins
  if (sets.hasOwnProperty(setTypeKey) && sets[setTypeKey].hasOwnProperty(datasetKey)) {
    return { ...initialState, namedSets: new Map(sets[setTypeKey][datasetKey].namedSets) };
  }
  return initialState;
}
