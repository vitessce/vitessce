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

  it('loadCellSetIds returns ids for location in store', async () => {
    const dataSource = new AnnDataSource({
      url: 'http://127.0.0.1:8080/anndata/anndata-dense.zarr',
    });
    const ids = await dataSource.loadCellSetIds(['obs/leiden']);
    expect(ids).toEqual([['1', '1', '2']]);
  });

  it('loadCellNames returns names', async () => {
    const dataSource = new AnnDataSource({
      url: 'http://127.0.0.1:8080/anndata/anndata-dense.zarr',
    });
    const names = await dataSource.loadCellNames();
    expect(names).toEqual(['CTG', 'GCA', 'CTG']);
  });
});
