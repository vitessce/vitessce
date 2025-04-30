import { describe, it, expect } from 'vitest';
import {
  stratifyExpressionData,
  aggregateStratifiedExpressionData,
} from '@vitessce/sets-utils';
import {
  summarizeStratifiedExpressionData,
  histogramStratifiedExpressionData,
} from './expr-hooks.js';

describe('Utility functions for processing expression data for statistical plots', () => {
  describe('summarizeStratifiedExpressionData function', () => {
    it('computes summarized information accurately', () => {
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

      const [result] = stratifyExpressionData(
        sampleEdges, sampleSets, sampleSetSelection,
        expressionData, obsIndex, mergedCellSets,
        geneSelection, cellSetSelection, cellSetColor,
        featureValueTransform, featureValueTransformCoefficient,
      );
      const aggregateData = aggregateStratifiedExpressionData(
        result, geneSelection, featureAggregationStrategy,
      );
      const summaryResult = summarizeStratifiedExpressionData(aggregateData, true);

      expect(Array.from(summaryResult.keys())).toEqual([['Cell type', 'T cell'], ['Cell type', 'B cell']]);
      expect(Array.from(summaryResult.get(['Cell type', 'T cell']).keys())).toEqual([['Clinical groups', 'AKI'], ['Clinical groups', 'CKD']]);
      expect(Object.keys(summaryResult.get(['Cell type', 'T cell']).get(['Clinical groups', 'AKI']))).toEqual([
        'quartiles',
        'range',
        'whiskers',
        'chauvenetRange',
        'nonOutliers',
      ]);

      const histogramResult = histogramStratifiedExpressionData(summaryResult, 16, null);

      expect(Object.keys(histogramResult)).toEqual([
        'groupSummaries',
        'groupData',
        'groupBins',
        'groupBinsMax',
        'y',
      ]);
      expect(histogramResult.groupSummaries.map(d => d.key)).toEqual([['Cell type', 'T cell'], ['Cell type', 'B cell']]);
      expect(histogramResult.groupBinsMax).toEqual(1);
    });
  });
});
