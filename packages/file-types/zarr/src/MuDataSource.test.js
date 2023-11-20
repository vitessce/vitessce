/* eslint-disable camelcase */
import { describe, it, expect } from 'vitest';
import { range } from 'lodash-es';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import MuDataSource, { getObsPath, getVarPath } from './MuDataSource.js';
import mudata_0_2_DenseFixture from './json-fixtures/mudata-0.2/mudata-dense.json';


describe('sources/MuDataSource', () => {
  it('loadObsColumns returns ids for location in store, with joint-modality path', async () => {
    const dataSource = new MuDataSource({
      url: '@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
      store: createStoreFromMapContents(mudata_0_2_DenseFixture),
    });
    const ids = await dataSource.loadObsColumns(['obs/leiden']);
    expect(ids).toEqual([['3', '2', '3', '1', '1']]);
  });

  it('loadObsColumns returns ids for location in store, with modality-specific path', async () => {
    const dataSource = new MuDataSource({
      url: '@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
      store: createStoreFromMapContents(mudata_0_2_DenseFixture),
    });
    const ids = await dataSource.loadObsColumns(['mod/rna/obs/leiden']);
    expect(ids).toEqual([['1', '1', '2', '2']]);
  });

  it('loadVarIndex supports modality-specific paths', async () => {
    const dataSource = new MuDataSource({
      url: '@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
      store: createStoreFromMapContents(mudata_0_2_DenseFixture),
    });
    const names = await dataSource.loadVarIndex('mod/atac/X');
    expect(names).toEqual(range(15).map(i => `peak_${i}`));
  });

  it('loadObsIndex returns names', async () => {
    const dataSource = new MuDataSource({
      url: '@fixtures/zarr/mudata-0.2/mudata-dense.zarr',
      store: createStoreFromMapContents(mudata_0_2_DenseFixture),
    });
    const names = await dataSource.loadObsIndex('mod/atac/X');
    expect(names).toEqual(['CTG', 'GCA', 'CTT', 'GGG']);
  });

  it('getObsPath regex works', async () => {
    expect(getObsPath('mod/rna/obsm/X_umap')).toEqual('mod/rna/obs');
    expect(getObsPath('mod/rna/X')).toEqual('mod/rna/obs');
    expect(getObsPath('obsm/X_umap')).toEqual('obs');
  });

  it('getVarPath regex works', async () => {
    expect(getVarPath('mod/rna/obsm/X_umap')).toEqual('mod/rna/var');
    expect(getVarPath('mod/rna/X')).toEqual('mod/rna/var');
    expect(getVarPath('obsm/X_umap')).toEqual('var');
  });
});
