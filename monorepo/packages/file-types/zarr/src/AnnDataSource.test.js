import AnnDataSource from './AnnDataSource';

describe('sources/AnnDataSource', () => {
  describe('AnnData v0.7', () => {
    it('getJson returns json', async () => {
      const dataSource = new AnnDataSource({
        url: 'http://127.0.0.1:8080/anndata-0.7/anndata-dense.zarr',
      });
      const zGroup = await dataSource.getJson('.zgroup');
      expect(zGroup.zarr_format).toEqual(2);
    });

    it('loadObsColumns returns ids for location in store', async () => {
      const dataSource = new AnnDataSource({
        url: 'http://127.0.0.1:8080/anndata-0.7/anndata-dense.zarr',
      });
      const ids = await dataSource.loadObsColumns(['obs/leiden']);
      expect(ids).toEqual([['1', '1', '2']]);
    });

    it('loadObsIndex returns names', async () => {
      const dataSource = new AnnDataSource({
        url: 'http://127.0.0.1:8080/anndata-0.7/anndata-dense.zarr',
      });
      const names = await dataSource.loadObsIndex();
      expect(names).toEqual(['CTG', 'GCA', 'CTG']);
    });
  });

  describe('AnnData v0.8', () => {
    it('getJson returns json', async () => {
      const dataSource = new AnnDataSource({
        url: 'http://127.0.0.1:8080/anndata-0.8/anndata-dense.zarr',
      });
      const zGroup = await dataSource.getJson('.zgroup');
      expect(zGroup.zarr_format).toEqual(2);
    });

    it('loadObsColumns returns ids for location in store', async () => {
      const dataSource = new AnnDataSource({
        url: 'http://127.0.0.1:8080/anndata-0.8/anndata-dense.zarr',
      });
      const ids = await dataSource.loadObsColumns(['obs/leiden']);
      expect(ids).toEqual([['1', '1', '2']]);
    });

    it('loadObsIndex returns names', async () => {
      const dataSource = new AnnDataSource({
        url: 'http://127.0.0.1:8080/anndata-0.8/anndata-dense.zarr',
      });
      const names = await dataSource.loadObsIndex();
      expect(names).toEqual(['CTG', 'GCA', 'CTG']);
    });
  });
});
