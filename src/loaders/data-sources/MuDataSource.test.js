import expect from 'expect';
import range from 'lodash/range';
import MuDataSource from './MuDataSource';

describe('sources/MuDataSource', () => {
  it('loadObsVariables returns ids for location in store, with joint-modality path', async () => {
    const dataSource = new MuDataSource({
      url: 'http://127.0.0.1:8080/mudata/mudata-dense.zarr',
    });
    const ids = await dataSource.loadObsVariables(['obs/leiden']);
    expect(ids).toEqual([['3', '2', '3']]);
  });

  it('loadObsVariables returns ids for location in store, with modality-specific path', async () => {
    const dataSource = new MuDataSource({
      url: 'http://127.0.0.1:8080/mudata/mudata-dense.zarr',
    });
    const ids = await dataSource.loadObsVariables(['mod/rna/obs/leiden']);
    expect(ids).toEqual([['1', '1', '2']]);
  });

  it('loadVarIndex supports modality-specific paths', async () => {
    const dataSource = new MuDataSource({
      url: 'http://127.0.0.1:8080/mudata/mudata-dense.zarr',
    });
    const names = await dataSource.loadVarIndex('mod/atac/X');
    expect(names).toEqual(range(15).map(i => `peak_${i}`));
  });
});
