/* eslint-disable camelcase */
import { describe, it, expect } from 'vitest';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import AnnDataSource from './AnnDataSource.js';
import anndata_0_7_DenseFixture from './json-fixtures/anndata-0.7/anndata-dense.json';
import anndata_0_8_DenseFixture from './json-fixtures/anndata-0.8/anndata-dense.json';
import anndata_0_9_DenseFixture from './json-fixtures/anndata-0.9/anndata-dense.json';
import anndata_0_10_DenseFixture from './json-fixtures/anndata-0.10/anndata-dense.json';


describe('sources/AnnDataSource', () => {
  Object.entries({ 0.7: anndata_0_7_DenseFixture, 0.8: anndata_0_8_DenseFixture, 0.9: anndata_0_9_DenseFixture, '0.10': anndata_0_10_DenseFixture }).forEach(([version, fixture]) => {
    describe(`AnnData v${version}`, () => {
      it('getJson returns json', async () => {
        const dataSource = new AnnDataSource({
          url: `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
          store: createStoreFromMapContents(fixture),
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
          url: `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
          store: createStoreFromMapContents(fixture),
        });
        const ids = await dataSource.loadObsColumns(['obs/leiden']);
        expect(ids).toEqual([['1', '1', '2']]);
      });

      it('loadObsIndex returns names', async () => {
        const dataSource = new AnnDataSource({
          url: `@fixtures/zarr/anndata-${version}/anndata-dense.zarr`,
          store: createStoreFromMapContents(fixture),
        });
        const names = await dataSource.loadObsIndex();
        expect(names).toEqual(['CTG', 'GCA', 'ACG']);
      });
    });
  });
});
