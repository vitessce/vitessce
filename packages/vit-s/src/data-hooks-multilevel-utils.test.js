import { describe, it, expect } from 'vitest';
import {
  initializeNestedObject,
  nestFeatureSelectionQueryResults,
  getFeatureSelectionQueryKeyScopeTuples,
  nestQueryResults,
  getQueryKeyScopeTuples,
} from './data-hooks-multilevel-utils.js';

describe('recursive data hook utilities for nesting and un-nesting multi-level queries', () => {
  describe('initializeNestedObject', () => {
    it('should initialize an empty nested object', () => {
      const nestedObject = {};
      initializeNestedObject(['a', 'b', 'c'], nestedObject, () => true);
      expect(nestedObject).toEqual({ a: { b: { c: true } } });
    });

    it('should initialize a non-empty nested object at the same path', () => {
      const nestedObject = { a: { b: { c: [1, 2, 3] } } };
      initializeNestedObject(['a', 'b', 'c'], nestedObject, () => []);
      expect(nestedObject).toEqual({ a: { b: { c: [1, 2, 3] } } });
    });

    it('should initialize a non-empty nested object at a different path', () => {
      const nestedObject = { a: { b: { c: [1, 2, 3] } } };
      initializeNestedObject(['a', 'b', 'd'], nestedObject, () => []);
      expect(nestedObject).toEqual({ a: { b: { c: [1, 2, 3], d: [] } } });
    });
    it('should initialize two paths', () => {
      const nestedObject = {};
      initializeNestedObject(['a', 'b', 'c'], nestedObject, () => true);
      initializeNestedObject(['d', 'e', 'f'], nestedObject, () => true);
      expect(nestedObject).toEqual({
        a: { b: { c: true } },
        d: { e: { f: true } },
      });
    });
  });
  describe('nestFeatureSelectionQueryResults', () => {
    it('should nest flat query results', () => {
      const queryKeyScopeTuples = [
        [['someQueryKey', 'abc'], { levelScopes: ['a', 'b', 'c'], featureIndex: 0, numFeatures: 3 }],
        [['someQueryKey', 'abc'], { levelScopes: ['a', 'b', 'c'], featureIndex: 1, numFeatures: 3 }],
        [['someQueryKey', 'abd'], { levelScopes: ['a', 'b', 'd'], featureIndex: 0, numFeatures: 2 }],
      ];
      const flatQueryResults = [
        'abc0',
        'abc1',
        'abd0',
      ];
      const nestedData = nestFeatureSelectionQueryResults(queryKeyScopeTuples, flatQueryResults);
      expect(nestedData).toEqual({
        a: { b: { c: ['abc0', 'abc1', undefined], d: ['abd0', undefined] } },
      });
    });
  });
  describe('getFeatureSelectionQueryKeyScopeTuples', () => {
    it('should convert nested selections and matchOn objects to array of tuples', () => {
      const selections = { a: { b: { c: ['geneA', 'geneB', 'geneC'] } } };
      const matchOn = { a: { b: { c: { obsType: 'cell', featureType: 'gene' } } } };
      const queryKeyScopeTuples = getFeatureSelectionQueryKeyScopeTuples(selections, matchOn, 3, 'someDataset', 'someDataType', true);
      expect(queryKeyScopeTuples).toEqual([
        [
          ['someDataset', 'someDataType', { obsType: 'cell', featureType: 'gene' }, 'geneA', true, 'useFeatureSelectionMultiLevel'],
          // scope info (for rolling up later)
          { levelScopes: ['a', 'b', 'c'], featureIndex: 0, numFeatures: 3 },
        ],
        [
          ['someDataset', 'someDataType', { obsType: 'cell', featureType: 'gene' }, 'geneB', true, 'useFeatureSelectionMultiLevel'],
          // scope info (for rolling up later)
          { levelScopes: ['a', 'b', 'c'], featureIndex: 1, numFeatures: 3 },
        ],
        [
          ['someDataset', 'someDataType', { obsType: 'cell', featureType: 'gene' }, 'geneC', true, 'useFeatureSelectionMultiLevel'],
          // scope info (for rolling up later)
          { levelScopes: ['a', 'b', 'c'], featureIndex: 2, numFeatures: 3 },
        ],
      ]);
    });
  });
  describe('nestQueryResults', () => {
    it('should nest flat query results', () => {
      const queryKeyScopeTuples = [
        [['someQueryKey', 'abc'], { levelScopes: ['a', 'b', 'c'] }],
        [['someQueryKey', 'abd'], { levelScopes: ['a', 'b', 'd'] }],
      ];
      const flatQueryResults = [
        { someKey: 'abc0' },
        { someKey: 'abd0' },
      ];
      const nestedData = nestQueryResults(queryKeyScopeTuples, flatQueryResults);
      expect(nestedData).toEqual({
        a: { b: { c: { someKey: 'abc0' }, d: { someKey: 'abd0' } } },
      });
    });
  });
  describe('getQueryKeyScopeTuples', () => {
    it('should convert nested selections and matchOn objects to array of tuples', () => {
      const matchOn = { a: { b: { c: { obsType: 'cell', featureType: 'gene' } } } };
      const queryKeyScopeTuples = getQueryKeyScopeTuples(matchOn, 3, 'someDataset', 'someDataType', true);
      expect(queryKeyScopeTuples).toEqual([
        [
          ['someDataset', 'someDataType', { obsType: 'cell', featureType: 'gene' }, true, 'useDataType'],
          // scope info (for rolling up later)
          { levelScopes: ['a', 'b', 'c'] },
        ],
      ]);
    });
  });
});
