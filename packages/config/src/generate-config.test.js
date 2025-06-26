import { describe, it, expect } from 'vitest';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import { parseUrls, parsedUrlToZmetadata } from './generate-config.js';
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
    expect(zmetadata.map(d => d.path)).toEqual(['', 'X', 'layers', 'obs', 'var', 'obsm', 'obsm/spatial']);
  });

  it('store for SpatialData object supports withConsolidated', async () => {
    const initialStore = createStoreFromMapContents(spatialdataMouseLiverFixture);
    const store = await withConsolidated(initialStore);

    expect(store.contents()).toEqual([]);
  });

  it('parsed url to zmetadata for a SpatialData object', async () => {
    const parsedUrl = {
        url: './mouse_liver.spatialdata.json',
        fileType: 'spatialdata.zarr',
        store: createStoreFromMapContents(spatialdataMouseLiverFixture)
    };
    const zmetadata = await parsedUrlToZmetadata(parsedUrl);
    
    expect(zmetadata.length).toEqual(6);
    expect(zmetadata.map(d => d.path)).toEqual(['', 'images', 'labels', 'points', 'shapes', 'tables']);
  });

  it('parsed url to zmetadata for an OME-NGFF image', async () => {
    const parsedUrl = {
        url: './mouse_liver.ome.json',
        fileType: 'image.ome-zarr',
        store: createStoreFromMapContents(imageOmeZarrMouseLiverFixture)
    };
    const zmetadata = await parsedUrlToZmetadata(parsedUrl);
    
    expect(zmetadata.length).toEqual(1);
    expect(zmetadata.map(d => d.path)).toEqual(['']);
  });
});
