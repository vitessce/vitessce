import expect from 'expect';
import * as Sets from './sets';

describe('sets.js', () => {
  describe('namedSets.keys()', () => {
    it('has no set keys when first instantiated', () => {
      const setsState = Sets.initialState;
      expect(Array.from(setsState.namedSets.keys()).length).toEqual(0);
    });
    it('has one set key when one set is added', () => {
      let setsState = Sets.initialState;
      setsState = Sets.setNamedSet(setsState, 'test', new Set([1, 2, 3]));
      expect(Array.from(setsState.namedSets.keys()).length).toEqual(1);
      expect(Array.from(setsState.namedSets.keys())[0]).toEqual('test');
    });
  });
  describe('currentSet', () => {
    it('gets the items in the current set', () => {
      let setsState = Sets.initialState;
      setsState = Sets.setCurrentSet(setsState, new Set([1, 2, 3]));
      expect(Array.from(setsState.currentSet.values())).toEqual([1, 2, 3]);
    });
    it('clears the items in the current set', () => {
      let setsState = Sets.initialState;
      setsState = Sets.setCurrentSet(setsState, new Set([1, 2, 3]));
      expect(setsState.currentSet.size).toEqual(3);
      setsState = Sets.clearCurrentSet(setsState);
      expect(setsState.currentSet.size).toEqual(0);
    });
  });
});
