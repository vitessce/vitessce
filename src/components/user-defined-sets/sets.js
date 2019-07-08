import { Set as ImmutableSet, OrderedMap as ImmutableOrderedMap } from 'immutable';

export const SELECT_NAMED_SET = 'SELECT_NAMED_SET';
export const DESELECT_NAMED_SET = 'DESELECT_NAMED_SET';
export const SELECT_ALL_NAMED_SETS = 'SELECT_ALL_NAMED_SETS';
export const DESELECT_ALL_NAMED_SETS = 'DESELECT_ALL_NAMED_SETS';
export const RENAME_NAMED_SET = 'RENAME_NAMED_SET';
export const SET_NAMED_SET = 'SET_NAMED_SET';
export const DELETE_NAMED_SET = 'DELETE_NAMED_SET';
export const DELETE_ALL_NAMED_SETS = 'DELETE_ALL_NAMED_SETS';
export const SET_CURRENT_SET = 'SET_CURRENT_SET';
export const CLEAR_CURRENT_SET = 'CLEAR_CURRENT_SET';
export const NAME_CURRENT_SET = 'NAME_CURRENT_SET';

// Adapted from https://redux.js.org/recipes/reducing-boilerplate#reducers
function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    // eslint-disable-next-line no-prototype-builtins
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    }
    return state;
  };
}

const initialState = {
  namedSets: ImmutableOrderedMap(),
  currentSet: ImmutableSet(),
  selectedKeys: ImmutableSet(),
};

export const setsReducer = createReducer(initialState, {
  [SELECT_NAMED_SET]: (state, action) => ({
    ...state,
    selectedKeys: state.selectedKeys.add(action.key),
  }),
  [DESELECT_NAMED_SET]: (state, action) => ({
    ...state,
    selectedKeys: state.selectedKeys.delete(action.key),
  }),
  [SELECT_ALL_NAMED_SETS]: state => ({
    ...state,
    selectedKeys: ImmutableSet(state.namedSets.keys()),
  }),
  [DESELECT_ALL_NAMED_SETS]: state => ({
    ...state,
    selectedKeys: ImmutableSet(),
  }),
  [SET_NAMED_SET]: (state, action) => ({
    ...state,
    namedSets: state.namedSets.set(action.key, ImmutableSet(action.set)),
  }),
  [DELETE_NAMED_SET]: (state, action) => {
    if (state.namedSets.has(action.key)) {
      return {
        ...state,
        namedSets: state.namedSets.delete(action.key),
      };
    }
    return state;
  },
  [DELETE_ALL_NAMED_SETS]: state => ({
    ...state,
    namedSets: ImmutableOrderedMap(),
    selectedKeys: ImmutableSet(),
  }),
  [RENAME_NAMED_SET]: (state, action) => {
    if (state.namedSets.has(action.prevKey)) {
      const prevSet = state.namedSets.get(action.prevKey);
      return { ...state, namedSets: state.namedSets.delete(prevSet).set(action.nextKey, prevSet) };
    }
    return state;
  },
  [SET_CURRENT_SET]: (state, action) => ({
    ...state,
    currentSet: ImmutableSet(action.set),
  }),
  [CLEAR_CURRENT_SET]: state => ({
    ...state,
    currentSet: ImmutableSet(),
  }),
  [NAME_CURRENT_SET]: (state, action) => ({
    ...state,
    namedSets: state.namedSets.set(action.key, state.currentSet),
    currentSet: (state.clear ? ImmutableSet() : state.currentSet),
  }),
});
