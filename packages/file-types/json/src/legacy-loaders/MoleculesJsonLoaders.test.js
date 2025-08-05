import { describe, it, expect } from 'vitest';
import { LoaderResult } from '@vitessce/abstract';
import MoleculesJsonAsObsLocationsLoader from './MoleculesJsonAsObsLocations.js';
import MoleculesJsonAsObsLabelsLoader from './MoleculesJsonAsObsLabels.js';
import JsonSource from '../JsonSource.js';

const createLoader = (ClassDef, config, url) => {
  const configWithUrl = {
    ...config,
    url,
  };
  const source = new JsonSource(configWithUrl);
  return new ClassDef(source, configWithUrl);
};

describe('loaders/molecules-json-loaders', () => {
  describe('MoleculesJsonAsObsLocationsLoader', () => {
    it('can load obsLocations', async () => {
      const loader = createLoader(MoleculesJsonAsObsLocationsLoader, {
        fileType: 'obsLocations.molecules.json',
      }, 'http://localhost:4204/@fixtures/json-legacy/molecules.good.json');
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsLocations']);
      expect(payload.obsIndex).toEqual(['0', '1', '2']);
      expect(Array.from(payload.obsLocations.data[0])).toEqual([27008.0, 8315.0, 18683.0]);
      expect(Array.from(payload.obsLocations.data[1])).toEqual([949.0, 22747.0, 19476.0]);
    });
  });
  describe('MoleculesJsonAsObsLabelsLoader', () => {
    it('can load obsLabels', async () => {
      const loader = createLoader(MoleculesJsonAsObsLabelsLoader, {
        fileType: 'obsLabels.molecules.json',
        coordinationValues: {
          obsLabelsType: 'gene',
        },
      }, 'http://localhost:4204/@fixtures/json-legacy/molecules.good.json');
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsLabels']);
      expect(payload.obsIndex).toEqual(['0', '1', '2']);
      expect(payload.obsLabels).toEqual(['Klk6_Hybridization5', 'Klk6_Hybridization5', 'Klk6_Hybridization5']);
    });
  });
});
