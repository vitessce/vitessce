import expect from 'expect';
import MoleculesJsonAsObsLocationsLoader from './MoleculesJsonAsObsLocations';
import MoleculesJsonAsObsLabelsLoader from './MoleculesJsonAsObsLabels';
import moleculesGoodFixture from '../../schemas/fixtures/molecules.good.json';
import { JsonSource } from '../../data-sources';
import LoaderResult from '../LoaderResult';

const createLoader = (ClassDef, config, data) => {
  const configWithUrl = {
    ...config,
    url: URL.createObjectURL(new Blob([JSON.stringify(data)])),
  };
  const source = new JsonSource(configWithUrl);
  return new ClassDef(source, configWithUrl);
};

describe('loaders/molecules-json-loaders', () => {
  describe('MoleculesJsonAsObsLocationsLoader', () => {
    it('can load obsLocations', async () => {
      const loader = createLoader(MoleculesJsonAsObsLocationsLoader, {
        fileType: 'obsLocations.molecules.json',
      }, moleculesGoodFixture);
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
      }, moleculesGoodFixture);
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsLabels']);
      expect(payload.obsIndex).toEqual(['0', '1', '2']);
      expect(payload.obsLabels).toEqual(['Klk6_Hybridization5', 'Klk6_Hybridization5', 'Klk6_Hybridization5']);
    });
  });
});
