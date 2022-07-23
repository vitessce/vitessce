import expect from 'expect';
import ObsSetsJsonLoader from './ObsSetsJsonLoader';
import obsSetsGoodFixture from '../schemas/fixtures/obsSets.good.json';
import { JsonSource } from './data-sources';
import LoaderResult from './LoaderResult';

const createLoader = (ClassDef, config, data) => {
  const configWithUrl = {
    ...config,
    url: URL.createObjectURL(new Blob([JSON.stringify(data)])),
  };
  const source = new JsonSource(configWithUrl);
  return new ClassDef(source, configWithUrl);
};

describe('loaders/ObsSetsJsonLoader', () => {
  describe('ObsSetsJsonLoader', () => {
    it('can load obsSets', async () => {
      const loader = createLoader(ObsSetsJsonLoader, {
        fileType: 'obsSets.cells.json',
      }, obsSetsGoodFixture);
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsSets']);
      expect(payload.obsSets.datatype).toEqual('obs');
      expect(payload.obsSets.tree[0].name).toEqual('Clustering Algorithm');
    });
  });
});
