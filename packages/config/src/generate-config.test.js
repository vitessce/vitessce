import { describe, it, expect } from 'vitest';
import { createStoreFromMapContents } from '@vitessce/zarr-utils';
import { withConsolidated } from 'zarrita';
import { parseUrls, parsedUrlToZmetadata, generateConfig } from './generate-config.js';
import spatialdataMouseLiverFixture from './json-fixtures/mouse_liver.spatialdata.json';
import anndataMouseLiverFixture from './json-fixtures/mouse_liver.anndata.json';
import imageOmeZarrMouseLiverFixture from './json-fixtures/mouse_liver.ome.json';

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
      store: createStoreFromMapContents(anndataMouseLiverFixture),
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
      store: createStoreFromMapContents(spatialdataMouseLiverFixture),
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
      '/tables/table/varp',
    ]);
    expect(zmetadata.every(d => Boolean(d.attrs))).toBeTruthy();
  });

  it('parsed url to zmetadata for an OME-NGFF image', async () => {
    const parsedUrl = {
      url: './mouse_liver.ome.json',
      fileType: 'image.ome-zarr',
      store: createStoreFromMapContents(imageOmeZarrMouseLiverFixture),
    };
    const zmetadata = await parsedUrlToZmetadata(parsedUrl);

    expect(zmetadata.length).toEqual(1);
    expect(zmetadata.map(d => d.path)).toEqual(['/']);
    expect(zmetadata.every(d => Boolean(d.attrs))).toBeTruthy();
  });

  it('generateConfig for AnnData object fills in datasets part of config', async () => {
    const parsedUrls = [
      {
        url: './mouse_liver.anndata.json',
        fileType: 'anndata.zarr',
        store: createStoreFromMapContents(anndataMouseLiverFixture),
      },
    ];
    const { config, stores } = await generateConfig(parsedUrls);
    expect(config.toJSON().datasets[0].files).toEqual([
      {
        url: './mouse_liver.anndata.json',
        fileType: 'anndata.zarr',
        options: {
          obsEmbedding: [],
          obsSets: [],
          obsFeatureMatrix: {
            path: 'X',
          },
          obsLocations: {
            path: 'obsm/spatial',
          },
        },
      },
    ]);
    expect(Object.keys(stores)).toEqual(['./mouse_liver.anndata.json']);
  });

  it('generateConfig for SpatialData object fills in datasets part of config', async () => {
    const parsedUrls = [
      {
        url: './mouse_liver.spatialdata.json',
        fileType: 'spatialdata.zarr',
        store: createStoreFromMapContents(spatialdataMouseLiverFixture),
      },
    ];
    const { config, stores } = await generateConfig(parsedUrls);
    expect(config.toJSON().datasets[0].files).toEqual([
      {
        url: './mouse_liver.spatialdata.json',
        fileType: 'spatialdata.zarr',
        options: {
          image: {
            path: 'images/raw_image',
            coordinateSystem: 'global',
          },
          labels: {
            path: 'labels/segmentation_mask',
            coordinateSystem: 'global',
          },
          obsSpots: {
            // TODO: the test should be updated once fixed in the implementaiton,
            // since these are not circle shapes.
            path: 'shapes/nucleus_boundaries',
          },
          obsFeatureMatrix: {
            path: 'tables/table/X',
          },
          obsSets: {
            tablePath: 'tables/table',
            obsSets: [
              {
                path: 'tables/table/obs/cell_ID',
                name: 'cell_ID',
              },
              {
                path: 'tables/table/obs/fov_labels',
                name: 'fov_labels',
              },
              {
                path: 'tables/table/obs/annotation',
                name: 'annotation',
              },
            ],
          },
        },
      },
    ]);
    expect(Object.keys(stores)).toEqual(['./mouse_liver.spatialdata.json']);
  });

  it('generateConfig for OME-Zarr image fills in datasets part of config', async () => {
    const parsedUrls = [
      {
        url: './mouse_liver.ome.json',
        fileType: 'image.ome-zarr',
        store: createStoreFromMapContents(imageOmeZarrMouseLiverFixture),
      },
    ];
    const { config, stores } = await generateConfig(parsedUrls);
    expect(config.toJSON().datasets[0].files).toEqual([
      {
        url: './mouse_liver.ome.json',
        fileType: 'image.ome-zarr',
      },
    ]);
    expect(Object.keys(stores)).toEqual(['./mouse_liver.ome.json']);
  });

  it('generateConfig for OME-TIFF image fills in datasets part of config, without a store present', async () => {
    const parsedUrls = [
      {
        url: 'https://example.com/mouse_liver.ome.tif',
        fileType: 'image.ome-tiff',
      },
    ];
    const { config, stores } = await generateConfig(parsedUrls);
    expect(config.toJSON().datasets[0].files).toEqual([
      {
        url: 'https://example.com/mouse_liver.ome.tif',
        fileType: 'image.ome-tiff',
      },
    ]);
    expect(Object.keys(stores)).toEqual([]);
  });
});
