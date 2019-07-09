import { Set as ImmutableSet, OrderedMap as ImmutableOrderedMap, isCollection } from 'immutable';

// Class for storing Set objects of string IDs (cell IDs, gene IDs, etc...).
// The collection of sets is stored as a map whose values are Set objects.
// Think of the static methods here as reducer action functions.
// Motivation for using reducer pattern:
// https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367

export default class Sets {
    static initialState = {
      namedSets: ImmutableOrderedMap(),
      currentSet: ImmutableSet(),
    };

    /**
     * Modifies the set entry for a named set.
     * @param {object} state The current state.
     * @param {string} key The set key.
     * @param {Set} set The set value.
     * @returns {object} The new state.
     */
    static setNamedSet(state, key, set) {
      return {
        ...state,
        namedSets: state.namedSets.set(key, ImmutableSet(set)),
      };
    }

    /**
     * Deletes the set entry for a named set.
     * @param {object} state The current state.
     * @param {string} key The set key.
     * @returns {object} The new state.
     */
    static deleteNamedSet(state, key) {
      if (state.namedSets.has(key)) {
        return {
          ...state,
          namedSets: state.namedSets.delete(key),
        };
      }
      return state;
    }

    /**
     * Deletes set entries for all named sets.
     * @param {object} state The current state.
     * @returns {object} The new state.
     */
    static deleteAllNamedSets(state) {
      return {
        ...state,
        namedSets: ImmutableOrderedMap(),
      };
    }

    /**
     * Deletes the set mapping for the set specified using prevKey,
     * then maps the set value to nextKey.
     * @param {object} state The current state.
     * @param {string} prevKey The previous key for the set.
     * @param {string} nextKey The new key for the set.
     * @returns {object} The new state.
     */
    static renameNamedSet(state, prevKey, nextKey) {
      if (state.namedSets.has(prevKey)) {
        const prevSet = state.namedSets.get(prevKey);
        return {
          ...state,
          namedSets: state.namedSets.delete(prevSet).set(nextKey, prevSet),
        };
      }
      return state;
    }

    /**
     * Modifies the set value for the current set.
     * @param {object} state The current state.
     * @param {Set} set The new current set value.
     * @returns {object} The new state.
     */
    static setCurrentSet(state, set) {
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
    static clearCurrentSet(state) {
      return {
        ...state,
        currentSet: ImmutableSet(),
      };
    }

    /**
     * Copies the current set to a named set entry.
     * @param {object} state The current state.
     * @param {string} key The key for the named set mapping.
     * @param {boolean} clear Whether to clear the current set after the copying. Default: false
     * @returns {object} The new state.
     */
    static nameCurrentSet(state, key, clear) {
      return {
        ...state,
        namedSets: state.namedSets.set(key, state.currentSet),
        currentSet: (clear ? ImmutableSet() : state.currentSet),
      };
    }

    static serialize(state) {
      const {
        namedSets = ImmutableOrderedMap(),
        currentSet = ImmutableSet(),
      } = state;
      return {
        namedSets: namedSets.toArray(),
        currentSet: currentSet.toArray(),
      };
    }

    static unserialize(serializedState) {
      const {
        namedSets = [],
        currentSet = [],
      } = serializedState;
      return {
        namedSets: ImmutableOrderedMap(namedSets),
        currentSet: ImmutableSet(currentSet),
      };
    }

    static persist(state, setTypeKey, datasetKey) {
      const serializedState = Sets.serialize(state);
      const serializedSets = JSON.parse(localStorage.getItem('sets')) || {};
      try {
        serializedSets[setTypeKey][datasetKey] = serializedState;
      } catch (e) {
        serializedSets[setTypeKey] = {
          [datasetKey]: serializedState,
        };
      }
      localStorage.setItem('sets', JSON.stringify(serializedSets));
    }

    static restore(setTypeKey, datasetKey) {
      try {
        const serializedState = JSON.parse(localStorage.getItem('sets'))[setTypeKey][datasetKey];
        return Sets.unserialize(serializedState);
      } catch (e) {
        return Sets.unserialize({});
      }
    }
}
