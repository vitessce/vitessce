import { Set as ImmutableSet, OrderedMap as ImmutableOrderedMap } from 'immutable';

// Functions for storing Set objects of string IDs (cell IDs, gene IDs, etc...).
// The collection of sets is stored as a map whose values are Set objects.
// Think of the static methods here as reducer action functions.
// Motivation for using reducer pattern:
// https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367

export const initialState = {
  namedSets: ImmutableOrderedMap(),
  currentSet: ImmutableSet(),
};

/**
 * Modifies the set entry for a named set.
 * @param {object} state The current state.
 * @param {string} name The set name.
 * @param {Set} set The set value.
 * @returns {object} The new state.
 */
export function setNamedSet(state, name, set) {
  return {
    ...state,
    namedSets: state.namedSets.set(name, ImmutableSet(set)),
  };
}

/**
     * Deletes the set entry for a named set.
     * @param {object} state The current state.
     * @param {string} name The set name.
     * @returns {object} The new state.
     */
/* export function deleteNamedSet(state, name) {
  if (state.namedSets.has(name)) {
    return {
      ...state,
      namedSets: state.namedSets.delete(name),
    };
  }
  return state;
} */

/**
     * Deletes set entries for all named sets.
     * @param {object} state The current state.
     * @returns {object} The new state.
     */
/* export function deleteAllNamedSets(state) {
  return {
    ...state,
    namedSets: ImmutableOrderedMap(),
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
/* export function renameNamedSet(state, prevName, nextName) {
  if (state.namedSets.has(prevName)) {
    const prevSet = state.namedSets.get(prevName);
    return {
      ...state,
      namedSets: state.namedSets.delete(prevSet).set(nextName, prevSet),
    };
  }
  return state;
} */

/**
     * Modifies the set value for the current set.
     * @param {object} state The current state.
     * @param {Set} set The new current set value.
     * @returns {object} The new state.
     */
export function setCurrentSet(state, set) {
  return {
    ...state,
    currentSet: ImmutableSet(set),
  };
}

/**
     * Sets the current set value to an empty set.
     * @param {object} state The current state.
     * @returns {object} The new state.
     */
export function clearCurrentSet(state) {
  return {
    ...state,
    currentSet: ImmutableSet(),
  };
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
    namedSets: state.namedSets.set(name, state.currentSet),
    currentSet: (clear ? ImmutableSet() : state.currentSet),
  };
}

// TODO: better to do explicit checks than try-catch
// TODO: serialization should go all the way to string
// TODO: add tests when time to un-comment

/* export function serialize(state) {
  const {
    namedSets = ImmutableOrderedMap(),
    currentSet = ImmutableSet(),
  } = state;
  return {
    namedSets: namedSets.toArray(),
    currentSet: currentSet.toArray(),
  };
} */

/* export function unserialize(serializedState) {
  const {
    namedSets = [],
    currentSet = [],
  } = serializedState;
  return {
    namedSets: ImmutableOrderedMap(namedSets),
    currentSet: ImmutableSet(currentSet),
  };
} */

/* export function persist(state, setTypeKey, datasetKey) {
  const serializedState = serialize(state);
  const serializedSets = JSON.parse(localStorage.getItem('sets')) || {};
  try {
    serializedSets[setTypeKey][datasetKey] = serializedState;
  } catch (e) {
    serializedSets[setTypeKey] = {
      [datasetKey]: serializedState,
    };
  }
  localStorage.setItem('sets', JSON.stringify(serializedSets));
} */

/* export function restore(setTypeKey, datasetKey) {
  try {
    const serializedState = JSON.parse(localStorage.getItem('sets'))[setTypeKey][datasetKey];
    return unserialize(serializedState);
  } catch (e) {
    return unserialize({});
  }
} */
