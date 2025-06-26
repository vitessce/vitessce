import { describe, it, expect } from 'vitest';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import { parseUrls, parsedUrlToZmetadata, generateConfig } from './generate-config.js';
import spatialdataBlobsFixture from './json-fixtures/blobs.spatialdata.json';
import spatialdataMouseLiverFixture from './json-fixtures/mouse_liver.spatialdata.json';
import anndataMouseLiverFixture from './json-fixtures/mouse_liver.anndata.json';
import imageOmeZarrMouseLiverFixture from './json-fixtures/mouse_liver.ome.json';
import obsSegmentationsOmeZarrMouseLiverFixture from './json-fixtures/mouse_liver.labels.ome.json';
import { withConsolidated } from 'zarrita';


describe('generateConfig', () => {
  it('parses URLs', () => {
    const s1 = 'https://example.com/my_image.ome.tif';
    expect(parseUrls(s1)).toEqual([
      {
        url: 'https://example.com/my_image.ome.tif',
        fileType: 'image.ome-tiff',
      },
    ]);

    const s2 = 'https://example.com/my_image.ome.tif#obsSegmentations.ome-tiff';
    expect(parseUrls(s2)).toEqual([
      {
        url: 'https://example.com/my_image.ome.tif',
        fileType: 'obsSegmentations.ome-tiff',
      },
    ]);

    const s3 = 'https://example.com/my_image.ome.tif#obsSegmentations.ome-tiff;http://another.com/obj.zarr#anndata.zarr';
    expect(parseUrls(s3)).toEqual([
      {
        url: 'https://example.com/my_image.ome.tif',
        fileType: 'obsSegmentations.ome-tiff',
      },
      {
        url: 'http://another.com/obj.zarr',
        fileType: 'anndata.zarr',
      },
    ]);
  });

  it('parsed url to zmetadata for an AnnData object', async () => {
    const parsedUrl = {
        url: './mouse_liver.anndata.json',
        fileType: 'anndata.zarr',
        store: createStoreFromMapContents(anndataMouseLiverFixture)
    };
    const zmetadata = await parsedUrlToZmetadata(parsedUrl);
    
    expect(zmetadata.length).toEqual(7);
    expect(zmetadata.map(d => d.path)).toEqual(['/', '/X', '/layers', '/obs', '/var', '/obsm', '/obsm/spatial']);
    expect(zmetadata.every(d => Boolean(d.attrs))).toBeTruthy();
  });

  it('store for SpatialData object supports withConsolidated', async () => {
    const initialStore = createStoreFromMapContents(spatialdataMouseLiverFixture);
    const store = await withConsolidated(initialStore, { metadataKey: 'zmetadata' });

    expect(store.contents().length).toEqual(41);
  });

  it('parsed url to zmetadata for a SpatialData object', async () => {
    const parsedUrl = {
        url: './mouse_liver.spatialdata.json',
        fileType: 'spatialdata.zarr',
        store: createStoreFromMapContents(spatialdataMouseLiverFixture)
    };
    const zmetadata = await parsedUrlToZmetadata(parsedUrl);
    
    expect(zmetadata.length).toEqual(41);
    expect(zmetadata.map(d => d.path)).toEqual([
        '/',
        '/images',
        '/images/raw_image',
        '/images/raw_image/0',
        '/images/raw_image/1',
        '/labels',
        '/labels/segmentation_mask',
        '/labels/segmentation_mask/0',
        '/points',
        '/points/transcripts',
        '/shapes',
        '/shapes/nucleus_boundaries',
        '/tables',
        '/tables/table',
        '/tables/table/X',
        '/tables/table/X/data',
        '/tables/table/X/indices',
        '/tables/table/X/indptr',
        '/tables/table/layers',
        '/tables/table/obs',
        '/tables/table/obs/_index',
        '/tables/table/obs/annotation',
        '/tables/table/obs/annotation/categories',
        '/tables/table/obs/annotation/codes',
        '/tables/table/obs/cell_ID',
        '/tables/table/obs/fov_labels',
        '/tables/table/obs/fov_labels/categories',
        '/tables/table/obs/fov_labels/codes',
        '/tables/table/obsm',
        '/tables/table/obsm/spatial',
        '/tables/table/obsp',
        '/tables/table/uns',
        '/tables/table/uns/annotation_colors',
        '/tables/table/uns/spatialdata_attrs',
        '/tables/table/uns/spatialdata_attrs/instance_key',
        '/tables/table/uns/spatialdata_attrs/region',
        '/tables/table/uns/spatialdata_attrs/region_key',
        '/tables/table/var',
        '/tables/table/var/_index',
        '/tables/table/varm',
        '/tables/table/varp'
    ]);
    expect(zmetadata.every(d => Boolean(d.attrs))).toBeTruthy();
  });

  it('parsed url to zmetadata for an OME-NGFF image', async () => {
    const parsedUrl = {
        url: './mouse_liver.ome.json',
        fileType: 'image.ome-zarr',
        store: createStoreFromMapContents(imageOmeZarrMouseLiverFixture)
    };
    const zmetadata = await parsedUrlToZmetadata(parsedUrl);
    
    expect(zmetadata.length).toEqual(1);
    expect(zmetadata.map(d => d.path)).toEqual(['/']);
    expect(zmetadata.every(d => Boolean(d.attrs))).toBeTruthy();
  });

  it('generateConfig', async () => {
    const parsedUrls = [
        {
            url: './mouse_liver.ome.json',
            fileType: 'image.ome-zarr',
            store: createStoreFromMapContents(imageOmeZarrMouseLiverFixture)
        }
    ];
    const config = await generateConfig(parsedUrls);

    // TODO: update test
    expect(config).toEqual({});
  });
});
