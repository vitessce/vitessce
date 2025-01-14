import { describe, it, expect } from 'vitest';
import { LoaderResult } from '@vitessce/abstract';
import CellsJsonAsObsEmbeddingLoader from './CellsJsonAsObsEmbedding.js';
import CellsJsonAsObsLabelsLoader from './CellsJsonAsObsLabels.js';
import CellsJsonAsObsSegmentationsLoader, { square } from './CellsJsonAsObsSegmentations.js';
import JsonSource from '../JsonSource.js';

const createLoader = (ClassDef, config, url) => {
  const configWithUrl = {
    ...config,
    url,
  };
  const source = new JsonSource(configWithUrl);
  return new ClassDef(source, configWithUrl);
};


describe('square()', () => {
  it('gives the right coordinates', () => {
    expect(square(0, 0, 50)).toEqual([[0, 50], [50, 0], [0, -50], [-50, 0]]);
  });
});


describe('loaders/cells-json-loaders', () => {
  describe('CellsJsonAsObsEmbeddingLoader', () => {
    it('can load obsEmbedding', async () => {
      const loader = createLoader(CellsJsonAsObsEmbeddingLoader, {
        fileType: 'obsEmbedding.cells.json',
        coordinationValues: {
          embeddingType: 'PCA',
        },
      }, 'http://localhost:4204/@fixtures/json-legacy/cells.good.json');
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsEmbedding']);
      expect(payload.obsIndex).toEqual(['778']);
      expect(Array.from(payload.obsEmbedding.data[0])).toEqual([1]);
      expect(Array.from(payload.obsEmbedding.data[1])).toEqual([2]);
    });
  });
  describe('CellsJsonAsObsLabelsLoader', () => {
    it('can load obsLabels', async () => {
      const loader = createLoader(CellsJsonAsObsLabelsLoader, {
        fileType: 'obsLabels.cells.json',
        coordinationValues: {
          obsLabelsType: 'cluster',
        },
      }, 'http://localhost:4204/@fixtures/json-legacy/cells.good.json');
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsLabels']);
      expect(payload.obsIndex).toEqual(['778']);
      expect(payload.obsLabels).toEqual(['Inhibitory CP']);
    });
  });
  describe('CellsJsonAsObsSegmentationsLoader', () => {
    it('can load obsSegmentations', async () => {
      const loader = createLoader(CellsJsonAsObsSegmentationsLoader, {
        fileType: 'obsSegmentations.cells.json',
      }, 'http://localhost:4204/@fixtures/json-legacy/cells.good.json');
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsSegmentations', 'obsSegmentationsType']);
      expect(payload.obsIndex).toEqual(['778']);
      expect(payload.obsSegmentationsType).toEqual('polygon');
      expect(payload.obsSegmentations.data[0]).toEqual([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
    });
  });
});
