import expect from 'expect';
import BaseAnnDataLoader from './BaseAnnDataLoader';


describe('loaders/BaseAnnDataLoader', () => {
  it('getJson reutrns json', async () => {
    const loader = new BaseAnnDataLoader({
      url: 'http://127.0.0.1:8080/anndata-dense.zarr',
    });
    const zGroup = await loader.getJson('.zgroup');
    expect(zGroup.zarr_format).toEqual(2);
  });

  it('loadCellSetIds returns ids for location in store', async () => {
    const loader = new BaseAnnDataLoader({
      url: 'http://127.0.0.1:8080/anndata-dense.zarr',
    });
    const ids = await loader.loadCellSetIds(['obs/leiden']);
    expect(ids).toEqual([['1', '1', '2']]);
  });

  it('loadCellNames returns names', async () => {
    const loader = new BaseAnnDataLoader({
      url: 'http://127.0.0.1:8080/anndata-dense.zarr',
    });
    const names = await loader.loadCellNames();
    expect(names).toEqual(['CTG', 'GCA', 'CTG']);
  });
});
