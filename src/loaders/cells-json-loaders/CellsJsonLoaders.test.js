import expect from 'expect';
import CellsJsonAsObsEmbeddingLoader from './CellsJsonAsObsEmbedding';
import CellsJsonAsObsLabelsLoader from './CellsJsonAsObsLabels';
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

describe.only('loaders/cells-json-loaders', () => {
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
});
