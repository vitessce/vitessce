import { describe, it, expect } from 'vitest';
import { LoaderResult } from '@vitessce/abstract';
import GenesJsonAsObsFeatureMatrixLoader from './GenesJsonAsObsFeatureMatrix.js';
import JsonSource from '../JsonSource.js';

const createLoader = (ClassDef, config, url) => {
  const configWithUrl = {
    ...config,
    url,
  };
  const source = new JsonSource(configWithUrl);
  return new ClassDef(source, configWithUrl);
};

describe('loaders/genes-json-loaders', () => {
  describe('GenesJsonAsObsFeatureMatrixLoader', () => {
    it('can load obsFeatureMatrix', async () => {
      const loader = createLoader(GenesJsonAsObsFeatureMatrixLoader, {
        fileType: 'obsFeatureMatrix.genes.json',
      }, 'http://localhost:4204/@fixtures/json-legacy/genes.good.json');
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'featureIndex', 'obsFeatureMatrix']);
      expect(payload.obsIndex).toEqual(['778', '1409', '3642']);
      expect(payload.featureIndex).toEqual(['Gad2', 'Slc32a1']);
      expect(Array.from(payload.obsFeatureMatrix.data)).toEqual([
        93, 213,
        42, 135,
        255, 255,
      ]);
    });
  });
});
