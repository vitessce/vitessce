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
        sampleEdges,
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
      // The per-group arrays are aligned with one another, in observation order.
      expect(result.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']).get('obsIndex')).toEqual(['cell1-1', 'cell1-3']);
      expect(Array.from(result.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']).get('obsEmbeddingX'))).toEqual([0, 2]);
      expect(result.get(['Cell type', 'B cell']).get(['Clinical groups', 'CKD']).get('obsIndex')).toEqual(['cell2-2', 'cell2-4']);
      expect(cellCount).toBe(8);
    });

    // Raw categorical codes describing the same sets as mergedCellSets.
    const obsSetsColumns = {
      obsIndex,
      columns: [{
        name: 'Cell type',
        path: ['Cell type'],
        codes: Int8Array.from([0, 1, 0, 1, 0, 1, 0, 1]),
        categories: ['T cell', 'B cell'],
      }],
    };
    const toPlain = stratified => Array.from(stratified.entries()).map(([cellKey, sampleMap]) => [
      cellKey,
      Array.from(sampleMap.entries()).map(([sampleKey, leafMap]) => [
        sampleKey,
        Array.from(leafMap.entries()).map(([leafKey, values]) => [leafKey, Array.from(values)]),
      ]),
    ]);

    it('stratifyExpressionData: the code-based strata match the tree-based strata', () => {
      const args = [
        sampleEdges, sampleSets, sampleSetSelection,
        expressionData, obsIndex, mergedCellSets,
        geneSelection, cellSetSelection, cellSetColor,
        featureValueTransform, featureValueTransformCoefficient,
      ];
      const [fromTree, maxFromTree] = stratifyExpressionData(...args);
      const [fromCodes, maxFromCodes] = stratifyExpressionData(...args, { obsSetsColumns });
      expect(toPlain(fromCodes)).toEqual(toPlain(fromTree));
      expect(maxFromCodes).toEqual(maxFromTree);
      // With a tree that lacks the selected sets, only the codes can place cells.
      const [fromCodesOnly] = stratifyExpressionData(
        sampleEdges, sampleSets, sampleSetSelection,
        expressionData, obsIndex, { tree: [] },
        geneSelection, cellSetSelection, cellSetColor,
        featureValueTransform, featureValueTransformCoefficient,
        { obsSetsColumns },
      );
      expect(toPlain(fromCodesOnly)).toEqual(toPlain(fromTree));
      // Codes for a different observation index are not used.
      const [fromOtherCodes] = stratifyExpressionData(
        sampleEdges, sampleSets, sampleSetSelection,
        expressionData, obsIndex, { tree: [] },
        geneSelection, cellSetSelection, cellSetColor,
        featureValueTransform, featureValueTransformCoefficient,
        { obsSetsColumns: { ...obsSetsColumns, obsIndex: [...obsIndex] } },
      );
      expect(fromOtherCodes.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']).get('Gene 1')).toEqual([]);
    });

    it('stratifyExpressionData: applies the value transform and excludes unselected samples', () => {
      const [result, exprMax] = stratifyExpressionData(
        sampleEdges, sampleSets, [['Clinical groups', 'AKI']],
        expressionData, obsIndex, mergedCellSets,
        geneSelection, cellSetSelection, cellSetColor,
        'log1p', 1,
      );
      expect(Array.from(result.get(['Cell type', 'T cell']).keys())).toEqual([['Clinical groups', 'AKI']]);
      expect(result.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']).get('Gene 1'))
        .toEqual([Math.log1p(10), Math.log1p(30)]);
      expect(result.get(['Cell type', 'B cell']).get(['Clinical groups', 'AKI']).get('Gene 1'))
        .toEqual([Math.log1p(20), Math.log1p(40)]);
      // The maximum is over the transformed values that were placed.
      expect(exprMax).toEqual(Math.log1p(40));
    });

    it('stratifyExpressionData: an empty cell set selection assigns nothing', () => {
      const [result, exprMax] = stratifyExpressionData(
        sampleEdges, sampleSets, sampleSetSelection,
        expressionData, obsIndex, mergedCellSets,
        geneSelection, [], cellSetColor,
        featureValueTransform, featureValueTransformCoefficient,
      );
      expect(Array.from(result.keys())).toEqual([null]);
      expect(result.get(null).get(['Clinical groups', 'AKI']).get('Gene 1')).toEqual([]);
      expect(exprMax).toEqual(-Infinity);
      expect(stratifyExpressionData(
        sampleEdges, sampleSets, sampleSetSelection,
        expressionData, obsIndex, mergedCellSets,
        geneSelection, null, cellSetColor,
        featureValueTransform, featureValueTransformCoefficient,
      )).toEqual([null, null]);
    });

    it('stratifyArrays: without selections every observation lands in one group', () => {
      const [result, cellCount] = stratifyArrays(
        null, null, null,
        obsIndex, mergedCellSets, null,
        { x: new Float32Array([0, 1, 2, 3, 4, 5, 6, 7]) },
        featureAggregationStrategy,
      );
      expect(Array.from(result.keys())).toEqual([null]);
      expect(Array.from(result.get(null).keys())).toEqual([null]);
      expect(Array.from(result.get(null).get(null).get('x'))).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
      expect(result.get(null).get(null).get('obsIndex')).toEqual(obsIndex);
      expect(cellCount).toBe(8);
    });

    it('stratifyArrays: aggregates several feature arrays per strategy and accepts codes', () => {
      const featureValue = [
        new Uint8Array([10, 20, 30, 40, 11, 21, 31, 41]),
        new Uint8Array([2, 4, 6, 8, 3, 5, 7, 9]),
      ];
      const stratify = strategy => stratifyArrays(
        null, null, null,
        obsIndex, { tree: [] }, cellSetSelection,
        { featureValue },
        strategy,
        { obsSetsColumns },
      )[0].get(['Cell type', 'T cell']).get(null).get('featureValue');
      expect(stratify('first')).toEqual([10, 30, 11, 31]);
      expect(stratify('last')).toEqual([2, 6, 3, 7]);
      expect(stratify(1)).toEqual([2, 6, 3, 7]);
      expect(stratify('sum')).toEqual([12, 36, 14, 38]);
      expect(stratify('mean')).toEqual([6, 18, 7, 19]);
    });
  });
});
