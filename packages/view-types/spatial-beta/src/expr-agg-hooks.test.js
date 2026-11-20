import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  aggregateExpressionForScope,
  useAggregatedNormalizedExpressionDataForChannels,
} from './expr-agg-hooks.js';

const geneA = new Uint8Array([0, 128, 255]);
const geneB = new Uint8Array([255, 0, 10]);
const geneC = new Uint8Array([5, 5, 5]);
const extentA = [0, 10];
const extentB = [-1, 1];
const extentC = [3, 4];
// Raw values corresponding to the normalized arrays above.
const rawA = [0, 5, 10];
const rawB = [1, -1, -0.9];
const rawC = [3, 3, 3];

describe('expr-agg-hooks.js', () => {
  describe('aggregateExpressionForScope', () => {
    it('returns null when there is at most one feature', () => {
      expect(aggregateExpressionForScope([rawA], [geneA], [extentA], 0)).toBeNull();
      expect(aggregateExpressionForScope(null, null, null, 0)).toBeNull();
    });

    it('selects a single feature by index, keeping its original extent', () => {
      const result = aggregateExpressionForScope(
        [rawA, rawB, rawC], [geneA, geneB, geneC], [extentA, extentB, extentC], 1,
      );
      expect(result.normData).toEqual([geneB]);
      expect(result.extents).toEqual([extentB]);
    });

    it('selects a single feature by name', () => {
      const result = aggregateExpressionForScope(
        [rawA, rawB, rawC], [geneA, geneB, geneC], [extentA, extentB, extentC], 'GENE_C', ['GENE_A', 'GENE_B', 'GENE_C'],
      );
      expect(result.normData).toEqual([geneC]);
      expect(result.extents).toEqual([extentC]);
    });

    it('falls back to the first feature when the named feature is not selected', () => {
      const result = aggregateExpressionForScope(
        [rawA, rawB], [geneA, geneB], [extentA, extentB], 'GENE_C', ['GENE_A', 'GENE_B'],
      );
      expect(result.normData).toEqual([geneA]);
    });

    it('treats null as first and supports last', () => {
      expect(aggregateExpressionForScope(
        [rawA, rawB], [geneA, geneB], [extentA, extentB], null,
      ).normData)
        .toEqual([geneA]);
      expect(aggregateExpressionForScope(
        [rawA, rawB], [geneA, geneB], [extentA, extentB], 'last',
      ).normData)
        .toEqual([geneB]);
    });

    it('falls back to the first feature when the index is out of bounds', () => {
      const result = aggregateExpressionForScope(
        [rawA, rawB], [geneA, geneB], [extentA, extentB], 5,
      );
      expect(result.normData).toEqual([geneA]);
      expect(result.extents).toEqual([extentA]);
    });

    it('indexes relative to the featureSelection when earlier features are still loading', () => {
      const result = aggregateExpressionForScope(
        [null, rawB, rawC], [null, geneB, geneC], [null, extentB, extentC], 2,
      );
      expect(result.normData).toEqual([geneC]);
    });

    it('returns null when the selected feature is still loading', () => {
      expect(aggregateExpressionForScope(
        [rawA, null], [geneA, null], [extentA, null], 1,
      )).toBeNull();
    });

    it('combines the raw (not normalized) values for the sum and mean strategies', () => {
      // Features with extents [0, 5] and [0, 10], which both normalize to [0, 255].
      const raw1 = [0, 2.5, 5];
      const raw2 = [0, 10, 5];
      const norm1 = new Uint8Array([0, 127, 255]);
      const norm2 = new Uint8Array([0, 255, 127]);
      const sumResult = aggregateExpressionForScope(
        [raw1, raw2], [norm1, norm2], [[0, 5], [0, 10]], 'sum',
      );
      expect(sumResult.extents).toEqual([[0, 12.5]]);
      expect(sumResult.normData[0]).toHaveLength(3);
      const meanResult = aggregateExpressionForScope(
        [raw1, raw2], [norm1, norm2], [[0, 5], [0, 10]], 'mean',
      );
      expect(meanResult.extents).toEqual([[0, 6.25]]);
    });

    it('combines the raw values for the difference strategy', () => {
      const result = aggregateExpressionForScope(
        [rawA, rawC], [geneA, geneC], [extentA, extentC], 'difference',
      );
      expect(result.extents).toEqual([[-3, 7]]);
    });

    it('returns null for combining strategies until all features have loaded', () => {
      expect(aggregateExpressionForScope(
        [rawA, null, rawC], [geneA, null, geneC], [extentA, null, extentC], 'mean',
      )).toBeNull();
    });
  });

  describe('useAggregatedNormalizedExpressionDataForChannels', () => {
    it('retains data for channels that do not require aggregation', () => {
      const { result } = renderHook(() => useAggregatedNormalizedExpressionDataForChannels({
        multiExpressionData: {
          layerA: { chanMulti: [rawA, rawB], chanSingle: [rawC] },
          layerB: { chan: [rawA] },
        },
        multiExpressionNormData: {
          layerA: { chanMulti: [geneA, geneB], chanSingle: [geneC] },
          layerB: { chan: [geneA] },
        },
        multiExpressionExtents: {
          layerA: { chanMulti: [extentA, extentB], chanSingle: [extentC] },
          layerB: { chan: [extentA] },
        },
        layerScopes: ['layerA', 'layerB'],
        channelScopesByLayer: { layerA: ['chanMulti', 'chanSingle'], layerB: ['chan'] },
        channelCoordination: [{
          layerA: {
            chanMulti: { featureAggregationStrategy: 1 },
            chanSingle: { featureAggregationStrategy: null },
          },
          layerB: { chan: { featureAggregationStrategy: null } },
        }],
      }));
      const [normData, extents] = result.current;
      expect(normData.layerA.chanMulti).toEqual([geneB]);
      expect(normData.layerA.chanSingle).toEqual([geneC]);
      expect(normData.layerB.chan).toEqual([geneA]);
      expect(extents.layerA.chanMulti).toEqual([extentB]);
      expect(extents.layerA.chanSingle).toEqual([extentC]);
    });
  });
});
