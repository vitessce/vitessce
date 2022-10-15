import { LoaderResult } from '@vitessce/vit-s';
import ObsSetsJsonLoader from './ObsSetsJson';
import JsonSource from '../JsonSource';
// TODO(monorepo)
/*
const createLoader = (ClassDef, config, url) => {
  const configWithUrl = {
    ...config,
    url,
  };
  const source = new JsonSource(configWithUrl);
  return new ClassDef(source, configWithUrl);
};

describe('loaders/json-loaders/ObsSetsJson', () => {
  describe('ObsSetsJsonLoader', () => {
    it('can load obsSets', async () => {
      const loader = createLoader(ObsSetsJsonLoader, {
        fileType: 'obsSets.cells.json',
      }, 'http://localhost:51204/@fixtures/vit-s/obsSets.good.json');
      const result = await loader.load();
      expect(result).toBeInstanceOf(LoaderResult);
      const payload = result.data;
      expect(Object.keys(payload)).toEqual(['obsIndex', 'obsSets', 'obsSetsMembership']);
      expect(payload.obsSets.datatype).toEqual('obs');
      expect(payload.obsSets.tree[0].name).toEqual('Clustering Algorithm');
    });
  });
});
*/
