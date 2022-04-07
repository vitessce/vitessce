import expect from 'expect';
import AnnDataSource from './AnnDataSource';

describe('sources/AnnDataSource', () => {
  it('getJson reutrns json', async () => {
    const dataSource = new AnnDataSource({
      url: 'http://127.0.0.1:8080/anndata/anndata-dense.zarr',
    });
    const zGroup = await dataSource.getJson('.zgroup');
    expect(zGroup.zarr_format).toEqual(2);
  });

  it('loadVariables returns ids for location in store', async () => {
    const dataSource = new AnnDataSource({
      url: 'http://127.0.0.1:8080/anndata/anndata-dense.zarr',
    });
    const ids = await dataSource.loadObsVariables(['obs/leiden']);
    expect(ids).toEqual([['1', '1', '2']]);
  });

  it('loadObsIndex returns names', async () => {
    const dataSource = new AnnDataSource({
      url: 'http://127.0.0.1:8080/anndata/anndata-dense.zarr',
    });
    const names = await dataSource.loadObsIndex();
    expect(names).toEqual(['CTG', 'GCA', 'CTG']);
  });
});
