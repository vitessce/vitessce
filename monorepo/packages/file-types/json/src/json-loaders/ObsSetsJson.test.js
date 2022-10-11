import ObsSetsJsonLoader from './ObsSetsJson';
import obsSetsGoodFixture from '../legacy-loaders/schemas/fixtures/obsSets.good.json';
import JsonSource from '../JsonSource';
import LoaderResult from '@vitessce/vit-s';

const createLoader = (ClassDef, config, data) => {
  const configWithUrl = {
    ...config,
    url: URL.createObjectURL(new Blob([JSON.stringify(data)])),
  };
  const source = new JsonSource(configWithUrl);
  return new ClassDef(source, configWithUrl);
};

describe('loaders/json-loaders/ObsSetsJson', () => {
  describe('ObsSetsJsonLoader', () => {
    it('can load obsSets', async () => {
      const loader = createLoader(ObsSetsJsonLoader, {
        fileType: 'obsSets.cells.json',
      }, obsSetsGoodFixture);
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsSets', 'obsSetsMembership']);
      expect(payload.obsSets.datatype).toEqual('obs');
      expect(payload.obsSets.tree[0].name).toEqual('Clustering Algorithm');
    });
  });
});
