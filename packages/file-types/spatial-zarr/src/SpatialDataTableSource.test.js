/* eslint-disable camelcase */
import { describe, it, expect, vi } from 'vitest';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';

vi.mock('./parquet-query-utils.js', () => ({
  getParquetModule: vi.fn().mockResolvedValue({}),
  _loadParquetMetadataByPart: vi.fn(),
  _loadParquetRowGroupByGroupIndex: vi.fn(),
  _rectToRowGroupIndices: vi.fn(),
}));

import SpatialDataTableSource from './SpatialDataTableSource.js';
import spatialdata_0_3_Fixture from './json-fixtures/spatialdata-0.3/blobs.sdata.json';
import spatialdata_0_7_Fixture from './json-fixtures/spatialdata-0.7/blobs.sdata.json';

describe('sources/SpatialDataTableSource', () => {
  describe('SpatialData v0.3', () => {
    it('getJson returns json for table .zattrs', async () => {
      const dataSource = new SpatialDataTableSource({
        url: '@fixtures/zarr/spatialdata-0.3/blobs.sdata.zarr',
        store: createStoreFromMapContents(spatialdata_0_3_Fixture),
        queryClient: null,
      });
      const zAttrs = await dataSource.getJson('tables/table/.zattrs');
      expect(Object.keys(zAttrs).sort()).toEqual([
        'encoding-type',
        'encoding-version',
        'instance_key',
        'region',
        'region_key',
        'spatialdata-encoding-type',
        'version',
      ]);
    });

    it('loadSpatialDataObjectAttrs returns version info', async () => {
      const dataSource = new SpatialDataTableSource({
        url: '@fixtures/zarr/spatialdata-0.3/blobs.sdata.zarr',
        store: createStoreFromMapContents(spatialdata_0_3_Fixture),
        queryClient: null,
      });
      const attrs = await dataSource.loadSpatialDataObjectAttrs();
      expect(attrs).toEqual({ softwareVersion: '0.3.0', formatVersion: '0.1' });
    });

    it('loadObsIndex returns obs index for table', async () => {
      const dataSource = new SpatialDataTableSource({
        url: '@fixtures/zarr/spatialdata-0.3/blobs.sdata.zarr',
        store: createStoreFromMapContents(spatialdata_0_3_Fixture),
        queryClient: null,
      });
      const index = await dataSource.loadObsIndex('tables/table/obs/_index');
      expect(index).toEqual(['1', '2', '3', '4', '5', '6', '8', '9', '10', '11', '12', '13', '15', '16', '17', '18', '19', '20', '22', '23', '24', '25', '26', '27', '29', '30']);
    });

    it('loadVarIndex returns var index for table', async () => {
      const dataSource = new SpatialDataTableSource({
        url: '@fixtures/zarr/spatialdata-0.3/blobs.sdata.zarr',
        store: createStoreFromMapContents(spatialdata_0_3_Fixture),
        queryClient: null,
      });
      const index = await dataSource.loadVarIndex('tables/table/var/_index');
      expect(index).toEqual(['channel_0_sum', 'channel_1_sum', 'channel_2_sum']);
    });

    it('loadObsIndex returns obs index for table_points', async () => {
      const dataSource = new SpatialDataTableSource({
        url: '@fixtures/zarr/spatialdata-0.3/blobs.sdata.zarr',
        store: createStoreFromMapContents(spatialdata_0_3_Fixture),
        queryClient: null,
      });
      const index = await dataSource.loadObsIndex('tables/table_points/obs/_index');
      expect(index).toEqual([]);
    });

    it('loadVarIndex returns var index for table_points', async () => {
      const dataSource = new SpatialDataTableSource({
        url: '@fixtures/zarr/spatialdata-0.3/blobs.sdata.zarr',
        store: createStoreFromMapContents(spatialdata_0_3_Fixture),
        queryClient: null,
      });
      const index = await dataSource.loadVarIndex('tables/table_points/var/_index');
      expect(index).toEqual(['gene_b', 'gene_a']);
    });
  });

  describe('SpatialData v0.7', () => {
    it('getJson returns json for table .zattrs', async () => {
      const dataSource = new SpatialDataTableSource({
        url: '@fixtures/zarr/spatialdata-0.7/blobs.sdata.zarr',
        store: createStoreFromMapContents(spatialdata_0_7_Fixture),
        queryClient: null,
      });
      const zAttrs = await dataSource.getJson('tables/table/.zattrs');
      expect(Object.keys(zAttrs).sort()).toEqual([
        'encoding-type',
        'encoding-version',
        'instance_key',
        'region',
        'region_key',
        'spatialdata-encoding-type',
        'version',
      ]);
    });

    it('loadSpatialDataObjectAttrs returns version info', async () => {
      const dataSource = new SpatialDataTableSource({
        url: '@fixtures/zarr/spatialdata-0.7/blobs.sdata.zarr',
        store: createStoreFromMapContents(spatialdata_0_7_Fixture),
        queryClient: null,
      });
      const attrs = await dataSource.loadSpatialDataObjectAttrs();
      expect(attrs).toEqual({ softwareVersion: '0.7.3', formatVersion: '0.2' });
    });

    it('loadObsIndex returns obs index for table', async () => {
      const dataSource = new SpatialDataTableSource({
        url: '@fixtures/zarr/spatialdata-0.7/blobs.sdata.zarr',
        store: createStoreFromMapContents(spatialdata_0_7_Fixture),
        queryClient: null,
      });
      const index = await dataSource.loadObsIndex('tables/table/obs/_index');
      expect(index).toEqual(['1', '2', '3', '4', '5', '6', '8', '9', '10', '11', '12', '13', '15', '16', '17', '18', '19', '20', '22', '23', '24', '25', '26', '27', '29', '30']);
    });

    it('loadVarIndex returns var index for table', async () => {
      const dataSource = new SpatialDataTableSource({
        url: '@fixtures/zarr/spatialdata-0.7/blobs.sdata.zarr',
        store: createStoreFromMapContents(spatialdata_0_7_Fixture),
        queryClient: null,
      });
      const index = await dataSource.loadVarIndex('tables/table/var/_index');
      expect(index).toEqual(['channel_0_sum', 'channel_1_sum', 'channel_2_sum']);
    });

    it('loadObsIndex returns obs index for table_points', async () => {
      const dataSource = new SpatialDataTableSource({
        url: '@fixtures/zarr/spatialdata-0.7/blobs.sdata.zarr',
        store: createStoreFromMapContents(spatialdata_0_7_Fixture),
        queryClient: null,
      });
      const index = await dataSource.loadObsIndex('tables/table_points/obs/_index');
      expect(index).toEqual([]);
    });

    it('loadVarIndex returns var index for table_points', async () => {
      const dataSource = new SpatialDataTableSource({
        url: '@fixtures/zarr/spatialdata-0.7/blobs.sdata.zarr',
        store: createStoreFromMapContents(spatialdata_0_7_Fixture),
        queryClient: null,
      });
      const index = await dataSource.loadVarIndex('tables/table_points/var/_index');
      expect(index).toEqual(['gene_b', 'gene_a']);
    });
  });
});
