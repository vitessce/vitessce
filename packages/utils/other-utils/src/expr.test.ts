import { describe, it, expect } from 'vitest';
import { resolveFeatureAggregationStrategy } from './expr.js';

describe('expr.ts', () => {
  describe('resolveFeatureAggregationStrategy', () => {
    const featureSelection = ['CD4', 'CD8', 'MS4A1'];

    it('converts a feature name into its index', () => {
      expect(resolveFeatureAggregationStrategy('CD8', featureSelection)).toEqual(1);
      expect(resolveFeatureAggregationStrategy('MS4A1', featureSelection)).toEqual(2);
    });

    it('falls back to first when the named feature is not selected', () => {
      expect(resolveFeatureAggregationStrategy('GAPDH', featureSelection)).toEqual('first');
      expect(resolveFeatureAggregationStrategy('CD8', null)).toEqual('first');
    });

    it('passes through reserved strategies and null', () => {
      ['first', 'last', 'sum', 'mean', 'difference'].forEach((strategy) => {
        expect(resolveFeatureAggregationStrategy(strategy, featureSelection)).toEqual(strategy);
      });
      expect(resolveFeatureAggregationStrategy(null, featureSelection)).toBeNull();
      expect(resolveFeatureAggregationStrategy(undefined, featureSelection)).toBeNull();
    });

    it('passes through valid indices and falls back to first for invalid ones', () => {
      expect(resolveFeatureAggregationStrategy(2, featureSelection)).toEqual(2);
      expect(resolveFeatureAggregationStrategy(3, featureSelection)).toEqual('first');
      expect(resolveFeatureAggregationStrategy(-1, featureSelection)).toEqual('first');
      // Without a featureSelection, the index cannot be validated.
      expect(resolveFeatureAggregationStrategy(3, null)).toEqual(3);
    });
  });
});
