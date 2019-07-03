import { Set as ImmutableSet, OrderedMap as ImmutableOrderedMap } from 'immutable';

// Class for storing Set objects of string IDs (cell IDs, gene IDs, etc...).
// The collection of sets is stored as a map whose values are Set objects.
export default class Sets {
  constructor(onChange) {
    this.namedSets = ImmutableOrderedMap();
    this.currentSet = ImmutableSet();
    this.selectedKeys = ImmutableSet();
    this.onChange = onChange || (() => {});
  }

  /**
   * Get an array of all keys to the available named sets.
   * @returns {string[]} The array of named set key strings.
   */
  getKeys() {
    return Array.from(this.namedSets.keys());
  }

  /**
   * Get a list of selected keys to the available named sets.
   * @returns {string[]} The array of named set key strings.
   */
  getSelectedKeys() {
    return Array.from(this.selectedKeys.values());
  }

  /**
   * Determine whether a previously-defined set is currently selected.
   * @param {string} key The key of the set of interest.
   * @returns {boolean} Whether the named set is currently selected.
   */
  isSelectedKey(key) {
    return this.selectedKeys.has(key);
  }

  /**
   * @param {string} key The key of the set to select.
   */
  selectNamedSet(key) {
    this.selectedKeys = this.selectedKeys.add(key);
    this.onChange();
  }

  /**
   * @param {string} key The key of the set to deselect.
   */
  deselectNamedSet(key) {
    this.selectedKeys = this.selectedKeys.delete(key);
    this.onChange();
  }

  /**
   * Set all named sets to selected.
   */
  selectAllNamedSets() {
    this.selectedKeys = ImmutableSet(this.getKeys());
    this.onChange();
  }

  /**
   * Clear the set of selected named sets.
   */
  deselectAllNamedSets() {
    this.selectedKeys = ImmutableSet();
    this.onChange();
  }

  /**
   * Get the set of currently-selected items.
   */
  getCurrentSet() {
    return this.currentSet;
  }

  /**
   * Update the set of currently-selected items.
   * @param {Set} set A currently-selected set of items.
   */
  setCurrentSet(set) {
    this.currentSet = ImmutableSet(set);
    this.onChange();
  }

  /**
   * Clear the set of currently-selected items.
   */
  clearCurrentSet() {
    this.currentSet = ImmutableSet();
    this.onChange();
  }

  /**
   * Store the current selection.
   * as a new named set.
     * @param {string} key The key to associate with the set.
     * @param {boolean} clear Whether to also clear the current set after
     */
  nameCurrentSet(key, clear) {
    const { currentSet } = this;
    this.namedSets = this.namedSets.set(key, currentSet);
    if (clear) {
      this.currentSet = ImmutableSet();
    }
    this.onChange();
  }

  /**
   * Store the current selection
   * unioned with any selected named sets
   * as a new named set.
     * @param {string} key The key to associate with the set.
     * @param {boolean} clear Whether to also clear the current set after
     */
  nameUnionedCurrentSet(key, clear) {
    const currentSet = this.unionSelectedSets(true);
    this.namedSets = this.namedSets.set(key, currentSet);
    if (clear) {
      this.currentSet = ImmutableSet();
    }
    this.onChange();
  }

  /**
   * @param {string} key The key of the set to return.
   * @returns {ImmutableSet} The set of interest.
   */
  getNamedSet(key) {
    if (this.namedSets.has(key)) {
      return this.namedSets.get(key);
    }
    return ImmutableSet();
  }

  /**
   * @param {string} key The key of the set to return.
   * @param {Set} set The set of items to associate with the key.
   */
  setNamedSet(key, set) {
    this.namedSets = this.namedSets.set(key, ImmutableSet(set));
    this.onChange();
  }

  /**
   * @param {string} key The key of the set to delete.
   */
  deleteNamedSet(key) {
    if (this.namedSets.has(key)) {
      this.namedSets = this.namedSets.delete(key);
      this.onChange();
    }
  }

  /**
   * Delete all named sets (and all selected keys).
   */
  deleteAllNamedSets() {
    this.namedSets = ImmutableOrderedMap();
    this.selectedKeys = ImmutableSet();
    this.onChange();
  }

  /**
   * Get a set that is the union of the currentSet set
   * and the selected named sets.
   * @param {boolean} includeCurrent Whether to include the items
   * in the current set in the resulting set.
   * @returns {ImmutableSet} The new set resulting from the union operation.
   */
  unionSelectedSets(includeCurrent) {
    const base = (includeCurrent ? this.currentSet : ImmutableSet());
    return this.selectedKeys
      .map(k => this.namedSets.get(k))
      .reduce((a, h) => a.union(h), base);
  }
}
