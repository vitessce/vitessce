import expect from 'expect';
import CellsJsonAsObsEmbeddingLoader from './CellsJsonAsObsEmbedding';
import CellsJsonAsObsLabelsLoader from './CellsJsonAsObsLabels';
import CellsJsonAsObsLocationsLoader from './CellsJsonAsObsLocations';
import CellsJsonAsObsSegmentationsLoader from './CellsJsonAsObsSegmentations';
import cellsGoodFixture from '../../schemas/fixtures/cells.good.json';
import { JsonSource } from '../data-sources';
import LoaderResult from '../LoaderResult';

const createLoader = (ClassDef, config, data) => {
  const configWithUrl = {
    ...config,
    url: URL.createObjectURL(new Blob([JSON.stringify(data)])),
  };
  const source = new JsonSource(configWithUrl);
  return new ClassDef(source, configWithUrl);
};

describe('loaders/cells-json-loaders', () => {
  describe('CellsJsonAsObsEmbeddingLoader', () => {
    it('can load obsEmbedding', async () => {
      const loader = createLoader(CellsJsonAsObsEmbeddingLoader, {
        fileType: 'obsEmbedding.cells.json',
        coordinationValues: {
          embeddingType: 'PCA',
        },
      }, cellsGoodFixture);
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsEmbedding']);
      expect(payload.obsIndex).toEqual(['778']);
      expect(payload.obsEmbedding[0]).toEqual([1]);
      expect(payload.obsEmbedding[1]).toEqual([2]);
    });
  });
  describe('CellsJsonAsObsLabelsLoader', () => {
    it('can load obsLabels', async () => {
      const loader = createLoader(CellsJsonAsObsLabelsLoader, {
        fileType: 'obsLabels.cells.json',
        coordinationValues: {
          obsLabelsType: 'cluster',
        },
      }, cellsGoodFixture);
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsLabels']);
      expect(payload.obsIndex).toEqual(['778']);
      expect(payload.obsLabels).toEqual(['Inhibitory CP']);
    });
  });
  describe('CellsJsonAsObsLocationsLoader', () => {
    it('can load obsLocations', async () => {
      const loader = createLoader(CellsJsonAsObsLocationsLoader, {
        fileType: 'obsLocations.cells.json',
      }, cellsGoodFixture);
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsLocations']);
      expect(payload.obsIndex).toEqual(['778']);
      expect(payload.obsLocations[0]).toEqual([18171.230942376023]);
      expect(payload.obsLocations[1]).toEqual([24590.795274569497]);
    });
  });
  describe('CellsJsonAsObsSegmentationsLoader', () => {
    it('can load obsSegmentations', async () => {
      const loader = createLoader(CellsJsonAsObsSegmentationsLoader, {
        fileType: 'obsSegmentations.cells.json',
      }, cellsGoodFixture);
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsSegmentationsType', 'obsSegmentations']);
      expect(payload.obsIndex).toEqual(['778']);
      expect(payload.obsSegmentationsType).toEqual('polygon');
      expect(payload.obsSegmentations[0]).toEqual([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
    });
  });
});
