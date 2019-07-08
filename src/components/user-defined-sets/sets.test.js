import expect from 'expect';
import Sets from './sets';

describe('sets.js', () => {
  describe('getKeys()', () => {
    it('has no set keys when first instantiated', () => {
      const sets = new Sets();
      expect(sets.getKeys().length).toEqual(0);
    });

    it('has one set key when one set is added', () => {
      const sets = new Sets();
      sets.setNamedSet('test', new Set([1, 2, 3]));
      expect(sets.getKeys().length).toEqual(1);
      expect(sets.getKeys()[0]).toEqual('test');
    });
  });
  describe('getSelectedKeys()', () => {
    it('has no selected set keys if none have been selected', () => {
      const sets = new Sets();
      expect(sets.getSelectedKeys().length).toEqual(0);
      sets.setNamedSet('test', new Set([1, 2, 3]));
      expect(sets.getSelectedKeys().length).toEqual(0);
    });

    it('has one selected set key when one set has been selected', () => {
      const sets = new Sets();
      sets.setNamedSet('test', new Set([1, 2, 3]));
      sets.selectNamedSet('test');
      expect(sets.getSelectedKeys().length).toEqual(1);
      expect(sets.getSelectedKeys()[0]).toEqual('test');
    });
  });

  describe('deselectNamedSet()', () => {
    it('selects and deselects named sets', () => {
      const sets = new Sets();
      sets.setNamedSet('test', new Set([1, 2, 3]));
      sets.selectNamedSet('test');
      expect(sets.isSelectedKey('test')).toBeTruthy();
      sets.deselectNamedSet('test');
      expect(sets.isSelectedKey('test')).toBeFalsy();
    });
  });
  describe('deselectAllNamedSets()', () => {
    it('deselects all named sets', () => {
      const sets = new Sets();
      sets.setNamedSet('test', new Set([1, 2, 3]));
      sets.selectNamedSet('test');
      sets.setNamedSet('test2', new Set([4, 5, 6]));
      sets.selectNamedSet('test2');
      expect(sets.getSelectedKeys()).toEqual(['test', 'test2']);
      sets.deselectAllNamedSets();
      expect(sets.getSelectedKeys().length).toEqual(0);
    });
  });
  describe('getCurrentSet()', () => {
    it('gets the items in the current set', () => {
      const sets = new Sets();
      sets.setCurrentSet(new Set([1, 2, 3]));
      expect(Array.from(sets.getCurrentSet().values())).toEqual([1, 2, 3]);
    });
  });
  describe('clearCurrentSet()', () => {
    it('clears the items in the current set', () => {
      const sets = new Sets();
      sets.setCurrentSet(new Set([1, 2, 3]));
      expect(sets.getCurrentSet().size).toEqual(3);
      sets.clearCurrentSet();
      expect(sets.getCurrentSet().size).toEqual(0);
    });
  });
});
