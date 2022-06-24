import expect from 'expect';
import GenesJsonAsObsFeatureMatrixLoader from './GenesJsonAsObsFeatureMatrix';
import genesGoodFixture from '../../schemas/fixtures/genes.good.json';
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

describe('loaders/genes-json-loaders', () => {
  describe('GenesJsonAsObsFeatureMatrixLoader', () => {
    it('can load obsFeatureMatrix', async () => {
      const loader = createLoader(GenesJsonAsObsFeatureMatrixLoader, {
        fileType: 'obsFeatureMatrix.genes.json',
      }, genesGoodFixture);
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'featureIndex', 'obsFeatureMatrix']);
      expect(payload.obsIndex).toEqual(['778', '1409', '3642']);
      expect(payload.featureIndex).toEqual(['Gad2', 'Slc32a1']);
      expect(payload.obsFeatureMatrix).toEqual({
        data: Uint8Array.from([
          93, 213,
          42, 135,
          255, 255,
        ]),
      });
    });
  });
});
