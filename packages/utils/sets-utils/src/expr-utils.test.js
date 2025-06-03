import { describe, it, expect } from 'vitest';
import {
  stratifyExpressionData,
  aggregateStratifiedExpressionData,
  stratifyArrays,
} from './expr-utils.js';

describe('Utility functions for processing expression data', () => {
  describe('stratifyExpressionData and stratifyArrays functions', () => {
    const sampleEdges = new Map([
      ['cell1-1', 'donor1'],
      ['cell1-2', 'donor1'],
      ['cell1-3', 'donor1'],
      ['cell1-4', 'donor1'],

      ['cell2-1', 'donor2'],
      ['cell2-2', 'donor2'],
      ['cell2-3', 'donor2'],
      ['cell2-4', 'donor2'],
    ]);
    const sampleSets = {
      tree: [
        {
          name: 'Clinical groups',
          children: [
            {
              name: 'AKI',
              set: [['donor1', null]],
            },
            {
              name: 'CKD',
              set: [['donor2', null]],
            },
          ],
        },
      ],
    };
    const sampleSetSelection = [
      ['Clinical groups', 'AKI'],
      ['Clinical groups', 'CKD'],
    ];
    const expressionData = [
      // Gene 1
      [10, 20, 30, 40, 11, 21, 31, 41],
    ];
    const obsIndex = ['cell1-1', 'cell1-2', 'cell1-3', 'cell1-4', 'cell2-1', 'cell2-2', 'cell2-3', 'cell2-4'];
    const mergedCellSets = {
      tree: [
        {
          name: 'Cell type',
          children: [
            {
              name: 'T cell',
              set: [['cell1-1', null], ['cell1-3', null], ['cell2-1', null], ['cell2-3', null]],
            },
            {
              name: 'B cell',
              set: [['cell1-2', null], ['cell1-4', null], ['cell2-2', null], ['cell2-4', null]],
            },
          ],
        },
      ],
    };
    const geneSelection = [
      'Gene 1',
    ];
    const cellSetSelection = [
      ['Cell type', 'T cell'],
      ['Cell type', 'B cell'],
    ];
    const cellSetColor = [
      { set: ['Cell type', 'T cell'], color: [255, 0, 0] },
      { set: ['Cell type', 'B cell'], color: [0, 255, 0] },
    ];
    const featureValueTransform = null;
    const featureValueTransformCoefficient = 1;
    const featureAggregationStrategy = 'first';


    it('stratifyExpressionData: stratify by cell set, then sample set', () => {
      const [result, exprMax] = stratifyExpressionData(
        sampleEdges, sampleSets, sampleSetSelection,
        expressionData, obsIndex, mergedCellSets,
        geneSelection, cellSetSelection, cellSetColor,
        featureValueTransform, featureValueTransformCoefficient,
      );

      expect(Array.from(result.keys())).toEqual([['Cell type', 'T cell'], ['Cell type', 'B cell']]);
      expect(Array.from(result.get(['Cell type', 'T cell']).keys())).toEqual([['Clinical groups', 'AKI'], ['Clinical groups', 'CKD']]);
      expect(result.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']).get('Gene 1').length).toBe(2);
      expect(result.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']).get('Gene 1')).toEqual([10, 30]);
      expect(exprMax).toEqual(41);

      const aggregateData = aggregateStratifiedExpressionData(
        result, geneSelection, featureAggregationStrategy,
      );

      expect(Array.from(aggregateData.keys())).toEqual([['Cell type', 'T cell'], ['Cell type', 'B cell']]);
      expect(Array.from(aggregateData.get(['Cell type', 'T cell']).keys())).toEqual([['Clinical groups', 'AKI'], ['Clinical groups', 'CKD']]);
      expect(aggregateData.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']).length).toBe(2);

      // TODO: add expect statements that check the aggregateData result, once it supports
      // aggregation of expression data from multiple genes into a single array.
    });

    it('stratifyArrays: stratifiy by cell set, then sample set', () => {
      const sampleIdToObsIdsMap = new Map([
        ['donor1', ['cell1-1', 'cell1-2', 'cell1-3', 'cell1-4']],
        ['donor2', ['cell2-1', 'cell2-2', 'cell2-3', 'cell2-4']],
      ]);
      const alignedEmbeddingIndex = ['cell1-1', 'cell1-2', 'cell1-3', 'cell1-4', 'cell2-1', 'cell2-2', 'cell2-3', 'cell2-4'];
      const alignedEmbeddingData = {
        data: [
          new Float32Array([0, 1, 2, 3, 4, 5, 6, 7]),
          new Float32Array([0, 1, 2, 3, 4, 5, 6, 7]),
        ],
      };
      const uint8ExpressionData = [
        new Uint8Array([10, 20, 30, 40, 11, 21, 31, 41]),
      ];

      const [result, cellCount] = stratifyArrays(
        sampleEdges, sampleIdToObsIdsMap,
        sampleSets, sampleSetSelection,
        alignedEmbeddingIndex, mergedCellSets, cellSetSelection, {
          obsEmbeddingX: alignedEmbeddingData.data[0],
          obsEmbeddingY: alignedEmbeddingData.data[1],
          ...(uint8ExpressionData?.[0] ? { featureValue: uint8ExpressionData } : {}),
        },
        featureAggregationStrategy,
      );

      expect(Array.from(result.keys())).toEqual([['Cell type', 'T cell'], ['Cell type', 'B cell']]);
      expect(Array.from(result.get(['Cell type', 'T cell']).keys())).toEqual([['Clinical groups', 'AKI'], ['Clinical groups', 'CKD']]);
      expect(Array.from(result.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']).keys())).toEqual(['obsEmbeddingX', 'obsEmbeddingY', 'featureValue', 'obsIndex']);
      expect(result.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']).get('featureValue').length).toBe(2);
      expect(result.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']).get('featureValue')).toEqual([10, 30]);
      expect(result.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']).get('obsEmbeddingX').length).toBe(2);
      expect(result.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']).get('obsEmbeddingY').length).toBe(2);
      expect(cellCount).toBe(8);
    });
  });
});
