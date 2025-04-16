import { describe, it, expect } from 'vitest';
import { LoaderResult } from '@vitessce/abstract';
import ClustersJsonAsObsFeatureMatrixLoader from './ClustersJsonAsObsFeatureMatrix.js';
import JsonSource from '../JsonSource.js';

const createLoader = (ClassDef, config, url) => {
  const configWithUrl = {
    ...config,
    url,
  };
  const source = new JsonSource(configWithUrl);
  return new ClassDef(source, configWithUrl);
};

describe('loaders/clusters-json-loaders', () => {
  describe('ClustersJsonAsObsFeatureMatrixLoader', () => {
    it('can load obsFeatureMatrix', async () => {
      const loader = createLoader(ClustersJsonAsObsFeatureMatrixLoader, {
        fileType: 'obsFeatureMatrix.clusters.json',
      }, 'http://localhost:4204/@fixtures/json-legacy/clusters.good.json');
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'featureIndex', 'obsFeatureMatrix']);
      expect(payload.obsIndex).toEqual(['3572', '1904', '1670']);
      expect(payload.featureIndex).toEqual(['Lamp5', 'Sox10', 'Crhbp']);
      expect(Array.from(payload.obsFeatureMatrix.data)).toEqual([
        0, 0, 0,
        127, 127, 127,
        255, 255, 255,
      ]);
    });
  });
});
