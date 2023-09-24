/* eslint-disable camelcase */
import { describe, it, expect } from 'vitest';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import AnnDataSource from './AnnDataSource.js';
import anndata_0_7_DenseFixture from './json-fixtures/anndata-0.7/anndata-dense.json';
import anndata_0_8_DenseFixture from './json-fixtures/anndata-0.8/anndata-dense.json';


describe('sources/AnnDataSource', () => {
  describe('AnnData v0.7', () => {
    it('getJson returns json', async () => {
      const dataSource = new AnnDataSource({
        url: '@fixtures/zarr/anndata-0.7/anndata-dense.zarr',
        store: createStoreFromMapContents(anndata_0_7_DenseFixture),
      });
      const zAttrs = await dataSource.getJson('obs/.zattrs');
      expect(Object.keys(zAttrs)).toEqual([
        '_index',
        'column-order',
        'encoding-type',
        'encoding-version',
      ]);
    });

    it('loadObsColumns returns ids for location in store', async () => {
      const dataSource = new AnnDataSource({
        url: '@fixtures/zarr/anndata-0.7/anndata-dense.zarr',
        store: createStoreFromMapContents(anndata_0_7_DenseFixture),
      });
      const ids = await dataSource.loadObsColumns(['obs/leiden']);
      expect(ids).toEqual([['1', '1', '2']]);
    });

    it('loadObsIndex returns names', async () => {
      const dataSource = new AnnDataSource({
        url: '@fixtures/zarr/anndata-0.7/anndata-dense.zarr',
        store: createStoreFromMapContents(anndata_0_7_DenseFixture),
      });
      const names = await dataSource.loadObsIndex();
      expect(names).toEqual(['CTG', 'GCA', 'CTG']);
    });
  });

  describe('AnnData v0.8', () => {
    it('getJson returns json', async () => {
      const dataSource = new AnnDataSource({
        url: '@fixtures/zarr/anndata-0.8/anndata-dense.zarr',
        store: createStoreFromMapContents(anndata_0_8_DenseFixture),
      });
      const zAttrs = await dataSource.getJson('obs/.zattrs');
      expect(Object.keys(zAttrs)).toEqual([
        '_index',
        'column-order',
        'encoding-type',
        'encoding-version',
      ]);
    });

    it('loadObsColumns returns ids for location in store', async () => {
      const dataSource = new AnnDataSource({
        url: '@fixtures/zarr/anndata-0.8/anndata-dense.zarr',
        store: createStoreFromMapContents(anndata_0_8_DenseFixture),
      });
      const ids = await dataSource.loadObsColumns(['obs/leiden']);
      expect(ids).toEqual([['1', '1', '2']]);
    });

    it('loadObsIndex returns names', async () => {
      const dataSource = new AnnDataSource({
        url: '@fixtures/zarr/anndata-0.8/anndata-dense.zarr',
        store: createStoreFromMapContents(anndata_0_8_DenseFixture),
      });
      const names = await dataSource.loadObsIndex();
      expect(names).toEqual(['CTG', 'GCA', 'CTG']);
    });
  });
});
