import expect from 'expect';
import ClustersJsonAsObsFeatureMatrixLoader from './ClustersJsonAsObsFeatureMatrix';
import clustersGoodFixture from '../../schemas/fixtures/clusters.good.json';
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

describe('loaders/clusters-json-loaders', () => {
  describe('ClustersJsonAsObsFeatureMatrixLoader', () => {
    it('can load obsFeatureMatrix', async () => {
      const loader = createLoader(ClustersJsonAsObsFeatureMatrixLoader, {
        fileType: 'obsFeatureMatrix.clusters.json',
      }, clustersGoodFixture);
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'featureIndex', 'obsFeatureMatrix']);
      expect(payload.obsIndex).toEqual(['3572', '1904', '1670']);
      expect(payload.featureIndex).toEqual(['Lamp5', 'Sox10', 'Crhbp']);
      expect(payload.obsFeatureMatrix).toEqual({
        data: Uint8Array.from([
          0, 0, 0,
          127, 127, 127,
          255, 255, 255,
        ]),
      });
    });
  });
});
