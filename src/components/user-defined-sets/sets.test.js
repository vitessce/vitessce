import expect from 'expect';
import {
  setsReducer, SET_NAMED_SET, SELECT_NAMED_SET, DESELECT_NAMED_SET,
  DESELECT_ALL_NAMED_SETS, SET_CURRENT_SET, CLEAR_CURRENT_SET,
} from './sets';

describe('sets.js', () => {
  describe('namedSets.keys()', () => {
    it('has no set keys when first instantiated', () => {
      const setsState = setsReducer(undefined, {});
      expect(Array.from(setsState.namedSets.keys()).length).toEqual(0);
    });
    it('has one set key when one set is added', () => {
      let setsState = setsReducer(undefined, {});
      setsState = setsReducer(setsState, {
        type: SET_NAMED_SET,
        key: 'test',
        set: new Set([1, 2, 3]),
      });
      expect(Array.from(setsState.namedSets.keys()).length).toEqual(1);
      expect(Array.from(setsState.namedSets.keys())[0]).toEqual('test');
    });
  });
  describe('selectedKeys', () => {
    it('has no selected set keys if none have been selected', () => {
      let setsState = setsReducer(undefined, {});
      expect(setsState.selectedKeys.size).toEqual(0);
      setsState = setsReducer(setsState, {
        type: SET_NAMED_SET,
        key: 'test',
        set: new Set([1, 2, 3]),
      });
      expect(setsState.selectedKeys.size).toEqual(0);
    });

    it('has one selected set key when one set has been selected', () => {
      let setsState = setsReducer(undefined, {});
      setsState = setsReducer(setsState, {
        type: SET_NAMED_SET,
        key: 'test',
        set: new Set([1, 2, 3]),
      });
      setsState = setsReducer(setsState, {
        type: SELECT_NAMED_SET,
        key: 'test',
      });
      expect(setsState.selectedKeys.size).toEqual(1);
    });
    it('selects and deselects named sets', () => {
      let setsState = setsReducer(undefined, {});
      setsState = setsReducer(setsState, {
        type: SET_NAMED_SET,
        key: 'test',
        set: new Set([1, 2, 3]),
      });
      setsState = setsReducer(setsState, {
        type: SELECT_NAMED_SET,
        key: 'test',
      });
      expect(setsState.selectedKeys.has('test')).toBeTruthy();
      setsState = setsReducer(setsState, {
        type: DESELECT_NAMED_SET,
        key: 'test',
      });
      expect(setsState.selectedKeys.has('test')).toBeFalsy();
    });

    it('deselects all named sets', () => {
      let setsState = setsReducer(undefined, {});
      setsState = setsReducer(setsState, {
        type: SET_NAMED_SET,
        key: 'test',
        set: new Set([1, 2, 3]),
      });
      setsState = setsReducer(setsState, {
        type: SELECT_NAMED_SET,
        key: 'test',
      });
      setsState = setsReducer(setsState, {
        type: SET_NAMED_SET,
        key: 'test2',
        set: new Set([4, 5, 6]),
      });
      setsState = setsReducer(setsState, {
        type: SELECT_NAMED_SET,
        key: 'test2',
      });
      expect(Array.from(setsState.selectedKeys)).toEqual(['test', 'test2']);
      setsState = setsReducer(setsState, {
        type: DESELECT_ALL_NAMED_SETS,
      });
      expect(setsState.selectedKeys.size).toEqual(0);
    });
  });
  describe('currentSet', () => {
    it('gets the items in the current set', () => {
      let setsState = setsReducer(undefined, {});
      setsState = setsReducer(setsState, {
        type: SET_CURRENT_SET,
        key: 'test',
        set: new Set([1, 2, 3]),
      });
      expect(Array.from(setsState.currentSet.values())).toEqual([1, 2, 3]);
    });
    it('clears the items in the current set', () => {
      let setsState = setsReducer(undefined, {});
      setsState = setsReducer(setsState, {
        type: SET_CURRENT_SET,
        key: 'test',
        set: new Set([1, 2, 3]),
      });
      expect(setsState.currentSet.size).toEqual(3);
      setsState = setsReducer(setsState, {
        type: CLEAR_CURRENT_SET,
      });
      expect(setsState.currentSet.size).toEqual(0);
    });
  });
});
