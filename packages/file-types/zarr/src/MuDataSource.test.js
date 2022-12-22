import range from 'lodash/range';
import MuDataSource from './MuDataSource';

describe('sources/MuDataSource', () => {
  it('loadObsColumns returns ids for location in store, with joint-modality path', async () => {
    const dataSource = new MuDataSource({
      url: 'http://localhost:51204/@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
    });
    const ids = await dataSource.loadObsColumns(['obs/leiden']);
    expect(ids).toEqual([['3', '2', '3']]);
  });

  it('loadObsColumns returns ids for location in store, with modality-specific path', async () => {
    const dataSource = new MuDataSource({
      url: 'http://localhost:51204/@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
    });
    const ids = await dataSource.loadObsColumns(['mod/rna/obs/leiden']);
    expect(ids).toEqual([['1', '1', '2']]);
  });

  it('loadVarIndex supports modality-specific paths', async () => {
    const dataSource = new MuDataSource({
      url: 'http://localhost:51204/@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
    });
    const names = await dataSource.loadVarIndex('mod/atac/X');
    expect(names).toEqual(range(15).map(i => `peak_${i}`));
  });

  it('loadObsIndex returns names', async () => {
    const dataSource = new MuDataSource({
      url: 'http://localhost:51204/@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
    });
    const names = await dataSource.loadObsIndex('mod/atac/X');
    expect(names).toEqual(['CTG', 'GCA', 'CTT']);
  });
});
