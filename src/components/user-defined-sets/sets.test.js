import expect from 'expect';
import Sets from './sets';

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
  describe('selectedKeys', () => {
    it('has no selected set keys if none have been selected', () => {
      let setsState = Sets.initialState;
      expect(setsState.selectedKeys.size).toEqual(0);
      setsState = Sets.setNamedSet(setsState, 'test', new Set([1, 2, 3]));
      expect(setsState.selectedKeys.size).toEqual(0);
    });

    it('has one selected set key when one set has been selected', () => {
      let setsState = Sets.initialState;
      setsState = Sets.setNamedSet(setsState, 'test', new Set([1, 2, 3]));
      setsState = Sets.selectNamedSet(setsState, 'test');
      expect(setsState.selectedKeys.size).toEqual(1);
    });
    it('selects and deselects named sets', () => {
      let setsState = Sets.initialState;
      setsState = Sets.setNamedSet(setsState, 'test', new Set([1, 2, 3]));
      setsState = Sets.selectNamedSet(setsState, 'test');
      expect(setsState.selectedKeys.has('test')).toBeTruthy();
      setsState = Sets.deselectNamedSet(setsState, 'test');
      expect(setsState.selectedKeys.has('test')).toBeFalsy();
    });

    it('deselects all named sets', () => {
      let setsState = Sets.initialState;
      setsState = Sets.setNamedSet(setsState, 'test', new Set([1, 2, 3]));
      setsState = Sets.selectNamedSet(setsState, 'test');
      setsState = Sets.setNamedSet(setsState, 'test2', new Set([4, 5, 6]));
      setsState = Sets.selectNamedSet(setsState, 'test2');
      expect(Array.from(setsState.selectedKeys)).toEqual(['test', 'test2']);
      setsState = Sets.deselectAllNamedSets(setsState);
      expect(setsState.selectedKeys.size).toEqual(0);
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
